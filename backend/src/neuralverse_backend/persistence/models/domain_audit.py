"""Canonical domain audit persistence models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Index,
    String,
    Uuid,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class DomainAuditEventRecord(Base):
    __tablename__ = "domain_audit_events"

    domain_audit_event_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    actor_identity: Mapped[str] = mapped_column(String(255), nullable=False)
    aggregate_type: Mapped[str] = mapped_column(String(64), nullable=False)
    aggregate_id: Mapped[str] = mapped_column(String(255), nullable=False)
    version_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    operation: Mapped[str] = mapped_column(String(64), nullable=False)
    metadata_json: Mapped[object] = mapped_column(JSONB, nullable=True)
    correlation_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "char_length(btrim(actor_identity)) > 0",
            name="actor_identity_nonempty",
        ),
        CheckConstraint(
            "char_length(btrim(aggregate_type)) > 0",
            name="aggregate_type_nonempty",
        ),
        CheckConstraint(
            "char_length(btrim(aggregate_id)) > 0",
            name="aggregate_id_nonempty",
        ),
        CheckConstraint(
            "char_length(btrim(operation)) > 0",
            name="operation_nonempty",
        ),
        CheckConstraint(
            "occurred_at <= recorded_at",
            name="timestamp_order",
        ),
        Index("ix_domain_audit_events_aggregate", "aggregate_type", "aggregate_id"),
        Index("ix_domain_audit_events_correlation", "correlation_id"),
        Index("ix_domain_audit_events_occurred", "occurred_at"),
    )
