# NV-1100-P5C — Artifact Review Badges & Review Discovery Polish

## Purpose

P5C finalizes the learner-facing integration of the deterministic spaced repetition system introduced in P5 and extended by P5B. Where P5B was the review **session** experience, P5C is the review **discovery** experience — surfacing review state on artifacts, in the workspace, in search, and (optionally) in the knowledge graph, while keeping all scheduling decisions deterministic and scheduler-owned.

P5C is **strictly additive**. It does not modify SM-2, the scheduler, the queue, the session UI, or any curriculum hierarchy.

## Architecture

```
website/scripts/spaced-repetition/
├── review-badge-renderer.js   ← Stateless badge / action / metadata panel renderer
└── review-discovery.js        ← Search shortcuts, due list, graph hover overlay
```

`window.NeuralVerse.reviewBadgeRenderer` and `window.NeuralVerse.reviewDiscovery` are exposed via `installSpacedRepetition()`.

## Badge States

Priority (highest first):

| State | Trigger | Variant | Visible text |
|---|---|---|---|
| `due` | `nextReview <= today` | `warning` | Review Due |
| `reviewed-today` | `lastReviewed` is today | `success` | Reviewed Today |
| `scheduled` | future review exists | `neutral` | Scheduled |
| `none` | no schedule entry | `muted` | No Review Scheduled |

`getBadgeState(artifactId, type, scheduler)` returns the state. `renderBadge(...)` and `renderActionButton(...)` produce HTML; the renderer is stateless — every call derives state from the scheduler at call time.

## Action Buttons

| State | Label | Behaviour |
|---|---|---|
| `due` | Review Now | Ensures the artifact is in the schedule and opens the session UI |
| `scheduled` | Review Early | Same as `due` (early grading) |
| `reviewed-today` | Reviewed Today | `disabled` informational |
| `none` | Add To Review Queue | Ensures the artifact is in the schedule and opens the session UI |

All actions are wired by `wireReviewAction(target)` in `content-viewer.js`. The button calls `scheduler.ensureItem()` (idempotent) and then `reviewSessionController.startSession()` (or `resumeSession()` if a partial session exists).

## Metadata Panel

`renderMetadataPanel(artifactId, type, scheduler)` returns a `<section>` with a `<dl>` containing:

- Review Status
- Next Review (formatted date)
- Last Review (formatted date, or `—`)
- Repetitions (or `—`)
- Interval (days, or `—`)
- Ease Factor (2 decimals, or `—`)

The panel is injected by `content-viewer.js` between the metadata `<dl>` and the markdown body. It never fabricates values — when no review state exists, every field renders as `—`.

## Workspace Polish

`personalization-controller.js` renders the right sidebar review card with a new "Artifacts due for review" section. After the dashboard renders, `workspace-controller.js` populates the list via `discovery.renderDueArtifactsList(scheduler, { limit: 5 })`. The list is a `<ul>` of artifacts with a link to `#/content/{id}` and a "Next" relative-time label.

`workspace-controller.js` continues to expose:
- `Start Review` — opens a fresh session
- `Continue` — resumes an unfinished session (if any)
- `Skip` — informational only

## Search Discovery

When a query matches a review-related phrase (defined in `REVIEW_SEARCH_QUERIES`):

- `isReviewQuery(query)` returns true
- `buildReviewSearchShortcuts(scheduler, { query, limit: 5 })` returns up to 5 shortcut entries
- `renderReviewShortcutsSection(scheduler, { limit: 5 })` returns a section element
- A MutationObserver in `app.js` injects the section at the top of the search results container when the query changes

The shortcut section is **boosted**, not dominant: it appears above the curriculum results but does not exceed 5 entries and uses a slightly lower score (`0.6`) than a typical curriculum match.

Recognized queries: `due reviews`, `review due`, `review today`, `overdue`, `scheduled review`, `flashcards due`, `reviews`, `today's reviews`, `review session`, `review now`.

## Knowledge Graph Overlay

