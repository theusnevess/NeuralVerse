# React Adoption Foundation

## NV-500-UX-007E.2 — Application-Wide React Strategy

**Status:** Active  
**Version:** 1.0  
**Scope:** All NeuralVerse frontend surfaces where React provides architectural value

---

## Motivation

The NeuralVerse frontend has a mature vanilla-JS application shell with:

- A hash-based router
- Domain controllers (learning, content, progress, workspace)
- A complex retrieval workspace with force-directed graph, evidence compiler, reference registry, and workspace persistence
- A well-established CSS design-token system

React is introduced **not** as a rewrite but as a **presentation and composition layer** to address:

| Problem | React Solution |
|---|---|
| String-based `innerHTML` rendering of complex overlays | Declarative component trees |
| Duplicated DOM construction across multiple JS files | Shared reusable component primitives |
| Difficult unit-testability of UI fragments | Pure-function components with plain props |
| Visual inconsistency as UI grows | Enforced token consumption via component contracts |
| High copy-paste surface for future features | Composable island architecture |

---

## Core Principle

```
React wraps UI.
React does not replace working domain logic.
```

React is responsible for **rendering** only. It never owns:

- Retrieval logic
- Domain state  
- Persistence
- Routing
- Graph algorithms
- Evidence compilation
- Search semantics
- Reference registry
- Relationship graph

---

## Build Strategy

This implementation uses a **local React Islands bundle**:

```
react-build/                       → Vite build package and React island source
react-build/src/index.jsx          → local bundle entry point
react-build/src/bridge.js          → mount/update/unmount bridge implementation
react-build/src/NvHoverPreview.jsx → first production island
website/dist/react-islands.js      → self-contained runtime bundle
website/index.html                 → loads dist/react-islands.js with defer
```

The browser runtime has **zero CDN dependency**. React, ReactDOM, the bridge,
and active islands are bundled into `website/dist/react-islands.js`.

To rebuild:

```bash
cd react-build
npm ci
npm run build
```

### Graceful Degradation

If the local bundle is unavailable:

1. `window.NeuralVerse.react` remains `undefined`
2. The `show()` function inside `retrieval-playground.js` detects this and falls back to `innerHTML` rendering — **identical to the previous behavior**
3. All other application functionality is unaffected

---

## Styling Policy

React components **must**:

- Use only CSS classes already defined in the design token system
- Never introduce hardcoded colors, spacing values, or typography
- Never introduce CSS-in-JS libraries
- Never create a parallel design system

The token cascade: `tokens.css → base.css → components.css → retrieval-playground.css`  
remains the single source of truth for all visual decisions.

---

## Accessibility Requirements

All React components must:

- Use semantic HTML elements (`button`, `section`, `h1–h6`, `p`, etc.)
- Never use clickable `div` where a `button` is appropriate
- Forward `aria-label`, `aria-selected`, `aria-expanded` props
- Support keyboard navigation (Enter + Space activation on interactive elements)
- Respect `prefers-reduced-motion` — components should avoid adding animation that the CSS system does not already handle

---

## Future Phases

The islands architecture is designed to grow incrementally:

1. **Phase 1 (current):** NvHoverPreview island + shared component foundation
2. **Phase 2:** Discovery Panel Card island
3. **Phase 3:** Inspector presentation blocks
4. **Phase 4:** Memory Layer cards, settings panels
5. **Phase 5:** Shared layout primitives, learning pages

Each phase must produce a QA-certified implementation before proceeding.  
No phase may migrate domain or retrieval logic into React.
