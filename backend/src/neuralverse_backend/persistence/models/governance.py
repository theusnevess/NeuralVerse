"""Canonical governance persistence models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    Uuid,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class GovernanceReviewRecord(Base):
    __tablename__ = "governance_reviews"

    governance_review_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    target_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        nullable=False,
    )
    review_authority: Mapped[str] = mapped_column(String(255), nullable=False)
    decision: Mapped[str] = mapped_column(String(32), nullable=False)
    findings: Mapped[object] = mapped_column(JSONB, nullable=True)
    evidence_references: Mapped[object] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "decision IN ('approved', 'rejected', 'revision_required')",
            name="decision",
        ),
        CheckConstraint(
            "char_length(btrim(review_authority)) > 0",
            name="review_authority_nonempty",
        ),
        Index("ix_governance_reviews_target", "target_version_id"),
    )


class RevisionDirectiveRecord(Base):
    __tablename__ = "revision_directives"

    revision_directive_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    governance_review_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("governance_reviews.governance_review_id", ondelete="RESTRICT"),
        nullable=False,
    )
    source_content_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        nullable=False,
    )
    target_content_package_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_packages.content_package_id", ondelete="RESTRICT"),
        nullable=False,
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    required_changes: Mapped[object] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'pending'")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'accepted', 'completed', 'cancelled')",
            name="status",
        ),
        Index("ix_revision_directives_review", "governance_review_id"),
        Index("ix_revision_directives_source_version", "source_content_version_id"),
        Index("ix_revision_directives_target_package", "target_content_package_id"),
    )
