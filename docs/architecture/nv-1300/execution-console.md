# NV-1300 Execution Console

## Mission And Boundaries

The Execution Console is the operational surface for starting, pausing, resuming, stepping, and resetting a laboratory. It reports lifecycle and runtime progress only. Scientific evidence belongs to the Scientific Stage; configuration belongs to the Experiment Rail; terminal scientific conclusions belong to Completion.

## Lifecycle Authority

`ExecutionEngine` owns a step session and normalizes its internal state through `getLifecycleState`: `ready`, `running`, `paused`, `completed`, or `failed`. The UI controller is the single DOM writer through `applyWorkspaceExecutionState`. The Console, Stage, Rail, and Completion read the same session lifecycle; none infer it from DOM state, button labels, or progress.

## Commands

Run is available from Ready, Pause from Running, Resume from Paused, Step is available until terminal execution, and Reset is available after work has started. The visually primary command follows the lifecycle: Run, Pause, Resume, then Reset. Reset creates an idle session, clears logs/findings/completion, restores preparation rendering, and returns the lifecycle to Ready. Retry is not exposed because no current laboratory provides a distinct recoverable retry behavior.

## Progress And Feedback

Every registered laboratory is step-based, so progress is determinate: completed step count divided by the registered step total. The current step is the registered step label. The Console provides a concise lifecycle announcement, determinate accessible range metadata, a current-step count, and a short operational message. It never presents scientific outcomes as lifecycle state.

## Errors And Synchronization

Thrown step rendering is normalized to `failed` with a learner-facing recovery message; stack details are not exposed. Scientific non-convergence remains a completed lifecycle and is handled by Completion. A completed lifecycle enables Completion; a reset clears it. Running and paused Stage rendering use the same session snapshot as the Console.

## Responsive And Accessibility Requirements

Wide Console layout prioritizes lifecycle status, actions, progress, and operational message. Mobile order is status, primary action group, progress, message, secondary action, speed. Controls have accessible names, visible focus, keyboard activation, `aria-busy` while running, and determinate range semantics. State changes are announced politely; per-step visual updates do not require animation.

## Validation

`tests/nv-1300-execution-console.spec.ts` verifies all registered laboratories for Ready, Run, Pause, Resume, Completed, Reset, Console/Stage/Completion synchronization, progress integrity, focus transitions, and mobile containment. The Scientific Stage and canonical-layout suites remain required regressions.
