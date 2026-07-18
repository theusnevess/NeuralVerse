from __future__ import annotations

import json
import shutil
from datetime import UTC, datetime
from decimal import Decimal
from pathlib import Path

import pytest

from neuralverse_backend.canonical_input import (
    RELEASE_COMMIT,
    RELEASE_TAG,
    IntakeFailureCode,
    readCanonicalInput,
    verify_vendored_release,
)

ROOT = Path(__file__).parents[2] / "vendor/neutral-contracts" / RELEASE_TAG
GOLDEN = ROOT / "contracts/examples/golden"


@pytest.mark.parametrize(
    "directory",
    [
        "curriculum-contract",
        "agent-contribution",
        "learning-package-draft",
        "publication-readiness-recommendation",
    ],
)
def test_acp_representative_artifacts_are_accepted(directory: str) -> None:
    payload = (GOLDEN / directory / "1.0.0/complete-valid.json").read_bytes()
    result = readCanonicalInput(
        payload, release_root=ROOT, clock=lambda: datetime(2026, 7, 17, tzinfo=UTC)
    )
    assert result.accepted
    assert result.intake is not None
    assert result.intake.release_identity == verify_vendored_release(ROOT)
    assert result.intake.raw_canonical_json == payload


@pytest.mark.parametrize(
    "directory",
    [
        "curriculum-contract",
        "agent-contribution",
        "learning-package-draft",
        "publication-readiness-recommendation",
    ],
)
def test_invalid_contract_is_never_successful(directory: str) -> None:
    payload = (GOLDEN / directory / "1.0.0/invalid-structure.json").read_bytes()
    result = readCanonicalInput(payload, release_root=ROOT)
    assert not result.accepted
    assert result.failure is not None
    assert result.failure.code == IntakeFailureCode.SCHEMA_VALIDATION_FAILURE


def test_lossless_value_preservation_and_deterministic_fingerprint() -> None:
    path = GOLDEN / "agent-contribution/1.0.0/complete-valid.json"
    original = json.loads(path.read_text(encoding="utf-8"))
    original["ordered"] = ["second", "first"]
    original["explicitNull"] = None
    original["opaque"] = "opaque:id/μ"
    raw = json.dumps(original, ensure_ascii=False, separators=(",", ":")).encode()
    first = readCanonicalInput(raw, release_root=ROOT)
    second = readCanonicalInput(raw, release_root=ROOT)
    assert first.accepted and second.accepted
    assert first.intake is not None and second.intake is not None
    assert first.intake.canonical_artifact["confidence"] == Decimal("0.94")
    assert first.intake.canonical_artifact["ordered"] == ["second", "first"]
    assert first.intake.artifact_sha256 == second.intake.artifact_sha256
    reordered = dict(original)
    reordered["ordered"] = ["first", "second"]
    changed = readCanonicalInput(
        json.dumps(reordered, ensure_ascii=False).encode(), release_root=ROOT
    )
    assert changed.accepted and changed.intake is not None
    assert changed.intake.artifact_sha256 != first.intake.artifact_sha256


def test_clock_failure_returns_structured_failure_without_partial_intake() -> None:
    payload = (GOLDEN / "agent-contribution/1.0.0/complete-valid.json").read_bytes()

    def failing_clock() -> datetime:
        raise RuntimeError("clock secret must not escape")

    result = readCanonicalInput(payload, release_root=ROOT, clock=failing_clock)
    assert not result.accepted
    assert result.intake is None
    assert result.failure is not None
    assert result.failure.code == IntakeFailureCode.UNEXPECTED_INTAKE_FAILURE
    assert result.failure.message == "canonical intake construction failed"
    assert payload == (GOLDEN / "agent-contribution/1.0.0/complete-valid.json").read_bytes()


