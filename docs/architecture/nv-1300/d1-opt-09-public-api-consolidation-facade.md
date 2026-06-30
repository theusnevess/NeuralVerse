# D1-OPT-09 — Public API Consolidation & Backward-Compatible Facade

## Purpose

Consolidates the Didactic Agent pipeline API into a stable, readable, backward-compatible public facade. This phase reduces architectural fragility by exposing canonical entrypoints while preserving compatibility with all D1-OPT-01 through D1-OPT-08 functions.

## Facade API

### Canonical Entrypoints

| Function | Purpose |
|----------|---------|
| `composeDidacticLessonPlan(input)` | Compose a complete lesson plan with all orchestration traces |
| `certifyDidacticLessonPlan(plan)` | Certify a composed lesson plan for governance review |
| `composeAndCertifyDidacticLessonPlan(input)` | Compose + certify in one call |

### Facade Output Types

| Type | Contents |
|------|----------|
| `DidacticFacadeLessonPlanOutput` | `lessonPlan`, `validationResult`, `traceMetadata` |
| `DidacticFacadeCertificationOutput` | `certificationReport`, `validationResult`, `traceMetadata` |
| `DidacticFacadeCompleteOutput` | `lessonPlan`, `certificationReport`, `validationResult`, `certificationValidation`, `traceMetadata` |
| `DidacticFacadeTraceMetadata` | `facadeVersion`, `composed`, `certified`, `deterministic`, `generatedFrom` |

## Backward Compatibility Policy

All previous composer functions remain available as exported aliases:

| Legacy Function | Canonical Replacement | Status |
|----------------|----------------------|--------|
| `composeLessonPlan` | `composeDidacticLessonPlan` | Available (base composer) |
| `composeLessonPlanWithDependencies` | `composeDidacticLessonPlan` | Available (legacy alias) |
| `composeLessonPlanWithStyles` | `composeDidacticLessonPlan` | Available (legacy alias) |
| `composeLessonPlanFull` | `composeDidacticLessonPlan` | Available (legacy alias) |
| `composeLessonPlanComplete` | `composeDidacticLessonPlan` | Available (legacy alias) |
| `composeLessonPlanAll` | `composeDidacticLessonPlan` | Available (legacy alias) |
| `composeLessonPlanFinal` | `composeDidacticLessonPlan` | Available (legacy alias) |
| `composeLessonPlanComplete2` | `composeDidacticLessonPlan` | Available (legacy alias) |

No existing imports will break. Legacy functions continue to work identically.

## Deprecated Composer Naming Issue

The original D1-OPT-01 through D1-OPT-07 composers used progressive naming (`composeLessonPlan` → `composeLessonPlanWithDependencies` → ... → `composeLessonPlanComplete2`). This naming scheme:

- Became unwieldy as orchestrations accumulated
- Made it unclear which orchestrations were included
- Created import ambiguity

The facade resolves this by providing a single canonical entrypoint (`composeDidacticLessonPlan`) that always includes all orchestrations, while preserving legacy names for backward compatibility.

## Migration Guidance

### For New Code

```typescript
import { composeDidacticLessonPlan, certifyDidacticLessonPlan } from './didactic-pipeline';

// Compose
const { lessonPlan, validationResult } = composeDidacticLessonPlan(input);

// Certify
const { certificationReport } = certifyDidacticLessonPlan(lessonPlan);

// Or both in one call
const { lessonPlan, certificationReport } = composeAndCertifyDidacticLessonPlan(input);
```

### For Existing Code

No changes required. All previous imports continue to work:

```typescript
import { composeLessonPlanComplete2 } from './didactic-pipeline';
// Still works — legacy alias preserved
```

### Recommended Migration Path

1. No immediate migration required — legacy aliases are stable.
2. New code should use canonical facade entrypoints.
3. Gradually migrate existing callsites when touching related code.

## Validation Strategy

### Facade Output Validation

| Validator | Checks |
|-----------|--------|
| `validateFacadeLessonPlanOutput` | lessonPlan present, validation result present, trace metadata present |
| `validateFacadeCertificationOutput` | certificationReport present and valid, validation result present, trace metadata present |
| `validateFacadeCompleteOutput` | Both lessonPlan and certificationReport present and valid, both validation results present, trace metadata present |

### Structural Validation (D1-OPT-01)
- Canonical stage order
- No duplicate stages
- No non-canonical stages
- Trace metadata present and correct

## Deterministic Guarantees

1. **Reproducibility**: Identical inputs → identical facade outputs.
2. **No mutation**: Input plans are never modified.
3. **No generation**: Facade produces only orchestration metadata, no content.
4. **No inference**: No learner score, mastery score, or readiness score.
5. **Backward compatible**: All legacy composer functions preserved.
6. **Traceable**: Every facade output includes `DidacticFacadeTraceMetadata`.

## Out-of-Scope Items

- No new pedagogical features
- No removal of existing exported functions
- No canonical stage order changes
- No content generation
- No learner inference
- No curriculum mutation

## Runtime Validation Limitation

If Node.js is unavailable in the execution environment, runtime tests cannot be executed. In this case:
- Report `BLOCKED_ENV` for test execution.
- Perform static determinism and architecture audits.
- Do not claim runtime validation success.
- Tests must be run locally with: `node --test --experimental-strip-types src/agents/didactic-pipeline/DidacticFacade.test.ts`

## Files

| File | Purpose |
|------|---------|
| `DidacticPipelineFacade.ts` | Canonical public facade with 3 entrypoints |
| `ValidationLayer.ts` | Extended with facade output validation |
| `index.ts` | Organized exports with legacy aliases |
| `DidacticFacade.test.ts` | Test suite (12 required + 2 additional) |
