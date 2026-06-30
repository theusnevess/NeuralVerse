# D9-OPT-03 — Humor Layer, Tone System & Controlled Acid Humor Governance

## Purpose

This phase extends the Curiosity Agent with a humor layer, tone system, and controlled acid humor governance, enabling the platform to classify humorous curiosities, control humor safety, model references, and enforce tone boundaries.

## Motivation

The Curiosity Agent vNext explicitly defines that one of its distinctive characteristics is its ability to deliver memorable educational curiosities through carefully governed humor.

The humor system must support:

- Educational humor
- Ironic observations
- Controlled acid humor
- Pop culture references
- Engineering jokes
- Historical irony
- Movie references
- Gaming references
- Internet culture references

without ever becoming:

- Offensive
- Political
- Discriminatory
- Personal
- Defamatory
- Abusive
- Unsafe

The humor layer is therefore a **governance system**, not a generation engine.

## Humor Philosophy

The humor system is designed around the principle that humor in education serves a specific purpose: to increase retention, capture attention, and make complex concepts memorable. The humor layer defines the metadata structures that enable this without generating any humor content.

## Educational Justification

Every humorous curiosity must declare:

- Educational justification
- Pedagogical purpose
- Review status
- Safety level
- Review requirement

This ensures that humor is always aligned with educational goals.

## Architecture

The Curiosity Humor Kernel follows the same architectural patterns established by D9-OPT-01 and D9-OPT-02:

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

### Humor Types (10 values)

| Humor Type | Description |
|------------|-------------|
| `dry_humor` | Dry humor |
| `controlled_acid` | Controlled acid humor |
| `engineering_joke` | Engineering joke |
| `scientific_irony` | Scientific irony |
| `playful_comparison` | Playful comparison |
| `unexpected_fact` | Unexpected fact |
| `self_deprecating_science` | Self-deprecating science |
| `historical_irony` | Historical irony |
| `pop_culture_reference` | Pop culture reference |
| `gaming_reference` | Gaming reference |

### Reference Types (10 values)

| Reference Type | Description |
|----------------|-------------|
| `movie` | Movie |
| `tv_series` | TV series |
| `anime` | Anime |
| `video_game` | Video game |
| `book` | Book |
| `internet_culture` | Internet culture |
| `scientist` | Scientist |
| `historical_event` | Historical event |
| `technology` | Technology |
| `engineering` | Engineering |

### Humor Intensity (10 values)

| Intensity | Description |
|-----------|-------------|
| `none` | None |
| `minimal` | Minimal |
| `light` | Light |
| `playful` | Playful |
| `moderate` | Moderate |
| `strong` | Strong |
| `acid_light` | Acid light |
| `acid_controlled` | Acid controlled |
| `highly_ironic` | Highly ironic |
| `satirical_light` | Satirical light |

### Humor Objectives (10 values)

| Objective | Description |
|-----------|-------------|
| `increase_retention` | Increase retention |
| `capture_attention` | Capture attention |
| `reduce_cognitive_load` | Reduce cognitive load |
| `make_concept_memorable` | Make concept memorable |
| `humanize_engineering` | Humanize engineering |
| `illustrate_absurdity` | Illustrate absurdity |
| `encourage_reflection` | Encourage reflection |
| `create_surprise` | Create surprise |
| `support_storytelling` | Support storytelling |
| `increase_engagement` | Increase engagement |

### Humor Safety Levels (10 values)

| Safety Level | Description |
|--------------|-------------|
| `fully_safe` | Fully safe |
| `reviewed` | Reviewed |
| `canonical` | Canonical |
| `educational` | Educational |
| `neutral` | Neutral |
| `restricted` | Restricted |
| `careful` | Careful |
| `controlled` | Controlled |
| `review_required` | Review required |
| `deprecated` | Deprecated |

### Humor Status (6 values)

| Status | Description |
|--------|-------------|
| `draft` | Draft |
| `review` | Under review |
| `approved` | Approved |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |

## Contracts

### HumorProfile

```typescript
interface HumorProfile {
  readonly id: string;
  readonly title: string;
  readonly humorType: HumorType;
  readonly referenceType: ReferenceType;
  readonly humorObjective: HumorObjective;
  readonly humorIntensity: HumorIntensity;
  readonly safetyLevel: HumorSafetyLevel;
  readonly conceptIds: readonly string[];
  readonly status: HumorStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityHumorProvenance;
  readonly trace: CuriosityHumorTrace;
}
```

### HumorGovernance

```typescript
interface HumorGovernance {
  readonly educationalJustification: string;
  readonly pedagogicalPurpose: string;
  readonly reviewStatus: CuriosityReviewStatus;
  readonly safetyLevel: HumorSafetyLevel;
  readonly reviewRequired: boolean;
}
```

### HumorReference

```typescript
interface HumorReference {
  readonly referenceId: string;
  readonly referenceType: ReferenceType;
  readonly referenceTitle: string;
  readonly referenceReason: string;
  readonly educationalPurpose: string;
}
```

### HumorRegistry

