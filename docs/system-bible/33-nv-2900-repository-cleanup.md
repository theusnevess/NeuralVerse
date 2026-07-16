# NV-2900: Canonical Repository Cleanup & Experimental Content Purge

## Overview

This document records the repository cleanup performed under NV-2900, which removed all experimental educational content created solely for testing, along with dead code, duplicates, and generated artifacts.

## Date

2026-07-15

## Branch

`recovery/current-dirty-state`

## Objective

Remove all experimental educational content created exclusively for testing while preserving:
- Canonical architecture
- Canonical curriculum
- Active product behavior
- Useful automated tests
- Governance documentation
- Obsidian knowledge integrity

## Experimental Content Removed

### NV-2800 Convolution Package

The NV-2800 initiative created an experimental "Convolution in Computer Vision" educational package for testing the multi-agent content pipeline. This content was:

- **Canonical Status:** experimental_test
- **Authority:** non_canonical
- **Production Visibility:** disabled
- **Governance Review:** required

**Removed Files (23):**
- `content/experimental/nv-2800-convolution/` (entire directory)
- `website/nv2800.html` (dedicated lesson page)
- `website/data/laboratories/kernel-observatory-lab.js` (laboratory data)
- `website/content/modules/module-01-classical-ml/convolution-overview.md`
- `website/content/learning-artifacts/convolution-computer-vision/` (5 files)

**Registry Entries Removed:**
- `website/data/modules.json`: `module-convolution-spatial-filtering`
- `website/data/learning-paths.json`: `convolution-computer-vision`
- `website/data/curriculum-index.json`: 1 learning path, 1 module, 1 lesson, 5 artifacts
- `website/data/content-index.json`: `convolution-overview`

**Code References Removed:**
- `website/index.html`: kernel-observatory-lab.js script tag
- `website/scripts/laboratory/lab-ui-controller.js`: kernel-observatory registry entry
- `website/server.cjs`: experimental content serving route

## Dead Code Removed

- `website/server.cjs` experimental content route
- `website/scripts/laboratory/lab-ui-controller.js` kernel-observatory entry
- `website/index.html` kernel-observatory-lab.js script tag

## Duplicate Files Removed

| File | Duplicate Of |
|------|--------------|
| `website/pages/generative-layer.html` | `website/pages/generative.html` |
| `website/pages/learning-detail.html` | `website/pages/learning-path.html` |

Note: The router uses inline template strings in `router.js`, not file-based templates. These HTML files were not actively loaded by the application.

## Temporary/Generated Files Removed

- `.tmp/` — TypeScript test output directory (12M)
- `test-results/` — Playwright test run results (484K)

## Documentation Removed

39 historical phase reports from NV-800, NV-900, NV-1000 initiatives:
- 1 NV-800 report
- 10 NV-900 reports
- 28 NV-1000 reports

## Canonical Source Documents Removed

5 files from `docs/sources/` were deleted (not tracked in original manifest). All 5 were empty placeholders containing identical boilerplate text with no unique content, authority, or governance decisions. No canonical authority was lost. The deleted files were non-authoritative placeholders. Canonical authority resides in owner-approved Vision, UI Constitution, Architecture Guide, Canonical Curriculum, strategic documents, initiative contracts, agent definitions, and governed Obsidian records, not in repository files or this generated snapshot.

## Preserved Items

- Canonical architecture documentation (`docs/architecture/`)
- Canonical content composition (`docs/content/`)
- All Playwright test specifications and configurations (28 specs, 18 configs)
- All TypeScript source code (`src/`)
- All website scripts, styles, and assets
- React build source (`react-build/src/`)
- Package manifest and configurations
- Governance documentation
- System Bible (36 chapter files, `README.md`, and generated `SYSTEM-BIBLE.md` snapshot)

## Validation Results

| Check | Result |
|-------|--------|
| JSON parsing | PASS |
| Broken imports | 0 |
| Broken routes | 0 |
| Broken registry references | 0 |
| Broken asset references | 0 |
| Unknown deleted items | 0 |
| Documentation links | PASS — 0 broken links after removing references to deleted screenshots |
| Build | PASS — `npm run build` |
| Playwright inventory | PASS — 16 suites, 16 projects, 70 tests, no count drift |
| Playwright execution | PASS — 16 suites, 70/70 tests |
| Accessibility automation | PASS — 2/2 tests |
| Accessibility reconciliation | DEFERRED — direct keyboard/screen-reader evidence postponed |
| Runtime route integrity | DEFERRED — manual headed route review postponed |
| Obsidian synchronization | DEFERRED — vault synchronization postponed |

## Size Comparison

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Repository size | 505M | 492M | -13M (2.5%) |
| Content directory | 176K | 8K | -168K |
| Tracked files | 3,478 | 3,478 | 0 (dirty worktree) |

## Verdict

**AUTOMATED CLEANUP GATES PASSED — MANUAL AND OBSIDIAN REVIEW DEFERRED**

Static cleanup gates passed: NV-2800 content removed, deletion classifications complete, registries clean, route references valid, JSON parsing passed, and canonical authority was not rewritten. The System Bible is explicitly a non-canonical implementation snapshot.

Deferred follow-up: manual route review and Obsidian synchronization.

The automated audit found no P0 or P1 defects in the executed validation scope. Direct headed route review and external Obsidian vault integrity are intentionally deferred.

## Impact on System Bible

The following documents were updated to reflect the post-cleanup state:

- `00-executive-summary.md`: Added repository statistics table
- `02-ui-constitution.md`: Navigation priorities preserved (not rewritten to match implementation)
- `03-frontend-architecture.md`: Corrected route table to reflect inline template strings
- `28-testing-and-certification.md`: Updated Playwright inventory counts
- `29-current-capabilities.md`: Added laboratories section, repository structure, updated build stats
- `README.md`: Added link to this cleanup document

## Environment Limitations

- Full Playwright execution passed after clearing stale `server.cjs` processes: 16 suites and 70/70 tests.
- Documentation-link validation passed with 0 broken references after removing deleted NV-900 screenshot links.
- Manual route review deferred by project decision.
- Obsidian synchronization deferred by project decision.

## Related Documents

- [Executive Summary](00-executive-summary.md)
- [Current Capabilities](29-current-capabilities.md)
- [Known Limitations](30-known-limitations.md)
