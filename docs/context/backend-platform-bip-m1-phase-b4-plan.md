# NeuralVerse Backend Platform — BIP-M1 Phase B.4 Operational Persistence Plan

Canonical Identifier: `NV-BIP-M1-B4-PLAN`
Version: `1.0`
Status: `LEVEL 2 - FIXTURE VERTICAL SLICE CERTIFIED WITH CONDITIONS`
Owner: Backend & Integration Platform
Authority: `NV-BIP-M0-CERT`, `NV-BIP-M1-B-PLAN`, `NV-BIP-M1-B3`, `NV-BIP-000`, `NV-ACP-000`, and Explicit Project-Owner Decisions
Certified Common Base: `f885d4dabcd0f6ee8131d90dab586f9164e404f7`
Certified ACP Baseline: `b397035a9cfc3d376afc31633583f2b9ecd76548`
Implementation Scope: Non-canonical fixture, idempotency, operational audit, and certification evidence
Implementation Readiness: `LEVEL 2 FIXTURE VERTICAL SLICE CERTIFIED WITH CONDITIONS`
Supersession State: Active
Last Review Date: `2026-07-16`

## Scope

This document freezes an implementation-ready operational persistence plan for one backend-only, non-canonical fixture ingestion capability. It defines three initial operational tables, payload preservation, validation outcomes, idempotency, audit events, transaction ownership, repository seams, migration grouping, security, retention, and tests.

The planning portion is architecture-only; implementation evidence is recorded in the B.4.1, B.4.2, B.4.3, and certification artifacts. This plan does not authorize canonical publication, ACP integration, hosted operation, or semantic contract changes.

## Non-Scope

The plan does not implement or plan tables for publication releases, delivery manifests, content packages, content blocks, curriculum, source or asset manifests, workflow projections, outbox records, learner interactions, semantic projections, or canonical package persistence. Temporal, Redis, object storage, OpenTelemetry, authentication, authorization, and real ACP adapters remain deferred.

## Certified Inputs and B.3 Qualification

- BIP-M0, Phase A, B.1, B.2, and B.3 artifacts are present and internally consistent.
- B.3 is `ALEMBIC_AND_POSTGRESQL_FOUNDATION_IMPLEMENTED_WITH_CONDITIONS`.
- PostgreSQL 16 connectivity and Alembic baseline `b30000000001` were validated.
- The migration history has one head and no NeuralVerse domain tables.
- The B.3 Compose image is pinned by major rather than immutable digest.
- The B.3 development volume is preserved and classified as `KNOWN_BACKEND_B3_DEVELOPMENT_RESOURCE`.
- Hosted PostgreSQL compatibility, backup/restore, parallel test isolation, and CI service-container execution remain unproven.
- These B.3 conditions do not block B.4 planning.

## ACP Evidence and Semantic Boundary

ACP repository files consumed: none. The certified ACP implementation evidence is the immutable commit `b397035a9cfc3d376afc31633583f2b9ecd76548`. External canonical sources consulted: `NV-BIP-000` and `NV-ACP-000`, both checksum-verified. Later ACP working-state content is not inspected, imported, or modified.

The fixture is always classified as:

```text
TEST_FIXTURE
NON_CANONICAL
NOT_AGENT_GENERATED
NOT_A_FINAL_SHARED_CONTRACT
NOT_A_SUBSTITUTE_FOR_NV_ACP_000
NOT_APPROVED_FOR_REAL_ACP_HANDOFF
RAW_PAYLOAD_PRESERVING
STRUCTURAL_PAYLOAD_PRESERVING
ORDER_PRESERVING
SCHEMA_METADATA_EXPLICIT
ADAPTER_ISOLATED
```

The database stores operational evidence and adapter-owned representations. It is not semantic authority. CF-010, CF-011, and CF-012 remain unresolved. No fixture name, field arrangement, hash, or table shape claims final cross-front encoding compatibility.

The adapter must preserve already-settled names when supplied, but must not rename semantic fields, flatten structures, reorder arrays, discard compatible unknown fields, replace semantic IDs with database IDs, silently repair invalid data, or present fixture evidence as canonical publication.

## Environment Ownership

The existing Compose project is `neuralverse-backend-bip`. Its preserved volume, `neuralverse-backend-bip_postgres-data`, is a known B.3 development resource owned by this backend worktree. It is not assumed empty and must not be used as deterministic future integration-test state without explicit reset or a fresh database. B.4 implementation must create a fresh isolated database or disposable owned volume. Planning does not start, stop, reset, or delete Compose resources.

## Table Plan

Exactly three initial operational tables are planned:

| Table | Responsibility | Authority |
|---|---|---|
| `fixture_records` | Immutable test-envelope bytes, structural representation, validation result, and lineage | Raw bytes are authoritative evidence; other payload fields are derived or operational |
| `idempotency_records` | Replay, conflict, retry, and ambiguous-response recovery for ingestion | Operational command identity and state |
| `operational_audit_events` | Minimal append-only ingestion and idempotency event history | Operational audit only |

No table is planned for semantic provenance, publication, learner state, content, workflow history, outbox, security audit, governance audit, or domain events.

## Fixture Record

### Identity and Classification

