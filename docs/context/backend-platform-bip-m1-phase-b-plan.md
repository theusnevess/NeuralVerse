# NeuralVerse Backend Platform - BIP-M1 Phase B Persistence Foundation Plan

Canonical identifier: `NV-BIP-M1-B-PLAN`
Version: `1.0`
Status: `PARTIALLY SUPERSEDED BY B.1-B.3`
Owner: Backend & Integration Platform
Authority: `NV-BIP-M0-CERT`, `NV-BIP-000`, `NV-ACP-000`, and explicit project-owner decisions
Certified common base: `f885d4dabcd0f6ee8131d90dab586f9164e404f7`
Certified ACP baseline: `b397035a9cfc3d376afc31633583f2b9ecd76548`
Implementation scope: Persistence foundation planning only
Implementation readiness: `LEVEL 1 FOUNDATION VALIDATED`
Supersession state: Active
Last review date: `2026-07-16`

## Scope

This plan defines the next persistence foundation without implementing it. It covers PostgreSQL, SQLAlchemy 2, Alembic, database configuration, engine/session ownership, transactions, migration policy, local topology, test strategy, lossless fixture storage, idempotency, audit, readiness, and security boundaries.

The plan preserves the Phase A package and changes no `backend/pyproject.toml`, `backend/uv.lock`, source module, migration, database, container, or Agent & Content Platform worktree.

## Non-Scope

The plan does not authorize semantic shared-contract schemas, real `AgentContribution` or `LearningPackageDraft` integration, publication, learner endpoints, repositories, unit-of-work implementation, outbox tables, authentication, provider gateways, Temporal, Redis, object storage, FTS, pgvector, frontend integration, or a fixture vertical slice.

The database will not become semantic authority because it stores semantic snapshots. CF-010, CF-011, and CF-012 remain open.

## Evidence

### Existing Foundation

- Python `3.12.3`, pinned by `backend/.python-version`.
- uv `0.11.29`, exact `backend/uv.lock`, and Phase A package `neuralverse_backend`.
- Application factory at `neuralverse_backend.main:create_app`.
- Typed settings in `configuration/settings.py`; database URL is optional and readiness is truthful when database capability is deferred.
- Lifespan currently owns only Phase A logging/startup state; it is the integration point for a future engine lifecycle.
- `operations/dependencies.py` models `disabled`, `unconfigured`, `healthy`, and `unhealthy`; it is sufficient as a seam but needs a real database checker in B.2.
- Phase A has no persistence dependencies, models, migrations, or external service connection.

### Canonical Boundary

NV-BIP-000 assigns PostgreSQL, persistence, transactions, workflows, publication execution, delivery, and learner-state integration to Backend. NV-ACP-000 assigns educational meaning, provenance, contribution semantics, package composition, block semantics, and readiness recommendation to ACP. The future Cross-Front Integration Contract remains authoritative for representation.

The certified ACP evidence is commit `b397035a9cfc3d376afc31633583f2b9ecd76548`; later ACP working-tree changes are excluded.

### Environment Findings

- PostgreSQL client: `psql 16.14` available.
- PostgreSQL server binary: not found through `postgres --version`.
- Readiness client: `pg_isready 16.14` available.
- System service: `postgresql.service` is enabled and reports active-exited wrapper state; no service was started or modified.
- Docker: `29.6.1` available.
- Docker Compose: `v5.2.0` available.
- Podman: unavailable.
- Ports: `127.0.0.1:5432`, `[::1]:5432`, and `0.0.0.0:5433` are occupied.
- No database connection, container, database, schema, or migration was created.

## Dependency Plan

The following are planned direct constraints only. They must not be added until B.1 is separately authorized.

| Package | Constraint | Expected resolution | Purpose | Introduction |
|---|---|---|---|---|
| `sqlalchemy` | `>=2.0.51,<2.1` | `2.0.51` | SQLAlchemy 2 Core/ORM, engine, sessions, metadata | B.1 |
| `alembic` | `>=1.18.5,<1.19` | `1.18.5` | Reviewed schema migrations | B.1 |
| `psycopg[binary]` | `>=3.3.4,<3.4` | `3.3.4` | PostgreSQL 16 synchronous DB-API driver | B.1 |

Package metadata showed SQLAlchemy `2.0.51`, Alembic `1.18.5`, and Psycopg `3.3.4` available. Official SQLAlchemy documentation supports `postgresql+psycopg://` synchronous engines and `pool_pre_ping`; Alembic documentation supports SQLAlchemy metadata, naming conventions, online/offline modes, reviewed autogeneration, and head inspection; Psycopg documentation supports synchronous connections, SQLAlchemy integration, timeouts, SSL parameters, and pooling. License and vulnerability scanning must be run during B.1 dependency update; no such check was executed in this planning phase.

