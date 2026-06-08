# Phase 1 Backlog

## Current Phase

Implementation Phase 1

---

## Milestone M0 — Registry Bootstrap

### NV-023-TASK-001 — Bootstrap Phase 1 Frontend Registries

Status:

```text
COMPLETE
```

Purpose:

```text
Create governance and registry files required before frontend implementation begins.
```

Deliverables:

```text
TOKEN_REGISTRY.md
COMPONENT_REGISTRY.md
NAVIGATION_CONTRACTS.md
ACCESSIBILITY_MATRIX.md
MOTION_REGISTRY.md
CHANGE_CONTROL.md
ARCHITECTURE_REVIEW.md
DEFINITION_OF_DONE.md
Phase 1 README
Phase 1 backlog
Task package
Review package
Validation package
```

---

## Milestone M1 — Token Infrastructure

### NV-023-TASK-002 — M1 Token Infrastructure Documentation Registration

Status:

```text
COMPLETE
```

Purpose:

```text
Register the complete token infrastructure documentation package (T1–T8).
```

---

## Milestone M2 — Foundation Components

Status:

```text
BLOCKED UNTIL NV-023-TASK-007B PASS
```

---

## Milestone M3 — Region Components

Status:

```text
BLOCKED UNTIL M2 PASS
```

---

## Milestone M4 — Shell Integration Validation

Status:

```text
BLOCKED UNTIL M3 PASS
```

---

## Milestone M5 — Phase 1 Governance Review

Status:

```text
COMPLETE
```

---

## Milestone M6 — Token CSS Implementation

Status:

```text
APPROVED WITH CONDITIONS
```

### NV-023-TASK-007 — M6 Token CSS Implementation

Status:

```text
APPROVED WITH CONDITIONS
```

Purpose:

```text
Implement approved design tokens as CSS custom properties in website/styles/tokens.css.
```

Conditions from NV-023-TASK-007A:

```text
C-001: Resolve 7 color TODO tokens — ADDRESSED IN NV-023-TASK-007B
C-002: sys.color.overlay.backdrop — ADDRESSED IN NV-023-TASK-007B
C-003: sys.a11y.* governed exception — ADDRESSED IN NV-023-TASK-007B
C-004: git push — ADDRESSED IN NV-023-TASK-007B
```

### NV-023-TASK-007B — M6 Token CSS Condition Resolution

Status:

```text
IN PROGRESS
```

Purpose:

```text
Resolve all four HUB conditions from NV-023-TASK-007A before M7 can be authorized.
```

Authorized files:

```text
website/styles/tokens.css
docs/design-system/TOKEN_REGISTRY.md
docs/design-system/tokens/TOKEN_DEPENDENCY_MAP.md
docs/design-system/tokens/TOKEN_GOVERNANCE_VALIDATION.md
docs/design-system/tokens/TOKEN_IMPLEMENTATION_READINESS.md
docs/implementation/phase-1/ (packages, reviews, validations, backlog)
```

Does NOT unblock:

```text
M7 Base Layer CSS — requires HUB review of NV-023-TASK-007B before authorized.
```

---

## Milestone M7 — Base Layer CSS

Status:

```text
BLOCKED UNTIL NV-023-TASK-007B PASS
```

Purpose (when authorized):

```text
Implement website/styles/base.css using approved tokens from tokens.css.
```
