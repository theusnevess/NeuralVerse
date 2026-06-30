# D3-OPT-08 — Curriculum Evolution & Version Governance

## Purpose

This phase implements the **deterministic Curriculum Evolution & Version Governance** layer for the Curriculum Agent (D3). It extends the D3-OPT-01 through D3-OPT-07 curriculum pipeline with evolution metadata, version tracking, lifecycle management, and evolution relation modeling.

This phase does **not** implement:

- curriculum modification
- curriculum migration
- educational change inference
- automatic version selection
- governance voting
- runtime behavior
- automatic migration
- curriculum editing

It **only models and validates evolution metadata.**

## Architecture

The Curriculum Evolution & Version Governance follows the same architectural patterns established by D3-OPT-01 through D3-OPT-07:

- **Single monolithic contract file** (`CurriculumAgentContract.ts`) extended with evolution types
- **Pure deterministic kernel** (`EvolutionKernel.ts`) with compose functions
- **Validation layer** (`EvolutionValidation.ts`) returning structured errors
- **Barrel exports** (`index.ts`) organizing the public API

### Files

| File | Purpose |
|------|---------|
| `CurriculumAgentContract.ts` | Extended with evolution/version governance types |
| `EvolutionKernel.ts` | Deterministic evolution composition functions |
| `EvolutionValidation.ts` | Structured evolution validation layer |
| `EvolutionKernel.test.ts` | Deterministic test suite (50+ tests) |
| `index.ts` | Barrel exports (extended) |

## Version Model

A curriculum version represents a specific iteration of the curriculum with its own lifecycle state. Versions are immutable metadata that track the evolution of curriculum content over time.

### Version Properties

| Property | Type | Purpose |
|----------|------|---------|
| `versionId` | `string` | Unique identifier |
| `versionType` | `CurriculumVersionType` | Type of version (major, minor, patch, etc.) |
| `versionNumber` | `string` | Semantic version number |
| `lifecycleState` | `CurriculumLifecycleState` | Current lifecycle state |
| `source` | `string` | Source authority |
| `governanceStatus` | `CurriculumGovernanceStatus` | Governance status |
| `rationale` | `string` | Justification for this version |
| `providedBy` | `string` | Providing authority |

## Lifecycle Model

The lifecycle model defines the possible states a curriculum version can transition through. Each state represents a distinct phase in the version's governance journey.

### Lifecycle States

| State | Purpose |
|-------|---------|
| `draft` | Initial creation, not yet proposed |
| `proposed` | Proposed for review |
| `review` | Under governance review |
| `approved` | Approved but not yet active |
| `active` | Currently active version |
| `deprecated` | Marked for replacement |
| `superseded` | Replaced by a newer version |
| `retired` | No longer in use |
| `archived` | Preserved for historical reference |
| `rejected` | Rejected during review |

## Evolution Model

Evolution records track the relationships between curriculum versions. They describe how versions relate to each other without modifying any curriculum content.

### Evolution Relations

| Relation | Purpose |
|----------|---------|
| `supersedes` | Version replaces another |
| `derived_from` | Version derived from another |
| `fork_of` | Version forked from another |
| `merged_into` | Version merged into another |
| `replaces` | Version replaces another |
| `equivalent_to` | Version is equivalent to another |
| `historical_copy` | Historical copy of another version |
| `canonical_successor` | Canonical successor to another version |
| `experimental_branch` | Experimental branch from another version |
| `restores` | Version restores a previous version |

## Deterministic Ordering

Registries MUST sort:

**Primary:** `versionId`
**Secondary:** `lifecycleState`
**Tertiary:** `relationType`

Never depend on insertion order.

## Lifecycle Rules

Validation enforces the following business rules:

1. **Multiple Active Versions:** Only one version may be `active` at a time per canonical curriculum
2. **Retired Successor:** A `retired` version may not have `supersedes` relations
3. **Rejected Relations:** A `rejected` version may not have outgoing evolution relations
4. **Self Reference:** Evolution records cannot reference themselves
5. **Invalid References:** Evolution records must reference existing versions

## Provenance Model

Every version requires:

- `versionId` — Unique identifier
- `source` — Source authority
- `governanceStatus` — Canonical governance status
- `rationale` — Justification
- `providedBy` — Providing authority

Every evolution relation requires:

- `relationId` — Unique identifier
- `source` — Source authority
- `governanceStatus` — Canonical governance status
- `rationale` — Justification
- `providedBy` — Providing authority

## Validation Strategy

Validation returns structured errors, never exceptions for expected validation failures.

### Validation Codes

