# D10-OPT-05 — Progressive Examples, Canonical Example Modeling & Educational Progression

## Purpose

This phase defines how canonical concepts reference progressively organized educational examples. The implementation models example metadata only — it never generates examples, solves exercises, produces code, creates explanations or invokes LLMs. Examples are modeled as deterministic metadata attached to concepts.

## Motivation

The Knowledge Agent requires a structured way to represent that a concept can be communicated through progressive examples. A single concept may need:

- Definition examples for initial understanding
- Worked examples for guided learning
- Visual examples for visual learners
- Mathematical examples for formalists
- Algorithm examples for implementers
- Implementation examples for engineers
- Engineering examples for practitioners
- Counterexamples for boundary understanding
- Application examples for real-world context
- Historical examples for contextual depth

These examples are organized by progressive complexity and learning stages. The example layer models this structure without generating content.

## Architecture

```
KnowledgeAgentContract.ts        — Canonical enums and contracts
KnowledgeExampleKernel.ts        — Deterministic composition functions
KnowledgeExampleValidation.ts    — Structured validation (never throws)
KnowledgeExampleKernel.test.ts   — Comprehensive test suite
index.ts                         — Public API surface
```

## Canonical Enums

### Example Types (10 values)

```typescript
CANONICAL_EXAMPLE_TYPES = [
  'definition_example', 'worked_example', 'visual_example',
  'mathematical_example', 'algorithm_example', 'implementation_example',
  'engineering_example', 'counterexample', 'application_example',
  'historical_example'
]
```

### Example Levels (10 values)

```typescript
CANONICAL_EXAMPLE_LEVELS = [
  'introductory', 'elementary', 'intermediate', 'advanced', 'expert',
  'research', 'engineering', 'comparative', 'integration', 'mastery'
]
```

### Progressive Stages (10 values)

```typescript
CANONICAL_PROGRESSIVE_STAGES = [
  'recognition', 'understanding', 'interpretation', 'application',
  'analysis', 'integration', 'optimization', 'generalization',
  'transfer', 'mastery'
]
```

### Example Status (6 values)

```typescript
CANONICAL_EXAMPLE_STATUS = [
  'draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'
]
```

### Example Visibility (10 values)

```typescript
CANONICAL_EXAMPLE_VISIBILITY = [
  'always', 'default', 'advanced', 'expert', 'curriculum',
  'assessment', 'laboratory', 'research', 'internal', 'hidden'
]
```

### Example Governance (10 values)

```typescript
CANONICAL_EXAMPLE_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental', 'deprecated',
  'restricted', 'internal', 'public', 'community', 'archived'
]
```

## Contracts

### KnowledgeExampleProvenance

Canonical provenance metadata for example profiles.

```typescript
interface KnowledgeExampleProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ExampleGovernance;
}
```

### KnowledgeExampleDecision

Governance decision metadata for examples.

```typescript
interface KnowledgeExampleDecision {
  readonly decisionId: string;
  readonly exampleId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeExampleTrace

Deterministic trace metadata for example composition.

```typescript
interface KnowledgeExampleTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeExampleDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_example_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeExampleProfile

Represents one example for a governed concept.

```typescript
interface KnowledgeExampleProfile {
  readonly exampleId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly exampleType: ExampleType;
  readonly exampleLevel: ExampleLevel;
  readonly progressiveStage: ProgressiveStage;
  readonly visibility: ExampleVisibility;
  readonly status: ExampleStatus;
  readonly governance: ExampleGovernance;
  readonly tags: readonly string[];
  readonly representationIds: readonly string[];
  readonly orderIndex: number;
  readonly provenance: KnowledgeExampleProvenance;
}
```

### KnowledgeExampleRelationship

Links examples belonging to the same or related concepts.

```typescript
interface KnowledgeExampleRelationship {
  readonly relationshipId: string;
  readonly sourceExampleId: string;
  readonly targetExampleId: string;
  readonly conceptId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'progression' | 'comparison';
  readonly description: string;
  readonly provenance: KnowledgeExampleProvenance;
}
```

### KnowledgeExampleRegistryMetadata

```typescript
interface KnowledgeExampleRegistryMetadata {
  readonly registryId: string;
  readonly exampleCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly levelCount: number;
}
```

### KnowledgeExampleRegistry

Immutable registry of example profiles and relationships.

