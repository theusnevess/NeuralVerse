"""Deterministic durable authoring state machine.

The class is intentionally a pure model. A Temporal workflow can replay the
same transitions, while activities perform ACP, PostgreSQL and publication
side effects outside this module.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, replace
from typing import Any

from neuralverse_backend.bip_m4.domain import (
    ActivityContract,
    ActivityFailure,
    AuditEvent,
    FailureClass,
    GenerationJobIdentity,
    WorkflowCommand,
    WorkflowIdentity,
    WorkflowStatus,
)


@dataclass(frozen=True, slots=True)
class WorkflowSnapshot:
    identity: WorkflowIdentity
    command: WorkflowCommand
    generation_job: GenerationJobIdentity
    status: WorkflowStatus
    current_revision: int
    pending_review_id: str | None
    pending_publication_id: str | None
    cancelled: bool
    audit: tuple[AuditEvent, ...]
    progress: Mapping[str, Any]


class DurableAuthoringWorkflow:
    """Replay-safe command/signal/query model for the BIP-M4 workflow."""

    def __init__(
        self,
        command: WorkflowCommand,
        *,
        namespace: str = "default",
        task_queue: str = "neuralverse-authoring",
    ) -> None:
        identity = WorkflowIdentity.create(command, namespace=namespace, task_queue=task_queue)
        job = GenerationJobIdentity(
            generation_job_id=identity.generation_job_id,
            package_id=command.package_id,
            workflow_execution_id=identity.workflow_execution_id,
            command_id=command.command_id,
            requested_by=command.requested_by,
            max_revisions=command.max_revisions,
        )
        initial_event = AuditEvent(
            sequence=1,
            event_type="WORKFLOW_ACCEPTED",
            workflow_execution_id=identity.workflow_execution_id,
            generation_job_id=job.generation_job_id,
            command_id=command.command_id,
            occurred_at=command.requested_at or "UNSET",
            details={"stage": "ACCEPTED"},
        )
        self._snapshot = WorkflowSnapshot(
            identity=identity,
            command=command,
            generation_job=job,
            status=WorkflowStatus.ACCEPTED,
            current_revision=0,
            pending_review_id=None,
            pending_publication_id=None,
            cancelled=False,
            audit=(initial_event,),
            progress={"stage": "ACCEPTED", "revision": 0},
        )

    @property
    def snapshot(self) -> WorkflowSnapshot:
        return self._snapshot

    @classmethod
    def resume(cls, snapshot: WorkflowSnapshot) -> DurableAuthoringWorkflow:
        """Rehydrate the deterministic model from a persisted projection."""
        workflow = cls.__new__(cls)
        workflow._snapshot = snapshot
        return workflow

    def start(self) -> WorkflowSnapshot:
        self._transition(WorkflowStatus.RUNNING, "WORKFLOW_STARTED", stage="ACP_EXECUTION")
        return self._snapshot

    def wait_for_review(self, review_id: str) -> WorkflowSnapshot:
        if not review_id.strip():
            raise ValueError("review_id must be non-empty")
        if self._snapshot.status not in (WorkflowStatus.RUNNING, WorkflowStatus.REVISION_REQUIRED):
            raise ValueError("workflow cannot enter review from its current state")
        self._snapshot = replace(self._snapshot, pending_review_id=review_id)
        return self._transition(
            WorkflowStatus.WAITING_FOR_REVIEW,
            "HUMAN_REVIEW_WAIT",
            review_id=review_id,
            stage="HUMAN_REVIEW",
        )

    def resolve_review(self, review_id: str, *, approved: bool, actor_id: str) -> WorkflowSnapshot:
        if self._snapshot.status is not WorkflowStatus.WAITING_FOR_REVIEW:
            raise ValueError("workflow is not waiting for review")
        if review_id != self._snapshot.pending_review_id or not actor_id.strip():
            raise ValueError("review identity is invalid")
        if not approved:
            return self._transition(
                WorkflowStatus.FAILED, "HUMAN_REVIEW_REJECTED", actor_id=actor_id, stage="FAILED"
            )
        self._snapshot = replace(self._snapshot, pending_review_id=None)
        return self._transition(
            WorkflowStatus.RUNNING, "HUMAN_REVIEW_APPROVED", actor_id=actor_id, stage="RESUME"
        )

    def request_revision(self, directive_id: str, *, reason: str) -> WorkflowSnapshot:
        if not directive_id.strip() or not reason.strip():
            raise ValueError("revision directive requires identity and reason")
        if self._snapshot.current_revision >= self._snapshot.command.max_revisions:
            return self._transition(
                WorkflowStatus.WAITING_FOR_REVIEW,
                "REVISION_LIMIT_REACHED",
                stage="MANUAL_REVIEW",
                directive_id=directive_id,
            )
        revision = self._snapshot.current_revision + 1
        self._snapshot = replace(self._snapshot, current_revision=revision, pending_review_id=None)
        return self._transition(
            WorkflowStatus.REVISION_REQUIRED,
            "REVISION_REQUESTED",
            stage="REVISION",
            revision=revision,
            directive_id=directive_id,
            reason=reason,
        )

    def wait_for_publication(self, wait_id: str) -> WorkflowSnapshot:
        if not wait_id.strip():
            raise ValueError("publication wait identity is required")
        self._snapshot = replace(self._snapshot, pending_publication_id=wait_id)
        return self._transition(
            WorkflowStatus.WAITING_FOR_PUBLICATION,
            "PUBLICATION_WAIT",
            wait_id=wait_id,
            stage="PUBLICATION",
        )

    def complete(self, *, result_reference: str) -> WorkflowSnapshot:
        if not result_reference.strip():
            raise ValueError("result reference is required")
        self._snapshot = replace(self._snapshot, pending_publication_id=None)
        return self._transition(
            WorkflowStatus.COMPLETED,
            "WORKFLOW_COMPLETED",
            stage="COMPLETED",
            result_reference=result_reference,
        )

    def fail(self, failure: ActivityFailure) -> WorkflowSnapshot:
        if failure.classification is FailureClass.RETRYABLE:
            return self._transition(
                WorkflowStatus.RUNNING, "RETRY_SCHEDULED", stage="RETRY", code=failure.code
            )
        return self._transition(
            WorkflowStatus.FAILED,
            "WORKFLOW_FAILED",
            stage="FAILED",
            code=failure.code,
            classification=failure.classification.value,
        )

    def cancel(self, *, actor_id: str) -> WorkflowSnapshot:
        if not actor_id.strip():
            raise ValueError("cancellation actor is required")
        if self._snapshot.status in (
            WorkflowStatus.COMPLETED,
            WorkflowStatus.FAILED,
            WorkflowStatus.CANCELLED,
        ):
            return self._snapshot
        self._snapshot = replace(self._snapshot, cancelled=True)
        return self._transition(
            WorkflowStatus.CANCELLED, "WORKFLOW_CANCELLED", stage="CANCELLED", actor_id=actor_id
        )

    def query(self) -> Mapping[str, Any]:
        return {
            "workflow_execution_id": self._snapshot.identity.workflow_execution_id,
            "temporal_workflow_id": self._snapshot.identity.temporal_workflow_id,
            "generation_job_id": self._snapshot.generation_job.generation_job_id,
            "status": self._snapshot.status.value,
            "revision": self._snapshot.current_revision,
            "stage": self._snapshot.progress["stage"],
            "pending_review_id": self._snapshot.pending_review_id,
            "pending_publication_id": self._snapshot.pending_publication_id,
        }

    def activity_contract(
        self, activity_id: str, *, logical_target: str, timeout_seconds: int = 60
    ) -> ActivityContract:
        key = ":".join(
            (
                self._snapshot.identity.workflow_execution_id,
                activity_id,
                str(self._snapshot.current_revision),
                logical_target,
                "1.0.0",
            )
        )
        from neuralverse_backend.bip_m4.domain import RetryPolicy

        return ActivityContract(
            activity_id=activity_id,
            activity_version="1.0.0",
            idempotency_key=key,
            retry_policy=RetryPolicy(),
            start_to_close_seconds=timeout_seconds,
        )

    def _transition(
        self, status: WorkflowStatus, event_type: str, **details: Any
    ) -> WorkflowSnapshot:
        event = AuditEvent(
            sequence=len(self._snapshot.audit) + 1,
            event_type=event_type,
            workflow_execution_id=self._snapshot.identity.workflow_execution_id,
            generation_job_id=self._snapshot.generation_job.generation_job_id,
            command_id=self._snapshot.command.command_id,
            occurred_at=self._snapshot.command.requested_at or "UNSET",
            details=details,
        )
        self._snapshot = replace(
            self._snapshot,
            status=status,
            audit=(*self._snapshot.audit, event),
            progress={
                "stage": details.get("stage", status.value),
                "revision": self._snapshot.current_revision,
            },
        )
        self._snapshot = replace(
            self._snapshot,
            generation_job=replace(
                self._snapshot.generation_job,
                status=status.value,
                revision=self._snapshot.current_revision,
            ),
        )
        return self._snapshot
