# NV-2600 Canonical Strict Visual Audit Architecture

## Scope

NV-2600 provides deterministic visual evidence for NeuralVerse. It supplements, and does not replace, the structural contracts in NV-1000 through NV-2500. The audit treats visual quality as scientific-interface quality: hierarchy, typography, spatial containment, renderer readability, responsive composition, and interaction-state communication.

## Automated Evidence

`tests/nv-2600-strict-visual-audit.spec.ts` discovers the runtime route registry and Laboratory registry, classifies unimplemented and parameterized routes, and writes structured evidence to `artifacts/nv-2600-strict-visual-audit/`.

The capture matrix is 1920x1080, 1440x900, 1280x800, 1024x768, 768x1024, 390x844, 360x740, and 844x390. Every implemented non-parameterized route is captured at every viewport. Each registered Laboratory is captured in Ready state at desktop, mobile, and landscape-mobile; one deterministic laboratory covers Paused, Research Active, Reset, and Completed evidence.

Capture readiness requires `document.fonts.ready` and a visible `#main-workspace`. Images are native-resolution PNG files named by route, state, and viewport. No screenshot becomes an approved baseline merely because it was generated.

## Parameterized Route Fixtures

`tests/fixtures/nv-2600-route-fixtures.ts` owns deterministic route fixtures for the curriculum path, curriculum module, lesson, artifact, standalone module, content reader, and visualization detail controllers. Their identifiers are sourced from the shipped curriculum, content, and visualization registries and are captured at 1440x900, 390x844, 768x1024, and 844x390.

The memory-detail fixture uses the canonical `nv_memory_items` storage contract with a fixed record and timestamps. The memory storage owner now reads through the synchronous local-storage delegate of the unified adapter, preserving its synchronous contract. The detail route reloads the canonical store before its fallback and resolves the fixture through the normal controller. The eight parameterized routes are therefore covered by deterministic loaded-state captures.

The audit also restored the two missing route templates required by existing router behavior: `website/pages/memory-detail.html` and `website/pages/visualization-detail.html`. Both route controllers now render through their normal controllers without a 404 page-template request.

## Harness Ownership

At the Phase II baseline, port 8083 was owned by PID 13964 (`node server.cjs`), running as the current user from `website`, with parent shell PID 13963. After explicit operator authorization it was terminated and NV-1000, NV-1200, and NV-1300 passed in the complete-validation runner. The next preflight found PID 34620 (`python3 -m http.server 8086 --directory website`) occupying NV-1400's port. It remains identified and unresolved; complete NV-2500 validation is blocked by that explicit server ownership.

## Classification And Findings

Parameterized routes are recorded as `FIXTURE_REQUIRED`; unimplemented routes are recorded as `NOT_IMPLEMENTED`. Neither classification is treated as a passing visual review. Geometry measurements include shell and laboratory region bounds, root overflow, essential-text clipping, and overlapping interactive controls. Any measured containment defect becomes a structured `visual-findings.json` entry with evidence and severity.

The audit preserves scientific and renderer variation. It does not impose pixel identity on different scientific renderers. Unknown route ownership, unknown Laboratory identity, and missing capture paths are automated failures.

## Manual Boundary

Automated screenshots and computed geometry cannot certify optical hierarchy, density, scientific atmosphere, motion quality, direct hover/focus behavior, or premium composition. `manual-review.json` is intentionally `PENDING_DIRECT_HEADED_REVIEW` until a reviewer performs headed Chromium inspection of the required desktop, mobile, and landscape surfaces.

Consequently, an automated pass has the truthful interim verdict `BLOCKED BY MANUAL VISUAL REVIEW`. NV-2600 must not close NV-2200 manual accessibility, NV-2300 temporal performance, or NV-2400 manual cross-laboratory review.

## Correction And Regression Policy

Only reproduced P0 or P1 findings may trigger product changes. Fix shared defects at their narrowest demonstrated owner: token, shared component, laboratory layout, renderer family, or route stylesheet. Retest the identical route, state, viewport, and fixture data after a correction.

The NV-2600 suite is a canonical NV-2500 suite. Its addition is explicitly declared in the manifest as an expected suite, config, specification, project, and test addition. The canonical inventory changes from 15 suites/configurations/specifications/projects and 69 tests to 16 and 70 respectively. The full runner preserves truthful `NOT_INSTRUMENTED` runtime observability fields.
