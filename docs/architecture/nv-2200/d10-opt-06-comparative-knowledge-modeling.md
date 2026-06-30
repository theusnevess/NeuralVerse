# D10-OPT-06 — Comparative Knowledge Modeling

## Purpose

This phase defines the canonical metadata architecture for comparative knowledge modeling inside the Knowledge Agent. It introduces the canonical structures required to represent concept comparisons, similarities, differences, tradeoffs, strengths, weaknesses, decision criteria, and comparison relationships. This optimization does not generate comparisons — it only defines the immutable metadata model used later by higher-level educational pipelines.

## Motivation

The Knowledge Agent requires a structured way to represent that concepts can be compared across multiple dimensions. A comparison may need to:

- Clarify the distinction between similar concepts
- Support decision-making between alternatives
- Analyze tradeoffs between approaches
- Evaluate strengths and weaknesses
- Guide selection of appropriate methods
- Inform engineering decisions
- Facilitate learning through contrast
- Support review and evaluation processes

These comparisons are organized by type, objective, and dimension. The comparison layer models this structure without generating content.

## Architecture

```
KnowledgeAgentContract.ts          — Canonical enums and contracts
KnowledgeComparisonKernel.ts       — Deterministic composition functions
KnowledgeComparisonValidation.ts   — Structured validation (never throws)
KnowledgeComparisonKernel.test.ts  — Comprehensive test suite
index.ts                           — Public API surface
```

## Canonical Enums

### Comparison Types (10 values)

```typescript
CANONICAL_COMPARISON_TYPES = [
  'concept_vs_concept', 'algorithm_vs_algorithm', 'method_vs_method',
  'architecture_vs_architecture', 'implementation_vs_implementation',
  'theory_vs_theory', 'model_vs_model', 'framework_vs_framework',
  'tool_vs_tool', 'approach_vs_approach'
]
```

### Comparison Objectives (10 values)

```typescript
CANONICAL_COMPARISON_OBJECTIVES = [
  'clarify', 'distinguish', 'decision_support', 'tradeoff_analysis',
  'selection', 'engineering', 'learning', 'review', 'evaluation', 'reference'
]
```

### Comparison Dimensions (10 values)

```typescript
CANONICAL_COMPARISON_DIMENSIONS = [
  'accuracy', 'complexity', 'efficiency', 'memory', 'scalability',
  'interpretability', 'robustness', 'maintainability', 'implementation',
  'applicability'
]
```

### Comparison Status (6 values)

```typescript
CANONICAL_COMPARISON_STATUS = [
  'draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'
]
```

### Comparison Visibility (10 values)

```typescript
CANONICAL_COMPARISON_VISIBILITY = [
  'always', 'default', 'advanced', 'expert', 'curriculum',
  'assessment', 'laboratory', 'research', 'internal', 'hidden'
]
```

### Comparison Governance (10 values)

```typescript
CANONICAL_COMPARISON_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental', 'deprecated',
  'restricted', 'internal', 'public', 'community', 'archived'
]
```

## Contracts

### KnowledgeComparisonProvenance

Canonical provenance metadata for comparison profiles.

```typescript
interface KnowledgeComparisonProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ComparisonGovernance;
}
```

### KnowledgeComparisonDecision

Governance decision metadata for comparisons.

```typescript
interface KnowledgeComparisonDecision {
  readonly decisionId: string;
  readonly comparisonId: string;
  readonly primaryConceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeComparisonTrace

Deterministic trace metadata for comparison composition.

```typescript
interface KnowledgeComparisonTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeComparisonDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_comparison_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeComparisonProfile

Represents one comparison between two concepts.

```typescript
interface KnowledgeComparisonProfile {
  readonly comparisonId: string;
  readonly title: string;
  readonly comparisonType: ComparisonType;
  readonly objective: ComparisonObjective;
  readonly primaryConceptId: string;
  readonly secondaryConceptId: string;
  readonly dimensions: readonly ComparisonDimension[];
  readonly visibility: ComparisonVisibility;
  readonly status: ComparisonStatus;
  readonly governance: ComparisonGovernance;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeComparisonProvenance;
}
```

### KnowledgeComparisonRelationship

Links comparisons belonging to related analyses.

```typescript
interface KnowledgeComparisonRelationship {
  readonly relationshipId: string;
  readonly sourceComparisonId: string;
  readonly targetComparisonId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeComparisonProvenance;
}
```

### KnowledgeComparisonRegistryMetadata

```typescript
interface KnowledgeComparisonRegistryMetadata {
  readonly registryId: string;
  readonly comparisonCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly typeCount: number;
}
```

### KnowledgeComparisonRegistry

Immutable registry of comparison profiles and relationships.

