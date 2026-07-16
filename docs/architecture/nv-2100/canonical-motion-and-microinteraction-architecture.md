# Canonical Motion and Microinteraction Architecture

## Mission and governance

NV-2100 makes state change understandable without adding decorative performance. Governance is Vision, UI Constitution, Architecture Guide, accepted Laboratory architecture, Design System, Typography and Density, then this document. Motion supports content first, clarity before decoration, deep focus, long-term readability, and scientific professionalism.

`website/styles/tokens.css` is the sole interface-motion token authority. `ExecutionEngine` owns execution state, laboratory data owns normalized scientific state, laboratory renderers own scientific presentation, and `LabUIController` is the single Laboratory DOM writer. A renderer never emits lifecycle events or becomes an execution authority.

## Categories and invariants

Scientific Motion represents normalized scientific state. Interface Motion communicates structural availability. Interaction Feedback confirms a direct action at its receiving component. Status Motion reports an ongoing canonical operation. Ambient Motion is non-essential, low amplitude, and disabled under reduced motion.

Every transition has one owner, one deterministic final state, a cancellation path, and a reduced-motion equivalent. Motion must not alter scientific meaning, delay control access, move focus unexpectedly, create overflow or scroll traps, duplicate actions, or survive owner removal. Scientific Motion has priority over interaction, status, interface, then ambient motion. The default persistent budget is one scientific activity and one compact status indicator.

Forbidden directions include bounce, overshoot, pulsing for attention, confetti, parallax, page crossfades, decorative list staggering, false progress, and animated scientific values without scientific meaning.

## Tokens

Primitive tokens are `--nv-motion-duration-{instant,fast,standard,deliberate}`, `--nv-motion-ease-{enter,exit,move,emphasis}`, `--nv-motion-distance-{xs,sm,md}`, `--nv-motion-opacity-muted`, and `--nv-motion-scale-pressed`. Semantic roles are feedback, disclosure, state, region reveal, attention, and exit tokens. Component styles consume semantic roles; they do not create root motion policy. Execution speed and renderer interpolation are scientific timing contracts, not UI tokens.

Durations are instant for direct state, fast for control feedback, standard for local disclosure and selection, and deliberate only for meaningful availability. Enter, exit, move, and emphasis easings are restrained and have no elastic overshoot. Distance is capped at XS, SM, or MD; text-heavy surfaces do not scale.

## Lifecycle and scientific truth

Run changes the canonical session to Running, locks parameters, and starts the sole interval owner. Pause clears that interval and freezes advancement. Step calls `stepForward` once. Reset clears the session, completion, findings, and pending local feedback. Completion is rendered only from a terminal canonical session and scientific non-convergence uses the same non-celebratory structure.

Scientific renderers receive step snapshots. They may interpolate from a prior snapshot only when the exact terminal snapshot remains authoritative, must coalesce backlog, freeze when paused, and cancel work by laboratory, execution, run, and owner identity. Resize recalculates bounds without resetting execution, selected evidence, Research Session, or Completion.

## Component and region contracts

| Owner | Authorized motion | Accessibility and cancellation | Forbidden |
| --- | --- | --- | --- |
| Button and icon button | fast pressed/focus state; loading after acceptance | visible label, disabled duplicate action | success before success, focus theft |
| Range and numeric control | thumb, immediate value and validation update | stable unit and programmatic error | interpolated unrelated values |
| Validation message | local opacity/border state | immediate programmatic error | shake and repeated pulse |
| Disclosure and popover | measured local disclosure and chevron rotation | `aria-expanded` and inert state update immediately; focus returns on close | fixed maximum height and clipping |
| Status and progress | determinate canonical progress | textual status and current accessible value | false progress and persistent Completed activity |
| Inspector and evidence | local selection/change emphasis | no stale details; capture is idempotent and local | full-panel flash or toast-only confirmation |
| Research run/comparison | local availability update | preserves run identity and focus | cards flying or numeric count-up |
| Completion and recommendation | bounded terminal availability reveal | all content immediately available; no auto-focus | celebratory semantics or recommendation staggering |
| Notification | cross-region confirmation only | no focus theft; dismissible if persistent | parameter-change spam |

Laboratory Header, Stage, Rail, Console, Inspector, Research Session, Completion, Next Experiments, and Continuation remain in canonical document order and normal flow. Only availability transitions are authorized. Responsive reflow does not animate the grid, replace trees, or replay historical events.

## Renderer and Laboratory contracts

| Laboratory | Renderer family | Primary scientific motion | Reduced-motion alternative |
| --- | --- | --- | --- |
| Gradient Descent | Cartesian loss surface | trajectory and loss update per snapshot | pause, step, exact terminal state |
| Linear Regression | Cartesian fit | fit and residual snapshot update | direct snapshot update |
| Logistic Regression | classification boundary | boundary snapshot update | direct snapshot update |
| K-Means | cluster plane | centroid and assignment snapshot update | pause, step, exact terminal state |
| PCA Projection | projection space | component and projected-state update | direct snapshot update |
| Bayes' Rule | probability tree | branch and posterior snapshot update | direct snapshot update |
| Embedding Similarity | vector space | selected neighborhood update | direct snapshot update |
| Cosine Similarity | vector geometry | vector and angle update | direct snapshot update |
| Precision vs Recall | metric panel | threshold operating-point update | direct snapshot update |
| Transformer Attention | attention map | normalized weight update | direct snapshot update |

Each renderer family derives values from the snapshot, distinguishes playback timing from quantities, supports Pause, Step, Reset, terminal rendering, and bounded resize. Cartesian, cluster, probability tree, vector space, metric, projection, boundary, and attention-map families may use different interpolation policies; they may not change scientific semantics.

## Reduced motion, focus, and performance

`prefers-reduced-motion: reduce` remaps NV-2100 interface durations to instant, disables ambient animation, removes smooth scroll, and keeps static scientific state readable. Essential scientific motion provides pause, step, and terminal-state access. Live regions announce lifecycle, capture, session, and export state but never every frame or telemetry update.

CSS owns hover, focus, pressed states, and local transitions. JavaScript is limited to lifecycle-dependent work and defines initialization, trigger, cancellation, cleanup, and reduced-motion behavior. Use transform and opacity when appropriate; measure disclosure height rather than using fixed caps. One renderer has one active loop; no loop is created per step. `LabUIController` owns its interval and cancels registered feedback timeouts on Reset and destruction.

Disclosure availability is semantic before visual: the lifecycle renderer is the sole visibility writer, removes `hidden` and `inert`, synchronizes `aria-expanded`, then measures visible content for the open transition. Closing keeps the current body rendered while its measured transition finishes, then applies semantic exclusion. Operation identity prevents an interrupted close from hiding a newer open state. Reduced motion reaches the identical semantic final state immediately.

## Validation

The data-driven suite in `tests/nv-2100-motion-microinteractions.spec.ts` checks token resolution, reduced motion, lifecycle state, one-step advancement, Reset cancellation, and all ten Laboratory routes. Frozen regression configurations remain mandatory. Manual review uses focused recordings and final-state screenshots under `artifacts/nv-2100-motion-microinteractions/`; recordings are reviewed for truthfulness, interruption, focus, reduced-motion clarity, and cleanup rather than frame-perfect pixels.
