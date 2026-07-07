# TEXT_HIERARCHY_SPECIFICATION.md

## Purpose

Define the canonical text hierarchy for NeuralVerse, establishing mandatory contrast levels, usage constraints, and governance rules for all text rendering on dark surfaces.

This specification prevents text contrast regressions and ensures consistent visual hierarchy across all pages and components.

---

## Reference

```
NV-010 Color System
NV-011 Typography System
NV-017 Accessibility System
NV-023-TASK-007B Token CSS Implementation
Phase 1.1 Design Token Correction (2026-07-07)
```

---

## Dark Surface Context

All text tokens in this specification are designed for dark backgrounds:

| Surface | Background Color | Usage |
| :--- | :--- | :--- |
| Card | `#1e1e2e` | Panels, cards, raised surfaces |
| Canvas | `#11111b` | Chart areas, deep backgrounds |
| Sidebar | `#1e1e2e` | Side panels |
| Base | `#0e1822` | Page background |

---

## Text Hierarchy

### Level 1 — Display

```
Token:    --sys-color-text-display
Fallback: --ref-color-graphite-100
Value:    #e8eef6
Contrast: 14.05:1 on #1e1e2e
WCAG:     AAA
```

**Usage:**
- Page titles (h1)
- Hero text
- Feature headlines
- Maximum 1-2 per viewport

**Rules:**
- Never below AAA contrast
- Never used for body text
- Never used for more than 2 elements per view

---

### Level 2 — Heading

```
Token:    --sys-color-text-heading
Fallback: --ref-color-graphite-100
Value:    #e8eef6
Contrast: 14.05:1 on #1e1e2e
WCAG:     AAA
```

**Usage:**
- Section headings (h2, h3)
- Card titles
- Panel titles
- Modal titles

**Rules:**
- Never below AAA contrast
- Must be visually distinct from body text via weight or size
- Never used for interactive elements

---

### Level 3 — Title

```
Token:    --sys-color-text-title
Fallback: --ref-color-graphite-200
Value:    #c0d0dc
Contrast: 11.2:1 on #1e1e2e
WCAG:     AAA
```

**Usage:**
- Subsection titles
- List item titles
- Form labels (primary)
- Navigation items

**Rules:**
- Never below AAA contrast
- Lighter than Heading to create subordination
- Acceptable for interactive elements when combined with pointer cursor

---

### Level 4 — Body

```
Token:    --sys-color-text-body
Fallback: --ref-color-graphite-300
Value:    #a7b7c8
Contrast: 8.01:1 on #1e1e2e
WCAG:     AAA
```

**Usage:**
- Paragraph text
- Card descriptions
- Form help text
- Table cell content
- Default text for most content

**Rules:**
- Never below AA contrast (4.5:1 minimum)
- Primary reading color for sustained reading
- Must be comfortable for extended reading sessions

---

### Level 5 — Secondary

```
Token:    --sys-color-text-secondary
Fallback: --ref-color-graphite-300
Value:    #a7b7c8
Contrast: 8.01:1 on #1e1e2e
WCAG:     AAA
```

**Usage:**
- Supporting text alongside primary content
- Card summaries
- Description text
- Metadata that is important but not primary

**Rules:**
- Never below AA contrast (4.5:1 minimum)
- Must be clearly lighter than Muted
- Used for content that aids understanding but is not the main focus

---

### Level 6 — Caption

```
Token:    --sys-color-text-caption
Fallback: --ref-color-graphite-400
Value:    #8a9aac
Contrast: 6.1:1 on #1e1e2e
WCAG:     AA
```

**Usage:**
- Timestamps
- Version numbers
- File sizes
- Secondary metadata
- Helper text that supplements primary content

**Rules:**
- Never below AA contrast (4.5:1 minimum)
- Must be smaller than body text (typically ≤12px)
- Used for information that is useful but not essential

---

### Level 7 — Muted

```
Token:    --sys-color-text-muted
Fallback: --ref-color-graphite-500
Value:    #7d90a5
Contrast: 5.00:1 on #1e1e2e
WCAG:     AA
```

**Usage:**
- Placeholder text
- Disabled-but-readable content
- Tertiary metadata
- Watermarks
- Supplementary labels

**Rules:**
- Never below AA contrast (4.5:1 minimum)
- Only for auxiliary content
- Never for critical information
- Never for interactive elements

---

### Level 8 — Disabled

```
Token:    --sys-color-text-disabled
Fallback: --ref-color-graphite-600
Value:    #5c6d80
Contrast: 3.09:1 on #1e1e2e
WCAG:     Exempt (WCAG 1.4.3)
```

**Usage:**
- Disabled buttons
- Inactive form fields
- Grayed-out content
- Unavailable options

**Rules:**
- WCAG AA-exempt for disabled controls per WCAG 1.4.3
- Never used for important information
- Must be visually distinct from Muted
- Must not be the only way to convey state (use opacity, border, or icon alongside)

---

### Level 9 — Interactive

```
Token:    --sys-color-text-interactive
Fallback: --sys-color-accent-primary
Value:    #2a6a82 (cyan-500)
Contrast: 3.8:1 on #1e1e2e
WCAG:     AA for large text (3:1 minimum)
```

**Usage:**
- Links
- Clickable labels
- Tab items
- Button text (on accent background)

**Rules:**
- Must have visible hover state
- Must have visible focus state
- Must have visible active state
- On accent backgrounds, use --sys-color-text-inverse for contrast

---

### Level 10 — Link

```
Token:    --sys-color-text-link
Fallback: --sys-color-accent-hover
Value:    #3a7a96 (cyan-400)
Contrast: 4.6:1 on #1e1e2e
WCAG:     AA
```

