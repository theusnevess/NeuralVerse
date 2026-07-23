# Orchestration API

The `/orchestration/v1` surface exposes generation start, status, projected
history, human review, revision directives, publication-command acceptance,
and cancellation. Temporal SDK objects and raw ACP payloads are not exposed.

Start persistence commits the generation job, execution projection, initial
progress event, command idempotency record, and Temporal start outbox event in
one transaction.
