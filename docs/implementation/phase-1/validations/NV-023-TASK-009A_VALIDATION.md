# Validation — NV-023-TASK-009A

## Task ID

```text
NV-023-TASK-009A
```

## Task Name

```text
F1–F3 Foundation Components Implementation
```

---

## Component Coverage

| Component | Status |
| :--- | :--- |
| F1 Divider | PENDING |
| F2 Badge | PENDING |
| F3 Button | PENDING |
| F4–F9 ABSENT | PENDING |

---

## F1 Divider Validation

| Check | Status |
| :--- | :--- |
| `.nv-divider` selector present | PENDING |
| `.nv-divider[aria-orientation="vertical"]` selector present | PENDING |
| No raw color values | PENDING |
| No @keyframes | PENDING |
| Token: `--sys-color-divider-default` present and used | PENDING |
| Token: `--sys-border-subtle` present and used | PENDING |
| Token: `--sys-space-stack-sm` present and used | PENDING |

---

## F2 Badge Validation

| Check | Status |
| :--- | :--- |
| `.nv-badge` selector present | PENDING |
| `[data-variant="neutral"]` present | PENDING |
| `[data-variant="info"]` present | PENDING |
| `[data-variant="success"]` present | PENDING |
| `[data-variant="warning"]` present | PENDING |
| `[data-variant="error"]` present | PENDING |
| `pointer-events: none` present (non-interactive) | PENDING |
| `user-select: none` present | PENDING |
| Token: `--sys-color-semantic-info/success/warning/error` used | PENDING |
| Token: `--sys-color-text-inverse` used for semantic variants | PENDING |
| Token: `--sys-font-caption-*` used | PENDING |
| Token: `--sys-radius-badge` used | PENDING |
| Token: `--sys-space-inset-xs` used | PENDING |
| No @keyframes | PENDING |

---

## F3 Button Validation

| Check | Status |
| :--- | :--- |
| `.nv-button` base selector present | PENDING |
| `[data-variant="primary"]` present | PENDING |
| `[data-variant="secondary"]` present | PENDING |
| `[data-variant="ghost"]` present | PENDING |
| `:hover` states present | PENDING |
| `:active` states present | PENDING |
| `:focus-visible` with `sys.a11y.focus.*` tokens | PENDING |
| `:disabled` with `sys.a11y.disabled.*` tokens | PENDING |
| `[aria-disabled="true"]` present | PENDING |
| `min-block-size: var(--sys-a11y-touch-target-minimum)` | PENDING |
| `transition` using `sys.motion.duration.feedback + sys.motion.ease.interface` | PENDING |
| No @keyframes | PENDING |
| Token: all accent/state/text/font/space/radius/border/motion/a11y verified | PENDING |

---

## Token Cross-Check

All tokens consumed by components.css must exist in both:

```
TOKEN_REGISTRY.md
website/styles/tokens.css
```

| Token | TOKEN_REGISTRY.md | tokens.css | Status |
| :--- | :--- | :--- | :--- |
| `--sys-color-divider-default` | ✅ | ✅ | PENDING |
| `--sys-color-border-subtle` | ✅ | ✅ | PENDING |
| `--sys-color-border-default` | ✅ | ✅ | PENDING |
| `--sys-color-border-strong` | ✅ | ✅ | PENDING |
| `--sys-border-subtle` | ✅ | ✅ | PENDING |
| `--sys-border-interactive` | ✅ | ✅ | PENDING |
| `--sys-space-stack-sm` | ✅ | ✅ | PENDING |
| `--sys-space-inline-xs` | ✅ | ✅ | PENDING |
| `--sys-space-inline-sm` | ✅ | ✅ | PENDING |
| `--sys-space-inset-xs` | ✅ | ✅ | PENDING |
| `--sys-space-inset-sm` | ✅ | ✅ | PENDING |
| `--sys-space-inset-md` | ✅ | ✅ | PENDING |
| `--sys-color-surface-raised` | ✅ | ✅ | PENDING |
| `--sys-color-surface-overlay` | ✅ | ✅ | PENDING |
| `--sys-color-text-primary` | ✅ | ✅ | PENDING |
| `--sys-color-text-inverse` | ✅ | ✅ | PENDING |
| `--sys-color-accent-primary` | ✅ | ✅ | PENDING |
| `--sys-color-accent-hover` | ✅ | ✅ | PENDING |
| `--sys-color-accent-active` | ✅ | ✅ | PENDING |
| `--sys-color-semantic-info` | ✅ | ✅ | PENDING |
| `--sys-color-semantic-success` | ✅ | ✅ | PENDING |
| `--sys-color-semantic-warning` | ✅ | ✅ | PENDING |
| `--sys-color-semantic-error` | ✅ | ✅ | PENDING |
| `--sys-font-body-family` | ✅ | ✅ | PENDING |
| `--sys-font-body-size` | ✅ | ✅ | PENDING |
| `--sys-font-body-weight` | ✅ | ✅ | PENDING |
| `--sys-font-body-line-height` | ✅ | ✅ | PENDING |
| `--sys-font-caption-size` | ✅ | ✅ | PENDING |
| `--sys-font-caption-weight` | ✅ | ✅ | PENDING |
| `--sys-font-caption-line-height` | ✅ | ✅ | PENDING |
| `--sys-radius-badge` | ✅ | ✅ | PENDING |
| `--sys-radius-control` | ✅ | ✅ | PENDING |
| `--sys-motion-duration-feedback` | ✅ | ✅ | PENDING |
| `--sys-motion-ease-interface` | ✅ | ✅ | PENDING |
| `--sys-a11y-focus-ring` | ✅ | ✅ | PENDING |
| `--sys-a11y-focus-offset` | ✅ | ✅ | PENDING |
| `--sys-a11y-disabled-opacity` | ✅ | ✅ | PENDING |
| `--sys-a11y-disabled-cursor` | ✅ | ✅ | PENDING |
| `--sys-a11y-touch-target-minimum` | ✅ | ✅ | PENDING |

---

## Forbidden Scope Validation

| Check | Status |
| :--- | :--- |
| `.nv-input` absent | PENDING |
| `.nv-textarea` absent | PENDING |
| `.nv-checkbox` absent | PENDING |
| `.nv-radio` absent | PENDING |
| `.nv-switch` absent | PENDING |
| `.nv-tooltip` absent | PENDING |
| `tokens.css` NOT in diff | PENDING |
| `base.css` NOT in diff | PENDING |
| `layout.css` NOT in diff | PENDING |
| `utilities.css` NOT in diff | PENDING |
| `index.html` NOT in diff | PENDING |
| JavaScript NOT in diff | PENDING |

---

## Validation Commands

```bash
# Whitespace
git diff --check

# Changed files
git diff --name-only

# Repository state
git status --short

# Token list from components.css
grep -o "var(--[^)]*)" website/styles/components.css | sed 's/var(//;s/)//' | sort -u

# No @keyframes
grep -n "@keyframes" website/styles/components.css

# No F4-F9 selectors
grep -n "\.nv-input\|\.nv-textarea\|\.nv-checkbox\|\.nv-radio\|\.nv-switch\|\.nv-tooltip" website/styles/components.css
```

---

## Validation Log

```text
Validation file created: 2026-06-08
Validator: PENDING (HUB)
Status: PENDING
```
