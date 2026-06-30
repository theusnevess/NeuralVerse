# D1-OPT-04 — Layered Progressive Learning Orchestration

## Purpose

Extends the Didactic Agent so lesson composition can deterministically organize learning depth layers from motivation to advanced application. Layers are presentation-depth metadata, not curriculum branches. The Didactic Agent orchestrates instructional progression without generating content, altering canonical knowledge, inferring mastery, or personalizing curriculum.

## Progressive Learning Layer Boundaries

### What This Phase Does

- Defines deterministic types for learning layers, depth modes, layer resources, layer decisions, and layer traces.
- Implements a pure `orchestrateLearningLayers(mode, requested, resources)` function that maps governed layer resources to layer decisions based on depth mode.
- Integrates layer orchestration into `composeLessonPlanComplete` without altering canonical stage order.
- Validates layer decisions, layer traces, and layer resource integrity.

### What This Phase Does NOT Do

- Does not generate educational content or explanations.
- Does not fabricate missing layer resources.
- Does not infer learner mastery or personalize progression.
- Does not reorder canonical stages.
- Does not insert non-canonical stages.
- Does not mutate lesson resources or curriculum data.
- Does not introduce probabilistic flows.

## Canonical Progressive Learning Layers

| # | Layer | Purpose |
|---|-------|---------|
| 1 | `problem_or_motivation` | Establish why the concept matters |
| 2 | `high_level_intuition` | Build mental model before formal definitions |
| 3 | `conceptual_explanation` | Deliver core concept explanation |
| 4 | `visual_interpretation` | Provide spatial/visual understanding |
| 5 | `mathematical_formalization` | Present formal definitions and derivations |
| 6 | `algorithmic_reasoning` | Describe algorithmic structure and steps |
| 7 | `implementation_example` | Show practical implementation patterns |
| 8 | `interactive_experimentation` | Provide hands-on experimentation |
| 9 | `real_world_application` | Connect to real-world use cases |
| 10 | `limitations_tradeoffs_common_mistakes` | Address failure modes and alternatives |

## Relationship with Canonical Pipeline Stages

Layers map to existing canonical stages — they do not replace or add stages:

| Layer | Primary Stage(s) |
|-------|-----------------|
| `problem_or_motivation` | `motivation` |
| `high_level_intuition` | `intuition` |
| `conceptual_explanation` | `guided_explanation` |
| `visual_interpretation` | `visual_demonstration` |
| `mathematical_formalization` | `mathematical_foundation` |
| `algorithmic_reasoning` | `guided_explanation`, `practical_example` |
| `implementation_example` | `practical_example` |
| `interactive_experimentation` | `interactive_laboratory` |
| `real_world_application` | `practical_example`, `forward_connections` |
| `limitations_tradeoffs_common_mistakes` | `common_misconceptions`, `summary` |

## Deterministic Depth Modes

| Mode | Layers Selected | Index Range |
|------|----------------|-------------|
| `overview` | First 3 layers | 0–2 |
| `standard` | First 7 layers | 0–6 |
| `deep` | First 9 layers | 0–8 |
| `full` | All 10 layers | 0–9 |

Selection follows canonical order. Missing resources produce omission with explicit reason.

## Layer-to-Stage Mapping

Layer resources include `supportedStages` which override default mappings. When no resource is available, the orchestrator falls back to the default mapping defined in `DEFAULT_LAYER_STAGE_MAPPINGS`.

## Validation Strategy

### Structural Validation (D1-OPT-01)
- Canonical stage order
- No duplicate stages
- No non-canonical stages
- Trace metadata present and correct

### Layer Validation (D1-OPT-04)
- Unsupported learning layer → `LAYER_UNSUPPORTED`
- Unsupported depth mode → `LAYER_UNSUPPORTED_DEPTH_MODE`
- Duplicate layer decision → `LAYER_DUPLICATE_DECISION`
- Selected layer without resourceId → `LAYER_SELECTED_NO_RESOURCE`
- Layer decision without source → `LAYER_MISSING_SOURCE`
- Layer decision without pedagogical purpose → `LAYER_MISSING_PEDAGOGICAL_PURPOSE`
- Omitted layer without reason → `LAYER_OMITTED_NO_REASON`
- Layer trace count mismatch → `LAYER_TRACE_COUNT_MISMATCH`

## Deterministic Guarantees

1. **Reproducibility**: Identical inputs → identical layer decisions.
2. **No mutation**: Layer resources, lesson input, and curriculum data are never modified.
3. **No fabrication**: Missing layer resources produce omission metadata, not content.
4. **No inference**: Learner mastery is never inferred or used.
5. **Resource-driven**: All layer decisions are derived from governed layer resources.
6. **Traceable**: Every plan with layers includes `DidacticLearningLayerTrace`.

## Out-of-Scope Items

- No UI integration
- No layer content generation
- No adaptive layer sequencing
- No learner mastery tracking
- No layer-specific rendering logic
- No dynamic layer resource modification
- No cross-layer interaction rules
- No personalized progression paths

## Runtime Validation Limitation

If Node.js is unavailable in the execution environment, runtime tests cannot be executed. In this case:
- Report `BLOCKED_ENV` for test execution.
- Perform static determinism and architecture audits.
- Do not claim runtime validation success.
- Tests must be run locally with: `node --test --experimental-strip-types src/agents/didactic-pipeline/DidacticLearningLayer.test.ts`

## Files

| File | Purpose |
|------|---------|
| `DidacticAgentContract.ts` | Extended with learning layer types |
| `LearningLayerOrchestrator.ts` | Pure deterministic layer orchestration |
| `PipelineComposer.ts` | Extended with `composeLessonPlanComplete` |
| `ValidationLayer.ts` | Extended with layer validation + `validateLessonPlanComplete` |
| `index.ts` | Public API exports |
| `DidacticLearningLayer.test.ts` | Test suite (14 required + 2 additional) |
