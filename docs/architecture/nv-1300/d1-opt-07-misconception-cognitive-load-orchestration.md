# D1-OPT-07 — Misconception & Cognitive Load Orchestration

## Purpose

Extends the Didactic Agent so lesson composition can deterministically surface misconception warnings and cognitive-load safeguards using governed metadata. This phase adds orchestration metadata only — it does not generate content, infer learner state, or modify curriculum.

## Support Orchestration Boundaries

### What This Phase Does

- Defines deterministic types for misconception support types, cognitive-load support types, support resources, support decisions, and support traces.
- Implements a pure `orchestrateInstructionalSupports(...)` function that maps governed support resources to support decisions based on type, concept coverage, and target stage.
- Integrates support orchestration into `composeLessonPlanComplete2` without altering canonical stage order.
- Validates support decisions, support traces, and support resource integrity.

### What This Phase Does NOT Do

- Does not diagnose the learner or infer confusion, ability, mastery, or readiness.
- Does not generate misconception explanations or cognitive-load text.
- Does not create new educational content or warnings.
- Does not reorder canonical stages.
- Does not insert non-canonical stages.
- Does not mutate lesson resources, curriculum data, or support resources.
- Does not replace Assessment Agent, Curriculum Agent, or other agent responsibilities.

## Misconception Support Types

| Type | Target Stage(s) | Purpose |
|------|----------------|---------|
| `definition_confusion` | `concept_introduction` | Address definitional misunderstandings |
| `notation_confusion` | `mathematical_foundation` | Prevent notation misreading |
| `mathematical_misinterpretation` | `mathematical_foundation` | Address formula/derivation errors |
| `implementation_pitfall` | `practical_example` | Highlight coding/construction errors |
| `visual_misreading` | `visual_demonstration` | Prevent diagram misinterpretation |
| `concept_overlap` | `context`, `guided_explanation` | Clarify similar concept distinctions |
| `false_intuition` | `intuition`, `common_misconceptions` | Address incorrect mental models |
| `overgeneralization` | `common_misconceptions`, `summary` | Prevent scope over-application |

## Cognitive Load Support Types

| Type | Target Stage(s) | Purpose |
|------|----------------|---------|
| `prerequisite_recap` | `context` | Reinforce foundational knowledge |
| `terminology_anchor` | `concept_introduction` | Ensure consistent term usage |
| `notation_anchor` | `mathematical_foundation` | Establish consistent notation |
| `visual_anchor` | `visual_demonstration` | Provide spatial reference |
| `step_chunking` | `guided_explanation` | Break complex explanations into segments |
| `complexity_warning` | `context`, `guided_explanation` | Signal high cognitive load |
| `transition_bridge` | `context`, `forward_connections` | Smooth conceptual transitions |
| `summary_checkpoint` | `summary` | Consolidate understanding at milestones |

## Support-to-Stage Mapping

Support types map to canonical pipeline stages. The orchestrator resolves the target stage by intersecting the type's default stages with the support resource's supported stages. If no intersection exists, the first default stage for the type is used.

## Forbidden Learner Inference Fields

The `DidacticSupportDecision` type does not include any learner diagnosis, confusion, mastery, or readiness fields. The following fields are explicitly forbidden:

- `diagnosis`
- `confusion`
- `masteryLevel`
- `readiness`
- `ability`
- `competency`
- `learnerState`

## Deterministic Guarantees

1. **Reproducibility**: Identical inputs → identical support decisions.
2. **No mutation**: Support resources, lesson input, and curriculum data are never modified.
3. **No fabrication**: Missing support resources produce omission metadata, not content.
4. **No inference**: Learner state is never inferred or used.
5. **No generation**: No explanation or warning text is generated.
6. **Resource-driven**: All support decisions are derived from governed support resources.
7. **Traceable**: Every plan with supports includes `DidacticSupportTrace`.

## Validation Strategy

### Structural Validation (D1-OPT-01)
- Canonical stage order
- No duplicate stages
- No non-canonical stages
- Trace metadata present and correct

### Support Validation (D1-OPT-07)
- Unsupported misconception support type → `SUPPORT_UNSUPPORTED_MISCONCEPTION_TYPE`
- Unsupported cognitive-load support type → `SUPPORT_UNSUPPORTED_COGNITIVE_LOAD_TYPE`
- Duplicate support decision → `SUPPORT_DUPLICATE_DECISION`
- Selected support without supportId → `SUPPORT_SELECTED_NO_ID`
- Support decision without source → `SUPPORT_MISSING_SOURCE`
- Support decision without pedagogical objective → `SUPPORT_MISSING_PEDAGOGICAL_OBJECTIVE`
- Support mapped to non-canonical stage → `SUPPORT_MAPPED_TO_NON_CANONICAL_STAGE`
- Omitted support without reason → `SUPPORT_OMITTED_NO_REASON`
- Support trace count mismatch → `SUPPORT_TRACE_COUNT_MISMATCH`

## Out-of-Scope Items

- No misconception content generation
- No cognitive-load text generation
- No learner diagnosis or ability estimation
- No adaptive support sequencing
- No support-specific rendering logic
- No dynamic support resource modification
- No cross-support interaction rules
- No support performance analytics
- No confusion detection

## Runtime Validation Limitation

If Node.js is unavailable in the execution environment, runtime tests cannot be executed. In this case:
- Report `BLOCKED_ENV` for test execution.
- Perform static determinism and architecture audits.
- Do not claim runtime validation success.
- Tests must be run locally with: `node --test --experimental-strip-types src/agents/didactic-pipeline/DidacticSupport.test.ts`

## Files

| File | Purpose |
|------|---------|
| `DidacticAgentContract.ts` | Extended with misconception & cognitive load types |
| `InstructionalSupportOrchestrator.ts` | Pure deterministic support orchestration |
| `PipelineComposer.ts` | Extended with `composeLessonPlanComplete2` |
| `ValidationLayer.ts` | Extended with support validation + `validateLessonPlanComplete2` |
| `index.ts` | Public API exports |
| `DidacticSupport.test.ts` | Test suite (16 required + 2 additional) |
