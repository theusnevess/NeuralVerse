# D10-OPT-15 — Premium Asset Governance

## Purpose

This phase defines the canonical Premium Asset Governance Layer for the Knowledge Agent. It establishes the immutable metadata architecture that governs premium educational assets attached to Knowledge Artifacts. This module does not generate assets, render assets, download assets, manage storage, or perform licensing decisions at runtime. Its exclusive responsibility is to define immutable metadata describing premium assets associated with canonical knowledge.

## Motivation

The Knowledge Agent requires a structured way to represent that concepts may be associated with premium educational assets. A concept may need:

- Illustrations for visual learning
- Diagrams for structural understanding
- Animations for dynamic processes
- Videos for detailed explanations
- Interactive widgets for hands-on exploration
- PDFs for downloadable content
- Engineering blueprints for technical specifications
- Dataset references for data-driven learning
- Presentations for structured delivery
- External resources for supplementary material

These assets are organized by type, purpose, and access level. The asset layer models this structure without generating or rendering content.

## Architecture

```
KnowledgeAgentContract.ts    — Canonical enums and contracts
KnowledgeAssetKernel.ts      — Deterministic composition functions
KnowledgeAssetValidation.ts  — Structured validation (never throws)
KnowledgeAssetKernel.test.ts — Comprehensive test suite
index.ts                     — Public API surface
```

## Canonical Enums

### Asset Types (10 values)

```typescript
CANONICAL_ASSET_TYPES = [
  'illustration', 'diagram', 'animation', 'video',
  'interactive_widget', 'pdf', 'engineering_blueprint',
  'dataset_reference', 'presentation', 'external_resource'
]
```

### Asset Purposes (10 values)

```typescript
CANONICAL_ASSET_PURPOSES = [
  'introduce', 'clarify', 'visualize', 'demonstrate',
  'reinforce', 'compare', 'explore', 'reference',
  'engineering', 'research'
]
```

### Asset Access (10 values)

```typescript
CANONICAL_ASSET_ACCESS = [
  'public', 'registered', 'premium', 'enterprise',
  'institutional', 'internal', 'restricted', 'licensed',
  'partner', 'archived'
]
```

### Asset Status (6 values)

```typescript
CANONICAL_ASSET_STATUS = [
  'draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'
]
```

### Asset Visibility (10 values)

```typescript
CANONICAL_ASSET_VISIBILITY = [
  'always', 'default', 'advanced', 'expert', 'curriculum',
  'assessment', 'laboratory', 'research', 'internal', 'hidden'
]
```

### Asset Governance (10 values)

```typescript
CANONICAL_ASSET_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental', 'deprecated',
  'restricted', 'internal', 'public', 'community', 'archived'
]
```

## Contracts

### KnowledgeAssetProvenance

Canonical provenance metadata for asset profiles.

```typescript
interface KnowledgeAssetProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: AssetGovernance;
}
```

### KnowledgeAssetDecision

Governance decision metadata for assets.

```typescript
interface KnowledgeAssetDecision {
  readonly decisionId: string;
  readonly assetId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeAssetTrace

Deterministic trace metadata for asset composition.

```typescript
interface KnowledgeAssetTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeAssetDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_asset_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeAssetProfile

Represents one premium asset record for a governed concept.

```typescript
interface KnowledgeAssetProfile {
  readonly assetId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly assetType: AssetType;
  readonly purpose: AssetPurpose;
  readonly accessLevel: AssetAccess;
  readonly visibility: AssetVisibility;
  readonly status: AssetStatus;
  readonly governance: AssetGovernance;
  readonly resourceReference: string;
  readonly licenseReference: string;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeAssetProvenance;
}
```

### KnowledgeAssetRelationship

Links asset records belonging to related assets.

```typescript
interface KnowledgeAssetRelationship {
  readonly relationshipId: string;
  readonly sourceAssetId: string;
  readonly targetAssetId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeAssetProvenance;
}
```

### KnowledgeAssetRegistryMetadata

```typescript
interface KnowledgeAssetRegistryMetadata {
  readonly registryId: string;
  readonly assetCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly assetTypeCount: number;
}
```

### KnowledgeAssetRegistry

Immutable registry of asset profiles and relationships.

