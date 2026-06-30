# NV-1100-P4 — Concept Layer Architecture

## Purpose

The Concept Layer is NeuralVerse's canonical registry of individual learning concepts. It provides deterministic, immutable access to concept metadata, relationships, prerequisites, and cross-references to the Shared Knowledge Repository and Curriculum.

Unlike the Shared Knowledge Repository (which consolidates domain-level educational content), the Concept Layer tracks discrete, composable units of knowledge that form the building blocks of learning paths.

## Architecture

```
Concept Layer
├── index.json                 (registry index with governance metadata)
├── concepts/
│   ├── {concept-id}.json      (individual concept files)
│   └── ...
└── concept-layer-service.js   (runtime query service)
```

The Concept Layer is a local-first, offline-capable data system. All data is static JSON served via the web server. The service layer caches loaded data in memory with `Object.freeze()` to enforce immutability at runtime.

## Schema Definition

### Index Schema (`index.json`)

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Semver version of the concept registry |
| `schemaVersion` | string | Schema version (e.g. `"1.0"`) |
| `lastUpdated` | string | ISO date of last registry update |
| `governance` | object | Governance metadata (status, owner, lastReviewed, reviewPolicy) |
| `validCategories` | string[] | Allowed category values |
| `validDifficulty` | string[] | Allowed difficulty levels |
| `validRelationTypes` | string[] | Allowed relation type values |
| `validStatuses` | string[] | Allowed canonical statuses |
| `concepts` | array | Array of `{ id, file }` entries |

### Concept Schema (`concepts/{id}.json`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier (kebab-case) |
| `name` | string | yes | Human-readable name |
| `slug` | string | no | URL-friendly slug |
| `summary` | string | yes | Brief description |
| `definition` | string | no | Formal definition |
| `aliases` | string[] | no | Alternative names (must be unique across all concepts) |
| `keywords` | string[] | no | Search keywords (unique within concept) |
| `category` | string | no | One of `validCategories` |
| `difficulty` | string | no | One of `validDifficulty` |
| `canonicalStatus` | string | no | `"Draft"` or `"Reviewed"` |
| `version` | string | no | Semver format |
| `reviewedBy` | string | no | Reviewer identifier |
| `lastReviewed` | string | no | ISO date or datetime |
| `prerequisiteConcepts` | string[] | no | IDs of required prerequisite concepts |
| `relatedConcepts` | array | no | Typed relationships to other concepts |
| `sharedKnowledgeDomains` | string[] | no | References to Shared Knowledge domain IDs |
| `artifactReferences` | array | no | References to curriculum artifacts |
| `sourceReferences` | array | no | Academic/external source citations |

### Related Concept Entry

```json
{
  "concept": "gradient-descent",
  "type": "depends_on"
}
```

### Source Reference Entry

```json
{
  "id": "ref-linear-0",
  "title": "The Elements of Statistical Learning",
  "type": "book",
  "description": "Comprehensive ML textbook covering linear methods"
}
```

## Controlled Values

### Categories

`machine-learning`, `deep-learning`, `computer-vision`, `nlp`, `retrieval`, `rag`, `agents`, `optimization`, `mathematics`, `statistics`, `mlops`, `transformers`, `embeddings`

### Difficulty Levels

`beginner`, `intermediate`, `advanced`, `expert`

### Relation Types

`depends_on`, `extends`, `contrasts`, `implements`, `uses`, `supports`, `generalizes`, `specializes`, `related_to`

### Canonical Statuses

`Draft`, `Reviewed`

### Source Types

`paper`, `book`, `documentation`, `benchmark`, `course`, `article`, `standard`, `internal`

## Service API

The Concept Layer Service is exposed at `window.NeuralVerse.conceptLayerService` and via ES module export `createConceptLayerService`.

### Initialization

| Method | Returns | Description |
|--------|---------|-------------|
| `initialize()` | `Promise<Object>` | Loads and caches the index. Call once at startup. |

### Query Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getConcept(id)` | `Promise<Object\|null>` | Load a single concept by ID |
| `getAllConcepts()` | `Promise<Object[]>` | Load all concepts |
| `searchConcepts(query)` | `Promise<Array>` | Full-text search across title, aliases, keywords, summary, definition |
| `getConceptsByCategory(category)` | `Promise<Object[]>` | Filter concepts by category |
| `getConceptsForArtifact(artifactId)` | `Promise<Object[]>` | Find concepts linked to a curriculum artifact |

