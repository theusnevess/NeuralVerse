"""BIP-M4 operational projections; Temporal remains the workflow history."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Index, Integer, String, UniqueConstraint, Uuid, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class BIPM4WorkflowExecutionRecord(Base):
    __tablename__ = "bip_m4_workflow_executions"

    workflow_execution_id: Mapped[str] = mapped_column(String(255), primary_key=True)
    temporal_workflow_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    temporal_run_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    workflow_type: Mapped[str] = mapped_column(String(128), nullable=False)
    workflow_version: Mapped[str] = mapped_column(String(64), nullable=False)
    task_queue: Mapped[str] = mapped_column(String(255), nullable=False)
    namespace: Mapped[str] = mapped_column(String(255), nullable=False)
    package_id: Mapped[str] = mapped_column(String(256), nullable=False)
    generation_job_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    command_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(512), unique=True, nullable=False)
    request_id: Mapped[str] = mapped_column(String(255), nullable=False)
    correlation_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(48), nullable=False)
    projection_version: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default=text("1")
    )
    state: Mapped[object] = mapped_column(JSONB, nullable=False, server_default=text("'{}'"))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    failed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("ix_bip_m4_workflow_status", "status"),
        Index("ix_bip_m4_workflow_package", "package_id"),
    )


class BIPM4GenerationJobRecord(Base):
    __tablename__ = "bip_m4_generation_jobs"

    generation_job_id: Mapped[str] = mapped_column(String(255), primary_key=True)
    workflow_execution_id: Mapped[str] = mapped_column(String(255), nullable=False)
    package_id: Mapped[str] = mapped_column(String(256), nullable=False)
    command_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    requested_by: Mapped[str] = mapped_column(String(255), nullable=False)
    requested_target: Mapped[str] = mapped_column(String(512), nullable=False)
    status: Mapped[str] = mapped_column(String(48), nullable=False)
    revision: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    max_revisions: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("2"))
    publication_status: Mapped[str] = mapped_column(String(48), nullable=False)
    attempt_summary: Mapped[object] = mapped_column(
        JSONB, nullable=False, server_default=text("'{}'")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (Index("ix_bip_m4_generation_status", "status"),)


class BIPM4CommandRecord(Base):
    __tablename__ = "bip_m4_commands"

    command_record_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    operation_type: Mapped[str] = mapped_column(String(64), nullable=False)
    command_id: Mapped[str] = mapped_column(String(255), nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(512), nullable=False)
    command_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    workflow_execution_id: Mapped[str] = mapped_column(String(255), nullable=False)
    generation_job_id: Mapped[str] = mapped_column(String(255), nullable=False)
    response_snapshot: Mapped[object] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "operation_type", "idempotency_key", name="uq_bip_m4_command_operation_key"
        ),
        UniqueConstraint("command_id", name="uq_bip_m4_command_id"),
    )


class BIPM4ProgressProjectionRecord(Base):
    __tablename__ = "bip_m4_progress_projections"

    workflow_execution_id: Mapped[str] = mapped_column(String(255), primary_key=True)
    generation_job_id: Mapped[str] = mapped_column(String(255), nullable=False)
    state: Mapped[str] = mapped_column(String(48), nullable=False)
    current_stage: Mapped[str] = mapped_column(String(96), nullable=False)
    revision: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    review_wait_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    publication_wait_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    release_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    projection_version: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default=text("1")
    )
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class BIPM4AuditEventRecord(Base):
    __tablename__ = "bip_m4_workflow_audit_events"

    audit_event_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    workflow_execution_id: Mapped[str] = mapped_column(String(255), nullable=False)
    generation_job_id: Mapped[str] = mapped_column(String(255), nullable=False)
    command_id: Mapped[str] = mapped_column(String(255), nullable=False)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    event_type: Mapped[str] = mapped_column(String(96), nullable=False)
    details: Mapped[object] = mapped_column(JSONB, nullable=False, server_default=text("'{}'"))
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        UniqueConstraint("workflow_execution_id", "sequence", name="uq_bip_m4_audit_sequence"),
        Index("ix_bip_m4_audit_workflow", "workflow_execution_id", "occurred_at"),
    )


class BIPM4ReviewWaitRecord(Base):
    __tablename__ = "bip_m4_review_waits"

    review_wait_id: Mapped[str] = mapped_column(String(255), primary_key=True)
    workflow_execution_id: Mapped[str] = mapped_column(String(255), nullable=False)
    generation_job_id: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'WAITING'")
    )
    requested_revision: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default=text("0")
    )
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    decision: Mapped[str | None] = mapped_column(String(32), nullable=True)


class BIPM4RevisionLoopRecord(Base):
    __tablename__ = "bip_m4_revision_loops"

    workflow_execution_id: Mapped[str] = mapped_column(String(255), primary_key=True)
    generation_job_id: Mapped[str] = mapped_column(String(255), nullable=False)
    current_revision: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    maximum_revisions: Mapped[int] = mapped_column(Integer, nullable=False)
    lineage: Mapped[object] = mapped_column(JSONB, nullable=False, server_default=text("'[]'"))
    exhausted: Mapped[bool] = mapped_column(nullable=False, server_default=text("false"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class BIPM4PublicationWaitRecord(Base):
    __tablename__ = "bip_m4_publication_waits"

    publication_wait_id: Mapped[str] = mapped_column(String(255), primary_key=True)
    workflow_execution_id: Mapped[str] = mapped_column(String(255), nullable=False)
    generation_job_id: Mapped[str] = mapped_column(String(255), nullable=False)
    content_version_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(48), nullable=False, server_default=text("'WAITING'")
    )
    readiness_snapshot: Mapped[object] = mapped_column(
        JSONB, nullable=False, server_default=text("'{}'")
    )
    idempotency_key: Mapped[str] = mapped_column(String(512), unique=True, nullable=False)
    release_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
