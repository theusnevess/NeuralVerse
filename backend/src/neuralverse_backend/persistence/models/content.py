"""Canonical domain content persistence models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class ContentPackageRecord(Base):
    __tablename__ = "content_packages"

    content_package_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    lifecycle_state: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'active'")
    )
    lock_version: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "lifecycle_state IN ('active', 'retired', 'archived')",
            name="lifecycle_state",
        ),
        CheckConstraint("lock_version >= 0", name="lock_version_nonnegative"),
    )


class ContentVersionRecord(Base):
    __tablename__ = "content_versions"

    content_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    content_package_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_packages.content_package_id", ondelete="RESTRICT"),
        nullable=False,
    )
    revision: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    predecessor_content_version_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), nullable=True
    )
    lifecycle_state: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'draft'")
    )
    structural_semantic_payload: Mapped[object] = mapped_column(JSONB, nullable=True)
    opaque_metadata: Mapped[object] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "content_version_id",
            "content_package_id",
            name="uq_content_versions_id_package",
        ),
        ForeignKeyConstraint(
            ["predecessor_content_version_id", "content_package_id"],
            ["content_versions.content_version_id", "content_versions.content_package_id"],
            ondelete="RESTRICT",
            name="fk_content_versions_predecessor_same_package",
        ),
        UniqueConstraint(
            "content_package_id",
            "revision",
            name="uq_content_versions_package_revision",
        ),
        CheckConstraint(
            "lifecycle_state IN ("
            "'draft', 'in_review', 'reviewed', 'published', "
            "'correction_requested', 'corrected', 'retired')",
            name="lifecycle_state",
        ),
        CheckConstraint("revision >= 0", name="revision_nonnegative"),
        CheckConstraint(
            "predecessor_content_version_id IS NULL OR "
            "predecessor_content_version_id <> content_version_id",
            name="no_self_predecessor",
        ),
        Index("ix_content_versions_package", "content_package_id"),
        Index("ix_content_versions_lifecycle", "lifecycle_state"),
    )


class ContentBlockRecord(Base):
    __tablename__ = "content_blocks"

    content_block_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    content_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        nullable=False,
    )
    block_type: Mapped[str] = mapped_column(String(32), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    payload: Mapped[str | dict[str, object]] = mapped_column(Text, nullable=False)
    opaque_metadata: Mapped[object] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "content_version_id",
            "position",
            name="uq_content_blocks_version_position",
        ),
        CheckConstraint(
            "block_type IN ("
            "'text', 'image', 'video', 'audio', 'interactive', "
            "'code', 'diagram', 'equation', 'laboratory', 'assessment')",
            name="block_type",
        ),
        CheckConstraint("position >= 0", name="position_nonnegative"),
        Index("ix_content_blocks_version", "content_version_id"),
    )


class ContentBlockRelationshipRecord(Base):
    __tablename__ = "content_block_relationships"

    relationship_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_block_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_blocks.content_block_id", ondelete="RESTRICT"),
        nullable=False,
    )
    target_block_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_blocks.content_block_id", ondelete="RESTRICT"),
        nullable=False,
    )
    relationship_type: Mapped[str] = mapped_column(String(32), nullable=False)
    position: Mapped[int | None] = mapped_column(Integer, nullable=True)
    metadata_json: Mapped[object] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "relationship_type IN ("
            "'precedes', 'supports', 'depends_on', 'references', "
            "'illustrates', 'assesses', 'uses_asset', 'uses_laboratory')",
            name="relationship_type",
        ),
        CheckConstraint(
            "source_block_id <> target_block_id",
            name="no_self_relationship",
        ),
        Index("ix_content_block_rel_source", "source_block_id"),
        Index("ix_content_block_rel_target", "target_block_id"),
    )


class ContentVersionSourceRecord(Base):
    __tablename__ = "content_version_sources"

    content_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    source_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("sources.source_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "content_version_id", "position", name="uq_content_version_sources_position"
        ),
        CheckConstraint("position >= 0", name="position_nonnegative"),
    )


class ContentVersionCitationRecord(Base):
    __tablename__ = "content_version_citations"

    content_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    citation_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("citations.citation_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "content_version_id", "position", name="uq_content_version_citations_position"
        ),
        CheckConstraint("position >= 0", name="position_nonnegative"),
    )


class ContentVersionAssetVersionRecord(Base):
    __tablename__ = "content_version_asset_versions"

    content_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    asset_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("asset_versions.asset_version_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "content_version_id", "position", name="uq_content_version_assets_position"
        ),
        CheckConstraint("position >= 0", name="position_nonnegative"),
    )
