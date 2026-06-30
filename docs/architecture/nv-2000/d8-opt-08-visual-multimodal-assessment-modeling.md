# NV-2000-D8-OPT-08 — Visual & Multimodal Assessment Modeling

**Version:** 1.0
**Status:** READY
**Date:** 2025-06-28

## Purpose

Implement the canonical Visual & Multimodal Assessment Modeling layer for the Assessment Agent.

This optimization introduces deterministic modeling of assessment artifacts that depend on visual, multimodal, and diagram-based educational resources. The Assessment Agent must become capable of representing visual assessment artifacts, multimodal assessment resources, image-based questions, diagram-based assessments, engineering visual references, multimodal evidence, visual governance metadata, and assessment-to-visual traceability.

D8-OPT-08 does **not** implement image generation, image interpretation, computer vision, OCR, visual inference, rendering, diagram generation, multimodal AI execution, or image editing. It only models visual educational assessment metadata.

## Multimodal Assessment Philosophy

The Assessment Agent models visual educational assessment metadata. It:

- Stores references
- Validates visual assessment structures
- Governs visual educational assets

It never:

- Renders images
- Analyzes images
- Generates diagrams

## Visual Modeling Architecture

Visual assessment is modeled as deterministic metadata:

- Each visual artifact references external visual resources
- Tasks define the educational interaction with visual content
- Evidence captures multimodal learner responses
- No image processing or generation is performed

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│        Visual Assessment Kernel (D8-OPT-08)                 │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Visual Enums     │    │  Visual          │               │
│  │  (6)              │───▶│  Contracts       │               │
│  └──────────────────┘    └──────────────────┘               │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Visual          │    │  Visual          │               │
│  │  Kernel          │───▶│  Validation      │               │
│  │  (Compose Fns)   │    │  (Never Throws)  │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
│  Deterministic. Pure. Immutable. No side effects.            │
│  Never renders. Never analyzes. Never generates.             │
└─────────────────────────────────────────────────────────────┘
```

## Canonical Enums

| Enum | Count | Values |
|------|-------|--------|
| `CANONICAL_VISUAL_ASSESSMENT_TYPES` | 10 | image_question, diagram_question, architecture_analysis, pipeline_analysis, graph_interpretation, visual_comparison, annotation, heatmap_analysis, workflow_identification, multimodal_case |
| `CANONICAL_VISUAL_RESOURCE_TYPES` | 10 | image, diagram, flowchart, architecture, graph, chart, heatmap, illustration, animation, video |
| `CANONICAL_VISUAL_TASK_TYPES` | 10 | identify, classify, compare, annotate, interpret, sequence, locate, analyze, reason, justify |
| `CANONICAL_MULTIMODAL_EVIDENCE_TYPES` | 10 | visual_selection, annotation, written_explanation, diagram_relationship, architecture_mapping, comparison, reasoning, workflow_identification, engineering_analysis, reflection |
| `CANONICAL_VISUAL_GOVERNANCE_LEVELS` | 5 | canonical, approved, review, provisional, deprecated |
| `CANONICAL_VISUAL_ASSESSMENT_STATUS` | 6 | draft, review, approved, published, deprecated, archived |

## Contracts

| Contract | Purpose |
|----------|---------|
| `VisualAssessmentProvenance` | Immutable provenance metadata |
| `VisualAssessmentDecision` | Governance decision metadata |
| `VisualAssessmentTrace` | Deterministic trace metadata |
| `AssessmentVisualArtifact` | Governed visual assessment artifact |
| `VisualAssessmentReference` | Reference to visual resource |
| `VisualAssessmentTask` | Visual assessment task |
| `MultimodalEvidence` | Multimodal evidence |
| `VisualAssessmentRelationship` | Relationship between visual artifacts |
| `VisualAssessmentRegistryMetadata` | Registry-level metadata |
| `VisualAssessmentRegistry` | Complete visual assessment registry |
| `VisualAssessmentInput` | Input for compose functions |
| `AssessmentArtifactWithVisualAssets` | Artifact enriched with visual assets |

## Registry

The `VisualAssessmentRegistry` is an immutable collection of `AssessmentVisualArtifact` objects with deterministic metadata. It:

- Sorts artifacts by ID (lexicographic)
- Generates deterministic registry IDs from sorted artifact IDs
- Declares version, nodeCount, and trace metadata
- Never mutates input arrays

## Validation

Validation functions return structured errors, never throw.

### Validation Codes (24)

| Code | Description |
|------|-------------|
| `VISUAL_ASSESSMENT_DUPLICATE_ID` | Duplicate visual artifact ID detected |
| `VISUAL_ASSESSMENT_DUPLICATE_TITLE` | Duplicate visual artifact title detected |
| `VISUAL_REFERENCE_DUPLICATE_ID` | Duplicate reference ID detected |
| `VISUAL_TASK_DUPLICATE_ID` | Duplicate task ID detected |
| `MULTIMODAL_EVIDENCE_DUPLICATE_ID` | Duplicate evidence ID detected |
| `VISUAL_INVALID_TYPE` | Non-canonical visual assessment type |
| `VISUAL_INVALID_RESOURCE` | Non-canonical visual resource type |
| `VISUAL_INVALID_TASK` | Non-canonical visual task type |
| `VISUAL_INVALID_EVIDENCE` | Non-canonical multimodal evidence type |
| `VISUAL_INVALID_GOVERNANCE` | Non-canonical governance level |
| `VISUAL_INVALID_STATUS` | Non-canonical visual assessment status |
| `VISUAL_MISSING_PROVENANCE` | Missing provenance object |
| `VISUAL_MISSING_PROVIDER` | Missing provenance provider |
| `VISUAL_MISSING_RATIONALE` | Missing provenance rationale |
| `VISUAL_MISSING_ASSESSMENT_REFERENCE` | Missing assessment reference |
| `VISUAL_MISSING_VISUAL_REFERENCE` | Missing visual reference |
| `VISUAL_MISSING_VISUAL_ID` | Missing visual artifact ID |
| `VISUAL_MISSING_TITLE` | Missing visual artifact title |
| `VISUAL_SELF_RELATIONSHIP` | Self-referencing relationship |
| `VISUAL_EMPTY_REGISTRY` | Empty or missing nodes array |
| `VISUAL_INVALID_TRACE` | Invalid trace determinism flags |
| `VISUAL_REGISTRY_INCONSISTENCY` | Metadata/node count mismatch |
| `VISUAL_INVALID_CONFIGURATION` | Invalid configuration |
| `VISUAL_INVALID_REFERENCE` | Invalid reference |

## Governance

All visual assessment artifacts carry governance metadata:

- `canonical` — Official, authoritative visual artifact
- `approved` — Validated but not canonical
- `review` — Under review
- `provisional` — Provisional
- `deprecated` — Superseded

## Traceability

Every `AssessmentVisualArtifact` carries:

- `VisualAssessmentTrace` with deterministic trace ID
- `VisualAssessmentProvenance` with provider, source, review status
- Governance metadata for visual assessment decisions

## Cross-Agent Boundaries

The Assessment Agent must NEVER:

- Generate images
- Edit images
- Invoke image models
- Perform OCR
- Perform computer vision
- Render diagrams
- Modify Application Agent visual registries
- Modify Knowledge Agent visual assets

It only stores governed visual assessment metadata.

## Deterministic Guarantees

Forbidden in all compose and validation functions:

- `Math.random`, `Date.now`, `performance.now`, `crypto.randomUUID`
- `Promise`, `async`, `await`, `fetch`
- Filesystem, network, timers, `process.env`

## Extension Points

D8-OPT-08 provides the visual assessment modeling foundation. Later optimizations may extend:

- Image processing
- Computer vision integration
- Multimodal AI execution
- Diagram generation

## Public API

### Compose Functions

| Function | Description |
|----------|-------------|
| `composeVisualAssessmentProvenance()` | Compose immutable provenance |
| `composeVisualAssessmentTrace()` | Compose deterministic trace |
| `composeAssessmentVisualArtifact()` | Compose governed visual artifact |
| `composeVisualAssessmentReference()` | Compose visual reference |
| `composeVisualAssessmentTask()` | Compose visual task |
| `composeMultimodalEvidence()` | Compose multimodal evidence |
| `composeVisualAssessmentRelationship()` | Compose visual relationship |
| `composeVisualAssessmentRegistry()` | Compose sorted immutable registry |
| `composeVisualAssessmentRegistryFromInput()` | Compose registry from input |
| `composeAssessmentVisualAssets()` | Compose visual assets |
| `composeAssessmentArtifactWithVisualAssets()` | Enrich artifact with visual assets |

### Validation Functions

| Function | Returns |
|----------|---------|
| `validateAssessmentVisualArtifact()` | `readonly VisualAssessmentValidationError[]` |
| `validateVisualAssessmentReference()` | `readonly VisualAssessmentValidationError[]` |
| `validateVisualAssessmentTask()` | `readonly VisualAssessmentValidationError[]` |
| `validateMultimodalEvidence()` | `readonly VisualAssessmentValidationError[]` |
| `validateVisualAssessmentRelationship()` | `readonly VisualAssessmentValidationError[]` |
| `validateVisualAssessmentRegistry()` | `VisualAssessmentRegistryValidationResult` |
| `validateVisualAssessmentInput()` | `VisualAssessmentInputValidationResult` |
| `validateVisualAssessmentTrace()` | `VisualAssessmentTraceValidationResult` |
| `validateAssessmentArtifactWithVisualAssets()` | `AssessmentArtifactWithVisualAssetsValidationResult` |

## Files Created

| File | Purpose |
|------|---------|
| `src/agents/assessment-pipeline/VisualAssessmentKernel.ts` | Pure deterministic visual assessment compose functions |
| `src/agents/assessment-pipeline/VisualAssessmentValidation.ts` | Visual assessment validation layer (never throws) |
| `src/agents/assessment-pipeline/VisualAssessmentKernel.test.ts` | Exhaustive deterministic tests (~90) |
| `docs/architecture/nv-2000/d8-opt-08-visual-multimodal-assessment-modeling.md` | This document |

## Files Modified

| File | Changes |
|------|---------|
| `src/agents/assessment-pipeline/AssessmentAgentContract.ts` | Extended with 6 visual assessment enums, 12 visual assessment contracts, 6 validation types |
| `src/agents/assessment-pipeline/index.ts` | Extended with visual assessment exports |
