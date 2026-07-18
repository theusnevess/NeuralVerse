# BIP Neutral Contract Adoption Matrix

| Contract | Version | Reader | Schema validation | Lossless raw value | Status |
|---|---:|---|---|---|---|
| CurriculumContract | 1.0.0 | `readCurriculumContract` | Released schema | Yes | Implemented |
| AgentContribution | 1.0.0 | `readAgentContribution` | Released schema plus structured-payload guard | Yes | Implemented |
| LearningPackageDraft | 1.0.0 | `readLearningPackageDraft` | Released schema | Yes | Implemented |
| PublicationReadinessRecommendation | 1.0.0 | `readPublicationReadinessRecommendation` | Released schema plus readiness consistency guard | Yes | Implemented |

All readers delegate to `readCanonicalInput`. Compatible minor versions are
validated against the pinned 1.0.0 schema; other major versions fail.
