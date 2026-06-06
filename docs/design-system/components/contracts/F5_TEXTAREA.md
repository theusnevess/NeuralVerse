# F5 — Textarea

## Component ID
```
component-f5-textarea
```

## Status
```
Implementation Status: Not Implemented
Lifecycle Status:      Approved
```

---

## Purpose
Capture multi-line user-provided text. Used for notes, descriptions, annotations, and extended input contexts.

## Category
```
input / text
```

## Canonical Decision Source
```
NV-013 Component Taxonomy
NV-014 Design Tokens
NV-016 Motion System
NV-017 Accessibility System
NV-018 Frontend Architecture
```

---

## Token Dependencies

```
(All F4 — Input token dependencies)
sys.font.body.line-height  — multi-line text rhythm
sys.font.code.family       — optional monospace mode (code/script input)
sys.space.inset.md         — larger internal padding than single-line Input
```

---

## States

```
default
hover
focus
disabled
error
warning
```

## Variants

```
standard    — prose / note input with resize handle
fixed       — no resize (controlled height)
monospace   — code/technical annotation mode (consumes sys.font.code.family)
```

## Slots

```
label           — required
textarea-field  — multi-line text entry element
helper-text     — supporting instruction
error-message   — programmatically associated error
character-count — optional counter (when maxlength applies)
```

---

## Responsive Requirements

```
Must not overflow its container
Resize handle must remain accessible on touch devices
Minimum height must satisfy sys.a11y.touch.target.minimum
Fixed variant must define explicit height via layout context
```

---

## Accessibility Requirements

```
Role: textbox with aria-multiline="true"
Label: Programmatic association required — same rules as F4 Input
Placeholder: Must not replace visible label
Helper text: aria-describedby when present
Error: aria-invalid="true" + aria-describedby on error message
Character count: aria-live="polite" announcement when approaching limit
Keyboard: Full text navigation and editing support
Focus: Visible focus ring using sys.a11y.focus.* tokens
```

## Motion Requirements

```
Pattern: Focus Transition (border and focus ring)
Intensity: reduced
Reduced-motion: Instant state change
```

---

## Forbidden Usage

```
Placeholder-only label
As a code editor without monospace variant and appropriate semantics
Without visible label
With arbitrary resize constraints outside layout token system
```

---

## Owner
```
Component Designer
```

## Version
```
1.0.0
```

## Review Log
```
Created as part of NV-023-TASK-003.
```
