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

---

## M2 Foundation Component Validation Entries

### F1 — Divider

```text
Target ID: a11y-f1-divider
Target Type: Component
Related Component: Divider
Keyboard Requirements: Not applicable — not interactive.
Focus Requirements: Not applicable.
Semantic Requirements: role="separator" when meaningful; aria-hidden="true" when decorative.
Screen Reader Requirements: Hidden when decorative; announced as separator when structural.
Color Contrast Requirements: Not applicable for structure only.
Motion Sensitivity Requirements: none
Responsive Accessibility Requirements: Must not alter page structure on resize.
Error Handling Requirements: Not applicable.
Acceptance Criteria: Correct role or aria-hidden applied per usage context.
Validation Method: Manual review.
Reviewer: UX Architect
Status: Approved
Last Reviewed: NV-023-TASK-003
```

### F2 — Badge

```text
Target ID: a11y-f2-badge
Target Type: Component
Related Component: Badge
Keyboard Requirements: Not applicable — not interactive.
Focus Requirements: Not applicable.
Semantic Requirements: role="status" for live state; no role when purely categorical.
Screen Reader Requirements: Badge text must be readable as text content.
Color Contrast Requirements: Label text on badge surface must satisfy AA minimum.
Motion Sensitivity Requirements: none
Responsive Accessibility Requirements: Label must remain readable; no truncation without explicit constraint.
Error Handling Requirements: Not applicable.
Acceptance Criteria: Color alone does not carry meaning; label text always present.
Validation Method: Manual review.
Reviewer: UX Architect
Status: Approved
Last Reviewed: NV-023-TASK-003
```

### F3 — Button

```text
Target ID: a11y-f3-button
Target Type: Component
Related Component: Button
Keyboard Requirements: Enter and Space to activate.
Focus Requirements: Visible focus ring via sys.a11y.focus.* tokens.
Semantic Requirements: Native <button> or role="button" required.
Screen Reader Requirements: Accessible name required — label text or aria-label.
Color Contrast Requirements: Label vs surface must satisfy AA. Focus ring vs adjacent surface must satisfy AA.
Motion Sensitivity Requirements: Hover/press transition must support reduced-motion via instant state.
Responsive Accessibility Requirements: Touch target must satisfy sys.a11y.touch.target.minimum.
Error Handling Requirements: aria-disabled for disabled; aria-busy for loading.
Acceptance Criteria: Keyboard, focus, accessible name, contrast, and reduced-motion checks pass.
Validation Method: Manual review plus automated checks.
Reviewer: UX Architect
Status: Approved
Last Reviewed: NV-023-TASK-003
```

### F4 — Input

```text
Target ID: a11y-f4-input
Target Type: Component
Related Component: Input
Keyboard Requirements: Full text entry, editing, and navigation.
Focus Requirements: Visible focus ring via sys.a11y.focus.* tokens.
Semantic Requirements: Programmatic label association required — <label for> or aria-labelledby.
Screen Reader Requirements: Label, helper text, and error message announced as applicable.
Color Contrast Requirements: Text, placeholder, border, and error state must satisfy AA.
Motion Sensitivity Requirements: Focus border transition must support reduced-motion via instant state.
Responsive Accessibility Requirements: Field height must satisfy sys.a11y.touch.target.minimum.
Error Handling Requirements: aria-invalid="true" and aria-describedby on error message in error state.
Acceptance Criteria: Label association, focus, error, keyboard, and contrast checks pass.
Validation Method: Manual review plus automated checks.
Reviewer: UX Architect
Status: Approved
Last Reviewed: NV-023-TASK-003
```

### F5 — Textarea

```text
Target ID: a11y-f5-textarea
Target Type: Component
Related Component: Textarea
Keyboard Requirements: Full multi-line text navigation and editing.
Focus Requirements: Visible focus ring via sys.a11y.focus.* tokens.
Semantic Requirements: aria-multiline="true"; programmatic label required.
Screen Reader Requirements: Label, helper, error, and character count (aria-live) announced.
Color Contrast Requirements: Same as F4 Input.
Motion Sensitivity Requirements: Same as F4 Input.
Responsive Accessibility Requirements: Minimum height satisfies sys.a11y.touch.target.minimum; resize handle accessible on touch.
Error Handling Requirements: aria-invalid="true" and aria-describedby on error in error state.
Acceptance Criteria: Label, multiline semantic, character count, focus, and contrast checks pass.
Validation Method: Manual review plus automated checks.
Reviewer: UX Architect
Status: Approved
Last Reviewed: NV-023-TASK-003
```

