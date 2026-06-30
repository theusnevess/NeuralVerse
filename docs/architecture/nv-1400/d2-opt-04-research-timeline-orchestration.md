# D2-OPT-04 — Research Timeline Orchestration

## Purpose

The Research Timeline Orchestration Layer introduces deterministic chronological metadata for governed research artifacts. It exposes canonical chronological relationships that downstream agents may consume.

This layer does NOT explain history, infer historical importance, or replace lineage. It only organizes governed scientific timeline metadata.

## Architecture

### Core Components

| Component | Purpose |
|-----------|---------|
| `ResearchAgentContract.ts` | Extended with timeline types |
| `TimelineKernel.ts` | Timeline orchestration functions |
| `TimelineValidation.ts` | Deterministic validation |
| `index.ts` | Public API exports |

### Canonical Principle

Timeline represents chronological ordering. Timeline does NOT represent scientific ancestry. Timeline does NOT replace lineage.

Lineage answers: "Where did this idea come from?"
Timeline answers: "When did this event occur?"

These are different concepts.

## Timeline Model

The timeline is a deterministic chronological structure.

### Properties

- **Immutable**: Timeline cannot be modified after composition
- **Ordered**: Events are chronologically sorted
- **Governed**: All metadata is governed
- **Evidence-backed**: All events reference canonical evidence

### Timeline Components

- **Events**: Chronological events
- **Nodes**: Timeline nodes derived from events

## Canonical Event Types

### Supported Event Types

| Event Type | Description |
|------------|-------------|
| `publication` | General publication |
| `conference_presentation` | Conference presentation |
| `journal_publication` | Journal publication |
| `book_release` | Book release |
| `dataset_release` | Dataset release |
| `benchmark_release` | Benchmark release |
| `framework_release` | Framework release |
| `standard_release` | Standard release |
| `major_revision` | Major revision |
| `deprecation` | Deprecation event |
| `superseded` | Superseded event |
| `historical_milestone` | Historical milestone |

### Event Type Rules

- All event types are explicit, never inferred
- Unknown event types fail validation
- Events require evidence backing
- Events are chronologically ordered

## Chronological Ordering

Timeline ordering is deterministic.

### Ordering Priority

1. `publicationYear`
2. `publicationMonth` (if available)
3. `publicationDay` (if available)
4. Canonical deterministic identifier (`eventId`)

### Ordering Rules

- Never use runtime clocks
- Never reorder arbitrarily
- Deterministic for identical inputs
- Consistent across runs

## Provenance Requirements

Every timeline event must expose provenance:

```typescript
interface ResearchTimelineProvenance {
  referenceId: string;
  eventType: ResearchTimelineEventType;
  source: string;
  governanceStatus: ResearchGovernanceStatus;
  publicationYear: number;
  publicationMonth?: number;
  publicationDay?: number;
  rationale: string;
}
```

Timeline entries without provenance must fail validation.

## Validation Strategy

### Validation Codes

| Code | Description |
|------|-------------|
| `TIMELINE_UNKNOWN_EVENT` | Unknown event type |
| `TIMELINE_DUPLICATE_EVENT` | Duplicate event detected |
| `TIMELINE_INVALID_DATE` | Invalid date values |
| `TIMELINE_INVALID_ORDER` | Invalid chronological order |
| `TIMELINE_MISSING_REFERENCE` | Missing reference |
| `TIMELINE_MISSING_PROVENANCE` | Missing provenance |
| `TIMELINE_INVALID_STATUS` | Invalid governance status |
| `TIMELINE_EMPTY` | Empty timeline |
| `TIMELINE_UNSUPPORTED_EVENT` | Unsupported event type |
| `TIMELINE_BROKEN_SEQUENCE` | Broken sequence between events and nodes |

### Timeline Integrity Rules

1. **Deterministic ordering**: Events have consistent chronological order
2. **No duplicated events**: Each event is unique
3. **Valid chronological references**: All dates are valid
4. **Supported event types**: Only canonical event types allowed
5. **Governed provenance**: Every event has provenance
6. **No broken sequence**: Events and nodes have matching counts

## Deterministic Guarantees

1. **Reproducibility**: Identical inputs → identical outputs
2. **No random**: `Math.random` not used anywhere
3. **No time**: `Date.now` not used for ordering or ID generation
4. **No mutation**: Input objects are never modified
5. **No fabrication**: Missing data produces validation errors
6. **Traceable**: Every artifact includes deterministic trace metadata

## Relationship with Evidence

The Timeline Kernel integrates with the D2-OPT-01 Evidence Kernel:

- Every timeline event references canonical evidence
- Evidence references must be valid
- Timeline metadata is backed by governed evidence

## Relationship with Lineage

The Timeline Kernel is independent from the D2-OPT-02 Lineage Orchestration:

- Timeline does NOT replace lineage
- Timeline answers "when", lineage answers "where from"
- Both can coexist for the same research artifact
- Timeline never infers lineage

## Out-of-Scope Items

This phase does NOT implement:

- Lineage inference
- Comparison engine
- Benchmark mapping
- Dataset mapping
- Reading paths
- Educational summaries
- Recommendation systems
- Paper retrieval
- Paper parsing
- Citation counting
- Historical narrative generation
- LLM calls
- Web search

## Runtime Limitations

- No network access
- No filesystem access
- No external libraries
- No browser APIs
- No LLM calls
- No paper parsing
- No web search
- No API calls

## Expected Deliverables

### Files Created

| File | Purpose |
|------|---------|
| `TimelineKernel.ts` | Timeline orchestration functions |
| `TimelineValidation.ts` | Deterministic validation |
| `TimelineKernel.test.ts` | Test suite |
| `d2-opt-04-research-timeline-orchestration.md` | This documentation |

### Files Modified

| File | Purpose |
|------|---------|
| `ResearchAgentContract.ts` | Extended with timeline types |
| `index.ts` | Extended with timeline exports |

### Contract Extensions

- `ResearchTimelineEventType` — canonical event type enum
- `ResearchChronologicalReference` — chronological reference structure
- `ResearchTimelineEvent` — timeline event structure
- `ResearchTimelineNode` — timeline node structure
- `ResearchTimeline` — timeline structure
- `ResearchTimelineDecision` — timeline decision structure
- `ResearchTimelineTrace` — timeline trace structure
- `ResearchTimelineInput` — input data structure
- `ResearchArtifactWithTimeline` — artifact with timeline structure
- `ResearchTimelineValidationResult` — validation result structure
- `ResearchTimelineProvenance` — provenance structure

### Chronological Ordering Strategy

Uses deterministic sorting based on:

1. `publicationYear` — primary sort
2. `publicationMonth` — secondary sort (if available)
3. `publicationDay` — tertiary sort (if available)
4. `eventId` — final sort for deterministic ordering

### Provenance Validation

Every timeline event must expose provenance:

- `referenceId` — reference ID
- `eventType` — event type
- `source` — source of event
- `governanceStatus` — governance status
- `publicationYear` — publication year
- `publicationMonth` — publication month (optional)
- `publicationDay` — publication day (optional)
- `rationale` — rationale for event

Timeline entries without provenance must fail validation.

### Tests Created

- Valid timeline
- Valid chronological ordering
- Duplicate event
- Unsupported event type
- Invalid chronology
- Missing provenance
- Missing reference
- Empty timeline
- Deterministic ordering
- Immutable input
- Identical output
- No generated content
- No inferred chronology
- No runtime clocks
- No network usage
- Timeline independent from lineage

## Phase Status

**APPROVED_FOR_HUB_REVIEW** — All code-level audits pass. Runtime tests blocked by environment only.
