# D9-OPT-04 — Cultural Reference & Current-Context Governance

## Purpose

This phase extends the Curiosity Agent with a cultural reference and current-context governance layer, enabling the platform to classify cultural references, manage current context metadata, and enforce safety governance under strict metadata-only constraints.

## Motivation

The Curiosity Agent must be capable of expressing how cultural references and contemporary contexts may be attached to curiosity artifacts under strict governance. This layer provides the deterministic metadata structures that enable this without performing any cultural reasoning, trend detection, or web access.

## Architecture

The Cultural Reference Kernel follows the same architectural patterns established by D9-OPT-01 through D9-OPT-03:

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

### Reference Domains (10 values)

| Domain | Description |
|--------|-------------|
| `cinema` | Cinema |
| `television` | Television |
| `literature` | Literature |
| `video_games` | Video games |
| `internet_culture` | Internet culture |
| `historical_events` | Historical events |
| `science_history` | Science history |
| `technology_history` | Technology history |
| `engineering` | Engineering |
| `popular_science` | Popular science |

### Reference Recency (10 values)

| Recency | Description |
|---------|-------------|
| `timeless` | Timeless |
| `historical` | Historical |
| `modern` | Modern |
| `contemporary` | Contemporary |
| `seasonal` | Seasonal |
| `evergreen` | Evergreen |
| `legacy` | Legacy |
| `classic` | Classic |
| `emerging` | Emerging |
| `current` | Current |

### Reference Purpose (10 values)

| Purpose | Description |
|---------|-------------|
| `engagement` | Engagement |
| `memorability` | Memorability |
| `analogy` | Analogy |
| `comparison` | Comparison |
| `historical_context` | Historical context |
| `scientific_context` | Scientific context |
| `engineering_context` | Engineering context |
| `humor` | Humor |
| `reflection` | Reflection |
| `motivation` | Motivation |

### Reference Validity (10 values)

| Validity | Description |
|----------|-------------|
| `canonical` | Canonical |
| `verified` | Verified |
| `reviewed` | Reviewed |
| `temporary` | Temporary |
| `deprecated` | Deprecated |
| `legacy` | Legacy |
| `pending_review` | Pending review |
| `restricted` | Restricted |
| `archived` | Archived |
| `rejected` | Rejected |

### Context Sensitivity (5 values)

| Sensitivity | Description |
|-------------|-------------|
| `safe` | Safe |
| `review_required` | Review required |
| `high_attention` | High attention |
| `restricted` | Restricted |
| `forbidden` | Forbidden |

### Reference Status (6 values)

| Status | Description |
|--------|-------------|
| `draft` | Draft |
| `review` | Under review |
| `approved` | Approved |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |

## Contracts

### CulturalReferenceProfile

```typescript
interface CulturalReferenceProfile {
  readonly id: string;
  readonly title: string;
  readonly referenceDomain: ReferenceDomain;
  readonly referenceRecency: ReferenceRecency;
  readonly referencePurpose: ReferencePurpose;
  readonly referenceValidity: ReferenceValidity;
  readonly contextSensitivity: ContextSensitivity;
  readonly conceptIds: readonly string[];
  readonly status: ReferenceStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CulturalReferenceProvenance;
  readonly trace: CulturalReferenceTrace;
}
```

### CurrentContextReference

```typescript
interface CurrentContextReference {
  readonly referenceId: string;
  readonly referenceDomain: ReferenceDomain;
  readonly referenceRecency: ReferenceRecency;
  readonly contextSensitivity: ContextSensitivity;
  readonly validityPeriod: string;
  readonly lastVerified: string;
  readonly provenance: CulturalReferenceProvenance;
}
```

### ReferenceGovernance

```typescript
interface ReferenceGovernance {
  readonly educationalJustification: string;
  readonly pedagogicalPurpose: string;
  readonly reviewStatus: CuriosityReviewStatus;
  readonly contextSensitivity: ContextSensitivity;
  readonly reviewRequired: boolean;
}
```

### CulturalReferenceRegistry

```typescript
interface CulturalReferenceRegistry {
  readonly registryId: string;
  readonly profiles: readonly CulturalReferenceProfile[];
  readonly contextReferences: readonly CurrentContextReference[];
  readonly relationships: readonly ReferenceRelationship[];
  readonly governance: ReferenceGovernance;
  readonly metadata: CulturalReferenceRegistryMetadata;
  readonly trace: CulturalReferenceTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_cultural_reference_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Composition Functions

| Function | Description |
|----------|-------------|
| `composeCulturalReferenceProvenance` | Composes reference provenance from parameters |
| `composeCulturalReferenceTrace` | Composes a reference trace from metadata |
| `composeCulturalReferenceProfile` | Composes a reference profile from parameters |
| `composeCurrentContextReference` | Composes a current context reference from parameters |
| `composeReferenceGovernance` | Composes reference governance from parameters |
| `composeReferenceRelationship` | Composes a reference relationship from parameters |
| `composeCulturalReferenceRegistry` | Composes a cultural reference registry |
| `composeCulturalReferenceRegistryFromInput` | Composes a registry from input |
| `composeCuriosityCulturalReferences` | Main entry point for cultural references composition |
| `composeCuriosityArtifactWithCulturalReferences` | Composes an artifact with cultural references |

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateCulturalReferenceProfile` | Validates a single reference profile |
| `validateCurrentContextReference` | Validates a current context reference |
| `validateReferenceGovernance` | Validates reference governance |
| `validateReferenceRelationship` | Validates a reference relationship |
| `validateCulturalReferenceRegistry` | Validates a cultural reference registry |
| `validateCulturalReferenceInput` | Validates cultural reference input |
| `validateCulturalReferenceTrace` | Validates a reference trace |
| `validateCuriosityArtifactWithCulturalReferences` | Validates an artifact with cultural references |

