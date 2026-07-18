"""Canonical publication persistence models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class PublicationReleaseRecord(Base):
    __tablename__ = "publication_releases"

    publication_release_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    content_package_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_packages.content_package_id", ondelete="RESTRICT"),
        nullable=False,
    )
    content_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        nullable=False,
    )
    release_number: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    supersedes_release_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("publication_releases.publication_release_id", ondelete="RESTRICT"),
    )
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'pending'")
    )
    governance_review_ids: Mapped[object] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    released_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'released', 'withdrawn', 'superseded', 'deprecated', 'retired')",
            name="publication_release_status",
        ),
        CheckConstraint("release_number >= 0", name="release_number_nonnegative"),
        UniqueConstraint(
            "content_package_id", "release_number", name="uq_publication_release_number"
        ),
        UniqueConstraint("content_version_id", name="uq_publication_release_version"),
        Index("ix_publication_releases_package", "content_package_id"),
        Index("ix_publication_releases_version", "content_version_id"),
        Index("ix_publication_releases_status", "status"),
    )


class PublicationManifestRecord(Base):
    __tablename__ = "publication_manifests"

    publication_manifest_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    release_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("publication_releases.publication_release_id", ondelete="RESTRICT"),
        nullable=False,
    )
    version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        nullable=False,
    )
    block_ids: Mapped[object] = mapped_column(JSONB, nullable=True)
    asset_version_ids: Mapped[object] = mapped_column(JSONB, nullable=True)
    laboratory_spec_ids: Mapped[object] = mapped_column(JSONB, nullable=True)
    assessment_spec_ids: Mapped[object] = mapped_column(JSONB, nullable=True)
    source_ids: Mapped[object] = mapped_column(JSONB, nullable=True)
    citation_ids: Mapped[object] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        Index("ix_publication_manifests_release", "release_id"),
        Index("ix_publication_manifests_version", "version_id"),
    )


class PublicationManifestBlockRecord(Base):
    __tablename__ = "publication_manifest_blocks"
    manifest_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("publication_manifests.publication_manifest_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    block_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_blocks.content_block_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    position: Mapped[int] = mapped_column(nullable=False)


class PublicationManifestAssetVersionRecord(Base):
    __tablename__ = "publication_manifest_asset_versions"
    manifest_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("publication_manifests.publication_manifest_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    asset_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("asset_versions.asset_version_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    position: Mapped[int] = mapped_column(nullable=False)


class PublicationManifestLaboratorySpecRecord(Base):
    __tablename__ = "publication_manifest_laboratory_specs"
    manifest_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("publication_manifests.publication_manifest_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    laboratory_spec_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("laboratory_specs.laboratory_spec_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    position: Mapped[int] = mapped_column(nullable=False)


class PublicationManifestAssessmentSpecRecord(Base):
    __tablename__ = "publication_manifest_assessment_specs"
    manifest_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("publication_manifests.publication_manifest_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    assessment_spec_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("assessment_specs.assessment_spec_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    position: Mapped[int] = mapped_column(nullable=False)


class PublicationManifestSourceRecord(Base):
    __tablename__ = "publication_manifest_sources"
    manifest_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("publication_manifests.publication_manifest_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    source_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("sources.source_id", ondelete="RESTRICT"), primary_key=True
    )
    position: Mapped[int] = mapped_column(nullable=False)


class PublicationManifestCitationRecord(Base):
    __tablename__ = "publication_manifest_citations"
    manifest_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("publication_manifests.publication_manifest_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    citation_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("citations.citation_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    position: Mapped[int] = mapped_column(nullable=False)


class PublicationReleaseGovernanceReviewRecord(Base):
    __tablename__ = "publication_release_governance_reviews"

    release_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("publication_releases.publication_release_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    governance_review_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("governance_reviews.governance_review_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    position: Mapped[int] = mapped_column(nullable=False)
