# D10-OPT-10 — Research Provenance

## Purpose

This phase defines the canonical Research Provenance Layer for the Knowledge Agent. It is responsible only for modeling provenance metadata describing where a knowledge artifact originated, how it was validated academically, and what evidence supports it. This module does not perform research, search papers, evaluate scientific quality, or retrieve citations. It is a deterministic metadata layer only.

## Motivation

The Knowledge Agent requires a structured way to represent that concepts can be supported by research evidence. A concept may need:

- Journal articles for peer-reviewed evidence
- Conference papers for academic presentations
- Technical reports for official findings
- Books for comprehensive coverage
- Book chapters for focused topics
- Official documentation for authoritative references
- Standards for specification compliance
- Whitepapers for industry insights
- Theses for original research
- Reference works for established knowledge

These research records are organized by source type, evidence level, and citation type. The research layer models this structure without performing research.

## Architecture

```
KnowledgeAgentContract.ts      — Canonical enums and contracts
KnowledgeResearchKernel.ts     — Deterministic composition functions
KnowledgeResearchValidation.ts — Structured validation (never throws)
KnowledgeResearchKernel.test.ts — Comprehensive test suite
index.ts                       — Public API surface
```

## Canonical Enums

### Research Source Types (10 values)

```typescript
CANONICAL_RESEARCH_SOURCE_TYPES = [
  'journal_article', 'conference_paper', 'technical_report',
  'book', 'book_chapter', 'official_documentation',
  'standard', 'whitepaper', 'thesis', 'reference_work'
]
```

### Evidence Levels (10 values)

```typescript
CANONICAL_EVIDENCE_LEVELS = [
  'canonical', 'peer_reviewed', 'official', 'validated',
  'widely_accepted', 'community_reviewed', 'provisional',
  'experimental', 'historical', 'deprecated'
]
```

### Citation Types (10 values)

```typescript
CANONICAL_CITATION_TYPES = [
  'primary_source', 'secondary_source', 'review', 'survey',
  'textbook', 'documentation', 'specification', 'standard',
  'historical', 'supplementary'
]
```

### Research Status (6 values)

```typescript
CANONICAL_RESEARCH_STATUS = [
  'draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'
]
```

### Research Visibility (10 values)

```typescript
CANONICAL_RESEARCH_VISIBILITY = [
  'always', 'default', 'advanced', 'expert', 'curriculum',
  'assessment', 'laboratory', 'research', 'internal', 'hidden'
]
```

### Research Governance (10 values)

```typescript
CANONICAL_RESEARCH_GOVERNANCE = [
  'canonical', 'accepted', 'provisional', 'experimental', 'deprecated',
  'restricted', 'internal', 'public', 'community', 'archived'
]
```

## Contracts

### KnowledgeResearchProvenance

Canonical provenance metadata for research profiles.

```typescript
interface KnowledgeResearchProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ResearchGovernance;
}
```

### KnowledgeResearchDecision

Governance decision metadata for research.

```typescript
interface KnowledgeResearchDecision {
  readonly decisionId: string;
  readonly researchId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}
```

### KnowledgeResearchTrace

Deterministic trace metadata for research composition.

```typescript
interface KnowledgeResearchTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeResearchDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_research_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeResearchProfile

Represents one research record for a governed concept.

```typescript
interface KnowledgeResearchProfile {
  readonly researchId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly researchSourceType: ResearchSourceType;
  readonly evidenceLevel: EvidenceLevel;
  readonly citationType: CitationType;
  readonly publicationYear: number;
  readonly doiReference: string;
  readonly authors: readonly string[];
  readonly publisher: string;
  readonly visibility: ResearchVisibility;
  readonly status: ResearchStatus;
  readonly governance: ResearchGovernance;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeResearchProvenance;
}
```

### KnowledgeResearchRelationship

Links research records belonging to related evidence.

```typescript
interface KnowledgeResearchRelationship {
  readonly relationshipId: string;
  readonly sourceResearchId: string;
  readonly targetResearchId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeResearchProvenance;
}
```

### KnowledgeResearchRegistryMetadata

```typescript
interface KnowledgeResearchRegistryMetadata {
  readonly registryId: string;
  readonly researchCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly sourceTypeCount: number;
}
```

### KnowledgeResearchRegistry

Immutable registry of research profiles and relationships.

```typescript
interface KnowledgeResearchRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeResearchProfile[];
  readonly relationships: readonly KnowledgeResearchRelationship[];
  readonly metadata: KnowledgeResearchRegistryMetadata;
  readonly trace: KnowledgeResearchTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_research_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

### KnowledgeResearchInput

Canonical input structure for composition.

```typescript
interface KnowledgeResearchInput {
  readonly profiles: readonly KnowledgeResearchProfile[];
  readonly relationships: readonly KnowledgeResearchRelationship[];
}
```

### KnowledgeArtifactWithResearch

Associates canonical concepts with research metadata.

