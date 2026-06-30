# Retrieval System

## Overview

The retrieval system is a simulated research playground that operates entirely client-side with seeded data. It is accessed via `#/retrieval-playground` and provides tools for exploring references, relationships, evidence, and research connections. The system does not connect to any external database, API, or live search service.

## Architecture

The retrieval system has two layers:

1. **`retrieval-playground-adapter.js`** — Pure data and logic layer
2. **`retrieval-playground.js`** — DOM controller and UI rendering

## Reference Database

The adapter contains a seeded database of 10 references including:

- Papers: Transformer, BERT, CLIP, YOLO, ViT, GPT-3, LLaMA
- Repositories: PyTorch
- Notes: RAG evaluation, Agent reasoning

Each reference has: `id`, `title`, `type`, `status`, `source`, `keywords`.

12 seeded relationships connect references: `cites`, `related`, `extends`, `implements`, `uses`.

## Search Mode

Keyword-based search against reference keywords. Results are scored by number of matching terms and sorted descending. Each result provides "Compile" and "Compare" buttons.

## Graph Mode

An SVG force-directed graph visualization of the reference network:

- **Layout**: Deterministic, cluster-aware force-directed algorithm
  - Community detection via `inferReferenceCluster()` (Detections, Vision, Transformers, Language, Evaluation, Agents, Frameworks, Notes, Research)
  - Cluster anchors distributed radially around canvas center
  - Centroid-based mode when a node is selected
  - 90-150 iterations of repulsion/attraction/gravity/collision with temperature cooling
- **Nodes**: Shapes vary by type (circle=papers, rect=repositories, hexagon=notes)
- **Edges**: Quadratic bezier curves for bidirectional pairs
- **Controls**: Zoom, pan, depth control (full / 1-hop / 2-hop), relationship type filter
- **Interaction**: Click to select, hover for context labels

## Discovery Mode

Recommendation panels showing:
- Related references (from direct relationships)
- Exploration continuations (contextual suggestions for further reading)
- Discovery suggestions based on current reference and session context

## Compare Mode

Multi-reference comparison workspace (2-4 items):

- **Shared concepts**: Keywords common across all references
- **Semantic diff**: Unique concepts, relationships, and connections per reference
- **Contribution mapping**: Labels (Primary/Supporting/Context/Minor) based on evidence presence
- **Confidence assessment**: High/Moderate/Limited Support based on shared concepts and evidence overlap
- **Synthesis text**: Plain-text summary for export to notes

## Presentation Mode

Present as a tab in the retrieval playground UI but **not yet implemented**. The container exists but has no JavaScript logic.

## Evidence Compilation

The adapter provides evidence compilation:

- From query: searches, collects matched references, traces relationships, calculates confidence
- From reference: similar compilation seeded from a single reference
- Confidence levels: low, medium, high

## Knowledge Trail

A chronological event log recording all user actions during a research session:

- Event types: search, open, pin, compile, compare, explore, etc.
- Capped at 20 entries
- Displayed in the memory layer (left sidebar)
- Clicking a trail event restores that context
- Persisted across sessions via `localStorage`

## Inspector Panel

The right sidebar provides detailed inspection:

- **Reference tab**: Title, type, source, keywords, connections
- **Evidence tab**: Compiled evidence with references, relationships, confidence gauge
- **Relationship tab**: Selected relationship details with navigation actions
- **Local Constellation Minimap**: SVG mini-graph of immediate neighbors

## Memory Layer

The left sidebar provides:

- **Pinned References** (up to 8)
- **Recent References** (up to 8)
- **Saved Queries** (persisted)
- **Knowledge Trail** (event log)

## Limitations

- Reference database is seeded and not comprehensive
- Presentation mode is a placeholder
- No integration with external APIs or live paper databases
- Evidence compilation is simulated, not grounded in actual citations
- Graph layout is deterministic but not optimized for large networks (10 nodes only)

## Related Chapters

- [Atlas System](10-atlas-system.md)
- [Workspace Architecture](07-workspace-architecture.md)
- [Known Limitations](30-known-limitations.md)
