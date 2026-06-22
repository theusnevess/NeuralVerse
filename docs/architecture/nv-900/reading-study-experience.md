# NV-900-UI7 — Reading & Study Experience Architecture

This document specifies the design principles, structural overlays, keyboard accessibility bindings, and automated QA validation for the technical reading and study workspace in NeuralVerse.

---

## 1. Reading Layout Philosophy

To support long-form technical learning, the reading interface follows strict visual ergonomics:
- **Optimal Line Length**: Content width is capped at `800px` (approximately 70–85 characters per line) to optimize readability and prevent eye fatigue.
- **Vertical Rhythm**: Margin collapse and padding spacing use established system scale variables (`--sys-space-stack-md`, `--sys-space-layout-gap`), ensuring a consistent vertical rhythm.
- **Visual Focus**: Visual distractors are removed in Focus Mode, hiding surrounding navigation elements to keep learners engaged in content.

---

## 2. Technical Implementation Details

### 2.1 Table of Contents (TOC) Generation
- The Table of Contents is generated client-side by extracting visible `h2`, `h3`, and `h4` headings from `.nv-curriculum-reader`.
- Headings are assigned deterministic, clean slug IDs if not already declared.
- **Desktop Sidebar**: Appended as a dedicated `.nv-toc-card` in the right-hand metadata column.
- **Mobile Dropdown Accordion**: Prepended as a `<details class="nv-mobile-toc">` container inside the article, collapsing gracefully on narrow screens.
- **Smooth Navigation**: Clicking any TOC link triggers a smooth scrolling effect using browser APIs (`scrollIntoView({ behavior: 'smooth' })`).

### 2.2 Sticky Reading Header & Progress
- Prepended to the active article container with `position: sticky; top: 0;`.
- Features a blur backdrop filter (glassmorphism) matching NeuralVerse styling tokens.
- Displays Title, Type, Status Badge, Lesson name, and a "Back to Lesson" navigation route.
- **Reading Progress Bar**: A visual-only indicator positioned at the bottom of the sticky header. Its width is updated on throttled scroll events by adjusting `transform: scaleX(progress)`.

### 2.3 Responsive Adjustments
- **Viewport Support**: Tested and validated on all representative target screens (390×844 up to 1440×900).
- **Responsive Tables**: All comparison tables are dynamically wrapped inside a `.nv-table-container` block supporting independent horizontal scrolling.
- **Code Blocks**: Rounded corners, custom scrollbars, and a contextual "Copy" button that appears on hover.

---

## 3. Keyboard & Screen Reader Accessibility

- **Standard Focus Indicators**: All interactive elements (TOC links, buttons, collapsible summary tabs) have high-visibility outlines when focused via Tab.
- **Quick Shortcuts**:
  - `Home`: Scrolls smoothly back to the top of the article.
  - `End`: Scrolls smoothly to the bottom of the article.
  - `Escape`: Closes open collapsible elements (e.g. mobile TOC dropdowns).
- **ARIA Standards**: Added proper semantic wrappers (`role="banner"` for the sticky header, `aria-label` for lists).

---

## 4. Performance Optimization Strategy

- **Throttled Scroll Handlers**: Scroll updates are debounced and executed inside `requestAnimationFrame` cycles, avoiding layout thrashing.
- **Single-Pass Rendering**: The TOC is generated only once upon rendering the artifact, utilizing cached heading elements.
- **IntersectionObserver Reference**: The scroll monitor evaluates heading coordinates relative to the viewport dynamically, avoiding continuous recalculation of element positions.

---

## 5. Preservation & Evidence Boundaries

- **Draft Context intact**: No masteries, completions, or progression metrics are updated, stored, or persisted, maintaining the non-interactive governance rules.
- **Content Preservation**: Raw Markdown files and lesson compositions under `/docs/content/` were left unmodified.

---

## 6. QA Verification Summary

The Playwright test suite `scripts/nv-900-ui7-verify.js` verified the implementation under a headless Chromium context:
- Table of Contents generation and desktop sidebar mapping.
- Focus Mode toggle and sidebars visibility.
- Reading Progress bar scale transformation.
- Comparison tables and exercises wrapper highlights.
- Mobile layout accordion behavior and responsiveness.
- Keyboard navigation hooks (`Home`/`End` keys).
- Verification checklist:
  - `console.error` = 0
  - `pageerror` = 0
  - `failed requests` = 0
