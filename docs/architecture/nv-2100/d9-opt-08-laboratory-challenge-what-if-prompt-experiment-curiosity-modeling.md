# D9-OPT-08 — Laboratory Challenge, What-If Prompt & Experiment Curiosity Modeling

## Purpose

This phase extends the Curiosity Agent with Laboratory Challenge, What-If Prompt & Experiment Curiosity Modeling, enabling the platform to define the deterministic metadata model describing how laboratory challenges, what-if prompts, and experiment curiosities may be represented inside the Curiosity Agent.

## Motivation

The Curiosity Agent often stimulates exploration through prompts like:

- "What would happen if this neural network had no activation functions?"
- "Try reproducing this phenomenon using only OpenCV."
- "Can this algorithm survive if memory is reduced by 90%?"

These are not laboratories. They are metadata describing exploration opportunities. The actual execution belongs to other agents. This phase models those opportunities.

## Architecture

The Laboratory Curiosity Kernel follows the same architectural patterns established by D9-OPT-01 through D9-OPT-07:

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

### Laboratory Challenge Types (10 values)

| Challenge Type | Description |
|----------------|-------------|
| `prediction` | Prediction |
| `implementation` | Implementation |
| `observation` | Observation |
| `comparison` | Comparison |
| `optimization` | Optimization |
| `failure_analysis` | Failure analysis |
| `reverse_engineering` | Reverse engineering |
| `parameter_variation` | Parameter variation |
| `constraint_testing` | Constraint testing |
| `engineering_validation` | Engineering validation |

### What-If Types (10 values)

| Prompt Type | Description |
|-------------|-------------|
| `parameter_change` | Parameter change |
| `architecture_change` | Architecture change |
| `algorithm_change` | Algorithm change |
| `dataset_change` | Dataset change |
| `hardware_change` | Hardware change |
| `environment_change` | Environment change |
| `constraint_change` | Constraint change |
| `scale_change` | Scale change |
| `assumption_change` | Assumption change |
| `failure_scenario` | Failure scenario |

### Experiment Types (10 values)

| Experiment Type | Description |
|-----------------|-------------|
| `thought_experiment` | Thought experiment |
| `laboratory_experiment` | Laboratory experiment |
| `engineering_experiment` | Engineering experiment |
| `simulation_candidate` | Simulation candidate |
| `observation` | Observation |
| `comparison` | Comparison |
| `measurement` | Measurement |
| `validation` | Validation |
| `reproduction` | Reproduction |
| `exploration` | Exploration |

### Exploration Objectives (10 values)

| Objective | Description |
|-----------|-------------|
| `curiosity` | Curiosity |
| `reasoning` | Reasoning |
| `validation` | Validation |
| `engineering_understanding` | Engineering understanding |
| `system_behavior` | System behavior |
| `concept_reinforcement` | Concept reinforcement |
| `failure_analysis` | Failure analysis |
| `hypothesis` | Hypothesis |
| `exploration` | Exploration |
| `reflection` | Reflection |

### Exploration Status (6 values)

| Status | Description |
|--------|-------------|
| `draft` | Draft |
| `review` | Under review |
| `approved` | Approved |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |

## Contracts

### LaboratoryChallenge

```typescript
interface LaboratoryChallenge {
  readonly challengeId: string;
  readonly title: string;
  readonly challengeType: LabChallengeType;
  readonly challengeDescription: string;
  readonly expectedOutcome: string;
  readonly difficultyLevel: string;
  readonly conceptIds: readonly string[];
  readonly status: ExplorationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: LaboratoryCuriosityProvenance;
  readonly trace: LaboratoryCuriosityTrace;
}
```

### WhatIfPrompt

```typescript
interface WhatIfPrompt {
  readonly promptId: string;
  readonly title: string;
  readonly promptType: WhatsIfType;
  readonly promptDescription: string;
  readonly expectedInsight: string;
  readonly conceptIds: readonly string[];
  readonly status: ExplorationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: LaboratoryCuriosityProvenance;
  readonly trace: LaboratoryCuriosityTrace;
}
```

### ExperimentCuriosity

