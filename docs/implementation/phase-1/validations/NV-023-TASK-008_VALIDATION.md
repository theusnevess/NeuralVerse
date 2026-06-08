# Validation — NV-023-TASK-008

## Task ID

```text
NV-023-TASK-008
```

## Task Name

```text
M7 Base Layer CSS Implementation
```

---

## Section Coverage Validation

| Section | Selector | Status |
| :--- | :--- | :--- |
| 1. Universal Box Model | `*, *::before, *::after` | PENDING |
| 2. HTML Baseline | `html` | PENDING |
| 3. Body Baseline | `body` | PENDING |
| 4. Typography Baseline | `p, small, strong, em, code, pre, hr` | PENDING |
| 5. Accessibility Baseline | `:focus-visible, ::selection` | PENDING |
| 6. Media Baseline | `img, svg, video, canvas` | PENDING |
| 7. Form Reset Baseline | `button, input, textarea, select` | PENDING |
| 8. Link Baseline | `a` | PENDING |
| 9. List Baseline | `ul, ol` | PENDING |
| 10. Table Baseline | `table` | PENDING |
| 11. Motion Baseline | `@media (prefers-reduced-motion: reduce)` | PENDING |

---

## Token Consumption Audit

| Property | Token Used | Status |
| :--- | :--- | :--- |
| `body background-color` | `sys.color.background.base` | PENDING |
| `body color` | `sys.color.text.primary` | PENDING |
| `body font-family` | `sys.font.body.family` | PENDING |
| `body font-size` | `sys.font.body.size` | PENDING |
| `body font-weight` | `sys.font.body.weight` | PENDING |
| `body line-height` | `sys.font.body.line-height` | PENDING |
| `html font-size` | `sys.font.body.size` | PENDING |
| `p max-inline-size` | `sys.a11y.reading.width.standard` | PENDING |
| `small font-size` | `sys.font.caption.size` | PENDING |
| `code font-family` | `sys.font.code.family` | PENDING |
| `code font-size` | `sys.font.code.size` | PENDING |
| `hr border` | `sys.border.subtle + sys.color.border.subtle` | PENDING |
| `:focus-visible outline` | `sys.a11y.focus.ring` | PENDING |
| `:focus-visible outline-offset` | `sys.a11y.focus.offset` | PENDING |
| `::selection background` | `sys.color.accent.primary` | PENDING |
| `::selection color` | `sys.color.background.base` | PENDING |
| `a color` | `sys.color.accent.primary` | PENDING |

---

## File Scope Validation

| Check | Status |
| :--- | :--- |
| Only base.css modified under website/styles/ | PENDING |
| tokens.css NOT modified | PENDING |
| components.css NOT modified | PENDING |
| layout.css NOT modified | PENDING |
| utilities.css NOT modified | PENDING |
| index.html NOT modified | PENDING |
| JavaScript files NOT modified | PENDING |

---

## Selector Validation

| Check | Status |
| :--- | :--- |
| No class selectors (`.`) in base.css | PENDING |
| No ID selectors (`#`) in base.css | PENDING |
| No component-named selectors | PENDING |
| No layout-named selectors | PENDING |
| No utility-named selectors | PENDING |
| All selectors from authorized list | PENDING |

---

## Accessibility Audit

| Check | Status |
| :--- | :--- |
| `:focus-visible` present and token-driven | PENDING |
| `:focus:not(:focus-visible)` cleanup present | PENDING |
| `::selection` present with accessible contrast | PENDING |
| `p max-inline-size` set for reading comfort | PENDING |

---

## Motion Audit

| Check | Status |
| :--- | :--- |
| `@media (prefers-reduced-motion: reduce)` present | PENDING |
| `html scroll-behavior: auto` under reduce | PENDING |
| Global animation/transition suppression present | PENDING |

---

## Hardcoded Value Audit

| Check | Status |
| :--- | :--- |
| No hardcoded hex colors | PENDING |
| No hardcoded font-family strings | PENDING |
| No hardcoded spacing values (except normalization 0) | PENDING |
| `0.01ms` animation override — normalization exception | PENDING (WAIVE) |

---

## Repository Validation

| Check | Status |
| :--- | :--- |
| `git diff --check` passes | PENDING |
| Changed files limited to authorized scope | PENDING |
| Commit made with correct message | PENDING |

---

## Validation Commands

```bash
# Whitespace check
git diff --check

# Changed files
git diff --name-only

# Status
git status --short

# No class selectors
grep -n "^\." website/styles/base.css

# No hardcoded hex colors
grep -n "#[0-9a-fA-F]\{3,6\}" website/styles/base.css

# Focus-visible present
grep "focus-visible" website/styles/base.css

# Reduced motion present
grep "prefers-reduced-motion" website/styles/base.css

# Token var() count
grep -c "var(--" website/styles/base.css
```

---

## Validation Log

```text
Validation file created: 2026-06-08
Validator: PENDING (HUB)
Status: PENDING
```
