# ACCESSIBILITY_MATRIX.md

## Purpose

This file defines accessibility validation requirements for NeuralVerse.

No component, navigation behavior, or motion behavior may be marked complete without accessibility validation.

---

## Validation Rules

- Accessibility protects access to knowledge.
- Every interactive component must support keyboard usage.
- Focus must be visible.
- Semantic structure must be valid.
- Screen-reader behavior must be defined.
- Motion-sensitive behavior must support reduced motion.
- Color alone must not carry meaning.
- Completion requires accessibility validation.

---

## Validation Entry Template

```text
Target ID:
Target Type:
Related Component or Contract:
Keyboard Requirements:
Focus Requirements:
Semantic Requirements:
Screen Reader Requirements:
Color Contrast Requirements:
Motion Sensitivity Requirements:
Responsive Accessibility Requirements:
Error Handling Requirements:
Acceptance Criteria:
Validation Method:
Reviewer:
Status:
Last Reviewed:
```

---

## Approved Validation Entries

### Button

```text
Target ID: a11y-button
Target Type: Component
Related Component or Contract: Button
Keyboard Requirements: Enter and Space activation.
Focus Requirements: Visible focus state required.
Semantic Requirements: Native button or equivalent semantic role required.
Screen Reader Requirements: Accessible name required.
Color Contrast Requirements: Must satisfy approved contrast rules.
Motion Sensitivity Requirements: Focus transition must support reduced motion.
Responsive Accessibility Requirements: Touch target must remain usable.
Error Handling Requirements: Not applicable unless used in form submission.
Acceptance Criteria: Keyboard, focus, semantic, contrast, and accessible name checks pass.
Validation Method: Manual review plus automated checks where applicable.
Reviewer: UX Architect
Status: Approved
Last Reviewed: Initial bootstrap
```

### Input

```text
Target ID: a11y-input
Target Type: Component
Related Component or Contract: Input
Keyboard Requirements: Full keyboard entry and editing.
Focus Requirements: Visible focus state required.
Semantic Requirements: Programmatic label association required.
Screen Reader Requirements: Label, helper text, and error text must be announced when applicable.
Color Contrast Requirements: Text, border, placeholder, and error states must satisfy contrast rules.
Motion Sensitivity Requirements: Focus transition must support reduced motion.
Responsive Accessibility Requirements: Field remains usable on mobile.
Error Handling Requirements: Error state must be programmatically associated.
Acceptance Criteria: Label, focus, error, keyboard, and screen-reader checks pass.
Validation Method: Manual review plus automated checks where applicable.
Reviewer: UX Architect
Status: Approved
Last Reviewed: Initial bootstrap
```

### Navigation Rail

```text
Target ID: a11y-navigation-rail
Target Type: Navigation Component
Related Component or Contract: Navigation Rail
Keyboard Requirements: All navigation items keyboard reachable.
Focus Requirements: Visible focus state required.
Semantic Requirements: Navigation landmark required.
Screen Reader Requirements: Active item must be announced or programmatically determinable.
Color Contrast Requirements: Text and active indicators must satisfy contrast rules.
Motion Sensitivity Requirements: Navigation transition must support reduced and disabled motion.
Responsive Accessibility Requirements: Mobile navigation must preserve labels or accessible names.
Error Handling Requirements: Not applicable.
Acceptance Criteria: Landmark, keyboard, focus, active state, and responsive checks pass.
Validation Method: Manual review plus automated checks where applicable.
Reviewer: UX Architect
Status: Approved
Last Reviewed: Initial bootstrap
```

### Search

```text
Target ID: a11y-search
Target Type: Navigation/Input Pattern
Related Component or Contract: Search
Keyboard Requirements: Input, result navigation, selection, and escape behavior required.
Focus Requirements: Predictable focus movement between input and results.
Semantic Requirements: Search role or labeled search region required.
Screen Reader Requirements: Results must be announced or discoverable.
Color Contrast Requirements: Text, result, active result, and focus states must satisfy contrast rules.
Motion Sensitivity Requirements: Search invocation supports reduced and disabled motion.
Responsive Accessibility Requirements: Mobile search remains reachable and usable.
Error Handling Requirements: Empty and no-result states must be clear.
Acceptance Criteria: Search input, result list, keyboard, and screen-reader behavior pass.
Validation Method: Manual review plus automated checks where applicable.
Reviewer: UX Architect
Status: Approved
Last Reviewed: Initial bootstrap
```

### Command Palette

```text
Target ID: a11y-command-palette
Target Type: Navigation Pattern
Related Component or Contract: Command Palette
Keyboard Requirements: Open, type, navigate, confirm, and close by keyboard.
Focus Requirements: Focus managed while open and restored when closed.
Semantic Requirements: Dialog or equivalent pattern required when overlay is used.
Screen Reader Requirements: Palette title and active result must be announced or discoverable.
Color Contrast Requirements: Text, active result, and focus indicators must satisfy contrast rules.
Motion Sensitivity Requirements: Invocation supports reduced and disabled motion.
Responsive Accessibility Requirements: Usable on mobile without hidden unreachable actions.
Error Handling Requirements: Empty result state required.
Acceptance Criteria: Focus management, keyboard loop, escape close, and announcement checks pass.
Validation Method: Manual review plus automated checks where applicable.
Reviewer: UX Architect
Status: Approved
Last Reviewed: Initial bootstrap
```

---

## Review Log

```text
Initial bootstrap:
Created as part of NV-023-TASK-001.
```
