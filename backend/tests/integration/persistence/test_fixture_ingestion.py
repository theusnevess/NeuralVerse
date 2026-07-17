from __future__ import annotations

import hashlib
import os
from collections.abc import Generator
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.orm import Session

from neuralverse_backend.fixtures import HMACKeyring, IngestFixture, IngestFixtureCommand
from neuralverse_backend.fixtures.idempotency import request_fingerprint
from neuralverse_backend.fixtures.results import IngestOutcome
from neuralverse_backend.persistence.models import IdempotencyRecord
from neuralverse_backend.persistence.repositories import IdempotencyRecordRepository
from neuralverse_backend.persistence.sessions import create_session_factory

pytestmark = [pytest.mark.integration, pytest.mark.postgres]


@pytest.fixture(scope="module")
def postgres_engine() -> Generator[Engine, None, None]:
    url = os.getenv("NEURALVERSE_TEST_DATABASE_URL")
    if not url:
        pytest.skip("NEURALVERSE_TEST_DATABASE_URL is required for PostgreSQL integration")
    engine = create_engine(url, hide_parameters=True, pool_pre_ping=True)
    try:
        yield engine
    finally:
        engine.dispose()


def service(engine: Engine) -> IngestFixture:
    return IngestFixture(
        create_session_factory(engine),
        HMACKeyring(active_version="test-v1", active_key=bytes(range(32))),
    )


def command(*, key: str, payload: bytes = b'{"value":1}') -> IngestFixtureCommand:
    return IngestFixtureCommand(
        raw_payload=payload,
        schema_name="neuralverse.backend.fixture-envelope",
        schema_version="1.0.0",
        minimum_reader_version="1.0.0",
        producer_version="integration-test",
        payload_media_type="application/json",
        idempotency_key=key,
        correlation_id="corr-b43",
        request_id="request-b43",
        occurred_at=datetime.now(UTC),
    )


def counts(engine: Engine) -> tuple[int, int, int]:
    with engine.connect() as connection:
        row = connection.execute(
            text(
                "SELECT "
                "(SELECT count(*) FROM fixture_records), "
                "(SELECT count(*) FROM idempotency_records), "
                "(SELECT count(*) FROM operational_audit_events)"
            )
        ).one()
        return int(row[0]), int(row[1]), int(row[2])


def test_valid_ingestion_replay_and_conflict(postgres_engine: Engine) -> None:
    operation = service(postgres_engine)
    key = f"valid-{uuid4()}"
    first = operation.execute(command(key=key, payload=b'{"value":1}'))
    assert first.outcome == IngestOutcome.CREATED
    assert first.fixture_record_id is not None

    replay = operation.execute(command(key=key, payload=b'{"value":1}'))
    assert replay.outcome == IngestOutcome.REPLAYED
    assert replay.fixture_record_id == first.fixture_record_id


def test_replay_and_conflict_use_same_identity(postgres_engine: Engine) -> None:
    operation = service(postgres_engine)
    key = f"replay-{uuid4()}"
    original = command(key=key, payload=b'{"value":1}')
    created = operation.execute(original)
    replay = operation.execute(original)
    conflict = operation.execute(command(key=key, payload=b'{"value":2}'))

    assert created.outcome == IngestOutcome.CREATED
    assert replay.outcome == IngestOutcome.REPLAYED
    assert replay.fixture_record_id == created.fixture_record_id
    assert conflict.outcome == IngestOutcome.IDEMPOTENCY_CONFLICT
    assert counts(postgres_engine)[0] >= 1