```typescript
interface KnowledgeComparisonRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeComparisonProfile[];
  readonly relationships: readonly KnowledgeComparisonRelationship[];
  readonly metadata: KnowledgeComparisonRegistryMetadata;
  readonly trace: KnowledgeComparisonTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_comparison_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeComparisonInput

Canonical input structure for composition.

```typescript
interface KnowledgeComparisonInput {
  readonly profiles: readonly KnowledgeComparisonProfile[];
  readonly relationships: readonly KnowledgeComparisonRelationship[];
}
```

### KnowledgeArtifactWithComparisons

Associates canonical concepts with comparative metadata.

```typescript
interface KnowledgeArtifactWithComparisons {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeComparisonProfile[];
  readonly relationships: readonly KnowledgeComparisonRelationship[];
  readonly provenance: KnowledgeComparisonProvenance;
}
```

## Registry

The registry is an immutable, deterministically ordered collection of comparison profiles and relationships. It enforces:

- **Stable ordering** — profiles sorted by primaryConceptId, then secondaryConceptId, then comparisonType, then comparisonId
- **Deterministic metadata** — counts computed from sorted profiles
- **Trace completeness** — every composition produces a trace with decisions
- **Relationship integrity** — relationships reference valid profiles

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeComparisonProvenance()` | Creates KnowledgeComparisonProvenance |
| `composeKnowledgeComparisonTrace()` | Creates KnowledgeComparisonTrace |
| `composeKnowledgeComparisonProfile()` | Creates KnowledgeComparisonProfile |
| `composeKnowledgeComparisonRelationship()` | Creates KnowledgeComparisonRelationship |
| `composeKnowledgeComparisonRegistry()` | Creates KnowledgeComparisonRegistry |
| `composeKnowledgeComparisonRegistryFromInput()` | Creates registry from input |
| `composeKnowledgeComparisons()` | Creates complete registry with trace |
| `composeKnowledgeArtifactWithComparisons()` | Creates artifact with comparisons |

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeComparisonProfile()` | Validates a single profile |
| `validateKnowledgeComparisonRelationship()` | Validates a relationship |
| `validateKnowledgeComparisonRegistry()` | Validates a complete registry |
| `validateKnowledgeComparisonInput()` | Validates input before composition |
| `validateKnowledgeComparisonTrace()` | Validates trace integrity |
| `validateKnowledgeArtifactWithComparisons()` | Validates artifact association |

### Validation Codes (exactly 20, prefix COMPARISON_)

| Code | Description |
|------|-------------|
| `COMPARISON_DUPLICATE_ID` | Duplicate profile ID in registry |
| `COMPARISON_DUPLICATE_TITLE` | Duplicate profile title in registry |
| `COMPARISON_INVALID_TYPE` | Unsupported comparison type |
| `COMPARISON_INVALID_OBJECTIVE` | Unsupported comparison objective |
| `COMPARISON_INVALID_DIMENSION` | Unsupported comparison dimension |
| `COMPARISON_INVALID_VISIBILITY` | Unsupported visibility level |
| `COMPARISON_INVALID_STATUS` | Unsupported comparison status |
| `COMPARISON_INVALID_GOVERNANCE` | Unsupported governance value |
| `COMPARISON_MISSING_PROVENANCE` | Profile missing provenance |
| `COMPARISON_MISSING_PROVIDER` | Provenance missing provider |
| `COMPARISON_MISSING_RATIONALE` | Provenance missing rationale |
| `COMPARISON_MISSING_CONCEPT_REFERENCE` | Profile missing concept reference |
| `COMPARISON_MISSING_PROFILE_ID` | Profile missing profile ID |
| `COMPARISON_MISSING_TITLE` | Profile missing title |
| `COMPARISON_SELF_RELATIONSHIP` | Relationship references itself |
| `COMPARISON_EMPTY_REGISTRY` | Registry has no profiles |
| `COMPARISON_INVALID_TRACE` | Trace has invalid properties |
| `COMPARISON_REGISTRY_INCONSISTENCY` | Metadata count mismatch |
| `COMPARISON_INVALID_CONFIGURATION` | Invalid relationship configuration |
| `COMPARISON_INVALID_ORDER` | Invalid profile ordering |

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

The Comparison Layer operates under strict governance:

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
- Comparison generation, decision recommendation
- Ranking, automatic evaluation
- LLM invocation, semantic reasoning
- Automatic benchmarking

## Cross-Agent Boundaries

Production code must NOT reference:

- Didactic Agent, Curriculum Agent, Narrative Agent
- Assessment Agent, Curiosity Agent, Research Agent
- Laboratory Agent, Application Agent

No imports, no references, no mutations from these agents.

## Out of Scope

This phase does NOT implement:

- Comparison content generation
- Decision recommendation engines
- Ranking systems
- Automatic evaluation
- LLM-based comparison creation
- Semantic reasoning
- Automatic benchmarking

## Relationship with D10-OPT-01

This phase extends the canonical foundation established in D10-OPT-01:

- **D10-OPT-01** — Knowledge Contract & Concept Registry Kernel (canonical concepts)
- **D10-OPT-06** — Comparative Knowledge Modeling (comparison metadata)

Each comparison profile references concept IDs from the canonical concept registry.

## Relationship with D10-OPT-02

This phase complements the explanation layer established in D10-OPT-02:

- **D10-OPT-02** — Multi-Level Explanation Modeling (explanation metadata)
- **D10-OPT-06** — Comparative Knowledge Modeling (comparison metadata)

Explanations represent how a concept is presented at different depths, while comparisons represent how concepts relate to each other.

## Relationship with D10-OPT-03

This phase complements the component layer established in D10-OPT-03:

- **D10-OPT-03** — Concept Structure, Canonical Components (component metadata)
- **D10-OPT-06** — Comparative Knowledge Modeling (comparison metadata)

Components represent the internal structure of a concept, while comparisons represent how concepts relate to each other.

## Relationship with D10-OPT-04

This phase complements the representation layer established in D10-OPT-04:

- **D10-OPT-04** — Multimodal Representation Modeling (representation metadata)
- **D10-OPT-06** — Comparative Knowledge Modeling (comparison metadata)

Representations define the modality through which a concept is communicated, while comparisons define how concepts relate to each other across those modalities.

## Relationship with D10-OPT-05

This phase complements the example layer established in D10-OPT-05:

- **D10-OPT-05** — Progressive Examples Modeling (example metadata)
- **D10-OPT-06** — Comparative Knowledge Modeling (comparison metadata)

Examples provide concrete instances of a concept, while comparisons provide contrastive analysis between concepts.
