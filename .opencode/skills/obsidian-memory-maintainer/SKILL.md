---
name: obsidian-memory-maintainer
description: Maintain NeuralVerse persistent project memory, canonical notes, ADRs, implementation state, and Obsidian-facing documentation.
---

# Obsidian Memory Maintainer

## Purpose

Keep durable NeuralVerse decisions, implementation state, and governance changes in persistent project memory instead of chat history.

## When To Use

Use for meaningful harness changes, `.opencode` skill changes, tooling setup, architecture decisions, workflow changes, governance updates, phase completion summaries, ADRs, and persistent limitations or risks.

Do not use for trivial copy edits, temporary debugging notes, failed experiments with no future impact, or generic summaries with no architectural value.

## Core Rules

- Update persistent memory only for meaningful decisions or implemented changes.
- Do not document speculative plans as completed work.
- Prefer concise English notes.
- Preserve canonical terminology.
- Avoid duplicating existing documentation.
- Record decisions, rationale, affected files, validation, and known limitations when memory docs are updated.
- Keep implementation state separate from future plans.
- Do not claim a tool, MCP, plugin, or workflow is adopted unless it was configured or explicitly approved.

## Workflow

1. Decide whether the change is durable enough for memory.
2. Locate the canonical memory or architecture note.
3. Record only completed decisions or current state.
4. Keep future plans separate from implemented state.

## Validation

- Verify memory updates match files actually changed.
- Verify speculative plans are not documented as completed.
- Verify terminology matches harness and architecture docs.

## Report

- Memory update type.
- Files or notes updated.
- Decision recorded.
- What was intentionally not documented.
- Remaining knowledge risk.

## Forbidden

- Do not create memory noise for transient work.
- Do not treat chat history as canonical memory.
