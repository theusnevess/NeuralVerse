# D1-OPT-05 — Deep Laboratory Integration Orchestration

## Purpose

Extends the Didactic Agent so lesson composition can deterministically decide where, why, and how governed laboratories should be integrated into the instructional flow. Laboratories are orchestrated as first-class educational components without executing lab code, creating lab content, or bypassing the Laboratory Agent.

## Laboratory Orchestration Boundaries

### What This Phase Does

- Defines deterministic types for laboratory integration modes, lab resources, lab placements, lab decisions, and lab traces.
- Implements a pure `orchestrateLaboratories(input, resources, conceptIds)` function that maps governed lab resources to lab decisions based on integration mode and concept coverage.
- Integrates lab orchestration into `composeLessonPlanAll` without altering canonical stage order.
- Validates lab decisions, lab traces, and lab resource integrity.

### What This Phase Does NOT Do

- Does not execute laboratory code or run lab experiments.
- Does not generate laboratory content or explanations.
- Does not fabricate missing laboratory resources.
- Does not infer learner mastery or personalize lab selection.
- Does not reorder canonical stages.
- Does not insert non-canonical stages.
- Does not mutate lesson resources, curriculum data, or lab definitions.
- Does not bypass the Laboratory Agent or its responsibilities.

## Relationship with Laboratory Agent

| Agent | Role | Laboratory Resources |
|-------|------|---------------------|
| Laboratory Agent | Author/executor | Creates, executes, and manages labs |
| Didactic Agent (D1-OPT-05) | Orchestrator | Reads and decides placement only |

The Didactic Agent is a **consumer** of laboratory resources, not an author or executor. It decides *where* and *why* labs appear in the lesson, but never *how* they execute.

## Supported Integration Modes

| Mode | Target Stage(s) | Purpose |
|------|----------------|---------|
| `exploratory_before_explanation` | `intuition`, `concept_introduction` | Build intuition through exploration before formal explanation |
| `guided_during_explanation` | `guided_explanation` | Reinforce concepts through guided practice during explanation |
| `validation_after_theory` | `practical_example`, `interactive_laboratory` | Validate understanding through application after theory |
| `comparative_between_methods` | `practical_example`, `interactive_laboratory` | Compare different approaches or methods |
| `challenge_after_assessment` | `assessment`, `summary` | Extension challenge after assessment |
| `reinforcement_after_assessment` | `summary`, `forward_connections` | Reinforce learning through practice after assessment |

## Mode-to-Stage Mapping

Integration modes map to canonical pipeline stages. The orchestrator resolves the target stage by intersecting the mode's default stages with the lab resource's supported stages. If no intersection exists, the first default stage for the mode is used.

## Deterministic Guarantees

1. **Reproducibility**: Identical inputs → identical lab decisions.
2. **No mutation**: Lab resources, lesson input, and curriculum data are never modified.
3. **No fabrication**: Missing lab resources produce omission metadata, not content.
4. **No inference**: Learner mastery is never inferred or used.
5. **No execution**: Lab code is never executed by the Didactic Agent.
6. **Resource-driven**: All lab decisions are derived from governed lab resources.
7. **Traceable**: Every plan with labs includes `DidacticLaboratoryTrace`.

## Validation Strategy

### Structural Validation (D1-OPT-01)
- Canonical stage order
- No duplicate stages
- No non-canonical stages
- Trace metadata present and correct

### Laboratory Validation (D1-OPT-05)
- Unsupported integration mode → `LAB_UNSUPPORTED_MODE`
- Duplicate lab decision → `LAB_DUPLICATE_DECISION`
- Selected lab without labId → `LAB_SELECTED_NO_LAB_ID`
- Lab decision without source → `LAB_MISSING_SOURCE`
- Lab decision without pedagogical objective → `LAB_MISSING_PEDAGOGICAL_OBJECTIVE`
- Lab mapped to non-canonical stage → `LAB_MAPPED_TO_NON_CANONICAL_STAGE`
- Omitted lab without reason → `LAB_OMITTED_NO_REASON`
- Lab trace count mismatch → `LAB_TRACE_COUNT_MISMATCH`

## Out-of-Scope Items

- No laboratory execution or code running
- No laboratory content generation
- No lab result interpretation
- No learner mastery tracking
- No adaptive lab sequencing
- No lab-specific rendering logic
- No dynamic lab resource modification
- No cross-lab interaction rules
- No lab performance analytics

## Runtime Validation Limitation

If Node.js is unavailable in the execution environment, runtime tests cannot be executed. In this case:
- Report `BLOCKED_ENV` for test execution.
- Perform static determinism and architecture audits.
- Do not claim runtime validation success.
- Tests must be run locally with: `node --test --experimental-strip-types src/agents/didactic-pipeline/DidacticLaboratory.test.ts`

## Files

| File | Purpose |
|------|---------|
| `DidacticAgentContract.ts` | Extended with laboratory orchestration types |
| `LaboratoryOrchestrator.ts` | Pure deterministic lab orchestration |
| `PipelineComposer.ts` | Extended with `composeLessonPlanAll` |
| `ValidationLayer.ts` | Extended with lab validation + `validateLessonPlanAll` |
| `index.ts` | Public API exports |
| `DidacticLaboratory.test.ts` | Test suite (14 required + 2 additional) |