```typescript
interface ExperimentCuriosity {
  readonly experimentId: string;
  readonly title: string;
  readonly experimentType: ExperimentType;
  readonly experimentDescription: string;
  readonly hypothesis: string;
  readonly expectedResult: string;
  readonly conceptIds: readonly string[];
  readonly status: ExplorationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: LaboratoryCuriosityProvenance;
  readonly trace: LaboratoryCuriosityTrace;
}
```

### ExplorationRegistry

```typescript
interface ExplorationRegistry {
  readonly registryId: string;
  readonly challenges: readonly LaboratoryChallenge[];
  readonly prompts: readonly WhatIfPrompt[];
  readonly experiments: readonly ExperimentCuriosity[];
  readonly relationships: readonly ExplorationRelationship[];
  readonly metadata: ExplorationRegistryMetadata;
  readonly trace: LaboratoryCuriosityTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_curiosity_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Composition Functions

| Function | Description |
|----------|-------------|
| `composeLaboratoryCuriosityProvenance` | Composes laboratory curiosity provenance from parameters |
| `composeLaboratoryCuriosityTrace` | Composes a laboratory curiosity trace from metadata |
| `composeLaboratoryChallenge` | Composes a laboratory challenge from parameters |
| `composeWhatIfPrompt` | Composes a what-if prompt from parameters |
| `composeExperimentCuriosity` | Composes an experiment curiosity from parameters |
| `composeExplorationRelationship` | Composes an exploration relationship from parameters |
| `composeExplorationRegistry` | Composes an exploration registry |
| `composeExplorationRegistryFromInput` | Composes a registry from input |
| `composeExplorationArtifacts` | Main entry point for exploration composition |
| `composeCuriosityArtifactWithExploration` | Composes an artifact with exploration |

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateLaboratoryChallenge` | Validates a single laboratory challenge |
| `validateWhatIfPrompt` | Validates a what-if prompt |
| `validateExperimentCuriosity` | Validates an experiment curiosity |
| `validateExplorationRelationship` | Validates an exploration relationship |
| `validateExplorationRegistry` | Validates an exploration registry |
| `validateExplorationInput` | Validates exploration input |
| `validateExplorationTrace` | Validates an exploration trace |
| `validateCuriosityArtifactWithExploration` | Validates an artifact with exploration |

## Validation Codes (24 stable codes)

