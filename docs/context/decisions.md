# NeuralVerse — Decisions

## Active Decisions

- NeuralVerse remains frontend-first/static unless explicitly changed.
- BIP-M0 Phase 6 explicitly authorizes a staged modular-monolith backend target; current frontend-first delivery remains the operational baseline until migration gates pass. See `backend-platform-target-architecture.md`.
- BIP-M0 discovery baseline is certified with conditions at `LEVEL 1 - FOUNDATION READY`; the next authorized phase is `BIP-M1 - Phase A: Backend Python Foundation and Dependency Selection`. See `backend-platform-bip-m0-certification.md`.
- BIP-M1 Phase A foundation is implemented with conditions at `LEVEL 1 FOUNDATION VALIDATED`; PostgreSQL, semantic contracts, and the fixture vertical slice remain deferred. See `backend-platform-bip-m1-phase-a.md`.
- BIP-M1 Phase B persistence foundation is planned with conditions; PostgreSQL, SQLAlchemy, Alembic, and persistence implementation remain separately gated by `backend-platform-bip-m1-phase-b-plan.md`.
- BIP-D012 and BIP-D014 are implemented and locked in BIP-M1 Phase B.1; BIP-D029 through BIP-D032 record dependency grouping, database URL redaction, hosted TLS, and no-connection readiness policy. See `backend-platform-bip-m1-phase-b1.md`.
- BIP-M1 Phase B.2 is implemented with a lazy synchronous SQLAlchemy runtime, lifespan ownership, infrastructure-scoped sessions, and bounded on-demand readiness checks. BIP-D016 through BIP-D018, BIP-D025, and BIP-D033 through BIP-D036 are recorded in `backend-platform-bip-m1-phase-b2.md`.
- BIP-M1 Phase B.3 is implemented with conditions: one reviewed empty Alembic baseline, project-isolated PostgreSQL 16 Compose validation, real migration/connectivity tests, and migration-aware readiness. BIP-D019 through BIP-D021 and BIP-D025 are implemented with conditions; BIP-D037 through BIP-D041 are recorded in `backend-platform-bip-m1-phase-b3.md`.
- BIP-M1 Phase B.4 is certified with conditions at Level 2 in `backend-platform-bip-m1-phase-b4-certification.md`; the fixture vertical slice is PostgreSQL-validated while canonical publication, ACP integration, hosted operation, and semantic round trips remain separately gated.
- UI should follow a premium dark AI research aesthetic.
- Graph visualization should prioritize clarity over complexity.
- Playwright/browser validation is preferred for UI-heavy tasks.
- OpenCode configuration should remain minimal, reversible, and project-local.

## Avoided Decisions

- No backend, auth, or database before explicit owner authorization; this avoidance is superseded for the BIP-M0 backend initiative by the Phase 6 target documents.
- No heavy dependencies.
- No broad rewrites without approval.

## BIP-M1 Phase B.4 Decisions

### BIP-D042 — Fixture operational table boundary

Problem: define the smallest durable operational slice before fixture implementation. Constraints: no semantic, publication, learner, workflow, outbox, or domain tables. Options: one generic payload table; three operational tables; full first vertical slice. Decision: plan exactly `fixture_records`, `idempotency_records`, and `operational_audit_events`. Rationale: separates immutable evidence, command replay, and audit without claiming semantic authority. Evidence: BIP-M1 B.3 boundary, NV-BIP-000 operational ownership, and B.4 plan. Consequences: no publication or canonical persistence. Rejected: generic CRUD/domain schema. Implementation trigger: B.4.1 authorization. Review trigger: demonstrated query or lifecycle gap. Status: `IMPLEMENTED WITH CONDITIONS`; model, migration, and minimal fixture repository boundary implemented; idempotency/audit repositories remain deferred.

### BIP-D043 — Raw-payload byte preservation

