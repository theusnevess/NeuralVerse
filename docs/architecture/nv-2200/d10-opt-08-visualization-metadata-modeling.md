# D10-OPT-08 — Visualization Metadata

## Purpose

This phase defines the canonical Visualization Metadata Layer for the Knowledge Agent. It defines metadata describing how a visualization should be interpreted, not how it is rendered. This module does not generate charts, figures, SVG, Canvas, WebGL, animations, images, diagrams, plots, or mathematical visualizations. It exists exclusively to model the metadata required for future visualization systems.

## Motivation

The Knowledge Agent requires a structured way to represent that concepts can be communicated through visualizations. A concept may need:

- Concept diagrams to introduce core ideas
- Process flows to clarify workflows
- Architecture overviews to show system structure
- Knowledge graphs to show relationships
- Timeline to show historical progression
- Comparison matrices to contrast alternatives
- Decision trees to guide choices
- Pipeline overviews to show processes
- Hierarchies to show structure
- System maps to show connections

These visualizations are organized by type, objective, and complexity. The visualization layer models this structure without generating content.

## Architecture

```
KnowledgeAgentContract.ts            — Canonical enums and contracts
KnowledgeVisualizationKernel.ts      — Deterministic composition functions
KnowledgeVisualizationValidation.ts  — Structured validation (never throws)
KnowledgeVisualizationKernel.test.ts — Comprehensive test suite
index.ts                             — Public API surface
```

## Canonical Enums

### Visualization Types (10 values)

```typescript
CANONICAL_VISUALIZATION_TYPES = [
  'concept_diagram', 'process_flow', 'architecture_overview',
  'knowledge_graph', 'timeline', 'comparison_matrix',
  'decision_tree', 'pipeline_overview', 'hierarchy', 'system_map'
]
```

### Visualization Objectives (10 values)

```typescript
CANONICAL_VISUALIZATION_OBJECTIVES = [
  'introduce', 'clarify', 'summarize', 'compare', 'organize',
  'connect', 'visualize', 'navigate', 'analyze', 'reference'
]
```

### Visualization Complexity (10 values)

```typescript
CANONICAL_VISUALIZATION_COMPLEXITY = [
  'minimal', 'simple', 'standard', 'intermediate', 'advanced',
  'expert', 'engineering', 'research', 'reference', 'canonical'
]
```

### Visualization Status (6 values)

```typescript
CANONICAL_VISUALIZATION_STATUS = [
  'draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'
]
```

### Visualization Visibility (10 values)

```typescript
CANONICAL_VISUALIZATION_VISIBILITY = [
  'always', 'default', 'advanced', 'expert', 'curriculum',
  'assessment', 'laboratory', 'research', 'internal', 'hidden'
]
```

### Visualization Governance (10 values)

```typescript
CANONICAL_VISUALIZATION_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental', 'deprecated',
  'restricted', 'internal', 'public', 'community', 'archived'
]
```

## Contracts

### KnowledgeVisualizationProvenance

Canonical provenance metadata for visualization profiles.

```typescript
interface KnowledgeVisualizationProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: VisualizationGovernance;
}
```

### KnowledgeVisualizationDecision

Governance decision metadata for visualizations.

```typescript
interface KnowledgeVisualizationDecision {
  readonly decisionId: string;
  readonly visualizationId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeVisualizationTrace

Deterministic trace metadata for visualization composition.

```typescript
interface KnowledgeVisualizationTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeVisualizationDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_visualization_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeVisualizationProfile

Represents one visualization for a governed concept.

```typescript
interface KnowledgeVisualizationProfile {
  readonly visualizationId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly visualizationType: VisualizationType;
  readonly objective: VisualizationObjective;
  readonly complexity: VisualizationComplexity;
  readonly visibility: VisualizationVisibility;
  readonly status: VisualizationStatus;
  readonly governance: VisualizationGovernance;
  readonly orderIndex: number;
  readonly tags: readonly string[];
  readonly resourceReferences: readonly string[];
  readonly provenance: KnowledgeVisualizationProvenance;
}
```

### KnowledgeVisualizationRelationship

Links visualizations belonging to related analyses.

```typescript
interface KnowledgeVisualizationRelationship {
  readonly relationshipId: string;
  readonly sourceVisualizationId: string;
  readonly targetVisualizationId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeVisualizationProvenance;
}
```

### KnowledgeVisualizationRegistryMetadata

```typescript
interface KnowledgeVisualizationRegistryMetadata {
  readonly registryId: string;
  readonly visualizationCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly visualizationTypeCount: number;
}
```

### KnowledgeVisualizationRegistry

Immutable registry of visualization profiles and relationships.

