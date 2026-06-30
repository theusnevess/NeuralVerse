# NV-1100-P3 — Shared Knowledge Infrastructure

## Overview

The Shared Knowledge Infrastructure introduces a **single canonical knowledge repository** that replaces multiple isolated `CURATED_*_MAP` structures across didactic agents. This reduces duplication, improves maintainability, increases consistency, and prepares the platform for future hybrid deterministic/generative capabilities.

## Architecture

```
                    Shared Knowledge Repository
                               │
        ┌──────────────┬────────┼──────────────┬──────────────┐
        │              │        │              │              │
        ▼              ▼        ▼              ▼              ▼
      A1 Lens        A5 Lens  A6 Lens       A7 Lens       A9/A10 Lens
Didactic View     Research   Industry     Assessment    Story/Curiosity
```

The repository stores canonical facts. Agents are responsible only for selecting, filtering, formatting, and presenting those facts according to their educational role.

## Repository Structure

```text
website/data/shared-knowledge/
├── index.json                    # Repository index with domain metadata
└── domains/
    ├── machine-learning.json     # ML foundations
    ├── deep-learning.json        # Deep learning fundamentals
    ├── cv.json                   # Computer vision
    ├── llms.json                 # Large language models
    ├── rag.json                  # Retrieval-augmented generation
    ├── agents.json               # AI agents & agentic systems
    ├── mlops.json                # MLOps & ML systems engineering
    ├── transformers.json         # Transformers & attention mechanisms
    ├── embeddings.json           # Embeddings & vector representations
    └── optimization.json         # Optimization & training
```

## Canonical Knowledge Entry Schema

Each domain file follows this schema:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique domain identifier |
| `title` | string | Yes | Human-readable domain title |
| `summary` | string | Yes | Concise domain summary |
| `concepts` | string[] | Yes | Core concepts in the domain |
| `keywords` | string[] | Yes | Searchable keywords |
| `historicalContext` | string | Yes | Historical narrative |
| `landmarkReferences` | object[] | No | Key papers and references |
| `industryApplications` | string[] | No | Real-world use cases |
| `commonMisconceptions` | object[] | No | Common misunderstandings |
| `analogies` | object[] | No | Educational analogies |
| `curiosityFacts` | string[] | No | Engaging facts |
| `storySeeds` | string[] | No | Narrative prompts |
| `assessmentSeeds` | string[] | No | Assessment questions |
| `professionalInsights` | string[] | No | Production insights |
| `recommendedVisualizations` | string[] | No | Suggested visualizations |
| `recommendedLabs` | string[] | No | Suggested hands-on labs |
| `relatedArtifacts` | string[] | No | Related curriculum artifacts |
| `relatedConcepts` | string[] | No | Related concept domains |
| `lastReviewed` | string | No | Last review date (YYYY-MM-DD) |
| `canonicalStatus` | string | No | "Draft" or "Reviewed" |

## Shared Knowledge Service

The service module (`scripts/shared-knowledge/shared-knowledge-service.js`) provides:

### Core API

```javascript
const service = createSharedKnowledgeService();
await service.initialize();

// Query by domain ID
const domain = await service.getDomain('transformers');

// Query by topic/query string
const domain = await service.getDomainByTopic('attention mechanism', '');

// Search concepts across all domains
const results = await service.searchConcepts('gradient');

// Get domain data formatted for specific agents
const researchData = await service.getResearchDataForDomain('transformers');
const transferData = await service.getTransferDataForDomain('transformers');
const assessmentData = await service.getAssessmentDataForDomain('transformers');
const knowledgeData = await service.getKnowledgeDataForDomain('transformers');
const narrativeData = await service.getNarrativeDataForDomain('transformers');
const curiosityData = await service.getCuriosityDataForDomain('transformers');

// Synchronous access (after initialization)
const domain = service.getSyncDomain('transformers');
const domain = service.getSyncDomainByTopic('deep learning', '');
```

### Domain Resolution

The `resolveDomainForQuery(topic, query)` function maps natural language queries to domain IDs using keyword matching:

- `mlops`, `monitoring`, `drift` → `mlops`
- `llm`, `gpt`, `prompt` → `llms`
- `rag`, `retrieval`, `vector` → `rag`
- `agent`, `react`, `planning` → `agents`
- `vision`, `cnn`, `image` → `computer-vision`
- `deep learning`, `pytorch`, `gpu` → `deep-learning`
- `machine learning`, `feature`, `classification` → `machine-learning`
- `transformer`, `attention` → `transformers`
- `embedding`, `vector`, `semantic` → `embeddings`
- `gradient`, `learning rate`, `optimizer` → `optimization`

## Agent Integration

### Agents Using Shared Repository

| Agent | Domain Access | Data Fields Used |
|-------|--------------|-----------------|
| **A1** (Didactic) | All domains | `analogies`, `commonMisconceptions` (additive) |
| **A5** (Research) | All domains | `landmarkReferences`, `historicalContext`, `concepts`, `keywords` |
| **A6** (Application) | Core 7 domains | `industryApplications`, `professionalInsights` |
| **A7** (Assessment) | Core 7 domains | `assessmentSeeds`, `concepts`, `commonMisconceptions` |
| **A8** (Governance) | Core 7 domains | `relatedConcepts`, `concepts`, `keywords` |
| **A9** (Storytelling) | All domains | `historicalContext`, `landmarkReferences`, `analogies` |
| **A10** (Curiosity) | All domains | `curiosityFacts`, `analogies`, `commonMisconceptions` |

### Migration Strategy

1. Each agent imports `createSharedKnowledgeService`
2. Agent creates a shared knowledge instance with graceful fallback
3. `initialize()` is called to load the index and cache domains
4. `getDomainData()` queries `getSyncDomain()` for cached domain data
5. Data is transformed to the agent's expected format
6. If shared data is unavailable, falls back to `FALLBACK_*_DATA`
7. External APIs remain unchanged

### Backward Compatibility

- All agent APIs (`canHandle`, `run`, `detectIntent`, `getAvailableModes`) remain identical
- Response structure is unchanged
- Deterministic behavior is preserved
- Fallback data ensures graceful degradation

## Deduplication Summary

The following data was previously duplicated across agents and is now consolidated:

| Data Type | Previously In | Now In |
|-----------|--------------|--------|
| Research landmarks | A5 `CURATED_RESEARCH_MAP` | Domain files `landmarkReferences` |
| Industry applications | A6 `CURATED_TRANSFER_MAP` | Domain files `industryApplications` |
| Assessment questions | A7 `CURATED_ASSESSMENT_MAP` | Domain files `assessmentSeeds` |
| Knowledge templates | A8 `CURATED_KNOWLEDGE_MAP` | Domain files (derived) |
| Narratives | A9 `CURATED_NARRATIVE_MAP` | Domain files `historicalContext` |
| Curiosities | A10 `CURATED_CURIOSITY_MAP` | Domain files `curiosityFacts` |
| Misconceptions | A7 + A1 `MISCONCEPTIONS` | Domain files `commonMisconceptions` |
| Analogies | A1 `ANALOGY_TEMPLATES` | Domain files `analogies` |

## Validation

Run the shared knowledge validator:

```bash
node scripts/shared-knowledge-validator.js
```

Verifies:
- Unique IDs across all domains
- Required fields present
- No duplicate concepts within domains
- Proper array formatting
- Valid lifecycle values (`Draft`/`Reviewed`)
- No broken related references

## Search Integration

The shared knowledge repository integrates with Global Search by:

1. Domain titles and summaries are searchable
2. Concepts and keywords are indexed
3. Search results include domain matches alongside curriculum results
4. No degradation to existing search performance

## Knowledge Graph Integration

The knowledge graph gains semantic richness from:

1. `relatedConcepts` fields in domain files
2. Cross-domain relationships
3. Concept-to-curriculum mappings
4. Additional edge types for knowledge relationships

## Performance

- Repository loads lazily (on first agent initialization)
- Domain data is cached after first load (`Object.freeze` for immutability)
- Synchronous access available after initialization
- Total repository size: ~50KB (10 domain files + index)

## Future Extensibility

The repository supports:

- Adding new domains by creating JSON files and updating `index.json`
- Extending the schema with new optional fields
- Version-controlled knowledge evolution
- Future hybrid deterministic/generative capabilities
- Cross-agent knowledge sharing
- Knowledge governance workflows
