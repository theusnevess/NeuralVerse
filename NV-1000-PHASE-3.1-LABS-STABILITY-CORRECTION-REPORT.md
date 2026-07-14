# NV-1000 Phase 3.1 — Labs Stability Correction Report

## 1. Root Cause Per Failure Group

| Failure group | Root cause | Resolution |
| --- | --- | --- |
| PCA route failure | PCA was registered only under `pca-projection`; audit and legacy entry points also used `pca` / `pca-projection-lab`. | Added registry alias support and PCA aliases while preserving canonical slug `pca-projection`. |
| Transformer Attention `[object Object]` | Shared inspector and metric rendering stringified object/array values directly. | Added explicit safe display formatting for numbers, arrays, objects, nullish values, and non-finite values. |
| Transformer Attention scientific smoke timeout | Stable entropy/QKV exposure existed, but object-safe rendering and alias support were missing around inspector values. | Added safe formatting and stable alias exposure for attention entropy. |
| Linear Regression selector mismatch | Visual labels were preserved, but machine-readable inspector keys remained renamed as `fittedSlope`, `fittedIntercept`, and `rss`. | Added hidden stable aliases for `slope`, `intercept`, and `residuals`. |
| Gradient Descent smoke instability | Inspector interpretation referenced undefined `p`, causing runtime failure during step rendering; test selector also expected `position/currentX` while UI exposed only `x`. | Removed undefined reference and added one stable `position` alias for current X. |
| Mobile 360 pointer overlap | At `360px`, lab workspace used constrained row sizing and sticky execution controls, allowing stacked panels to intercept reachable controls. | Switched narrowest mobile workspace to natural document flow and removed sticky positioning for controls. |
| Accessibility A7 | Severity labels were valid after findings, but XAI generation order used already-updated previous inspector state, weakening finding generation timing. | Generated XAI findings before mutating previous inspector state; A7 now passes. |

## 2. Files Changed

- `website/scripts/laboratory/lab-registry.js`
- `website/scripts/laboratory/laboratory-controller.js`
- `website/scripts/laboratory/lab-ui-controller.js`
- `website/data/laboratories/pca-projection-lab.js`
- `website/data/laboratories/transformer-attention-lab.js`
- `website/data/laboratories/linear-regression-lab.js`
- `website/data/laboratories/gradient-descent-lab.js`
- `website/styles/laboratories.css`
- `NV-1000-PHASE-3.1-LABS-STABILITY-CORRECTION-REPORT.md`

## 3. Fix Summary

- Added slug alias indexing in `LabRegistry`.
- Registered PCA aliases: `pca`, `pca-projection-lab`.
- Added shared safe value formatting to prevent `[object Object]`, `undefined`, `null`, and `NaN` from inspector/metric/log rendering.
- Added stable inspector alias rendering without changing visual labels.
- Corrected Gradient Descent inspector runtime exception.
- Adjusted XAI generation order so findings compare against the prior inspector state.
- Corrected 360px mobile stacking to keep controls reachable.

## 4. Tests Rerun

| Command | Result |
| --- | --- |
| `node --check` relevant lab/controller JS files | PASS |
| `node scripts/laboratory-validator.js` | PASS, 300/300 checks, 0 failed |
| `npx playwright test tests/nv-1000-labs-audit.spec.ts --project=audit --grep "pca\|PCA"` | PASS, 28/28 |
| `npx playwright test tests/nv-1000-labs-audit.spec.ts --project=audit --grep "transformer\|Transformer"` | PASS, 28/28 |
| `npx playwright test tests/nv-1000-labs-audit.spec.ts --project=audit --grep "mobile-360\|360"` | PASS, 5/5 |
| `npx playwright test tests/nv-1000-labs-audit.spec.ts --project=audit --grep "mobile-390\|390"` | PASS, 5/5 |
| `npx playwright test tests/nv-1000-labs-audit.spec.ts --project=audit --grep "S-01"` | PASS, 1/1 |
| `npx playwright test tests/nv-1000-labs-audit.spec.ts --project=audit` | PASS, 336/336 |

## 5. Final Pass/Fail Table

| Audit area | Passed | Failed | Verdict |
| --- | ---: | ---: | --- |
| Homepage audit | 10 | 0 | PASS |
| Lab-by-lab runtime matrix | 160 | 0 | PASS |
| Scientific correctness smoke | 10 | 0 | PASS |
| XAI audit | 60 | 0 | PASS |
| Research Mode audit | 50 | 0 | PASS |
| Responsive audit | 25 | 0 | PASS |
| Accessibility audit | 7 | 0 | PASS |
| Performance audit | 6 | 0 | PASS |
| Visual/UX DOM audit | 8 | 0 | PASS |
| Overall | 336 | 0 | PASS |

## 6. Remaining Risks

- `laboratory-validator.js` still reports two medium warnings for unexpected lab data files: `lab-discovery-data.js` and `lab-ecosystem-relationships.js`; verdict remains PASS.
- Several XAI tests log audit notices for labs with zero findings in soft-count checks, but those tests intentionally do not fail and structured XAI checks pass.
- The worktree contained many pre-existing unrelated changes before this pass; this correction touched only the files listed above.

## 7. Final Verdict

LABS STABILITY RESTORED.
