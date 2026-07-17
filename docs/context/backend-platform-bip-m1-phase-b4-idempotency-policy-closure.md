# NeuralVerse Backend Platform — BIP-M1 Phase B.4 Idempotency Policy Closure

Canonical Identifier: `NV-BIP-M1-B4-P2`
Version: `1.0`
Status: `ACCEPTED`
Owner: Backend & Integration Platform
Authority: `NV-BIP-M1-B4-PLAN`, `NV-BIP-M1-B4-P1`, `NV-BIP-000`, `NV-ACP-000`, and Explicit Project-Owner Decisions
Certified Common Base: `f885d4dabcd0f6ee8131d90dab586f9164e404f7`
Certified ACP Baseline: `b397035a9cfc3d376afc31633583f2b9ecd76548`
Implementation Scope: Idempotency, retry, takeover, HMAC and audit policy closure only
Implementation Readiness: `B.4.3 POLICY COMPLETE`
Supersession State: Active
Last Review Date: `2026-07-16`

## Original Blocker

B.4.3 was blocked as `IDEMPOTENCY_OR_AUDIT_POLICY_INCOMPLETE`. The previous plan defined the schema and broad state machine but left retryable failure classification, attempt/takeover behavior, HMAC runtime material, and failure-path audit selection open.

## Fixed Runtime Scope

The only B.4.3 identity is `scope = fixture_ingest` and `operation_name = ingest_fixture`. These are service constants, not caller fields. They participate in HMAC input, request fingerprinting, uniqueness, and safe audit metadata when appropriate. They must not be reused for publication, learner state, supersession, ACP ingestion, or cleanup.

## Idempotency-Key Policy

Keys are 1..255 characters, each ASCII byte in `0x21..0x7E`. No trimming, case conversion, Unicode normalization, URL decoding, or whitespace handling occurs. Exact ASCII bytes are authoritative. Raw keys are never stored, logged, audited, returned, or included in exception messages.

## HMAC Message and Runtime Configuration

The exact message is:

```text
ASCII("key-hash-v1") || NUL || ASCII("fixture_ingest")
|| NUL || ASCII("ingest_fixture") || NUL || ASCII(raw_key)
```

The algorithm is HMAC-SHA-256, output is 32 raw bytes, and the database stores the digest in `idempotency_key_hash BYTEA`. `key-hash-v1` is the message-format version and is distinct from secret-material versions.

Typed runtime fields are:

```text
NEURALVERSE_FIXTURE_INGESTION_ENABLED
NEURALVERSE_IDEMPOTENCY_HMAC_ACTIVE_KEY_VERSION
NEURALVERSE_IDEMPOTENCY_HMAC_ACTIVE_KEY
NEURALVERSE_IDEMPOTENCY_HMAC_PREVIOUS_KEYS
```

Ingestion is disabled by default. Disabled configuration does not require HMAC material; explicit tests may inject it. Enabled operation requires a 1..32 character version token containing only letters, digits, dot, underscore, or hyphen, plus an active standard-Base64 key decoding to exactly 32 bytes. Previous keys are a JSON object with at most four version-to-Base64-key entries; every version/key is validated, the active version is forbidden there, duplicate properties are rejected, and complete values never appear in errors or logs.

## HMAC Lookup and Rotation

New rows always use the active key. Existing identity lookup computes active first, then previous-key candidates ordered by version token. Zero matches means a new identity; one match is authoritative; multiple matches are an integrity failure. Key versions are not stored in the database row.

Rotation generates new 32-byte material and a unique version, moves the old active key into the previous map, deploys the keyring atomically, uses only the new key for new rows, and retains the old key at least 30 days after cutover. It is removed only after all records that may use it pass retention and are purged. At most four previous keys are retained; if safe removal cannot be proven, the key remains. Version reuse with different material is prohibited. Hot reload is not required.

## Request Fingerprint

`request-fingerprint-v1` remains a length-delimited SHA-256 over operation name, schema name/version, media type, raw payload SHA-256 when available, minimum reader version, producer version, and supersession ID. Correlation ID, request ID, timestamps, transport order, and HMAC key version are excluded.

For oversized requests, the raw-hash component is an absent marker, payload size is the exact decimal byte length, and classification is `OVERSIZED`. Payload bytes are never hashed or included. Different oversized lengths are distinguishable without claiming oversized content identity.

## Durable and Non-Durable Failure Separation

Retryable operation failures roll back fully, create no durable `FAILED_RETRYABLE` row, fixture, audit event, or completion, and return a safe retryable result for caller retry using the same identity. B.4.3 normally produces zero durable `FAILED_RETRYABLE` rows; that state is reserved for a later capability.

Structured serialization failure, deadlock, configured lock/statement timeout, pool timeout, transient connection refusal/reset, database restart/shutdown, and unknown commit outcome are retryable when identified through structured SQLSTATE/driver categories. Schema mismatch, permission/authentication failure, invalid SQL, unexpected integrity violation, programming/data error, model/migration divergence, unsupported database version, and multiple HMAC matches are non-retryable internal failures. Arbitrary error-message matching and automatic whole-operation retry are prohibited.

## Durable Outcomes

`COMPLETED` covers valid and persistable structurally rejected fixtures. It stores a `FIXTURE_RECORD` response reference and retains for 30 days. `FAILED_TERMINAL` is produced only for oversized payloads, attempt-limit exhaustion, and expired retry windows. Stable codes are `PAYLOAD_TOO_LARGE`, `IDEMPOTENCY_ATTEMPT_LIMIT_EXCEEDED`, and `IDEMPOTENCY_RETRY_WINDOW_EXPIRED`; terminal records have no response reference and retain for 30 days.

