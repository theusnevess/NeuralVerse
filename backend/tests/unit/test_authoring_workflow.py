from __future__ import annotations

from uuid import UUID

from neuralverse_backend.authoring_workflow import (
    AuthoringWorkflowState,
    TemporalClientGateway,
    accept_contract,
    workflow_id_for_job,
)


def test_authoring_state_accepts_independent_contracts_and_becomes_ready() -> None:
    state = AuthoringWorkflowState(authoring_job_id="job-1")
    for index, name in enumerate(
        (
            "CurriculumContract",
            "AgentContribution",
            "LearningPackageDraft",
            "PublicationReadinessRecommendation",
        )
    ):
        state = accept_contract(
            state,
            contract_name=name,
            contract_version="1.0.0",
            canonical_input_id=f"input-{index}",
            artifact_fingerprint=f"{index + 1:064d}",
            event_id=f"event-{index}",
        )
    assert state.state == "READY_FOR_AUTHORING"
    assert state.pending_required_inputs == ()
    assert state.revision == 4


def test_replayed_artifact_does_not_change_workflow_state() -> None:
    state = AuthoringWorkflowState(authoring_job_id="job-1")
    accepted = accept_contract(
        state,
        contract_name="AgentContribution",
        contract_version="1.0.0",
        canonical_input_id="input-1",
        artifact_fingerprint="a" * 64,
        event_id="event-1",
    )
    replayed = accept_contract(
        accepted,
        contract_name="AgentContribution",
        contract_version="1.0.0",
        canonical_input_id="input-1",
        artifact_fingerprint="a" * 64,
        event_id="event-replay",
    )
    assert replayed == accepted


def test_temporal_gateway_starts_once_then_signals() -> None:
    class Handle:
        def __init__(self) -> None:
            self.signals: list[tuple[str, object]] = []

        def signal(self, name: str, payload: object) -> None:
            self.signals.append((name, payload))

    class Client:
        def __init__(self) -> None:
            self.started: list[tuple[object, dict[str, object]]] = []
            self.handle = Handle()

        def start_workflow(
            self, name: object, payload: dict[str, object], **kwargs: object
        ) -> None:
            self.started.append((name, {**payload, **kwargs}))

        def get_workflow_handle(self, workflow_id: str) -> Handle:
            assert workflow_id == "authoring-job:" + str(UUID(int=1))
            return self.handle

    client = Client()
    gateway = TemporalClientGateway(client)
    workflow_id = workflow_id_for_job(UUID(int=1))
    assert (
        gateway.start_or_signal(
            workflow_id=workflow_id,
            authoring_job_id=str(UUID(int=1)),
            event={"contract_name": "AgentContribution"},
            workflow_started=False,
        )
        == "WORKFLOW_STARTED"
    )
    assert (
        gateway.start_or_signal(
            workflow_id=workflow_id,
            authoring_job_id=str(UUID(int=1)),
            event={"contract_name": "CurriculumContract"},
            workflow_started=True,
        )
        == "WORKFLOW_SIGNALED"
    )
    assert len(client.started) == 1
    assert client.handle.signals == [("accept_contract", {"contract_name": "CurriculumContract"})]
