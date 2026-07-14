# NV-1000 Phase 12.0: CSS and DOM Archaeology

## 1. Executive Summary

**Final archaeology verdict: READY WITH DOCUMENTED RISKS.** Phase 12.1 may create an isolated shell. It must not incrementally alter the present workspace cascade.

The runtime source of truth is a Phase 11 in-flow workspace, but it is implemented by retaining and overriding Phase 5-10 layout systems. `website/styles/laboratories.css` has 9,371 lines, 1,684 selector records, 38 media blocks, 34 absolute declarations, 2 fixed declarations, 1 sticky declaration, 35 z-index declarations, and 112 overflow declarations. The selector inventory is at `artifacts/nv-1000-phase-12-0/selector-inventory.{json,csv}`.

The highest-risk evidence is not hypothetical. At narrow layouts the old HUD/overlay regimes and later in-flow rules both match. The Phase 11 rules win in sampled browser states, but legacy selectors remain active for untested state and component variants. The new shell requires namespace isolation rather than one more precedence layer.

## 2. Final Archaeology Verdict

Phase 12.1 is safe to begin only under the isolation boundary in section 29. It is unsafe to remove legacy CSS or change behavioral data attributes during shell introduction. Runtime evidence, dependencies, and preservation contracts are sufficient for a parallel shell, but not for bulk selector deletion.

## 3. Repository State

The worktree was already dirty before the audit: 18 modified production files and pre-existing untracked NV-1000 reports/test files. Phase 12.0 added only audit-only files: this report, `tests/nv-1000-phase-12-0-archaeology.spec.ts`, `tests/playwright.phase12.config.ts`, `artifacts/nv-1000-phase-12-0/*`, and `test-results/nv-1000-phase-12-0/*`. No production source was modified.

## 4. Historical Architecture Timeline

| Phase | File range | Declared model | Runtime classification |
|---|---:|---|---|
| 5 / 5.2 | `laboratories.css:2090-3276` | Panel/grid workspace | LEGACY_ACTIVE |
| 5.3 / 5.3B | `3277-4470` | Progressive disclosure | LEGACY_ACTIVE for disclosure primitives |
| 6 | `6639-7248` | Visualization-first grid and overlays | LEGACY_ACTIVE / partially shadowed |
| 7 | `7250-7750` | Canvas-first instrument | LEGACY_SHADOWED except inherited descendants |
| 8 | `7752-8200` | CSS-only composition pass | LEGACY_SHADOWED except typography/surface properties |
| 9 | `8201-8796` | Full-viewport canvas, HUD, absolute controls | LEGACY_ACTIVE risk; later neutralized |
| 10 | `8797-9109` | Precedence-only rewrite | LEGACY_ACTIVE / partially shadowed |
| 11 / 11.1 / 11.2 | `9110-9371` | In-flow canvas, bar, drawers | CANONICAL_CANDIDATE |

The historical direction was: panel grid -> canvas HUD -> CSS-only surface pass -> full viewport absolute shell -> precedence rewrite -> in-flow drawer correction. The critical unresolved fact is that each successor neutralizes earlier rules instead of deleting them.

## 5. Current DOM Architecture

Browser-verified initial DOM hierarchy after `LaboratoryController.renderLabViewer()`:

```text
[data-lab-workspace].nv-lab-instrument
|- .nv-lab-canvas-region[data-lab-canvas-region]
|  |- .nv-lab-ws-observations
|  |  `- .nv-lab-obs-panel--primary
|  |- [data-lab-hud-telemetry]
|  `- [data-xai-panel] (initially hidden)
|- [data-lab-instrument-bar]
`- [data-lab-drawer-layer]
   |- [data-lab-parameters-drawer]
   |- [data-lab-inspector] (emitted in canvas then moved here)
   |- [data-lab-log] (emitted then moved here)
   |- [data-research-panel] and research detail regions
   `- [data-lab-continuations]
```

The static detail page is only a transitional loading shell (`website/pages/laboratory-detail.html:1-14`). Runtime ownership belongs to `renderLabViewer()` (`laboratory-controller.js:77-446`), which replaces the entire viewer then moves Inspector and Log at `426-435`. This move is a migration hazard: initial template parentage is not final DOM parentage.

### DOM Ownership Table

