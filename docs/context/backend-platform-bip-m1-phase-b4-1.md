# NeuralVerse Backend Platform — BIP-M1 Phase B.4.1 Operational Models and First Migration

Canonical Identifier: `NV-BIP-M1-B4-1`<br>
Version: `1.0`<br>
Status: `IMPLEMENTED WITH CONDITIONS`<br>
Owner: Backend & Integration Platform<br>
Authority: `NV-BIP-M0-CERT`, `NV-BIP-M1-B4-PLAN`, `NV-BIP-M1-B3`, `NV-BIP-000`, `NV-ACP-000`, and Explicit Project-Owner Decisions<br>
Certified Common Base: `f885d4dabcd0f6ee8131d90dab586f9164e404f7`<br>
Certified ACP Baseline: `b397035a9cfc3d376afc31633583f2b9ecd76548`<br>
Implementation Scope: Operational models and first functional migration only<br>
Implementation Readiness: `LEVEL 1 OPERATIONAL SCHEMA IMPLEMENTED`<br>
Supersession State: Active<br>
Last Review Date: `2026-07-16`

## Scope

B.4.1 implements the three operational SQLAlchemy models and one functional Alembic migration descending from `b30000000001`. The schema is validated against a fresh project-owned PostgreSQL 16 environment.

The models are operational representations only. The phase does not implement payload parsing, raw hashing, structural hashing, idempotency acquisition/replay, audit writing, repositories, application services, endpoints, semantic adapters, publication, learner state, or ACP integration.

## Model Structure

The shared B.2 `DeclarativeBase` and `MetaData` now expose exactly three tables:

- `fixture_records`: immutable operational envelope storage, raw `BYTEA`, structural `JSONB`, local validation outcome, and supersession reference.
- `idempotency_records`: hashed command identity, request fingerprint, bounded status, timestamps, attempt count, and stable response reference.
- `operational_audit_events`: append-only operational event shape with bounded JSONB metadata.

Status and classification values use Python `StrEnum` constants plus PostgreSQL text `CHECK` constraints. PostgreSQL native enums were not introduced, preserving migration flexibility. The existing naming convention generates deterministic primary key, foreign key, check, unique, and index names.

## Fixture Record

`fixture_records` uses an application-generated UUIDv4 operational key. It stores bounded schema metadata, fixed `TEST_FIXTURE`/`NON_CANONICAL`/`NOT_A_FINAL_SHARED_CONTRACT` classification, `agent_generated = false`, `application/json`, exact raw bytes as `BYTEA`, independent 64-character raw hash text, nullable structural `JSONB` and structural hash, two final fixture-local validation statuses, bounded findings JSONB, UTC timestamps, and a self-referencing supersession foreign key.

Database checks cover non-empty metadata, fixed classification, media type, 1 MiB raw payload size, lowercase SHA-256 shape, validation status, structural pair/nullability, structural hash shape, valid-payload pairing, self-supersession prevention, and timestamp ordering. The raw hash is a stored column only; hashing and payload processing remain B.4.2 responsibilities.

No semantic identifier projection or global raw-hash uniqueness was added. Indexes support schema/version lookup, validation status, raw hash diagnostics, supersession lineage, and receipt time.

## Idempotency Record

`idempotency_records` stores the operational UUID, scope, 32-byte HMAC hash column, key-hash version, 64-character request fingerprint, operation name, four planned statuses, optional fixture response reference, lifecycle timestamps, expiry, bounded attempts, and safe error code. The raw idempotency key is absent.

Database checks cover hash/fingerprint lengths, non-empty scope/version/operation, allowed statuses and response type, attempt bounds, expiration ordering, timestamp ordering, and state-dependent fields. A unique `(scope, idempotency_key_hash)` constraint and expiration/status plus operation/status indexes are present. No acquisition, replay, locking, HMAC, or fingerprint implementation exists in this phase.

## Operational Audit Event

`operational_audit_events` stores the UUID, five planned event types, bounded system actor types, fixture/idempotency subject types, subject UUID, operation, outcome, correlation/request identifiers, occurred/recorded timestamps, and a column named `metadata` mapped to the Python attribute `audit_metadata` to avoid collision with SQLAlchemy's class-level metadata attribute.

Checks cover event, actor, subject, and outcome values, non-empty operation, JSON object metadata with a 16 KiB textual bound, and timestamp ordering. Subject, correlation, and recorded-time indexes are present. There is no raw payload, structural payload, semantic provenance, security audit, or governance audit field.

## Migration

Revision: `b41000000001`<br>
Parent: `b30000000001`<br>
Purpose: add the B.4.1 operational persistence foundation<br>
Head count: `1`

The reviewed migration creates exactly the three application tables, their planned checks/foreign key/unique constraint, and documented indexes. It creates no extension, role, trigger, custom schema, semantic table, or data migration. Upgrade order is fixture, idempotency, then audit. Downgrade drops indexes and tables in reverse dependency order and is documented as destructive development-only behavior. It was exercised only against the disposable B.4.1 PostgreSQL environment.

Alembic `check` reports no pending operations after migration, proving metadata and migrated schema alignment for the implemented model shape.

## PostgreSQL Validation

A fresh project `neuralverse-backend-b41` used database/user `neuralverse_backend_b41`/`neuralverse_b41` and loopback port `55433`. The preserved `neuralverse-backend-bip_postgres-data` volume was not used or modified.

Validated behavior:

- Empty database upgraded through `b30000000001` to `b41000000001`.
- Current revision and expected head both equal `b41000000001`.
- Head count is one.
- Repeated `upgrade head` is a no-op.
- Downgrade to `b30000000001` and re-upgrade succeeded on the disposable empty database.
- Catalog contains only `alembic_version`, `fixture_records`, `idempotency_records`, and `operational_audit_events`.
- Catalog columns, checks, indexes, and metadata table sets match.
- Real PostgreSQL constraint tests reject invalid classifications, hashes, self-supersession, statuses, state fields, duplicate idempotency keys, audit event types, and non-object metadata.

## Immutability Boundary

The schema provides immutable-shaped records, self-lineage, checks, and append-only audit structure. No triggers, update methods, delete methods, repository, application service, or role-permission deployment were added. Full runtime immutability and audit-writing evidence remain deferred.

## Security and Semantic Boundary

Model repr does not expose payload content. The raw idempotency key is not modeled. Audit metadata is bounded and has no payload column. SQLAlchemy parameter hiding and hosted TLS settings remain unchanged. The fixture remains `TEST_FIXTURE`, `NON_CANONICAL`, `NOT_AGENT_GENERATED`, `NOT_A_FINAL_SHARED_CONTRACT`, and not approved for ACP handoff. CF-010, CF-011, and CF-012 remain unresolved.

## Tests and Cleanup

Unit, model, migration, and application tests passed. The full backend suite with the B.4.1 PostgreSQL URL passed `55 tests`. The disposable Compose environment was used only for validation and must be removed after final evidence capture; the B.3 volume remains preserved. No Uvicorn process or unrelated container may remain from this phase.

## Known Limitations and B.4.2 Gate

Raw-byte ingestion, UTF-8/JSON parsing, duplicate-key handling, numeric validation, structural hashing, repositories, fixture insertion, idempotency state transitions, audit writes, HTTP exposure, and semantic round trips are not implemented. The next authorized phase is `BIP-M1 — Phase B.4.2: Raw and Structural Payload Preservation Adapter`.