Problem: preserve exact fixture input before shared encoding is approved. Constraints: JSONB is not byte-preserving. Options: text only; JSONB only; exact `BYTEA` plus hash. Decision: retain exact bytes in `BYTEA` and SHA-256 the received bytes. Rationale: proves byte equality independently from decoding and structural storage. Evidence: BIP JSON/payload plan and ACP preservation boundary. Consequences: 1 MiB operational bound and separate structural representation. Rejected: decoded text-only storage. Implementation trigger: B.4.2. Review trigger: measured payload limits or approved encoding. Status: `IMPLEMENTED WITH CONDITIONS`; exact raw retention and hashing are implemented and validated; storage columns and database size/hash-shape constraints remain the schema boundary.

### BIP-D044 — Structural JSON parsing and duplicate-key policy

Problem: parse bounded JSON without silent semantic loss. Constraints: no new dependency, duplicate keys must not normalize silently. Options: default decoder; reject duplicate keys with explicit hook; preserve duplicate pairs structurally. Decision: standard-library parser with explicit duplicate detection and rejection, retaining bounded raw bytes. Rationale: JSONB cannot preserve duplicate keys and default parsing hides the defect. Evidence: BIP preservation plan, NV-ACP-000 unknown-field rules, and BIP-D056. Consequences: rejected fixture evidence is durable but not structurally valid. Rejected: last-key-wins behavior. Implementation trigger: B.4.2. Review trigger: approved parser/contract policy. Status: `IMPLEMENTED WITH CONDITIONS`; strict parser, duplicate detection, BOM/UTF-8 policy, and rejection behavior are implemented and validated.

### BIP-D045 — Structural hashing algorithm

Problem: make structural equality reproducible without claiming final canonical encoding. Constraints: raw hash is independent; no precision loss; no new package. Options: raw hash reused; unspecified JSON hash; versioned deterministic serializer. Decision: `struct-v1`, SHA-256 over compact recursive canonical JSON with sorted object keys, ordered arrays, exact bounded numbers, and UTF-8 encoding. Rationale: separates structural equality from raw equality and remains adapter-local. Evidence: BIP hash/equality requirements and BIP-D056. Consequences: serializer must be proven before Level 2; not RFC 8785 or cross-front canonicalization. Rejected: JSONB bytes or vague `hash the JSON`. Implementation trigger: B.4.2. Review trigger: precision or interoperability evidence. Status: `IMPLEMENTED WITH CONDITIONS`; fixed vectors, numeric preservation, PostgreSQL round trip, and limits are validated; this remains fixture-local rather than cross-front canonicalization.

### BIP-D046 — Fixture immutability and supersession

Problem: prevent payload and validation evidence from being overwritten. Constraints: corrections must preserve prior evidence. Options: mutable row; database trigger; immutable insert plus permissions and service lineage. Decision: insert-only fixture rows, no runtime update/delete, explicit self-reference supersession, application cycle checks, and database checks for self-reference. Rationale: smallest enforceable boundary without triggers. Evidence: BIP version/lineage rules. Consequences: corrections create new rows and retention must preserve lineage. Rejected: mutable status/payload updates and delete-as-correction. Implementation trigger: B.4.1/B.4.2. Review trigger: privileged maintenance need. Status: `IMPLEMENTED WITH CONDITIONS`; schema self-reference and checks only; service/role enforcement remains deferred.

### BIP-D047 — Idempotency-key hashing and scope

P2 closure: fixed `fixture_ingest`/`ingest_fixture` identity, visible ASCII key bounds, exact `key-hash-v1` HMAC-SHA-256 message, typed active/previous Base64 keyring, deterministic lookup, and 30-day rotation retention. Status: `IMPLEMENTED WITH CONDITIONS`; B.4.3 implementation and keyring tests are validated.

