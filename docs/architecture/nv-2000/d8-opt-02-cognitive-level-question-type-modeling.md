# NV-2000-D8-OPT-02 — Cognitive Level & Question Type Modeling

**Version:** 1.0
**Status:** READY
**Date:** 2025-06-28

## Purpose

Implement the canonical cognitive modeling layer of the Assessment Agent.

This optimization introduces the deterministic metadata required to classify assessment artifacts according to cognitive complexity, reasoning style, question structure, educational objective, and expected evidence.

D8-OPT-02 does **not** verify answers, evaluate learners, compute scores, generate feedback, estimate mastery, or detect misconceptions. It only establishes the governed cognitive taxonomy upon which the remainder of D8 will operate.

## Motivation

Assessment artifacts are not homogeneous. Different questions evaluate different cognitive processes:

- **Recall** — memory retrieval of facts
- **Conceptual understanding** — comprehension of relationships
- **Application** — using knowledge in new contexts
- **Engineering reasoning** — systematic problem solving
- **Trade-off evaluation** — weighing competing constraints
- **Constraint analysis** — reasoning under limitations
- **System design** — architectural decision making
- **Critical reflection** — meta-cognitive evaluation

D8-OPT-02 creates this deterministic cognitive layer. No educational judgment is performed. Only governed metadata is modeled.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               Cognitive Kernel (D8-OPT-02)                  │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Cognitive Enums  │    │  Cognitive       │               │
│  │  (6 canonical)    │───▶│  Contracts       │               │
│  └──────────────────┘    └──────────────────┘               │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Cognitive       │    │  Cognitive       │               │
│  │  Kernel          │───▶│  Validation      │               │
│  │  (Compose Fns)   │    │  (Never Throws)  │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
│  Deterministic. Pure. Immutable. No side effects.            │
└─────────────────────────────────────────────────────────────┘
```

## Cognitive Taxonomy

| Level | Description |
|-------|-------------|
| `remember` | Recall facts and basic concepts |
| `understand` | Explain ideas or concepts |
| `apply` | Use information in new situations |
| `analyze` | Draw connections among ideas |
| `evaluate` | Justify a stand or decision |
| `create` | Produce new or original work |
| `reason` | Apply logical deduction |
| `justify` | Defend a position with evidence |
| `design` | Architect a solution |
| `reflect` | Meta-cognitive self-assessment |

## Question Taxonomy

| Type | Description |
|------|-------------|
| `multiple_choice` | Single correct answer from options |
| `multiple_select` | Multiple correct answers from options |
| `true_false` | Binary correctness judgment |
| `short_answer` | Brief written response |
| `long_answer` | Extended written response |
| `matching` | Pair related items |
| `ordering` | Sequence items correctly |
| `concept_mapping` | Visualize relationships |
| `engineering_case` | Solve an engineering scenario |
| `reflection` | Meta-cognitive self-assessment |

## Expected Evidence Taxonomy

| Evidence Type | Description |
|---------------|-------------|
| `selected_option` | Learner chose a specific option |
| `written_response` | Learner produced text |
| `concept_relationship` | Learner mapped relationships |
| `calculation` | Learner performed computation |
| `engineering_argument` | Learner constructed technical argument |
| `architecture_design` | Learner designed a system |
| `laboratory_observation` | Learner observed and reported |
| `comparison` | Learner compared alternatives |
| `decision_justification` | Learner justified a choice |
| `reflection` | Learner reflected on learning |

## Contracts

| Contract | Purpose |
|----------|---------|
| `CognitiveProvenance` | Immutable provenance metadata |
| `CognitiveDecision` | Governance decision metadata |
| `CognitiveTrace` | Deterministic trace metadata |
| `CognitiveAssessmentProfile` | Governed cognitive profile |
| `CognitiveRelationship` | Deterministic links between profiles |
| `CognitiveRegistryMetadata` | Registry-level metadata |
| `CognitiveRegistry` | Complete cognitive registry |
| `CognitiveInput` | Input for compose functions |
| `AssessmentArtifactWithCognitiveProfile` | Artifact enriched with profile |
| `CognitiveValidationError` | Single validation error |
| `CognitiveValidationResult` | Generic validation result |
| `CognitiveNodeValidationResult` | Node-level validation |
| `CognitiveRegistryValidationResult` | Registry-level validation |
| `CognitiveInputValidationResult` | Input-level validation |
| `CognitiveTraceValidationResult` | Trace-level validation |
| `AssessmentArtifactWithCognitiveProfileValidationResult` | Artifact+profile validation |

## Registry

The `CognitiveRegistry` is an immutable collection of `CognitiveAssessmentProfile` objects with deterministic metadata. It:

- Sorts profiles by ID (lexicographic)
- Generates deterministic registry IDs from sorted profile IDs
- Declares version, nodeCount, and trace metadata
- Never mutates input arrays

## Validation

Validation functions return structured errors, never throw.

### Validation Codes (19)

| Code | Description |
|------|-------------|
| `COGNITIVE_DUPLICATE_ID` | Duplicate profile ID detected |
| `COGNITIVE_DUPLICATE_TITLE` | Duplicate profile title detected |
| `COGNITIVE_INVALID_LEVEL` | Non-canonical cognitive level |
| `COGNITIVE_INVALID_QUESTION_TYPE` | Non-canonical question type |
| `COGNITIVE_INVALID_REASONING` | Non-canonical reasoning type |
| `COGNITIVE_INVALID_OBJECTIVE` | Non-canonical assessment objective |
| `COGNITIVE_INVALID_EXPECTED_EVIDENCE` | Non-canonical expected evidence type |
| `COGNITIVE_INVALID_STATUS` | Non-canonical cognitive status |
| `COGNITIVE_INVALID_GOVERNANCE` | Non-canonical governance level |
| `COGNITIVE_MISSING_PROVENANCE` | Missing provenance object |
| `COGNITIVE_MISSING_PROVIDER` | Missing provenance provider |
| `COGNITIVE_MISSING_RATIONALE` | Missing provenance rationale |
| `COGNITIVE_MISSING_ASSESSMENT_REFERENCE` | Missing assessment reference |
| `COGNITIVE_MISSING_PROFILE_ID` | Missing profile ID |
| `COGNITIVE_MISSING_TITLE` | Missing profile title |
| `COGNITIVE_SELF_RELATIONSHIP` | Self-referencing relationship |
| `COGNITIVE_EMPTY_REGISTRY` | Empty or missing nodes array |
| `COGNITIVE_INVALID_TRACE` | Invalid trace determinism flags |
| `COGNITIVE_REGISTRY_INCONSISTENCY` | Metadata/node count mismatch |

## Governance

All cognitive profiles carry governance metadata:

- `canonical` — Official, authoritative profile
- `accepted` — Validated but not canonical
- `provisional` — Under review
- `deprecated` — Superseded
- `rejected` — Does not meet standards

## Determinism

Forbidden in all compose and validation functions:

- `Math.random`
- `Date.now`
- `performance.now`
- `crypto.randomUUID`
- `Promise`
- `async`/`await`
- `fetch`
- Filesystem access
- Network access
- Timers
- `process.env`

## Public API

### Compose Functions

| Function | Description |
|----------|-------------|
| `composeCognitiveProvenance()` | Compose immutable provenance |
| `composeCognitiveTrace()` | Compose deterministic trace |
| `composeCognitiveAssessmentProfile()` | Compose governed cognitive profile |
| `composeCognitiveRelationship()` | Compose deterministic relationship |
| `composeCognitiveRegistry()` | Compose sorted immutable registry |
| `composeCognitiveRegistryFromInput()` | Compose registry from input |
| `composeAssessmentCognitiveProfiles()` | Compose profiles into registry |
| `composeAssessmentArtifactWithCognitiveProfile()` | Enrich artifact with profile |

### Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedCognitiveLevel()` | Type guard for cognitive levels |
| `isSupportedQuestionType()` | Type guard for question types |
| `isSupportedReasoningType()` | Type guard for reasoning types |
| `isSupportedAssessmentObjective()` | Type guard for objectives |
| `isSupportedExpectedEvidenceType()` | Type guard for evidence types |
| `isSupportedCognitiveStatus()` | Type guard for cognitive statuses |
| `isSupportedCognitiveGovernance()` | Type guard for governance levels |
| `getCanonicalCognitiveLevels()` | Returns copy of canonical levels |
| `getCanonicalQuestionTypes()` | Returns copy of canonical question types |
| `getCanonicalReasoningTypes()` | Returns copy of canonical reasoning types |
| `getCanonicalAssessmentObjectives()` | Returns copy of canonical objectives |
| `getCanonicalExpectedEvidenceTypes()` | Returns copy of canonical evidence types |
| `getCanonicalCognitiveStatuses()` | Returns copy of canonical statuses |

