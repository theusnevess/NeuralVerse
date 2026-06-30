# D10-OPT-09 — Laboratory Metadata

## Purpose

This phase defines the canonical Laboratory Metadata Layer for the Knowledge Agent. It defines metadata describing how a knowledge concept relates to laboratories, experiments, simulations and practical activities, without implementing or executing any laboratory. This module does not generate experiments, simulations, notebooks, exercises, code, laboratory workflows, or runtime execution. It exists exclusively to provide structured metadata for future Laboratory systems.

## Motivation

The Knowledge Agent requires a structured way to represent that concepts can be communicated through laboratories. A concept may need:

- Interactive laboratories for hands-on learning
- Simulation references for virtual experiments
- Coding laboratories for programming practice
- Mathematical laboratories for formal exercises
- Computer vision laboratories for image processing
- Machine learning laboratories for model training
- Data science laboratories for data analysis
- Engineering laboratories for applied practice
- Research laboratories for investigation
- Experimental workbenches for exploration

These laboratories are organized by type, objective, and complexity. The laboratory layer models this structure without executing content.

## Architecture

```
KnowledgeAgentContract.ts          — Canonical enums and contracts
KnowledgeLaboratoryKernel.ts       — Deterministic composition functions
KnowledgeLaboratoryValidation.ts   — Structured validation (never throws)
KnowledgeLaboratoryKernel.test.ts  — Comprehensive test suite
index.ts                           — Public API surface
```

## Canonical Enums

### Laboratory Types (10 values)

```typescript
CANONICAL_LABORATORY_TYPES = [
  'interactive_laboratory', 'simulation_reference', 'coding_laboratory',
  'mathematical_laboratory', 'computer_vision_laboratory',
  'machine_learning_laboratory', 'data_science_laboratory',
  'engineering_laboratory', 'research_laboratory', 'experimental_workbench'
]
```

### Laboratory Objectives (10 values)

```typescript
CANONICAL_LABORATORY_OBJECTIVES = [
  'introduce', 'demonstrate', 'explore', 'experiment', 'implement',
  'validate', 'compare', 'optimize', 'investigate', 'master'
]
```

### Laboratory Complexity (10 values)

```typescript
CANONICAL_LABORATORY_COMPLEXITY = [
  'minimal', 'simple', 'standard', 'intermediate', 'advanced',
  'expert', 'engineering', 'research', 'reference', 'canonical'
]
```

### Laboratory Status (6 values)

```typescript
CANONICAL_LABORATORY_STATUS = [
  'draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'
]
```

### Laboratory Visibility (10 values)

```typescript
CANONICAL_LABORATORY_VISIBILITY = [
  'always', 'default', 'advanced', 'expert', 'curriculum',
  'assessment', 'laboratory', 'research', 'internal', 'hidden'
]
```

### Laboratory Governance (10 values)

```typescript
CANONICAL_LABORATORY_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental', 'deprecated',
  'restricted', 'internal', 'public', 'community', 'archived'
]
```

## Contracts

### KnowledgeLaboratoryProvenance

Canonical provenance metadata for laboratory profiles.

```typescript
interface KnowledgeLaboratoryProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: LaboratoryGovernance;
}
```

### KnowledgeLaboratoryDecision

Governance decision metadata for laboratories.

```typescript
interface KnowledgeLaboratoryDecision {
  readonly decisionId: string;
  readonly laboratoryId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeLaboratoryTrace

Deterministic trace metadata for laboratory composition.

```typescript
interface KnowledgeLaboratoryTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeLaboratoryDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeLaboratoryProfile

Represents one laboratory for a governed concept.

```typescript
interface KnowledgeLaboratoryProfile {
  readonly laboratoryId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly laboratoryType: LaboratoryType;
  readonly objective: LaboratoryObjective;
  readonly complexity: LaboratoryComplexity;
  readonly visibility: LaboratoryVisibility;
  readonly status: LaboratoryStatus;
  readonly governance: LaboratoryGovernance;
  readonly orderIndex: number;
  readonly tags: readonly string[];
  readonly resourceReferences: readonly string[];
  readonly provenance: KnowledgeLaboratoryProvenance;
}
```

### KnowledgeLaboratoryRelationship

Links laboratories belonging to related activities.

```typescript
interface KnowledgeLaboratoryRelationship {
  readonly relationshipId: string;
  readonly sourceLaboratoryId: string;
  readonly targetLaboratoryId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeLaboratoryProvenance;
}
```

### KnowledgeLaboratoryRegistryMetadata

```typescript
interface KnowledgeLaboratoryRegistryMetadata {
  readonly registryId: string;
  readonly laboratoryCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly laboratoryTypeCount: number;
}
```

### KnowledgeLaboratoryRegistry

Immutable registry of laboratory profiles and relationships.