## PostgreSQL

Selected version: PostgreSQL `16`.

Supported range: PostgreSQL 16.x initially; PostgreSQL 17 requires a compatibility matrix and migration test before support. PostgreSQL 18 is not selected.

Image policy: use an official PostgreSQL 16 image selected during B.3, pinned by major and reviewed digest when the local topology is implemented. Do not use `latest`.

Hosted policy: use a managed/provider PostgreSQL 16-compatible service first; hosted major upgrades require backup/restore and migration validation.

Upgrade policy: expand-and-contract migrations, backup/restore rehearsal, representative-data validation, and application compatibility before changing the supported major.

Evidence: local PostgreSQL client is 16.14, PostgreSQL 16 is available on the developer machine, SQLAlchemy/Psycopg metadata supports the selected stack, and the target architecture names PostgreSQL as the durable store.

Rejected alternatives: PostgreSQL 17 because local server/client evidence is 16 and no need requires the newer major; PostgreSQL 18 because support evidence and ecosystem validation are insufficient; SQLite because it is not a behavioral substitute for PostgreSQL JSONB, locking, transactions, or migration semantics.

## Database Driver

Selected driver: Psycopg 3 with binary extra for local/CI setup.

Constraint: `psycopg[binary]>=3.3.4,<3.4`.

Expected version: `3.3.4`.

Sync/async mode: synchronous SQLAlchemy engine and sessions.

Rationale: synchronous transactions and migration execution are simpler to reason about, align with the current domain-service policy, and remain compatible with FastAPI through synchronous route/service boundaries. The API may still use async endpoints where appropriate, but database work is isolated behind synchronous infrastructure rather than mixing sync and async session ownership.

Rejected alternatives: asyncpg because it creates a second driver-specific model and does not simplify migration ownership; psycopg async because Phase B needs transaction clarity before concurrency optimization; psycopg2 because Psycopg 3 is the maintained modern driver selected by current metadata.

Review trigger: measured blocking under workload, worker topology change, or a separately approved async persistence design.

## SQLAlchemy

Constraint: `sqlalchemy>=2.0.51,<2.1`.

Expected version: `2.0.51`.

API style: SQLAlchemy 2 explicit `Engine`, `Connection`, `Session`, `select()`, and context-manager APIs only; no legacy query API.

Declarative model: one application `DeclarativeBase` and shared `MetaData` with the explicit naming convention below. Domain services must not import SQLAlchemy types.

Typing: SQLAlchemy 2 typed `Mapped[...]` and `mapped_column()` when models are authorized.

Engine: `create_engine("postgresql+psycopg://...", pool_pre_ping=True, ...)` with bounded pool settings.

Sessions: `sessionmaker`/`Session` factory owned by persistence infrastructure; no import-time connection.

Transactions: explicit `Session.begin()` or connection context managers; commits owned by application service/unit-of-work boundaries, never repositories or scattered route handlers.

Compatibility evidence: official SQLAlchemy documentation covers the selected synchronous Psycopg dialect, explicit 2.0 engine usage, and pessimistic disconnect handling.

## Alembic

Constraint: `alembic>=1.18.5,<1.19`.

Expected version: `1.18.5`.

Environment layout: `backend/alembic.ini`, `backend/migrations/env.py`, `backend/migrations/script.py.mako`, and `backend/migrations/versions/` when B.3 is implemented.

Online mode: synchronous migration engine using the same redacted URL settings and explicit transaction control.

Offline mode: generated SQL for review/deployment workflows; it does not prove execution against PostgreSQL.

Autogeneration: development aid only. Every generated migration is a proposal requiring human review; renames, constraints, indexes, server defaults, and data transformations are written or verified intentionally.

Review policy: one human-readable revision slug, one linear head during initial development, no unreviewed merge migrations, and no silent startup migration in hosted environments.

Revision policy: forward migrations are mandatory; downgrade is decided per migration and is not claimed universally. Destructive or irreversible changes require explicit review.

Compatibility evidence: official Alembic documentation supports `target_metadata`, naming conventions, online/offline configuration, and `alembic heads` inspection.

## Configuration Plan

Planned Phase B settings extend the existing `Settings` model only when dependencies are authorized:

- `database_enabled: bool`;
- `database_required_for_readiness: bool`;
- `database_url: str | None`;
- `database_pool_size: int` with a small bounded default;
- `database_max_overflow: int` with a bounded default;
- `database_pool_timeout_seconds: float`;
- `database_pool_recycle_seconds: int`;
- `database_connect_timeout_seconds: float`;
- `database_statement_timeout_ms: int`;
- `database_echo: bool`, rejected or forced false in hosted mode;
- `database_application_name: str`.

