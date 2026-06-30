# NV-2000-D8-OPT-01 — Assessment Contract & Registry Kernel

**Version:** 1.0
**Status:** READY
**Date:** 2025-06-28

## Purpose

Establish the canonical deterministic foundation of the Assessment Agent.

This optimization implements the complete registry architecture, immutable contracts, deterministic composition layer, validation infrastructure, provenance model, trace model, registry kernel, and public exports that every subsequent D8 optimization will build upon.

D8-OPT-01 implements **only the structural foundation**. It must **not** implement any assessment logic, answer verification, feedback generation, misconception detection, scoring, reinforcement planning, laboratory integration, or portfolio evaluation.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Assessment Pipeline                       │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  AgentContract    │    │  Validation      │               │
│  │  (Types + Enums)  │───▶│  (Never Throws)  │               │
│  └──────────────────┘    └──────────────────┘               │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Kernel           │    │  Barrel Export   │               │
│  │  (Compose Fns)    │───▶│  (index.ts)     │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
│  Deterministic. Pure. Immutable. No side effects.            │
└─────────────────────────────────────────────────────────────┘
```

## Canonical Enums

| Enum | Count | Values |
|------|-------|--------|
| `CANONICAL_ASSESSMENT_ARTIFACT_TYPES` | 10 | multiple_choice, short_answer, concept_mapping, laboratory_assessment, visual_assessment, engineering_case, comparative_reasoning, constraint_analysis, portfolio_evaluation, reflection |
| `CANONICAL_ASSESSMENT_DOMAINS` | 10 | computer_vision, machine_learning, deep_learning, generative_ai, mlops, robotics, edge_ai, data_engineering, software_engineering, research |
| `CANONICAL_ASSESSMENT_STATUS` | 6 | draft, review, approved, published, deprecated, archived |
| `CANONICAL_ASSESSMENT_GOVERNANCE` | 5 | canonical, accepted, provisional, deprecated, rejected |

## Contracts

| Contract | Purpose |
|----------|---------|
| `AssessmentProvenance` | Immutable provenance metadata |
| `AssessmentDecision` | Governance decision metadata |
| `AssessmentTrace` | Deterministic trace metadata |
| `AssessmentNode` | Governed assessment artifact |
| `AssessmentRegistryMetadata` | Registry-level metadata |
| `AssessmentRegistry` | Complete assessment registry |
| `AssessmentInput` | Input for composeAssessmentRegistryFromInput |
| `AssessmentValidationError` | Single validation error |
| `AssessmentValidationResult` | Generic validation result |
| `AssessmentNodeValidationResult` | Node-level validation result |
| `AssessmentRegistryValidationResult` | Registry-level validation result |
| `AssessmentInputValidationResult` | Input-level validation result |
| `AssessmentTraceValidationResult` | Trace-level validation result |

## Registry

The `AssessmentRegistry` is an immutable collection of `AssessmentNode` objects with deterministic metadata. It:

- Sorts nodes by ID (lexicographic)
- Generates deterministic registry IDs from sorted node IDs
- Declares version, nodeCount, and trace metadata
- Never mutates input arrays

## Validation

Validation functions return structured errors, never throw.

| Function | Returns |
|----------|---------|
| `validateAssessmentNode()` | `readonly AssessmentValidationError[]` |
| `validateAssessmentRegistry()` | `AssessmentRegistryValidationResult` |
| `validateAssessmentInput()` | `AssessmentInputValidationResult` |
| `validateAssessmentTrace()` | `AssessmentTraceValidationResult` |

### Validation Codes (15)

| Code | Description |
|------|-------------|
| `ASSESSMENT_DUPLICATE_ID` | Duplicate node ID detected |
| `ASSESSMENT_DUPLICATE_TITLE` | Duplicate node title detected |
| `ASSESSMENT_INVALID_ARTIFACT_TYPE` | Non-canonical artifact type |
| `ASSESSMENT_INVALID_DOMAIN` | Non-canonical domain |
| `ASSESSMENT_INVALID_STATUS` | Non-canonical status |
| `ASSESSMENT_INVALID_GOVERNANCE` | Non-canonical governance level |
| `ASSESSMENT_MISSING_PROVENANCE` | Missing provenance object |
| `ASSESSMENT_MISSING_RATIONALE` | Missing provenance rationale |
| `ASSESSMENT_MISSING_PROVIDER` | Missing provenance provider |
| `ASSESSMENT_MISSING_TRACE` | Missing trace metadata |
| `ASSESSMENT_MISSING_ASSESSMENT_ID` | Missing node ID |
| `ASSESSMENT_MISSING_TITLE` | Missing node title |
| `ASSESSMENT_EMPTY_REGISTRY` | Empty or missing nodes array |
| `ASSESSMENT_INVALID_TRACE` | Invalid trace determinism flags |
| `ASSESSMENT_REGISTRY_INCONSISTENCY` | Metadata/node count mismatch |

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

Compose functions produce identical outputs for identical inputs.

## Governance

All artifacts carry governance metadata at the node level:

- `canonical` — Official, authoritative assessment
- `accepted` — Validated but not canonical
- `provisional` — Under review
- `deprecated` — Superseded
- `rejected` — Does not meet standards

## Public API

### Compose Functions

| Function | Description |
|----------|-------------|
| `composeAssessmentProvenance()` | Compose immutable provenance |
| `composeAssessmentTrace()` | Compose deterministic trace |
| `composeAssessmentNode()` | Compose governed assessment node |
| `composeAssessmentRegistry()` | Compose immutable registry from nodes |
| `composeAssessmentRegistryFromInput()` | Compose registry from input |
| `composeAssessment()` | Top-level compose with validation |

### Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedAssessmentArtifactType()` | Type guard for artifact types |
| `isSupportedAssessmentDomain()` | Type guard for domains |
| `isSupportedAssessmentStatus()` | Type guard for statuses |
| `isSupportedAssessmentGovernance()` | Type guard for governance levels |
| `getCanonicalAssessmentArtifactTypes()` | Returns copy of canonical types |
| `getCanonicalAssessmentDomains()` | Returns copy of canonical domains |
| `getCanonicalAssessmentStatuses()` | Returns copy of canonical statuses |
| `getCanonicalAssessmentGovernance()` | Returns copy of canonical governance |

### Validation Functions

| Function | Description |
|----------|-------------|
| `validateAssessmentNode()` | Validate single node |
| `validateAssessmentRegistry()` | Validate full registry |
| `validateAssessmentInput()` | Validate input object |
| `validateAssessmentTrace()` | Validate trace metadata |

## Out-of-Scope

D8-OPT-01 does **not** implement:

- Question generation
- Answer verification
- Grading/scoring
- Feedback generation
- Misconception detection
- Laboratory integration
- Visual assessment processing
- Engineering reasoning
- Constraint analysis
- Reinforcement planning
- Portfolio evaluation
- Mastery estimation
- Learner modeling
- LLM calls
- Web access
- Curriculum logic
- Knowledge generation

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
| `src/agents/assessment-pipeline/AssessmentAgentContract.ts` | Immutable contracts and canonical enums |
| `src/agents/assessment-pipeline/AssessmentKernel.ts` | Pure deterministic compose functions |
| `src/agents/assessment-pipeline/AssessmentValidation.ts` | Validation layer (never throws) |
| `src/agents/assessment-pipeline/AssessmentKernel.test.ts` | Exhaustive deterministic tests (~70) |
| `src/agents/assessment-pipeline/index.ts` | Barrel exports |
| `docs/architecture/nv-2000/d8-opt-01-assessment-contract-registry-kernel.md` | This document |
