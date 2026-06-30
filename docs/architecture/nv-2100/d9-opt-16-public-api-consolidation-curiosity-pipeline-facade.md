# D9-OPT-16 — Public API Consolidation & Curiosity Pipeline Facade

## Purpose

This phase extends the Curiosity Agent with the Public API Consolidation & Curiosity Pipeline Facade, enabling the platform to expose a single deterministic public facade over every Curiosity subsystem implemented throughout D9-OPT-01 through D9-OPT-15 without implementing new curiosity capabilities, business logic, or runtime behavior.

## Motivation

The Curiosity Agent contains the complete internal architecture across 15 optimization phases. This layer provides the official public API consolidation that exposes composition, validation, and certification through three clean entrypoints without exposing implementation complexity.

## Architectural Context

The facade consolidates:

- D9-OPT-01: Curiosity Registry
- D9-OPT-02: Educational Purpose
- D9-OPT-03: Humor Governance
- D9-OPT-04: Cultural References
- D9-OPT-05: Curiosity Cards
- D9-OPT-06: Knowledge Evolution
- D9-OPT-07: Unexpected Connections
- D9-OPT-08: Laboratory Curiosity
- D9-OPT-09: Misconception Curiosity
- D9-OPT-10: Presentation Metadata
- D9-OPT-11: Preference Metadata
- D9-OPT-12: Governance
- D9-OPT-13: Storage Metadata
- D9-OPT-14: Safety Certification
- D9-OPT-15: Structural Certification

No additional domains are introduced.

## Certification Philosophy

The facade is a pure deterministic orchestration layer. It never:

- Implements business logic
- Composes curiosity directly
- Certifies directly
- Validates logic internally
- Accesses external systems

The facade only delegates to existing kernels and engines.

## Public API

### Three Public Entrypoints

| Entrypoint | Description | Delegates To |
|------------|-------------|--------------|
| `composeCuriosityArtifact()` | Composes a curiosity artifact | `CuriosityKernel.composeCuriosity()` |
| `certifyCuriosityFacadeArtifact()` | Certifies a curiosity artifact | `CuriosityCertificationEngine.certifyCuriosityArtifact()` |
| `composeAndCertifyCuriosityArtifact()` | Composes and certifies in one pipeline | Both above in sequence |

## Architecture

The Curiosity Pipeline Facade follows the same architectural patterns established by D9-OPT-01 through D9-OPT-15:

- **Pure functions**: All composition and validation functions are pure, with no side effects
- **Immutable contracts**: All interfaces use `readonly` properties
- **Deterministic compose functions**: Composition functions produce identical output for identical input
- **Validation never throws**: Validation returns structured error results
- **Canonical enums as const tuples**: Enums are defined as `as const` arrays
- **Helper functions**: Type guards and canonical getters provide safe access
- **Barrel exports**: Public API is organized through index.ts
- **Defensive copies**: Arrays are copied before sorting
- **Stable ordering**: Deterministic sort comparators ensure consistent output
- **No side effects**: No filesystem, network, or external API access

## Canonical Enum

### Curiosity Facade Status (6 values)

| Status | Description |
|--------|-------------|
| `available` | Artifact available for use |
| `validated` | Artifact validated with warnings |
| `certified` | Artifact fully certified |
| `deprecated` | Artifact deprecated |
| `internal` | Internal use only |
| `legacy` | Legacy artifact |

## Contracts

### CuriosityFacadeArtifactResult