| Field | Type and nullability | Default/source | Ownership and invariants |
|---|---|---|---|
| `fixture_record_id` | `UUID NOT NULL PRIMARY KEY` | Application-generated UUIDv4 | Opaque backend identity; never semantic; immutable |
| `fixture_schema_name` | `VARCHAR(128) NOT NULL` | Adapter input | Bounded; initial value is `neuralverse.backend.fixture-envelope`; not a final shared schema name |
| `fixture_schema_version` | `VARCHAR(32) NOT NULL` | Adapter input | Semver-shaped, bounded, major `1` initially |
| `minimum_reader_version` | `VARCHAR(32) NOT NULL` | Adapter input | Bounded compatibility metadata; does not establish cross-front compatibility |
| `producer_version` | `VARCHAR(64) NOT NULL` | Adapter input | Bounded producer metadata; not an agent identity |
| `fixture_classification` | `VARCHAR(32) NOT NULL` | Fixed `TEST_FIXTURE` | Database check permits only `TEST_FIXTURE` |
| `canonicality` | `VARCHAR(32) NOT NULL` | Fixed `NON_CANONICAL` | Database check prevents canonical classification |
| `agent_generated` | `BOOLEAN NOT NULL` | Fixed `FALSE` | Database check prevents agent-generated claim |
| `shared_contract_status` | `VARCHAR(48) NOT NULL` | Fixed `NOT_A_FINAL_SHARED_CONTRACT` | Database check prevents final-contract claim |
| `payload_media_type` | `VARCHAR(128) NOT NULL` | Adapter input | Initial accepted value `application/json`; bounded |

No display name, semantic ID, payload hash, or timestamp is a primary key. Schema compatibility is local: unknown major versions are rejected; compatible minor versions may be accepted by the fixture adapter; a replacement adapter/schema version creates a new fixture record.

### Payload and Validation

| Field | Type and nullability | Default/source | Ownership and invariants |
|---|---|---|---|
| `raw_payload` | `BYTEA NOT NULL` | Exact request bytes | Authoritative byte evidence; application and database limit 1 MiB |
| `raw_payload_sha256` | `CHAR(64) NOT NULL` | SHA-256 of exact bytes | Lowercase hex; recomputed and checked before insert |
| `structural_payload` | `JSONB NULL` | Derived parsed JSON | Present only for `STRUCTURALLY_VALID`; never byte authoritative |
| `structural_payload_sha256` | `CHAR(64) NULL` | Derived canonical structural bytes | Required exactly when structural payload exists |
| `validation_status` | `VARCHAR(32) NOT NULL` | Final insert state | Persisted values: `STRUCTURALLY_VALID` or `STRUCTURALLY_REJECTED`; `RECEIVED` is transient only |
| `validation_findings` | `JSONB NOT NULL` | Empty bounded array when valid | Finding objects contain only code, severity, safe message, and bounded JSON pointer |
| `received_at` | `TIMESTAMPTZ NOT NULL` | Application receipt timestamp | UTC-aware, immutable |
| `recorded_at` | `TIMESTAMPTZ NOT NULL` | PostgreSQL `CURRENT_TIMESTAMP` | Operational recording time, immutable |
| `supersedes_fixture_record_id` | `UUID NULL` with self-FK | Explicit correction lineage | Must reference an existing fixture; cannot self-reference; cycles are rejected by service logic |

`semantic_identifier_index` is deliberately deferred. No bounded projection is needed until an actual lookup requirement exists. Raw payload and structural payload remain the only payload representations.

### Fixture Constraints and Indexes

Planned database checks include non-empty bounded metadata, fixed classification values, `payload_media_type = 'application/json'`, `octet_length(raw_payload) <= 1048576`, 64-character lowercase hash shape, valid status values, structural hash/payload paired nullability, `fixture_record_id <> supersedes_fixture_record_id`, and a bounded findings array contract where practical. Parser-specific checks remain application-owned.

There is no global uniqueness constraint on `raw_payload_sha256`; equal content may be ingested as separate operational attempts. A non-unique raw-hash index supports diagnostics. Other indexes are schema name/version, validation status, supersession reference, and received time. No JSONB GIN index or speculative semantic identifier index is planned.

## Raw Payload Policy

- Store exact received bytes in `BYTEA`; decoded text alone is not sufficient for byte equality.
- Compute lowercase hexadecimal SHA-256 over the exact bytes before decoding.
- Decode strict UTF-8 after the size check; reject invalid UTF-8.
- Reject a UTF-8 BOM explicitly for the initial JSON adapter.
- Accept payloads up to 1 MiB inclusive; reject larger payloads before storing bytes.
- Oversized payloads are rejected before hashing, decoding, parsing, canonicalization, structural hashing, or persistence; raw SHA-256 is not computed.
- Oversized payloads create no fixture row; only bounded rejection metadata may be recorded in the idempotency result and audit event.
- Invalid UTF-8, duplicate keys, invalid JSON, unsupported versions, or numeric violations within the size limit create an immutable `STRUCTURALLY_REJECTED` fixture row retaining exact raw bytes and a bounded findings array.
- Raw bytes are never logged, traced, placed in error messages, or copied into audit metadata.
- Local fixture data is disposable and manually purged; integration databases are removed by the owning test run; future hosted fixture retention is 30 days unless separately revised.

Raw equality means exact byte equality after retrieval. It does not imply semantic or canonical equality.

## Structural JSON Policy

The adapter uses only current standard-library capabilities and no new dependency:

