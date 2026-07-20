# Active Task Package

NV-BIP-M5: CERTIFIED WITH CONDITIONS - BIP_CANONICAL_DOMAIN_PERSISTENCE_CERTIFIED_WITH_CONDITIONS.

BIP-M2 canonical persistence is implemented and certified with conditions.
Durable workflow execution, publication execution, frontend integration, and
Obsidian synchronization execution are not implemented and remain outside
Stage 5 certification.

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
the dedicated BIP-M1 fixture tests. Concrete persistence, migrations,
workflow execution, APIs, publication, delivery, Frontend, ACP and runtime
integration remain `NOT_IMPLEMENTED` and require separate authorization.
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
