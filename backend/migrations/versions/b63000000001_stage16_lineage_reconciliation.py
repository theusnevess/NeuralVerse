"""Add the Stage 16 canonical-input lineage columns.

The Stage 15 database head already contains the lossless canonical-input
record. Stage 16 adds only the durable lineage metadata required to connect
that record to the authoring request and workflow; it does not rewrite any
historical migration or introduce a second lineage model.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b63000000001"
down_revision: str | Sequence[str] | None = "b61000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "canonical_input_records",
        sa.Column("generation_job_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column("canonical_input_records", sa.Column("workflow_id", sa.String(255), nullable=True))
    op.add_column(
        "canonical_input_records",
        sa.Column("revision_cycle", sa.Integer(), server_default=sa.text("0"), nullable=False),
    )
    op.add_column(
        "canonical_input_records",
        sa.Column("canonical_producer_id", sa.String(255), nullable=True),
    )
    op.add_column("canonical_input_records", sa.Column("operation", sa.String(128), nullable=True))
    op.add_column(
        "canonical_input_records",
        sa.Column("operation_version", sa.String(32), nullable=True),
    )
    op.add_column(
        "canonical_input_records",
        sa.Column("assembled_input_fingerprint", sa.String(64), nullable=True),
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
    op.create_index(
        "ix_canonical_input_records_generation_job",
        "canonical_input_records",
        ["generation_job_id"],
    )
    op.create_index("ix_canonical_input_records_workflow", "canonical_input_records", ["workflow_id"])
    op.create_index(
        "ix_canonical_input_records_assembled_fingerprint",
        "canonical_input_records",
        ["assembled_input_fingerprint"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_canonical_input_records_assembled_fingerprint",
        table_name="canonical_input_records",
    )
    op.drop_index("ix_canonical_input_records_workflow", table_name="canonical_input_records")
    op.drop_index(
        "ix_canonical_input_records_generation_job",
        table_name="canonical_input_records",
    )
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
