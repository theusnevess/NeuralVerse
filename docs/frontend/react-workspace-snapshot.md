# React Workspace Snapshot

## Purpose

`NV-500-UX-007E.8` extends the compact Workspace Snapshot into the Living Research Workspace at the top of the Retrieval Workspace.

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
- active investigation presentation
- research health presentation
- session timeline presentation
- knowledge pulse presentation
- valid quick action buttons

## Data Contract

The JavaScript layer passes plain data:

```js
{
  activeInvestigation: {
    currentQuery,
    selectedReferenceTitle,
    selectedReferenceId,
    focusedCluster,
    explorationDepth,
    activeMode,
    lastEventLabel
  },
  researchHealth: {
    evidenceCount,
    uniqueVisitedCount,
    pinnedCount,
    savedQueryCount,
    trailEventCount,
    subgraphDensityLabel
  },
  timeline: [],
  pulse: {
    summary,
    trailShape,
    sessionProgressSegments,
    confidenceLabel,
    connectivityLabel,
    microvisuals
  },
  actions: {
    canResume,
    canCompileCurrentEvidence,
    canSaveQuery,
    canOpenPinned,
    canClearSession
  },
  isEmpty
}
```

Callbacks remain explicit:

```js
{
  onResumeInvestigation,
  onCompileCurrentEvidence,
  onSaveQuery,
  onOpenPinned,
  onClearSession,
  onOpenTimelineEvent
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
- invalid quick actions are hidden
- timeline shows at most five events
- fallback HTML remains useful when React is unavailable
- no horizontal overflow at 390, 768, 1024, and 1440 px

## Forbidden Responsibilities

The snapshot must not:

- run retrieval logic
- mutate persistence directly
- own graph state
- own evidence state
- replace navigation
- poll or continuously update timers
- read or write localStorage from React
- invent quality scores or analytics
