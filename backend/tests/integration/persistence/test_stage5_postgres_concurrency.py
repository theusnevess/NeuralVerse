from __future__ import annotations

import hashlib
import os
import uuid
from collections.abc import Generator
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime

import pytest
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.exc import IntegrityError

from neuralverse_backend.canonical_input import CanonicalIntake, ReleaseIdentity
from neuralverse_backend.canonical_persistence import CanonicalPersistenceService
from neuralverse_backend.persistence.repositories.outbox import OutboxRepository
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


def test_concurrent_package_creation_has_one_canonical_row(postgres_engine: Engine) -> None:
    package_id = uuid.uuid4()

    def insert() -> bool:
        try:
            with postgres_engine.begin() as connection:
                connection.execute(
                    text(
                        "INSERT INTO content_packages "
                        "(content_package_id, lifecycle_state, lock_version, created_at, "
                        "updated_at) "
                        "VALUES (:id, 'active', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
                    ),
                    {"id": package_id},
                )
            return True
        except IntegrityError:
            return False

    with ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(lambda _: insert(), range(2)))
    assert sum(outcomes) == 1
    with postgres_engine.connect() as connection:
        assert (
            connection.execute(
                text("SELECT count(*) FROM content_packages WHERE content_package_id = :id"),
                {"id": package_id},
            ).scalar_one()
            == 1
        )


def test_concurrent_revision_allocation_rejects_duplicate_revision(
    postgres_engine: Engine,
) -> None:
    package_id = uuid.uuid4()
    with postgres_engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO content_packages "
                "(content_package_id, lifecycle_state, lock_version, created_at, updated_at) "
                "VALUES (:id, 'active', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            ),
            {"id": package_id},
        )

    def insert_revision() -> bool:
        try:
            with postgres_engine.begin() as connection:
                connection.execute(
                    text(
                        "INSERT INTO content_versions "
                        "(content_version_id, content_package_id, revision, lifecycle_state, "
                        "created_at) "
                        "VALUES (:id, :package_id, 0, 'draft', CURRENT_TIMESTAMP)"
                    ),
                    {"id": uuid.uuid4(), "package_id": package_id},
                )
            return True
        except IntegrityError:
            return False

    with ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(lambda _: insert_revision(), range(2)))
    assert sum(outcomes) == 1


def test_concurrent_block_position_allocation_rejects_duplicate_position(
    postgres_engine: Engine,
) -> None:
    package_id = uuid.uuid4()
    version_id = uuid.uuid4()
    with postgres_engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO content_packages "
                "(content_package_id, lifecycle_state, lock_version, created_at, updated_at) "
                "VALUES (:package_id, 'active', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            ),
            {"package_id": package_id},
        )
        connection.execute(
            text(
                "INSERT INTO content_versions "
                "(content_version_id, content_package_id, revision, lifecycle_state, created_at) "
                "VALUES (:version_id, :package_id, 0, 'draft', CURRENT_TIMESTAMP)"
            ),
            {"version_id": version_id, "package_id": package_id},
        )

    def insert_position() -> bool:
        try:
            with postgres_engine.begin() as connection:
                connection.execute(
                    text(
                        "INSERT INTO content_blocks "
                        "(content_block_id, content_version_id, block_type, position, payload, "
                        "created_at) "
                        "VALUES (:id, :version_id, 'text', 0, 'same', CURRENT_TIMESTAMP)"
                    ),
                    {"id": uuid.uuid4(), "version_id": version_id},
                )
            return True
        except IntegrityError:
            return False

    with ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(lambda _: insert_position(), range(2)))
    assert sum(outcomes) == 1


def test_concurrent_outbox_claims_are_exclusive(postgres_engine: Engine) -> None:
    factory = create_session_factory(postgres_engine)
    with factory() as session:
        event = OutboxRepository(session).create_event(
            event_type="stage5.test",
            aggregate_type="Test",
            aggregate_id=str(uuid.uuid4()),
            payload={"safe": True},
            available_at=datetime.now(UTC),
        )
        event_id = event.event_id
        session.commit()

    def claim() -> list[uuid.UUID]:
        with factory() as session:
            # The shared certification database can contain unrelated pending
            # events. Claim enough rows to include this task-owned event while
            # retaining the independent-session locking assertion.
            events = OutboxRepository(session).claim_pending_events(limit=10_000)
            ids = [event.event_id for event in events]
            session.commit()
            return ids

    with ThreadPoolExecutor(max_workers=2) as executor:
        claims = list(executor.map(lambda _: claim(), range(2)))
    assert sum(event_id in claim for claim in claims) == 1
    with postgres_engine.connect() as connection:
        assert connection.execute(
            text(
                "SELECT status, attempt_count FROM transactional_outbox_events WHERE event_id = :id"
            ),
            {"id": event_id},
        ).one() == ("PROCESSING", 1)


