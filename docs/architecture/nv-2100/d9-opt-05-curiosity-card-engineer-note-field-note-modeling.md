# D9-OPT-05 — Curiosity Card, Engineer Note & Field Note Modeling

## Purpose

This phase extends the Curiosity Agent with Curiosity Card, Engineer Note & Field Note Modeling, enabling the platform to define the deterministic metadata model describing the structural formats that curiosity artifacts may adopt inside NeuralVerse.

## Motivation

The Curiosity Agent must be capable of expressing how curiosity artifacts may be structured as cards, engineer notes, and field notes. This layer provides the deterministic metadata structures that enable this without generating any content, text, or educational material.

## Architecture

The Curiosity Card Kernel follows the same architectural patterns established by D9-OPT-01 through D9-OPT-04:

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

### Card Types (10 values)

| Card Type | Description |
|-----------|-------------|
| `curiosity_card` | Curiosity card |
| `engineer_note` | Engineer note |
| `field_note` | Field note |
| `historical_note` | Historical note |
| `did_you_know` | Did you know |
| `fun_fact` | Fun fact |
| `engineering_fact` | Engineering fact |
| `scientific_observation` | Scientific observation |
| `comparison_note` | Comparison note |
| `behind_the_scenes` | Behind the scenes |

### Information Density (10 values)

| Density | Description |
|---------|-------------|
| `minimal` | Minimal |
| `compact` | Compact |
| `balanced` | Balanced |
| `detailed` | Detailed |
| `technical` | Technical |
| `expert` | Expert |
| `reference` | Reference |
| `deep` | Deep |
| `encyclopedic` | Encyclopedic |
| `micro` | Micro |

### Reading Duration (10 values)

| Duration | Description |
|----------|-------------|
| `10_seconds` | 10 seconds |
| `20_seconds` | 20 seconds |
| `30_seconds` | 30 seconds |
| `45_seconds` | 45 seconds |
| `1_minute` | 1 minute |
| `2_minutes` | 2 minutes |
| `3_minutes` | 3 minutes |
| `5_minutes` | 5 minutes |
| `10_minutes` | 10 minutes |
| `reference` | Reference |

### Presentation Style (10 values)

| Style | Description |
|-------|-------------|
| `card` | Card |
| `sticky_note` | Sticky note |
| `lab_note` | Lab note |
| `engineering_log` | Engineering log |
| `field_journal` | Field journal |
| `research_annotation` | Research annotation |
| `technical_callout` | Technical callout |
| `magazine_box` | Magazine box |
| `knowledge_chip` | Knowledge chip |
| `observation` | Observation |

### Discovery Style (10 values)

| Style | Description |
|-------|-------------|
| `surprising` | Surprising |
| `counter_intuitive` | Counter-intuitive |
| `historical` | Historical |
| `engineering` | Engineering |
| `scientific` | Scientific |
| `practical` | Practical |
| `humorous` | Humorous |
| `comparative` | Comparative |
| `observational` | Observational |
| `reflective` | Reflective |

### Card Status (6 values)

| Status | Description |
|--------|-------------|
| `draft` | Draft |
| `review` | Under review |
| `approved` | Approved |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |

## Contracts

### CuriosityCardProfile

```typescript
interface CuriosityCardProfile {
  readonly id: string;
  readonly title: string;
  readonly cardType: CardType;
  readonly informationDensity: InformationDensity;
  readonly readingDuration: ReadingDuration;
  readonly presentationStyle: PresentationStyle;
  readonly discoveryStyle: DiscoveryStyle;
  readonly conceptIds: readonly string[];
  readonly status: CardStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityCardProvenance;
  readonly trace: CuriosityCardTrace;
}
```

### EngineerNoteProfile

```typescript
interface EngineerNoteProfile {
  readonly id: string;
  readonly title: string;
  readonly engineeringRelevance: string;
  readonly implementationPerspective: string;
  readonly realWorldInsight: string;
  readonly practicalTakeaway: string;
  readonly technicalEmphasis: string;
  readonly conceptIds: readonly string[];
  readonly status: CardStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityCardProvenance;
  readonly trace: CuriosityCardTrace;
}
```

