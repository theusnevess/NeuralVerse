"""Canonical authoring persistence models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Uuid,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class GenerationJobRecord(Base):
    __tablename__ = "generation_jobs"

    generation_job_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    target_content_package_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_packages.content_package_id", ondelete="RESTRICT"),
        nullable=False,
    )
    workflow_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'created'")
    )
    revision: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    requested_operation: Mapped[str] = mapped_column(
        Text, nullable=False, server_default=text("''")
    )
    lock_version: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "status IN ("
            "'created', 'waiting_for_inputs', 'inputs_available', "
            "'ready_for_authoring', 'in_progress', 'completed', 'failed', 'cancelled')",
            name="status",
        ),
        CheckConstraint("revision >= 0", name="revision_nonnegative"),
        CheckConstraint("lock_version >= 0", name="lock_version_nonnegative"),
        Index("ix_generation_jobs_package", "target_content_package_id"),
        Index("ix_generation_jobs_status", "status"),
    )


class AgentRunRecord(Base):
    __tablename__ = "agent_runs"

    agent_run_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    generation_job_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("generation_jobs.generation_job_id", ondelete="RESTRICT"),
        nullable=False,
    )
    agent_identity: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'created'")
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    input_references: Mapped[object] = mapped_column(JSONB, nullable=True)
    output_references: Mapped[object] = mapped_column(JSONB, nullable=True)
    execution_metadata: Mapped[object] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "status IN ('created', 'running', 'completed', 'failed', 'cancelled')",
            name="status",
        ),
        CheckConstraint(
            "char_length(btrim(agent_identity)) > 0",
            name="agent_identity_nonempty",
        ),
        Index("ix_agent_runs_job", "generation_job_id"),
    )


class AgentContributionRecord(Base):
    __tablename__ = "agent_contributions"

    agent_contribution_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    generation_job_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("generation_jobs.generation_job_id", ondelete="RESTRICT"),
        nullable=False,
    )
    agent_run_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("agent_runs.agent_run_id", ondelete="RESTRICT"),
        nullable=False,
    )
    content_package_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_packages.content_package_id", ondelete="RESTRICT"),
        nullable=False,
    )
    canonical_input_reference: Mapped[str] = mapped_column(
        String(512), nullable=False, server_default=text("''")
    )
    dependency_references: Mapped[object] = mapped_column(JSONB, nullable=True)
    structural_contribution_payload: Mapped[object] = mapped_column(JSONB, nullable=True)
    opaque_semantic_payload: Mapped[object] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'proposed'")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "status IN ('proposed', 'accepted', 'rejected', 'validation_pending')",
            name="status",
        ),
        Index("ix_agent_contributions_job", "generation_job_id"),
        Index("ix_agent_contributions_run", "agent_run_id"),
        Index("ix_agent_contributions_package", "content_package_id"),
    )


class DomainValidationResultRecord(Base):
    __tablename__ = "domain_validation_results"

    validation_result_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    generation_job_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("generation_jobs.generation_job_id", ondelete="RESTRICT"),
        nullable=True,
    )
    agent_contribution_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("agent_contributions.agent_contribution_id", ondelete="RESTRICT"),
        nullable=True,
    )
    validator_id: Mapped[str] = mapped_column(String(255), nullable=False)
    result: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(16), nullable=False)
    is_blocking: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    findings: Mapped[object] = mapped_column(JSONB, nullable=True)
    evidence_reference: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    affected_target: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "severity IN ('error', 'warning', 'info')",
            name="severity",
        ),
        Index("ix_domain_validation_results_job", "generation_job_id"),
        Index("ix_domain_validation_results_contribution", "agent_contribution_id"),
    )
