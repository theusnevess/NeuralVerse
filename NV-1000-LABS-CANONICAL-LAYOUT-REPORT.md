# NV-1000 Labs Canonical Layout Report

## 1. Executive Summary
The Labs now use one workspace sequence: Header, Observation, Execution, Analysis, Research, Completion, and Continuation. Gradient Descent established the reference composition; the same selectors and responsive contracts serve all ten laboratories.

## 2. Final Verdict
PARTIAL CANONICAL LAYOUT — REFINEMENT REQUIRED

The expanded canonical Playwright suite passed 5/5. Structural Correction and Phase 12.1-12.5 historical suites also passed. Root TypeScript retains unrelated pre-existing test-source diagnostics.

## 3. Structural Readiness
The accepted Structural Correction baseline remains frozen. No lifecycle, disclosure, focus, parameter-schema, registry, or scientific-algorithm contract was changed.

## 4. Initial Layout Problems
The former instrument rules imposed excessive primary-stage padding and a 280px SVG cap, producing unused stage area. Telemetry and execution controls also lacked one clear spatial hierarchy.

## 5. Implementation Scope
Only `website/styles/laboratory-workspace-v4.css` changed in this pass. It establishes the stage sizing and execution-control ordering owned by the canonical layout layer.

## 6. Information Contract
All existing surfaces, controls, telemetry, diagnostics, research fields, completion data, and continuations remain present. See `artifacts/nv-1000-labs-canonical-layout/information-preservation-matrix.json`.

## 7. Canonical Workspace Model
`Header -> Observation -> Execution -> Analysis -> Research -> Completion -> Continuation` is the DOM, keyboard, and mobile reading order.

## 8. Region Ownership
`canonical-region-ownership.json` assigns one semantic, layout, and responsive owner to every workspace region. `laboratory-controller` owns region markup, `lab-ui-controller` owns dynamic completion content, and `laboratory-workspace-v4.css` owns spatial composition.

## 9. Semantic DOM Order
Desktop uses CSS Grid only for placement. It does not reorder elements or duplicate them across breakpoints.

## 10. Laboratory Header
The compact header retains back-navigation, category, title, purpose, duration, difficulty, and prerequisite metadata without becoming a hero surface.

## 11. Observation Deck
Observation combines the Scientific Stage and Scientific Context in a shared desktop grid and stacks them at tablet/mobile widths.

## 12. Scientific Stage Placement
The canonical owner removes legacy excess padding and renderer height caps while preserving each SVG `viewBox`; charts therefore gain useful area without changing their scientific geometry.

## 13. Scientific Context
Essential telemetry and the current finding remain adjacent to the Stage. Detailed diagnostics remain in Inspector.

## 14. Execution Deck
Execution reads in order: state, timeline, primary controls, then reset and speed controls. Primary actions now span a dedicated row instead of competing with secondary actions.

## 15. Analysis Deck
Analysis uses the semantic order Experiment Configuration, Inspector, Findings History, Scientific Log. It is a two-column grid only where content remains readable and is single-column below 900px.

## 16. Experiment Configuration
The learner-facing label is Experiment Configuration. Parameter controls, defaults, reset behavior, values, and persistence remain unchanged.

## 17. Inspector
Inspector remains a normal-flow, keyboard-accessible diagnostic surface separate from telemetry and completion.

## 18. Findings History
Findings History remains an interpretive milestone surface, separate from execution event chronology.

## 19. Scientific Log
Scientific Log preserves chronological experiment events and its distinct denser presentation.

## 20. Research Deck
Research remains a first-class normal-flow deck with the existing hypothesis, notes, bookmarks, evidence, and conclusion workflow.

## 21. Completion Deck
Dynamic completion content is inserted before Continuation and retains final result visibility.

## 22. Continuation Deck
Next Experiments remains the final, secondary workspace region.

## 23. Responsive Architecture
The canonical suite exercises 1440x900, 1280x800, 1024x768, 768x1024, 390x844, and 360x740. The observation rail stacks below 900px and the analysis grid becomes a single column.

## 24. Spacing Rhythm
The V4 workspace uses `--nv-lab-deck-gap` for major deck separation and `--nv-lab-panel-gap` for internal panels.

## 25. Surface Hierarchy
Workspace, major deck, and internal panel/control group remain the only primary surface levels. No decorative effects were introduced.

## 26. Cross-Laboratory Consistency
All ten labs are covered by the canonical geometry test and share the V4 region selectors.

## 27. Redundancy Review
The classification artifact records semantic and dead-wrapper decisions. No accessibility support was removed.

## 28. Accessibility
The canonical suite reports zero horizontal overflow, zero hidden focus targets, and coherent DOM/visual region order for all labs and viewports.

## 29. Information Preservation
The preservation matrix reports no missing surfaces, controls, parameters, metrics, diagnostics, research fields, completion content, or continuations.

## 30. Playwright Validation
`npx playwright test -c tests/playwright.canonical-layout.config.ts` passed: 5 tests, all ten labs, all six supported viewports, explicit inventory, disclosure/focus, and completion-order coverage.

## 31. Historical Regression
Structural Correction and Phase 12.1-12.5 configurations passed. The complete 351-test Laboratory audit remains the final outstanding validation gate.

## 32. Manual Layout Review
Gradient Descent at 1440x900 was reviewed after the stage sizing correction. The plot now fills the useful stage width, telemetry is adjacent, and Execution starts immediately after Observation. Broader representative review remains required.

## 33. Remaining Scientific Stage Refinement Opportunities
Scientific rendering language, annotations, and final visual polish remain deliberately outside this layout phase.

## 34. Readiness for the Next Phase
The canonical geometry is ready for broader regression validation. Scientific Stage refinement must wait for the historical regression gates.