```typescript
interface KnowledgeVisualizationRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeVisualizationProfile[];
  readonly relationships: readonly KnowledgeVisualizationRelationship[];
  readonly metadata: KnowledgeVisualizationRegistryMetadata;
  readonly trace: KnowledgeVisualizationTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_visualization_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeVisualizationInput

Canonical input structure for composition.

```typescript
interface KnowledgeVisualizationInput {
  readonly profiles: readonly KnowledgeVisualizationProfile[];
  readonly relationships: readonly KnowledgeVisualizationRelationship[];
}
```

### KnowledgeArtifactWithVisualizations

Associates canonical concepts with visualization metadata.

```typescript
interface KnowledgeArtifactWithVisualizations {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeVisualizationProfile[];
  readonly relationships: readonly KnowledgeVisualizationRelationship[];
  readonly provenance: KnowledgeVisualizationProvenance;
}
```

## Registry

The registry is an immutable, deterministically ordered collection of visualization profiles and relationships. It enforces:

- **Stable ordering** — profiles sorted by conceptId, then visualizationType, then orderIndex, then visualizationId
- **Deterministic metadata** — counts computed from sorted profiles
- **Trace completeness** — every composition produces a trace with decisions
- **Relationship integrity** — relationships reference valid profiles

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeVisualizationProvenance()` | Creates KnowledgeVisualizationProvenance |
| `composeKnowledgeVisualizationTrace()` | Creates KnowledgeVisualizationTrace |
| `composeKnowledgeVisualizationProfile()` | Creates KnowledgeVisualizationProfile |
| `composeKnowledgeVisualizationRelationship()` | Creates KnowledgeVisualizationRelationship |
| `composeKnowledgeVisualizationRegistry()` | Creates KnowledgeVisualizationRegistry |
| `composeKnowledgeVisualizationRegistryFromInput()` | Creates registry from input |
| `composeKnowledgeVisualizations()` | Creates complete registry with trace |
| `composeKnowledgeArtifactWithVisualizations()` | Creates artifact with visualizations |

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeVisualizationProfile()` | Validates a single profile |
| `validateKnowledgeVisualizationRelationship()` | Validates a relationship |
| `validateKnowledgeVisualizationRegistry()` | Validates a complete registry |
| `validateKnowledgeVisualizationInput()` | Validates input before composition |
| `validateKnowledgeVisualizationTrace()` | Validates trace integrity |
| `validateKnowledgeArtifactWithVisualizations()` | Validates artifact association |

### Validation Codes (exactly 20, prefix VISUALIZATION_)

| Code | Description |
|------|-------------|
| `VISUALIZATION_DUPLICATE_ID` | Duplicate profile ID in registry |
| `VISUALIZATION_DUPLICATE_TITLE` | Duplicate profile title in registry |
| `VISUALIZATION_INVALID_TYPE` | Unsupported visualization type |
| `VISUALIZATION_INVALID_OBJECTIVE` | Unsupported visualization objective |
| `VISUALIZATION_INVALID_COMPLEXITY` | Unsupported complexity level |
| `VISUALIZATION_INVALID_VISIBILITY` | Unsupported visibility level |
| `VISUALIZATION_INVALID_STATUS` | Unsupported visualization status |
| `VISUALIZATION_INVALID_GOVERNANCE` | Unsupported governance value |
| `VISUALIZATION_MISSING_PROVENANCE` | Profile missing provenance |
| `VISUALIZATION_MISSING_PROVIDER` | Provenance missing provider |
| `VISUALIZATION_MISSING_RATIONALE` | Provenance missing rationale |
| `VISUALIZATION_MISSING_CONCEPT_REFERENCE` | Profile missing concept reference |
| `VISUALIZATION_MISSING_PROFILE_ID` | Profile missing profile ID |
| `VISUALIZATION_MISSING_TITLE` | Profile missing title |
| `VISUALIZATION_SELF_RELATIONSHIP` | Relationship references itself |
| `VISUALIZATION_EMPTY_REGISTRY` | Registry has no profiles |
| `VISUALIZATION_INVALID_TRACE` | Trace has invalid properties |
| `VISUALIZATION_REGISTRY_INCONSISTENCY` | Metadata count mismatch |
| `VISUALIZATION_INVALID_CONFIGURATION` | Invalid relationship configuration |
| `VISUALIZATION_INVALID_ORDER` | Invalid profile ordering |

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

The Visualization Layer operates under strict governance:

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
- Diagram generation, SVG generation
- Canvas rendering, WebGL
- Image rendering, HTML generation
- CSS generation, visualization engine
- Layout engine, automatic layout
- Graph layout, Mermaid generation
- PlantUML generation, LLM invocation

## Cross-Agent Boundaries

Production code must NOT reference:

- Didactic Agent, Curriculum Agent, Narrative Agent
- Assessment Agent, Curiosity Agent, Research Agent
- Laboratory Agent, Application Agent

No imports, no references, no mutations from these agents.

## Out of Scope

This phase does NOT implement:

- Visualization content generation
- Chart generation
- Figure generation
- SVG generation
- Canvas rendering
- WebGL rendering
- Animation generation
- Image rendering
- Diagram generation
- Plot generation
- Mathematical visualization generation
- LLM-based content creation

## Relationship with D10-OPT-01

This phase extends the canonical foundation established in D10-OPT-01:

- **D10-OPT-01** — Knowledge Contract & Concept Registry Kernel (canonical concepts)
- **D10-OPT-08** — Visualization Metadata (visualization metadata)

Each visualization profile references a concept ID from the canonical concept registry.

## Backward Compatibility

This phase preserves full backward compatibility with D10-OPT-01 through D10-OPT-07. All previous exports remain unchanged and functional.
