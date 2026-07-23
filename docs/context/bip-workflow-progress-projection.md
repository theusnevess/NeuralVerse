# Workflow Progress Projection

`BIPM4ProgressProjectionRecord` is the durable status read model. It stores
state, stage, bounded stage lists, revision bounds, artifact references,
validation and governance summaries, failure metadata, timestamps, and a
monotonic progress sequence.

`PersistWorkflowProgressActivity` owns writes and retries independently of ACP
activities.
