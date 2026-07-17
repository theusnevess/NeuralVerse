"""Establish the initial Alembic history baseline.

Revision ID: b30000000001
Revises:
Create Date: 2026-07-16
"""

revision = "b30000000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Initialize migration history without creating application schema."""
    pass


def downgrade() -> None:
    """Leave application schema unchanged when reverting the baseline."""
    pass
