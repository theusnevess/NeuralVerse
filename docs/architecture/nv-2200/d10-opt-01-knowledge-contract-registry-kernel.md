# D10-OPT-01 — Knowledge Contract & Concept Registry Kernel

## Purpose

This phase establishes the canonical foundation of the Knowledge Agent. It defines the immutable domain model that every subsequent D10 phase will build upon. The implementation creates the canonical knowledge contracts, registry model, deterministic composition layer, validation system, public exports, and documentation.

## Motivation

The Knowledge Agent requires a single source of truth for educational concepts. This foundation must be:

- **Independent from presentation** — no UI concerns leak into the domain model
- **Independent from didactics** — no educational methodology assumptions
- **Independent from curriculum** — no course structure dependencies
- **Independent from narrative** — no storytelling concerns
- **Independent from laboratories** — no hands-on exercise coupling
- **Independent from assessment** — no evaluation logic
- **Deterministic** — identical inputs always produce identical outputs
- **Immutable** — no mutation of inputs or outputs

## Architecture

The Knowledge Agent is the Single Source of Truth (SSOT) for educational concepts. It owns canonical concepts and remains completely separated from educational delivery.

```
KnowledgeAgentContract.ts  — Immutable domain types and canonical enums
KnowledgeKernel.ts         — Deterministic composition functions
KnowledgeValidation.ts     — Structured validation (never throws)
KnowledgeKernel.test.ts    — Comprehensive test suite
index.ts                   — Public API surface
```

## Canonical Enums

### Knowledge Types (10 values)

```typescript
CANONICAL_KNOWLEDGE_TYPES = [
  'concept', 'algorithm', 'mathematics', 'implementation',
  'architecture', 'framework', 'protocol', 'dataset',
  'model', 'theory'
]
```

### Knowledge Categories (10 values)

```typescript
CANONICAL_KNOWLEDGE_CATEGORIES = [
  'artificial_intelligence', 'machine_learning', 'deep_learning',
  'computer_vision', 'nlp', 'mathematics', 'statistics',
  'software_engineering', 'mlops', 'research'
]
```

### Knowledge Difficulty (10 values, ordered progression)

```typescript
CANONICAL_KNOWLEDGE_DIFFICULTY = [
  'foundational', 'introductory', 'basic', 'intermediate',
  'advanced', 'expert', 'specialist', 'research_level',
  'frontier', 'theoretical'
]
```

### Knowledge Status (6 values)

```typescript
CANONICAL_KNOWLEDGE_STATUS = [
  'draft', 'review', 'approved', 'canonical',
  'deprecated', 'archived'
]
```

### Knowledge Review Status (6 values)

```typescript
CANONICAL_KNOWLEDGE_REVIEW_STATUS = [
  'pending', 'in_progress', 'changes_requested',
  'approved', 'rejected', 'deferred'
]
```

### Knowledge Governance (10 values)

```typescript
CANONICAL_KNOWLEDGE_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental',
  'deprecated', 'restricted', 'internal', 'public',
  'community', 'archived'
]
```

## Contracts

### KnowledgeProvenance

Canonical provenance metadata for knowledge nodes.

```typescript
interface KnowledgeProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: KnowledgeGovernance;
}
```

### KnowledgeDecision

Governance decision metadata.

```typescript
interface KnowledgeDecision {
  readonly decisionId: string;
  readonly knowledgeId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeTrace

Deterministic trace metadata.

```typescript
interface KnowledgeTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_knowledge_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeNode

Canonical concept contract representing one governed concept.

```typescript
interface KnowledgeNode {
  readonly nodeId: string;
  readonly title: string;
  readonly knowledgeType: KnowledgeType;
  readonly category: KnowledgeCategory;
  readonly difficulty: KnowledgeDifficulty;
  readonly status: KnowledgeStatus;
  readonly reviewStatus: KnowledgeReviewStatus;
  readonly governance: KnowledgeGovernance;
  readonly canonicalIdentifier: string;
  readonly tags: readonly string[];
  readonly summary: string;
  readonly provenance: KnowledgeProvenance;
}
```

### KnowledgeRegistryMetadata

```typescript
interface KnowledgeRegistryMetadata {
  readonly registryId: string;
  readonly nodeCount: number;
  readonly categoryCount: number;
  readonly typeCount: number;
}
```

### KnowledgeRegistry

Immutable registry of knowledge nodes.

