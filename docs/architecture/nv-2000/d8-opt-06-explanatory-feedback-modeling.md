# NV-2000-D8-OPT-06 — Explanatory Feedback Modeling

**Version:** 1.0
**Status:** READY
**Date:** 2025-06-28

## Purpose

Implement the canonical Explanatory Feedback Modeling layer for the Assessment Agent.

This optimization introduces deterministic modeling of educational feedback associated with assessment artifacts. The Assessment Agent must become capable of representing explanatory feedback, instructional explanations, reasoning guidance, remediation narratives, positive reinforcement messages, and feedback metadata.

D8-OPT-06 does **not** implement automatic feedback generation, personalized feedback, adaptive tutoring, conversational explanations, LLM-generated explanations, hint generation, remediation execution, or learner coaching. It only models canonical educational feedback.

## Feedback Philosophy

The Assessment Agent models canonical educational feedback. It:

- Stores feedback
- Governs feedback
- Validates feedback

It never:

- Creates feedback dynamically
- Adapts feedback to individual learners
- Generates explanations automatically
- Personalizes feedback

## Explanatory Model

Feedback is modeled as deterministic metadata:

- Each feedback item has an explanation with rationale and conceptual basis
- Each feedback item references external knowledge or applications
- Feedback items are linked to concepts
- No personalized recommendations are generated

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          Feedback Kernel (D8-OPT-06)                        │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Feedback Enums   │    │  Feedback        │               │
│  │  (6)              │───▶│  Contracts       │               │
│  └──────────────────┘    └──────────────────┘               │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Feedback        │    │  Feedback        │               │
│  │  Kernel          │───▶│  Validation      │               │
│  │  (Compose Fns)   │    │  (Never Throws)  │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
│  Deterministic. Pure. Immutable. No side effects.            │
│  Never generates. Never personalizes.                        │
└─────────────────────────────────────────────────────────────┘
```

## Canonical Enums

| Enum | Count | Values |
|------|-------|--------|
| `CANONICAL_FEEDBACK_TYPES` | 10 | correct_answer, incorrect_answer, partially_correct, conceptual_explanation, reasoning_guidance, engineering_explanation, comparison, reinforcement, reflection, next_step |
| `CANONICAL_FEEDBACK_OBJECTIVES` | 10 | clarification, concept_reinforcement, relationship_reinforcement, reasoning_support, misconception_remediation, engineering_understanding, concept_connection, reflection, motivation, knowledge_consolidation |
| `CANONICAL_FEEDBACK_TONES` | 10 | neutral, supportive, instructional, encouraging, analytical, technical, reflective, motivational, corrective, exploratory |
| `CANONICAL_FEEDBACK_DELIVERY_TYPES` | 10 | text, visual, concept_graph, comparison_table, diagram_reference, laboratory_reference, knowledge_reference, application_reference, reflection_prompt, resource_reference |
| `CANONICAL_FEEDBACK_PRIORITY` | 5 | critical, high, medium, low, optional |
| `CANONICAL_FEEDBACK_STATUS` | 6 | draft, review, approved, published, deprecated, archived |

## Contracts

| Contract | Purpose |
|----------|---------|
| `FeedbackProvenance` | Immutable provenance metadata |
| `FeedbackDecision` | Governance decision metadata |
| `FeedbackTrace` | Deterministic trace metadata |
| `AssessmentFeedback` | Governed feedback record |
| `FeedbackExplanation` | Explanatory content within feedback |
| `FeedbackReference` | Reference to external knowledge |
| `FeedbackRelationship` | Relationship between feedback items |
| `FeedbackRegistryMetadata` | Registry-level metadata |
| `FeedbackRegistry` | Complete feedback registry |
| `FeedbackInput` | Input for compose functions |
| `AssessmentArtifactWithFeedback` | Artifact enriched with feedback |

## Registry

The `FeedbackRegistry` is an immutable collection of `AssessmentFeedback` objects with deterministic metadata. It:

- Sorts feedback by ID (lexicographic)
- Generates deterministic registry IDs from sorted feedback IDs
- Declares version, nodeCount, and trace metadata
- Never mutates input arrays

## Validation

Validation functions return structured errors, never throw.

### Validation Codes (24)

| Code | Description |
|------|-------------|
| `FEEDBACK_DUPLICATE_ID` | Duplicate feedback ID detected |
| `FEEDBACK_DUPLICATE_TITLE` | Duplicate feedback title detected |
| `EXPLANATION_DUPLICATE_ID` | Duplicate explanation ID detected |
| `REFERENCE_DUPLICATE_ID` | Duplicate reference ID detected |
| `RELATIONSHIP_DUPLICATE_ID` | Duplicate relationship ID detected |
| `FEEDBACK_INVALID_TYPE` | Non-canonical feedback type |
| `FEEDBACK_INVALID_OBJECTIVE` | Non-canonical feedback objective |
| `FEEDBACK_INVALID_TONE` | Non-canonical feedback tone |
| `FEEDBACK_INVALID_DELIVERY` | Non-canonical delivery type |
| `FEEDBACK_INVALID_PRIORITY` | Non-canonical feedback priority |
| `FEEDBACK_INVALID_STATUS` | Non-canonical feedback status |
| `FEEDBACK_INVALID_GOVERNANCE` | Non-canonical governance level |
| `FEEDBACK_MISSING_PROVENANCE` | Missing provenance object |
| `FEEDBACK_MISSING_PROVIDER` | Missing provenance provider |
| `FEEDBACK_MISSING_RATIONALE` | Missing provenance rationale |
| `FEEDBACK_MISSING_ASSESSMENT_REFERENCE` | Missing assessment reference |
| `FEEDBACK_MISSING_FEEDBACK_ID` | Missing feedback ID |
| `FEEDBACK_MISSING_TITLE` | Missing feedback title |
| `FEEDBACK_MISSING_EXPLANATION` | Missing explanation |
| `FEEDBACK_SELF_RELATIONSHIP` | Self-referencing relationship |
| `FEEDBACK_EMPTY_REGISTRY` | Empty or missing nodes array |
| `FEEDBACK_INVALID_TRACE` | Invalid trace determinism flags |
| `FEEDBACK_REGISTRY_INCONSISTENCY` | Metadata/node count mismatch |
| `FEEDBACK_INVALID_CONFIGURATION` | Invalid feedback configuration |

## Governance

All feedback records carry governance metadata:

- `canonical` — Official, authoritative feedback
- `accepted` — Validated but not canonical
- `provisional` — Under review
- `deprecated` — Superseded
- `rejected` — Does not meet standards

## Traceability

Every `AssessmentFeedback` carries:

- `FeedbackTrace` with deterministic trace ID
- `FeedbackProvenance` with provider, source, review status
- Governance metadata for feedback governance decisions

## Cross-Agent Boundaries

The Assessment Agent must NEVER:

- Generate explanations
- Rewrite explanations
- Personalize feedback
- Invoke Narrative Agent
- Invoke Knowledge Agent
- Invoke LLMs
- Modify Curriculum Agent
- Modify Narrative Agent
- Modify Knowledge Agent

It only stores governed feedback metadata.

## Deterministic Guarantees

Forbidden in all compose and validation functions:

- `Math.random`, `Date.now`, `performance.now`, `crypto.randomUUID`
- `Promise`, `async`, `await`, `fetch`
- Filesystem, network, timers, `process.env`

## Extension Points

D8-OPT-06 provides the feedback modeling foundation. Later optimizations may extend:

- Automatic feedback generation
- Personalized feedback
- Adaptive tutoring
- Conversational explanations

## Public API

### Compose Functions

| Function | Description |
|----------|-------------|
| `composeFeedbackProvenance()` | Compose immutable provenance |
| `composeFeedbackTrace()` | Compose deterministic trace |
| `composeAssessmentFeedback()` | Compose governed feedback |
| `composeFeedbackExplanation()` | Compose explanation |
| `composeFeedbackReference()` | Compose reference |
| `composeFeedbackRelationship()` | Compose feedback relationship |
| `composeFeedbackRegistry()` | Compose sorted immutable registry |
| `composeFeedbackRegistryFromInput()` | Compose registry from input |
| `composeAssessmentFeedbackCollection()` | Compose feedback collection |
| `composeAssessmentArtifactWithFeedback()` | Enrich artifact with feedback |

### Validation Functions

| Function | Returns |
|----------|---------|
| `validateAssessmentFeedback()` | `readonly FeedbackValidationError[]` |
| `validateFeedbackExplanation()` | `readonly FeedbackValidationError[]` |
| `validateFeedbackRelationship()` | `readonly FeedbackValidationError[]` |
| `validateFeedbackRegistry()` | `FeedbackRegistryValidationResult` |
| `validateFeedbackInput()` | `FeedbackInputValidationResult` |
| `validateFeedbackTrace()` | `FeedbackTraceValidationResult` |
| `validateAssessmentArtifactWithFeedback()` | `AssessmentArtifactWithFeedbackValidationResult` |

## Files Created

| File | Purpose |
|------|---------|
| `src/agents/assessment-pipeline/FeedbackKernel.ts` | Pure deterministic feedback compose functions |
| `src/agents/assessment-pipeline/FeedbackValidation.ts` | Feedback validation layer (never throws) |
| `src/agents/assessment-pipeline/FeedbackKernel.test.ts` | Exhaustive deterministic tests (~90) |
| `docs/architecture/nv-2000/d8-opt-06-explanatory-feedback-modeling.md` | This document |

## Files Modified

| File | Changes |
|------|---------|
| `src/agents/assessment-pipeline/AssessmentAgentContract.ts` | Extended with 6 feedback enums, 11 feedback contracts, 6 validation types |
| `src/agents/assessment-pipeline/index.ts` | Extended with feedback exports |
