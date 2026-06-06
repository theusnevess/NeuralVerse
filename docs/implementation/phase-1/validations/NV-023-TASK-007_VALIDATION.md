# Validation — NV-023-TASK-007

## Task ID

```text
NV-023-TASK-007
```

## Task Name

```text
M6 Token CSS Implementation
```

---

## Validation Checklist

All statuses begin as `PENDING`. HUB reviewer updates each to `PASS` or `FAIL`.

---

### File Scope Validation

| Check | Status |
| :--- | :--- |
| tokens.css exists | PENDING |
| Only tokens.css changed under website/styles/ | PENDING |
| base.css NOT modified | PENDING |
| layout.css NOT modified | PENDING |
| components.css NOT modified | PENDING |
| utilities.css NOT modified | PENDING |
| No HTML modified | PENDING |
| No JavaScript modified | PENDING |

---

### Selector Validation

| Check | Status |
| :--- | :--- |
| No component selectors introduced | PENDING |
| No layout selectors introduced | PENDING |
| No page selectors introduced | PENDING |
| No utility classes introduced | PENDING |
| No element selectors introduced | PENDING |
| No ID selectors introduced | PENDING |
| :root selectors only (plus @media block) | PENDING |
| prefers-reduced-motion block present | PENDING |
| prefers-reduced-motion block contains only motion token remaps | PENDING |

---

### Motion Token Validation

| Check | Status |
| :--- | :--- |
| sys.motion.intensity.none present | PENDING |
| sys.motion.intensity.reduced present | PENDING |
| sys.motion.intensity.low present | PENDING |
| sys.motion.intensity.medium present | PENDING |
| sys.motion.intensity.high ABSENT | PENDING |

---

### Token Hierarchy Validation

| Check | Status |
| :--- | :--- |
| Token hierarchy preserved (ref → sys → ctx) | PENDING |
| Reference tokens define canonical values | PENDING |
| Semantic tokens consume reference tokens (no raw values) | PENDING |
| Context tokens consume semantic tokens | PENDING |
| No forbidden hierarchy violations | PENDING |

---

### Forbidden Scope Validation

| Check | Status |
| :--- | :--- |
| No component implementation introduced | PENDING |
| No layout implementation introduced | PENDING |
| No page implementation introduced | PENDING |
| No UI implementation introduced | PENDING |
| No JavaScript behavior introduced | PENDING |
| No educational content introduced | PENDING |
| No backend/API/database introduced | PENDING |

---

### Coverage Validation

| Domain | ref.* | sys.* | ctx.* | Status |
| :--- | :--- | :--- | :--- | :--- |
| Color | 14 tokens | 27 tokens | 18 tokens | PENDING |
| Typography | 23 tokens | 15 tokens | 8 tokens | PENDING |
| Spacing | 11 tokens | 15 tokens | 6 tokens | PENDING |
| Radius | 5 tokens | 4 tokens | 3 tokens | PENDING |
| Border | 4 tokens | 5 tokens | 5 tokens | PENDING |
| Elevation/Shadow | 4 tokens | 8 tokens | 4 tokens | PENDING |
| Motion | 8 tokens | 10 tokens | 4 tokens | PENDING |
| Z-Index | 10 tokens | 9 tokens | 5 tokens | PENDING |
| Accessibility (a11y) | — | 15 tokens | — | PENDING |

---

### Repository Validation

| Check | Status |
| :--- | :--- |
| git diff --check passes | PENDING |
| Changed files limited to authorized scope | PENDING |
| Commit message follows convention | PENDING |
| Repository clean after commit | PENDING |

---

## Expected git diff --name-only Output

```text
website/styles/tokens.css
docs/implementation/phase-1/backlog/PHASE_1_BACKLOG.md
docs/implementation/phase-1/packages/NV-023-TASK-007.md
docs/implementation/phase-1/reviews/NV-023-TASK-007_REVIEW.md
docs/implementation/phase-1/validations/NV-023-TASK-007_VALIDATION.md
```

Any file outside this list requires immediate stop and investigation.

---

## Validation Commands

```bash
# Check for whitespace errors
git diff --check

# Check repository status
git status --short

# List changed files
git diff --name-only

# Inspect tokens.css for forbidden patterns
grep -n "\." website/styles/tokens.css | grep -v ":root" | grep -v "@media" | grep -v "/\*"

# Confirm sys.motion.intensity.reduced present
grep "sys-motion-intensity-reduced" website/styles/tokens.css

# Confirm sys.motion.intensity.high absent
grep "sys-motion-intensity-high" website/styles/tokens.css
# Expected: no output
```

---

## Validation Log

```text
Validation file created: 2026-06-06
Validator: PENDING (HUB)
Status: PENDING
```
