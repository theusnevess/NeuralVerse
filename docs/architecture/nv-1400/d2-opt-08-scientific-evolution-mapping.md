# D2-OPT-08 — Scientific Evolution Mapping Orchestration

## Purpose

The Scientific Evolution Mapping Layer models how scientific ideas evolve across time. It represents evolutionary relationships between concepts, methods, datasets, benchmarks, and research milestones. It provides deterministic evolution metadata orchestration without inferring evolution, predicting future trends, or generating content.

## Architecture

The Scientific Evolution Mapping Layer extends the Research Pipeline Kernel with evolution-specific types and functions. It follows the same deterministic, immutable, and governed patterns established by the Evidence Kernel, Lineage Orchestration, Comparison Engine, Timeline Orchestration, Benchmark Intelligence, Dataset Mapping Orchestration, and Industry Adoption Intelligence.

### Core Principles

1. **Scientific evolution is a governed graph** — Every relationship must originate from governed metadata.
2. **Not generated** — Evolution metadata is provided, not inferred.
3. **Not predictive** — Evolution metadata does not predict future trends.
4. **Deterministic cycle detection** — Cycles are detected using deterministic DFS.

## Evolution Graph

The Evolution Graph is a deterministic, immutable, and governed directed graph of scientific evolution.

### Properties

- **Immutable** — Graph contents cannot be modified after composition.
- **Deterministic ordering** — Nodes and edges are sorted for consistent ordering.
- **Evidence-backed** — Each edge references scientific evidence.
- **Provenance-governed** — Each edge has provenance and governance status.
- **Acyclic** — The graph must not contain cycles.

### Composition

The graph is composed using `composeEvolutionGraph()`:

```typescript
const graph = composeEvolutionGraph('graph-001', [node1, node2], [edge1]);
```

## Canonical Relations

The system supports exactly 12 canonical evolution relation types:

| Relation Type | Description |
|---------------|-------------|
| `introduced` | New concept/method introduced |
| `extended` | Existing concept/method extended |
| `refined` | Existing concept/method refined |
| `generalized` | Concept/method generalized |
| `specialized` | Concept/method specialized |
| `superseded` | Concept/method superseded |
| `replaced` | Concept/method replaced |
| `merged_into` | Concept/method merged into another |
| `split_from` | Concept/method split from another |
| `inspired` | Concept/method inspired by another |
| `standardized` | Concept/method standardized |
| `deprecated` | Concept/method deprecated |

Unknown relation types fail validation with `EVOLUTION_UNKNOWN_RELATION`.

## Canonical Node Types

The system supports exactly 6 canonical evolution node types:

| Node Type | Description |
|-----------|-------------|
| `method` | Research method |
| `concept` | Research concept |
| `benchmark` | Research benchmark |
| `dataset` | Research dataset |
| `milestone` | Research milestone |
| `publication` | Research publication |

Unknown node types fail validation with `EVOLUTION_INVALID_REFERENCE`.

## Provenance Requirements

Every evolution edge must expose provenance with the following fields:

| Field | Type | Required |
|-------|------|----------|
| `edgeId` | string | Yes |
| `referenceId` | string | Yes |
| `source` | string | Yes |
| `governanceStatus` | ResearchGovernanceStatus | Yes |
| `relationType` | ResearchEvolutionRelationType | Yes |
| `rationale` | string | Yes |
| `providedBy` | string | Yes |

Edges without provenance fail validation with `EVOLUTION_MISSING_PROVENANCE`.

## Deterministic Cycle Detection

The system implements deterministic cycle detection using DFS (Depth-First Search).

### Algorithm

1. Build adjacency list from nodes and edges
2. Sort nodes and edges deterministically
3. Use three-color marking (WHITE, GRAY, BLACK)
4. Traverse nodes in sorted order
5. Detect back edges (GRAY nodes)

### Properties

- **Deterministic** — Traversal order is always identical for identical input
- **No randomized traversal** — Uses sorted node IDs
- **Cycles fail validation** — Graphs with cycles are invalid

### Implementation

```typescript
const hasCycles = detectEvolutionCycles(nodes, edges);
if (hasCycles) {
  // Graph is invalid
}
```

## Validation Strategy

The validation layer returns structured errors, never exceptions for expected validation failures.

### Validation Codes

| Code | Description |
|------|-------------|
| `EVOLUTION_UNKNOWN_RELATION` | Unknown evolution relation type |
| `EVOLUTION_DUPLICATE_NODE` | Duplicate node ID |
| `EVOLUTION_DUPLICATE_EDGE` | Duplicate edge ID |
| `EVOLUTION_SELF_REFERENCE` | Edge has self-reference |
| `EVOLUTION_CYCLE_DETECTED` | Graph contains a cycle |
| `EVOLUTION_ORPHAN_NODE` | Node has no edges |
| `EVOLUTION_INVALID_REFERENCE` | Edge references non-existent node |
| `EVOLUTION_MISSING_PROVENANCE` | Missing provenance |
| `EVOLUTION_EMPTY_GRAPH` | Empty graph |
| `EVOLUTION_EMPTY_REGISTRY` | Empty registry |
| `EVOLUTION_MISSING_SOURCE` | Missing source/ID |
| `EVOLUTION_INVALID_STATUS` | Invalid governance status |

