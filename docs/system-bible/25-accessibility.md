# Accessibility

## Overview

NeuralVerse is designed to be usable by keyboard-only users, screen reader users, and users with motion sensitivity. Accessibility is verified through rigorous audit scripts and Extreme Audit certification.

## Landmarks

The HTML shell uses semantic landmark elements:
- `<header>` — Global header with branding and controls
- `<nav>` — Navigation rail
- `<main>` — Main workspace content area
- `<aside>` — Agent Assist panel
- `<footer>` — Page footer (when present)

Each landmark has an appropriate `aria-label` when needed for disambiguation.

## Keyboard Navigation

All interactive elements are keyboard accessible:

| Control | Keyboard Interaction |
|---------|---------------------|
| Navigation rail | Tab to enter, Arrow keys within, Enter to activate |
| Search modal | Ctrl+K opens, Escape closes, Arrow keys navigate results |
| Agent panel | Tab through controls, Ctrl+Enter submits, Escape closes |
| Curriculum filters | Tab between buttons, Enter/Space to toggle |
| Reading page | Home/End for scroll, Escape for mobile TOC |
| Modals | Focus trapped within, Escape closes, focus returns on close |

## Dialogs

The search modal uses the native `<dialog>` element:
- `showModal()` opens with focus trap
- Escape closes automatically
- Focus returns to trigger button on close
- Backdrop click closes the dialog

## Focus Management

- Focus is moved to relevant content after page transitions
- Agent panel manages focus between open/close states
- Search modal returns focus to trigger
- Reading experience preserves scroll position on navigation back
- Skip-to-content link is the first focusable element

## ARIA Usage

Key ARIA patterns:

| Element | ARIA |
|---------|------|
| Search results | `role="listbox"`, `role="option"`, `aria-selected` |
| Filter buttons | `aria-pressed` for toggle state |
| Agent panel | `aria-hidden` + `inert` when closed |
| Navigation rail | `aria-current="page"` for active link |
| Dynamic content | `aria-live="polite"` for updates |
| Icons | `aria-hidden="true"` with text alternatives |
| Modals | `role="dialog"`, `aria-modal="true"` |

## Responsive Accessibility

- All breakpoints maintain keyboard accessibility
- Touch targets are minimum 44x44px on mobile
- Navigation collapses to hamburger menu — still keyboard accessible
- Tables remain readable with horizontal scroll wrappers
- Cards reflow without losing focus order

## Reduced Motion

All animations respect the `prefers-reduced-motion` media query:
- Route transitions become instant
- Card hover lifts are disabled
- Neural galaxy animation intensity is reduced or disabled
- All CSS transitions use `@media (prefers-reduced-motion: no-preference)`

## Audit Verification

Accessibility is verified through:
- **Extreme Audit scripts**: Check for `aria-hidden` focusable descendants, keyboard navigability, focus management
- **Accessibility skill**: Dedicated audit pattern checking contrast, landmarks, ARIA usage, and keyboard navigation
- **Master Certification Gate**: Verifies zero critical/high accessibility violations before certification

## Related Chapters

- [UI Design Language](24-ui-design-language.md)
- [Testing and Certification](28-testing-and-certification.md)
- [Security Model](26-security-model.md)
