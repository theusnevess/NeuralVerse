# D10-OPT-14 — Semantic Connectivity Modeling

## Purpose

This phase defines the canonical Semantic Connectivity Layer for the Knowledge Agent. It extends the Knowledge Pipeline with immutable metadata describing semantic relationships between canonical knowledge concepts. This module is metadata only — it models semantic connectivity without inferring relationships, performing graph traversal, executing semantic search, computing embeddings, performing ontology reasoning, or interacting with the Retrieval Agent.

## Motivation

The Knowledge Agent requires a structured way to represent semantic relationships between concepts. A concept may need to express:

- Prerequisite relationships for learning progression
- Dependency relationships for knowledge foundations
- Extension relationships for concept evolution
- Specialization relationships for concept refinement
- Generalization relationships for concept abstraction
- Related-to relationships for conceptual connections
- Contrast relationships for distinction understanding
- Support relationships for evidence connections
- Derivation relationships for knowledge lineage
- Equivalence relationships for concept identity

These semantic relationships are organized by type, strength, and scope. The connectivity layer models this structure without performing semantic reasoning.

## Architecture

```
KnowledgeAgentContract.ts          — Canonical enums and contracts
KnowledgeConnectivityKernel.ts     — Deterministic composition functions
KnowledgeConnectivityValidation.ts — Structured validation (never throws)
KnowledgeConnectivityKernel.test.ts — Comprehensive test suite
index.ts                           — Public API surface
```

## Canonical Enums

### Connectivity Types (10 values)

```typescript
CANONICAL_CONNECTIVITY_TYPES = [
  'prerequisite', 'depends_on', 'extends', 'specializes',
  'generalizes', 'related_to', 'contrasts_with', 'supports',
  'derived_from', 'equivalent_to'
]
```

### Relationship Strength (10 values)

```typescript
CANONICAL_RELATIONSHIP_STRENGTH = [
  'minimal', 'weak', 'moderate', 'strong', 'very_strong',
  'fundamental', 'engineering', 'research', 'canonical', 'mandatory'
]
```

### Connectivity Scope (10 values)

```typescript
CANONICAL_CONNECTIVITY_SCOPE = [
  'local', 'module', 'domain', 'discipline', 'cross_domain',
  'curriculum', 'research', 'engineering', 'global', 'canonical'
]
```

### Connectivity Status (6 values)

```typescript
CANONICAL_CONNECTIVITY_STATUS = [
  'draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'
]
```

### Connectivity Visibility (10 values)

```typescript
CANONICAL_CONNECTIVITY_VISIBILITY = [
  'always', 'default', 'advanced', 'expert', 'curriculum',
  'assessment', 'laboratory', 'research', 'internal', 'hidden'
]
```

### Connectivity Governance (10 values)

```typescript
CANONICAL_CONNECTIVITY_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental', 'deprecated',
  'restricted', 'internal', 'public', 'community', 'archived'
]
```

## Contracts

### KnowledgeConnectivityProvenance

Canonical provenance metadata for connectivity profiles.

```typescript
interface KnowledgeConnectivityProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ConnectivityGovernance;
}
```

### KnowledgeConnectivityDecision

Governance decision metadata for connectivity records.

```typescript
interface KnowledgeConnectivityDecision {
  readonly decisionId: string;
  readonly relationshipId: string;
  readonly sourceConceptId: string;
  readonly targetConceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeConnectivityTrace

Deterministic trace metadata for connectivity composition.

```typescript
interface KnowledgeConnectivityTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeConnectivityDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_connectivity_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeConnectivityProfile

Represents one semantic relationship between concepts.

```typescript
interface KnowledgeConnectivityProfile {
  readonly relationshipId: string;
  readonly sourceConceptId: string;
  readonly targetConceptId: string;
  readonly relationshipType: ConnectivityType;
  readonly relationshipStrength: RelationshipStrength;
  readonly scope: ConnectivityScope;
  readonly visibility: ConnectivityVisibility;
  readonly status: ConnectivityStatus;
  readonly governance: ConnectivityGovernance;
  readonly description: string;
  readonly bidirectional: boolean;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeConnectivityProvenance;
}
```

### KnowledgeConnectivityRelationship

Links higher-order relationships between connectivity records.

```typescript
interface KnowledgeConnectivityRelationship {
  readonly relationshipId: string;
  readonly sourceRelationshipId: string;
  readonly targetRelationshipId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeConnectivityProvenance;
}
```

### KnowledgeConnectivityRegistryMetadata

```typescript
interface KnowledgeConnectivityRegistryMetadata {
  readonly registryId: string;
  readonly relationshipCount: number;
  readonly higherOrderRelationshipCount: number;
  readonly conceptCount: number;
  readonly typeCount: number;
}
```

### KnowledgeConnectivityRegistry

Immutable registry of connectivity profiles and relationships.