```typescript
interface KnowledgeArtifactWithResearch {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeResearchProfile[];
  readonly relationships: readonly KnowledgeResearchRelationship[];
  readonly provenance: KnowledgeResearchProvenance;
}
```

## Registry

The registry is an immutable, deterministically ordered collection of research profiles and relationships. It enforces:

- **Stable ordering** — profiles sorted by conceptId, then researchSourceType, then publicationYear, then researchId
- **Deterministic metadata** — counts computed from sorted profiles
- **Trace completeness** — every composition produces a trace with decisions
- **Relationship integrity** — relationships reference valid profiles

## Compose Functions

All compose functions are pure, deterministic, and produce readonly output.

| Function | Purpose |
|----------|---------|
| `composeKnowledgeResearchProvenance()` | Creates KnowledgeResearchProvenance |
| `composeKnowledgeResearchTrace()` | Creates KnowledgeResearchTrace |
| `composeKnowledgeResearchProfile()` | Creates KnowledgeResearchProfile |
| `composeKnowledgeResearchRelationship()` | Creates KnowledgeResearchRelationship |
| `composeKnowledgeResearchRegistry()` | Creates KnowledgeResearchRegistry |
| `composeKnowledgeResearchRegistryFromInput()` | Creates registry from input |
| `composeKnowledgeResearch()` | Creates complete registry with trace |
| `composeKnowledgeArtifactWithResearch()` | Creates artifact with research |

## Validation

Validation functions return structured results and never throw exceptions.

| Function | Purpose |
|----------|---------|
| `validateKnowledgeResearchProfile()` | Validates a single profile |
| `validateKnowledgeResearchRelationship()` | Validates a relationship |
| `validateKnowledgeResearchRegistry()` | Validates a complete registry |
| `validateKnowledgeResearchInput()` | Validates input before composition |
| `validateKnowledgeResearchTrace()` | Validates trace integrity |
| `validateKnowledgeArtifactWithResearch()` | Validates artifact association |

### Validation Codes (exactly 20, prefix RESEARCH_)

| Code | Description |
|------|-------------|
| `RESEARCH_DUPLICATE_ID` | Duplicate profile ID in registry |
| `RESEARCH_DUPLICATE_TITLE` | Duplicate profile title in registry |
| `RESEARCH_INVALID_SOURCE` | Unsupported research source type |
| `RESEARCH_INVALID_EVIDENCE` | Unsupported evidence level |
| `RESEARCH_INVALID_CITATION` | Unsupported citation type |
| `RESEARCH_INVALID_VISIBILITY` | Unsupported visibility level |
| `RESEARCH_INVALID_STATUS` | Unsupported research status |
| `RESEARCH_INVALID_GOVERNANCE` | Unsupported governance value |
| `RESEARCH_MISSING_PROVENANCE` | Profile missing provenance |
| `RESEARCH_MISSING_PROVIDER` | Provenance missing provider |
| `RESEARCH_MISSING_RATIONALE` | Provenance missing rationale |
| `RESEARCH_MISSING_CONCEPT_REFERENCE` | Profile missing concept reference |
| `RESEARCH_MISSING_PROFILE_ID` | Profile missing profile ID |
| `RESEARCH_MISSING_TITLE` | Profile missing title |
| `RESEARCH_SELF_RELATIONSHIP` | Relationship references itself |
| `RESEARCH_EMPTY_REGISTRY` | Registry has no profiles |
| `RESEARCH_INVALID_TRACE` | Trace has invalid properties |
| `RESEARCH_REGISTRY_INCONSISTENCY` | Metadata count mismatch |
| `RESEARCH_INVALID_CONFIGURATION` | Invalid relationship configuration |
| `RESEARCH_INVALID_ORDER` | Invalid profile ordering |

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

The Research Layer operates under strict governance:

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
- Paper search, DOI lookup
- CrossRef requests, PubMed requests
- Semantic Scholar requests, OpenAlex requests
- Google Scholar requests, citation parsing
- Bibliographic lookup, automatic bibliography generation
- Automatic citation formatting, research evaluation
- Paper ranking, evidence scoring
- LLM invocation

## Cross-Agent Boundaries

Production code must NOT reference:

- Didactic Agent, Curriculum Agent, Narrative Agent
- Assessment Agent, Curiosity Agent, Research Agent
- Laboratory Agent, Application Agent

No imports, no references, no mutations from these agents.

## Out of Scope

This phase does NOT implement:

- Research content generation
- Paper search
- DOI lookup
- Citation parsing
- Bibliographic lookup
- Automatic bibliography generation
- Research evaluation
- Paper ranking
- Evidence scoring
- LLM-based content creation

## Relationship with D10-OPT-01

This phase extends the canonical foundation established in D10-OPT-01:

- **D10-OPT-01** — Knowledge Contract & Concept Registry Kernel (canonical concepts)
- **D10-OPT-10** — Research Provenance (research metadata)

Each research profile references a concept ID from the canonical concept registry.

## Backward Compatibility

This phase preserves full backward compatibility with D10-OPT-01 through D10-OPT-09. All previous exports remain unchanged and functional.
