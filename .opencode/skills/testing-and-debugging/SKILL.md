---
name: testing-and-debugging
description: Diagnose bugs, run focused tests, inspect logs, and fix regressions safely.
---

# Testing and Debugging

## Purpose

Diagnose failures, reproduce regressions, fix bugs minimally, and validate behavior honestly.

## When To Use

Use for failures, regressions, flaky behavior, console errors, broken tests, and validation-focused tasks.

## Core Rules

- Reproduce the issue before fixing when possible.
- Inspect logs and errors carefully.
- Prefer minimal fixes.
- Add or update tests only when useful.
- Do not hide errors.
- Do not mark complete unless validation was run or a blocker is reported.
- If tests cannot be run, explain why.

## Workflow

1. Identify expected behavior.
2. Reproduce actual behavior when feasible.
3. Locate the likely source.
4. Apply a minimal fix.
5. Run targeted validation.
6. Report remaining risk.

## Validation

- Run the smallest relevant test, build, or browser check.
- Verify the fix addresses the reproduced failure.
- Verify no nearby regression was introduced when practical.

## Report

- Failure or symptom.
- Root cause or best-supported cause.
- Files changed.
- Validation run.
- Remaining risk.

## Forbidden

- Do not suppress errors without explaining the underlying cause.
- Do not claim a fix without validation evidence.
