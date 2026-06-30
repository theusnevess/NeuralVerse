# D2-OPT-02 — Scientific Lineage Orchestration

## Purpose

The Scientific Lineage Orchestration Layer introduces deterministic scientific relationship modeling between research artifacts. It models how ideas evolve from previous ideas through governed metadata only.

This layer does NOT build timelines, retrieve literature, or infer relationships. It only organizes governed scientific lineage metadata.

## Architecture

### Core Components

| Component | Purpose |
|-----------|---------|
| `ResearchAgentContract.ts` | Extended with lineage types |
| `LineageKernel.ts` | Lineage orchestration functions |
| `LineageValidation.ts` | Deterministic validation |
| `index.ts` | Public API exports |

### Canonical Principle

Scientific lineage represents knowledge evolution. It does not represent chronological order or publication dates. It models how ideas evolve from previous ideas.

Every relationship must originate from governed metadata. No inferred lineage is allowed.

## DAG Model

The lineage graph is a deterministic Directed Acyclic Graph (DAG).

### Properties

- **Directed**: Edges have direction (source → target)
- **Acyclic**: No cycles allowed in the graph
- **Immutable**: Graph cannot be modified after composition

### Graph Components

- **Nodes**: Governed research artifacts
- **Edges**: Governed scientific relationships

## Relation Semantics

### Canonical Relation Types

| Relation | Description |
|----------|-------------|
| `predecessor` | Target preceded source |
| `successor` | Target succeeded source |
| `derived_from` | Target is derived from source |
| `refines` | Target refines source |
| `extends` | Target extends source |
| `supersedes` | Target supersedes source |
| `inspired_by` | Target was inspired by source |
| `parallel_to` | Target is parallel to source |

### Relation Rules

- All relations are explicit, never inferred
- Unknown relations fail validation
- Relations require provenance
- Relations cannot be self-referential

## Provenance Requirements

Every lineage edge must expose provenance:

```typescript
interface ResearchLineageProvenance {
  sourceReferenceId: string;
  targetReferenceId: string;
  relationType: ResearchLineageRelationType;
  governanceStatus: ResearchGovernanceStatus;
  rationale: string;
  providedBy: string;
}
```

Relationships without provenance must fail validation.

## Validation Strategy

### Validation Codes

| Code | Description |
|------|-------------|
| `LINEAGE_UNKNOWN_RELATION` | Unknown relation type |
| `LINEAGE_DUPLICATE_EDGE` | Duplicate edge detected |
| `LINEAGE_SELF_REFERENCE` | Edge references itself |
| `LINEAGE_ORPHAN_NODE` | Node has no edges |
| `LINEAGE_CYCLE_DETECTED` | Cycle detected in graph |
| `LINEAGE_INVALID_DIRECTION` | Invalid edge direction |
| `LINEAGE_MISSING_SOURCE` | Missing source node |
| `LINEAGE_MISSING_TARGET` | Missing target node |
| `LINEAGE_MISSING_PROVENANCE` | Missing provenance |
| `LINEAGE_INVALID_STATUS` | Invalid governance status |

### Graph Integrity Rules

1. **No self-reference**: Edges cannot connect a node to itself
2. **No duplicate edges**: Each edge is unique
3. **No orphan nodes**: Every node must have at least one edge
4. **No cycles**: Graph must be acyclic
5. **No unsupported relation types**: Only canonical relations allowed

### Cycle Detection

Uses deterministic DFS (Depth-First Search) algorithm:

1. Build adjacency list from nodes and edges
2. Visit all nodes in deterministic order
3. Track visited nodes and recursion stack
4. Detect back edges (edges to nodes in current recursion stack)

## Deterministic Guarantees

1. **Reproducibility**: Identical inputs → identical outputs
2. **No random**: `Math.random` not used anywhere
3. **No time**: `Date.now` not used for ordering or ID generation
4. **No mutation**: Input objects are never modified
5. **No fabrication**: Missing data produces validation errors
6. **Traceable**: Every artifact includes deterministic trace metadata

## Integration with Evidence Kernel

The Lineage Kernel integrates with the D2-OPT-01 Evidence Kernel:

- Every lineage node references canonical evidence
- Lineage never exists independently
- Lineage decisions expose evidence validation status

## Out-of-Scope Items

This phase does NOT implement:

- Timeline visualization
- Publication chronology
- Citation counts
- Paper retrieval
- Paper parsing
- Comparison engine
- Benchmark mapping
- Dataset mapping
- Reading paths
- Laboratory integration
- Educational summaries
- LLM calls
- Web search

## Runtime Limitations

- No network access
- No filesystem access
- No external libraries
- No browser APIs
- No LLM calls
- No paper parsing
- No web search
- No API calls

## Expected Deliverables

### Files Created

| File | Purpose |
|------|---------|
| `LineageKernel.ts` | Lineage orchestration functions |
| `LineageValidation.ts` | Deterministic validation |
| `LineageKernel.test.ts` | Test suite |
| `d2-opt-02-scientific-lineage-orchestration.md` | This documentation |

### Files Modified

| File | Purpose |
|------|---------|
| `ResearchAgentContract.ts` | Extended with lineage types |
| `index.ts` | Extended with lineage exports |

### Contract Extensions

- `ResearchLineageRelationType` — canonical relation type enum
- `ResearchLineageNode` — lineage node structure
- `ResearchLineageEdge` — lineage edge structure
- `ResearchLineageGraph` — lineage graph structure
- `ResearchLineageDecision` — lineage decision structure
- `ResearchLineageTrace` — lineage trace structure
- `ResearchLineageInput` — input data structure
- `ResearchArtifactWithLineage` — artifact with lineage structure
- `ResearchLineageValidationResult` — validation result structure
- `ResearchLineageProvenance` — provenance structure

### Graph Validation

- `validateLineageNode()` — validates a single node
- `validateLineageEdge()` — validates a single edge
- `validateLineageGraph()` — validates a complete graph
- `validateResearchArtifactWithLineage()` — validates artifact
- `validateLineageInput()` — validates input data

### Cycle Detection Strategy

Uses deterministic DFS with:

- Adjacency list construction
- Visited node tracking
- Recursion stack tracking
- Back edge detection

### Tests Created

- Valid lineage graph
- Valid predecessor
- Valid successor
- Valid derived_from
- Valid refines
- Duplicate edge
- Self reference
- Cycle detection
- Orphan node
- Unsupported relation
- Missing provenance
- Deterministic output
- Immutable input
- No generated content
- No inferred relationships
- Identical output for identical input

## Phase Status

**APPROVED_FOR_HUB_REVIEW** — All code-level audits pass. Runtime tests blocked by environment only.
