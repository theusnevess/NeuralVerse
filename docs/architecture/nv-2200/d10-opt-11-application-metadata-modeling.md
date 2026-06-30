# D10-OPT-11 — Application Metadata

## Purpose

This phase defines the canonical Application Metadata Layer for the Knowledge Agent. It is responsible only for modeling metadata describing how a canonical knowledge concept may be connected to real-world applications. This module does not execute applications, recommend technologies, generate projects, or produce implementation plans. It is a deterministic metadata layer only.

## Motivation

The Knowledge Agent requires a structured way to represent that concepts can be connected to real-world applications. A concept may need:

- Software systems for general computing
- Embedded systems for hardware integration
- Web applications for browser-based deployment
- Mobile applications for handheld devices
- Machine learning systems for AI applications
- Computer vision systems for image processing
- Robotics systems for autonomous control
- Data platforms for data management
- Cloud services for distributed computing
- Research prototypes for experimental work

These applications are organized by type, objective, and domain. The application layer models this structure without executing content.

## Architecture

```
KnowledgeAgentContract.ts          — Canonical enums and contracts
KnowledgeApplicationKernel.ts      — Deterministic composition functions
KnowledgeApplicationValidation.ts  — Structured validation (never throws)
KnowledgeApplicationKernel.test.ts — Comprehensive test suite
index.ts                           — Public API surface
```

## Canonical Enums

### Application Types (10 values)

```typescript
CANONICAL_APPLICATION_TYPES = [
  'software_system', 'embedded_system', 'web_application',
  'mobile_application', 'machine_learning_system', 'computer_vision_system',
  'robotics_system', 'data_platform', 'cloud_service', 'research_prototype'
]
```

### Application Objectives (10 values)

```typescript
CANONICAL_APPLICATION_OBJECTIVES = [
  'introduce', 'demonstrate', 'apply', 'integrate', 'optimize',
  'analyze', 'compare', 'engineer', 'deploy', 'reference'
]
```

### Application Domains (10 values)

```typescript
CANONICAL_APPLICATION_DOMAINS = [
  'artificial_intelligence', 'computer_vision', 'machine_learning',
  'robotics', 'software_engineering', 'data_science',
  'cybersecurity', 'cloud_computing', 'healthcare', 'industrial_automation'
]
```

### Application Status (6 values)

```typescript
CANONICAL_APPLICATION_STATUS = [
  'draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'
]
```

### Application Visibility (10 values)

```typescript
CANONICAL_APPLICATION_VISIBILITY = [
  'always', 'default', 'advanced', 'expert', 'curriculum',
  'assessment', 'laboratory', 'research', 'internal', 'hidden'
]
```

### Application Governance (10 values)

```typescript
CANONICAL_APPLICATION_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental', 'deprecated',
  'restricted', 'internal', 'public', 'community', 'archived'
]
```

## Contracts

### KnowledgeApplicationProvenance

Canonical provenance metadata for application profiles.

```typescript
interface KnowledgeApplicationProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ApplicationGovernance;
}
```

### KnowledgeApplicationDecision

Governance decision metadata for applications.

```typescript
interface KnowledgeApplicationDecision {
  readonly decisionId: string;
  readonly applicationId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeApplicationTrace

Deterministic trace metadata for application composition.

```typescript
interface KnowledgeApplicationTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeApplicationDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_application_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeApplicationProfile

Represents one application record for a governed concept.

```typescript
interface KnowledgeApplicationProfile {
  readonly applicationId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly applicationType: ApplicationType;
  readonly applicationObjective: ApplicationObjective;
  readonly applicationDomain: ApplicationDomain;
  readonly industrySector: string;
  readonly deploymentContext: string;
  readonly implementationScope: string;
  readonly visibility: ApplicationVisibility;
  readonly status: ApplicationStatus;
  readonly governance: ApplicationGovernance;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeApplicationProvenance;
}
```

### KnowledgeApplicationRelationship

Links application records belonging to related applications.

```typescript
interface KnowledgeApplicationRelationship {
  readonly relationshipId: string;
  readonly sourceApplicationId: string;
  readonly targetApplicationId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeApplicationProvenance;
}
```

### KnowledgeApplicationRegistryMetadata

```typescript
interface KnowledgeApplicationRegistryMetadata {
  readonly registryId: string;
  readonly applicationCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly domainCount: number;
}
```

### KnowledgeApplicationRegistry

Immutable registry of application profiles and relationships.

