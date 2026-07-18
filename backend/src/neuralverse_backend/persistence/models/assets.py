"""Canonical asset persistence models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    Uuid,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class AssetRecord(Base):
    __tablename__ = "assets"

    asset_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    asset_type: Mapped[str] = mapped_column(String(32), nullable=False)
    display_name: Mapped[str] = mapped_column(
        String(512), nullable=False, server_default=text("''")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "asset_type IN ('image', 'video', 'audio', 'document', 'archive', 'data', 'other')",
            name="asset_type",
        ),
    )


class AssetVersionRecord(Base):
    __tablename__ = "asset_versions"

    asset_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    asset_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("assets.asset_id", ondelete="RESTRICT"),
        nullable=False,
    )
    media_type: Mapped[str] = mapped_column(String(128), nullable=False)
    content_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    provenance: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    lifecycle: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'draft'")
    )
    semantic_purpose: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "lifecycle IN ("
            "'draft', 'review', 'approved', 'published', 'retired', "
            "'archived', 'failed', 'cancelled')",
            name="lifecycle",
        ),
        CheckConstraint(
            "char_length(btrim(media_type)) > 0",
            name="media_type_nonempty",
        ),
        Index("ix_asset_versions_asset", "asset_id"),
    )


class VisualizationSpecRecord(Base):
    __tablename__ = "visualization_specs"

    visualization_spec_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    visualization_type: Mapped[str] = mapped_column(String(128), nullable=False)
    requirements: Mapped[object] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "char_length(btrim(visualization_type)) > 0",
            name="visualization_type_nonempty",
        ),
    )
