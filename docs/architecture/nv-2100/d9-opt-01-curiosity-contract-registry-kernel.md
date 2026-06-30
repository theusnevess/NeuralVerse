# D9-OPT-01 — Curiosity Contract & Registry Kernel

## Motivation

The Curiosity Agent (A10) provides curiosity-driven exploration: surprising facts, unexpected connections, historical anecdotes, thought experiments, and interdisciplinary bridges that spark interest and engagement. This optimization establishes the canonical registry, contracts, validation layer, composition kernel, and deterministic metadata infrastructure that serve as the immutable foundation of the Curiosity Agent.

This phase creates only the canonical metadata infrastructure. No educational behavior, humor generation, retrieval logic, recommendation logic, cultural references, or rendering is implemented here.

## Architecture

The Curiosity Pipeline follows the same architectural patterns established by D5-D8:

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

### Curiosity Types

| Type | Description |
|------|-------------|
| `curiosity_card` | General curiosity card |
| `engineer_note` | Engineering insight |
| `historical_oddity` | Historical anecdote |
| `unexpected_connection` | Cross-domain connection |
| `limitation_warning` | Limitation awareness |
| `what_if_prompt` | Creative exploration |
| `cultural_reference` | Cultural context |
| `algorithm_personality` | Algorithmic personality |
| `lab_challenge` | Hands-on challenge |
| `misconception_card` | Misconception correction |
| `research_trail` | Research exploration |
| `application_surprise` | Practical application |

### Curiosity Categories

| Category | Description |
|----------|-------------|
| `factual_discovery` | Factual discovery |
| `engineering_insight` | Engineering insight |
| `historical_context` | Historical context |
| `cross_domain_connection` | Cross-domain connection |
| `limitation_awareness` | Limitation awareness |
| `creative_exploration` | Creative exploration |
| `cultural_context` | Cultural context |
| `algorithmic_personality` | Algorithmic personality |
| `hands_on_challenge` | Hands-on challenge |
| `misconception_correction` | Misconception correction |
| `research_exploration` | Research exploration |
| `practical_application` | Practical application |

### Curiosity Tones

| Tone | Description |
|------|-------------|
| `neutral` | Neutral tone |
| `light_wit` | Light wit |
| `playful` | Playful tone |
| `acidic_controlled` | Acidic controlled |
| `cultural` | Cultural tone |
| `disabled` | Disabled tone |

### Curiosity Status

| Status | Description |
|--------|-------------|
| `draft` | Draft status |
| `review` | Under review |
| `approved` | Approved |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |

### Curiosity Governance

| Governance | Description |
|------------|-------------|
| `canonical` | Canonical |
| `accepted` | Accepted |
| `provisional` | Provisional |
| `deprecated` | Deprecated |
| `rejected` | Rejected |

## Contracts

### CuriosityProvenance

```typescript
interface CuriosityProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: CuriosityReviewStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}
```

### CuriosityNode

```typescript
interface CuriosityNode {
  readonly curiosityId: string;
  readonly title: string;
  readonly curiosityType: CuriosityType;
  readonly category: CuriosityCategory;
  readonly tone: CuriosityTone;
  readonly status: CuriosityStatus;
  readonly governance: CuriosityGovernance;
  readonly tags: readonly string[];
  readonly summary: string;
  readonly provenance: CuriosityProvenance;
}
```

### CuriosityRegistry

```typescript
interface CuriosityRegistry {
  readonly registryId: string;
  readonly nodes: readonly CuriosityNode[];
  readonly metadata: CuriosityRegistryMetadata;
  readonly trace: CuriosityTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### CuriosityTrace

```typescript
interface CuriosityTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_curiosity_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Composition Functions

