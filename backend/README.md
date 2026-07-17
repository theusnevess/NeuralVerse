# NeuralVerse Backend Foundation

This directory contains the BIP-M1 Phase A Python foundation and B.1-B.3 persistence boundary. It provides an application factory, typed local configuration, structured logging, correlation IDs, operational errors, dependency-aware health endpoints, a lazy SQLAlchemy runtime, a reviewed Alembic baseline, and an isolated PostgreSQL 16 validation runtime.

## Boundary

This is not the fixture vertical slice. It contains one empty Alembic infrastructure baseline and no NeuralVerse domain tables, ORM models, semantic shared contracts, publication persistence, learner persistence, authentication, provider gateways, or frontend adapters. B.1 declares and validates persistence dependencies; B.2 adds lazy engine/session ownership; B.3 validates the baseline against an isolated PostgreSQL 16 Compose runtime. The certified ACP evidence is the immutable commit `b397035a9cfc3d376afc31633583f2b9ecd76548`; the active ACP worktree is not imported or modified.

## Toolchain

- Python: 3.12, pinned by `.python-version`
- Manager: `uv` 0.11.29
- Lock: `uv.lock`
- Package: `neuralverse_backend`

From the repository root:

```bash
uv sync --project backend --locked
uv sync --project backend --locked --all-groups
uv run --project backend pytest
uv run --project backend ruff check backend/src backend/tests
uv run --project backend mypy --config-file backend/pyproject.toml backend/src backend/tests
uv run --project backend --group migration python -c "import alembic, psycopg, sqlalchemy; print(sqlalchemy.__version__, alembic.__version__, psycopg.__version__)"
uv run --project backend --group migration uvicorn neuralverse_backend.main:create_app --factory --app-dir backend/src --host 127.0.0.1 --port 8000
```

From `backend/`, omit `--project backend` and `--app-dir backend/src`.

## Configuration

Configuration uses `NEURALVERSE_` environment variables. Copy the variable names from `.env.example` into an untracked `.env` only for local use. Database configuration is disabled by default. Enabling it creates a lazy engine during application startup, but no connection is attempted until readiness is requested. Hosted configuration requires `sslmode=verify-full`.

Supported environments are `local`, `test`, and `hosted`. Hosted wildcard CORS is rejected. OpenAPI and detailed docs are enabled by default only for local and test environments.

## Health

- `GET /health/live` checks only process responsiveness.
- `GET /health/ready` reports foundation readiness, runs a bounded connectivity check, and checks the cached Alembic head when enabled; required database or migration incompatibility returns HTTP 503.
- `/health/dependencies` is intentionally not exposed in Phase A.

## PostgreSQL 16 Local Runtime

The project-owned Compose topology uses the official `postgres:16` image, loopback-only host binding, the deterministic project name `neuralverse-backend-bip`, and host port `55432` by default. The database, user, volume, and password defaults are disposable local-development values only. Do not use them for hosted operation.

From the repository root:

```bash
docker compose --project-name neuralverse-backend-bip --file backend/compose.yaml up -d postgres
docker compose --project-name neuralverse-backend-bip --file backend/compose.yaml ps
docker compose --project-name neuralverse-backend-bip --file backend/compose.yaml logs postgres
```

The Compose project must be created and cleaned only by its owner. Stop without deleting data:

```bash
docker compose --project-name neuralverse-backend-bip --file backend/compose.yaml down
```

Destructive disposable reset, including the project-owned volume:

```bash
docker compose --project-name neuralverse-backend-bip --file backend/compose.yaml down --volumes
```

Set the migration/runtime URL in an untracked shell environment or `.env`:

```bash
export NEURALVERSE_ENV=test
export NEURALVERSE_DATABASE_ENABLED=true
export NEURALVERSE_DATABASE_REQUIRED_FOR_READINESS=true
export NEURALVERSE_DATABASE_URL=postgresql+psycopg://neuralverse_bip:neuralverse_bip_dev_only@127.0.0.1:55432/neuralverse_backend_bip
```

## Alembic

Alembic is explicit operator tooling and uses a separate synchronous `NullPool` engine. It reads the typed `NEURALVERSE_DATABASE_*` settings; no URL is committed to `alembic.ini`, and API startup never applies migrations.

```bash
uv run --project backend --group migration alembic -c backend/alembic.ini upgrade head
uv run --project backend --group migration alembic -c backend/alembic.ini current
uv run --project backend --group migration alembic -c backend/alembic.ini heads
uv run --project backend --group migration alembic -c backend/alembic.ini history
uv run --project backend --group migration alembic -c backend/alembic.ini upgrade head --sql
```

The history baseline is `b30000000001`; the B.4.1 head is `b41000000001`. B.4.2 does not add or modify migrations.

## Operational Schema B.4.1

