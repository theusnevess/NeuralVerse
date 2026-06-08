# TOKEN_GOVERNANCE_VALIDATION.md

## Purpose
Define the governance checklist every token must pass before being marked Approved.

---

## Per-Token Checklist

```
[ ] Has canonical name following [layer].[domain].[group].[role].[state?]
[ ] Has layer (ref / sys / ctx / cmp)
[ ] Has domain (color / font / space / radius / border / elevation / shadow / motion / z / a11y / layout)
[ ] Has purpose description
[ ] Has source document (NV-0xx)
[ ] Has declared dependency (what it consumes)
[ ] Has declared consumer category (what will consume it)
[ ] Has lifecycle status (proposed / approved / deprecated / blocked / superseded)
[ ] Has accessibility note when relevant (contrast, focus, motion-sensitive)
[ ] Does not duplicate an existing token with the same semantic purpose
[ ] Does not bypass the Reference → Semantic → Context → Component hierarchy
```

---

## Acceptance Criteria

A token is accepted if it:
```
Supports an approved system (NV-009 through NV-023)
Has a reusable, system-wide purpose
Avoids page-specific or component-specific naming at the sys/ref layer
Does not introduce visual redesign
Does not create implementation code
Can be traced to a canonical NV-0xx source
```

---

## Rejection Criteria

A token is rejected if it:
```
Name is appearance-only (e.g. "dark-blue", "big-text")
Is component-specific when defined at sys or ref layer
Duplicates the semantic purpose of an existing token
Bypasses NV-010, NV-011, NV-012, NV-014, NV-016, or NV-017
Implies unapproved layout or structural change
Introduces CSS implementation in a documentation file
Contains sys.motion.intensity.high or any undeclared intensity level
```

---

## Token Status Model

| Status | Meaning |
| :--- | :--- |
| `proposed` | Registered, not yet reviewed |
| `approved` | Passed governance checklist |
| `deprecated` | Still exists, being replaced |
| `blocked` | Depends on an unresolved decision |
| `superseded` | Replaced by a newer approved token |

---

## Implementation Status Model

| Status | Meaning |
| :--- | :--- |
| `not-implemented` | Documentation only, no CSS written |
| `implementation-ready` | HUB has authorized CSS implementation |
| `implemented` | CSS custom property exists in tokens.css |
| `retired` | Removed from CSS, no longer in use |

---

## Review Log
```
Initial registration:
  Created as part of NV-023-TASK-002.

NV-023-TASK-007B (M6 Condition Resolution — C-003):
  Registered governed exception: sys.a11y.* scalar tokens may hold raw
  accessibility-constant values without ref.a11y.* intermediary.
  Rationale: WCAG-defined constants are not visual style scales.
  Decision: ref.a11y.* scale NOT created. Exception formally approved.
  Scope: sys.a11y.focus.offset, sys.a11y.disabled.opacity,
         sys.a11y.disabled.cursor, sys.a11y.touch.target.minimum,
         sys.a11y.reading.width.standard, sys.a11y.reading.width.enhanced,
         sys.a11y.contrast.standard, sys.a11y.contrast.high.
```
