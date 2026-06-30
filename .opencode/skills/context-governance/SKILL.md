---
name: context-governance
description: Control context scope, repository inspection strategy, and token economy for NeuralVerse agentic development tasks.
---

# Context Governance

## Purpose

Bound repository inspection so agents gather enough evidence to act without loading irrelevant files, generated artifacts, duplicated documentation, or stale outputs.

## When To Use

Use before audits, refactors, multi-file changes, medium or large tasks, and any task where scope is unclear.

## Core Rules

- Locate before reading.
- Confirm before editing.
- Inspect before refactoring.
- Validate before concluding.
- Read only files directly relevant to the task.
- Avoid opening large files unless there is a specific reason.
- Do not read generated artifacts, caches, build outputs, logs, screenshots, backups, or `node_modules`.
- Do not repeat canonical context already available in local instructions.
- Expand scope only when the current evidence is insufficient.

## Workflow

1. `git status --short`
2. **Repository Discovery** — locate code before reading:
   - `fd` for file discovery by name/pattern.
   - `rg` for text, symbols, routes, styles, tests, and docs.
   - `ast-grep` for structural JavaScript or TypeScript searches when useful.
3. Focused file reads (only after discovery).
4. `git diff --` after edits.
5. Targeted validation commands.

## Forbidden Context Sources

Avoid unless explicitly required:

- `.opencode/backups/`
- `node_modules/`
- `.git/`
- `dist/`
- `build/`
- `.vite/`
- coverage folders
- temporary screenshots
- large generated reports
- package lock files except dependency tasks
- backup folders
- binary assets unless the task is asset-related
- `docs/system-bible/` unless the task is documentation or canonical architecture review

## Validation

- Small tasks: 1 to 3 relevant files, no broad architecture scan.
- Medium tasks: bounded affected set, usually 3 to 8 files plus focused validation.
- Large tasks: explicit affected-scope list, staged implementation, validation plan before editing.
- Audits: inspect contracts and docs first; escalate only when evidence requires it.

## Report

- Context scope used.
- Files inspected.
- Files intentionally ignored.
- Why the selected scope was sufficient.
- Remaining uncertainty.

## Forbidden

- Do not begin with broad file reads.
- Do not scan the entire repository without justification.
- Do not inspect forbidden context sources unless the task explicitly requires them.
