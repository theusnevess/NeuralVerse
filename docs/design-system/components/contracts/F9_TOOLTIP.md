# F9 — Tooltip

## Component ID
```
component-f9-tooltip
```

## Status
```
Implementation Status: Not Implemented
Lifecycle Status:      Approved
```

---

## Purpose
Provide brief contextual information about an interface element on hover or focus. Tooltips are non-interactive and ephemeral.

## Category
```
overlay / contextual
```

## Canonical Decision Source
```
NV-013 Component Taxonomy
NV-014 Design Tokens
NV-015 Navigation System
NV-016 Motion System
NV-017 Accessibility System
```

---

## Token Dependencies

```
sys.color.surface.overlay    — tooltip background
sys.color.text.inverse       — tooltip label text
sys.color.border.subtle      — optional tooltip border
sys.font.caption.size        — tooltip text size
sys.font.caption.weight      — tooltip text weight
sys.font.body.family         — tooltip font family
sys.space.inset.xs           — tooltip internal padding
sys.radius.surface           — tooltip rounding
sys.shadow.overlay           — tooltip elevation / shadow
sys.z.dropdown               — tooltip z-index layer
sys.motion.duration.feedback — show/hide transition duration
sys.motion.ease.enter        — tooltip appear easing
sys.motion.ease.exit         — tooltip dismiss easing
sys.a11y.reading.width.standard — max-width constraint for readable tooltip text
```

---

## States

```
hidden (default)
visible (on hover / focus of trigger)
```

## Variants

```
standard    — appears above trigger (default placement)
below       — appears below trigger
left        — appears left of trigger
right       — appears right of trigger
```

> Placement must adapt when viewport space is insufficient.

## Slots

```
trigger       — the element the tooltip describes (must have accessible label)
tooltip-panel — the floating tooltip container
tooltip-label — the text content of the tooltip
```

---

## Responsive Requirements

```
Must not overflow viewport — placement must adapt
Must dismiss on scroll on mobile (if persistent scroll is detected)
Must respect sys.a11y.reading.width.standard max-width for readability
```

---

## Accessibility Requirements

```
Role: tooltip (role="tooltip")
Association: trigger must have aria-describedby pointing to tooltip id
Trigger: Must have its own accessible label independent of tooltip
Keyboard: Tooltip appears on trigger focus; dismisses on Escape or blur
Pointer: Appears on hover; dismisses on pointer leave
Non-interactive: Tooltip content must not contain interactive elements
Screen reader: tooltip text announced via aria-describedby
Touch: Must be accessible without hover — trigger must have alternative accessible label
```

## Motion Requirements

```
Pattern: Tooltip Reveal (appear / dismiss)
Intensity: low
Easing: enter on appear, exit on dismiss
Reduced-motion: Instant appear / dismiss — no opacity/transform animation
```

---

## Forbidden Usage

```
As a primary information container (critical info must be always visible)
With interactive content inside tooltip panel
As a dropdown or menu replacement
With long paragraphs of text (use popover pattern instead)
Without aria-describedby association on trigger
Without accessible trigger label
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
