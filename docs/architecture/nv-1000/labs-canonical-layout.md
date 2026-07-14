# Labs Canonical Layout Contract

This is the canonical spatial contract for all NeuralVerse Laboratories.

## Region Order

`Laboratory Header -> Observation Deck -> Execution Deck -> Analysis Deck -> Research Deck -> Completion Deck -> Continuation Deck`

Completion is conditional. Continuation always follows every active region.

## Ownership

- Semantic markup: `website/scripts/laboratory/laboratory-controller.js`
- Dynamic completion placement: `website/scripts/laboratory/lab-ui-controller.js`
- Layout and responsive ownership: `website/styles/laboratory-workspace-v4.css`
- Detailed ownership map: `artifacts/nv-1000-labs-canonical-layout/canonical-region-ownership.json`

## Responsive Contract

- Wide desktop: Scientific Stage with Scientific Context rail; readable Analysis grid.
- Compact desktop: Stage remains dominant; context may wrap beneath its rail.
- Tablet and mobile: Stage, telemetry, and finding stack; Analysis is single-column.
- DOM order never changes between modes, and duplicate viewport markup is prohibited.

## Preserved Contracts

Scientific algorithms, parameter schemas, registry data, disclosure `hidden`/`inert` semantics, focus restoration, control target sizes, route lifecycle, and Completion-before-Continuation ordering are structural regression contracts.

## Evidence

The current canonical validation artifacts live in `artifacts/nv-1000-labs-canonical-layout/`. The implementation report is `NV-1000-LABS-CANONICAL-LAYOUT-REPORT.md`.
