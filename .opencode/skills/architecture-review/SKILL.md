---
name: architecture-review
description: Review NeuralVerse architecture, boundaries, modularity, and maintainability before implementation.
---

# Architecture Review

## Purpose

Protect NeuralVerse architecture, module boundaries, and maintainability during structural decisions.

## When To Use

Use before refactors, new module boundaries, cross-cutting changes, or documentation that changes architectural guidance.

## Core Rules

- Inspect existing files before proposing changes.
- Preserve current architecture unless explicitly asked to refactor.
- Prefer small, incremental changes.
- Do not introduce backend, database, auth, or APIs unless requested.
- Separate UI, state, data, and presentation concerns.
- Avoid duplication and dead abstractions.

## Workflow

1. Locate relevant architecture and implementation files.
2. Identify existing boundaries and responsibilities.
3. Define the smallest safe change.
4. Identify risks before editing.
5. Validate the affected path.

## Validation

- Verify proposed changes are backed by repository evidence.
- Verify unrelated app behavior is preserved.
- Verify no speculative abstraction was introduced.

## Report

- Current architecture understanding.
- Proposed minimal change.
- Files likely affected or changed.
- Risks.
- Verification commands.

## Forbidden

- Do not recommend architectural changes without repository evidence.
- Do not rewrite working architecture without explicit approval.