### FieldNoteProfile

```typescript
interface FieldNoteProfile {
  readonly id: string;
  readonly title: string;
  readonly observation: string;
  readonly experiment: string;
  readonly historicalAnecdote: string;
  readonly scientificDiscovery: string;
  readonly engineeringLesson: string;
  readonly conceptIds: readonly string[];
  readonly status: CardStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityCardProvenance;
  readonly trace: CuriosityCardTrace;
}
```

### CuriosityCardRegistry

```typescript
interface CuriosityCardRegistry {
  readonly registryId: string;
  readonly cards: readonly CuriosityCardProfile[];
  readonly engineerNotes: readonly EngineerNoteProfile[];
  readonly fieldNotes: readonly FieldNoteProfile[];
  readonly presentations: readonly CardPresentationMetadata[];
  readonly relationships: readonly CardRelationship[];
  readonly metadata: CuriosityCardRegistryMetadata;
  readonly trace: CuriosityCardTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_card_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Composition Functions

| Function | Description |
|----------|-------------|
| `composeCuriosityCardProvenance` | Composes card provenance from parameters |
| `composeCuriosityCardTrace` | Composes a card trace from metadata |
| `composeCuriosityCardProfile` | Composes a card profile from parameters |
| `composeEngineerNoteProfile` | Composes an engineer note profile from parameters |
| `composeFieldNoteProfile` | Composes a field note profile from parameters |
| `composeCardPresentationMetadata` | Composes card presentation metadata from parameters |
| `composeCardRelationship` | Composes a card relationship from parameters |
| `composeCuriosityCardRegistry` | Composes a curiosity card registry |
| `composeCuriosityCardRegistryFromInput` | Composes a registry from input |
| `composeCuriosityCards` | Main entry point for cards composition |
| `composeCuriosityArtifactWithCards` | Composes an artifact with cards |

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateCuriosityCardProfile` | Validates a single card profile |
| `validateEngineerNoteProfile` | Validates an engineer note profile |
| `validateFieldNoteProfile` | Validates a field note profile |
| `validateCardPresentationMetadata` | Validates card presentation metadata |
| `validateCardRelationship` | Validates a card relationship |
| `validateCuriosityCardRegistry` | Validates a curiosity card registry |
| `validateCuriosityCardInput` | Validates curiosity card input |
| `validateCuriosityCardTrace` | Validates a card trace |
| `validateCuriosityArtifactWithCards` | Validates an artifact with cards |

## Validation Codes (24 stable codes)

