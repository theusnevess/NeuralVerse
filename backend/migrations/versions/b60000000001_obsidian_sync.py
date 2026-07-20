"""Add durable governed Obsidian synchronization records.

Revision ID: b60000000001
Revises: b57000000001
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "b60000000001"
down_revision = "b57000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "obsidian_sync_plans",
        sa.Column("plan_id", sa.String(128), primary_key=True),
        sa.Column("vault_id", sa.String(128), nullable=False),
        sa.Column("direction", sa.String(64), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("plan_hash", sa.String(128), nullable=False),
        sa.Column("source_fingerprint", sa.String(128), nullable=False),
        sa.Column("vault_fingerprint", sa.String(128), nullable=False),
        sa.Column("scope_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("policy_snapshot_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("conflicts_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("link_deltas_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("approved_at", sa.DateTime(timezone=True)),
        sa.Column("approved_by", sa.String(256)),
        sa.CheckConstraint(
            "status IN ('dry_run','awaiting_approval','approved','rejected',"
            "'in_progress','partially_applied','completed','rolled_back','failed')",
            name="ck_obsidian_sync_plan_status",
        ),
    )
    op.create_table(
        "obsidian_sync_operations",
        sa.Column("operation_id", sa.String(128), primary_key=True),
        sa.Column(
            "plan_id",
            sa.String(128),
            sa.ForeignKey("obsidian_sync_plans.plan_id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("identity_key", sa.String(512), nullable=False),
        sa.Column("operation_kind", sa.String(32), nullable=False),
        sa.Column("relative_path", sa.String(1024), nullable=False),
        sa.Column("target_path", sa.String(1024)),
        sa.Column("expected_hash", sa.String(128)),
        sa.Column("applied_hash", sa.String(128)),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("failure_summary", sa.String(4096), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("plan_id", "identity_key", name="uq_obsidian_sync_operation_identity"),
    )
    op.create_table(
        "obsidian_sync_baselines",
        sa.Column("identity_key", sa.String(512), primary_key=True),
        sa.Column("vault_id", sa.String(128), nullable=False),
        sa.Column("relative_path", sa.String(1024), nullable=False),
        sa.Column("source_hash", sa.String(128), nullable=False),
        sa.Column("frontmatter_hash", sa.String(128), nullable=False),
        sa.Column("managed_hash", sa.String(128), nullable=False),
        sa.Column("full_hash", sa.String(128), nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint(
            "vault_id", "relative_path", name="uq_obsidian_sync_baseline_vault_path"
        ),
    )
    op.create_table(
        "obsidian_editorial_proposals",
        sa.Column("proposal_id", sa.String(128), primary_key=True),
        sa.Column("identity_key", sa.String(512), nullable=False),
        sa.Column("relative_path", sa.String(1024), nullable=False),
        sa.Column("base_hash", sa.String(128), nullable=False),
        sa.Column("vault_hash", sa.String(128), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="pending_review"),
        sa.Column("diff_text", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True)),
        sa.Column("reviewed_by", sa.String(256)),
        sa.UniqueConstraint(
            "identity_key", "vault_hash", name="uq_obsidian_editorial_proposal_revision"
        ),
    )
    op.create_table(
        "obsidian_sync_audit_events",
        sa.Column("event_id", sa.String(128), primary_key=True),
        sa.Column("plan_id", sa.String(128), nullable=False),
        sa.Column("event_type", sa.String(64), nullable=False),
        sa.Column("actor", sa.String(256), nullable=False),
        sa.Column("operation_id", sa.String(128)),
        sa.Column("payload_json", sa.JSON, nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_obsidian_sync_operations_plan", "obsidian_sync_operations", ["plan_id"])
    op.create_index(
        "ix_obsidian_sync_audit_plan", "obsidian_sync_audit_events", ["plan_id", "occurred_at"]
    )


def downgrade() -> None:
    op.drop_index("ix_obsidian_sync_audit_plan", table_name="obsidian_sync_audit_events")
    op.drop_index("ix_obsidian_sync_operations_plan", table_name="obsidian_sync_operations")
    op.drop_table("obsidian_sync_audit_events")
    op.drop_table("obsidian_editorial_proposals")
    op.drop_table("obsidian_sync_baselines")
    op.drop_table("obsidian_sync_operations")
    op.drop_table("obsidian_sync_plans")
