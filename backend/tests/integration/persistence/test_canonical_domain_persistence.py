from __future__ import annotations

import asyncio
import json
import os
import uuid
from collections.abc import Generator
from datetime import UTC, datetime
from pathlib import Path

import pytest
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.exc import IntegrityError

from neuralverse_backend.canonical_input import CanonicalIntake, ReleaseIdentity, readCanonicalInput
from neuralverse_backend.canonical_persistence import CanonicalPersistenceService
from neuralverse_backend.domain.content import (
    ContentBlock,
    ContentBlockType,
    ContentPackage,
)
from neuralverse_backend.domain.learner import LearnerCollection, LearnerProfile
from neuralverse_backend.domain.publication import PublicationManifest, PublicationRelease
from neuralverse_backend.domain.shared.identifiers import (
    ContentBlockId,
    ContentPackageId,
    ContentVersionId,
    GovernanceReviewId,
    LearnerCollectionId,
    LearnerId,
    PublicationManifestId,
    PublicationReleaseId,
)
from neuralverse_backend.domain.shared.types import SequencePosition, UtcTimestamp
from neuralverse_backend.persistence.models.domain_audit import DomainAuditEventRecord
from neuralverse_backend.persistence.repositories.content_packages import (
    SqlAlchemyContentPackageRepository,
)
from neuralverse_backend.persistence.repositories.idempotency_records import (
    IdempotencyRecordRepository,
)
from neuralverse_backend.persistence.repositories.learner import SqlAlchemyLearnerRepository
from neuralverse_backend.persistence.repositories.outbox import OutboxRepository
from neuralverse_backend.persistence.repositories.publication import SqlAlchemyPublicationRepository
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


def test_content_package_round_trip_and_published_trigger(postgres_engine: Engine) -> None:
    package_id = ContentPackageId.generate()
    package = ContentPackage(id=package_id)
    version = package.create_draft_version(ContentVersionId.generate())
    version.add_block(
        ContentBlock(
            block_id=ContentBlockId.generate(),
            block_type=ContentBlockType.TEXT,
            payload={"text": "Unicode: café", "decimal": "1.0000000000000000001"},
            position=SequencePosition(value=0),
        )
    )
    factory = create_session_factory(postgres_engine)
    with factory() as session:
        asyncio.run(SqlAlchemyContentPackageRepository(session).save(package))
        session.commit()

    with factory() as session:
        loaded = asyncio.run(SqlAlchemyContentPackageRepository(session).get_by_id(package_id))
        assert loaded is not None
        assert loaded.id == package.id
        assert loaded.versions[0].blocks[0].payload == {
            "text": "Unicode: café",
            "decimal": "1.0000000000000000001",
        }
        loaded.publish_version(version.id)
        asyncio.run(SqlAlchemyContentPackageRepository(session).save(loaded))
        session.commit()

    with pytest.raises(IntegrityError):
        with postgres_engine.begin() as connection:
            connection.execute(
                text(
                    "UPDATE content_versions SET structural_semantic_payload = "
                    "CAST(:payload AS jsonb) "
                    "WHERE content_version_id = :version_id"
                ),
                {"payload": json.dumps({"changed": True}), "version_id": str(version.id)},
            )

    source_id = uuid.uuid4()
    with postgres_engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO sources (source_id, source_type, title, created_at) "
                "VALUES (:id, 'book', 'Certification source', CURRENT_TIMESTAMP)"
            ),
            {"id": source_id},
        )
    with pytest.raises(IntegrityError):
        with postgres_engine.begin() as connection:
            connection.execute(
                text(
                    "INSERT INTO content_version_sources "
                    "(content_version_id, source_id, position) VALUES (:version_id, :source_id, 0)"
                ),
                {"version_id": str(version.id), "source_id": source_id},
            )


