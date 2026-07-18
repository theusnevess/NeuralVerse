from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi.testclient import TestClient

from neuralverse_backend.canonical_input import CanonicalIntake
from neuralverse_backend.canonical_persistence import (
    CanonicalPersistenceResponse,
    CanonicalPersistenceResult,
)
from neuralverse_backend.configuration.settings import Environment, LogFormat, Settings
from neuralverse_backend.cross_front.workflow import (
    CrossFrontWorkflowService,
    InMemoryWorkflowStore,
)
from neuralverse_backend.fixtures.results import IngestFixtureResult, IngestOutcome
from neuralverse_backend.interfaces.http.app import create_http_app


class FakeIngestor:
    def execute(self, command: object) -> IngestFixtureResult:
        return IngestFixtureResult(outcome=IngestOutcome.CREATED)


def body() -> dict[str, object]:
    return {
        "metadata": {
            "schema_name": "NV-XFI-000",
            "schema_version": "1.0.0",
            "minimum_reader_version": "1.0.0",
            "producer_version": "acp-stage2",
            "created_at": "2026-07-17T10:00:00Z",
            "message_id": "execution:http",
        },
        "payload": {"kind": "authoring-result"},
    }


def test_nv_xfi_endpoint_requires_idempotency_and_returns_execution() -> None:
    settings = Settings(environment=Environment.TEST, log_format=LogFormat.JSON)
    service = CrossFrontWorkflowService(FakeIngestor(), InMemoryWorkflowStore())
    app = create_http_app(settings, cross_front_workflow_service=service)
    with TestClient(app) as client:
        missing = client.post("/cross-front/nv-xfi-000", json=body())
        accepted = client.post(
            "/cross-front/nv-xfi-000",
            json=body(),
            headers={"Idempotency-Key": "command:http"},
        )
    assert missing.status_code == 400
    assert accepted.status_code == 202
    assert accepted.json()["status"] == "COMPLETED"


def test_nv_xfi_endpoint_rejects_idempotency_reuse_for_changed_payload() -> None:
    settings = Settings(environment=Environment.TEST, log_format=LogFormat.JSON)
    service = CrossFrontWorkflowService(FakeIngestor(), InMemoryWorkflowStore())
    app = create_http_app(settings, cross_front_workflow_service=service)
    with TestClient(app) as client:
        first = client.post(
            "/cross-front/nv-xfi-000",
            json=body(),
            headers={"Idempotency-Key": "command:http-conflict"},
        )
        changed = {**body(), "payload": {"kind": "different-result"}}
        conflict = client.post(
            "/cross-front/nv-xfi-000",
            json=changed,
            headers={"Idempotency-Key": "command:http-conflict"},
        )
    assert first.status_code == 202
    assert conflict.status_code == 409
    assert conflict.json()["error_code"] == "IDEMPOTENCY_CONFLICT"


def test_canonical_input_endpoint_validates_before_workflow() -> None:
    settings = Settings(environment=Environment.TEST, log_format=LogFormat.JSON)
    app = create_http_app(settings)
    app.state.canonical_persistence_service = FakeCanonicalPersistenceService()
    fixture = (
        Path(__file__).parents[2]
        / "vendor/neutral-contracts/nv-xfi-input-contracts-v1.0.0/contracts/examples/golden/"
        "agent-contribution/1.0.0/complete-valid.json"
    ).read_bytes()
    with TestClient(app) as client:
        accepted = client.post(
            "/cross-front/canonical-input",
            content=fixture,
            headers={"Idempotency-Key": "canonical-http"},
        )
        rejected = client.post(
            "/cross-front/canonical-input",
            content=b"{invalid",
            headers={"Idempotency-Key": "canonical-http-invalid"},
        )
    assert accepted.status_code == 200
    assert accepted.json()["contract_name"] == "AgentContribution"
    assert rejected.status_code == 422
    assert rejected.json()["error_code"] == "INVALID_JSON"


class FakeCanonicalPersistenceService:
    def accept(
        self, intake: CanonicalIntake, *, idempotency_key: str
    ) -> CanonicalPersistenceResult:
        return CanonicalPersistenceResult(
            response=CanonicalPersistenceResponse(
                canonical_input_id=uuid4(),
                authoring_job_id=uuid4(),
                artifact_fingerprint=intake.artifact_sha256,
                contract_name=intake.contract_name,
                contract_version=intake.contract_version,
                persistence_status="PERSISTED_PENDING_DISPATCH",
                workflow_dispatch_status="PERSISTED_PENDING_DISPATCH",
                idempotency_status="COMPLETED",
            )
        )
