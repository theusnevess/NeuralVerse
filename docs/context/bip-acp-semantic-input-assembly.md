# BIP ACP Semantic Input Assembly

`acp_input_assembly.py` converts a bounded generation context and persisted
artifact references into an operation-specific ACP envelope. It validates
typed semantic versions, canonical producer identity, generation-job identity,
revision, dependencies, and the four-megabyte input bound before process
invocation.

Input fingerprints include operation identity, producer identity, contract
versions, generation job, revision, ordered dependency fingerprints, and the
semantic payload. Correlation IDs and runtime details are excluded.

The current implementation requires semantic input under `payload.semantic_input`
and does not treat an arbitrary XFI output as a producer input. Persisted
reference loading for later workflow activities remains an integration blocker.