```typescript
interface KnowledgeConnectivityRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeConnectivityProfile[];
  readonly relationships: readonly KnowledgeConnectivityRelationship[];
  readonly metadata: KnowledgeConnectivityRegistryMetadata;
  readonly trace: KnowledgeConnectivityTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_connectivity_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeConnectivityInput

Canonical input structure for composition.

```typescript
interface KnowledgeConnectivityInput {
  readonly profiles: readonly KnowledgeConnectivityProfile[];
  readonly relationships: readonly KnowledgeConnectivityRelationship[];
}
```

### KnowledgeArtifactWithConnectivity

Associates canonical concepts with semantic connectivity metadata.

```typescript
interface KnowledgeArtifactWithConnectivity {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeConnectivityProfile[];
  readonly relationships: readonly KnowledgeConnectivityRelationship[];
  readonly provenance: KnowledgeConnectivityProvenance;
}
```

## Registry

The registry is an immutable, deterministically ordered collection of connectivity profiles and relationships. It enforces:

- **Stable ordering** — profiles sorted by sourceConceptId, then targetConceptId, then relationshipType, then relationshipId
- **Deterministic metadata** — counts computed from sorted profiles
- **Trace completeness** — every composition produces a trace with decisions
- **Relationship integrity** — relationships reference valid profiles

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeConnectivityProvenance()` | Creates KnowledgeConnectivityProvenance |
| `composeKnowledgeConnectivityTrace()` | Creates KnowledgeConnectivityTrace |
| `composeKnowledgeConnectivityProfile()` | Creates KnowledgeConnectivityProfile |
| `composeKnowledgeConnectivityRelationship()` | Creates KnowledgeConnectivityRelationship |
| `composeKnowledgeConnectivityRegistry()` | Creates KnowledgeConnectivityRegistry |
| `composeKnowledgeConnectivityRegistryFromInput()` | Creates registry from input |
| `composeKnowledgeConnectivity()` | Creates complete registry with trace |
| `composeKnowledgeArtifactWithConnectivity()` | Creates artifact with connectivity |

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeConnectivityProfile()` | Validates a single profile |
| `validateKnowledgeConnectivityRelationship()` | Validates a relationship |
| `validateKnowledgeConnectivityRegistry()` | Validates a complete registry |
| `validateKnowledgeConnectivityInput()` | Validates input before composition |
| `validateKnowledgeConnectivityTrace()` | Validates trace integrity |
| `validateKnowledgeArtifactWithConnectivity()` | Validates artifact association |

### Validation Codes (exactly 20, prefix CONNECTIVITY_)

| Code | Description |
|------|-------------|
| `CONNECTIVITY_DUPLICATE_ID` | Duplicate profile ID in registry |
| `CONNECTIVITY_DUPLICATE_TITLE` | Duplicate profile title in registry |
| `CONNECTIVITY_INVALID_TYPE` | Unsupported connectivity type |
| `CONNECTIVITY_INVALID_STRENGTH` | Unsupported relationship strength |
| `CONNECTIVITY_INVALID_SCOPE` | Unsupported connectivity scope |
| `CONNECTIVITY_INVALID_VISIBILITY` | Unsupported visibility level |
| `CONNECTIVITY_INVALID_STATUS` | Unsupported connectivity status |
| `CONNECTIVITY_INVALID_GOVERNANCE` | Unsupported governance value |
| `CONNECTIVITY_MISSING_PROVENANCE` | Profile missing provenance |
| `CONNECTIVITY_MISSING_PROVIDER` | Provenance missing provider |
| `CONNECTIVITY_MISSING_RATIONALE` | Provenance missing rationale |
| `CONNECTIVITY_MISSING_CONCEPT_REFERENCE` | Profile missing concept reference |
| `CONNECTIVITY_MISSING_RELATIONSHIP_ID` | Profile missing relationship ID |
| `CONNECTIVITY_MISSING_TITLE` | Profile missing title |
| `CONNECTIVITY_SELF_RELATIONSHIP` | Relationship references itself |
| `CONNECTIVITY_EMPTY_REGISTRY` | Registry has no profiles |
| `CONNECTIVITY_INVALID_TRACE` | Trace has invalid properties |
| `CONNECTIVITY_REGISTRY_INCONSISTENCY` | Metadata count mismatch |
| `CONNECTIVITY_INVALID_CONFIGURATION` | Invalid relationship configuration |
| `CONNECTIVITY_INVALID_ORDER` | Invalid profile ordering |

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

## Cross-Agent Boundaries

Production code must NOT reference:

- Didactic Agent, Curriculum Agent, Narrative Agent
- Assessment Agent, Curiosity Agent, Research Agent
- Laboratory Agent, Application Agent, Retrieval Agent

No imports, no references, no mutations from these agents.

## Runtime Restrictions

The following are forbidden in all kernel modules:

- `Math.random`, `Date.now`, `new Date`, `performance.now`
- `crypto.randomUUID`, `Promise`, `async`, `await`
- `fetch`, `filesystem`, `network`, `database`, `process.env`
- Semantic search, embedding generation
- Vector search, ontology inference
- Graph traversal, relationship inference
- Knowledge graph execution, recommendation generation
- Path finding, transitive closure computation
- Reasoning, LLM invocation

## Public API

Everything is exported through `index.ts`:

- **Contracts** — types and constants
- **Kernel** — compose functions and helpers
- **Validation** — validators and codes

## Backward Compatibility

This phase preserves full backward compatibility with D10-OPT-01 through D10-OPT-13. All previous exports remain unchanged and functional.