Problem: prevent raw key storage while separating operations and scopes. Constraints: keys may be sensitive; key reuse must conflict deterministically. Options: plaintext; unsalted hash; HMAC-SHA-256 with versioned secret. Decision: HMAC-SHA-256 over versioned scope/operation/key input, with key version retained and unique `(scope, key_hash)`. Rationale: protects raw keys and permits controlled rotation. Evidence: BIP security/idempotency policy and B.4.3 keyring tests. Consequences: hosted secret provisioning and rotation remain production-readiness work. Rejected: plaintext and process-local authority. Implementation trigger: B.4.3. Review trigger: approved secret-management or retention policy. Status: `IMPLEMENTED WITH CONDITIONS`.

### BIP-D048 — Idempotency state machine

P2 closure: B.4.3 produces zero durable `FAILED_RETRYABLE` rows; retryable failures roll back for caller retry. `COMPLETED` covers valid/rejected fixtures; `FAILED_TERMINAL` covers oversized, attempt-limit, and expired-retry-window outcomes with deterministic replay. Status: `IMPLEMENTED WITH CONDITIONS`; service and state behavior are validated.

Problem: define replay, retry, conflict, and terminal behavior. Constraints: committed results must be recoverable; illegal transitions must be rejected. Options: boolean processed flag; four explicit states. Decision: `IN_PROGRESS`, `COMPLETED`, `FAILED_RETRYABLE`, and `FAILED_TERMINAL`, with explicit legal transitions and stable fixture response references. Rationale: captures operational failure modes without HTTP-response blobs. Evidence: NV-BIP-000 idempotency requirements. Consequences: expiration and cleanup remain operational policy. Rejected: boolean or unbounded status vocabulary. Implementation trigger: B.4.3. Review trigger: new command type. Status: `IMPLEMENTED WITH CONDITIONS`; status/reference constraints only; acquisition and replay remain deferred.

### BIP-D049 — Idempotency concurrent acquisition

P2 closure: active rows observe in-progress/conflict without mutation; expired matching rows take over only under row lock, within 30 days and below 100 attempts; failed-retryable rows reacquire under the same bounds. Status: `IMPLEMENTED WITH CONDITIONS`; real PostgreSQL concurrency and takeover tests pass.

Problem: prevent duplicate fixture insertion under concurrent requests. Constraints: PostgreSQL is the authority; SQLite and process locks are prohibited. Options: advisory lock; process lock; unique insert-on-conflict plus row lock. Decision: unique `(scope, key_hash)`, atomic insert-on-conflict, and targeted `SELECT FOR UPDATE` for existing records. Rationale: uses durable database constraints and narrow locking. Evidence: PostgreSQL concurrency and takeover tests. Consequences: measured hosted contention remains future operational evidence. Rejected: Redis/process-local locks as authority. Implementation trigger: B.4.3. Review trigger: measured contention. Status: `IMPLEMENTED WITH CONDITIONS`.

### BIP-D050 — Operational audit boundary

P2 closure: accepted/rejected, replay, conflict, oversized, attempt-limit, and retry-window audit selection is frozen; takeover has no separate event; rollback paths write no audit row. Status: `IMPLEMENTED WITH CONDITIONS`; audit writes and rollback behavior are validated.

Problem: retain minimal evidence for fixture/idempotency operations without absorbing semantic provenance. Constraints: append-only, bounded, redacted, no security/governance scope. Decision: `operational_audit_events` with five initial event types, safe metadata, subject references, and no payload. Rationale: supports operational investigation while preserving ownership boundaries. Evidence: security baseline, BIP audit plan, and B.4.3 audit tests. Consequences: security/governance audit remain separate. Rejected: generic audit table for all histories. Implementation trigger: B.4.3. Review trigger: compliance or actor model. Status: `IMPLEMENTED WITH CONDITIONS`.

### BIP-D051 — Fixture-ingestion transaction boundary

P2 closure: the service owns one session, one transaction, and one final commit; repositories never commit/close; no second failure transaction or automatic whole-operation retry exists. Status: `IMPLEMENTED WITH CONDITIONS`; transaction ownership and atomicity are validated.