The URL has no committed real default. Passwords are URL-decoded only by the driver/parser, never logged. Redaction replaces credentials and query secrets before diagnostics. Local socket support is optional; TCP URLs are the first documented form. Hosted SSL verification is required and cannot be disabled by an unsafe default. Test overrides inject settings without global environment mutation.

## Engine Plan

Creation: a factory receives validated settings and returns one engine per API process/database role; no import-time connection.

Ownership: application lifespan creates and stores the engine in application state after configuration validation; workers own separate engines when introduced.

Lifecycle: engine creation is lazy or checked at startup according to readiness policy; shutdown disposes the owned pool.

Pool: start conservatively at `pool_size=5`, `max_overflow=5`, `pool_timeout=10s`, `pool_recycle=1800s`, `pool_pre_ping=True`; values remain configurable and bounded.

Disposal: lifespan calls `engine.dispose()` exactly for resources it owns. Migration engines are separately created and disposed by migration execution.

Tests: unit tests inject a fake engine/checker; PostgreSQL integration tests use a real isolated database. No SQLite engine is permitted as a behavior substitute.

Connection budget: total potential connections must account for API workers, future worker processes, migration execution, and test workers; initial local deployment should keep the sum below the PostgreSQL role/container limit with documented headroom.

## Session Plan

Factory: persistence owns a `sessionmaker` bound to the process engine with explicit `autoflush` and expiration policy.

Request lifecycle: a session is created per application-service operation or request dependency, closed in a `finally` path, and never shared across requests.

Worker lifecycle: each worker task creates and closes its own session; no session crosses task boundaries.

Commit owner: application service or explicit unit-of-work boundary.

Rollback owner: the same transaction boundary on exception or failed validation.

Close owner: the session dependency/context manager that created the session.

Repository policy: repositories may flush/query but never commit, retry whole transactions, or hide partial failures.

Application-service policy: services own transaction completion and expose domain-independent persistence interfaces to semantic services.

Autocommit: prohibited. Nested transactions use savepoints only for a concrete partial-operation need; they do not replace outer transaction ownership.

## Transaction Plan

Default isolation: PostgreSQL default `READ COMMITTED` initially; no `SERIALIZABLE` default without workload evidence.

Atomic operations: future fixture ingestion commits validated operational envelope and audit record together; publication commits readiness gate, immutable release, version bindings, and audit atomically; learner writes commit idempotency resolution, version validation, interaction, and audit atomically.

Retryable failures: transient connection failure, deadlock, and serialization failure may retry the complete application operation with bounded attempts and backoff. Partial commits are never retried blindly.

Locking: unique constraints and targeted row locks for idempotency/release acquisition; no broad table locks in request paths.

Timeouts: connection, pool acquisition, statement, and transaction budgets are explicit settings and redacted in errors.

Savepoints: only for a bounded sub-operation whose rollback semantics are explicitly tested.

Publication boundary: no release is visible before the database commit; external events/outbox work occurs after commit.

External side effects: provider, object storage, workflow, and messaging side effects are not performed inside a transaction without an approved outbox/compensation design.

## Schema Plan

Selected schema: PostgreSQL `public` schema for the first foundation.

`search_path`: explicit application/migration configuration; no reliance on a mutable user default.

Ownership: one backend-owned schema initially, with semantic payloads kept in explicit JSONB/raw columns and operational columns relational.

Runtime permissions: application role receives only required table/sequence/schema permissions; it does not own migrations in hosted mode.

Migration permissions: migration role owns schema changes and is not used for normal API requests.

Future split trigger: separate schemas only after a demonstrated least-privilege, analytics, or operational-isolation need; no schema proliferation in B.1-B.3.

## Naming Convention

SQLAlchemy metadata will use deterministic Alembic-compatible names:

- primary keys: `pk_<table>`;
- foreign keys: `fk_<table>_<column>_<referenced_table>`;
- unique constraints: `uq_<table>_<column_set>`;
- check constraints: `ck_<table>_<purpose>`;
- indexes: `ix_<table>_<column_set>`.

Names are lowercase snake case, truncated with a deterministic hash suffix when approaching PostgreSQL's identifier limit. Names are explicit in metadata and verified in migrations; no database-generated anonymous names are accepted.

## Identifier Plan

Database primary key: UUID, operational row identity only; UUIDv7 remains a later measured option.

Semantic identifiers: stored in typed text columns with explicit namespace/type validation at adapters; never replaced by database UUIDs.

Release identifiers: separate immutable semantic/operational release references with unique constraints.

Workflow identifiers: separate backend operational IDs mapped to a domain purpose/version; never reused as package or semantic IDs.

Correlation identifiers: bounded transport metadata, not persisted as semantic identity and not used for authorization.

Unique constraints: semantic ID plus owning namespace/version where required; database primary keys remain separate.

