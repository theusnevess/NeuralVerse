# D10-OPT-12 — Assessment Metadata Modeling

## Purpose

This phase defines the canonical Assessment Metadata Layer for the Knowledge Agent. It extends the Knowledge Pipeline with immutable metadata describing how canonical knowledge may be associated with assessments without creating, executing, evaluating, grading, or adapting assessments. The implementation remains a pure metadata layer that must never perform any educational reasoning or execute assessment logic.

## Motivation

The Knowledge Agent requires a structured way to represent that concepts can be associated with assessments. A concept may need:

- Concept checks for quick verification
- Multiple choice questions for structured testing
- Short answer questions for written responses
- Worked problems for guided solutions
- Proof assignments for formal reasoning
- Implementation tasks for practical application
- Projects for comprehensive work
- Laboratory assessments for hands-on evaluation
- Oral assessments for verbal demonstration
- Capstone projects for integrated mastery

These assessments are organized by type, objective, and difficulty. The assessment layer models this structure without executing content.

## Architecture

```
KnowledgeAgentContract.ts          — Canonical enums and contracts
KnowledgeAssessmentKernel.ts       — Deterministic composition functions
KnowledgeAssessmentValidation.ts   — Structured validation (never throws)
KnowledgeAssessmentKernel.test.ts  — Comprehensive test suite
index.ts                           — Public API surface
```

## Canonical Enums

### Assessment Types (10 values)

```typescript
CANONICAL_ASSESSMENT_TYPES = [
  'concept_check', 'multiple_choice', 'short_answer', 'worked_problem',
  'proof', 'implementation_task', 'project', 'laboratory_assessment',
  'oral_assessment', 'capstone'
]
```

### Assessment Objectives (10 values)

```typescript
CANONICAL_ASSESSMENT_OBJECTIVES = [
  'introduce', 'reinforce', 'verify', 'apply', 'analyze',
  'integrate', 'evaluate', 'master', 'review', 'reference'
]
```

### Assessment Difficulty (10 values)

```typescript
CANONICAL_ASSESSMENT_DIFFICULTY = [
  'minimal', 'easy', 'standard', 'intermediate', 'advanced',
  'expert', 'engineering', 'research', 'reference', 'canonical'
]
```

### Assessment Status (6 values)

```typescript
CANONICAL_ASSESSMENT_STATUS = [
  'draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'
]
```

### Assessment Visibility (10 values)

```typescript
CANONICAL_ASSESSMENT_VISIBILITY = [
  'always', 'default', 'advanced', 'expert', 'curriculum',
  'assessment', 'laboratory', 'research', 'internal', 'hidden'
]
```

### Assessment Governance (10 values)

```typescript
CANONICAL_ASSESSMENT_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental', 'deprecated',
  'restricted', 'internal', 'public', 'community', 'archived'
]
```

## Contracts

### KnowledgeAssessmentProvenance

Canonical provenance metadata for assessment profiles.

```typescript
interface KnowledgeAssessmentProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: AssessmentGovernance;
}
```

### KnowledgeAssessmentDecision

Governance decision metadata for assessments.

```typescript
interface KnowledgeAssessmentDecision {
  readonly decisionId: string;
  readonly assessmentId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeAssessmentTrace

Deterministic trace metadata for assessment composition.

```typescript
interface KnowledgeAssessmentTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeAssessmentDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_assessment_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeAssessmentProfile

Represents one assessment record for a governed concept.

```typescript
interface KnowledgeAssessmentProfile {
  readonly assessmentId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly assessmentType: AssessmentType;
  readonly objective: AssessmentObjective;
  readonly difficulty: AssessmentDifficulty;
  readonly visibility: AssessmentVisibility;
  readonly status: AssessmentStatus;
  readonly governance: AssessmentGovernance;
  readonly estimatedDuration: number;
  readonly competencyReferences: readonly string[];
  readonly tags: readonly string[];
  readonly provenance: KnowledgeAssessmentProvenance;
}
```

### KnowledgeAssessmentRelationship

Links assessment records belonging to related assessments.

```typescript
interface KnowledgeAssessmentRelationship {
  readonly relationshipId: string;
  readonly sourceAssessmentId: string;
  readonly targetAssessmentId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeAssessmentProvenance;
}
```

### KnowledgeAssessmentRegistryMetadata

```typescript
interface KnowledgeAssessmentRegistryMetadata {
  readonly registryId: string;
  readonly assessmentCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly typeCount: number;
}
```

### KnowledgeAssessmentRegistry

Immutable registry of assessment profiles and relationships.

