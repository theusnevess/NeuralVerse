# D9-OPT-13 — Storage Separation, Retrieval Strategy & Contextual Overlay Modeling

## Purpose

This phase extends the Curiosity Agent with Storage Separation, Retrieval Strategy & Contextual Overlay Modeling, enabling the platform to define the deterministic metadata model describing how curiosity artifacts are stored, indexed, retrieved, layered, and contextually overlaid throughout NeuralVerse without implementing storage engines, databases, retrieval algorithms, search, ranking, vector search, embeddings, contextual reasoning, or runtime overlay execution.

## Motivation

The Curiosity Agent must be capable of expressing how curiosity artifacts are stored, indexed, retrieved, layered, and contextually overlaid. This layer provides the deterministic metadata structures that enable this without implementing storage engines, databases, retrieval algorithms, search, ranking, vector search, embeddings, contextual reasoning, or runtime overlay execution.

## Architectural Position

The Curiosity Agent describes:

- Where curiosity metadata belongs

It never decides:

- How curiosity is retrieved

Storage belongs to Infrastructure.

Retrieval belongs to Retrieval systems.

Context resolution belongs to Runtime.

D9 merely exposes canonical metadata.

## Architecture

The Curiosity Storage Kernel follows the same architectural patterns established by D9-OPT-01 through D9-OPT-12:

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

### Storage Types (10 values)

| Storage Type | Description |
|--------------|-------------|
| `embedded` | Embedded |
| `local_registry` | Local registry |
| `shared_registry` | Shared registry |
| `retrieval_reference` | Retrieval reference |
| `overlay_reference` | Overlay reference |
| `persistent_reference` | Persistent reference |
| `cached_reference` | Cached reference |
| `archival_reference` | Archival reference |
| `temporary_reference` | Temporary reference |
| `external_reference` | External reference |

### Retrieval Strategies (10 values)

| Strategy | Description |
|----------|-------------|
| `direct_lookup` | Direct lookup |
| `metadata_filter` | Metadata filter |
| `tag_lookup` | Tag lookup |
| `relationship_lookup` | Relationship lookup |
| `category_lookup` | Category lookup |
| `overlay_lookup` | Overlay lookup |
| `dependency_lookup` | Dependency lookup |
| `reference_lookup` | Reference lookup |
| `hierarchical_lookup` | Hierarchical lookup |
| `registry_lookup` | Registry lookup |

### Overlay Types (10 values)

| Overlay Type | Description |
|--------------|-------------|
| `lesson_overlay` | Lesson overlay |
| `module_overlay` | Module overlay |
| `laboratory_overlay` | Laboratory overlay |
| `assessment_overlay` | Assessment overlay |
| `portfolio_overlay` | Portfolio overlay |
| `concept_overlay` | Concept overlay |
| `visual_overlay` | Visual overlay |
| `application_overlay` | Application overlay |
| `timeline_overlay` | Timeline overlay |
| `context_overlay` | Context overlay |

### Storage Visibility (10 values)

| Visibility | Description |
|------------|-------------|
| `hidden` | Hidden |
| `internal` | Internal |
| `system` | System |
| `agent` | Agent |
| `workspace` | Workspace |
| `lesson` | Lesson |
| `module` | Module |
| `public` | Public |
| `shared` | Shared |
| `global` | Global |

### Storage Scope (10 values)

| Scope | Description |
|-------|-------------|
| `local` | Local |
| `module` | Module |
| `course` | Course |
| `track` | Track |
| `workspace` | Workspace |
| `agent` | Agent |
| `curriculum` | Curriculum |
| `project` | Project |
| `global` | Global |
| `cross_agent` | Cross-agent |

### Storage Status (6 values)

| Status | Description |
|--------|-------------|
| `draft` | Draft |
| `review` | Under review |
| `approved` | Approved |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |

## Contracts

### CuriosityStorageProfile

```typescript
interface CuriosityStorageProfile {
  readonly profileId: string;
  readonly title: string;
  readonly storageType: StorageType;
  readonly retrievalStrategy: RetrievalStrategy;
  readonly overlayType: OverlayType;
  readonly storageVisibility: StorageVisibility;
  readonly storageScope: StorageScope;
  readonly conceptIds: readonly string[];
  readonly status: StorageStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityStorageProvenance;
  readonly trace: CuriosityStorageTrace;
}
```

### RetrievalMetadata

```typescript
interface RetrievalMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly retrievalStrategy: RetrievalStrategy;
  readonly indexKey: string;
  readonly indexValue: string;
  readonly priority: number;
  readonly contextRequired: readonly string[];
}
```

### OverlayMetadata

```typescript
interface OverlayMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly overlayType: OverlayType;
  readonly overlayScope: string;
  readonly overlayPriority: number;
  readonly overlayContext: readonly string[];
  readonly overlayDependencies: readonly string[];
}
```