1. Enforce the 1 MiB byte limit.
2. Decode strict UTF-8 with no BOM.
3. Parse with an explicit duplicate-key `object_pairs_hook`, `parse_int`, `parse_float`, and rejecting `parse_constant`.
4. Reject duplicate object keys instead of silently choosing one.
5. Reject `NaN`, `Infinity`, and `-Infinity`.
6. Enforce maximum nesting depth 64, 4,096 members per object, 16,384 elements per array, 262,144 Unicode code points per string, and 256 Unicode code points per object key.
7. Preserve arrays in input order; object key order is not semantic.
8. Preserve null versus missing by retaining object membership exactly.
9. Convert the validated canonical JSON text to PostgreSQL `JSONB` without using JSONB as the raw representation.

Structural equality means parsed JSON equality with order-sensitive arrays and order-insensitive object keys. It does not preserve whitespace, object-key order, number lexical spelling, duplicate keys, or original bytes.

### Numeric Policy

- JSON integers are accepted up to 256 decimal digits.
- Decimal/scientific values are parsed as exact `Decimal` values, with at most 256 significant digits and exponent magnitude at most 1000.
- Normalized decimal scale is limited to 256 fractional digits after insignificant trailing zero removal.
- Scientific notation is accepted when it remains within those exact bounds.
- Trailing lexical zeroes and exponent spelling are normalized only in the structural representation; raw bytes preserve them.
- Non-finite values are rejected.
- Values outside limits are structurally rejected with raw bytes retained when within the payload limit.
- No silent float conversion or precision loss is permitted.

## Structural Hash

`struct-v1` is SHA-256 over UTF-8 bytes emitted by a deterministic recursive serializer:

- objects sort keys by Unicode code point and emit compact JSON;
- arrays retain input order;
- strings use JSON escaping without Unicode normalization;
- null and booleans use JSON literals;
- integers emit base-10 digits without leading zeroes;
- decimals emit exact fixed-point form, remove insignificant trailing fractional zeroes, and normalize negative zero to `0`;
- separators are `,` and `:` with no insignificant whitespace;
- the result is UTF-8 encoded and hashed;
- the algorithm version is stored in implementation metadata and the plan revision, not inferred from the digest.

This is a fixture-local structural equality hash, not RFC 8785/JCS and not a canonical cross-front hash. If the implementation cannot prove this serializer without precision loss, structural hashing is deferred while raw SHA-256 remains mandatory; B.4.2 cannot claim Level 2 until the algorithm is proven.

## Validation State and Findings

The operational state machine is `RECEIVED` transiently, then exactly one immutable persisted outcome: `STRUCTURALLY_VALID` or `STRUCTURALLY_REJECTED`. No publication, governance, agent, or canonical validation state is reused.

`validation_findings` is a bounded JSONB array with a maximum of 64 findings. Each finding contains `code` (64 characters), `severity` (`ERROR` or `WARNING`), `message` (512 safe characters), and optional JSON Pointer (256 characters). Findings retain deterministic traversal order; when more than 64 would be produced, the first 63 are retained and the 64th is `FINDINGS_TRUNCATED`. Stack traces, SQL errors, credentials, and raw payloads are forbidden. A valid row has an empty array; a rejected row has at least one error finding.

## Payload Preservation Operational Limits

The following values are closed by `BIP-D056` and are required for B.4.2 implementation:

| Policy | Frozen value |
|---|---|
| Normalized decimal scale | 256 fractional digits after insignificant trailing-zero removal |
| Significant digits | 256 |
| Absolute lexical exponent | 1000 |
| Maximum findings | 64; finding 64 is `FINDINGS_TRUNCATED` when needed |
| Maximum object members | 4,096 per object at every nesting level |
| Maximum array elements | 16,384 per array at every nesting level |
| Maximum string length | 262,144 Unicode code points |
| Maximum object-key length | 256 Unicode code points |

String and key limits are measured after strict UTF-8 decoding and before canonicalization or JSONB persistence. Object and array limits apply independently at every nesting level. Duplicate keys do not count as normalized members because they are rejected before dictionary construction.

The current fixture reader accepts the existing fixture reader version and compatible lower minimum-reader requirements. Malformed or higher `minimum_reader_version` is `STRUCTURALLY_REJECTED`; for a size-valid payload, raw bytes and raw hash are retained, structural fields remain null, and JSON parsing does not begin. This is reader incompatibility, not a claim that the payload is malformed.

For payloads above 1 MiB, the adapter confirms bytes, measures length, and rejects immediately. It does not compute raw or structural hashes, decode, process BOM, parse, canonicalize, construct a `FixtureRecord`, or persist bytes. Future coordinated audit metadata may contain only the safe rejection code, observed length, configured maximum, and correlation metadata.

### Consolidated Failure Matrix

| Condition | Raw retained | Raw hash | Structural payload | Structural hash | Fixture row |
|---|---:|---:|---:|---:|---:|
| Valid supported payload | Yes | Yes | Yes | Yes | Yes |
| Invalid UTF-8 within limit | Existing rejected-fixture policy | Yes | No | No | Existing rejected-fixture policy |
| Disallowed BOM within limit | Existing rejected-fixture policy | Yes | No | No | Existing rejected-fixture policy |
| Invalid JSON within limit | Existing rejected-fixture policy | Yes | No | No | Existing rejected-fixture policy |
| Duplicate key within limit | Existing rejected-fixture policy | Yes | No | No | Existing rejected-fixture policy |
| Invalid number within limit | Existing rejected-fixture policy | Yes | No | No | Existing rejected-fixture policy |
| Unsupported minimum reader within limit | Yes | Yes | No | No | Yes |
| Oversized raw payload | No | No | No | No | No |

