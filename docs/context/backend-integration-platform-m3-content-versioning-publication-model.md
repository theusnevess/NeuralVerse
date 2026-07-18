# BIP-M3 — Content Versioning and Publication Model

```yaml
title: BIP-M3 — Content Versioning and Publication Model
canonical_id: NV-BIP-M3
version: 1.0.0
status: IMPLEMENTED_PENDING_OWNER_REVIEW
authority: [NV-BIP-000, NV-BIP-M0, NV-BIP-M1, NV-BIP-M2, NV-XFI-000]
owner: NeuralVerse Hub
language: en
created: 2026-07-18
last_reviewed: 2026-07-18
```

Status: `IMPLEMENTED_PENDING_OWNER_REVIEW`

Migration head: `b51000000001` (additive successor of BIP-M2 `b50000000001`)

## Scope and authority

BIP-M3 is Backend-owned operational publication infrastructure. ACP remains
the authority for semantic package meaning and readiness recommendation;
Backend validates and persists the exact approved version without rewriting
semantic content. Temporal, HTTP delivery, S3, search, Redis, learner state,
Frontend, Obsidian execution and BIP-M4+ are outside this phase.

Predecessor status: BIP-M0 `IMPLEMENTED`, BIP-M1 `IMPLEMENTED`, BIP-M2
`IMPLEMENTED`; BIP-M4 through BIP-M9 `NOT_AUTHORIZED`.

## Lifecycle and immutability

Draft content progresses through review and governance gates before release.
Content versions and their ordered blocks are immutable after publication.
Publication releases have explicit `pending`, `released`, `superseded`,
`deprecated` and `retired` states. A release number is monotonic per package;
supersession points to an earlier immutable release and never mutates its
content version.

## Publication gates

`PublicationTransactionService` requires an authorized actor, a canonical
idempotency key, package/version/schema identity, `READY_FOR_PUBLICATION`,
governance approval, completed manual review, valid source manifests and ready
asset manifests. P0, P1 and UNKNOWN findings block publication. Duplicate
block order, package/version mismatch, already-published versions and invalid
manifests are rejected.

## Atomic transaction

The service locks the package row, allocates the next release number, persists
the immutable release and delivery manifest, marks the version published,
writes a publication audit record and appends a `publication.released`
transactional outbox event in one SQL transaction. Reusing an idempotency key
with the same canonical request returns the original release snapshot; reuse
with a changed request is rejected. No external transport is called before
commit.

## Evidence

PostgreSQL 16 integration passed on an isolated database, including migration
upgrade, downgrade/re-upgrade, rollback behavior, persistence constraints and
concurrent transaction coverage. Unit, migration and integration validation
passed. External delivery, broker dispatch and publication HTTP remain
separately authorized work.

Publication API: `NOT_IMPLEMENTED BY BIP-M3`.
External outbox transport: `NOT_IMPLEMENTED`.
Reference-package publication: `NOT_IMPLEMENTED BY BIP-M3`.
