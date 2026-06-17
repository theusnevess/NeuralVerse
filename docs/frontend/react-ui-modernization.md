# React UI Modernization

## NV-500-UX-007E.4

This phase modernizes stable, visible NeuralVerse UI surfaces through React Islands while preserving the existing JavaScript application shell.

## Surfaces Modernized

### Discovery Panels

Discovery Panels are now rendered by the `NvDiscoveryCard` island when the local React bundle is available.

The legacy HTML remains as a fallback inside each island root. If the React bundle is missing, the previous vanilla-JS Discovery Panel behavior remains available.

React owns:

- Discovery card markup
- Button rendering
- Scientific icon rendering
- Local inline preview disclosure
- Presentation consistency

JavaScript still owns:

- Recommendation payload construction
- Open reference behavior
- Pin/unpin behavior
- Context menu behavior
- Hover preview behavior
- Persistence
- Inspector synchronization
- Graph synchronization

## Component Foundation Improvements

The shared React component layer now includes:

- `NvActionGroup`
- `NvStatusPill`
- `NvInspectorSection`
- `NvMemoryCard`
- `NvContributionBar`
- `NvDiscoveryCard`

Existing primitives were reused:

- `NvButton`
- `NvBadge`
- `NvChip`
- `NvScientificIcon`
- `NvMetric`
- `NvMicroViz`
- `NvEmptyState`

## Bridge Pattern

All mounted UI uses the existing `react-build/src/bridge.js` API:

```javascript
mount(container, Component, props)
update(container, Component, props)
unmount(container)
```

No second React architecture was introduced.

## Styling Policy

React components use existing CSS classes and design tokens. No CSS-in-JS, utility framework, external component library, or parallel visual system was introduced.

## Accessibility Contract

Modernized components preserve semantic buttons, accessible labels, keyboard activation, focus-visible styling, and reduced-motion behavior inherited from the existing CSS system.

## Future Candidates

Candidates for later migration:

- Memory column cards
- Inspector section blocks
- Empty state surfaces
- Evidence support cards

Forbidden future migrations remain:

- Graph rendering internals
- Router
- Retrieval state
- Evidence compiler logic
- Persistence ownership

---

## NV-500-UX-007E.5 — Inspector & Memory React Islands

This phase migrates the Inspector Space and Memory Layer footer to React islands while preserving JavaScript ownership of all state, actions, and persistence.

### Surfaces Migrated

| Surface | Island | Container |
|---|---|---|
| Reference Inspector | `NvInspectorPanel` (mode: reference) | `#selected-reference-container` |
| Evidence Inspector | `NvInspectorPanel` (mode: evidence) | `#evidence-compilation-container` |
| Relationship Inspector | `NvInspectorPanel` (mode: relationship) | `#selected-relationship-container` |
| Memory Layer Grid | `NvMemoryLayer` | `#memory-layer-grid` |

### Inspector Island Boundary

`NvInspectorPanel` dispatches to sub-panels by `data.mode`:

- **reference** → `NvReferenceInspectorPanel`
- **evidence** → `NvEvidenceInspectorPanel` (uses `NvContributionBar`)
- **relationship** → `NvRelationshipInspectorPanel`
- **empty** → `NvEmptyState`

React owns: layout, headers, badges, buttons, contribution bars, empty states.

JavaScript owns: selected reference, selected relationship, evidence compilation, follow actions, pin/unpin, open reference, state persistence.

### Memory Island Boundary

`NvMemoryLayer` renders four columns: Pinned, Recently Viewed, Saved Queries, Knowledge Trail.

React owns: column layout, cards, labels, icons, buttons, empty states.

JavaScript owns: memory arrays, trail events, saved queries, pin state, query execution, localStorage persistence.

### Fallback Policy

1. JavaScript renders fallback HTML into the container first.
2. `tryMountReactIsland()` attempts to mount the React island.
3. If React bundle is unavailable, fallback HTML persists and all behavior works as before.
4. Fallback HTML is **not** removed.

### Payload Contracts

Inspector payloads are plain view models:

- `mode`: `reference`, `evidence`, `relationship`, or `empty`
- `reference`: title, type, source labels, relationship metrics, keywords, connections, and pre-rendered minimap HTML
- `evidence`: confidence labels, summary, pre-rendered confidence/coverage microvisualizations, and supporting references
- `relationship`: relationship id, type, strength, source, target, and context

Memory payloads are plain arrays:

- `pinned`: reference cards derived from existing `pinnedReferences`
- `recent`: reference cards derived from existing `recentReferences`
- `savedQueries`: existing saved query strings
- `trail`: knowledge trail event summaries
- `trailSummaryHtml`: pre-rendered session progress/sparkline HTML from JavaScript

### Callback Contract

Inspector callbacks delegate back to existing JavaScript functions for opening references, following relationships, compiling evidence, and navigating source/target references.

Memory callbacks delegate back to existing JavaScript functions for pin/unpin, rerun/delete query, restore trail, and clear trail behavior.

### Surfaces Still JavaScript-Owned

The Retrieval Engine, Evidence Compiler, Reference Registry, Relationship Graph, search ranking, persistence, router, graph rendering, graph layout, context menu orchestration, hover preview orchestration, and Discovery recommendation logic remain JavaScript-owned.
