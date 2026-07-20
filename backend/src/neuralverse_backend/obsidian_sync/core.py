"""Governed local Obsidian synchronization for Stage 14.

Filesystem synchronization is intentionally explicit: repository/published
projections may be written to managed sections, while vault edits become
reviewable proposals and never mutate canonical state implicitly.
"""

from __future__ import annotations

import hashlib
import os
import re
import tempfile
import uuid
from collections.abc import Iterable, Iterator, Mapping
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from enum import StrEnum
from pathlib import Path
from typing import Any

import yaml  # type: ignore[import-untyped]

SCHEMA = "NeuralVerseObsidianFrontmatter/1.0.0"
MANAGED_START = "<!-- neuralverse:managed:start -->"
MANAGED_END = "<!-- neuralverse:managed:end -->"


class AuthorityClass(StrEnum):
    CONCEPT = "concept"
    CURRICULUM = "curriculum"
    SOURCE = "source"
    CONTRIBUTION = "contribution"
    ASSET = "asset"
    LABORATORY = "laboratory"
    ASSESSMENT = "assessment"
    PUBLISHED_RELEASE = "published_release"
    EDITORIAL = "editorial"


class SyncDirection(StrEnum):
    PUBLISHED_TO_VAULT = "published_to_vault"
    REPOSITORY_TO_VAULT = "repository_to_vault"
    VAULT_TO_PROPOSAL = "vault_to_proposal"


class OperationKind(StrEnum):
    CREATE = "create"
    UPDATE = "update"
    MOVE = "move"
    ARCHIVE = "archive"
    DELETE = "delete"
    NOOP = "noop"


class PlanStatus(StrEnum):
    REQUESTED = "requested"
    DISCOVERING = "discovering"
    PLANNING = "planning"
    PLAN_READY = "plan_ready"
    VALIDATION_FAILED = "validation_failed"
    DRY_RUN = "dry_run"
    AWAITING_APPROVAL = "awaiting_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXECUTING = "executing"
    IN_PROGRESS = "in_progress"  # backward-compatible spelling
    PARTIALLY_APPLIED = "partially_applied"
    RECOVERY_PENDING = "recovery_pending"
    ROLLBACK_PENDING = "rollback_pending"
    COMPLETED = "completed"
    ROLLED_BACK = "rolled_back"
    FAILED = "failed"
    CANCELLED = "cancelled"


class OperationStatus(StrEnum):
    PLANNED = "planned"
    PRECONDITION_VALIDATED = "precondition_validated"
    STAGED = "staged"
    APPLIED = "applied"
    VALIDATED = "validated"
    ACKNOWLEDGED = "acknowledged"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"
    SKIPPED = "skipped"


class ConflictResolution(StrEnum):
    ACCEPT_SOURCE_MANAGED_CONTENT = "accept_source_managed_content"
    ACCEPT_VAULT_EDITORIAL_CONTENT = "accept_vault_editorial_content"
    PRESERVE_BOTH_AS_ALTERNATIVES = "preserve_both_as_alternatives"
    APPLY_MANUAL_MERGE = "apply_manual_merge"
    KEEP_PROJECTION_AND_CREATE_EDITORIAL_PROPOSAL = "keep_projection_and_create_editorial_proposal"
    ARCHIVE_PROJECTION = "archive_projection"
    SUPPRESS_PROJECTION_WITH_OVERRIDE = "suppress_projection_with_override"
    REJECT_OPERATION = "reject_operation"


class ConflictClass(StrEnum):
    NONE = "none"
    SOURCE_ONLY = "source_only"
    VAULT_ONLY = "vault_only"
    CONCURRENT_EDIT = "concurrent_edit"
    IDENTITY_COLLISION = "identity_collision"
    PATH_COLLISION = "path_collision"
    FRONTMATTER_AUTHORITY = "frontmatter_authority"
    MANAGED_SECTION = "managed_section"
    DELETED_PROJECTION = "deleted_projection"
    UNSUPPORTED_SCHEMA = "unsupported_schema"
    ORPHAN = "orphan"


class FrontmatterError(ValueError):
    pass


class VaultSafetyError(ValueError):
    pass


