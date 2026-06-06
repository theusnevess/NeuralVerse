# F2 — Badge

## Component ID
```
component-f2-badge
```

## Status
```
Implementation Status: Not Implemented
Lifecycle Status:      Approved
```

---

## Purpose
Communicate status, category, count, or label metadata inline within the interface. Badges are non-interactive display elements.

## Category
```
display / status
```

## Canonical Decision Source
```
NV-010 Color System
NV-013 Component Taxonomy
NV-014 Design Tokens
NV-017 Accessibility System
```

---

## Token Dependencies

```
sys.color.semantic.success — success variant surface
sys.color.semantic.warning — warning variant surface
sys.color.semantic.error   — error variant surface
sys.color.semantic.info    — info variant surface
sys.color.accent.subtle    — accent variant surface
sys.color.text.inverse     — badge label text (on colored surfaces)
sys.color.text.primary     — badge label text (on neutral surface)
sys.font.caption.size      — label text size
sys.font.caption.weight    — label text weight
sys.font.body.family       — label font family
sys.radius.badge           — badge pill/rounding
sys.space.inline.xs        — horizontal label padding
```

---

## States

```
default
```

> Badges are display-only. They do not have interactive states.

## Variants

```
success    — stable / positive
warning    — anomaly / caution
error      — critical / failure
info       — data / informational
accent     — highlighted / selected category
neutral    — default / unlabeled
```

## Slots

```
label      — required text content
leading-icon — optional decorative icon (must have aria-hidden)
```

---

## Responsive Requirements

```
Must not break containing layout
Label must remain readable at all viewport widths
Must not truncate unless max-width is explicitly set
```

---

## Accessibility Requirements

```
Role: status (when communicating live state), or none (when purely categorical)
Color must not be the sole carrier of meaning — label text required
Icon-only badges forbidden without accessible label
Screen reader: Badge content must be accessible as text
```

## Motion Requirements

```
none
```

---

## Forbidden Usage

```
As interactive trigger without appropriate role and keyboard support
As navigation element
With arbitrary color values outside semantic token system
Icon-only badge without accessible text alternative
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
