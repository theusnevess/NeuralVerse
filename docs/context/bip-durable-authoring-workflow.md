# BIP Durable Authoring Workflow

The workflow boundary is represented by `AuthoringWorkflowState` and the
injected `TemporalAuthoringGateway`. The production adapter delegates to a
Temporal client without importing ACP or interpreting contract meaning.

The first event starts the deterministic workflow ID. Later events signal the
existing workflow. Duplicate fingerprints are ignored by workflow state. The
workflow tracks contract names and versions, canonical input IDs, fingerprints,
revision, pending inputs and last accepted event.

The workflow does not generate content, select agents, publish content or write
frontend state.
