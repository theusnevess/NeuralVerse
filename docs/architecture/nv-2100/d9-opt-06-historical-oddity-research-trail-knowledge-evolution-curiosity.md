# D9-OPT-06 — Historical Oddity, Research Trail & Knowledge Evolution Curiosity

## Purpose

This phase extends the Curiosity Agent with Historical Oddity, Research Trail & Knowledge Evolution Curiosity modeling, enabling the platform to define the deterministic metadata model describing how historical oddities, scientific discoveries, engineering evolution, and research milestones may be represented inside the Curiosity Agent.

## Motivation

The Curiosity Agent must be capable of expressing how knowledge evolved, where discoveries occurred, how ideas changed through time, and historical milestones. This layer provides the deterministic metadata structures that enable this without performing any historical reasoning, timeline generation, or story creation.

## Architecture

The Knowledge Evolution Kernel follows the same architectural patterns established by D9-OPT-01 through D9-OPT-05:

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

### Discovery Types (10 values)

| Discovery Type | Description |
|----------------|-------------|
| `scientific_discovery` | Scientific discovery |
| `engineering_breakthrough` | Engineering breakthrough |
| `historical_oddity` | Historical oddity |
| `accidental_discovery` | Accidental discovery |
| `failed_experiment` | Failed experiment |
| `paradigm_shift` | Paradigm shift |
| `technology_evolution` | Technology evolution |
| `research_milestone` | Research milestone |
| `forgotten_knowledge` | Forgotten knowledge |
| `rediscovery` | Rediscovery |

### Evolution Stages (10 values)

| Stage | Description |
|-------|-------------|
| `origin` | Origin |
| `early_development` | Early development |
| `experimentation` | Experimentation |
| `validation` | Validation |
| `adoption` | Adoption |
| `optimization` | Optimization |
| `standardization` | Standardization |
| `decline` | Decline |
| `rediscovery` | Rediscovery |
| `modern_state` | Modern state |

### Research Trail Types (10 values)

| Trail Type | Description |
|------------|-------------|
| `chronological` | Chronological |
| `causal` | Causal |
| `technological` | Technological |
| `scientific` | Scientific |
| `engineering` | Engineering |
| `experimental` | Experimental |
| `comparative` | Comparative |
| `iterative` | Iterative |
| `cross_disciplinary` | Cross-disciplinary |
| `knowledge_chain` | Knowledge chain |

### Oddity Types (10 values)

| Oddity Type | Description |
|-------------|-------------|
| `unexpected_result` | Unexpected result |
| `historical_mistake` | Historical mistake |
| `engineering_failure` | Engineering failure |
| `scientific_myth` | Scientific myth |
| `counter_intuitive` | Counter-intuitive |
| `coincidence` | Coincidence |
| `unusual_fact` | Unusual fact |
| `forgotten_attempt` | Forgotten attempt |
| `surprising_origin` | Surprising origin |
| `legend_vs_reality` | Legend vs reality |

### Evolution Purposes (10 values)

| Purpose | Description |
|---------|-------------|
| `historical_understanding` | Historical understanding |
| `scientific_context` | Scientific context |
| `engineering_context` | Engineering context |
| `research_context` | Research context |
| `motivation` | Motivation |
| `reflection` | Reflection |
| `knowledge_connection` | Knowledge connection |
| `timeline_visualization` | Timeline visualization |
| `innovation_story` | Innovation story |
| `critical_thinking` | Critical thinking |

### Knowledge Evolution Status (6 values)

| Status | Description |
|--------|-------------|
| `draft` | Draft |
| `review` | Under review |
| `approved` | Approved |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |

## Contracts

### KnowledgeEvolutionProfile

```typescript
interface KnowledgeEvolutionProfile {
  readonly id: string;
  readonly title: string;
  readonly discoveryType: DiscoveryType;
  readonly evolutionStage: EvolutionStage;
  readonly researchTrailType: ResearchTrailType;
  readonly evolutionPurpose: EvolutionPurpose;
  readonly conceptIds: readonly string[];
  readonly status: KnowledgeEvolutionStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: KnowledgeEvolutionProvenance;
  readonly trace: KnowledgeEvolutionTrace;
}
```

### HistoricalOddity

```typescript
interface HistoricalOddity {
  readonly oddityId: string;
  readonly title: string;
  readonly oddityType: OddityType;
  readonly historicalContext: string;
  readonly unexpectedElement: string;
  readonly lessonLearned: string;
  readonly conceptIds: readonly string[];
  readonly status: KnowledgeEvolutionStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: KnowledgeEvolutionProvenance;
  readonly trace: KnowledgeEvolutionTrace;
}
```

