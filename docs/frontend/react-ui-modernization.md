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
