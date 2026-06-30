# D10-OPT-03 — Concept Structure, Canonical Components & Internal Knowledge Modeling

## Purpose

This phase defines how a canonical knowledge concept is internally organized. It introduces deterministic metadata describing the internal composition of a concept without generating, interpreting or modifying educational content. The implementation models the structural components of a concept, not the content itself.

## Motivation

The Knowledge Agent owns the canonical representation of knowledge. A concept is not merely a title — it is a structured educational object composed of canonical educational components. This phase models those components only. No content generation is introduced.

## Architecture

```
KnowledgeAgentContract.ts          — Canonical enums and contracts
KnowledgeConceptKernel.ts          — Deterministic composition functions
KnowledgeConceptValidation.ts      — Structured validation (never throws)
KnowledgeConceptKernel.test.ts     — Comprehensive test suite
index.ts                           — Public API surface
```

## Canonical Enums

### Component Types (10 values)

```typescript
CANONICAL_COMPONENT_TYPES = [
  'definition', 'intuition', 'motivation', 'mathematical_foundation',
  'algorithm', 'implementation', 'example', 'counterexample',
  'limitation', 'application'
]
```

### Component Priority (10 values)

```typescript
CANONICAL_COMPONENT_PRIORITY = [
  'critical', 'high', 'recommended', 'optional', 'supplementary',
  'historical', 'advanced', 'reference', 'experimental', 'deprecated'
]
```

### Component Status (6 values)

```typescript
CANONICAL_COMPONENT_STATUS = [
  'draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'
]
```

### Component Visibility (10 values)

```typescript
CANONICAL_COMPONENT_VISIBILITY = [
  'always', 'default', 'advanced_only', 'expert_only', 'hidden',
  'internal', 'curriculum', 'assessment', 'laboratory', 'research'
]
```

### Component Role (10 values)

```typescript
CANONICAL_COMPONENT_ROLE = [
  'core', 'supporting', 'optional', 'cross_reference', 'warning',
  'best_practice', 'engineering_note', 'historical_note',
  'research_note', 'future_direction'
]
```

### Component Governance (10 values)

```typescript
CANONICAL_COMPONENT_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental', 'deprecated',
  'restricted', 'internal', 'public', 'community', 'archived'
]
```

## Contracts

### KnowledgeConceptProvenance

Canonical provenance metadata for concept components.

```typescript
interface KnowledgeConceptProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ComponentGovernance;
}
```

### KnowledgeConceptDecision

Governance decision metadata for components.

```typescript
interface KnowledgeConceptDecision {
  readonly decisionId: string;
  readonly componentId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeConceptTrace

Deterministic trace metadata for component composition.

```typescript
interface KnowledgeConceptTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeConceptDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_concept_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeComponent

Represents one canonical component of a concept.

```typescript
interface KnowledgeComponent {
  readonly componentId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly componentType: ComponentType;
  readonly priority: ComponentPriority;
  readonly role: ComponentRole;
  readonly visibility: ComponentVisibility;
  readonly status: ComponentStatus;
  readonly governance: ComponentGovernance;
  readonly tags: readonly string[];
  readonly orderIndex: number;
  readonly references: readonly string[];
  readonly provenance: KnowledgeConceptProvenance;
}
```

### KnowledgeComponentRelationship

Links components belonging to the same or related concepts.

```typescript
interface KnowledgeComponentRelationship {
  readonly relationshipId: string;
  readonly sourceComponentId: string;
  readonly targetComponentId: string;
  readonly conceptId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'dependency' | 'reference';
  readonly description: string;
  readonly provenance: KnowledgeConceptProvenance;
}
```

### KnowledgeComponentRegistryMetadata

```typescript
interface KnowledgeComponentRegistryMetadata {
  readonly registryId: string;
  readonly componentCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly componentTypeCount: number;
}
```

### KnowledgeComponentRegistry

Immutable registry of components and relationships.