```typescript
interface KnowledgeLaboratoryRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeLaboratoryProfile[];
  readonly relationships: readonly KnowledgeLaboratoryRelationship[];
  readonly metadata: KnowledgeLaboratoryRegistryMetadata;
  readonly trace: KnowledgeLaboratoryTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeLaboratoryInput

Canonical input structure for composition.

```typescript
interface KnowledgeLaboratoryInput {
  readonly profiles: readonly KnowledgeLaboratoryProfile[];
  readonly relationships: readonly KnowledgeLaboratoryRelationship[];
}
```

### KnowledgeArtifactWithLaboratories

Associates canonical concepts with laboratory metadata.

```typescript
interface KnowledgeArtifactWithLaboratories {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeLaboratoryProfile[];
  readonly relationships: readonly KnowledgeLaboratoryRelationship[];
  readonly provenance: KnowledgeLaboratoryProvenance;
}
```

## Registry

The registry is an immutable, deterministically ordered collection of laboratory profiles and relationships. It enforces:

- **Stable ordering** — profiles sorted by conceptId, then laboratoryType, then orderIndex, then laboratoryId
- **Deterministic metadata** — counts computed from sorted profiles
- **Trace completeness** — every composition produces a trace with decisions
- **Relationship integrity** — relationships reference valid profiles

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeLaboratoryProvenance()` | Creates KnowledgeLaboratoryProvenance |
| `composeKnowledgeLaboratoryTrace()` | Creates KnowledgeLaboratoryTrace |
| `composeKnowledgeLaboratoryProfile()` | Creates KnowledgeLaboratoryProfile |
| `composeKnowledgeLaboratoryRelationship()` | Creates KnowledgeLaboratoryRelationship |
| `composeKnowledgeLaboratoryRegistry()` | Creates KnowledgeLaboratoryRegistry |
| `composeKnowledgeLaboratoryRegistryFromInput()` | Creates registry from input |
| `composeKnowledgeLaboratories()` | Creates complete registry with trace |
| `composeKnowledgeArtifactWithLaboratories()` | Creates artifact with laboratories |

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeLaboratoryProfile()` | Validates a single profile |
| `validateKnowledgeLaboratoryRelationship()` | Validates a relationship |
| `validateKnowledgeLaboratoryRegistry()` | Validates a complete registry |
| `validateKnowledgeLaboratoryInput()` | Validates input before composition |
| `validateKnowledgeLaboratoryTrace()` | Validates trace integrity |
| `validateKnowledgeArtifactWithLaboratories()` | Validates artifact association |

### Validation Codes (exactly 20, prefix LABORATORY_)

| Code | Description |
|------|-------------|
| `LABORATORY_DUPLICATE_ID` | Duplicate profile ID in registry |
| `LABORATORY_DUPLICATE_TITLE` | Duplicate profile title in registry |
| `LABORATORY_INVALID_TYPE` | Unsupported laboratory type |
| `LABORATORY_INVALID_OBJECTIVE` | Unsupported laboratory objective |
| `LABORATORY_INVALID_COMPLEXITY` | Unsupported complexity level |
| `LABORATORY_INVALID_VISIBILITY` | Unsupported visibility level |
| `LABORATORY_INVALID_STATUS` | Unsupported laboratory status |
| `LABORATORY_INVALID_GOVERNANCE` | Unsupported governance value |
| `LABORATORY_MISSING_PROVENANCE` | Profile missing provenance |
| `LABORATORY_MISSING_PROVIDER` | Provenance missing provider |
| `LABORATORY_MISSING_RATIONALE` | Provenance missing rationale |
| `LABORATORY_MISSING_CONCEPT_REFERENCE` | Profile missing concept reference |
| `LABORATORY_MISSING_PROFILE_ID` | Profile missing profile ID |
| `LABORATORY_MISSING_TITLE` | Profile missing title |
| `LABORATORY_SELF_RELATIONSHIP` | Relationship references itself |
| `LABORATORY_EMPTY_REGISTRY` | Registry has no profiles |
| `LABORATORY_INVALID_TRACE` | Trace has invalid properties |
| `LABORATORY_REGISTRY_INCONSISTENCY` | Metadata count mismatch |
| `LABORATORY_INVALID_CONFIGURATION` | Invalid relationship configuration |
| `LABORATORY_INVALID_ORDER` | Invalid profile ordering |

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

The Laboratory Layer operates under strict governance:

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
- Laboratory execution, simulation execution
- Experiment execution, Python execution
- Jupyter execution, notebook execution
- Code execution, exercise generation
- Grading, runtime orchestration
- Workflow engines, Docker, VMs
- LLM invocation

## Cross-Agent Boundaries

Production code must NOT reference:

- Didactic Agent, Curriculum Agent, Narrative Agent
- Assessment Agent, Curiosity Agent, Research Agent
- Laboratory Agent, Application Agent

No imports, no references, no mutations from these agents.

## Out of Scope

This phase does NOT implement:

- Laboratory content generation
- Experiment execution
- Simulation execution
- Notebook execution
- Python execution
- Code execution
- Exercise generation
- Grading systems
- Runtime orchestration
- Workflow engines
- LLM-based content creation

## Relationship with D10-OPT-01

This phase extends the canonical foundation established in D10-OPT-01:

- **D10-OPT-01** — Knowledge Contract & Concept Registry Kernel (canonical concepts)
- **D10-OPT-09** — Laboratory Metadata (laboratory metadata)

Each laboratory profile references a concept ID from the canonical concept registry.

## Backward Compatibility

This phase preserves full backward compatibility with D10-OPT-01 through D10-OPT-08. All previous exports remain unchanged and functional.
