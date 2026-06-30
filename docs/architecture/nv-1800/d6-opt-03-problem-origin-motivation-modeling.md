# D6-OPT-03 — Problem-Origin & Motivation Modeling

## Purpose

This optimization introduces the deterministic structural representation of why concepts exist, which problems originated them, what limitations motivated them, what engineering or scientific questions they answer, what misconceptions they resolve, and what cognitive motivation should precede explanation.

This layer models motivation metadata only. It does not generate explanations, narratives, educational sequencing, or storytelling.

## Philosophy

A narrative should never begin with information. It should begin with a reason why the information matters. This optimization models that reason.

## Architecture

```
src/agents/narrative-pipeline/
  NarrativeAgentContract.ts   — Extended with problem types
  ProblemKernel.ts            — Problem composition functions
  ProblemValidation.ts        — Problem validation layer
  ProblemKernel.test.ts       — Test suite (~65 tests)
  index.ts                    — Updated public API barrel
```

## Canonical Enums

### Problem Types (10)

`engineering_problem`, `scientific_problem`, `mathematical_problem`, `historical_problem`, `practical_problem`, `performance_problem`, `design_problem`, `communication_problem`, `optimization_problem`, `misconception_problem`

### Origin Types (10)

`historical_need`, `engineering_need`, `scientific_discovery`, `practical_constraint`, `mathematical_formalization`, `technological_evolution`, `research_gap`, `educational_need`, `industry_problem`, `cross_domain_integration`

### Motivation Categories (10)

`curiosity`, `necessity`, `efficiency`, `accuracy`, `scalability`, `simplicity`, `interpretability`, `automation`, `robustness`, `innovation`

### Driving Question Types (10)

`why`, `how`, `what_if`, `comparison`, `tradeoff`, `prediction`, `failure_analysis`, `optimization`, `design_choice`, `future_direction`

### Misconception Types (10)

`oversimplification`, `false_equivalence`, `incorrect_causality`, `terminology_confusion`, `implementation_confusion`, `mathematical_confusion`, `historical_confusion`, `algorithmic_confusion`, `visualization_confusion`, `conceptual_confusion`

### Problem Status (6)

`draft`, `review`, `approved`, `published`, `deprecated`, `archived`

## Models

### Problem

- `problemId` — unique identifier
- `problemType` — one of 10 canonical problem types
- `title` — descriptive title
- `summary` — metadata description
- `originId` — references an origin
- `motivationIds` — references motivations
- `questionIds` — references driving questions
- `misconceptionIds` — references misconceptions
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### Origin

- `originId` — unique identifier
- `originType` — one of 10 canonical origin types
- `title` — descriptive title
- `description` — metadata description
- `relatedArtifactId` — references governed knowledge
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### ProblemMotivation

- `motivationId` — unique identifier
- `category` — one of 10 canonical motivation categories
- `title` — descriptive title
- `description` — metadata description
- `importance` — significance statement
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### DrivingQuestion

- `questionId` — unique identifier
- `questionType` — one of 10 canonical question types
- `prompt` — the question text
- `relatedArtifactId` — references governed knowledge
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### Misconception

- `misconceptionId` — unique identifier
- `misconceptionType` — one of 10 canonical misconception types
- `title` — descriptive title
- `description` — metadata description
- `correctiveArtifactId` — references corrective knowledge
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

## Registry Model

The `ProblemRegistry` stores all problem-origin entities:

- `problems` — sorted problems
- `origins` — sorted origins
- `motivations` — sorted motivations
- `questions` — sorted questions
- `misconceptions` — sorted misconceptions
- `metadata` — counts and metadata
- `trace` — deterministic trace metadata

Deterministic sorting for each collection. No insertion-order dependence.

## Provenance Model

Every entity requires provenance with:

- `source` — origin of the metadata
- `governanceStatus` — canonical governance status
- `providedBy` — responsible entity
- `rationale` — justification

Missing provenance fails validation.

## Deterministic Guarantees

- All composition functions are pure with no side effects
- Trace metadata declares `deterministic: true`, `randomUsed: false`, `timeDependency: false`
- No timestamps, runtime identifiers, or clocks in trace metadata
- Input arrays are copied before sorting: `[...items].sort(...)`
- All public interfaces use `readonly`

## Validation Strategy

- Never throws exceptions for expected validation failures
- Always returns structured `ProblemValidationError[]`
- Uses stable validation codes (e.g., `PROBLEM_DUPLICATE_ID`)
- Covers: all entity types, duplicate detection, enum validation, provenance validation, registry integrity

## Out of Scope

This optimization does NOT implement:

- Explanation generation
- Story generation
- Historical fact invention
- Knowledge rewriting
- Motivation personalization
- Curiosity estimation
- Misconception inference
- Dynamic question generation
- Educational sequencing
- LLM calls
- External API access
- Runtime logic execution

## Relationship with D6-OPT-01 and D6-OPT-02

D6-OPT-03 extends D6-OPT-01 and D6-OPT-02 without modifying them. All previous exports remain fully backward compatible. Only additive architecture is permitted.

D6-OPT-03 consumes governed outputs from:

- D6-OPT-01 Narrative Registry
- D6-OPT-02 Narrative Style Registry
- Knowledge Agent (D5)
- Curriculum & Dependency Agent (D3)

D6-OPT-03 produces:

- Problem metadata
- Origin metadata
- Motivation metadata
- Question metadata
- Misconception metadata
- Problem registries
- Artifacts with applied problems

## Public API

### Constants

- `CANONICAL_PROBLEM_TYPES` — 10 values
- `CANONICAL_ORIGIN_TYPES` — 10 values
- `CANONICAL_MOTIVATION_CATEGORIES` — 10 values
- `CANONICAL_DRIVING_QUESTION_TYPES` — 10 values
- `CANONICAL_MISCONCEPTION_TYPES` — 10 values
- `CANONICAL_PROBLEM_STATUS` — 6 values

### Composition Functions

- `composeProblemProvenance()`
- `composeOrigin()`
- `composeMotivation()`
- `composeDrivingQuestion()`
- `composeMisconception()`
- `composeProblem()`
- `composeProblemTrace()`
- `composeProblemRegistry()`
- `composeProblemRegistryFromInput()`
- `composeNarrativeProblems()`
- `composeNarrativeArtifactWithProblems()`

### Helper Functions

- `isSupportedProblemType()`
- `isSupportedOriginType()`
- `isSupportedMotivationCategory()`
- `isSupportedDrivingQuestionType()`
- `isSupportedMisconceptionType()`
- `isSupportedProblemStatus()`
- `getCanonicalProblemTypes()`
- `getCanonicalOriginTypes()`
- `getCanonicalMotivationCategories()`
- `getCanonicalDrivingQuestionTypes()`
- `getCanonicalMisconceptionTypes()`
- `getCanonicalProblemStatuses()`

### Validation Functions

- `validateProblem()`
- `validateOrigin()`
- `validateMotivation()`
- `validateDrivingQuestion()`
- `validateMisconception()`
- `validateProblemRegistry()`
- `validateProblemInput()`
- `validateNarrativeArtifactWithProblems()`

## Future D6 Extensions

- D6-OPT-04: Historical timeline construction
- D6-OPT-05: Incremental construction engine
- D6-OPT-06: Application-driven context
- D6-OPT-07: Laboratory-synchronized narrative
- D6-OPT-08: Cross-module continuity
- D6-OPT-09: Lesson closure synthesis
- D6-OPT-10: Narrative certification & public facade
