# Atlas System

## Overview

The Atlas (knowledge graph) provides visual exploration of the curriculum structure through a force-directed graph. It is accessed via `#/knowledge-graph` and renders the curriculum hierarchy as an interactive network visualization.

## Architecture

The knowledge graph subsystem (`website/scripts/knowledge-graph/`) is divided into four modules:

| Module | Purpose |
|--------|---------|
| `controller.js` | Orchestrates layout, renderer, and model; handles user interaction |
| `layout.js` | Force-directed graph layout algorithm |
| `model.js` | Data layer — loads curriculum entities as graph nodes |
| `renderer.js` | Canvas/WebGL rendering of nodes, edges, labels |

## Staged Navigation

The atlas supports progressive focus levels:

1. **Overview** — All curriculum entities displayed as a network
2. **Path focus** — Zoom to a single Learning Path and its modules
3. **Module focus** — Zoom to a module and its lessons
4. **Lesson focus** — Zoom to a lesson and its artifacts
5. **Artifact focus** — Zoom to a single artifact and its dependencies

The graph updates dynamically as the user selects entities from the inspector or navigates the hash route.

## Inspector

A right-side inspector panel (`NvInspectorPanel`, React component or vanilla equivalent) shows details of the selected entity:

- Title, type, and lifecycle status
- Description
- Connected entities (parent/child/sibling)
- Links to open in curriculum view
- Dependency metadata

## Graph Philosophy

The atlas graph is **informational and not mutable**. Key principles:

- The graph visualizes the curriculum hierarchy as defined in the canonical index
- Nodes cannot be added, removed, or repositioned persistently (layout is ephemeral per session)
- The topology reflects the immutable curriculum structure
- Visual layout is computed client-side using force-directed algorithms
- Filtering and focus are viewing operations only

## Graph Features

- **Force-directed layout** with configurable iterations
- **Canvas rendering** for performance
- **Node selection** and highlighting
- **Edge rendering** showing parent-child and dependency relationships
- **Zoom and pan** controls
- **Filter by entity type** (path / module / lesson / artifact)
- **Search integration** — "View in Graph" links from search results
- **Route synchronization** — Navigating the graph updates the hash route

## Integration Points

- Reads curriculum data from `window.NeuralVerse.curriculumIndex`
- Shares entity IDs with the curriculum controller
- Search results can open specific graph views
- Cross-linked from artifact pages for dependency visualization

## Related Chapters

- [Curriculum Architecture](05-curriculum-architecture.md)
- [Retrieval System](09-retrieval-system.md)
- [Navigation and Routing](04-navigation-and-routing.md)