```typescript
interface KnowledgeAssetRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeAssetProfile[];
  readonly relationships: readonly KnowledgeAssetRelationship[];
  readonly metadata: KnowledgeAssetRegistryMetadata;
  readonly trace: KnowledgeAssetTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_asset_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeAssetInput

Canonical input structure for composition.

```typescript
interface KnowledgeAssetInput {
  readonly profiles: readonly KnowledgeAssetProfile[];
  readonly relationships: readonly KnowledgeAssetRelationship[];
}
```

### KnowledgeArtifactWithAssets

Associates canonical concepts with premium asset metadata.

```typescript
interface KnowledgeArtifactWithAssets {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeAssetProfile[];
  readonly relationships: readonly KnowledgeAssetRelationship[];
  readonly provenance: KnowledgeAssetProvenance;
}
```

## Registry

The registry is an immutable, deterministically ordered collection of asset profiles and relationships. It enforces:

- **Stable ordering** — profiles sorted by conceptId, then assetType, then accessLevel, then assetId
- **Deterministic metadata** — counts computed from sorted profiles
- **Trace completeness** — every composition produces a trace with decisions
- **Relationship integrity** — relationships reference valid profiles

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeAssetProvenance()` | Creates KnowledgeAssetProvenance |
| `composeKnowledgeAssetTrace()` | Creates KnowledgeAssetTrace |
| `composeKnowledgeAssetProfile()` | Creates KnowledgeAssetProfile |
| `composeKnowledgeAssetRelationship()` | Creates KnowledgeAssetRelationship |
| `composeKnowledgeAssetRegistry()` | Creates KnowledgeAssetRegistry |
| `composeKnowledgeAssetRegistryFromInput()` | Creates registry from input |
| `composeKnowledgeAssets()` | Creates complete registry with trace |
| `composeKnowledgeArtifactWithAssets()` | Creates artifact with assets |

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeAssetProfile()` | Validates a single profile |
| `validateKnowledgeAssetRelationship()` | Validates a relationship |
| `validateKnowledgeAssetRegistry()` | Validates a complete registry |
| `validateKnowledgeAssetInput()` | Validates input before composition |
| `validateKnowledgeAssetTrace()` | Validates trace integrity |
| `validateKnowledgeArtifactWithAssets()` | Validates artifact association |

### Validation Codes (exactly 20, prefix ASSET_)

| Code | Description |
|------|-------------|
| `ASSET_DUPLICATE_ID` | Duplicate profile ID in registry |
| `ASSET_DUPLICATE_TITLE` | Duplicate profile title in registry |
| `ASSET_INVALID_TYPE` | Unsupported asset type |
| `ASSET_INVALID_PURPOSE` | Unsupported asset purpose |
| `ASSET_INVALID_ACCESS` | Unsupported access level |
| `ASSET_INVALID_VISIBILITY` | Unsupported visibility level |
| `ASSET_INVALID_STATUS` | Unsupported asset status |
| `ASSET_INVALID_GOVERNANCE` | Unsupported governance value |
| `ASSET_MISSING_PROVENANCE` | Profile missing provenance |
| `ASSET_MISSING_PROVIDER` | Provenance missing provider |
| `ASSET_MISSING_RATIONALE` | Provenance missing rationale |
| `ASSET_MISSING_CONCEPT_REFERENCE` | Profile missing concept reference |
| `ASSET_MISSING_PROFILE_ID` | Profile missing profile ID |
| `ASSET_MISSING_TITLE` | Profile missing title |
| `ASSET_SELF_RELATIONSHIP` | Relationship references itself |
| `ASSET_EMPTY_REGISTRY` | Registry has no profiles |
| `ASSET_INVALID_TRACE` | Trace has invalid properties |
| `ASSET_REGISTRY_INCONSISTENCY` | Metadata count mismatch |
| `ASSET_INVALID_CONFIGURATION` | Invalid relationship configuration |
| `ASSET_INVALID_ORDER` | Invalid profile ordering |

## Determinism

All compose functions satisfy 100-iteration identity tests:

- **Stable serialization** — JSON.stringify produces identical output
- **Stable ordering** — profiles are always sorted identically
- **Stable registries** — registryId, metadata, and trace are deterministic

## Immutability

All contracts use `readonly` modifiers:

- **No mutation** — inputs are never modified
- **Defensive copies** — arrays are spread into new arrays
- **Readonly output** — compose functions return readonly structures

## Governance

The Asset Layer operates under strict governance:

- Canonical enums are fixed and must never change
- Validation codes are stable and must never change
- Contracts are immutable and must never change
- Compose functions are pure and must remain deterministic

## Public API

Everything is exported through `index.ts`:

- **Contracts** — types and constants
- **Kernel** — compose functions and helpers
- **Validation** — validators and codes

## Runtime Restrictions

The following are forbidden in all kernel modules:

- `Math.random`, `Date.now`, `new Date`, `performance.now`
- `crypto.randomUUID`, `Promise`, `async`, `await`
- `fetch`, `filesystem`, `network`, `database`, `process.env`
- Image generation, video generation, animation generation
- PDF generation, download engines, streaming
- File serving, asset rendering, asset optimization
- CDN integration, license verification, payment verification
- Subscription validation, DRM, cloud storage, object storage
- S3, Blob Storage, LLM invocation

## Cross-Agent Boundaries

Production code must NOT reference:

- Didactic Agent, Curriculum Agent, Narrative Agent
- Assessment Agent, Curiosity Agent, Research Agent
- Laboratory Agent, Application Agent, Retrieval Agent

No imports, no references, no mutations from these agents.

## Out of Scope

This phase does NOT implement:

- Asset content generation
- Asset rendering
- Asset downloading
- Storage management
- Licensing decisions
- Payment processing
- DRM enforcement
- CDN integration
- LLM-based content creation

## Relationship with D10-OPT-01

This phase extends the canonical foundation established in D10-OPT-01:

- **D10-OPT-01** — Knowledge Contract & Concept Registry Kernel (canonical concepts)
- **D10-OPT-15** — Premium Asset Governance (asset metadata)

Each asset profile references a concept ID from the canonical concept registry.

## Backward Compatibility

This phase preserves full backward compatibility with D10-OPT-01 through D10-OPT-14. All previous exports remain unchanged and functional.
