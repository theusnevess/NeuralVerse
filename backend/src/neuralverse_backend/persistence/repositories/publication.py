"""SQLAlchemy-backed publication repository."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from neuralverse_backend.domain.publication import (
    PublicationManifest,
    PublicationRelease,
    PublicationReleaseStatus,
)
from neuralverse_backend.domain.shared.identifiers import (
    ContentPackageId,
    ContentVersionId,
    GovernanceReviewId,
    PublicationManifestId,
    PublicationReleaseId,
)
from neuralverse_backend.domain.shared.types import UtcTimestamp
from neuralverse_backend.persistence.models.publication import (
    PublicationManifestAssessmentSpecRecord,
    PublicationManifestAssetVersionRecord,
    PublicationManifestBlockRecord,
    PublicationManifestCitationRecord,
    PublicationManifestLaboratorySpecRecord,
    PublicationManifestRecord,
    PublicationManifestSourceRecord,
    PublicationReleaseGovernanceReviewRecord,
    PublicationReleaseRecord,
)


class SqlAlchemyPublicationRepository:
    """Implements PublicationRepository protocol using SQLAlchemy."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_release_by_id(
        self, release_id: PublicationReleaseId
    ) -> PublicationRelease | None:
        record = self._session.get(PublicationReleaseRecord, UUID(str(release_id)))
        if record is None:
            return None
        return self._reconstruct_release(record)

    async def save_release(self, release: PublicationRelease) -> None:
        record = self._session.get(PublicationReleaseRecord, UUID(str(release.id)))
        if record is None:
            record = PublicationReleaseRecord(
                publication_release_id=UUID(str(release.id)),
                content_package_id=UUID(str(release.package_id)),
                content_version_id=UUID(str(release.version_id)),
                release_number=release.release_number,
                supersedes_release_id=(
                    UUID(str(release.supersedes_release_id))
                    if release.supersedes_release_id
                    else None
                ),
                status=release.status.value,
                governance_review_ids=[str(r) for r in release.governance_review_ids],
                created_at=release.created_at.value if release.created_at else None,
                released_at=release.released_at.value if release.released_at else None,
            )
            self._session.add(record)
        else:
            record.status = release.status.value
            record.release_number = release.release_number
            record.supersedes_release_id = (
                UUID(str(release.supersedes_release_id)) if release.supersedes_release_id else None
            )
            record.released_at = release.released_at.value if release.released_at else None
        self._session.flush()
        release_id = UUID(str(release.id))
        self._session.execute(
            delete(PublicationReleaseGovernanceReviewRecord).where(
                PublicationReleaseGovernanceReviewRecord.release_id == release_id
            )
        )
        self._session.add_all(
            [
                PublicationReleaseGovernanceReviewRecord(
                    release_id=release_id,
                    governance_review_id=UUID(str(review_id)),
                    position=position,
                )
                for position, review_id in enumerate(release.governance_review_ids)
            ]
        )
        self._session.flush()

    async def save_manifest(self, manifest: PublicationManifest) -> None:
        record = self._session.get(PublicationManifestRecord, UUID(str(manifest.id)))
        if record is None:
            record = PublicationManifestRecord(
                publication_manifest_id=UUID(str(manifest.id)),
                release_id=UUID(str(manifest.release_id)),
                version_id=UUID(str(manifest.version_id)),
                block_ids=list(manifest.block_ids),
                asset_version_ids=list(manifest.asset_version_ids),
                laboratory_spec_ids=list(manifest.laboratory_spec_ids),
                assessment_spec_ids=list(manifest.assessment_spec_ids),
                source_ids=list(manifest.source_ids),
                citation_ids=list(manifest.citation_ids),
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.block_ids = list(manifest.block_ids)
            record.asset_version_ids = list(manifest.asset_version_ids)
        manifest_id = UUID(str(manifest.id))
        association_sets = (
            (PublicationManifestBlockRecord, "block_id", manifest.block_ids),
            (PublicationManifestAssetVersionRecord, "asset_version_id", manifest.asset_version_ids),
            (
                PublicationManifestLaboratorySpecRecord,
                "laboratory_spec_id",
                manifest.laboratory_spec_ids,
            ),
            (
                PublicationManifestAssessmentSpecRecord,
                "assessment_spec_id",
                manifest.assessment_spec_ids,
            ),
            (PublicationManifestSourceRecord, "source_id", manifest.source_ids),
            (PublicationManifestCitationRecord, "citation_id", manifest.citation_ids),
        )
        for model, identity_field, values in association_sets:
            self._session.execute(delete(model).where(model.manifest_id == manifest_id))
            self._session.add_all(
                [
                    model(
                        manifest_id=manifest_id, **{identity_field: UUID(value), "position": index}
                    )
                    for index, value in enumerate(values)
                ]
            )
        self._session.flush()

    async def get_manifest_by_id(
        self, manifest_id: PublicationManifestId
    ) -> PublicationManifest | None:
        record = self._session.get(PublicationManifestRecord, UUID(str(manifest_id)))
        if record is None:
            return None

        def references(model: Any, column: str) -> tuple[str, ...]:
            values = self._session.execute(
                select(getattr(model, column))
                .where(model.manifest_id == record.publication_manifest_id)
                .order_by(model.position)
            ).scalars()
            return tuple(str(value) for value in values)

        return PublicationManifest(
            manifest_id=PublicationManifestId(_value=str(record.publication_manifest_id)),
            release_id=PublicationReleaseId(_value=str(record.release_id)),
            version_id=ContentVersionId(_value=str(record.version_id)),
            block_ids=references(PublicationManifestBlockRecord, "block_id"),
            asset_version_ids=references(PublicationManifestAssetVersionRecord, "asset_version_id"),
            laboratory_spec_ids=references(
                PublicationManifestLaboratorySpecRecord, "laboratory_spec_id"
            ),
            assessment_spec_ids=references(
                PublicationManifestAssessmentSpecRecord, "assessment_spec_id"
            ),
            source_ids=references(PublicationManifestSourceRecord, "source_id"),
            citation_ids=references(PublicationManifestCitationRecord, "citation_id"),
        )

    def _reconstruct_release(self, record: PublicationReleaseRecord) -> PublicationRelease:
        created_at = UtcTimestamp(value=record.created_at) if record.created_at else None
        released_at = UtcTimestamp(value=record.released_at) if record.released_at else None
        return PublicationRelease(
            release_id=PublicationReleaseId(_value=str(record.publication_release_id)),
            package_id=ContentPackageId(_value=str(record.content_package_id)),
            version_id=ContentVersionId(_value=str(record.content_version_id)),
            status=PublicationReleaseStatus(record.status),
            release_number=record.release_number,
            supersedes_release_id=(
                PublicationReleaseId(_value=str(record.supersedes_release_id))
                if record.supersedes_release_id
                else None
            ),
            governance_review_ids=tuple(
                GovernanceReviewId(_value=str(r))
                for r in self._session.execute(
                    select(PublicationReleaseGovernanceReviewRecord.governance_review_id)
                    .where(
                        PublicationReleaseGovernanceReviewRecord.release_id
                        == record.publication_release_id
                    )
                    .order_by(PublicationReleaseGovernanceReviewRecord.position)
                )
                .scalars()
                .all()
            ),
            created_at=created_at,
            released_at=released_at,
        )
