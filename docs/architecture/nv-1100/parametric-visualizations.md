# NV-1100-P9B — Parametric Visualizations

## Overview

The Parametric Visualizations System provides deterministic, interactive mathematical and scientific visualizations that allow learners to manipulate parameters and immediately observe the resulting changes.

## Core Principles

- **Deterministic**: Same inputs always produce the same outputs
- **Local-first**: All computation happens in the browser
- **No AI inference**: Visualizations illustrate concepts, they do not assess learners
- **No hidden state**: All parameters are visible and controllable
- **Accessible**: Full keyboard navigation and screen reader support

## Architecture

```
Concept Layer
        |
        v
Visualization Registry
        |
        v
Parameter Engine
        |
        v
Visualization Engine
        |
 ┌──────┼─────────┬─────────┐
 v      v         v         v
Artifacts Labs Workspace Semantic UI
```

## Files Created

### Core System (website/scripts/visualizations/)
- `visualization-definition.js` — 20 deterministic visualization definitions
- `visualization-registry.js` — Central registry with search and validation
- `parameter-schema.js` — Schema validation and parameter building
- `parameter-engine.js` — Deterministic parameter validation and clamping
- `visualization-engine.js` — Pure render model generation
- `visualization-renderer.js` — DOM/SVG rendering for all primitive types
- `visualization-controller.js` — Page-level controller with routing
- `visualization-state-storage.js` — localStorage persistence
- `visualization-export-import.js` — Export/import bridge
- `visualization-ui.js` — UI rendering for controls and layout
- `index.js` — Entry point initializer

### Styles
- `styles/parametric-visualizations.css` — Complete styling for the system

### Pages
- `pages/visualizations.html` — Page template

### Semantic Integration
- `scripts/semantic-learning/semantic-viz-bridge.js` — Bridge to semantic learning

### Validators
- `scripts/visualization-validator.js` — 250+ deterministic checks
- `scripts/nv-1100-p9b-verify.js` — Playwright browser verification

### Documentation
- `docs/architecture/nv-1100/parametric-visualizations.md` — This file
- `docs/architecture/nv-1100/parametric-visualizations-report.json` — Machine-readable report
- `docs/architecture/nv-1100/parametric-visualizations-report.md` — Human-readable report

## Required Visualizations (20)

| # | ID | Category | Renderer |
|---|---|---|---|
| 1 | linear-function | mathematics | line-plot |
| 2 | quadratic-function | mathematics | line-plot |
| 3 | sigmoid-function | mathematics | line-plot |
| 4 | relu-function | deep-learning | line-plot |
| 5 | softmax-distribution | deep-learning | bar-chart |
| 6 | gradient-descent-loss | optimization | line-plot |
| 7 | learning-rate-impact | optimization | multi-line |
| 8 | bayes-probability | probability | bar-chart |
| 9 | cosine-similarity | mathematics | scatter-plot |
| 10 | embedding-space-2d | embeddings | scatter-plot |
| 11 | attention-head-weights | transformers | heatmap |
| 12 | knn-neighborhood | machine-learning | scatter-plot |
| 13 | decision-boundary | machine-learning | scatter-plot |
| 14 | pca-projection | machine-learning | scatter-plot |
| 15 | precision-recall-tradeoff | evaluation | line-plot |
| 16 | roc-threshold | evaluation | line-plot |
| 17 | confusion-matrix | evaluation | confusion-matrix |
| 18 | normal-distribution | probability | line-plot |
| 19 | binomial-distribution | probability | bar-chart |
| 20 | logistic-curve | mathematics | line-plot |

## Parameter Types

- `number` — Floating point with min, max, step
- `integer` — Integer with min, max
- `boolean` — Toggle
- `enum` — Selection from options

## Rendering Primitives

- line-plot
- multi-line
- bar-chart
- scatter-plot
- heatmap
- confusion-matrix

## Integration Points

### Concept Integration
Every visualization references >=1 concept, >=1 artifact, >=1 shared knowledge domain.

### Laboratory Integration
Laboratories may embed visualizations. Changing parameters updates display immediately.

### Artifact Integration
Artifact pages may embed interactive visualizations with Reset/Copy parameters actions.

### Workspace Integration
- Recent Visualizations card
- Pinned Visualizations card
- Continue Exploration

### Search Integration
Ctrl+K indexes visualization title, summary, concepts, keywords, category. Badge: "Visualization".

### Semantic Learning Integration
Semantic recommendations include "Related Visualization" derived from concept relationships.

### Memory Integration
- Parameter presets
- Favorite visualizations
- Recent sessions

### Export/Import
Storage keys:
- `nv_visualization_preferences`
- `nv_visualization_presets`
- `nv_visualization_recent`

Supports replace and merge modes. Idempotent.

## Security

Forbidden in all visualization code:
- eval, Function(), new Function()
- fetch, XMLHttpRequest, WebSocket
- Math.random, Date-based computation
- prototype mutation, dynamic code generation

## Accessibility

Required:
- aria-label on interactive elements
- aria-live for dynamic content
- Semantic headings
- Keyboard navigation
- Focus visibility
- Screen reader compatibility

## Performance Targets

- Registry load: <100ms
- Parameter recomputation: <5ms
- Visualization render model: <10ms
- 1000 recomputations: <100ms
