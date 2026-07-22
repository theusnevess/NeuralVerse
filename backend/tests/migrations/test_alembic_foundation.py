from __future__ import annotations

from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path

import pytest

pytest.importorskip("alembic")

from alembic import command
from alembic.config import Config
from alembic.script import ScriptDirectory

from neuralverse_backend.persistence.metadata import metadata

BACKEND_ROOT = Path(__file__).resolve().parents[2]
ALEMBIC_INI = BACKEND_ROOT / "alembic.ini"
MIGRATIONS = BACKEND_ROOT / "migrations" / "canonical"
LEGACY_MIGRATIONS = BACKEND_ROOT / "migrations"


def alembic_config(script_location: Path = MIGRATIONS) -> Config:
    config = Config(str(ALEMBIC_INI))
    config.set_main_option("script_location", str(script_location))
    return config


def test_alembic_configuration_points_to_shared_migrations() -> None:
    config = alembic_config()
    assert config.get_main_option("sqlalchemy.url") == ""
    script_location = config.get_main_option("script_location")
    assert script_location is not None
    assert Path(script_location) == MIGRATIONS


def test_canonical_schema_migration_is_the_only_head() -> None:
    script = ScriptDirectory.from_config(alembic_config())
    heads = script.get_heads()
    assert heads == ["c00000000001"]
    revision = script.get_revision(heads[0])
    assert revision is not None
    assert revision.down_revision is None
    assert revision.doc.startswith("Create the canonical Stage 16 schema baseline")


def test_legacy_migrations_are_not_reachable_from_canonical_script_location() -> None:
    canonical = ScriptDirectory.from_config(alembic_config())
    legacy = ScriptDirectory.from_config(alembic_config(LEGACY_MIGRATIONS))
    canonical_revisions = {revision.revision for revision in canonical.walk_revisions()}
    assert "b58000000001" not in canonical_revisions
    for revision_id in ("b58000000001", "b59000000001", "b62000000001", "b63000000001"):
        assert legacy.get_revision(revision_id) is not None


def test_application_metadata_contains_operational_and_canonical_tables() -> None:
    assert {
        "fixture_records",
        "idempotency_records",
        "operational_audit_events",
        "cross_front_workflow_executions",
        "cross_front_workflow_queue",
        "authoring_jobs",
        "canonical_input_records",
        "canonical_intake_idempotency",
        "transactional_outbox_events",
    } <= set(metadata.tables)
    assert {
        "content_packages",
        "content_versions",
        "content_blocks",
        "curriculum_nodes",
        "sources",
        "assets",
        "generation_jobs",
        "governance_reviews",
        "publication_releases",
        "learner_profiles",
        "laboratory_runs",
        "assessment_attempts",
        "synchronization_records",
        "asset_version_integrity",
        "asset_readiness",
        "search_resources",
        "search_embeddings",
        "search_index_runs",
        "search_index_freshness",
    } <= set(metadata.tables)


def test_offline_baseline_sql_does_not_expose_credentials(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("NEURALVERSE_ENV", "test")
    monkeypatch.setenv("NEURALVERSE_DATABASE_ENABLED", "true")
    monkeypatch.setenv(
        "NEURALVERSE_DATABASE_URL",
        "postgresql+psycopg://migration_user:secret_password@127.0.0.1:55432/migration_db",
    )
    output = StringIO()
    with redirect_stdout(output):
        command.upgrade(alembic_config(), "head", sql=True)
    generated = output.getvalue()
    assert "secret_password" not in generated
    assert "migration_user" not in generated
    assert "alembic_version" in generated
