# NeuralVerse Backend Platform Implementation Sequence

Canonical identifier: `NV-BIP-M0-P6-SEQUENCE`<br>
Version: `1.0`<br>
Status: `DECIDED WITH CONDITIONS`<br>
Owner: NeuralVerse project owner and backend platform implementer<br>
Authority: NV-BIP-000, NV-ACP-000, and BIP-M0 Phase 6 target architecture<br>
Related documents: `backend-platform-target-architecture.md`, `backend-platform-security-baseline.md`, `backend-platform-local-development-model.md`, `backend-platform-cross-front-decisions.md`<br>
Supersession: None<br>
Last review date: `2026-07-16`

## Sequence Rules

Each phase must leave the browser-first frontend usable, add only the dependency required by its owning capability, and include failure-path tests before the next dependency is introduced. No phase may invent unresolved shared semantics.

## Ordered Phases

### Phase A — Python Foundation

Owner: backend platform<br>
Dependencies: none beyond an approved Python toolchain<br>
Introduces: Python project metadata, FastAPI, Pydantic, typed configuration, structured logging, error envelope, correlation middleware, liveness/readiness skeleton, pytest<br>
Gate: app imports, configuration rejects invalid required values, health semantics are tested, no secrets appear in logs<br>
Failure behavior: invalid configuration fails startup; liveness remains process-only; readiness reports missing required capabilities<br>
Removal strategy: all code is framework-isolated behind application interfaces

### Phase B — Persistence Foundation

Owner: backend platform/operations<br>
Introduces: SQLAlchemy 2, PostgreSQL, Alembic, database session lifecycle, migration-state readiness, test database setup<br>
Gate: empty database upgrade, representative schema validation, rollback policy review, transaction tests<br>
Failure behavior: API is not ready when required database connectivity or migrations are unavailable<br>
Removal strategy: repository interfaces isolate persistence from domain services

### Phase C — First Published Package Persistence Slice

Owner: content, governance, publication, learner, operations modules<br>
Introduces: package/version/readiness/release/interaction/idempotency/audit/outbox concepts, fixture-driven authoring boundary, delivery and learner endpoints<br>
Gate: one immutable release can be delivered and one learner interaction can reference its exact content version and release<br>
Failure behavior: publication is atomic; failed readiness or persistence creates no visible release<br>
Removal strategy: delivery adapter keeps static frontend path available

### Phase D — Frontend Delivery Adapter

Owner: frontend and backend integration<br>
Introduces: health-gated feature flag, fixture/API delivery adapter, contract tests, equivalence comparison against static loader<br>
Gate: fallback to static delivery works and published package identity/version is preserved<br>
Failure behavior: API unavailability uses the approved static fallback; no silent semantic substitution<br>
Removal strategy: legacy loader is deprecated only after equivalence evidence

### Phase E — Durable Workflow Capability and Canonical Reference Slice

Owner: orchestration, authoring, governance, publication, and agent-worker adapter<br>
Introduces: Temporal service/worker, agent-worker adapter, durable authoring workflow, and workflow projections required by NV-BIP-000<br>
Gate: a named workflow has durable retryable state, deterministic workflow IDs, tested retry/timeout/cancellation, and an operational owner<br>
Failure behavior: workflow unavailable is explicit; synchronous commands do not pretend workflow completion<br>
Removal strategy: workflow interfaces remain separate from domain-state persistence

### Phase F — Managed Assets

Owner: assets/operations<br>
Introduces: S3-compatible object storage, immutable object keys, asset metadata, provenance/license/accessibility publication gates<br>
Gate: binary upload/finalization, checksum or integrity strategy, versioned delivery, and missing-asset failure tests<br>
Failure behavior: release is blocked when required assets are not ready<br>
Removal strategy: legacy relative paths remain readable through an adapter during migration

### Phase G — Redis Acceleration

Owner: operations/performance<br>
Introduces: Redis only for rate limits, caches, or bounded coordination justified by measured need<br>
Gate: correctness tests pass with Redis unavailable and cache invalidation is explicit<br>
Failure behavior: bypass cache or use local limits; never lose canonical state<br>
Removal strategy: every Redis use has a database or in-process fallback

### Phase H — Telemetry Export

Owner: operations<br>
Introduces: OpenTelemetry traces/metrics and, later, a Collector<br>
Gate: sensitive-data policy, sampling, retention, and exporter failure behavior are approved<br>
Failure behavior: local structured logs continue when exporter is unavailable<br>
Removal strategy: instrumentation remains optional and non-blocking

### Phase I — Search Expansion

Owner: search/retrieval authority<br>
Introduces: PostgreSQL relational filters, then Full-Text Search, then pgvector only after CF-015 is resolved<br>
Gate: ranking, provenance, version filtering, and embedding ownership are documented and tested<br>
Failure behavior: fall back to relational/FTS retrieval; semantic search does not fabricate provenance<br>
Removal strategy: indexes can be rebuilt from canonical content snapshots

## First Slice Dependency Set

Required for persistence fixture: Python runtime, FastAPI, Pydantic, typed configuration, structured logging, pytest, SQLAlchemy 2, PostgreSQL, Alembic.<br>
Required for the canonical reference slice: Temporal/workflow worker, agent-worker adapter boundary, required asset storage capability, and observability hooks.<br>
Deferred: broad Redis acceleration, pgvector, external identity provider, OpenAI integration, and production authoring UI.

## First Slice Contract

```text
TEST FIXTURE / NON-CANONICAL / NOT AGENT-GENERATED
LearningPackageDraft fixture
  -> Pydantic transport validation
  -> lossless semantic payload preservation
  -> PostgreSQL transaction
  -> ContentPackage + immutable ContentVersion
  -> PublicationReadinessRecommendation record
  -> publication-gate evaluation
  -> immutable PublicationRelease
  -> Delivery API response
  -> one LearnerInteraction referencing exact content version and release
  -> audit and correlation metadata
```

Required endpoints are the minimum Delivery, Learner, disabled/fixture-driven Authoring Control, and Operations families. Required tests cover transport validation, unknown-field preservation, empty-database migrations, transaction atomicity, publication gating, immutable release delivery, idempotency replay/conflict, exact version references, audit creation, and health semantics.

The fixture must not be presented as canonical curriculum, agent output, scientific evidence, or production authoring data. It must use canonical field names where defined, preserve raw payload/order, include explicit non-final schema metadata, and remain adapter-isolated. CF-001 through CF-015 are narrowed by canonical sources; their remaining representation gates still block real semantic input where applicable.

## BIP-M1 Phase B.4 Certification

The non-canonical fixture vertical slice is `LEVEL 2 - FIXTURE VERTICAL SLICE CERTIFIED WITH CONDITIONS` under `backend-platform-bip-m1-phase-b4-certification.md`. Its PostgreSQL transaction, preservation, idempotency, audit, rollback, readiness, and semantic-boundary evidence does not authorize canonical package persistence, ACP integration, hosted operation, or frontend cutover.

The optional B.4.4 internal HTTP adapter remains conditional on demonstrated application-service transport need. The next canonical package slice requires its own accepted plan and gate.

The next immediate action is precise staging and commit of the certified backend foundation. No B.4.4 implementation begins before that commit boundary is reviewed.

## Phase 7 Handoff

Phase 7 may convert this sequence into a file-level implementation plan. It must not scaffold code until the owner accepts the target architecture and cross-front registry. It must preserve the no-installation/no-service-execution constraints until implementation authorization is explicit.
