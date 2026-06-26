---
name: typescript-expert
description: Improve TypeScript and JavaScript code quality, typing, modularity, and maintainability.
---

# TypeScript Expert

## Purpose

Improve TypeScript and JavaScript quality, typing, modularity, determinism, and maintainability.

## When To Use

Use for TypeScript, JavaScript, React logic, Node.js, Vite, tooling, frontend state, and code-quality changes.

## Core Rules

- Inspect existing patterns before editing.
- Prefer clear and explicit typing when TypeScript is present.
- Avoid broad rewrites when a localized fix is sufficient.
- Remove dead code and unused imports when touched.
- Keep modules cohesive and responsibilities well separated.
- Preserve public APIs unless explicitly instructed otherwise.
- Avoid unnecessary dependencies.
- Prefer deterministic and testable implementations.
- Follow the project's established architecture and style.

## Workflow

1. Locate current patterns and related tests.
2. Define the smallest code change.
3. Preserve existing behavior and public contracts.
4. Run relevant build, lint, or test commands whenever practical.

## Validation

- Run targeted build, lint, typecheck, or tests when available and relevant.
- Verify changed logic remains deterministic.
- Verify no unused imports, dead code, or API drift were introduced.

## Report

- Files modified.
- Key architectural or typing decisions.
- Commands executed.
- Tests or validation performed.
- Potential risks or follow-up work.

## Forbidden

- Do not add dependencies for convenience.
- Do not widen public contracts without explicit need.