def test_concurrent_identical_idempotent_commands_replay_one_result(
    postgres_engine: Engine,
) -> None:
    raw = b'{"same":true}'
    intake = CanonicalIntake(
        contract_name="AgentContribution",
        contract_version="1.0.0",
        minimum_reader_version="1.0.0",
        producer_version="concurrency-test",
        canonical_artifact={"same": True},
        raw_canonical_json=raw,
        release_identity=ReleaseIdentity("tag", "a" * 40, "1.0.0", "b" * 64, {}),
        schema_hash="c" * 64,
        artifact_sha256=hashlib.sha256(raw).hexdigest(),
        validation_result="VALID",
        received_at=datetime.now(UTC),
    )
    key = f"concurrent-idempotency-{uuid.uuid4()}"
    factory = create_session_factory(postgres_engine)

    def accept() -> bool:
        result = CanonicalPersistenceService(factory).accept(intake, idempotency_key=key)
        return result.accepted

    with ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(lambda _: accept(), range(2)))
    assert outcomes == [True, True]
    with postgres_engine.connect() as connection:
        assert (
            connection.execute(
                text(
                    "SELECT count(*) FROM canonical_intake_idempotency "
                    "WHERE idempotency_key_hash = :hash"
                ),
                {"hash": hashlib.sha256(key.encode()).digest()},
            ).scalar_one()
            == 1
        )


def test_concurrent_conflicting_idempotent_commands_have_one_conflict(
    postgres_engine: Engine,
) -> None:
    key = f"conflicting-idempotency-{uuid.uuid4()}"
    factory = create_session_factory(postgres_engine)

    def accept(value: int) -> bool:
        raw = f'{{"value":{value}}}'.encode()
        intake = CanonicalIntake(
            contract_name="AgentContribution",
            contract_version="1.0.0",
            minimum_reader_version="1.0.0",
            producer_version="concurrency-test",
            canonical_artifact={"value": value},
            raw_canonical_json=raw,
            release_identity=ReleaseIdentity("tag", "a" * 40, "1.0.0", "b" * 64, {}),
            schema_hash="c" * 64,
            artifact_sha256=hashlib.sha256(raw).hexdigest(),
            validation_result="VALID",
            received_at=datetime.now(UTC),
        )
        return CanonicalPersistenceService(factory).accept(intake, idempotency_key=key).accepted

    with ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(accept, (1, 2)))
    assert sum(outcomes) == 1


def test_optimistic_lock_conflict_has_one_winner(postgres_engine: Engine) -> None:
    package_id = uuid.uuid4()
    with postgres_engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO content_packages "
                "(content_package_id, lifecycle_state, lock_version, created_at, updated_at) "
                "VALUES (:id, 'active', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            ),
            {"id": package_id},
        )

    def update_package() -> int:
        with postgres_engine.begin() as connection:
            return connection.execute(
                text(
                    "UPDATE content_packages SET lifecycle_state = 'retired', "
                    "lock_version = lock_version + 1 WHERE content_package_id = :id "
                    "AND lock_version = 0"
                ),
                {"id": package_id},
            ).rowcount

    with ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(lambda _: update_package(), range(2)))
    assert outcomes.count(1) == 1
    assert outcomes.count(0) == 1


def test_duplicate_publication_release_identity_is_rejected(postgres_engine: Engine) -> None:
    package_id = uuid.uuid4()
    version_id = uuid.uuid4()
    release_id = uuid.uuid4()
    with postgres_engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO content_packages "
                "(content_package_id, lifecycle_state, lock_version, created_at, updated_at) "
                "VALUES (:package_id, 'active', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            ),
            {"package_id": package_id},
        )
        connection.execute(
            text(
                "INSERT INTO content_versions "
                "(content_version_id, content_package_id, revision, lifecycle_state, created_at) "
                "VALUES (:version_id, :package_id, 0, 'published', CURRENT_TIMESTAMP)"
            ),
            {"version_id": version_id, "package_id": package_id},
        )

    def insert_release() -> bool:
        try:
            with postgres_engine.begin() as connection:
                connection.execute(
                    text(
                        "INSERT INTO publication_releases "
                        "(publication_release_id, content_package_id, content_version_id, status, "
                        "created_at) "
                        "VALUES (:release_id, :package_id, :version_id, 'released', "
                        "CURRENT_TIMESTAMP)"
                    ),
                    {
                        "release_id": release_id,
                        "package_id": package_id,
                        "version_id": version_id,
                    },
                )
            return True
        except IntegrityError:
            return False

    with ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(lambda _: insert_release(), range(2)))
    assert sum(outcomes) == 1