### StorageRegistry

```typescript
interface StorageRegistry {
  readonly registryId: string;
  readonly profiles: readonly CuriosityStorageProfile[];
  readonly retrievals: readonly RetrievalMetadata[];
  readonly overlays: readonly OverlayMetadata[];
  readonly relationships: readonly StorageRelationship[];
  readonly metadata: StorageRegistryMetadata;
  readonly trace: CuriosityStorageTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_storage_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Composition Functions

| Function | Description |
|----------|-------------|
| `composeCuriosityStorageProvenance` | Composes storage provenance from parameters |
| `composeCuriosityStorageTrace` | Composes a storage trace from metadata |
| `composeCuriosityStorageProfile` | Composes a storage profile from parameters |
| `composeRetrievalMetadata` | Composes retrieval metadata from parameters |
| `composeOverlayMetadata` | Composes overlay metadata from parameters |
| `composeStorageRelationship` | Composes a storage relationship from parameters |
| `composeStorageRegistry` | Composes a storage registry |
| `composeStorageRegistryFromInput` | Composes a registry from input |
| `composeStorageArtifacts` | Main entry point for storage composition |
| `composeCuriosityArtifactWithStorage` | Composes an artifact with storage |

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateCuriosityStorageProfile` | Validates a single storage profile |
| `validateRetrievalMetadata` | Validates retrieval metadata |
| `validateOverlayMetadata` | Validates overlay metadata |
| `validateStorageRelationship` | Validates a storage relationship |
| `validateStorageRegistry` | Validates a storage registry |
| `validateStorageInput` | Validates storage input |
| `validateStorageTrace` | Validates a storage trace |
| `validateCuriosityArtifactWithStorage` | Validates an artifact with storage |

## Validation Codes (24 stable codes)