| Component | Current parent | Behavior owner | Test contract | Classification | Phase 12 strategy |
|---|---|---|---|---|---|
| Workspace root | viewer | LaboratoryController | `[data-lab-workspace]` | PRESERVE | Migrate attribute |
| Header/metadata | viewer | LaboratoryController | title/summary | PRESERVE | Replace presentation |
| Canvas/visualization | canvas region | UI + VisualizationEngine | observation panel | PRESERVE | Rebuild shell only |
| Telemetry | canvas region | LabUIController | HUD metrics | CANONICAL_CANDIDATE | Replace presentation |
| Inspector | drawer layer after move | LabUIController | inspector values | PRESERVE | Replace presentation |
| XAI/findings | canvas region | XAIEngine + UI | XAI selectors | PRESERVE | Replace presentation |
| Instrument bar | workspace root | LabUIController | actions/timeline | PRESERVE | Replace presentation |
| Parameters | drawer layer | ParameterEngine + UI | parameter selector | PRESERVE | Replace presentation |
| Scientific Log | drawer layer after move | UI | log selector/toggle | PRESERVE | Replace presentation |
| Research Mode | drawer layer | ResearchMode + UI | research selectors | PRESERVE | Recompose conditionally |
| Continuations | drawer layer | ecosystem/inline handlers | continuation links | UNSAFE_TO_REMOVE | Rebind behavior |

Full DOM inventory: `artifacts/nv-1000-phase-12-0/dom-ownership.json`.

## 6. Current CSS Architecture

`laboratories.css` combines laboratory discovery, lab-specific visualizations, five redesign layers, responsive fallbacks, XAI integration, and drawer corrections. `explainability.css` independently owns XAI base cards and disclosure. `tokens.css` is the canonical global token source; the laboratory and XAI files add private token-like aliases with raw fallbacks.

The active Phase 11 layout is identified by later source order and computed browser values: root is normal-flow grid, canvas is a three-column grid above 900px and single column below 900px, Inspector is moved to drawers, and Log uses `.nv-lab-drawer--log`. Computed values for each major element/state are retained in `runtime-computed-styles.json`.

## 7. Phase-by-Phase Runtime Influence

| Layer | Still wins | Conflict | Removal risk |
|---|---|---|---|
| Phase 5 | base panel, observation, control descendants | structural names reused by all later layers | UNSAFE_TO_REMOVE |
| Phase 5.3 | reveal/collapsible patterns | XAI and log disclosures have separate later ownership | UNSAFE_TO_REMOVE |
| Phase 6-8 | typography/surface descendants can still win where later rules omit a property | visual drift | UNKNOWN_REQUIRES_VALIDATION |
| Phase 9 | absolute/fixed/transform rules are mostly later-neutralized | responsive or uncommon state regressions | LEGACY_ACTIVE |
| Phase 10 | drawer and instrument definitions partially win before Phase 11 refinements | double responsive rules | LEGACY_ACTIVE |
| Phase 11 | top-level grid/drawer ownership | depends on old emitted classes | CANONICAL_CANDIDATE |

## 8. Selector Inventory Summary

The machine-readable inventory has 1,684 parsed selector records. It records source range, phase, estimated specificity, media owner, property count, duplicate count, and interim classification. It deliberately labels non-proven removals `UNKNOWN_REQUIRES_VALIDATION`; CSSOM does not expose stylesheet source locations for a computed property, so winner ownership is documented from source order plus browser computed values rather than falsely asserting an exact DevTools rule pointer.

### Selector Collision Table

| Selector | Definitions / phases | Effective outcome | Risk |
|---|---|---|---|
| `.nv-lab-instrument` | 15 definitions, P7-P11 | Phase 11 flow grid currently wins | CRITICAL |
| `.nv-lab-ws-setup` | P5, P6, P9, P10, P11 | normal-flow drawer in P11 | CRITICAL |
| `.nv-lab-ws-log` | P5, P6, P9, P10 | log replaced by drawer class P11 | HIGH |
| `.nv-lab-obs-panel--primary` | P5-P11 | P11 in-flow visual surface | CRITICAL |
| `.nv-xai-panel` / finding descendants | explainability + P5-P11 | base behavior plus later restyles | HIGH |

## 9. Specificity Analysis

High-risk selectors use `:has()` plus nested classes, such as `.nv-lab-viewer:has(.nv-lab-instrument) .nv-lab-workspace-header` (`laboratories.css:9112+`), and deeply nested Phase 9 descendant selectors. No ID selector controls primary layout. The 14 `!important` declarations are largely reduced-motion rules, but their existence confirms that cascade control is not locally bounded. Ranked specificity and duplicates are in the selector inventory.

## 10. Computed Style Ownership

At desktop Phase 11 computes canvas grid areas `"telemetry visualization findings"`; the 1440px Gradient Descent primary visualization was `x=341,y=220,w=787,h=594`, telemetry was `x=134,y=230,w=240,h=30`, and instrument bar was `x=124,y=824,w=1272,h=76`. At 900px and below, the canvas computes a single-column region sequence. Evidence: `responsive-matrix.json` and `runtime-computed-styles.json`.

