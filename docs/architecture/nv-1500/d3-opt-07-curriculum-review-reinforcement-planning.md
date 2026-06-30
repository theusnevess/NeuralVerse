# D3-OPT-07 — Curriculum Review & Reinforcement Planning

## Purpose

This phase implements the **deterministic Curriculum Review & Reinforcement Planning** layer for the Curriculum Agent (D3). It extends the D3-OPT-01 Curriculum Graph Kernel, D3-OPT-02 Dependency Orchestration, D3-OPT-03 Progression Intelligence, D3-OPT-04 Learning Path Composition, D3-OPT-05 Roadmap Orchestration, and D3-OPT-06 Coverage & Gap Analysis with review and reinforcement planning metadata.

This phase does **not** implement:

- personalization of review
- inference of forgetting
- scheduling of reminders
- estimation of mastery
- adaptive scheduling
- spaced repetition algorithms
- time-based reminders
- runtime execution

Those belong to later D3 phases or are explicitly forbidden.

## Review/Reinforcement Architecture

The Curriculum Review & Reinforcement Planning follows the same architectural patterns established by D3-OPT-01 through D3-OPT-06:

- **Single monolithic contract file** (`CurriculumAgentContract.ts`) extended with review/reinforcement types
- **Pure deterministic kernel** (`ReviewReinforcementKernel.ts`) with compose functions
- **Validation layer** (`ReviewReinforcementValidation.ts`) returning structured errors
- **Barrel exports** (`index.ts`) organizing the public API

### Files

| File | Purpose |
|------|---------|
| `CurriculumAgentContract.ts` | Extended with review/reinforcement types (D3-OPT-07) |
| `ReviewReinforcementKernel.ts` | Deterministic review/reinforcement composition functions |
| `ReviewReinforcementValidation.ts` | Structured review/reinforcement validation layer |
| `ReviewReinforcementKernel.test.ts` | Deterministic test suite |
| `index.ts` | Barrel exports (extended) |

## Review Model

The Review Engine represents canonical review structures already defined by the curriculum. It produces deterministic metadata for governance.

The review model answers: "What review structures exist in the curriculum?"

It does **not** answer: "When should a learner review?"

This distinction is critical:
- Review planning is **curriculum-owned** — it depends only on curriculum structure and metadata
- Review scheduling is **runtime-owned** — it depends on learner context and time

## Reinforcement Model

The Reinforcement Engine represents canonical reinforcement structures already defined by the curriculum. It produces deterministic metadata for governance.

The reinforcement model answers: "What reinforcement structures exist in the curriculum?"

It does **not** answer: "How should a learner practice?"

This distinction is critical:
- Reinforcement planning is **curriculum-owned** — it depends only on curriculum structure and metadata
- Reinforcement execution is **runtime-owned** — it depends on learner context and activity

## Recurrence Model

The recurrence model represents curriculum metadata about review boundaries:

- `none` — No recurrence specified
- `immediate` — Review at point of learning
- `short_interval` — Review after short interval
- `medium_interval` — Review after medium interval
- `long_interval` — Review after long interval
- `module_boundary` — Review at module completion
- `path_boundary` — Review at path completion
- `capstone_boundary` — Review at capstone completion

These are **curriculum metadata**, not runtime scheduling. They describe when review should happen in the curriculum structure, not when a learner should review.

## Canonical Review Types

The kernel supports exactly 10 canonical review types:

| Review Type | Purpose |
|-------------|---------|
| `concept_review` | Review of concept understanding |
| `dependency_review` | Review of dependency relationships |
| `competency_review` | Review of competency mastery |
| `assessment_review` | Review of assessment outcomes |
| `laboratory_review` | Review of laboratory work |
| `module_review` | Review at module completion |
| `path_review` | Review at path completion |
| `capstone_review` | Review of capstone project |
| `integration_review` | Review of integration across modules |
| `maintenance_review` | Maintenance review for curriculum upkeep |

## Canonical Reinforcement Types

The kernel supports exactly 10 canonical reinforcement types:

| Reinforcement Type | Purpose |
|--------------------|---------|
| `concept_reinforcement` | Reinforce concept understanding |
| `dependency_reinforcement` | Reinforce dependency relationships |
| `competency_reinforcement` | Reinforce competency mastery |
| `skill_reinforcement` | Reinforce skill application |
| `practice_reinforcement` | Reinforce through practice |
| `laboratory_reinforcement` | Reinforce through laboratory work |
| `assessment_reinforcement` | Reinforce through assessment |
| `cross_module_reinforcement` | Reinforce across modules |
| `capstone_reinforcement` | Reinforce through capstone work |
| `long_term_retention` | Ensure long-term retention |

