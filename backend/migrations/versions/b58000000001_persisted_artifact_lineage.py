"""Persist workflow ownership and dependency lineage for canonical artifacts."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b58000000001"
down_revision: str | Sequence[str] | None = ("b56000000001", "b57000000001")
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "canonical_input_records", sa.Column("generation_job_id", postgresql.UUID(as_uuid=True))
    )
    op.add_column("canonical_input_records", sa.Column("workflow_id", sa.String(255)))
    op.add_column(
        "canonical_input_records",
        sa.Column("revision_cycle", sa.Integer(), server_default=sa.text("0"), nullable=False),
    )
    op.add_column("canonical_input_records", sa.Column("canonical_producer_id", sa.String(255)))
    op.add_column("canonical_input_records", sa.Column("operation", sa.String(128)))
    op.add_column("canonical_input_records", sa.Column("operation_version", sa.String(32)))
    op.add_column(
        "canonical_input_records", sa.Column("assembled_input_fingerprint", sa.String(64))
    )
    op.add_column(
        "canonical_input_records",
        sa.Column(
            "dependency_artifact_ids",
            postgresql.JSONB(),
            server_default=sa.text("'[]'::jsonb"),
            nullable=False,
        ),
    )
    op.add_column(
        "canonical_input_records",
        sa.Column(
            "dependency_fingerprints",
            postgresql.JSONB(),
            server_default=sa.text("'[]'::jsonb"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    for column in (
        "dependency_fingerprints",
        "dependency_artifact_ids",
        "assembled_input_fingerprint",
        "operation_version",
        "operation",
        "canonical_producer_id",
        "revision_cycle",
        "workflow_id",
        "generation_job_id",
    ):
        op.drop_column("canonical_input_records", column)
