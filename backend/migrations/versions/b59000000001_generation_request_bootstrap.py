"""Persist the bounded internal BIP generation request bootstrap."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b59000000001"
down_revision: str | Sequence[str] | None = "b58000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "bip_m4_generation_requests",
        sa.Column("generation_request_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("generation_job_id", sa.String(255), nullable=False),
        sa.Column("request_version", sa.String(32), nullable=False),
        sa.Column("request_fingerprint", sa.String(64), nullable=False),
        sa.Column("raw_json_bytes", sa.LargeBinary(), nullable=False),
        sa.Column("semantic_payload", postgresql.JSONB(), nullable=False),
        sa.Column("curriculum_node_id", sa.String(512), nullable=False),
        sa.Column("requested_package_type", sa.String(128), nullable=False),
        sa.Column("workflow_policy_version", sa.String(32), nullable=False),
        sa.Column("activity_policy_version", sa.String(32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("generation_request_id"),
        sa.UniqueConstraint("generation_job_id"),
        sa.UniqueConstraint("request_fingerprint"),
    )
    op.create_index(
        "ix_bip_m4_generation_request_job",
        "bip_m4_generation_requests",
        ["generation_job_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_bip_m4_generation_request_job", table_name="bip_m4_generation_requests")
    op.drop_table("bip_m4_generation_requests")
