# D9-OPT-07 — Unexpected Connection, Limitation Warning & Application Surprise Modeling

## Purpose

This phase extends the Curiosity Agent with Unexpected Connection, Limitation Warning & Application Surprise Modeling, enabling the platform to define the deterministic metadata model describing how unexpected connections, limitation warnings, and application surprises may be represented inside the Curiosity Agent.

## Motivation

The Curiosity Agent frequently presents information like:

- "This mathematical trick is also used inside JPEG compression."
- "This elegant algorithm completely fails when memory becomes the bottleneck."
- "Ironically, this technology was invented for a completely different industry."

These are not explanations. They are metadata describing curiosity opportunities. This phase models those opportunities.

## Architecture

The Unexpected Connection Kernel follows the same architectural patterns established by D9-OPT-01 through D9-OPT-06:

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

## Canonical Enums

### Connection Types (10 values)

| Connection Type | Description |
|-----------------|-------------|
| `cross_domain` | Cross-domain |
| `cross_discipline` | Cross-discipline |
| `historical` | Historical |
| `engineering` | Engineering |
| `scientific` | Scientific |
| `mathematical` | Mathematical |
| `technological` | Technological |
| `philosophical` | Philosophical |
| `industrial` | Industrial |
| `unexpected` | Unexpected |

### Limitation Types (10 values)

| Limitation Type | Description |
|-----------------|-------------|
| `computational` | Computational |
| `theoretical` | Theoretical |
| `physical` | Physical |
| `engineering` | Engineering |
| `mathematical` | Mathematical |
| `practical` | Practical |
| `economic` | Economic |
| `historical` | Historical |
| `ethical` | Ethical |
| `domain_specific` | Domain-specific |

### Surprise Types (10 values)

| Surprise Type | Description |
|---------------|-------------|
| `unexpected_application` | Unexpected application |
| `counterintuitive_result` | Counterintuitive result |
| `historical_fact` | Historical fact |
| `technology_origin` | Technology origin |
| `engineering_tradeoff` | Engineering tradeoff |
| `research_discovery` | Research discovery |
| `scientific_paradox` | Scientific paradox |
| `industrial_usage` | Industrial usage |
| `everyday_application` | Everyday application |
| `future_implication` | Future implication |

### Discovery Impact (10 values)

| Impact | Description |
|--------|-------------|
| `attention` | Attention |
| `engagement` | Engagement |
| `memory` | Memory |
| `understanding` | Understanding |
| `motivation` | Motivation |
| `reflection` | Reflection |
| `application` | Application |
| `perspective` | Perspective |
| `exploration` | Exploration |
| `retention` | Retention |

### Discovery Status (6 values)

| Status | Description |
|--------|-------------|
| `draft` | Draft |
| `review` | Under review |
| `approved` | Approved |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |

## Contracts

### UnexpectedConnectionProfile

```typescript
interface UnexpectedConnectionProfile {
  readonly id: string;
  readonly title: string;
  readonly connectionType: ConnectionType;
  readonly limitationType: LimitationType;
  readonly surpriseType: SurpriseType;
  readonly discoveryImpact: DiscoveryImpact;
  readonly conceptIds: readonly string[];
  readonly status: DiscoveryStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: UnexpectedConnectionProvenance;
  readonly trace: UnexpectedConnectionTrace;
}
```

### LimitationWarning

```typescript
interface LimitationWarning {
  readonly warningId: string;
  readonly title: string;
  readonly limitationType: LimitationType;
  readonly limitationDescription: string;
  readonly impactAssessment: string;
  readonly mitigationStrategy: string;
  readonly conceptIds: readonly string[];
  readonly status: DiscoveryStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: UnexpectedConnectionProvenance;
  readonly trace: UnexpectedConnectionTrace;
}
```

### ApplicationSurprise