## Immutability and Supersession

Fixture payload, schema metadata, hashes, classification, validation outcome, receipt time, and recorded time are immutable. The runtime role receives insert/select access for the initial slice, not update/delete access. No trigger is planned; application service boundaries plus database permissions provide the smallest sufficient enforcement. A future privileged maintenance procedure, if required, must be separately authorized.

Corrections create a new fixture row and set `supersedes_fixture_record_id`. The original is retained. Self-reference is database-rejected; cycles are checked by the application service in the same transaction. Deletes are not a correction mechanism. Supersession is lineage, not semantic version authority.

## Idempotency Record

| Field | Type and nullability | Source/default | Invariant |
|---|---|---|---|
| `idempotency_record_id` | `UUID NOT NULL PRIMARY KEY` | Application UUIDv4 | Opaque operational identity |
| `scope` | `VARCHAR(128) NOT NULL` | Service | Bounded operation namespace, initially `fixture_ingest` |
| `idempotency_key_hash` | `BYTEA NOT NULL` | HMAC-SHA-256 | Raw key never stored; exactly 32 bytes |
| `key_hash_key_version` | `VARCHAR(32) NOT NULL` | Configuration | Supports secret rotation without recomputing historical hashes |
| `request_fingerprint` | `CHAR(64) NOT NULL` | Versioned SHA-256 | Exact operational request identity |
| `operation_name` | `VARCHAR(64) NOT NULL` | Fixed `IngestFixture` | Binds replay to operation |
| `status` | `VARCHAR(32) NOT NULL` | `IN_PROGRESS` | Bounded state machine |
| `response_reference_type` | `VARCHAR(32) NULL` | `FIXTURE_RECORD` on completion | Polymorphic operational reference, no HTTP blob |
| `response_reference_id` | `UUID NULL` | Fixture record ID | Required for completed ingestion/rejection |
| `created_at` | `TIMESTAMPTZ NOT NULL` | Database UTC default | Immutable |
| `locked_at` | `TIMESTAMPTZ NULL` | Acquisition time | Required while in progress |
| `completed_at` | `TIMESTAMPTZ NULL` | Completion time | Required for `COMPLETED` |
| `failed_at` | `TIMESTAMPTZ NULL` | Failure time | Required for failed states |
| `expires_at` | `TIMESTAMPTZ NOT NULL` | Created time plus policy | Must be after creation |
| `attempt_count` | `INTEGER NOT NULL` | `1` | Bounded 1..100 |
| `last_error_code` | `VARCHAR(64) NULL` | Safe internal code | No SQL, stack, URL, or payload |

The accepted raw idempotency key is 1..255 visible ASCII characters with no control characters or normalization. The service hashes `key-hash-v1 || NUL || scope || NUL || operation_name || NUL || raw_key` using HMAC-SHA-256 and an environment/secret-manager key identified by `key_hash_key_version`. Rotation keeps active verification keys until retention expires; historical rows are not rehashed. The raw key is never persisted, logged, audited, or traced.

The request fingerprint is `request-fingerprint-v1` SHA-256 over a length-delimited canonical tuple containing operation name, fixture schema name/version, media type, raw payload SHA-256, minimum reader version, producer version, and supersession ID. It excludes correlation IDs, timestamps, header order, and unstable serialization.

### Idempotency States and Concurrency

- First request atomically inserts `(scope, idempotency_key_hash)` as `IN_PROGRESS` with a unique constraint.
- Existing `IN_PROGRESS` with matching fingerprint returns an in-progress result; it does not acquire a process-local lock. An expired lock may be claimed with a targeted PostgreSQL row lock and bounded timeout.
- Existing `COMPLETED` with matching fingerprint replays the stable fixture reference; a new `IDEMPOTENCY_REPLAYED` audit event is appended.
- Existing key with a different fingerprint returns `IDEMPOTENCY_CONFLICT`; the idempotency row is not overwritten and a conflict event is appended.
- `FAILED_RETRYABLE` may be reacquired after its lock/retention policy; `FAILED_TERMINAL` replays the terminal error without reprocessing.
- PostgreSQL `INSERT ... ON CONFLICT` is the acquisition authority, followed by `SELECT ... FOR UPDATE` for existing-row state inspection. Advisory locks and process-local locks are not authorities.
- A committed result stores only `FIXTURE_RECORD` plus UUID, so a lost response can be rebuilt from committed state. Missing referenced rows are a `TRANSACTION_FAILURE`/integrity alarm, never a fabricated replay.

State transitions are `IN_PROGRESS -> COMPLETED`, `IN_PROGRESS -> FAILED_RETRYABLE`, `IN_PROGRESS -> FAILED_TERMINAL`, and `FAILED_RETRYABLE -> IN_PROGRESS`. `COMPLETED` and `FAILED_TERMINAL` are terminal. Illegal transitions are rejected.

### Idempotency Retention

The initial proposed policy is 24 hours for in-progress locks, 30 days for completed/retryable/terminal records, and no automated cleanup in the first implementation. Local cleanup is an explicit owner operation; integration cleanup removes the owned database. Expiry never runs silently during a request. The values are operational replay bounds, not semantic retention policy.

## Operational Audit Events

