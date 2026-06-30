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

- [Frontend Architecture](03-frontend-architecture.md)
- [Navigation and Routing](04-navigation-and-routing.md)
- [Curriculum Architecture](05-curriculum-architecture.md)
