---
name: accessibility-audit
description: Audit and improve keyboard navigation, focus behavior, semantic HTML, ARIA usage, and contrast.
---

# Accessibility Audit

## Purpose

Improve keyboard navigation, focus behavior, semantics, ARIA usage, contrast, and screen reader clarity.

## When To Use

Use for accessibility defects, interactive UI changes, focus management, dialogs, controls, forms, and route-level UI validation.

## Core Rules

- Prefer semantic HTML over unnecessary ARIA.
- Ensure interactive elements are keyboard reachable.
- Ensure visible focus states.
- Do not remove accessibility labels without replacement.
- Avoid duplicate or misleading ARIA attributes.
- Check contrast and readable text hierarchy.
- Preserve screen reader clarity.

## Workflow

1. Identify affected controls and expected keyboard behavior.
2. Inspect semantics, labels, focus order, and state announcements.
3. Apply the smallest accessible fix.
4. Validate keyboard and assistive-technology-facing behavior where practical.

## Validation

- Check Tab, Shift+Tab, Enter, Space, Escape, and arrow keys when relevant.
- Check visible focus and readable contrast.
- Check ARIA only when semantic HTML is insufficient.

## Report

- Accessibility issues found.
- Files changed.
- Keyboard behavior checked.
- ARIA or semantic changes made.
- Remaining accessibility risks.

## Forbidden

- Do not use ARIA to paper over incorrect semantics.
- Do not remove labels, landmarks, or focus states without replacement.
