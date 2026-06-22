# NV-900-UI10 Knowledge Graph & Semantic Exploration

## Purpose

The Knowledge Graph & Semantic Exploration experience visualizes the existing NeuralVerse curriculum as deterministic graph structures. It helps users inspect how learning paths, modules, lessons, and artifacts relate without creating new curriculum meaning.

## Source Of Truth

The frontend graph reads `website/data/curriculum-index.json` through the existing curriculum service. It does not parse NV-800 Markdown files, regenerate the corpus, or modify curriculum content.

## Graph Model

The model is normalized into `nodes`, `edges`, `nodeById`, and `edgesByNodeId` in `website/scripts/knowledge-graph/knowledge-graph-model.js`.

Nodes include `id`, `type`, `title`, `status`, `route`, `lineage`, and `metadata`.

Edges include `id`, `type`, `source`, `target`, `label`, and `description`.

## Node Types

Rendered node types are Learning Path, Module, Lesson, and Artifact.

Secondary indicators are visual-only metadata: lifecycle status, interactive visualization availability, bookmarked, notes, recently visited, and collection membership when local personalization services expose them.

## Edge Types

Rendered deterministic edge types are `contains`, `sibling`, and explicit artifact dependency types if present in frontend data: `prerequisite`, `recommended_before`, `recommended_after`, `complementary`, and `alternative`.

No semantic similarity, AI-generated link, vector search, learner-state inference, scoring, or mastery relationship is generated.

## Layout Strategy

Layout is deterministic and SVG-based. Overview uses layered columns by entity type. Focused lesson and artifact neighborhood views use the same stable layered layout over bounded neighborhoods selected from the graph model.

Sorting is stable by lineage and title. There is no force simulation, random positioning, drag physics, WebGL dependency, or continuous animation loop.

## Interaction Model

The graph supports mode selection, search/focus input, node type filters, lifecycle filters, relationship filters, node selection, edge selection, hover/focus preview, keyboard traversal, reset, fit, zoom, pan, open selected resource, and focus selected node.

Global search results include a read-only `View in Graph` action that routes to `#/knowledge-graph` with deterministic mode and focus parameters.

## Accessibility Model

SVG graph nodes and edges are focusable buttons with ARIA labels. Selection changes are announced through a polite live region. Keyboard users can traverse nodes with arrow keys and select with Enter or Space.

A textual fallback lists current graph nodes and current graph relationships with resource links. Focus indicators are visible, and reduced-motion preferences avoid introducing motion behavior.

## Performance Strategy

Overview mode renders learning paths, modules, and lessons only. Artifacts are included only in focused lesson and artifact neighborhood views. The graph model is cached after first load, and layouts are recomputed deterministically only when mode, focus, or filters change.

The renderer uses a single SVG per graph instance and no continuous animation loop.

## Preservation Guarantees

This phase does not modify `docs/content/`, NV-800 architecture files, artifact Markdown, registry entries, lesson compositions, module compositions, learning path compositions, curriculum IDs, `canonical_status`, or Evidence Boundary semantics.

It does not add assessment, progress, scoring, grades, mastery, competency evidence, backend APIs, databases, authentication, or cloud sync.

## QA Summary

Verification is implemented in `scripts/nv-900-ui10-verify.js`. It validates route load, overview rendering, focused lesson rendering, artifact neighborhood rendering, node and edge selection, inspector updates, filters, search/focus, open selected navigation, keyboard navigation, fallback list presence, responsive mobile overflow, footer collision, console errors, page errors, failed requests, and required screenshots under `/tmp/neuralverse-knowledge-graph`.
