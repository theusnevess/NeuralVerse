"""Stage 16 migration graph and lineage schema checks."""

from __future__ import annotations

from pathlib import Path

import pytest

pytest.importorskip("alembic")

from alembic.config import Config
from alembic.script import ScriptDirectory

BACKEND_ROOT = Path(__file__).resolve().parents[2]
CANONICAL_MIGRATIONS = BACKEND_ROOT / "migrations" / "canonical"
LEGACY_MIGRATIONS = BACKEND_ROOT / "migrations"


def _script(script_location: Path = LEGACY_MIGRATIONS) -> ScriptDirectory:
    config = Config(str(BACKEND_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(script_location))
    return ScriptDirectory.from_config(config)


def test_canonical_migration_graph_has_unique_revisions_and_one_head() -> None:
    script = _script(CANONICAL_MIGRATIONS)
    revisions = list(script.walk_revisions())
    revision_ids = [revision.revision for revision in revisions]
    assert len(revision_ids) == len(set(revision_ids))
    assert script.get_heads() == ["c00000000001"]


def test_committed_stage16_legacy_revision_remains_immutable_and_separate() -> None:
    script = _script()
    assert script.get_revision("b63000000001") is not None
    assert script.get_revision("b63000000001").down_revision == "b61000000001"


def test_stage16_lineage_columns_are_declared_by_the_repair_migration() -> None:
    revision = _script().get_revision("b63000000001")
    source = Path(revision.path).read_text(encoding="utf-8")
    for column in (
        "generation_job_id",
        "workflow_id",
        "revision_cycle",
        "canonical_producer_id",
        "operation",
        "operation_version",
        "assembled_input_fingerprint",
        "dependency_artifact_ids",
        "dependency_fingerprints",
    ):
        assert f'"{column}"' in source