## Canonical Recurrence Models

The kernel supports exactly 8 canonical recurrence models:

| Recurrence Model | Purpose |
|------------------|---------|
| `none` | No recurrence specified |
| `immediate` | Review at point of learning |
| `short_interval` | Review after short interval |
| `medium_interval` | Review after medium interval |
| `long_interval` | Review after long interval |
| `module_boundary` | Review at module completion |
| `path_boundary` | Review at path completion |
| `capstone_boundary` | Review at capstone completion |

## Deterministic Ordering

Review plans sorted by:

```
reviewType → recurrenceModel → reviewId
```

Reinforcement plans sorted by:

```
reinforcementType → reinforcementId
```

Never rely on insertion order.

## Provenance Model

Every review plan requires:

- `reviewId` — Unique identifier
- `source` — Source authority
- `governanceStatus` — Canonical governance status
- `rationale` — Justification
- `providedBy` — Providing authority

Every reinforcement plan requires:

- `reinforcementId` — Unique identifier
- `source` — Source authority
- `governanceStatus` — Canonical governance status
- `rationale` — Justification
- `providedBy` — Providing authority

Mandatory.

## Validation Strategy

Validation returns structured errors, never exceptions for expected validation failures.

### Validation Codes

| Code | Meaning |
|------|---------|
| `REVIEW_UNKNOWN_TYPE` | Non-canonical review type |
| `REINFORCEMENT_UNKNOWN_TYPE` | Non-canonical reinforcement type |
| `REVIEW_UNKNOWN_RECURRENCE` | Non-canonical recurrence model |
| `REVIEW_DUPLICATE_ID` | Duplicate review plan ID |
| `REINFORCEMENT_DUPLICATE_ID` | Duplicate reinforcement plan ID |
| `REVIEW_INVALID_TARGET` | References non-existent curriculum node |
| `REINFORCEMENT_INVALID_TARGET` | References non-existent curriculum node |
| `REVIEW_EMPTY_TARGETS` | Review plan has no targets |
| `REINFORCEMENT_EMPTY_TARGETS` | Reinforcement plan has no targets |
| `REVIEW_MISSING_SOURCE` | Missing source field |
| `REINFORCEMENT_MISSING_SOURCE` | Missing source field |
| `REVIEW_MISSING_PROVENANCE` | Missing provenance data |
| `REINFORCEMENT_MISSING_PROVENANCE` | Missing provenance data |
| `REVIEW_REINFORCEMENT_EMPTY_REGISTRY` | Registry has no plans |
| `REVIEW_REINFORCEMENT_INVALID_STATUS` | Invalid governance status |
| `REVIEW_RUNTIME_SCHEDULING_FORBIDDEN` | Runtime scheduling detected |

## Deterministic Guarantees

The kernel provides the following deterministic guarantees:

1. **Identical input produces identical output** — no randomness, no time dependency
2. **Deterministic ordering** — review plans sorted by reviewType, recurrenceModel, reviewId; reinforcement plans by reinforcementType, reinforcementId
3. **No mutation** — all compose functions return new objects; inputs are never modified
4. **No side effects** — no network access, no filesystem access, no global state
5. **No inference** — the kernel does not infer mastery, generate content, or model learners

### Forbidden

The kernel never:

- Uses `Math.random`, `Date.now`, `performance.now`, `new Date()`
- Uses `crypto.randomUUID()` or UUID generation
- Accesses network (`fetch`, `axios`, `XMLHttpRequest`, `WebSocket`)
- Accesses browser APIs (`navigator`, `window`, `document`, `localStorage`)
- Accesses filesystem
- Uses `async` or `Promise`
- Generates curriculum content
- Infers learner mastery
- Personalizes learning
- Modifies curriculum graphs
- Creates new curriculum nodes
- Infers new dependencies
- Reorders curriculum outside deterministic canonical ordering
- Executes assessments or laboratories
- Calls APIs or LLMs
- Accesses databases
- Schedules activities based on time

## Relationship with Curriculum Graph

This phase integrates with D3-OPT-01 as follows:

- **Consumes**: `CurriculumGraph` and `CurriculumNode` from D3-OPT-01
- **Never modifies**: The curriculum graph structure
- **Never inserts**: New nodes or edges
- **Never rewrites**: Existing relationships
- **Metadata only**: Review/reinforcement planning is metadata layered on top of the graph

## Relationship with Dependencies