The first functional migration is `b41000000001`, descending from `b30000000001`. It creates exactly three operational, non-canonical tables: `fixture_records`, `idempotency_records`, and `operational_audit_events`. These tables contain schema-only storage and constraints; they do not provide fixture ingestion, payload parsing, hashing, idempotent transactions, audit writers, or an HTTP endpoint.

The B.4.2 adapter preserves exact raw bytes up to 1 MiB inclusive, computes raw SHA-256 before decoding, rejects oversized input before hashing or persistence, and retains bounded rejected fixtures. It uses strict UTF-8, rejects BOMs, duplicate keys, non-finite numbers, invalid JSON, and out-of-bound numeric/structural values. Minimum reader versions lower than or equal to `1.0.0` continue; malformed or higher versions produce a rejected fixture without decoding. Structural hashing uses fixture-local `struct-v1`: sorted object keys, preserved array order, exact Decimal numbers, compact UTF-8 JSON, and SHA-256. The fixture remains `TEST_FIXTURE` and `NON_CANONICAL` and must not be treated as ACP or publication data.

`FixtureRecordRepository` provides only caller-owned `add` and `get_by_id` operations. It never commits, closes, writes audit rows, or touches idempotency rows. The application-level B.4.3 service owns idempotency and audit coordination separately; no HTTP fixture endpoint or semantic contract exists.

## Operational Fixture Ingestion B.4.3

The application-level `IngestFixture` operation coordinates payload preparation, fixed `fixture_ingest`/`ingest_fixture` identity, HMAC-SHA-256 key hashing, request fingerprints, PostgreSQL idempotency acquisition, fixture persistence, operational audit, replay, conflict, takeover, terminalization, and one service-owned transaction. It has no HTTP route and no `Idempotency-Key` transport handling.

Fixture ingestion is disabled by default. When explicitly enabled, typed configuration requires an active version and Base64 32-byte HMAC key; up to four previous keys support deterministic rotation lookup. Raw keys, HMAC digests, request fingerprints, payloads, and structural payloads are never logged or audited. Retryable database failures roll back without durable failure rows and require caller retry. Valid and persistable rejected fixtures complete with `COMPLETED`; oversized, attempt-limit, and expired-retry-window outcomes use `FAILED_TERMINAL` and deterministic replay.

Run B.4.3 tests with an isolated PostgreSQL database already migrated to `b41000000001`:

```bash
NEURALVERSE_TEST_DATABASE_URL="$NEURALVERSE_DATABASE_URL" \
  uv run --project backend --group migration pytest -c backend/pyproject.toml \
  backend/tests/integration/persistence/test_fixture_ingestion.py -q
```

This phase does not add authentication, authorization, publication, learner state, ACP integration, or external side effects. BIP-D055 Level 2 fixture vertical-slice readiness is certified with conditions in `docs/context/backend-platform-bip-m1-phase-b4-certification.md`.

Validate the disposable B.4.1 environment with an explicit PostgreSQL URL:

```bash
uv run --project backend --group migration alembic -c backend/alembic.ini upgrade head
uv run --project backend --group migration alembic -c backend/alembic.ini check
NEURALVERSE_TEST_DATABASE_URL="$NEURALVERSE_DATABASE_URL" \
  uv run --project backend --group migration pytest -c backend/pyproject.toml \
  backend/tests/integration/test_postgres.py backend/tests/integration/persistence -q
```

Downgrade is destructive and supported only for an explicitly empty development database. Do not downgrade a populated or hosted database.

## Tests

Unit/default tests do not require Docker or PostgreSQL:

```bash
uv run --project backend pytest -c backend/pyproject.toml backend/tests/unit backend/tests/integration/test_application.py -q
```

Alembic tests require the migration group but do not require a live database:

```bash
uv run --project backend --group migration pytest -c backend/pyproject.toml backend/tests/migrations -q
```

PostgreSQL integration tests require the project-owned database and an explicit URL:

```bash
export NEURALVERSE_TEST_DATABASE_URL="$NEURALVERSE_DATABASE_URL"
uv run --project backend --group migration pytest -c backend/pyproject.toml backend/tests/integration/test_postgres.py -q
```

## B.4.2 Preservation Validation

Run the focused adapter and repository tests:

```bash
uv run --project backend pytest -c backend/pyproject.toml \
  backend/tests/unit/fixtures \
  backend/tests/unit/persistence/repositories -q
```

Run PostgreSQL round trips with an isolated database already migrated to `b41000000001`:

```bash
NEURALVERSE_TEST_DATABASE_URL="$NEURALVERSE_DATABASE_URL" \
  uv run --project backend --group migration pytest -c backend/pyproject.toml \
  backend/tests/integration/persistence/test_fixture_preservation.py -q
```

## Limitations and Next Gate

The foundation does not implement publication transactions, durable workflows, authentication, or semantic round trips. B.4.2 and B.4.3 establish raw/structural preservation, idempotent ingestion, audit behavior, and the coordinated transaction. Level 2 fixture vertical-slice readiness is certified with conditions; real ACP integration remains unclaimed.
