# NeuralVerse Backend Platform — BIP-M1 Phase B.4.3 Idempotent Fixture Ingestion

Canonical Identifier: `NV-BIP-M1-B4-3`
Version: `1.0`
Status: `IMPLEMENTED WITH CONDITIONS`
Owner: Backend & Integration Platform
Authority: `NV-BIP-M0-CERT`, `NV-BIP-M1-B4-PLAN`, `NV-BIP-M1-B4-P1`, `NV-BIP-M1-B4-P2`, `NV-BIP-M1-B4-1`, `NV-BIP-M1-B4-2`, `NV-BIP-000`, `NV-ACP-000`, and Explicit Project-Owner Decisions
Certified Common Base: `f885d4dabcd0f6ee8131d90dab586f9164e404f7`
Certified ACP Baseline: `b397035a9cfc3d376afc31633583f2b9ecd76548`
Implementation Scope: Application-level idempotent fixture ingestion and operational audit only
Implementation Readiness: `LEVEL 1 FIXTURE TRANSACTION FOUNDATION`
Supersession State: Active
Last Review Date: `2026-07-16`

## Scope

B.4.3 implements one transport-independent `IngestFixture` application operation. It coordinates the B.4.2 payload adapter, fixed idempotency identity, HMAC keyring lookup, request fingerprint, PostgreSQL acquisition/locking, fixture persistence, bounded operational audit, replay/conflict behavior, terminal outcomes, and one service-owned transaction.

## Non-Scope

No HTTP route, request/response transport model, authentication, authorization, supersession operation, publication, learner state, outbox, message dispatch, Temporal, Redis, semantic schema, ACP adapter, generated client, or frontend integration was added. No dependency, migration, model, or Compose change was made.

## P2 Policy Authority

`backend-platform-bip-m1-phase-b4-idempotency-policy-closure.md` is the accepted P2 authority with unresolved B.4.3 policy unknowns equal to `0`. It fixes `fixture_ingest`/`ingest_fixture`, key bounds, HMAC keyring, fingerprint markers, failure classification, attempts, takeover, replay, conflict, audit matrix, and transaction ownership.

## Command and Results

`IngestFixtureCommand` is transport-independent and contains raw bytes, schema metadata, reader/producer metadata, media type, raw idempotency key, correlation/request IDs, receipt time, and optional supersession UUID. Scope and operation are service constants. Invalid command metadata returns a safe result before database acquisition.

`IngestFixtureResult` exposes only operational outcome, optional fixture UUID, validation status, replay flag, idempotency status, safe error code, retryability, and bounded finding codes. It never exposes raw payloads, structural payloads, keys, digests, fingerprints, sessions, SQLAlchemy objects, database exceptions, or HTTP status codes.

## HMAC Configuration and Keyring

Typed settings are `NEURALVERSE_FIXTURE_INGESTION_ENABLED`, `NEURALVERSE_IDEMPOTENCY_HMAC_ACTIVE_KEY_VERSION`, `NEURALVERSE_IDEMPOTENCY_HMAC_ACTIVE_KEY`, and `NEURALVERSE_IDEMPOTENCY_HMAC_PREVIOUS_KEYS`. Ingestion is disabled by default. Enabled operation requires a valid version token and standard-Base64 active key decoding to exactly 32 bytes. Previous keys are a duplicate-safe JSON mapping of at most four version tokens to 32-byte keys; active-version duplication, invalid Base64, invalid versions, and wrong decoded lengths are rejected without secret disclosure.

The exact HMAC message is `key-hash-v1\0fixture_ingest\0ingest_fixture\0<raw-key>`. HMAC-SHA-256 produces 32 raw digest bytes. New records use the active key. Existing lookup tries active first and previous versions in lexical version order; zero matches create a new identity, one match is authoritative, and multiple matches are a non-retryable integrity failure. Key versions are not stored in the database. Rotation retains prior material at least 30 days after cutover and never reuses a version for different material.

## Request Fingerprint

`request-fingerprint-v1` uses length-delimited SHA-256 over fixed operation, schema, media, reader, producer, supersession, and raw-hash fields. Correlation ID, request ID, timestamps, transport ordering, and HMAC version are excluded. For oversized payloads, raw hash is an absent marker, classification is `OVERSIZED`, and exact decimal byte length is included; payload bytes are not hashed or included.

## Idempotency Repository and State Machine

`IdempotencyRecordRepository` uses caller-owned sessions, PostgreSQL `INSERT ... ON CONFLICT DO NOTHING`, candidate lookup across active/previous digests, and `SELECT FOR UPDATE`. It can insert, lock, complete, terminalize, take over, and reacquire records. It never commits, rolls back the complete transaction, closes sessions, processes payloads, or writes audit rows.

