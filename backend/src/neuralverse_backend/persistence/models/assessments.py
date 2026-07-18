"""Canonical assessment persistence models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Float,
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


class AssessmentSpecRecord(Base):
    __tablename__ = "assessment_specs"

    assessment_spec_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    version: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False, server_default=text("''"))
    description: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    max_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "assessment_spec_id",
            "version",
            name="uq_assessment_specs_id_version",
        ),
        CheckConstraint(
            "char_length(btrim(version)) > 0",
            name="version_nonempty",
        ),
        CheckConstraint(
            "max_score IS NULL OR max_score > 0",
            name="max_score_positive",
        ),
        Index("ix_assessment_specs_version", "version"),
    )


class AssessmentAttemptRecord(Base):
    __tablename__ = "assessment_attempts"

    assessment_attempt_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    assessment_spec_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("assessment_specs.assessment_spec_id", ondelete="RESTRICT"),
        nullable=False,
    )
    assessment_spec_version: Mapped[str] = mapped_column(String(64), nullable=False)
    learner_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'in_progress'")
    )
    responses: Mapped[object] = mapped_column(JSONB, nullable=True)
    evidence_ids: Mapped[object] = mapped_column(JSONB, nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        ForeignKeyConstraint(
            ["assessment_spec_id", "assessment_spec_version"],
            ["assessment_specs.assessment_spec_id", "assessment_specs.version"],
            ondelete="RESTRICT",
            name="fk_assessment_attempts_exact_spec_version",
        ),
        CheckConstraint(
            "status IN ('in_progress', 'submitted', 'scored', 'failed', 'cancelled')",
            name="status",
        ),
        CheckConstraint(
            "score IS NULL OR score >= 0",
            name="score_nonnegative",
        ),
        Index("ix_assessment_attempts_spec", "assessment_spec_id"),
        Index("ix_assessment_attempts_learner", "learner_id"),
        Index("ix_assessment_attempts_status", "status"),
    )


class AssessmentEvidenceRecord(Base):
    __tablename__ = "assessment_evidence"

    assessment_evidence_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    assessment_attempt_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("assessment_attempts.assessment_attempt_id", ondelete="RESTRICT"),
        nullable=False,
    )
    evidence_type: Mapped[str] = mapped_column(String(64), nullable=False)
    content_hash: Mapped[str] = mapped_column(
        String(128), nullable=False, server_default=text("''")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (Index("ix_assessment_evidence_attempt", "assessment_attempt_id"),)
