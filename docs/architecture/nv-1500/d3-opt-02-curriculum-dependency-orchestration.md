# D3-OPT-02 — Curriculum Dependency Orchestration

## Purpose

This phase implements the **deterministic dependency orchestration layer** for the Curriculum Agent (D3). It extends the D3-OPT-01 Curriculum Graph Kernel with dependency metadata representation, validation, cycle detection, and trace composition.

This phase does **not** implement:

- prerequisite inference
- competency progression
- learning path composition
- curriculum modification
- personalization
- certification
- goal interpretation

Those belong to later D3 phases.

## Architectural Boundaries

The Dependency Orchestration layer follows the same architectural patterns established by D3-OPT-01:

- **Single monolithic contract file** (`CurriculumAgentContract.ts`) extended with dependency types
- **Pure deterministic kernel** (`DependencyKernel.ts`) with compose functions
- **Validation layer** (`DependencyValidation.ts`) returning structured errors
- **Barrel exports** (`index.ts`) organizing the public API

### Files

| File | Purpose |
|------|---------|
| `CurriculumAgentContract.ts` | Extended with dependency types (D3-OPT-02) |
| `DependencyKernel.ts` | Deterministic dependency composition functions |
| `DependencyValidation.ts` | Structured dependency validation layer |
| `DependencyKernel.test.ts` | Deterministic test suite |
| `index.ts` | Barrel exports (extended) |

## Dependency Model

A curriculum dependency represents a metadata relationship between two nodes in a curriculum graph. Dependencies are purely declarative — they describe relationships without modifying the graph structure.

### Dependency Properties

| Property | Type | Purpose |
|----------|------|---------|
| `dependencyId` | `string` | Unique identifier |
| `sourceNodeId` | `string` | Source node reference |
| `targetNodeId` | `string` | Target node reference |
| `dependencyType` | `CurriculumDependencyType` | Canonical dependency type |
| `source` | `string` | Source authority |
| `governanceStatus` | `CurriculumGovernanceStatus` | Governance status |
| `rationale` | `string` | Justification |
| `providedBy` | `string` | Providing authority |

## Canonical Dependency Types

The kernel supports exactly 10 canonical dependency types:

| Dependency Type | Purpose |
|-----------------|---------|
| `required` | Mandatory prerequisite |
| `recommended` | Suggested prerequisite |
| `optional_background` | Optional background knowledge |
| `co_requisite` | Must be taken together |
| `parallel` | Can be taken in parallel |
| `review` | Review relationship |
| `reinforcement` | Reinforcement learning |
| `forward_reference` | Forward reference to future content |
| `historical_context` | Historical context dependency |
| `enrichment` | Enrichment material |

## Provenance Model

Every dependency exposes complete provenance:

- `dependencyId` — unique identifier
- `source` — source authority
- `governanceStatus` — canonical | accepted | provisional | deprecated | rejected
- `rationale` — justification for inclusion
- `providedBy` — providing authority

Missing provenance fails validation.

## Deterministic Guarantees

The kernel provides the following deterministic guarantees:

1. **Identical input produces identical output** — no randomness, no time dependency
2. **Deterministic ordering** — dependencies sorted by `sourceNodeId`, then `targetNodeId`, then `dependencyId`
3. **No mutation** — all compose functions return new objects; inputs are never modified
4. **No side effects** — no network access, no filesystem access, no global state
5. **No inference** — the kernel does not infer dependencies, generate content, or model learners

### Forbidden

The kernel never:

- Uses `Math.random`, `Date.now`, `performance.now`, `new Date()`
- Uses `crypto.randomUUID()` or UUID generation
- Accesses network (`fetch`, `axios`, `XMLHttpRequest`, `WebSocket`)
- Accesses browser APIs (`navigator`, `window`, `document`, `localStorage`)
- Accesses filesystem
- Uses `async` or `Promise`
- Generates curriculum content
- Infers prerequisites
- Modifies curriculum graphs
- Creates learning paths
- Models learner mastery

## Cycle Detection Strategy