This phase integrates with D3-OPT-02 as follows:

- **Consumes**: `CurriculumDependency` and `CurriculumDependencyRegistry` from D3-OPT-02
- **Uses**: Dependency metadata for review/reinforcement planning
- **Never modifies**: The dependency registry
- **Never inserts**: New dependencies
- **Metadata only**: Review/reinforcement planning uses dependency metadata

## Relationship with Progression

This phase integrates with D3-OPT-03 as follows:

- **Consumes**: `CurriculumProgressionNode` and `CurriculumProgressionRegistry` from D3-OPT-03
- **Uses**: Progression metadata for review/reinforcement planning
- **Never modifies**: The progression registry
- **Never inserts**: New progressions
- **Metadata only**: Review/reinforcement planning uses progression metadata

## Relationship with Learning Paths

This phase integrates with D3-OPT-04 as follows:

- **Consumes**: `CurriculumLearningPath` and `CurriculumLearningPathRegistry` from D3-OPT-04
- **Uses**: Learning path metadata for review/reinforcement planning
- **Never modifies**: The learning path registry
- **Never inserts**: New learning paths
- **Metadata only**: Review/reinforcement planning uses learning path metadata

## Relationship with Roadmaps

This phase integrates with D3-OPT-05 as follows:

- **Consumes**: `CurriculumRoadmap` and `CurriculumRoadmapRegistry` from D3-OPT-05
- **Uses**: Roadmap metadata for review/reinforcement planning
- **Never modifies**: The roadmap registry
- **Never inserts**: New roadmaps
- **Metadata only**: Review/reinforcement planning uses roadmap metadata

## Relationship with Coverage

This phase integrates with D3-OPT-06 as follows:

- **Consumes**: `CurriculumCoverageRegistry` from D3-OPT-06
- **Uses**: Coverage metadata for review/reinforcement planning
- **Never modifies**: The coverage registry
- **Never inserts**: New coverage records
- **Metadata only**: Review/reinforcement planning uses coverage metadata

## Explicit Boundaries

The Review/Reinforcement Kernel MUST NOT:

- personalize review
- infer forgetting
- infer mastery
- infer readiness
- infer weakness
- schedule reminders
- use dates
- use current time
- calculate intervals dynamically
- optimize review spacing
- mutate curriculum
- mutate dependencies
- mutate progression
- generate educational content
- generate assessments
- execute laboratories
- call external APIs
- call LLMs
- access network
- access filesystem
- access databases

## Public API

### Compose Functions

- `composeReviewPlan(params)` — Compose a review plan
- `composeReinforcementPlan(params)` — Compose a reinforcement plan
- `composeReviewReinforcementRegistry(params)` — Compose a registry
- `composeReviewReinforcementTrace(registryId, reviewPlans, reinforcementPlans)` — Compose a trace
- `composeReviewReinforcementProvenance(registry)` — Compose provenance
- `composeCurriculumReviewReinforcement(input)` — Compose from input
- `composeCurriculumArtifactWithReviewReinforcement(params)` — Compose artifact

### Helper Functions

- `isSupportedReviewType(type)` — Check review type support
- `isSupportedReinforcementType(type)` — Check reinforcement type support
- `isSupportedReviewRecurrenceModel(model)` — Check recurrence model support
- `isSupportedReviewReinforcementGovernanceStatus(status)` — Check governance status support
- `getCanonicalReviewTypes()` — Return canonical review types
- `getCanonicalReinforcementTypes()` — Return canonical reinforcement types
- `getCanonicalReviewRecurrenceModels()` — Return canonical recurrence models

### Validation Functions

- `validateReviewPlan(plan, graphNodeIds)` — Validate a review plan
- `validateReinforcementPlan(plan, graphNodeIds)` — Validate a reinforcement plan
- `validateReviewReinforcementRegistry(registry, graphNodeIds)` — Validate a registry
- `validateCurriculumArtifactWithReviewReinforcement(artifact)` — Validate an artifact
- `validateReviewReinforcementInput(input, graphNodeIds)` — Validate input

## Out of Scope

The following capabilities are explicitly out of scope for this phase:

- personalization of review
- inference of forgetting
- estimation of mastery
- adaptive scheduling
- spaced repetition algorithms
- time-based reminders
- runtime execution
- learner modeling
- content generation
- graph rewriting
- curriculum generation

## Runtime Limitations

- All operations are synchronous and deterministic
- No external dependencies
- No network access
- No filesystem access
- No async operations
- No global mutable state
- No randomness
- No time dependency