```typescript
interface HumorRegistry {
  readonly registryId: string;
  readonly profiles: readonly HumorProfile[];
  readonly references: readonly HumorReference[];
  readonly relationships: readonly HumorRelationship[];
  readonly governance: HumorGovernance;
  readonly metadata: HumorRegistryMetadata;
  readonly trace: CuriosityHumorTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_humor_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Composition Functions

| Function | Description |
|----------|-------------|
| `composeCuriosityHumorProvenance` | Composes humor provenance from parameters |
| `composeCuriosityHumorTrace` | Composes a humor trace from metadata |
| `composeHumorProfile` | Composes a humor profile from parameters |
| `composeHumorReference` | Composes a humor reference from parameters |
| `composeHumorRelationship` | Composes a humor relationship from parameters |
| `composeHumorGovernance` | Composes humor governance from parameters |
| `composeHumorRegistry` | Composes a humor registry |
| `composeHumorRegistryFromInput` | Composes a registry from input |
| `composeCuriosityHumor` | Main entry point for humor composition |
| `composeCuriosityArtifactWithHumor` | Composes an artifact with humor |

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateHumorProfile` | Validates a single humor profile |
| `validateHumorReference` | Validates a humor reference |
| `validateHumorRelationship` | Validates a humor relationship |
| `validateHumorGovernance` | Validates humor governance |
| `validateHumorRegistry` | Validates a humor registry |
| `validateHumorInput` | Validates humor input |
| `validateHumorTrace` | Validates a humor trace |
| `validateCuriosityArtifactWithHumor` | Validates an artifact with humor |

## Validation Codes (24 stable codes)

| Code | Description |
|------|-------------|
| `HUMOR_DUPLICATE_ID` | Duplicate profile ID |
| `HUMOR_DUPLICATE_TITLE` | Duplicate profile title |
| `REFERENCE_DUPLICATE_ID` | Duplicate reference ID |
| `RELATIONSHIP_DUPLICATE_ID` | Duplicate relationship ID |
| `HUMOR_INVALID_TYPE` | Invalid humor type |
| `HUMOR_INVALID_REFERENCE` | Invalid reference type |
| `HUMOR_INVALID_OBJECTIVE` | Invalid humor objective |
| `HUMOR_INVALID_INTENSITY` | Invalid humor intensity |
| `HUMOR_INVALID_SAFETY` | Invalid safety level |
| `HUMOR_INVALID_STATUS` | Invalid status |
| `HUMOR_INVALID_GOVERNANCE` | Invalid governance |
| `HUMOR_MISSING_PROVENANCE` | Missing provenance |
| `HUMOR_MISSING_PROVIDER` | Missing provider |
| `HUMOR_MISSING_RATIONALE` | Missing rationale |
| `HUMOR_MISSING_CURIOSITY_REFERENCE` | Missing curiosity reference |
| `HUMOR_MISSING_PROFILE_ID` | Missing profile ID |
| `HUMOR_MISSING_TITLE` | Missing title |
| `HUMOR_MISSING_GOVERNANCE` | Missing governance |
| `HUMOR_SELF_RELATIONSHIP` | Self-relationship |
| `HUMOR_EMPTY_REGISTRY` | Empty registry |
| `HUMOR_INVALID_TRACE` | Invalid trace |
| `HUMOR_REGISTRY_INCONSISTENCY` | Registry inconsistency |
| `HUMOR_INVALID_CONFIGURATION` | Invalid configuration |
| `HUMOR_UNSAFE_CONFIGURATION` | Unsafe configuration |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedHumorType` | Type guard for humor types |
| `isSupportedReferenceType` | Type guard for reference types |
| `isSupportedHumorObjective` | Type guard for humor objectives |
| `isSupportedHumorIntensity` | Type guard for humor intensity |
| `isSupportedHumorSafetyLevel` | Type guard for humor safety levels |
| `isSupportedHumorStatus` | Type guard for humor statuses |
| `isSupportedHumorGovernance` | Type guard for governance values |
| `getCanonicalHumorTypes` | Returns canonical humor types |
| `getCanonicalReferenceTypes` | Returns canonical reference types |
| `getCanonicalHumorObjectives` | Returns canonical humor objectives |
| `getCanonicalHumorIntensity` | Returns canonical humor intensity |
| `getCanonicalHumorSafetyLevels` | Returns canonical humor safety levels |
| `getCanonicalHumorStatuses` | Returns canonical humor statuses |

## Humor Safety Model

The humor layer explicitly supports:

- Educational humor
- Controlled acid humor
- Scientific irony
- Engineering irony
- Movie references
- Gaming references
- Historical references
- Internet references

It explicitly rejects metadata describing:

- Hate
- Harassment
- Politics
- Religion
- Ethnicity
- Gender attacks
- Personal attacks
- Sexual content
- Illegal content
- Unsafe behavior

Only metadata. No moderation engine.

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

- Generate jokes
- Generate sarcasm
- Generate memes
- Generate comparisons
- Rewrite narrative
- Create educational text
- Invoke LLMs
- Modify Narrative Agent
- Modify Knowledge Agent
- Modify Didactic Agent

Everything remains metadata.

## Runtime Limitations

This phase defines only metadata structures. No runtime humor generation exists.

## Out-of-Scope

- Humor content generation
- Joke generation
- Sarcasm generation
- Meme generation
- Comparison generation
- Narrative rewriting
- Educational text creation
- LLM invocation

## Relationship with D9-OPT-01

D9-OPT-03 extends D9-OPT-01 with humor layer, tone system, and controlled acid humor governance. The base curiosity metadata infrastructure established in D9-OPT-01 remains unchanged. D9-OPT-03 adds:

- New canonical enums for humor modeling
- New contracts for humor profiles, references, relationships, and governance
- New composition functions for humor metadata
- New validation functions for humor metadata
- Backward compatibility with D9-OPT-01

## Relationship with D9-OPT-02

D9-OPT-03 extends D9-OPT-02 with humor layer governance. The educational purpose modeling established in D9-OPT-02 remains unchanged. D9-OPT-03 adds:

- Humor-specific metadata structures
- Humor safety governance
- Reference modeling
- Backward compatibility with D9-OPT-02

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
