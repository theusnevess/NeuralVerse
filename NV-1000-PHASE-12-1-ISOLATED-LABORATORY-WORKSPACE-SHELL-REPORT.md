# NV-1000 Phase 12.1: Isolated Laboratory Workspace Shell

## Executive Summary

**ISOLATED WORKSPACE SHELL COMPLETE — READY FOR PHASE 12.2.**

All ten Laboratory detail routes now render a single executable v4 workspace root with five ordered regions. This phase changes ownership and containment only. Existing component internals, calculations, execution, XAI, logs, research, parameters, and continuations remain legacy implementations hosted once inside their assigned v4 region.

## Phase 12.0 Evidence Used

The Phase 12.0 archaeology report identified the Phase 5-10 cascade as legacy-active and Phase 11 as the current in-flow composition. The preservation contract required retaining `data-lab-workspace`, execution data attributes, parameters, log, XAI, research, and inspector selectors. The v4 shell therefore uses a new namespace for structure while retaining legacy classes only as compatibility hooks.

## Files Changed

Production:

- `website/scripts/laboratory/laboratory-controller.js`
- `website/scripts/laboratory/lab-ui-controller.js`
- `website/styles/laboratory-workspace-v4.css`
- `website/index.html`

Test and evidence:

- `tests/nv-1000-phase-12-1-isolated-shell.spec.ts`
- `tests/playwright.phase12-1.config.ts`
- `artifacts/nv-1000-phase-12-1/laboratory-shell-matrix.json`

## New DOM Architecture

```text
[data-lab-v4-workspace].nv-lab-v4-workspace
|- [data-lab-v4-header]
|- [data-lab-v4-stage]
|- [data-lab-v4-console]
|- [data-lab-v4-disclosure]
`- [data-lab-v4-continuations]
```

The v4 root is the only `[data-lab-workspace]` and has `data-workspace-version="4"`. All regions are direct children in DOM order. The root also retains `.nv-lab-workspace-body.nv-lab-instrument` temporarily because existing UI behavior and internal component CSS still depend on those selectors.

## Runtime Ownership And Extension Points

| V4 region | Active single-instance legacy content |
|---|---|
| Header | back navigation, family, title, summary, metadata, Research Mode toggle |
| Stage | canvas region, observations, telemetry, Inspector HUD, current XAI panel |
| Console | timeline, run/pause/step/reset, speed, execution status |
| Disclosure | parameters, moved Inspector Details, Scientific Log, Research Mode surfaces |
| Continuations | continuation context and next experiment links |

No subsystem was copied or hidden for compatibility. The controller emits the regions as active owners; it does not wrap an independent legacy workspace.

## Behavioral Contracts Preserved

Preserved data contracts include `[data-lab-workspace]`, `[data-lab-title]`, `[data-lab-canvas-region]`, `[data-lab-inspector]`, `[data-xai-panel]`, `[data-lab-timeline]`, `[data-action]`, `[data-lab-parameters-drawer]`, `[data-lab-log]`, and `[data-research-toggle]`. Existing controller queries and Playwright selectors continue to target these attributes.

## CSS Isolation

`website/styles/laboratory-workspace-v4.css` loads after legacy laboratory and explainability CSS. It owns only root containment and five-region grid placement. Direct-child selectors intentionally outrank legacy `.nv-lab-instrument .nv-lab-canvas-region` placement, preventing Phase 11 child grid areas from creating implicit columns. Internal component styling remains legacy until its migration phase.

The shell uses normal grid flow, `min-width: 0`, `position: relative`, and `isolation: isolate`. It introduces no structural absolute/fixed positioning, viewport-height trap, or workspace overflow clipping.

## State Synchronization

The v4 root initializes with `data-workspace-state="preparation"` and `data-research-state="inactive"`.

- Existing execution state updates mirror to `preparation`, `running`, `paused`, and `completed`.
- Existing Research Mode toggles mirror to `active` and `inactive`.
- No new state machine or persistence state was introduced.

## Ten-Laboratory Validation

`laboratory-shell-matrix.json` records all ten canonical labs. For each route, the test confirmed exactly one root and one of each five region, correct direct-child DOM order, one title/timeline/parameter drawer, conditional component maximums, no stage-descendant parameters or controls, and preparation/research initial state attributes.

## Responsive Geometry

The new shell test verified zero adjacent region intersection and no horizontal overflow for Gradient Descent at 1920x1080, 1440x900, 1280x800, 1024x768, 768x1024, 430x932, 390x844, and 360x740. The direct-child v4 grid override was necessary because the initial compatibility implementation allowed legacy grid-area values to create implicit columns; this was corrected before acceptance.

## Accessibility And Duplicate Detection

The v4 root is a `section`, not a second `main`, because the global application already owns the main landmark. Region elements use semantic `header`/`section` elements with accessible labels where appropriate. The shell test verifies exactly one active root and component counts, preventing duplicate active controls, parameters, XAI, research panels, logs, and timelines.

## Existing Regression Results

- Phase 12.1 shell suite: **10 passed**
- Existing Laboratory suite: **351 passed** in 12.5 minutes
- Static JavaScript checks: passed
- Laboratory validator: **300 passed**, 2 existing medium warnings for support data files
- `git diff --check`: passed

## Legacy Elements Still Present

`.nv-lab-workspace-body`, `.nv-lab-instrument`, `.nv-lab-canvas-region`, `.nv-lab-instrument-bar`, `.nv-lab-drawer-layer`, and all current component classes remain as compatibility selectors. They are not new structural ownership and must not be removed before component migrations and parity validation.

## Deferred Migration Work

Phase 12.2 may migrate only the stage contents: canvas, visualization, essential telemetry, and current finding. Console, disclosure, log, Research Mode, and continuations remain out of scope until later phases.

## Phase 12.2 Handoff Contract

Phase 12.2 may safely target:

- Stage mount point: `[data-lab-v4-stage]`
- Existing visualization mount contract: `[data-obs-body]` / `[data-lab-visualization]`
- Existing telemetry contract: `[data-lab-hud-telemetry]` and `[data-lab-hud-metrics]`
- Existing current finding contract: `[data-xai-panel]` and `[data-xai-live-finding]`

Phase 12.2 must not reuse legacy structural classes as its layout owner: `.nv-lab-instrument`, `.nv-lab-canvas-region`, `.nv-lab-hud`, `.nv-lab-ws-setup`, `.nv-lab-ws-log`, or legacy `:has()` workspace rules.

## Remaining Risks

1. Internal legacy styles still control component presentation by design.
2. Existing XAI findings remain conditionally absent in limited execution for Embedding Similarity and Precision vs Recall; Phase 12.2 must report this rather than alter XAI rules.
3. Existing accessibility limitations inside legacy Research Mode and XAI components remain deferred.

## Phase 12.2 Prerequisite Decision

**Satisfied.** The v4 root and five extension points are executable production owners across all ten laboratories. Phase 12.2 can migrate the scientific stage without creating another wrapper or duplicating component instances.
