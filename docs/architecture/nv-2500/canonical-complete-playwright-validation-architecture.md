# Canonical Complete Playwright Validation Architecture

## Mission

NV-2500 certifies the complete canonical Laboratory Playwright matrix as an orchestration layer. Initiative suites retain ownership of feature, scientific-state, lifecycle, responsive, accessibility, performance, and cross-Laboratory contracts.

## Governance

The validation order is Vision, UI Constitution, Architecture Guide, accepted Laboratory architecture, initiative contract, then NV-2500. The manifest at `tests/playwright-complete-validation.manifest.json` is the source of truth for canonical suite ownership, execution order, expected current test counts, ports, origins, and manual closure boundaries.

## Execution

`npm run test:playwright:complete` runs manifest governance, Playwright discovery for every canonical config, then suite-level sequential certification with `retries=0`. Each suite owns its configured origin and starts only when its port is free. Shared ports are safe only because suite execution is sequential and server reuse is disabled.

The legacy Research config has a documented in-config `grep` that selects its complete 20-test legacy contract. The complete command adds no filters. The manual NV-1800 responsive review config is explicitly excluded from automated certification.

## Evidence

The runner writes manifest inventory, discovered counts, project inventory, port ownership, per-run outcomes, failure classification, flake analysis, runtime collection status, and final validation results below `artifacts/nv-2500-playwright-validation/`. Machine-readable JSON reporter output is required; a corrupt reporter result is an infrastructure blocker.

## Certification Boundaries

Passing Playwright suites do not close manual initiatives. NV-2200 physical keyboard and live Orca review, NV-2300 direct temporal review, and NV-2400 comparative review remain separately governed. NV-2500 reports them as not determined by this architecture.

## Runtime Evidence Limitation

The existing initiative suites do not yet expose a shared Playwright fixture for console, page-error, warning, and request-failure collection. NV-2500 records these fields as `NOT_INSTRUMENTED` rather than fabricating zero-error evidence and blocks complete certification until a shared fixture provides that collection.