Problem: make ingestion, idempotency, and audit atomic. Constraints: one service owns commit; repositories never commit; external side effects are deferred. Decision: `IngestFixture` owns one transaction from idempotency acquisition through fixture/audit insertion and completion. Rationale: prevents orphan fixtures, duplicate completion, and unlinked audit. Evidence: BIP transaction plan, B.2 session policy, and controlled rollback tests. Consequences: bounded rejected evidence is inserted in the same transaction. Rejected: route commits and scattered repository transactions. Implementation trigger: B.4.3. Review trigger: external side effect introduction. Status: `IMPLEMENTED WITH CONDITIONS`.

### BIP-D052 — Fixture endpoint exposure policy

Problem: avoid exposing test payload persistence as a production content API. Constraints: fixture is non-canonical and potentially sensitive. Decision: application-service-only first; optional `/internal/fixtures` later, disabled in hosted mode by default and separately authorized. Rationale: prove persistence and transactions before transport exposure. Evidence: security baseline and B.4 scope. Consequences: Level 2 does not require HTTP. Rejected: public `/api/v1` fixture endpoint. Implementation trigger: B.4.4 authorization. Review trigger: verified operator workflow. Status: `PLANNED WITH CONDITIONS`.

### BIP-D053 — Fixture data-retention policy

Problem: avoid undefined retention for potentially sensitive test evidence. Constraints: local data is disposable; hosted feature is disabled by default. Decision: local/manual cleanup, integration database cleanup by owner, and proposed future hosted bounds of 30 days fixture/idempotency and 90 days operational audit. Rationale: bounded operational replay and low-cost test evidence without automatic deletion in first implementation. Evidence: BIP/ACP retention principles. Consequences: automated cleanup requires separate ownership and backup review. Rejected: indefinite retention and request-time silent deletion. Implementation trigger: B.4.3/hosted enablement. Review trigger: privacy/compliance requirement. Status: `PLANNED WITH CONDITIONS`.

### BIP-D054 — First operational migration grouping

Problem: choose review and rollback granularity for the first operational capability. Constraints: exactly three tables and no partial capability. Decision: one reviewed migration from `b30000000001` creating all three tables and indexes. Downgrade is destructive and development-empty-database-only. Rationale: one atomic capability with one migration review. Evidence: BIP B.3 migration policy and table boundary. Consequences: populated/hosted downgrade is unsupported. Rejected: fragmented migrations without independent value. Implementation trigger: B.4.1. Review trigger: independent lifecycle or lock-impact evidence. Status: `IMPLEMENTED WITH CONDITIONS`; downgrade was validated only on disposable empty development state.

### BIP-D055 — Level 2 fixture-readiness gate

Certification: the complete B.4 gate is satisfied with conditions. Fresh PostgreSQL migration/catalog evidence, preservation, service transaction, replay/recovery, concurrency, audit atomicity/redaction, rollback, readiness continuity, semantic isolation, and full integration evidence are recorded in `backend-platform-bip-m1-phase-b4-certification.md`. Status: `LEVEL 2 - FIXTURE VERTICAL SLICE CERTIFIED WITH CONDITIONS`.

Problem: define when fixture persistence is proven without overclaiming canonical readiness. Constraints: real PostgreSQL, preservation, concurrency, audit, and semantic boundaries must all pass. Decision: Level 2 requires three implemented tables, migration/catalog evidence, service transaction, preservation matrix, idempotency concurrency/recovery, audit atomicity, readiness continuity, and zero ACP/semantic overreach. These requirements are satisfied with conditions documented in `backend-platform-bip-m1-phase-b4-certification.md`. Rationale: implementation evidence precedes vertical-slice readiness while hosted and canonical capabilities remain separate. Evidence: BIP-M0/BIP-M1 gates, B.4.3 implementation, and fresh PostgreSQL validation. Consequences: optional HTTP transport and the canonical package slice remain separately gated. Rejected: readiness based on schema creation or unit tests alone. Implementation trigger: after B.4.3 and optional B.4.4 decision. Review trigger: first real cross-front contract. Status: `CERTIFIED WITH CONDITIONS`.