### Validation Functions

| Function | Returns |
|----------|---------|
| `validateCognitiveAssessmentProfile()` | `readonly CognitiveValidationError[]` |
| `validateCognitiveRelationship()` | `readonly CognitiveValidationError[]` |
| `validateCognitiveRegistry()` | `CognitiveRegistryValidationResult` |
| `validateCognitiveInput()` | `CognitiveInputValidationResult` |
| `validateCognitiveTrace()` | `CognitiveTraceValidationResult` |
| `validateAssessmentArtifactWithCognitiveProfile()` | `AssessmentArtifactWithCognitiveProfileValidationResult` |

## Out-of-Scope

D8-OPT-02 does **not** implement:

- Answer verification
- Grading/scoring
- Feedback generation
- Misconception detection
- Hint generation
- Mastery estimation
- Reinforcement plans
- Portfolio scoring
- Laboratory execution
- Question generation
- Adaptive assessment
- LLM inference
- Curriculum decisions

## Runtime Limitations

- No `async` functions
- No `Promise` objects
- No external dependencies
- No filesystem I/O
- No network I/O
- No environment variable reads
- No timestamps in compose output
- No random number generation

## Files Created

| File | Purpose |
|------|---------|
| `src/agents/assessment-pipeline/AssessmentCognitiveKernel.ts` | Pure deterministic cognitive compose functions |
| `src/agents/assessment-pipeline/AssessmentCognitiveValidation.ts` | Cognitive validation layer (never throws) |
| `src/agents/assessment-pipeline/AssessmentCognitiveKernel.test.ts` | Exhaustive deterministic tests (~85) |
| `docs/architecture/nv-2000/d8-opt-02-cognitive-level-question-type-modeling.md` | This document |

## Files Modified

| File | Changes |
|------|---------|
| `src/agents/assessment-pipeline/AssessmentAgentContract.ts` | Extended with cognitive enums, contracts, and validation types |
| `src/agents/assessment-pipeline/index.ts` | Extended with cognitive exports |
