from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path
from uuid import UUID

from neuralverse_backend.canonical_input import CanonicalIntake, readCanonicalInput
from neuralverse_backend.canonical_persistence import (
    CanonicalPersistenceService,
    PersistenceFailureCode,
)
from neuralverse_backend.persistence.models import (
    AuthoringJobRecord,
    CanonicalInputRecord,
    CanonicalIntakeIdempotencyRecord,
    TransactionalOutboxEventRecord,
)

ROOT = Path(__file__).parents[2] / "vendor/neutral-contracts/nv-xfi-input-contracts-v1.0.0"


class FakeSession:
    def __init__(self, existing: CanonicalIntakeIdempotencyRecord | None = None) -> None:
        self.existing = existing
        self.added: list[object] = []
        self.committed = False
        self.rolled_back = False

    def scalar(self, statement: object) -> CanonicalIntakeIdempotencyRecord | None:
        return self.existing

    def add_all(self, records: list[object]) -> None:
        self.added.extend(records)

    def commit(self) -> None:
        self.committed = True

    def rollback(self) -> None:
        self.rolled_back = True

    def close(self) -> None:
        pass


def intake() -> CanonicalIntake:
    result = readCanonicalInput(
        (
            ROOT / "contracts/examples/golden/agent-contribution/1.0.0/complete-valid.json"
        ).read_bytes(),
        release_root=ROOT,
        clock=lambda: datetime(2026, 7, 17, tzinfo=UTC),
    )
    assert result.accepted and result.intake is not None
    return result.intake


def test_valid_intake_creates_all_records_in_one_transaction() -> None:
    session = FakeSession()
    service = CanonicalPersistenceService(
        lambda: session, clock=lambda: datetime(2026, 7, 17, tzinfo=UTC)
    )
    result = service.accept(intake(), idempotency_key="canonical-test-1")
    assert result.accepted and result.response is not None
    assert result.response.persistence_status == "PERSISTED_PENDING_DISPATCH"
    assert session.committed and not session.rolled_back
    assert {type(item) for item in session.added} == {
        AuthoringJobRecord,
        CanonicalInputRecord,
        CanonicalIntakeIdempotencyRecord,
        TransactionalOutboxEventRecord,
    }
    canonical = next(item for item in session.added if isinstance(item, CanonicalInputRecord))
    assert canonical.raw_json_bytes == canonical.parsed_canonical_json.encode("utf-8")
    assert UUID(canonical.authoring_job_id.hex)


def test_same_key_and_different_request_is_a_conflict_without_writes() -> None:
    session = FakeSession(
        CanonicalIntakeIdempotencyRecord(
            idempotency_key_hash=b"x" * 32,
            request_hash="0" * 64,
            canonical_input_id=UUID(int=1),
            authoring_job_id=UUID(int=2),
            response_snapshot={},
            operation="canonical_input.accept",
            created_at=datetime(2026, 7, 17, tzinfo=UTC),
        )
    )
    service = CanonicalPersistenceService(lambda: session)
    result = service.accept(intake(), idempotency_key="canonical-test-2")
    assert not result.accepted
    assert result.failure is not None
    assert result.failure.code == PersistenceFailureCode.IDEMPOTENCY_CONFLICT
    assert not session.added and session.rolled_back


def test_idempotency_replay_returns_original_snapshot() -> None:
    original = {
        "canonical_input_id": str(UUID(int=1)),
        "authoring_job_id": str(UUID(int=2)),
        "artifact_fingerprint": "a" * 64,
        "contract_name": "AgentContribution",
        "contract_version": "1.0.0",
        "persistence_status": "PERSISTED_PENDING_DISPATCH",
        "workflow_dispatch_status": "PERSISTED_PENDING_DISPATCH",
        "idempotency_status": "COMPLETED",
    }
    session = FakeSession(
        CanonicalIntakeIdempotencyRecord(
            idempotency_key_hash=b"x" * 32,
            request_hash="".join("0" for _ in range(64)),
            canonical_input_id=UUID(int=1),
            authoring_job_id=UUID(int=2),
            response_snapshot=original,
            operation="canonical_input.accept",
            created_at=datetime(2026, 7, 17, tzinfo=UTC),
        )
    )
    # Align the request hash with the exact artifact while retaining the stored response.
    import hashlib

    assert session.existing is not None
    session.existing.request_hash = hashlib.sha256(intake().raw_canonical_json).hexdigest()
    result = CanonicalPersistenceService(lambda: session).accept(
        intake(), idempotency_key="canonical-test-3"
    )
    assert result.accepted and result.response is not None
    assert result.response.replayed
    assert result.response.canonical_input_id == UUID(int=1)
