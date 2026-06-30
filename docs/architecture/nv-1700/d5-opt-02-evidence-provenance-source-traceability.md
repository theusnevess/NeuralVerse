# D5-OPT-02 — Evidence Provenance & Source Traceability

## Purpose

Implements the canonical provenance and source traceability architecture for the Obsidian & Knowledge Governance Agent. This optimization establishes the deterministic evidence layer responsible for representing where every knowledge artifact originates, which sources support it, and how those sources are governed.

It is the provenance foundation for the entire NeuralVerse Knowledge System.

It follows the architectural progression established in:

- D2-OPT-02 — Research Evidence Registry
- D3-OPT-02 — Curriculum Dependency Orchestration
- D4-OPT-02 — Safe Deterministic Execution Model
- D5-OPT-01 — Knowledge Registry & Canonical Artifact Kernel

This optimization models provenance only. It never validates scientific correctness. It never generates citations. It never searches external sources. It never synchronizes Obsidian.

---

## Architecture

The implementation follows every architectural convention already established across D2, D3, D4, and D5:

- immutable contracts
- deterministic composition functions
- provenance-first modeling
- structured validation
- additive evolution only
- pure compose functions
- zero hidden state

The agent is responsible for preserving the integrity, consistency, traceability, and long-term quality of the evidence provenance layer.

Evidence is treated as a governed asset. Every knowledge artifact eventually depends on this provenance layer.

---

## Canonical Evidence Source Types (10)

```text
research_paper
book
official_documentation
technical_standard
dataset
course_material
conference
technical_report
trusted_web_resource
internal_reference
```

---

## Evidence Authority Levels (10)

```text
peer_reviewed
official
academic
industry
government
maintainer
community_verified
internal
legacy
experimental
```

---

## Citation Types (10)

```text
primary
secondary
supporting
background
reference
implementation
specification
comparison
historical
supplementary
```

---

## Source Status (6)

```text
draft
review
approved
published
deprecated
archived
```

Reuses governance status from previous agents.

---

## Source Model

Every source includes metadata only:

- `sourceId` — Unique identifier
- `title` — Human-readable title
- `sourceType` — The type of evidence source
- `authorityLevel` — The authority level
- `status` — The lifecycle status
- `canonicalIdentifier` — Canonical identifier
- `publisher` — Publisher name
- `authors` — List of authors
- `publicationYear` — Year of publication
- `urlReference` — URL reference
- `tags` — List of tags
- `summary` — Brief summary
- `provenance` — Provenance metadata

No document body. No abstract. No extracted content. Metadata only.

---

## Citation Model

Every citation includes metadata only:

- `citationId` — Unique identifier
- `knowledgeId` — Reference to knowledge artifact
- `sourceId` — Reference to evidence source
- `citationType` — The type of citation
- `sectionReference` — Section reference
- `pageReference` — Page reference
- `confidenceLevel` — Confidence level (0-1)
- `provenance` — Provenance metadata

Citation never stores copied content. Never stores paragraphs. Never stores markdown.

---

## Evidence Relationship Model

Every relationship includes metadata only:

- `relationshipId` — Unique identifier
- `knowledgeId` — Reference to knowledge artifact
- `sourceId` — Reference to evidence source
- `citationId` — Reference to citation
- `relationshipType` — Type of relationship
- `description` — Relationship description
- `provenance` — Provenance metadata

Relationship metadata only. No semantic inference.

---

## Provenance Chain

Every source requires provenance. Every citation requires provenance. Every relationship requires provenance.

Required fields:

- `source` — Who created it
- `governanceStatus` — The governance status
- `providedBy` — Organization/team
- `rationale` — Why it exists

Missing provenance fails validation.

---

## Registry Model

The registry stores metadata only:

- `sources` — List of evidence sources
- `citations` — List of citation references
- `relationships` — List of evidence relationships
- `metadata` — Registry metadata
- `trace` — Deterministic trace
- `deterministic` — Always true
- `generatedFrom` — Always 'deterministic_evidence_kernel'
- `randomUsed` — Always false
- `timeDependency` — Always false

Sorting is deterministic:

- Sources: `sourceId` → `sourceType` → `title`
- Citations: `citationId` → `knowledgeId` → `sourceId`
- Relationships: `relationshipId` → `knowledgeId` → `sourceId`

---

## Validation Layer

### Functions