| Field | Type and nullability | Source/invariant |
|---|---|---|
| `audit_event_id` | `UUID NOT NULL PRIMARY KEY` | Application UUIDv4, immutable |
| `event_type` | `VARCHAR(48) NOT NULL` | Fixed initial event set |
| `actor_type` | `VARCHAR(32) NOT NULL` | Initially `SYSTEM_FIXTURE_ADAPTER` or `SYSTEM_IDEMPOTENCY` |
| `actor_id` | `VARCHAR(128) NULL` | Safe local actor reference; no credentials |
| `subject_type` | `VARCHAR(32) NOT NULL` | `FIXTURE_RECORD` or `IDEMPOTENCY_RECORD` |
| `subject_id` | `UUID NOT NULL` | Operational subject ID |
| `operation` | `VARCHAR(64) NOT NULL` | `IngestFixture` |
| `outcome` | `VARCHAR(32) NOT NULL` | Bounded operational outcome |
| `correlation_id` | `VARCHAR(128) NULL` | Transport correlation value, validated |
| `request_id` | `VARCHAR(128) NULL` | Transport request value, validated |
| `occurred_at` | `TIMESTAMPTZ NOT NULL` | Application event time, UTC-aware |
| `recorded_at` | `TIMESTAMPTZ NOT NULL` | PostgreSQL UTC default |
| `metadata` | `JSONB NOT NULL` | Bounded safe metadata, no payload |

Initial event types are `FIXTURE_INGESTION_ACCEPTED`, `FIXTURE_INGESTION_REJECTED`, `IDEMPOTENCY_REPLAYED`, `IDEMPOTENCY_CONFLICT`, and `FIXTURE_SUPERSEDED`. Rejected oversized input emits an audit event without a fixture subject only if a dedicated idempotency subject exists; otherwise the application records bounded failure telemetry outside the database. No raw bytes, structural JSON, idempotency key, credentials, SQL, stack traces, or semantic provenance are stored.

Audit rows are append-only. No update/delete path or normal delete permission exists. Initial indexes are subject, correlation ID, and recorded time. Metadata is bounded to 16 KiB and contains only safe operational keys. Proposed future hosted retention is 90 days, subject to compliance review; local audit data is disposable and manually purged with fixture data.

## Audit Separation

- Structured logs: transient diagnostics, safe categories, no durable evidence authority.
- Operational audit: the three-table slice above, append-only ingestion/idempotency history.
- Security audit: authentication/authorization and sensitive-boundary events, deferred.
- Governance audit: publication/review decisions, deferred to governance/publication ownership.
- Semantic provenance: payload-owned and ACP-owned, never replaced by operational audit.
- Domain event history: deferred; outbox remains planned but not implemented.

## Transaction Boundary

`IngestFixture` is the sole transaction owner. The HTTP adapter, if later added, passes bounded input and receives a service result; it never commits. The sequence is:

1. Validate idempotency key and bounded request metadata.
2. Derive scope, HMAC key hash, and request fingerprint.
3. Acquire or inspect idempotency state using PostgreSQL constraints/locks.
4. Validate byte size, UTF-8, JSON structure, duplicate keys, numeric limits, and schema compatibility.
5. Insert an immutable valid or rejected fixture row when bytes are within the limit.
6. Insert the corresponding operational audit event.
7. Mark idempotency `COMPLETED` with the fixture reference, or `FAILED_TERMINAL` for oversized input/no fixture.
8. Commit once through the application-service transaction boundary.
9. Build the response only from committed state.

All failures roll back the complete transaction. No external side effect occurs before commit. No workflow dispatch, message, email, webhook, asset upload, provider call, or outbox record exists in this slice.

Rejected but bounded payloads are retained as `STRUCTURALLY_REJECTED` fixture evidence. Oversized payload bytes are never persisted. A request with an accepted idempotency key and a deterministic rejection completes with a fixture reference when one exists; replay returns the same rejection result.

## Repository Boundaries

The first implementation may introduce only explicit repositories:

- `FixtureRecordRepository`: insert immutable fixture rows, retrieve by UUID/hash for service needs, and inspect supersession lineage. No update/delete/commit.
- `IdempotencyRecordRepository`: atomic acquisition, locked inspection, state transition, and committed response-reference lookup. No raw key access and no commit.
- `OperationalAuditRepository`: append event and bounded subject queries for tests/operators. No update/delete/commit.

Repositories may query, insert, and flush but never commit, retry a complete transaction, or hide partial failures. They must expose operational types and keep SQLAlchemy types out of domain/semantic code. No generic CRUD base, dynamic filter framework, or specification framework is planned.

## Application-Service Boundary

The first operation is `IngestFixture`.

- Input: bounded raw bytes, schema metadata, media type, idempotency key, optional supersession ID, correlation/request IDs, and actor metadata.
- Output: fixture ID, validation status, raw/structural hashes where applicable, replay flag, and safe findings.
- Dependencies: three explicit repositories, parser/preservation adapter, hash provider, clock, and transaction/session boundary.
- Responsibilities: operational validation, idempotency state machine, fixture insertion, audit insertion, one commit, and safe error mapping.
- Non-responsibilities: semantic interpretation, publication, agent integration, governance decisions, or canonical contract validation.

The first implementation is application-service-only. No HTTP endpoint is required for Level 2. If B.4.4 is later authorized, `/internal/fixtures` is the candidate route, disabled by default in hosted mode and protected by explicit local/test configuration.

## Error Model

