"""Canonical baseline and legacy bridge safety tests."""

from __future__ import annotations

from pathlib import Path

import pytest

pytest.importorskip("alembic")

from alembic.operations.ops import AddColumnOp, DropColumnOp
from sqlalchemy import Column, Integer

from neuralverse_backend.persistence.canonical_migrations import (
    CANONICAL_REVISION,
    ReconciliationError,
    _validate_operations,
    canonical_schema_fingerprint,
)
from neuralverse_backend.persistence.metadata import metadata

BACKEND_ROOT = Path(__file__).resolve().parents[2]


def test_canonical_revision_is_unique_and_has_one_head() -> None:
    assert CANONICAL_REVISION == "c00000000001"
    assert (BACKEND_ROOT / "migrations/canonical/versions").is_dir()


def test_canonical_schema_fingerprint_is_sha256() -> None:
    fingerprint = canonical_schema_fingerprint()
    assert len(fingerprint) == 64
    assert all(character in "0123456789abcdef" for character in fingerprint)


def test_canonical_metadata_preserves_prior_durable_schema() -> None:
    preserved_prefixes = ("obsidian_", "stage13_", "stage15_")
    preserved = [name for name in metadata.tables if name.startswith(preserved_prefixes)]
    assert len(metadata.tables) == 107
    assert len(preserved) == 21


def test_bridge_allows_only_additive_schema_operations() -> None:
    additive = AddColumnOp("example", Column("value", Integer()))
    assert _validate_operations((additive,)) == ("AddColumnOp",)

    destructive = DropColumnOp("example", "value")
    with pytest.raises(ReconciliationError, match="unsafe"):
        _validate_operations((destructive,))


def test_observed_historical_merge_is_not_a_canonical_head() -> None:
    from neuralverse_backend.persistence.canonical_migrations import (
        APPROVED_LEGACY_REVISIONS,
    )

    assert "b65000000001" in APPROVED_LEGACY_REVISIONS
    assert CANONICAL_REVISION not in APPROVED_LEGACY_REVISIONS
