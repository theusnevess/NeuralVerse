# BIP Stage 2 — NV-XFI Operational Workflow Boundary

Status: `IMPLEMENTED_WITH_EXPLICIT_BOUNDARIES`

The Backend now exposes an operational intake seam for the ACP Stage 2
workflow. `CrossFrontWorkflowService` validates an NV-XFI-000 envelope, maps
it to the existing fixture ingestion/idempotency command, bounds retryable
failures, rejects command-identity reuse for a different envelope, and records
an execution checkpoint with envelope/payload hashes, attempt lineage and
terminal status.

`JsonFileWorkflowStore` provides atomic local persistence for checkpoint,
resume, replay and cancellation behavior. `SqlAlchemyWorkflowStore` provides
the transactional repository implementation and migration
`b42000000001_cross_front_workflow`. The queue/worker seam deduplicates command
delivery; production queue deployment remains an environment concern.
Successful workers acknowledge commands, exceptions explicitly requeue claimed
commands, and SQLAlchemy claims carry bounded lease timestamps so expired
claims are recoverable. Multi-process deployment tuning remains an
infrastructure concern.

The HTTP composition root accepts an injected workflow service and exposes
`POST /cross-front/nv-xfi-000` with a required `Idempotency-Key`. Missing
configuration returns an explicit service-unavailable response rather than
silently accepting a message.

No ACP semantic contract is redefined. NV-XFI-000 remains the current semantic
authority; Backend owns transport, persistence and operational retry policy.

The PostgreSQL migration and workflow/queue round-trip are covered by the
integration suite when the project-owned development database is enabled.
The ACP HTTP client has also been exercised against the live loopback route,
returning `202 COMPLETED` and persisting the workflow execution row.