| Condition | Internal code | HTTP if later exposed | Retryable | Fixture/idempotency/audit behavior |
|---|---|---:|---|---|
| Payload too large | `FIXTURE_PAYLOAD_TOO_LARGE` | 413 | No | No fixture bytes; terminal idempotency result; bounded audit |
| Invalid UTF-8 | `FIXTURE_INVALID_UTF8` | 422 | No | Rejected fixture with raw bytes when bounded; completed result and audit |
| Invalid JSON | `FIXTURE_INVALID_JSON` | 422 | No | Same rejected-fixture policy |
| Duplicate keys | `FIXTURE_DUPLICATE_KEYS` | 422 | No | Same rejected-fixture policy |
| Unsupported major | `FIXTURE_SCHEMA_VERSION_UNSUPPORTED` | 422 | No | Same rejected-fixture policy |
| Fingerprint mismatch | `IDEMPOTENCY_CONFLICT` | 409 | No | No idempotency mutation; conflict audit |
| Existing in progress | `IDEMPOTENCY_IN_PROGRESS` | 409/202 | Yes/conditional | No duplicate fixture; bounded status result |
| Completed replay | `IDEMPOTENCY_REPLAYED` | 200/422 | No | Stable response reference and replay audit |
| Database failure | `PERSISTENCE_UNAVAILABLE` | 503 | Conditional | Transaction rollback; no client SQL/details |
| Transaction failure | `TRANSACTION_FAILURE` | 500/503 | Conditional | Full rollback; safe audit only if a separate committed boundary exists |

All messages are safe, stable, and exclude payloads, keys, URLs, SQL, stack traces, and credentials. Semantic publication error codes are not reused.

## Database Constraints and Indexes

All three tables use opaque UUID primary keys, bounded text, UTC-aware timestamps, explicit status checks, and PostgreSQL `CHECK` constraints for safe local invariants. Foreign keys are used only for fixture self-lineage. Conditional state nullability is enforced by checks for idempotency timestamps/references. Complex JSON parsing, duplicate keys, depth, and numeric policy remain application-owned.

Fixture indexes: `(fixture_schema_name, fixture_schema_version)`, `validation_status`, `raw_payload_sha256`, `supersedes_fixture_record_id`, and `received_at`.
Idempotency indexes: unique `(scope, idempotency_key_hash)`, partial expiration/status index, and operation/status lookup.
Audit indexes: `(subject_type, subject_id)`, `correlation_id`, and `recorded_at`.
No complete JSONB index is planned.

## Migration Plan

The first operational migration descends from `b30000000001` and creates all three tables in one reviewed migration because they form one atomic fixture-ingestion capability. It creates constraints and only the listed indexes. No data migration is required. Autogeneration may propose the revision but human review is mandatory.

The migration's downgrade is destructive and supported only for an explicitly empty development database after an operator preflight confirms no rows and an explicit destructive flag. Hosted or populated-database downgrade is unsupported; forward migration and restore/backup procedures are the safety path. No migration is created in B.4 planning.

## Preservation Equality

- Raw equality: exact byte equality through retained `BYTEA`.
- Structural equality: parsed JSON equality under `struct-v1`.
- Array equality: order-sensitive.
- Object equality: key-order-insensitive.
- Semantic equality: not claimed.
- Canonical cross-front equality: not claimed.

## Preservation Test Matrix

| Case | Expected result |
|---|---|
| Exact raw bytes and multibyte UTF-8 | Valid; byte hash and round trip identical |
| Escaped Unicode and different object-key order | Valid; raw differs as supplied, structural equality may match |
| Ordered arrays and nested unknown fields | Valid; array order and unknown fields preserved |
| Null versus missing | Valid; distinction retained |
| Empty object/array | Valid |
| Bounded integer, decimal, scientific notation | Valid only within exact numeric limits |
| Duplicate keys | Rejected; bounded raw bytes retained |
| Invalid UTF-8 or non-finite numbers | Rejected; bounded raw bytes retained |
| Oversized payload | Rejected before persistence; no raw bytes stored |
| Schema major mismatch | Rejected; bounded raw bytes retained |
| Raw or structural hash mismatch | Persistence invariant failure; transaction rejected |
| JSONB retrieval | Structural equality only, never byte equality |

## Idempotency Test Matrix

Real PostgreSQL tests are required for first acquisition, two concurrent acquisitions, matching in-progress request, completed replay, fingerprint mismatch, retryable failure, terminal failure, expired lock, rollback, ambiguous response recovery, scope isolation, operation isolation, and proof that the raw key is never stored. Mocks may test pure fingerprint/HMAC derivation but cannot prove locking behavior.

## Audit Test Matrix

Tests must cover accepted and rejected fixture events, replay and conflict events, correlation propagation, append-only behavior, metadata bounds, credential/raw-payload exclusion, rollback removing uncommitted audit rows, and committed subject linkage. Security, governance, semantic provenance, and tamper-evident chaining remain out of scope.

## Security, Exposure, and Retention

The implementation must enforce a 1 MiB request bound, strict UTF-8/JSON parsing, no content/key logging, safe findings, parameterized SQL, bounded transaction/statement timeouts, least-privilege runtime role, and hosted feature-off by default. The initial service is not an HTTP content API. If exposed later, it requires an environment gate, explicit local/test authentication posture, content-type enforcement, request limits, idempotency header, safe error envelope, and no public OpenAPI exposure by default.

Local fixture and audit data is disposable and manually purged; integration data is isolated and removed by its owner; proposed future hosted retention is 30 days for fixtures, 30 days for idempotency, and 90 days for operational audit. Superseded fixtures remain through their retention period. Automated cleanup is deferred and must have an owner, dry-run, audit, and backup/recovery policy before implementation.