Indexing: index exact external IDs and version/release references used by delivery and learner binding; avoid indexes on opaque payload paths until measured.

Migration policy: legacy aliases require an explicit adapter and migration inventory; no display-derived ID becomes canonical.

## Timestamp Plan

Storage timezone: timezone-aware UTC timestamps (`timestamptz`).

Application responsibility: provide semantic event timestamps when the contract owns them; validate timezone awareness and preserve original values.

Database responsibility: provide operational `recorded_at`/`created_at` defaults where appropriate, using database UTC time.

Immutable timestamps: `published_at`, `occurred_at`, and immutable release/version timestamps are never rewritten.

Mutable timestamps: `updated_at` is reserved for mutable operational records and is not substituted for event timestamps.

Naming: use explicit `created_at`, `updated_at`, `published_at`, `recorded_at`, `processed_at`, `failed_at`, and `superseded_at` only with defined semantics.

Clock assumptions: compare ordering in UTC; do not infer semantic time from filesystem or client-local wall clocks.

## JSON and Payload Preservation

JSONB usage: structural semantic payloads and forward-compatible fields at boundaries whose language-neutral encoding is not approved; operational query fields remain relational.

Raw representation: retain raw UTF-8 JSON text for the non-canonical fixture when byte-level input evidence is needed; store a hash of raw bytes separately.

Structural representation: store validated structural JSONB for bounded queries and retrieval; JSONB is not byte-preserving.

Ordering: semantic order uses arrays or explicit position fields; JSON object key order is never semantic.

Unknown fields: preserve compatible unknown fields in raw and structural payloads; typed projections may reject unsupported fields but cannot delete them from stored raw data.

Null versus missing: preserve the distinction structurally and in raw input; adapter validation must not coerce missing to null.

Number representation: define fixture input limits and reject values that cannot be represented without precision loss; do not silently coerce integer/float types.

Unicode: hash the received UTF-8 bytes; do not Unicode-normalize semantic text during persistence.

Duplicate keys: detect and reject duplicate JSON object keys for the structural fixture parser, while retaining raw input for diagnostics under bounded size.

Hashing: maintain `raw_payload_sha256` and a separately documented structural/canonical hash; hash equality is not semantic equality.

Equality guarantee: structural JSON equality plus ordered-array equality after retrieval. Byte equality is guaranteed only for retained raw UTF-8 text; JSONB alone guarantees neither byte equality nor object-key ordering.

## Fixture Envelope Plan

Classification: `TEST_FIXTURE`, `NON_CANONICAL`, `NOT_AGENT_GENERATED`, `NOT_FINAL_SHARED_CONTRACT`, `RAW_PAYLOAD_PRESERVING`, `ORDER_PRESERVING`, `SCHEMA_METADATA_EXPLICIT`, `ADAPTER_ISOLATED`.

Operational fields: `fixture_record_id`, `fixture_schema_name`, `fixture_schema_version`, `minimum_reader_version`, `producer_version`, `received_at`, `payload_media_type`, validation status, and a safe test source label.

Semantic payload: opaque, adapter-owned input that uses canonical names only where already settled; it is not a backend-defined shared schema.

Raw payload: bounded UTF-8 text plus raw SHA-256; immutable after acceptance.

Derived fields: structural JSONB, structural hash, validation findings, and indexed semantic-ID projections are derived and never replace raw input.

Immutability: accepted fixture raw payload and schema metadata are immutable; corrections create a new fixture record/version.

Indexes: fixture ID, schema/version, raw hash, validation status, and bounded indexed IDs only; no unconstrained JSONB indexing.

Isolation: fixture adapter and tables remain under a clearly non-canonical namespace and cannot be imported as ACP contracts.

Replacement gate: applicable CF decisions, approved encoding, preservation tests, and real adapter round trips before real ACP payloads.

## Migration Plan

Directory: `backend/migrations/` with `alembic.ini` and `versions/`.

Configuration: URL injected from typed settings/environment, credentials redacted, no committed connection string.

Metadata: import the single application metadata object with deterministic naming convention; no domain models before authorized implementation.

Initial revision: B.3 creates a reviewed empty baseline migration with no business tables, proving migration plumbing without inventing persistence schema. The first operational table migration belongs to the next authorized persistence implementation slice.

Linear-head policy: one head during initial development; merge migrations require explicit review.

Autogeneration: proposals only; human review required for every generated file, especially renames, constraints, defaults, indexes, and data movement.

Data migrations: separate risky data backfills from schema changes where possible; explicit scripts and rollback/forward policy required.

Irreversible migrations: explicitly marked and owner-approved; downgrade is not falsely guaranteed.

Deployment ordering: expand schema, deploy compatible application, migrate data, then contract/remove only after compatibility evidence.

