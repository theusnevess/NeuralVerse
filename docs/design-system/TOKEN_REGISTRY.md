# TOKEN_REGISTRY.md

## Purpose

This file is the canonical registry of approved NeuralVerse design tokens.

No design token may be used in implementation unless it exists in this registry.

This registry follows the Registry First Rule:

> No implementation may exist before its registry entry exists.

---

## Governance Rules

- Components must consume tokens.
- Components must not create tokens.
- Raw visual values are not allowed in implementation without registry mapping.
- Token names must describe semantic purpose, not appearance.
- Token lifecycle must be tracked.
- Token changes require governance review.

---

## Token Entry Template

```text
Token ID:
Token Name:
Token Category:
Token Type:
Purpose:
Allowed Usage:
Forbidden Usage:
Related Decision:
Owner:
Dependencies:
Lifecycle Status:
Version:
Created Date:
Last Reviewed:
Implementation Mapping:
Notes:
```

---

## Approved Token Entries

### color.accent.primary

```text
Token ID: token-color-accent-primary
Token Name: color.accent.primary
Token Category: color
Token Type: semantic color token
Purpose: Defines the primary accent color role for key interface emphasis.
Allowed Usage: Primary emphasis, active navigation indication, selected states, key interface affordances.
Forbidden Usage: Body text, decorative glow overload, unapproved neon effects, arbitrary backgrounds.
Related Decision: NV-010, NV-014
Owner: Component Designer
Dependencies: Color System, Design Tokens
Lifecycle Status: Approved
Version: 1.0.0
Created Date: Initial bootstrap
Last Reviewed: Initial bootstrap
Implementation Mapping: CSS custom property reference only.
Notes: Value intentionally undefined in this registry package.
```

### color.text.primary

```text
Token ID: token-color-text-primary
Token Name: color.text.primary
Token Category: color
Token Type: semantic text color token
Purpose: Defines the primary readable text role.
Allowed Usage: Main interface text, primary labels, core readable content.
Forbidden Usage: Disabled text, decorative labels, low-priority metadata.
Related Decision: NV-010, NV-014, NV-017
Owner: Component Designer
Dependencies: Color System, Accessibility System
Lifecycle Status: Approved
Version: 1.0.0
Created Date: Initial bootstrap
Last Reviewed: Initial bootstrap
Implementation Mapping: CSS custom property reference only.
Notes: Must satisfy contrast requirements through NV-017 validation.
```

### font.family.primary

```text
Token ID: token-font-family-primary
Token Name: font.family.primary
Token Category: typography
Token Type: semantic font token
Purpose: Defines the primary interface font family role.
Allowed Usage: Main UI text, navigation, labels, controls, documentation interface.
Forbidden Usage: Decorative experiments or unauthorized visual identity shifts.
Related Decision: NV-011, NV-014
Owner: Component Designer
Dependencies: Typography System
Lifecycle Status: Approved
Version: 1.0.0
Created Date: Initial bootstrap
Last Reviewed: Initial bootstrap
Implementation Mapping: CSS custom property reference only.
Notes: Value intentionally undefined in this registry package.
```

### space.400

```text
Token ID: token-space-400
Token Name: space.400
Token Category: spacing
Token Type: scale spacing token
Purpose: Defines a standard medium spacing step.
Allowed Usage: Component padding, region spacing, layout rhythm where medium spacing is required.
Forbidden Usage: Arbitrary replacement for all spacing needs.
Related Decision: NV-012, NV-014
Owner: Component Designer
Dependencies: Layout Architecture, Design Tokens
Lifecycle Status: Approved
Version: 1.0.0
Created Date: Initial bootstrap
Last Reviewed: Initial bootstrap
Implementation Mapping: CSS custom property reference only.
Notes: Value intentionally undefined in this registry package.
```

### motion.duration.normal

```text
Token ID: token-motion-duration-normal
Token Name: motion.duration.normal
Token Category: motion
Token Type: semantic duration token
Purpose: Defines the standard motion duration role.
Allowed Usage: Approved transitions requiring normal-paced state continuity.
Forbidden Usage: Decorative animation, excessive motion, unregistered motion patterns.
Related Decision: NV-016, NV-014
Owner: Motion Designer
Dependencies: Motion System, Design Tokens
Lifecycle Status: Approved
Version: 1.0.0
Created Date: Initial bootstrap
Last Reviewed: Initial bootstrap
Implementation Mapping: CSS custom property reference only.
Notes: Must be paired with reduced-motion behavior.
```

---

## Deprecated Token Entries

None.

---

## Review Log

```text
Initial bootstrap:
Created as part of NV-023-TASK-001.
```
