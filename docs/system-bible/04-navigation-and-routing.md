# Navigation and Routing

## Hash Routing

NeuralVerse uses a custom hash-based routing system. The `HashRouter` in `router.js` monitors `window.location.hash` changes and maps them to registered routes. When the hash changes:

1. `HashRouter.matchHash()` iterates registered routes to find a matching pattern
2. `ViewController.render()` loads the corresponding HTML template via `fetch()`
3. The template is inserted into `#nv-workspace-content-body`
4. A `nv:routerendered` custom event is dispatched
5. Controllers (curriculum, workspace, retrieval, etc.) listen for this event and render their content

## Deep Routes

The curriculum supports deep hierarchical routes:

```
#/learning                                       Learning Paths index
#/learning/<pathId>                             Single Learning Path
#/learning/<pathId>/module/<moduleId>           Module within a path
#/learning/<pathId>/module/<moduleId>/lesson/<lessonId>          Lesson
#/learning/<pathId>/module/<moduleId>/lesson/<lessonId>/artifact/<artifactId>  Artifact
#/modules                                       Modules index
#/modules/<moduleId>                            Standalone module
```

These routes are parsed by `curriculum-controller.js:routeParts()` and dispatched to the appropriate render function.

## Breadcrumbs

Breadcrumbs are managed by `navigation/breadcrumbs-controller.js`. They are generated dynamically based on the current route:

- For curriculum routes, breadcrumbs follow the Path > Module > Lesson > Artifact hierarchy
- Each breadcrumb segment is a clickable hash link
- The breadcrumb container is updated on every route change
- Breadcrumbs are rendered in a horizontal list with separator arrows

## Navigation Rail

The navigation rail is a vertical sidebar (`#nv-nav-rail`) with links to:

- Home (`#/`)
- Learning (`#/learning`)
- Modules (`#/modules`)
- Workspace (`#/workspace`)
- Content (`#/content`)
- Retrieval (`#/retrieval-playground`)
- Atlas / Knowledge Graph (`#/knowledge-graph`)
- Settings (`#/settings`)

Each link has an SVG icon and a label. The active link is highlighted based on the current route. On mobile viewports, the rail collapses into a hamburger menu.

## Context Panel

The Agent Assist panel (`<aside id="nv-agent-panel">`) is a sliding panel that appears from the right side. It contains:

- Agent selector dropdown
- Quick action buttons
- Query textarea
- Response display area
- Invocation history

The panel is toggled by a button in the header or by keyboard shortcut. When closed, it receives `inert` and `aria-hidden="true"` to remove it from the accessibility tree.

## Transitions

Page transitions are handled by CSS classes defined in `route-transitions.css`:

- `nv-route-transition` — Applied during page transitions
- Transitions use opacity and transform for smooth crossfades
- Motion respects `prefers-reduced-motion`

## Related Chapters

- [Frontend Architecture](03-frontend-architecture.md)
- [Learning Experience](06-learning-experience.md)
- [Accessibility](25-accessibility.md)
