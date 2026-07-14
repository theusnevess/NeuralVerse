# NV-1000 Phase 11.1 Parameters Drawer Positioning

## Root Cause

The Phase 11 drawer layer still used two grid columns and explicitly assigned `.nv-lab-ws-setup` to column one. The setup panel also inherited an earlier `transform: translateX(-50%)` rule. Together those legacy declarations made the Parameters Drawer narrow and positioned it outside the Laboratory content bounds.

## DOM Ownership

Previous: the setup wrapper was an untyped `div` in the drawer layer, while Inspector relocation could precede it.

Corrected: Parameters is now the direct semantic child `<section class="nv-lab-drawer nv-lab-drawer--parameters nv-lab-ws-setup" data-lab-parameters-drawer>` of `[data-lab-drawer-layer]`. Inspector details are inserted after Parameters. `[data-lab-workspace]` identifies the canonical workspace bounds.

## Layout and Footer Flow

- Drawer layer is a one-column, full-width, normal-flow grid.
- Parameters uses `position: relative`, `inset: auto`, `width: 100%`, `height: auto`, and `transform: none`.
- No viewport offsets, fixed positioning, negative margins, or z-index escalation were added.
- Continuations and the application footer follow the expanded drawer in document flow.
- Parameter rows use label/control/value columns on desktop and label/value plus control-below on narrow screens.

## Playwright Results

| Check | Result |
| --- | --- |
| Baseline capture, closed/open at five viewports | Pass |
| Phase 11.1 bounds, flow, clipping, controls, screenshots | Pass |
| Existing parameter/responsive/accessibility/visual contracts | Pass, 50 tests |
| Syntax and laboratory validator | Pass, 300 validator checks |
| Full Laboratory audit | Pass, 350 tests |

## Screenshot Inventory

Baseline: `test-results/nv-1000-phase-11-1/baseline/parameters-{desktop-1440,desktop-1280,tablet-768,mobile-390,mobile-360}-{closed,open}.png`

Final:

- `test-results/nv-1000-phase-11-1/final/parameters-desktop-closed.png`
- `test-results/nv-1000-phase-11-1/final/parameters-desktop-open.png`
- `test-results/nv-1000-phase-11-1/final/parameters-laptop-open.png`
- `test-results/nv-1000-phase-11-1/final/parameters-tablet-open.png`
- `test-results/nv-1000-phase-11-1/final/parameters-mobile-390-open.png`
- `test-results/nv-1000-phase-11-1/final/parameters-mobile-360-open.png`
- `test-results/nv-1000-phase-11-1/final/parameters-after-execution.png`
- `test-results/nv-1000-phase-11-1/final/parameters-with-log-visible.png`

Desktop and mobile final screenshots were manually inspected. They show the drawer aligned to workspace content, parameter rows expanding in flow, and the footer below the drawer.

## Files Modified

- `website/scripts/laboratory/laboratory-controller.js`
- `website/styles/laboratories.css`
- `tests/nv-1000-labs-audit.spec.ts`
- `NV-1000-PHASE-11-1-PARAMETERS-DRAWER-POSITIONING-REPORT.md`

## Remaining Risk

The stylesheet still contains historical Phase 6-10 declarations; the authoritative Phase 11 rules now neutralize their effect for Parameters. A future deletion-only consolidation can reduce maintenance surface without changing behavior.

## Final Verdict

Success. Automated geometry validation, interaction checks, full regression, and manual desktop/mobile screenshot inspection confirm that Parameters belongs to the Laboratory Workspace drawer layer and no longer aligns to the navigation rail or overlaps the footer.
