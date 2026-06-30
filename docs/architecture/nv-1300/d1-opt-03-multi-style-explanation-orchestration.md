# D1-OPT-03 — Multi-Style Explanation Orchestration

## Purpose

Extends the Didactic Agent so lesson composition can deterministically select and attach multiple explanation styles from governed style resources. The Didactic Agent selects presentation styles and sequencing, but must not create authoritative explanations, mutate canonical knowledge, infer learner mastery, or introduce probabilistic personalization.

## Explanation Style Boundaries

### What This Phase Does

- Defines deterministic types for explanation styles, style resources, style decisions, and style traces.
- Implements a pure `selectExplanationStyles(input, resources)` function that maps governed style resources to style decisions.
- Integrates style selection into `composeLessonPlanWithStyles` without altering canonical stage order.
- Validates style decisions, style traces, and style resource integrity.

### What This Phase Does NOT Do

- Does not generate explanation text or canonical content.
- Does not fabricate missing educational resources.
- Does not infer learner preferences or mastery.
- Does not introduce probabilistic personalization.
- Does not reorder canonical stages.
- Does not insert non-canonical stages.
- Does not mutate lesson resources or curriculum data.

## Canonical Explanation Styles

| Style | Purpose |
|-------|---------|
| `intuitive` | Accessible, mental-model-first explanations |
| `visual` | Spatial, parametric, diagram-first explanations |
| `mathematical` | Formal definitions, formulas, derivations |
| `engineering_oriented` | Implementation patterns, trade-offs, production |
| `implementation_first` | Code-first, hands-on, practical entry |
| `research_oriented` | Paper-oriented, SOTA context, open questions |
| `historical` | Historical context, evolution of ideas |
| `analogy_driven` | Cross-domain analogies, everyday parallels |

## Relationship with Canonical Knowledge

Styles affect **presentation metadata only**. They do not alter:
- Canonical stage order
- Canonical stage content
- Curriculum structure
- Educational resource definitions

A style decision tells the rendering layer *how* to present content, not *what* content to present.

## Deterministic Style Selection Rules

### Requested Styles

When `requestedStyles` is provided:
1. For each requested style, look up an active `DidacticStyleResource` with matching `style` field.
2. If found: mark as `selected` with resource metadata.
3. If not found: mark as `omitted` with explicit reason.
4. If style name is invalid: mark as `omitted` with "unsupported" reason.

### Default Priority (No Styles Requested)

When `requestedStyles` is empty or absent, select the first available style from:

```
1. intuitive
2. visual
3. engineering_oriented
4. mathematical
```

Only one default style is selected (the first available).

### Resource Lifecycle

- `active` resources are eligible for selection.
- `deprecated` and `experimental` resources are never selected.
- Deprecated resources produce omission with explicit reason.

## Default Priority

```typescript
const DEFAULT_STYLE_PRIORITY = [
  'intuitive',
  'visual',
  'engineering_oriented',
  'mathematical',
];
```

This order is fixed and deterministic. It reflects the project's pedagogical philosophy: intuition first, then visual, then engineering, then mathematical rigor.

## Pipeline Integration

`composeLessonPlanWithStyles(input)`:
1. Delegates to `composeLessonPlan(input)` for core stage logic (preserves D1-OPT-01 exactly).
2. If no `styleInput` is provided, returns the base plan unchanged.
3. Selects explanation styles deterministically via `selectExplanationStyles`.
4. Builds a `DidacticStyleTrace` from decisions.
5. Attaches the trace to the plan as `styleTrace`.
6. Canonical stage order is never altered.

`composeLessonPlanFull(input)`:
- Combines D1-OPT-02 (dependency trace) and D1-OPT-03 (style trace) into a single plan.
- Both traces are independent and do not interact.

## Validation Strategy

### Structural Validation (D1-OPT-01)
- Canonical stage order
- No duplicate stages
- No non-canonical stages
- Trace metadata present and correct

### Style Validation (D1-OPT-03)
- Unsupported explanation style → `STYLE_UNSUPPORTED`
- Duplicate style decision → `STYLE_DUPLICATE_DECISION`
- Selected style without resourceId → `STYLE_SELECTED_NO_RESOURCE`
- Style decision without source → `STYLE_MISSING_SOURCE`
- Style decision without pedagogical purpose → `STYLE_MISSING_PEDAGOGICAL_PURPOSE`
- Omitted style without reason → `STYLE_OMITTED_NO_REASON`
- Style trace count mismatch → `STYLE_TRACE_COUNT_MISMATCH`

## Deterministic Guarantees

1. **Reproducibility**: Identical inputs → identical style decisions.
2. **No mutation**: Style resources, lesson input, and curriculum data are never modified.
3. **No fabrication**: Missing style resources produce omission metadata, not explanations.
4. **No inference**: Learner preferences are never inferred or used.
5. **Resource-driven**: All style decisions are derived from governed style resources.
6. **Traceable**: Every plan with styles includes `DidacticStyleTrace`.

## Out-of-Scope Items

- No UI integration
- No explanation text generation
- No adaptive style sequencing
- No learner preference tracking
- No style-specific rendering logic
- No dynamic style resource modification
- No cross-style interaction rules

## Runtime Validation Limitation

If Node.js is unavailable in the execution environment, runtime tests cannot be executed. In this case:
- Report `BLOCKED_ENV` for test execution.
- Perform static determinism and architecture audits.
- Do not claim runtime validation success.
- Tests must be run locally with: `node --test --experimental-strip-types src/agents/didactic-pipeline/DidacticExplanationStyle.test.ts`

## Files

| File | Purpose |
|------|---------|
| `DidacticAgentContract.ts` | Extended with explanation style types |
| `ExplanationStyleSelector.ts` | Pure deterministic style selection |
| `PipelineComposer.ts` | Extended with `composeLessonPlanWithStyles` and `composeLessonPlanFull` |
| `ValidationLayer.ts` | Extended with style validation |
| `index.ts` | Public API exports |
| `DidacticExplanationStyle.test.ts` | Test suite (12 required + 3 additional) |
