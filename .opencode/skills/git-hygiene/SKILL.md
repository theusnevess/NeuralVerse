---
name: git-hygiene
description: Maintain safe Git workflow, clean diffs, and clear implementation summaries.
---

# Git Hygiene

## Purpose

Keep diffs focused, protect user work, and make final reporting traceable.

## When To Use

Use before finalizing any significant task or whenever files are changed.

## Core Rules

- Check git status before and after changes.
- Do not commit unless explicitly asked.
- Keep diffs focused.
- Never revert or modify user changes unless explicitly requested.
- Do not include generated junk, caches, logs, screenshots, or test artifacts unless requested.
- Report changed files, commands run, validation, and unresolved risks.

## Workflow

1. Inspect current status.
2. Review relevant diffs after edits.
3. Confirm only intended files were changed.
4. Report validation honestly.

## Validation

- Verify no unrelated project files were modified by this task.
- Verify no generated artifacts were added unintentionally.
- Verify commits were not made unless requested.

## Report

- Changed files.
- Commands run.
- Tests or validation passed/failed.
- Unresolved risks.

## Forbidden

- Do not claim a commit was made unless it was actually made.
- Do not hide dirty worktree state.
