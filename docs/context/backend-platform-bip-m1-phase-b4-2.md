# NeuralVerse Backend Platform — BIP-M1 Phase B.4.2 Payload Preservation Adapter

Canonical Identifier: `NV-BIP-M1-B4-2`
Version: `1.0`
Status: `IMPLEMENTED WITH CONDITIONS`
Owner: Backend & Integration Platform
Authority: `NV-BIP-M0-CERT`, `NV-BIP-M1-B4-PLAN`, `NV-BIP-M1-B4-P1`, `NV-BIP-M1-B4-1`, `NV-BIP-000`, `NV-ACP-000`, and Explicit Project-Owner Decisions
Certified Common Base: `f885d4dabcd0f6ee8131d90dab586f9164e404f7`
Certified ACP Baseline: `b397035a9cfc3d376afc31633583f2b9ecd76548`
Implementation Scope: Raw and structural fixture preservation only
Implementation Readiness: `LEVEL 1 FIXTURE PRESERVATION FOUNDATION`
Supersession State: Active
Last Review Date: `2026-07-16`

## Scope

B.4.2 implements one database-independent payload adapter, one bounded conversion to `FixtureRecord`, and one minimal caller-owned fixture repository. It proves exact raw-byte retention for size-valid payloads, strict structural validation, fixture-local structural hashing, valid/rejected record construction, and PostgreSQL round trips against the existing B.4.1 head.

## Non-Scope

This phase does not implement idempotency acquisition/replay/locking, request fingerprints, audit writing, coordinated ingestion transactions, supersession operations, HTTP routes, Pydantic transport schemas, publication, learner state, outbox behavior, semantic adapters, shared contracts, generated clients, or ACP repository access. Level 2 readiness and real ACP integration are not claimed.

## Policy Closure Authority

`backend-platform-bip-m1-phase-b4-policy-closure.md` is the accepted policy authority. It closes B.4.2 policy unknowns at `0` and freezes the exact numeric, collection, string, key, finding, reader, and oversized-payload limits. No B.4.2 decision is reopened here.

## Input Boundary and Processing Order

`prepare_fixture_payload` accepts only `bytes`, schema metadata, `minimum_reader_version`, producer/media metadata, and an aware receipt timestamp. It performs: bytes/type check; exact byte-size check; raw SHA-256 for size-valid bytes; reader compatibility short circuit; BOM check; strict UTF-8 decode; strict JSON parse; structural/numeric validation; structural representation; canonicalization; structural SHA-256.

No database, transaction, logger, semantic interpreter, or external service is used by the adapter.

## Raw Bytes and Oversized Short Circuit

The maximum raw payload is 1 MiB inclusive. Size-valid input is retained exactly in `BYTEA` and hashed with SHA-256 over received bytes, producing lowercase 64-character hexadecimal. Whitespace, line endings, Unicode byte encoding, and object-key order therefore affect the raw hash.

Input above 1 MiB returns `NON_PERSISTABLE_REJECTED` before hashing, decoding, BOM handling, parsing, canonicalization, structural hashing, `FixtureRecord` construction, or persistence. Its result contains no raw bytes or hash and exposes only a safe code. No record can be constructed from it.

## Reader Compatibility

The current fixture-local reader is `1.0.0`. A valid minimum reader version lower than or equal to `1.0.0` continues processing. A malformed or higher version returns a persistable `STRUCTURALLY_REJECTED` result with exact raw bytes and raw hash, no decoder/parser execution, null structural fields, and a bounded `MINIMUM_READER_VERSION_MALFORMED` or `MINIMUM_READER_VERSION_UNSUPPORTED` finding. This is local reader behavior, not cross-front compatibility.

## UTF-8, BOM, and Strict JSON

UTF-8 decoding is strict. Invalid sequences are rejected without replacement. UTF-8 BOM, UTF-16 BOM, and UTF-32 BOM inputs are rejected explicitly; encoding detection and transcoding are not performed. The standard-library JSON parser uses explicit pair-aware object handling, exact `Decimal` parsing, integer parsing, and a rejecting non-finite-number hook. Trailing content, invalid syntax, duplicate keys at any nesting level, `NaN`, `Infinity`, and `-Infinity` are rejected. No repair or last/first-value-wins behavior exists.

## Numeric and Structural Limits

The adapter enforces significant digits `256`, absolute lexical exponent `1000`, and normalized decimal scale `256` after insignificant trailing fractional zeros are removed. It never converts numbers through binary floating point. It also enforces nesting depth `64`, object members `4,096`, array elements `16,384`, string code points `262,144`, and object-key code points `256` independently at every nested value. No truncation or repair occurs.

## Structural Representation

