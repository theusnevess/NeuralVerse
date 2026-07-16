# NV-1600: Research Mode and Scientific Sessions

## Mission

Research Mode is an optional, browser-local scientific investigation workflow. It preserves the learner-authored chain from research question through conclusion without replacing normal laboratory execution.

## Authority and Boundaries

`ResearchMode` is the single active-session authority. `ResearchStorage` validates and persists versioned session snapshots in browser-local storage. Laboratory views are consumers only.

Parameters own editable values and the immutable execution snapshot. The Execution Console owns execution lifecycle. The Scientific Stage owns primary scientific state. The Scientific Inspector owns normalized findings. Completion owns terminal results. Research Mode only references their stable outputs.

## Lifecycle

Learner-facing states are `draft`, `active`, `review`, and `completed`. A session starts as Draft. Active sessions can capture runs and explicit evidence. Review can return to Active. Completion is permitted only with a question, a completed run, evidence or an observation, limitations, and either a learner conclusion or an explicitly inconclusive hypothesis rationale.

## Session and Run Model

Sessions use schema version 1 and retain laboratory/contract identity, question, hypothesis, variable classifications, runs, evidence, observations, interpretations, comparisons, limitations, conclusion, and reproducibility metadata. Every run has an identity, session and laboratory association, immutable execution snapshot, timestamps, status, terminal result, measurements, and evidence references.

Execution completion is separate from scientific outcome. A completed run may report a scientific result such as Not Converged.

## Evidence and Reasoning

Inspector findings and Stage state are only captured after explicit learner action. Captured evidence is copied as a stable record with a source identifier, run identity, category, summary, measurements, provenance, and source step. Observations record direct evidence; interpretations record learner meaning. Conclusions are learner-authored and are never generated automatically.

Comparisons require two completed runs from the same laboratory and contract version. Changed and controlled snapshot values are shown with controlled, partially-controlled, or exploratory language. Research Mode does not label a result better, optimal, or superior.

## Persistence and Export

Sessions are stored only in the current browser through the existing storage adapter. Invalid persisted values are ignored rather than reinterpreted. JSON exports preserve the normalized session and reproducibility record. Markdown exports a readable investigation report. No remote persistence, collaboration, or executable import content is used.

## Responsive, Accessibility, and Performance

The Research Session remains in normal document flow after the Inspector and before Completion. Its controls use semantic labels, fieldsets, legends, native buttons, and visible focus states. Capture does not move focus. Bounded lists are the only candidates for internal scrolling. Raw Scientific Log events are excluded; note edits update only session state and do not serialize execution steps.

## Validation

The legacy Research Mode configuration owns its established `nv-1000-labs-audit.spec.ts` regression selection. The dedicated `playwright.research-mode-nv1600.config.ts` owns NV-1600 contracts and reuses the same local server contract without modifying legacy selection. Frozen Parameters, Inspector, Execution Console, Scientific Stage, and Canonical Layout suites remain required regression gates. The consolidated audit and validation record are under `artifacts/nv-1600-research-mode/`.
