# Current State

The required baseline is `e192a2e939ba904dc5c42274ce8bdfc4362e13ba` on
`feat/backend-integration-platform`. Stage 5 changes intentionally remain
unstaged for owner review. Core BIP-M2 evidence is complete against PostgreSQL
16 and a clean reset-and-upgrade database. Bounded-context representative-data
and repository round-trip evidence are complete, and Stage 5 is certified with
conditions as `BIP_CANONICAL_DOMAIN_PERSISTENCE_CERTIFIED_WITH_CONDITIONS`.
Earlier preserved worktree changes include cross-front workflow material; that
material is classified as future-stage or pre-existing unless it is directly
required by canonical persistence.

NV-BIP-M6: `CERTIFIED WITH CONDITIONS — COMMITTED`

XFO release: `nv-xfo-delivery-contracts-v1.0.0`

XFO release commit: `cfbf782b232d0db94e6e6ab6e35a9e35c35bfc91`

PublishedLearningPackage: `CERTIFIED WITH CONDITIONS`

PublicationRelease output contract: `CERTIFIED WITH CONDITIONS`

DeliveryManifest: `CERTIFIED WITH CONDITIONS`

Minimal read-only delivery API: `CERTIFIED WITH CONDITIONS`

Published-only delivery: `IMPLEMENTED`

Coherent release guarantee: `IMPLEMENTED`

Conditional requests: `IMPLEMENTED`

Compressed responses: `IMPLEMENTED`

Payload bounds: `IMPLEMENTED`

Database-independent delivery contracts: `IMPLEMENTED`

Frontend integration: `NOT IMPLEMENTED`

Publication execution: `NOT IMPLEMENTED`

Mutable backend APIs: `NOT IMPLEMENTED`

Obsidian synchronization execution: `NOT IMPLEMENTED`

## Stage 4 — BIP-M0 Mission, Boundaries and Baseline

BIP-M0 is `IMPLEMENTED`. The canonical mission,
authority boundaries, technology baseline, bounded contexts, source-of-truth
matrix, shared handoff objects, lifecycle rules, workflow ownership, database
boundaries, Frontend migration strategy and deferred decisions are documented
in `backend-integration-platform-m0-mission-boundaries-baseline.md` and remain
`APPROVED` after owner finalization.

The reviewed Backend baseline is `2c22b7dbe0966339158b6b792561ceb0f30a2e5d`;
`e192a2e939ba904dc5c42274ce8bdfc4362e13ba` is the prior Stage 5 baseline.
BIP-M1 through BIP-M9 remain `NOT_AUTHORIZED` as new work; existing committed
evidence is preserved. This additive section does not alter the concurrent
implementation or delivery evidence recorded above.


## Stage 7 — BIP-M3 Content Versioning and Publication

BIP-M3 is `IMPLEMENTED_PENDING_OWNER_REVIEW` at migration head
`b51000000001`. Immutable versions and ordered blocks, publication gates,
release numbering, supersession/deprecation/retirement, audit records,
delivery manifests, idempotent commands and transactional outbox persistence
are implemented and validated against PostgreSQL 16. External delivery,
workflow orchestration, Frontend, Obsidian synchronization and BIP-M4+
remain separately unauthorized.

## Stage 5 — BIP-M1 Shared Contract Intake and Domain Model

BIP-M1 here denotes the canonical shared-contract intake/domain phase and is
distinct from earlier fixture or persistence evidence retained above.

BIP-M1 is `IMPLEMENTED`. The persistence-neutral intake,
lossless adapters, compatibility validation, immutable domain projections,
domain invariants, repository ports and unit-of-work protocol are documented
in `backend-integration-platform-m1-shared-contract-intake-domain-model.md`.
Concrete persistence, SQLAlchemy mappings, migrations, workflows, APIs,
publication, delivery, learner state, Frontend and ACP changes remain
`NOT_IMPLEMENTED` or `NOT_AUTHORIZED`.
This Stage 5 section supersedes the earlier Stage 4 pre-authorization wording
for BIP-M1 only; BIP-M2 through BIP-M9 remain separately unauthorized.
