# D1-OPT-06 — Assessment Checkpoint Orchestration

## Purpose

Extends the Didactic Agent so lesson composition can deterministically decide where assessment checkpoints should appear in the instructional flow. Assessment placement is orchestrated without scoring, mastery inference, or generating assessment content. The Didactic Agent decides *where* assessments appear, but never *what* they ask or *how* they evaluate.

## Assessment Orchestration Boundaries

### What This Phase Does

- Defines deterministic types for assessment checkpoint types, assessment resources, assessment placements, assessment decisions, and assessment traces.
- Implements a pure `orchestrateAssessmentCheckpoints(input, resources, conceptIds, labTrace)` function that maps governed assessment resources to assessment decisions based on checkpoint type and concept coverage.
- Integrates assessment orchestration into `composeLessonPlanFinal` without altering canonical stage order.
- Validates assessment decisions, assessment traces, and assessment resource integrity.

### What This Phase Does NOT Do

- Does not score answers or evaluate learner responses.
- Does not infer mastery, competency, readiness, ranking, or learner ability.
- Does not generate assessment content or questions.
- Does not author assessment items.
- Does not mutate learner state, curriculum state, or assessment resources.
- Does not reorder canonical stages.
- Does not insert non-canonical stages.
- Does not bypass the Assessment Agent or its responsibilities.

## Relationship with Assessment Agent

| Agent | Role | Assessment Resources |
|-------|------|---------------------|
| Assessment Agent | Author/executor | Creates, scores, and evaluates assessments |
| Didactic Agent (D1-OPT-06) | Orchestrator | Reads and decides placement only |

The Didactic Agent is a **consumer** of assessment resources, not an author or scorer. It decides *where* assessments appear in the lesson, but never *what* they contain or *how* they score.

## Supported Checkpoint Types

| Type | Target Stage(s) | Purpose |
|------|----------------|---------|
| `concept_check` | `concept_introduction`, `guided_explanation` | Verify understanding of introduced concepts |
| `misconception_check` | `common_misconceptions` | Proactively address known misunderstandings |
| `parameter_interpretation` | `interactive_laboratory`, `practical_example` | Verify ability to read model outputs |
| `prediction_before_run` | `interactive_laboratory` | Engage active hypothesis formation before lab run |
| `reflection_prompt` | `summary` | Encourage deeper thinking about learned material |
| `debugging_prompt` | `practical_example`, `interactive_laboratory` | Develop analytical and problem-solving skills |
| `synthesis_question` | `assessment` | Assess ability to integrate multiple concepts |
| `forward_connection_check` | `forward_connections` | Verify ability to link to downstream concepts |

## Type-to-Stage Mapping

Checkpoint types map to canonical pipeline stages. The orchestrator resolves the target stage by intersecting the type's default stages with the assessment resource's supported stages. If no intersection exists, the first default stage for the type is used.

## Lab-Dependent Assessments

Some assessments require laboratory context (e.g., `parameter_interpretation`, `prediction_before_run`). These assessments are only selected when a matching laboratory trace exists with `labsSelected > 0`. Without lab context, they are omitted with an explicit reason.

## Forbidden Scoring/Mastery Fields

The `DidacticAssessmentDecision` type does not include any scoring, evaluation, or mastery fields. The following fields are explicitly forbidden:

- `score`
- `evaluation`
- `masteryLevel`
- `learnerAbility`
- `competency`
- `readiness`
- `ranking`

Any attempt to add these fields will be caught by TypeScript's type system and the validation layer.

## Deterministic Guarantees

1. **Reproducibility**: Identical inputs → identical assessment decisions.
2. **No mutation**: Assessment resources, lesson input, and curriculum data are never modified.
3. **No fabrication**: Missing assessment resources produce omission metadata, not content.
4. **No inference**: Learner mastery is never inferred or used.
5. **No scoring**: Assessment scores are never generated or evaluated.
6. **Resource-driven**: All assessment decisions are derived from governed assessment resources.
7. **Traceable**: Every plan with assessments includes `DidacticAssessmentTrace`.

## Validation Strategy

### Structural Validation (D1-OPT-01)
- Canonical stage order
- No duplicate stages
- No non-canonical stages
- Trace metadata present and correct

### Assessment Validation (D1-OPT-06)
- Unsupported checkpoint type → `ASSESS_UNSUPPORTED_CHECKPOINT_TYPE`
- Duplicate assessment decision → `ASSESS_DUPLICATE_DECISION`
- Selected assessment without assessmentId → `ASSESS_SELECTED_NO_ID`
- Assessment decision without source → `ASSESS_MISSING_SOURCE`
- Assessment decision without pedagogical objective → `ASSESS_MISSING_PEDAGOGICAL_OBJECTIVE`
- Assessment mapped to non-canonical stage → `ASSESS_MAPPED_TO_NON_CANONICAL_STAGE`
- Omitted assessment without reason → `ASSESS_OMITTED_NO_REASON`
- Assessment trace count mismatch → `ASSESS_TRACE_COUNT_MISMATCH`

## Out-of-Scope Items

- No assessment content generation
- No answer scoring or evaluation
- No learner mastery tracking
- No adaptive assessment sequencing
- No assessment-specific rendering logic
- No dynamic assessment resource modification
- No cross-assessment interaction rules
- No assessment performance analytics
- No assessment difficulty adaptation

## Runtime Validation Limitation

If Node.js is unavailable in the execution environment, runtime tests cannot be executed. In this case:
- Report `BLOCKED_ENV` for test execution.
- Perform static determinism and architecture audits.
- Do not claim runtime validation success.
- Tests must be run locally with: `node --test --experimental-strip-types src/agents/didactic-pipeline/DidacticAssessment.test.ts`

## Files

| File | Purpose |
|------|---------|
| `DidacticAgentContract.ts` | Extended with assessment orchestration types |
| `AssessmentOrchestrator.ts` | Pure deterministic assessment orchestration |
| `PipelineComposer.ts` | Extended with `composeLessonPlanFinal` |
| `ValidationLayer.ts` | Extended with assessment validation + `validateLessonPlanFinal` |
| `index.ts` | Public API exports |
| `DidacticAssessment.test.ts` | Test suite (16 required + 2 additional) |
