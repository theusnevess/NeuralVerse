# NeuralVerse System Bible

> Todas as seções da pasta `docs/system-bible/` consolidadas em um único arquivo.

---

## Índice

1. [README — Introdução](#readme--introdução)
2. [00 — Executive Summary](#00-executive-summary)
3. [01 — Project Vision](#01-project-vision)
4. [02 — System Architecture](#02-system-architecture)
5. [03 — Frontend Architecture](#03-frontend-architecture)
6. [04 — Navigation and Routing](#04-navigation-and-routing)
7. [05 — Curriculum Architecture](#05-curriculum-architecture)
8. [06 — Learning Experience](#06-learning-experience)
9. [07 — Workspace Architecture](#07-workspace-architecture)
10. [08 — Search System](#08-search-system)
11. [09 — Retrieval System](#09-retrieval-system)
12. [10 — Atlas System](#10-atlas-system)
13. [11 — Didactic Agent Runtime](#11-didactic-agent-runtime)
14. [12 — Agent A1: Didactic Architecture](#12-agent-a1-didactic-architecture)
15. [13 — Agent A2: Curriculum & Dependency](#13-agent-a2-curriculum--dependency)
16. [14 — Agent A3: Visual & Interactive Media](#14-agent-a3-visual--interactive-media)
17. [15 — Agent A4: Code, Simulation & Laboratory](#15-agent-a4-code-simulation--laboratory)
18. [16 — Agent A5: Research & State-of-the-Art](#16-agent-a5-research--state-of-the-art)
19. [17 — Agent A6: Application & Professional Transfer](#17-agent-a6-application--professional-transfer)
20. [18 — Agent A7: Assessment & Reinforcement](#18-agent-a7-assessment--reinforcement)
21. [19 — Agent A8: Obsidian & Knowledge Governance](#19-agent-a8-obsidian--knowledge-governance)
22. [20 — Agent A9: Storytelling & Learning Journey](#20-agent-a9-storytelling--learning-journey)
23. [21 — Agent A10: Curiosity & Engagement](#21-agent-a10-curiosity--engagement)
24. [22 — Personalization System](#22-personalization-system)
25. [23 — Study Sessions](#23-study-sessions)
26. [24 — UI Design Language](#24-ui-design-language)
27. [25 — Accessibility](#25-accessibility)
28. [26 — Security Model](#26-security-model)
29. [27 — Governance Model](#27-governance-model)
30. [28 — Testing and Certification](#28-testing-and-certification)
31. [29 — Current Capabilities](#29-current-capabilities)
32. [30 — Known Limitations](#30-known-limitations)
33. [31 — Development Guidelines](#31-development-guidelines)
34. [32 — Glossary](#32-glossary)

---

# README — Introdução

# NeuralVerse System Bible

The official, exhaustive, canonical technical reference manual for the NeuralVerse project.

## Purpose

This document suite describes what NeuralVerse is, how it is architected, how it operates, how its subsystems interact, and what has been implemented. It is intended as a single source of truth for engineers, architects, and researchers working on or evaluating the platform.

## Documents

| # | Document | Description |
|---|----------|-------------|
| 00 | [Executive Summary](#00-executive-summary) | Project overview, architecture, maturity |
| 01 | [Project Vision](#01-project-vision) | Mission, philosophy, governance principles |
| 02 | [System Architecture](#02-system-architecture) | Overall architecture, modules, data flow |
| 03 | [Frontend Architecture](#03-frontend-architecture) | Routing, shell, layout, components, state |
| 04 | [Navigation and Routing](#04-navigation-and-routing) | Hash routing, deep routes, breadcrumbs, rail |
| 05 | [Curriculum Architecture](#05-curriculum-architecture) | Learning Paths, Modules, Lessons, Artifacts |
| 06 | [Learning Experience](#06-learning-experience) | Discovery flow, reading, study workflow |
| 07 | [Workspace Architecture](#07-workspace-architecture) | Reading shell, outline, metadata, tools |
| 08 | [Search System](#08-search-system) | Indexing, aliases, scoring, keyboard nav |
| 09 | [Retrieval System](#09-retrieval-system) | Playground, graph, compare, knowledge trail |
| 10 | [Atlas System](#10-atlas-system) | Knowledge graph, staged navigation, inspector |
| 11 | [Didactic Agent Runtime](#11-didactic-agent-runtime) | Registry, orchestrator, context, guardrails |
| 12 | [Agent A1: Didactic Architecture](#12-agent-a1-didactic-architecture) | Teaching strategies, modes, engines |
| 13 | [Agent A2: Curriculum & Dependency](#13-agent-a2-curriculum--dependency) | Prerequisites, navigation, dependencies |
| 14 | [Agent A3: Visual & Interactive Media](#14-agent-a3-visual--interactive-media) | Visualization guidance, media selection |
| 15 | [Agent A4: Code & Laboratory](#15-agent-a4-code--laboratory) | Code examples, algorithms, simulations |
| 16 | [Agent A5: Research](#16-agent-a5-research) | Landmark papers, trends, reading roadmaps |
| 17 | [Agent A6: Professional Transfer](#17-agent-a6-professional-transfer) | Production, trade-offs, MLOps, case studies |
| 18 | [Agent A7: Assessment & Reinforcement](#18-agent-a7-assessment--reinforcement) | Practice, flashcards, self-assessment |
| 19 | [Agent A8: Obsidian & Governance](#19-agent-a8-obsidian--governance) | Notes, tags, collections, knowledge review |
| 20 | [Agent A9: Storytelling](#20-agent-a9-storytelling) | Narratives, timelines, mental models |
| 21 | [Agent A10: Curiosity](#21-agent-a10-curiosity) | Facts, connections, thought experiments |
| 22 | [Personalization System](#22-personalization-system) | Notes, bookmarks, tags, collections, highlights |
| 23 | [Study Sessions](#23-study-sessions) | Timer, pause/resume, summary modal |
| 24 | [UI Design Language](#24-ui-design-language) | Dark aesthetic, typography, spacing, color |
| 25 | [Accessibility](#25-accessibility) | Landmarks, keyboard nav, ARIA, reduced motion |
| 26 | [Security Model](#26-security-model) | Sanitization, XSS prevention, governed refusals |
| 27 | [Governance Model](#27-governance-model) | Immutable curriculum, Evidence Boundary, lifecycle |
| 28 | [Testing and Certification](#28-testing-and-certification) | QA audits, Master Gate, Playwright, regression |
| 29 | [Current Capabilities](#29-current-capabilities) | Implemented features by subsystem |
| 30 | [Known Limitations](#30-known-limitations) | Unimplemented features, boundaries, non-goals |
| 31 | [Development Guidelines](#31-development-guidelines) | Conventions for contributors |
| 32 | [Glossary](#32-glossary) | Key terms and definitions |

## How to Use

- **New team members**: Start with [Executive Summary](#00-executive-summary) and [System Architecture](#02-system-architecture)
- **Feature contributors**: Read [Development Guidelines](#31-development-guidelines) and the relevant subsystem document
- **Architects**: Read [System Architecture](#02-system-architecture), [Governance Model](#27-governance-model), and [Security Model](#26-security-model)
- **QA engineers**: Read [Testing and Certification](#28-testing-and-certification) and the audit scripts in `scripts/`

## Source of Truth

This documentation is derived exclusively from the implemented system and canonical project architecture. It does not describe roadmap items, hypothetical features, or aspirational capabilities.

---

# 00 — Executive Summary

# Executive Summary

## Project Purpose

NeuralVerse is an AI learning and research platform designed as a local-first, single-page application for exploring machine learning, deep learning, and artificial intelligence concepts through structured curriculum content, interactive visualizations, and a didactic agent framework.

## Target Audience

Researchers, engineers, and self-directed learners seeking a structured, governance-controlled environment for AI education. The platform assumes technical literacy but does not require backend infrastructure or external API access.

## Educational Philosophy

The platform follows a scientific learning philosophy: knowledge is structured hierarchically (Learning Paths > Modules > Lessons > Artifacts), content is governed by lifecycle metadata (Draft/Reviewed), and learning is supported by deterministic didactic agents that provide scaffolded guidance without claiming mastery, scoring, or certification.

## Architecture Overview

NeuralVerse is a fully client-side single-page application (SPA) with a vanilla JavaScript core and React islands for specific interactive components. Key characteristics:

- **Hash-based routing** for all navigation
- **Local persistence** via `localStorage` for personalization data
- **Static JSON files** as the data layer for curriculum and content
- **Deterministic agent runtime** with 10 didactic agents, all operational
- **Seeded retrieval playground** simulating a research reference system
- **Force-directed knowledge graph** for visual exploration
- **Canvas-based neural galaxy** animated background
- **Comprehensive audit and certification** tooling

## Implementation Maturity

| Area | Status |
|------|--------|
| Curriculum (19 paths, 40 modules, 120 lessons, 600 artifacts) | Implemented |
| Didactic Agent Runtime (10 agents, 100 modes) | Operational |
| Personalization (notes, bookmarks, tags, collections, queue, highlights) | Implemented |
| Study Sessions | Implemented |
| Retrieval Playground (5 modes, graph, compare, evidence) | Implemented (Presentation mode: placeholder) |
| Knowledge Graph / Atlas | Implemented |
| Search System | Implemented |
| Accessibility | Audited and compliant |
| Governance Model | Enforced at multiple layers |
| Audits & Certification | QA1-QA5 completed, Master Certification Gate passing |
| Backend / Auth / Database | Not implemented (by design) |
| External API / LLM integration | Not implemented (by design) |

## Related Chapters

- [Project Vision](#01-project-vision)
- [System Architecture](#02-system-architecture)
- [Current Capabilities](#29-current-capabilities)
- [Known Limitations](#30-known-limitations)

---

# 01 — Project Vision

# Project Vision

## NeuralVerse Mission

NeuralVerse exists to provide a structured, governed, and accessible environment for learning AI and machine learning concepts. The platform treats educational content as a first-class system: immutable in its canonical form, explorable through multiple lenses (curriculum, graph, retrieval, agents), and extensible through deterministic tooling.

## Scientific Learning Philosophy

Learning in NeuralVerse follows a hierarchical decomposition model:

- **Learning Paths** represent broad domains or tracks
- **Modules** break paths into conceptual units
- **Lessons** organize modules into teachable sessions
- **Artifacts** are individual content pieces (readings, visualizations, exercises, code)

This structure allows learners to navigate from overview to detail while maintaining context of where each piece fits in the larger domain.

## Local-First Philosophy

NeuralVerse is designed to operate without network dependencies after initial page load:

- All curriculum data is served from static JSON files
- All personalization state is stored in `localStorage`
- All agent logic executes deterministically in the browser
- No external APIs, no authentication, no backend services

This guarantees reproducibility, privacy, and offline-capable operation.

## Governance Principles

The platform enforces strict governance boundaries:

- **Curriculum immutability**: Canonical content cannot be modified through the UI or agent system
- **Evidence Boundary**: Agents provide guidance but cannot fabricate claims about learner achievement
- **Lifecycle semantics**: Draft/Reviewed indicate editorial status, not learner mastery
- **No mastery inference**: The platform does not score, grade, certify, or track learner competence
- **Preservation rules**: Audit scripts verify governance compliance at every layer

## Didactic Philosophy

The didactic agent framework operates on a deterministic, scaffolded model:

1. Agents provide structured guidance within defined roles (A1-A10)
2. Responses are generated from curated data and rule-based logic, not from generative models
3. Agents refuse requests that violate governance boundaries
4. Supporting engines (analogy, comparison, socratic, misconception) provide pedagogical depth without claiming authority

## Related Chapters

- [System Architecture](#02-system-architecture)
- [Governance Model](#27-governance-model)
- [Didactic Agent Runtime](#11-didactic-agent-runtime)

---

# 02 — System Architecture

# System Architecture

## Overall Architecture

NeuralVerse is a **single-page application (SPA)** with a **vanilla JavaScript core** and **React islands** for selective interactivity. The system runs entirely in the browser with no backend dependencies.

```
┌─────────────────────────────────────────────────────────┐
│                    index.html (Shell)                    │
│  ┌──────────┐ ┌──────────────────┐ ┌────────────────┐  │
│  │  Header   │ │  Navigation Rail │ │ Breadcrumbs    │  │
│  └──────────┘ └──────────────────┘ └────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │          #nv-workspace-content-body              │    │
│  │         (Dynamic page surface)                   │    │
│  │  ┌───────────────────────────────────────────┐   │    │
│  │  │  Page HTML loaded via fetch()             │   │    │
│  │  │  (14 page templates)                      │   │    │
│  │  └───────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │          Agent Assist Panel (aside)              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │       Neural Galaxy Canvas (background)          │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Runtime Boundaries

All code executes in the browser's main thread. There is no:

- Backend server (other than static file serving)
- Database
- Authentication system
- External API integration
- Service worker

## Module Decomposition

The system is organized into independent subsystems:

| Subsystem | Directory | Role |
|-----------|-----------|------|
| Router | `website/scripts/router/` | Hash-based routing and page loading |
| Curriculum | `website/scripts/curriculum/` | Learning content loading, rendering, search |
| Agents | `website/scripts/agents/` | Didactic agent runtime (orchestrator, registry, 10 agents) |
| Knowledge Graph | `website/scripts/knowledge-graph/` | Force-directed graph visualization |
| Workspace | `website/scripts/workspace/` | Personalization, workspace state |
| Progress | `website/scripts/progress/` | Reading progress tracking |
| Retrieval | `website/scripts/retrieval/` | Research reference playground |
| Content | `website/scripts/content/` | Content page controller |
| Navigation | `website/scripts/navigation/` | Breadcrumb and navigation state |
| Background | `website/scripts/background/` | Neural galaxy canvas animation |
| Visualizations | `website/scripts/visualizations/` | Interactive curriculum visualizations |
| React Islands | `react-build/src/` | React components for enhanced UI |

## Separation of Concerns

- **Controllers** handle DOM rendering and user interaction
- **Services** handle data access and business logic
- **State modules** provide observable state containers
- **Engines** provide pedagogical logic (analogy, comparison, socratic)
- **Audit scripts** verify system behavior independently

## Data Flow

```
Static JSON files (curriculum-index.json, etc.)
        │
        ▼
    curriculum-service.js (fetch + cache)
        │
        ▼
    curriculum-controller.js (render pages, build DOM)
        │
        ├──► curriculum-search.js (index + search)
        ├──► knowledge-graph (visual exploration)
        ├──► agent-context-builder (state snapshot)
        └──► personalization-controller (notes, bookmarks, etc.)
                │
                ▼
            localStorage (persistence)
```

## Related Chapters

- [Frontend Architecture](#03-frontend-architecture)
- [Navigation and Routing](#04-navigation-and-routing)
- [Curriculum Architecture](#05-curriculum-architecture)

---

# 03 — Frontend Architecture

# Frontend Architecture

## Routing

The application uses a custom `HashRouter` (`router.js`) that listens for `hashchange` events. Route patterns are defined in `routes.js` and match against `window.location.hash`. When a match is found, the corresponding page template is fetched from `website/pages/` and loaded into `#nv-workspace-content-body`.

### Route Registration

Each route is registered with:
- A regex pattern (e.g., `^#/learning/([^/]+)$`)
- A route ID (e.g., `learning-detail`)
- A view template path (e.g., `pages/learning-detail.html`)
- A render function for dynamic content

### Route Table

| Hash Pattern | Route ID | View Template |
|---|---|---|
| `#/` | `home` | `pages/home.html` |
| `#/learning` | `learning` | `pages/learning.html` |
| `#/learning/:pathId` | `learning-detail` | `pages/learning-detail.html` |
| `#/learning/:pathId/module/:moduleId` | `learning-path` | `pages/learning-path.html` |
| `#/learning/:pathId/module/:moduleId/lesson/:lessonId` | `lesson-detail` | `pages/learning-detail.html` |
| `#/learning/:pathId/module/:moduleId/lesson/:lessonId/artifact/:artifactId` | `artifact-detail` | `pages/learning-detail.html` |
| `#/modules` | `modules` | `pages/learning-detail.html` |
| `#/modules/:moduleId` | `module-detail` | `pages/learning-detail.html` |
| `#/workspace` | `workspace` | `pages/workspace.html` |
| `#/content` | `content` | `pages/content.html` |
| `#/retrieval-playground` | `retrieval-playground` | `pages/retrieval-playground.html` |
| `#/knowledge-graph` | `knowledge-graph` | `pages/knowledge-graph.html` |
| `#/settings` | `settings` | `pages/settings.html` |

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

- [Navigation and Routing](#04-navigation-and-routing)
- [UI Design Language](#24-ui-design-language)
- [Accessibility](#25-accessibility)

---

# 04 — Navigation and Routing

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

- [Frontend Architecture](#03-frontend-architecture)
- [Learning Experience](#06-learning-experience)
- [Accessibility](#25-accessibility)

---

# 05 — Curriculum Architecture

# Curriculum Architecture

## Overview

The curriculum subsystem is the core content layer of NeuralVerse. It provides hierarchical learning content organized into Learning Paths, Modules, Lessons, and Artifacts. All content is defined in a single canonical JSON index and served as static files.

## Data Model

```
Learning Path
  ├── id, title, summary, canonicalStatus (Draft|Reviewed)
  ├── moduleIds[] ─────────────────────────────────────────┐
  │                                                         │
Module                                                      │
  ├── id, title, summary, canonicalStatus                   │
  ├── lessonIds[] ──────────────────────────────────────────┤
  │                                                         │
Lesson                                                      │
  ├── id, title, summary, canonicalStatus                   │
  ├── artifactIds[] ────────────────────────────────────────┤
  │                                                         │
Artifact                                                    │
  ├── id, title, type (reading, exercise, visualization, etc.)
  ├── source (path to Markdown file)
  ├── canonicalStatus (Draft|Reviewed)
  ├── duration (estimated reading time)
  ├── instructionalObjectives[]
  └── dependencies (prerequisites, complementary, etc.)
```

## Curriculum Index

The file `website/data/curriculum-index.json` is the canonical data source. It is a single JSON object containing:

```json
{
  "meta": { "generated": "2026-06-21T23:03:19.454Z", "source": "docs/content" },
  "counts": { "paths": 19, "modules": 40, "lessons": 120, "artifacts": 600 },
  "paths": [ ... ],
  "modules": [ ... ],
  "lessons": [ ... ],
  "artifacts": [ ... ]
}
```

Current canonical counts:

| Entity | Total | Reviewed | Draft |
|--------|-------|----------|-------|
| Learning Paths | 19 | 2 | 17 |
| Modules | 40 | — | — |
| Lessons | 120 | — | — |
| Artifacts | 600 | — | — |

## Data Access Layer

`curriculum-service.js` provides:
- `getIndex()` — Fetches and caches the curriculum index
- `getPath(id)`, `getModule(id)`, `getLesson(id)`, `getArtifact(id)` — Individual entity lookups
- `getModulesForPath(pathId)`, `getLessonsForModule(moduleId)`, `getArtifactsForLesson(lessonId)` — Hierarchy traversal
- `loadArtifactMarkdown(artifactId)` — Fetches and parses artifact Markdown content
- `findRouteForArtifact(artifactId)` — Resolves the canonical hash route for any artifact

## Lifecycle Metadata

Every entity has a `canonicalStatus` field with two possible values:

- **Reviewed** — Content has passed editorial review. Rendered with a green badge (`data-variant="success"`) and a green top border on cards.
- **Draft** — Content is in progress. Rendered with a neutral badge (`data-variant="neutral"`).

The lifecycle status is governance metadata only. It indicates editorial completeness, not learner achievement, competency, or content quality.

## Content Types

Artifacts have a `type` field that determines rendering:

| Type | Rendering |
|---|---|
| `reading` | Markdown rendered as HTML with reading experience enhancements |
| `exercise` | Markdown with exercise section wrappers (Learner Task, Expected Output, Guidance) |
| `interactive-visualization` | If registered in `visualization-registry.js`, the visualization is instantiated; otherwise a "Specification only" notice is shown |
| `comparison-table` | Markdown table with comparison formatting |
| `code` | Markdown with code block enhancements |
| `video`, `image`, `audio` | Media embedding |

## Visualizations Registry

Interactive visualizations in `website/scripts/visualizations/` are registered by ID and instantiated when an artifact of type `interactive-visualization` has a matching registry entry. Implemented visualizations include: Bayes theorem, convolution intuition, distance metrics, forward propagation, nearest neighbor, object detection, overfitting, RAG pipeline, segmentation, self-attention.

Unregistered visualization artifacts display a specification notice with no executable widget.

## Filtering

Filterable collections allow learners to filter by lifecycle status:

- **All** — Shows all entities regardless of status
- **Reviewed** — Shows only Reviewed entities
- **Draft** — Shows only Draft entities

Filter state uses `aria-pressed` on button elements. Entities are sorted so Reviewed items appear before Draft items.

## Integration Points

The curriculum subsystem integrates with:
- **Search** (`curriculum-search.js`) — Builds a flat search index from all entities
- **Knowledge Graph** — Uses curriculum data for graph nodes
- **Agent System** — Context builder reads curriculum state; dependency agent traverses the curriculum index
- **Personalization** — Notes, bookmarks, and progress are keyed to curriculum entity IDs
- **Breadcrumbs** — Curriculum hierarchy drives breadcrumb rendering

## Related Chapters

- [Learning Experience](#06-learning-experience)
- [Search System](#08-search-system)
- [Atlas System](#10-atlas-system)
- [Governance Model](#27-governance-model)

---

# 06 — Learning Experience

# Learning Experience

## Discovery Flow

The learning experience begins at the Learning Paths index (`#/learning`), which displays all 19 Learning Paths as cards in a 2-column grid. Each card shows:

- Title and summary
- Lifecycle status badge (Draft/Reviewed)
- Module count
- Duration estimate
- Top border color indicating lifecycle status

A filter bar allows toggling between All, Reviewed, and Draft paths. Cards are sorted with Reviewed paths first.

## Overview Pages

### Learning Path Detail (`#/learning/<pathId>`)

Shows the path's modules as a filterable collection. An optional hero section displays the path's full description. The stat grid shows Reviewed vs Draft module counts.

### Module Detail (`#/learning/<pathId>/module/<moduleId>`)

Shows the module's lessons as a filterable collection with lesson-level metadata.

### Modules Index (`#/modules`)

Displays all 40 modules from across all paths as a flat filterable collection.

## Lesson Navigation

### Lesson Detail (`#/learning/<pathId>/module/<moduleId>/lesson/<lessonId>`)

Shows the lesson's artifacts in a flow visualization — a 5-step canonical learning flow:

1. Introduction
2. Reading
3. Visualization (if applicable)
4. Exercise (if applicable)
5. Summary

Each step is marked active based on the current artifact type. Artifacts are listed with their type badges, status badges, and estimated duration.

## Artifact Reading

### Artifact Detail (`#/learning/<pathId>/module/<moduleId>/lesson/<lessonId>/artifact/<artifactId>`)

The reading view uses a 3-column workspace layout:

```
┌──────────┬─────────────────────────────┬────────────────┐
│ Outline  │      Main Content           │   Metadata     │
│ (Lesson  │     (Markdown HTML)         │   (Type,       │
│  TOC +   │                             │    Status,     │
│  Artifact│                             │    Duration,   │
│  list)   │                             │    Objectives) │
└──────────┴─────────────────────────────┴────────────────┘
```

Below the content:
- **Parent lineage** — "Part of: Path > Module > Lesson"
- **Sibling artifacts** — Other artifacts in the same lesson
- **Dependencies** — Prerequisites, complementary resources, recommended before/after, alternatives
- **Cross-link cards** — Cards linking to related content with route and description
- **Previous/Next navigation** — Footer with artifact position counter

## Reading Continuity

The reading experience includes:
- **Sticky header** — Shows artifact title, type badge, status badge, and "Back to Lesson" link
- **Progress bar** — Thin bar under the header that fills as the learner scrolls
- **Table of Contents** — Extracted from H2/H3/H4 headings; desktop sidebar and mobile accordion
- **Section quick navigation** — Prev section, next section, top buttons
- **Copy code buttons** — On code blocks with "Copy" / "Copied!" feedback
- **Focus mode** — Hides sidebar and metadata column for distraction-free reading

## Study Workflow

Learners can integrate artifacts into a study workflow:
1. **Bookmark** — Mark artifacts for later review
2. **Add to queue** — Add to study queue from artifact pages
3. **Take notes** — Per-artifact Markdown notes with preview
4. **Track progress** — Mark as Not Started / In Progress / Completed
5. **Study sessions** — Start a timed session that tracks visited resources, notes, and completed items
6. **Highlight** — Paragraph-level highlights in yellow or green

## Related Chapters

- [Curriculum Architecture](#05-curriculum-architecture)
- [Workspace Architecture](#07-workspace-architecture)
- [Personalization System](#22-personalization-system)
- [Study Sessions](#23-study-sessions)

---

# 07 — Workspace Architecture

# Workspace Architecture

## Reading Shell

The workspace is the primary reading and study environment. It is rendered by `curriculum-controller.js` when a user navigates to an artifact, lesson, or the workspace dashboard (`#/workspace`).

## Three-Column Layout

```
┌─────────────────┬──────────────────────────┬─────────────────┐
│   Left Column   │     Center Column        │  Right Column   │
│   (Outline)     │     (Content)            │  (Metadata)     │
│                 │                          │                 │
│ • Lesson TOC    │ • Artifact Markdown      │ • Type badge    │
│ • Artifact list │   rendered as HTML       │ • Status badge  │
│   with check    │ • Cross-link cards       │ • Duration      │
│   marks         │ • Dependency sections    │ • Objectives    │
│ • Progress      │ • Prev/Next nav          │ • Notes         │
│   indicators    │                          │ • Tags          │
│                 │                          │ • Collections   │
│                 │                          │ • Highlights    │
│                 │                          │ • Bookmark btn  │
└─────────────────┴──────────────────────────┴─────────────────┘
```

## Outline (Left Column)

The outline shows the lesson structure:
- Lesson overview link
- All artifacts in the lesson in order
- Current artifact is highlighted
- Progress indicators (Not Started / In Progress / Completed)
- Collapsible accordion behavior on mobile

## Metadata Sidebar (Right Column)

The metadata panel displays:
- Artifact type with color-coded badge
- Lifecycle status with governance tooltip
- Estimated reading duration
- Instructional objectives
- Personalization controls: notes textarea, tags input, collections checkboxes, bookmark toggle, highlight tools
- Reading progress dropdown

## Personalization Integration

The workspace integrates deeply with the personalization system:

- **Notes**: Textarea with Markdown preview, auto-saved per artifact
- **Tags**: Badge-based tag input with remove buttons
- **Collections**: Checkbox list to add/remove from study collections
- **Favorites**: Star toggle
- **Highlights**: Paragraph-level color picker on hover
- **Reading progress**: Dropdown to mark status
- **Reading bookmarks**: Position-based bookmarks within long artifacts

## Continue Reading

When a user navigates away from an artifact and returns, the "Continue Reading" feature restores their scroll position. The workspace dashboard (`#/workspace`) shows a "Continue Reading" banner with a "Resume" link, displaying time since last viewed.

## Sticky Layout

The reading view uses a sticky header that remains fixed at the top:
- Artifact title
- Type badge and status badge
- "Back to Lesson" link
- Reading progress bar

The header ensures the learner always knows their position and can navigate back to the lesson context.

## Markdown Rendering

Markdown is converted to HTML via `curriculum-controller.js:markdownToHtml()`:
- Headings H2-H4
- Unordered and ordered lists
- Code blocks (with copy button)
- Tables (wrapped in scrollable containers)
- Blockquotes
- Inline formatting: bold, italic, code, links
- Exercise sections: "Learner Task", "Expected Learner Output", "Reasoning Guidance" are wrapped in structured containers

## Previous/Next Navigation

At the bottom of every artifact page:
- "Previous" and "Next" buttons navigating to adjacent artifacts in the lesson
- Artifact position indicator: "Artifact X of Y"
- The Curriculum Dependency Agent (A2) also provides "show next" and "show previous" guidance

## Study Tools

The workspace provides:
- Bookmark button (star icon)
- Reading progress dropdown
- Highlight tools (per-paragraph color picker)
- Notes panel with auto-save
- Tags collection
- Study queue integration

## Related Chapters

- [Learning Experience](#06-learning-experience)
- [Personalization System](#22-personalization-system)
- [Study Sessions](#23-study-sessions)
- [UI Design Language](#24-ui-design-language)

---

# 08 — Search System

# Search System

## Overview

The curriculum search system (`curriculum-search.js`) provides a global search interface implemented as a modal dialog. It indexes all curriculum entities (paths, modules, lessons, artifacts) and provides client-side full-text search with weighted scoring, keyboard navigation, and personalization filters.

## Indexing

When the search controller initializes, it calls `buildFlatIndex()` which creates a single flat array of all searchable entities. Each entry contains:

```
{
  id, type, badgeLabel, title, summary,
  href (canonical route), breadcrumbs (hierarchy),
  searchableText (concatenated id + title + summary + type)
}
```

The flat index is rebuilt when the curriculum index loads. At current counts, this produces ~779 searchable items (19 paths + 40 modules + 120 lessons + 600 artifacts).

## Aliases

The search system maintains `SEARCH_QUERY_ALIASES`, a map that redirects common terms to more searchable equivalents:

- "linear regression" → "regression"
- "python" → "code"
- "pytorch" → "code"
- "tensorflow" → "code"
- "numpy" → "code"
- Various topic abbreviations and synonyms

## Matching Algorithm

The `performSearch()` function processes queries through:

1. **Normalization**: Lowercasing, NFD unicode normalization (accent removal), punctuation stripping
2. **Alias expansion**: Query terms are checked against alias map
3. **Field-level matching**: Each entity is scored against the searchable text
4. **Weighted scoring**:
   - Exact title match: 1000 points
   - Title includes query: 500 points
   - Summary match: 300 points
   - ID match: 200 points
   - Metadata match: 100 points
   - Bookmarked items: +150 boost
5. **Sorting**: Results sorted by score descending, capped at 100 results

## Filters

The search modal provides optional personalization filters:

- **Bookmarked** — Show only bookmarked items
- **Has notes** — Show only items with personal notes
- **Recently visited** — Show only recently visited items
- **In collection** — Show only items in a study collection

These filters interact with `window.NeuralVerse.PersonalizationService` to restrict results.

## Result Rendering

Each search result is rendered as an `<a role="option">` element containing:

- **Title** with `<mark>` highlighting around matching terms
- **Type badge** (color-coded: path=cyan, module=blue, lesson=amber, artifact=green)
- **Breadcrumb** lineage (e.g., "Path > Module > Lesson")
- **Summary** with highlighting
- **Match info badges** indicating which fields matched (title / summary / id / metadata)
- **"View in Graph" button** linking to `#/knowledge-graph?mode=...&focus=...`

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl+K` or `Cmd+K` | Open search modal |
| `Escape` | Close search modal |
| `Arrow Up/Down` | Navigate results |
| `Home/End` | Jump to first/last result |
| `Enter` | Open selected result |
| `Ctrl+Enter` | Open selected result in new tab |

## Modal Behavior

The search modal is a `<dialog>` element. Opening it:

- Sets focus to the search input
- Pre-fetches the curriculum index if not already loaded
- Shows an empty state with suggestion chips (common topics like "transformer", "convolution", "attention", "backpropagation", "reinforcement learning", "GAN", "BERT")

Typing debounces at 250ms before executing the search. Results appear below the input. Clicking the backdrop or pressing Escape closes the modal. On close, focus returns to the trigger button.

## Integration with Curriculum

The search system reads from the same `window.NeuralVerse.curriculumIndex` as the curriculum controller. It shares the `curriculum-service.js` data layer. Search results navigate to the same canonical hash routes used by the curriculum system.

## Related Chapters

- [Curriculum Architecture](#05-curriculum-architecture)
- [Learning Experience](#06-learning-experience)
- [Accessibility](#25-accessibility)

---

# 09 — Retrieval System

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

- [Atlas System](#10-atlas-system)
- [Workspace Architecture](#07-workspace-architecture)
- [Known Limitations](#30-known-limitations)

---

# 10 — Atlas System

# Atlas System

## Overview

The Atlas (knowledge graph) provides visual exploration of the curriculum structure through a force-directed graph. It is accessed via `#/knowledge-graph` and renders the curriculum hierarchy as an interactive network visualization.

## Architecture

The knowledge graph subsystem (`website/scripts/knowledge-graph/`) is divided into four modules:

| Module | Purpose |
|--------|---------|
| `controller.js` | Orchestrates layout, renderer, and model; handles user interaction |
| `layout.js` | Force-directed graph layout algorithm |
| `model.js` | Data layer — loads curriculum entities as graph nodes |
| `renderer.js` | Canvas/WebGL rendering of nodes, edges, labels |

## Staged Navigation

The atlas supports progressive focus levels:

1. **Overview** — All curriculum entities displayed as a network
2. **Path focus** — Zoom to a single Learning Path and its modules
3. **Module focus** — Zoom to a module and its lessons
4. **Lesson focus** — Zoom to a lesson and its artifacts
5. **Artifact focus** — Zoom to a single artifact and its dependencies

The graph updates dynamically as the user selects entities from the inspector or navigates the hash route.

## Inspector

A right-side inspector panel (`NvInspectorPanel`, React component or vanilla equivalent) shows details of the selected entity:

- Title, type, and lifecycle status
- Description
- Connected entities (parent/child/sibling)
- Links to open in curriculum view
- Dependency metadata

## Graph Philosophy

The atlas graph is **informational and not mutable**. Key principles:

- The graph visualizes the curriculum hierarchy as defined in the canonical index
- Nodes cannot be added, removed, or repositioned persistently (layout is ephemeral per session)
- The topology reflects the immutable curriculum structure
- Visual layout is computed client-side using force-directed algorithms
- Filtering and focus are viewing operations only

## Graph Features

- **Force-directed layout** with configurable iterations
- **Canvas rendering** for performance
- **Node selection** and highlighting
- **Edge rendering** showing parent-child and dependency relationships
- **Zoom and pan** controls
- **Filter by entity type** (path / module / lesson / artifact)
- **Search integration** — "View in Graph" links from search results
- **Route synchronization** — Navigating the graph updates the hash route

## Integration Points

- Reads curriculum data from `window.NeuralVerse.curriculumIndex`
- Shares entity IDs with the curriculum controller
- Search results can open specific graph views
- Cross-linked from artifact pages for dependency visualization

## Related Chapters

- [Curriculum Architecture](#05-curriculum-architecture)
- [Retrieval System](#09-retrieval-system)
- [Navigation and Routing](#04-navigation-and-routing)

---

# 11 — Didactic Agent Runtime

# Didactic Agent Runtime

## Architectural Overview

The didactic agent runtime is a deterministic, browser-based system that provides educational guidance through 10 specialized agents (A1-A10). It operates without external API calls, LLM integration, or backend services.

```
┌──────────────────────────────────────────────────────────┐
│                   Agent Panel Controller                  │
│            (UI shell: selector, input, output)            │
└──────────────────────┬───────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────┐
│                  Didactic Orchestrator                     │
│  (intent routing, agent selection, guardrail enforcement)  │
└──┬────────────┬──────────────┬───────────────────────────┘
   │            │              │
┌──▼───┐  ┌─────▼────────┐  ┌─▼──────────────┐
│Agent  │  │   Context    │  │   Guardrails    │
│Registry│  │   Builder    │  │  (9 rules)      │
└──┬───┘  └─────┬────────┘  └───┬────────────┘
   │            │               │
┌──▼────────────▼───────────────▼─────────────────────────┐
│             10 Agent Contracts + 10 Real Agents          │
│    (canHandle, run, formatResponse — deterministic)      │
│    ┌──────┐ ┌──────┐ ┌──────┐           ┌──────┐       │
│    │  A1  │ │  A2  │ │  A3  │    ...    │ A10  │       │
│    └──────┘ └──────┘ └──────┘           └──────┘       │
│    Supporting Engines: Analogy, Comparison, Socratic,    │
│    Misconception Library                                 │
└──────────────────────────────────────────────────────────┘
```

## Pipeline

The complete request pipeline:

1. **User submits query** via panel textarea or quick action button
2. **Panel Controller** calls orchestrator with query and context
3. **Context Builder** reads current frontend state: URL hash, route, curriculum selection, personalization data, learning depth
4. **Guardrails** scan query for forbidden patterns: curriculum mutation, mastery claims, external API calls, XSS
5. **Agent Selection**: orchestrator iterates all agents calling `canHandle(context)` — keyword-based matching
6. **Execution**: selected agent's `run()` produces a structured result
7. **Formatting**: result is normalized into a standard response with typed sections
8. **Logging**: invocation is recorded in history (both orchestrator and guardrails logs)
9. **Rendering**: panel controller displays the response

## Registry

`agent-registry.js` maintains a `Map<string, AgentDefinition>` with deep-frozen entries. Each agent definition includes:

- `id`, `name`, `role`, `category`, `description`
- `supportedModes`, `capabilities`
- `forbiddenActions` (5-6 per agent)
- `status` (all 10 are `operational`)
- `registeredAt` timestamp

Retrieval returns deep-cloned copies to prevent mutation.

## Orchestrator

`didactic-orchestrator.js` is the central coordination hub. Responsibilities:

- `orchestrate(query, options)` — Full pipeline: context → guardrail → agent selection → execution → formatting
- `invokeAgent(agentId, query, options)` — Direct invocation of a specific agent
- `registerRealAgent(id, implementation)` — Register an operational agent implementation
- `selectEligibleAgents(context)` — Match agents via `canHandle()`
- `findBestAgentForQuery(query)` — Fallback scoring by keyword density

## Contracts

`agent-contracts.js` defines the interface each agent must implement:

- `canHandle(context)` → boolean
- `buildPrompt(context, options)` → string
- `run(context, options)` → `AgentResult`
- `formatResponse(result)` → `AgentResponse`

Scaffolded contracts provide fallback behavior for agents without full implementations. All 10 agents are promoted to operational status with real implementations.

## Context Builder

`agent-context-builder.js` produces a structured context object:

```
{
  currentRoute, routeParams,
  selectedPath, selectedModule,
  selectedLesson, selectedArtifact,
  artifactType, canonicalStatus,
  instructionalObjectives, learningDepth,
  userNotes, userBookmarks,
  studySession, recentlyVisited,
  timestamp, summary
}
```

All curriculum lookups are read-only reads from `window.NeuralVerse.curriculumIndex`. Personalization data comes from `window.NeuralVerse.PersonalizationService`.

## Guardrails

`agent-guardrails.js` enforces 9 rules:

| Rule ID | Severity | Detection |
|---------|----------|-----------|
| `no-curriculum-mutation` | Critical | Mutation keywords + entity names |
| `no-lifecycle-modification` | Critical | Lifecycle status change keywords |
| `no-mastery-claims` | Critical | Score/grade/mastery/certification terms |
| `no-id-mutation` | Critical | ID modification keywords |
| `no-evidence-boundary-bypass` | Critical | Evidence boundary bypass language |
| `no-external-api-calls` | Critical | External API/LLM invocation patterns |
| `no-hidden-recommendations` | High | Hidden recommendation language |
| `no-sensitive-data-persistence` | High | Sensitive data storage requests |
| `no-agent-escalation` | Critical | Contract modification or agent spawning |

Violations return a `governed-refusal` response with rule ID, severity, and refusal message. All violations are logged.

## Panel Controller

`agent-panel-controller.js` manages the Agent Assist panel UI:

- Agent selector dropdown (populated from registry)
- Quick action buttons (90 predefined prompts across 9 categories)
- Query textarea with Submit button
- Response display with structured section rendering
- 12 section types: comparison-table, socratic-questions, visual-card, timeline, code-block, execution-flow, lab-card, research-card, confidence-card, engineering-card, reinforcement-card, narrative-card, knowledge-card, curiosity-card
- Response action buttons: copy, regenerate, simplify, deepen
- Invocation history panel (persisted in localStorage)
- Guardrail notice display (red banner for blocked requests)

## Response Pipeline

After execution, responses are rendered as structured sections (each with collapsible toggles) or formatted Markdown. Section types control visual presentation:

- Tables for comparisons
- Numbered lists for socratic questions
- Gradient cards for different domain responses
- Code blocks with syntax labels
- Flow steps with arrow connectors

## Security

The runtime enforces:

- No curriculum mutation (architectural + guardrail)
- No external API calls (architectural + guardrail)
- No autonomous background agents
- No LLM integration
- XSS pattern detection in queries
- Input sanitization

## Governance

Every agent response includes relevant security disclaimers:
- "No curriculum modifications"
- "No grades, scoring, competency evaluations"
- "Canonical curriculum files remain unmodified"
- "No live search, fabricated citations, or curriculum mutations"

## Supporting Engines

Four pedagogical engines support A1 (Didactic Architecture):

- **Analogy Engine**: 14 topics with 3 analogies each, domain-mapped
- **Comparison Engine**: 10 known comparisons with 9 aspects each
- **Misconception Library**: 12 documented misconceptions with structured profiles
- **Socratic Engine**: 6 question layers, 10 topic-specific question sets

## Related Chapters

- [Agent A1: Didactic Architecture](#12-agent-a1-didactic-architecture)
- [Agent A2: Curriculum & Dependency](#13-agent-a2-curriculum--dependency)
- [Security Model](#26-security-model)
- [Governance Model](#27-governance-model)

---

# 12 — Agent A1: Didactic Architecture

# Agent A1: Didactic Architecture

## Purpose

Provides structured pedagogical guidance using multiple teaching strategies. Acts as the primary learning assistant, helping users understand concepts through explanation, simplification, deepening, analogy, comparison, and socratic dialogue.

## Educational Role

Primary teaching agent. A1 is the default agent for general learning queries. It activates when no other agent matches the query more specifically.

## Supported Modes

12 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `simplify` | "simplify", "explain simply", "eli5" | Simplified explanation with everyday analogy |
| `deepen` | "deepen", "explain deeply", "detail" | Technical deep-dive with formal definitions |
| `compare` | "compare", "vs", "difference between" | Structured comparison using Comparison Engine |
| `analogy` | "analogy", "like" | Analogy generation from Analogy Engine |
| `misconception` | "misconception", "mistake", "wrong" | Common misconception detection from library |
| `summarize` | "summarize", "summary", "overview" | Concise summary of selected content |
| `connect` | "connect", "related", "relationship" | Cross-concept connection mapping |
| `socratic` | "socratic", "question", "reflect" | Socratic questioning from Socratic Engine |
| `reflection` | "reflect", "review", "solidify" | Reflective learning prompts |
| `transfer` | "apply", "real world", "practical" | Real-world application guidance |
| `reading` | "reading", "navigate", "position" | Reading guidance for current artifact |
| `explain` | (default) | General explanation |

## Intent Routing

A1 uses keyword pattern matching against `INTENT_PATTERNS` map to detect the user's intent from their query text. Default intent is `explain`.

## Response Structure

Responses are structured as typed sections. The A1 response types include:

- Comparison tables (from Comparison Engine)
- Socratic question lists (from Socratic Engine)
- Analogy cards (from Analogy Engine)
- Misconception profiles (from Misconception Library)
- Explanation blocks (generated from context + mode)

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms
- Refuses requests to modify or create curriculum content
- All educational content is generated from curated data and deterministic rules

## Integration Points

- **Comparison Engine**: Used for `compare` mode
- **Analogy Engine**: Used for `analogy` mode
- **Misconception Library**: Used for `misconception` mode
- **Socratic Engine**: Used for `socratic` mode
- **Context Builder**: Reads current curriculum position and learning depth
- **Curriculum Service**: Reads artifact content for explanation

## UI Behavior

When A1 is selected in the agent panel:
- Quick action buttons show: explain simply, explain deeply, give analogy, compare, find misconceptions, socratic mode, reflection prompts, connect concepts, summarize
- An explanation mode selector appears (simplify / deepen / analogical / comparative / socratic)
- Responses use formatted cards, tables, and lists

## Examples of Use

- "Explain the attention mechanism in transformers" → Deepen mode with technical explanation
- "What is the difference between CNN and Transformer?" → Compare mode with comparison table
- "Explain overfitting like I'm five" → Simplify mode with everyday analogy
- "What are common misconceptions about gradient descent?" → Misconception mode

## Limitations

- Explanations are limited to the scope of the curriculum content
- Cannot provide real-time or external information
- Analogy engine covers 14 topics; other topics receive generic fallback
- Comparison engine covers 10 known comparisons; unknown pairs use generic comparison

## Related Chapters

- [Didactic Agent Runtime](#11-didactic-agent-runtime)
- [Governance Model](#27-governance-model)
- [Learning Experience](#06-learning-experience)

---

# 13 — Agent A2: Curriculum & Dependency

# Agent A2: Curriculum & Dependency

## Purpose

Provides curriculum intelligence: prerequisite analysis, dependency traversal, navigation recommendations, and structural awareness of the learning path hierarchy.

## Educational Role

Curriculum navigator. A2 helps users understand their position in the curriculum, what they need to know before proceeding, what comes next, and how concepts connect.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `dependency` | "prerequisite", "dependency", "need to know" | Prerequisite analysis for selected content |
| `next` | "next", "what's next", "continue" | Next recommended artifact/module recommendation |
| `previous` | "previous", "before", "preceding" | Previous/background content recommendation |
| `skip` | "skip", "can I skip", "optional" | Skip impact analysis |
| `summary` | "summary", "curriculum", "overview" | Full curriculum position summary |
| `context` | "context", "position", "where am i" | Current position in curriculum hierarchy |
| `route` | "route", "path", "learning route" | Learning route generation through curriculum |
| `neighbor` | "neighbor", "related", "adjacent" | Neighboring module/lesson discovery |
| `crosslink` | "cross-link", "cross", "also see" | Cross-link explanation between artifacts |
| `hierarchy` | "hierarchy", "parent", "tree" | Parent-child-sibling hierarchy visualization |

## Intent Routing

A2 loads `data/curriculum-index.json` at initialization and builds lookup maps: `pathsById`, `modulesById`, `lessonsById`, `artifactsById`, plus cross-reference maps for parent-child relationships and sibling discovery.

`resolveCurrentPosition(context)` maps the URL hash context to actual curriculum entities.

## Response Structure

Responses include:
- Curriculum position indicators (breadcrumb-like hierarchy)
- Dependency chains with entity references and links
- Skip impact assessments (textual analysis)
- Route maps as ordered lists with artifacts
- Cross-link cards with descriptions and routes

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms, write-canonical-curriculum-files
- Read-only access to curriculum index
- Does not modify or suggest modifications to curriculum structure

## Integration Points

- **Curriculum Service**: Primary data source (curriculum-index.json)
- **Context Builder**: Receives current selection context
- **Curriculum Controller**: Shares entity ID space and route patterns
- **Search System**: Cross-link generation uses same route resolution

## UI Behavior

When A2 is selected:
- Quick actions show: show prerequisites, show next, explain position, dependency chain, can I skip, curriculum summary, learning route, related concepts, parent hierarchy, neighbor lessons
- Responses are rendered with curriculum-style cards and breadcrumb displays

## Examples of Use

- "What are the prerequisites for attention mechanism?" → Dependency mode with chain
- "What should I study next?" → Next mode with recommendation
- "Can I skip regularization?" → Skip impact analysis
- "Where am I in the curriculum?" → Context mode with position display

## Limitations

- Cannot modify curriculum structure or suggest new paths
- Dependency analysis is based on declared prerequisites, not inferred knowledge gaps
- Limited to content within the existing curriculum index

## Related Chapters

- [Didactic Agent Runtime](#11-didactic-agent-runtime)
- [Curriculum Architecture](#05-curriculum-architecture)
- [Navigation and Routing](#04-navigation-and-routing)

---

# 14 — Agent A3: Visual & Interactive Media

# Agent A3: Visual & Interactive Media

## Purpose

Provides guidance on visualizations, diagrams, interactive media, and graphical representations of concepts. Helps users understand which visual tools are available and how to interpret them.

## Educational Role

Visual learning assistant. A3 directs users to appropriate visualizations, explains visual concepts, and provides intuition through media.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `visual_intuition` | "visualize", "intuition", "see" | Visual intuition explanation |
| `diagram` | "diagram", "chart", "plot" | Diagram description and interpretation |
| `interactive_spec` | "interactive", "play", "explore" | Interactive visualization specification |
| `comparison` | "compare visually", "visual diff" | Visual comparison guidance |
| `animation` | "animation", "animate", "process" | Process animation description |
| `timeline` | "timeline", "history", "evolution" | Historical timeline of concept |
| `mathematical` | "formula", "equation", "plot" | Mathematical visualization guidance |
| `illustration` | "illustrate", "draw", "sketch" | Conceptual illustration description |
| `atlas` | "atlas", "graph", "map" | Atlas graph navigation guidance |
| `media_selection` | (default) | Best visualization medium recommendation |

## Intent Routing

Pattern matching against visualization-related keywords in the user query. Falls back to `media_selection` for ambiguous requests.

## Response Structure

Responses include:
- Visualization descriptions and step-by-step interpretation guides
- Interactive specification notices (clarifying that actual visualizations are in the curriculum)
- Comparison guidance with visual elements described textually
- Timeline representations

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms
- Cannot create new visualizations or modify existing ones
- Visual descriptions are textual; actual interactive visualizations must be accessed through the curriculum

## Integration Points

- **Visualization Registry**: References registered visualizations for the current artifact
- **Curriculum Service**: Reads artifact content for visualization context
- **Curriculum Controller**: Shares visualization ID space

## UI Behavior

When A3 is selected:
- Quick actions show 10 visualization-related prompts
- Responses may include visual-card section types
- References artifact-specific visualizations when available

## Examples of Use

- "What does attention look like?" → Visual intuition with diagram description
- "Is there an interactive visualization for backpropagation?" → Interactive spec notice
- "Show me the evolution of object detection" → Timeline mode

## Limitations

- Cannot render or create actual visualizations
- Interactive visualization artifacts require registry entry; otherwise shows specification only
- All descriptions are textual

## Related Chapters

- [Didactic Agent Runtime](#11-didactic-agent-runtime)
- [Atlas System](#10-atlas-system)
- [Learning Experience](#06-learning-experience)

---

# 15 — Agent A4: Code, Simulation & Laboratory

# Agent A4: Code, Simulation & Laboratory

## Purpose

Provides guidance on code examples, algorithms, simulations, and practical implementation. Supports learning through code comprehension and experiment design.

## Educational Role

Code and laboratory mentor. A4 helps users understand implementations, run mental simulations, and design learning experiments.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `code_example` | "code", "example", "implementation" | Code example with explanation |
| `step_execution` | "step", "execute", "trace" | Step-by-step execution trace |
| `algorithm` | "algorithm", "pseudocode", "procedure" | Algorithm description and pseudocode |
| `mini_lab` | "lab", "experiment", "try" | Mini laboratory/experiment suggestion |
| `simulation` | "simulate", "simulation", "what if" | Conceptual simulation description |
| `debugging` | "debug", "error", "fix" | Debugging guidance for common errors |
| `complexity` | "complexity", "big O", "efficiency" | Computational complexity analysis |
| `pipeline` | "pipeline", "workflow", "pipeline" | Processing pipeline description |
| `parameter_explorer` | "parameter", "hyperparameter", "tune" | Hyperparameter understanding guidance |
| `experiment` | (default) | Experiment design guidance |

## Intent Routing

Pattern matching against code/lab-related keywords. Falls back to `experiment` for general lab queries.

## Response Structure

Responses include:
- Code blocks with syntax labels and explanations
- Step-by-step execution flows
- Pseudocode algorithms
- Lab experiment descriptions with expected observations
- Complexity analysis with Big O notation

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms
- Code examples are illustrative and not executable
- Cannot run, compile, or execute actual code

## Integration Points

- **Context Builder**: Receives artifact type to detect code-intense content
- **Curriculum Service**: Reads code artifact content

## UI Behavior

When A4 is selected:
- Quick actions show: code example, step execution, algorithm explanation, mini lab, simulation, debugging, complexity, pipeline, parameter explorer, experiment
- Responses use code-block and execution-flow section types

## Examples of Use

- "Show me a PyTorch implementation of self-attention" → Code example with explanation
- "Trace the forward pass of a CNN" → Step execution
- "What's the time complexity of attention?" → Complexity analysis
- "Design a mini lab for overfitting" → Mini lab description

## Limitations

- No code execution environment — all examples are static text
- No actual compilation, testing, or debugging capabilities
- Code examples are from curriculum content and curated data

## Related Chapters

- [Didactic Agent Runtime](#11-didactic-agent-runtime)
- [Workspace Architecture](#07-workspace-architecture)
- [Security Model](#26-security-model)

---

# 16 — Agent A5: Research & State-of-the-Art

# Agent A5: Research & State-of-the-Art

## Purpose

Provides research mentorship: historical context, landmark papers, benchmark landscapes, research trends, and connections between curriculum content and the broader research field.

## Educational Role

Research guide. A5 helps users understand where curriculum concepts fit in the research landscape, what landmark work established them, and what current directions exist.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `historical_context` | "history", "origins", "who invented" | Historical development of a concept |
| `landmark_papers` | "landmark", "key paper", "seminal" | Key papers that established the field |
| `benchmark_landscape` | "benchmark", "SOTA", "state of art" | Benchmark and evaluation landscape |
| `research_trends` | "trend", "current", "recent" | Current research directions |
| `open_problems` | "open problem", "challenge", "unsolved" | Open challenges in the field |
| `method_comparison` | "compare methods", "approach" | Comparison of different research approaches |
| `reading_roadmap` | "reading list", "roadmap", "what to read" | Curated reading roadmap |
| `frontier_topics` | "frontier", "cutting edge", "emerging" | Frontier/emerging research topics |
| `evidence_confidence` | "confidence", "evidence", "reliable" | Evidence confidence assessment |
| `curriculum_bridge` | (default) | Bridge between curriculum and research |

## Intent Routing

Pattern matching against research-related keywords. Uses `resolveDomain()` to map queries to 7 curated domains: `machine-learning`, `deep-learning`, `computer-vision`, `llms`, `rag`, `agents`, `mlops`.

## Response Structure

Responses use a `CURATED_RESEARCH_MAP` with domain-keyed data. Each response includes:
- Research context with historical progression
- Key paper references (descriptive, not linked)
- Trend analysis
- Confidence indicators
- Curriculum bridge connections

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms
- No live search or external paper database access
- Research information is curated and static — may not reflect latest developments
- All responses include disclaimer: "No live search, fabricated citations, benchmark scores, or curriculum mutations"

## Integration Points

- **Context Builder**: Reads current curriculum position for curriculum bridge mode
- **Domain resolution**: Shared pattern across A5-A10 agents
- **Response cache**: In-memory Map for deduplication within session

## UI Behavior

When A5 is selected:
- Quick actions show 10 research prompts
- Responses use research-card section types with confidence indicators
- Domain badges in responses

## Examples of Use

- "Tell me about the history of transformers" → Historical context with paper timeline
- "What are the key papers in object detection?" → Landmark papers mode
- "What are open problems in reinforcement learning?" → Open problems mode
- "What should I read after understanding attention?" → Reading roadmap mode

## Limitations

- Research data is static and curated, not live
- Does not access external paper databases or preprint servers
- Benchmark and SOTA claims may be outdated
- Citations are illustrative, not verified against external sources

## Related Chapters

- [Didactic Agent Runtime](#11-didactic-agent-runtime)
- [Retrieval System](#09-retrieval-system)
- [Known Limitations](#30-known-limitations)

---

# 17 — Agent A6: Application & Professional Transfer

# Agent A6: Application & Professional Transfer

## Purpose

Provides guidance on real-world applications, production architectures, engineering trade-offs, MLOps perspectives, and career context for AI concepts.

## Educational Role

Engineering and professional mentor. A6 bridges the gap between theoretical understanding and practical application in production environments.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `real_world_applications` | "application", "real world", "use case" | Real-world application examples |
| `production_architecture` | "production", "deploy", "architecture" | Production system architecture guidance |
| `engineering_trade_offs` | "trade-off", "pros and cons" | Engineering trade-off analysis |
| `mlops_perspective` | "MLOps", "pipeline", "deployment" | MLOps/DevOps perspective |
| `decision_framework` | "decision", "choose", "select" | Decision framework for choosing approaches |
| `failure_modes` | "fail", "pitfall", "gotcha" | Common failure modes in production |
| `scaling_strategy` | "scale", "scalability", "large" | Scaling strategies for production systems |
| `industry_case_study` | "case study", "industry", "company" | Industry case study description |
| `career_context` | "career", "role", "skill" | Career and role context for skills |
| `design_review` | (default) | Design review guidance |

## Intent Routing

Pattern matching against application/engineering keywords. Uses domain resolution for context-appropriate responses.

## Response Structure

Responses use a `CURATED_TRANSFER_MAP` with domain-keyed data covering the same 7 domains as A5. Each response includes:
- Production considerations
- Architecture descriptions
- Trade-off analyses
- Failure mode warnings

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms
- No proprietary metrics or live cloud connections
- Production advice is general and not specific to any organization
- All responses include disclaimer: "No proprietary metrics, live cloud connection, or curriculum modifications"

## Integration Points

- **Context Builder**: Receives curriculum position for contextual application examples
- **Domain resolution**: Shared pattern across A5-A10

## UI Behavior

When A6 is selected:
- Quick actions show 10 professional transfer prompts
- Responses use engineering-card section types
- Trade-off analyses use comparison-table format

## Examples of Use

- "How is BERT used in production?" → Real-world applications with architecture
- "What are the trade-offs between batch and real-time inference?" → Engineering trade-offs
- "What MLOps practices matter for LLM deployment?" → MLOps perspective
- "How does Netflix use recommendation systems?" → Industry case study

## Limitations

- Production advice is general and not organization-specific
- No access to live infrastructure, metrics, or deployment tools
- Case studies are illustrative and may not reflect current industry practices

## Related Chapters

- [Didactic Agent Runtime](#11-didactic-agent-runtime)
- [Curriculum Architecture](#05-curriculum-architecture)
- [Governance Model](#27-governance-model)

---

# 18 — Agent A7: Assessment & Reinforcement

# Agent A7: Assessment & Reinforcement

## Purpose

Provides formative learning support: practice questions, flashcards, retrieval practice prompts, self-assessment tools, and reinforcement planning. Supports learning without claiming mastery or assigning grades.

## Educational Role

Formative learning coach. A7 helps users reinforce their understanding through structured practice and self-assessment — but does not evaluate, score, or certify competence.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `practice_questions` | "practice", "question", "quiz" | Practice questions with answers |
| `flashcards` | "flashcard", "card", "review" | Flashcard-style Q&A pairs |
| `retrieval_practice` | "retrieval practice", "recall" | Retrieval practice prompts |
| `self_assessment` | "self-assessment", "check", "test myself" | Self-assessment checklists |
| `mini_challenges` | "challenge", "problem", "solve" | Mini challenge problems |
| `reinforcement_plan` | "reinforce", "strengthen", "review plan" | Reinforcement learning plan |
| `misconception_check` | "check", "misconception", "verify" | Misconception self-check |
| `reflection_journal` | "reflect", "journal", "write" | Reflection journal prompts |
| `concept_connections` | "connect", "relate", "diagram" | Concept connection mapping exercise |
| `review_session` | (default) | Guided review session |

## Intent Routing

Pattern matching against assessment/practice keywords. Domain resolution for topic-specific questions.

## Response Structure

Responses use a `CURATED_ASSESSMENT_MAP` with domain-keyed data. Each response includes:
- Practice questions with suggested answers (not scored)
- Flashcards with concept-definition pairs
- Self-assessment checklists with "I understand" / "I need to review" prompts
- Challenge problems with expected approach descriptions
- Reinforcement plans as ordered lists

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, create-grades, certify-competence, invoke-external-llms
- Does not assign scores, grades, percentages, or competency levels
- Questions are for self-assessment only
- All responses include disclaimer: "No grades, scoring, competency evaluations, or curriculum alterations"
- Uses governance-safe negation ("does not assign a score")

## Integration Points

- **Context Builder**: Reads current artifact and lesson for contextual questions
- **Domain resolution**: Shared across A5-A10

## UI Behavior

When A7 is selected:
- Quick actions show 10 assessment/ reinforcement prompts
- Responses use reinforcement-card section types
- Flashcards rendered as Q&A pairs
- Self-assessment items use checklist-style rendering

## Examples of Use

- "Give me practice questions on attention mechanisms" → Practice questions with answers
- "Create flashcards for transformer architecture" → Flashcard generation
- "Help me check my understanding of backpropagation" → Self-assessment checklist
- "What are common mistakes in implementing CNN?" → Misconception check

## Limitations

- Cannot score or evaluate responses
- Practice questions are from curated data, not dynamically generated
- No adaptive difficulty or personalized question selection
- Cannot certify or validate understanding

## Related Chapters

- [Didactic Agent Runtime](#11-didactic-agent-runtime)
- [Governance Model](#27-governance-model)
- [Study Sessions](#23-study-sessions)

---

# 19 — Agent A8: Obsidian & Knowledge Governance

# Agent A8: Obsidian & Knowledge Governance

## Purpose

Provides knowledge management guidance: note-taking strategies, organization recommendations, tag suggestions, collection management, and knowledge review planning.

## Educational Role

Knowledge architect. A8 helps users build and maintain their personal knowledge base extracted from the curriculum.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `permanent_note` | "note", "write note", "summary" | Permanent note template and guidance |
| `backlink_recommendation` | "backlink", "connect", "link" | Backlink/reference recommendations |
| `tag_recommendation` | "tag", "label", "categorize" | Tag recommendations for content |
| `collection_organization` | "collection", "organize", "group" | Collection organization suggestions |
| `concept_map` | "concept map", "mind map", "graph" | Concept map structure suggestions |
| `knowledge_gap` | "gap", "missing", "review" | Knowledge gap identification |
| `note_refinement` | "refine", "improve note", "enhance" | Note refinement suggestions |
| `atomic_splitting` | "split", "atomic", "break down" | Note atomic decomposition guidance |
| `knowledge_review` | "review", "spaced repetition" | Knowledge review scheduling |
| `obsidian_strategy` | (default) | Overall knowledge management strategy |

## Intent Routing

Pattern matching against knowledge management keywords. Domain resolution for context-appropriate recommendations.

## Response Structure

Responses use a `CURATED_KNOWLEDGE_MAP` with domain-keyed data. Each response includes:
- Note templates with structured sections
- Tag recommendations with category groupings
- Collection organization suggestions
- Knowledge gap analysis with curriculum references
- Review schedules

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms, modify-governance-policies
- Cannot modify governance policies or curriculum structure
- Note suggestions are advisory; notes are stored locally
- All responses include disclaimer: "Canonical curriculum files remain unmodified"

## Integration Points

- **Personalization Service**: Reads existing notes, tags, and collections for context
- **Context Builder**: Receives current content for note-specific recommendations
- **Curriculum Service**: Reads artifact metadata for knowledge organization

## UI Behavior

When A8 is selected:
- Quick actions show 10 knowledge management prompts
- Responses use knowledge-card section types
- Tag recommendations shown as badge lists
- Note templates shown as structured outlines

## Examples of Use

- "Help me write a note on transformer architecture" → Permanent note template
- "What tags should I use for attention-related content?" → Tag recommendations
- "How should I organize my deep learning notes?" → Collection organization
- "What am I missing in my understanding of RNNs?" → Knowledge gap analysis

## Limitations

- Cannot modify or organize existing notes directly
- Tag and collection suggestions are advisory
- Knowledge gap analysis is based on curriculum structure, not actual user knowledge
- No integration with external note-taking tools

## Related Chapters

- [Didactic Agent Runtime](#11-didactic-agent-runtime)
- [Personalization System](#22-personalization-system)
- [Governance Model](#27-governance-model)

---

# 20 — Agent A9: Storytelling & Learning Journey

# Agent A9: Storytelling & Learning Journey

## Purpose

Provides narrative context for learning: origin stories, journey mapping, concept timelines, problem-driven narratives, and human perspectives that make technical content more engaging.

## Educational Role

Learning journey companion. A9 frames technical content within relatable narratives, helping users understand the human context and problem-driven evolution of AI concepts.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `origin_story` | "origin", "how it started", "born" | Origin story of a concept or field |
| `learning_journey` | "journey", "path", "learning path" | Learning journey narrative |
| `concept_timeline` | "timeline", "evolution", "history" | Concept evolution timeline |
| `problem_driven` | "problem", "why was it created" | Problem-driven origin narrative |
| `human_perspective` | "person", "researcher", "who" | Human perspective on discovery |
| `cross_lesson` | "connect lessons", "bridge" | Cross-lesson narrative connection |
| `mental_model` | "mental model", "think about" | Mental model for understanding |
| `scientific_journey` | "science", "discovery", "breakthrough" | Scientific discovery journey |
| `motivation_relevance` | "why learn", "relevance", "important" | Motivation and relevance framing |
| `personalized_orientation` | (default) | Personalized orientation narrative |

## Intent Routing

Pattern matching against narrative/storytelling keywords. Domain resolution for topic-specific narratives.

## Response Structure

Responses use a `CURATED_NARRATIVE_MAP` with domain-keyed data. Each response includes:
- Narrative story with contextual framing
- Timeline of key developments
- Key researchers and their contributions (descriptive)
- Connection to current curriculum content

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms, generate-fabricated-content
- **Fabrication guardrails**: Scans for requests to invent history, quotes, or anecdotes; returns governed refusal if detected
- Narratives are based on curated data, not generative storytelling
- All responses include disclaimer: "Curriculum files remain unmodified"

## Integration Points

- **Context Builder**: Reads current position for contextual narratives
- **Curriculum Service**: Provides content for narrative framing
- **Fabrication detection**: Built-in patterns for refusal of invented content

## UI Behavior

When A9 is selected:
- Quick actions show 10 narrative/ story prompts
- Responses use narrative-card section types
- Timelines rendered as vertical timeline lists

## Examples of Use

- "Tell me the story of how deep learning started" → Origin story with timeline
- "Why was the attention mechanism invented?" → Problem-driven narrative
- "Create a learning journey for computer vision" → Learning journey narrative
- "What mental model should I use for understanding transformers?" → Mental model

## Limitations

- Stories are based on curated facts, not generative storytelling
- Cannot invent new narratives or historical events
- Fabrication guardrails may block creative requests
- Human perspectives are descriptive, not authoritative

## Related Chapters

- [Didactic Agent Runtime](#11-didactic-agent-runtime)
- [Learning Experience](#06-learning-experience)
- [Security Model](#26-security-model)

---

# 21 — Agent A10: Curiosity & Engagement

# Agent A10: Curiosity & Engagement

## Purpose

Provides curiosity-driven exploration: surprising facts, unexpected connections, historical anecdotes, thought experiments, and interdisciplinary bridges that spark interest and engagement.

## Educational Role

Curiosity engine. A10 is designed to make learning enjoyable by revealing the unexpected, counterintuitive, and fascinating aspects of AI concepts.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `did_you_know` | "did you know", "fact", "surprising" | Surprising facts about the topic |
| `surprising_connection` | "connection", "linked to", "unexpected" | Unexpected interdisciplinary connections |
| `historical_anecdote` | "anecdote", "story", "interesting" | Historical anecdotes |
| `thought_experiment` | "thought experiment", "imagine", "what if" | Thought experiment prompts |
| `everyday_analogy` | "everyday", "real life example" | Everyday life analogies |
| `counterintuitive_insight` | "counterintuitive", "surprising", "unexpected" | Counterintuitive insights |
| `interdisciplinary_bridge` | "interdisciplinary", "across", "other field" | Bridges to other disciplines |
| `frontier_curiosity` | "frontier", "future", "emerging" | Frontiers of current knowledge |
| `why_field_changed` | "changed", "shift", "paradigm" | Paradigm shifts in the field |
| `explore_next` | (default) | Next curiosity exploration suggestion |

## Intent Routing

Pattern matching against curiosity/exploration keywords. Domain resolution for topic-specific exploration.

## Response Structure

Responses use a `CURATED_CURIOSITY_MAP` with domain-keyed data. Each response includes:
- Interesting facts with context
- Connection explanations
- Thought experiment scenarios
- Analogy descriptions

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms, generate-fabricated-content
- **Fabrication guardrails**: Scans for requests to invent facts or anecdotes; returns governed refusal if detected
- All content is from curated data, not generative
- All responses include disclaimer: "Curriculum files remain unmodified"

## Integration Points

- **Context Builder**: Reads current position for contextual curiosity prompts
- **Domain resolution**: Shared across A5-A10
- **Fabrication detection**: Same pattern as A9

## UI Behavior

When A10 is selected:
- Quick actions show 10 curiosity prompts
- Responses use curiosity-card section types
- Facts rendered as highlighted callout cards
- Thought experiments as scenario descriptions

## Examples of Use

- "Did you know something surprising about neural networks?" → Did you know mode with facts
- "How is machine learning connected to biology?" → Interdisciplinary bridge
- "What would happen if we removed all activation functions?" → Thought experiment
- "What's counterintuitive about gradient descent?" → Counterintuitive insight

## Limitations

- Curiosity content is from curated data, not generative
- Fabrication guardrails block requests for invented facts
- Limited to seeded curiosity content per domain
- Cannot dynamically discover new connections

## Related Chapters

- [Didactic Agent Runtime](#11-didactic-agent-runtime)
- [Learning Experience](#06-learning-experience)
- [Known Limitations](#30-known-limitations)

---

# 22 — Personalization System

# Personalization System

## Overview

The personalization system provides learner-specific state management entirely through client-side `localStorage`. All data persists across sessions and is private to the browser.

## Architecture

The system follows a strict Service + Controller pattern:

- **`personalization-service.js`** (571 lines) — Pure data abstraction layer. All operations go through typed methods. No DOM manipulation.
- **`personalization-controller.js`** (1770 lines) — UI orchestration layer. Creates panels, manages events, handles navigation tracking.
- Both are exposed via `window.NeuralVerse.PersonalizationService` and `window.NeuralVerse.PersonalizationController`.

## Features

### Notes
- Per-resource Markdown notes stored by resource ID
- Auto-save with 500ms debounce
- Live preview (bold, italic, code, newlines)
- Manual save and clear buttons
- Notes are tracked in active study session (`notesEdited` array)

### Bookmarks
- Resource-level bookmarks (path, module, lesson, artifact)
- Each bookmark stores: `id`, `type`, `title`, `timestamp`, `lineage`
- Deduplication by `id`
- Toggle on/off from any resource page
- Dispatches `nv:personalization_updated` event

### Tags
- Per-resource string tags
- Normalized to lowercase trimmed
- Badge display with remove button per tag
- Input field (Enter to add)

### Collections
- Named collections containing resources
- Operations: create, rename, delete, add, remove, check membership
- UI: checkbox list in metadata panel, create-new text input

### Favorites
- Toggle favorite on any resource
- Sorts: alphabetical A-Z / Z-A / newest
- Grouped by type in dashboard
- Sort preference persisted

### Study Queue
- Ordered list of resources to study
- Operations: add, remove, reorder (up/down), clear
- "Start Next" opens the first item
- Dispatches `nv:study_queue_updated`

### Reading Highlights
- Paragraph-level highlights (yellow or green)
- Toggle on/off per anchor ID
- Floating color picker appears on paragraph hover
- Active highlights have colored left border and background
- Colors: yellow (`nv-highlight--yellow`), green (`nv-highlight--green`)

### Reading Bookmarks
- Position-based bookmarks within long artifacts
- Each bookmark stores: `id`, `title`, `scrollPosition`, `type`, `timestamp`
- Click to scroll to saved position
- Tracked in active session

### Reading Progress
- Status tracking per artifact: "Not Started", "In Progress", "Completed"
- Dual persistence: personalization storage + shared `neuralverse.progress.v1`
- When marked "Completed", increments active session's `completedItemsCount`

### Reading Goals
- Daily reading goal in minutes
- Tracks `completedMinutesToday`
- Progress bar in workspace dashboard
- Auto-resets daily

### Continue Reading
- Tracks: `path`, `module`, `lesson`, `artifact` (each with `id` + `title`)
- Stores `scrollPosition` (ratio 0-1)
- Updated on navigation and scroll (debounced 500ms)
- On return, scrolls to position after 400ms delay
- Displayed as banner on workspace dashboard

### Recently Visited
- Chronological history (up to 50 entries)
- Deduplication with revisit counting
- Filterable by type in dashboard
- Filter preference persisted

## Local Persistence

All data uses `localStorage` with the prefix `nv_personalization_`:

| Key | Content |
|-----|---------|
| `nv_personalization_bookmarks` | Array of bookmark objects |
| `nv_personalization_notes` | Map of resourceId → note object |
| `nv_personalization_tags` | Map of resourceId → tag array |
| `nv_personalization_collections` | Array of collection objects |
| `nv_personalization_favorites` | Array of favorite objects |
| `nv_personalization_study_queue` | Array of queue items |
| `nv_personalization_highlights` | Array of highlight objects |
| `nv_personalization_reading_bookmarks` | Map of artifactId → bookmark array |
| `nv_personalization_reading_progress_map` | Map of artifactId → status object |
| `nv_personalization_reading_goals` | Goal configuration |
| `nv_personalization_continue_reading` | Current position object |
| `nv_personalization_recently_visited` | Array of history entries |
| `nv_personalization_active_session` | Current session state |

Secondary storage:
- `neuralverse.progress.v1` — Shared progress data
- `nv_favorites_sort` — Favorites sort preference
- `nv_history_filter` — Recently visited filter preference

## Event Communication

All mutations dispatch window custom events:

- `nv:personalization_updated` — General personalization change
- `nv:favorites_updated` — Favorites change
- `nv:study_queue_updated` — Queue change
- `nv:reading_bookmarks_updated` — Reading bookmark change
- `nv:goals_updated` — Goals change
- `nv:progressupdated` — Progress change
- `nv:study_session_*` — Session lifecycle events

## Related Chapters

- [Study Sessions](#23-study-sessions)
- [Workspace Architecture](#07-workspace-architecture)
- [Security Model](#26-security-model)

---

# 23 — Study Sessions

# Study Sessions

## Overview

Study sessions provide timed, focused learning periods with tracking of visited resources, notes taken, and items completed. Sessions are entirely client-side and use localStorage for persistence.

## Session Lifecycle

```
startSession() → [pauseSession() / resumeSession()]* → endSession()
```

1. **Start**: `startSession(goalMinutes?)` creates a new session with `startTime`, initializes tracking arrays, dispatches `nv:study_session_started`
2. **Pause**: `pauseSession()` calculates elapsed time since `lastUpdated`, adds to `accumulatedTime`, sets `paused` flag
3. **Resume**: `resumeSession()` updates `lastUpdated`, clears `paused` flag
4. **End**: `endSession()` finalizes duration, computes summary (duration, visited, notes, bookmarks, completed), stores summary, removes active session, dispatches `nv:study_session_ended`

## Session State

The active session object contains:

```
{
  startTime: "2026-06-24T10:00:00.000Z",
  paused: false,
  accumulatedTime: 3600,     // seconds
  lastUpdated: "2026-06-24T11:00:00.000Z",
  goalMinutes: 60,
  resourcesVisited: [
    { id, type, title, timestamp }
  ],
  notesEdited: ["resourceId1", "resourceId2"],
  bookmarksAdded: ["bookmarkId1"],
  completedItemsCount: 3
}
```

## Timer

The session bar displays a live timer (HH:MM:SS or MM:SS) that updates every second via `setInterval`. The timer respects the `paused` state — it stops counting when paused and continues when resumed.

## Pause/Resume

The session bar provides a pause/resume button that toggles the session state. When paused:
- Timer stops
- A pulsing indicator changes appearance (active → paused)
- All tracking continues when resumed

## Summary Modal

When a session ends (via "End Session" button), a full-screen overlay displays:
- Formatted duration (hours, minutes, seconds)
- Session goal comparison
- Number of resources visited
- Number of notes taken
- Number of items marked completed
- Number of bookmarks added

A close button dismisses the modal and re-renders the workspace dashboard.

## Continuity Features

- Session state persists across page navigation (stored in localStorage)
- The global session bar is prepended to `<body>` when a session is active
- Session tracks visited resources automatically via navigation events
- Notes and bookmarks within a session are tracked for the summary

## Global Session Bar

A fixed bar at the top of the viewport (`#nv-global-session-bar`) shows:
- Pulsing indicator (green for active, yellow for paused)
- Timer display
- Current resource title
- Pause/Resume button
- End Session button

## Local Behavior

- All session data is stored in `nv_personalization_active_session`
- Session summaries are stored in `nv_personalization_session_summary`
- Goal progress updates every 60 seconds of active time
- No synchronization across browsers or devices
- No server-side storage

## Related Chapters

- [Personalization System](#22-personalization-system)
- [Workspace Architecture](#07-workspace-architecture)
- [Known Limitations](#30-known-limitations)

---

# 24 — UI Design Language

# UI Design Language

## Overview

NeuralVerse follows a dark scientific aesthetic designed to evoke a premium AI research environment. The design emphasizes clarity, precision, and low visual noise.

## Design Principles

- Dark scientific interface
- Precise spacing and alignment
- Subtle cyan/blue accents
- Elegant cards with restrained borders
- Minimal animation, purposeful motion
- Low visual noise
- No generic AI clichés, mascots, or excessive gradients

## Color System

The color system is defined in `tokens.css` with three layers:

### Reference Tokens
- Neutral scale: 50 (lightest) through 950 (darkest)
- Primary blue/cyan scale
- Semantic colors: success (green), warning (amber), error (red), info (blue)
- Accent colors for specific use cases

### Semantic Tokens
- Surface colors (backgrounds, cards, overlays)
- Text colors (primary, secondary, tertiary, inverse)
- Accent colors (default, hover, active, muted)
- Border colors (default, hover, focus)
- Status colors (success, warning, error, info)

### Context Tokens
- Shell (header, nav rail, main surface)
- Workspace (content, sidebar, metadata)
- Reading (text, background, highlight)
- Overlay (dialog, tooltip, modal)

## Typography

- System font stack for optimal performance
- `Inter` as the primary UI font
- Monospace for code blocks (`ui-monospace`, `SF Mono`, etc.)
- Typographic scale defined through CSS custom properties
- Code font size slightly smaller than body text for readability

## Spacing

A consistent spacing scale is defined through CSS custom properties:
- `--nv-space-1` through `--nv-space-16`
- Based on 4px increments (4px, 8px, 12px, 16px, 24px, 32px, etc.)
- All components use these tokens for consistent vertical and horizontal rhythm

## Card Language

Cards follow a consistent structure:
- Subtle background (slightly lighter than the main surface)
- Optional top border indicating lifecycle status (green for Reviewed)
- Title, summary, metadata footer
- Type badge (color-coded by entity type)
- Hover state with subtle elevation change
- Consistent padding and border radius

## Color Coding

Entity types are color-coded in badges and indicators:

| Type | Color |
|------|-------|
| Learning Path | Cyan |
| Module | Blue |
| Lesson | Amber |
| Artifact | Green |
| Reviewed | Green (success) |
| Draft | Neutral |

## Graph Aesthetics

The knowledge graph and retrieval graph follow:
- Dark canvas background
- Nodes colored by entity type or cluster
- Edges with subtle opacity and curved paths
- Labels with controlled overlap
- Selection highlighting with accent glow
- Minimal decoration — focused on readability

## Interaction Philosophy

- All interactive elements have clear hover and focus states
- Transitions are short (150-300ms) and purposeful
- Click targets are adequately sized (minimum 44px for touch)
- Keyboard navigation is supported throughout
- State changes are visually communicated (aria-pressed, aria-expanded)

## Glassmorphism Usage

Glassmorphism (backdrop blur + semi-transparent backgrounds) is used selectively:
- Search modal dialog
- Agent panel
- Tooltips and hover previews
- Session bar
- Not used on primary content areas to maintain readability

## Responsive Principles

- CSS Grid for main layout
- Flexible cards that reflow from multi-column to single-column
- Navigation rail collapses to hamburger menu on mobile
- Reading view adjusts column proportions
- Tables become scrollable on narrow viewports
- Minimum target size maintained for interactive elements
- No horizontal overflow at any breakpoint

## Motion Philosophy

- `prefers-reduced-motion` is respected — all animations are disabled or replaced with instant transitions
- Route transitions use opacity and transform
- Cards lift slightly on hover
- Loading states use skeleton screens, not spinners
- Animations are not used decoratively

## Related Chapters

- [Accessibility](#25-accessibility)
- [Frontend Architecture](#03-frontend-architecture)
- [Workspace Architecture](#07-workspace-architecture)

---

# 25 — Accessibility

# Accessibility

## Overview

NeuralVerse is designed to be usable by keyboard-only users, screen reader users, and users with motion sensitivity. Accessibility is verified through rigorous audit scripts and Extreme Audit certification.

## Landmarks

The HTML shell uses semantic landmark elements:
- `<header>` — Global header with branding and controls
- `<nav>` — Navigation rail
- `<main>` — Main workspace content area
- `<aside>` — Agent Assist panel
- `<footer>` — Page footer (when present)

Each landmark has an appropriate `aria-label` when needed for disambiguation.

## Keyboard Navigation

All interactive elements are keyboard accessible:

| Control | Keyboard Interaction |
|---------|---------------------|
| Navigation rail | Tab to enter, Arrow keys within, Enter to activate |
| Search modal | Ctrl+K opens, Escape closes, Arrow keys navigate results |
| Agent panel | Tab through controls, Ctrl+Enter submits, Escape closes |
| Curriculum filters | Tab between buttons, Enter/Space to toggle |
| Reading page | Home/End for scroll, Escape for mobile TOC |
| Modals | Focus trapped within, Escape closes, focus returns on close |

## Dialogs

The search modal uses the native `<dialog>` element:
- `showModal()` opens with focus trap
- Escape closes automatically
- Focus returns to trigger button on close
- Backdrop click closes the dialog

## Focus Management

- Focus is moved to relevant content after page transitions
- Agent panel manages focus between open/close states
- Search modal returns focus to trigger
- Reading experience preserves scroll position on navigation back
- Skip-to-content link is the first focusable element

## ARIA Usage

Key ARIA patterns:

| Element | ARIA |
|---------|------|
| Search results | `role="listbox"`, `role="option"`, `aria-selected` |
| Filter buttons | `aria-pressed` for toggle state |
| Agent panel | `aria-hidden` + `inert` when closed |
| Navigation rail | `aria-current="page"` for active link |
| Dynamic content | `aria-live="polite"` for updates |
| Icons | `aria-hidden="true"` with text alternatives |
| Modals | `role="dialog"`, `aria-modal="true"` |

## Responsive Accessibility

- All breakpoints maintain keyboard accessibility
- Touch targets are minimum 44x44px on mobile
- Navigation collapses to hamburger menu — still keyboard accessible
- Tables remain readable with horizontal scroll wrappers
- Cards reflow without losing focus order

## Reduced Motion

All animations respect the `prefers-reduced-motion` media query:
- Route transitions become instant
- Card hover lifts are disabled
- Neural galaxy animation intensity is reduced or disabled
- All CSS transitions use `@media (prefers-reduced-motion: no-preference)`

## Audit Verification

Accessibility is verified through:
- **Extreme Audit scripts**: Check for `aria-hidden` focusable descendants, keyboard navigability, focus management
- **Accessibility skill**: Dedicated audit pattern checking contrast, landmarks, ARIA usage, and keyboard navigation
- **Master Certification Gate**: Verifies zero critical/high accessibility violations before certification

## Related Chapters

- [UI Design Language](#24-ui-design-language)
- [Testing and Certification](#28-testing-and-certification)
- [Security Model](#26-security-model)

---

# 26 — Security Model

# Security Model

## Overview

NeuralVerse operates entirely client-side with no backend, no authentication, and no external API calls. The security model focuses on preventing XSS, content injection, and governance violations.

## Sanitization

- All curriculum content Markdown is converted to HTML through a controlled `markdownToHtml()` function that only allows safe HTML tags
- User-provided text (notes, tags) is stored as strings and rendered as text content, not innerHTML
- Agent responses use templated section rendering, not raw HTML injection

## XSS Prevention

The system prevents cross-site scripting through multiple layers:

1. **HTML rendering**: Custom markdown parser generates only safe elements (p, ul, ol, li, pre, code, table, blockquote, h2-h4, a with href)
2. **No `innerHTML` on user input**: Notes and tags use `textContent` for display
3. **No `eval()` or equivalent**: The codebase contains no `eval()`, `Function()`, `setTimeout(string)`, or dynamic code execution
4. **Guardrails**: Agent system checks queries for XSS patterns (`<script>`, `javascript:`, `onerror=`, `eval(`)

## HTML Handling

- Page templates are HTML partials loaded via `fetch()` and inserted into the DOM
- Template content is trusted (part of the application codebase)
- Dynamic content (curriculum data, agent responses) is rendered through controlled DOM manipulation
- No user-provided HTML is ever rendered

## Governed Refusals

The agent guardrail system refuses requests that attempt:
- Curriculum mutation
- Lifecycle status changes
- Score/grade/mastery claims
- Evidence boundary bypass
- External API calls
- XSS injection
- Hidden recommendations

Refusals include: rule ID, severity level, refusal message, and governance notice.

## Absence of Eval-like Behavior

The codebase has been audited for dynamic code execution:
- No `eval()` calls
- No `Function()` constructor
- No `setTimeout()` or `setInterval()` with string arguments
- No dynamic `import()` with user-controlled paths
- No `with()` statements
- No `document.write()` or `document.writeln()`

## Local-Only State Philosophy

All user data is stored in `localStorage`:
- No data is transmitted over the network
- No cookies are used for tracking
- No third-party analytics or scripts
- No service worker or background sync
- Data is private to the browser/profile

## Security Audit Verification

Security is verified through:
- XSS pattern scanning in audit scripts
- Guardrail effectiveness tests
- `eval()` absence verification
- Governed refusal behavior tests
- Master Certification Gate includes zero-tolerance for security violations

## Related Chapters

- [Governance Model](#27-governance-model)
- [Didactic Agent Runtime](#11-didactic-agent-runtime)
- [Testing and Certification](#28-testing-and-certification)

---

# 27 — Governance Model

# Governance Model

## Overview

NeuralVerse enforces strict governance boundaries across all subsystems. Governance ensures that the curriculum remains canonical, learner data remains private, and no system component makes claims beyond its authority.

## Immutable Curriculum Principles

The curriculum index (`curriculum-index.json`) is the canonical, authoritative data source. Key immutability rules:

- **No runtime modification**: The curriculum index is loaded as a static JSON file and never modified in the browser
- **No UI-based mutation**: No interface allows adding, removing, or editing curriculum entities
- **No agent-driven mutation**: All 10 agents are forbidden from proposing or executing curriculum modifications
- **No search-side mutation**: The search system reads the index but never writes to it

## Retrieval Governance

The retrieval playground operates with the following constraints:

- **Seeded data only**: The reference database is hardcoded, not fetched from external sources
- **No live search**: Queries only match against the seeded reference keywords
- **Simulated evidence**: Evidence compilation is based on the seeded relationship graph, not real citations
- **Presentation mode is a placeholder**: No implementation exists

## Lifecycle Semantics

Every curriculum entity has a `canonicalStatus` field with two values:

- **Draft**: Content is in progress, has not completed editorial review
- **Reviewed**: Content has passed editorial review

Critical semantic rules:

| Allowed | Not Allowed |
|---------|-------------|
| "This artifact is Draft" | "This artifact is unmastered" |
| "Reviewed content has passed editorial review" | "Reviewed content is certified" |
| Filter by lifecycle status | Infer learner competence from status |
| Display status badge | Claim Draft content is low quality |

The lifecycle badge tooltip explicitly states: "...curriculum lifecycle status. It does not imply certification or learner achievement."

## Evidence Boundary

The Evidence Boundary is a governance concept that separates:

- **What the curriculum contains** (canonical content with lifecycle metadata)
- **What the learner has done** (personalization data: notes, bookmarks, progress)
- **What the agent system can claim** (deterministic guidance based on curated data)

The boundary prohibits:
- Agents making claims about learner achievement or competence
- Agents fabricating evidence not present in the curriculum
- Personalization data being used for mastery inference
- Curriculum lifecycle status being used as learner assessment

## Prohibition of Mastery Inference

The platform explicitly does not:

- Assign scores to learner responses
- Generate grades or percentages
- Certify competence or completion
- Track learner "mastery" of concepts
- Provide pass/fail judgments
- Unlock or lock content based on performance
- Track learner progress as qualification

Governance-safe negations are allowed (e.g., "This exercise does not assign a score").

## Draft/Reviewed Interpretation

- Draft/Reviewed is **editorial metadata**, not learner-facing quality assessment
- Both Draft and Reviewed content can be equally valuable for learning
- The filter exists for transparency, not as a quality gate
- Draft content may change; Reviewed content is stable

## Preservation Rules

Governance is preserved through:

1. **Architectural constraints**: Curriculum service is read-only; agents are forbidden from mutation
2. **Guardrails**: Regex-based query scanning at the agent level
3. **Audit scripts**: Extreme Audit scripts verify governance compliance across the entire application
4. **Master Certification Gate**: Governance violations cause certification failure
5. **Documentation**: This system bible documents governance rules for contributors

## Related Chapters

- [Security Model](#26-security-model)
- [Didactic Agent Runtime](#11-didactic-agent-runtime)
- [Testing and Certification](#28-testing-and-certification)
- [Development Guidelines](#31-development-guidelines)

---

# 28 — Testing and Certification

# Testing and Certification

## Overview

NeuralVerse has a multi-layered testing and certification system that covers functionality, governance, accessibility, security, and performance. All tests run in the browser or headless environment without external dependencies.

## Certification Layers

### Agent QA

Agent-specific tests verify:
- Each agent registers correctly in the registry
- Each agent handles queries matching its keywords
- Guardrails correctly block forbidden requests
- Governed refusals contain proper rule IDs and messages
- All 10 agents respond to their quick action buttons

### Extreme Audits

Comprehensive audit scripts that validate entire subsystems:

| Audit | Scope | Checks | Status |
|-------|-------|--------|--------|
| QA1 | Full system baseline | 100+ | Pass |
| QA2 | Search + Agent extreme | 200+ | Pass |
| QA3 | Workspace content extreme | 200+ | Pass |
| QA4 | Atlas + Retrieval extreme | 136 | Pass (0 failures) |
| QA5 | Learning + Modules extreme | 309 | Pass (0 failures) |

Each Extreme Audit covers:
- Route loading and rendering
- Count validation (entities, filters, lifecycle)
- Governance semantics (Draft/Reviewed, no mastery language)
- Accessibility (aria-hidden focusable descendants, keyboard nav)
- Responsive layout (multiple viewport sizes)
- Security (XSS, no eval)
- Performance (memory, DOM queries)
- Visual polish (badge rendering, spacing)

### Master Certification Gate

The NV-1000 Master Certification Gate (`nv-1000-master-certification-gate.js`) is the final verification layer. It runs:

- All Extreme Audit scripts in sequence
- Verifies zero Critical or High failures
- Checks build output and whitespace
- Validates documentation coverage
- Provides a single PASS/FAIL decision

### Playwright E2E

Playwright-based end-to-end tests verify:
- Page loading and rendering
- Navigation between routes
- Interactive behavior (search, filters, agent panel)
- No console errors during operation
- Responsive behavior across viewports

### Workspace Audits

Workspace-specific tests verify:
- Reading experience rendering
- Sticky header behavior
- Table of contents generation
- Copy code button functionality
- Personalization panel rendering
- Continue reading restoration

### Graph Audits

Knowledge graph tests verify:
- Canvas/WebGL rendering
- Force-directed layout computation
- Node selection and highlighting
- Filter controls
- Route synchronization

### Search Audits

Search system tests verify:
- Index building accuracy (counts match curriculum)
- Search results for various queries
- Keyboard navigation (arrows, Enter, Escape)
- Filter interaction (bookmarked, notes, recent)
- Alias resolution
- "View in Graph" links

### Accessibility Audits

Dedicated accessibility tests verify:
- Landmark structure
- ARIA attribute correctness
- Focus management on navigation
- Dialog focus trapping
- Skip-to-content link
- Keyboard-only navigation paths
- `aria-hidden` and `inert` on closed panels
- `prefers-reduced-motion` behavior

### Security Audits

Security tests verify:
- No `eval()` or dynamic code execution
- XSS pattern absence in agent guardrails
- Governed refusal responses for forbidden queries
- Sanitization of rendered content
- No external API calls from agent system

### Regression Suites

Regression scripts validate that existing functionality is preserved after changes:

| Script | Scope |
|--------|-------|
| `full-system-audit.js` | End-to-end system verification |
| `workspace-extra-audit.js` | Workspace-specific regression |
| `nv-ui-search-agent-extreme-audit.js` | Search + Agent regression |
| `nv-ui-workspace-content-extreme-audit.js` | Workspace content regression |
| `nv-1000-master-certification-gate.js` | Final certification gate |

## Build Verification

Before certification:
- `npm run build` must pass (React islands build)
- `git diff --check` must show no whitespace errors

## Test Statistics

| Layer | Typical Checks | Failure Tolerance |
|-------|---------------|-------------------|
| Extreme Audits | 100-309 per audit | Zero Critical/High |
| Master Gate | All audits combined | Zero failures |
| Playwright | Full route coverage | Zero failures |
| Accessibility | 10-20 per route | Zero violations |
| Security | 5-10 patterns | Zero violations |

## Related Chapters

- [Governance Model](#27-governance-model)
- [Security Model](#26-security-model)
- [Current Capabilities](#29-current-capabilities)

---

# 29 — Current Capabilities

# Current Capabilities

## Curriculum Subsystem

- 19 Learning Paths with hierarchical navigation (2 Reviewed, 17 Draft)
- 40 Modules with filterable collections
- 120 Lessons with flow visualization
- 600 Artifacts with type-specific rendering
- Lifecycle status (Draft/Reviewed) on all entities
- Markdown-to-HTML conversion with syntax highlighting
- Cross-link dependencies (prerequisites, complementary, recommended)
- Previous/Next artifact navigation
- Reading experience (sticky header, TOC, progress bar, code copy)

## Search System

- Global search modal (Ctrl+K)
- Full-text search over all 779 curriculum entities
- Keyword aliases for common terms
- Weighted scoring with field-level matching
- Personalization filters (bookmarked, notes, recent, collection)
- Highlighted results with type badges and breadcrumbs
- Keyboard navigation (arrows, Enter, Escape)
- "View in Graph" integration

## Agent Runtime

- 10 operational didactic agents (A1-A10)
- Deterministic, offline, no external API dependencies
- Orchestrator with intent routing and agent selection
- Context builder reading curriculum + personalization state
- 9 guardrail rules (mutation, mastery, XSS, external calls)
- 90 quick action buttons across 9 categories
- 4 pedagogical engines (Analogy, Comparison, Socratic, Misconception)
- Curated domain data for agents A5-A10 (7 domains each)
- Structured response rendering with 12 section types
- Invocation history with localStorage persistence

## Personalization

- Per-resource Markdown notes with live preview
- Resource-level bookmarks with lineage tracking
- Per-resource tags with badge display
- Named study collections
- Favorites with sorting and type grouping
- Study queue with reordering
- Paragraph-level highlights (yellow/green)
- Position-based reading bookmarks
- Reading progress tracking (Not Started / In Progress / Completed)
- Reading goals with daily tracking
- Continue reading with scroll position restoration
- Recently visited history (up to 50 entries, filterable)

## Study Sessions

- Timer-based sessions with pause/resume
- Automatic resource tracking
- Session summary modal with statistics
- Global session bar with live timer
- Goal progress tracking

## Retrieval Playground

- 4 implemented modes: Search, Graph, Discovery, Compare
- 10 seeded references with 12 relationships
- Force-directed graph visualization (SVG)
- Inspector panel with reference, evidence, relationship tabs
- Memory layer with pinned references, recent items, saved queries
- Knowledge trail (20-event chronological log)
- Evidence compilation with confidence assessment
- Semantic synthesis in compare mode
- Workspace state persistence across sessions

## Knowledge Graph (Atlas)

- Force-directed graph of curriculum entities
- Staged navigation (overview → path → module → lesson → artifact)
- Inspector panel for entity details
- Canvas/WebGL rendering
- Filter by entity type
- Route synchronization with curriculum navigation
- Search-to-graph integration

## Accessibility

- Keyboard navigation for all interactive elements
- Native `<dialog>` for search modal
- ARIA landmarks and roles throughout
- Skip-to-content link
- Focus management on route changes
- `prefers-reduced-motion` support
- `inert` on closed panels
- Accessible color contrast

## Security

- No `eval()` or dynamic code execution
- XSS prevention in agent guardrails
- Governed refusals for forbidden queries
- Controlled Markdown-to-HTML rendering
- Local-only data persistence

## Governance

- Immutable curriculum index
- Lifecycle status as editorial metadata only
- 9 guardrail rules enforced by agent runtime
- Evidence Boundary separating content, learner data, and agent claims
- No mastery inference, scoring, or certification

## Build and Development

- Single-command build (`npm run build`)
- React islands compiled to IIFE bundle
- Python dev server for development
- 25 CSS files with token-based design system
- 47 audit/verification scripts
- Comprehensive QA certification process (QA1-QA5)

## Related Chapters

- [Known Limitations](#30-known-limitations)
- [Testing and Certification](#28-testing-and-certification)
- [Executive Summary](#00-executive-summary)

---

# 30 — Known Limitations

# Known Limitations

## Intentionally Unimplemented Features

The following features are intentionally not implemented as part of the project's design:

- **Backend services**: No server, no database, no authentication
- **External API integration**: No API calls to external services
- **LLM integration**: No generative AI, no large language model integration
- **User accounts**: No user registration, login, or multi-user support
- **Data synchronization**: No cross-device or cloud sync
- **Content creation**: No UI for creating or editing curriculum content
- **Scoring and grading**: No learner assessment, scoring, or certification
- **Adaptive learning**: No algorithm-driven content personalization
- **Real-time collaboration**: No multi-user sessions or shared workspaces
- **Mobile-native app**: Web-only; no native iOS or Android application

## Architectural Boundaries

| Boundary | Limitation |
|----------|------------|
| Browser-only | All code runs in main thread; no service worker or Web Worker |
| localStorage | Data limited to ~5-10MB per origin; no IndexedDB usage |
| Static data | Curriculum index is static JSON; content changes require rebuild |
| Single origin | No cross-origin data sharing or embedding support |
| No offline support | Initial page load requires network for static assets |

## Local-Only Assumptions

- Personalization data is specific to the browser and profile
- Clearing browser data removes all notes, bookmarks, and progress
- No backup or export mechanism for personalization data
- No recovery if localStorage is corrupted or cleared
- Study sessions do not persist across browsers or devices

## Advisory Systems

The following systems provide advisory or simulated capabilities:

- **Retrieval Playground**: Reference database is seeded (10 references); not connected to real paper databases
- **Presentation mode**: Tab exists in the retrieval playground but has no implementation
- **Research agent (A5)**: Research information is static and curated; may not reflect latest developments
- **Professional transfer agent (A6)**: Production advice is general, not organization-specific
- **Assessment agent (A7)**: Questions are for self-assessment; no scoring or evaluation

## Non-Goals

The following are explicitly not goals of the project:

- Replace traditional learning management systems
- Provide accredited certification
- Serve as a production AI deployment platform
- Compete with commercial AI learning platforms
- Provide real-time AI inference or model training
- Support user-generated curriculum content
- Provide enterprise-grade authentication or access control

## Performance Limitations

- Single-threaded architecture may struggle with very large curriculum indexes
- Force-directed graph layout is CPU-intensive for large node counts
- React islands bundle is ~500KB; initial load includes all CSS (25 files)
- No lazy loading for curriculum entities; all index data loads on first access
- Canvas neural galaxy animation consumes GPU resources when visible

## Content Limitations

- Not all artifact types have corresponding interactive visualizations
- Exercise artifacts are self-assessment only with no validation
- Video, image, and audio artifacts may have limited browser compatibility
- Cross-link dependencies rely on declared metadata, not inferred relationships

## Related Chapters

- [Current Capabilities](#29-current-capabilities)
- [System Architecture](#02-system-architecture)
- [Security Model](#26-security-model)

---

# 31 — Development Guidelines

# Development Guidelines

## Overview

These guidelines ensure that contributions to NeuralVerse maintain the project's architectural integrity, governance model, and quality standards.

## Preserve Governance

- Never modify the curriculum index at runtime
- Never allow UI or agents to change lifecycle status
- Never introduce scoring, grading, or mastery claims
- Always display lifecycle badges with correct governance tooltip
- Keep Draft/Reviewed as editorial metadata only

## Avoid Curriculum Mutation

- Curriculum data is read-only from the client perspective
- Content changes must be made to the source files (`docs/content/`) and the index regenerated
- No agent, search, or personalization feature should propose or execute curriculum changes
- The curriculum service caches the index but never writes to it

## Maintain Accessibility

- All new interactive elements must be keyboard accessible
- Use semantic HTML elements (button, nav, main, aside, dialog)
- Provide ARIA attributes where semantics are insufficient
- Test with keyboard-only navigation before submitting
- Support `prefers-reduced-motion` for all animations
- Maintain minimum 44x44px touch targets
- Never trap focus without an escape mechanism

## Preserve Evidence Boundary

- Agents must not claim learner achievement or competence
- Personalization data must not be used for mastery inference
- Curriculum status must not be presented as learner assessment
- All agent responses must include appropriate governance disclaimers
- Do not fabricate citations, scores, or evidence

## Maintain Local-First Behavior

- All user data must use localStorage (not IndexedDB unless approved)
- No data should be transmitted over the network
- No external API calls from client-side code
- No authentication or session management required
- Application must function with JavaScript enabled only

## Avoid External Dependencies

- Do not add npm packages without explicit approval
- Prefer vanilla JavaScript over frameworks for core functionality
- React is approved only for the islands pattern in `react-build/`
- No CDN-loaded scripts or resources
- No third-party analytics, tracking, or telemetry

## Code Conventions

- Use ES modules for new code (`import`/`export`)
- Prefer `const` over `let`; avoid `var`
- Use descriptive function and variable names
- Minimize DOM queries — cache references when reused
- Use the design token system (`var(--nv-*)`) for all styling
- Follow existing file naming: kebab-case for files, camelCase for functions

## Testing Requirements

- All new features must have corresponding audit or test coverage
- Run existing audit scripts before submitting changes
- Ensure zero new Critical or High failures in Extreme Audits
- Verify no console errors in affected routes
- Run `npm run build` to verify React islands compilation
- Check `git diff --check` for whitespace errors

## Component Conventions

- New UI components should match the existing card/button/badge patterns
- Use the CSS custom property system for colors, spacing, and typography
- Components must be responsive at mobile, tablet, and desktop
- Hover and focus states are required for all interactive elements
- Loading states should use skeleton screens when appropriate

## Documentation

- Architectural decisions should be documented in `docs/architecture/`
- New features should update the relevant system bible chapter
- Governance changes must be reflected in the governance model documentation
- Audit scripts should document their check count and pass/fail criteria

## Related Chapters

- [Governance Model](#27-governance-model)
- [Testing and Certification](#28-testing-and-certification)
- [System Architecture](#02-system-architecture)

---

# 32 — Glossary

# Glossary

## A

**Agent Runtime**
The deterministic, browser-based execution environment for didactic agents. Includes the registry, orchestrator, context builder, guardrails, and panel controller.

**Artifact**
An individual content piece within a lesson. Types include: reading, exercise, interactive-visualization, comparison-table, code, video, image, audio. 600 artifacts exist in the canonical curriculum.

**Atlas**
See Curriculum Atlas.

## C

**Canonical Status**
The lifecycle metadata field on every curriculum entity. Values: `Draft` (in progress) or `Reviewed` (editorially approved). This is editorial metadata only and does not imply learner achievement.

**Collection**
A user-named group of resources for organized study. Created and managed through the personalization system.

**Context Builder**
A component of the agent runtime that reads the current frontend state (URL, route, curriculum selection, personalization data) and produces a structured context object for agent execution.

**Continue Reading**
A feature that remembers the user's scroll position within an artifact and provides a "Resume" link on return.

**Curriculum Atlas**
The knowledge graph visualization of the curriculum hierarchy. Accessed via `#/knowledge-graph`. Supports staged navigation from overview to individual artifact focus.

## D

**Didactic Orchestrator**
Central coordination hub of the agent runtime. Handles intent routing, agent selection, guardrail enforcement, and response formatting.

**Draft**
A lifecycle status indicating the content has not completed editorial review. Displayed with a neutral badge.

## E

**Evidence Boundary**
A governance concept separating canonical curriculum content, learner personalization data, and agent system claims. The boundary prohibits agents from making claims about learner achievement, fabricating evidence, or using personalization data for mastery inference.

**Extreme Audit**
A comprehensive audit script that validates an entire subsystem. Covers route loading, count validation, governance semantics, accessibility, security, performance, and visual polish. QA1-QA5 completed.

## G

**Guardrail**
A governance rule enforced by the agent runtime. 9 guardrails cover curriculum mutation, lifecycle modification, mastery claims, external API calls, XSS prevention, and more.

## I

**Interactive Visualization Specification**
A notice displayed when an artifact of type `interactive-visualization` does not have a registered visualization in the visualization registry. Indicates the specification is present but no executable widget exists.

## K

**Knowledge Trail**
A chronological event log in the retrieval playground recording user actions (search, open, pin, compile, compare) during a research session. Capped at 20 entries.

## L

**Learning Path**
A broad domain or track in the curriculum hierarchy. Contains modules. 19 learning paths exist in the canonical curriculum.

**Lesson**
A teachable session within a module. Contains multiple artifacts. 120 lessons exist in the canonical curriculum.

## M

**Master Certification Gate**
The final verification layer (NV-1000) that runs all Extreme Audit scripts and validates zero Critical or High failures before certification.

**Module**
A conceptual unit within a learning path. Contains lessons. 40 modules exist in the canonical curriculum.

## R

**Reviewed**
A lifecycle status indicating the content has passed editorial review. Displayed with a green badge.

**Retrieval**
The simulated research playground system. Provides search, graph, discovery, and compare modes over a seeded reference database.

## S

**Study Queue**
An ordered list of resources a learner plans to study. Supports add, remove, reorder, and "Start Next" operations.

## Related Chapters

- [Curriculum Architecture](#05-curriculum-architecture)
- [Didactic Agent Runtime](#11-didactic-agent-runtime)
- [Governance Model](#27-governance-model)
- [Testing and Certification](#28-testing-and-certification)
