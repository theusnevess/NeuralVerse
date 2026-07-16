# Canonical Accessibility Architecture

## Mission and Governance

NV-2200 applies WCAG 2.2 AA plus NeuralVerse scientific-interface requirements. Decisions follow Vision, UI Constitution, Architecture Guide, accepted Laboratory architecture, Design System, Typography and Density, Motion, then Accessibility. Accessibility is owned by canonical markup, interaction controllers, renderer equivalence, and Design System contracts, not a separate overlay.

## Semantic and Interaction Ownership

The Laboratory page has one `main` landmark and one `h1` Laboratory title. Canonical regions preserve DOM learning order: Header, Stage, configuration, execution, inspection, Research, Completion, and continuation. `laboratory-controller.js` owns region semantics and names. `lab-ui-controller.js` owns disclosure lifecycle, hidden/inert synchronization, focus restoration, and reduced-motion equivalence. `tokens.css` owns focus, typography, surface, and status semantics. Scientific renderers own their meaningful text summaries and structured alternatives.

## Core Contracts

Native controls remain the default. Visible action labels are included in accessible names. Controls expose textual state, labels, values, units, and validation relationships. Hidden or inert content is not focusable; visible Research content is never semantically hidden. Disclosure activation commits semantic visibility before height measurement, while closing applies semantic exclusion only after its valid transition. Reduced motion reaches the same final semantic state without waiting for animation.

Scientific Stage renderers require an accessible name, scientific purpose, current-state summary, and a structured or textual equivalent for essential data and interaction. Color, hover, position, and motion cannot be the only channel for scientific state.

## Validation Boundary

`tests/nv-2200-accessibility.spec.ts` and `tests/playwright.accessibility.config.ts` own automated semantic structure, essential names, hidden/inert integrity, keyboard activation, and reflow contracts across all ten Laboratories. The Laboratory title contract asserts one page-wide, visible `h1`, no hidden duplicate, title equivalence, and that the title starts the heading order. No automated rule engine is installed; no dependency was added. Real Orca review, scientific visualization equivalence, visual contrast, forced colors, and touch-target review were not performed. The project owner explicitly waived those manual gates and administratively closed NV-2200; this closure is not evidence of manual accessibility conformance.
