"""Canonical laboratory persistence models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class LaboratorySpecRecord(Base):
    __tablename__ = "laboratory_specs"

    laboratory_spec_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    version: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False, server_default=text("''"))
    description: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "char_length(btrim(version)) > 0",
            name="version_nonempty",
        ),
        UniqueConstraint(
            "laboratory_spec_id",
            "version",
            name="uq_laboratory_specs_id_version",
        ),
        Index("ix_laboratory_specs_version", "version"),
    )


class LaboratoryRunRecord(Base):
    __tablename__ = "laboratory_runs"

    laboratory_run_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    laboratory_spec_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("laboratory_specs.laboratory_spec_id", ondelete="RESTRICT"),
        nullable=False,
    )
    laboratory_spec_version: Mapped[str] = mapped_column(String(64), nullable=False)
    learner_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'pending'")
    )
    inputs: Mapped[object] = mapped_column(JSONB, nullable=True)
    outputs: Mapped[object] = mapped_column(JSONB, nullable=True)
    evidence_ids: Mapped[object] = mapped_column(JSONB, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        ForeignKeyConstraint(
            ["laboratory_spec_id", "laboratory_spec_version"],
            ["laboratory_specs.laboratory_spec_id", "laboratory_specs.version"],
            ondelete="RESTRICT",
            name="fk_laboratory_runs_exact_spec_version",
        ),
        CheckConstraint(
            "status IN ('pending', 'running', 'completed', 'failed', 'cancelled')",
            name="status",
        ),
        Index("ix_laboratory_runs_spec", "laboratory_spec_id"),
        Index("ix_laboratory_runs_learner", "learner_id"),
        Index("ix_laboratory_runs_status", "status"),
    )


class LaboratoryEvidenceRecord(Base):
    __tablename__ = "laboratory_evidence"

    laboratory_evidence_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    laboratory_run_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("laboratory_runs.laboratory_run_id", ondelete="RESTRICT"),
        nullable=False,
    )
    evidence_type: Mapped[str] = mapped_column(String(64), nullable=False)
    content_hash: Mapped[str] = mapped_column(
        String(128), nullable=False, server_default=text("''")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (Index("ix_laboratory_evidence_run", "laboratory_run_id"),)
