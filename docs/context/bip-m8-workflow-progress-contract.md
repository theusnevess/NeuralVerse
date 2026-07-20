# BIP-M8 Frontend-Safe Workflow Progress Contract

Status: `APPROVED_AND_COMMITTED` as the isolated BIP-M8 prerequisite.

`GET /orchestration/v1/frontend/generation-jobs/{generation_job_id}/events`
returns only the durable BIP-M4 progress projection. The caller supplies
`X-NV-Viewer-Identity`; it must match the requesting learner identity. The
response is `text/event-stream` and never exposes Temporal history, activity
payloads, database rows, credentials or agent output.

Each event uses `id`, `event: workflow.progress`, and JSON `data` with
`schema_name: WorkflowProgressEvent`, `schema_version: 1.0.0`, workflow and
generation-job identity, package identity, durable event ID, normalized status,
phase, timestamp, terminal, retryable and safe error code fields.

`Last-Event-ID` is parsed as a non-negative durable sequence. Reconnects replay
strictly subsequent events in order, reject requests older than the retained
window, tolerate client-side duplicates, emit bounded keepalives and close
after the current durable projection. Raw Temporal internals remain private.
