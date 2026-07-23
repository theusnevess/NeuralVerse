"""Merge the durable M9 and learner-state migration lines."""

from collections.abc import Sequence

revision: str = "b56000000001"
down_revision: tuple[str, str] = ("b54000000001", "b55000000001")
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
