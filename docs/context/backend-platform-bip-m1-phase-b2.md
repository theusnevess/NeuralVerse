# BIP-M1 Phase B.2 — SQLAlchemy Runtime Foundation

## Status

BIP-M1 Phase B.2 is implemented as a bounded runtime foundation. The phase does not add ORM models, tables, migrations, PostgreSQL resources, or semantic contracts.

## Runtime

- `create_database_engine` creates a synchronous `postgresql+psycopg` engine lazily from validated settings.
- QueuePool bounds, `pool_pre_ping`, pool recycle, connect timeout, statement timeout, `READ COMMITTED`, and hidden SQL parameters are explicit.
- `PersistenceRuntime` owns the engine, session factory, and readiness checker for the application lifespan.
- Shutdown disposes the engine exactly once and does not attempt database work when persistence is disabled.
- Test callers may inject a runtime into `create_app` without requiring PostgreSQL.

## Sessions

- Sessions use `autoflush=False` and `expire_on_commit=False`.
- `session_scope` rolls back on exceptions and closes in all cases.
- Infrastructure code never commits implicitly; transaction ownership remains with future application services.

## Readiness

- Liveness remains process-only.
- Readiness runs `SELECT 1` only when the database runtime is enabled and the endpoint is called.
- Database failures return a safe category and duration without connection details.
- Required database failure returns HTTP 503; optional database failure does not make the foundation unavailable.

## Explicit Non-Goals

- No Alembic environment or migration execution.
- No ORM model or table registration.
- No integration or live PostgreSQL validation in the normal test suite.
- No changes to the certified ACP baseline or semantic contracts.

## Decisions

- BIP-D016: engine is synchronous and uses Psycopg 3.
- BIP-D017: runtime resources are owned by application lifespan.
- BIP-D018: sessions are infrastructure-scoped and never commit implicitly.
- BIP-D025: readiness performs bounded `SELECT 1` checks only on demand.
- BIP-D033: engine construction is lazy and configuration-driven.
- BIP-D034: pool and timeout bounds are explicit and validated.
- BIP-D035: database readiness failure is represented as HTTP 503 when required.
- BIP-D036: test runtime injection is explicit and avoids external services.