Winning owner classification is therefore: P11 for root/canvas/drawer geometry; P5-10 and explainability for many un-redeclared descendant properties. Exact property source attribution remains an explicit unknown until a CSS parser/cascade tracer is introduced; it is not safe to classify every earlier declaration as shadowed.

## 11. Responsive Architecture

There are 38 laboratory media blocks and 15 distinct numeric breakpoints: 1280, 1180, 1100, 1060, 1024, 900, 768, 760, 700, 640, 620, 430, 390, 360 plus reduced-motion. `1024`, `900`, `768/760`, `700`, and `430` repeat across historical layers. Phase 11’s final rules at `9338-9371` win for sampled tablet/mobile layouts, but earlier matching rules remain a maintenance and state risk.

| Range | Observed Phase 11 mode | Conflict |
|---|---|---|
| >900px | telemetry / visualization / findings columns | inherited old HUD definitions |
| 701-900px | visualization then telemetry then findings | Phase 9 absolute HUD rules also match |
| <=700px | single-column canvas, stacked bar/drawers | Phase 9/10 mobile rules match before P11 |

All required responsive snapshots were captured for Gradient Descent at 1920, 1600, 1440, 1280, 1024, 900, 768, 430, 390, 375, and 360 widths.

## 12. Positioning Contexts

Phase 9 has the dangerous model: absolute observations (`8305-8327`), absolute secondary panels (`8371-8404`), absolute HUDs (`8418-8439`), and translated absolute setup (`8514-8535`). Phase 10 fixes Log at `z-index:10000` (`9041-9051`). Phase 11 neutralizes principal pseudo-elements and returns canvas/drawer geometry to flow (`9110-9371`).

| Element | Current intended containing block | Historic risk | Classification |
|---|---|---|---|
| Canvas primary | canvas region/grid | absolute full canvas in P9 | CANONICAL_CANDIDATE |
| Inspector | drawer layer after DOM move | HUD absolute overlay in P9 | PRESERVE_BEHAVIOR_REBUILD_PRESENTATION |
| XAI | canvas grid findings column | HUD absolute overlay in P9 | PRESERVE_BEHAVIOR_REBUILD_PRESENTATION |
| Parameters | drawer layer | translated absolute bar in P9 | PRESERVE_BEHAVIOR_REBUILD_PRESENTATION |
| Log | drawer layer | fixed z=10000 in P10 | PRESERVE_BEHAVIOR_REBUILD_PRESENTATION |

## 13. Scroll and Overflow Architecture

Visible scroll evidence is in `scroll-containers.json`. Phase 11 intends page scroll plus bounded log-entry scroll only (`9294-9331`). Legacy rules add scrollable observation/HUD/parameter containers (`2436`, `2489`, `6790-6873`, `8514+`). These must not be carried into the new shell without a component-specific scroll decision.

## 14. Z-Index and Stacking Contexts

The global token z scale ends at 90 (`tokens.css:526-536`); legacy log uses `10000` (`laboratories.css:9046`). This is LEGACY_ACTIVE and violates the token layer model. Phase 12.1 must define a local layer scale without preserving that value.

## 15. Design Token Drift

Canonical: global ref/sys/context tokens in `tokens.css`. Legacy local: `--nv-lab-*` (`laboratories.css:765-821`) and `--nv-xai-*` (`explainability.css:6-25`). There are 437 raw color/rgba occurrences in laboratory CSS and 35 in explainability CSS. Raw spacing, radii, micro typography, local cyan values, and private surface aliases are MIGRATE, not canonical inputs for the v4 shell.

## 16. JavaScript DOM Dependencies

`LaboratoryController` owns structural generation; `LabUIController` owns parameter rendering, execution state, disclosures, log, research UI, and XAI UI; XAI/Research/Registry modules are presentation-independent state services. The safe future boundary is to keep engines/registries/storage intact while replacing only generated presentation shell and bindings.

Risks: inline continuation handlers (`laboratory-controller.js:406-412`), viewer-wide `innerHTML` replacement, global ResearchMode singleton, fixed IDs (`lab-parameters`, `nv-lab-scientific-log-body`), and route cleanup that is incidental rather than explicit.

## 17. Playwright and Accessibility Contracts

Test contracts require all core data attributes. Preserve those listed in `preservation-contracts.csv`. The current suite is not an accessibility proof: it asserts `true` for focus visibility (`nv-1000-labs-audit.spec.ts:1042-1065`) and allows zero XAI findings. Accessibility defects to migrate: unlabeled research inputs, `+` button name, interactive `role=article` findings, interactive timeline `listitem`s, nested labels for booleans, and fixed IDs.

## 18. Laboratory Variations

Deep DOM/state inspection: Gradient Descent, K-Means, PCA, Transformer Attention. Structural verification: all ten canonical labs. All emit the same shell contracts; variations are observations, inspector sections/cards, parameters, execution steps, visualization data, and XAI rule behavior. Embedding Similarity and Precision vs Recall have conditional/absent limited-execution XAI findings, so XAI panel presence must remain state-driven.

