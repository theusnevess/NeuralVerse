# TOKEN_REGISTRY.md

## Registry Status

```
NV-023-TASK-001: Bootstrap entries — APPROVED
NV-023-TASK-002: M1 full catalog registration — IN PROGRESS
```

---

## Purpose

This file is the canonical registry of approved NeuralVerse design tokens.

No design token may be used in implementation unless it exists in this registry.

This registry follows the Registry First Rule:

> No implementation may exist before its registry entry exists.

---

## Canonical References

```
NV-009 Brand System
NV-010 Color System
NV-011 Typography System
NV-012 Layout Architecture
NV-013 Component Taxonomy
NV-014 Design Tokens
NV-016 Motion System
NV-017 Accessibility System
NV-018 Frontend Architecture
```

---

## Token Layer Model

```
Reference Tokens  (ref.*)
       ↓
Semantic Tokens   (sys.*)
       ↓
Context Tokens    (ctx.*)
       ↓
Component Tokens  (cmp.*)
```

| Prefix | Layer | Purpose |
| :--- | :--- | :--- |
| `ref` | Reference | Raw scale values — never consumed directly by components |
| `sys` | Semantic | Purposeful roles with reusable, system-wide meaning |
| `ctx` | Context | Region- or shell-specific role assignments |
| `cmp` | Component | Component-specific token assignments |

---

## Naming Convention

Format:
```
[layer].[domain].[group].[role].[state?]
```

### Approved Domains
```
color, font, space, radius, border,
elevation, shadow, motion, z, a11y, layout
```

### Approved States
```
default, hover, active, focus, selected,
disabled, error, warning, success, info
```

---

## Governance Rules

- Components must consume tokens. Components must not create tokens.
- Raw visual values are not allowed in implementation without registry mapping.
- Token names must describe semantic purpose, not appearance.
- Token lifecycle must be tracked. Token changes require governance review.
- Token hierarchy must be respected: ref → sys → ctx → cmp.
- Context tokens must never consume reference tokens directly.
- Component tokens must never consume reference or semantic tokens bypassing context.

---

## Token Status Model

| Status | Meaning |
| :--- | :--- |
| `proposed` | Registered, not yet reviewed |
| `approved` | Passed governance checklist |
| `deprecated` | Still exists, being replaced |
| `blocked` | Depends on an unresolved decision |
| `superseded` | Replaced by a newer approved token |

## Implementation Status Model

| Status | Meaning |
| :--- | :--- |
| `not-implemented` | Documentation only, no CSS written |
| `implementation-ready` | HUB has authorized CSS implementation |
| `implemented` | CSS custom property exists in tokens.css |
| `retired` | Removed from CSS, no longer in use |

---

## Token Entry Template

```text
Token Name:
Layer:
Domain:
Category:
Purpose:
Consumes:
Consumed By:
Status:
Source:
Accessibility Notes:
Implementation Status:
Owner:
Version:
```

---

## Token Catalog

Full catalog reference is maintained in execution files T2–T5:

```
docs/design-system/tokens/execution/T2_REFERENCE_TOKEN_CATALOG.md    — ref.* tokens
docs/design-system/tokens/execution/T3_SEMANTIC_TOKEN_CATALOG.md     — sys.* tokens
docs/design-system/tokens/execution/T4_CONTEXT_TOKEN_CATALOG.md      — ctx.* tokens
docs/design-system/tokens/execution/T5_ACCESSIBILITY_TOKEN_CATALOG.md — sys.a11y.* tokens
```

### Catalog Summary

| Domain | ref.* | sys.* | ctx.* |
| :--- | :--- | :--- | :--- |
| color | 14 | 27 | 18 |
| font | 23 | 15 | 8 |
| space | 11 | 15 | 6 |
| radius | 5 | 4 | 3 |
| border | 4 | 5 | 5 |
| elevation/shadow | 4 | 8 | 4 |
| motion | 8 | 10 | 4 |
| z-index | 10 | 9 | 5 |
| a11y | — | 15 | — |