### Relationship Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getPrerequisites(id)` | `Promise<Array>` | Get prerequisite concepts with dependency type |
| `getDependents(id)` | `Promise<Array>` | Get concepts that depend on the given concept |
| `getRelatedConcepts(id)` | `Promise<Array>` | Get typed relationships to other concepts |
| `getSharedKnowledge(id)` | `Promise<string[]>` | Get linked Shared Knowledge domain IDs |

### Graph Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getConceptGraph()` | `Promise<{nodes, edges}>` | Build a full concept graph for visualization |

### Sync Methods (Cache-Only)

| Method | Returns | Description |
|--------|---------|-------------|
| `getSyncConcept(id)` | `Object\|null` | Get from cache without async load |
| `getSyncConceptBySlug(slug)` | `Object\|null` | Lookup by slug from cache |

## Search Integration

The service provides `searchConcepts(query)` which performs case-insensitive substring matching across:

1. **Title** — exact concept name
2. **Aliases** — alternative names
3. **Keywords** — tagged search terms
4. **Summary** — brief description
5. **Definition** — formal definition

Results are returned as `{ concept, title, matches[] }` where each match indicates the field and value that matched.

The Shared Knowledge Service also exposes `searchConcepts(query)` for domain-level concept search across its own repository.

## Graph Integration

`getConceptGraph()` builds a directed graph from two sources:

- **Prerequisite edges**: `source=prereqId → target=conceptId` with type from `prerequisiteConcepts`
- **Related edges**: `source=conceptId → target=relatedId` with type from `relatedConcepts`

Nodes include `id`, `label`, `category`, and `difficulty` for visualization styling. Edges include `source`, `target`, and `type` for relationship labeling.

The Knowledge Graph route (`#/knowledge-graph`) consumes this data to render an interactive concept dependency visualization.

## Agent Integration

Agents query the Concept Layer Service rather than maintaining isolated concept maps. This ensures:

- **Single source of truth** — all agents see the same concept data
- **Immutability** — cached data is `Object.freeze()`'d; mutations fail silently
- **Determinism** — no randomness, no hidden state changes
- **Offline capability** — all data is local JSON, no external API calls

Agents can use:
- `getConcept(id)` for targeted lookups
- `getAllConcepts()` for full registry scans
- `searchConcepts(query)` for fuzzy matching
- `getConceptGraph()` for dependency-aware planning

## Validator Behavior

The Concept Layer Validator (`scripts/concept-layer-validator.js`) performs:

### Structural Validation
- Unique IDs across all concept files
- Unique names across all concepts
- Unique aliases across all concepts (cross-concept uniqueness)
- Unique keywords within each concept
- Valid categories from `index.governance.validCategories`
- Valid difficulty levels from `validDifficulty`
- Semver format for `version`
- ISO date format for `lastReviewed`
- Non-empty `reviewedBy` (rejects placeholders: TBD, unknown, TODO)

### Relationship Validation
- Related concept IDs exist in the registry
- Prerequisite concept IDs exist in the registry
- No self-dependencies in prerequisites
- No cycles in prerequisite graph (DFS cycle detection)
- No duplicate relations (concept+type pairs)

### Cross-Repository Validation
- `sharedKnowledgeDomains` references exist in the Shared Knowledge index
- `artifactReferences` exist in `curriculum-index.json` (when present)

### Report Generation
- JSON report at `docs/architecture/nv-1100/concept-layer-report.json`
- Markdown report at `docs/architecture/nv-1100/concept-layer-report.md`
- Exit 0 on success (0 errors), exit 1 on failure

## Performance Characteristics

- **Index load**: Single JSON fetch, cached after first load
- **Concept load**: Lazy-loaded per concept, cached in `Map` after first fetch
- **Search**: O(n) scan of all loaded concepts; suitable for registry sizes < 1000
- **Graph build**: O(n + e) where n = concepts, e = edges; builds from cached data
- **Memory**: All loaded data is frozen and held in memory; ~41 concepts uses negligible memory
- **Offline**: Fully operational without network after initial page load

## Current Registry Stats

| Metric | Value |
|--------|-------|
| Total concepts | 41 |
| Categories | 13 |
| Difficulty levels | 4 |
| Relation types | 9 |
| Shared knowledge domains | 10 |
| Curriculum artifacts | 600 |
