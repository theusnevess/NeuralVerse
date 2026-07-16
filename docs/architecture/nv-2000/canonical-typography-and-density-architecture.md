# Canonical Typography and Density Architecture

## Mission and Governance

NV-2000 makes scientific hierarchy readable and dense work navigable without changing the frozen Laboratory region order, scientific semantics, lifecycle, evidence, Research Session, Completion, or recommendation contracts. Authority follows Vision, UI Constitution, Architecture Guide, accepted Laboratory architecture, NV-1900 Design System, then this architecture.

`website/styles/tokens.css` is the sole root typography authority. The ownership chain is font primitives -> semantic `--nv-*` typography roles -> shared components -> canonical regions -> renderer annotations. Renderer geometry remains a documented local exception.

## Token Ownership Reconciliation

The NV-2000 token ownership conflict was classified as `ACCIDENTAL_TOKEN_DELETION`. Concurrent NV-1900 surface and Laboratory aliases plus NV-2100 motion roles remain preserved in the same root file; neither supplied semantic typography equivalents. Model A restores only the missing NV-2000 semantic roles from current `ref` and `sys` primitives. This is not a second root authority, a wholesale token-block restoration, or a compatibility alias layer. `tokens.css` remains loaded before every Laboratory consumer by `website/index.html`.

Research lifecycle owns semantic visibility. In `lab-ui-controller.js`, `setResearchDisclosure` removes `hidden`, `inert`, and `aria-hidden` before measuring and animating an open Research Session; it applies them only after a valid close. Its operation counter prevents stale close callbacks from overriding a newer open state, and reduced motion reaches the same semantic state without waiting for a transition.

NV-1900 now owns the Design System validation command: `npx playwright test -c tests/playwright.design-system.config.ts`. The suite validates the shared token, control, disclosure, measurement, status, Completion, and continuation contracts without replacing NV-2000 typography coverage or NV-2100 motion coverage.

## Roles and Loading

Interface text uses `--nv-font-interface`; comparable values use `--nv-font-numeric` with tabular numerals; code and structured records use `--nv-font-code`. The existing Inter/Roboto/system fallback stack and `font-display` behavior remain authoritative. No Laboratory loads its own family or font weight.

Semantic roles are Display, Laboratory Title, Region Title, Panel Title, Body, Supporting Body, Control Label, Control Description, Measurement, Metadata, Status, Annotation, and Code. Line-height roles are heading, body, reading, label, numeric, and code. Text measures are supporting (`52rem`), reading (`68ch`), and technical (`88ch`). Responsive density is Comfortable, Compact, then Stacked; it changes grouping and columns, never meaning or primary actions.

## Reading Contracts

Laboratory title -> region title -> panel title -> supporting text is the required hierarchy. Metadata is subordinate and never substitutes for a heading. Labels, values, and units remain associated in DOM order. Numeric displays use tabular numerals where comparison benefits. Display precision is owned by each measurement formatter; raw JavaScript exponent notation is not a learner-facing primary result. Scientific annotations have renderer-local collision and geometry policies, but must consume readable annotation roles.

Controls provide labels separate from descriptions, validation, values, and units. Essential descriptions remain visible; advanced configuration, provenance, history events, logs, and secondary run configuration may use one bounded disclosure. Learner-authored research text, titles, hypotheses, limitations, conclusions, measurement labels, and recommendation rationales never truncate.

## Density Contracts

The Header always exposes title, purpose, and high-level state. Stage exposes primary annotation and essential telemetry. Experiment Rail exposes control label, value, and unit. Console exposes lifecycle state, primary action, and progress. Inspector exposes current finding, interpretation, and measurement. Research exposes question, hypothesis, and evidence. Completion exposes outcome, primary measurements, and limitations. Next Experiments exposes destination, rationale, and action.

Scientific Logs and Findings History are the only authorized bounded internal scroll owners. Tables retain headers and numeric alignment; on narrow screens they transform to grouped records rather than page-level horizontal scroll. Whitespace groups related content more tightly than unrelated regions. Cards own one coherent concept and never force equal-height text truncation.

## Accessibility and Responsive Integration

NV-1800 remains breakpoint authority. Validate Wide, Standard, Compact, Portrait Compact, Mobile, Narrow Mobile, Short Viewport, and Landscape Mobile without a second breakpoint system. At 125%, 150%, and 200% text scaling, text grows in normal flow, labels remain visible, and no page-level horizontal overflow is acceptable. Localization validation uses 30% and 50% expansion for controls, statuses, labels, validation messages, and region titles.

Status is always textual and color is supplementary. Metadata and muted text cannot carry essential scientific meaning. Focus indicators must not obscure labels or values. Uppercase is limited to short bounded metadata or standard abbreviations.

## Validation and Exceptions

`tests/nv-2000-typography-density.spec.ts` is data-driven across all ten Laboratories, wide and mobile profiles, and 150% text scaling. It validates semantic token resolution, visible labels and values, textual status, essential text clipping, and page overflow. Results and screenshots are stored only under `artifacts/nv-2000-typography-density/`.

Laboratory-specific exceptions require a scientific renderer rationale, a readable minimum annotation size, and no change to interface typography ownership. The baseline inventory and region contracts are in `artifacts/nv-2000-typography-density/typography-density-audit.json`.
