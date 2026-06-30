# NV-1100-P5B — Review Session & Artifact Review UI

## Purpose

NV-1100-P5B delivers the **learner-facing** layer of the spaced repetition engine introduced in NV-1100-P5. Where P5 was infrastructure (SM-2, storage, queue, dashboard, scheduler), P5B is the **interactive experience** — a fully accessible review session overlay, deep artifact integration, and deterministic UI flows.

P5B is **strictly additive**. It does not modify SM-2, the scheduler, the queue, the dashboard, the storage layer, or any curriculum hierarchy. It introduces a thin UI orchestrator and reuses every P5 primitive through its public API.

## Architecture

```
website/scripts/spaced-repetition/
├── review-session.js              ← UI module: overlay, prompts, quality, keyboard
├── review-session-controller.js   ← Orchestrator: items, lifecycle, reload restoration
└── review-settings-controller.js  ← Settings binding: preferences + reset confirmation
```

`window.NeuralVerse` exposes:

- `reviewSession(options)` — factory that creates a session UI bound to a scheduler and queue
- `reviewSessionController` — singleton that owns the active session, handles `startSession` / `resumeSession` / `closeSession`
- `reviewSettingsController` — initialized on the settings route; binds inputs and reset dialog

The session controller never reaches into the scheduler's private state. It only calls `scheduler.gradeItem(entityId, type, quality)`, `scheduler.getAll()`, `scheduler.getPreferences()`, and `scheduler.resetSchedule()`.

## Session Lifecycle

```
Dashboard
   │
   ▼  click "Start Review"
[session controller].startSession()
   │
   ▼
loads active items via queue.activeSessionItems
   │
   ▼
session.open(items)  → renders overlay
   │
   ▼
Item N of M
   ├── prompt visible, answer hidden
   ├── [Reveal Answer] (Space)
   │      ↓
   ├── answer revealed
   ├── quality buttons 0–5 enabled (or 0–5 keys)
   │      ↓
   ├── [Submit] (Enter) → scheduler.gradeItem(...)
   │      ↓
   ├── either Next item (ArrowRight) or Session Complete
   │
   ▼
Session Complete screen → on close, dispatch nv:reviewupdated
```

## Reveal Answer Workflow

Before reveal:
- Prompt visible
- Answer hidden
- Quality buttons disabled
- [Reveal Answer] is the focused element

After reveal:
- Prompt remains visible
- Answer displayed
- Quality buttons enabled
- Focus moves to the default quality button (3)
- Live region announces the change

The learner cannot grade before revealing. Quality buttons are `disabled` and `tabindex="-1"` until the reveal event fires.

## Quality Labels (canonical)

| Grade | Label |
|---|---|
| 0 | Complete blackout |
| 1 | Incorrect |
| 2 | Difficult recall |
| 3 | Correct with effort |
| 4 | Correct |
| 5 | Perfect recall |

No other quality labels exist. The session controller does not accept or display anything outside this contract.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Reveal answer |
| `0` – `5` | Select quality grade (after reveal) |
| `Enter` | Submit selected quality |
| `ArrowRight` | Advance to next item (after grade) |
| `Escape` | Exit session (with confirmation dialog) |

The keyboard handler is registered at `capture` phase on `document` and is removed on session close. It is silently bypassed when the active element is `INPUT`, `TEXTAREA`, or `contentEditable` so it never interferes with form fields.

## Progress Indicator

Purely informational:

```
Review 3 of 15
██████░░░░░░░
```

- `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow=<pct>` on the bar
- `aria-label="Session progress"`
- `role="progressbar"`
- Width is `Math.round((gradedCount / total) * 100)` percent
- No completion score, no celebration

## Session Complete

When the queue is exhausted, the dialog switches to a completion panel:

```
Review Session Complete
- Items reviewed: 15
- Remaining due today: 0
- Upcoming reviews: 8
[Return to Workspace]
```

The "Return to Workspace" button calls `close()` which removes the overlay and dispatches `nv:reviewupdated` so the dashboard refreshes.

## Artifact Review Badges (deferred)

Artifact pages receive a review badge that surfaces one of four states:

| State | When |
|---|---|
| `Review Due` | `nextReview <= today` |
| `Scheduled` | A future review exists |
| `Reviewed Today` | `lastReviewed` is today |
| `No Review Scheduled` | No schedule entry exists |

The badge API is provided by `review-controller.renderBadge(container, reviewId, options)`. The current implementation does not yet wire badges into the artifact routes (the artifact detail page is rendered by a separate render layer). Wiring is documented as the next P5C step.

## Workspace Sidebar (Today's Reviews)