```typescript
interface ApplicationSurprise {
  readonly surpriseId: string;
  readonly title: string;
  readonly surpriseType: SurpriseType;
  readonly originalContext: string;
  readonly unexpectedApplication: string;
  readonly whySurprising: string;
  readonly conceptIds: readonly string[];
  readonly status: DiscoveryStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: UnexpectedConnectionProvenance;
  readonly trace: UnexpectedConnectionTrace;
}
```

### DiscoveryRegistry

```typescript
interface DiscoveryRegistry {
  readonly registryId: string;
  readonly connections: readonly UnexpectedConnectionProfile[];
  readonly limitations: readonly LimitationWarning[];
  readonly surprises: readonly ApplicationSurprise[];
  readonly relationships: readonly DiscoveryRelationship[];
  readonly metadata: DiscoveryRegistryMetadata;
  readonly trace: UnexpectedConnectionTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_unexpected_connection_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Composition Functions

| Function | Description |
|----------|-------------|
| `composeUnexpectedConnectionProvenance` | Composes connection provenance from parameters |
| `composeUnexpectedConnectionTrace` | Composes a connection trace from metadata |
| `composeUnexpectedConnectionProfile` | Composes a connection profile from parameters |
| `composeLimitationWarning` | Composes a limitation warning from parameters |
| `composeApplicationSurprise` | Composes an application surprise from parameters |
| `composeDiscoveryRelationship` | Composes a discovery relationship from parameters |
| `composeDiscoveryRegistry` | Composes a discovery registry |
| `composeDiscoveryRegistryFromInput` | Composes a registry from input |
| `composeDiscoveries` | Main entry point for discoveries composition |
| `composeCuriosityArtifactWithDiscoveries` | Composes an artifact with discoveries |

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateUnexpectedConnectionProfile` | Validates a single connection profile |
| `validateLimitationWarning` | Validates a limitation warning |
| `validateApplicationSurprise` | Validates an application surprise |
| `validateDiscoveryRelationship` | Validates a discovery relationship |
| `validateDiscoveryRegistry` | Validates a discovery registry |
| `validateDiscoveryInput` | Validates discovery input |
| `validateDiscoveryTrace` | Validates a discovery trace |
| `validateCuriosityArtifactWithDiscoveries` | Validates an artifact with discoveries |

## Validation Codes (24 stable codes)