The kernel implements **deterministic cycle detection** using DFS (Depth-First Search):

1. Build adjacency list from dependencies
2. Sort adjacency lists for deterministic traversal
3. Collect all unique node IDs and sort them
4. Perform DFS with three-color marking (white/gray/black)
5. Detect back edges (gray → gray transitions)

The algorithm guarantees:
- **Deterministic results** — same graph always produces same result
- **Sorted traversal** — nodes visited in deterministic order
- **No randomness** — no stochastic elements in traversal
- **Cycles fail validation** — detected cycles produce validation errors

## Validation Strategy

Validation returns structured errors, never exceptions. Each validator follows the pattern:

```typescript
function validateDependency(
  dependency: CurriculumDependency,
  nodeIds: readonly string[]
): readonly CurriculumDependencyValidationError[]
```

### Validation Codes

| Code | Meaning |
|------|---------|
| `DEPENDENCY_UNKNOWN_TYPE` | Non-canonical dependency type |
| `DEPENDENCY_DUPLICATE_ID` | Duplicate dependency ID |
| `DEPENDENCY_DUPLICATE_RELATION` | Duplicate source+target+type relation |
| `DEPENDENCY_SELF_REFERENCE` | Dependency connects node to itself |
| `DEPENDENCY_INVALID_SOURCE_NODE` | References non-existent source node |
| `DEPENDENCY_INVALID_TARGET_NODE` | References non-existent target node |
| `DEPENDENCY_MISSING_SOURCE` | Missing source field |
| `DEPENDENCY_MISSING_PROVENANCE` | Missing provenance data |
| `DEPENDENCY_EMPTY_REGISTRY` | Registry has no dependencies |
| `DEPENDENCY_INVALID_STATUS` | Invalid governance status |
| `DEPENDENCY_CYCLE_DETECTED` | Cycle detected in dependency graph |
| `DEPENDENCY_ORPHAN_REFERENCE` | Both nodes missing from graph |

## Relationships with D3-OPT-01

This phase integrates with D3-OPT-01 as follows:

- **Consumes**: `CurriculumGraph` and `CurriculumNode` from D3-OPT-01
- **Extends**: `CurriculumAgentContract.ts` with new dependency types
- **Never modifies**: The curriculum graph structure
- **Never inserts**: New nodes or edges
- **Never rewrites**: Existing relationships
- **Metadata only**: Dependency orchestration is metadata layered on top of the graph

### Integration Pattern

```
CurriculumGraph (D3-OPT-01)
  ↓
CurriculumDependencyInput (D3-OPT-02)
  ↓
CurriculumDependencyRegistry (D3-OPT-02)
  ↓
CurriculumDependencyTrace (D3-OPT-02)
  ↓
CurriculumArtifactWithDependencies (D3-OPT-02)
```

## Public API

### Compose Functions

- `composeDependency(params)` — compose a dependency
- `composeDependencyRegistry(params)` — compose a dependency registry
- `composeDependencyTrace(registryId, dependencies)` — compose a dependency trace
- `composeDependencyProvenance(dependency)` — compose dependency provenance
- `composeCurriculumDependencies(input)` — compose dependencies from input
- `composeCurriculumArtifactWithDependencies(params)` — compose artifact with dependencies

### Helper Functions

- `isSupportedDependencyType(dependencyType)` — check dependency type support
- `isSupportedDependencyGovernanceStatus(status)` — check governance status support
- `getCanonicalDependencyTypes()` — return canonical dependency types
- `detectDependencyCycle(dependencies)` — detect cycles in dependency graph

### Validation Functions

- `validateDependency(dependency, nodeIds)` — validate a dependency
- `validateDependencyRegistry(registry, graphNodeIds)` — validate a registry
- `validateCurriculumArtifactWithDependencies(artifact)` — validate an artifact
- `validateDependencyInput(input, graphNodeIds)` — validate input

## Out of Scope

The following capabilities are explicitly out of scope for this phase:

- prerequisite inference
- competency progression
- learning path composition
- curriculum modification
- personalization
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
