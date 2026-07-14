# NV-1000 Phase 12.6 — Legacy Removal Report

> **ABORTED — LABS RESTORED TO PHASE 12.5**
>
> This report is retained as historical rollback evidence. Its runtime
> architecture is inactive and must not be treated as the current Labs state.

## 1. Executive Summary

Phase 12.6 applied a bounded recovery pass to the Laboratory workspace. The
canonical behavioral root is now `[data-lab-v4-workspace]`; the renderer no
longer emits `.nv-lab-instrument` or `.nv-lab-workspace-body`, and the runtime
no longer writes `data-workspace-phase`. A four-viewport geometry regression
suite and the required evidence artifacts were added.

## 2. Final Verdict

**BLOCKED BY VALIDATION ENVIRONMENT**

The shell has no Node.js, npm, npx, or browser runtime. Full Playwright,
accessibility, lifecycle, visual parity, and complete audit gates could not be
rerun. Historical declarations still exist in `website/styles/laboratories.css`
and must be removed only after browser-validated ownership batches.

## 3. Accepted Phase 12.5 Baseline

Phase 12.5 artifacts remain the baseline. The existing 351-test result is
recorded as baseline evidence only and is not reused as Phase 12.6 evidence.

## 4. Initial Failed Deletion Attempt

The failed worktree state, diff fingerprint, screenshots, and missing computed
style capture are recorded under `artifacts/nv-1000-phase-12-6/`.

## 5. Root Cause of the Layout Regression

The failed run showed the chart subtree intercepting console controls. The
supported cause is legacy instrument/workspace layout ownership remaining
active beside v4 flow rules. The emitted compatibility classes were removed so
the legacy scoped geometry no longer matches the canonical route.

## 6. Final CSS Responsibility Architecture

The active v4 files remain the intended responsibility boundary:

- `laboratory-workspace-v4.css` — workspace, stage, and console flow.
- `laboratory-disclosure-workspace-v4.css` — disclosure panels and bodies.
- `laboratory-workspace-states-v4.css` — execution/research state selectors.

The historical `laboratories.css` blocks are not yet fully consolidated.

## 7. Workspace Ownership

`getWorkspaceBody()` now resolves `[data-lab-v4-workspace]`. The canonical
workspace owns normal document flow; no legacy workspace class is emitted.

## 8. Scientific Stage Ownership

The v4 stage continues to contain visualization, telemetry, and current
finding regions. The new geometry suite asserts visualization and telemetry
containment and chart/console separation.

## 9. Execution Console Ownership

The v4 execution console remains the only emitted playback console. Existing
delegated controls and canonical execution state attributes are preserved.

## 10. Disclosure Ownership

Parameters, Inspector, Findings History, Scientific Log, and Research remain
inside the v4 disclosure workspace. The Parameters header is now a keyboard
operable non-nesting disclosure control, allowing its Reset button to remain a
real button.

## 11. Research Ownership

Research continues to use `data-research-state` and the v4 research panel.
Route isolation behavior remains in the existing controller implementation.

## 12. Compatibility Hook Removal

`.nv-lab-instrument`, `.nv-lab-workspace-body`, and `data-workspace-phase` were
removed from active DOM/runtime ownership. Historical CSS references remain
documented as residue pending browser-validated deletion.

## 13. Legacy Rule Removal

The first bounded removal changed only emitted/runtime hooks and removed
decorative keyframe rules. Broad legacy CSS deletion was intentionally not
performed without a runnable browser validation loop.

## 14. Dead Class and Wrapper Removal

The two root compatibility classes are no longer emitted. No semantic
accessibility wrapper was flattened.

## 15. Decorative Keyframe Removal

Nine non-functional Laboratory keyframes and their animation assignments were
removed. The final keyframe inventory for Laboratory styles is empty.

## 16. Breakpoint Consolidation

Not complete. The v4 files expose 900px and 700px transitions, while historical
breakpoints remain in `laboratories.css`. Consolidation requires the mandated
viewport run.

## 17. Specificity Debt Removal

Not complete. Remaining `!important` declarations and historical precedence
rules are recorded in `specificity-cleanup.json`; no unvalidated broad removal
was attempted.

## 18. Test Selector Migration

Active Bayes, Embedding Similarity, and complete Laboratory audit selectors now
use `[data-lab-v4-workspace]`. The Phase 12.0 archaeology test intentionally
retains historical selectors as evidence.

## 19. Geometry Regression Protection

Added `tests/nv-1000-phase-12-6-geometry-regression.spec.ts` and its focused
Playwright config. Assertions cover stage containment, normal vertical flow,
Parameters control parity, and collapsed Inspector containment at all required
viewports.

## 20. Visual Parity

Not run in this environment. Phase 12.5 remains the comparison baseline.

## 21. Accessibility

Static improvements include non-nested Parameters controls and Enter/Space
disclosure handling. Browser keyboard, contrast, and screen-reader checks were
not runnable.

## 22. Lifecycle

Run, Pause, Step, Reset, completion, Research activation, and route-reset flows
remain represented by the canonical controller/state model. Runtime execution
was not rerun because Node.js is unavailable.

## 23. Complete Laboratory Audit

The previous 351/351 result is preserved as Phase 12.5 baseline evidence. A
fresh Phase 12.6 audit is required because production CSS, DOM, and selectors
changed.

## 24. Cleanup Metrics

Current Laboratory stylesheet metrics are recorded in
`artifacts/nv-1000-phase-12-6/cleanup-metrics.json`. They are descriptive, not
an artificial deletion target.

## 25. Legacy Residue Scan

The scan is `PARTIAL`: active runtime hooks are clean, but legacy CSS selectors,
breakpoints, and duplicate ownership remain in `laboratories.css`.

## 26. Remaining Exceptions

- Node.js/npm/browser runtime unavailable in the execution environment.
- Full legacy CSS ownership consolidation is pending browser validation.
- Full visual, accessibility, lifecycle, and audit evidence is pending.

## 27. Final Phase 12 Closure Decision

Phase 12 is not closed in this environment. The exact closure verdict
`LEGACY REMOVAL COMPLETE — PHASE 12 CLOSED` must be issued only after the full
Phase 12.6 regression, visual, accessibility, lifecycle, and residue gates pass
on a Node-equipped runner.
