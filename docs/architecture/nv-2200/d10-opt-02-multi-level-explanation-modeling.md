# D10-OPT-02 — Multi-Level Explanation Modeling

## Purpose

This phase introduces the canonical Multi-Level Explanation Layer for the Knowledge Agent. It defines the metadata model that allows every governed concept to expose multiple explanation depths while preserving a single canonical meaning. The implementation remains completely structural — it models how explanations are represented without generating explanations.

## Motivation

The Knowledge Agent requires a structured way to represent progressive explanation depths for every governed concept. A single concept may need:

- A concise definition for quick reference
- An intuitive explanation for learners
- A technical explanation for practitioners
- A mathematical formulation for formalists
- An algorithmic interpretation for implementers
- Implementation guidance for engineers
- Advanced engineering discussion for specialists

These explanation levels belong to the same governed concept. The explanation layer models this structure without generating content.

## Explanation Philosophy

The Knowledge Agent treats explanation metadata as a structural concern, not a content generation concern. Each explanation level represents a different depth of the same governed concept. The explanation layer:

- Models explanation structure, not content
- Preserves canonical meaning across levels
- Links explanations belonging to the same concept
- Maintains deterministic ordering
- Remains independent from presentation

## Architecture

```
KnowledgeAgentContract.ts          — Canonical enums and contracts
KnowledgeExplanationKernel.ts      — Deterministic composition functions
KnowledgeExplanationValidation.ts  — Structured validation (never throws)
KnowledgeExplanationKernel.test.ts — Comprehensive test suite
index.ts                           — Public API surface
```

## Canonical Enums

### Explanation Levels (7 values, ordered)

```typescript
CANONICAL_EXPLANATION_LEVELS = [
  'concise_definition',
  'intuitive_explanation',
  'technical_explanation',
  'mathematical_formulation',
  'algorithmic_interpretation',
  'implementation_guidance',
  'advanced_engineering_discussion'
]
```

### Explanation Formats (10 values)

```typescript
CANONICAL_EXPLANATION_FORMATS = [
  'text', 'structured', 'formula', 'algorithm', 'pseudocode',
  'diagram_reference', 'table', 'code_reference', 'comparison', 'mixed'
]
```

### Explanation Purposes (10 values)

```typescript
CANONICAL_EXPLANATION_PURPOSES = [
  'introduce', 'clarify', 'formalize', 'derive', 'implement',
  'compare', 'summarize', 'reinforce', 'connect', 'extend'
]
```

### Audience Levels (10 values, ordered progression)

```typescript
CANONICAL_AUDIENCE_LEVELS = [
  'complete_beginner', 'beginner', 'elementary', 'intermediate',
  'upper_intermediate', 'advanced', 'expert', 'researcher',
  'specialist', 'authority'
]
```

### Explanation Status (6 values)

```typescript
CANONICAL_EXPLANATION_STATUS = [
  'draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'
]
```

### Explanation Governance (10 values)

```typescript
CANONICAL_EXPLANATION_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental', 'deprecated',
  'restricted', 'internal', 'public', 'community', 'archived'
]
```

## Contracts

### KnowledgeExplanationProvenance

Canonical provenance metadata for explanation profiles.

```typescript
interface KnowledgeExplanationProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ExplanationGovernance;
}
```

### KnowledgeExplanationDecision

Governance decision metadata for explanations.

```typescript
interface KnowledgeExplanationDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeExplanationTrace

Deterministic trace metadata for explanation composition.

```typescript
interface KnowledgeExplanationTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeExplanationDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_explanation_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeExplanationProfile

Represents one explanation level for a governed concept.

```typescript
interface KnowledgeExplanationProfile {
  readonly profileId: string;
  readonly conceptId: string;
  readonly level: ExplanationLevel;
  readonly format: ExplanationFormat;
  readonly purpose: ExplanationPurpose;
  readonly audienceLevel: AudienceLevel;
  readonly status: ExplanationStatus;
  readonly governance: ExplanationGovernance;
  readonly title: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly prerequisiteProfileIds: readonly string[];
  readonly provenance: KnowledgeExplanationProvenance;
}
```

### KnowledgeExplanationRelationship

Links explanations belonging to the same concept.

```typescript
interface KnowledgeExplanationRelationship {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly conceptId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeExplanationProvenance;
}
```

### KnowledgeExplanationRegistryMetadata

```typescript
interface KnowledgeExplanationRegistryMetadata {
  readonly registryId: string;
  readonly profileCount: number;
  readonly relationshipCount: number;
  readonly levelCount: number;
  readonly conceptCount: number;
}
```

### KnowledgeExplanationRegistry

Immutable registry of explanation profiles and relationships.

