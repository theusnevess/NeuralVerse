# Frontend Architecture

## Routing

The application uses a custom `HashRouter` (`router.js`) that listens for `hashchange` events. Route patterns are defined in `routes.js` and match against `window.location.hash`. When a match is found, the corresponding view template — defined as an inline HTML string in the `ViewController.templates` object within `router.js` — is injected into `#nv-workspace-content-body`.

### Route Registration

Each route is registered with:
- A regex pattern (e.g., `^#/learning/([^/]+)$`)
- A route ID (e.g., `learning-detail`)
- A label and title for navigation
- An `isImplemented` flag

Route view templates are inline HTML strings in `router.js`, not external files.

### Route Table

| Hash Pattern | Route ID | View Template |
|---|---|---|
| `#/` | `home` | Inline (home) |
| `#/learning` | `learning` | Inline (learning) |
| `#/learning/:pathId` | `learning-detail` | Inline (learning-detail) |
| `#/learning/:pathId/module/:moduleId` | `learning-path` | Inline (learning-path) |
| `#/learning/:pathId/module/:moduleId/lesson/:lessonId` | `lesson-detail` | Inline (lesson-detail) |
| `#/learning/:pathId/module/:moduleId/lesson/:lessonId/artifact/:artifactId` | `artifact-detail` | Inline (artifact-detail) |
| `#/modules` | `modules` | Inline (modules) |
| `#/modules/:moduleId` | `module-detail` | Inline (module-detail) |
| `#/workspace` | `workspace` | Inline (workspace) |
| `#/content` | `content` | Inline (content) |
| `#/retrieval-playground` | `retrieval-playground` | Inline (retrieval-playground) |
| `#/knowledge-graph` | `knowledge-graph` | Inline (knowledge-graph) |
| `#/settings` | `settings` | Inline (settings) |
| `#/laboratory` | `laboratory` | Inline (laboratory) |
| `#/laboratory/:slug` | `laboratory-detail` | Inline (laboratory-detail) |
| `#/memory` | `memory` | Inline (memory) |
| `#/memory/:memoryId` | `memory-detail` | Inline (memory-detail) |
| `#/semantic-learning` | `semantic-learning` | Inline (semantic-learning) |
| `#/visualizations` | `visualizations` | Inline (visualizations) |
| `#/visualizations/:slug` | `visualization-detail` | Inline (visualization-detail) |
| `#/generative-layer` | `generative-layer` | Inline (generative-layer) |

## Shell

The shell (`index.html`) contains:
- A skip-to-content link for accessibility
- Canvas element for neural galaxy background
- Global header with branding, agent trigger, and search trigger (Ctrl+K)
- Navigation rail (vertical sidebar) with links to all major sections
- Breadcrumb container
- Main workspace area (`#nv-workspace-content-body`)
- Agent Assist panel (`<aside>`, hidden by default)

## Layout

The layout uses CSS Grid with three main columns:
1. Navigation rail (fixed width)
2. Main content area (dynamic)
3. Context panel (optional, used in workspace)

The layout is fully responsive, collapsing the navigation rail into a hamburger menu on smaller viewports.

## Page Composition

Page templates are HTML fragments loaded via `fetch()` into the workspace surface. Each template has a `<div>` container with known `data-*` attributes that the controllers use as mount points:

- `data-curriculum-root` — Curriculum views
- `data-workspace-root` — Workspace dashboard
- `data-retrieval-root` — Retrieval playground
- `data-knowledge-graph-root` — Knowledge graph

## State Boundaries

State is managed through multiple mechanisms:

- **Module-level closures** in service files (e.g., `indexCache` in `curriculum-service.js`)
- **Event-driven communication** via window custom events (`nv:routerendered`, `nv:personalization_updated`, etc.)
- **Observable state objects** (`workspace-state.js` with subscribe/notify)
- **Global namespace** (`window.NeuralVerse`) for cross-module access
- **DOM data attributes** for localized state

## Local Persistence

All persistent state uses `localStorage` with the following key patterns:

| Key Pattern | Purpose |
|---|---|
| `nv_personalization_*` | Notes, bookmarks, tags, collections, favorites, queue, highlights, reading progress |
| `nv_agent_panel_*` | Agent panel state (mode, collapsed sections, recent prompts) |
| `neuralverse.progress.v1` | Reading progress (shared) |
| `neuralverse.retrievalWorkspace.v1` | Retrieval playground session state |
| `nv_curriculum_workspace_focus_mode` | Reading focus mode toggle |

## React Islands

React is used only for specific interactive components that benefit from React's declarative model. All React code is compiled into a single IIFE bundle (`website/dist/react-islands.js`) via Vite 8. Mount points are DOM elements with specific IDs or data attributes. Components:

- `NvBackground` — Enhanced animated background
- `NvWorkspaceSnapshot` — Workspace snapshot viewer
- `NvCompareWorkspace` — Side-by-side comparison workspace
- `NvContextMenu` — Right-click context menu
- `NvDiscoveryCard` — Discovery/proposal cards
- `NvHoverPreview` — Hover preview popups
- `NvInspectorPanel` — Side inspector panel
- `NvMemoryLayer` — Retrieval memory layer
- `NvResearchPresentation` — Research presentation mode

A bridge module (`bridge.js`) exposes React components to vanilla JavaScript via `window.NeuralVerse.react`.

## Vanilla Components

All core UI is built with vanilla JavaScript. Components include:
- Curriculum cards with lifecycle badges
- Filterable collections with button groups
- Breadcrumb navigation
- Agent Assist panel with dropdowns and quick actions
- Search modal with keyboard navigation
- Reading experience (sticky header, TOC, progress bar)
- Personalization panels (notes, bookmarks, highlights, collections, tags)
- Study session bar
- Knowledge graph (Canvas/WebGL rendered)

## Related Chapters

- [Navigation and Routing](04-navigation-and-routing.md)
- [UI Design Language](24-ui-design-language.md)
- [Accessibility](25-accessibility.md)
