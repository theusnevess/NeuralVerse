# F1 — Divider

## Component ID
```
component-f1-divider
```

## Status
```
Implementation Status: Not Implemented
Lifecycle Status:      Approved
```

---

## Purpose
Provide visual and structural separation between content regions, sections, or items.

## Category
```
layout / visual
```

## Canonical Decision Source
```
NV-012 Layout Architecture
NV-013 Component Taxonomy
NV-014 Design Tokens
```

---

## Token Dependencies

```
sys.color.border.subtle  — divider line color
sys.color.divider.default — alternative divider color
sys.space.stack.sm       — vertical spacing context (surrounding margin)
```

---

## States

```
default (horizontal)
vertical (when used in inline/flex contexts)
```

## Variants

```
horizontal — full-width block separator
vertical   — inline column separator
```

## Slots

```
none (no content slots — structural only)
```

---

## Responsive Requirements

```
horizontal: full container width
vertical: full container height
Must not introduce layout shift
```

---

## Accessibility Requirements

```
Role: separator (aria role when meaningful)
Hidden from screen readers when purely decorative (aria-hidden="true")
Must not carry information alone
```

## Motion Requirements

```
none
```

---

## Forbidden Usage

```
As a primary content delimiter in place of semantic headings
As a decorative graphic element
With arbitrary color values outside token system
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