```typescript
interface KnowledgeComponentRegistry {
  readonly registryId: string;
  readonly components: readonly KnowledgeComponent[];
  readonly relationships: readonly KnowledgeComponentRelationship[];
  readonly metadata: KnowledgeComponentRegistryMetadata;
  readonly trace: KnowledgeConceptTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_concept_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeComponentInput

Canonical input structure for composition.

```typescript
interface KnowledgeComponentInput {
  readonly components: readonly KnowledgeComponent[];
  readonly relationships: readonly KnowledgeComponentRelationship[];
}
```

### KnowledgeArtifactWithComponents

Associates canonical concepts with their internal component registry.

```typescript
interface KnowledgeArtifactWithComponents {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly components: readonly KnowledgeComponent[];
  readonly relationships: readonly KnowledgeComponentRelationship[];
  readonly provenance: KnowledgeConceptProvenance;
}
```

## Registry

The registry is an immutable, deterministically ordered collection of components and relationships. It enforces:

- **Stable ordering** — components sorted by conceptId, then orderIndex, then componentType, then componentId
- **Deterministic metadata** — counts computed from sorted components
- **Trace completeness** — every composition produces a trace with decisions
- **Relationship integrity** — relationships reference valid components

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeConceptProvenance()` | Creates KnowledgeConceptProvenance |
| `composeKnowledgeConceptTrace()` | Creates KnowledgeConceptTrace |
| `composeKnowledgeComponent()` | Creates KnowledgeComponent |
| `composeKnowledgeComponentRelationship()` | Creates KnowledgeComponentRelationship |
| `composeKnowledgeComponentRegistry()` | Creates KnowledgeComponentRegistry |
| `composeKnowledgeComponentRegistryFromInput()` | Creates registry from input |
| `composeKnowledgeComponents()` | Creates complete registry with trace |
| `composeKnowledgeArtifactWithComponents()` | Creates artifact with components |

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeComponent()` | Validates a single component |
| `validateKnowledgeComponentRelationship()` | Validates a relationship |
| `validateKnowledgeComponentRegistry()` | Validates a complete registry |
| `validateKnowledgeComponentInput()` | Validates input before composition |
| `validateKnowledgeComponentTrace()` | Validates trace integrity |
| `validateKnowledgeArtifactWithComponents()` | Validates artifact association |

### Validation Codes (exactly 20, prefix COMPONENT_)

| Code | Description |
|------|-------------|
| `COMPONENT_DUPLICATE_ID` | Duplicate component ID in registry |
| `COMPONENT_DUPLICATE_TITLE` | Duplicate component title in registry |
| `COMPONENT_INVALID_TYPE` | Unsupported component type |
| `COMPONENT_INVALID_PRIORITY` | Unsupported component priority |
| `COMPONENT_INVALID_ROLE` | Unsupported component role |
| `COMPONENT_INVALID_VISIBILITY` | Unsupported component visibility |
| `COMPONENT_INVALID_STATUS` | Unsupported component status |
| `COMPONENT_INVALID_GOVERNANCE` | Unsupported governance value |
| `COMPONENT_MISSING_PROVENANCE` | Component missing provenance |
| `COMPONENT_MISSING_PROVIDER` | Provenance missing provider |
| `COMPONENT_MISSING_RATIONALE` | Provenance missing rationale |
| `COMPONENT_MISSING_CONCEPT_REFERENCE` | Component missing concept reference |
| `COMPONENT_MISSING_COMPONENT_ID` | Component missing component ID |
| `COMPONENT_MISSING_TITLE` | Component missing title |
| `COMPONENT_SELF_RELATIONSHIP` | Relationship references itself |
| `COMPONENT_EMPTY_REGISTRY` | Registry has no components |
| `COMPONENT_INVALID_TRACE` | Trace has invalid properties |
| `COMPONENT_REGISTRY_INCONSISTENCY` | Metadata count mismatch |
| `COMPONENT_INVALID_CONFIGURATION` | Invalid relationship configuration |
| `COMPONENT_INVALID_ORDER` | Invalid component ordering |

## Determinism

All compose functions satisfy 100-iteration identity tests:

- **Stable serialization** — JSON.stringify produces identical output
- **Stable ordering** — components are always sorted identically
- **Stable registries** — registryId, metadata, and trace are deterministic

## Immutability

All contracts use `readonly` modifiers:

- **No mutation** — inputs are never modified
- **Defensive copies** — arrays are spread into new arrays
- **Readonly output** — compose functions return readonly structures

## Governance

The Component Layer operates under strict governance:

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
- Component generation, automatic concept decomposition
- Semantic parsing, NLP, LLM invocation
- Automatic ontology creation, graph inference

## Cross-Agent Boundaries

Production code must NOT reference:

- Didactic Agent, Curriculum Agent, Narrative Agent
- Assessment Agent, Curiosity Agent, Research Agent
- Laboratory Agent, Application Agent

No imports, no references, no mutations from these agents.

## Out of Scope

This phase does NOT implement:

- Component content generation
- Automatic concept decomposition
- Semantic parsing or NLP
- LLM-based component creation
- Automatic ontology creation
- Graph inference

## Relationship with D10-OPT-01

This phase extends the canonical foundation established in D10-OPT-01:

- **D10-OPT-01** — Knowledge Contract & Concept Registry Kernel (canonical concepts)
- **D10-OPT-03** — Concept Structure, Canonical Components (component metadata)

Each component references a concept ID from the canonical concept registry.

## Relationship with D10-OPT-02

This phase complements the explanation layer established in D10-OPT-02:

- **D10-OPT-02** — Multi-Level Explanation Modeling (explanation metadata)
- **D10-OPT-03** — Concept Structure, Canonical Components (component metadata)

Components represent the internal structure of a concept, while explanations represent how that concept is presented at different depths.
