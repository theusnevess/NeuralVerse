# BIP Workflow Artifact Reference Map

`WorkflowArtifactReferenceMap` stores bounded metadata only. Its slots cover
curriculum, evidence, knowledge, the five enrichment contributions, didactic
assembly, validation, governance, revision directives, draft and readiness.
Canonical JSON is never placed in the map.

Each reference carries its persistence locator, contract release, operation,
producer, generation job, workflow, revision, artifact fingerprint, assembled
input fingerprint and ordered dependency fingerprints. Downstream slots are
invalidated when a revision changes an upstream dependency.

This is implemented in `bip_m4/workflow_artifact_references.py`; live
PostgreSQL/Temporal certification remains pending.