Migration locking: rely on Alembic/PostgreSQL migration coordination and operational preflight; never run migrations concurrently from every API worker.

## Migration Validation

B.3 must prove empty database upgrade, current head with no pending migrations, repeated upgrade as a no-op, migration history presence, metadata comparison, required schema/constraint/index checks, and application connection after migration.

Upgrade/downgrade is tested only where the revision declares downgrade support. Failure leaves no falsely reported ready state and preserves migration diagnostics outside client responses.

## Local Development

Selected topology: Compose-managed PostgreSQL 16 for local persistence, API on host loopback, no shared global volume.

Image: official PostgreSQL 16 image pinned by major and later digest.

Port: configurable host port, default project-specific port rather than assuming 5432; current occupied ports require explicit selection.

Volume: project-specific named volume; never a global unqualified volume.

Credentials: untracked environment/process values; local-only credentials separated from hosted secrets.

Healthcheck: PostgreSQL healthcheck used by Compose and readiness, with bounded timeout.

Loopback exposure: host binding loopback by default; no public database binding.

Reset policy: explicit destructive local reset command with confirmation; preserve volume by default.

Multi-worktree isolation: project-specific Compose project name, database name, volume name, and configurable port. Temporary audit worktrees do not share or delete backend resources.

Cleanup ownership: the process that creates a project-specific resource owns its shutdown/reset; no generic cleanup may remove another worktree's volume.

## Test Database

Selected strategy: real PostgreSQL through a Compose-managed or CI service container; no SQLite substitute.

Provisioning: one isolated database per integration-test session initially, created by test harness; test credentials are generated/untracked.

Isolation: dedicated database/schema and project name; separate database per worker when parallelism is introduced.

Parallelism: serial initially; worker-isolated databases or schemas are required before pytest-xdist/parallel execution.

Migration application: apply Alembic from empty database before integration tests; unit tests do not need database.

Cleanup: drop only the uniquely named test database/volume owned by the test run; retain failure artifacts and logs on failure.

CI strategy: CI service container or equivalent PostgreSQL 16 service, with the same migration command and health gate.

Fallback: no SQLite fallback; if PostgreSQL runtime is unavailable, integration validation is environment-blocked rather than weakened.

Testcontainers decision: not selected initially because Docker/Compose is already available, a dedicated service container is easier to debug, and adding a library is unnecessary. Reconsider for CI portability or parallel isolation.

## Readiness

Enabled state: database capability becomes enabled only when a validated URL and explicit `database_enabled` setting are present.

Required state: local/test may report disabled when persistence is not selected; hosted and persistence-enabled applications require database health and compatible migration state.

Health query: bounded `SELECT 1` through a short-lived checked-out connection; pool acquisition and query timeout are part of readiness.

Timeout: explicit connection and statement timeout; readiness fails closed without exposing URL/host details.

Migration-head check: B.2 checks connectivity; B.3 initially performs a startup/cached migration-head check for local strict mode. Future rolling deployments may move this to deployment preflight with compatibility windows.

Redaction: readiness exposes only dependency state and safe reason category, never connection strings, SQL, host details, or credentials.

Liveness independence: liveness remains process-only and never executes SQL.

Rolling deployment policy: strict equality is acceptable for the first local foundation only; production expand-and-contract deployments require compatible migration windows before relaxing the policy.

## Idempotency Plan

Record: future operational `idempotency_records` table with scope, hashed key, request fingerprint, operation name, status, response reference, timestamps, expiry, error, and attempt count.

Key handling: hash bounded keys with a keyed or approved cryptographic hash; never store raw sensitive keys unnecessarily.

Fingerprint: deterministic hash of normalized request bytes/fields at the operational adapter, not semantic reinterpretation.

Unique constraint: `(scope, idempotency_key_hash)` with operation compatibility checks.

Concurrent acquisition: insert-on-conflict or row lock with bounded lock timeout; one request owns acquisition.

Replay: completed matching fingerprint returns stored response reference; mismatched fingerprint returns `IDEMPOTENCY_CONFLICT`.

Failure: failed transient operations release/retry according to status policy; ambiguous commit outcomes require safe replay lookup.

Expiration: explicit retention/expiry policy, never used to delete canonical immutable releases.

Security: bounded input, hashed key, redacted diagnostics, no raw request secrets in the record.

Implementation timing: planned for the fixture vertical slice, not B.1-B.3 persistence foundation.

## Audit Plan

Operational audit: actor/command, timestamp, state/result, resource, content version, correlation ID, and safe metadata.

Security audit: authentication/authorization failures and sensitive-boundary events, separate from operational logs.

Governance audit: readiness/publication decisions and rationale, owned by governance/publication modules.

Semantic provenance: source/contribution/citation relationships remain semantic payload/provenance, not replaced by generic audit rows.

