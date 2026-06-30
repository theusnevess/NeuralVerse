# Curriculum Architecture

## Overview

The curriculum subsystem is the core content layer of NeuralVerse. It provides hierarchical learning content organized into Learning Paths, Modules, Lessons, and Artifacts. All content is defined in a single canonical JSON index and served as static files.

## Data Model

```
Learning Path
  ├── id, title, summary, canonicalStatus (Draft|Reviewed)
  ├── moduleIds[] ─────────────────────────────────────────┐
  │                                                         │
Module                                                      │
  ├── id, title, summary, canonicalStatus                   │
  ├── lessonIds[] ──────────────────────────────────────────┤
  │                                                         │
Lesson                                                      │
  ├── id, title, summary, canonicalStatus                   │
  ├── artifactIds[] ────────────────────────────────────────┤
  │                                                         │
Artifact                                                    │
  ├── id, title, type (reading, exercise, visualization, etc.)
  ├── source (path to Markdown file)
  ├── canonicalStatus (Draft|Reviewed)
  ├── duration (estimated reading time)
  ├── instructionalObjectives[]
  └── dependencies (prerequisites, complementary, etc.)
```

## Curriculum Index

The file `website/data/curriculum-index.json` is the canonical data source. It is a single JSON object containing:

```json
{
  "meta": { "generated": "2026-06-21T23:03:19.454Z", "source": "docs/content" },
  "counts": { "paths": 19, "modules": 40, "lessons": 120, "artifacts": 600 },
  "paths": [ ... ],
  "modules": [ ... ],
  "lessons": [ ... ],
  "artifacts": [ ... ]
}
```

Current canonical counts:

| Entity | Total | Reviewed | Draft |
|--------|-------|----------|-------|
| Learning Paths | 19 | 2 | 17 |
| Modules | 40 | — | — |
| Lessons | 120 | — | — |
| Artifacts | 600 | — | — |

## Data Access Layer

`curriculum-service.js` provides:
- `getIndex()` — Fetches and caches the curriculum index
- `getPath(id)`, `getModule(id)`, `getLesson(id)`, `getArtifact(id)` — Individual entity lookups
- `getModulesForPath(pathId)`, `getLessonsForModule(moduleId)`, `getArtifactsForLesson(lessonId)` — Hierarchy traversal
- `loadArtifactMarkdown(artifactId)` — Fetches and parses artifact Markdown content
- `findRouteForArtifact(artifactId)` — Resolves the canonical hash route for any artifact

## Lifecycle Metadata

Every entity has a `canonicalStatus` field with two possible values:

- **Reviewed** — Content has passed editorial review. Rendered with a green badge (`data-variant="success"`) and a green top border on cards.
- **Draft** — Content is in progress. Rendered with a neutral badge (`data-variant="neutral"`).

The lifecycle status is governance metadata only. It indicates editorial completeness, not learner achievement, competency, or content quality.

## Content Types

Artifacts have a `type` field that determines rendering:

| Type | Rendering |
|---|---|
| `reading` | Markdown rendered as HTML with reading experience enhancements |
| `exercise` | Markdown with exercise section wrappers (Learner Task, Expected Output, Guidance) |
| `interactive-visualization` | If registered in `visualization-registry.js`, the visualization is instantiated; otherwise a "Specification only" notice is shown |
| `comparison-table` | Markdown table with comparison formatting |
| `code` | Markdown with code block enhancements |
| `video`, `image`, `audio` | Media embedding |

## Visualizations Registry

Interactive visualizations in `website/scripts/visualizations/` are registered by ID and instantiated when an artifact of type `interactive-visualization` has a matching registry entry. Implemented visualizations include: Bayes theorem, convolution intuition, distance metrics, forward propagation, nearest neighbor, object detection, overfitting, RAG pipeline, segmentation, self-attention.

Unregistered visualization artifacts display a specification notice with no executable widget.

## Filtering

Filterable collections allow learners to filter by lifecycle status:

- **All** — Shows all entities regardless of status
- **Reviewed** — Shows only Reviewed entities
- **Draft** — Shows only Draft entities

Filter state uses `aria-pressed` on button elements. Entities are sorted so Reviewed items appear before Draft items.

## Integration Points

The curriculum subsystem integrates with:
- **Search** (`curriculum-search.js`) — Builds a flat search index from all entities
- **Knowledge Graph** — Uses curriculum data for graph nodes
- **Agent System** — Context builder reads curriculum state; dependency agent traverses the curriculum index
- **Personalization** — Notes, bookmarks, and progress are keyed to curriculum entity IDs
- **Breadcrumbs** — Curriculum hierarchy drives breadcrumb rendering

## Related Chapters

- [Learning Experience](06-learning-experience.md)
- [Search System](08-search-system.md)
- [Atlas System](10-atlas-system.md)
- [Governance Model](27-governance-model.md)
