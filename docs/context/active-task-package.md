# Active Task Package

NV-BIP-M5: CERTIFIED WITH CONDITIONS - BIP_CANONICAL_DOMAIN_PERSISTENCE_CERTIFIED_WITH_CONDITIONS.

BIP-M2 canonical persistence is implemented and certified with conditions.
At the historical Stage 5 certification boundary, durable workflow execution,
publication execution, frontend integration, and Obsidian synchronization
execution were not implemented and remained outside that certification.
Stage 8 below supersedes the workflow portion only.

At the historical Stage 6 certification boundary, NV-BIP-M6-IMPLEMENT was
certified with conditions and the XFO release was tagged; its owner commit
was the remaining finalization operation. Stage 10 below supersedes that
delivery state.

## Stage 4 — BIP-M0 Mission, Boundaries and Baseline

BIP-M0 is `IMPLEMENTED` and is documented in
`backend-integration-platform-m0-mission-boundaries-baseline.md`. Its
technology, bounded-context, source-of-truth, lifecycle, workflow, database,
Frontend migration and deferred-decision records are
`APPROVED`. No BIP-M1 through BIP-M9 implementation is
authorized by this documentation phase. This section records owner approval
without changing the concurrent Stage 5/6 task statements above.

## NV-STAGE7 reference candidate

Status: `IMPLEMENTED WITH CONDITIONS — CERTIFICATION REQUIRED`

The backend reference-package boundary validates ACP-produced draft and
readiness bytes, stable package identity, ordered blocks, source/citation
integrity and the six required asset requests. Canonical PostgreSQL projection,
governance transaction, manifest creation and live release delivery remain the
certification work item.

## Stage 7 — BIP-M3 publication model

BIP-M3 is `IMPLEMENTED` with migration head
`b51000000001`. The Backend publication transaction, immutable release model,
publication gates, delivery manifest, audit and transactional outbox are
validated. External delivery and later BIP milestones remain deferred.

## Stage 5 — BIP-M1 Shared Contract Intake and Domain Model

BIP-M1 here denotes the canonical shared-contract intake/domain phase and is
distinct from earlier fixture or persistence evidence retained above.

BIP-M1 is `IMPLEMENTED`. The intake boundary consumes
the released NV-XFI contract snapshot with lossless raw-byte preservation,
compatibility checks, backend wrapper metadata and explicit stable errors.
The persistence-neutral domain model, aggregate projections, invariants,
repository ports and unit-of-work protocol are implemented and covered by
the dedicated BIP-M1 fixture tests. At that historical phase boundary,
concrete persistence, migrations, workflow execution, APIs, publication,
delivery, Frontend, ACP and runtime integration remained `NOT_IMPLEMENTED`
and required separate authorization. Stage 8 below supersedes workflow
execution only.
This Stage 5 state supersedes the earlier Stage 4 pre-authorization wording
for BIP-M1 only; BIP-M2 through BIP-M9 remain separately unauthorized.

## Stage 8 — BIP-M4 Durable Workflow Infrastructure

BIP-M4 implementation is `IMPLEMENTED`.
The deterministic workflow state model, optional Temporal client/worker host,
semantic-free ACP adapter, bounded activity policies, durable operational
projections, review/revision/cancellation state and BIP-M3 publication adapter
are in the BIP-M4 candidate scope. Task-queue delivery, signals,
cancellation, bounded retry, worker-restart and resume were certified on a
disposable local non-production Temporal environment. BIP-M5+ remain
`NOT_AUTHORIZED`.

## Stage 9 — BIP-M5 Assets, Search and Retrieval

BIP-M5 is `IMPLEMENTED` at migration head `b53000000001`. PostgreSQL 16.4,
pgvector 0.7.4 and disposable loopback MinIO certification passed for empty
upgrade/downgrade/re-upgrade, asset integrity, lexical FTS, vector and hybrid
retrieval, readiness and index freshness. Production infrastructure and
latency SLOs remain out of scope; at that historical Stage 9 boundary BIP-M6
was `NOT_AUTHORIZED`.

## Stage 10 — BIP-M6 Content Delivery API

BIP-M6 is `IMPLEMENTED`. Its exact-release read boundary
is `/api/v1/publication/releases/{release_id}` and preserves immutable package,
content-version and release identity with ordered blocks, source/citation,
asset, laboratory, assessment and accessibility projections. ETag,
conditional requests, representation negotiation, cache policy, gzip and
typed errors are implemented and certified against disposable PostgreSQL 16
with pgvector 0.7.4, including an exact-release round trip, ETag/304, gzip,
version negotiation and structured 404 behavior. BIP-M7 is now
`IMPLEMENTED`; its learner-scoped, exact-version, revisioned API, portability,
deletion and privacy boundaries are implemented and certified on disposable
PostgreSQL 16 infrastructure.
Frontend synchronization and learner-data training paths remain unauthorized.

## M9 — Durable workflow integration certification

M9 is
`BIP_M9_OPERATIONAL_VALIDATION_AND_CERTIFICATION_CERTIFIED_WITH_CONDITIONS`.
The historical open-gate statement for restart, replay, full workflow,
PostgreSQL concurrency and clean-copy validation is superseded by Stage 17
certification evidence.

The candidate now includes a bounded workflow artifact-reference map, explicit
operation dependency descriptors, persisted lineage columns and activity-side
canonical reference loading. The live operational and canonical Playwright
gates passed; Stage 9 is closed. Stage 10 BIP-M3 Publication Transaction is
authorized but not implemented in this task. Owner review, tag, push and
defined production-scale validation remain conditions.

## Stage 12 — BIP-M8 Frontend Integration Vertical Slice

Status: `IMPLEMENTED`.
The flag-gated exact-release delivery adapter, schema/version validation,
renderer registry, ETag/304 cache boundary, learner-state merge boundary and
idempotent laboratory/assessment submission adapters are implemented without
Backend schema changes. A disposable PostgreSQL 16 reference release passed
live API and Chrome headless delivery, ordered rendering and both learner
submission paths. Legacy static rendering remains available. Formal
visual/accessibility certification passes through the project-local Playwright
and Axe checks. The approved Frontend-safe workflow-progress contract is
committed in `13c2b363ebd1560f704f7d967448692f5bab8aa3` and consumes only the
versioned BIP-M4 projection; BIP-M9 is not authorized by this task.
