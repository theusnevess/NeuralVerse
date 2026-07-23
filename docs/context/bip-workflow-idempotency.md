# Workflow Idempotency

Generation start and command records use operation plus idempotency key and a
SHA-256 request fingerprint. Identical retries replay the stored bounded
response. Reuse with different input raises a structured conflict.

Progress events use `(generation_job_id, sequence)` as a unique key. A replay
with the same event fingerprint is accepted; a different payload is rejected
as `PROGRESS_SEQUENCE_CONFLICT`.