| Code | Description |
|------|-------------|
| `EXPLORATION_DUPLICATE_ID` | Duplicate challenge ID |
| `EXPLORATION_DUPLICATE_TITLE` | Duplicate challenge title |
| `EXPLORATION_INVALID_CHALLENGE` | Invalid challenge type |
| `EXPLORATION_INVALID_WHATS_IF` | Invalid what-if type |
| `EXPLORATION_INVALID_EXPERIMENT` | Invalid experiment type |
| `EXPLORATION_INVALID_OBJECTIVE` | Invalid exploration objective |
| `EXPLORATION_INVALID_STATUS` | Invalid exploration status |
| `EXPLORATION_INVALID_GOVERNANCE` | Invalid governance |
| `EXPLORATION_MISSING_PROVENANCE` | Missing provenance |
| `EXPLORATION_MISSING_PROVIDER` | Missing provider |
| `EXPLORATION_MISSING_RATIONALE` | Missing rationale |
| `EXPLORATION_MISSING_CURIOSITY_REFERENCE` | Missing curiosity reference |
| `EXPLORATION_MISSING_PROFILE_ID` | Missing profile ID |
| `EXPLORATION_MISSING_TITLE` | Missing title |
| `EXPLORATION_MISSING_EXPLORATION` | Missing exploration |
| `EXPLORATION_SELF_RELATIONSHIP` | Self-relationship |
| `EXPLORATION_EMPTY_REGISTRY` | Empty registry |
| `EXPLORATION_INVALID_TRACE` | Invalid trace |
| `EXPLORATION_REGISTRY_INCONSISTENCY` | Registry inconsistency |
| `EXPLORATION_INVALID_CONFIGURATION` | Invalid configuration |
| `EXPLORATION_INVALID_REFERENCE` | Invalid reference |
| `EXPLORATION_INVALID_RELATIONSHIP` | Invalid relationship |
| `EXPLORATION_MISSING_RELATIONSHIP` | Missing relationship |
| `EXPLORATION_MISSING_GOVERNANCE` | Missing governance |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedLaboratoryChallengeType` | Type guard for laboratory challenge types |
| `isSupportedWhatIfType` | Type guard for what-if types |
| `isSupportedExperimentType` | Type guard for experiment types |
| `isSupportedExplorationObjective` | Type guard for exploration objectives |
| `isSupportedExplorationStatus` | Type guard for exploration statuses |
| `isSupportedExplorationGovernance` | Type guard for governance values |
| `getCanonicalLaboratoryChallengeTypes` | Returns canonical laboratory challenge types |
| `getCanonicalWhatIfTypes` | Returns canonical what-if types |
| `getCanonicalExperimentTypes` | Returns canonical experiment types |
| `getCanonicalExplorationObjectives` | Returns canonical exploration objectives |
| `getCanonicalExplorationStatuses` | Returns canonical exploration statuses |

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

- Generate challenges
- Generate experiments
- Simulate laboratories
- Execute reasoning
- Invoke the Laboratory Agent
- Modify Narrative Agent
- Modify Knowledge Agent
- Modify Didactic Agent
- Modify Research Agent
- Modify Laboratory Agent
- Modify Application Agent

Everything remains metadata.

## Runtime Limitations

This phase defines only metadata structures. No runtime challenge generation, experiment generation, simulation, laboratory execution, reasoning, or optimization exists.

## Out-of-Scope

- Challenge generation
- Experiment generation
- Laboratory simulation
- Laboratory execution
- Scientific reasoning
- Parameter optimization
- LLM invocation

## Relationship with D9-OPT-01

D9-OPT-08 extends D9-OPT-01 with Laboratory Challenge, What-If Prompt & Experiment Curiosity Modeling. The base curiosity metadata infrastructure established in D9-OPT-01 remains unchanged. D9-OPT-08 adds:

- New canonical enums for laboratory curiosity modeling
- New contracts for challenges, prompts, experiments, and relationships
- New composition functions for laboratory curiosity metadata
- New validation functions for laboratory curiosity metadata
- Backward compatibility with D9-OPT-01

## Relationship with D9-OPT-02

D9-OPT-08 extends D9-OPT-02 with laboratory curiosity modeling. The educational purpose modeling established in D9-OPT-02 remains unchanged. D9-OPT-08 adds:

- Laboratory challenge type modeling
- What-if prompt type modeling
- Experiment type modeling
- Backward compatibility with D9-OPT-02

## Relationship with D9-OPT-03

D9-OPT-08 extends D9-OPT-03 with laboratory curiosity modeling. The humor layer established in D9-OPT-03 remains unchanged. D9-OPT-08 adds:

- Exploration objective modeling
- Exploration status modeling
- Backward compatibility with D9-OPT-03

## Relationship with D9-OPT-04

D9-OPT-08 extends D9-OPT-04 with laboratory curiosity modeling. The cultural reference governance established in D9-OPT-04 remains unchanged. D9-OPT-08 adds:

- Exploration relationship modeling
- Exploration registry structure
- Backward compatibility with D9-OPT-04

## Relationship with D9-OPT-05

D9-OPT-08 extends D9-OPT-05 with laboratory curiosity modeling. The curiosity card, engineer note & field note modeling established in D9-OPT-05 remains unchanged. D9-OPT-08 adds:

- Laboratory challenge profile modeling
- What-if prompt modeling
- Experiment curiosity modeling
- Backward compatibility with D9-OPT-05

## Relationship with D9-OPT-06

D9-OPT-08 extends D9-OPT-06 with laboratory curiosity modeling. The historical oddity, research trail & knowledge evolution curiosity modeling established in D9-OPT-06 remains unchanged. D9-OPT-08 adds:

- Laboratory exploration metadata modeling
- Backward compatibility with D9-OPT-06

## Relationship with D9-OPT-07

D9-OPT-08 extends D9-OPT-07 with laboratory curiosity modeling. The unexpected connection, limitation warning & application surprise modeling established in D9-OPT-07 remains unchanged. D9-OPT-08 adds:

- Laboratory challenge metadata modeling
- What-if prompt metadata modeling
- Experiment curiosity metadata modeling
- Backward compatibility with D9-OPT-07

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