| Code | Description |
|------|-------------|
| `CARD_DUPLICATE_ID` | Duplicate card ID |
| `CARD_DUPLICATE_TITLE` | Duplicate card title |
| `CARD_PRESENTATION_DUPLICATE_ID` | Duplicate presentation ID |
| `CARD_RELATIONSHIP_DUPLICATE_ID` | Duplicate relationship ID |
| `CARD_INVALID_TYPE` | Invalid card type |
| `CARD_INVALID_DENSITY` | Invalid information density |
| `CARD_INVALID_DURATION` | Invalid reading duration |
| `CARD_INVALID_PRESENTATION` | Invalid presentation style |
| `CARD_INVALID_DISCOVERY_STYLE` | Invalid discovery style |
| `CARD_INVALID_STATUS` | Invalid card status |
| `CARD_INVALID_GOVERNANCE` | Invalid governance |
| `CARD_MISSING_PROVENANCE` | Missing provenance |
| `CARD_MISSING_PROVIDER` | Missing provider |
| `CARD_MISSING_RATIONALE` | Missing rationale |
| `CARD_MISSING_CURIOSITY_REFERENCE` | Missing curiosity reference |
| `CARD_MISSING_CARD_ID` | Missing card ID |
| `CARD_MISSING_TITLE` | Missing title |
| `CARD_MISSING_PRESENTATION` | Missing presentation |
| `CARD_SELF_RELATIONSHIP` | Self-relationship |
| `CARD_EMPTY_REGISTRY` | Empty registry |
| `CARD_INVALID_TRACE` | Invalid trace |
| `CARD_REGISTRY_INCONSISTENCY` | Registry inconsistency |
| `CARD_INVALID_CONFIGURATION` | Invalid configuration |
| `CARD_UNSUPPORTED_LAYOUT` | Unsupported layout |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedCardType` | Type guard for card types |
| `isSupportedInformationDensity` | Type guard for information density |
| `isSupportedReadingDuration` | Type guard for reading durations |
| `isSupportedPresentationStyle` | Type guard for presentation styles |
| `isSupportedDiscoveryStyle` | Type guard for discovery styles |
| `isSupportedCardStatus` | Type guard for card statuses |
| `isSupportedCardGovernance` | Type guard for governance values |
| `getCanonicalCardTypes` | Returns canonical card types |
| `getCanonicalInformationDensity` | Returns canonical information density |
| `getCanonicalReadingDurations` | Returns canonical reading durations |
| `getCanonicalPresentationStyles` | Returns canonical presentation styles |
| `getCanonicalDiscoveryStyles` | Returns canonical discovery styles |
| `getCanonicalCardStatuses` | Returns canonical card statuses |

## Structural Modeling

This optimization models only the structure. It never:

- Generates card text
- Summarizes concepts
- Writes engineer notes
- Creates field observations
- Formats markdown
- Produces HTML
- Renders UI

Only metadata.

## Engineer Note Model

Engineer Notes describe metadata about:

- Engineering relevance
- Implementation perspective
- Real-world insight
- Practical takeaway
- Technical emphasis

No runtime generation.

## Field Note Model

Field Notes describe metadata about:

- Observation
- Experiment
- Historical anecdote
- Scientific discovery
- Engineering lesson

No runtime authoring.

## Curiosity Card Model

Cards describe metadata such as:

- Presentation style
- Reading duration
- Density
- Discovery style
- Display format

Never actual educational text.

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

- Generate card text
- Summarize concepts
- Write engineer notes
- Create field observations
- Format markdown
- Produce HTML
- Render UI
- Modify Narrative Agent
- Modify Knowledge Agent
- Modify Didactic Agent

Everything remains metadata.

## Runtime Limitations

This phase defines only metadata structures. No runtime content generation, rendering, or UI creation exists.

## Out-of-Scope

- Card text generation
- Concept summarization
- Engineer note authoring
- Field observation creation
- Markdown formatting
- HTML production
- UI rendering
- LLM invocation

## Relationship with D9-OPT-01

D9-OPT-05 extends D9-OPT-01 with Curiosity Card, Engineer Note & Field Note Modeling. The base curiosity metadata infrastructure established in D9-OPT-01 remains unchanged. D9-OPT-05 adds:

- New canonical enums for card modeling
- New contracts for card profiles, engineer notes, field notes, presentations, and relationships
- New composition functions for card metadata
- New validation functions for card metadata
- Backward compatibility with D9-OPT-01

## Relationship with D9-OPT-02

D9-OPT-05 extends D9-OPT-02 with card structure modeling. The educational purpose modeling established in D9-OPT-02 remains unchanged. D9-OPT-05 adds:

- Card-specific metadata structures
- Engineer note modeling
- Field note modeling
- Backward compatibility with D9-OPT-02

## Relationship with D9-OPT-03

D9-OPT-05 extends D9-OPT-03 with card structure modeling. The humor layer established in D9-OPT-03 remains unchanged. D9-OPT-05 adds:

- Card presentation metadata
- Discovery style modeling
- Backward compatibility with D9-OPT-03

## Relationship with D9-OPT-04

D9-OPT-05 extends D9-OPT-04 with card structure modeling. The cultural reference governance established in D9-OPT-04 remains unchanged. D9-OPT-05 adds:

- Card relationship modeling
- Card registry structure
- Backward compatibility with D9-OPT-04

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
