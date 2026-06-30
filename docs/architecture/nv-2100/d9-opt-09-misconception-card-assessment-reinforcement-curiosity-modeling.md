# D9-OPT-09 — Misconception Card & Assessment Reinforcement Curiosity Modeling

## Purpose

This phase extends the Curiosity Agent with Misconception Card & Assessment Reinforcement Curiosity Modeling, enabling the platform to define the deterministic metadata model describing how misconception cards, assessment reinforcement references, and corrective insights may be represented inside the Curiosity Agent.

## Motivation

The Curiosity Agent often presents educational moments like:

- "Most engineers initially believe Batch Normalization reduces overfitting. It was actually introduced to stabilize optimization."
- "Nearly everyone assumes BFS always finds the shortest path. That's only true under specific edge-weight assumptions."
- "This misconception is so common that it has appeared in engineering interviews for years."

These are not learner diagnoses. They are canonical educational metadata describing well-known misconceptions. The Assessment Agent remains responsible for learner assessment. The Curiosity Agent merely models reusable curiosity artifacts.

## Architecture

The Misconception Curiosity Kernel follows the same architectural patterns established by D9-OPT-01 through D9-OPT-08:

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

### Misconception Card Types (10 values)

| Card Type | Description |
|-----------|-------------|
| `classic_misconception` | Classic misconception |
| `engineering_trap` | Engineering trap |
| `mathematical_error` | Mathematical error |
| `algorithm_confusion` | Algorithm confusion |
| `architecture_confusion` | Architecture confusion |
| `historical_misbelief` | Historical misbelief |
| `visual_misinterpretation` | Visual misinterpretation |
| `terminology_confusion` | Terminology confusion |
| `counterintuitive_fact` | Counterintuitive fact |
| `false_intuition` | False intuition |

### Reinforcement Reference Types (10 values)

| Reference Type | Description |
|----------------|-------------|
| `concept_review` | Concept review |
| `visual_review` | Visual review |
| `worked_example` | Worked example |
| `engineering_case` | Engineering case |
| `comparison` | Comparison |
| `field_note` | Field note |
| `experiment` | Experiment |
| `knowledge_reference` | Knowledge reference |
| `laboratory_reference` | Laboratory reference |
| `reflection` | Reflection |

### Misconception Importance (10 values)

| Importance | Description |
|------------|-------------|
| `minimal` | Minimal |
| `low` | Low |
| `moderate` | Moderate |
| `high` | High |
| `critical` | Critical |
| `canonical` | Canonical |
| `frequent` | Frequent |
| `rare` | Rare |
| `advanced` | Advanced |
| `expert` | Expert |

### Corrective Outcomes (10 values)

| Outcome | Description |
|---------|-------------|
| `concept_clarity` | Concept clarity |
| `mental_model_update` | Mental model update |
| `engineering_awareness` | Engineering awareness |
| `historical_understanding` | Historical understanding |
| `reasoning_improvement` | Reasoning improvement |
| `visual_interpretation` | Visual interpretation |
| `application_awareness` | Application awareness |
| `terminology_precision` | Terminology precision |
| `reflection` | Reflection |
| `long_term_retention` | Long-term retention |

### Misconception Curiosity Status (6 values)

| Status | Description |
|--------|-------------|
| `draft` | Draft |
| `review` | Under review |
| `approved` | Approved |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |

## Contracts

### MisconceptionCard

```typescript
interface MisconceptionCard {
  readonly cardId: string;
  readonly title: string;
  readonly cardType: MisconceptionCardType;
  readonly misconceptionDescription: string;
  readonly correctionDescription: string;
  readonly importance: MisconceptionImportance;
  readonly conceptIds: readonly string[];
  readonly status: MisconceptionCuriosityStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: MisconceptionCuriosityProvenance;
  readonly trace: MisconceptionCuriosityTrace;
}
```

### AssessmentReinforcementReference

```typescript
interface AssessmentReinforcementReference {
  readonly referenceId: string;
  readonly title: string;
  readonly referenceType: ReinforcementReferenceType;
  readonly referenceDescription: string;
  readonly relatedCardId: string;
  readonly conceptIds: readonly string[];
  readonly status: MisconceptionCuriosityStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: MisconceptionCuriosityProvenance;
  readonly trace: MisconceptionCuriosityTrace;
}
```

### CorrectiveInsight

```typescript
interface CorrectiveInsight {
  readonly insightId: string;
  readonly cardId: string;
  readonly insightTitle: string;
  readonly insightDescription: string;
  readonly correctiveOutcome: CorrectiveOutcome;
  readonly conceptIds: readonly string[];
  readonly status: MisconceptionCuriosityStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: MisconceptionCuriosityProvenance;
  readonly trace: MisconceptionCuriosityTrace;
}
```

