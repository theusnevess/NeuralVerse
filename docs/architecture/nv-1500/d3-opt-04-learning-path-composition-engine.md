# D3-OPT-04 — Learning Path Composition Engine

## Purpose

This phase implements the **deterministic Learning Path Composition Engine** for the Curriculum Agent (D3). It extends the D3-OPT-01 Curriculum Graph Kernel, D3-OPT-02 Dependency Orchestration, and D3-OPT-03 Progression Intelligence with learning path metadata representation, validation, and trace composition.

This phase does **not** implement:

- personalized learning paths
- learner preference inference
- adaptive sequencing
- new curriculum node creation
- new dependency inference
- curriculum modification

Those belong to later D3 phases or are explicitly forbidden.

## Architecture

The Learning Path Composition Engine follows the same architectural patterns established by D3-OPT-01, D3-OPT-02, and D3-OPT-03:

- **Single monolithic contract file** (`CurriculumAgentContract.ts`) extended with learning path types
- **Pure deterministic kernel** (`LearningPathKernel.ts`) with compose functions
- **Validation layer** (`LearningPathValidation.ts`) returning structured errors
- **Barrel exports** (`index.ts`) organizing the public API

### Files

| File | Purpose |
|------|---------|
| `CurriculumAgentContract.ts` | Extended with learning path types (D3-OPT-04) |
| `LearningPathKernel.ts` | Deterministic learning path composition functions |
| `LearningPathValidation.ts` | Structured learning path validation layer |
| `LearningPathKernel.test.ts` | Deterministic test suite |
| `index.ts` | Barrel exports (extended) |

## Learning Path Philosophy

Learning path metadata is **purely declarative**. It describes the structure and ordering of curriculum nodes within a learning path, without inspecting any learner data.

The learning path model answers: "What is the canonical ordering of nodes in this path?"

It does **not** answer: "Which path should a learner take?"

This distinction is critical:
- Learning paths are **curriculum-owned** — they depend only on graph structure, dependency metadata, and progression metadata
- Path selection is **learner-owned** — it depends on learner history, goals, and context

## Canonical Learning Path Types

The kernel supports exactly 10 canonical learning path types:

| Path Type | Purpose |
|-----------|---------|
| `foundation` | Foundational knowledge path |
| `core` | Core curriculum path |
| `specialization` | Specialized topic path |
| `research` | Research-oriented path |
| `laboratory` | Laboratory-focused path |
| `project` | Project-based path |
| `review` | Review and reinforcement path |
| `capstone` | Capstone project path |
| `certification` | Certification preparation path |
| `exploration` | Exploratory learning path |

## Canonical Learning Path Stages

The kernel supports exactly 8 canonical learning path stages:

| Stage | Purpose |
|-------|---------|
| `planned` | Node is planned but not yet available |
| `available` | Node is available for engagement |
| `active` | Node is currently being engaged |
| `blocked` | Node is blocked by dependencies |
| `optional` | Node is optional in the path |
| `review` | Node is a review exercise |
| `completed_by_curriculum` | Node is completed by curriculum structure |
| `terminal` | Node is the terminal node in the path |

## Deterministic Composition Rules

Learning paths are composed exclusively from:

- **Curriculum Graph** — node existence and structure
- **Dependency Registry** — dependency relationships
- **Progression Registry** — progression states

The composition rules are:

1. **Entry node validation** — entryNodeId must be the first node in orderedNodeIds
2. **Terminal node validation** — terminalNodeId must be the last node in orderedNodeIds
3. **Node existence validation** — all nodes in orderedNodeIds must exist in the graph
4. **Duplicate node detection** — no duplicate nodeIds in orderedNodeIds
5. **Deterministic ordering** — paths sorted by pathId, then orderedNodeIds

These rules never:
- Create new curriculum nodes
- Infer new dependencies
- Reorder curriculum outside deterministic canonical ordering
- Personalize paths based on learner data

## Provenance Model

Every learning path requires complete provenance:

- `pathId` — unique identifier
- `source` — source authority
- `governanceStatus` — canonical | accepted | provisional | deprecated | rejected
- `rationale` — justification for inclusion
- `providedBy` — providing authority

Missing provenance fails validation.

## Deterministic Guarantees

The kernel provides the following deterministic guarantees:

1. **Identical input produces identical output** — no randomness, no time dependency
2. **Deterministic ordering** — paths sorted by `pathId`, then `orderedNodeIds`
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

## Validation Strategy

Validation returns structured errors, never exceptions. Each validator follows the pattern:

```typescript
function validateLearningPath(
  path: CurriculumLearningPath,
  graphNodeIds: readonly string[]
): readonly CurriculumLearningPathValidationError[]
```

