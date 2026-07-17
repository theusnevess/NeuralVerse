# NeuralVerse Backend Platform — BIP-M1 Phase B.3 Alembic and PostgreSQL Validation Foundation

Canonical Identifier: `NV-BIP-M1-B3`<br>
Version: `1.0`<br>
Status: `IMPLEMENTED WITH CONDITIONS`<br>
Owner: Backend & Integration Platform<br>
Authority: `NV-BIP-M0-CERT`, `NV-BIP-M1-B-PLAN`, `NV-BIP-M1-B1`, `NV-BIP-M1-B2`, `NV-BIP-000`, and Explicit Project-Owner Decisions<br>
Certified Common Base: `f885d4dabcd0f6ee8131d90dab586f9164e404f7`<br>
Certified ACP Baseline: `b397035a9cfc3d376afc31633583f2b9ecd76548`<br>
Implementation Scope: Alembic baseline and isolated PostgreSQL validation only<br>
Implementation Readiness: `LEVEL 1 DATABASE FOUNDATION VALIDATED`<br>
Supersession State: Active<br>
Last Review Date: `2026-07-16`

## Scope

B.3 adds manually reviewed Alembic infrastructure, one empty linear baseline, a project-isolated PostgreSQL 16 Compose runtime, real migration/connectivity tests, migration-head inspection, and migration-aware readiness. The SQLAlchemy application metadata remains empty.

The phase does not add domain tables, ORM models, fixture persistence, idempotency, audit, publication, learner state, ACP adapters, semantic contracts, or shared schemas.

## B.2 Evidence

B.2 is materially consistent with the implementation: one shared empty metadata object and declarative base, lazy engine construction with no import-time connection, infrastructure session scope with rollback/close and no implicit commit, lifespan-owned runtime disposal, connectivity-only `SELECT 1`, required unhealthy readiness HTTP 503, database-independent liveness, and 35 passing baseline tests. B.2 explicitly had no models, migrations, or tables.

## Compose Topology

- File: `backend/compose.yaml`.
- Project: `neuralverse-backend-bip`.
- Service: one `postgres` service using official `postgres:16`.
- Binding: `127.0.0.1:${NEURALVERSE_POSTGRES_PORT:-55432}:5432`.
- Database/user: `neuralverse_backend_bip` / `neuralverse_bip` by disposable defaults.
- Volume: Compose-derived `neuralverse-backend-bip_postgres-data`.
- No `container_name`, public binding, privileged mode, host mount, Redis, worker, or application container.
- Healthcheck: bounded `pg_isready` against the configured database and user.

The existing VisionFarm containers and occupied ports 5432/5433 were not changed. Cleanup ownership is limited to the named B.3 Compose project. The default password is illustrative and disposable, never a hosted secret.

## Alembic

Alembic lives under `backend/alembic.ini` and `backend/migrations/`. `env.py` targets the shared B.2 metadata, preserves the naming convention, uses the public schema without schema creation, and supports synchronous online and reviewed offline modes. It reads typed `NEURALVERSE_DATABASE_*` settings and fails clearly when no enabled URL exists. The migration engine is separate from the API engine, uses `NullPool`, bounded connect/statement settings, `READ COMMITTED`, and hidden parameters.

Autogeneration is configured as a proposal mechanism with type comparison enabled and server-default comparison explicit. Every generated revision remains subject to human review; renames and destructive changes are never accepted automatically.

## Baseline

Revision `b30000000001` has no parent and is the only head. Its upgrade and downgrade are explicit no-ops. Normal Alembic execution creates only `alembic_version`; it creates no schemas, extensions, roles, functions, triggers, sequences, indexes, or NeuralVerse tables.

The empty baseline proves migration history and execution plumbing only. It does not mean the database schema is complete, persistence is implemented, or the fixture vertical slice is ready.

## Migration Commands

From the repository root, after exporting an untracked local URL:

```bash
uv run --project backend --group migration alembic -c backend/alembic.ini upgrade head
uv run --project backend --group migration alembic -c backend/alembic.ini current
uv run --project backend --group migration alembic -c backend/alembic.ini heads
uv run --project backend --group migration alembic -c backend/alembic.ini history
uv run --project backend --group migration alembic -c backend/alembic.ini upgrade head --sql
```

No command creates a database implicitly. API startup never applies migrations.

## Migration Inspector and Readiness

`MigrationStateInspector` compares the read-only database revision to the single script head and caches the result for five seconds. It reports uninitialized, compatible, incompatible, or inspection failure without exposing SQL, URLs, credentials, or arbitrary database data. Connectivity and migration state are checked separately inside the bounded health path.

- Disabled database: `disabled`, overall ready when no required dependency fails.
- Connectivity failure: `unhealthy`, HTTP 503 when required.
- Missing Alembic version: `unhealthy` with safe uninitialized detail, HTTP 503 when required.
- Current revision at `b30000000001`: `healthy`, overall ready.
- Behind, ahead, or unknown revision: `unhealthy`, HTTP 503 when required.
- Liveness remains process-only and succeeds during database failure.
- Startup creates the lazy runtime but never runs migration commands or SQL.

Strict head equality is an initial local-development policy. Future expand-and-contract deployments may require a compatibility window and deployment preflight rather than per-process equality.

## Validation

The owned Compose database was started on host port 55432, upgraded from empty to head, inspected as current/head, upgraded repeatedly as a no-op, downgraded to base and upgraded again, and catalog-inspected. The only public table was `alembic_version`; NeuralVerse business table count was zero. Real integration tests covered PostgreSQL 16, `SELECT 1`, session lifecycle, rollback scope, pool disposal, compatible migration state, redacted invalid credentials, and bounded unreachable failure.

Offline SQL generation passed without emitting the configured password or username. API smoke passed with healthy readiness, and failure smoke passed with liveness success and required readiness HTTP 503 after stopping only the B.3 PostgreSQL container.

## Security and Cleanup

PostgreSQL is loopback-only, hosted `sslmode=verify-full` policy remains unchanged, runtime and migration engines hide parameters, diagnostics use safe categories, and Compose contains no production secret. The default cleanup commands operate only on `neuralverse-backend-bip`; `down --volumes` is destructive and explicitly disposable. No Uvicorn process is intentionally left running at validation end.

## Known Limitations and B.4 Boundary

The image is pinned by major (`postgres:16`) rather than a digest. Integration tests require an explicit URL and are serial; parallel worker isolation, CI service orchestration, backup/restore, hosted PostgreSQL, production secret management, and rolling migration compatibility remain unproven. B.4 must be separately authorized for the non-canonical fixture envelope, raw/structural payload preservation, first operational tables, idempotency, audit, and transaction slices.

## Decisions

- BIP-D019: reviewed linear Alembic topology and no automatic startup migration, implemented with conditions.
- BIP-D020: project-isolated Compose PostgreSQL 16 with loopback configurable port, implemented with conditions.
- BIP-D021: real PostgreSQL integration tests without SQLite, implemented with conditions.
- BIP-D025: bounded connectivity plus cached strict migration-head readiness, implemented with conditions.
- BIP-D037: empty Alembic baseline is infrastructure history only.
- BIP-D038: API startup never applies migrations.
- BIP-D039: Compose resources are project-scoped and cleanup-owned.
- BIP-D040: initial local compatibility requires exact single-head equality.
- BIP-D041: connectivity and migration compatibility remain separate readiness concerns.

## Phase B.4 Authorization Boundary

Phase B.4 remains separate: `BIP-M1 — Phase B.4: Non-Canonical Fixture Persistence, Idempotency and Audit Plan`. B.3 does not grant Level 2 fixture readiness or canonical publication readiness.