### MisconceptionRegistry

```typescript
interface MisconceptionRegistry {
  readonly registryId: string;
  readonly cards: readonly MisconceptionCard[];
  readonly references: readonly AssessmentReinforcementReference[];
  readonly insights: readonly CorrectiveInsight[];
  readonly relationships: readonly MisconceptionRelationship[];
  readonly metadata: MisconceptionRegistryMetadata;
  readonly trace: MisconceptionCuriosityTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_misconception_curiosity_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Composition Functions

| Function | Description |
|----------|-------------|
| `composeMisconceptionCuriosityProvenance` | Composes misconception curiosity provenance from parameters |
| `composeMisconceptionCuriosityTrace` | Composes a misconception curiosity trace from metadata |
| `composeMisconceptionCard` | Composes a misconception card from parameters |
| `composeAssessmentReinforcementReference` | Composes an assessment reinforcement reference from parameters |
| `composeCorrectiveInsight` | Composes a corrective insight from parameters |
| `composeMisconceptionRelationship` | Composes a misconception relationship from parameters |
| `composeMisconceptionRegistry` | Composes a misconception registry |
| `composeMisconceptionRegistryFromInput` | Composes a registry from input |
| `composeMisconceptionArtifacts` | Main entry point for misconception composition |
| `composeCuriosityArtifactWithMisconceptions` | Composes an artifact with misconceptions |

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateMisconceptionCard` | Validates a single misconception card |
| `validateAssessmentReinforcementReference` | Validates an assessment reinforcement reference |
| `validateCorrectiveInsight` | Validates a corrective insight |
| `validateMisconceptionRelationship` | Validates a misconception relationship |
| `validateMisconceptionRegistry` | Validates a misconception registry |
| `validateMisconceptionInput` | Validates misconception input |
| `validateMisconceptionTrace` | Validates a misconception trace |
| `validateCuriosityArtifactWithMisconceptions` | Validates an artifact with misconceptions |

## Validation Codes (24 stable codes)

