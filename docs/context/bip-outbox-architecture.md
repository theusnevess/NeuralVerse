# BIP Transactional Outbox Architecture

The `transactional_outbox_events` table stores
`canonical_input.accepted` events with PostgreSQL claim locking. Intake commits
the canonical input, authoring job, idempotency record and outbox event before
any workflow operation.

The dispatcher claims `PENDING` or retryable events, invokes the injected
Temporal gateway outside the database transaction, and marks the event
`PUBLISHED` only after the gateway confirms start or signal. Failures retain a
bounded diagnostic and transition to retryable or dead-letter state.