def test_canonical_input_raw_bytes_and_hash_round_trip(postgres_engine: Engine) -> None:
    raw = b'{"contract":"AgentContribution","value":"caf\xc3\xa9"}'
    intake = CanonicalIntake(
        contract_name="AgentContribution",
        contract_version="1.0.0",
        minimum_reader_version="1.0.0",
        producer_version="test",
        canonical_artifact={"contract": "AgentContribution", "value": "café"},
        raw_canonical_json=raw,
        release_identity=ReleaseIdentity("tag", "a" * 40, "1.0.0", "b" * 64, {}),
        schema_hash="c" * 64,
        artifact_sha256="d" * 64,
        validation_result="VALID",
        received_at=datetime.now(UTC),
    )
    result = CanonicalPersistenceService(create_session_factory(postgres_engine)).accept(
        intake, idempotency_key=f"raw-{uuid.uuid4()}"
    )
    assert result.accepted and result.response is not None
    with postgres_engine.connect() as connection:
        stored = connection.execute(
            text(
                "SELECT raw_json_bytes, raw_json_sha256 FROM canonical_input_records "
                "WHERE canonical_input_id = :input_id"
            ),
            {"input_id": str(result.response.canonical_input_id)},
        ).one()
    assert bytes(stored.raw_json_bytes) == raw
    import hashlib

    assert stored.raw_json_sha256 == hashlib.sha256(raw).hexdigest()


def test_all_certified_neutral_contract_artifacts_are_persistable(
    postgres_engine: Engine,
) -> None:
    root = Path(__file__).parents[3] / "vendor/neutral-contracts/nv-xfi-input-contracts-v1.0.0"
    examples = (
        "curriculum-contract",
        "agent-contribution",
        "learning-package-draft",
        "publication-readiness-recommendation",
    )
    factory = create_session_factory(postgres_engine)
    for contract in examples:
        raw = (
            root / "contracts/examples/golden" / contract / "1.0.0/complete-valid.json"
        ).read_bytes()
        parsed = readCanonicalInput(raw, release_root=root)
        assert parsed.accepted and parsed.intake is not None
        result = CanonicalPersistenceService(factory).accept(
            parsed.intake, idempotency_key=f"contract-{contract}-{uuid.uuid4()}"
        )
        assert result.accepted, (contract, result.failure)


def test_learner_collection_exact_content_version_round_trip(postgres_engine: Engine) -> None:
    package_id = uuid.uuid4()
    version_id = uuid.uuid4()
    learner_id = LearnerId.generate()
    collection_id = LearnerCollectionId.generate()
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
    factory = create_session_factory(postgres_engine)
    with factory() as session:
        repository = SqlAlchemyLearnerRepository(session)
        asyncio.run(
            repository.save_profile(LearnerProfile(learner_id=learner_id, display_name="L"))
        )
        asyncio.run(
            repository.save_collection(
                LearnerCollection(
                    collection_id=collection_id,
                    learner_id=learner_id,
                    name="Exact",
                    version_ids=(ContentVersionId(_value=str(version_id)),),
                )
            )
        )
        session.commit()
    with factory() as session:
        loaded = asyncio.run(
            SqlAlchemyLearnerRepository(session).get_collection_by_id(collection_id)
        )
        assert loaded is not None
        assert loaded.version_ids == (ContentVersionId(_value=str(version_id)),)


def test_publication_governance_reference_round_trip(postgres_engine: Engine) -> None:
    package_id = uuid.uuid4()
    version_id = uuid.uuid4()
    review_id = uuid.uuid4()
    release_id = PublicationReleaseId.generate()
    now = datetime.now(UTC)
    with postgres_engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO content_packages "
                "(content_package_id, lifecycle_state, lock_version, created_at, updated_at) "
                "VALUES (:package_id, 'active', 0, :now, :now)"
            ),
            {"package_id": package_id, "now": now},
        )
        connection.execute(
            text(
                "INSERT INTO content_versions "
                "(content_version_id, content_package_id, revision, lifecycle_state, created_at) "
                "VALUES (:version_id, :package_id, 0, 'published', :now)"
            ),
            {"version_id": version_id, "package_id": package_id, "now": now},
        )
        connection.execute(
            text(
                "INSERT INTO publication_releases "
                "(publication_release_id, content_package_id, content_version_id, status, "
                "created_at) "
                "VALUES (:release_id, :package_id, :version_id, 'pending', :now)"
            ),
            {
                "release_id": str(release_id),
                "package_id": package_id,
                "version_id": version_id,
                "now": now,
            },
        )
        connection.execute(
            text(
                "INSERT INTO governance_reviews "
                "(governance_review_id, target_version_id, review_authority, decision, created_at) "
                "VALUES (:review_id, :version_id, 'certifier', 'approved', :now)"
            ),
            {"review_id": review_id, "version_id": version_id, "now": now},
        )
    factory = create_session_factory(postgres_engine)
    release = PublicationRelease(
        release_id=release_id,
        package_id=ContentPackageId(_value=str(package_id)),
        version_id=ContentVersionId(_value=str(version_id)),
        governance_review_ids=(GovernanceReviewId(_value=str(review_id)),),
        created_at=UtcTimestamp(value=now),
    )
    with factory() as session:
        asyncio.run(SqlAlchemyPublicationRepository(session).save_release(release))
        session.commit()
    with factory() as session:
        loaded = asyncio.run(SqlAlchemyPublicationRepository(session).get_release_by_id(release_id))
        assert loaded is not None
        assert loaded.governance_review_ids == (GovernanceReviewId(_value=str(review_id)),)


