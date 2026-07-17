from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Index, String, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class OperationalAuditEvent(Base):
    __tablename__ = "operational_audit_events"

    audit_event_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_type: Mapped[str] = mapped_column(String(48), nullable=False)
    actor_type: Mapped[str] = mapped_column(String(32), nullable=False)
    actor_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    subject_type: Mapped[str] = mapped_column(String(32), nullable=False)
    subject_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    operation: Mapped[str] = mapped_column(String(64), nullable=False)
    outcome: Mapped[str] = mapped_column(String(32), nullable=False)
    correlation_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    request_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP"
    )
    audit_metadata: Mapped[object] = mapped_column("metadata", JSONB, nullable=False)

    __table_args__ = (
        CheckConstraint(
            "event_type IN ("
            "'FIXTURE_INGESTION_ACCEPTED', 'FIXTURE_INGESTION_REJECTED', "
            "'IDEMPOTENCY_REPLAYED', 'IDEMPOTENCY_CONFLICT', "
            "'FIXTURE_SUPERSEDED')",
            name="event_type",
        ),
        CheckConstraint(
            "actor_type IN ('SYSTEM_FIXTURE_ADAPTER', 'SYSTEM_IDEMPOTENCY')",
            name="actor_type",
        ),
        CheckConstraint(
            "subject_type IN ('FIXTURE_RECORD', 'IDEMPOTENCY_RECORD')",
            name="subject_type",
        ),
        CheckConstraint(
            "outcome IN ('ACCEPTED', 'REJECTED', 'REPLAYED', 'CONFLICT', 'SUPERSEDED')",
            name="outcome",
        ),
        CheckConstraint(
            "char_length(btrim(operation)) > 0",
            name="operation_nonempty",
        ),
        CheckConstraint(
            "jsonb_typeof(metadata) = 'object' AND octet_length(metadata::text) <= 16384",
            name="metadata_bounds",
        ),
        CheckConstraint(
            "occurred_at <= recorded_at",
            name="timestamp_order",
        ),
        Index(
            "ix_operational_audit_events_subject",
            "subject_type",
            "subject_id",
        ),
        Index("ix_operational_audit_events_correlation_id", "correlation_id"),
        Index("ix_operational_audit_events_recorded_at", "recorded_at"),
    )
