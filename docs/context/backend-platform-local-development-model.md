# NeuralVerse Backend Platform Local Development Model

Canonical identifier: `NV-BIP-M0-P6-LOCAL-DEV`<br>
Version: `1.0`<br>
Status: `DECIDED WITH CONDITIONS`<br>
Owner: NeuralVerse project owner and backend platform implementer<br>
Authority: BIP-M0 Phase 6 local deployment decision<br>
Related documents: `backend-platform-target-architecture.md`, `backend-platform-implementation-sequence.md`, `backend-platform-security-baseline.md`<br>
Supersession: None<br>
Last review date: `2026-07-16`

## Initial Model

The first implementation runs the frontend static server as it does today, runs the FastAPI application directly on the host, and runs PostgreSQL in a local container. This avoids requiring a cloud account while keeping the database lifecycle reproducible. Docker Compose is authorized for the future dependency topology but is not created in Phase 6.

Initial logical services:

- frontend static server: existing Python or Node server, unchanged;
- backend API: host process on a documented local port;
- workflow worker and agent-worker adapter: logically separate, initially co-locatable;
- PostgreSQL: persistent local container with a named volume;
- Temporal, Temporal UI, Redis, S3-compatible object storage, and OpenTelemetry Collector: canonical topology capabilities activated by their owning slice.

The API must not replace static delivery until a feature-flagged adapter and equivalence evidence exist.

## Canonical Workflow

The future backend-owned workflow is:

1. Bootstrap the approved Python environment from `backend/` without using npm as the Python dependency manager.
2. Export or load an untracked local configuration containing database connection details and optional authoring settings.
3. Start PostgreSQL through the approved local container command.
4. Apply Alembic migrations explicitly.
5. Start FastAPI with the backend-owned development command.
6. Start the existing frontend server.
7. Verify `/health/live` and `/health/ready` before enabling API delivery fixtures.
8. Run backend pytest and contract tests.
9. Stop the API and frontend, then stop the database container without deleting its volume unless reset is intended.

Root npm scripts may later coordinate convenience commands, but `backend/` owns Python dependency, migration, and test commands.

## Configuration Bootstrap

Required initial groups are application identity, HTTP bind/port, database URL, log level, and local authoring mode. Temporal, object storage, and telemetry become required for the canonical durable reference slice; Redis remains optional acceleration. Configuration loading is typed and startup-validated. A startup report lists enabled capabilities and safe non-secret metadata only.

Example variable names, without values:

```text
NEURALVERSE_ENV
NEURALVERSE_HTTP_HOST
NEURALVERSE_HTTP_PORT
NEURALVERSE_DATABASE_URL
NEURALVERSE_DATABASE_POOL_SIZE
NEURALVERSE_LOCAL_LEARNER_ID
NEURALVERSE_AUTHORING_MODE
NEURALVERSE_AUTHORING_TOKEN
NEURALVERSE_LOG_LEVEL
NEURALVERSE_OTEL_ENABLED
```

No environment file is created by this phase.

## Data Operations

- Migration: explicit backend-owned Alembic command; startup does not silently mutate schema.
- Health verification: liveness must pass if the process is alive; readiness requires required database access and migration state.
- Tests: backend unit, transport, persistence, migration, transaction, idempotency, and contract tests.
- Reset: an explicit local-only database reset command may drop/recreate the local volume only after confirmation; it must never target a hosted database by default.
- Backup: use PostgreSQL-native local backup/restore commands once persistence exists; document the command and target before migration testing.
- Shutdown: stop application processes first, then dependencies; preserve the local volume by default.

## Evolution Path

The future container topology is staged:

```text
api -> postgres
api -> workflow-worker -> temporal -> postgres
api -> agent-worker-adapter -> approved agent runtime
api -> redis (optional acceleration)
api -> object-storage (managed assets)
api/worker -> otel-collector (telemetry export)
```

Each edge requires an owning capability, health semantics, failure behavior, and tests. A dependency is not introduced merely because it is approved technology.

## Frontend Compatibility

Stage 0 preserves all existing static behavior. Later stages add health-gated adapters, one published package, one learner interaction, selected backend loaders, the provider gateway, and broader synchronization. Static loaders remain the rollback path until equivalence validation and operational readiness are proven.
