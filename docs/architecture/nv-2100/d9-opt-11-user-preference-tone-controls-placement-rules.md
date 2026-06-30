# D9-OPT-11 — User Preference, Tone Controls & Placement Rules

## Purpose

This phase extends the Curiosity Agent with User Preference, Tone Controls & Placement Rules, enabling the platform to define the deterministic metadata model describing user preference compatibility, tone control metadata, placement policies, visibility rules, and presentation eligibility for curiosity artifacts without personalizing content, performing runtime adaptation, or deciding where curiosity is displayed.

## Motivation

The Curiosity Agent must be capable of expressing user preference compatibility, tone control metadata, placement policies, visibility rules, and presentation eligibility. This layer provides the deterministic metadata structures that enable this without personalizing content, performing runtime adaptation, or deciding where curiosity is displayed.

## Architecture

The Curiosity Preference Kernel follows the same architectural patterns established by D9-OPT-01 through D9-OPT-10:

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

### User Preference Types (10 values)

| Preference Type | Description |
|-----------------|-------------|
| `content_density` | Content density |
| `humor_tolerance` | Humor tolerance |
| `tone_preference` | Tone preference |
| `pacing` | Pacing |
| `detail_level` | Detail level |
| `interaction_style` | Interaction style |
| `learning_style` | Learning style |
| `motivation_type` | Motivation type |
| `engagement_pattern` | Engagement pattern |
| `notification_preference` | Notification preference |

### Tone Control Levels (10 values)

| Level | Description |
|-------|-------------|
| `neutral` | Neutral |
| `subtle` | Subtle |
| `moderate` | Moderate |
| `playful` | Playful |
| `humorous` | Humorous |
| `witty` | Witty |
| `sarcastic` | Sarcastic |
| `dramatic` | Dramatic |
| `inspirational` | Inspirational |
| `academic` | Academic |

### Placement Rules (10 values)

| Rule | Description |
|------|-------------|
| `lesson_intro` | Lesson introduction |
| `lesson_transition` | Lesson transition |
| `lesson_outro` | Lesson conclusion |
| `topic_break` | Topic break |
| `quiz_break` | Quiz break |
| `laboratory_intro` | Laboratory introduction |
| `case_study_intro` | Case study introduction |
| `module_summary` | Module summary |
| `portfolio_context` | Portfolio context |
| `random_discovery` | Random discovery |

### Visibility Levels (10 values)

| Level | Description |
|-------|-------------|
| `always` | Always visible |
| `conditional` | Conditional |
| `on_demand` | On demand |
| `progressive` | Progressive |
| `hidden` | Hidden |
| `disabled` | Disabled |
| `restricted` | Restricted |
| `conditional_on_completion` | Conditional on completion |
| `conditional_on_engagement` | Conditional on engagement |
| `conditional_on_time` | Conditional on time |

### Presentation Eligibility (10 values)

| Eligibility | Description |
|-------------|-------------|
| `full_access` | Full access |
| `limited_access` | Limited access |
| `restricted_access` | Restricted access |
| `conditional_access` | Conditional access |
| `no_access` | No access |
| `premium_access` | Premium access |
| `beta_access` | Beta access |
| `preview_access` | Preview access |
| `demo_access` | Demo access |
| `educational_access` | Educational access |

### Preference Status (6 values)

| Status | Description |
|--------|-------------|
| `draft` | Draft |
| `review` | Under review |
| `approved` | Approved |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |

## Contracts

### CuriosityPreferenceProfile

```typescript
interface CuriosityPreferenceProfile {
  readonly profileId: string;
  readonly title: string;
  readonly preferenceType: UserPreferenceType;
  readonly toneControlLevel: ToneControlLevel;
  readonly placementRule: PlacementRule;
  readonly visibilityLevel: VisibilityLevel;
  readonly presentationEligibility: PresentationEligibility;
  readonly conceptIds: readonly string[];
  readonly status: PreferenceStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityPreferenceProvenance;
  readonly trace: CuriosityPreferenceTrace;
}
```

### ToneControlMetadata

```typescript
interface ToneControlMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly toneControlLevel: ToneControlLevel;
  readonly humorIntensity: string;
  readonly witLevel: string;
  readonly sarcasmLevel: string;
  readonly dramaticLevel: string;
  readonly inspirationalLevel: string;
  readonly academicLevel: string;
}
```

### PlacementMetadata

```typescript
interface PlacementMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly placementRule: PlacementRule;
  readonly priority: number;
  readonly frequency: string;
  readonly duration: string;
  readonly cooldown: string;
  readonly contextRequired: readonly string[];
}
```

### PreferenceRegistry

