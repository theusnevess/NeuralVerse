"""Persist exact content-version source, citation, and asset references."""

from collections.abc import Sequence

from alembic import op

from neuralverse_backend.persistence.metadata import metadata

revision: str = "b47000000001"
down_revision: str | Sequence[str] | None = "b46000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_TABLES = {
    "content_version_sources",
    "content_version_citations",
    "content_version_asset_versions",
}


def upgrade() -> None:
    bind = op.get_bind()
    for table in metadata.sorted_tables:
        if table.name in _TABLES:
            table.create(bind=bind, checkfirst=True)


def downgrade() -> None:
    bind = op.get_bind()
    for table_name in reversed(
        ("content_version_asset_versions", "content_version_citations", "content_version_sources")
    ):
        metadata.tables[table_name].drop(bind=bind, checkfirst=True)
