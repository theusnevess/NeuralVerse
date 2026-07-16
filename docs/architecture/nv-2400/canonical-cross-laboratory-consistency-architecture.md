# Canonical Cross-Laboratory Consistency Architecture

## Mission

NV-2400 ensures that the ten NeuralVerse Laboratories operate as one product while preserving scientific, pedagogical, and renderer-specific variation. It follows the Vision, UI Constitution, Architecture Guide, and accepted NV-1000 through NV-2300 contracts; it does not replace them.

## Canonical Ownership

`LabRegistry` and `lab-index.js` own the ten-Laboratory registry and loading order. `laboratory-controller.js` owns the workspace shell and canonical region order. `lab-ui-controller.js`, `execution-engine.js`, `research-mode.js`, and `completion-next-experiments.js` own shared lifecycle, Research, and Completion behavior. Laboratory definitions own scientific parameters, execution data, renderer configuration, measurements, findings, and interpretations.

## Shared Product Language

All Laboratories use the same route shape, one visible title, main landmark, Stage frame, execution actions, Ready lifecycle, Research activation, and terminal Completion structure. The NV-1700 canonical Completion labels are `Experiment Outcome`, `Scientific Outcome`, and `Configuration Reference`. Renderer family, parameters, measurements, and scientific interpretation may vary when required by the learning model.

## Registry And Variations

The registry has ten unique IDs and routes: Gradient Descent, Linear Regression, Logistic Regression, K-Means Clustering, PCA, Bayes' Rule, Embedding Similarity, Cosine Similarity, Precision vs Recall, and Transformer Attention. Renderer variation is scientific rather than product variation: line charts, scatter plots, a probability tree, an SVG diagram, and a heatmap remain integrated through the shared Stage contract.

## Automated Boundary

`tests/nv-2400-cross-lab-consistency.spec.ts` derives its coverage from the runtime registry. It validates registry uniqueness; page-wide title and main-landmark semantics; region order; Stage name; canonical Ready, Step, Reset, Research, Completion, and responsive-containment behavior for every registered Laboratory. It writes the audit, exception, validation, and pending-manual-review artifacts under `artifacts/nv-2400-cross-lab-consistency/`.

Parent suites remain authoritative for detailed parameter, Inspector, recommendation, typography, motion, accessibility, and performance behavior. NV-2400 adds relationship validation and does not duplicate their feature-level coverage.

## Exception Governance

An exception must identify its Laboratory, affected contract, classification, owner, scientific or pedagogical reason, accessibility and responsive impact, and validation. Exceptions cannot conceal legacy divergence. The current automated audit has no pending exception; renderer-family differences are classified as scientific variation.

## Direct Comparative Review

Direct review remains required for comparative visual hierarchy, interaction feedback, and renderer-specific behavior in Ready, Running, Paused, Research, Completion, and continuation states. The automated result is not evidence of direct comparative review. Until it is performed and recorded, the NV-2400 verdict remains `BLOCKED BY MANUAL CROSS-LAB REVIEW`.

## Automated Audit Result

The automated audit represented all ten registered Laboratories and found no accidental cross-Laboratory divergence, unknown ownership, or pending exception. Five scientific renderer families were observed through the shared Stage frame. NV-2400 validates common product behavior rather than forcing their scientific representations to match.

During prerequisite validation, NV-2300 reproduced two shared transient-resource defects in the execution Reset path: the Scientific Log retained a Step entry, and an already-hidden Research Session scheduled a redundant close-animation frame. `lab-ui-controller.js` now clears the Scientific Log through its shared owner and makes the inactive Research close path idempotent. NV-2300 passes after the correction.

The frozen automated suites pass: NV-1000 Canonical Layout 7/7, NV-1200 Scientific Stage 1/1, NV-1300 Execution Console 1/1, NV-1400 Scientific Inspector 1/1, NV-1500 Parameters 2/2, NV-1600 Research Mode 11/11 plus the legacy suite 20/20, NV-1700 Completion 1/1, NV-1800 Responsive 1/1, NV-1900 Design System 4/4, NV-2000 Typography 2/2, NV-2100 Motion 3/3, NV-2200 Accessibility 2/2, and NV-2300 Performance 7/7. `git diff --check` passes.

## Performance Count Reconciliation

`npx playwright test -c tests/playwright.performance.config.ts --list` identifies seven active NV-2300 tests in its single Playwright project. No project filter excludes a test. The prior 5/5 and 6/6 statements were reporting errors against an evolving, untracked suite rather than evidence of removed coverage; the canonical current baseline is 7/7. The seven tests cover bounded Ready state, execution Reset, responsive state preservation, repeated Stage-summary replacement, ten-cycle resource recovery, route-switch resource stability, and deterministic Research scaling.
