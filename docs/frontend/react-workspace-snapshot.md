# React Workspace Snapshot

## Purpose

`NV-500-UX-007E.7` adds a compact Workspace Snapshot and Research Dashboard to the top of the Retrieval Workspace.

It provides orientation without replacing navigation or controls.

## React Island Boundary

The island is:

```text
NvWorkspaceSnapshot
```

JavaScript owns:

- current query
- selected reference
- pinned references
- recent references
- saved queries
- evidence timeline
- knowledge trail
- persistence
- graph and retrieval behavior

React owns:

- dashboard layout
- stat chips
- session status presentation
- knowledge pulse presentation
- mini activity timeline presentation

## Data Contract

The JavaScript layer passes plain data:

```js
{
  snapshot: {
    currentQuery,
    selectedReference,
    focusedCluster,
    lastActivity,
    resumeContext
  },
  session: {
    isActive,
    lastUpdate,
    progressHtml
  },
  stats: [],
  pulse: {
    summary,
    microvisuals
  },
  timeline: [],
  isEmpty
}
```

Callbacks remain explicit:

```js
{
  onRunSearch
}
```

## Fallback

`renderResearchSnapshot()` renders a compact HTML fallback before mounting React. If the React bundle or bridge is unavailable, users still see current context and artifact count.

## QA

Validate that:

- current query updates after search
- selected reference updates after opening a result
- pinned count updates after pin/unpin
- evidence count updates after compilation
- knowledge trail summary updates after actions
- no horizontal overflow at 390, 768, 1024, and 1440 px

## Forbidden Responsibilities

The snapshot must not:

- run retrieval logic
- mutate persistence directly
- own graph state
- own evidence state
- replace navigation
- poll or continuously update timers
