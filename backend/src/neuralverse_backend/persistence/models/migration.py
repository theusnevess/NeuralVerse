"""Persistence for audited legacy-to-canonical schema reconciliation."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Index, String, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class MigrationReconciliationAuditRecord(Base):
    __tablename__ = "migration_reconciliation_audits"

    reconciliation_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_revision: Mapped[str] = mapped_column(String(32), nullable=False)
    source_schema_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    canonical_schema_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    bridge_plan_id: Mapped[str] = mapped_column(String(96), nullable=False)
    plan_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    result_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    operator_identity: Mapped[str] = mapped_column(String(255), nullable=False)
    tool_version: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    details: Mapped[object] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "status IN ('RECONCILED', 'REJECTED')",
            name="status",
        ),
        Index("ix_migration_reconciliation_source", "source_revision"),
        Index("ix_migration_reconciliation_created", "created_at"),
    )