- `validateEvidenceSource()` — Validates a single source
- `validateCitationReference()` — Validates a single citation
- `validateEvidenceRelationship()` — Validates a single relationship
- `validateEvidenceRegistry()` — Validates a complete registry
- `validateEvidenceInput()` — Validates input data
- `validateEvidenceTrace()` — Validates trace metadata
- `validateKnowledgeArtifactWithEvidence()` — Validates knowledge artifact with evidence

### Validation Codes

```text
EVIDENCE_DUPLICATE_SOURCE
EVIDENCE_DUPLICATE_CITATION
EVIDENCE_DUPLICATE_RELATIONSHIP
EVIDENCE_UNKNOWN_SOURCE_TYPE
EVIDENCE_UNKNOWN_AUTHORITY
EVIDENCE_UNKNOWN_CITATION_TYPE
EVIDENCE_UNKNOWN_STATUS
EVIDENCE_INVALID_REFERENCE
EVIDENCE_MISSING_PROVENANCE
EVIDENCE_EMPTY_REGISTRY
EVIDENCE_INVALID_TRACE
EVIDENCE_MISSING_SOURCE
EVIDENCE_MISSING_RATIONALE
EVIDENCE_MISSING_PROVIDED_BY
EVIDENCE_MISSING_SOURCE_ID
EVIDENCE_MISSING_TITLE
EVIDENCE_MISSING_CITATION_ID
EVIDENCE_MISSING_KNOWLEDGE_ID
EVIDENCE_MISSING_SOURCE_REFERENCE
EVIDENCE_MISSING_RELATIONSHIP_ID
EVIDENCE_MISSING_CITATION_REFERENCE
EVIDENCE_INVALID_GOVERNANCE
EVIDENCE_INVALID_CONFIDENCE
EVIDENCE_INVALID_PUBLICATION_YEAR
EVIDENCE_INVALID_REGISTRY
```

Validation returns structured errors. Never throws exceptions.

---

## Deterministic Guarantees

The implementation never uses:

```text
Math.random
Date.now
performance.now
new Date()
crypto.randomUUID()
uuid
Promise
async
await
fetch
XMLHttpRequest
WebSocket
window
document
navigator
localStorage
sessionStorage
indexedDB
globalThis
process.env
```

No runtime clocks. No randomness.

---

## Non-Responsibilities

This optimization MUST NOT implement:

- paper parsing
- PDF reading
- citation generation
- bibliography generation
- semantic search
- retrieval
- web search
- Obsidian synchronization
- markdown generation
- evidence scoring
- source ranking
- scientific validation
- terminology governance
- document versioning
- certification
- graph traversal
- knowledge rewriting

Those capabilities belong to later D5 optimizations.

---

## Public API

### Kernel Functions

- `composeEvidenceProvenance()` — Composes evidence provenance
- `composeEvidenceSource()` — Composes an evidence source
- `composeCitationReference()` — Composes a citation reference
- `composeEvidenceRelationship()` — Composes an evidence relationship
- `composeEvidenceTrace()` — Composes a trace
- `composeEvidenceRegistry()` — Composes a registry
- `composeEvidenceRegistryFromInput()` — Composes a registry from input
- `composeEvidence()` — Main entry point
- `composeKnowledgeArtifactWithEvidence()` — Composes knowledge artifact with evidence
- `composeKnowledgeEvidence()` — Composes knowledge evidence

### Helper Functions

- `isSupportedEvidenceSourceType()` — Type guard for source types
- `isSupportedEvidenceAuthority()` — Type guard for authority levels
- `isSupportedCitationType()` — Type guard for citation types
- `isSupportedSourceStatus()` — Type guard for source statuses
- `isSupportedEvidenceGovernanceStatus()` — Type guard for governance statuses
- `getCanonicalEvidenceSourceTypes()` — Returns canonical source types
- `getCanonicalEvidenceAuthorityLevels()` — Returns canonical authority levels
- `getCanonicalCitationTypes()` — Returns canonical citation types
- `getCanonicalSourceStatuses()` — Returns canonical source statuses
- `getCanonicalEvidenceGovernanceStatuses()` — Returns canonical governance statuses

---

## Future Extensions

This foundation enables:

- D5-OPT-03: Terminology Governance
- D5-OPT-04: Editorial Quality Index
- D5-OPT-05: Gap Detection & Coverage Analysis
- D5-OPT-06: Cross-Agent Validation
- D5-OPT-07: Certification & Quality Gate
- D5-OPT-08: Synchronization & Orchestration
- D5-OPT-09: Public API Facade
