# BIP Authoring Job Model

`authoring_jobs` is the durable BIP workflow aggregate. Its workflow ID is
deterministically derived as `authoring-job:<authoring_job_id>`.

Jobs track package identity when available, status, optimistic `lock_version`,
revision, received contract names, canonical input IDs, artifact fingerprints,
last accepted event and workflow-started state.

Availability policy: one accepted contract creates `INPUTS_AVAILABLE`; all four
released contract names are required before `READY_FOR_AUTHORING`. This is an
availability policy only and does not reinterpret ACP semantics.
