# D3-OPT-05 — Curriculum Roadmap Orchestration

## Purpose

This phase implements the **deterministic Curriculum Roadmap Orchestration** layer for the Curriculum Agent (D3). It extends the D3-OPT-01 Curriculum Graph Kernel, D3-OPT-02 Dependency Orchestration, D3-OPT-03 Progression Intelligence, and D3-OPT-04 Learning Path Composition with roadmap metadata representation, validation, and trace composition.

This phase does **not** implement:

- personalized learning paths
- learner preference inference
- adaptive sequencing
- curriculum modification
- scheduling
- duration estimation
- workload estimation
- recommendation engines
- AI-powered path selection

Those belong to later D3 phases or are explicitly forbidden.

## Roadmap Architecture

The Curriculum Roadmap Orchestration follows the same architectural patterns established by D3-OPT-01 through D3-OPT-04:

- **Single monolithic contract file** (`CurriculumAgentContract.ts`) extended with roadmap types
- **Pure deterministic kernel** (`RoadmapKernel.ts`) with compose functions
- **Validation layer** (`RoadmapValidation.ts`) returning structured errors
- **Barrel exports** (`index.ts`) organizing the public API

### Files

| File | Purpose |
|------|---------|
| `CurriculumAgentContract.ts` | Extended with roadmap types (D3-OPT-05) |
| `RoadmapKernel.ts` | Deterministic roadmap composition functions |
| `RoadmapValidation.ts` | Structured roadmap validation layer |
| `RoadmapKernel.test.ts` | Deterministic test suite |
| `index.ts` | Barrel exports (extended) |

## Roadmap Model

A roadmap is a **deterministic representation of the canonical routes** that exist inside the curriculum architecture. It is not a personalized recommendation, not learner progression, not scheduling, and not adaptive sequencing.

The roadmap model answers: "What are the canonical routes through this curriculum?"

It does **not** answer: "Which route should a learner take?"

This distinction is critical:
- Roadmaps are **curriculum-owned** — they depend only on graph structure, dependency metadata, progression metadata, and learning path metadata
- Route selection is **learner-owned** — it depends on learner history, goals, and context

## Canonical Roadmap Types

The kernel supports exactly 10 canonical roadmap types:

| Roadmap Type | Purpose |
|--------------|---------|
| `foundation` | Foundation knowledge roadmap |
| `core` | Core curriculum roadmap |
| `specialization` | Specialized topic roadmap |
| `research` | Research-oriented roadmap |
| `engineering` | Engineering-focused roadmap |
| `mathematics` | Mathematics-focused roadmap |
| `laboratory` | Laboratory-focused roadmap |
| `review` | Review and reinforcement roadmap |
| `capstone` | Capstone project roadmap |
| `complete_program` | Complete program roadmap |

## Canonical Roadmap Stages

The kernel supports exactly 10 canonical roadmap stages:

| Stage | Purpose |
|-------|---------|
| `entry` | Entry point to the roadmap |
| `foundation` | Foundation knowledge stage |
| `core` | Core curriculum stage |
| `intermediate` | Intermediate knowledge stage |
| `advanced` | Advanced knowledge stage |
| `specialization` | Specialization stage |
| `integration` | Integration stage |
| `research` | Research stage |
| `capstone` | Capstone stage |
| `completion` | Completion milestone |

## Deterministic Ordering

Every roadmap must be ordered by:

```
roadmapId
↓
stage
↓
nodeOrder
↓
nodeId
```

Never depend on insertion order.

## Provenance Model

Every roadmap requires:

- `roadmapId` — unique identifier
- `source` — source authority
- `governanceStatus` — canonical | accepted | provisional | deprecated | rejected
- `rationale` — justification for inclusion
- `providedBy` — providing authority

Mandatory.

## Validation Strategy

Validation returns structured errors, never exceptions for expected validation failures.

### Validation Codes

| Code | Meaning |
|------|---------|
| `ROADMAP_UNKNOWN_TYPE` | Non-canonical roadmap type |
| `ROADMAP_UNKNOWN_STAGE` | Non-canonical roadmap stage |
| `ROADMAP_DUPLICATE_ID` | Duplicate roadmap ID |
| `ROADMAP_DUPLICATE_NODE` | Duplicate node in roadmap |
| `ROADMAP_INVALID_REFERENCE` | References non-existent curriculum node |
| `ROADMAP_INVALID_ENTRY` | Entry node not in roadmap or wrong stage |
| `ROADMAP_INVALID_TERMINAL` | Completion node not in roadmap or wrong stage |
| `ROADMAP_EMPTY_PATH` | Roadmap has no nodes |
| `ROADMAP_EMPTY_REGISTRY` | Registry has no roadmaps |
| `ROADMAP_INVALID_ORDER` | Stages regress in roadmap |
| `ROADMAP_MISSING_PROVENANCE` | Missing provenance data |
| `ROADMAP_MISSING_SOURCE` | Missing source field |
| `ROADMAP_INVALID_STATUS` | Invalid governance status |