```typescript
interface KnowledgeApplicationRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeApplicationProfile[];
  readonly relationships: readonly KnowledgeApplicationRelationship[];
  readonly metadata: KnowledgeApplicationRegistryMetadata;
  readonly trace: KnowledgeApplicationTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_application_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeApplicationInput

Canonical input structure for composition.

```typescript
interface KnowledgeApplicationInput {
  readonly profiles: readonly KnowledgeApplicationProfile[];
  readonly relationships: readonly KnowledgeApplicationRelationship[];
}
```

### KnowledgeArtifactWithApplications

Associates canonical concepts with application metadata.

```typescript
interface KnowledgeArtifactWithApplications {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeApplicationProfile[];
  readonly relationships: readonly KnowledgeApplicationRelationship[];
  readonly provenance: KnowledgeApplicationProvenance;
}
```

## Registry

The registry is an immutable, deterministically ordered collection of application profiles and relationships. It enforces:

- **Stable ordering** — profiles sorted by conceptId, then applicationDomain, then applicationType, then applicationId
- **Deterministic metadata** — counts computed from sorted profiles
- **Trace completeness** — every composition produces a trace with decisions
- **Relationship integrity** — relationships reference valid profiles

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeApplicationProvenance()` | Creates KnowledgeApplicationProvenance |
| `composeKnowledgeApplicationTrace()` | Creates KnowledgeApplicationTrace |
| `composeKnowledgeApplicationProfile()` | Creates KnowledgeApplicationProfile |
| `composeKnowledgeApplicationRelationship()` | Creates KnowledgeApplicationRelationship |
| `composeKnowledgeApplicationRegistry()` | Creates KnowledgeApplicationRegistry |
| `composeKnowledgeApplicationRegistryFromInput()` | Creates registry from input |
| `composeKnowledgeApplications()` | Creates complete registry with trace |
| `composeKnowledgeArtifactWithApplications()` | Creates artifact with applications |

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeApplicationProfile()` | Validates a single profile |
| `validateKnowledgeApplicationRelationship()` | Validates a relationship |
| `validateKnowledgeApplicationRegistry()` | Validates a complete registry |
| `validateKnowledgeApplicationInput()` | Validates input before composition |
| `validateKnowledgeApplicationTrace()` | Validates trace integrity |
| `validateKnowledgeArtifactWithApplications()` | Validates artifact association |

### Validation Codes (exactly 20, prefix APPLICATION_)

| Code | Description |
|------|-------------|
| `APPLICATION_DUPLICATE_ID` | Duplicate profile ID in registry |
| `APPLICATION_DUPLICATE_TITLE` | Duplicate profile title in registry |
| `APPLICATION_INVALID_TYPE` | Unsupported application type |
| `APPLICATION_INVALID_OBJECTIVE` | Unsupported application objective |
| `APPLICATION_INVALID_DOMAIN` | Unsupported application domain |
| `APPLICATION_INVALID_VISIBILITY` | Unsupported visibility level |
| `APPLICATION_INVALID_STATUS` | Unsupported application status |
| `APPLICATION_INVALID_GOVERNANCE` | Unsupported governance value |
| `APPLICATION_MISSING_PROVENANCE` | Profile missing provenance |
| `APPLICATION_MISSING_PROVIDER` | Provenance missing provider |
| `APPLICATION_MISSING_RATIONALE` | Provenance missing rationale |
| `APPLICATION_MISSING_CONCEPT_REFERENCE` | Profile missing concept reference |
| `APPLICATION_MISSING_PROFILE_ID` | Profile missing profile ID |
| `APPLICATION_MISSING_TITLE` | Profile missing title |
| `APPLICATION_SELF_RELATIONSHIP` | Relationship references itself |
| `APPLICATION_EMPTY_REGISTRY` | Registry has no profiles |
| `APPLICATION_INVALID_TRACE` | Trace has invalid properties |
| `APPLICATION_REGISTRY_INCONSISTENCY` | Metadata count mismatch |
| `APPLICATION_INVALID_CONFIGURATION` | Invalid relationship configuration |
| `APPLICATION_INVALID_ORDER` | Invalid profile ordering |

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

The Application Layer operates under strict governance:

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
- Application execution, project generation
- Code generation, deployment execution
- Container execution, Docker, Kubernetes
- Terraform, cloud provisioning
- Technology recommendation, framework recommendation
- Implementation planning, workflow execution
- LLM invocation

## Cross-Agent Boundaries

Production code must NOT reference:

- Didactic Agent, Curriculum Agent, Narrative Agent
- Assessment Agent, Curiosity Agent, Research Agent
- Laboratory Agent, Application Agent

No imports, no references, no mutations from these agents.

## Out of Scope

This phase does NOT implement:

- Application content generation
- Project generation
- Code generation
- Deployment execution
- Technology recommendation
- Framework recommendation
- Implementation planning
- Workflow execution
- LLM-based content creation

## Relationship with D10-OPT-01

This phase extends the canonical foundation established in D10-OPT-01:

- **D10-OPT-01** — Knowledge Contract & Concept Registry Kernel (canonical concepts)
- **D10-OPT-11** — Application Metadata (application metadata)

Each application profile references a concept ID from the canonical concept registry.

## Backward Compatibility

This phase preserves full backward compatibility with D10-OPT-01 through D10-OPT-10. All previous exports remain unchanged and functional.