@dataclass(frozen=True, slots=True)
class VaultConfiguration:
    root: str
    vault_id: str
    allowed_paths: tuple[str, ...] = ("NeuralVerse",)
    excluded_paths: tuple[str, ...] = (".obsidian", ".trash", ".git")
    max_note_bytes: int = 2_000_000
    schema_version: str = SCHEMA

    def validate(self) -> None:
        root = Path(self.root)
        if root.exists() and not root.is_dir():
            raise ValueError("vault root must be a directory")
        if not self.vault_id or any(c in self.vault_id for c in "\x00\n\\"):
            raise ValueError("invalid vault id")
        if self.max_note_bytes <= 0 or not self.allowed_paths:
            raise ValueError("invalid vault bounds")
        for path in (*self.allowed_paths, *self.excluded_paths):
            if not path or path.startswith("/") or ".." in path.split("/"):
                raise ValueError("unsafe vault policy path")


@dataclass(frozen=True, slots=True)
class NoteIdentity:
    canonical_id: str
    authority_class: AuthorityClass
    version: str = "1.0.0"

    def __post_init__(self) -> None:
        if not self.canonical_id or any(c in self.canonical_id for c in "\x00\n"):
            raise ValueError("invalid canonical identity")

    @property
    def key(self) -> str:
        return f"{self.authority_class.value}:{self.canonical_id}:{self.version}"


@dataclass(frozen=True, slots=True)
class NoteProjection:
    identity: NoteIdentity
    title: str
    body: str
    frontmatter: Mapping[str, Any] = field(default_factory=dict)
    links: tuple[str, ...] = ()
    path: str | None = None
    human_body: str = ""


@dataclass(frozen=True, slots=True)
class HashSet:
    source_hash: str
    frontmatter_hash: str
    managed_hash: str
    full_hash: str


@dataclass(frozen=True, slots=True)
class NoteSnapshot:
    identity: NoteIdentity
    path: str
    frontmatter: Mapping[str, Any]
    managed_body: str
    human_body: str
    links: tuple[str, ...]
    hashes: HashSet
    raw: str


@dataclass(frozen=True, slots=True)
class Conflict:
    classification: ConflictClass
    identity: str
    path: str
    message: str
    source_hash: str | None = None
    vault_hash: str | None = None
    base_hash: str | None = None


@dataclass(slots=True)
class SyncOperation:
    operation_id: str
    kind: OperationKind
    identity: NoteIdentity
    path: str
    target_path: str | None = None
    expected_hash: str | None = None
    projection: NoteProjection | None = None
    conflict: Conflict | None = None
    status: OperationStatus = OperationStatus.PLANNED
    attempts: int = 0
    preimage_hash: str | None = None
    actual_hash: str | None = None
    error_classification: str | None = None


@dataclass(slots=True)
class SynchronizationPlan:
    plan_id: str
    vault_id: str
    direction: SyncDirection
    operations: list[SyncOperation]
    source_fingerprint: str
    vault_fingerprint: str
    status: PlanStatus = PlanStatus.DRY_RUN
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def digest(self) -> str:
        value = [
            (op.operation_id, op.kind.value, op.identity.key, op.path, op.expected_hash)
            for op in self.operations
        ]
        return hashlib.sha256(
            repr(
                (
                    self.plan_id,
                    self.vault_id,
                    self.direction.value,
                    value,
                    self.source_fingerprint,
                    self.vault_fingerprint,
                )
            ).encode()
        ).hexdigest()


@dataclass(frozen=True, slots=True)
class SynchronizationApproval:
    plan_id: str
    plan_hash: str
    actor: str
    scope: tuple[str, ...]
    approved_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    expires_at: datetime = field(default_factory=lambda: datetime.now(UTC) + timedelta(hours=1))

    def validate(self, plan: SynchronizationPlan) -> None:
        if (self.plan_id, self.plan_hash) != (plan.plan_id, plan.digest()):
            raise ValueError("stale plan approval")
        if not self.actor or datetime.now(UTC) >= self.expires_at:
            raise ValueError("invalid or expired approval")
        if any(
            op.kind is not OperationKind.NOOP and op.identity.key not in self.scope
            for op in plan.operations
        ):
            raise ValueError("approval scope incomplete")


@dataclass(frozen=True, slots=True)
class AuditEvent:
    event_id: str
    plan_id: str
    event_type: str
    actor: str
    operation_id: str | None
    payload: Mapping[str, Any]
    occurred_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass(frozen=True, slots=True)