| Code | Description |
|------|-------------|
| `DISCOVERY_DUPLICATE_ID` | Duplicate connection ID |
| `DISCOVERY_DUPLICATE_TITLE` | Duplicate connection title |
| `DISCOVERY_INVALID_CONNECTION` | Invalid connection type |
| `DISCOVERY_INVALID_LIMITATION` | Invalid limitation type |
| `DISCOVERY_INVALID_SURPRISE` | Invalid surprise type |
| `DISCOVERY_INVALID_IMPACT` | Invalid discovery impact |
| `DISCOVERY_INVALID_STATUS` | Invalid discovery status |
| `DISCOVERY_INVALID_GOVERNANCE` | Invalid governance |
| `DISCOVERY_MISSING_PROVENANCE` | Missing provenance |
| `DISCOVERY_MISSING_PROVIDER` | Missing provider |
| `DISCOVERY_MISSING_RATIONALE` | Missing rationale |
| `DISCOVERY_MISSING_CURIOSITY_REFERENCE` | Missing curiosity reference |
| `DISCOVERY_MISSING_PROFILE_ID` | Missing profile ID |
| `DISCOVERY_MISSING_TITLE` | Missing title |
| `DISCOVERY_MISSING_DISCOVERY` | Missing discovery |
| `DISCOVERY_SELF_RELATIONSHIP` | Self-relationship |
| `DISCOVERY_EMPTY_REGISTRY` | Empty registry |
| `DISCOVERY_INVALID_TRACE` | Invalid trace |
| `DISCOVERY_REGISTRY_INCONSISTENCY` | Registry inconsistency |
| `DISCOVERY_INVALID_CONFIGURATION` | Invalid configuration |
| `DISCOVERY_INVALID_REFERENCE` | Invalid reference |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedConnectionType` | Type guard for connection types |
| `isSupportedLimitationType` | Type guard for limitation types |
| `isSupportedSurpriseType` | Type guard for surprise types |
| `isSupportedDiscoveryImpact` | Type guard for discovery impacts |
| `isSupportedDiscoveryStatus` | Type guard for discovery statuses |
| `isSupportedDiscoveryGovernance` | Type guard for governance values |
| `getCanonicalConnectionTypes` | Returns canonical connection types |
| `getCanonicalLimitationTypes` | Returns canonical limitation types |
| `getCanonicalSurpriseTypes` | Returns canonical surprise types |
| `getCanonicalDiscoveryImpacts` | Returns canonical discovery impacts |
| `getCanonicalDiscoveryStatuses` | Returns canonical discovery statuses |

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

- Generate unexpected connections
- Perform reasoning
- Infer relationships
- Search knowledge
- Generate analogies
- Modify Narrative Agent
- Modify Knowledge Agent
- Modify Didactic Agent
- Modify Research Agent
- Modify Laboratory Agent
- Modify Application Agent

Everything remains metadata.

## Runtime Limitations

This phase defines only metadata structures. No runtime discovery generation, reasoning, inference, or knowledge search exists.

## Out-of-Scope

- Unexpected connection generation
- Reasoning
- Relationship inference
- Knowledge search
- Analogy generation
- LLM invocation

## Relationship with D9-OPT-01

D9-OPT-07 extends D9-OPT-01 with Unexpected Connection, Limitation Warning & Application Surprise Modeling. The base curiosity metadata infrastructure established in D9-OPT-01 remains unchanged. D9-OPT-07 adds:

- New canonical enums for discovery modeling
- New contracts for connection profiles, limitation warnings, application surprises, and relationships
- New composition functions for discovery metadata
- New validation functions for discovery metadata
- Backward compatibility with D9-OPT-01

## Relationship with D9-OPT-02

D9-OPT-07 extends D9-OPT-02 with discovery modeling. The educational purpose modeling established in D9-OPT-02 remains unchanged. D9-OPT-07 adds:

- Connection type modeling
- Limitation type modeling
- Surprise type modeling
- Backward compatibility with D9-OPT-02

## Relationship with D9-OPT-03

D9-OPT-07 extends D9-OPT-03 with discovery modeling. The humor layer established in D9-OPT-03 remains unchanged. D9-OPT-07 adds:

- Discovery impact modeling
- Discovery status modeling
- Backward compatibility with D9-OPT-03

## Relationship with D9-OPT-04

D9-OPT-07 extends D9-OPT-04 with discovery modeling. The cultural reference governance established in D9-OPT-04 remains unchanged. D9-OPT-07 adds:

- Discovery relationship modeling
- Discovery registry structure
- Backward compatibility with D9-OPT-04

## Relationship with D9-OPT-05

D9-OPT-07 extends D9-OPT-05 with discovery modeling. The curiosity card, engineer note & field note modeling established in D9-OPT-05 remains unchanged. D9-OPT-07 adds:

- Unexpected connection profile modeling
- Limitation warning modeling
- Application surprise modeling
- Backward compatibility with D9-OPT-05

## Relationship with D9-OPT-06

D9-OPT-07 extends D9-OPT-06 with discovery modeling. The historical oddity, research trail & knowledge evolution curiosity modeling established in D9-OPT-06 remains unchanged. D9-OPT-07 adds:

- Cross-domain discovery modeling
- Cross-discipline discovery modeling
- Backward compatibility with D9-OPT-06

## Public Exports

The barrel export (`index.ts`) provides:

- **Contracts**: All interfaces and types
- **Kernel**: All composition functions
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
didactic-pipeline
research-pipeline
curriculum-pipeline
laboratory-pipeline
knowledge-pipeline
narrative-pipeline
assessment-pipeline
application-pipeline
runtime
frontend
shared
```
