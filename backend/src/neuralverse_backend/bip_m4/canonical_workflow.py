"""Canonical Temporal authoring workflow and its bounded activity contracts."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import timedelta
from typing import Any, cast

from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from neuralverse_backend.bip_m4.acp_input_assembly import operation_spec
    from neuralverse_backend.bip_m4.agent_worker import AGENT_TASK_QUEUE
    from neuralverse_backend.bip_m4.workflow_artifact_references import (
        WorkflowArtifactReference,
        WorkflowArtifactReferenceMap,
    )

WORKFLOW_TYPE = "GenerateLessonLearningPackageWorkflow"
WORKFLOW_TASK_QUEUE = "neuralverse.workflow.generate-learning-package.v1"
SYSTEM_TASK_QUEUE = "neuralverse.activity.system.v1"
WORKFLOW_VERSION = "bip-m4-generate-lesson:1.0.0"


@dataclass(frozen=True, slots=True)
class WorkflowInput:
    workflow_input_version: str
    generation_job_id: str
    content_package_id: str
    curriculum_node_id: str
    request_correlation_id: str
    request_fingerprint: str
    requested_package_type: str
    required_contract_versions: dict[str, str]
    workflow_policy_version: str
    activity_policy_version: str
    generation_request_reference: dict[str, Any]
    maximum_revision_cycles: int
    overall_deadline_seconds: int
    publication_wait_timeout_seconds: int
    activity_payloads: dict[str, dict[str, Any]] = field(default_factory=dict)
    extensions: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class ActivitySummary:
    activity_name: str
    status: str
    artifact_id: str | None = None
    contract_name: str | None = None
    contract_version: str | None = None
    artifact_fingerprint: str | None = None
    failure_code: str | None = None


@dataclass(frozen=True, slots=True)
class HumanReviewDecision:
    command_id: str
    generation_job_id: str
    governance_review_id: str
    decision: str
    reviewer_identity_reference: str
    rationale: str
    expected_workflow_revision: int
    received_at: str


@dataclass(frozen=True, slots=True)
class RevisionDirective:
    revision_directive_id: str
    target: str
    required_changes: tuple[str, ...]
    reason: str
    revision_cycle: int


@dataclass(frozen=True, slots=True)
class PublicationCommand:
    command_id: str
    idempotency_key: str
    generation_job_id: str
    workflow_id: str
    expected_workflow_revision: int
    target_content_package_id: str
    learning_package_draft_reference: str
    readiness_recommendation_reference: str
    actor_identity: str
    issued_at: str
    correlation_id: str


@dataclass(frozen=True, slots=True)
class WorkflowProgress:
    state: str
    stage: str
    revision_cycle: int
    completed_stages: tuple[str, ...]
    active_stages: tuple[str, ...]
    pending_action: str | None
    progress_sequence: int
    artifacts: tuple[ActivitySummary, ...]
    failure_code: str | None = None


def _retry_policy() -> RetryPolicy:
    return RetryPolicy(
        initial_interval=timedelta(seconds=1),
        backoff_coefficient=2,
        maximum_interval=timedelta(seconds=30),
        maximum_attempts=3,
        non_retryable_error_types=[
            "ACP_CONTRACT_INVALID",
            "ACP_PROTOCOL_INVALID",
            "ACP_OPERATION_NOT_SUPPORTED",
            "ACTIVITY_IDEMPOTENCY_CONFLICT",
        ],
    )


@workflow.defn(name=WORKFLOW_TYPE)
class GenerateLessonLearningPackageWorkflow:
    def __init__(self) -> None:
        self._state = "RECEIVED"
        self._stage = "RECEIVED"
        self._revision = 0
        # Sequence one is the durable workflow.started event written with the start command.
        self._sequence = 1
        self._completed: list[str] = []
        self._active: list[str] = []
        self._artifacts: list[ActivitySummary] = []
        self._artifact_map = WorkflowArtifactReferenceMap.empty()
        self._review: HumanReviewDecision | None = None
        self._revision_directive: RevisionDirective | None = None
        self._publication: PublicationCommand | None = None
        self._cancelled = False
        self._failure_code: str | None = None
        self._generation_job_id = ""

    @workflow.run
    async def run(self, input: WorkflowInput) -> WorkflowProgress:
        self._generation_job_id = input.generation_job_id
        await self._stage_activity(
            "QUALIFYING_REQUEST", "qualify_generation_request", input, SYSTEM_TASK_QUEUE
        )
        await self._stage_activity(
            "OBTAINING_CURRICULUM", "produce_curriculum_contract", input, AGENT_TASK_QUEUE
        )
        await self._stage_activity(
            "OBTAINING_EVIDENCE", "produce_evidence_contribution", input, AGENT_TASK_QUEUE
        )
        await self._stage_activity(
            "OBTAINING_KNOWLEDGE", "produce_knowledge_contribution", input, AGENT_TASK_QUEUE
        )
        await self._parallel_enrichment(input)
        await self._stage_activity(
            "OBTAINING_DIDACTIC_PLAN", "produce_didactic_assembly_plan", input, AGENT_TASK_QUEUE
        )
        await self._stage_activity(
            "RUNNING_CROSS_AGENT_VALIDATION",
            "validate_cross_agent_contributions",
            input,
            AGENT_TASK_QUEUE,
        )
        await self._stage_activity(
            "OBTAINING_GOVERNANCE_REVIEW", "produce_governance_review", input, AGENT_TASK_QUEUE
        )
        review_result = await self._review_gate(input)
        if review_result is not None:
            return review_result
        await self._stage_activity(
            "COMPILING_LEARNING_PACKAGE", "compile_learning_package_draft", input, AGENT_TASK_QUEUE
        )
        await self._stage_activity(
            "OBTAINING_PUBLICATION_READINESS",
            "produce_publication_readiness_recommendation",
            input,
            AGENT_TASK_QUEUE,
        )
        self._state = "AWAITING_PUBLICATION_COMMAND"
        self._stage = "AWAITING_PUBLICATION_COMMAND"
        self._pending_action("PUBLICATION_COMMAND")
        await self._emit_progress(input, "publication.waiting")
        await workflow.wait_condition(lambda: self._publication is not None or self._cancelled)
        if self._cancelled:
            return await self._terminal(input, "CANCELLED")
        if self._publication is None:
            return await self._terminal(input, "FAILED", "PUBLICATION_COMMAND_INVALID")
        # Stage 9 ends at the publication boundary. The publication command is
        # accepted here; release creation belongs to the later publication stage.
        self._state = "READY_FOR_PUBLICATION"
        self._stage = "READY_FOR_PUBLICATION"
        self._pending_action(None)
        await self._emit_progress(input, "publication.accepted")
        return self._progress()

    async def _review_gate(self, input: WorkflowInput) -> WorkflowProgress | None:
        while True:
            self._state = "AWAITING_HUMAN_REVIEW"
            self._stage = "AWAITING_HUMAN_REVIEW"
            self._active = []
            self._pending_action("HUMAN_REVIEW")
            await self._emit_progress(input, "review.required")
            await workflow.wait_condition(
                lambda: (
                    self._review is not None
                    or self._failure_code is not None
                    or self._cancelled
                )
            )
            if self._cancelled:
                return await self._terminal(input, "CANCELLED")
            if self._failure_code is not None:
                return await self._terminal(input, "FAILED", self._failure_code)
            if self._review is None:
                return await self._terminal(input, "FAILED", "HUMAN_REVIEW_REJECTED")
            self._sequence += 1
            await self._emit_progress(input, "review.received")
            if self._review.decision == "APPROVED":
                return None
            if self._review.decision != "REVISION_REQUIRED":
                return await self._terminal(input, "FAILED", "HUMAN_REVIEW_REJECTED")
            if self._revision >= input.maximum_revision_cycles:
                return await self._terminal(input, "FAILED", "REVISION_LIMIT_EXCEEDED")
            self._state = "AWAITING_REVISION_DIRECTIVE"
            self._stage = "AWAITING_REVISION_DIRECTIVE"
            self._pending_action("REVISION_DIRECTIVE")
            await self._emit_progress(input, "revision.required")
            await workflow.wait_condition(
                lambda: self._revision_directive is not None or self._cancelled
            )
            if self._cancelled:
                return await self._terminal(input, "CANCELLED")
            if self._revision_directive is None:
                return await self._terminal(input, "FAILED", "REVISION_DIRECTIVE_INVALID")
            await self._emit_progress(input, "revision.started")
            self._review = None
            self._revision_directive = None
            self._artifact_map = self._artifact_map.invalidate(
                {
                    "knowledge_contribution",
                    "application_contribution",
                    "code_laboratory_contribution",
                    "assessment_contribution",
                    "narrative_contribution",
                    "curiosity_contribution",
                    "didactic_assembly_plan",
                    "cross_agent_validation_results",
                    "governance_review",
                    "learning_package_draft",
                    "publication_readiness_recommendation",
                }
            )
            await self._stage_activity(
                "OBTAINING_DIDACTIC_PLAN", "produce_didactic_assembly_plan", input, AGENT_TASK_QUEUE
            )
            await self._stage_activity(
                "RUNNING_CROSS_AGENT_VALIDATION",
                "validate_cross_agent_contributions",
                input,
                AGENT_TASK_QUEUE,
            )
            await self._stage_activity(
                "OBTAINING_GOVERNANCE_REVIEW", "produce_governance_review", input, AGENT_TASK_QUEUE
            )

    async def _parallel_enrichment(self, input: WorkflowInput) -> None:
        stages = (
            ("RUNNING_APPLICATION_ENRICHMENT", "produce_application_contribution"),
            ("RUNNING_CODE_LABORATORY_ENRICHMENT", "produce_code_laboratory_contribution"),
            ("RUNNING_ASSESSMENT_ENRICHMENT", "produce_assessment_contribution"),
            ("RUNNING_NARRATIVE_ENRICHMENT", "produce_narrative_contribution"),
            ("RUNNING_CURIOSITY_ENRICHMENT", "produce_curiosity_contribution"),
        )
        self._state = "RUNNING_ENRICHMENT"
        self._active = [name for name, _ in stages]
        self._pending_action(None)
        await self._emit_progress(input, "stage.entered")
        handles = [
            workflow.start_activity(
                "ProduceACPArtifactActivity",
                self._activity_request(input, operation),
                task_queue=AGENT_TASK_QUEUE,
                start_to_close_timeout=timedelta(seconds=300),
                schedule_to_close_timeout=timedelta(seconds=600),
                retry_policy=_retry_policy(),
                activity_id=f"{input.generation_job_id}:{operation}:{self._revision}",
            )
            for _, operation in stages
        ]
        results = await asyncio.gather(*(handle for handle in handles), return_exceptions=True)
        self._active = []
        for (stage, operation), result in zip(stages, results, strict=True):
            if isinstance(result, BaseException):
                self._failure_code = "ACP_RUNTIME_RETRYABLE_FAILURE"
                raise result
            self._record(stage, operation, dict(result))
            await self._emit_progress(input, "activity.completed", activity_name=operation)

    async def _stage_activity(
        self, stage: str, operation: str, input: WorkflowInput, queue: str
    ) -> None:
        self._state = stage
        self._stage = stage
        self._active = [operation]
        self._pending_action(None)
        await self._emit_progress(input, "stage.entered", activity_name=operation)
        result = await workflow.execute_activity(
            "ProduceACPArtifactActivity"
            if queue == AGENT_TASK_QUEUE
            else "QualifyGenerationRequestActivity",
            self._activity_request(input, operation)
            if queue == AGENT_TASK_QUEUE
            else {
                "generation_job_id": input.generation_job_id,
                "request_correlation_id": input.request_correlation_id,
                "request_fingerprint": input.request_fingerprint,
                "generation_request_reference": input.generation_request_reference,
            },
            task_queue=queue,
            start_to_close_timeout=timedelta(seconds=300),
            schedule_to_close_timeout=timedelta(seconds=600),
            retry_policy=_retry_policy(),
            activity_id=f"{input.generation_job_id}:{operation}:{self._revision}",
        )
        self._record(stage, operation, result)
        self._active = []
        await self._emit_progress(input, "activity.completed", activity_name=operation)

    def _activity_request(self, input: WorkflowInput, operation: str) -> dict[str, Any]:
        spec = operation_spec(operation)
        references = self._artifact_map.for_activity(operation)
        return {
            "request_id": f"{input.generation_job_id}:{operation}:{self._revision}",
            "generation_job_id": input.generation_job_id,
            "workflow_id": workflow.info().workflow_id,
            "workflow_run_id": workflow.info().run_id,
            "curriculum_node_id": input.curriculum_node_id,
            "content_package_id": input.content_package_id,
            "requested_package_type": input.requested_package_type,
            "required_contract_versions": input.required_contract_versions,
            "revision_cycle": self._revision,
            "operation": operation,
            "agent_identity": spec.canonical_agent_identity,
            "operation_version": spec.operation_version.value,
            "idempotency_key": f"{input.generation_job_id}:{operation}:{self._revision}",
            "correlation_id": input.request_correlation_id,
            "input_contract": {
                "name": spec.input_contract_name,
                "version": spec.input_contract_version.value,
            },
            "artifact_references": references,
            "payload": input.activity_payloads.get(operation, {}),
            "generation_request_reference": input.generation_request_reference,
        }

    def _record(self, stage: str, operation: str, result: dict[str, Any]) -> None:
        if operation == "qualify_generation_request":
            self._completed.append(stage)
            self._artifacts.append(ActivitySummary(operation, "COMPLETED"))
            self._sequence += 1
            return
        slot = {
            "produce_curriculum_contract": "curriculum_contract",
            "produce_evidence_contribution": "evidence_contribution",
            "produce_knowledge_contribution": "knowledge_contribution",
            "produce_application_contribution": "application_contribution",
            "produce_code_laboratory_contribution": "code_laboratory_contribution",
            "produce_assessment_contribution": "assessment_contribution",
            "produce_narrative_contribution": "narrative_contribution",
            "produce_curiosity_contribution": "curiosity_contribution",
            "produce_didactic_assembly_plan": "didactic_assembly_plan",
            "validate_cross_agent_contributions": "cross_agent_validation_results",
            "produce_governance_review": "governance_review",
            "compile_learning_package_draft": "learning_package_draft",
            "produce_publication_readiness_recommendation": "publication_readiness_recommendation",
        }[operation]
        reference = WorkflowArtifactReference.from_result(
            result,
            generation_job_id=self._workflow_input_generation_job_id,
            workflow_id=workflow.info().workflow_id,
            revision_cycle=self._revision,
        )
        self._artifact_map = self._artifact_map.put(slot, reference)
        self._completed.append(stage)
        self._artifacts.append(
            ActivitySummary(
                operation,
                "COMPLETED",
                result.get("artifact_id"),
                result.get("contract_name"),
                result.get("contract_version"),
                result.get("artifact_fingerprint"),
            )
        )
        self._sequence += 1

    def _pending_action(self, action: str | None) -> None:
        self._sequence += 1

    @property
    def _workflow_input_generation_job_id(self) -> str:
        return self._generation_job_id

    def _progress(self) -> WorkflowProgress:
        return WorkflowProgress(
            self._state,
            self._stage,
            self._revision,
            tuple(self._completed),
            tuple(self._active),
            None,
            self._sequence,
            tuple(self._artifacts),
            self._failure_code,
        )

    async def _terminal(
        self, input: WorkflowInput, state: str, failure_code: str | None = None
    ) -> WorkflowProgress:
        self._state = state
        self._stage = state
        self._failure_code = failure_code
        self._active = []
        self._pending_action(None)
        await self._emit_progress(input, f"workflow.{state.lower()}")
        return self._progress()

    async def _emit_progress(
        self,
        input: WorkflowInput,
        event_type: str,
        *,
        activity_name: str | None = None,
    ) -> None:
        await workflow.execute_activity(
            "PersistWorkflowProgressActivity",
            {
                "generation_job_id": input.generation_job_id,
                "workflow_id": workflow.info().workflow_id,
                "workflow_run_id": workflow.info().run_id,
                "progress_sequence": self._sequence,
                "state": self._state,
                "stage": self._stage,
                "event_type": event_type,
                "activity_name": activity_name,
                "revision_cycle": self._revision,
                "completed_stages": self._completed[-128:],
                "active_stages": self._active[:32],
                "pending_human_action": self._pending_action_name(),
                "artifact_references": [
                    {
                        "activity_name": item.activity_name,
                        "artifact_id": item.artifact_id,
                        "artifact_fingerprint": item.artifact_fingerprint,
                        "contract_name": item.contract_name,
                        "contract_version": item.contract_version,
                    }
                    for item in self._artifacts[-128:]
                ],
                "artifact_reference_map": self._artifact_map.bounded(),
                "correlation_id": input.request_correlation_id,
            },
            task_queue=SYSTEM_TASK_QUEUE,
            start_to_close_timeout=timedelta(seconds=30),
            retry_policy=_retry_policy(),
            activity_id=f"{input.generation_job_id}:progress:{self._sequence}",
        )

    def _pending_action_name(self) -> str | None:
        if self._state == "AWAITING_HUMAN_REVIEW":
            return "HUMAN_REVIEW"
        if self._state == "AWAITING_PUBLICATION_COMMAND":
            return "PUBLICATION_COMMAND"
        return None

    @workflow.signal
    async def submit_human_review_decision(self, decision: HumanReviewDecision) -> None:
        if self._state != "AWAITING_HUMAN_REVIEW":
            return
        if self._review is not None:
            if self._review.command_id == decision.command_id and self._review == decision:
                return
            self._failure_code = "HUMAN_REVIEW_COMMAND_CONFLICT"
            return
        if (
            decision.generation_job_id != self._generation_job_id
            or not decision.command_id
            or not decision.governance_review_id
            or decision.decision not in {"APPROVED", "REVISION_REQUIRED"}
            or decision.expected_workflow_revision != self._revision
        ):
            self._failure_code = "HUMAN_REVIEW_COMMAND_INVALID"
            return
        self._review = decision

    @workflow.signal
    async def apply_revision_directive(self, directive: RevisionDirective) -> None:
        if self._state not in {"AWAITING_HUMAN_REVIEW", "AWAITING_REVISION_DIRECTIVE"}:
            return
        if self._revision >= 3 or directive.revision_cycle != self._revision + 1:
            return
        self._revision_directive = directive
        self._revision = directive.revision_cycle

    @workflow.signal
    async def submit_publication_command(self, command: PublicationCommand) -> None:
        if self._state != "AWAITING_PUBLICATION_COMMAND" or self._publication is not None:
            return
        if command.generation_job_id != workflow.info().workflow_id.removeprefix(
            "nv:generation-job:"
        ):
            return
        self._publication = command

    @workflow.signal
    async def cancel(self) -> None:
        self._cancelled = True

    @workflow.query
    def progress(self) -> WorkflowProgress:
        return self._progress()


@workflow.defn(name="ACPActivityProbeWorkflow")
class ACPActivityProbeWorkflow:
    """Small operational probe used to certify the isolated agent task queue."""

    @workflow.run
    async def run(self, request: dict[str, Any]) -> dict[str, Any]:
        result = await workflow.execute_activity(
            "ProduceACPArtifactActivity",
            request,
            task_queue=AGENT_TASK_QUEUE,
            start_to_close_timeout=timedelta(seconds=300),
            retry_policy=_retry_policy(),
        )
        return cast(dict[str, Any], result)