Already present in P5 dashboard. P5B adds:
- "Start Review" wired to `reviewSessionController.startSession()` / `resumeSession()` if a partial session exists
- "Continue" wired the same way
- "Skip" is informational only; it does not mutate state

## Settings Page

The Settings page exposes a new **Review Preferences** card with:

- `Daily review limit` (number input, 1–1000)
- `Show overdue first` (checkbox)
- `Include curriculum artifacts` (checkbox)
- `Include flashcards` (checkbox)
- `Reset Review Schedule` (danger button)

All inputs are bound to `scheduler.setPreferences()` and persist to `nv_review_preferences`.

### Reset Confirmation

`Reset Review Schedule` opens a `role="alertdialog"` modal:

> **Reset Review Schedule?**
> This removes all scheduled reviews and review history.
> Bookmarks, notes, collections, progress, highlights and personalization remain unchanged.
> [Cancel] [Reset]

The dialog is keyboard-accessible (`Escape` to cancel, `Enter` to confirm), and a status message appears after the reset confirming that other personalization data was preserved.

## Search Integration

The search bar already accepts arbitrary queries. P5B does not add new ranking logic; the spec's review queries (`due reviews`, `overdue`, `flashcards due`, `review today`, `scheduled review`) all resolve without crash. A future P5C can add a dedicated "review shortcuts" panel.

## Persistence and Reload Restoration

The session controller writes a small state marker to `nv_review_session_state` (a localStorage key) when a session starts. The marker contains:

```json
{
  "startedAt": "2026-06-24T22:00:00.000Z",
  "itemIds": ["flashcard:a", "artifact:b"],
  "gradedCount": 3
}
```

If the page reloads while a session is in progress, `resumeSession()` reads this marker and reopens the session with the same items. The session is **not** auto-resumed automatically — the user must click "Continue" or "Start Review" to reopen it.

The reset and merge/replace operations defined in P5 are unchanged. `resetSchedule()` clears only the review keys; the session marker is cleared by the `onClose` callback.

## Accessibility

The session UI implements:

- `role="dialog"` + `aria-modal="true"` on the overlay
- `aria-labelledby` pointing to the dialog title
- `aria-describedby` pointing to the progress label
- `aria-live="polite"` region for reveal and grade announcements
- `role="radiogroup"` on the quality buttons with `aria-pressed`
- `aria-keyshortcuts` on each shortcut-having button
- `role="progressbar"` with `aria-valuemin/max/now`
- `role="alertdialog"` on the exit confirmation
- Visible focus indicators (browser default + brand focus ring)
- No keyboard trap (Escape always returns control)
- Reduced motion compatibility via `@media (prefers-reduced-motion)`

## Responsive

- 390 px: dialog fills width, quality buttons stack to single column
- 768 px: dialog fits comfortably
- 1024 px: dialog centered, two-column quality grid
- 1440 px: dialog centered, auto-fit quality grid

No horizontal overflow at any tested viewport.

## Governance and Forbidden Terminology

P5B is the most learner-facing surface in the engine, so the forbidden terminology scan is enforced on:

- All four new files (`review-session.js`, `review-session-controller.js`, `review-settings-controller.js`, `review-session.css`)
- The Settings page additions
- The Workspace dashboard card

Forbidden: `mastery`, `competence`, `proficiency`, `XP`, `streak`, `score`, `level`, `points`, `passed as learner`, `failed as learner`, `skill score`, `IQ`, `grade prediction`. None of these appear in P5B source or rendered UI.

## Files Created

- `website/scripts/spaced-repetition/review-session.js`
- `website/scripts/spaced-repetition/review-session-controller.js`
- `website/scripts/spaced-repetition/review-settings-controller.js`
- `website/styles/review-session.css`
- `scripts/nv-1100-p5b-verify.js`

## Files Modified

- `website/scripts/spaced-repetition/index.js` — exports new factories
- `website/scripts/workspace/workspace-controller.js` — wires Start/Continue buttons
- `website/scripts/workspace/personalization-controller.js` — `data-review-launch` attribute
- `website/scripts/app.js` — registers settings controller
- `website/index.html` — adds review-session.css stylesheet
- `website/pages/settings.html` — adds Review Preferences card

## Preservation

- No curriculum hierarchy change
- No learning path, module, lesson, or artifact change
- No canonical ID change
- No Evidence Boundary change
- No agent contract change
- No Shared Knowledge schema change
- No Concept Layer schema change
- No Knowledge Graph topology change
- No SM-2 math change
- No existing personalization key affected
- No new external dependency

P5B is strictly additive on top of P5.
