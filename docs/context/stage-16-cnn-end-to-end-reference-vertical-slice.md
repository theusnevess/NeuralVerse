---
title: Stage 16 — CNN End-to-End Reference Vertical Slice
canonical_id: NV-STAGE-16-CNN-E2E
version: 1.1.0
status: CERTIFICATION_BLOCKED
package: package:cnn-fundamentals-reference@1.0.0
predecessor: c8a37c456db208f1cd5cfc3e4475ef71dc26bb79
---

# Stage 16 — CNN End-to-End Reference Vertical Slice

Stage 16 uses the existing ACP authoring runtime, Backend durable workflow,
publication transaction, delivery contracts, learner-state services,
laboratory and assessment services, and Obsidian governance. It does not add
a second architecture.

## Canonical identity

```text
package:cnn-fundamentals-reference@1.0.0
curriculum-node:cnn-fundamentals
Module 2 — Deep Learning & Foundation Models /
Convolutional Networks / CNN Fundamentals
```

The ACP read-only fixture is present and independently validated: ten
contributions, sixty-two ordered content blocks, deterministic compilation,
and an honest human-review-required publication handoff.

## Implemented certification harness

`neuralverse_backend.stage16` provides the frozen identity and explicit gate
ledger used by the Stage 16 certification. Missing evidence is never promoted
to PASS; environment-blocked gates retain their blocker and fingerprint.
The harness also enforces that previously removed experimental content remains
absent. The current evidence ledger fingerprint is
`80b899f69b5e3571ba737ce49b8270011b84c8fa1548c3e21b955b7ae60c0b5d`.

## Validation completed

```text
ACP package tests: 9,068 passed, 1 failed after warming local Ollama
ACP Stage 16/fixture typecheck: PASS
ACP CNN fixture: COMPILED
ACP package evaluation: PASS_WITH_FINDINGS (no findings)
Stage 15 predecessor: PASS
Stage 16 harness tests: PASS
Backend unit suite: 410 passed

Canonical bridge: PASS after clone approval; `b650 → c000`, one head,
`compare_metadata` drift `0`, 909 source rows preserved, and replay `NOOP`.

The remaining local-only failure is the pre-existing CanvasRenderer ordering
regression. The local-inference structured-output probe passed after warming
the local Ollama model. The CanvasRenderer failure must not be reclassified as
Stage 16 success or repaired from the Backend worktree. Repository-wide ACP
TypeScript validation still reports historical errors and is not represented as
a clean Stage 16 gate.
```

## Certification boundary

The disposable PostgreSQL 16 environment is available for this audit. A
fresh database was upgraded through `b61000000001`, downgraded to
`b60000000001`, and re-upgraded successfully. The real Temporal service at
`127.0.0.1:7233` also executed the Stage 15 review/publication workflow with
review and authorization signals, producing `PUBLISHED`. These results are
recorded as infrastructure evidence, not as a substitute for the complete
Stage 16 vertical slice.

An ephemeral MinIO endpoint was subsequently started on loopback and passed
PUT, HEAD, GET, SHA-256 metadata verification and DELETE. Chrome is also
available and rendered the static NeuralVerse shell successfully. The complete
delivery gate is still not certified: the browser was not connected to a live
Backend delivery response, and the ACP repository still has a pre-existing
CanvasRenderer ordering failure in its broad suite. The ACP-to-Backend intake,
publication transaction, live delivery, learner restoration, backup and
lineage gates therefore remain explicitly `BLOCKED_ENVIRONMENT`; none is
inferred from unit fixtures.

The live Backend API intake route was also exercised on loopback against the
disposable PostgreSQL database. All four NV-XFI-000 canonical-input requests
reached the route but returned HTTP 503 `PERSISTENCE_FAILURE`. The current
dirty Backend tree contains concurrent lineage columns and migration heads
that do not exist in the certified `b61000000001` database schema. No manual
database assembly was performed. That was the pre-repair result and is
retained as historical evidence rather than a fabricated round-trip success.

A clean `c8a37c4` candidate was then tested with the additive Stage 16
`b63000000001` lineage repair migration. The fresh PostgreSQL 16 database
upgraded to that single head, and the same four real contract requests returned
HTTP 200. Four canonical-input rows, four idempotency rows, four outbox rows,
and two authoring-job rows were durably persisted. The repair is recorded in
commit `358f6fc` (`fix(bip): reconcile stage16 lineage persistence baseline`).
This proves the repaired ACP intake path in the clean candidate; it does not
absorb the unrelated dirty BIP-M9 migration branch into the Stage 16 commit.

The repaired intake also passed idempotency checks: replaying the same key and
payload returned the same canonical-input ID with `replayed: true`, while the
same key with a valid changed payload returned HTTP 409
`IDEMPOTENCY_CONFLICT`. No duplicate canonical-input or outbox row was created.

The canonical script location now exposes one Alembic head
(`c00000000001`). The historical dirty BIP-M9 files remain preserved under
the legacy script location and were not rewritten or absorbed into the Stage
16 commit.

No production publication, learner data mutation, Obsidian overwrite, push,
tag, merge or release was performed. The isolated persistence repair is
committed; the remaining Stage 16 harness and integration changes remain
uncommitted for owner review. The primary worktree still has the concurrent
BIP-M9 migration head `b62000000001`; it remains outside the Stage 16 commit
and prevents a clean primary-tree Alembic certification.
