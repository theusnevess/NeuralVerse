# NeuralVerse Backend Platform - BIP-M1 Phase B.1 Persistence Dependencies and Configuration

Canonical identifier: `NV-BIP-M1-B1`
Version: `1.0`
Status: `IMPLEMENTED WITH CONDITIONS`
Owner: Backend & Integration Platform
Authority: `NV-BIP-M0-CERT`, `NV-BIP-M1-B-PLAN`, `NV-BIP-000`, and explicit project-owner decisions
Certified common base: `f885d4dabcd0f6ee8131d90dab586f9164e404f7`
Certified ACP baseline: `b397035a9cfc3d376afc31633583f2b9ecd76548`
Implementation scope: Persistence dependencies and database configuration only
Implementation readiness: `LEVEL 1 FOUNDATION VALIDATED`
Supersession state: Active
Last review date: `2026-07-16`

## Scope

B.1 adds the accepted persistence dependency declarations, exact lock resolution, typed operational database configuration, URL validation, secret redaction, configuration tests, import validation, and documentation. It does not establish a database connection or persistence runtime.

No engine, metadata, declarative base, session, transaction manager, database health checker, Alembic configuration, migration, database resource, table, fixture envelope, idempotency record, audit record, outbox, semantic contract, or ACP adapter was added.

## Dependency Changes

Runtime dependencies added to `backend/pyproject.toml`:

- `sqlalchemy>=2.0.51,<2.1`, resolved `2.0.51`;
- `psycopg[binary]>=3.3.4,<3.4`, resolved `3.3.4`.

Migration dependency group added:

- `alembic>=1.18.5,<1.19`, resolved `1.18.5`.

The existing runtime and development constraints were not changed. The lock grew from the Phase A resolution by Alembic, SQLAlchemy, Psycopg/Psycopg binary, Greenlet, Mako, MarkupSafe, and tzdata. No deferred direct dependency entered the project. Transitive dependencies are lock-managed.

Official SQLAlchemy documentation supports the synchronous `postgresql+psycopg` dialect and `pool_pre_ping`; official Alembic documentation supports metadata naming conventions, online/offline modes, reviewed autogeneration, and head inspection; official Psycopg documentation supports synchronous connections, SQLAlchemy integration, SSL, and timeouts. Package metadata resolved the selected versions under Python 3.12.

Installed metadata reports SQLAlchemy license `MIT` and Python requirement `>=3.7`; Psycopg 3.3.4 and Alembic 1.18.5 expose no license value in the installed metadata and require manual license review. No vulnerability scanner was available or executed. Security claim: `NO KNOWN ISSUE FOUND BY EXECUTED CHECKS`.

## Configuration Model

`configuration/settings.py` remains the single authoritative `BaseSettings` source with prefix `NEURALVERSE_`. The database URL is `SecretStr | None` and is parsed with SQLAlchemy `make_url`; no connection, DNS lookup, or socket is opened.

Fields added:

- `database_enabled`, default `false`;
- `database_required_for_readiness`, default `false`;
- `database_url`, default `None`;
- `database_pool_size`, default `5`, bounds 1-20;
- `database_max_overflow`, default `5`, bounds 0-20;
- `database_pool_timeout_seconds`, default `10`, bounds 1-60;
- `database_pool_recycle_seconds`, default `1800`, bounds 60-86400;
- `database_connect_timeout_seconds`, default `5`, bounds 1-60;
- `database_statement_timeout_ms`, default `5000`, bounds 100-300000;
- `database_echo`, default `false`;
- `database_application_name`, default `neuralverse-backend`, length 1-63 and non-whitespace.

The previous Phase A `readiness_requires_database` setting was consolidated into `database_required_for_readiness`; no compatibility alias was retained because no persisted or external consumer exists. The existing readiness dependency model now reads `database_enabled`.

## Validation Invariants

- Disabled database permits no URL and cannot be required for readiness.
- Enabled database requires a URL.
- URLs must use exactly `postgresql+psycopg` and include a database plus host or supported socket target.
- `postgresql://`, `postgres://`, `postgresql+asyncpg://`, SQLite, malformed, and database-less URLs are rejected.
- Local non-TLS URLs are accepted for explicit loopback/private development use.
- Hosted enabled database requires readiness, `database_echo=false`, and `sslmode=verify-full`.
- Hosted `disable`, `allow`, `prefer`, `require`, and `verify-ca` modes are rejected.
- Pool and timeout values are bounded.
- Passwords are absent from `repr`, intended diagnostic model dumps, validation errors, and redacted URL output.

## URL Redaction

`redact_database_url()` is the single safe diagnostic helper. It retains only driver, redacted username, host/port/database, and safe `sslmode`; it never exposes passwords or arbitrary query-string values. It is not logged automatically in B.1.

## Readiness Compatibility

