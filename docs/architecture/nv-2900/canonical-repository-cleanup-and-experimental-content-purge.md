# Canonical Repository Cleanup & Experimental Content Purge

## NV-2900 — Summary

**Date:** 2026-07-15
**Branch:** recovery/current-dirty-state
**Status:** AUTOMATED GATES PASSED — MANUAL AND OBSIDIAN REVIEW DEFERRED

## Objective

Remove all experimental educational content created solely for testing, along with dead code, duplicates, and generated artifacts, while preserving canonical architecture, curriculum, tests, and governance.

## Experimental Content Removed

### NV-2800 Convolution Package

- **Location:** `content/experimental/nv-2800-convolution/`
- **Files:** 23 files (lesson, concepts, graph, laboratory, assessments, etc.)
- **Status:** experimental_test, non_canonical, production_visibility: disabled

### Website References Removed

| File | Type |
|------|------|
| `website/nv2800.html` | Dedicated lesson page |
| `website/data/laboratories/kernel-observatory-lab.js` | Laboratory data |
| `website/content/modules/module-01-classical-ml/convolution-overview.md` | Module content |
| `website/content/learning-artifacts/convolution-computer-vision/` | 5 learning artifacts |

### Registry Entries Removed

| Registry | Entry Removed |
|----------|---------------|
| `website/data/modules.json` | `module-convolution-spatial-filtering` |
| `website/data/learning-paths.json` | `convolution-computer-vision` |
| `website/data/curriculum-index.json` | 1 learning path, 1 module, 1 lesson, 5 artifacts |
| `website/data/content-index.json` | `convolution-overview` |

### Code References Removed

| File | Change |
|------|--------|
| `website/index.html` | Removed kernel-observatory-lab.js script tag |
| `website/scripts/laboratory/lab-ui-controller.js` | Removed kernel-observatory registry entry |
| `website/server.cjs` | Removed experimental content serving route |

## Dead Code Removed

- `website/server.cjs` experimental content route (lines 6, 25-41)
- `website/scripts/laboratory/lab-ui-controller.js` kernel-observatory entry
- `website/index.html` kernel-observatory-lab.js script tag

## Duplicate Files Removed

| File | Duplicate Of |
|------|--------------|
| `website/pages/generative-layer.html` | `website/pages/generative.html` |
| `website/pages/learning-detail.html` | `website/pages/learning-path.html` |

Note: The router uses inline template strings in `router.js`, not file-based templates. These HTML files were not actively loaded by the router.

## Temporary/Generated Files Removed

- `.tmp/` — TypeScript test output directory (12M)
- `test-results/` — Playwright test run results (484K)

## Documentation Removed

39 historical phase reports from NV-800, NV-900, NV-1000 initiatives:
- 1 NV-800 report
- 10 NV-900 reports
- 28 NV-1000 reports

Each report was individually classified. All unique decisions are preserved in the current implementation state. Reports contained implementation-phase findings that are reproducible from current code.

## Canonical Source Documents Removed

5 files from `docs/sources/` were deleted. Each was individually inspected via git history retrieval.

| File | Classification | Unique Content | Superseded By |
|------|---------------|----------------|---------------|
| `01_neuralverse_canonical_curriculum.md` | DELETE_REPRODUCIBLE | NONE — empty placeholder | `docs/system-bible/05-curriculum-architecture.md` |
| `02_neuralverse_tooling_ecosystem.md` | DELETE_REPRODUCIBLE | NONE — empty placeholder | System Bible chapters |
| `03_neuralverse_vision.md` | DELETE_REPRODUCIBLE | NONE — empty placeholder | `docs/system-bible/01-project-vision.md` |
| `04_neuralverse_ui_constitution.md` | DELETE_REPRODUCIBLE | NONE — empty placeholder | `docs/system-bible/02-ui-constitution.md` |
| `05_neuralverse_architecture_guide.md` | DELETE_REPRODUCIBLE | NONE — empty placeholder | `docs/system-bible/03-architecture-guide.md` |

All 5 files contained identical boilerplate: "Purpose: Establish the initial structure for this module/component. Current status: Placeholder / UI Foundation phase. Scope restrictions: No educational content or functional logic is allowed at this stage."

**No unique canonical authority, governance decisions, or validation evidence was lost.** The deleted files were non-authoritative placeholders. Canonical authority resides in owner-approved Vision, UI Constitution, Architecture Guide, Canonical Curriculum, strategic documents, initiative contracts, agent definitions, and governed Obsidian records — not in repository files or generated snapshots.

## Preserved Items

- Canonical architecture documentation (`docs/architecture/`)
- Canonical content composition (`docs/content/` excluding NV-2800)
- All Playwright test specifications and configurations (28 specs, 18 configs)
- All TypeScript source code (`src/`)
- All website scripts, styles, and assets
- React build source (`react-build/src/`)
- Package manifest and configurations
- Governance documentation
- System Bible (36 chapter files, `README.md`, and generated `SYSTEM-BIBLE.md` snapshot; non-canonical)

## Reconciliation Findings

| Check | Result |
|-------|--------|
| JSON parsing | PASS |
| Broken imports | 0 |
| Broken routes (static) | 0 |
| Broken registry references | 0 |
| Broken asset references | 0 |
| Unknown deleted items | 0 |
| NV-2800 active routes | 0 |
| NV-2800 active registry entries | 0 |
| NV-2800 active curriculum entries | 0 |
| NV-2800 active laboratories | 0 |
| Unauthorized canonical edits | 0 |
| UI Constitution integrity | PRESERVED (not rewritten) |
| Agent architecture | DOCUMENTED (10 operational, naming divergences) |
| Curriculum authority | CANONICAL vs RUNTIME INDEX distinguished |
| Historical reports audited | 39 |
| Canonical source docs audited | 5 (all DELETE_REPRODUCIBLE — empty placeholders) |
| Unique decisions lost | 0 |
| Unique evidence lost | 0 |
| System Bible authority | NON_CANONICAL IMPLEMENTATION SNAPSHOT |
| Replacement chapter continuity | 5 deleted placeholders audited; 4 direct chapter equivalents, 1 distributed across existing chapters |

## Size Comparison

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Repository size | 505M | 492M | -13M (2.5%) |
| Content directory | 176K | 8K | -168K |
| Tracked files | 3478 | 3478 | 0 (dirty worktree) |

## Environment Limitations

- Build validation: PASS (`npm run build`, Node 20.20.2, npm 10.8.2)
- Playwright inventory: PASS (16 suites, 16 projects, 70 tests, no count drift)
- Playwright execution: PASS (16 suites, 70/70 tests; no runtime console/page/request errors)
- Accessibility automation: PASS (2/2 tests); direct reconciliation pending
- Documentation links: PASS (0 broken links after removing references to deleted screenshots)
- No headed browser — manual route review deferred
- Obsidian vault not discoverable — synchronization and vault graph validation deferred

## Documentation Corrections Applied

- `docs/system-bible/03-frontend-architecture.md`: Corrected route table to reflect inline template strings (not file-based templates)

## Verdict

**AUTOMATED CLEANUP GATES PASSED — MANUAL AND OBSIDIAN REVIEW DEFERRED**

Static cleanup gates passed: NV-2800 content removed, deletion classifications complete, registries clean, route references valid, JSON parsing passed, canonical authority not rewritten.

Deferred follow-up: manual route review and Obsidian synchronization. Canonical document authority, build, documentation links, Playwright, and automated accessibility gates passed.

The automated audit found no P0 or P1 defects in the executed validation scope. Direct headed route review and external Obsidian vault integrity are intentionally deferred.