### F6 — Checkbox

```text
Target ID: a11y-f6-checkbox
Target Type: Component
Related Component: Checkbox
Keyboard Requirements: Space to toggle.
Focus Requirements: Visible focus ring via sys.a11y.focus.* tokens.
Semantic Requirements: Native <input type="checkbox"> or role="checkbox"; aria-checked including "mixed".
Screen Reader Requirements: Label and group label announced; checked/unchecked/indeterminate states communicated.
Color Contrast Requirements: Label text, control border, and checked fill must satisfy AA.
Motion Sensitivity Requirements: Check animation must support reduced-motion via instant state.
Responsive Accessibility Requirements: Touch target must satisfy sys.a11y.touch.target.minimum.
Error Handling Requirements: aria-invalid and aria-describedby on error message.
Acceptance Criteria: Label, aria-checked, group label, focus, contrast, and reduced-motion checks pass.
Validation Method: Manual review plus automated checks.
Reviewer: UX Architect
Status: Approved
Last Reviewed: NV-023-TASK-003
```

### F7 — Radio

```text
Target ID: a11y-f7-radio
Target Type: Component
Related Component: Radio
Keyboard Requirements: Arrow keys navigate within radiogroup; Tab moves between groups.
Focus Requirements: Visible focus ring via sys.a11y.focus.* tokens.
Semantic Requirements: Native <input type="radio"> or role="radio" within role="radiogroup"; group label required.
Screen Reader Requirements: Group label and individual labels announced; selected state communicated.
Color Contrast Requirements: Same as F6 Checkbox.
Motion Sensitivity Requirements: Same as F6 Checkbox.
Responsive Accessibility Requirements: Same as F6 Checkbox.
Error Handling Requirements: Group-level aria-describedby on error message.
Acceptance Criteria: Radiogroup, Arrow key navigation, group label, focus, contrast, and reduced-motion checks pass.
Validation Method: Manual review plus automated checks.
Reviewer: UX Architect
Status: Approved
Last Reviewed: NV-023-TASK-003
```

### F8 — Switch

```text
Target ID: a11y-f8-switch
Target Type: Component
Related Component: Switch
Keyboard Requirements: Space to toggle; Enter context-dependent.
Focus Requirements: Visible focus ring via sys.a11y.focus.* tokens.
Semantic Requirements: role="switch"; aria-checked="true"/"false".
Screen Reader Requirements: Label and on/off state announced; immediate effect communicated.
Color Contrast Requirements: Label text, track off-state border, track on-state fill must satisfy AA.
Motion Sensitivity Requirements: Thumb slide animation must support reduced-motion via instant state.
Responsive Accessibility Requirements: Touch target must satisfy sys.a11y.touch.target.minimum.
Error Handling Requirements: Not applicable for standard boolean switch.
Acceptance Criteria: role switch, aria-checked, focus, contrast, and reduced-motion checks pass.
Validation Method: Manual review plus automated checks.
Reviewer: UX Architect
Status: Approved
Last Reviewed: NV-023-TASK-003
```

### F9 — Tooltip

```text
Target ID: a11y-f9-tooltip
Target Type: Component
Related Component: Tooltip
Keyboard Requirements: Appears on trigger focus; Escape to dismiss; dismisses on blur.
Focus Requirements: Tooltip panel itself must NOT receive focus — non-interactive.
Semantic Requirements: role="tooltip" on tooltip panel; trigger has aria-describedby pointing to tooltip id.
Screen Reader Requirements: Tooltip text announced via aria-describedby on trigger; trigger must have own accessible label independent of tooltip.
Color Contrast Requirements: Tooltip text vs tooltip background must satisfy AA.
Motion Sensitivity Requirements: Reveal/dismiss animation must support reduced-motion via instant show/hide.
Responsive Accessibility Requirements: Must be accessible without hover on touch — alternative accessible label on trigger required.
Error Handling Requirements: Not applicable.
Acceptance Criteria: role tooltip, aria-describedby, trigger own label, non-interactive content, focus behavior, and reduced-motion checks pass.
Validation Method: Manual review plus automated checks.
Reviewer: UX Architect
Status: Approved
Last Reviewed: NV-023-TASK-003
```