## Implementation Subphases

### B.4.1 — Operational Models and First Migration

Authorized only after this plan is accepted. Introduce SQLAlchemy models, constraints, indexes, one migration from `b30000000001`, and migration/catalog tests. No ingestion service, endpoint, or semantic types.

### B.4.2 — Payload Preservation Adapter

Implemented with conditions: bounded raw-byte handling, strict parser, duplicate-key detection, numeric policy, structural JSONB conversion, `struct-v1`, minimal fixture repository, and PostgreSQL round-trip tests. No idempotency state machine or HTTP adapter.

### B.4.3 — Idempotent Ingestion Transaction

Implemented with conditions: the three repositories, `IngestFixture`, transaction ownership, audit writes, HMAC/fingerprint policy, PostgreSQL concurrency tests, rollback tests, and recovery-reference tests. No HTTP adapter or semantic integration.

### B.4.4 — Optional Test HTTP Adapter

Only if application-level tests prove a transport need. Add an environment-gated internal route, body/content-type limits, idempotency header, safe error mapping, and API tests. This subphase is not required before Level 2.

## Level 2 — Fixture Vertical Slice Ready Gate

The B.4 certification artifact records that all Level 2 requirements pass with conditions: three tables migrated from an empty database; constraints/indexes verified; `IngestFixture` transaction implemented; exact preservation behavior proven; idempotency concurrency and deterministic replay recovery proven on real PostgreSQL; audit atomicity and redaction proven; readiness unchanged; no semantic-contract or ACP working-state dependency; real integration suite passing; and documentation current.

## Risks and Open Decisions

- B.3 volume contents are not deterministic integration state.
- HMAC secret provisioning and rotation must be integrated into typed settings before B.4.3.
- Structural `struct-v1` must be implemented and tested without precision loss before claiming Level 2.
- Hosted fixture enablement, retention, access control, backup/restore, and cleanup require a later deployment decision.
- The optional HTTP adapter may be unnecessary; application-service-only remains preferred.

## B.4-P2 Idempotency Policy Closure

`BIP-D057` closes the B.4.3 policy gap. The fixed fixture-ingestion identity is `scope = fixture_ingest` and `operation_name = ingest_fixture`; neither value is caller-configurable. Future capabilities must use separate identities.

### HMAC Runtime Contract

Idempotency keys are 1..255 visible ASCII characters (`0x21..0x7E`), with no normalization, trimming, case conversion, decoding, or whitespace handling. The raw key is never stored, logged, audited, returned, or included in an exception. The HMAC message is exactly:

```text
ASCII("key-hash-v1") || NUL || ASCII("fixture_ingest")
|| NUL || ASCII("ingest_fixture") || NUL || ASCII(raw_key)
```

The algorithm is HMAC-SHA-256 and the result is 32 raw bytes in `idempotency_key_hash`. Typed runtime fields are `NEURALVERSE_FIXTURE_INGESTION_ENABLED`, `NEURALVERSE_IDEMPOTENCY_HMAC_ACTIVE_KEY_VERSION`, `NEURALVERSE_IDEMPOTENCY_HMAC_ACTIVE_KEY`, and `NEURALVERSE_IDEMPOTENCY_HMAC_PREVIOUS_KEYS`. Ingestion is disabled by default; enabled operation requires a valid version token and active standard-Base64 key decoding to exactly 32 bytes. Previous keys are a JSON object of at most four valid version-to-Base64-key entries, with no active-version duplicate. New rows use the active key; lookup tries active first and previous versions in sorted version-token order. Multiple matches are an integrity failure. Key versions are not stored in the idempotency row.

Rotation creates unique new 32-byte material, moves the old active key to the previous map, deploys the keyring atomically, uses only the new key for new rows, retains the old key at least 30 days after cutover, and removes it only after eligible records pass retention and are purged. Version reuse with different material is prohibited; hot reload is not required.

### Durable and Non-Durable Failure Classification

Retryable operation failures roll back fully, create no durable `FAILED_RETRYABLE` row, fixture, audit event, or completion, and are retried by the caller with the same identity. B.4.3 normally produces zero durable `FAILED_RETRYABLE` rows. Structured serialization failure, deadlock, configured lock/statement timeout, pool timeout, transient connection refusal/reset, database restart/shutdown, and unknown commit outcome are retryable. Schema mismatch, permission/authentication failure, invalid SQL, unexpected integrity violation, programming/data error, model/migration divergence, unsupported database version, and multiple HMAC matches are non-retryable internal failures. No arbitrary message-text classification or automatic whole-operation retry is allowed.

`COMPLETED` covers valid and persistable rejected fixtures. `FAILED_TERMINAL` is used only for oversized payloads, attempt-limit exhaustion, and expired retry windows, with stable codes `PAYLOAD_TOO_LARGE`, `IDEMPOTENCY_ATTEMPT_LIMIT_EXCEEDED`, and `IDEMPOTENCY_RETRY_WINDOW_EXPIRED`. Command validation that prevents safe identity construction creates no database state and is not terminalization.

### attempt_count and Takeover

Initial acquisition starts at attempt 1, maximum 100. The count increments exactly once for expired `IN_PROGRESS` takeover or `FAILED_RETRYABLE` reacquisition. Active observation, replay, conflict, lookup, previous-key lookup, validation failure, and rolled-back work do not increment. At 100, execution is blocked and terminalized with `IDEMPOTENCY_ATTEMPT_LIMIT_EXCEEDED`.

