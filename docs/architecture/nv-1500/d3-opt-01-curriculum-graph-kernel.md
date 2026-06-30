# D3-OPT-01 — Curriculum Graph Kernel

## Purpose

This phase establishes the **canonical Curriculum Graph Kernel** for the Curriculum & Dependency Agent (D3). It provides the deterministic structural foundation that every later curriculum capability will use.

This phase does **not** implement:

- dependency reasoning
- prerequisite validation
- competency coverage
- redundancy detection
- progression validation
- certification
- goal interpretation

Those belong to later D3 phases.

## Architecture

The Curriculum Graph Kernel follows the same architectural patterns established by the Didactic Pipeline (D1) and Research Pipeline (D2):

- **Single monolithic contract file** (`CurriculumAgentContract.ts`) defining all types
- **Pure deterministic kernel** (`CurriculumGraphKernel.ts`) with compose functions
- **Validation layer** (`CurriculumGraphValidation.ts`) returning structured errors
- **Barrel exports** (`index.ts`) organizing the public API

### Files

| File | Purpose |
|------|---------|
| `CurriculumAgentContract.ts` | Domain types and constants |
| `CurriculumGraphKernel.ts` | Deterministic composition functions |
| `CurriculumGraphValidation.ts` | Structured validation layer |
| `CurriculumGraphKernel.test.ts` | Deterministic test suite |
| `index.ts` | Barrel exports |

## Canonical Node Model

The kernel supports exactly 10 canonical node types:

| Node Type | Purpose |
|-----------|---------|
| `learning_path` | Top-level curriculum path |
| `module` | Thematic grouping of lessons |
| `lesson` | Individual instructional unit |
| `concept` | Knowledge concept |
| `competency` | Demonstrable skill |
| `assessment` | Evaluation checkpoint |
| `laboratory` | Hands-on exercise |
| `review` | Review or recap |
| `milestone` | Progress checkpoint |
| `capstone` | Culminating project |

## Canonical Relationship Model

The kernel supports exactly 10 canonical relationship types:

| Relationship | Purpose |
|--------------|---------|
| `contains` | Structural containment |
| `depends_on` | Dependency relationship |
| `requires` | Prerequisite requirement |
| `introduces` | Concept introduction |
| `reinforces` | Reinforcement learning |
| `assesses` | Assessment relationship |
| `applies` | Application relationship |
| `reviews` | Review relationship |
| `precedes` | Sequential ordering |
| `maps_to` | Cross-reference mapping |

## Provenance

Every node exposes complete provenance:

- `nodeId` — unique identifier
- `referenceId` — governance reference
- `source` — source authority
- `governanceStatus` — canonical | accepted | provisional | deprecated | rejected
- `nodeType` — canonical node type
- `rationale` — justification for inclusion
- `providedBy` — providing authority

Every edge exposes complete provenance:

- `edgeId` — unique identifier
- `referenceId` — governance reference
- `relationshipType` — canonical relationship type
- `source` — source authority
- `governanceStatus` — governance status
- `rationale` — justification
- `providedBy` — providing authority

## Deterministic Guarantees

The kernel provides the following deterministic guarantees:

1. **Identical input produces identical output** — no randomness, no time dependency
2. **Deterministic ordering** — nodes sorted by `nodeId`, edges by `edgeId`, graphs by `graphId`
3. **No mutation** — all compose functions return new objects; inputs are never modified
4. **No side effects** — no network access, no filesystem access, no global state
5. **No inference** — the kernel does not infer relationships, generate content, or model learners

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
- Mutates curriculum data

## Validation Strategy

Validation returns structured errors, never exceptions. Each validator follows the pattern:

```typescript
function validateCurriculumNode(node: CurriculumNode): readonly CurriculumGraphValidationError[]
```

### Validation Codes

| Code | Meaning |
|------|---------|
| `CURRICULUM_UNKNOWN_NODE_TYPE` | Non-canonical node type |
| `CURRICULUM_UNKNOWN_RELATIONSHIP` | Non-canonical relationship type |
| `CURRICULUM_DUPLICATE_NODE` | Duplicate node ID |
| `CURRICULUM_DUPLICATE_EDGE` | Duplicate edge ID |
| `CURRICULUM_SELF_REFERENCE` | Edge connects node to itself |
| `CURRICULUM_INVALID_REFERENCE` | Edge references non-existent node |
| `CURRICULUM_MISSING_SOURCE` | Missing source field |
| `CURRICULUM_MISSING_PROVENANCE` | Missing provenance data |
| `CURRICULUM_EMPTY_GRAPH` | Graph has no nodes |
| `CURRICULUM_EMPTY_REGISTRY` | Registry has no graphs |
| `CURRICULUM_INVALID_STATUS` | Invalid governance status |

## Architectural Boundaries

This phase establishes **only** the canonical curriculum graph representation. It does not implement:

- dependency reasoning
- prerequisite logic
- competency coverage
- goal interpretation
- unlock maps
- redundancy analysis
- certification
- progression validation
- cycle detection
- graph optimization

## Public API

### Compose Functions

- `composeCurriculumNode(params)` — compose a node
- `composeCurriculumEdge(params)` — compose an edge
- `composeCurriculumProvenance(node)` — compose provenance from node
- `composeNodeProvenance(node)` — compose node provenance
- `composeEdgeProvenance(edge)` — compose edge provenance
- `composeCurriculumGraph(input)` — compose a graph
- `composeCurriculumTrace(graphId, nodes, edges)` — compose a trace
- `composeCurriculumRegistry(registryId, graphs)` — compose a registry
- `composeCurriculumArtifact(artifactId, graph, trace, validation)` — compose an artifact

### Helper Functions

- `isSupportedNodeType(nodeType)` — check node type support
- `isSupportedRelationshipType(relationshipType)` — check relationship type support
- `isSupportedGovernanceStatus(status)` — check governance status support
- `getCanonicalNodeTypes()` — return canonical node types
- `getCanonicalRelationshipTypes()` — return canonical relationship types
- `getCanonicalGovernanceStatuses()` — return canonical governance statuses

### Validation Functions

- `validateCurriculumNode(node)` — validate a node
- `validateCurriculumEdge(edge, nodeIds)` — validate an edge
- `validateCurriculumGraph(graph)` — validate a graph
- `validateCurriculumRegistry(registry)` — validate a registry
- `validateCurriculumArtifact(artifact)` — validate an artifact
- `validateCurriculumInput(input)` — validate input

## Out of Scope

The following capabilities are explicitly out of scope for this phase:

- dependency reasoning
- prerequisite logic
- competency coverage
- goal interpretation
- unlock maps
- redundancy analysis
- certification
- progression validation
- cycle detection
- graph optimization
- curriculum generation
- learner modeling
- personalization
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
