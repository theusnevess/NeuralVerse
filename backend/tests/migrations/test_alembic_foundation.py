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
MIGRATIONS = BACKEND_ROOT / "migrations"


def alembic_config() -> Config:
    config = Config(str(ALEMBIC_INI))
    config.set_main_option("script_location", str(MIGRATIONS))
    return config


def test_alembic_configuration_points_to_shared_migrations() -> None:
    config = alembic_config()
    assert config.get_main_option("sqlalchemy.url") == ""
    script_location = config.get_main_option("script_location")
    assert script_location is not None
    assert Path(script_location) == MIGRATIONS


def test_b41_is_the_only_linear_head() -> None:
    script = ScriptDirectory.from_config(alembic_config())
    heads = script.get_heads()
    assert heads == ["b41000000001"]
    revision = script.get_revision(heads[0])
    assert revision is not None
    assert revision.down_revision == "b30000000001"
    assert revision.doc.startswith("Add the B.4.1 operational persistence foundation.")


def test_application_metadata_has_only_operational_tables() -> None:
    assert set(metadata.tables) == {
        "fixture_records",
        "idempotency_records",
        "operational_audit_events",
    }


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