### BIP-D056 — Payload Preservation Operational Limits and Reader Compatibility

P2 cross-reference: B.4-P2 preserves all accepted B.4.2 payload behavior and only closes the downstream idempotency/transaction policy boundary.


Problem: B.4.2 lacked exact decimal scale, finding, collection, reader-compatibility, and oversized-payload behavior. Constraints: preserve raw bytes exactly within the existing 1 MiB boundary, avoid semantic interpretation, bound parser work, retain the existing strict UTF-8/BOM/duplicate-key/numeric/hash decisions, and add no dependency. Options: leave bounds implementation-defined; reject all complex payloads; freeze bounded operational limits and short-circuit rules. Decision: normalized decimal scale `256`; significant digits `256`; absolute lexical exponent `1000`; maximum findings `64` with first 63 plus `FINDINGS_TRUNCATED`; object members `4096`; array elements `16384`; strings `262144` Unicode code points; object keys `256` Unicode code points. Bounds are measured after strict UTF-8 decoding and before canonicalization/JSONB. Malformed or higher minimum-reader versions are rejected before decoding/parsing but retain raw bytes and raw hash when within size. Payloads above 1 MiB are rejected immediately before hashing, decoding, parsing, canonicalization, structural hashing, construction, or persistence. Rationale: closes all processing-cost and compatibility gaps without changing semantic boundaries. Evidence: BIP-D043, BIP-D044, BIP-D045, BIP-D053, BIP-D055, and the B.4-P1 closure artifact. Consequences: B.4.2 has deterministic limits and rejection behavior; oversized payloads have no hash or fixture row; B.4.3 remains separately authorized. Rejected alternatives: implementation-defined limits, truncation/repair, hashing oversized bytes, forward interpretation by an older reader. Implementation trigger: B.4.2. Review trigger: measured safe payload requirements, approved reader/version policy, or cross-front contract. Status: `IMPLEMENTED WITH CONDITIONS`; policy and adapter behavior are closed and validated.

### BIP-D057 — Idempotency Retry, Takeover and HMAC Runtime Contract

Problem: close B.4.3 gaps for fixed operation identity, HMAC keyrings, retry classification, durable statuses, attempt/takeover behavior, replay, and audit selection. Constraints: preserve the three-table boundary, B.4.2 behavior, fixed fingerprint fields, 24-hour locks, 30-day retention, PostgreSQL uniqueness/row locks, one service-owned transaction, audit schema, and no HTTP endpoint. Decision: accept `fixture_ingest`/`ingest_fixture`; 1..255 visible ASCII keys; exact `key-hash-v1` HMAC-SHA-256 bytes; typed active/previous Base64 32-byte keyring with four-key maximum and deterministic lookup/rotation; non-durable retryable operation failures; zero normal B.4.3 durable `FAILED_RETRYABLE` producers; structured transient database failures rollback for caller retry; `COMPLETED` for valid/rejected fixtures; `FAILED_TERMINAL` only for oversized, attempt-limit, and expired-retry-window outcomes; exact attempt, lock, takeover, replay, conflict, audit, and transaction rules in `backend-platform-bip-m1-phase-b4-idempotency-policy-closure.md`. Rationale: removes implementation discretion while preserving failure honesty and atomicity. Evidence: explicit B.4-P2 owner decisions, BIP-D047 through BIP-D057, and the Level 2 certification artifact. Consequences: B.4.3 implementation and Level 2 fixture readiness are certified with conditions; B.4.4, authentication, hosted operation, ACP integration, publication, and learner state remain deferred. Rejected: durable retry writes after rollback, automatic operation retry, process-local locks, arbitrary caller scopes, secret-version reuse, second failure transactions, and HTTP exposure. Implementation trigger: B.4.3. Review trigger: new operation identity, key-management/retention change, or new failure class. Status: `IMPLEMENTED WITH CONDITIONS`; application service, keyring, replay/conflict, audit, rollback, and PostgreSQL concurrency behavior are validated.