Command validation that prevents safe identity construction creates no database state and is not terminalization. A completed structural rejection is a completed operational result, not a transaction failure.

## attempt_count

Initial acquisition starts at attempt 1, with a maximum of 100. The count increments exactly once for expired `IN_PROGRESS` takeover or `FAILED_RETRYABLE` reacquisition. It does not increment for active observation, replay, conflict, lookup, previous-key lookup, validation failure, or rolled-back work. At 100, execution is blocked and terminalized with `IDEMPOTENCY_ATTEMPT_LIMIT_EXCEEDED`.

## Active and Expired IN_PROGRESS

An `IN_PROGRESS` row is active when `current_time < expires_at`. Same-fingerprint observation returns `IN_PROGRESS` without mutation or audit. Different fingerprint returns `IDEMPOTENCY_CONFLICT` without mutation.

At or after expiry, same-fingerprint takeover requires `SELECT ... FOR UPDATE`, `attempt_count < 100`, and `current_time < created_at + 30 days`. Under the row lock it remains `IN_PROGRESS`, increments once, sets `locked_at = now`, sets `expires_at = now + 24 hours`, clears failure/reference fields, and continues the fixture operation in the same transaction. At or beyond the 30-day horizon, or at attempt 100, it terminalizes without payload processing. No separate takeover event exists.

## Existing FAILED_RETRYABLE

Although B.4.3 does not normally create this status, an existing matching record may reacquire immediately when `attempt_count < 100` and `current_time < failed_at + 30 days`. Under row lock it transitions to `IN_PROGRESS`, increments once, refreshes the 24-hour lock, clears failure fields, and continues. Different fingerprints conflict. Expired retry window terminalizes with `IDEMPOTENCY_RETRY_WINDOW_EXPIRED`; attempt 100 terminalizes with `IDEMPOTENCY_ATTEMPT_LIMIT_EXCEEDED`.

## Replay and Conflict

Matching `COMPLETED` records load and verify the fixture reference, create no fixture, preserve attempt/status/reference, append `IDEMPOTENCY_REPLAYED`, and commit only that replay audit event. Matching `FAILED_TERMINAL` records return the stable terminal code, do not reprocess or increment, append terminal replay audit, and preserve the row. A missing completed fixture reference is a non-retryable integrity failure; the original row remains unchanged.

Different fingerprints return `IDEMPOTENCY_CONFLICT`, do not reveal fingerprints or digests, do not create or mutate fixtures/identity, and append the conflict event. Unknown commit outcome is `COMMIT_OUTCOME_UNKNOWN`, retryable, and resolved by retrying the exact scope/key/fingerprint using durable database state rather than process memory.

## Audit Event Matrix

| Path | Event | Subject |
|---|---|---|
| New valid fixture | `FIXTURE_INGESTION_ACCEPTED` | Fixture |
| New persistable rejection | `FIXTURE_INGESTION_REJECTED` | Fixture |
| Oversized terminal result | `FIXTURE_INGESTION_REJECTED` | Idempotency |
| Completed or terminal replay | `IDEMPOTENCY_REPLAYED` | Idempotency |
| Fingerprint conflict | `IDEMPOTENCY_CONFLICT` | Idempotency |
| Active same-request observation | None | None |
| Expired takeover | Final operation event only | Final subject |
| Attempt-limit/retry-window terminalization | `FIXTURE_INGESTION_REJECTED` | Idempotency |
| Retryable/non-retryable rollback | None; structured application log | None |

Safe metadata may contain validation status, finding count, payload byte length, schema name/version, replayed flag, attempt count, and safe terminal/rejection code. Payloads, excerpts, keys, digests, fingerprints, HMAC versions, URLs, SQL, exception representations, credentials, and semantic provenance are prohibited.

## Transaction Ownership

The application service owns one session, one transaction, and one final commit for a newly completed operation. Repositories may add, query, lock, and flush but never commit or close. No second transaction writes retryable failure state; no automatic whole-operation retry exists. Replay may commit only its replay audit event. The expected unique-acquisition race may be resolved through the same PostgreSQL path and is not a general transaction retry loop.

## State Matrix

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

## Database-Failure Matrix

| Failure | Retryable operation | Durable mutation |
|---|---:|---:|
| Serialization/deadlock/lock timeout/statement timeout | Yes | None after rollback |
| Pool/transient connection failure | Yes | None |
| Commit outcome unknown | Yes | Unknown; resolve by retry |
| Expected unique acquisition race | Normal acquisition path | Resolved row policy |
| Schema/permission/authentication failure | No | None |
| Unexpected integrity/programming/data error | No | None |
| Missing replay fixture reference | No | Preserve original row |

## Test Implications

Future B.4.3 tests must cover keyring validation and redaction, active/previous HMAC vectors, multiple-candidate integrity failure, oversized fingerprint markers, state transitions, attempt boundaries, one-microsecond expiry boundaries, row-lock takeover, retry-window expiry, structured database classifications, rollback with no durable failure row, commit ambiguity replay, accepted/rejected/oversized audit paths, replay/conflict audit, and real PostgreSQL concurrency. No implementation is included in P2.

## Deferred Behavior

B.4-P2 does not implement B.4.3. HTTP exposure, authentication, hosted operation, cleanup automation, real ACP integration, publication, learner state, semantic contracts, and B.4.4 remain deferred.

## Authorization Result

Current unresolved B.4.3 policy unknowns: `0`. B.4.3 policy is complete and implementation is authorized: `BIP-M1 — Phase B.4.3: Idempotent Fixture Ingestion Transaction and Operational Audit`.
