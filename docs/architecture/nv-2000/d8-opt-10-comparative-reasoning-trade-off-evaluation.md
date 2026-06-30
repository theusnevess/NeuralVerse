# NV-2000-D8-OPT-10 — Comparative Reasoning & Trade-Off Evaluation

**Version:** 1.0
**Status:** READY
**Date:** 2025-06-28

## Purpose

Implement the canonical Comparative Reasoning & Trade-Off Evaluation subsystem for the Assessment Agent.

This optimization must implement **assessment metadata only**. It must **never perform reasoning, grading, ranking, evaluation or decision making**. Its responsibility is to canonically model assessment items that require comparison between engineering alternatives.

## Motivation

Engineering assessments often require comparison between alternatives. Different engineering decisions involve different trade-offs, dimensions, and contexts. D8-OPT-10 creates the deterministic infrastructure for representing these comparative assessment items.

## Canonical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│        Comparison Kernel (D8-OPT-10)                        │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Comparison       │    │  Comparison      │               │
│  │  Enums (5)        │───▶│  Contracts       │               │
│  └──────────────────┘    └──────────────────┘               │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Comparison      │    │  Comparison      │               │
│  │  Kernel          │───▶│  Validation      │               │
│  │  (Compose Fns)   │    │  (Never Throws)  │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
│  Deterministic. Pure. Immutable. No side effects.            │
│  Never reasons. Never ranks. Never evaluates.                │
└─────────────────────────────────────────────────────────────┘
```

## Canonical Enums

| Enum | Count | Values |
|------|-------|--------|
| `CANONICAL_COMPARISON_REASONING_TYPES` | 10 | factual, conceptual, procedural, analytical, comparative, causal, diagnostic, engineering, critical, reflective |
| `CANONICAL_COMPARISON_DIMENSIONS` | 10 | performance, cost, scalability, maintainability, security, reliability, complexity, flexibility, latency, throughput |
| `CANONICAL_TRADE_OFF_TYPES` | 10 | performance_cost, scalability_complexity, security_performance, latency_throughput, reliability_cost, maintainability_speed, flexibility_reliability, coverage_depth, automation_control, consistency_flexibility |
| `CANONICAL_DECISION_CONTEXT_TYPES` | 10 | architecture_selection, technology_choice, deployment_strategy, optimization_approach, trade_off_analysis, constraint_resolution, risk_assessment, quality_evaluation, cost_benefit, feasibility_study |
| `CANONICAL_COMPARATIVE_ASSESSMENT_STATUS` | 6 | draft, review, approved, published, deprecated, archived |

## Contracts

| Contract | Purpose |
|----------|---------|
| `ComparisonAssessmentProvenance` | Immutable provenance metadata |
| `ComparisonAssessmentDecision` | Governance decision metadata |
| `ComparisonAssessmentTrace` | Deterministic trace metadata |
| `ComparisonDimensionEntry` | Comparison dimension |
| `TradeOffEvaluation` | Trade-off evaluation |
| `DecisionContext` | Decision context |
| `ComparativeAssessment` | Governed comparative assessment |
| `ComparisonRelationship` | Relationship between comparisons |
| `ComparisonRegistryMetadata` | Registry-level metadata |
| `ComparisonRegistry` | Complete comparison registry |
| `ComparisonInput` | Input for compose functions |
| `AssessmentArtifactWithComparisons` | Artifact enriched with comparisons |

## Registry

The `ComparisonRegistry` is an immutable collection of `ComparativeAssessment` objects with deterministic metadata. It:

- Sorts assessments by ID (lexicographic)
- Generates deterministic registry IDs from sorted assessment IDs
- Declares version, nodeCount, and trace metadata
- Never mutates input arrays

## Validation

Validation functions return structured errors, never throw.

### Validation Codes (25)

| Code | Description |
|------|-------------|
| `COMPARISON_DUPLICATE_ID` | Duplicate comparison ID detected |
| `COMPARISON_DUPLICATE_TITLE` | Duplicate comparison title detected |
| `DIMENSION_DUPLICATE_ID` | Duplicate dimension ID detected |
| `TRADE_OFF_DUPLICATE_ID` | Duplicate trade-off ID detected |
| `DECISION_CONTEXT_DUPLICATE_ID` | Duplicate decision context ID detected |
| `COMPARISON_INVALID_REASONING` | Non-canonical reasoning type |
| `COMPARISON_INVALID_DIMENSION` | Non-canonical comparison dimension |
| `COMPARISON_INVALID_TRADE_OFF` | Non-canonical trade-off type |
| `COMPARISON_INVALID_CONTEXT` | Non-canonical decision context type |
| `COMPARISON_INVALID_STATUS` | Non-canonical comparative assessment status |
| `COMPARISON_INVALID_GOVERNANCE` | Non-canonical governance level |
| `COMPARISON_MISSING_PROVENANCE` | Missing provenance object |
| `COMPARISON_MISSING_PROVIDER` | Missing provenance provider |
| `COMPARISON_MISSING_RATIONALE` | Missing provenance rationale |
| `COMPARISON_MISSING_ASSESSMENT_REFERENCE` | Missing assessment reference |
| `COMPARISON_MISSING_COMPARISON_ID` | Missing comparison ID |
| `COMPARISON_MISSING_TITLE` | Missing comparison title |
| `COMPARISON_SELF_RELATIONSHIP` | Self-referencing relationship |
| `COMPARISON_EMPTY_REGISTRY` | Empty or missing nodes array |
| `COMPARISON_INVALID_TRACE` | Invalid trace determinism flags |
| `COMPARISON_REGISTRY_INCONSISTENCY` | Metadata/node count mismatch |
| `COMPARISON_INVALID_CONFIGURATION` | Invalid configuration |
| `COMPARISON_INVALID_REFERENCE` | Invalid reference |
| `COMPARISON_DUPLICATE_RELATIONSHIP` | Duplicate relationship |

## Governance

All comparative assessments carry governance metadata:

- `canonical` — Official, authoritative assessment
- `accepted` — Validated but not canonical
- `provisional` — Under review
- `deprecated` — Superseded
- `rejected` — Does not meet standards

## Traceability

Every `ComparativeAssessment` carries:

- `ComparisonAssessmentTrace` with deterministic trace ID
- `ComparisonAssessmentProvenance` with provider, source, review status
- Governance metadata for comparative assessment decisions

## Cross-Agent Boundaries

The Assessment Agent must NEVER:

- Perform comparative reasoning
- Rank engineering alternatives
- Choose the best solution
- Compute trade-off scores
- Invoke the Application Agent
- Invoke the Narrative Agent
- Invoke LLMs
- Perform optimization
- Recommend technologies
- Generate explanations

It only models comparative assessment metadata.

## Deterministic Guarantees

Forbidden in all compose and validation functions:

- `Math.random`, `Date.now`, `performance.now`, `crypto.randomUUID`
- `Promise`, `async`, `await`, `fetch`
- Filesystem, network, timers, `process.env`

## Extension Points

D8-OPT-10 provides the comparative assessment modeling foundation. Later optimizations may extend:

- Comparative reasoning
- Trade-off scoring
- Solution ranking
- Technology recommendations

## Public API

### Compose Functions

| Function | Description |
|----------|-------------|
| `composeComparisonAssessmentProvenance()` | Compose immutable provenance |
| `composeComparisonAssessmentTrace()` | Compose deterministic trace |
| `composeComparativeAssessment()` | Compose governed comparative assessment |
| `composeComparisonDimension()` | Compose comparison dimension |
| `composeTradeOffEvaluation()` | Compose trade-off evaluation |
| `composeDecisionContext()` | Compose decision context |
| `composeComparisonRelationship()` | Compose comparison relationship |
| `composeComparisonRegistry()` | Compose sorted immutable registry |
| `composeComparisonRegistryFromInput()` | Compose registry from input |
| `composeAssessmentComparisons()` | Compose comparison assessments |
| `composeAssessmentArtifactWithComparisons()` | Enrich artifact with comparisons |

### Validation Functions

| Function | Returns |
|----------|---------|
| `validateComparativeAssessment()` | `readonly ComparisonValidationError[]` |
| `validateComparisonDimension()` | `readonly ComparisonValidationError[]` |
| `validateTradeOffEvaluation()` | `readonly ComparisonValidationError[]` |
| `validateDecisionContext()` | `readonly ComparisonValidationError[]` |
| `validateComparisonRelationship()` | `readonly ComparisonValidationError[]` |
| `validateComparisonRegistry()` | `ComparisonRegistryValidationResult` |
| `validateComparisonInput()` | `ComparisonInputValidationResult` |
| `validateComparisonTrace()` | `ComparisonTraceValidationResult` |
| `validateAssessmentArtifactWithComparisons()` | `AssessmentArtifactWithComparisonsValidationResult` |

## Files Created

| File | Purpose |
|------|---------|
| `src/agents/assessment-pipeline/AssessmentComparisonKernel.ts` | Pure deterministic comparison compose functions |
| `src/agents/assessment-pipeline/AssessmentComparisonValidation.ts` | Comparison validation layer (never throws) |
| `src/agents/assessment-pipeline/AssessmentComparisonKernel.test.ts` | Exhaustive deterministic tests (~90) |
| `docs/architecture/nv-2000/d8-opt-10-comparative-reasoning-trade-off-evaluation.md` | This document |

## Files Modified

| File | Changes |
|------|---------|
| `src/agents/assessment-pipeline/AssessmentAgentContract.ts` | Extended with 5 comparison enums, 12 comparison contracts, 6 validation types |
| `src/agents/assessment-pipeline/index.ts` | Extended with comparison exports |