```typescript
interface KnowledgeExampleRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeExampleProfile[];
  readonly relationships: readonly KnowledgeExampleRelationship[];
  readonly metadata: KnowledgeExampleRegistryMetadata;
  readonly trace: KnowledgeExampleTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_example_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeExampleInput

Canonical input structure for composition.

```typescript
interface KnowledgeExampleInput {
  readonly profiles: readonly KnowledgeExampleProfile[];
  readonly relationships: readonly KnowledgeExampleRelationship[];
}
```

### KnowledgeArtifactWithExamples

Associates canonical concepts with progressive example metadata.

```typescript
interface KnowledgeArtifactWithExamples {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeExampleProfile[];
  readonly relationships: readonly KnowledgeExampleRelationship[];
  readonly provenance: KnowledgeExampleProvenance;
}
```

## Registry

The registry is an immutable, deterministically ordered collection of example profiles and relationships. It enforces:

- **Stable ordering** — profiles sorted by conceptId, then progressiveStage, then orderIndex, then exampleId
- **Deterministic metadata** — counts computed from sorted profiles
- **Trace completeness** — every composition produces a trace with decisions
- **Relationship integrity** — relationships reference valid profiles

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeExampleProvenance()` | Creates KnowledgeExampleProvenance |
| `composeKnowledgeExampleTrace()` | Creates KnowledgeExampleTrace |
| `composeKnowledgeExampleProfile()` | Creates KnowledgeExampleProfile |
| `composeKnowledgeExampleRelationship()` | Creates KnowledgeExampleRelationship |
| `composeKnowledgeExampleRegistry()` | Creates KnowledgeExampleRegistry |
| `composeKnowledgeExampleRegistryFromInput()` | Creates registry from input |
| `composeKnowledgeExamples()` | Creates complete registry with trace |
| `composeKnowledgeArtifactWithExamples()` | Creates artifact with examples |

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeExampleProfile()` | Validates a single profile |
| `validateKnowledgeExampleRelationship()` | Validates a relationship |
| `validateKnowledgeExampleRegistry()` | Validates a complete registry |
| `validateKnowledgeExampleInput()` | Validates input before composition |
| `validateKnowledgeExampleTrace()` | Validates trace integrity |
| `validateKnowledgeArtifactWithExamples()` | Validates artifact association |

### Validation Codes (exactly 20, prefix EXAMPLE_)

| Code | Description |
|------|-------------|
| `EXAMPLE_DUPLICATE_ID` | Duplicate profile ID in registry |
| `EXAMPLE_DUPLICATE_TITLE` | Duplicate profile title in registry |
| `EXAMPLE_INVALID_TYPE` | Unsupported example type |
| `EXAMPLE_INVALID_LEVEL` | Unsupported example level |
| `EXAMPLE_INVALID_STAGE` | Unsupported progressive stage |
| `EXAMPLE_INVALID_VISIBILITY` | Unsupported visibility level |
| `EXAMPLE_INVALID_STATUS` | Unsupported example status |
| `EXAMPLE_INVALID_GOVERNANCE` | Unsupported governance value |
| `EXAMPLE_MISSING_PROVENANCE` | Profile missing provenance |
| `EXAMPLE_MISSING_PROVIDER` | Provenance missing provider |
| `EXAMPLE_MISSING_RATIONALE` | Provenance missing rationale |
| `EXAMPLE_MISSING_CONCEPT_REFERENCE` | Profile missing concept reference |
| `EXAMPLE_MISSING_PROFILE_ID` | Profile missing profile ID |
| `EXAMPLE_MISSING_TITLE` | Profile missing title |
| `EXAMPLE_SELF_RELATIONSHIP` | Relationship references itself |
| `EXAMPLE_EMPTY_REGISTRY` | Registry has no profiles |
| `EXAMPLE_INVALID_TRACE` | Trace has invalid properties |
| `EXAMPLE_REGISTRY_INCONSISTENCY` | Metadata count mismatch |
| `EXAMPLE_INVALID_CONFIGURATION` | Invalid relationship configuration |
| `EXAMPLE_INVALID_ORDER` | Invalid profile ordering |

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

The Example Layer operates under strict governance:

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
- Example generation, exercise generation
- Worked-solution generation, code generation
- Educational reasoning, adaptive sequencing
- Automatic progression, tutoring
- LLM invocation

## Cross-Agent Boundaries

Production code must NOT reference:

- Didactic Agent, Curriculum Agent, Narrative Agent
- Assessment Agent, Curiosity Agent, Research Agent
- Laboratory Agent, Application Agent

No imports, no references, no mutations from these agents.

## Out of Scope

This phase does NOT implement:

- Example content generation
- Exercise generation
- Worked-solution generation
- Code generation
- Educational reasoning
- Adaptive sequencing
- Automatic progression
- Tutoring systems
- LLM-based content creation

## Relationship with D10-OPT-01

This phase extends the canonical foundation established in D10-OPT-01:

- **D10-OPT-01** — Knowledge Contract & Concept Registry Kernel (canonical concepts)
- **D10-OPT-05** — Progressive Examples Modeling (example metadata)

Each example profile references a concept ID from the canonical concept registry.

## Relationship with D10-OPT-02

This phase complements the explanation layer established in D10-OPT-02:

- **D10-OPT-02** — Multi-Level Explanation Modeling (explanation metadata)
- **D10-OPT-05** — Progressive Examples Modeling (example metadata)

Explanations represent how a concept is presented at different depths, while examples represent concrete instances that illustrate the concept.

## Relationship with D10-OPT-03

This phase complements the component layer established in D10-OPT-03:

- **D10-OPT-03** — Concept Structure, Canonical Components (component metadata)
- **D10-OPT-05** — Progressive Examples Modeling (example metadata)

Components represent the internal structure of a concept, while examples represent concrete instances that demonstrate the concept.

## Relationship with D10-OPT-04

This phase complements the representation layer established in D10-OPT-04:

- **D10-OPT-04** — Multimodal Representation Modeling (representation metadata)
- **D10-OPT-05** — Progressive Examples Modeling (example metadata)

Representations define the modality through which a concept is communicated, while examples provide concrete instances within those modalities.
