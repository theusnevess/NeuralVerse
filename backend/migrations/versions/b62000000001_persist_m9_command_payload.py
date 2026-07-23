"""Persist accepted M9 command payloads for durable recovery."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b62000000001"
down_revision: tuple[str, str] = ("b59000000001", "b61000000001")
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "bip_m4_commands",
        sa.Column("command_payload", postgresql.JSONB(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("bip_m4_commands", "command_payload")
