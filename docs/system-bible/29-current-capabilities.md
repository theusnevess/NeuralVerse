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

- [Known Limitations](30-known-limitations.md)
- [Testing and Certification](28-testing-and-certification.md)
- [Executive Summary](00-executive-summary.md)
