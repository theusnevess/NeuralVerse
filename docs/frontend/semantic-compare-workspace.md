# Semantic Compare Workspace

## Purpose

`NV-500-UX-007E.9` adds a Semantic Compare Workspace inside the existing Retrieval Workspace Compare mode.

It helps compare 2-4 references by metadata, shared concepts, unique relationships, evidence contribution, and graph position.

## Selection Limits

- Minimum: 2 references for full comparison.
- Maximum: 4 references.
- A fifth reference is blocked with non-modal feedback.
- Compare selection is persisted via `neuralverse.retrievalWorkspace.v1` localStorage key (see comparative-research-mode.md for persistence details).

## Entry Points

References can be added from existing surfaces:

- Discovery Panel action.
- Hover Preview action.
- Context Menu action.
- Reference Inspector action.
- Pinned References action.
- Recently Viewed action.
- Evidence supporting reference cards.
- Graph node context action.

## Payload Contract

JavaScript builds a plain payload:

```js
{
  items: [],
  shared: {
    concepts: [],
    types: [],
    relationships: []
  },
  differences: [],
  graphContext: [],
  evidenceContext: [],
  feedback: '',
  limit: 4
}
```

The payload uses only existing reference metadata, keywords, relationship data, current evidence data, graph context, and session state.

## Ownership Boundary

JavaScript owns compare selection, add/remove/clear logic, payload construction, callbacks, persistence decisions, retrieval data, graph data, and evidence data.

React owns comparison layout, accessible sections, buttons, chips, metrics, local presentation, and responsive rendering.

```text
Data in. Callbacks out. No domain ownership.
```

## Actions

- `Open Reference`
- `Pin / Unpin`
- `Compile Evidence`
- `Remove`
- `Clear Compare`

## Evidence Compiler Compatibility

The Evidence Compiler is not modified. `Compile Evidence` compiles from the selected compared reference using the existing reference compilation path.

The phase does not introduce multi-reference compiler input.

## Fallback Behavior

`renderCompareMode()` renders a basic fallback compare surface before mounting `NvCompareWorkspace`. If React fails, users can still see selected references and clear/open rows from the fallback.

## QA Requirements

- Add 2-4 references and open Compare mode.
- Verify fifth reference is blocked with feedback.
- Remove and clear compare selection.
- Verify shared concepts, unique relationships, evidence contribution, and graph position sections.
- Verify no evidence state displays `No active evidence compilation.`
- Validate no horizontal overflow at 390, 768, 1024, and 1440 px.
- Confirm `console.error = 0` and failed requests `= 0`.
- Confirm runtime retrieval tests and React build pass.
