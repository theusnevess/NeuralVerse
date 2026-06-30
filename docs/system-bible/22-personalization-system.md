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

- [Study Sessions](23-study-sessions.md)
- [Workspace Architecture](07-workspace-architecture.md)
- [Security Model](26-security-model.md)