## Validation Codes (24 stable codes)

| Code | Description |
|------|-------------|
| `REFERENCE_DUPLICATE_ID` | Duplicate profile ID |
| `REFERENCE_DUPLICATE_TITLE` | Duplicate profile title |
| `CONTEXT_DUPLICATE_ID` | Duplicate context reference ID |
| `RELATIONSHIP_DUPLICATE_ID` | Duplicate relationship ID |
| `REFERENCE_INVALID_DOMAIN` | Invalid reference domain |
| `REFERENCE_INVALID_RECENCY` | Invalid reference recency |
| `REFERENCE_INVALID_PURPOSE` | Invalid reference purpose |
| `REFERENCE_INVALID_VALIDITY` | Invalid reference validity |
| `REFERENCE_INVALID_SENSITIVITY` | Invalid context sensitivity |
| `REFERENCE_INVALID_STATUS` | Invalid reference status |
| `REFERENCE_INVALID_GOVERNANCE` | Invalid governance |
| `REFERENCE_MISSING_PROVENANCE` | Missing provenance |
| `REFERENCE_MISSING_PROVIDER` | Missing provider |
| `REFERENCE_MISSING_RATIONALE` | Missing rationale |
| `REFERENCE_MISSING_CURIOSITY_REFERENCE` | Missing curiosity reference |
| `REFERENCE_MISSING_PROFILE_ID` | Missing profile ID |
| `REFERENCE_MISSING_TITLE` | Missing title |
| `REFERENCE_MISSING_GOVERNANCE` | Missing governance |
| `REFERENCE_SELF_RELATIONSHIP` | Self-relationship |
| `REFERENCE_EMPTY_REGISTRY` | Empty registry |
| `REFERENCE_INVALID_TRACE` | Invalid trace |
| `REFERENCE_REGISTRY_INCONSISTENCY` | Registry inconsistency |
| `REFERENCE_INVALID_CONFIGURATION` | Invalid configuration |
| `REFERENCE_UNSAFE_CONFIGURATION` | Unsafe configuration |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedReferenceDomain` | Type guard for reference domains |
| `isSupportedReferenceRecency` | Type guard for reference recency |
| `isSupportedReferencePurpose` | Type guard for reference purposes |
| `isSupportedReferenceValidity` | Type guard for reference validity |
| `isSupportedContextSensitivity` | Type guard for context sensitivity |
| `isSupportedReferenceStatus` | Type guard for reference statuses |
| `isSupportedReferenceGovernance` | Type guard for governance values |
| `getCanonicalReferenceDomains` | Returns canonical reference domains |
| `getCanonicalReferenceRecency` | Returns canonical reference recency |
| `getCanonicalReferencePurposes` | Returns canonical reference purposes |
| `getCanonicalReferenceValidity` | Returns canonical reference validity |
| `getCanonicalContextSensitivity` | Returns canonical context sensitivity |
| `getCanonicalReferenceStatuses` | Returns canonical reference statuses |

## Governance Rules

The Cultural Reference layer stores only metadata. It never:

- Searches the internet
- Retrieves news
- Detects trends
- Recommends references
- Generates analogies
- Chooses references automatically

It merely defines what kinds of references may later be attached by higher-level systems.

## Current Context Metadata Model

Metadata may classify references as:

- Timeless
- Historical
- Current
- Seasonal
- Temporary

The kernel never decides whether something is current. It only stores metadata.

## Safety Governance

Unsafe references must be rejected. Forbidden categories include:

- Hate
- Harassment
- Extremism
- Personal attacks
- Political persuasion
- Religious attacks
- Illegal activity
- Sexual content
- Dangerous behavior
- Misinformation

No runtime moderation logic. Only metadata validation.

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

- Search the internet
- Retrieve news
- Detect trends
- Recommend references
- Generate analogies
- Generate comparisons
- Modify Narrative Agent
- Modify Knowledge Agent
- Modify Didactic Agent

Everything remains metadata.

## Runtime Limitations

This phase defines only metadata structures. No runtime reference selection, trend detection, or web access exists.

## Out-of-Scope

- Internet search
- News retrieval
- Trend detection
- Reference recommendation
- Analogy generation
- Comparison generation
- LLM invocation

## Relationship with D9-OPT-01

D9-OPT-04 extends D9-OPT-01 with cultural reference and current-context governance. The base curiosity metadata infrastructure established in D9-OPT-01 remains unchanged. D9-OPT-04 adds:

- New canonical enums for cultural reference modeling
- New contracts for reference profiles, context references, relationships, and governance
- New composition functions for cultural reference metadata
- New validation functions for cultural reference metadata
- Backward compatibility with D9-OPT-01

## Relationship with D9-OPT-02

D9-OPT-04 extends D9-OPT-02 with cultural reference governance. The educational purpose modeling established in D9-OPT-02 remains unchanged. D9-OPT-04 adds:

- Cultural reference-specific metadata structures
- Context sensitivity governance
- Reference domain modeling
- Backward compatibility with D9-OPT-02

## Relationship with D9-OPT-03

D9-OPT-04 extends D9-OPT-03 with cultural reference governance. The humor layer established in D9-OPT-03 remains unchanged. D9-OPT-04 adds:

- Cultural reference metadata structures
- Current context reference modeling
- Safety governance for cultural references
- Backward compatibility with D9-OPT-03

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