```typescript
interface PreferenceRegistry {
  readonly registryId: string;
  readonly profiles: readonly CuriosityPreferenceProfile[];
  readonly toneControls: readonly ToneControlMetadata[];
  readonly placements: readonly PlacementMetadata[];
  readonly visibility: readonly VisibilityMetadata[];
  readonly relationships: readonly PreferenceRelationship[];
  readonly metadata: PreferenceRegistryMetadata;
  readonly trace: CuriosityPreferenceTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_preference_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Composition Functions

| Function | Description |
|----------|-------------|
| `composeCuriosityPreferenceProvenance` | Composes preference provenance from parameters |
| `composeCuriosityPreferenceTrace` | Composes a preference trace from metadata |
| `composeCuriosityPreferenceProfile` | Composes a preference profile from parameters |
| `composeToneControlMetadata` | Composes tone control metadata from parameters |
| `composePlacementMetadata` | Composes placement metadata from parameters |
| `composeVisibilityMetadata` | Composes visibility metadata from parameters |
| `composePreferenceRelationship` | Composes a preference relationship from parameters |
| `composePreferenceRegistry` | Composes a preference registry |
| `composePreferenceRegistryFromInput` | Composes a registry from input |
| `composeCuriosityPreferences` | Main entry point for preferences composition |
| `composeCuriosityArtifactWithPreferences` | Composes an artifact with preferences |

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateCuriosityPreferenceProfile` | Validates a single preference profile |
| `validateToneControlMetadata` | Validates tone control metadata |
| `validatePlacementMetadata` | Validates placement metadata |
| `validateVisibilityMetadata` | Validates visibility metadata |
| `validatePreferenceRelationship` | Validates a preference relationship |
| `validatePreferenceRegistry` | Validates a preference registry |
| `validatePreferenceInput` | Validates preference input |
| `validatePreferenceTrace` | Validates a preference trace |
| `validateCuriosityArtifactWithPreferences` | Validates an artifact with preferences |

## Validation Codes (24 stable codes)