### ResearchTrail

```typescript
interface ResearchTrail {
  readonly trailId: string;
  readonly title: string;
  readonly trailType: ResearchTrailType;
  readonly trailDescription: string;
  readonly keyContributors: readonly string[];
  readonly breakthroughMoment: string;
  readonly impactAssessment: string;
  readonly conceptIds: readonly string[];
  readonly status: KnowledgeEvolutionStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: KnowledgeEvolutionProvenance;
  readonly trace: KnowledgeEvolutionTrace;
}
```

### EvolutionMilestone

```typescript
interface EvolutionMilestone {
  readonly milestoneId: string;
  readonly profileId: string;
  readonly title: string;
  readonly stage: EvolutionStage;
  readonly year: string;
  readonly description: string;
  readonly significance: string;
}
```

### KnowledgeEvolutionRegistry

```typescript
interface KnowledgeEvolutionRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeEvolutionProfile[];
  readonly oddities: readonly HistoricalOddity[];
  readonly trails: readonly ResearchTrail[];
  readonly milestones: readonly EvolutionMilestone[];
  readonly relationships: readonly EvolutionRelationship[];
  readonly metadata: KnowledgeEvolutionRegistryMetadata;
  readonly trace: KnowledgeEvolutionTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_knowledge_evolution_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Composition Functions

| Function | Description |
|----------|-------------|
| `composeKnowledgeEvolutionProvenance` | Composes evolution provenance from parameters |
| `composeKnowledgeEvolutionTrace` | Composes an evolution trace from metadata |
| `composeKnowledgeEvolutionProfile` | Composes an evolution profile from parameters |
| `composeHistoricalOddity` | Composes a historical oddity from parameters |
| `composeResearchTrail` | Composes a research trail from parameters |
| `composeEvolutionMilestone` | Composes an evolution milestone from parameters |
| `composeEvolutionRelationship` | Composes an evolution relationship from parameters |
| `composeKnowledgeEvolutionRegistry` | Composes a knowledge evolution registry |
| `composeKnowledgeEvolutionRegistryFromInput` | Composes a registry from input |
| `composeKnowledgeEvolution` | Main entry point for evolution composition |
| `composeCuriosityArtifactWithKnowledgeEvolution` | Composes an artifact with knowledge evolution |

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateKnowledgeEvolutionProfile` | Validates a single evolution profile |
| `validateHistoricalOddity` | Validates a historical oddity |
| `validateResearchTrail` | Validates a research trail |
| `validateEvolutionMilestone` | Validates an evolution milestone |
| `validateEvolutionRelationship` | Validates an evolution relationship |
| `validateKnowledgeEvolutionRegistry` | Validates a knowledge evolution registry |
| `validateKnowledgeEvolutionInput` | Validates knowledge evolution input |
| `validateKnowledgeEvolutionTrace` | Validates an evolution trace |
| `validateCuriosityArtifactWithKnowledgeEvolution` | Validates an artifact with knowledge evolution |

## Validation Codes (24 stable codes)

