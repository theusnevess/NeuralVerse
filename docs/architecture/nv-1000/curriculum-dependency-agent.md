# NV-1000-A2: Curriculum & Dependency Agent

**Version:** 1.0
**Status:** READY
**Date:** 2026-06-22

## Overview

The Curriculum & Dependency Agent (NV-1000-A2) is NeuralVerse's curriculum-aware agent. It provides structured, multi-section responses for 10 educational modes related to learning path navigation, prerequisite inspection, dependency analysis, skip impact assessment, and curriculum context — all grounded in the NV-800 canonical curriculum data.

## Architecture

```
curriculum-dependency-agent.js    — Core agent: 10 modes, 10 intents, lookup maps, public API
├── curriculum-index.json          — NV-800 canonical data (19 paths, 40 modules, 120 lessons, 600 artifacts)
└── agent-context-builder.js       — Reads frontend state for position context
```

The agent fetches `curriculum-index.json` at initialization and builds in-memory lookup maps for O(1) resolution of curriculum entities.

## Educational Modes

| Mode | Description |
|------|-------------|
| `dependency` | Explains prerequisites and rationale for studying concepts before current topic |
| `next` | Recommends the next learning step based on current position |
| `previous` | Shows what comes before the current topic |
| `skip` | Analyzes consequences of skipping the current topic |
| `summary` | Provides curriculum summary and placement context |
| `context` | Shows current position within the curriculum hierarchy |
| `route` | Generates a learning route/path through the curriculum |
| `neighbor` | Discovers sibling lessons and related content |
| `crosslink` | Explains connections across different learning paths |
| `hierarchy` | Visualizes the curriculum tree structure |

## Intent Categories

| Intent | Trigger Examples | Priority |
|--------|-----------------|----------|
| `dependency` | "What should I study before this?", "Prerequisites for..." | 10 |
| `next` | "What should I learn next?", "Next step after..." | 9 |
| `previous` | "What comes before this?", "Previous lesson" | 8 |
| `skip` | "Can I skip this?", "What happens if I skip..." | 7 |
| `summary` | "Summarize this module", "Overview of the path" | 6 |
| `context` | "Where am I in the curriculum?", "Current position" | 5 |
| `route` | "Create a learning route", "Plan my path" | 4 |
| `neighbor` | "What's related to this?", "Similar topics" | 3 |
| `crosslink` | "How does this connect to...", "Cross-path relationship" | 2 |
| `hierarchy` | "Show the tree structure", "Visualize curriculum" | 1 |

Intent detection is priority-ordered: more specific intents are checked before generic ones.

## Lookup Maps

On initialization, the agent builds four Maps from the curriculum index:

| Map | Key | Value | Purpose |
|-----|-----|-------|---------|
| `pathsById` | Path ID | Path object | O(1) path lookup |
| `modulesById` | Module ID | Module object | O(1) module lookup |
| `lessonsById` | Lesson ID | Lesson object | O(1) lesson lookup |
| `pathByModuleId` | Module ID | Path ID | Find which path a module belongs to |
| `moduleByLessonId` | Lesson ID | Module ID | Find which module a lesson belongs to |
| `siblingMaps` | Entity type | Sibling arrays | Precomputed siblings for each level |

## Response Structure

Every response from the agent includes:

```json
{
  "agentId": "curriculum-dependency",
  "agentName": "Curriculum & Dependency Agent",
  "mode": "dependency|next|...",
  "topic": "resolved topic title",
  "sections": [...],
  "timestamp": "ISO-8601",
  "status": "operational",
  "disclaimer": null
}
```

Each section includes a `title`, `content` (markdown), and `type` (text | hierarchy | tree).

## Public API

The agent exposes methods for direct integration with the Didactic Architecture Agent:

| Method | Returns | Description |
|--------|---------|-------------|
| `getPrerequisites(lessonId)` | `Lesson[]` | Lessons that precede the given lesson in its module |
| `getNeighbors(lessonId)` | `{ previous, next, siblings }` | Adjacent lessons in the module |
| `getDependencyExplanation(context)` | `{ sections }` | Full dependency response |
| `generateRoute(context)` | `Section[]` | Learning route sections |
| `getCurriculumContext(context)` | `{ sections }` | Curriculum position response |
| `getIndexStats()` | `{ paths, modules, lessons, artifacts }` | Curriculum data statistics |

## Guardrails Compliance

- **Read-only**: Agent never modifies curriculum data
- **No lifecycle changes**: Agent never alters NV-800 canonical status
- **No scores**: Agent never generates scores or grades
- **Evidence boundary**: Agent reports what data is available, not what it claims
- **No external calls**: All data is client-side only

## Panel Integration

The agent is registered with the Didactic Orchestrator and invoked via `orchestrator.invokeAgent('curriculum-dependency', query, options)`.

The panel controller displays 10 curriculum-specific quick actions:
- Show Prerequisites
- Show Next Steps
- Explain Position
- Dependency Chain
- Can I Skip This?
- Curriculum Summary
- Learning Route
- Related Concepts
- Parent Hierarchy
- Neighbor Lessons

Quick actions are shown/hidden based on the selected agent (curriculum-dependency shows curriculum actions, didactic-architecture shows didactic actions).

## Verification

Run verification:
```bash
node scripts/nv-1000-a2-verify.js
```

Expected: 70/70 checks passed.

## Changelog

### v1.0 (2026-06-22)
- Initial release
- 10 educational modes
- 10 intent categories with priority ordering
- Lookup maps for O(1) curriculum resolution
- Public API for Didactic Architecture Agent integration
- Panel quick actions (10 curriculum-specific)
- Guardrails compliance
- 70/70 Playwright verification