```typescript
interface CuriosityFacadeArtifactResult {
  readonly facadeStatus: CuriosityFacadeStatus;
  readonly artifact: CuriosityRegistry;
  readonly trace: CuriosityFacadeTraceMetadata;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_pipeline_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### CuriosityFacadeCertificationResult

```typescript
interface CuriosityFacadeCertificationResult {
  readonly facadeStatus: CuriosityFacadeStatus;
  readonly certificationReport: CuriosityCertificationReport;
  readonly trace: CuriosityFacadeTraceMetadata;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_pipeline_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### CuriosityFacadeCompleteResult

```typescript
interface CuriosityFacadeCompleteResult {
  readonly facadeStatus: CuriosityFacadeStatus;
  readonly artifact: CuriosityRegistry;
  readonly validation: CuriosityFacadeValidationResult;
  readonly certificationReport: CuriosityCertificationReport;
  readonly trace: CuriosityFacadeTraceMetadata;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_pipeline_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateCuriosityFacadeArtifact` | Validates a facade artifact result |
| `validateCuriosityFacadeCertification` | Validates a facade certification result |
| `validateCuriosityFacadeComplete` | Validates a facade complete result |

## Validation Codes (5 stable codes)

| Code | Description |
|------|-------------|
| `CURIOSITY_FACADE_MISSING_ARTIFACT` | Missing artifact |
| `CURIOSITY_FACADE_MISSING_VALIDATION` | Missing validation |
| `CURIOSITY_FACADE_MISSING_TRACE` | Missing trace |
| `CURIOSITY_FACADE_INVALID_STATUS` | Invalid facade status |
| `CURIOSITY_FACADE_MISSING_CERTIFICATION_REPORT` | Missing certification report |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedCuriosityFacadeStatus` | Type guard for facade statuses |
| `getCanonicalCuriosityFacadeStatuses` | Returns canonical facade statuses |

## Delegation Rules

The facade delegates exclusively:

- `composeCuriosityArtifact` → `CuriosityKernel.composeCuriosity()`
- `certifyCuriosityFacadeArtifact` → `CuriosityCertificationEngine.certifyCuriosityArtifact()`
- `composeAndCertifyCuriosityArtifact` → Both above in sequence

No business logic exists inside the facade.

## Determinism

All composition functions are deterministic:

- No `Math.random`
- No `Date.now`
- No `new Date`
- No `performance.now`
- No `crypto.randomUUID`
- No `Promise`
- No `async`/`await`
- No `fetch`
- No filesystem access
- No network access
- No environment variables

The test suite includes 100-iteration identity tests to verify determinism.

## Immutability

All contracts use `readonly` properties. Composition functions:

- Never mutate input
- Return immutable objects
- Sort deterministically using `[...array].sort(...)`
- Use defensive copies for arrays

## Cross-Agent Boundaries

The Curiosity Agent must NOT:

- Generate curiosity
- Create content
- Tell jokes
- Infer humor
- Evaluate humor
- Recommend curiosity
- Search knowledge
- Retrieve knowledge
- Run laboratory
- Execute experiments
- Reference Narrative Agent
- Reference Knowledge Agent
- Reference Assessment Agent
- Reference Didactic Agent
- Reference Research Agent
- Reference Laboratory Agent
- Reference Application Agent

Everything remains metadata.

## Runtime Limitations

This phase defines only metadata structures and orchestration. No runtime certification execution, content moderation, publication workflows, repair engines, generation engines, or live quality gates exist.

## Out-of-Scope

- New curiosity capabilities
- Business logic implementation
- Runtime certification execution
- Content moderation
- Publication workflow automation
- Repair engine implementation
- Generation engine implementation
- Live quality gate execution
- LLM invocation

## Public API Preservation

All exports from D9-OPT-01 through D9-OPT-15 remain available. Nothing removed, nothing renamed, nothing broken.

## Relationship with D9-OPT-01

D9-OPT-16 extends D9-OPT-01 by providing a public facade entrypoint for the curiosity registry. The base curiosity metadata infrastructure established in D9-OPT-01 remains unchanged. D9-OPT-16 adds:

- Facade entrypoint for composition
- Backward compatibility with D9-OPT-01

## Relationship with D9-OPT-02

D9-OPT-16 extends D9-OPT-02 by providing a public facade entrypoint. The educational purpose modeling established in D9-OPT-02 remains unchanged. D9-OPT-16 adds:

- Facade status modeling for educational purpose
- Backward compatibility with D9-OPT-02

## Relationship with D9-OPT-03

D9-OPT-16 extends D9-OPT-03 by providing a public facade entrypoint. The humor layer established in D9-OPT-03 remains unchanged. D9-OPT-16 adds:

- Facade status modeling for humor governance
- Backward compatibility with D9-OPT-03

## Relationship with D9-OPT-04

D9-OPT-16 extends D9-OPT-04 by providing a public facade entrypoint. The cultural reference governance established in D9-OPT-04 remains unchanged. D9-OPT-16 adds:

- Facade status modeling for cultural references
- Backward compatibility with D9-OPT-04

## Relationship with D9-OPT-05

D9-OPT-16 extends D9-OPT-05 by providing a public facade entrypoint. The curiosity card, engineer note & field note modeling established in D9-OPT-05 remains unchanged. D9-OPT-16 adds:

- Facade status modeling for curiosity cards
- Backward compatibility with D9-OPT-05

## Relationship with D9-OPT-06

D9-OPT-16 extends D9-OPT-06 by providing a public facade entrypoint. The historical oddity, research trail & knowledge evolution curiosity modeling established in D9-OPT-06 remains unchanged. D9-OPT-16 adds:

- Facade status modeling for knowledge evolution
- Backward compatibility with D9-OPT-06

## Relationship with D9-OPT-07

D9-OPT-16 extends D9-OPT-07 by providing a public facade entrypoint. The unexpected connection, limitation warning & application surprise modeling established in D9-OPT-07 remains unchanged. D9-OPT-16 adds:

- Facade status modeling for discoveries
- Backward compatibility with D9-OPT-07

## Relationship with D9-OPT-08

D9-OPT-16 extends D9-OPT-08 by providing a public facade entrypoint. The laboratory challenge, what-if prompt & experiment curiosity modeling established in D9-OPT-08 remains unchanged. D9-OPT-16 adds:

- Facade status modeling for laboratory curiosity
- Backward compatibility with D9-OPT-08

## Relationship with D9-OPT-09

D9-OPT-16 extends D9-OPT-09 by providing a public facade entrypoint. The misconception card & assessment reinforcement curiosity modeling established in D9-OPT-09 remains unchanged. D9-OPT-16 adds:

- Facade status modeling for misconceptions
- Backward compatibility with D9-OPT-09

## Relationship with D9-OPT-10

D9-OPT-16 extends D9-OPT-10 by providing a public facade entrypoint. The visual curiosity presentation & accessibility metadata established in D9-OPT-10 remains unchanged. D9-OPT-16 adds:

- Facade status modeling for presentation
- Backward compatibility with D9-OPT-10

## Relationship with D9-OPT-11

D9-OPT-16 extends D9-OPT-11 by providing a public facade entrypoint. The user preference, tone controls & placement rules established in D9-OPT-11 remains unchanged. D9-OPT-16 adds:

- Facade status modeling for preferences
- Backward compatibility with D9-OPT-11

## Relationship with D9-OPT-12

D9-OPT-16 extends D9-OPT-12 by providing a public facade entrypoint. The curiosity governance workflow & validation rules established in D9-OPT-12 remains unchanged. D9-OPT-16 adds:

- Facade status modeling for governance
- Backward compatibility with D9-OPT-12

## Relationship with D9-OPT-13

D9-OPT-16 extends D9-OPT-13 by providing a public facade entrypoint. The storage separation, retrieval strategy & contextual overlay modeling established in D9-OPT-13 remains unchanged. D9-OPT-16 adds:

- Facade status modeling for storage
- Backward compatibility with D9-OPT-13

## Relationship with D9-OPT-14

D9-OPT-16 extends D9-OPT-14 by providing a public facade entrypoint. The safety, accessibility & humor risk certification established in D9-OPT-14 remains unchanged. D9-OPT-16 adds:

- Facade status modeling for safety certification
- Backward compatibility with D9-OPT-14

## Relationship with D9-OPT-15

D9-OPT-16 extends D9-OPT-15 by providing a public facade entrypoint for structural certification. The curiosity certification & structural quality gate established in D9-OPT-15 remains unchanged. D9-OPT-16 adds:

- Facade entrypoint for certification
- Backward compatibility with D9-OPT-15

## Public Exports

The barrel export (`index.ts`) provides:

- **Contracts**: All interfaces and types
- **Facade**: All composition and delegation functions
- **Validation**: All validation functions and error codes
- **Helpers**: Type guards and canonical getters

## Repository Scope

### Allowed

```
src/agents/curiosity-pipeline/**
docs/architecture/nv-2100/**
```

### Forbidden

```
assessment-pipeline
didactic-pipeline
knowledge-pipeline
research-pipeline
laboratory-pipeline
application-pipeline
narrative-pipeline
runtime
frontend
shared
```