class SynchronizationAcknowledgement:
    acknowledgement_id: str
    actor: str
    action: str
    target_ids: tuple[str, ...]
    plan_hash: str
    decision: str
    reason: str
    policy_version: str = "obsidian-sync-policy:1.0.0"
    acknowledged_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def validate(self) -> None:
        if not self.actor or not self.action or not self.target_ids or not self.reason:
            raise ValueError("acknowledgement requires actor, action, targets and reason")


@dataclass(frozen=True, slots=True)
class SynchronizationManualOverride:
    override_id: str
    vault_id: str
    note_key: str
    scope: str
    selected_authority: str
    reason: str
    approver: str
    source_hash: str
    vault_hash: str
    policy_version: str = "obsidian-sync-policy:1.0.0"
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    expires_at: datetime | None = None

    def is_active(self, now: datetime | None = None) -> bool:
        return self.expires_at is None or (now or datetime.now(UTC)) < self.expires_at

    def validate(self, vault_id: str) -> None:
        if vault_id != self.vault_id or not self.is_active():
            raise ValueError("override is expired or belongs to another vault")
        if not all(
            (self.note_key, self.scope, self.selected_authority, self.reason, self.approver)
        ):
            raise ValueError("manual override is incomplete")


@dataclass(frozen=True, slots=True)
class EditorialCorrectionProposal:
    proposal_id: str
    identity: NoteIdentity
    path: str
    base_hash: str
    vault_hash: str
    diff: str
    affected_ids: tuple[str, ...]
    status: str = "pending_review"


@dataclass(frozen=True, slots=True)
class Orphan:
    path: str
    identity: NoteIdentity | None
    reason: str
    requires_approval: bool = True


def _safe(value: Any) -> Any:
    if isinstance(value, (str, int, float, bool)) or value is None:
        if isinstance(value, str) and ("\x00" in value or len(value) > 100_000):
            raise FrontmatterError("unsafe scalar")
        return value
    if isinstance(value, (list, tuple)):
        return [_safe(item) for item in value]
    if isinstance(value, Mapping):
        return {str(k): _safe(v) for k, v in value.items()}
    raise FrontmatterError("unsupported frontmatter value")


def validate_frontmatter(data: Mapping[str, Any]) -> dict[str, Any]:
    if not isinstance(data, Mapping) or data.get("nv_schema") != SCHEMA:
        raise FrontmatterError("unsupported frontmatter schema")
    if not {"nv_id", "nv_authority", "nv_version", "nv_title"}.issubset(data):
        raise FrontmatterError("missing canonical identity")
    if re.search(
        r"(secret|token|password|api[_-]?key|credential|private[_-]?key)",
        " ".join(map(str, data)),
        re.I,
    ):
        raise FrontmatterError("secret-like field")
    return {str(k): _safe(v) for k, v in data.items()}


def _fm(data: Mapping[str, Any]) -> str:
    return (
        yaml.safe_dump(
            validate_frontmatter(data), sort_keys=True, allow_unicode=True, default_flow_style=False
        ).strip()
        + "\n"
    )


def _semantic_frontmatter(data: Mapping[str, Any]) -> dict[str, Any]:
    """Return frontmatter without derived hash fields.

    Hashes are evidence about a note, not semantic content. Excluding them
    keeps serialization idempotent and prevents a hash from hashing itself.
    """
    return {
        str(key): value
        for key, value in data.items()
        if str(key) not in {"nv_source_hash", "nv_frontmatter_hash", "nv_managed_hash"}
    }


def hashes(
    frontmatter: Mapping[str, Any],
    managed_body: str,
    human_body: str = "",
    links: tuple[str, ...] = (),
) -> HashSet:
    fm = _fm(_semantic_frontmatter(frontmatter))
    managed = managed_body.replace("\r\n", "\n").replace("\r", "\n").strip() + "\n"
    link_text = "\n".join(sorted(set(links)))
    source = hashlib.sha256((managed + link_text).encode()).hexdigest()
    fm_hash = hashlib.sha256(fm.encode()).hexdigest()
    managed_hash = hashlib.sha256((managed + link_text).encode()).hexdigest()
    full = hashlib.sha256((fm + managed + human_body).encode()).hexdigest()
    return HashSet(source, fm_hash, managed_hash, full)


