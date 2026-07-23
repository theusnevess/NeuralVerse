from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol
from uuid import UUID

AUTHORING_CONTRACTS = frozenset(
    {
        "CurriculumContract",
        "AgentContribution",
        "LearningPackageDraft",
        "PublicationReadinessRecommendation",
    }
)


def workflow_id_for_job(authoring_job_id: UUID) -> str:
    return f"authoring-job:{authoring_job_id}"


@dataclass(frozen=True, slots=True)
class AuthoringWorkflowState:
    authoring_job_id: str
    received_contract_names: tuple[str, ...] = ()
    contract_versions: tuple[str, ...] = ()
    canonical_input_ids: tuple[str, ...] = ()
    artifact_fingerprints: tuple[str, ...] = ()
    state: str = "WAITING_FOR_INPUTS"
    revision: int = 0
    pending_required_inputs: tuple[str, ...] = tuple(sorted(AUTHORING_CONTRACTS))
    last_accepted_event: str | None = None


def accept_contract(
    state: AuthoringWorkflowState,
    *,
    contract_name: str,
    contract_version: str,
    canonical_input_id: str,
    artifact_fingerprint: str,
    event_id: str,
) -> AuthoringWorkflowState:
    if contract_name not in AUTHORING_CONTRACTS:
        raise ValueError("unsupported authoring contract")
    if artifact_fingerprint in state.artifact_fingerprints:
        return state
    names = (*state.received_contract_names, contract_name)
    versions = (*state.contract_versions, contract_version)
    input_ids = (*state.canonical_input_ids, canonical_input_id)
    fingerprints = (*state.artifact_fingerprints, artifact_fingerprint)
    pending = tuple(sorted(AUTHORING_CONTRACTS.difference(names)))
    next_state = "READY_FOR_AUTHORING" if not pending else "INPUTS_AVAILABLE"
    return AuthoringWorkflowState(
        authoring_job_id=state.authoring_job_id,
        received_contract_names=names,
        contract_versions=versions,
        canonical_input_ids=input_ids,
        artifact_fingerprints=fingerprints,
        state=next_state,
        revision=state.revision + 1,
        pending_required_inputs=pending,
        last_accepted_event=event_id,
    )


class TemporalAuthoringGateway(Protocol):
    def start_or_signal(
        self,
        *,
        workflow_id: str,
        authoring_job_id: str,
        event: dict[str, Any],
        workflow_started: bool,
    ) -> str: ...


class TemporalClientGateway:
    """Small adapter around an injected temporalio client.

    Importing temporalio is intentionally deferred to the host process. This
    keeps persistence and workflow construction testable without a global
    client or a cross-service dependency.
    """

    def __init__(self, client: Any, *, task_queue: str = "neuralverse-authoring") -> None:
        self._client = client
        self._task_queue = task_queue

    def start_or_signal(
        self,
        *,
        workflow_id: str,
        authoring_job_id: str,
        event: dict[str, Any],
        workflow_started: bool,
    ) -> str:
        if not workflow_started:
            self._client.start_workflow(
                "authoring_workflow",
                {"authoring_job_id": authoring_job_id, "first_event": event},
                id=workflow_id,
                task_queue=self._task_queue,
            )
            return "WORKFLOW_STARTED"
        handle = self._client.get_workflow_handle(workflow_id)
        handle.signal("accept_contract", event)
        return "WORKFLOW_SIGNALED"