| Code | Description |
|------|-------------|
| `MISCONCEPTION_CURIOSITY_DUPLICATE_ID` | Duplicate card ID |
| `MISCONCEPTION_CURIOSITY_DUPLICATE_TITLE` | Duplicate card title |
| `MISCONCEPTION_CURIOSITY_INVALID_CARD` | Invalid card type |
| `MISCONCEPTION_CURIOSITY_INVALID_REFERENCE` | Invalid reference type |
| `MISCONCEPTION_CURIOSITY_INVALID_OUTCOME` | Invalid corrective outcome |
| `MISCONCEPTION_CURIOSITY_INVALID_IMPORTANCE` | Invalid importance |
| `MISCONCEPTION_CURIOSITY_INVALID_STATUS` | Invalid status |
| `MISCONCEPTION_CURIOSITY_INVALID_GOVERNANCE` | Invalid governance |
| `MISCONCEPTION_CURIOSITY_MISSING_PROVENANCE` | Missing provenance |
| `MISCONCEPTION_CURIOSITY_MISSING_PROVIDER` | Missing provider |
| `MISCONCEPTION_CURIOSITY_MISSING_RATIONALE` | Missing rationale |
| `MISCONCEPTION_CURIOSITY_MISSING_CURIOSITY_REFERENCE` | Missing curiosity reference |
| `MISCONCEPTION_CURIOSITY_MISSING_PROFILE_ID` | Missing profile ID |
| `MISCONCEPTION_CURIOSITY_MISSING_TITLE` | Missing title |
| `MISCONCEPTION_CURIOSITY_MISSING_CARD` | Missing card |
| `MISCONCEPTION_CURIOSITY_SELF_RELATIONSHIP` | Self-relationship |
| `MISCONCEPTION_CURIOSITY_EMPTY_REGISTRY` | Empty registry |
| `MISCONCEPTION_CURIOSITY_INVALID_TRACE` | Invalid trace |
| `MISCONCEPTION_CURIOSITY_REGISTRY_INCONSISTENCY` | Registry inconsistency |
| `MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION` | Invalid configuration |
| `MISCONCEPTION_CURIOSITY_INVALID_RELATIONSHIP` | Invalid relationship |
| `MISCONCEPTION_CURIOSITY_MISSING_RELATIONSHIP` | Missing relationship |
| `MISCONCEPTION_CURIOSITY_MISSING_GOVERNANCE` | Missing governance |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedMisconceptionCardType` | Type guard for misconception card types |
| `isSupportedReinforcementReferenceType` | Type guard for reinforcement reference types |
| `isSupportedMisconceptionImportance` | Type guard for misconception importance |
| `isSupportedCorrectiveOutcome` | Type guard for corrective outcomes |
| `isSupportedMisconceptionCuriosityStatus` | Type guard for misconception curiosity statuses |
| `isSupportedMisconceptionCuriosityGovernance` | Type guard for governance values |
| `getCanonicalMisconceptionCardTypes` | Returns canonical misconception card types |
| `getCanonicalReinforcementReferenceTypes` | Returns canonical reinforcement reference types |
| `getCanonicalMisconceptionImportance` | Returns canonical misconception importance |
| `getCanonicalCorrectiveOutcomes` | Returns canonical corrective outcomes |
| `getCanonicalMisconceptionCuriosityStatuses` | Returns canonical misconception curiosity statuses |

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

- Diagnose learners
- Detect misconceptions automatically
- Evaluate assessments
- Personalize remediation
- Invoke the Assessment Agent
- Modify Assessment Agent
- Modify Narrative Agent
- Modify Knowledge Agent
- Modify Didactic Agent
- Modify Research Agent
- Modify Laboratory Agent
- Modify Application Agent

Everything remains metadata.

## Runtime Limitations

This phase defines only metadata structures. No runtime misconception detection, learner diagnosis, grading, assessment evaluation, adaptive remediation, or Assessment Agent invocation exists.

## Out-of-Scope

- Learner diagnosis
- Misconception detection
- Assessment evaluation
- Grading
- Adaptive remediation
- Student modeling
- Hint generation
- Feedback generation
- LLM invocation

## Relationship with D9-OPT-01

D9-OPT-09 extends D9-OPT-01 with Misconception Card & Assessment Reinforcement Curiosity Modeling. The base curiosity metadata infrastructure established in D9-OPT-01 remains unchanged. D9-OPT-09 adds:

- New canonical enums for misconception modeling
- New contracts for misconception cards, assessment reinforcement references, and corrective insights
- New composition functions for misconception curiosity metadata
- New validation functions for misconception curiosity metadata
- Backward compatibility with D9-OPT-01

## Relationship with D9-OPT-02

D9-OPT-09 extends D9-OPT-02 with misconception modeling. The educational purpose modeling established in D9-OPT-02 remains unchanged. D9-OPT-09 adds:

- Misconception card type modeling
- Reinforcement reference type modeling
- Backward compatibility with D9-OPT-02

## Relationship with D9-OPT-03

D9-OPT-09 extends D9-OPT-03 with misconception modeling. The humor layer established in D9-OPT-03 remains unchanged. D9-OPT-09 adds:

- Misconception importance modeling
- Corrective outcome modeling
- Backward compatibility with D9-OPT-03

## Relationship with D9-OPT-04

D9-OPT-09 extends D9-OPT-04 with misconception modeling. The cultural reference governance established in D9-OPT-04 remains unchanged. D9-OPT-09 adds:

- Misconception relationship modeling
- Misconception registry structure
- Backward compatibility with D9-OPT-04

## Relationship with D9-OPT-05

D9-OPT-09 extends D9-OPT-05 with misconception modeling. The curiosity card, engineer note & field note modeling established in D9-OPT-05 remains unchanged. D9-OPT-09 adds:

- Misconception card modeling
- Assessment reinforcement reference modeling
- Backward compatibility with D9-OPT-05

## Relationship with D9-OPT-06

D9-OPT-09 extends D9-OPT-06 with misconception modeling. The historical oddity, research trail & knowledge evolution curiosity modeling established in D9-OPT-06 remains unchanged. D9-OPT-09 adds:

- Corrective insight modeling
- Backward compatibility with D9-OPT-06

## Relationship with D9-OPT-07

D9-OPT-09 extends D9-OPT-07 with misconception modeling. The unexpected connection, limitation warning & application surprise modeling established in D9-OPT-07 remains unchanged. D9-OPT-09 adds:

- Misconception card metadata modeling
- Assessment reinforcement reference metadata modeling
- Backward compatibility with D9-OPT-07

## Relationship with D9-OPT-08

D9-OPT-09 extends D9-OPT-08 with misconception modeling. The laboratory challenge, what-if prompt & experiment curiosity modeling established in D9-OPT-08 remains unchanged. D9-OPT-09 adds:

- Misconception curiosity metadata modeling
- Corrective insight metadata modeling
- Backward compatibility with D9-OPT-08

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
