"""BIP-M5 asset integrity, readiness and search/index projections."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base
from neuralverse_backend.persistence.pgvector import Vector


class AssetVersionIntegrityRecord(Base):
    __tablename__ = "asset_version_integrity"

    asset_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("asset_versions.asset_version_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    storage_key: Mapped[str] = mapped_column(String(1024), nullable=False)
    byte_size: Mapped[int] = mapped_column(Integer, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    media_type: Mapped[str] = mapped_column(String(128), nullable=False)
    availability: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'uploading'")
    )
    observed_etag: Mapped[str | None] = mapped_column(String(256), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("storage_key", name="uq_asset_integrity_storage_key"),
        CheckConstraint("byte_size >= 0", name="asset_integrity_byte_size_nonnegative"),
        CheckConstraint("char_length(content_hash) = 64", name="asset_integrity_hash_length"),
        CheckConstraint(
            "availability IN ('uploading','available','missing','orphaned','quarantined','failed')",
            name="asset_integrity_availability",
        ),
    )


class AssetReadinessRecord(Base):
    __tablename__ = "asset_readiness"

    asset_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("asset_versions.asset_version_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    state: Mapped[str] = mapped_column(String(32), nullable=False, server_default=text("'pending'"))
    reasons: Mapped[object] = mapped_column(JSONB, nullable=False, server_default=text("'[]'"))
    license_status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'unknown'")
    )
    accessibility_status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'unknown'")
    )
    scientific_review_status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'unknown'")
    )
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "state IN ('pending','ready','blocked','rejected')", name="asset_readiness_state"
        ),
    )


class AssetReadinessAcknowledgementRecord(Base):
    __tablename__ = "asset_readiness_acknowledgements"

    acknowledgement_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    asset_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    asset_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("asset_versions.asset_version_id", ondelete="RESTRICT"),
        nullable=False,
    )
    result: Mapped[str] = mapped_column(String(48), nullable=False)
    gate_snapshot: Mapped[object] = mapped_column(JSONB, nullable=False)
    actor: Mapped[str] = mapped_column(String(255), nullable=False)
    actor_authority: Mapped[str] = mapped_column(String(128), nullable=False)
    command_id: Mapped[str] = mapped_column(String(255), nullable=False)
    correlation_id: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "result IN ('READY','READY_WITH_NON_BLOCKING_WARNINGS','NOT_READY','UNKNOWN')",
            name="asset_readiness_ack_result",
        ),
        Index("ix_asset_readiness_ack_version", "asset_version_id", "created_at"),
    )


class SearchResourceRecord(Base):
    __tablename__ = "search_resources"

    search_resource_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    resource_id: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(64), nullable=False)
    resource_version: Mapped[str] = mapped_column(String(128), nullable=False)
    source_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    lifecycle: Mapped[str] = mapped_column(String(32), nullable=False)
    access_scope: Mapped[str] = mapped_column(String(32), nullable=False)
    language: Mapped[str] = mapped_column(String(32), nullable=False, server_default=text("'und'"))
    title: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    content: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    alt_text: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    package_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content_version_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    release_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    block_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    citation_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    fragment_id: Mapped[str] = mapped_column(
        String(255), nullable=False, server_default=text("'root'")
    )
    fragment_position: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default=text("0")
    )
    search_schema_version: Mapped[str] = mapped_column(
        String(64), nullable=False, server_default=text("'search-resource:1.0.0'")
    )
    lexical_document: Mapped[object] = mapped_column(TSVECTOR, nullable=True)
    indexed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "resource_id", "resource_version", name="uq_search_resource_identity"
        ),
        Index("ix_search_resource_lifecycle", "lifecycle", "access_scope"),
        Index("ix_search_resource_lexical", "lexical_document", postgresql_using="gin"),
    )


class SearchEmbeddingRecord(Base):
    __tablename__ = "search_embeddings"

    search_resource_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("search_resources.search_resource_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    model_id: Mapped[str] = mapped_column(String(128), nullable=False)
    model_version: Mapped[str] = mapped_column(String(128), nullable=False)
    dimensions: Mapped[int] = mapped_column(Integer, nullable=False)
    source_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    embedding: Mapped[object] = mapped_column(Vector(1536), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint("dimensions > 0", name="search_embedding_dimensions_positive"),
        Index("ix_search_embeddings_model", "model_id", "model_version"),
        Index(
            "ix_search_embeddings_hnsw",
            "embedding",
            postgresql_using="hnsw",
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
    )


class SearchIndexRunRecord(Base):
    __tablename__ = "search_index_runs"

    index_run_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    index_name: Mapped[str] = mapped_column(String(128), nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'pending'")
    )
    source_watermark: Mapped[str] = mapped_column(String(128), nullable=False)
    indexed_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    error_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending','running','completed','stale','failed')",
            name="search_index_run_status",
        ),
    )


class SearchIndexFreshnessRecord(Base):
    __tablename__ = "search_index_freshness"

    index_name: Mapped[str] = mapped_column(String(128), primary_key=True)
    source_watermark: Mapped[str] = mapped_column(String(128), nullable=False)
    index_watermark: Mapped[str | None] = mapped_column(String(128), nullable=True)
    is_stale: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
