from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, LargeBinary, String, Uuid, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class CanonicalIntakeIdempotencyRecord(Base):
    __tablename__ = "canonical_intake_idempotency"

    idempotency_record_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    idempotency_key_hash: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    operation: Mapped[str] = mapped_column(String(64), nullable=False)
    request_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    canonical_input_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("canonical_input_records.canonical_input_id"), nullable=False
    )
    authoring_job_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("authoring_jobs.authoring_job_id"), nullable=False
    )
    response_snapshot: Mapped[object] = mapped_column(JSONB, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'COMPLETED'")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("uq_canonical_intake_idempotency_key", "idempotency_key_hash", unique=True),
        CheckConstraint("octet_length(idempotency_key_hash) = 32", name="key_hash_length"),
        CheckConstraint("request_hash ~ '^[0-9a-f]{64}$'", name="request_hash"),
        CheckConstraint("status IN ('COMPLETED', 'FAILED')", name="status"),
    )
