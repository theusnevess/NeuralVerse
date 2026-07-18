# BIP Canonical Intake Persistence

Status: `NV-BIP-M4 IMPLEMENTED — CERTIFICATION REQUIRED`

Validated canonical bytes are persisted in `canonical_input_records` together
with release identity, schema hash, deterministic artifact fingerprint and a
textual parsed canonical representation. The raw byte column is authoritative
for exact recovery; the parsed representation is not flattened into domain
tables.

`authoring_jobs`, canonical input, idempotency state and the
`canonical_input.accepted` outbox event are created in one PostgreSQL
transaction. Invalid canonical input is rejected before a session is opened.