Objects become Python dictionaries, arrays remain ordered lists, strings remain decoded Unicode strings, booleans/null remain their JSON values, and exact numbers remain Python integers or `Decimal` values. Unknown and nested unknown fields are retained. Null remains distinct from missing; empty objects and arrays remain present. PostgreSQL JSONB provides structural storage, not raw-byte authority. Object-key order is not claimed after JSONB persistence.

## Canonicalization and Structural Hash

`struct-v1` emits compact UTF-8 JSON with no insignificant whitespace, sorts object keys by Unicode code point, preserves array order, escapes strings with standard JSON escaping without Unicode normalization, renders booleans/null as JSON literals, renders integers in base 10, and renders exact decimals in fixed-point form after trailing fractional-zero removal and negative-zero normalization. Structural SHA-256 hashes those canonical bytes. It is deterministic and fixture-local, not RFC 8785/JCS and not a final cross-front serialization.

## Findings and Result Types

`ValidationFinding` contains bounded `code`, `severity`, safe `message`, and optional bounded location. Findings are deterministic, contain no payload values, SQL, credentials, stack traces, or canonical `ValidationResult` claim. At most 64 findings are retained; when more than 64 exist, the first 63 are retained and the final finding is `FINDINGS_TRUNCATED`.

The result disposition is explicit: `PERSISTABLE_VALID`, `PERSISTABLE_REJECTED`, or `NON_PERSISTABLE_REJECTED`. Persistable rejection retains raw bytes/hash and has null structural fields with status `STRUCTURALLY_REJECTED`. Valid results contain paired structural payload/hash and status `STRUCTURALLY_VALID`. Oversized results are non-persistable.

## FixtureRecord Construction

`PreparedFixturePayload.to_fixture_record` creates an opaque UUIDv4, copies schema metadata/raw bytes/raw hash/findings/timestamps, fixes `TEST_FIXTURE`, `NON_CANONICAL`, `agent_generated = false`, and `NOT_A_FINAL_SHARED_CONTRACT`, and pairs structural fields only for valid results. It rejects non-persistable results and invents no semantic fields. It does not access a database or commit.

## Fixture Repository

`FixtureRecordRepository` exposes only `add(session, record)` and `get_by_id(session, fixture_record_id)`. The caller owns the SQLAlchemy `Session`, transaction, commit, rollback, and close. The repository does not implement update/delete/generic CRUD, idempotency, audit, HTTP, semantic interpretation, or external side effects. It touches only `fixture_records` and uses the adapter-owned canonical structural representation for exact JSONB binding/retrieval.

## PostgreSQL Round Trips

Using isolated project `neuralverse-backend-b42`, database `neuralverse_backend_b42`, user `neuralverse_b42`, and loopback port `55434`, the database was migrated from `b30000000001` to `b41000000001`. Valid and rejected fixtures were inserted and retrieved. Tests proved raw bytes/hash equality, structural JSON equality, exact decimal recovery, structural hash equality, array order, unknown/nested fields, null/missing distinction, findings, schema metadata, fixed classification, caller rollback, and zero idempotency/audit rows. The preserved `neuralverse-backend-bip_postgres-data` volume and VisionFarm resources were not used or modified.

## Security and Semantic Boundary

Raw and structural payloads are not logged. Safe findings omit payload values and exception details. SQLAlchemy parameters are hidden by the existing engine/test configuration. The fixture remains `TEST_FIXTURE`, `NON_CANONICAL`, `NOT_AGENT_GENERATED`, `NOT_A_FINAL_SHARED_CONTRACT`, `RAW_PAYLOAD_PRESERVING`, `STRUCTURAL_PAYLOAD_PRESERVING`, `ORDER_PRESERVING`, `SCHEMA_METADATA_EXPLICIT`, and `ADAPTER_ISOLATED`. No ACP repository file was consumed; canonical sources remain external and checksum-verified. CF-010, CF-011, and CF-012 remain unresolved.

## Tests and Known Limitations

Focused unit tests cover raw vectors, whitespace/ordering, UTF-8/BOM, strict JSON, duplicate keys, reader versions, oversized short-circuiting, numeric and structural boundaries, fixed structural vectors, findings, record construction, and repository ownership. PostgreSQL tests cover valid/rejected persistence, retrieval, rollback, exact structural values, migration head, and zero idempotency/audit rows. Full backend regression, Ruff, mypy, lock, Alembic, and scope audits remain required final checks.

Idempotency acquisition, PostgreSQL locking, request-fingerprint conflict, completed replay, coordinated ingestion, audit writing, endpoint exposure, publication, learner state, hosted operation, semantic round trips, and Level 2 readiness remain unproven and unimplemented.

## B.4.3 Gate

B.4.2 is implemented with conditions and B.4.3 is authorized: `BIP-M1 — Phase B.4.3: Idempotent Fixture Ingestion Transaction and Operational Audit`. No B.4.3 code is included in this phase.
