# NV-900-UI3 — Curriculum QA & Responsive Validation

## Scope

Validation-only QA pass for the curriculum frontend introduced by NV-900-UI1 and refined by NV-900-UI2.

No NV-800 educational content, registry entry, lifecycle semantic, dependency relationship, artifact text, or ID was modified.

## Routes Validated

| Route | Representative ID |
|-------|-------------------|
| `#/learning` | index |
| `#/learning/:pathId` | `path-ai-research-frontier-topics` |
| `#/learning/:pathId/module/:moduleId` | `module-frontier-ai-paradigms` |
| `#/learning/:pathId/module/:moduleId/lesson/:lessonId` | `lesson-neurosymbolic-ai` |
| `#/learning/:pathId/module/:moduleId/lesson/:lessonId/artifact/:artifactId` | `artifact-neurosymbolic-ai-interactive-visualization` |
| `#/modules` | index |
| `#/modules/:moduleId` | `module-frontier-ai-paradigms` |

## Responsive Matrix

The route suite was executed in Google Chrome headless at:

- 390 px
- 768 px
- 1024 px
- 1440 px

Total responsive route checks: **28**

Failures: **0**

## Runtime Validation Results

| Area | Result |
|------|--------|
| Navigation route rendering | PASS |
| Deep-link loading | PASS |
| Browser hash URL consistency | PASS |
| Navigation rail active state | PASS after UI-only fix |
| Breadcrumb depth and hierarchy | PASS |
| Lifecycle badges | PASS |
| Filters (`All`, `Reviewed`, `Draft`) | PASS |
| Curriculum counts | PASS |
| Markdown rendering | PASS |
| Interactive Visualization handling | PASS |
| Invalid route / empty state behavior | PASS |
| Console errors | 0 |
| Failed fetch requests | 0 |

## Curriculum Counts

| Resource Type | Runtime Count |
|---------------|---------------|
| Learning Paths | 19 |
| Modules | 40 |
| Lessons | 120 |
| Learning Artifacts | 600 |

Lifecycle distribution remained unchanged:

- Draft artifacts: 535
- Reviewed artifacts: 65
- Interactive Visualization artifacts: 120, all presented as specifications

## Filter Validation

Validated collections:

| Route | All | Reviewed | Draft |
|-------|-----|----------|-------|
| `#/learning` | 19 | 2 | 17 |
| `#/learning/path-ai-research-frontier-topics` | 2 | 2 | 0 |
| `#/learning/.../module/module-frontier-ai-paradigms` | 3 | 3 | 0 |
| `#/learning/.../lesson/lesson-neurosymbolic-ai` | 5 | 5 | 0 |
| `#/modules` | 40 | 4 | 36 |

The `All` filter remains default. Switching filters does not remove unexpected items and restores the original collection when `All` is reselected.

## Markdown Rendering Validation

Representative artifact routes validated:

| Feature | Artifact |
|---------|----------|
| Tables | `artifact-ai-for-scientific-discovery-comparison-table` |
| Fenced code blocks | `artifact-ai-for-scientific-discovery-visual-intuition` |
| Blockquotes | `artifact-jailbreak-techniques-exercise` |
| Inline code | `artifact-tool-calling-exercise` |

Rendered output contained the expected semantic HTML wrappers for tables, code blocks, blockquotes, and inline code. Mobile validation at 390 px passed without network or route failures.

## Interactive Visualization Validation

Validated route:

`#/learning/path-ai-research-frontier-topics/module/module-frontier-ai-paradigms/lesson/lesson-neurosymbolic-ai/artifact/artifact-neurosymbolic-ai-interactive-visualization`

Result:

- Displays `Interactive Visualization Specification`
- Displays `Specification only` callout
- Does not fabricate an artifact-level runtime widget
- Preserves artifact specification text

## Performance Observations

Instrumented fetch validation confirmed:

| Route Type | Curriculum Index Fetches | Artifact Markdown Fetches |
|------------|--------------------------|----------------------------|
| Collection route (`#/learning`) | 1 | 0 |
| Artifact route | 1 | 1 |

The curriculum index remains cached in the runtime service. Artifact Markdown remains lazy-loaded only when an artifact route opens.

## Issue Found and Resolved

Deep curriculum routes did not keep the `Learning` or `Modules` navigation rail item active because active-state sync used exact route-path matching only.

Resolution: the navigation controller now marks a top-level nav item active when the current hash starts with that item's base route. This is a presentation-only fix and does not alter curriculum architecture.

## Validation Commands

- Chrome headless route matrix across 7 routes × 4 widths
- Instrumented console/fetch validation
- Filter click validation
- Markdown feature route validation
- Invalid ID / empty state validation
- `node --check` for changed JS
- `git diff --check`

## Decision

**NV-900-UI3 — Curriculum QA & Responsive Validation: READY**