| Code | Description |
|------|-------------|
| `PREFERENCE_DUPLICATE_ID` | Duplicate profile ID |
| `PREFERENCE_DUPLICATE_TITLE` | Duplicate profile title |
| `PREFERENCE_INVALID_TYPE` | Invalid preference type |
| `PREFERENCE_INVALID_TONE_CONTROL` | Invalid tone control level |
| `PREFERENCE_INVALID_PLACEMENT` | Invalid placement rule |
| `PREFERENCE_INVALID_VISIBILITY` | Invalid visibility level |
| `PREFERENCE_INVALID_ELIGIBILITY` | Invalid presentation eligibility |
| `PREFERENCE_INVALID_STATUS` | Invalid preference status |
| `PREFERENCE_INVALID_GOVERNANCE` | Invalid governance |
| `PREFERENCE_MISSING_PROVENANCE` | Missing provenance |
| `PREFERENCE_MISSING_PROVIDER` | Missing provider |
| `PREFERENCE_MISSING_RATIONALE` | Missing rationale |
| `PREFERENCE_MISSING_CURIOSITY_REFERENCE` | Missing curiosity reference |
| `PREFERENCE_MISSING_PROFILE_ID` | Missing profile ID |
| `PREFERENCE_MISSING_TITLE` | Missing title |
| `PREFERENCE_MISSING_PLACEMENT` | Missing placement |
| `PREFERENCE_SELF_RELATIONSHIP` | Self-relationship |
| `PREFERENCE_EMPTY_REGISTRY` | Empty registry |
| `PREFERENCE_INVALID_TRACE` | Invalid trace |
| `PREFERENCE_REGISTRY_INCONSISTENCY` | Registry inconsistency |
| `PREFERENCE_INVALID_CONFIGURATION` | Invalid configuration |
| `PREFERENCE_INVALID_RELATIONSHIP` | Invalid relationship |
| `PREFERENCE_MISSING_GOVERNANCE` | Missing governance |
| `PREFERENCE_UNSUPPORTED_METADATA` | Unsupported preference metadata |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedUserPreferenceType` | Type guard for user preference types |
| `isSupportedToneControlLevel` | Type guard for tone control levels |
| `isSupportedPlacementRule` | Type guard for placement rules |
| `isSupportedVisibilityLevel` | Type guard for visibility levels |
| `isSupportedPresentationEligibility` | Type guard for presentation eligibility |
| `isSupportedPreferenceStatus` | Type guard for preference statuses |
| `isSupportedPreferenceGovernance` | Type guard for governance values |
| `getCanonicalUserPreferenceTypes` | Returns canonical user preference types |
| `getCanonicalToneControlLevels` | Returns canonical tone control levels |
| `getCanonicalPlacementRules` | Returns canonical placement rules |
| `getCanonicalVisibilityLevels` | Returns canonical visibility levels |
| `getCanonicalPresentationEligibility` | Returns canonical presentation eligibility |
| `getCanonicalPreferenceStatuses` | Returns canonical preference statuses |

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

## Tone Control Metadata

The tone control metadata layer models:

- Tone control levels
- Humor intensity
- Wit level
- Sarcasm level
- Dramatic level
- Inspirational level
- Academic level

All metadata is deterministic and immutable.

## Placement Metadata

The placement metadata layer models:

- Placement rules
- Priority
- Frequency
- Duration
- Cooldown
- Context required

All metadata is deterministic and immutable.

## Visibility Metadata

The visibility metadata layer models:

- Visibility levels
- Conditions
- Prerequisites
- Exclusions
- Time restrictions

All metadata is deterministic and immutable.

## Preference Metadata

The preference metadata layer models:

- User preference types
- Tone control levels
- Placement rules
- Visibility levels
- Presentation eligibility

All metadata is deterministic and immutable.

## Cross-Agent Boundaries

The Curiosity Agent must NOT:

- Personalize content
- Perform runtime adaptation
- Infer user preferences
- Make placement decisions
- Render UI
- Modify Narrative Agent
- Modify Knowledge Agent
- Modify Didactic Agent
- Modify Research Agent
- Modify Laboratory Agent
- Modify Application Agent

Everything remains metadata.

## Runtime Limitations

This phase defines only metadata structures. No runtime personalization, adaptive behavior, preference inference, placement decisions, or UI rendering exists.

## Out-of-Scope

- User personalization
- Runtime adaptation
- Preference inference
- Placement decisions
- UI rendering
- Frontend invocation
- LLM invocation

## Relationship with D9-OPT-01

D9-OPT-11 extends D9-OPT-01 with User Preference, Tone Controls & Placement Rules. The base curiosity metadata infrastructure established in D9-OPT-01 remains unchanged. D9-OPT-11 adds:

- New canonical enums for user preference modeling
- New contracts for preference profiles, tone control metadata, placement metadata, and visibility metadata
- New composition functions for user preference metadata
- New validation functions for user preference metadata
- Backward compatibility with D9-OPT-01

## Relationship with D9-OPT-02

D9-OPT-11 extends D9-OPT-02 with user preference modeling. The educational purpose modeling established in D9-OPT-02 remains unchanged. D9-OPT-11 adds:

- User preference type modeling
- Tone control level modeling
- Backward compatibility with D9-OPT-02

## Relationship with D9-OPT-03

D9-OPT-11 extends D9-OPT-03 with user preference modeling. The humor layer established in D9-OPT-03 remains unchanged. D9-OPT-11 adds:

- Placement rule modeling
- Visibility level modeling
- Backward compatibility with D9-OPT-03

## Relationship with D9-OPT-04

D9-OPT-11 extends D9-OPT-04 with user preference modeling. The cultural reference governance established in D9-OPT-04 remains unchanged. D9-OPT-11 adds:

- Presentation eligibility modeling
- Preference relationship modeling
- Backward compatibility with D9-OPT-04

## Relationship with D9-OPT-05

D9-OPT-11 extends D9-OPT-05 with user preference modeling. The curiosity card, engineer note & field note modeling established in D9-OPT-05 remains unchanged. D9-OPT-11 adds:

- User preference profile modeling
- Tone control metadata modeling
- Placement metadata modeling
- Backward compatibility with D9-OPT-05

## Relationship with D9-OPT-06

D9-OPT-11 extends D9-OPT-06 with user preference modeling. The historical oddity, research trail & knowledge evolution curiosity modeling established in D9-OPT-06 remains unchanged. D9-OPT-11 adds:

- Visibility metadata modeling
- Preference relationship modeling
- Backward compatibility with D9-OPT-06

## Relationship with D9-OPT-07

D9-OPT-11 extends D9-OPT-07 with user preference modeling. The unexpected connection, limitation warning & application surprise modeling established in D9-OPT-07 remains unchanged. D9-OPT-11 adds:

- User preference profile modeling
- Backward compatibility with D9-OPT-07

## Relationship with D9-OPT-08

D9-OPT-11 extends D9-OPT-08 with user preference modeling. The laboratory challenge, what-if prompt & experiment curiosity modeling established in D9-OPT-08 remains unchanged. D9-OPT-11 adds:

- Tone control metadata modeling
- Placement metadata modeling
- Backward compatibility with D9-OPT-08

## Relationship with D9-OPT-09

D9-OPT-11 extends D9-OPT-09 with user preference modeling. The misconception card & assessment reinforcement curiosity modeling established in D9-OPT-09 remains unchanged. D9-OPT-11 adds:

- Visibility metadata modeling
- Preference relationship modeling
- Backward compatibility with D9-OPT-09

## Relationship with D9-OPT-10

D9-OPT-11 extends D9-OPT-10 with user preference modeling. The visual curiosity presentation & accessibility metadata established in D9-OPT-10 remains unchanged. D9-OPT-11 adds:

- User preference profile modeling
- Tone control metadata modeling
- Placement metadata modeling
- Visibility metadata modeling
- Backward compatibility with D9-OPT-10

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