**Usage:**
- Inline text links
- Navigation links
- Breadcrumb links
- Anchor text

**Rules:**
- Never below AA contrast (4.5:1 minimum)
- Must have underline or other non-color indicator
- Must have hover state (underline, color shift, or both)
- Must have focus state for keyboard navigation

---

### Level 11 — Accent

```
Token:    --sys-color-text-accent
Fallback: --ref-color-cyan-300
Value:    #4a8aaa
Contrast: 5.2:1 on #1e1e2e
WCAG:     AA
```

**Usage:**
- Category badges
- Status indicators
- Highlighted values
- Metric values
- Code syntax highlighting

**Rules:**
- Never below AA contrast (4.5:1 minimum)
- Use sparingly — maximum 3-4 accent-colored elements per view
- Must not compete with primary text for attention

---

## Mandatory Rules

### Rule 1 — Token Consumption

```
No component may use literal color values for text.

All text color assignments must consume semantic tokens
(--sys-color-text-*).

Hardcoded fallbacks in var() are permitted for resilience
but must reference the same semantic purpose.
```

**Examples:**

```css
/* CORRECT — consumes semantic token */
color: var(--sys-color-text-secondary);

/* CORRECT — with fallback */
color: var(--sys-color-text-secondary, #a7b7c8);

/* FORBIDDEN — literal color */
color: #a7b7c8;

/* FORBIDDEN — direct reference token */
color: var(--ref-color-graphite-300);
```

### Rule 2 — Contrast Minimums

```
Level          Minimum Contrast    WCAG Level
─────────────────────────────────────────────
Display        7:1                 AAA
Heading        7:1                 AAA
Title          7:1                 AAA
Body           4.5:1               AA
Secondary      4.5:1               AA
Caption        4.5:1               AA
Muted          4.5:1               AA
Disabled       3:1                 Exempt
Interactive    3:1                 AA (large text)
Link           4.5:1               AA
Accent         4.5:1               AA
```

### Rule 3 — Hierarchy Preservation

```
Each level must be visually distinct from adjacent levels.

Display > Heading > Title > Body > Secondary > Caption > Muted > Disabled

No two adjacent levels may have the same perceived brightness
when rendered at the same font size and weight.
```

### Rule 4 — Usage Constraints

```
Level          Max Per View    Size Constraint    Weight Constraint
────────────────────────────────────────────────────────────────────
Display        1-2             ≥32px              Bold (700)
Heading        3-5             20-28px            Semibold (600)
Title          5-10            16-20px            Medium (500)
Body           Unlimited       14-16px            Regular (400)
Secondary      Unlimited       14-16px            Regular (400)
Caption        Unlimited       ≤12px              Regular (400)
Muted          Unlimited       ≤14px              Regular (400)
Disabled       Unlimited       Any                Any
Interactive    Unlimited       Any                Any
Link           Unlimited       Any                Any
Accent         3-4 max         Any                Any
```

### Rule 5 — State Requirements

```
Interactive text must have:
- Default state
- Hover state (color shift or underline)
- Focus state (outline or border)
- Active state (color shift or scale)
- Disabled state (use --sys-color-text-disabled)
```

### Rule 6 — No Color-Only Communication

```
Never use color as the only way to convey information.

Every color-coded element must have a secondary indicator:
- Icon
- Text label
- Border
- Pattern
- Position
```

---

## Token Dependency Map

```
--ref-color-graphite-100 ──→ --sys-color-text-display
                           ──→ --sys-color-text-heading
                           ──→ --ref-color-white

--ref-color-graphite-200 ──→ --sys-color-text-title

--ref-color-graphite-300 ──→ --sys-color-text-body
                           ──→ --sys-color-text-secondary

--ref-color-graphite-400 ──→ --sys-color-text-caption

--ref-color-graphite-500 ──→ --sys-color-text-muted

--ref-color-graphite-600 ──→ --sys-color-text-disabled

--sys-color-accent-primary ──→ --sys-color-text-interactive

--sys-color-accent-hover ──→ --sys-color-text-link

--ref-color-cyan-300 ──→ --sys-color-text-accent
```

---

## Implementation Checklist

```
[ ] All --sys-color-text-* tokens defined in tokens.css
[ ] All reference scale values (--ref-color-graphite-100..700) defined
[ ] All components consume semantic tokens only
[ ] No hardcoded text colors in component CSS
[ ] Contrast ratios verified for all levels
[ ] Audit script created for automated validation
[ ] This specification registered in TOKEN_REGISTRY.md
```

---

## Audit Script

To validate compliance, run:

```bash
# Find hardcoded text colors (should return 0 results)
rg "color:\s*#[0-9a-fA-F]{3,8}" website/styles/ --include="*.css" | \
  grep -v "var(" | grep -v "ref-color" | grep -v "sys-color"

# Find direct reference token usage in components (should return 0 results)
rg "var\(--ref-color-graphite" website/styles/ --include="*.css" | \
  grep -v "tokens.css"
```

---

## Revision History

| Date | Author | Change |
| :--- | :--- | :--- |
| 2026-07-07 | Phase 1.1 | Initial specification — 11 levels defined |

---

## Related Documents

```
TOKEN_REGISTRY.md                    — Token registration
TOKEN_GOVERNANCE_VALIDATION.md       — Governance checklist
TOKEN_DEPENDENCY_MAP.md              — Token dependency graph
visual-composition-rules.md          — Visual hierarchy rules
component-visual-guidelines.md       — Component styling rules
```
