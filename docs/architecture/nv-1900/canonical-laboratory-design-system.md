# Canonical Laboratory Design System

## Governance

Laboratory presentation follows Vision, UI Constitution, Architecture Guide, accepted Laboratory architecture, then Design System implementation. The UI Constitution and Architecture Guide are canonically located in `docs/system-bible/02-ui-constitution.md` and `docs/system-bible/03-architecture-guide.md`.

## Token Authority

`website/styles/tokens.css` is the single root token authority using Model A. It is loaded before all Laboratory consumers. Root tokens define primitives and platform semantics; `--nv-*` roles define Laboratory semantics; component styles may only create scoped aliases that resolve from those roles.

## Local Rules

Workspace, disclosure, and Inspector styles consume root semantic roles. Renderer styles may retain geometry constants and scientific data roles, but ordinary interface surfaces, text, borders, actions, and focus styles must consume canonical tokens. Component fallbacks are legacy safety mechanisms to remove during controlled migration, not independent theme definitions.

## Scientific Exceptions

Scientific visualization roles are independent from interface chrome: axis, grid, data, selection, warning, and terminal state use `--nv-science-*` roles. Mathematical geometry remains local to its renderer.

## Automated Validation

`tests/nv-1900-design-system.spec.ts` is the canonical Design System contract owner and runs through `tests/playwright.design-system.config.ts`. It validates runtime root token authority, semantic token groups, cross-Laboratory containment and actions, form/status/measurement semantics, focusability, Research disclosure accessibility including reduced motion, and Completion-to-Continuation ordering. Feature suites retain workflow and algorithm coverage; this suite owns shared presentation semantics across all ten Laboratories. Manual visual review remains outside this automated contract.