```typescript
interface KnowledgeRegistry {
  readonly registryId: string;
  readonly nodes: readonly KnowledgeNode[];
  readonly metadata: KnowledgeRegistryMetadata;
  readonly trace: KnowledgeTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_knowledge_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeInput

Canonical input structure for composition.

```typescript
interface KnowledgeInput {
  readonly nodes: readonly KnowledgeNode[];
}
```

## Registry

The registry is an immutable, deterministically ordered collection of knowledge nodes. It enforces:

- **Stable ordering** — nodes are sorted by nodeId, then knowledgeType, then title
- **Deterministic metadata** — counts are computed from the sorted nodes
- **Trace completeness** — every composition produces a trace with decisions

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeProvenance()` | Creates KnowledgeProvenance from parameters |
| `composeKnowledgeTrace()` | Creates KnowledgeTrace from decisions |
| `composeKnowledgeNode()` | Creates KnowledgeNode from parameters |
| `composeKnowledgeRegistry()` | Creates KnowledgeRegistry from nodes |
| `composeKnowledgeRegistryFromInput()` | Creates KnowledgeRegistry from KnowledgeInput |
| `composeKnowledge()` | Creates complete KnowledgeRegistry with trace |

### Requirements

- Pure functions with no side effects
- Deterministic output for identical input
- Defensive copies of arrays (tags, nodes)
- Stable sorting by nodeId → knowledgeType → title
- No runtime generation (no Math.random, Date.now, etc.)

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeNode()` | Validates a single node |
| `validateKnowledgeRegistry()` | Validates a complete registry |
| `validateKnowledgeInput()` | Validates input before composition |
| `validateKnowledgeTrace()` | Validates trace integrity |

### Validation Codes (exactly 16, prefix KNOWLEDGE_)

| Code | Description |
|------|-------------|
| `KNOWLEDGE_DUPLICATE_ID` | Duplicate node ID in registry |
| `KNOWLEDGE_DUPLICATE_TITLE` | Duplicate node title in registry |
| `KNOWLEDGE_INVALID_TYPE` | Unsupported knowledge type |
| `KNOWLEDGE_INVALID_CATEGORY` | Unsupported knowledge category |
| `KNOWLEDGE_INVALID_DIFFICULTY` | Unsupported difficulty level |
| `KNOWLEDGE_INVALID_STATUS` | Unsupported knowledge status |
| `KNOWLEDGE_INVALID_GOVERNANCE` | Unsupported governance value |
| `KNOWLEDGE_MISSING_PROVENANCE` | Node missing provenance |
| `KNOWLEDGE_MISSING_PROVIDER` | Provenance missing provider |
| `KNOWLEDGE_MISSING_RATIONALE` | Provenance missing rationale |
| `KNOWLEDGE_MISSING_TRACE` | Registry missing trace |
| `KNOWLEDGE_MISSING_NODE_ID` | Node missing nodeId |
| `KNOWLEDGE_MISSING_TITLE` | Node missing title |
| `KNOWLEDGE_EMPTY_REGISTRY` | Registry has no nodes |
| `KNOWLEDGE_INVALID_TRACE` | Trace has invalid properties |
| `KNOWLEDGE_REGISTRY_INCONSISTENCY` | Metadata count mismatch |

## Determinism

All compose functions satisfy 100-iteration identity tests:

- **Stable serialization** — JSON.stringify produces identical output
- **Stable ordering** — nodes are always sorted identically
- **Stable registries** — registryId, metadata, and trace are deterministic

## Immutability

All contracts use `readonly` modifiers:

- **No mutation** — inputs are never modified
- **Defensive copies** — arrays are spread into new arrays
- **Readonly output** — compose functions return readonly structures

## Governance

The Knowledge Agent operates under strict governance:

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

- `Math.random`
- `Date.now`
- `new Date`
- `performance.now`
- `crypto.randomUUID`
- `Promise`
- `async`
- `await`
- `fetch`
- `filesystem`
- `network`
- `database`
- `process.env`

## Cross-Agent Boundaries

Production code must NOT reference:

- Didactic Agent
- Curriculum Agent
- Narrative Agent
- Assessment Agent
- Curiosity Agent
- Research Agent
- Laboratory Agent
- Application Agent

No imports, no references, no mutations from these agents.

## Out of Scope

This phase does NOT implement:

- Educational content
- Explanations
- Mathematical models
- Visualizations
- Laboratories
- Research references
- Semantic graphs

## Relationship with Future D10 Phases

This foundation will be extended by:

- **D10-OPT-02** — Educational Content Structure
- **D10-OPT-03** — Mathematical Model Integration
- **D10-OPT-04** — Visualization Metadata
- **D10-OPT-05** — Laboratory Integration
- **D10-OPT-06** — Research Reference Linking
- **D10-OPT-07** — Semantic Graph Extensions
- **D10-OPT-08** — Assessment Alignment
- **D10-OPT-09** — Curriculum Mapping
- **D10-OPT-10** — Narrative Integration

Each subsequent phase builds upon this canonical foundation without modifying it.