Initial table boundary: minimal operational audit record only when the fixture/persistence slice is authorized; no audit table in B.1-B.3.

Deferred capabilities: hash chaining, tamper evidence, long-term retention, SIEM export, and governance event projection.

## Publication Transaction Boundary

Future publication atomically creates readiness linkage, immutable release, content/version bindings, and audit state. Idempotency completion is part of the same operational transaction when a publication command owns it. External events/outbox publication occurs only after commit. Failed readiness or persistence creates no visible release. This remains a plan, not implementation.

## Outbox

Decision: design the extension point now, defer the outbox table and implementation until external messaging/workflow exists.

Rationale: no external broker or workflow is active in Phase B planning; an outbox table without a consumer would be architecture decoration.

Commit ordering: database transaction commits domain state and an eventual outbox record together; dispatch happens after commit and is retryable/idempotent.

## Backup and Restore

Local data is disposable unless explicitly exported. Volume deletion is destructive and project-scoped. Migration tests are separate from backup tests. Hosted planning requires managed backups, point-in-time recovery, retention, encryption, restore drills, and release/database compatibility evidence. No automation is implemented here.

## Security

- Migration and application roles are separate in hosted deployments; superuser credentials are never application credentials.
- Credentials enter through environment/secret mechanisms and are redacted from logs, errors, readiness, and OpenAPI.
- Hosted SSL verification is mandatory; local non-TLS is permitted only on loopback/private project network.
- SQLAlchemy echo and bound-parameter logging are disabled in hosted mode and off by default.
- Statement/connect/pool timeouts are bounded.
- Parameterized SQL and SQLAlchemy expression APIs are required; raw SQL needs review.
- Migration credentials are not used by normal API requests.

## Implementation Sequence

### B.1 - Dependencies and Database Configuration

Add the exact planned SQLAlchemy/Alembic/Psycopg constraints, update the lock intentionally, extend typed settings, redact URLs, and validate lock/import/tooling. No models or migrations.

### B.2 - Engine, Sessions and Readiness

Implement metadata/naming, sync engine/session factories, lifespan ownership, disposal, real database readiness, and unit tests with injected fakes. No business tables.

### B.3 - Alembic and PostgreSQL Test Runtime

Initialize Alembic, add the reviewed empty baseline, provision project-isolated PostgreSQL 16 for tests, and prove empty upgrade, head, repeat upgrade, schema checks, and application connection. Implemented in `backend-platform-bip-m1-phase-b3.md`; domain schema remains deferred.

### B.4 - Operational Persistence Primitives

Plan-only boundary for fixture envelope, idempotency, audit, and transaction tests. B.4 requires a separate implementation authorization and belongs with the fixture vertical-slice milestone, not automatic Phase B foundation completion. See `backend-platform-bip-m1-phase-b4-plan.md`.

## Level 2 Gate

Level 2 is not granted by this plan. It requires accepted persistence dependencies, implemented and validated database configuration, reproducible PostgreSQL test runtime, SQLAlchemy engine/session lifecycle, Alembic empty-database upgrade, migration-head policy, transaction ownership, accepted non-canonical fixture envelope, defined preservation equality, round-trip tests, idempotency design, and no real ACP integration claim.

Required preservation evidence: raw UTF-8 hash, structural JSONB retrieval, ordered-array equality, null/missing distinction, unknown-field retention, and explicit failure behavior for duplicate keys/precision limits.

Prohibited claims: final shared encoding, canonical package persistence, real agent compatibility, production publication, or database semantic authority.

## Decisions

### BIP-D011 - PostgreSQL major version

Problem: choose a maintained, locally evidenced major with ecosystem support. Constraints: local PostgreSQL 16.14 client and occupied local ports. Options: 16, 17, 18. Decision: PostgreSQL 16. Rationale: local evidence and conservative ecosystem baseline. Evidence: client metadata and target architecture. Consequences: later major upgrade needs matrix/backup validation. Rejected: 17/18 without local compatibility proof. Implementation trigger: B.3. Review trigger: provider or maintenance change. Status: `PLANNED WITH CONDITIONS`.

### BIP-D012 - PostgreSQL driver

Problem: choose a maintained SQLAlchemy-compatible driver. Constraints: migration and transaction simplicity. Options: psycopg 3, asyncpg, psycopg2. Decision: Psycopg 3.3.4 binary extra. Rationale: modern DB-API, typing, sync/async options, SQLAlchemy integration. Evidence: official Psycopg/SQLAlchemy docs and package metadata. Consequences: binary wheel/platform policy must be validated. Rejected: asyncpg/psycopg2 for duplicated or legacy tradeoffs. Implementation trigger: B.1. Review trigger: deployment/platform compatibility. Status: `PLANNED WITH CONDITIONS`.

