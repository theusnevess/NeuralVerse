from __future__ import annotations

import os
import uuid
from datetime import UTC, datetime

import pytest
from sqlalchemy import create_engine, delete, select
from sqlalchemy.orm import Session

from neuralverse_backend.application.publication import (
    AllowListAuthorizedActorPolicy,
    PublicationTransactionService,
)
from neuralverse_backend.domain.publication_m3 import (
    READY_FOR_PUBLICATION,
    AssetManifest,
    PublicationGateInput,
    SourceManifest,
)
from neuralverse_backend.persistence.models import (
    ContentPackageRecord,
    ContentVersionRecord,
    DeliveryManifestRecord,
    PublicationAuditRecord,
    PublicationCommandRecord,
    PublicationManifestRecord,
    PublicationReleaseRecord,
    TransactionalOutboxEventRecord,
)

pytestmark = [pytest.mark.integration, pytest.mark.postgres]


@pytest.fixture
def postgres_url() -> str:
    url = os.getenv("NEURALVERSE_TEST_DATABASE_URL")
    if not url:
        pytest.skip("NEURALVERSE_TEST_DATABASE_URL is required for PostgreSQL integration")
    return url


def test_publication_transaction_is_idempotent_and_outboxed(postgres_url: str) -> None:
    engine = create_engine(postgres_url, hide_parameters=True)
    package_id = uuid.uuid4()
    version_id = uuid.uuid4()
    release_id = uuid.uuid4()
    manifest_id = uuid.uuid4()
    now = datetime(2026, 7, 18, tzinfo=UTC)
    request = PublicationGateInput(
        package_id=str(package_id),
        content_version_id=str(version_id),
        schema_name="content-package",
        schema_version="1.0.0",
        readiness_status=READY_FOR_PUBLICATION,
        findings=(),
        governance_approved=True,
        manual_review_complete=True,
        source_manifest=SourceManifest(("source-1",)),
        asset_manifest=AssetManifest(("asset-1",)),
        authorized_actor="owner",
        allowed_actors=frozenset({"owner"}),
        idempotency_key=f"publication-{package_id}",
        content_block_ids=("block-1", "block-2"),
        citation_ids=("citation-1",),
        publication_manifest_id=str(manifest_id),
    )
    service = PublicationTransactionService(AllowListAuthorizedActorPolicy({"owner"}))
    try:
        with Session(engine) as session, session.begin():
            session.add(
                ContentPackageRecord(
                    content_package_id=package_id,
                    created_at=now,
                    updated_at=now,
                )
            )
            session.add(
                ContentVersionRecord(
                    content_version_id=version_id,
                    content_package_id=package_id,
                    revision=1,
                    lifecycle_state="reviewed",
                    created_at=now,
                )
            )
            session.add(
                PublicationReleaseRecord(
                    publication_release_id=release_id,
                    content_package_id=package_id,
                    content_version_id=version_id,
                    release_number=1,
                    status="pending",
                    created_at=now,
                )
            )
            session.flush()
            session.add(
                PublicationManifestRecord(
                    publication_manifest_id=manifest_id,
                    release_id=release_id,
                    version_id=version_id,
                    created_at=now,
                )
            )
            session.flush()

            first = service.publish(session, request, now=now)
            replay = service.publish(session, request, now=now)
            assert first == replay
            assert first.release_number == 1
            assert session.scalar(select(PublicationCommandRecord)) is not None
            assert session.scalar(select(PublicationAuditRecord)) is not None
            assert session.scalar(select(DeliveryManifestRecord)) is not None
            assert session.scalar(select(TransactionalOutboxEventRecord)) is not None
            assert session.get(ContentVersionRecord, version_id).lifecycle_state == "published"
            assert session.get(PublicationReleaseRecord, release_id).status == "released"
            session.execute(
                delete(TransactionalOutboxEventRecord).where(
                    TransactionalOutboxEventRecord.aggregate_id == str(release_id)
                )
            )
            session.execute(
                delete(PublicationCommandRecord).where(
                    PublicationCommandRecord.publication_release_id == release_id
                )
            )
            session.execute(
                delete(PublicationAuditRecord).where(
                    PublicationAuditRecord.publication_release_id == release_id
                )
            )
            session.execute(
                delete(DeliveryManifestRecord).where(
                    DeliveryManifestRecord.publication_release_id == release_id
                )
            )
            session.delete(session.get(PublicationManifestRecord, manifest_id))
            session.delete(session.get(PublicationReleaseRecord, release_id))
            session.delete(session.get(ContentVersionRecord, version_id))
            session.delete(session.get(ContentPackageRecord, package_id))
    finally:
        engine.dispose()
