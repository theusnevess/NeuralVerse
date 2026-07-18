from __future__ import annotations

import pytest

from neuralverse_backend.bip_m4 import (
    ACPExecutionAdapter,
    ACPExecutionRequest,
    ActivityFailure,
    BIPM4Activities,
    DurableAuthoringWorkflow,
    FailureClass,
    FakeACPExecutor,
    PublicationActivityAdapter,
    TemporalHost,
    TemporalHostConfig,
    WorkflowCommand,
)
from neuralverse_backend.bip_m4.domain import (
    ActivityIdempotencyLedger,
    CommandIdempotencyRegistry,
    IdempotencyConflict,
    RetryPolicy,
)


def command(**overrides: object) -> WorkflowCommand:
    values: dict[str, object] = {
        "command_id": "command:1",
        "idempotency_key": "idempotency:1",
        "package_id": "package:1",
        "target_content_identity": "content:1",
        "requested_by": "owner:1",
        "request_id": "request:1",
    }
    values.update(overrides)
    return WorkflowCommand(**values)  # type: ignore[arg-type]


def test_workflow_identity_is_stable_and_does_not_use_mutable_title() -> None:
    first = DurableAuthoringWorkflow(command(target_content_identity="title:old"))
    second = DurableAuthoringWorkflow(command(target_content_identity="title:new"))
    assert (
        first.snapshot.identity.temporal_workflow_id
        == second.snapshot.identity.temporal_workflow_id
    )
    assert first.snapshot.identity.generation_job_id == second.snapshot.identity.generation_job_id


def test_workflow_review_revision_publication_and_completion_are_bounded() -> None:
    workflow = DurableAuthoringWorkflow(command(max_revisions=1))
    assert workflow.start().status.value == "RUNNING"
    assert workflow.wait_for_review("review:1").status.value == "WAITING_FOR_REVIEW"
    assert (
        workflow.resolve_review("review:1", approved=True, actor_id="human:1").status.value
        == "RUNNING"
    )
    assert workflow.request_revision("directive:1", reason="missing evidence").current_revision == 1
    assert (
        workflow.request_revision("directive:2", reason="another issue").status.value
        == "WAITING_FOR_REVIEW"
    )
    assert workflow.wait_for_publication("publication:1").status.value == "WAITING_FOR_PUBLICATION"
    assert workflow.complete(result_reference="release:1").status.value == "COMPLETED"


def test_cancel_is_idempotent_and_terminal_state_cannot_change() -> None:
    workflow = DurableAuthoringWorkflow(command())
    workflow.start()
    assert workflow.cancel(actor_id="owner:1").status.value == "CANCELLED"
    assert workflow.cancel(actor_id="owner:1").status.value == "CANCELLED"
    assert workflow.snapshot.status.value == "CANCELLED"


def test_restart_resume_preserves_state_and_audit_lineage() -> None:
    workflow = DurableAuthoringWorkflow(command())
    workflow.start()
    workflow.wait_for_review("review:restart")
    resumed = DurableAuthoringWorkflow.resume(workflow.snapshot)
    assert resumed.query() == workflow.query()
    assert resumed.snapshot.audit == workflow.snapshot.audit
    assert (
        resumed.resolve_review("review:restart", approved=True, actor_id="human:1").status.value
        == "RUNNING"
    )


def test_acp_adapter_is_semantic_free_and_preserves_identity() -> None:
    executor = FakeACPExecutor()
    adapter = ACPExecutionAdapter(executor)
    request = ACPExecutionRequest(
        canonical_agent_id="agent:knowledge",
        execution_id="execution:1",
        generation_job_id="generation:1",
        package_id="package:1",
        contract_versions=("AgentContribution:1.0.0",),
        payload={"opaque": True},
        idempotency_key="activity:1",
    )
    result = adapter.invoke(request)
    assert result.contribution_id == "contribution:activity:1"
    assert executor.requests == [request]


