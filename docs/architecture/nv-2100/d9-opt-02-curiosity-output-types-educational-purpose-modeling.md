# D9-OPT-02 — Curiosity Output Types & Educational Purpose Modeling

## Purpose

This phase extends the Curiosity Agent with educational purpose modeling, enabling the platform to express how curiosity artifacts are pedagogically classified, which educational purpose they serve, and how they should be consumed by the NeuralVerse platform.

## Motivation

The Curiosity Agent must become capable of expressing:

- Educational purpose
- Intended emotional effect
- Output format
- Consumption moment
- Audience
- Pedagogical role

without generating any curiosity. Everything remains metadata.

## Architecture

The Curiosity Purpose Kernel follows the same architectural patterns established by D9-OPT-01:

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

### Curiosity Output Types (10 values)

| Output Type | Description |
|-------------|-------------|
| `fact` | Factual discovery |
| `historical_story` | Historical anecdote |
| `engineering_story` | Engineering insight |
| `fun_comparison` | Fun comparison |
| `analogy` | Analogy |
| `behind_the_scenes` | Behind the scenes |
| `myth_vs_fact` | Myth vs fact |
| `did_you_know` | Did you know |
| `timeline` | Timeline |
| `easter_egg` | Easter egg |

### Educational Purposes (10 values)

| Purpose | Description |
|---------|-------------|
| `increase_attention` | Increase attention |
| `improve_retention` | Improve retention |
| `connect_concepts` | Connect concepts |
| `humanize_science` | Humanize science |
| `motivate_learning` | Motivate learning |
| `provide_context` | Provide context |
| `encourage_reflection` | Encourage reflection |
| `break_cognitive_fatigue` | Break cognitive fatigue |
| `reinforce_memory` | Reinforce memory |
| `stimulate_curiosity` | Stimulate curiosity |

### Emotional Tones (10 values)

| Tone | Description |
|------|-------------|
| `surprising` | Surprising |
| `humorous` | Humorous |
| `playful` | Playful |
| `technical` | Technical |
| `reflective` | Reflective |
| `dramatic` | Dramatic |
| `inspirational` | Inspirational |
| `ironic` | Ironic |
| `neutral` | Neutral |
| `thought_provoking` | Thought-provoking |

### Delivery Contexts (10 values)

| Context | Description |
|---------|-------------|
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

### Audience Levels (10 values)

| Level | Description |
|-------|-------------|
| `beginner` | Beginner |
| `intermediate` | Intermediate |
| `advanced` | Advanced |
| `researcher` | Researcher |
| `engineer` | Engineer |
| `student` | Student |
| `general_public` | General public |
| `educator` | Educator |
| `professional` | Professional |
| `mixed` | Mixed audience |

### Curiosity Purpose Status (6 values)

| Status | Description |
|--------|-------------|
| `draft` | Draft |
| `review` | Under review |
| `approved` | Approved |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |

## Contracts

### CuriosityPurposeProfile

```typescript
interface CuriosityPurposeProfile {
  readonly id: string;
  readonly title: string;
  readonly outputType: CuriosityOutputType;
  readonly educationalPurpose: EducationalPurpose;
  readonly emotionalTone: EmotionalTone;
  readonly deliveryContext: DeliveryContext;
  readonly audienceLevel: AudienceLevel;
  readonly conceptIds: readonly string[];
  readonly status: CuriosityPurposeStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityPurposeProvenance;
  readonly trace: CuriosityPurposeTrace;
}
```

### CuriosityPurposeRegistry

```typescript
interface CuriosityPurposeRegistry {
  readonly registryId: string;
  readonly profiles: readonly CuriosityPurposeProfile[];
  readonly relationships: readonly CuriosityPurposeRelationship[];
  readonly metadata: CuriosityPurposeRegistryMetadata;
  readonly trace: CuriosityPurposeTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_purpose_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Composition Functions

| Function | Description |
|----------|-------------|
| `composeCuriosityPurposeProvenance` | Composes purpose provenance from parameters |
| `composeCuriosityPurposeTrace` | Composes a purpose trace from metadata |
| `composeCuriosityPurposeProfile` | Composes a purpose profile from parameters |
| `composeCuriosityPurposeRelationship` | Composes a purpose relationship from parameters |
| `composeCuriosityPurposeRegistry` | Composes a purpose registry from profiles and relationships |
| `composeCuriosityPurposeRegistryFromInput` | Composes a registry from input |
| `composeCuriosityPurposes` | Main entry point for purpose composition |
| `composeCuriosityArtifactWithPurpose` | Composes an artifact with purpose |

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateCuriosityPurposeProfile` | Validates a single purpose profile |
| `validateCuriosityPurposeRelationship` | Validates a purpose relationship |
| `validateCuriosityPurposeRegistry` | Validates a purpose registry |
| `validateCuriosityPurposeInput` | Validates purpose input |
| `validateCuriosityPurposeTrace` | Validates a purpose trace |
| `validateCuriosityArtifactWithPurpose` | Validates an artifact with purpose |