### Validation Codes

| Code | Meaning |
|------|---------|
| `LEARNING_PATH_UNKNOWN_TYPE` | Non-canonical learning path type |
| `LEARNING_PATH_UNKNOWN_STAGE` | Non-canonical learning path stage |
| `LEARNING_PATH_DUPLICATE_PATH` | Duplicate path ID |
| `LEARNING_PATH_DUPLICATE_NODE` | Duplicate node in orderedNodeIds |
| `LEARNING_PATH_INVALID_ENTRY` | Entry node not in orderedNodeIds |
| `LEARNING_PATH_INVALID_TERMINAL` | Terminal node not in orderedNodeIds |
| `LEARNING_PATH_INVALID_REFERENCE` | References non-existent curriculum node |
| `LEARNING_PATH_INVALID_ORDER` | Entry or terminal node not at correct position |
| `LEARNING_PATH_MISSING_SOURCE` | Missing source field |
| `LEARNING_PATH_MISSING_PROVENANCE` | Missing provenance data |
| `LEARNING_PATH_EMPTY_PATH` | Path has no ordered node IDs |
| `LEARNING_PATH_EMPTY_REGISTRY` | Registry has no paths |
| `LEARNING_PATH_INVALID_STATUS` | Invalid governance status |
| `LEARNING_PATH_NON_CANONICAL_NODE` | Non-canonical curriculum node |

## Integration with D3-OPT-01

This phase integrates with D3-OPT-01 as follows:

- **Consumes**: `CurriculumGraph` and `CurriculumNode` from D3-OPT-01
- **Never modifies**: The curriculum graph structure
- **Never inserts**: New nodes or edges
- **Never rewrites**: Existing relationships
- **Metadata only**: Learning paths are metadata layered on top of the graph

### Integration Pattern

```
CurriculumGraph (D3-OPT-01)
  ↓
CurriculumDependencyRegistry (D3-OPT-02)
  ↓
CurriculumProgressionRegistry (D3-OPT-03)
  ↓
CurriculumLearningPathInput (D3-OPT-04)
  ↓
CurriculumLearningPathRegistry (D3-OPT-04)
  ↓
CurriculumLearningPathTrace (D3-OPT-04)
  ↓
CurriculumArtifactWithLearningPaths (D3-OPT-04)
```

## Integration with D3-OPT-02

This phase integrates with D3-OPT-02 as follows:

- **Consumes**: `CurriculumDependency` and `CurriculumDependencyRegistry` from D3-OPT-02
- **Uses**: Dependency metadata for path validation
- **Never modifies**: The dependency registry
- **Never inserts**: New dependencies
- **Metadata only**: Learning paths use dependency metadata for validation

## Integration with D3-OPT-03

This phase integrates with D3-OPT-03 as follows:

- **Consumes**: `CurriculumProgressionNode` and `CurriculumProgressionRegistry` from D3-OPT-03
- **Uses**: Progression metadata for path validation
- **Never modifies**: The progression registry
- **Never inserts**: New progressions
- **Metadata only**: Learning paths use progression metadata for validation

## Public API

### Compose Functions

- `composeLearningPath(params)` — compose a learning path
- `composeLearningPathNode(params)` — compose a learning path node
- `composeLearningPathRegistry(params)` — compose a learning path registry
- `composeLearningPathTrace(registryId, paths)` — compose a learning path trace
- `composeLearningPathProvenance(path)` — compose learning path provenance
- `composeCurriculumLearningPaths(input)` — compose learning paths from input
- `composeCurriculumArtifactWithLearningPaths(params)` — compose artifact with learning paths

### Helper Functions

- `isSupportedLearningPathType(type)` — check learning path type support
- `isSupportedLearningPathStage(stage)` — check learning path stage support
- `isSupportedLearningPathGovernanceStatus(status)` — check governance status support
- `getCanonicalLearningPathTypes()` — return canonical learning path types
- `getCanonicalLearningPathStages()` — return canonical learning path stages

### Validation Functions

- `validateLearningPath(path, graphNodeIds)` — validate a learning path
- `validateLearningPathRegistry(registry, graphNodeIds)` — validate a registry
- `validateCurriculumArtifactWithLearningPaths(artifact)` — validate an artifact
- `validateLearningPathInput(input, graphNodeIds)` — validate input

## Out of Scope

The following capabilities are explicitly out of scope for this phase:

- personalized learning paths
- learner preference inference
- adaptive sequencing
- new curriculum node creation
- new dependency inference
- curriculum modification
- learner mastery inference
- path recommendation
- path optimization
- runtime path adjustment
- learner modeling
- AI recommendations
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