### BIP-D013 - Synchronous versus asynchronous SQLAlchemy

Problem: select transaction and session model. Constraints: FastAPI supports both; migrations and domain services need clarity. Options: sync, async, mixed. Decision: synchronous SQLAlchemy/Psycopg. Rationale: simpler transaction ownership and Alembic alignment; async HTTP does not require async DB. Evidence: official SQLAlchemy sync Psycopg dialect and Phase A service policy. Consequences: blocking work must remain bounded and worker concurrency measured. Rejected: async/mixed until workload evidence. Implementation trigger: B.2. Review trigger: measured latency/concurrency. Status: `PLANNED WITH CONDITIONS`.

### BIP-D014 - SQLAlchemy and Alembic version policy

Problem: pin compatible persistence tools without lock changes in planning. Constraints: SQLAlchemy 2 APIs and reviewed migrations. Options: current minor ranges, exact pyproject pins, unbounded latest. Decision: SQLAlchemy `>=2.0.51,<2.1`, Alembic `>=1.18.5,<1.19`, exact resolutions in future lock. Rationale: current package metadata and official docs. Evidence: pip metadata and Context7 official docs. Consequences: B.1 must update lock as one intentional delta. Rejected: legacy SQLAlchemy APIs/unbounded ranges. Implementation trigger: B.1. Review trigger: patch/security update. Status: `PLANNED WITH CONDITIONS`.

### BIP-D015 - Database schema strategy

Problem: choose a first schema without premature proliferation. Constraints: migration simplicity and least privilege. Options: public, named schema, multiple schemas. Decision: public schema initially with explicit ownership/search path. Rationale: hosted compatibility and small foundation. Evidence: target architecture. Consequences: later split requires migration. Rejected: multiple schemas before demonstrated need. Implementation trigger: B.3. Review trigger: least-privilege/analytics need. Status: `PLANNED WITH CONDITIONS`.

### BIP-D016 - Metadata naming convention

Problem: prevent unstable autogenerated constraint/index names. Constraints: PostgreSQL limits and Alembic diffs. Decision: explicit `pk_`, `fk_`, `uq_`, `ck_`, `ix_` templates with deterministic hash truncation. Evidence: official Alembic naming documentation. Consequences: metadata and migrations share one convention. Rejected: database-generated names. Implementation trigger: B.2. Review trigger: naming collision evidence. Status: `PLANNED`.

### BIP-D017 - Engine and pool ownership

Problem: define resource lifetime and connection bounds. Decision: one sync engine per process/role, created through settings, owned by lifespan, disposed on shutdown, `pool_pre_ping`, small bounded pool. Evidence: SQLAlchemy pooling docs and target lifecycle. Consequences: workers own separate engines. Rejected: import-time global engine and unbounded pools. Implementation trigger: B.2. Review trigger: worker scaling. Status: `PLANNED`.

### BIP-D018 - Session and transaction ownership

Problem: avoid scattered commits and leaked sessions. Decision: infrastructure creates sessions; application service/unit-of-work commits/rolls back; repositories flush/query but never commit; context owns close. Evidence: target architecture transaction boundary and SQLAlchemy 2 context APIs. Consequences: services remain framework-independent. Rejected: route/repository commits. Implementation trigger: B.2. Review trigger: service composition. Status: `PLANNED`.

### BIP-D019 - Migration topology and review policy

Problem: establish safe schema history. Decision: Alembic under `backend/migrations`, one linear head, reviewed revisions, empty baseline first, no silent startup migration. Evidence: Alembic heads/autogenerate docs and BIP security policy. Consequences: deploy preflight owns migration execution. Rejected: automatic production migration and unreviewed autogenerate. Implementation trigger: B.3. Review trigger: multi-branch deployment. Status: `IMPLEMENTED WITH CONDITIONS`; see B.3 artifact.

### BIP-D020 - Local PostgreSQL topology

Problem: provide reproducible local DB without collisions. Decision: official PostgreSQL 16 Compose project, configurable loopback port, project-specific volume/database/name. Evidence: Docker Compose available; ports 5432/5433 occupied. Consequences: no global volume cleanup. Rejected: system-global DB and hardcoded port/container. Implementation trigger: B.3. Review trigger: team/CI topology. Status: `IMPLEMENTED WITH CONDITIONS`; see B.3 artifact.

### BIP-D021 - Integration-test database strategy

Problem: test PostgreSQL behavior reproducibly. Decision: real PostgreSQL service/container, one isolated database per session initially, serial tests, worker isolation later. No SQLite. Evidence: Docker/Compose available and PostgreSQL-specific requirements. Consequences: integration environment required. Rejected: SQLite and automatic Testcontainers dependency. Implementation trigger: B.3. Review trigger: CI parallelism. Status: `IMPLEMENTED WITH CONDITIONS`; see B.3 artifact.