---

## Approved Token Entries (Bootstrap — NV-023-TASK-001)

These entries were created in the initial bootstrap and remain valid. Aligned to M1 canonical structure.

### sys.color.accent.primary

```text
Token Name: sys.color.accent.primary
Layer: sys
Domain: color
Category: semantic color
Purpose: Defines the primary accent color role for key interface emphasis.
Consumes: ref.color.cyan.500
Consumed By: ctx.nav.item.text-active, sys.a11y.focus.color, interactive components
Status: approved
Source: NV-010, NV-014
Accessibility Notes: Must satisfy AA contrast on all approved surfaces.
Implementation Status: not-implemented
Owner: Component Designer
Version: 1.0.0
```

### sys.color.text.primary

```text
Token Name: sys.color.text.primary
Layer: sys
Domain: color
Category: semantic text color
Purpose: Defines the primary readable text role.
Consumes: ref.color.white (or approved high-contrast text base)
Consumed By: ctx.reading.text, all primary text content
Status: approved
Source: NV-010, NV-014, NV-017
Accessibility Notes: Must satisfy AAA contrast where possible. AA minimum on all surfaces.
Implementation Status: not-implemented
Owner: Component Designer
Version: 1.0.0
```

### sys.font.body.family

```text
Token Name: sys.font.body.family
Layer: sys
Domain: font
Category: semantic font
Purpose: Defines the primary interface font family role.
Consumes: ref.font.family.primary
Consumed By: ctx.reading.body.font, ctx.navigation.label.font, body text
Status: approved
Source: NV-011, NV-014
Accessibility Notes: Must be legible at all approved body sizes.
Implementation Status: not-implemented
Owner: Component Designer
Version: 1.0.0
```

### ref.space.400

```text
Token Name: ref.space.400
Layer: ref
Domain: space
Category: scale spacing
Purpose: Defines a standard medium spacing step in the reference scale.
Consumes: (raw scale value)
Consumed By: sys.space.inset.md, sys.space.stack.md
Status: approved
Source: NV-012, NV-014
Accessibility Notes: Must support minimum touch target requirements when used in interactive component padding.
Implementation Status: not-implemented
Owner: Component Designer
Version: 1.0.0
```

### ref.motion.duration.normal

```text
Token Name: ref.motion.duration.normal
Layer: ref
Domain: motion
Category: scale duration
Purpose: Defines the standard motion duration reference step.
Consumes: (raw scale value)
Consumed By: sys.motion.duration.transition
Status: approved
Source: NV-016, NV-014
Accessibility Notes: All transitions using this token must include a reduced-motion fallback.
Implementation Status: not-implemented
Owner: Motion Designer
Version: 1.0.0
```

---

## Dependency Map

See: `docs/design-system/tokens/TOKEN_DEPENDENCY_MAP.md`
See: `docs/design-system/tokens/execution/T6_DEPENDENCY_MAP.md`

---

## Accessibility Validation

See: `docs/design-system/tokens/execution/T5_ACCESSIBILITY_TOKEN_CATALOG.md`
See: `docs/accessibility/ACCESSIBILITY_MATRIX.md`

---

## Governance Metadata

```
Registry Owner: Frontend Architect
Last Updated: NV-023-TASK-002
Governance Source: NV-020 Design System Governance Package
Change Control: docs/governance/CHANGE_CONTROL.md
```

---

## Deprecated Token Entries

None.

---

## Change Log

```
NV-023-TASK-001 (Initial bootstrap):
  Created with 5 bootstrap token entries.

NV-023-TASK-002 (M1 Token Infrastructure):
  Expanded with canonical structure, token layer model, naming convention,
  full catalog reference (T2-T5), dependency map, accessibility validation,
  governance metadata. Bootstrap entries preserved and aligned to new structure.
```
