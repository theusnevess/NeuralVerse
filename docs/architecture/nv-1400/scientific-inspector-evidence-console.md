# NV-1400 Scientific Inspector & Evidence Console

The evidence layer separates interpreted findings from operational log events. Laboratory XAI rules produce findings; `XAIEngine.createEvidenceStore` normalizes them by laboratory/run, assigns a stable fingerprint, and consolidates repeated occurrences without discarding raw records.

The Current Finding shows the highest-ranked finding from the active step. Inspector selection resolves the latest representative evidence from the store. Findings History is grouped by default, ordered by latest occurrence, bounded to twenty groups, and reports latest step plus occurrence count. The Scientific Log remains a separately owned bounded diagnostic surface.

Each run creates a new evidence store. Reset clears the active store but does not alter research-session evidence already captured by the existing research workflow. Severity is learner-facing `Informational`, `Important`, or `Critical`; legacy `Significant` is normalized to `Important`. Provenance remains the existing rule references, metric state, and source step.

Evidence panels use progressive disclosure: Current Signal, selected inspection, grouped history, then raw log. The Stage may receive existing visual-evidence highlights; no finding creates a synthetic scientific mark or modifies experiment data.

Validation requires grouped occurrence integrity, current finding selection, bounded History and Log behavior, keyboard selection, mobile containment, run reset isolation, plus Execution Console, Scientific Stage, and canonical-layout regressions.
