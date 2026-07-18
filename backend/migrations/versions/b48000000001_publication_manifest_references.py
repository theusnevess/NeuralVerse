"""Persist publication manifest references with relational foreign keys."""

from collections.abc import Sequence

from alembic import op

from neuralverse_backend.persistence.metadata import metadata

revision: str = "b48000000001"
down_revision: str | Sequence[str] | None = "b47000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_TABLES = {
    "publication_manifest_blocks",
    "publication_manifest_asset_versions",
    "publication_manifest_laboratory_specs",
    "publication_manifest_assessment_specs",
    "publication_manifest_sources",
    "publication_manifest_citations",
}


def upgrade() -> None:
    bind = op.get_bind()
    for table in metadata.sorted_tables:
        if table.name in _TABLES:
            table.create(bind=bind, checkfirst=True)


def downgrade() -> None:
    bind = op.get_bind()
    for table_name in reversed(tuple(_TABLES)):
        metadata.tables[table_name].drop(bind=bind, checkfirst=True)