def serialize_note(
    identity: NoteIdentity,
    *,
    title: str,
    managed_body: str,
    human_body: str = "",
    links: tuple[str, ...] = (),
    extra_frontmatter: Mapping[str, Any] | None = None,
) -> tuple[str, HashSet]:
    data: dict[str, Any] = {
        "nv_schema": SCHEMA,
        "nv_id": identity.canonical_id,
        "nv_authority": identity.authority_class.value,
        "nv_version": identity.version,
        "nv_title": title,
        "nv_links": sorted(set(links)),
    }
    if extra_frontmatter:
        for key, value in extra_frontmatter.items():
            if re.search(r"(secret|token|password|api[_-]?key|credential)", key, re.I):
                raise FrontmatterError("secret-like field")
            if key in {
                "nv_schema",
                "nv_id",
                "nv_authority",
                "nv_version",
                "nv_title",
                "nv_links",
                "nv_source_hash",
                "nv_frontmatter_hash",
                "nv_managed_hash",
            }:
                raise FrontmatterError("canonical frontmatter key is managed")
            data[key] = value
    initial = hashes(data, managed_body, human_body, links)
    data.update(
        {
            "nv_source_hash": initial.source_hash,
            "nv_frontmatter_hash": initial.frontmatter_hash,
            "nv_managed_hash": initial.managed_hash,
        }
    )
    raw = (
        "---\n"
        + _fm(data)
        + "---\n\n"
        + MANAGED_START
        + "\n"
        + managed_body.strip()
        + "\n"
        + MANAGED_END
        + "\n"
        + (("\n" + human_body.strip() + "\n") if human_body.strip() else "")
    )
    return raw, hashes(data, managed_body, human_body, links)


def parse_note(raw: str, path: str = "") -> NoteSnapshot:
    if not raw.startswith("---\n") or "\n---" not in raw[4:]:
        raise FrontmatterError("missing frontmatter")
    end_fm = raw.find("\n---", 4)
    data = validate_frontmatter(yaml.safe_load(raw[4:end_fm]))
    rest = raw[end_fm + 4 :]
    start, end = rest.find(MANAGED_START), rest.find(MANAGED_END)
    if start < 0 or end < start:
        raise FrontmatterError("missing managed section")
    managed = rest[start + len(MANAGED_START) : end].strip() + "\n"
    human = rest[end + len(MANAGED_END) :].strip()
    identity = NoteIdentity(
        str(data["nv_id"]), AuthorityClass(str(data["nv_authority"])), str(data["nv_version"])
    )
    links = tuple(str(x) for x in data.get("nv_links", []))
    return NoteSnapshot(
        identity, path, data, managed, human, links, hashes(data, managed, human, links), raw
    )


