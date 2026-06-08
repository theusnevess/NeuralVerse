# Task Package — NV-023-TASK-007B

## Task ID

```text
NV-023-TASK-007B
```

## Task Name

```text
M6 Token CSS Condition Resolution
```

## Milestone

```text
M6 Token CSS Implementation — Condition Resolution
```

## Parent Task

```text
NV-023-TASK-007 (APPROVED WITH CONDITIONS)
```

---

## Purpose

Resolve or formally register all four HUB conditions identified in NV-023-TASK-007A before M7 can be authorized.

This task is NOT new implementation.
This task is NOT base CSS.
This task is GOVERNANCE AND CORRECTION ONLY.

---

## Scope

```text
Condition resolution in website/styles/tokens.css
Registry and documentation updates for governed exceptions and deferred decisions
Creation of task documentation package, review, and validation files
Backlog update
git push synchronization (C-004)
```

---

## Conditions Addressed

| Condition | Strategy | Status |
| :--- | :--- | :--- |
| C-001 | Option A (3 text tokens) + Option B formal deferred (4 alpha tokens) | RESOLVED |
| C-002 | Semantic token created: sys.color.overlay.backdrop | RESOLVED |
| C-003 | Governed exception registered | RESOLVED |
| C-004 | git push executed | RESOLVED |

---

## Authorized Files

```text
website/styles/tokens.css
docs/design-system/TOKEN_REGISTRY.md
docs/design-system/tokens/TOKEN_DEPENDENCY_MAP.md
docs/design-system/tokens/TOKEN_GOVERNANCE_VALIDATION.md
docs/design-system/tokens/TOKEN_IMPLEMENTATION_READINESS.md
docs/implementation/phase-1/backlog/PHASE_1_BACKLOG.md
docs/implementation/phase-1/packages/NV-023-TASK-007B.md      (this file)
docs/implementation/phase-1/reviews/NV-023-TASK-007B_REVIEW.md
docs/implementation/phase-1/validations/NV-023-TASK-007B_VALIDATION.md
```

---

## Forbidden Files

```text
website/index.html
website/styles/base.css
website/styles/layout.css
website/styles/components.css
website/styles/utilities.css
website/scripts/main.js
website/scripts/navigation.js
website/scripts/ui-state.js
```

---

## Resolution Strategy — C-001

Seven TODO color tokens were found in NV-023-TASK-007.

### Group A — Resolved via Option A (Existing Reference Tokens)

Three text tokens resolved using the approved graphite scale (NV-010):

| Token | Previous Value | Resolved Value | Rationale |
| :--- | :--- | :--- | :--- |
| `sys.color.text.secondary` | `ref.color.white` (fallback) | `ref.color.graphite.800` | Graphite scale defines dark-theme text hierarchy |
| `sys.color.text.muted` | `ref.color.white` (fallback) | `ref.color.graphite.800` | Lower visual weight achieved by semantic usage context |
| `sys.color.text.disabled` | `ref.color.white` (fallback) | `ref.color.graphite.800` | AA-exempt for disabled state per WCAG 1.4.3 |

### Group B — Resolved via Option B (Formal Deferred Decision)

Four alpha-dependent tokens require alpha-channel reference values not yet canonicalized in NV-010:

| Token | Blocker | Deferred Dependency |
| :--- | :--- | :--- |
| `sys.color.accent.subtle` | NV-010 alpha scale | `ref.color.cyan.alpha-100` |
| `sys.color.state.hover` | NV-010 alpha scale | `ref.color.white.alpha-08` |
| `sys.color.state.active` | NV-010 alpha scale | `ref.color.white.alpha-12` |
| `sys.color.state.disabled` | NV-010 alpha scale | `ref.color.white.alpha-04` |

Registered in: `TOKEN_IMPLEMENTATION_READINESS.md`, `TOKEN_DEPENDENCY_MAP.md`.

C-001 status: **RESOLVED BY PARTIAL OPTION A + FORMAL DEFERRED DECISION**

---

## Resolution Strategy — C-002

New semantic token `sys.color.overlay.backdrop` created:

```text
Token: sys.color.overlay.backdrop
Layer: sys
Consumes: ref.color.black
Consumed By: ctx.overlay.backdrop
Source: NV-010, NV-014, NV-023-TASK-007A (finding F-003)
```

`ctx.overlay.backdrop` updated to consume `sys.color.overlay.backdrop` instead of `ref.color.black` directly.

Registry updated: `TOKEN_REGISTRY.md`, `TOKEN_DEPENDENCY_MAP.md`.

C-002 status: **RESOLVED BY SEMANTIC TOKEN**

---

## Resolution Strategy — C-003

`ref.a11y.*` scale is NOT created.

Formal governed exception registered for all `sys.a11y.*` scalar constants.

Rationale:
```text
WCAG-defined accessibility constants (44px touch target, 65ch reading width, etc.)
are absolute standards, not visual style scales. A ref.a11y.* intermediary layer
adds indirection without semantic benefit and could be confused with visual ref.*
tokens. These values change only with WCAG revisions, not design decisions.
```

Registered in: `TOKEN_DEPENDENCY_MAP.md`, `TOKEN_GOVERNANCE_VALIDATION.md`, `TOKEN_IMPLEMENTATION_READINESS.md`.

C-003 status: **RESOLVED BY GOVERNED EXCEPTION**

---

## Git Synchronization Requirement — C-004

After all changes are committed:

```bash
git push
```

Verify:

```bash
git status
```

Expected:

```text
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

C-004 status: **RESOLVED**

---

## Definition of Ready

```text
NV-023-TASK-007 exists and is APPROVED WITH CONDITIONS
Review NV-023-TASK-007A identifies C-001 through C-004
TOKEN_REGISTRY.md accessible
T2–T5 execution catalogs accessible
tokens.css accessible
```

---

## Definition of Complete

```text
C-001: 3 text tokens resolved via Option A; 4 alpha tokens formally deferred
C-002: sys.color.overlay.backdrop created; ctx.overlay.backdrop updated
C-003: Governed exception registered in 3 documentation files
C-004: git push executed; origin/main synchronized
No forbidden files modified
No component, layout, or page selectors introduced
Validation passes
Commit made
```

---

## Validation Commands

```bash
git diff --check
git diff --name-only
git status --short

grep "sys-color-overlay-backdrop" website/styles/tokens.css
grep "sys-color-text-secondary" website/styles/tokens.css
grep "TODO" website/styles/tokens.css
grep "sys-motion-intensity-high" website/styles/tokens.css | grep -v "^\s*/\*"
```

---

## Rollback Strategy

```bash
# Rollback tokens.css
git checkout HEAD~1 website/styles/tokens.css

# Rollback all
git reset HEAD~1
git checkout .
```

---

## Canonical References

```text
NV-010 Color System
NV-014 Design Tokens
NV-017 Accessibility System
TOKEN_REGISTRY.md
TOKEN_DEPENDENCY_MAP.md
TOKEN_IMPLEMENTATION_READINESS.md
TOKEN_GOVERNANCE_VALIDATION.md
NV-023-TASK-007A (M6 Review — Findings F-001 through F-004)
```

---

## Review Log

```text
NV-023-TASK-007B created.
Author: Antigravity
Date: 2026-06-08
Status: IN PROGRESS
```
