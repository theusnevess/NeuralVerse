# D10-OPT-13 — Misconception Registry Modeling

## Purpose

This phase defines the canonical Misconception Registry Layer for the Knowledge Agent. It extends the Knowledge Pipeline with immutable metadata describing canonical misconceptions associated with knowledge concepts. This module is metadata only — it models misconceptions without detecting misconceptions, diagnosing learners, evaluating answers, or interacting with the Assessment Agent or Curiosity Agent.

## Motivation

The Knowledge Agent requires a structured way to represent that concepts may be associated with common misconceptions. A concept may need:

- Conceptual misconceptions about fundamental understanding
- Terminology misconceptions about naming and definitions
- Mathematical misconceptions about formal reasoning
- Algorithmic misconceptions about computational thinking
- Implementation misconceptions about coding practices
- Engineering misconceptions about system design
- Causal misconceptions about cause-and-effect relationships
- Historical misconceptions about development timelines
- Procedural misconceptions about step-by-step processes
- Interpretation misconceptions about meaning and context

These misconceptions are organized by type, severity, and corrective strategy. The misconception layer models this structure without detecting or diagnosing content.

## Architecture

```
KnowledgeAgentContract.ts            — Canonical enums and contracts
KnowledgeMisconceptionKernel.ts      — Deterministic composition functions
KnowledgeMisconceptionValidation.ts  — Structured validation (never throws)
KnowledgeMisconceptionKernel.test.ts — Comprehensive test suite
index.ts                             — Public API surface
```

## Canonical Enums

### Misconception Types (10 values)

```typescript
CANONICAL_MISCONCEPTION_TYPES = [
  'conceptual', 'terminology', 'mathematical', 'algorithmic',
  'implementation', 'engineering', 'causal', 'historical',
  'procedural', 'interpretation'
]
```

### Misconception Severity (10 values)

```typescript
CANONICAL_MISCONCEPTION_SEVERITY = [
  'minimal', 'low', 'moderate', 'significant', 'high',
  'critical', 'engineering', 'research', 'canonical', 'fundamental'
]
```

### Corrective Strategies (10 values)

```typescript
CANONICAL_CORRECTIVE_STRATEGIES = [
  'clarification', 'counterexample', 'comparison', 'worked_example',
  'visualization', 'mathematical_derivation', 'implementation_walkthrough',
  'historical_context', 'guided_reasoning', 'reference'
]
```

### Misconception Status (6 values)

```typescript
CANONICAL_MISCONCEPTION_STATUS = [
  'draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'
]
```

### Misconception Visibility (10 values)

```typescript
CANONICAL_MISCONCEPTION_VISIBILITY = [
  'always', 'default', 'advanced', 'expert', 'curriculum',
  'assessment', 'laboratory', 'research', 'internal', 'hidden'
]
```

### Misconception Governance (10 values)

```typescript
CANONICAL_MISCONCEPTION_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental', 'deprecated',
  'restricted', 'internal', 'public', 'community', 'archived'
]
```

## Contracts

### KnowledgeMisconceptionProvenance

Canonical provenance metadata for misconception profiles.

```typescript
interface KnowledgeMisconceptionProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: MisconceptionGovernance;
}
```

### KnowledgeMisconceptionDecision

Governance decision metadata for misconceptions.

```typescript
interface KnowledgeMisconceptionDecision {
  readonly decisionId: string;
  readonly misconceptionId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeMisconceptionTrace

Deterministic trace metadata for misconception composition.

```typescript
interface KnowledgeMisconceptionTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeMisconceptionDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_misconception_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeMisconceptionProfile

Represents one misconception record for a governed concept.

```typescript
interface KnowledgeMisconceptionProfile {
  readonly misconceptionId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly misconceptionType: MisconceptionType;
  readonly severity: MisconceptionSeverity;
  readonly correctiveStrategy: CorrectiveStrategy;
  readonly visibility: MisconceptionVisibility;
  readonly status: MisconceptionStatus;
  readonly governance: MisconceptionGovernance;
  readonly description: string;
  readonly commonCause: string;
  readonly references: readonly string[];
  readonly tags: readonly string[];
  readonly provenance: KnowledgeMisconceptionProvenance;
}
```

### KnowledgeMisconceptionRelationship

Links misconception records belonging to related misconceptions.

```typescript
interface KnowledgeMisconceptionRelationship {
  readonly relationshipId: string;
  readonly sourceMisconceptionId: string;
  readonly targetMisconceptionId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeMisconceptionProvenance;
}
```

### KnowledgeMisconceptionRegistryMetadata

```typescript
interface KnowledgeMisconceptionRegistryMetadata {
  readonly registryId: string;
  readonly misconceptionCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly typeCount: number;
}
```

### KnowledgeMisconceptionRegistry

Immutable registry of misconception profiles and relationships.

