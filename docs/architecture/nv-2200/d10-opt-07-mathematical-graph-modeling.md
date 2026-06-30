# D10-OPT-07 — Mathematical Graph Modeling

## Purpose

This phase defines the canonical metadata architecture for mathematical graph modeling inside the Knowledge Agent. It introduces the canonical structures required to represent mathematical relationships associated with canonical concepts, including function graphs, coordinate systems, mathematical curves, geometric interpretations, graph parameters, visualization metadata, and graph relationships. This optimization does not generate graphs — it only defines the immutable metadata model used later by visualization, didactic, and rendering pipelines.

## Motivation

The Knowledge Agent requires a structured way to represent that concepts can be communicated through mathematical graphs. A concept may need:

- Function graphs to visualize mathematical relationships
- Coordinate planes to show spatial relationships
- Parametric curves to represent dynamic relationships
- Polar graphs for circular coordinate systems
- Implicit curves for complex mathematical relationships
- Surface references for 3D visualizations
- Vector field references for directional data
- Probability distributions for statistical concepts
- Optimization landscapes for learning dynamics
- Geometric visualizations for spatial concepts

These graphs are organized by type, objective, and coordinate system. The graph layer models this structure without generating content.

## Architecture

```
KnowledgeAgentContract.ts        — Canonical enums and contracts
KnowledgeGraphKernel.ts          — Deterministic composition functions
KnowledgeGraphValidation.ts      — Structured validation (never throws)
KnowledgeGraphKernel.test.ts     — Comprehensive test suite
index.ts                         — Public API surface
```

## Canonical Enums

### Graph Types (10 values)

```typescript
CANONICAL_GRAPH_TYPES = [
  'function_graph', 'coordinate_plane', 'parametric_curve',
  'polar_graph', 'implicit_curve', 'surface_reference',
  'vector_field_reference', 'probability_distribution',
  'optimization_landscape', 'geometric_visualization'
]
```

### Graph Objectives (10 values)

```typescript
CANONICAL_GRAPH_OBJECTIVES = [
  'visualize', 'formalize', 'derive', 'compare', 'analyze',
  'demonstrate', 'interpret', 'connect', 'explore', 'reference'
]
```

### Coordinate Systems (10 values)

```typescript
CANONICAL_COORDINATE_SYSTEMS = [
  'cartesian_2d', 'cartesian_3d', 'polar', 'cylindrical',
  'spherical', 'parametric', 'complex_plane',
  'probability_space', 'feature_space', 'abstract_space'
]
```

### Graph Status (6 values)

```typescript
CANONICAL_GRAPH_STATUS = [
  'draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'
]
```

### Graph Visibility (10 values)

```typescript
CANONICAL_GRAPH_VISIBILITY = [
  'always', 'default', 'advanced', 'expert', 'curriculum',
  'assessment', 'laboratory', 'research', 'internal', 'hidden'
]
```

### Graph Governance (10 values)

```typescript
CANONICAL_GRAPH_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental', 'deprecated',
  'restricted', 'internal', 'public', 'community', 'archived'
]
```

## Contracts

### KnowledgeGraphProvenance

Canonical provenance metadata for graph profiles.

```typescript
interface KnowledgeGraphProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: MathGraphGovernance;
}
```

### KnowledgeGraphDecision

Governance decision metadata for graphs.

```typescript
interface KnowledgeGraphDecision {
  readonly decisionId: string;
  readonly graphId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeGraphTrace

Deterministic trace metadata for graph composition.

```typescript
interface KnowledgeGraphTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeGraphDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_math_graph_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeGraphProfile

Represents one mathematical graph for a governed concept.

```typescript
interface KnowledgeGraphProfile {
  readonly graphId: string;
  readonly title: string;
  readonly conceptId: string;
  readonly graphType: MathGraphType;
  readonly objective: MathGraphObjective;
  readonly coordinateSystem: CoordinateSystem;
  readonly mathematicalExpressionRef: string;
  readonly domainReference: string;
  readonly rangeReference: string;
  readonly visualizationParameters: readonly string[];
  readonly visibility: MathGraphVisibility;
  readonly status: MathGraphStatus;
  readonly governance: MathGraphGovernance;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeGraphProvenance;
}
```