```typescript
interface KnowledgeExplanationRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeExplanationProfile[];
  readonly relationships: readonly KnowledgeExplanationRelationship[];
  readonly metadata: KnowledgeExplanationRegistryMetadata;
  readonly trace: KnowledgeExplanationTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_explanation_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeExplanationInput

Canonical input structure for composition.

```typescript
interface KnowledgeExplanationInput {
  readonly profiles: readonly KnowledgeExplanationProfile[];
  readonly relationships: readonly KnowledgeExplanationRelationship[];
}
```

### KnowledgeArtifactWithExplanations

Associates explanations with the canonical concept.

```typescript
interface KnowledgeArtifactWithExplanations {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeExplanationProfile[];
  readonly relationships: readonly KnowledgeExplanationRelationship[];
  readonly provenance: KnowledgeExplanationProvenance;
}
```

## Registry

The registry is an immutable, deterministically ordered collection of explanation profiles and relationships. It enforces:

- **Stable ordering** — profiles sorted by conceptId, then level, then profileId
- **Deterministic metadata** — counts computed from sorted profiles
- **Trace completeness** — every composition produces a trace with decisions
- **Relationship integrity** — relationships reference valid profiles

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeExplanationProvenance()` | Creates KnowledgeExplanationProvenance |
| `composeKnowledgeExplanationTrace()` | Creates KnowledgeExplanationTrace |
| `composeKnowledgeExplanationProfile()` | Creates KnowledgeExplanationProfile |
| `composeKnowledgeExplanationRelationship()` | Creates KnowledgeExplanationRelationship |
| `composeKnowledgeExplanationRegistry()` | Creates KnowledgeExplanationRegistry |
| `composeKnowledgeExplanationRegistryFromInput()` | Creates registry from input |
| `composeKnowledgeExplanations()` | Creates complete registry with trace |
| `composeKnowledgeArtifactWithExplanations()` | Creates artifact with explanations |

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeExplanationProfile()` | Validates a single profile |
| `validateKnowledgeExplanationRelationship()` | Validates a relationship |
| `validateKnowledgeExplanationRegistry()` | Validates a complete registry |
| `validateKnowledgeExplanationInput()` | Validates input before composition |
| `validateKnowledgeExplanationTrace()` | Validates trace integrity |
| `validateKnowledgeArtifactWithExplanations()` | Validates artifact association |

### Validation Codes (exactly 20, prefix EXPLANATION_)

| Code | Description |
|------|-------------|
| `EXPLANATION_DUPLICATE_ID` | Duplicate profile ID in registry |
| `EXPLANATION_DUPLICATE_TITLE` | Duplicate profile title in registry |
| `EXPLANATION_INVALID_LEVEL` | Unsupported explanation level |
| `EXPLANATION_INVALID_FORMAT` | Unsupported explanation format |
| `EXPLANATION_INVALID_PURPOSE` | Unsupported explanation purpose |
| `EXPLANATION_INVALID_AUDIENCE` | Unsupported audience level |
| `EXPLANATION_INVALID_STATUS` | Unsupported explanation status |
| `EXPLANATION_INVALID_GOVERNANCE` | Unsupported governance value |
| `EXPLANATION_MISSING_PROVENANCE` | Profile missing provenance |
| `EXPLANATION_MISSING_PROVIDER` | Provenance missing provider |
| `EXPLANATION_MISSING_RATIONALE` | Provenance missing rationale |
| `EXPLANATION_MISSING_CONCEPT_REFERENCE` | Profile missing concept reference |
| `EXPLANATION_MISSING_PROFILE_ID` | Profile missing profile ID |
| `EXPLANATION_MISSING_TITLE` | Profile missing title |
| `EXPLANATION_SELF_RELATIONSHIP` | Relationship references itself |
| `EXPLANATION_EMPTY_REGISTRY` | Registry has no profiles |
| `EXPLANATION_INVALID_TRACE` | Trace has invalid properties |
| `EXPLANATION_REGISTRY_INCONSISTENCY` | Metadata count mismatch |
| `EXPLANATION_INVALID_CONFIGURATION` | Invalid relationship configuration |
| `EXPLANATION_INVALID_SEQUENCE` | Invalid explanation sequence |

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

The Explanation Layer operates under strict governance:

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
- Explanation generation, LLM invocation, automatic summarization
- Text rewriting, personalization, adaptive explanations
- Narrative generation

## Cross-Agent Boundaries

Production code must NOT reference:

- Didactic Agent, Curriculum Agent, Narrative Agent
- Assessment Agent, Curiosity Agent, Research Agent
- Laboratory Agent, Application Agent

No imports, no references, no mutations from these agents.

## Out of Scope

This phase does NOT implement:

- Explanation content generation
- LLM-based explanation creation
- Automatic summarization
- Text rewriting or personalization
- Adaptive explanation selection

## Relationship with D10-OPT-01

This phase extends the canonical foundation established in D10-OPT-01:

- **D10-OPT-01** — Knowledge Contract & Concept Registry Kernel (canonical concepts)
- **D10-OPT-02** — Multi-Level Explanation Modeling (explanation metadata)

The explanation layer builds upon the concept registry without modifying it. Each explanation profile references a concept ID from the canonical concept registry.