def test_publication_manifest_repository_round_trip(postgres_engine: Engine) -> None:
    package_id = uuid.uuid4()
    version_id = uuid.uuid4()
    release_id = PublicationReleaseId.generate()
    manifest_id = uuid.uuid4()
    now = datetime.now(UTC)
    with postgres_engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO content_packages "
                "(content_package_id, lifecycle_state, lock_version, created_at, updated_at) "
                "VALUES (:package_id, 'active', 0, :now, :now)"
            ),
            {"package_id": package_id, "now": now},
        )
        connection.execute(
            text(
                "INSERT INTO content_versions "
                "(content_version_id, content_package_id, revision, lifecycle_state, created_at) "
                "VALUES (:version_id, :package_id, 0, 'published', :now)"
            ),
            {"version_id": version_id, "package_id": package_id, "now": now},
        )
        connection.execute(
            text(
                "INSERT INTO publication_releases "
                "(publication_release_id, content_package_id, content_version_id, status, "
                "created_at) VALUES (:release_id, :package_id, :version_id, 'pending', :now)"
            ),
            {
                "release_id": str(release_id),
                "package_id": package_id,
                "version_id": version_id,
                "now": now,
            },
        )
    manifest = PublicationManifest(
        manifest_id=PublicationManifestId(_value=str(manifest_id)),
        release_id=release_id,
        version_id=ContentVersionId(_value=str(version_id)),
        block_ids=(),
        asset_version_ids=(),
        source_ids=(),
        citation_ids=(),
    )
    factory = create_session_factory(postgres_engine)
    with factory() as session:
        repository = SqlAlchemyPublicationRepository(session)
        asyncio.run(repository.save_manifest(manifest))
        session.commit()
    with factory() as session:
        loaded = asyncio.run(
            SqlAlchemyPublicationRepository(session).get_manifest_by_id(
                PublicationManifestId(_value=str(manifest_id))
            )
        )
        assert loaded is not None
        assert loaded.id == manifest.id
        assert loaded.release_id == manifest.release_id
        assert loaded.version_id == manifest.version_id
        assert loaded.block_ids == ()


def test_operational_repository_round_trips_for_outbox_idempotency_and_audit(
    postgres_engine: Engine,
) -> None:
    now = datetime.now(UTC)
    factory = create_session_factory(postgres_engine)
    with factory() as session:
        outbox = OutboxRepository(session).create_event(
            event_type="representative.created",
            aggregate_type="ContentVersion",
            aggregate_id=str(uuid.uuid4()),
            payload={"value": "café"},
            available_at=now,
        )
        idempotency = IdempotencyRecordRepository().insert_initial(
            session,
            scope="fixture_ingest",
            key_hash=uuid.uuid4().bytes + uuid.uuid4().bytes,
            key_hash_key_version="key-hash-v1",
            request_fingerprint="b" * 64,
            now=now,
            lock_duration_seconds=3600,
        )
        assert idempotency is not None
        audit = DomainAuditEventRecord(
            domain_audit_event_id=uuid.uuid4(),
            actor_identity="certifier",
            aggregate_type="ContentVersion",
            aggregate_id=str(uuid.uuid4()),
            operation="representative",
            metadata_json={"unicode": "café"},
            occurred_at=now,
            recorded_at=now,
        )
        session.add(audit)
        session.commit()
        outbox_id = outbox.event_id
        idempotency_id = idempotency.idempotency_record_id
        audit_id = audit.domain_audit_event_id
    with factory() as session:
        assert OutboxRepository(session).get_by_id(outbox_id) is not None
        assert IdempotencyRecordRepository().get_by_id(session, idempotency_id) is not None
        loaded_audit = session.get(DomainAuditEventRecord, audit_id)
        assert loaded_audit is not None
        assert loaded_audit.metadata_json == {"unicode": "café"}