### Validation Functions

- `validateEvolutionNode()` — Validates a single node
- `validateEvolutionEdge()` — Validates a single edge
- `validateEvolutionGraph()` — Validates a graph
- `validateEvolutionRegistry()` — Validates a registry
- `validateResearchArtifactWithEvolution()` — Validates a complete artifact
- `validateEvolutionInput()` — Validates evolution input

## Deterministic Guarantees

The system guarantees deterministic behavior:

- **No `Math.random`** — No random number generation
- **No `Date.now`** — No time-dependent behavior
- **No `performance.now`** — No performance timing
- **No `new Date()`** — No date construction
- **No UUID generation** — No unique identifier generation
- **No global mutable state** — No shared mutable state

### Trace Metadata

Every trace includes deterministic guarantees:

```typescript
{
  deterministic: true,
  generatedFrom: 'deterministic_evolution_kernel',
  randomUsed: false,
  timeDependency: false,
}
```

## Relationship with Lineage

Evolution consumes metadata from Lineage. Evolution metadata never replaces Lineage metadata. Lineage provides foundational relationships for evolution.

```
ResearchEvolutionEdge
  ↓ referenceId
ResearchLineageEdge
  ↓
ResearchReference
```

## Relationship with Timeline

Evolution consumes metadata from Timeline. Evolution metadata never replaces Timeline metadata. Timeline provides chronological context for evolution.

```
ResearchEvolutionNode
  ↓ referenceId
ResearchTimelineEvent
  ↓
ResearchReference
```

## Relationship with Evidence

Evolution consumes metadata from Evidence. Evolution metadata never replaces Evidence metadata. Evidence provides scientific foundation for evolution.

```
ResearchEvolutionEdge
  ↓ referenceId
ResearchEvidence
  ↓
ResearchReference
```

## Relationship with Benchmark

Evolution can reference Benchmarks through node types. Evolution metadata never replaces Benchmark metadata. Benchmarks provide evaluation context for evolution.

```
ResearchEvolutionNode (nodeType: 'benchmark')
  ↓ referenceId
ResearchBenchmark
  ↓
ResearchEvidence
```

## Relationship with Dataset

Evolution can reference Datasets through node types. Evolution metadata never replaces Dataset metadata. Datasets provide data context for evolution.

```
ResearchEvolutionNode (nodeType: 'dataset')
  ↓ referenceId
ResearchDataset
  ↓
ResearchEvidence
```

## Relationship with Industry

Evolution can reference Industry adoption through node types. Evolution metadata never replaces Industry metadata. Industry provides adoption context for evolution.

```
ResearchEvolutionNode
  ↓ referenceId
ResearchIndustryReference
  ↓
ResearchEvidence
```

## Out-of-Scope Items

This phase MUST NOT implement:

- **Trend prediction** — No prediction of future trends
- **Future forecasting** — No forecasting of future work
- **Citation recommendation** — No recommendation of papers
- **Paper recommendation** — No recommendation of publications
- **Research summarization** — No summarization of research
- **Automatic evolution inference** — No automatic inference of relationships
- **Graph analytics** — No calculation of graph metrics
- **Clustering** — No clustering of nodes
- **Centrality algorithms** — No centrality calculations
- **Graph visualization** — No visualization generation
- **LLM reasoning** — No language model inference

## Runtime Limitations

- No browser APIs
- No filesystem access
- No network requests
- No external service calls
- No hidden state
- No side effects

## Public API

### Types

- `ResearchEvolutionRelationType`
- `ResearchEvolutionNodeType`
- `ResearchEvolutionNode`
- `ResearchEvolutionEdge`
- `ResearchEvolutionGraph`
- `ResearchEvolutionDecision`
- `ResearchEvolutionTrace`
- `ResearchEvolutionRegistry`
- `ResearchEvolutionInput`
- `ResearchArtifactWithEvolution`
- `ResearchEvolutionValidationResult`
- `ResearchEvolutionValidationError`
- `ResearchEvolutionProvenance`
- `ResearchEvolutionStatus`

### Functions

- `composeEvolutionNode()`
- `composeEvolutionEdge()`
- `composeEvolutionProvenance()`
- `composeEvolutionGraph()`
- `composeEvolutionRegistry()`
- `composeResearchEvolution()`
- `composeEvolutionTrace()`
- `detectEvolutionCycles()`
- `isSupportedEvolutionRelationType()`
- `isSupportedEvolutionNodeType()`
- `getCanonicalEvolutionRelationTypes()`
- `getCanonicalEvolutionNodeTypes()`

### Validation

- `EVOLUTION_VALIDATION_CODES`
- `validateEvolutionNode()`
- `validateEvolutionEdge()`
- `validateEvolutionGraph()`
- `validateEvolutionRegistry()`
- `validateResearchArtifactWithEvolution()`
- `validateEvolutionInput()`
