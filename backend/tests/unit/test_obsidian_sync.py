from pathlib import Path

import pytest

from neuralverse_backend.obsidian_sync import (
    AuthorityClass,
    ConflictClass,
    ConflictResolution,
    FrontmatterError,
    LocalFilesystemObsidianVaultAdapter,
    NoteIdentity,
    NoteProjection,
    OperationKind,
    PlanStatus,
    SynchronizationEngine,
    SynchronizationWorkflow,
    VaultConfiguration,
    parse_note,
    serialize_note,
)


def make_adapter(tmp_path: Path) -> LocalFilesystemObsidianVaultAdapter:
    return LocalFilesystemObsidianVaultAdapter(VaultConfiguration(str(tmp_path), "test"))


def make_projection(identifier: str = "concept:svd") -> NoteProjection:
    return NoteProjection(
        NoteIdentity(identifier, AuthorityClass.CONCEPT),
        "SVD",
        "# Singular values\n\nDeterministic content.",
        links=("source:golub",),
    )


def test_serialization_roundtrip() -> None:
    identity = NoteIdentity("concept:svd", AuthorityClass.CONCEPT)
    one, hashes_one = serialize_note(identity, title="SVD", managed_body="# A", links=("source:x",))
    two, hashes_two = serialize_note(identity, title="SVD", managed_body="# A", links=("source:x",))
    assert one == two and hashes_one == hashes_two and parse_note(one).identity == identity


def test_path_security(tmp_path: Path) -> None:
    vault = make_adapter(tmp_path)
    with pytest.raises(ValueError):
        vault.resolve("../outside.md")
    with pytest.raises(ValueError):
        vault.resolve("/outside.md")


def test_create_update_noop_and_audit(tmp_path: Path) -> None:
    engine = SynchronizationEngine(make_adapter(tmp_path))
    first = engine.plan([make_projection()])
    assert first.operations[0].kind is OperationKind.CREATE
    assert (
        engine.execute(first, engine.approve(first, "owner@example.test")).status
        is PlanStatus.COMPLETED
    )
    second = engine.plan([make_projection()])
    assert second.operations[0].kind is OperationKind.NOOP
    assert engine.audit


def test_conflict_requires_resolution(tmp_path: Path) -> None:
    engine = SynchronizationEngine(make_adapter(tmp_path))
    first = engine.plan([make_projection()])
    engine.execute(first, engine.approve(first, "owner@example.test"))
    engine.baselines[make_projection().identity.key] = engine.snapshot(first.operations[0].path)  # type: ignore[assignment]
    current = engine.adapter.read(first.operations[0].path) or ""
    engine.adapter.atomic_write(
        first.operations[0].path, current.replace("Deterministic", "Editorial")
    )
    changed = NoteProjection(
        make_projection().identity, "SVD", "# Canonical change", links=make_projection().links
    )
    plan = engine.plan([changed])
    assert (
        plan.operations[0].conflict
        and plan.operations[0].conflict.classification is ConflictClass.CONCURRENT_EDIT
    )
    with pytest.raises(ValueError):
        engine.approve(plan, "owner@example.test")


def test_partial_failure_rolls_back(tmp_path: Path) -> None:
    engine = SynchronizationEngine(make_adapter(tmp_path))
    plan = engine.plan([make_projection("concept:a"), make_projection("concept:b")])
    with pytest.raises(RuntimeError):
        engine.execute(plan, engine.approve(plan, "owner@example.test"), fail_after=1)
    assert plan.status is PlanStatus.PARTIALLY_APPLIED
    engine.rollback(plan)
    assert plan.status is PlanStatus.ROLLED_BACK


def test_frontmatter_rejects_secret() -> None:
    with pytest.raises(FrontmatterError):
        serialize_note(
            NoteIdentity("concept:x", AuthorityClass.CONCEPT),
            title="x",
            managed_body="x",
            extra_frontmatter={"api_token": "no"},
        )


def test_dry_run_resolution_ack_and_override(tmp_path: Path) -> None:
    engine = SynchronizationEngine(make_adapter(tmp_path))
    projection = make_projection()
    first = engine.plan([projection])
    before = engine.adapter.list_notes()
    assert first.status is PlanStatus.PLAN_READY
    assert engine.dry_run([projection]).operations[0].kind is OperationKind.CREATE
    assert engine.adapter.list_notes() == before

    engine.execute(first, engine.approve(first, "owner@example.test"))
    engine.baselines[projection.identity.key] = engine.snapshot(first.operations[0].path)  # type: ignore[assignment]
    current = engine.adapter.read(first.operations[0].path) or ""
    engine.adapter.atomic_write(
        first.operations[0].path, current.replace("Deterministic", "Editorial")
    )
    conflict_plan = engine.plan([NoteProjection(projection.identity, "SVD", "# Canonical")])
    operation = conflict_plan.operations[0]
    assert operation.conflict is not None
    ack = engine.resolve_conflict(
        conflict_plan,
        operation.operation_id,
        ConflictResolution.REJECT_OPERATION,
        "owner@example.test",
        "editorial authority retained",
    )
    assert ack.decision == ConflictResolution.REJECT_OPERATION.value
    override = engine.manual_override(
        conflict_plan,
        operation,
        selected_authority="vault_editorial",
        scope="human_body",
        reason="preserve reviewed explanation",
        approver="owner@example.test",
    )
    assert override.is_active()
    assert len(engine.acknowledgements) == 2


def test_update_rollback_restores_preimage(tmp_path: Path) -> None:
    engine = SynchronizationEngine(make_adapter(tmp_path))
    projection = make_projection()
    create = engine.plan([projection])
    engine.execute(create, engine.approve(create, "owner@example.test"))
    original = engine.adapter.read(create.operations[0].path)
    updated = NoteProjection(projection.identity, "SVD", "# Updated")
    plan = engine.plan([updated])
    with pytest.raises(RuntimeError):
        engine.execute(plan, engine.approve(plan, "owner@example.test"), fail_after=1)
    engine.rollback(plan)
    assert engine.adapter.read(plan.operations[0].path) == original


def test_workflow_facade_is_replay_safe(tmp_path: Path) -> None:
    workflow = SynchronizationWorkflow(SynchronizationEngine(make_adapter(tmp_path)))
    first = workflow.request([make_projection()])
    assert workflow.request([make_projection()]).plan_id == first.plan_id
    workflow.approve("owner@example.test")
    workflow.execute()
    assert workflow.query() is PlanStatus.COMPLETED
    with pytest.raises(ValueError):
        workflow.cancel("owner@example.test")