```typescript
interface KnowledgeAssessmentRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeAssessmentProfile[];
  readonly relationships: readonly KnowledgeAssessmentRelationship[];
  readonly metadata: KnowledgeAssessmentRegistryMetadata;
  readonly trace: KnowledgeAssessmentTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_assessment_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeAssessmentInput

Canonical input structure for composition.

```typescript
interface KnowledgeAssessmentInput {
  readonly profiles: readonly KnowledgeAssessmentProfile[];
  readonly relationships: readonly KnowledgeAssessmentRelationship[];
}
```

### KnowledgeArtifactWithAssessments

Associates canonical concepts with assessment metadata.

```typescript
interface KnowledgeArtifactWithAssessments {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeAssessmentProfile[];
  readonly relationships: readonly KnowledgeAssessmentRelationship[];
  readonly provenance: KnowledgeAssessmentProvenance;
}
```

## Registry

The registry is an immutable, deterministically ordered collection of assessment profiles and relationships. It enforces:

- **Stable ordering** — profiles sorted by conceptId, then assessmentType, then difficulty, then assessmentId
- **Deterministic metadata** — counts computed from sorted profiles
- **Trace completeness** — every composition produces a trace with decisions
- **Relationship integrity** — relationships reference valid profiles

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeAssessmentProvenance()` | Creates KnowledgeAssessmentProvenance |
| `composeKnowledgeAssessmentTrace()` | Creates KnowledgeAssessmentTrace |
| `composeKnowledgeAssessmentProfile()` | Creates KnowledgeAssessmentProfile |
| `composeKnowledgeAssessmentRelationship()` | Creates KnowledgeAssessmentRelationship |
| `composeKnowledgeAssessmentRegistry()` | Creates KnowledgeAssessmentRegistry |
| `composeKnowledgeAssessmentRegistryFromInput()` | Creates registry from input |
| `composeKnowledgeAssessments()` | Creates complete registry with trace |
| `composeKnowledgeArtifactWithAssessments()` | Creates artifact with assessments |

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeAssessmentProfile()` | Validates a single profile |
| `validateKnowledgeAssessmentRelationship()` | Validates a relationship |
| `validateKnowledgeAssessmentRegistry()` | Validates a complete registry |
| `validateKnowledgeAssessmentInput()` | Validates input before composition |
| `validateKnowledgeAssessmentTrace()` | Validates trace integrity |
| `validateKnowledgeArtifactWithAssessments()` | Validates artifact association |

### Validation Codes (exactly 20, prefix ASSESSMENT_)

| Code | Description |
|------|-------------|
| `ASSESSMENT_DUPLICATE_ID` | Duplicate profile ID in registry |
| `ASSESSMENT_DUPLICATE_TITLE` | Duplicate profile title in registry |
| `ASSESSMENT_INVALID_TYPE` | Unsupported assessment type |
| `ASSESSMENT_INVALID_OBJECTIVE` | Unsupported assessment objective |
| `ASSESSMENT_INVALID_DIFFICULTY` | Unsupported difficulty level |
| `ASSESSMENT_INVALID_VISIBILITY` | Unsupported visibility level |
| `ASSESSMENT_INVALID_STATUS` | Unsupported assessment status |
| `ASSESSMENT_INVALID_GOVERNANCE` | Unsupported governance value |
| `ASSESSMENT_MISSING_PROVENANCE` | Profile missing provenance |
| `ASSESSMENT_MISSING_PROVIDER` | Provenance missing provider |
| `ASSESSMENT_MISSING_RATIONALE` | Provenance missing rationale |
| `ASSESSMENT_MISSING_CONCEPT_REFERENCE` | Profile missing concept reference |
| `ASSESSMENT_MISSING_PROFILE_ID` | Profile missing profile ID |
| `ASSESSMENT_MISSING_TITLE` | Profile missing title |
| `ASSESSMENT_SELF_RELATIONSHIP` | Relationship references itself |
| `ASSESSMENT_EMPTY_REGISTRY` | Registry has no profiles |
| `ASSESSMENT_INVALID_TRACE` | Trace has invalid properties |
| `ASSESSMENT_REGISTRY_INCONSISTENCY` | Metadata count mismatch |
| `ASSESSMENT_INVALID_CONFIGURATION` | Invalid relationship configuration |
| `ASSESSMENT_INVALID_ORDER` | Invalid profile ordering |

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
- Assessment generation, question generation
- Quiz generation, grading, automatic scoring
- Competency evaluation, adaptive assessment
- Student diagnosis, feedback generation
- Rubric generation, difficulty adaptation
- Exam execution, assessment orchestration
- LLM invocation

## Public API

Everything is exported through `index.ts`:

- **Contracts** — types and constants
- **Kernel** — compose functions and helpers
- **Validation** — validators and codes

## Backward Compatibility

This phase preserves full backward compatibility with D10-OPT-01 through D10-OPT-11. All previous exports remain unchanged and functional.
