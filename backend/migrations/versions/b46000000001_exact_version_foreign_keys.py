"""Enforce exact package and specification version lineage."""

from collections.abc import Sequence

from alembic import op

revision: str = "b46000000001"
down_revision: str | Sequence[str] | None = "b45000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    _add_constraint(
        "content_versions",
        "uq_content_versions_id_package",
        "UNIQUE (content_version_id, content_package_id)",
    )
    _add_constraint(
        "content_versions",
        "fk_content_versions_predecessor_same_package",
        "FOREIGN KEY (predecessor_content_version_id, content_package_id) "
        "REFERENCES content_versions (content_version_id, content_package_id) ON DELETE RESTRICT",
    )
    _add_constraint(
        "laboratory_specs",
        "uq_laboratory_specs_id_version",
        "UNIQUE (laboratory_spec_id, version)",
    )
    _add_constraint(
        "laboratory_runs",
        "fk_laboratory_runs_exact_spec_version",
        "FOREIGN KEY (laboratory_spec_id, laboratory_spec_version) "
        "REFERENCES laboratory_specs (laboratory_spec_id, version) ON DELETE RESTRICT",
    )
    _add_constraint(
        "assessment_specs",
        "uq_assessment_specs_id_version",
        "UNIQUE (assessment_spec_id, version)",
    )
    _add_constraint(
        "assessment_attempts",
        "fk_assessment_attempts_exact_spec_version",
        "FOREIGN KEY (assessment_spec_id, assessment_spec_version) "
        "REFERENCES assessment_specs (assessment_spec_id, version) ON DELETE RESTRICT",
    )


def _add_constraint(table: str, name: str, definition: str) -> None:
    op.execute(
        f"DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint "
        f"WHERE conname = '{name}') THEN ALTER TABLE {table} "
        f"ADD CONSTRAINT {name} {definition}; END IF; END $$;"
    )


def downgrade() -> None:
    for table, name in (
        ("assessment_attempts", "fk_assessment_attempts_exact_spec_version"),
        ("assessment_specs", "uq_assessment_specs_id_version"),
        ("laboratory_runs", "fk_laboratory_runs_exact_spec_version"),
        ("laboratory_specs", "uq_laboratory_specs_id_version"),
        ("content_versions", "fk_content_versions_predecessor_same_package"),
        ("content_versions", "uq_content_versions_id_package"),
    ):
        op.execute(f"ALTER TABLE {table} DROP CONSTRAINT IF EXISTS {name}")