```typescript
interface KnowledgeMisconceptionRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeMisconceptionProfile[];
  readonly relationships: readonly KnowledgeMisconceptionRelationship[];
  readonly metadata: KnowledgeMisconceptionRegistryMetadata;
  readonly trace: KnowledgeMisconceptionTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_misconception_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeMisconceptionInput

Canonical input structure for composition.

```typescript
interface KnowledgeMisconceptionInput {
  readonly profiles: readonly KnowledgeMisconceptionProfile[];
  readonly relationships: readonly KnowledgeMisconceptionRelationship[];
}
```

### KnowledgeArtifactWithMisconceptions

Associates canonical concepts with misconception metadata.

```typescript
interface KnowledgeArtifactWithMisconceptions {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeMisconceptionProfile[];
  readonly relationships: readonly KnowledgeMisconceptionRelationship[];
  readonly provenance: KnowledgeMisconceptionProvenance;
}
```

## Registry

The registry is an immutable, deterministically ordered collection of misconception profiles and relationships. It enforces:

- **Stable ordering** — profiles sorted by conceptId, then misconceptionType, then severity, then misconceptionId
- **Deterministic metadata** — counts computed from sorted profiles
- **Trace completeness** — every composition produces a trace with decisions
- **Relationship integrity** — relationships reference valid profiles

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeMisconceptionProvenance()` | Creates KnowledgeMisconceptionProvenance |
| `composeKnowledgeMisconceptionTrace()` | Creates KnowledgeMisconceptionTrace |
| `composeKnowledgeMisconceptionProfile()` | Creates KnowledgeMisconceptionProfile |
| `composeKnowledgeMisconceptionRelationship()` | Creates KnowledgeMisconceptionRelationship |
| `composeKnowledgeMisconceptionRegistry()` | Creates KnowledgeMisconceptionRegistry |
| `composeKnowledgeMisconceptionRegistryFromInput()` | Creates registry from input |
| `composeKnowledgeMisconceptions()` | Creates complete registry with trace |
| `composeKnowledgeArtifactWithMisconceptions()` | Creates artifact with misconceptions |

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeMisconceptionProfile()` | Validates a single profile |
| `validateKnowledgeMisconceptionRelationship()` | Validates a relationship |
| `validateKnowledgeMisconceptionRegistry()` | Validates a complete registry |
| `validateKnowledgeMisconceptionInput()` | Validates input before composition |
| `validateKnowledgeMisconceptionTrace()` | Validates trace integrity |
| `validateKnowledgeArtifactWithMisconceptions()` | Validates artifact association |

### Validation Codes (exactly 20, prefix MISCONCEPTION_)

| Code | Description |
|------|-------------|
| `MISCONCEPTION_DUPLICATE_ID` | Duplicate profile ID in registry |
| `MISCONCEPTION_DUPLICATE_TITLE` | Duplicate profile title in registry |
| `MISCONCEPTION_INVALID_TYPE` | Unsupported misconception type |
| `MISCONCEPTION_INVALID_SEVERITY` | Unsupported severity level |
| `MISCONCEPTION_INVALID_CORRECTIVE_STRATEGY` | Unsupported corrective strategy |
| `MISCONCEPTION_INVALID_VISIBILITY` | Unsupported visibility level |
| `MISCONCEPTION_INVALID_STATUS` | Unsupported misconception status |
| `MISCONCEPTION_INVALID_GOVERNANCE` | Unsupported governance value |
| `MISCONCEPTION_MISSING_PROVENANCE` | Profile missing provenance |
| `MISCONCEPTION_MISSING_PROVIDER` | Provenance missing provider |
| `MISCONCEPTION_MISSING_RATIONALE` | Provenance missing rationale |
| `MISCONCEPTION_MISSING_CONCEPT_REFERENCE` | Profile missing concept reference |
| `MISCONCEPTION_MISSING_PROFILE_ID` | Profile missing profile ID |
| `MISCONCEPTION_MISSING_TITLE` | Profile missing title |
| `MISCONCEPTION_SELF_RELATIONSHIP` | Relationship references itself |
| `MISCONCEPTION_EMPTY_REGISTRY` | Registry has no profiles |
| `MISCONCEPTION_INVALID_TRACE` | Trace has invalid properties |
| `MISCONCEPTION_REGISTRY_INCONSISTENCY` | Metadata count mismatch |
| `MISCONCEPTION_INVALID_CONFIGURATION` | Invalid relationship configuration |
| `MISCONCEPTION_INVALID_ORDER` | Invalid profile ordering |

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

- Assessment Agent, Didactic Agent, Curriculum Agent
- Narrative Agent, Curiosity Agent, Research Agent
- Laboratory Agent, Application Agent

No imports, no references, no mutations from these agents.

## Runtime Restrictions

The following are forbidden in all kernel modules:

- `Math.random`, `Date.now`, `new Date`, `performance.now`
- `crypto.randomUUID`, `Promise`, `async`, `await`
- `fetch`, `filesystem`, `network`, `database`, `process.env`
- Misconception detection, learner diagnosis
- Answer evaluation, grading, adaptive remediation
- Feedback generation, student profiling
- Automatic misconception inference, knowledge tracing
- Educational reasoning, LLM invocation

## Public API

Everything is exported through `index.ts`:

- **Contracts** — types and constants
- **Kernel** — compose functions and helpers
- **Validation** — validators and codes

## Backward Compatibility

This phase preserves full backward compatibility with D10-OPT-01 through D10-OPT-12. All previous exports remain unchanged and functional.
