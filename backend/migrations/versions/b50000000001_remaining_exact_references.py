"""Persist learner collection and publication governance references relationally."""

from collections.abc import Sequence

from alembic import op

from neuralverse_backend.persistence.metadata import metadata

revision: str = "b50000000001"
down_revision: str | Sequence[str] | None = "b49000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_TABLES = {"learner_collection_versions", "publication_release_governance_reviews"}


def upgrade() -> None:
    bind = op.get_bind()
    for table in metadata.sorted_tables:
        if table.name in _TABLES:
            table.create(bind=bind, checkfirst=True)


def downgrade() -> None:
    bind = op.get_bind()
    for table_name in ("publication_release_governance_reviews", "learner_collection_versions"):
        metadata.tables[table_name].drop(bind=bind, checkfirst=True)
