# BIP Neutral Contract Adoption

Status: `NV-BIP-M3 IMPLEMENTED — CERTIFICATION REQUIRED`

BIP is the canonical consumer of the released `CurriculumContract`,
`AgentContribution`, `LearningPackageDraft`, and
`PublicationReadinessRecommendation` representations.

The immutable snapshot is under `backend/vendor/neutral-contracts/nv-xfi-input-contracts-v1.0.0`.
It is pinned to tag `nv-xfi-input-contracts-v1.0.0`, commit
`8b468c23866e5aa58b8d6dd28f33b40f1310bb8d`, and version `1.0.0`.

The BIP boundary parses strict UTF-8 JSON, verifies the vendored release,
checks compatibility, validates against the released schemas, and returns a
lossless `CanonicalIntake`. Invalid input returns a structured failure and
cannot proceed to workflow or persistence.

ACP owns contract meaning. The neutral release owns representation and
compatibility. BIP owns intake and later transport, idempotency, workflow, and
persistence boundaries. M3 does not implement database persistence, durable
workflow execution, or publication execution.

ACP producer status: `CERTIFIED WITH CONDITIONS`.
Cross-front round trip: `NOT YET CERTIFIED`.