## Validation Codes (20 stable codes)

| Code | Description |
|------|-------------|
| `PURPOSE_DUPLICATE_ID` | Duplicate profile ID |
| `PURPOSE_DUPLICATE_TITLE` | Duplicate profile title |
| `PURPOSE_INVALID_OUTPUT_TYPE` | Invalid output type |
| `PURPOSE_INVALID_EDUCATIONAL_PURPOSE` | Invalid educational purpose |
| `PURPOSE_INVALID_EMOTIONAL_TONE` | Invalid emotional tone |
| `PURPOSE_INVALID_DELIVERY_CONTEXT` | Invalid delivery context |
| `PURPOSE_INVALID_AUDIENCE_LEVEL` | Invalid audience level |
| `PURPOSE_INVALID_STATUS` | Invalid status |
| `PURPOSE_INVALID_GOVERNANCE` | Invalid governance |
| `PURPOSE_MISSING_PROVENANCE` | Missing provenance |
| `PURPOSE_MISSING_PROVIDER` | Missing provider |
| `PURPOSE_MISSING_RATIONALE` | Missing rationale |
| `PURPOSE_MISSING_CURIOSITY_REFERENCE` | Missing curiosity reference |
| `PURPOSE_MISSING_PROFILE_ID` | Missing profile ID |
| `PURPOSE_MISSING_TITLE` | Missing title |
| `PURPOSE_SELF_RELATIONSHIP` | Self-relationship |
| `PURPOSE_EMPTY_REGISTRY` | Empty registry |
| `PURPOSE_INVALID_TRACE` | Invalid trace |
| `PURPOSE_REGISTRY_INCONSISTENCY` | Registry inconsistency |
| `PURPOSE_INVALID_CONFIGURATION` | Invalid configuration |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedCuriosityOutputType` | Type guard for output types |
| `isSupportedEducationalPurpose` | Type guard for educational purposes |
| `isSupportedEmotionalTone` | Type guard for emotional tones |
| `isSupportedDeliveryContext` | Type guard for delivery contexts |
| `isSupportedAudienceLevel` | Type guard for audience levels |
| `isSupportedCuriosityPurposeStatus` | Type guard for purpose statuses |
| `isSupportedCuriosityPurposeGovernance` | Type guard for governance values |
| `getCanonicalCuriosityOutputTypes` | Returns canonical output types |
| `getCanonicalEducationalPurposes` | Returns canonical educational purposes |
| `getCanonicalEmotionalTones` | Returns canonical emotional tones |
| `getCanonicalDeliveryContexts` | Returns canonical delivery contexts |
| `getCanonicalAudienceLevels` | Returns canonical audience levels |
| `getCanonicalCuriosityPurposeStatuses` | Returns canonical purpose statuses |

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

- Generate curiosities
- Implement humor
- Produce jokes
- Rewrite narrative
- Personalize content
- Invoke LLMs
- Create educational content
- Modify Narrative Agent
- Modify Didactic Agent
- Modify Knowledge Agent

Everything remains metadata.

## Runtime Limitations

This phase defines only metadata structures. No runtime generation logic exists.

## Out-of-Scope

- Curiosity content generation
- Humor generation
- Narrative rewriting
- Content personalization
- LLM invocation
- Educational content creation

## Relationship with D9-OPT-01

D9-OPT-02 extends D9-OPT-01 with educational purpose modeling. The base curiosity metadata infrastructure established in D9-OPT-01 remains unchanged. D9-OPT-02 adds:

- New canonical enums for educational purpose modeling
- New contracts for purpose profiles, relationships, and registries
- New composition functions for purpose metadata
- New validation functions for purpose metadata
- Backward compatibility with D9-OPT-01

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
application-pipeline
assessment-pipeline
runtime
frontend
shared
```
