# Canonical Performance and Runtime Efficiency Architecture

## Mission

NV-2300 preserves scientific interaction quality through bounded startup, responsive controls, synchronized rendering, and complete resource teardown. Performance follows Vision, UI Constitution, Architecture Guide, accepted Laboratory architecture, Design System, Typography and Density, Motion, Accessibility, then this architecture.

## Ownership and measurement

`ExecutionEngine` owns canonical progression. Laboratory data owns normalized scientific state. Renderers present snapshots and never emit scientific events. `LabUIController` owns Laboratory DOM updates, its interval, feedback timeouts, and disclosure cleanup. Each Playwright suite starts an identified local server whose base URL, readiness URL, and listening origin are identical.

The primary measurement profile is fresh Playwright Chromium at 1440x900, scale factor 1, no reduced-motion preference, and a current-worktree server. Secondary profiles cover 1024x768, 390x844, 360x740, 844x390, and reduced motion. Measurements use at least three iterations when timing distributions are reported; median is primary.

## Budgets and contracts

Direct acknowledgement targets 100 ms, scientific update acknowledgement 200 ms, terminal availability 300 ms, and interaction long tasks 200 ms. These are representative-environment targets, not hardware guarantees. Hard invariants are no stale execution, no cross-run update, no persistent owned RAF/timer after teardown, and no monotonic listener, observer, DOM, or retained-resource growth.

Laboratory Ready means title, Stage container, Parameters, Ready Console, enabled Run action, and initialized canonical state are available. Input acknowledges before bounded preview work. Pause and Reset change canonical state without waiting for rendering. Renderers consume the latest snapshot, coalesce only superseded visual states, preserve terminal and evidence-generating states, and never run idle animation loops without purpose.

## Resource lifecycle

Owners declare initialization, trigger, identity, cancellation, and teardown for listeners, observers, timers, RAF, object URLs, and renderer resources. Resize is scheduled and state preserving; it does not reinitialize execution. Research persistence separates immediate UI state from bounded durability work, preserves immutable snapshots, and does not replay historical motion. Completion and export consume canonical terminal/session data rather than recomputing experiments.

## Validation

`tests/nv-2300-performance.spec.ts` covers ten-Laboratory readiness, execution acknowledgement and Reset cleanup, and resize continuity. It does not substitute synthetic frame-rate claims for traces. Traces, profiles, endurance evidence, and direct temporal review belong in `artifacts/nv-2300-performance/`. Material optimizations require a before/after measurement, owner, scientific impact, accessibility impact, and maintenance impact.

The measured `ACCESSIBILITY_SUMMARY_DOM_ACCUMULATION` defect in `ScientificStage.decorate` was resolved by replacing the prior accessible summary before decorating a later snapshot. The performance suite asserts one canonical summary after repeated Scientific Stage updates.

Research durability uses `ResearchStorage` as its canonical storage authority. Its synchronous read/write contract consumes the local adapter retained by the optional unified storage wrapper; promise-returning wrapper methods are not valid inputs to synchronous JSON parsing. NV-2300 profiles verify durable immutable sessions through 1, 2, 10, and 25 runs and generate JSON and Markdown from the canonical in-memory model. `ResearchMode.restore` rehydrates only a validated persisted record; the Laboratory UI exposes the latest saved session explicitly and never replays historical execution. Draft, Active, Review, Completed, and Reopened presentations are covered, as are 25-run restoration, append-only Run 26 mutation, and object URL revocation for exports.

The two access paths are coherent: ResearchStorage save/read/remove and unified adapter reads resolve the same `nv_research_sessions` localStorage payload and removal is symmetric. The retained local adapter is an access path retained by the unified wrapper, not a second cache or authority.

Restoration equivalence compares session, Laboratory, run ordering and identities, snapshots, outcomes, measurements, evidence, observations, interpretations, and learner-authored scientific records. Runtime presentation handles are excluded. Deterministic 1, 2, 10, and 25-run profiles are equivalent when reconstructed through the canonical ResearchStorage reader.

Route endurance captures live listener registrations and Resize, Intersection, and Mutation Observer instances in addition to timers, RAFs, DOM nodes, and object URLs. A repeated route has the same per-Laboratory listener and observer baseline. The NV-2300 suite measures heap through Chromium CDP after explicit GC between three full route sweeps, and observes native browser long tasks during each Step and Reset. The current profile retained heap within 4.18% of its first post-GC sweep and observed a maximum long task of 70 ms against the 200 ms threshold. These are environment-specific measurements, not universal hardware guarantees.
