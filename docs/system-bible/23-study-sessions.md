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

- [Personalization System](22-personalization-system.md)
- [Workspace Architecture](07-workspace-architecture.md)
- [Known Limitations](30-known-limitations.md)
