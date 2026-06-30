# D3-OPT-03 — Curriculum Progression Intelligence

## Purpose

This phase implements the **deterministic progression intelligence layer** for the Curriculum Agent (D3). It extends the D3-OPT-01 Curriculum Graph Kernel and D3-OPT-02 Dependency Orchestration with progression metadata representation, validation, and trace composition.

This phase does **not** implement:

- learner mastery inference
- personalized learning paths
- curriculum modification
- learning execution
- assessment execution
- certification
- goal interpretation

Those belong to later D3 phases.

## Architecture

The Progression Intelligence layer follows the same architectural patterns established by D3-OPT-01 and D3-OPT-02:

- **Single monolithic contract file** (`CurriculumAgentContract.ts`) extended with progression types
- **Pure deterministic kernel** (`ProgressionKernel.ts`) with compose functions
- **Validation layer** (`ProgressionValidation.ts`) returning structured errors
- **Barrel exports** (`index.ts`) organizing the public API

### Files

| File | Purpose |
|------|---------|
| `CurriculumAgentContract.ts` | Extended with progression types (D3-OPT-03) |
| `ProgressionKernel.ts` | Deterministic progression composition functions |
| `ProgressionValidation.ts` | Structured progression validation layer |
| `ProgressionKernel.test.ts` | Deterministic test suite |
| `index.ts` | Barrel exports (extended) |

## Progression Philosophy

Progression metadata is **purely declarative**. It describes the state of each curriculum node relative to the curriculum structure, without inspecting any learner data.

The progression model answers: "What is the state of this node in the curriculum?"

It does **not** answer: "Is the learner ready for this node?"

This distinction is critical:
- Progression is **curriculum-owned** — it depends only on graph structure and dependency metadata
- Readiness is **learner-owned** — it depends on learner history, mastery, and context

## Canonical Progression States

The kernel supports exactly 10 canonical progression states:

| State | Purpose |
|-------|---------|
| `not_available` | Node is not yet available in the curriculum |
| `available` | Node is available for learner engagement |
| `recommended` | Node is recommended but not required |
| `blocked` | Node is blocked by unresolved required dependencies |
| `optional` | Node is optional background or enrichment |
| `review` | Node is a review or recap exercise |
| `reinforcement` | Node is a reinforcement exercise |
| `completed_by_curriculum` | Node is completed by curriculum structure |
| `capstone_ready` | Node is a capstone ready for execution |
| `path_complete` | Node marks path completion |

## Deterministic Rules

Progression depends exclusively on curriculum metadata:

| Condition | Result |
|-----------|--------|
| nodeType is 'review' | `review` |
| nodeType is 'reinforcement' | `reinforcement` |
| nodeType is 'capstone' with no required dependencies | `capstone_ready` |
| nodeType is 'capstone' with required dependencies | `blocked` |
| Has unresolved required dependencies | `blocked` |
| Has only optional_background/enrichment dependencies | `optional` |
| No dependencies | `available` |
| All dependencies resolved | `available` |

These rules never inspect learner data. They are curriculum semantics only.

## Provenance Model

Every progression decision requires complete provenance:

- `progressionId` — unique identifier
- `source` — source authority
- `governanceStatus` — canonical | accepted | provisional | deprecated | rejected
- `rationale` — justification for inclusion
- `providedBy` — providing authority

Missing provenance fails validation.

## Deterministic Guarantees

The kernel provides the following deterministic guarantees:

1. **Identical input produces identical output** — no randomness, no time dependency
2. **Deterministic ordering** — progressions sorted by `curriculumNodeId`, then `progressionState`, then `progressionId`
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
- Creates learning paths
- Executes assessments
- Models learner state

## Validation Strategy

Validation returns structured errors, never exceptions. Each validator follows the pattern:

```typescript
function validateProgressionNode(
  progression: CurriculumProgressionNode,
  graphNodeIds: readonly string[]
): readonly CurriculumProgressionValidationError[]
```

### Validation Codes

| Code | Meaning |
|------|---------|
| `PROGRESSION_UNKNOWN_STATE` | Non-canonical progression state |
| `PROGRESSION_DUPLICATE_NODE` | Duplicate curriculum node reference |
| `PROGRESSION_DUPLICATE_ID` | Duplicate progression ID |
| `PROGRESSION_INVALID_REFERENCE` | References non-existent curriculum node |
| `PROGRESSION_INVALID_DEPENDENCY` | References non-existent dependency |
| `PROGRESSION_MISSING_SOURCE` | Missing source field |
| `PROGRESSION_MISSING_PROVENANCE` | Missing provenance data |
| `PROGRESSION_EMPTY_REGISTRY` | Registry has no progressions |
| `PROGRESSION_INVALID_STATUS` | Invalid governance status |
| `PROGRESSION_INCONSISTENT_STATE` | Inconsistent progression state |
| `PROGRESSION_NON_CANONICAL_STATE` | Non-canonical progression state |
| `PROGRESSION_ORPHAN_NODE` | Orphan progression node |

## Integration with D3-OPT-01

This phase integrates with D3-OPT-01 as follows:

- **Consumes**: `CurriculumGraph` and `CurriculumNode` from D3-OPT-01
- **Never modifies**: The curriculum graph structure
- **Never inserts**: New nodes or edges
- **Never rewrites**: Existing relationships
- **Metadata only**: Progression is metadata layered on top of the graph

### Integration Pattern

```
CurriculumGraph (D3-OPT-01)
  ↓
CurriculumDependencyRegistry (D3-OPT-02)
  ↓
CurriculumProgressionInput (D3-OPT-03)
  ↓
CurriculumProgressionRegistry (D3-OPT-03)
  ↓
CurriculumProgressionTrace (D3-OPT-03)
  ↓
CurriculumArtifactWithProgression (D3-OPT-03)
```

## Integration with D3-OPT-02

This phase integrates with D3-OPT-02 as follows:

- **Consumes**: `CurriculumDependency` and `CurriculumDependencyRegistry` from D3-OPT-02
- **Uses**: Dependency types to resolve progression states
- **Never modifies**: The dependency registry
- **Never inserts**: New dependencies
- **Metadata only**: Progression uses dependency metadata for state resolution

## Public API

### Compose Functions

- `composeProgressionNode(params)` — compose a progression node
- `composeProgressionRegistry(params)` — compose a progression registry
- `composeProgressionTrace(registryId, progressions)` — compose a progression trace
- `composeProgressionProvenance(progression)` — compose progression provenance
- `composeCurriculumProgression(input)` — compose progressions from input
- `composeCurriculumArtifactWithProgression(params)` — compose artifact with progression

### Helper Functions

- `isSupportedProgressionState(state)` — check progression state support
- `isSupportedProgressionGovernanceStatus(status)` — check governance status support
- `getCanonicalProgressionStates()` — return canonical progression states
- `resolveProgressionState(node, dependencies)` — resolve progression state from curriculum metadata

### Validation Functions

- `validateProgressionNode(progression, graphNodeIds)` — validate a progression node
- `validateProgressionRegistry(registry, graphNodeIds)` — validate a registry
- `validateCurriculumArtifactWithProgression(artifact)` — validate an artifact
- `validateProgressionInput(input, graphNodeIds)` — validate input

## Out of Scope

The following capabilities are explicitly out of scope for this phase:

- learner mastery inference
- personalized learning paths
- curriculum modification
- learning execution
- assessment execution
- certification
- goal interpretation
- unlock maps
- redundancy analysis
- progression validation
- graph optimization
- curriculum generation
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