def test_rejected_and_oversized_results_are_terminally_durable(postgres_engine: Engine) -> None:
    operation = service(postgres_engine)
    rejected_key = f"rejected-{uuid4()}"
    rejected = operation.execute(command(key=rejected_key, payload=b'{"a":1,"a":2}'))
    rejected_replay = operation.execute(command(key=rejected_key, payload=b'{"a":1,"a":2}'))
    oversized_key = f"oversized-{uuid4()}"
    oversized = operation.execute(command(key=oversized_key, payload=b"x" * 1_048_577))
    oversized_replay = operation.execute(command(key=oversized_key, payload=b"x" * 1_048_577))

    assert rejected.outcome == IngestOutcome.STRUCTURALLY_REJECTED
    assert rejected.fixture_record_id is not None
    assert rejected_replay.outcome == IngestOutcome.REPLAYED
    assert rejected_replay.fixture_record_id == rejected.fixture_record_id
    assert oversized.outcome == IngestOutcome.FAILED_TERMINAL
    assert oversized.error_code == "PAYLOAD_TOO_LARGE"
    assert oversized_replay.outcome == IngestOutcome.REPLAYED
    assert oversized_replay.error_code == "PAYLOAD_TOO_LARGE"


def test_active_and_expired_in_progress_paths(postgres_engine: Engine) -> None:
    key = f"active-{uuid4()}"
    operation = service(postgres_engine)
    active_command = command(key=key)
    fingerprint = request_fingerprint(
        schema_name=active_command.schema_name,
        schema_version=active_command.schema_version,
        payload_media_type=active_command.payload_media_type,
        minimum_reader_version=active_command.minimum_reader_version,
        producer_version=active_command.producer_version,
        raw_payload_hash=hashlib.sha256(active_command.raw_payload).hexdigest(),
        payload_size=len(active_command.raw_payload),
        supersedes_fixture_record_id=None,
    )
    now = datetime.now(UTC)
    repository = IdempotencyRecordRepository()
    with Session(postgres_engine) as session:
        record = repository.insert_initial(
            session,
            scope="fixture_ingest",
            key_hash=HMACKeyring(
                active_version="test-v1", active_key=bytes(range(32))
            ).active_digest(key),
            key_hash_key_version="test-v1",
            request_fingerprint=fingerprint,
            now=now,
            lock_duration_seconds=86400,
        )
        assert record is not None
        record_id = record.idempotency_record_id
        session.commit()

    active = operation.execute(active_command)
    assert active.outcome == IngestOutcome.IN_PROGRESS

    with Session(postgres_engine) as session:
        record = session.get(IdempotencyRecord, record_id)
        assert record is not None
        record.created_at = now - timedelta(days=2)
        record.expires_at = now - timedelta(microseconds=1)
        session.commit()

    takeover = operation.execute(active_command)
    assert takeover.outcome == IngestOutcome.CREATED


def test_transaction_failure_rolls_back_all_rows(postgres_engine: Engine) -> None:
    class FailingAudit:
        def add(self, session: Session, event: object) -> None:
            raise RuntimeError("controlled audit failure")

    key = f"rollback-{uuid4()}"
    before = counts(postgres_engine)
    operation = IngestFixture(
        create_session_factory(postgres_engine),
        HMACKeyring(active_version="test-v1", active_key=bytes(range(32))),
        audit_repository=FailingAudit(),  # type: ignore[arg-type]
    )
    result = operation.execute(command(key=key))

    assert result.outcome == IngestOutcome.INTERNAL_FAILURE
    assert counts(postgres_engine) == before


def test_identical_concurrent_requests_create_at_most_one_fixture(postgres_engine: Engine) -> None:
    key = f"concurrent-{uuid4()}"
    request = command(key=key, payload=b'{"concurrent":true}')
    before = counts(postgres_engine)[0]

    def execute() -> IngestOutcome:
        return service(postgres_engine).execute(request).outcome

    with ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(lambda _: execute(), range(2)))

    assert sorted(outcome.value for outcome in outcomes) == ["CREATED", "REPLAYED"]
    assert counts(postgres_engine)[0] - before == 1


