# NV-1500 Parameters And Experiment Configuration

Laboratory `parameterSchema` is the single parameter authority. All ten Laboratory schemas define labels, scientific meaning, data type, default, valid domain, precision, control type, and either a unit or an explicit unit classification. The audit is recorded in `artifacts/nv-1500-parameters/parameters-audit.json`.

`ParameterEngine` validates finite numeric values, declared ranges, integer semantics, and categorical choices. It rejects `NaN`, `Infinity`, out-of-domain values, fractional integers, and unsupported selections. Existing bounded controls cannot produce invalid learner input, so permanent field-level errors are not rendered; invalid programmatic input is rejected before execution.

No active Laboratory requires a configuration-level dependency: every parameter contract records `dependencies: []`. In particular, the K-Means cluster maximum remains below its dataset-size minimum, so no cluster-to-sample constraint is needed.

Parameters are editable in Ready and Completed, and locked during Running and Paused. Run validates the editable configuration, creates an immutable normalized execution snapshot, and creates the step session from that copy. Active execution and completion evidence therefore cannot drift when the next editable configuration changes. Reset Experiment clears the snapshot; Reset Parameters restores schema defaults.

The Experiment Rail displays units only when they add information beyond a clear label. Unitless, probability, categorical, boolean, and count semantics remain explicit in the contract without unnecessary visible text. Numeric values reserve their own Rail column at desktop widths and remain contained on mobile.

Final coverage includes ten-laboratory contract and snapshot checks, keyboard disclosure checks, direct screenshot review, and frozen regressions for Scientific Inspector, Execution Console, Scientific Stage, and Canonical Layout. Results and review findings are recorded in `artifacts/nv-1500-parameters/parameters-validation.json`.