### BIP-D022 - JSONB and raw-payload preservation

Problem: preserve fixture data before semantic encoding is approved. Decision: raw UTF-8 text plus SHA-256 and structural JSONB plus structural hash; arrays preserve order; object key order is non-semantic. Evidence: PostgreSQL JSONB behavior and cross-front lossless-preservation risks. Consequences: byte equality requires raw text; JSONB alone is not byte lossless. Rejected: JSONB-only and arbitrary normalization. Implementation trigger: B.4. Review trigger: approved semantic encoding. Status: `PLANNED WITH CONDITIONS`.

### BIP-D023 - Operational identifier strategy

Problem: separate rows from semantic/external identities. Decision: UUID operational primary keys, typed text semantic IDs, unique owner/version constraints, separate release/workflow/correlation IDs. Evidence: NV-BIP-000 and NV-ACP-000 identity boundaries. Consequences: adapters preserve semantic IDs. Rejected: database key as semantic ID and display-derived IDs. Implementation trigger: first operational migration. Review trigger: CF resolution. Status: `PLANNED WITH CONDITIONS`.

### BIP-D024 - Timestamp policy

Problem: avoid ambiguous event and database timestamps. Decision: UTC timezone-aware timestamps; explicit event/operational names; immutable event timestamps; `updated_at` only for mutable records. Evidence: canonical timestamp/version requirements. Consequences: adapters preserve semantic times. Rejected: naive/local timestamps and generic `timestamp`. Implementation trigger: first migration. Review trigger: contract versioning. Status: `PLANNED`.

### BIP-D025 - Readiness and migration-head policy

Problem: readiness must reflect real DB/migration capability without harming liveness or future rolling deploys. Decision: bounded `SELECT 1`, pool acquisition, and strict cached migration-head check for initial local mode; future deployment preflight/expand-contract policy may relax equality. Evidence: Phase A states and BIP target readiness. Consequences: local API not ready on missing DB/migrations. Rejected: SQL liveness and unbounded per-request migrations. Implementation trigger: B.2/B.3. Review trigger: rolling deployment. Status: `IMPLEMENTED WITH CONDITIONS`; see B.3 artifact.

### BIP-D026 - Idempotency persistence boundary

Problem: future commands need concurrent replay/conflict safety. Decision: separate hashed-key operational record with fingerprint, unique scope/key, bounded lock, replay, failure, and expiry policy; implementation deferred to fixture slice. Evidence: BIP security and synchronization requirements. Consequences: no idempotency table in foundation. Rejected: raw-key storage and in-memory-only correctness. Implementation trigger: B.4/fixture authorization. Review trigger: command set changes. Status: `PLANNED`.

### BIP-D027 - Audit persistence boundary

Problem: distinguish operational/security/governance audit from semantic provenance. Decision: minimal operational audit boundary planned for fixture slice; separate security/governance/provenance responsibilities; implementation deferred. Evidence: BIP security and ACP ownership boundaries. Consequences: no generic audit table now. Rejected: one table absorbing all histories. Implementation trigger: B.4. Review trigger: retention/compliance need. Status: `PLANNED`.

### BIP-D028 - Transactional outbox timing

Problem: avoid architecture-only outbox state before messaging exists. Decision: design extension point now, defer table/consumer until external messaging/workflow exists; future domain commit and outbox record are atomic, dispatch after commit. Evidence: no active broker/workflow and BIP sequence. Consequences: no outbox migration in B.3. Rejected: decorative outbox table. Implementation trigger: external event capability. Review trigger: publication/workflow adoption. Status: `PLANNED WITH CONDITIONS`.

## Open Planning Conditions

- PostgreSQL service/tooling is available locally but no service was started and no connection was tested in this phase.
- Dependency compatibility was researched through official documentation and package metadata; B.1 must run license/security checks before changing the lock.
- The sync choice must be revisited only with workload evidence, not framework preference.
- The selected public schema and strict local migration-head readiness are initial policies, not immutable hosted deployment rules.
- No Level 2 readiness is granted by this planning artifact.

## Validation

- Workspace branch/HEAD/common-base checks: PASS.
- Git operation gate: PASS; no incomplete operation.
- Canonical `sha256sum -c SHA256SUMS.txt`: PASS for NV-BIP-000 and NV-ACP-000.
- Phase A/source review: PASS; no persistence dependencies, models, migrations, or database modules present.
- Environment discovery: complete; no services started or resources created.
- Official compatibility research: SQLAlchemy, Alembic, and Psycopg documentation reviewed.
- Planning scope audit: no pyproject, lock, source, migration, Compose, or ACP changes authorized.
- `UNKNOWN = 0` within Phase B planning scope; open decisions are explicitly classified.