def test_conflicting_concurrent_requests_create_one_fixture_and_conflict(
    postgres_engine: Engine,
) -> None:
    key = f"concurrent-conflict-{uuid4()}"
    before = counts(postgres_engine)[0]
    requests = (
        command(key=key, payload=b'{"concurrent":1}'),
        command(key=key, payload=b'{"concurrent":2}'),
    )

    def execute(request: IngestFixtureCommand) -> IngestOutcome:
        return service(postgres_engine).execute(request).outcome

    with ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(execute, requests))

    assert sorted(outcome.value for outcome in outcomes) == ["CREATED", "IDEMPOTENCY_CONFLICT"]
    assert counts(postgres_engine)[0] - before == 1


def test_previous_key_replay_and_failed_retryable_reacquisition(postgres_engine: Engine) -> None:
    key = f"previous-{uuid4()}"
    request = command(key=key)
    old_keyring = HMACKeyring(active_version="old-v1", active_key=bytes(range(32)))
    current_keyring = HMACKeyring(
        active_version="current-v1",
        active_key=bytes(range(31, -1, -1)),
        previous_keys=(("old-v1", bytes(range(32))),),
    )
    fingerprint = request_fingerprint(
        schema_name=request.schema_name,
        schema_version=request.schema_version,
        payload_media_type=request.payload_media_type,
        minimum_reader_version=request.minimum_reader_version,
        producer_version=request.producer_version,
        raw_payload_hash=hashlib.sha256(request.raw_payload).hexdigest(),
        payload_size=len(request.raw_payload),
        supersedes_fixture_record_id=None,
    )
    repository = IdempotencyRecordRepository()
    now = datetime.now(UTC)
    with Session(postgres_engine) as session:
        record = repository.insert_initial(
            session,
            scope="fixture_ingest",
            key_hash=old_keyring.active_digest(key),
            key_hash_key_version="old-v1",
            request_fingerprint=fingerprint,
            now=now,
            lock_duration_seconds=86400,
        )
        assert record is not None
        record.status = "FAILED_RETRYABLE"
        record.locked_at = None
        record.failed_at = now
        record.last_error_code = "DATABASE_CONNECTION_FAILURE"
        record.expires_at = now + timedelta(days=30)
        session.commit()

    result = IngestFixture(create_session_factory(postgres_engine), current_keyring).execute(
        request
    )
    assert result.outcome == IngestOutcome.CREATED


def test_attempt_limit_and_retry_horizon_terminalize_without_fixture(
    postgres_engine: Engine,
) -> None:
    operation = service(postgres_engine)
    repository = IdempotencyRecordRepository()
    for suffix, attempt_count, created_at in (
        ("attempt", 100, datetime.now(UTC) - timedelta(days=1)),
        ("horizon", 1, datetime.now(UTC) - timedelta(days=31)),
    ):
        request = command(key=f"terminal-{suffix}-{uuid4()}")
        fingerprint = request_fingerprint(
            schema_name=request.schema_name,
            schema_version=request.schema_version,
            payload_media_type=request.payload_media_type,
            minimum_reader_version=request.minimum_reader_version,
            producer_version=request.producer_version,
            raw_payload_hash=hashlib.sha256(request.raw_payload).hexdigest(),
            payload_size=len(request.raw_payload),
            supersedes_fixture_record_id=None,
        )
        with Session(postgres_engine) as session:
            record = repository.insert_initial(
                session,
                scope="fixture_ingest",
                key_hash=HMACKeyring(
                    active_version="test-v1", active_key=bytes(range(32))
                ).active_digest(request.idempotency_key),
                key_hash_key_version="test-v1",
                request_fingerprint=fingerprint,
                now=created_at,
                lock_duration_seconds=86400,
            )
            assert record is not None
            record.attempt_count = attempt_count
            record.expires_at = created_at + timedelta(hours=1)
            session.commit()
        result = operation.execute(request)
        assert result.outcome == IngestOutcome.FAILED_TERMINAL
        assert result.error_code in {
            "IDEMPOTENCY_ATTEMPT_LIMIT_EXCEEDED",
            "IDEMPOTENCY_RETRY_WINDOW_EXPIRED",
        }