| Code | Description |
|------|-------------|
| `EVOLUTION_DUPLICATE_ID` | Duplicate profile ID |
| `EVOLUTION_DUPLICATE_TITLE` | Duplicate profile title |
| `ODDITY_DUPLICATE_ID` | Duplicate oddity ID |
| `TRAIL_DUPLICATE_ID` | Duplicate trail ID |
| `EVOLUTION_INVALID_DISCOVERY_TYPE` | Invalid discovery type |
| `EVOLUTION_INVALID_STAGE` | Invalid evolution stage |
| `EVOLUTION_INVALID_TRAIL` | Invalid research trail type |
| `EVOLUTION_INVALID_ODDITY` | Invalid oddity type |
| `EVOLUTION_INVALID_PURPOSE` | Invalid evolution purpose |
| `EVOLUTION_INVALID_STATUS` | Invalid status |
| `EVOLUTION_INVALID_GOVERNANCE` | Invalid governance |
| `EVOLUTION_MISSING_PROVENANCE` | Missing provenance |
| `EVOLUTION_MISSING_PROVIDER` | Missing provider |
| `EVOLUTION_MISSING_RATIONALE` | Missing rationale |
| `EVOLUTION_MISSING_CURIOSITY_REFERENCE` | Missing curiosity reference |
| `EVOLUTION_MISSING_PROFILE_ID` | Missing profile ID |
| `EVOLUTION_MISSING_TITLE` | Missing title |
| `EVOLUTION_MISSING_MILESTONE` | Missing milestone |
| `EVOLUTION_SELF_RELATIONSHIP` | Self-relationship |
| `EVOLUTION_EMPTY_REGISTRY` | Empty registry |
| `EVOLUTION_INVALID_TRACE` | Invalid trace |
| `EVOLUTION_REGISTRY_INCONSISTENCY` | Registry inconsistency |
| `EVOLUTION_INVALID_CONFIGURATION` | Invalid configuration |
| `EVOLUTION_INVALID_TIMELINE` | Invalid timeline |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedDiscoveryType` | Type guard for discovery types |
| `isSupportedEvolutionStage` | Type guard for evolution stages |
| `isSupportedResearchTrailType` | Type guard for research trail types |
| `isSupportedOddityType` | Type guard for oddity types |
| `isSupportedEvolutionPurpose` | Type guard for evolution purposes |
| `isSupportedKnowledgeEvolutionStatus` | Type guard for evolution statuses |
| `isSupportedKnowledgeEvolutionGovernance` | Type guard for governance values |
| `getCanonicalDiscoveryTypes` | Returns canonical discovery types |
| `getCanonicalEvolutionStages` | Returns canonical evolution stages |
| `getCanonicalResearchTrailTypes` | Returns canonical research trail types |
| `getCanonicalOddityTypes` | Returns canonical oddity types |
| `getCanonicalEvolutionPurposes` | Returns canonical evolution purposes |
| `getCanonicalKnowledgeEvolutionStatuses` | Returns canonical evolution statuses |

## Knowledge Evolution Model

The kernel models only metadata describing:

- How knowledge evolved
- Where discoveries occurred
- How ideas changed through time
- Historical milestones
- Research progression

No historical reasoning. No educational generation.

## Historical Oddity Model

Historical oddities describe metadata about:

- Unexpected discoveries
- Failed attempts
- Forgotten experiments
- Scientific myths
- Counter-intuitive facts

Never actual narratives.

## Research Trail Model

Research trails describe metadata only.

Examples:

- Chronological trail
- Engineering evolution
- Scientific progression
- Cross-disciplinary influence
- Technology maturation

No runtime reconstruction.

## Evolution Timeline

The implementation stores only metadata representing:

- Stages
- Milestones
- Relationships

It never reconstructs timelines.

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

- Generate historical curiosities
- Write research stories
- Explain scientific discoveries
- Perform historical analysis
- Reconstruct timelines
- Modify Narrative Agent
- Modify Knowledge Agent
- Modify Didactic Agent
- Modify Research Agent
- Modify Application Agent

Everything remains metadata.

## Runtime Limitations

This phase defines only metadata structures. No runtime historical reasoning, timeline generation, or story creation exists.

## Out-of-Scope

- Historical curiosity generation
- Research story writing
- Scientific discovery explanation
- Historical analysis
- Timeline reconstruction
- LLM invocation

## Relationship with D9-OPT-01

D9-OPT-06 extends D9-OPT-01 with Historical Oddity, Research Trail & Knowledge Evolution Curiosity modeling. The base curiosity metadata infrastructure established in D9-OPT-01 remains unchanged. D9-OPT-06 adds:

- New canonical enums for knowledge evolution modeling
- New contracts for evolution profiles, historical oddities, research trails, milestones, and relationships
- New composition functions for knowledge evolution metadata
- New validation functions for knowledge evolution metadata
- Backward compatibility with D9-OPT-01

## Relationship with D9-OPT-02

D9-OPT-06 extends D9-OPT-02 with knowledge evolution modeling. The educational purpose modeling established in D9-OPT-02 remains unchanged. D9-OPT-06 adds:

- Discovery type modeling
- Evolution stage modeling
- Backward compatibility with D9-OPT-02

## Relationship with D9-OPT-03

D9-OPT-06 extends D9-OPT-03 with knowledge evolution modeling. The humor layer established in D9-OPT-03 remains unchanged. D9-OPT-06 adds:

- Historical oddity modeling
- Research trail modeling
- Backward compatibility with D9-OPT-03

## Relationship with D9-OPT-04

D9-OPT-06 extends D9-OPT-04 with knowledge evolution modeling. The cultural reference governance established in D9-OPT-04 remains unchanged. D9-OPT-06 adds:

- Evolution milestone modeling
- Evolution relationship modeling
- Backward compatibility with D9-OPT-04

## Relationship with D9-OPT-05

D9-OPT-06 extends D9-OPT-05 with knowledge evolution modeling. The curiosity card, engineer note & field note modeling established in D9-OPT-05 remains unchanged. D9-OPT-06 adds:

- Knowledge evolution registry structure
- Knowledge evolution input modeling
- Backward compatibility with D9-OPT-05

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