| Code | Description |
|------|-------------|
| `STORAGE_DUPLICATE_ID` | Duplicate profile ID |
| `STORAGE_DUPLICATE_TITLE` | Duplicate profile title |
| `STORAGE_INVALID_STORAGE` | Invalid storage type |
| `STORAGE_INVALID_RETRIEVAL` | Invalid retrieval strategy |
| `STORAGE_INVALID_OVERLAY` | Invalid overlay type |
| `STORAGE_INVALID_SCOPE` | Invalid storage scope |
| `STORAGE_INVALID_VISIBILITY` | Invalid storage visibility |
| `STORAGE_INVALID_STATUS` | Invalid storage status |
| `STORAGE_INVALID_GOVERNANCE` | Invalid governance |
| `STORAGE_MISSING_PROVENANCE` | Missing provenance |
| `STORAGE_MISSING_PROVIDER` | Missing provider |
| `STORAGE_MISSING_RATIONALE` | Missing rationale |
| `STORAGE_MISSING_CURIOSITY_REFERENCE` | Missing curiosity reference |
| `STORAGE_MISSING_PROFILE_ID` | Missing profile ID |
| `STORAGE_MISSING_TITLE` | Missing title |
| `STORAGE_MISSING_OVERLAY` | Missing overlay |
| `STORAGE_SELF_RELATIONSHIP` | Self-relationship |
| `STORAGE_EMPTY_REGISTRY` | Empty registry |
| `STORAGE_INVALID_TRACE` | Invalid trace |
| `STORAGE_REGISTRY_INCONSISTENCY` | Registry inconsistency |
| `STORAGE_INVALID_CONFIGURATION` | Invalid configuration |
| `STORAGE_INVALID_RELATIONSHIP` | Invalid relationship |
| `STORAGE_MISSING_GOVERNANCE` | Missing governance |
| `STORAGE_UNSUPPORTED_STORAGE` | Unsupported storage |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedStorageType` | Type guard for storage types |
| `isSupportedRetrievalStrategy` | Type guard for retrieval strategies |
| `isSupportedOverlayType` | Type guard for overlay types |
| `isSupportedStorageVisibility` | Type guard for storage visibility |
| `isSupportedStorageScope` | Type guard for storage scopes |
| `isSupportedStorageStatus` | Type guard for storage statuses |
| `isSupportedStorageGovernance` | Type guard for governance values |
| `getCanonicalStorageTypes` | Returns canonical storage types |
| `getCanonicalRetrievalStrategies` | Returns canonical retrieval strategies |
| `getCanonicalOverlayTypes` | Returns canonical overlay types |
| `getCanonicalStorageVisibility` | Returns canonical storage visibility |
| `getCanonicalStorageScopes` | Returns canonical storage scopes |
| `getCanonicalStorageStatuses` | Returns canonical storage statuses |

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

- Implement storage engines
- Create databases
- Execute retrieval algorithms
- Perform searches
- Rank results
- Execute vector searches
- Create embeddings
- Perform contextual reasoning
- Execute runtime overlays
- Modify Retrieval Agent
- Modify Knowledge Agent
- Modify Narrative Agent
- Modify Didactic Agent
- Modify Laboratory Agent
- Modify Assessment Agent
- Modify Application Agent

Everything remains metadata.

## Runtime Limitations

This phase defines only metadata structures. No runtime storage implementation, retrieval execution, database creation, search, ranking, vector search, embeddings, contextual reasoning, or overlay execution exists.

## Out-of-Scope

- Storage engine implementation
- Database creation
- Retrieval algorithm execution
- Search implementation
- Ranking implementation
- Vector search implementation
- Embedding creation
- Contextual reasoning
- Runtime overlay execution
- LLM invocation

## Relationship with D9-OPT-01

D9-OPT-13 extends D9-OPT-01 with Storage Separation, Retrieval Strategy & Contextual Overlay Modeling. The base curiosity metadata infrastructure established in D9-OPT-01 remains unchanged. D9-OPT-13 adds:

- New canonical enums for storage modeling
- New contracts for storage profiles, retrieval metadata, overlay metadata, and relationships
- New composition functions for storage metadata
- New validation functions for storage metadata
- Backward compatibility with D9-OPT-01

## Relationship with D9-OPT-02

D9-OPT-13 extends D9-OPT-02 with storage modeling. The educational purpose modeling established in D9-OPT-02 remains unchanged. D9-OPT-13 adds:

- Storage type modeling
- Retrieval strategy modeling
- Backward compatibility with D9-OPT-02

## Relationship with D9-OPT-03

D9-OPT-13 extends D9-OPT-03 with storage modeling. The humor layer established in D9-OPT-03 remains unchanged. D9-OPT-13 adds:

- Overlay type modeling
- Storage visibility modeling
- Backward compatibility with D9-OPT-03

## Relationship with D9-OPT-04

D9-OPT-13 extends D9-OPT-04 with storage modeling. The cultural reference governance established in D9-OPT-04 remains unchanged. D9-OPT-13 adds:

- Storage scope modeling
- Storage relationship modeling
- Backward compatibility with D9-OPT-04

## Relationship with D9-OPT-05

D9-OPT-13 extends D9-OPT-05 with storage modeling. The curiosity card, engineer note & field note modeling established in D9-OPT-05 remains unchanged. D9-OPT-13 adds:

- Storage profile modeling
- Retrieval metadata modeling
- Overlay metadata modeling
- Backward compatibility with D9-OPT-05

## Relationship with D9-OPT-06

D9-OPT-13 extends D9-OPT-06 with storage modeling. The historical oddity, research trail & knowledge evolution curiosity modeling established in D9-OPT-06 remains unchanged. D9-OPT-13 adds:

- Storage relationship modeling
- Storage registry structure
- Backward compatibility with D9-OPT-06

## Relationship with D9-OPT-07

D9-OPT-13 extends D9-OPT-07 with storage modeling. The unexpected connection, limitation warning & application surprise modeling established in D9-OPT-07 remains unchanged. D9-OPT-13 adds:

- Storage profile modeling
- Retrieval metadata modeling
- Backward compatibility with D9-OPT-07

## Relationship with D9-OPT-08

D9-OPT-13 extends D9-OPT-08 with storage modeling. The laboratory challenge, what-if prompt & experiment curiosity modeling established in D9-OPT-08 remains unchanged. D9-OPT-13 adds:

- Overlay metadata modeling
- Storage visibility modeling
- Backward compatibility with D9-OPT-08

## Relationship with D9-OPT-09

D9-OPT-13 extends D9-OPT-09 with storage modeling. The misconception card & assessment reinforcement curiosity modeling established in D9-OPT-09 remains unchanged. D9-OPT-13 adds:

- Storage profile modeling
- Retrieval metadata modeling
- Backward compatibility with D9-OPT-09

## Relationship with D9-OPT-10

D9-OPT-13 extends D9-OPT-10 with storage modeling. The visual curiosity presentation & accessibility metadata established in D9-OPT-10 remains unchanged. D9-OPT-13 adds:

- Overlay metadata modeling
- Storage visibility modeling
- Backward compatibility with D9-OPT-10

## Relationship with D9-OPT-11

D9-OPT-13 extends D9-OPT-11 with storage modeling. The user preference, tone controls & placement rules established in D9-OPT-11 remains unchanged. D9-OPT-13 adds:

- Storage profile modeling
- Retrieval metadata modeling
- Backward compatibility with D9-OPT-11

## Relationship with D9-OPT-12

D9-OPT-13 extends D9-OPT-12 with storage modeling. The curiosity governance workflow & validation rules established in D9-OPT-12 remains unchanged. D9-OPT-13 adds:

- Storage relationship modeling
- Storage registry structure
- Backward compatibility with D9-OPT-12

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
