"""BIP-M3 publication command, audit and delivery-manifest mappings."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class PublicationCommandRecord(Base):
    __tablename__ = "publication_commands"

    publication_command_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    idempotency_key: Mapped[str] = mapped_column(String(255), nullable=False)
    request_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    actor_id: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'COMPLETED'")
    )
    publication_release_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("publication_releases.publication_release_id", ondelete="RESTRICT"),
    )
    response_snapshot: Mapped[object] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        UniqueConstraint("idempotency_key", name="uq_publication_commands_idempotency_key"),
        CheckConstraint("status IN ('COMPLETED', 'REJECTED')", name="status"),
        CheckConstraint("char_length(btrim(idempotency_key)) > 0", name="idempotency_key_nonempty"),
        CheckConstraint("request_fingerprint ~ '^[0-9a-f]{64}$'", name="request_fingerprint_hex"),
        Index("ix_publication_commands_release", "publication_release_id"),
    )


class PublicationAuditRecord(Base):
    __tablename__ = "publication_audit_records"

    publication_audit_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    publication_release_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("publication_releases.publication_release_id", ondelete="RESTRICT"),
        nullable=False,
    )
    actor_id: Mapped[str] = mapped_column(String(255), nullable=False)
    action: Mapped[str] = mapped_column(String(64), nullable=False)
    gate_snapshot: Mapped[object] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint("char_length(btrim(actor_id)) > 0", name="actor_id_nonempty"),
        Index("ix_publication_audit_release", "publication_release_id"),
    )


class DeliveryManifestRecord(Base):
    __tablename__ = "delivery_manifests"

    delivery_manifest_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    publication_release_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("publication_releases.publication_release_id", ondelete="RESTRICT"),
        nullable=False,
    )
    publication_manifest_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("publication_manifests.publication_manifest_id", ondelete="RESTRICT"),
        nullable=False,
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
    ordered_content_block_ids: Mapped[object] = mapped_column(JSONB, nullable=False)
    source_ids: Mapped[object] = mapped_column(JSONB, nullable=False)
    citation_ids: Mapped[object] = mapped_column(JSONB, nullable=False)
    asset_version_ids: Mapped[object] = mapped_column(JSONB, nullable=False)
    release_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        UniqueConstraint("publication_release_id", name="uq_delivery_manifests_release"),
        CheckConstraint("release_fingerprint ~ '^[0-9a-f]{64}$'", name="release_fingerprint_hex"),
        Index("ix_delivery_manifests_version", "content_version_id"),
    )