### KnowledgeGraphRelationship

Links graphs belonging to related visualizations.

```typescript
interface KnowledgeGraphRelationship {
  readonly relationshipId: string;
  readonly sourceGraphId: string;
  readonly targetGraphId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeGraphProvenance;
}
```

### KnowledgeGraphRegistryMetadata

```typescript
interface KnowledgeGraphRegistryMetadata {
  readonly registryId: string;
  readonly graphCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly typeCount: number;
}
```

### KnowledgeGraphRegistry

Immutable registry of graph profiles and relationships.

```typescript
interface KnowledgeGraphRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeGraphProfile[];
  readonly relationships: readonly KnowledgeGraphRelationship[];
  readonly metadata: KnowledgeGraphRegistryMetadata;
  readonly trace: KnowledgeGraphTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_math_graph_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeGraphInput

Canonical input structure for composition.

```typescript
interface KnowledgeGraphInput {
  readonly profiles: readonly KnowledgeGraphProfile[];
  readonly relationships: readonly KnowledgeGraphRelationship[];
}
```

### KnowledgeArtifactWithGraphs

Associates canonical concepts with mathematical graph metadata.

```typescript
interface KnowledgeArtifactWithGraphs {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeGraphProfile[];
  readonly relationships: readonly KnowledgeGraphRelationship[];
  readonly provenance: KnowledgeGraphProvenance;
}
```

## Registry

The registry is an immutable, deterministically ordered collection of graph profiles and relationships. It enforces:

- **Stable ordering** — profiles sorted by conceptId, then graphType, then coordinateSystem, then graphId
- **Deterministic metadata** — counts computed from sorted profiles
- **Trace completeness** — every composition produces a trace with decisions
- **Relationship integrity** — relationships reference valid profiles

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeGraphProvenance()` | Creates KnowledgeGraphProvenance |
| `composeKnowledgeGraphTrace()` | Creates KnowledgeGraphTrace |
| `composeKnowledgeGraphProfile()` | Creates KnowledgeGraphProfile |
| `composeKnowledgeGraphRelationship()` | Creates KnowledgeGraphRelationship |
| `composeKnowledgeGraphRegistry()` | Creates KnowledgeGraphRegistry |
| `composeKnowledgeGraphRegistryFromInput()` | Creates registry from input |
| `composeKnowledgeGraphs()` | Creates complete registry with trace |
| `composeKnowledgeArtifactWithGraphs()` | Creates artifact with graphs |

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeGraphProfile()` | Validates a single profile |
| `validateKnowledgeGraphRelationship()` | Validates a relationship |
| `validateKnowledgeGraphRegistry()` | Validates a complete registry |
| `validateKnowledgeGraphInput()` | Validates input before composition |
| `validateKnowledgeGraphTrace()` | Validates trace integrity |
| `validateKnowledgeArtifactWithGraphs()` | Validates artifact association |

### Validation Codes (exactly 20, prefix GRAPH_)

| Code | Description |
|------|-------------|
| `GRAPH_DUPLICATE_ID` | Duplicate profile ID in registry |
| `GRAPH_DUPLICATE_TITLE` | Duplicate profile title in registry |
| `GRAPH_INVALID_TYPE` | Unsupported graph type |
| `GRAPH_INVALID_OBJECTIVE` | Unsupported graph objective |
| `GRAPH_INVALID_COORDINATE_SYSTEM` | Unsupported coordinate system |
| `GRAPH_INVALID_VISIBILITY` | Unsupported visibility level |
| `GRAPH_INVALID_STATUS` | Unsupported graph status |
| `GRAPH_INVALID_GOVERNANCE` | Unsupported governance value |
| `GRAPH_MISSING_PROVENANCE` | Profile missing provenance |
| `GRAPH_MISSING_PROVIDER` | Provenance missing provider |
| `GRAPH_MISSING_RATIONALE` | Provenance missing rationale |
| `GRAPH_MISSING_CONCEPT_REFERENCE` | Profile missing concept reference |
| `GRAPH_MISSING_PROFILE_ID` | Profile missing profile ID |
| `GRAPH_MISSING_TITLE` | Profile missing title |
| `GRAPH_SELF_RELATIONSHIP` | Relationship references itself |
| `GRAPH_EMPTY_REGISTRY` | Registry has no profiles |
| `GRAPH_INVALID_TRACE` | Trace has invalid properties |
| `GRAPH_REGISTRY_INCONSISTENCY` | Metadata count mismatch |
| `GRAPH_INVALID_CONFIGURATION` | Invalid relationship configuration |
| `GRAPH_INVALID_ORDER` | Invalid profile ordering |

## Determinism

All compose functions satisfy 100-iteration identity tests:

- **Stable serialization** — JSON.stringify produces identical output
- **Stable ordering** — profiles are always sorted identically
- **Stable registries** — registryId, metadata, and trace are deterministic

## Immutability

All contracts use `readonly` modifiers:

- **No mutation** — inputs are never modified
- **Defensive copies** — arrays are spread into new arrays
- **Readonly output** — compose functions return readonly structures

## Governance

The Graph Layer operates under strict governance:

- Canonical enums are fixed and must never change
- Validation codes are stable and must never change
- Contracts are immutable and must never change
- Compose functions are pure and must remain deterministic

## Public API

Everything is exported through `index.ts`:

- **Contracts** — types and constants
- **Kernel** — compose functions and helpers
- **Validation** — validators and codes

## Runtime Restrictions

The following are forbidden in all kernel modules:

- `Math.random`, `Date.now`, `new Date`, `performance.now`
- `crypto.randomUUID`, `Promise`, `async`, `await`
- `fetch`, `filesystem`, `network`, `database`, `process.env`
- Graph generation, plot generation
- SVG generation, canvas rendering
- WebGL, coordinate computation
- Symbolic mathematics, CAS integration
- Graph rendering, LLM invocation

## Cross-Agent Boundaries

Production code must NOT reference:

- Didactic Agent, Curriculum Agent, Narrative Agent
- Assessment Agent, Curiosity Agent, Research Agent
- Laboratory Agent, Application Agent

No imports, no references, no mutations from these agents.

## Out of Scope

This phase does NOT implement:

- Graph content generation
- Plot generation
- SVG generation
- Canvas rendering
- WebGL rendering
- Coordinate computation
- Symbolic mathematics
- CAS integration
- Graph rendering
- LLM-based content creation

## Relationship with D10-OPT-01

This phase extends the canonical foundation established in D10-OPT-01:

- **D10-OPT-01** — Knowledge Contract & Concept Registry Kernel (canonical concepts)
- **D10-OPT-07** — Mathematical Graph Modeling (graph metadata)

Each graph profile references a concept ID from the canonical concept registry.

## Relationship with D10-OPT-02

This phase complements the explanation layer established in D10-OPT-02:

- **D10-OPT-02** — Multi-Level Explanation Modeling (explanation metadata)
- **D10-OPT-07** — Mathematical Graph Modeling (graph metadata)

Explanations represent how a concept is presented at different depths, while graphs provide mathematical visualization of the concept.

## Relationship with D10-OPT-03

This phase complements the component layer established in D10-OPT-03:

- **D10-OPT-03** — Concept Structure, Canonical Components (component metadata)
- **D10-OPT-07** — Mathematical Graph Modeling (graph metadata)

Components represent the internal structure of a concept, while graphs provide mathematical visualization of that structure.

## Relationship with D10-OPT-04

This phase complements the representation layer established in D10-OPT-04:

- **D10-OPT-04** — Multimodal Representation Modeling (representation metadata)
- **D10-OPT-07** — Mathematical Graph Modeling (graph metadata)

Representations define the modality through which a concept is communicated, while graphs provide a specific mathematical modality.

## Relationship with D10-OPT-05

This phase complements the example layer established in D10-OPT-05:

- **D10-OPT-05** — Progressive Examples Modeling (example metadata)
- **D10-OPT-07** — Mathematical Graph Modeling (graph metadata)

Examples provide concrete instances of a concept, while graphs provide mathematical visualization of those instances.

## Relationship with D10-OPT-06

This phase complements the comparison layer established in D10-OPT-06:

- **D10-OPT-06** — Comparative Knowledge Modeling (comparison metadata)
- **D10-OPT-07** — Mathematical Graph Modeling (graph metadata)

Comparisons define how concepts relate to each other, while graphs provide mathematical visualization of those relationships.