def test_successful_intake_invokes_clock_exactly_once() -> None:
    payload = (GOLDEN / "agent-contribution/1.0.0/complete-valid.json").read_bytes()
    calls = 0

    def clock() -> datetime:
        nonlocal calls
        calls += 1
        return datetime(2026, 7, 17, tzinfo=UTC)

    result = readCanonicalInput(payload, release_root=ROOT, clock=clock)
    assert result.accepted
    assert result.intake is not None
    assert result.intake.artifact_sha256
    assert calls == 1


def test_compatibility_and_contract_identity_fail_deterministically() -> None:
    source = json.loads((GOLDEN / "agent-contribution/1.0.0/minimal-valid.json").read_text())
    source["schema_version"] = "2.0.0"
    result = readCanonicalInput(json.dumps(source).encode(), release_root=ROOT)
    assert (
        result.failure is not None and result.failure.code == IntakeFailureCode.UNSUPPORTED_VERSION
    )
    source["schema_version"] = "1.1.0"
    source["minimum_reader_version"] = "1.1.0"
    result = readCanonicalInput(json.dumps(source).encode(), release_root=ROOT)
    assert (
        result.failure is not None
        and result.failure.code == IntakeFailureCode.MINIMUM_READER_INCOMPATIBILITY
    )
    source["schema_name"] = "UnknownContract"
    source["minimum_reader_version"] = "1.0.0"
    result = readCanonicalInput(json.dumps(source).encode(), release_root=ROOT)
    assert result.failure is not None and result.failure.code == IntakeFailureCode.UNKNOWN_CONTRACT


def test_curriculum_dependency_reference_is_not_inferred() -> None:
    source = json.loads((GOLDEN / "curriculum-contract/1.0.0/complete-valid.json").read_text())
    source["dependencyEdges"] = [
        {
            "dependencyId": "dependency:unknown",
            "fromNodeId": "node:linear-algebra",
            "toNodeId": "node:not-in-scope",
            "relation": "requires",
        }
    ]
    result = readCanonicalInput(json.dumps(source).encode(), release_root=ROOT)
    assert result.failure is not None
    assert result.failure.code == IntakeFailureCode.SCHEMA_VALIDATION_FAILURE


def test_release_drift_is_rejected_without_mutating_the_snapshot(tmp_path: Path) -> None:
    copied = tmp_path / RELEASE_TAG
    shutil.copytree(ROOT, copied)
    pin = copied / "RELEASE_PIN.json"
    changed = json.loads(pin.read_text())
    changed["commit"] = "0" * 40
    pin.write_text(json.dumps(changed), encoding="utf-8")
    with pytest.raises(ValueError):
        verify_vendored_release(copied)
    assert json.loads((ROOT / "RELEASE_PIN.json").read_text())["commit"] == RELEASE_COMMIT


@pytest.mark.parametrize(
    ("relative", "field", "value"),
    [
        ("RELEASE_PIN.json", "tag", "wrong-release"),
        (
            "contracts/releases/nv-xfi-input-contracts-v1.0.0.json",
            "manifest_sha256",
            "0" * 64,
        ),
        (
            "contracts/contract-manifest.json",
            "manifest_version",
            "9.9.9",
        ),
    ],
)
def test_release_metadata_drift_is_rejected(
    tmp_path: Path, relative: str, field: str, value: str
) -> None:
    copied = tmp_path / RELEASE_TAG
    shutil.copytree(ROOT, copied)
    path = copied / relative
    changed = json.loads(path.read_text())
    changed[field] = value
    path.write_text(json.dumps(changed), encoding="utf-8")
    with pytest.raises(ValueError):
        verify_vendored_release(copied)


def test_no_direct_acp_or_contract_worktree_dependency() -> None:
    source_root = Path(__file__).parents[2] / "src"
    source = "\n".join(path.read_text(encoding="utf-8") for path in source_root.rglob("*.py"))
    assert "neuralverse-agents" not in source
    assert "neuralverse-contracts" not in source
    assert "../neuralverse-contracts" not in source
