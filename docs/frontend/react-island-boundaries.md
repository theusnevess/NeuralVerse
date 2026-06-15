# React Island Boundaries

## NV-500-UX-007E.2 — Island Architecture Contracts

---

## Architecture Model

NeuralVerse uses the **React Islands** pattern.

Each island is an independently mounted, independently unmounted React subtree embedded inside a plain HTML container. Islands have no awareness of each other and no shared React state.

```
HTML Shell
  └─ DOM Container (vanilla JS owns)
       └─ React Island (React renders)
            ├─ Shared Components (NvButton, NvBadge, ...)
            └─ Event callbacks → JS layer
```

---

## Island Contract

Every island must satisfy:

```typescript
interface IslandProps {
  data: PlainSerializableObject;   // all inputs via plain props
  callbacks: {                     // all outputs via callbacks
    [eventName: string]: Function;
  };
}
```

**Plain serialisable** means: no DOM references, no React elements, no class instances, no functions in `data`.

---

## Boundary Table

| Concern | Owner |
|---|---|
| Island layout, markup, styling | React |
| Icon rendering | React (NvScientificIcon) |
| Badge, chip, button rendering | React (shared components) |
| Microvisualization HTML (already rendered) | JS layer passes as string → NvMicroViz |
| Microvisualization logic (relevance, connectivity) | JS layer exclusively |
| Payload construction | JS layer exclusively |
| Activation timing (hover delay) | JS layer exclusively |
| Overlay position calculation | JS layer exclusively |
| Open / pin / close actions | JS layer exclusively |
| Reference selection | JS layer exclusively |
| Evidence compilation | JS layer exclusively |
| Workspace persistence | JS layer exclusively |
| Graph state | JS layer exclusively |
| Retrieval state | JS layer exclusively |
| Router | JS layer exclusively |

---

## Mount Lifecycle

```
JS event (hover, focus)
    ↓
payloadForTrigger()     ← JS layer constructs payload
    ↓
bridge.mount(container, Island, { data, callbacks })
    ↓
React renders Island
    ↓
User clicks action button
    ↓
callbacks.onAction(action, id)
    ↓
JS layer executes business logic (select, pin, navigate, etc.)
    ↓
JS event (mouseout, blur, Escape)
    ↓
bridge.unmount(container)
```

---

## Registered Islands

| Island | Container selector | Status |
|---|---|---|
| `NvHoverPreview` | `.nv-hover-preview-layer .nv-react-hover-preview-root` | ✅ Active |
| `NvContextMenu` | `.nv-context-menu-layer .nv-react-context-menu-root` | ✅ Active |
| `NvDiscoveryCard` | `.nv-react-discovery-card-root[data-discovery-card-id]` | ✅ Active |
| `NvInspectorPanel` | `#selected-reference-container` (mode: reference) | ✅ Active (E.5) |
| `NvInspectorPanel` | `#evidence-compilation-container` (mode: evidence) | ✅ Active (E.5) |
| `NvInspectorPanel` | `#selected-relationship-container` (mode: relationship) | ✅ Active (E.5) |
| `NvMemoryLayer` | `#memory-layer-grid` | ✅ Active (E.5) |

---

## Forbidden Patterns

An island **must never**:

- Import from `scripts/retrieval-playground.js` directly
- Read from `localStorage` or `sessionStorage`
- Subscribe to router events
- Mutate DOM outside its own container
- Call `fetch()` or any network request
- Import React Router, Redux, Zustand, or any state management library
- Create its own `createRoot()` — use the bridge
- Use `ReactDOM.hydrate()` — all islands are client-mounted
- Render SVG graph nodes or force-simulation elements

---

## Bridge API

Runtime bridge source lives in `react-build/src/bridge.js` and is bundled into
`website/dist/react-islands.js`. `website/react/utils/bridge.js` remains as a
small compatibility note for the retired zero-bundler path.

```javascript
// Mount or reuse
mount(container, Component, props)

// Re-render with new props
update(container, Component, props)

// Cleanup
unmount(container)
```

All three calls are safe no-ops if React is unavailable.