## Deterministic Guarantees

The kernel provides the following deterministic guarantees:

1. **Identical input produces identical output** — no randomness, no time dependency
2. **Deterministic ordering** — roadmaps sorted by `roadmapId`, then stage order, then `nodeOrder`, then `nodeId`
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
- Executes assessments
- Models learner state
- Recommends paths
- Predicts learner success
- Estimates duration or workload
- Schedules activities
- Calls APIs or LLMs
- Performs searches

## Relationship with Curriculum Graph

This phase integrates with D3-OPT-01 as follows:

- **Consumes**: `CurriculumGraph` and `CurriculumNode` from D3-OPT-01
- **Never modifies**: The curriculum graph structure
- **Never inserts**: New nodes or edges
- **Never rewrites**: Existing relationships
- **Metadata only**: Roadmaps are metadata layered on top of the graph

## Relationship with Dependency Orchestration

This phase integrates with D3-OPT-02 as follows:

- **Consumes**: `CurriculumDependency` and `CurriculumDependencyRegistry` from D3-OPT-02
- **Uses**: Dependency metadata for roadmap validation
- **Never modifies**: The dependency registry
- **Never inserts**: New dependencies
- **Metadata only**: Roadmaps use dependency metadata for validation

## Relationship with Progression Intelligence

This phase integrates with D3-OPT-03 as follows:

- **Consumes**: `CurriculumProgressionNode` and `CurriculumProgressionRegistry` from D3-OPT-03
- **Uses**: Progression metadata for roadmap validation
- **Never modifies**: The progression registry
- **Never inserts**: New progressions
- **Metadata only**: Roadmaps use progression metadata for validation

## Relationship with Learning Paths

This phase integrates with D3-OPT-04 as follows:

- **Consumes**: `CurriculumLearningPath` and `CurriculumLearningPathRegistry` from D3-OPT-04
- **Uses**: Learning path metadata for roadmap validation
- **Never modifies**: The learning path registry
- **Never inserts**: New learning paths
- **Metadata only**: Roadmaps use learning path metadata for validation

## Explicit Boundaries

The roadmap kernel MUST NOT:

- Recommend paths
- Personalize curriculum
- Predict learner success
- Estimate duration or workload
- Infer mastery or readiness
- Modify progression
- Modify dependencies
- Modify graph
- Modify learning paths
- Schedule activities
- Generate curriculum
- Call APIs or LLMs
- Perform searches
- Execute laboratories or assessments

## Public API

### Compose Functions

- `composeRoadmap(params)` — compose a roadmap
- `composeRoadmapNode(params)` — compose a roadmap node
- `composeRoadmapRegistry(params)` — compose a roadmap registry
- `composeRoadmapTrace(registryId, roadmaps)` — compose a roadmap trace
- `composeRoadmapProvenance(roadmap)` — compose roadmap provenance
- `composeCurriculumRoadmaps(input)` — compose roadmaps from input
- `composeCurriculumArtifactWithRoadmaps(params)` — compose artifact with roadmaps

### Helper Functions

- `isSupportedRoadmapType(type)` — check roadmap type support
- `isSupportedRoadmapStage(stage)` — check roadmap stage support
- `isSupportedRoadmapGovernanceStatus(status)` — check governance status support
- `getCanonicalRoadmapTypes()` — return canonical roadmap types
- `getCanonicalRoadmapStages()` — return canonical roadmap stages

### Validation Functions

- `validateRoadmapNode(node, graphNodeIds)` — validate a roadmap node
- `validateRoadmap(roadmap, graphNodeIds)` — validate a roadmap
- `validateRoadmapRegistry(registry, graphNodeIds)` — validate a registry
- `validateCurriculumArtifactWithRoadmaps(artifact)` — validate an artifact
- `validateRoadmapInput(input, graphNodeIds)` — validate input

## Out of Scope

The following capabilities are explicitly out of scope for this phase:

- personalized learning paths
- learner preference inference
- adaptive sequencing
- curriculum modification
- scheduling
- duration estimation
- workload estimation
- recommendation engines
- AI-powered path selection
- learner mastery inference
- path optimization
- runtime path adjustment
- learner modeling
- content generation
- graph rewriting

## Runtime Limitations

- All operations are synchronous and deterministic
- No external dependencies
- No network access
- No filesystem access
- No async operations
- No global mutable state
- No randomness
- No time dependency