| Function | Description |
|----------|-------------|
| `composeCuriosityProvenance` | Composes curiosity provenance from parameters |
| `composeCuriosityTrace` | Composes a curiosity trace from metadata |
| `composeCuriosityNode` | Composes a curiosity node from parameters |
| `composeCuriosityRegistry` | Composes a curiosity registry from nodes |
| `composeCuriosityRegistryFromInput` | Composes a registry from input |
| `composeCuriosity` | Main entry point for curiosity composition |

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateCuriosityNode` | Validates a single curiosity node |
| `validateCuriosityRegistry` | Validates a curiosity registry |
| `validateCuriosityInput` | Validates curiosity input |
| `validateCuriosityTrace` | Validates a curiosity trace |

## Validation Codes

| Code | Description |
|------|-------------|
| `CURIOSITY_DUPLICATE_ID` | Duplicate curiosity ID |
| `CURIOSITY_DUPLICATE_TITLE` | Duplicate curiosity title |
| `CURIOSITY_INVALID_TYPE` | Invalid curiosity type |
| `CURIOSITY_INVALID_CATEGORY` | Invalid curiosity category |
| `CURIOSITY_INVALID_TONE` | Invalid curiosity tone |
| `CURIOSITY_INVALID_STATUS` | Invalid curiosity status |
| `CURIOSITY_INVALID_GOVERNANCE` | Invalid curiosity governance |
| `CURIOSITY_MISSING_PROVENANCE` | Missing provenance |
| `CURIOSITY_MISSING_PROVIDER` | Missing provider |
| `CURIOSITY_MISSING_RATIONALE` | Missing rationale |
| `CURIOSITY_MISSING_TRACE` | Missing trace |
| `CURIOSITY_MISSING_CURIOSITY_ID` | Missing curiosity ID |
| `CURIOSITY_MISSING_TITLE` | Missing title |
| `CURIOSITY_EMPTY_REGISTRY` | Empty registry |
| `CURIOSITY_INVALID_TRACE` | Invalid trace |
| `CURIOSITY_REGISTRY_INCONSISTENCY` | Registry inconsistency |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedCuriosityType` | Type guard for curiosity types |
| `isSupportedCuriosityCategory` | Type guard for curiosity categories |
| `isSupportedCuriosityTone` | Type guard for curiosity tones |
| `isSupportedCuriosityReviewStatus` | Type guard for review statuses |
| `isSupportedCuriosityGovernance` | Type guard for governance values |
| `getCanonicalCuriosityTypes` | Returns canonical curiosity types |
| `getCanonicalCuriosityCategories` | Returns canonical categories |
| `getCanonicalCuriosityTones` | Returns canonical tones |
| `getCanonicalCuriosityStatuses` | Returns canonical statuses |
| `getCanonicalCuriosityGovernance` | Returns canonical governance values |

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

## Negative Capability

Production code does NOT contain:

- `generateCuriosity`
- `recommend`
- `retrieve`
- `rank`
- `search`
- `discover`
- `infer`
- `llm`
- `agent`
- `prompt`
- `chat`
- `completion`
- Humor generation
- Reference generation

This phase defines metadata only.

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
src/agents/didactic-pipeline/**
src/agents/research-pipeline/**
src/agents/curriculum-pipeline/**
src/agents/laboratory-pipeline/**
src/agents/knowledge-pipeline/**
src/agents/narrative-pipeline/**
src/agents/application-pipeline/**
src/agents/assessment-pipeline/**
src/runtime/**
src/frontend/**
```

## Relationship with Future D9 Phases

This phase (D9-OPT-01) establishes the canonical metadata infrastructure. Future phases will implement:

- **D9-OPT-02**: Curiosity Cards & Humor Generation
- **D9-OPT-03**: Cultural References & Historical Context
- **D9-OPT-04**: Laboratory Prompts & Research Trails
- **D9-OPT-05**: Retrieval & Recommendation Logic
- **D9-OPT-06**: Governance & Certification
- **D9-OPT-07**: Public Facade & API Consolidation

Each future phase will extend the contracts and kernel established here, following the same architectural patterns.
