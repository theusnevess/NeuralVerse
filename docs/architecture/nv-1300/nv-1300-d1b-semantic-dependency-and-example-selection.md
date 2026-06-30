# NV-1300-D1B — Semantic Dependency & Example Selection

**Version:** 1.0
**Status:** READY
**Date:** 2026-06-26

## Purpose

Extend the Didactic Architecture Agent from a planner into a semantic instructional orchestrator capable of prerequisite resolution, example selection, recap insertion, cross-domain connection discovery, and resource selection.

## Architecture

```
User Query
      │
      ▼
Pedagogical Planner (D1A)
      │
      ▼
Semantic Dependency Resolver
      │
      ├────────► Concept Layer
      ├────────► Semantic Engine
      ├────────► Shared Knowledge
      ├────────► Curriculum Artifacts
      │
      ▼
Example Selection Engine
      │
      ▼
Cross-Domain Connector
      │
      ▼
Recap Inserter
      │
      ▼
Resource Selector
      │
      ▼
Enhanced Instruction Plan
      │
      ▼
Didactic Composition Pipeline
```

## Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `website/scripts/agents/semantic-dependency-resolver.js` | Prerequisite resolution, hidden deps, chains | ~280 |
| `website/scripts/agents/example-selection-engine.js` | Score and rank candidate examples | ~280 |
| `website/scripts/agents/example-registry.js` | Canonical example data store | ~280 |
| `website/scripts/agents/cross-domain-connector.js` | Cross-domain relationship discovery | ~280 |
| `website/scripts/agents/recap-inserter.js` | Deterministic recap block insertion | ~200 |
| `website/scripts/agents/resource-selector.js` | Canonical resource bundle generation | ~200 |
| `scripts/nv-1300-d1b-validator.js` | Structural validation | ~250 |
| `scripts/nv-1300-d1b-verify.js` | Runtime verification | ~200 |
| `docs/architecture/nv-1300/nv-1300-d1b-semantic-dependency-and-example-selection.md` | This document | — |

## Files Modified

| File | Changes |
|------|---------|
| `website/scripts/agents/pedagogical-planner.js` | Added D1B dependencies, extended buildPlan with dependencyChain, missingPrerequisites, insertedRecaps, selectedExamples, selectedResources, crossDomainConnections, semanticWarnings |
| `website/scripts/agents/didactic-architecture-agent.js` | Added D1B imports, initialization, planner dependency injection, new API exposure |

## Semantic Dependency Resolver

### Methods

| Method | Purpose |
|--------|---------|
| `resolvePrerequisites(conceptId)` | Direct prerequisites only |
| `resolveTransitivePrerequisites(conceptId, maxDepth)` | Full transitive closure up to depth |
| `detectMissingDependencies(plan)` | Prerequisites not in plan |
| `buildDependencyChain(conceptId)` | Topological order of all dependencies |
| `validateDependencyOrder(sequence)` | Check if sequence respects prerequisites |
| `explainDependency(conceptA, conceptB)` | Explain relationship between two concepts |

### Rules

- Preserve topological order
- Eliminate duplicates
- Reject cycles
- Reject self-dependencies
- Produce identical output for identical inputs

## Example Selection Engine

### Scoring Dimensions

| Dimension | Weight | Description |
|-----------|--------|-------------|
| curriculumRelevance | 0.20 | Overlap with input concept IDs |
| conceptProximity | 0.25 | Related/prerequisite concept match |
| visualizationAvailability | 0.15 | Has associated visualizations |
| laboratoryAvailability | 0.10 | Has associated laboratories |
| implementationClarity | 0.10 | Quality of summary and tags |
| engineeringRealism | 0.05 | Production relevance |
| mathematicalSuitability | 0.05 | Mathematical content match |
| sharedKnowledgeLinkage | 0.05 | Shared knowledge domain count |
| semanticNeighborhood | 0.05 | Related concept overlap |

### Selection Rules

- Maximum 5 examples per selection
- Reject examples requiring unavailable prerequisites
- Reject duplicate concept coverage
- Difficulty compatibility bonus

## Cross-Domain Connections

### Canonical Connections

| Source | Target | Type |
|--------|--------|------|
| linear-models | word-embeddings | mathematical-foundation |
| gradient-descent | optimizers | generalization |
| self-attention | transformer-architecture | core-component |
| word-embeddings | semantic-search | enables |
| dense-retrieval | rag-pipeline | component |
| convolution | neural-networks | specialization |
| regularization | dropout | implements |
| loss-functions | gradient-descent | enables |
| activation-functions | neural-networks | core-component |
| vector-similarity | semantic-search | enables |

### Rules

- Maximum 8 connections returned
- Only canonical relationships
- Each connection includes sourceConcept, targetConcept, relationshipType, explanation, evidence
- Never invent relationships

## Recap Policy

| Preset | Max Recaps |
|--------|-----------|
| essentials | 1 |
| standard | 2 |
| deep_dive | 3 |
| research_notes | 3 |

### Recap Templates

- **Motivation:** Why this prerequisite matters
- **Context:** Position within learning path
- **Intuition:** Refresh mental model

## Resource Bundle

```javascript
{
  artifacts: [{ id, type, valid }],
  concepts: [{ id, name, category, type, valid }],
  visualizations: [{ id, title, category, type, valid, matchedConcept }],
  laboratories: [{ id, title, category, type, valid, matchedConcept }],
  sharedKnowledge: [{ id, type, valid, matchedConcept }],
  warnings: string[]
}
```

All IDs validated. Duplicate detection enforced.

## Plan Output Extension

```javascript
{
  // D1A fields preserved
  id, topic, intent, mode, difficulty, selectedPerspective,
  layers, sections, evidence, warnings, omissions, graph, generatedAt,

  // D1B new fields
  conceptIds: string[],
  artifactIds: string[],
  dependencyChain: [{ id, name, category, depth, type }],
  missingPrerequisites: [{ conceptId, name, requiredBy, depth, severity }],
  insertedRecaps: [{ id, type, label, purpose, content, prereqId, childId, depth, style }],
  recapsCount: number,
  selectedExamples: [{ example, score, breakdown }],
  selectedResources: { artifacts, concepts, visualizations, laboratories, sharedKnowledge, warnings },
  crossDomainConnections: [{ sourceConcept, targetConcept, relationshipType, explanation, evidence, domains }],
  semanticWarnings: string[]
}
```

## Governance

Forbidden:

- Learner profiling
- Mastery estimation
- Competence scoring
- Proficiency inference
- Adaptive sequencing
- Hidden recommendations based on user state

No mutations to: curriculum, concept layer, shared knowledge, semantic graph, laboratories, visualizations.

## Performance Targets

| Operation | Target |
|-----------|--------|
| Dependency resolution | < 5ms |
| Example ranking | < 10ms |
| Cross-domain lookup | < 5ms |
| Resource bundle generation | < 10ms |
| Total planner overhead | < 30ms |

## Determinism

Forbidden: Math.random, Date.now, performance.now (for ordering), UUID generation, hash seeds, non-deterministic sorting.

## Validation

```bash
node scripts/nv-1300-d1b-validator.js
node scripts/nv-1300-d1b-verify.js
```

## Regression

```bash
node scripts/nv-1300-d1a-verify.js
node scripts/nv-1300-d1b-validator.js
node scripts/nv-1300-d1b-verify.js
```

## Next Phases

| Phase | Scope |
|-------|-------|
| **D1C** | Memory/Review bridge, full evidence tracer |
| **D1D** | Generative augmentation, agent collaboration |
| **D1E** | Full accessibility, cognitive load optimizer, transition generator |