An `IN_PROGRESS` row is active when `current_time < expires_at`. Same-fingerprint active observation returns `IN_PROGRESS` without mutation or audit; a different fingerprint conflicts. At or after expiry, matching takeover requires `SELECT ... FOR UPDATE`, `attempt_count < 100`, and `current_time < created_at + 30 days`. It remains `IN_PROGRESS`, increments once, refreshes the 24-hour lock, clears failure/reference fields, and continues in the same transaction. At or beyond the retry horizon it terminalizes without payload processing.

An existing `FAILED_RETRYABLE` record with matching fingerprint may reacquire before `failed_at + 30 days` and below 100 attempts under row lock, transitioning to `IN_PROGRESS`, incrementing once, refreshing the 24-hour lock, and clearing failure fields. Expired retry window or attempt 100 terminalizes. Different fingerprints always conflict.

### Replay and Audit Event Matrix

| Operational path | Audit event | Subject |
|---|---|---|
| New structurally valid fixture | `FIXTURE_INGESTION_ACCEPTED` | Fixture record |
| New persistable structurally rejected fixture | `FIXTURE_INGESTION_REJECTED` | Fixture record |
| Oversized terminal result | `FIXTURE_INGESTION_REJECTED` | Idempotency record |
| Completed or terminal replay | `IDEMPOTENCY_REPLAYED` | Idempotency record |
| Fingerprint conflict | `IDEMPOTENCY_CONFLICT` | Idempotency record |
| Active same-request `IN_PROGRESS` | No event | None |
| Expired takeover | No separate event; final event only | Final subject |
| Attempt-limit or retry-window terminalization | `FIXTURE_INGESTION_REJECTED` | Idempotency record |
| Retryable or non-retryable rollback | No event; structured application log | None |

Replay verifies the fixture reference and creates no fixture. Missing replay references are non-retryable integrity failures and leave the original row unchanged. Safe audit metadata may contain validation status, finding count, payload byte length, schema name/version, replayed flag, attempt count, and safe rejection/terminal code only. Payloads, keys, digests, fingerprints, HMAC versions, URLs, SQL, exception data, credentials, and semantic provenance are prohibited.

### State Matrix

| Existing state | Same fingerprint | Different fingerprint |
|---|---|---|
| No row | Create `IN_PROGRESS`, attempt 1 | Create `IN_PROGRESS`, attempt 1 |
| Active `IN_PROGRESS` | Return in progress | Conflict |
| Expired `IN_PROGRESS`, within horizon, attempt < 100 | Take over, increment | Conflict |
| Expired `IN_PROGRESS`, horizon expired | Terminalize | Conflict |
| Expired `IN_PROGRESS`, attempt = 100 | Terminalize | Conflict |
| `COMPLETED` | Replay | Conflict |
| `FAILED_RETRYABLE`, within horizon, attempt < 100 | Reacquire, increment | Conflict |
| `FAILED_RETRYABLE`, horizon expired | Terminalize | Conflict |
| `FAILED_RETRYABLE`, attempt = 100 | Terminalize | Conflict |
| `FAILED_TERMINAL` | Replay terminal result | Conflict |

For a new row, the incoming request defines the fingerprint, so the different-fingerprint branch is not applicable until a row exists.

### Database-Failure Matrix

| Failure | Retryable operation | Durable idempotency mutation |
|---|---:|---:|
| Serialization failure | Yes | None after rollback |
| Deadlock | Yes | None after rollback |
| Configured lock timeout | Yes | None after rollback |
| Configured statement timeout | Yes | None after rollback |
| Pool timeout | Yes | None |
| Transient connection failure | Yes | None |
| Commit outcome unknown | Yes | Unknown; resolve by retry |
| Expected unique acquisition race | Normal acquisition path | According to resolved row |
| Schema mismatch | No | None |
| Permission/authentication failure | No | None |
| Unexpected integrity violation | No | None |
| Programming/data error | No | None |
| Missing replay fixture reference | No | Preserve original row |

The application service owns one session, one transaction, and one final commit for a newly completed operation. Repositories never commit or close. No second transaction writes retryable failure state, and no automatic whole-operation retry is performed.

## Decision Record Status

BIP-D042 through BIP-D057 are defined in `docs/context/decisions.md`; B.4 implementation statuses and the Level 2 result are recorded with conditions. The certification does not authorize canonical publication or ACP integration.

## Validation

- Workspace branch, HEAD, and common-base gate: PASS.
- Git-operation gate: PASS.
- Canonical source checksums: PASS for both governed sources.
- B.3 implementation evidence: inspected; empty metadata, baseline, isolated Compose configuration, and readiness boundary confirmed.
- B.3 environment ownership: preserved volume present; Compose container stopped; unrelated VisionFarm resources unchanged.
- Prohibited implementation audit: no B.4 models, repositories, services, endpoints, migration revisions, dependencies, or database mutations introduced.
- Semantic boundary audit: no final encoding, ACP contract, canonical publication, or real ACP integration claim.
- Certification scope: source and migration evidence inspected; no source, dependency, lock, migration, Docker, or ACP changes made during certification.
- `git diff --check`: required final validation.

## Next Authorization

The next authorized action is optional evaluation of `BIP-M1 — Phase B.4.4: Optional Test HTTP Adapter` only if application-level evidence demonstrates transport need. The canonical package slice remains separately gated.
