from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Index,
    LargeBinary,
    String,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base
from neuralverse_backend.persistence.models.enums import IdempotencyStatus


class IdempotencyRecord(Base):
    __tablename__ = "idempotency_records"

    idempotency_record_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    scope: Mapped[str] = mapped_column(String(128), nullable=False)
    idempotency_key_hash: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    key_hash_key_version: Mapped[str] = mapped_column(String(32), nullable=False)
    request_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    operation_name: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=IdempotencyStatus.IN_PROGRESS.value,
        server_default=text("'IN_PROGRESS'"),
    )
    response_reference_type: Mapped[str | None] = mapped_column(String(32), nullable=True)
    response_reference_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP"
    )
    locked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    failed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attempt_count: Mapped[int] = mapped_column(nullable=False, default=1, server_default=text("1"))
    last_error_code: Mapped[str | None] = mapped_column(String(64), nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "scope",
            "idempotency_key_hash",
            name="uq_idempotency_records_scope_key_hash",
        ),
        CheckConstraint("char_length(btrim(scope)) > 0", name="scope_nonempty"),
        CheckConstraint(
            "octet_length(idempotency_key_hash) = 32",
            name="key_hash_length",
        ),
        CheckConstraint(
            "request_fingerprint ~ '^[0-9a-f]{64}$'",
            name="fingerprint",
        ),
        CheckConstraint(
            "char_length(btrim(key_hash_key_version)) > 0",
            name="key_version_nonempty",
        ),
        CheckConstraint(
            "char_length(btrim(operation_name)) > 0",
            name="operation_nonempty",
        ),
        CheckConstraint(
            "status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED_RETRYABLE', 'FAILED_TERMINAL')",
            name="status",
        ),
        CheckConstraint(
            "response_reference_type IS NULL OR response_reference_type = 'FIXTURE_RECORD'",
            name="response_type",
        ),
        CheckConstraint(
            "attempt_count BETWEEN 1 AND 100",
            name="attempt_count",
        ),
        CheckConstraint(
            "expires_at > created_at",
            name="expiration",
        ),
        CheckConstraint(
            "(status = 'IN_PROGRESS' AND locked_at IS NOT NULL "
            "AND completed_at IS NULL AND failed_at IS NULL "
            "AND response_reference_id IS NULL AND last_error_code IS NULL) OR "
            "(status = 'COMPLETED' AND completed_at IS NOT NULL "
            "AND failed_at IS NULL AND response_reference_type = 'FIXTURE_RECORD' "
            "AND response_reference_id IS NOT NULL AND last_error_code IS NULL) OR "
            "(status IN ('FAILED_RETRYABLE', 'FAILED_TERMINAL') "
            "AND failed_at IS NOT NULL AND completed_at IS NULL "
            "AND response_reference_id IS NULL AND last_error_code IS NOT NULL)",
            name="state_fields",
        ),
        CheckConstraint(
            "locked_at IS NULL OR locked_at >= created_at",
            name="locked_timestamp",
        ),
        CheckConstraint(
            "completed_at IS NULL OR completed_at >= created_at",
            name="completed_timestamp",
        ),
        CheckConstraint(
            "failed_at IS NULL OR failed_at >= created_at",
            name="failed_timestamp",
        ),
        Index(
            "ix_idempotency_records_expiration_status",
            "expires_at",
            "status",
            postgresql_where=text("status IN ('IN_PROGRESS', 'FAILED_RETRYABLE')"),
        ),
        Index("ix_idempotency_records_operation_status", "operation_name", "status"),
    )
