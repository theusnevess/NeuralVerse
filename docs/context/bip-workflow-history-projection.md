# Workflow History Projection

`BIPM4WorkflowProgressEventRecord` stores sanitized workflow events rather
than raw Temporal history. Events are ordered by generation job and sequence,
contain only bounded metadata and stable references, and are the source for
history queries and SSE replay.
