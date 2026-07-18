"""BIP-M4 durable workflow projections and command idempotency."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b52000000001"
down_revision: str | Sequence[str] | None = "b51000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_JSON = postgresql.JSONB(astext_type=sa.Text())


def upgrade() -> None:
    op.create_table(
        "bip_m4_workflow_executions",
        sa.Column("workflow_execution_id", sa.String(255), nullable=False),
        sa.Column("temporal_workflow_id", sa.String(255), nullable=False),
        sa.Column("temporal_run_id", sa.String(255), nullable=True),
        sa.Column("workflow_type", sa.String(128), nullable=False),
        sa.Column("workflow_version", sa.String(64), nullable=False),
        sa.Column("task_queue", sa.String(255), nullable=False),
        sa.Column("namespace", sa.String(255), nullable=False),
        sa.Column("package_id", sa.String(256), nullable=False),
        sa.Column("generation_job_id", sa.String(255), nullable=False),
        sa.Column("command_id", sa.String(255), nullable=False),
        sa.Column("idempotency_key", sa.String(512), nullable=False),
        sa.Column("request_id", sa.String(255), nullable=False),
        sa.Column("correlation_id", sa.String(255), nullable=True),
        sa.Column("status", sa.String(48), nullable=False),
        sa.Column("projection_version", sa.Integer(), server_default=sa.text("1"), nullable=False),
        sa.Column("state", _JSON, server_default=sa.text("'{}'"), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("workflow_execution_id", name="pk_bip_m4_workflow_execution"),
        sa.UniqueConstraint("temporal_workflow_id", name="uq_bip_m4_workflow_executions_temporal_workflow_id"),
        sa.UniqueConstraint("generation_job_id", name="uq_bip_m4_workflow_executions_generation_job_id"),
        sa.UniqueConstraint("command_id", name="uq_bip_m4_workflow_executions_command_id"),
        sa.UniqueConstraint("idempotency_key", name="uq_bip_m4_workflow_executions_idempotency_key"),
    )
    op.create_index("ix_bip_m4_workflow_status", "bip_m4_workflow_executions", ["status"])
    op.create_index("ix_bip_m4_workflow_package", "bip_m4_workflow_executions", ["package_id"])

    op.create_table(
        "bip_m4_generation_jobs",
        sa.Column("generation_job_id", sa.String(255), nullable=False),
        sa.Column("workflow_execution_id", sa.String(255), nullable=False),
        sa.Column("package_id", sa.String(256), nullable=False),
        sa.Column("command_id", sa.String(255), nullable=False),
        sa.Column("requested_by", sa.String(255), nullable=False),
        sa.Column("requested_target", sa.String(512), nullable=False),
        sa.Column("status", sa.String(48), nullable=False),
        sa.Column("revision", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("max_revisions", sa.Integer(), server_default=sa.text("2"), nullable=False),
        sa.Column("publication_status", sa.String(48), nullable=False),
        sa.Column("attempt_summary", _JSON, server_default=sa.text("'{}'"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("generation_job_id", name="pk_bip_m4_generation_job"),
        sa.UniqueConstraint("command_id", name="uq_bip_m4_generation_jobs_command_id"),
    )
    op.create_index("ix_bip_m4_generation_status", "bip_m4_generation_jobs", ["status"])

    op.create_table(
        "bip_m4_commands",
        sa.Column("command_record_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("operation_type", sa.String(64), nullable=False),
        sa.Column("command_id", sa.String(255), nullable=False),
        sa.Column("idempotency_key", sa.String(512), nullable=False),
        sa.Column("command_fingerprint", sa.String(64), nullable=False),
        sa.Column("workflow_execution_id", sa.String(255), nullable=False),
        sa.Column("generation_job_id", sa.String(255), nullable=False),
        sa.Column("response_snapshot", _JSON, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("command_record_id", name="pk_bip_m4_command"),
        sa.UniqueConstraint("operation_type", "idempotency_key", name="uq_bip_m4_command_operation_key"),
        sa.UniqueConstraint("command_id", name="uq_bip_m4_command_id"),
    )

    op.create_table(
        "bip_m4_progress_projections",
        sa.Column("workflow_execution_id", sa.String(255), nullable=False),
        sa.Column("generation_job_id", sa.String(255), nullable=False),
        sa.Column("state", sa.String(48), nullable=False),
        sa.Column("current_stage", sa.String(96), nullable=False),
        sa.Column("revision", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("review_wait_id", sa.String(255), nullable=True),
        sa.Column("publication_wait_id", sa.String(255), nullable=True),
        sa.Column("release_id", sa.String(255), nullable=True),
        sa.Column("projection_version", sa.Integer(), server_default=sa.text("1"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("workflow_execution_id", name="pk_bip_m4_progress"),
    )

    op.create_table(
        "bip_m4_workflow_audit_events",
        sa.Column("audit_event_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("workflow_execution_id", sa.String(255), nullable=False),
        sa.Column("generation_job_id", sa.String(255), nullable=False),
        sa.Column("command_id", sa.String(255), nullable=False),
        sa.Column("sequence", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(96), nullable=False),
        sa.Column("details", _JSON, server_default=sa.text("'{}'"), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("audit_event_id", name="pk_bip_m4_audit"),
        sa.UniqueConstraint("workflow_execution_id", "sequence", name="uq_bip_m4_audit_sequence"),
    )
    op.create_index("ix_bip_m4_audit_workflow", "bip_m4_workflow_audit_events", ["workflow_execution_id", "occurred_at"])

    op.create_table(
        "bip_m4_review_waits",
        sa.Column("review_wait_id", sa.String(255), nullable=False),
        sa.Column("workflow_execution_id", sa.String(255), nullable=False),
        sa.Column("generation_job_id", sa.String(255), nullable=False),
        sa.Column("status", sa.String(32), server_default=sa.text("'WAITING'"), nullable=False),
        sa.Column("requested_revision", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("requested_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_by", sa.String(255), nullable=True),
        sa.Column("decision", sa.String(32), nullable=True),
        sa.PrimaryKeyConstraint("review_wait_id", name="pk_bip_m4_review_wait"),
    )

    op.create_table(
        "bip_m4_revision_loops",
        sa.Column("workflow_execution_id", sa.String(255), nullable=False),
        sa.Column("generation_job_id", sa.String(255), nullable=False),
        sa.Column("current_revision", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("maximum_revisions", sa.Integer(), nullable=False),
        sa.Column("lineage", _JSON, server_default=sa.text("'[]'"), nullable=False),
        sa.Column("exhausted", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("workflow_execution_id", name="pk_bip_m4_revision_loop"),
    )

    op.create_table(
        "bip_m4_publication_waits",
        sa.Column("publication_wait_id", sa.String(255), nullable=False),
        sa.Column("workflow_execution_id", sa.String(255), nullable=False),
        sa.Column("generation_job_id", sa.String(255), nullable=False),
        sa.Column("content_version_id", sa.String(255), nullable=True),
        sa.Column("status", sa.String(48), server_default=sa.text("'WAITING'"), nullable=False),
        sa.Column("readiness_snapshot", _JSON, server_default=sa.text("'{}'"), nullable=False),
        sa.Column("idempotency_key", sa.String(512), nullable=False),
        sa.Column("release_id", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("publication_wait_id", name="pk_bip_m4_publication_wait"),
        sa.UniqueConstraint("idempotency_key", name="uq_bip_m4_publication_waits_idempotency_key"),
    )


def downgrade() -> None:
    op.drop_table("bip_m4_publication_waits")
    op.drop_table("bip_m4_revision_loops")
    op.drop_table("bip_m4_review_waits")
    op.drop_index("ix_bip_m4_audit_workflow", table_name="bip_m4_workflow_audit_events")
    op.drop_table("bip_m4_workflow_audit_events")
    op.drop_table("bip_m4_progress_projections")
    op.drop_table("bip_m4_commands")
    op.drop_index("ix_bip_m4_generation_status", table_name="bip_m4_generation_jobs")
    op.drop_table("bip_m4_generation_jobs")
    op.drop_index("ix_bip_m4_workflow_package", table_name="bip_m4_workflow_executions")
    op.drop_index("ix_bip_m4_workflow_status", table_name="bip_m4_workflow_executions")
    op.drop_table("bip_m4_workflow_executions")