Initial acquisition creates `IN_PROGRESS` with attempt 1 and a 24-hour lock. Active same-fingerprint requests return `IN_PROGRESS` without mutation/audit; different fingerprints conflict. Expired matching rows take over under row lock only within 30 days and below 100 attempts, incrementing once and refreshing the lock. Existing `FAILED_RETRYABLE` rows reacquire under the same bounds, although normal B.4.3 paths produce no durable retryable rows. Attempt 100 and expired horizons terminalize.

`COMPLETED` covers valid and persistable rejected fixtures and references `FIXTURE_RECORD`. `FAILED_TERMINAL` covers oversized payloads, attempt exhaustion, and retry-window expiry with stable codes and no fixture reference. Replay validates the original fixture reference, creates no fixture, preserves attempt/status/reference, and writes only replay audit. Missing fixture references are non-retryable integrity failures.

## Audit Repository and Matrix

`OperationalAuditEventRepository.add` is append-only and caller-session-owned. It never updates, deletes, commits, closes, logs payloads, or logs keys. Implemented event selection is:

| Path | Event | Subject |
|---|---|---|
| New valid fixture | `FIXTURE_INGESTION_ACCEPTED` | Fixture |
| New persistable rejection | `FIXTURE_INGESTION_REJECTED` | Fixture |
| Oversized/attempt/retry-window terminal | `FIXTURE_INGESTION_REJECTED` | Idempotency |
| Completed/terminal replay | `IDEMPOTENCY_REPLAYED` | Idempotency |
| Fingerprint conflict | `IDEMPOTENCY_CONFLICT` | Idempotency |
| Active same-request observation | None | None |
| Takeover | Final operation event only | Final subject |
| Database/internal rollback | None | None |

Metadata is bounded to the existing 16 KiB constraint and contains only safe validation status, finding count, payload length, schema metadata, replay flag, attempt count, and error code. Payloads, keys, digests, fingerprints, HMAC versions, SQL, URLs, exception representations, credentials, and semantic provenance are excluded.

## Transaction Sequence

1. Validate command metadata.
2. Compute normal raw hash or oversized fingerprint marker.
3. Compute candidate HMAC digests and request fingerprint.
4. Open one caller-independent service session and transaction.
5. Find/acquire/lock the identity using PostgreSQL.
6. Resolve active, takeover, reacquisition, replay, conflict, or terminal state.
7. Prepare the payload for an executable operation.
8. Insert a fixture when persistable.
9. Insert the required audit event.
10. Complete or terminalize the idempotency record.
11. Commit once, except replay commits only replay audit.
12. Return the committed operational result.

Retryable structured database/transaction failures roll back without durable `FAILED_RETRYABLE`, fixture, audit, or completion state. The caller retries the exact identity. Commit uncertainty returns `COMMIT_OUTCOME_UNKNOWN` and is resolved by durable retry; no process-local memory or automatic whole-operation retry exists.

## PostgreSQL Validation

The isolated `neuralverse-backend-b43` PostgreSQL 16 database was migrated from the empty baseline to `b41000000001`. Tests covered creation, persistable rejection, oversized terminalization, replay, conflict, active rows, takeover, retry-window and attempt limits, previous-key reacquisition, rollback, identical concurrent requests, conflicting concurrent requests, audit behavior, migration/catalog state, and payload regression. The central identical-request invariant passed: one new fixture maximum.

## Security and Semantic Boundary

The fixture remains `TEST_FIXTURE`, `NON_CANONICAL`, `NOT_AGENT_GENERATED`, `NOT_A_FINAL_SHARED_CONTRACT`, and adapter-isolated. No educational meaning is interpreted, no semantic contract is introduced, and CF-010/CF-011/CF-012 remain unresolved. No payload, key, digest, fingerprint, SQL, credential, or external side effect is logged or persisted in audit metadata.

## Level 2 Gate

BIP-D055 is not granted by this phase. Migration, preservation, ordering, unknown fields, null/missing, duplicate keys, numeric behavior, idempotency, concurrency, replay, audit, atomicity, and semantic restrictions have implementation evidence in this worktree. Hosted operation, authentication, cleanup scheduling, production retention, real ACP integration, publication, learner state, and semantic round trips remain outside the gate evidence.

## Known Limitations

The HTTP adapter remains absent and optional. Retryable failure outcomes are caller-retry results without durable `FAILED_RETRYABLE` rows. Hosted HMAC secret management, production retention, authorization, operational cleanup, and cross-front semantic integration remain deferred.