def test_acp_adapter_rejects_identity_mismatch() -> None:
    class WrongExecutor(FakeACPExecutor):
        def execute(self, request: ACPExecutionRequest):  # type: ignore[no-untyped-def]
            result = super().execute(request)
            return result.__class__(
                execution_id="execution:other",
                canonical_agent_id=result.canonical_agent_id,
                status=result.status,
                contribution_id=result.contribution_id,
            )

    with pytest.raises(ActivityFailure) as error:
        ACPExecutionAdapter(WrongExecutor()).invoke(
            ACPExecutionRequest(
                canonical_agent_id="agent:knowledge",
                execution_id="execution:1",
                generation_job_id="generation:1",
                package_id="package:1",
                contract_versions=("AgentContribution:1.0.0",),
                payload={},
                idempotency_key="activity:1",
            )
        )
    assert error.value.classification is FailureClass.NON_RETRYABLE


def test_retry_policy_is_bounded_and_semantic_failures_are_not_retryable() -> None:
    policy = RetryPolicy(maximum_attempts=2, maximum_duration_seconds=10)
    assert policy.accepts(FailureClass.RETRYABLE, 1)
    assert not policy.accepts(FailureClass.RETRYABLE, 2)
    assert not policy.accepts(FailureClass.NON_RETRYABLE, 1)
    assert not policy.accepts(FailureClass.UNKNOWN, 1)


def test_activity_idempotency_returns_existing_value_and_rejects_new_payload() -> None:
    ledger = ActivityIdempotencyLedger()
    assert ledger.resolve_or_record("activity:1", "hash:1", {"ok": True}) == {"ok": True}
    assert ledger.resolve_or_record("activity:1", "hash:1", {"ok": False}) == {"ok": True}
    with pytest.raises(IdempotencyConflict):
        ledger.resolve_or_record("activity:1", "hash:2", {"ok": False})


def test_activity_facade_prevents_duplicate_contributions_and_releases() -> None:
    class PublicationService:
        def __init__(self) -> None:
            self.calls = 0

        def publish(self, request: dict[str, object]) -> dict[str, object]:
            self.calls += 1
            return {"release_id": request["release_id"], "status": "PUBLISHED"}

    service = PublicationService()
    executor = FakeACPExecutor()
    activities = BIPM4Activities(
        acp=ACPExecutionAdapter(executor),
        publication=PublicationActivityAdapter(service),
    )

    acp_request = ACPExecutionRequest(
        canonical_agent_id="agent:knowledge",
        execution_id="execution:1",
        generation_job_id="generation:1",
        package_id="package:1",
        contract_versions=("AgentContribution:1.0.0",),
        payload={"content": "stable"},
        idempotency_key="acp:1",
    )
    first_acp = activities.execute_acp(acp_request)
    replayed_acp = activities.execute_acp(acp_request)
    assert first_acp.value == replayed_acp.value
    assert executor.requests == [acp_request]

    contribution = {"contribution_id": "contribution:1", "status": "ACCEPTED"}
    first_contribution = activities.contribution_intake(
        key="contribution:1", contribution=contribution
    )
    replayed_contribution = activities.contribution_intake(
        key="contribution:1", contribution=contribution
    )
    assert first_contribution.value == replayed_contribution.value

    publication = {"idempotency_key": "release:1", "release_id": "release:1"}
    first_release = activities.publish(request=publication)
    replayed_release = activities.publish(request=publication)
    assert first_release.value == replayed_release.value
    assert service.calls == 1


def test_command_registry_replays_same_command_and_rejects_conflict() -> None:
    registry = CommandIdempotencyRegistry()
    _, identity, created = registry.resolve_or_create(command())
    _, replay_identity, replayed = registry.resolve_or_create(command())
    assert created is True
    assert replayed is False
    assert replay_identity == identity
    with pytest.raises(IdempotencyConflict):
        registry.resolve_or_create(command(package_id="package:changed"))


def test_temporal_host_fails_fast_without_injected_runtime() -> None:
    host = TemporalHost(TemporalHostConfig(address="127.0.0.1:7233"))
    with pytest.raises(RuntimeError):
        host.start()
