"""Add durable NV-XFI workflow checkpoints and command idempotency."""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "b42000000001"
down_revision: str | Sequence[str] | None = "b41000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "cross_front_workflow_executions",
        sa.Column("execution_id", sa.String(length=255), nullable=False),
        sa.Column("command_id", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("envelope", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("checkpoint", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("attempts", sa.Integer(), server_default=sa.text("1"), nullable=False),
        sa.Column("result", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("char_length(btrim(execution_id)) > 0", name="execution_id_nonempty"),
        sa.CheckConstraint("char_length(btrim(command_id)) > 0", name="command_id_nonempty"),
        sa.CheckConstraint("status IN ('ACCEPTED', 'RETRYABLE', 'REJECTED', 'CANCELLED', 'COMPLETED', 'SUPERSEDED')", name="status"),
        sa.CheckConstraint("attempts BETWEEN 1 AND 100", name="attempts"),
        sa.PrimaryKeyConstraint("execution_id", name="pk_cross_front_workflow_executions"),
        sa.UniqueConstraint("command_id", name="uq_cross_front_workflow_command"),
    )
    op.create_index(
        "ix_cross_front_workflow_status",
        "cross_front_workflow_executions",
        ["status"],
    )
    op.create_index(
        "ix_cross_front_workflow_updated_at",
        "cross_front_workflow_executions",
        ["updated_at"],
    )
    op.create_table(
        "cross_front_workflow_queue",
        sa.Column("command_id", sa.String(length=255), nullable=False),
        sa.Column("envelope", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("claimed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=16), server_default=sa.text("'QUEUED'"), nullable=False),
        sa.Column("attempts", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.CheckConstraint("status IN ('QUEUED', 'CLAIMED', 'COMPLETED')", name="status"),
        sa.CheckConstraint("attempts BETWEEN 0 AND 100", name="attempts"),
        sa.PrimaryKeyConstraint("command_id", name="pk_cross_front_workflow_queue"),
    )
    op.create_index(
        "ix_cross_front_workflow_queue_status_occurred",
        "cross_front_workflow_queue",
        ["status", "occurred_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_cross_front_workflow_queue_status_occurred",
        table_name="cross_front_workflow_queue",
    )
    op.drop_table("cross_front_workflow_queue")
    op.drop_index("ix_cross_front_workflow_updated_at", table_name="cross_front_workflow_executions")
    op.drop_index("ix_cross_front_workflow_status", table_name="cross_front_workflow_executions")
    op.drop_table("cross_front_workflow_executions")