class LocalFilesystemObsidianVaultAdapter:
    def __init__(self, configuration: VaultConfiguration) -> None:
        configuration.validate()
        self.configuration = configuration
        self.root = Path(configuration.root).resolve()
        self.root.mkdir(parents=True, exist_ok=True)
        self._lock = self.root / ".neuralverse-sync.lock"

    def resolve(self, relative: str) -> Path:
        path = Path(relative)
        if (
            not relative
            or "\x00" in relative
            or path.is_absolute()
            or any(part in ("", ".", "..") for part in path.parts)
        ):
            raise VaultSafetyError("unsafe vault path")
        if (
            any(ord(c) < 32 for c in relative)
            or path.parts[0] not in self.configuration.allowed_paths
            or path.parts[0] in self.configuration.excluded_paths
        ):
            raise VaultSafetyError("path outside policy")
        target = (self.root / path).resolve(strict=False)
        if not str(target).startswith(str(self.root) + os.sep):
            raise VaultSafetyError("path escapes vault")
        if len(str(target.relative_to(self.root))) > 240:
            raise VaultSafetyError("path too long")
        for parent in [target, *target.parents]:
            if parent == self.root:
                break
            if parent.is_symlink() and not str(parent.resolve()).startswith(
                str(self.root) + os.sep
            ):
                raise VaultSafetyError("escaping symlink")
        return target

    def read(self, relative: str) -> str | None:
        target = self.resolve(relative)
        if not target.exists():
            return None
        if (
            target.is_symlink()
            or not target.is_file()
            or target.stat().st_size > self.configuration.max_note_bytes
        ):
            raise VaultSafetyError("invalid note target")
        return target.read_text(encoding="utf-8")

    def list_notes(self) -> list[str]:
        result: list[str] = []
        for root in self.root.iterdir():
            if (
                root.name not in self.configuration.allowed_paths
                or root.name in self.configuration.excluded_paths
                or root.is_symlink()
            ):
                continue
            result.extend(
                str(path.relative_to(self.root))
                for path in root.rglob("*.md")
                if path.is_file() and not path.is_symlink()
            )
        return sorted(result)

    @contextmanager
    def lock(self) -> Iterator[None]:
        try:
            fd = os.open(self._lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
            os.write(fd, f"pid={os.getpid()}".encode())
            os.close(fd)
        except FileExistsError as exc:
            raise VaultSafetyError("synchronization lock is held") from exc
        try:
            yield
        finally:
            self._lock.unlink(missing_ok=True)

    def atomic_write(self, relative: str, content: str) -> None:
        target = self.resolve(relative)
        target.parent.mkdir(parents=True, exist_ok=True)
        fd, temp = tempfile.mkstemp(prefix=".nv-sync-", dir=target.parent)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as stream:
                stream.write(content)
                stream.flush()
                os.fsync(stream.fileno())
            os.replace(temp, target)
        finally:
            Path(temp).unlink(missing_ok=True)

    def move(self, old: str, new: str) -> None:
        source, target = self.resolve(old), self.resolve(new)
        if target.exists():
            raise VaultSafetyError("target exists")
        target.parent.mkdir(parents=True, exist_ok=True)
        source.replace(target)

    def archive(self, relative: str) -> str:
        target = self.resolve(relative)
        if_not_exists = not target.exists()
        if if_not_exists:
            return relative
        archived = self.resolve(f"NeuralVerse/.archive/{relative}")
        archived.parent.mkdir(parents=True, exist_ok=True)
        target.replace(archived)
        return str(archived.relative_to(self.root))

    def delete(self, relative: str) -> None:
        self.resolve(relative).unlink(missing_ok=True)


def note_path(identity: NoteIdentity, title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") or "note"
    return f"NeuralVerse/{identity.authority_class.value}/{slug}--{identity.canonical_id}.md"


def render_projection(projection: NoteProjection) -> tuple[str, str]:
    path = projection.path or note_path(projection.identity, projection.title)
    raw, _ = serialize_note(
        projection.identity,
        title=projection.title,
        managed_body=projection.body,
        human_body=projection.human_body,
        links=projection.links,
        extra_frontmatter=projection.frontmatter,
    )
    return path, raw


def compare_three_way(
    base: NoteSnapshot | None, source: NoteProjection, vault: NoteSnapshot | None
) -> Conflict | None:
    if vault is None or base is None:
        return None
    _, raw = render_projection(source)
    source_hash = hashlib.sha256(raw.encode()).hexdigest()
    source_changed = source_hash != base.hashes.full_hash
    vault_changed = vault.hashes.full_hash != base.hashes.full_hash
    if source_changed and vault_changed and source_hash != vault.hashes.full_hash:
        return Conflict(
            ConflictClass.CONCURRENT_EDIT,
            source.identity.key,
            vault.path,
            "source and vault changed from same base",
            source_hash,
            vault.hashes.full_hash,
            base.hashes.full_hash,
        )
    if vault.identity != source.identity:
        return Conflict(
            ConflictClass.FRONTMATTER_AUTHORITY,
            source.identity.key,
            vault.path,
            "vault identity cannot be overwritten",
            source_hash,
            vault.hashes.full_hash,
            base.hashes.full_hash,
        )
    return None


@dataclass(slots=True)
class SynchronizationEngine:
    adapter: LocalFilesystemObsidianVaultAdapter
    audit: list[AuditEvent] = field(default_factory=list)
    baselines: dict[str, NoteSnapshot] = field(default_factory=dict)
    plans: dict[str, SynchronizationPlan] = field(default_factory=dict)
    proposals: dict[str, EditorialCorrectionProposal] = field(default_factory=dict)
    acknowledgements: list[SynchronizationAcknowledgement] = field(default_factory=list)
    overrides: dict[str, SynchronizationManualOverride] = field(default_factory=dict)
    preimages: dict[str, str | None] = field(default_factory=dict)

    def snapshot(self, path: str) -> NoteSnapshot | None:
        raw = self.adapter.read(path)
        return None if raw is None else parse_note(raw, path)

    def plan(
        self,
        projections: Iterable[NoteProjection],
        *,
        direction: SyncDirection = SyncDirection.PUBLISHED_TO_VAULT,
    ) -> SynchronizationPlan:
        items = sorted(projections, key=lambda item: item.identity.key)
        seen: set[str] = set()
        operations: list[SyncOperation] = []
        for projection in items:
            if projection.identity.key in seen:
                raise ValueError("duplicate note identity")
            seen.add(projection.identity.key)
            path, raw = render_projection(projection)
            existing = self.snapshot(path)
            conflict = compare_three_way(
                self.baselines.get(projection.identity.key), projection, existing
            )
            kind = (
                OperationKind.CREATE
                if existing is None
                else OperationKind.NOOP
                if existing.raw == raw and conflict is None
                else OperationKind.UPDATE
            )
            operations.append(
                SyncOperation(
                    uuid.uuid5(uuid.NAMESPACE_URL, projection.identity.key + path).hex,
                    kind,
                    projection.identity,
                    path,
                    expected_hash=existing.hashes.full_hash if existing else None,
                    projection=projection,
                    conflict=conflict,
                )
            )
        source_fingerprint = hashlib.sha256(
            repr([item.identity.key for item in items]).encode()
        ).hexdigest()
        vault_fingerprint = hashlib.sha256(
            repr({p: self.adapter.read(p) for p in self.adapter.list_notes()}).encode()
        ).hexdigest()
        plan = SynchronizationPlan(
            uuid.uuid5(uuid.NAMESPACE_URL, source_fingerprint + vault_fingerprint).hex,
            self.adapter.configuration.vault_id,
            direction,
            operations,
            source_fingerprint,
            vault_fingerprint,
        )
        if any(op.conflict for op in operations):
            plan.status = PlanStatus.AWAITING_APPROVAL
        else:
            plan.status = PlanStatus.PLAN_READY
        self.plans[plan.plan_id] = plan
        self._event(plan, "plan_created", "system", None, {"dry_run": True})
        return plan

    def approve(self, plan: SynchronizationPlan, actor: str) -> SynchronizationApproval:
        if any(op.conflict for op in plan.operations):
            raise ValueError("conflicts require explicit resolution")
        approval = SynchronizationApproval(
            plan.plan_id, plan.digest(), actor, tuple(op.identity.key for op in plan.operations)
        )
        approval.validate(plan)
        plan.status = PlanStatus.APPROVED
        self._event(plan, "approved", actor, None, {})
        return approval

    def dry_run(
        self,
        projections: Iterable[NoteProjection],
        *,
        direction: SyncDirection = SyncDirection.PUBLISHED_TO_VAULT,
    ) -> SynchronizationPlan:
        """Build and persist a plan without modifying vault bytes."""
        return self.plan(projections, direction=direction)

    def resolve_conflict(
        self,
        plan: SynchronizationPlan,
        operation_id: str,
        resolution: ConflictResolution,
        actor: str,
        reason: str,
        *,
        merged_projection: NoteProjection | None = None,
    ) -> SynchronizationAcknowledgement:
        operation = next(
            (item for item in plan.operations if item.operation_id == operation_id), None
        )
        if operation is None or operation.conflict is None:
            raise ValueError("conflict operation not found")
        if not actor or not reason:
            raise ValueError("conflict resolution requires actor and reason")
        if resolution is ConflictResolution.APPLY_MANUAL_MERGE and merged_projection is None:
            raise ValueError("manual merge requires a governed projection")
        if resolution is ConflictResolution.REJECT_OPERATION:
            operation.status = OperationStatus.SKIPPED
        else:
            if merged_projection is not None:
                operation.projection = merged_projection
            operation.conflict = None
            operation.status = OperationStatus.PLANNED
        if not any(item.conflict for item in plan.operations):
            plan.status = PlanStatus.PLAN_READY
        ack = self.acknowledge(
            plan,
            actor,
            action="conflict_resolution",
            target_ids=(operation.operation_id,),
            decision=resolution.value,
            reason=reason,
        )
        return ack

    def acknowledge(
        self,
        plan: SynchronizationPlan,
        actor: str,
        *,
        action: str,
        target_ids: tuple[str, ...],
        decision: str,
        reason: str,
    ) -> SynchronizationAcknowledgement:
        ack = SynchronizationAcknowledgement(
            uuid.uuid4().hex,
            actor,
            action,
            target_ids,
            plan.digest(),
            decision,
            reason,
        )
        ack.validate()
        self.acknowledgements.append(ack)
        self._event(plan, "acknowledged", actor, None, {"action": action, "decision": decision})
        return ack

    def manual_override(
        self,
        plan: SynchronizationPlan,
        operation: SyncOperation,
        *,
        selected_authority: str,
        scope: str,
        reason: str,
        approver: str,
        expires_at: datetime | None = None,
    ) -> SynchronizationManualOverride:
        override = SynchronizationManualOverride(
            uuid.uuid4().hex,
            plan.vault_id,
            operation.identity.key,
            scope,
            selected_authority,
            reason,
            approver,
            (operation.conflict.source_hash or "") if operation.conflict else "",
            (operation.conflict.vault_hash or "") if operation.conflict else "",
            expires_at=expires_at,
        )
        override.validate(plan.vault_id)
        self.overrides[override.override_id] = override
        self.acknowledge(
            plan,
            approver,
            action="manual_override",
            target_ids=(override.override_id, operation.operation_id),
            decision=selected_authority,
            reason=reason,
        )
        return override

    def execute(
        self,
        plan: SynchronizationPlan,
        approval: SynchronizationApproval,
        *,
        fail_after: int | None = None,
    ) -> SynchronizationPlan:
        approval.validate(plan)
        if plan.status not in {
            PlanStatus.APPROVED,
            PlanStatus.PARTIALLY_APPLIED,
            PlanStatus.FAILED,
        }:
            raise ValueError("plan is not approved for execution")
        plan.status = PlanStatus.EXECUTING
        applied = 0
        try:
            with self.adapter.lock():
                for operation in plan.operations:
                    if operation.kind is OperationKind.NOOP:
                        operation.status = OperationStatus.SKIPPED
                        continue
                    if not operation.projection:
                        raise ValueError("missing projection")
                    path, raw = render_projection(operation.projection)
                    current = self.adapter.read(path)
                    operation.attempts += 1
                    operation.preimage_hash = (
                        parse_note(current, path).hashes.full_hash if current is not None else None
                    )
                    preimage_key = f"{plan.plan_id}:{operation.operation_id}"
                    self.preimages.setdefault(preimage_key, current)
                    operation.status = OperationStatus.PRECONDITION_VALIDATED
                    if (
                        operation.expected_hash
                        and current
                        and parse_note(current, path).hashes.full_hash != operation.expected_hash
                    ):
                        raise ValueError("precondition changed")
                    self.adapter.atomic_write(path, raw)
                    operation.status = OperationStatus.APPLIED
                    operation.actual_hash = parse_note(raw, path).hashes.full_hash
                    operation.status = OperationStatus.VALIDATED
                    applied += 1
                    self._event(
                        plan, operation.kind.value, "system", operation.operation_id, {"path": path}
                    )
                    if fail_after is not None and applied >= fail_after:
                        raise RuntimeError("injected failure")
            plan.status = PlanStatus.COMPLETED
            return plan
        except Exception as exc:
            plan.status = PlanStatus.PARTIALLY_APPLIED if applied else PlanStatus.FAILED
            for operation in plan.operations:
                if operation.status is OperationStatus.PRECONDITION_VALIDATED:
                    operation.status = OperationStatus.FAILED
                    operation.error_classification = type(exc).__name__
            self._event(
                plan, "failed", "system", None, {"error": type(exc).__name__, "applied": applied}
            )
            raise

    def retry(
        self,
        plan: SynchronizationPlan,
        approval: SynchronizationApproval,
    ) -> SynchronizationPlan:
        """Retry a failed/partial plan with the same immutable approval."""
        if plan.status not in {PlanStatus.PARTIALLY_APPLIED, PlanStatus.FAILED}:
            raise ValueError("only failed or partial plans may be retried")
        self._event(plan, "retry_requested", "system", None, {})
        return self.execute(plan, approval)

    def rollback(self, plan: SynchronizationPlan) -> None:
        if plan.status not in {
            PlanStatus.PARTIALLY_APPLIED,
            PlanStatus.FAILED,
            PlanStatus.COMPLETED,
        }:
            raise ValueError("plan is not eligible for rollback")
        plan.status = PlanStatus.ROLLBACK_PENDING
        with self.adapter.lock():
            for operation in plan.operations:
                preimage = self.preimages.get(f"{plan.plan_id}:{operation.operation_id}")
                if preimage is not None:
                    self.adapter.atomic_write(operation.path, preimage)
                    operation.status = OperationStatus.ROLLED_BACK
                elif operation.kind is OperationKind.CREATE:
                    self.adapter.delete(operation.path)
        plan.status = PlanStatus.ROLLED_BACK
        self._event(plan, "rolled_back", "system", None, {})

    def editorial_proposal(self, identity: NoteIdentity, path: str) -> EditorialCorrectionProposal:
        note = self.snapshot(path)
        if note is None:
            raise ValueError("note not found")
        baseline = self.baselines.get(identity.key)
        proposal = EditorialCorrectionProposal(
            uuid.uuid4().hex,
            identity,
            path,
            baseline.hashes.full_hash if baseline is not None else "",
            note.hashes.full_hash,
            note.human_body,
            (identity.key,),
        )
        self.proposals[proposal.proposal_id] = proposal
        return proposal

    def orphans(self, known: set[str]) -> list[Orphan]:
        result: list[Orphan] = []
        for path in self.adapter.list_notes():
            note = self.snapshot(path)
            if note is None or note.identity.key not in known:
                result.append(
                    Orphan(
                        path, note.identity if note else None, "projection has no current source"
                    )
                )
        return result

    def _event(
        self,
        plan: SynchronizationPlan,
        event_type: str,
        actor: str,
        operation_id: str | None,
        payload: Mapping[str, Any],
    ) -> None:
        self.audit.append(
            AuditEvent(
                uuid.uuid4().hex, plan.plan_id, event_type, actor, operation_id, dict(payload)
            )
        )


@dataclass(slots=True)
class SynchronizationWorkflow:
    """Deterministic workflow facade for the durable workflow adapter.

    The facade owns no database or Temporal SDK state. It makes lifecycle
    transitions explicit and is safe to replay; a production worker persists
    the plan, acknowledgements and audit events through the migration tables.
    """

    engine: SynchronizationEngine
    plan: SynchronizationPlan | None = None
    approval: SynchronizationApproval | None = None
    cancelled: bool = False

    def request(
        self,
        projections: Iterable[NoteProjection],
        *,
        direction: SyncDirection = SyncDirection.PUBLISHED_TO_VAULT,
    ) -> SynchronizationPlan:
        if self.plan is not None and self.plan.status not in {
            PlanStatus.FAILED,
            PlanStatus.CANCELLED,
            PlanStatus.ROLLED_BACK,
        }:
            return self.plan
        self.plan = self.engine.dry_run(projections, direction=direction)
        return self.plan

    def approve(self, actor: str) -> SynchronizationApproval:
        if self.plan is None:
            raise ValueError("workflow has no plan")
        self.approval = self.engine.approve(self.plan, actor)
        return self.approval

    def execute(self) -> SynchronizationPlan:
        if self.plan is None or self.approval is None:
            raise ValueError("workflow requires an approved plan")
        if self.cancelled:
            raise ValueError("workflow is cancelled")
        return self.engine.execute(self.plan, self.approval)

    def retry(self) -> SynchronizationPlan:
        if self.plan is None or self.approval is None:
            raise ValueError("workflow requires an approved plan")
        return self.engine.retry(self.plan, self.approval)

    def rollback(self) -> None:
        if self.plan is None:
            raise ValueError("workflow has no plan")
        self.engine.rollback(self.plan)

    def cancel(self, actor: str = "system") -> None:
        if self.plan is None or self.plan.status in {
            PlanStatus.COMPLETED,
            PlanStatus.ROLLED_BACK,
        }:
            raise ValueError("workflow is not cancellable")
        self.cancelled = True
        self.plan.status = PlanStatus.CANCELLED
        self.engine._event(self.plan, "cancelled", actor, None, {})

    def query(self) -> PlanStatus | None:
        return self.plan.status if self.plan else None


def backlinks(projections: Iterable[NoteProjection]) -> dict[str, tuple[str, ...]]:
    values: dict[str, set[str]] = {}
    for projection in projections:
        for link in projection.links:
            values.setdefault(link, set()).add(projection.identity.key)
    return {key: tuple(sorted(items)) for key, items in sorted(values.items())}
