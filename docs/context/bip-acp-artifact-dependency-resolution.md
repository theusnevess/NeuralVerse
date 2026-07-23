# BIP ACP Artifact Dependency Resolution

`CanonicalArtifactReferenceLoader` verifies canonical bytes, SHA-256,
contract identity and version, generation-job ownership, revision compatibility,
and producer identity before returning a bounded reference.

The loader is designed for activity execution, not Temporal workflow code.
The remaining Stage 9 integration work is wiring this loader to the persisted
canonical-input and AgentRun projections for every later-stage activity.
