# NeuralVerse Backend Platform Target Architecture

Canonical identifier: `NV-BIP-M0-P6-ARCH`<br>
Version: `1.0`<br>
Status: `DECIDED WITH CONDITIONS`<br>
Owner: NeuralVerse project owner<br>
Authority: NV-BIP-000, NV-ACP-000 for agent-owned semantics, BIP-M0 Phase 6, and repository evidence<br>
Related documents: `backend-platform-cross-front-decisions.md`, `backend-platform-implementation-sequence.md`, `backend-platform-security-baseline.md`, `backend-platform-local-development-model.md`<br>
Supersession: Establishes the backend target; it does not supersede agent semantic contracts<br>
Last review date: `2026-07-16`

## Scope and Decision Status

This document defines the smallest backend architecture from which implementation may begin. It does not authorize scaffolding, dependency installation, database creation, migrations, service execution, frontend migration, or contract invention.

NV-BIP-000 and NV-ACP-000 are `PROPOSED` pre-NV-3000 architecture sources. Where this target conflicts with them, the canonical source prevails; exact cross-front representation remains subject to the future Cross-Front Integration Contract.

The repository remains a browser-first hybrid application until the staged frontend migration begins. The backend target is an incremental addition, not a replacement of current static delivery.

## Target Architecture

- Style: modular monolith with isolated workers introduced only when their owning capability exists.
- Backend language: Python.
- HTTP boundary: FastAPI with Pydantic transport schemas.
- Persistence: PostgreSQL with SQLAlchemy 2, JSONB, PostgreSQL Full-Text Search, and later pgvector.
- Migrations: Alembic.
- Validation: pytest plus contract and integration tests.
- Initial logical topology: frontend, API process, workflow worker, agent-worker adapter, PostgreSQL, Temporal/Temporal UI, Redis, S3-compatible object storage, and OpenTelemetry Collector, with capability activation and local co-location staged by implementation.
- Initial vertical-slice activation: frontend, API, PostgreSQL, and the minimum durable workflow, asset, and telemetry capabilities required by the canonical reference slice.
- Initial deployment target: local host development with PostgreSQL in a container; the API runs directly on the host during foundation work.
- Future deployment target: one Linux host with containers for API and PostgreSQL, followed by separately managed workers and dependencies when justified.

## Runtime Target

- Python policy: support the current organization-approved Python 3 minor version, recorded during foundation implementation; do not claim a precise version before compatibility is verified.
- Dependency manager: `uv` or the organization-approved Python project manager, selected during implementation foundation; npm remains only a frontend/convenience orchestrator.
- Source root: `backend/src/neuralverse_backend/`.
- Namespace: `neuralverse_backend`.
- Entry point: `neuralverse_backend.main:create_app`.
- ASGI server: Uvicorn for local execution and the initial production process.
- Development command: backend-owned command equivalent to `uv run uvicorn neuralverse_backend.main:create_app --factory --reload`.
- Production command: backend-owned command equivalent to `uv run uvicorn neuralverse_backend.main:create_app --factory --host 0.0.0.0 --port 8000`.
- Async policy: async at HTTP and database boundaries where supported; domain services remain synchronous and framework-independent unless I/O requires async.
- Startup: validate typed configuration, logging, database connectivity, and migration state needed for readiness. Startup may construct the app with unavailable optional dependencies, but readiness must remain false.
- Shutdown: stop accepting requests, close database pools, flush bounded logs, and cancel owned background tasks. No unowned background threads.
- Exception boundary: map known domain and transport failures to the stable error envelope; never expose stack traces.
- OpenAPI: generated from FastAPI and Pydantic models, exposed for local development and protected or restricted in hosted environments.

The modular monolith remains one governed codebase, but NV-BIP-000 defines workflow and agent-worker responsibilities as distinct logical processes. Early development may co-locate them, but the worker boundary must remain explicit. Multiple independently owned microservices remain rejected.

## Repository Placement

The backend belongs in a new `backend/` root. The directory is authorized by this architecture but must not be created until Phase 7 implementation planning is accepted.

```text
backend/
  pyproject.toml
  src/neuralverse_backend/
    main.py
    application/
    configuration/
    domain/
    infrastructure/
    interfaces/
    modules/
    operations/
  migrations/
  tests/
  README.md
```

Agent-owned semantic contracts remain outside backend ownership. Backend adapters may import or validate approved contracts, but may not redefine their meaning. Docker and infrastructure files belong at the repository root or a future `infra/` location only when implementation introduces them. Generated frontend clients belong under an explicitly approved frontend integration path and must not become semantic authorities.

## Internal Module Classification

