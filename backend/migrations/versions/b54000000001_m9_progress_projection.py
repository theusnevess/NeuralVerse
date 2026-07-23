"""Complete the durable M9 progress projection and replay stream."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b54000000001"
down_revision: str | Sequence[str] | None = "b53000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_JSON = postgresql.JSONB(astext_type=sa.Text())


def upgrade() -> None:
    columns = (
        sa.Column("workflow_id", sa.String(255), server_default=sa.text("''"), nullable=False),
        sa.Column("workflow_run_id", sa.String(255), nullable=True),
        sa.Column("workflow_type", sa.String(128), server_default=sa.text("''"), nullable=False),
        sa.Column("workflow_version", sa.String(64), server_default=sa.text("''"), nullable=False),
        sa.Column("progress_sequence", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("completed_stages", _JSON, server_default=sa.text("'[]'"), nullable=False),
        sa.Column("active_stages", _JSON, server_default=sa.text("'[]'"), nullable=False),
        sa.Column("pending_human_action", sa.String(96), nullable=True),
        sa.Column("maximum_revision_cycles", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("latest_artifact_references", _JSON, server_default=sa.text("'[]'"), nullable=False),
        sa.Column("latest_validation_summary", _JSON, server_default=sa.text("'{}'"), nullable=False),
        sa.Column("latest_governance_summary", _JSON, server_default=sa.text("'{}'"), nullable=False),
        sa.Column("failure_code", sa.String(96), nullable=True),
        sa.Column("failure_retryable", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    for column in columns:
        op.add_column("bip_m4_progress_projections", column)
    op.create_table(
        "bip_m4_workflow_progress_events",
        sa.Column("workflow_progress_event_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("generation_job_id", sa.String(255), nullable=False),
        sa.Column("workflow_id", sa.String(255), nullable=False),
        sa.Column("workflow_run_id", sa.String(255), nullable=True),
        sa.Column("sequence", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(96), nullable=False),
        sa.Column("workflow_state", sa.String(48), nullable=False),
        sa.Column("workflow_stage", sa.String(96), nullable=False),
        sa.Column("activity_name", sa.String(128), nullable=True),
        sa.Column("revision_cycle", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("artifact_references", _JSON, server_default=sa.text("'[]'"), nullable=False),
        sa.Column("metadata", _JSON, server_default=sa.text("'{}'"), nullable=False),
        sa.Column("correlation_id", sa.String(255), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("workflow_progress_event_id"),
        sa.UniqueConstraint("generation_job_id", "sequence", name="uq_bip_m4_progress_event_sequence"),
    )
    op.create_index(
        "ix_bip_m4_progress_event_job",
        "bip_m4_workflow_progress_events",
        ["generation_job_id", "sequence"],
    )


def downgrade() -> None:
    op.drop_index("ix_bip_m4_progress_event_job", table_name="bip_m4_workflow_progress_events")
    op.drop_table("bip_m4_workflow_progress_events")
    for name in (
        "completed_at", "started_at", "failure_retryable", "failure_code",
        "latest_governance_summary", "latest_validation_summary", "latest_artifact_references",
        "maximum_revision_cycles", "pending_human_action", "active_stages", "completed_stages",
        "progress_sequence", "workflow_version", "workflow_type", "workflow_run_id", "workflow_id",
    ):
        op.drop_column("bip_m4_progress_projections", name)
