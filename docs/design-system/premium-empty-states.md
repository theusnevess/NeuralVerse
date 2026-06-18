# Premium Empty States

## Purpose

Premium empty states orient the researcher when a surface has no current data. They explain where the user is, why nothing is shown, and what useful action comes next.

## Canonical Structure

Every empty state follows the same order:

1. Scientific illustration
2. Short title
3. One or two explanatory sentences
4. Primary CTA
5. Optional secondary CTA

The illustration is decorative and must be marked with `aria-hidden="true"`. The title, description, and CTA carry the meaning.

## Visual Rules

- Use official scientific SVG assets only.
- Keep copy short and instructional.
- Keep CTAs focused on the next useful research action.
- Use Motion Foundation classes for entry motion only.
- Use design tokens for color, spacing, radius, typography, and motion.
- Do not use ad hoc SVGs, emoji placeholders, loading language, or error-style copy.

## Motion

Allowed motion is limited to a short fade or slide reveal using NV-600.1 primitives. Reduced motion must disable decorative movement and preserve the content instantly.

## Accessibility

Empty states use semantic status regions where appropriate, keyboard-reachable CTAs, and readable text alternatives. No task-critical information may be available only through an icon.