## 19. Classification

**Canonical candidates:** deterministic execution engines, definitions, registry, parameter engine, visualization engine, XAI rules, persistence, routing, global tokens, Phase 11 conceptual canvas/bar/drawer order.

**Legacy active:** P5-10 selectors which still match emitted class names; Phase 9 absolute/fixed positioning; Phase 10 precedence block; local lab/XAI token layers.

**Legacy shadowed:** P7/P8 full-surface and composition rules where P11 explicitly resets the same property. Do not delete until property-level cascade tracing/parity confirms no descendant contribution.

**Unused:** no high-confidence broad removal candidates were found. The audit does not label unmatched selector text unused unless JavaScript/test and all lab/state evidence are also clear.

**Unsafe to remove:** all stable data attributes, `.nv-lab-*` emitted structural classes, old observation/log selectors, and historical responsive blocks before new shell parity.

**Safe to remove:** none before Phase 12.1 parity.

**Unknown:** property-level winner provenance for every lower-level selector; uncommon lab outputs; concurrent viewer behavior; legacy CSS that matches hidden nodes.

## 20. Preservation Contract

PRESERVE unchanged: `data-lab-workspace`, `data-lab-title`, `data-lab-summary`, `data-action`, `data-speed`, `data-step`, `data-lab-parameters`, `data-lab-log`, `data-xai-*`, `data-research-*`, inspector value attributes, route format, registry/definition schemas, engines, persistence, and test-required metric keys.

MIGRATE_WITH_ALIAS: `data-lab-canvas-region`, `data-lab-instrument-bar`, `data-lab-drawer-layer`, and structural classes whose tests only inspect placement. Preserve attributes while introducing namespaced presentation classes.

## 21. Phase 12.1 Isolation Boundary

Use `.nv-lab-v4-workspace` as the new root with `.nv-lab-v4-header`, `.nv-lab-v4-stage`, `.nv-lab-v4-telemetry`, `.nv-lab-v4-findings`, `.nv-lab-v4-console`, and `.nv-lab-v4-drawers`. It may inherit global `--ref-*`, `--sys-*`, and accessibility/motion tokens. It must not reuse layout rules from `.nv-lab-instrument`, `.nv-lab-ws-setup`, `.nv-lab-ws-log`, `.nv-lab-hud`, or Phase 9 viewer `:has()` selectors.

Old and new shells should coexist behind one root feature switch, retaining behavioral data attributes on the v4 nodes. Validate parity for each lab/state/viewport before deleting legacy DOM/CSS. Only then remove historical blocks in chronological order: Phase 9 absolute layer -> Phase 10 precedence layer -> Phase 7/8 composition -> superseded Phase 5/6 layout descendants.

## 22. Migration Groups

| Group | Members |
|---|---|
| Preserve unchanged | simulation engines, lab definitions, registry, XAI rules, persistence, routing, deterministic calculations |
| Preserve behavior / replace presentation | timeline, controls, speed, parameters, Inspector, XAI rendering host, log, research controls, continuations |
| Rebuild structurally | workspace shell, preparation state, canvas/telemetry/findings composition, drawer ownership, responsive layout, positioning/layer model, research composition |

## 23. Validation and Screenshot Inventory

`node --check` passed for the four required laboratory scripts. `node scripts/laboratory-validator.js` passed 300 checks, with two expected medium warnings for support data files. The existing laboratory audit passed 351 tests in 12.4 minutes. The audit-only Playwright collector passed: 1 test in 1 minute.

Screenshots: `test-results/nv-1000-phase-12-0/{gradient-descent,kmeans-clustering,pca-projection,transformer-attention}/` contain initial, one-step, mid-execution, completed, parameters-open, inspector-details-open, scientific-log-open, xai-expanded, research-mode, and parameters-and-log-open at 1440x900. `responsive/` contains Gradient Descent research snapshots at 1440x900, 1280x800, 1024x768, 768x1024, 390x844, and 360x740.

## 24. Remaining Unknowns

1. A property-level CSSOM cascade tracer is required before declaring individual lower-level rules shadowed or safe to delete.
2. XAI absence for two labs prevents universal completed/XAI visual parity.
3. Global ResearchMode needs route-transition evidence before multi-lab session migration.
4. The audit did not validate simultaneous viewer instances; fixed IDs make them unsafe today.

## 25. Phase 12.1 Readiness Decision

**READY WITH DOCUMENTED RISKS.** Build an isolated v4 shell in parallel, retain behavioral contracts, and do not delete or patch legacy layout layers until visual, geometry, interaction, and data-contract parity is proven for all ten laboratories.
