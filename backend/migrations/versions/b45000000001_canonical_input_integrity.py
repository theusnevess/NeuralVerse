"""Complete lossless canonical-input columns after the intake foundation."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b45000000001"
down_revision: str | Sequence[str] | None = "b44000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "canonical_input_records",
        sa.Column("raw_json_sha256", sa.String(length=64), nullable=True),
    )
    op.add_column(
        "canonical_input_records",
        sa.Column("structural_semantic_payload", postgresql.JSONB(), nullable=True),
    )
    op.add_column(
        "canonical_input_records",
        sa.Column("unknown_compatible_fields", postgresql.JSONB(), nullable=True),
    )
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
        op.execute(
            "UPDATE canonical_input_records SET "
            "raw_json_sha256 = encode(digest(raw_json_bytes, 'sha256'), 'hex'), "
            "structural_semantic_payload = parsed_canonical_json::jsonb, "
            "unknown_compatible_fields = '{}'::jsonb"
        )
    else:
        op.execute(
            "UPDATE canonical_input_records SET "
            "raw_json_sha256 = artifact_fingerprint, "
            "structural_semantic_payload = '{}', "
            "unknown_compatible_fields = '{}'"
        )
    op.alter_column("canonical_input_records", "raw_json_sha256", nullable=False)
    op.alter_column("canonical_input_records", "structural_semantic_payload", nullable=False)
    op.alter_column("canonical_input_records", "unknown_compatible_fields", nullable=False)


def downgrade() -> None:
    op.drop_column("canonical_input_records", "unknown_compatible_fields")
    op.drop_column("canonical_input_records", "structural_semantic_payload")
    op.drop_column("canonical_input_records", "raw_json_sha256")
