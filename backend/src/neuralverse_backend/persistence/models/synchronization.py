"""Canonical synchronization persistence models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Index,
    Integer,
    String,
    Text,
    Uuid,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class SynchronizationRecordRecord(Base):
    __tablename__ = "synchronization_records"

    synchronization_record_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_system: Mapped[str] = mapped_column(String(128), nullable=False)
    target_system: Mapped[str] = mapped_column(String(128), nullable=False)
    domain_object_id: Mapped[str] = mapped_column(String(512), nullable=False)
    domain_object_version: Mapped[str] = mapped_column(String(128), nullable=False)
    direction: Mapped[str] = mapped_column(String(16), nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'pending'")
    )
    attempt_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    content_fingerprint: Mapped[str] = mapped_column(
        String(128), nullable=False, server_default=text("''")
    )
    failure_summary: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "direction IN ('push', 'pull')",
            name="direction",
        ),
        CheckConstraint(
            "status IN ('pending', 'in_progress', 'completed', 'failed')",
            name="status",
        ),
        CheckConstraint("attempt_count >= 0", name="attempt_count_nonnegative"),
        CheckConstraint(
            "char_length(failure_summary) <= 4096",
            name="failure_summary_bounded",
        ),
        Index("ix_synchronization_records_status", "status"),
        Index(
            "ix_synchronization_records_domain",
            "domain_object_id",
            "domain_object_version",
        ),
        Index("ix_synchronization_records_source", "source_system"),
    )