| Code | Meaning |
|------|---------|
| `EVOLUTION_UNKNOWN_VERSION` | Non-canonical version type |
| `EVOLUTION_UNKNOWN_STATE` | Non-canonical lifecycle state |
| `EVOLUTION_UNKNOWN_RELATION` | Non-canonical evolution relation |
| `EVOLUTION_DUPLICATE_VERSION` | Duplicate version ID |
| `EVOLUTION_DUPLICATE_RELATION` | Duplicate evolution relation ID |
| `EVOLUTION_SELF_REFERENCE` | Evolution record references itself |
| `EVOLUTION_INVALID_REFERENCE` | References non-existent version |
| `EVOLUTION_INVALID_SUCCESSOR` | Invalid successor version |
| `EVOLUTION_INVALID_LIFECYCLE` | Invalid lifecycle transition |
| `EVOLUTION_MULTIPLE_ACTIVE` | Multiple active versions detected |
| `EVOLUTION_RETIRED_HAS_SUCCESSOR` | Retired version has supersedes relation |
| `EVOLUTION_REJECTED_HAS_RELATION` | Rejected version has outgoing relation |
| `EVOLUTION_MISSING_SOURCE` | Missing source field |
| `EVOLUTION_MISSING_PROVENANCE` | Missing provenance data |
| `EVOLUTION_EMPTY_REGISTRY` | Registry has no versions/records |
| `EVOLUTION_INVALID_STATUS` | Invalid governance status |

## Deterministic Guarantees

The kernel provides the following deterministic guarantees:

1. **Identical input produces identical output** — no randomness, no time dependency
2. **Deterministic ordering** — versions sorted by versionId, lifecycleState, versionType, versionNumber
3. **No mutation** — all compose functions return new objects; inputs are never modified
4. **No side effects** — no network access, no filesystem access, no global state
5. **No inference** — the kernel does not infer educational changes or recommend curriculum

### Forbidden

The kernel never:

- Uses `Math.random`, `Date.now`, `performance.now`, `new Date()`
- Uses `crypto.randomUUID()` or UUID generation
- Accesses network (`fetch`, `axios`, `XMLHttpRequest`, `WebSocket`)
- Accesses browser APIs (`navigator`, `window`, `document`, `localStorage`)
- Accesses filesystem
- Uses `async` or `Promise`
- Modifies curriculum
- Rewrites curriculum
- Migrates curriculum
- Generates curriculum
- Infers educational changes
- Recommends curriculum changes
- Selects canonical version
- Performs governance voting
- Edits dependencies, roadmap, progression, or learning paths
- Executes migrations
- Calls APIs or LLMs
- Accesses databases

## Relationship with D3-OPT-01 through D3-OPT-07

This phase integrates with prior D3 phases as follows:

- **Extends:** The curriculum pipeline with evolution metadata
- **Never modifies:** Any existing D3-OPT-01 through D3-OPT-07 contracts or behavior
- **Additive only:** All changes are purely additive
- **Backward compatible:** No breaking changes to existing APIs

## Public API

### Compose Functions

- `composeCurriculumVersion(params)` — Compose a curriculum version
- `composeLifecycleRecord(params)` — Compose a lifecycle record
- `composeEvolutionRecord(params)` — Compose an evolution record
- `composeEvolutionRegistry(params)` — Compose an evolution registry
- `composeEvolutionTrace(registryId, versions, lifecycleRecords, evolutionRecords)` — Compose an evolution trace
- `composeEvolutionProvenance(registry)` — Compose evolution provenance
- `composeCurriculumEvolution(input)` — Compose evolution from input
- `composeCurriculumArtifactWithEvolution(params)` — Compose artifact with evolution

### Helper Functions

- `isSupportedVersionType(type)` — Check version type support
- `isSupportedLifecycleState(state)` — Check lifecycle state support
- `isSupportedEvolutionRelation(relation)` — Check evolution relation support
- `isSupportedEvolutionGovernanceStatus(status)` — Check governance status support
- `getCanonicalVersionTypes()` — Return canonical version types
- `getCanonicalLifecycleStates()` — Return canonical lifecycle states
- `getCanonicalEvolutionRelations()` — Return canonical evolution relations

### Validation Functions

- `validateCurriculumVersion(version, existingVersionIds)` — Validate a version
- `validateLifecycleRecord(record, existingLifecycleIds, existingVersionIds)` — Validate a lifecycle record
- `validateEvolutionRecord(record, existingRelationIds, existingVersionIds)` — Validate an evolution record
- `validateEvolutionRegistry(registry)` — Validate an evolution registry
- `validateCurriculumArtifactWithEvolution(artifact)` — Validate an artifact
- `validateEvolutionInput(input)` — Validate input

## Out of Scope

The following capabilities are explicitly out of scope for this phase:

- curriculum modification
- curriculum migration
- educational change inference
- automatic version selection
- governance voting
- runtime behavior
- automatic migration
- curriculum editing
- dependency editing
- roadmap editing
- progression editing
- learning path editing

## Runtime Limitations

- All operations are synchronous and deterministic
- No external dependencies
- No network access
- No filesystem access
- No async operations
- No global mutable state
- No randomness
- No time dependency