| Module | Classification | Initial responsibility |
|---|---|---|
| `identity` | `FOUNDATION_ONLY` | Stable local learner/actor references and future auth seam |
| `configuration` | `INITIAL_VERTICAL_SLICE` | Typed startup configuration |
| `operations` | `INITIAL_VERTICAL_SLICE` | Health, readiness, correlation, errors, structured logs |
| `content` | `INITIAL_VERTICAL_SLICE` | Package and immutable content-version persistence |
| `governance` | `INITIAL_VERTICAL_SLICE` | Readiness recommendation recording and gate evaluation |
| `publication` | `INITIAL_VERTICAL_SLICE` | Immutable publication release creation |
| `learner` | `INITIAL_VERTICAL_SLICE` | One version-bound learner interaction |
| `authoring` | `FOUNDATION_ONLY` | Disabled or fixture-driven control seam |
| `curriculum` | `FOUNDATION_ONLY` | Projection boundary; no semantic redefinition |
| `assets` | `FOUNDATION_ONLY` | Existing static references and future metadata seam |
| `synchronization` | `FOUNDATION_ONLY` | Idempotency, revisions, conflicts, and pending mutations |
| `search` | `DEFERRED` | Relational filters first; FTS and vectors later |
| `assessments` | `CROSS_FRONT_DEPENDENT` | Wait for assessment/attempt contract decision |
| `laboratories` | `CROSS_FRONT_DEPENDENT` | Wait for execution and evidence authority decisions |
| `orchestration` | `FOUNDATION_ONLY` | Durable workflow boundary and Temporal integration; activation staged |

## Process Topology

| Process | Owner | Authority | First slice | Failure behavior |
|---|---|---|---|---|
| Frontend static server | Frontend | Static assets and current browser state | Yes | Existing browser behavior remains usable |
| FastAPI API | Backend platform | HTTP, operational services, durable transactions | Yes | Requests fail with typed errors; readiness reflects critical failures |
| PostgreSQL | Backend platform/operations | Canonical durable backend state | Yes | API is not ready when required DB access or migrations fail |
| Temporal worker | Owning workflow module | Long-running workflow execution history | Reference slice capability | Workflow state must survive restart and retry |
| Agent worker adapter | Agent platform with backend integration | Agent execution transport only | Later authoring activation | No agent semantics or tools are selected here |
| Redis | Operations/performance | Ephemeral acceleration only | Optional | Correctness continues without Redis |
| S3-compatible storage | Assets/operations | Versioned binary objects | Reference package assets | Publication blocks when required asset is not ready |
| OpenTelemetry Collector | Operations | Telemetry export | Staged | Local structured telemetry remains fallback |

## Identity and Access

The initial identity model is a generated stable local learner identifier, issued and stored by the local application boundary. It is not full authentication. An actor identifier is distinct from a learner identifier so future author, operator, and service actors do not require data-model replacement.

- Delivery reads: public only for published content, subject to deployment policy.
- Learner writes: require a local learner context; hosted deployment must add authenticated actor binding before multi-user use.
- Authoring and validation commands: disabled by default or loopback-only with a separate development authoring token.
- Publication: not public; requires the authoring trust boundary and explicit governance gate.
- Operations: liveness may be public; readiness and dependency details are restricted in hosted environments.
- Provider gateway: backend-only; browser never supplies provider credentials to the provider.

Full username/password or external identity providers are deferred. This preserves local simplicity without treating the local identifier as a durable multi-user security identity.

## API Boundary

All backend routes use a version prefix such as `/api/v1`. Exact endpoint names are implementation work, but the minimum families are fixed:

- Delivery API: published package manifests, immutable content versions, release resolution, and existing asset references. First slice: package delivery.
- Learner API: version-bound interaction writes and future synchronization reads/writes. First slice: one interaction write.
- Authoring Control API: fixture/draft ingestion, readiness recording, validation requests, and publication requests. First slice: disabled or fixture-driven only.
- Operations API: `/health/live`, `/health/ready`, `/health/dependencies`; future metrics are not part of the public contract.

Every mutating endpoint uses a correlation ID and an idempotency policy where retries can repeat a command. Pagination uses opaque cursors for future collection endpoints. Errors use `error_code`, frontend-safe `message`, `correlation_id`, optional `field_errors`, `retryable`, and optional `retry_after`.

SSE is the future streaming boundary for provider or workflow progress. It is not required by the first vertical slice.

## LLM Gateway

The current direct browser-to-Ollama path remains temporarily usable for local continuity. The target is a backend provider gateway that owns transport, secret isolation, request validation, timeouts, rate limits, request IDs, streaming transport, normalized errors, and telemetry.

The gateway does not own agent prompts, missions, model-selection policy, semantic orchestration, research policy, or quality rubrics. No OpenAI integration is authorized by this phase.

