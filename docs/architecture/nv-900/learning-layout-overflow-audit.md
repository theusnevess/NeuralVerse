# NV-900-QA4A Learning Layout Overflow Audit

Date: 2026-06-21

## Scope

This audit validates Learning and curriculum routes for footer/content collision, horizontal overflow, clipped curriculum cards, vertical scroll integrity, and footer layering regressions.

NV-800 curriculum content and governance metadata were not modified.

## Routes Tested

Curriculum routes:

- `#/learning`
- `#/learning/path-advanced-rag-foundations`
- `#/learning/path-advanced-rag-foundations/module/module-advanced-retrieval-pipelines`
- `#/learning/path-advanced-rag-foundations/module/module-advanced-retrieval-pipelines/lesson/lesson-query-routing`
- `#/learning/path-advanced-rag-foundations/module/module-advanced-retrieval-pipelines/lesson/lesson-query-routing/artifact/artifact-query-routing-explanatory-text`
- `#/modules`
- `#/modules/module-advanced-retrieval-pipelines`

Regression routes:

- `#/`
- `#/workspace`
- `#/content`
- `#/retrieval-playground`
- `#/settings`
- `#/does-not-exist`

## Viewports Tested

| Viewport | Size |
| --- | --- |
| Mobile | 390 x 844 |
| Tablet | 768 x 900 |
| Small desktop | 1024 x 768 |
| Desktop | 1440 x 900 |

## Detection Method

Playwright loaded every route at every viewport and checked:

- Horizontal overflow: `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
- Footer collision: visible curriculum cards, panels, route body blocks, and content panels were compared against the global footer rectangle from `.nv-status-footer`, `.app-footer`, or `.global-footer`.
- Footer layering: footer position and z-index were inspected; fixed, sticky, or absolute footer overlap would fail if collision was present.
- Vertical scroll integrity: document scroll height and last visible content block bottom were compared against global footer top after scrolling to page bottom.
- Clipped content: visible inspected elements with `overflow: hidden` or `overflow: clip` were checked for `scrollHeight > clientHeight`.
- Runtime health: `console.error`, `pageerror`, failed requests, and HTTP 4xx/5xx responses were counted.

The audit intentionally treats the Retrieval Workspace memory layer footer as content, not the global application footer.

## Screenshots Generated

Screenshots and raw report were written to `/tmp/neuralverse-learning-overflow-audit`.

Required screenshots generated:

- `learning-390-before-or-current.png`
- `learning-768-before-or-current.png`
- `learning-1024-before-or-current.png`
- `learning-1440-before-or-current.png`
- `learning-bottom-390.png`
- `learning-bottom-768.png`
- `learning-bottom-1024.png`
- `learning-bottom-1440.png`
- `path-bottom-1440.png`
- `module-bottom-1440.png`
- `lesson-bottom-1440.png`
- `artifact-bottom-1440.png`
- `modules-bottom-1440.png`

Total screenshots captured: 56.

## Bugs Found

The initial audit found 16 footer/content collision or vertical integrity failures on curriculum module, lesson, and standalone module routes.

Root cause:

- `.nv-curriculum-card` used `min-block-size: 100%`.
- In nested curriculum grids and route bodies, that forced cards to expand to the containing block height rather than their content height.
- Expanded card bounding boxes extended beyond the normal `main` content area and intersected the global footer region at bottom scroll states.

No horizontal overflow and no clipped text were confirmed.

## Bugs Fixed

The forced card height was removed so curriculum cards size to their content and remain in normal document flow above the footer.

Modified file:

- `website/styles/curriculum.css`

## Final Playwright Result

| Check | Result |
| --- | ---: |
| console.error | 0 |
| pageerror | 0 |
| failed requests | 0 |
| HTTP 4xx/5xx responses | 0 |
| horizontal overflow violations | 0 |
| footer/content collisions | 0 |
| vertical integrity failures | 0 |
| clipped content issues | 0 |
| footer layering failures | 0 |

## Command Results

Passed from `react-build/`:

```bash
npm run build
```

Passed:

```bash
git diff --check
```

The requested raw runtime command was attempted and failed before running test code because the repository root has no TypeScript loader for `.ts` test files:

```bash
node --test src/retrieval/reference/ReferenceRegistry.test.ts src/retrieval/relationship/RelationshipGraph.test.ts src/retrieval/index/RetrievalIndexService.test.ts src/retrieval/evidence/EvidenceCompiler.test.ts
```

Known alternate command passed with a temporary `tsx` loader installed outside the repo at `/tmp/opencode/nv900-qa4-playwright`:

```bash
node --import /tmp/opencode/nv900-qa4-playwright/node_modules/tsx/dist/loader.mjs --test src/retrieval/reference/ReferenceRegistry.test.ts src/retrieval/relationship/RelationshipGraph.test.ts src/retrieval/index/RetrievalIndexService.test.ts src/retrieval/evidence/EvidenceCompiler.test.ts
```

Runtime test result: 53 passed, 0 failed.

## Git Status

Commit hash: recorded in the final QA4A response after commit creation.

Working tree status before commit:

```text
M website/styles/curriculum.css
?? docs/architecture/nv-900/learning-layout-overflow-audit.md
```

## Conclusion

NV-900-QA4A passed after removing the forced curriculum card height. Learning and curriculum bottom states now preserve normal footer flow across all required routes and viewports.
