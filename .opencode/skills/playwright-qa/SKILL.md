---
name: playwright-qa
description: Run strict Playwright-based QA for NeuralVerse routes, UI behavior, responsiveness, and console errors.
---

# Playwright QA

## Purpose

Validate NeuralVerse routes, UI behavior, responsiveness, interaction states, and browser console health.

## When To Use

Use for UI changes, route behavior, graph interaction, accessibility validation, visual regressions, and browser-only bugs.

## Core Rules

- Start or reuse the local dev/static server.
- Test relevant routes and affected UI states.
- Check desktop, tablet, and mobile widths when layout changed.
- Inspect console errors and warnings.
- Validate keyboard accessibility where relevant.
- Validate hover, focus, selected, and empty states when relevant.

## Workflow

1. Identify affected routes and states.
2. Start or reuse the appropriate local server.
3. Exercise the smallest representative viewport/state set.
4. Inspect console output.
5. Capture failures as actionable findings.

## Validation

- Verify affected routes render without blocking errors.
- Verify relevant interactions still work.
- Verify responsive behavior for layout changes.

## Report

- Routes tested.
- Viewports tested.
- Commands run.
- Bugs found.
- Bugs fixed.
- Remaining risks.

## Forbidden

- Do not mark UI work complete if known visual or console issues remain unreported.
- Do not run broad browser QA when a focused route check is sufficient.