The first content/publication slice does not require the gateway. Direct browser calls become deprecated only after an equivalent backend gateway path exists, has contract coverage, and has a frontend fallback/rollback plan. MockProvider remains the deterministic default in tests and local environments without a configured provider.

Sensitive prompts and responses are excluded from ordinary logs; metadata-only telemetry is allowed.

## Learner Synchronization

The target flow is:

```text
local state -> pending mutation -> Learner API -> PostgreSQL -> acknowledgment -> local sync metadata
```

The first migrated domain is one learner interaction linked to an exact `content_version_id` and `publication_release_id`. Existing local persistence remains the operational browser cache during transition. Server state becomes durable authority only for successfully acknowledged records.

Mutations require an idempotency key, request fingerprint, server revision, and client mutation timestamp. Domain-specific conflict policies remain required: append-only for histories, record conflict for authored records, set union where identifiers are stable, and tombstones for synchronized deletion. Offline writes queue locally with bounded retry; permanent failures remain visible and recoverable. Import/export precedes broad synchronization, and no destructive migration runs without a recoverable backup path.

## Database Strategy

PostgreSQL is the canonical durable store. The initial model uses opaque UUID identifiers, UTC timestamps, explicit `created_at` and `updated_at`, foreign keys for operational integrity, and JSONB for lossless semantic payloads at boundaries that are not yet approved for normalization.

Minimum concepts:

- content package
- immutable content version
- publication readiness record
- immutable publication release
- learner interaction
- idempotency record
- outbox event

Operational metadata is relational. Semantic payloads, approved contract snapshots, and forward-compatible fields use JSONB with schema/version metadata. Content blocks are not fully normalized until the semantic contract is frozen. Published records are immutable by database/application policy; corrections create a new version. Soft deletion is not used for immutable publication records. Mutable learner records may use tombstones when synchronization requires them.

Transactions are application-service boundaries, not HTTP-handler boundaries. A publication transaction includes readiness evaluation, release creation, audit record, and outbox record. A learner write includes idempotency resolution, version validation, interaction persistence, and audit metadata.

## Migrations and Workflow Introduction

Alembic owns schema revisions. Revisions are reviewed, forward migrations are mandatory, destructive changes require explicit review, and downgrade is supported only when data loss is impossible and tested. The API must fail readiness when mandatory migrations are absent; it must not silently migrate production at startup. Empty database, previous-schema, and representative-data tests are required.

The canonical reference slice includes one durable authoring workflow. A smaller persistence fixture may be synchronous, but it is not the complete NV-BIP-000 reference slice. PostgreSQL remains domain-state authority; Temporal owns workflow history and orchestration state. Workflow IDs map deterministically to domain IDs plus a workflow purpose/version.

Redis is not required initially. It may later accelerate rate limits, caches, short-lived idempotency lookups, or progress projections, but never owns canonical state and never changes correctness when unavailable.

## Assets and Search

The first slice preserves existing static asset references. Asset metadata becomes database-owned before managed publication. S3-compatible storage enters when binary assets require durable immutable delivery, provenance, licensing, or lifecycle management. Relative legacy paths remain readable through an adapter during migration. Required asset metadata or accessibility/provenance failures may block publication once managed assets are enabled.

Search sequencing is fixed: relational filters, then PostgreSQL Full-Text Search, then pgvector and hybrid ranking after embedding ownership is resolved. The backend may persist embeddings but does not choose embedding models, chunking semantics, or semantic ranking policy. Those remain cross-front decisions.

## Configuration and Operations

Pydantic Settings or the approved equivalent is the canonical typed environment configuration mechanism. Configuration groups are application, HTTP, database, identity/auth boundary, authoring boundary, provider gateway, logging, telemetry, rate limiting, assets, Temporal, and Redis. Only application, HTTP, database, logging, and health configuration are active in the first slice.

Required configuration fails startup validation. Optional dependencies are explicitly disabled rather than guessed. Local secrets use an untracked environment file or process environment. Hosted secrets use the host/deployment secret mechanism selected later. No secret is committed, logged, returned by diagnostics, or included in OpenAPI examples.

Initial rate limiting is application-local and conservative for authoring, publication, learner writes, and provider routes. Redis-backed limits enter only when multiple API instances or shared counters require them. Limits use actor identity, then IP fallback; local development may use an explicit bypass. `429` responses include `Retry-After` where known.

Initial observability is structured logs, request duration, correlation IDs, error classification, and a secret-free startup report. Traces and metrics are added incrementally with OpenTelemetry. A Collector is deferred. Health semantics are defined in the security and local-development documents.

## Completion Conditions

Implementation may begin only after the Phase 6 documents are accepted, cross-front blockers are registered, and Phase 7 converts this target into an implementation plan. `UNKNOWN = 0` for this phase. Open semantic questions are explicitly registered as `CROSS_FRONT_DECISION_REQUIRED`.