`attachGraphHover(rootEl, scheduler)` attaches `mouseover` / `mouseout` listeners to a knowledge-graph root element. On hover over a node (`[data-node-id]`), the review state is read from the scheduler and a small tooltip (`renderGraphHoverPanel`) is positioned above the node. The graph **topology is never modified** — no extra edges, no re-layout, no physics changes. The hover is purely a presentation overlay.

This enhancement is **optional**. If a knowledge-graph element does not have `[data-node-id]` attributes, the overlay is a no-op. The graph implementation can opt in by adding `data-node-id` to its node elements.

## Review Filters (transient)

Artifact listings can be filtered transiently by `View Due Artifacts`, `View Scheduled`, `View Reviewed Today`, or `View Upcoming`. The filters are **not persisted** — they reset on navigation. The current implementation provides the filter helpers (`getDueArtifacts`, `getReviewShortcuts`) and lets the workspace render the corresponding lists. The transient filter UI is reserved for a follow-up P6 phase; the underlying data accessors are stable and the badges already surface the same state at the artifact level.

## Accessibility

- Badges: `role="status"` with descriptive `aria-label` (e.g., "Review status: Review Due")
- Action buttons: `aria-disabled="true"` when informational; otherwise `aria-label` describes the action
- Metadata panel: `<section>` with `aria-labelledby` pointing to a heading; `<dl>` for definition lists
- Search shortcuts: `role="region"` with `aria-label="Review shortcuts"`; each card is `role="article"` with `aria-labelledby`
- Knowledge graph tooltip: `role="tooltip"` with descriptive `aria-label`
- Reduced motion compatibility: `@media (prefers-reduced-motion: reduce)` applied to all transitions

## Responsive

- 390 px: badge and action stack vertically; metadata rows collapse to a single column
- 768 px: dashboard + cards readable
- 1024 px: standard layout
- 1440 px: standard layout, no overflow

`@media (max-width: 480px)` adjusts the badge group direction and the metadata row grid.

## Persistence

No schema changes. No new keys. P5C reuses:

- `nv_review_schedule` — badge and metadata panel state
- `nv_review_history` — implicit (used by the session controller for "Reviewed Today" determination)
- `nv_review_preferences` — show overdue first / daily limit (already exposed in settings)

No migration required.

## Governance and Forbidden Terminology

Forbidden: `mastery`, `competence`, `proficiency`, `skill score`, `XP`, `experience`, `streak`, `rank`, `level`, `badge earned`, `achievement`, `certified`, `failed learner`, `passed learner`.

The audit script (`scripts/nv-1100-p5c-verify.js`) strips comments and scans the new P5C modules for these tokens. None appear in non-comment code.

## Files Created

- `website/scripts/spaced-repetition/review-badge-renderer.js`
- `website/scripts/spaced-repetition/review-discovery.js`
- `website/styles/review-badges.css`
- `scripts/nv-1100-p5c-verify.js`

## Files Modified

- `website/scripts/spaced-repetition/index.js` — exports new modules; registers `window.NeuralVerse.reviewBadgeRenderer` and `reviewDiscovery`
- `website/scripts/content/content-viewer.js` — injects badge group and metadata panel; wires the action button
- `website/scripts/workspace/personalization-controller.js` — adds the "Artifacts due for review" section
- `website/scripts/workspace/workspace-controller.js` — populates the due list via the discovery module
- `website/scripts/app.js` — wires the search shortcut observer
- `website/index.html` — loads `styles/review-badges.css`

## Preservation

- No SM-2 math change
- No scheduler change
- No session UI change
- No curriculum hierarchy change
- No learning path / module / lesson / artifact change
- No canonical ID change
- No Evidence Boundary change
- No agent contract change
- No Shared Knowledge / Concept Layer / Knowledge Graph schema change
- No knowledge graph topology change (hover overlay is presentation only)
- No existing personalization key affected
- No new external dependency

P5C is strictly additive on top of P5 and P5B.
