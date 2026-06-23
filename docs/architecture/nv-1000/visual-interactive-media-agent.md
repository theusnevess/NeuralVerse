# NV-1000-A3: Visual & Interactive Media Agent

**Version:** 1.0
**Status:** READY pending final verification
**Date:** 2026-06-22

## Mission

The Visual & Interactive Media Agent is NeuralVerse's visualization intelligence layer. It transforms abstract concepts into educational visual recommendations, diagram strategies, interactive specifications, comparison layouts, animation plans, timelines, mathematical visualizations, scientific illustration guidance, atlas recommendations, and media-selection decisions.

The agent is not an artwork generator. Every output must serve a specific learning objective.

## Educational Modes

| Mode | Purpose |
|------|---------|
| `visual_intuition` | Maps concepts into accurate visual metaphors and states analogy limits |
| `diagram_recommendation` | Selects the best diagram type and explains why |
| `interactive_specification` | Produces read-only specifications for interactive visualizations |
| `comparison_visualization` | Creates aligned side-by-side comparison structures |
| `animation_specification` | Defines staged educational animation behavior |
| `timeline_construction` | Builds linear or branching chronological views |
| `mathematical_visualization` | Recommends geometric representations for mathematical concepts |
| `scientific_illustration` | Provides premium NeuralVerse visual style guidance |
| `atlas_recommendation` | Advises graph/atlas emphasis without modifying topology |
| `media_selection` | Chooses the best teaching medium and fallback mediums |

## Visualization Taxonomy

Supported diagram categories:

- flowchart
- layered architecture
- pipeline
- hierarchy
- timeline
- dependency tree
- comparison matrix
- coordinate system
- geometric representation
- process cycle
- state machine
- graph/network
- concept map

Additional specialized choices include attention matrices, terrain optimization views, sliding kernel grids, and process animations.

## Diagram Selection Policy

The agent uses deterministic keyword and context matching:

| Concept Signal | Recommended Representation | Reason |
|----------------|----------------------------|--------|
| RAG, retrieval, pipeline | Pipeline | Ordered transformations and directional data flow |
| Attention, matrix | Attention matrix | Weighted pairwise relationships |
| Embeddings, vectors, latent spaces | Coordinate system | Proximity, distance, and direction |
| Compare, vs, versus | Comparison matrix | Aligned dimensions reduce cognitive load |
| Graph, dependency, atlas | Graph/network | Relationship-heavy concepts need nodes and edges |
| Training, deployment, workflow | Timeline | Ordered phases and checkpoints |
| Fallback | Concept map | Useful for semantic grouping before interaction |

Every recommendation includes a `Chosen Visualization` section and a reason.

## Interaction Philosophy

Interactive recommendations are specifications only in A3. The agent does not fabricate executable widgets.

Specifications include:

- educational objective;
- controls and adjustable parameters;
- expected learner interactions;
- observable behaviors;
- reset behavior;
- accessibility considerations;
- mobile adaptations.

When an existing interactive scaffold appears relevant, the agent recommends reuse or extension instead of duplication.

## Accessibility Strategy

Every response includes accessibility guidance:

- keyboard compatibility with visible focus;
- screen-reader labels and state-change descriptions;
- contrast expectations for dark UI;
- reduced-motion alternatives;
- mobile touch target and stacking guidance.

## Atlas Integration

Atlas recommendations are advisory only. The agent may suggest clustering, semantic neighborhoods, dependency highlighting, and visual emphasis, but it must never modify graph topology or invent canonical relationships.

## Guardrails

The agent must never:

- alter curriculum content;
- rewrite artifacts;
- invent scientific facts;
- produce misleading analogies;
- create inaccessible visual recommendations;
- modify graph topology;
- introduce assessment logic;
- generate mastery claims.

## UI Integration

The Agent Panel exposes 10 visual media quick actions when `visual-interactive-media` is selected:

- Visualize Concept
- Generate Diagram
- Interactive Specification
- Compare Visually
- Build Timeline
- Explain Geometrically
- Suggest Animation
- Visualization Strategy
- Scientific Illustration
- Best Teaching Medium

Structured responses render with collapsible sections, visual cards, comparison tables, and timeline cards.

## QA Summary

Primary verification command:

```bash
node scripts/nv-1000-a3-verify.js
```

The verification covers all 10 modes, diagram strategy, cache reuse, orchestrator integration, panel rendering, visual action buttons, response cards, keyboard/accessibility checks, responsive validation at 390/768/1024/1440 px, NV-800 preservation, registry preservation, and runtime error counts.

## Changelog

### v1.0 (2026-06-22)

- Initial real implementation of the Visual & Interactive Media Agent
- 10 deterministic educational modes
- Diagram taxonomy and selection policy
- Interactive visualization specification behavior
- Visual media quick actions in Agent Panel
- Visual cards and timeline rendering support
- Playwright verification script
