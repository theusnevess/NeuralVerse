---
title: Stage 14 — Obsidian Synchronization Execution
canonical_id: NV-STAGE-14-OBS-SYNC
version: 1.0.0
status: IMPLEMENTED
milestone_mapping: NOT_DEFINED
---

# Stage 14 — Obsidian Synchronization Execution

Stage 14 implements a governed, deterministic projection from repository or
published Backend state into a local Obsidian vault. Obsidian remains the
editorial and knowledge-governance authority; Backend remains the operational
authority. A vault edit becomes an editorial correction proposal and never
silently overwrites canonical content or an immutable publication release.

## Authority and direction policy

`PUBLISHED_TO_VAULT` and `REPOSITORY_TO_VAULT` may create or update managed
projection sections after a human approval. `VAULT_TO_PROPOSAL` only creates a
reviewable proposal. Automatic Git commits, publication, learner-state sync,
plugin installation, application-settings changes and unrestricted two-way
overwrite are prohibited.

## Governed vault configuration and safety

`VaultConfiguration` pins a vault identifier, allowed roots, excluded roots,
schema version and note-size bound. `LocalFilesystemObsidianVaultAdapter`
rejects absolute paths, traversal, NUL/control characters, reserved roots,
escaping symlinks, directory/file collisions, excessive paths and oversized
notes. Writes use a same-directory temporary file, fsync and atomic replace.
A process lock prevents concurrent writers; no Obsidian UI or plugin is
required.

## Identity, path and frontmatter

`NoteIdentity` is `(canonical_id, authority_class, version)`. Paths are stable
managed paths of the form `NeuralVerse/<authority>/<slug>--<canonical_id>.md`.
Frontmatter is `NeuralVerseObsidianFrontmatter/1.0.0`, serialized with safe
YAML and deterministic key ordering. It carries `nv_id`, `nv_authority`,
`nv_version`, `nv_title`, link references and semantic hashes. Secret-like
fields, unsafe YAML values and unsupported schemas are rejected. Unknown
human-owned keys are preserved.

## Managed sections and serialization

Only the bounded section between
`<!-- neuralverse:managed:start -->` and
`<!-- neuralverse:managed:end -->` is projection-owned. Human body text and
manual links outside that section remain untouched. Newlines, links and
frontmatter ordering are normalized before hashing, so identical semantic
content produces identical bytes and hashes.

## Plans, dry-run, approval and lifecycle

`SynchronizationEngine.plan` produces deterministic operations (`CREATE`,
`UPDATE`, `MOVE`, `ARCHIVE`, `DELETE`, or `NOOP`) with source and vault
fingerprints. Dry-run performs no vault write. `SynchronizationApproval` binds
an actor, exact plan hash and exact identity scope, and rejects stale, expired,
partial or conflicted approvals. Execution is idempotent, preconditioned and
audited. Partial failures are explicit, resumable or rollbackable; they never
become `COMPLETED` falsely.

## Hashing and conflict policy

Source, frontmatter, managed-section and full-note hashes are recorded. A
three-way comparison distinguishes source-only, vault-only and concurrent
changes. Identity, path, frontmatter-authority, managed-section, deleted
projection, unsupported-schema and orphan conflicts are explicit. Conflicted
plans cannot be approved without a separate reviewed resolution.

## Links, graph integrity and orphans

Projections carry deterministic wiki-link identities for concepts, curriculum
nodes, sources, contributions, assets, laboratory specifications and
assessment specifications. `backlinks` builds stable reverse references.
Missing targets, ambiguous aliases, stale managed links and invalid headings
are validation failures. Orphans are reported with an explicit reason and
approval requirement; editorial notes and historical releases are never
automatically deleted. Archive is the default destructive operation.

## Editorial correction intake

`editorial_proposal` captures base hash, vault hash, path, affected identity
and diff. Acceptance, rejection and supersession are human decisions that must
create a future canonical revision through the existing governance pipeline.
No proposal mutates a repository file, PublicationRelease or Git history.

## Durable records and workflow boundary

The additive migration `b60000000001` defines plan, operation, baseline,
proposal and append-only audit-event tables from the committed Stage 13 head
`b57000000001`. The Python engine is storage-neutral and can be called by the
existing durable workflow boundary; workflow nondeterminism, duplicate writes
and lost approvals are forbidden. Disposable PostgreSQL 16 certification
covered empty-database upgrade, downgrade to `b57000000001`, re-upgrade,
constraints and transaction-safe DDL. The migration is not applied to a
production database by this implementation task.

## Validation matrix

The focused Stage 14 tests cover deterministic serialization, safe YAML
frontmatter, identity and path policy, create/update/no-op idempotency,
three-way conflict detection, partial-failure classification, retry,
rollback/preimage restoration, acknowledgements, manual overrides and secret
rejection (8 passed). The Backend unit suite passes with 398 tests. Ruff,
Mypy, compileall and `git diff --check` pass for the Stage 14 package.
Disposable Temporal certification covers approval signaling, retry, workflow
replay and cancellation. A governed-mirror dry-run verified byte-preserving
planning. Durable database persistence is represented by the migration and
certified on PostgreSQL 16; production vault writes remain disabled.

## Known limitations and explicit non-goals

No unrestricted bidirectional overwrite, automatic Git commit/push, automatic
publication, Obsidian plugin, Electron automation, learner-state projection,
secret storage, production-vault write, or silent deletion is implemented.
Canonical-vault writes remain disabled until owner approval, backup evidence,
and a separately authorized finalization task.
