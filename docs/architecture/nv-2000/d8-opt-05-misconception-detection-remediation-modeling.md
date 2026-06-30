# NV-2000-D8-OPT-05 — Misconception Detection & Remediation Modeling

**Version:** 1.0
**Status:** READY
**Date:** 2025-06-28

## Purpose

Implement the canonical Misconception Detection & Remediation Modeling layer for the Assessment Agent.

This optimization introduces deterministic modeling of expected misconceptions, misconception categories, misconception-to-concept relationships, remediation strategies, instructional interventions, and misconception metadata.

D8-OPT-05 does **not** implement automatic misconception detection, adaptive tutoring, feedback generation, hint generation, reinforcement planning, learner diagnosis, mastery estimation, or scoring. It only models misconception knowledge.

## Misconception Philosophy

The Assessment Agent models misconception knowledge. It never:

- Diagnoses learners automatically
- Predicts misconceptions
- Evaluates users
- Generates personalized interventions

It stores governed misconception metadata that can be referenced during assessment composition.

## Remediation Modeling

Remediation strategies are modeled as deterministic metadata:

- Each misconception can have multiple remediation strategies
- Each strategy has a type, priority, and description
- Strategies reference associated concepts
- No personalized recommendations are generated

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│         Misconception Kernel (D8-OPT-05)                    │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Misconception    │    │  Misconception   │               │
│  │  Enums (6)        │───▶│  Contracts       │               │
│  └──────────────────┘    └──────────────────┘               │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Misconception    │    │  Misconception   │               │
│  │  Kernel          │───▶│  Validation      │               │
│  │  (Compose Fns)   │    │  (Never Throws)  │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
│  Deterministic. Pure. Immutable. No side effects.            │
│  Never diagnoses. Never detects automatically.               │
└─────────────────────────────────────────────────────────────┘
```

## Canonical Enums

| Enum | Count | Values |
|------|-------|--------|
| `CANONICAL_MISCONCEPTION_TYPES` | 10 | concept_confusion, terminology_confusion, dependency_confusion, causal_reasoning, procedural_error, algorithmic_error, architectural_misunderstanding, constraint_violation, overgeneralization, oversimplification |
| `CANONICAL_MISCONCEPTION_CAUSES` | 10 | missing_prerequisite, incorrect_assumption, memorization_without_understanding, mental_model_error, terminology_overlap, incorrect_abstraction, missing_relationship, incomplete_reasoning, incorrect_transfer, prior_bias |
| `CANONICAL_REMEDIATION_TYPES` | 10 | concept_review, worked_example, guided_practice, visual_explanation, relationship_review, laboratory_activity, comparison, counter_example, step_by_step_reasoning, knowledge_reconstruction |
| `CANONICAL_REMEDIATION_PRIORITY` | 10 | critical, very_high, high, medium, low, optional, preventive, reinforcement, recommended, supplementary |
| `CANONICAL_MISCONCEPTION_SEVERITY` | 5 | minimal, minor, moderate, major, critical |
| `CANONICAL_MISCONCEPTION_STATUS` | 6 | draft, review, approved, published, deprecated, archived |

## Contracts

| Contract | Purpose |
|----------|---------|
| `MisconceptionProvenance` | Immutable provenance metadata |
| `MisconceptionDecision` | Governance decision metadata |
| `MisconceptionTrace` | Deterministic trace metadata |
| `AssessmentMisconception` | Governed misconception record |
| `MisconceptionCauseEntry` | Cause of a misconception |
| `RemediationStrategy` | Remediation strategy for a misconception |
| `MisconceptionRelationship` | Relationship between misconceptions |
| `MisconceptionRegistryMetadata` | Registry-level metadata |
| `MisconceptionRegistry` | Complete misconception registry |
| `MisconceptionInput` | Input for compose functions |
| `AssessmentArtifactWithMisconceptions` | Artifact enriched with misconceptions |

## Registry

The `MisconceptionRegistry` is an immutable collection of `AssessmentMisconception` objects with deterministic metadata. It:

- Sorts misconceptions by ID (lexicographic)
- Generates deterministic registry IDs from sorted misconception IDs
- Declares version, nodeCount, and trace metadata
- Never mutates input arrays

## Validation

Validation functions return structured errors, never throw.

### Validation Codes (24)

| Code | Description |
|------|-------------|
| `MISCONCEPTION_DUPLICATE_ID` | Duplicate misconception ID detected |
| `MISCONCEPTION_DUPLICATE_TITLE` | Duplicate misconception title detected |
| `CAUSE_DUPLICATE_ID` | Duplicate cause ID detected |
| `REMEDIATION_DUPLICATE_ID` | Duplicate remediation ID detected |
| `RELATIONSHIP_DUPLICATE_ID` | Duplicate relationship ID detected |
| `MISCONCEPTION_INVALID_TYPE` | Non-canonical misconception type |
| `MISCONCEPTION_INVALID_CAUSE` | Non-canonical misconception cause |
| `MISCONCEPTION_INVALID_REMEDIATION` | Non-canonical remediation type |
| `MISCONCEPTION_INVALID_PRIORITY` | Non-canonical remediation priority |
| `MISCONCEPTION_INVALID_SEVERITY` | Non-canonical misconception severity |
| `MISCONCEPTION_INVALID_STATUS` | Non-canonical misconception status |
| `MISCONCEPTION_INVALID_GOVERNANCE` | Non-canonical governance level |
| `MISCONCEPTION_MISSING_PROVENANCE` | Missing provenance object |
| `MISCONCEPTION_MISSING_PROVIDER` | Missing provenance provider |
| `MISCONCEPTION_MISSING_RATIONALE` | Missing provenance rationale |
| `MISCONCEPTION_MISSING_ASSESSMENT_REFERENCE` | Missing assessment reference |
| `MISCONCEPTION_MISSING_CONCEPT_REFERENCE` | Missing concept reference |
| `MISCONCEPTION_MISSING_MISCONCEPTION_ID` | Missing misconception ID |
| `MISCONCEPTION_MISSING_TITLE` | Missing misconception title |
| `MISCONCEPTION_SELF_RELATIONSHIP` | Self-referencing relationship |
| `MISCONCEPTION_EMPTY_REGISTRY` | Empty or missing nodes array |
| `MISCONCEPTION_INVALID_TRACE` | Invalid trace determinism flags |
| `MISCONCEPTION_REGISTRY_INCONSISTENCY` | Metadata/node count mismatch |
| `MISCONCEPTION_INVALID_CONFIGURATION` | Invalid misconception configuration |

## Governance

All misconception records carry governance metadata:

- `canonical` — Official, authoritative misconception
- `accepted` — Validated but not canonical
- `provisional` — Under review
- `deprecated` — Superseded
- `rejected` — Does not meet standards

## Traceability

Every `AssessmentMisconception` carries:

- `MisconceptionTrace` with deterministic trace ID
- `MisconceptionProvenance` with provider, source, review status
- Governance metadata for misconception governance decisions

## Cross-Agent Boundaries

The Assessment Agent must NEVER:

- Detect misconceptions automatically
- Diagnose learners
- Generate hints
- Generate explanations
- Recommend personalized remediation
- Modify Knowledge Agent registries
- Modify Narrative Agent artifacts
- Modify Curriculum Agent progression

It only stores governed misconception metadata.

## Deterministic Guarantees

Forbidden in all compose and validation functions:

- `Math.random`, `Date.now`, `performance.now`, `crypto.randomUUID`
- `Promise`, `async`, `await`, `fetch`
- Filesystem, network, timers, `process.env`

## Extension Points

D8-OPT-05 provides the misconception modeling foundation. Later optimizations may extend:

- Automatic misconception detection
- Learner diagnosis
- Adaptive tutoring
- Personalized remediation

## Public API

### Compose Functions

| Function | Description |
|----------|-------------|
| `composeMisconceptionProvenance()` | Compose immutable provenance |
| `composeMisconceptionTrace()` | Compose deterministic trace |
| `composeAssessmentMisconception()` | Compose governed misconception |
| `composeMisconceptionCause()` | Compose misconception cause entry |
| `composeRemediationStrategy()` | Compose remediation strategy |
| `composeMisconceptionRelationship()` | Compose misconception relationship |
| `composeMisconceptionRegistry()` | Compose sorted immutable registry |
| `composeMisconceptionRegistryFromInput()` | Compose registry from input |
| `composeAssessmentMisconceptions()` | Compose misconceptions into registry |
| `composeAssessmentArtifactWithMisconceptions()` | Enrich artifact with misconceptions |

### Validation Functions

| Function | Returns |
|----------|---------|
| `validateAssessmentMisconception()` | `readonly MisconceptionValidationError[]` |
| `validateRemediationStrategy()` | `readonly MisconceptionValidationError[]` |
| `validateMisconceptionRelationship()` | `readonly MisconceptionValidationError[]` |
| `validateMisconceptionRegistry()` | `MisconceptionRegistryValidationResult` |
| `validateMisconceptionInput()` | `MisconceptionInputValidationResult` |
| `validateMisconceptionTrace()` | `MisconceptionTraceValidationResult` |
| `validateAssessmentArtifactWithMisconceptions()` | `AssessmentArtifactWithMisconceptionsValidationResult` |

## Files Created

| File | Purpose |
|------|---------|
| `src/agents/assessment-pipeline/MisconceptionKernel.ts` | Pure deterministic misconception compose functions |
| `src/agents/assessment-pipeline/MisconceptionValidation.ts` | Misconception validation layer (never throws) |
| `src/agents/assessment-pipeline/MisconceptionKernel.test.ts` | Exhaustive deterministic tests (~90) |
| `docs/architecture/nv-2000/d8-opt-05-misconception-detection-remediation-modeling.md` | This document |

## Files Modified

| File | Changes |
|------|---------|
| `src/agents/assessment-pipeline/AssessmentAgentContract.ts` | Extended with 6 misconception enums, 11 misconception contracts, 6 validation types |
| `src/agents/assessment-pipeline/index.ts` | Extended with misconception exports |