No database health checker was implemented. When disabled, readiness reports `disabled`. When enabled, readiness reports `unhealthy` because connectivity checks are not implemented. A required enabled database therefore returns `not_ready` without claiming database health. Liveness remains process-only.

## Tests

The existing Phase A suite remains intact. Configuration tests cover disabled/enabled combinations, driver URL policy, malformed/database-less URLs, pool/timeout bounds, hosted readiness/TLS/echo rules, local non-TLS, application-name validation, SecretStr redaction, and safe diagnostics. Health tests cover unchanged disabled readiness and enabled-but-unhealthy readiness. Full backend pytest passes 28 tests.

## Validation Evidence

- Canonical source checksum: PASS for NV-BIP-000 and NV-ACP-000.
- `uv lock --check --project backend`: PASS.
- `uv sync --project backend --locked --all-groups`: PASS.
- Dependency import smoke: SQLAlchemy `2.0.51`, Alembic `1.18.5`, Psycopg `3.3.4`.
- Ruff format/lint: PASS.
- Mypy strict source/test check: PASS.
- Full backend pytest: 28 passed.
- `uv pip check`: PASS.
- Application import smoke: PASS without database URL.
- No-connection audit: no engine, session, Psycopg connection, SQL, socket, DNS, or database lifecycle code.
- Deferred dependency audit: no asyncpg, psycopg2, Redis, Temporal, storage, provider, auth, telemetry, or test-container direct dependencies.
- Semantic-contract audit: no ACP semantic types or adapters added.
- Secret scan: only deliberate fake credentials in redaction tests.
- `git diff --check`: PASS.

Clean lock reproduction must still be run in the final Phase B.1 validation using a temporary environment with all groups. No PostgreSQL, Docker, Compose, Alembic, or SQL command is permitted in B.1.

## Decisions

### BIP-D012 - Psycopg 3 driver

Implementation status: `IMPLEMENTED AND LOCKED` at `3.3.4` with binary extra. The selected synchronous driver is declared and import-validated; connection lifecycle remains B.2.

### BIP-D014 - SQLAlchemy and Alembic version policy

Implementation status: `IMPLEMENTED AND LOCKED` at SQLAlchemy `2.0.51` and Alembic `1.18.5`. SQLAlchemy is runtime; Alembic is isolated in the migration dependency group. No legacy API or migration configuration was added.

### BIP-D029 - Persistence dependency grouping

Problem: Keep migration tooling out of the normal API dependency set. Options: runtime Alembic, dedicated group, separate project. Decision: runtime SQLAlchemy/Psycopg and dedicated `migration` Alembic group. Rationale: clean ownership and future worker/migration commands. Evidence: uv dependency groups and BIP-D014. Consequences: migration commands must opt into the group. Rejected: unconditional runtime Alembic. Review trigger: migration deployment model. Status: `IMPLEMENTED`.

### BIP-D030 - Database URL secret and redaction policy

Problem: Database URLs contain credentials and query secrets. Options: plain string, SecretStr, custom secret object. Decision: `SecretStr` plus one parser/redaction helper. Rationale: Pydantic masking and bounded diagnostics. Evidence: configuration tests and Pydantic Settings behavior. Consequences: future engine code must unwrap only at a bounded boundary. Rejected: plaintext settings and automatic URL logging. Review trigger: secret-management integration. Status: `IMPLEMENTED`.

### BIP-D031 - Hosted database TLS validation

Problem: Hosted database connections must verify the server and hostname. Options: accept any SSL mode, require `require`, require `verify-full`. Decision: enabled hosted configuration requires `sslmode=verify-full` and rejects weaker modes. Rationale: hostname verification is required by the frozen plan. Evidence: accepted persistence plan and Psycopg/PostgreSQL URL semantics. Consequences: hosted certificates and names must be provisioned later. Rejected: disable/allow/prefer/require/verify-ca. Review trigger: approved equivalent certificate policy. Status: `IMPLEMENTED`.

### BIP-D032 - Phase B.1 readiness behavior

Problem: Settings now describe a database before a checker exists. Options: report healthy, keep disabled, report unhealthy when enabled. Decision: disabled reports disabled; enabled reports unhealthy; required enabled reports not-ready. Rationale: no false connectivity claim and no Phase B.2 runtime. Evidence: existing dependency-state abstraction and tests. Consequences: B.2 must replace the unhealthy placeholder with a real bounded checker. Rejected: fake `SELECT 1`, startup connection, or healthy placeholder. Review trigger: engine/readiness implementation. Status: `IMPLEMENTED WITH CONDITIONS`.

## Known Limitations and Next Gate

The selected packages are resolved and importable under Python 3.12, but no engine, connection, pool, session, migration, or PostgreSQL runtime exists. Clean temporary lock reproduction remains part of final validation. B.2 may introduce SQLAlchemy metadata, engine/session ownership, and real database readiness only after this boundary is accepted.

Implementation readiness remains `LEVEL 1 FOUNDATION VALIDATED`; Level 2 fixture readiness is not granted.
