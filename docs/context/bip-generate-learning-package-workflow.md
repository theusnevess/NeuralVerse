# GenerateLessonLearningPackageWorkflow

`GenerateLessonLearningPackageWorkflow` is registered as a stable Temporal
workflow type. Its input freezes policy versions, request fingerprint,
revision bound, deadlines, contract releases, and bounded activity payload
references. Workflow history records only stage summaries and artifact
references.

The implementation includes qualification, curriculum, parallel enrichment,
didactic assembly, cross-agent validation, governance, human-review signal,
package compilation, readiness, and publication-command signal states.
Publication execution remains outside this stage.

M9 adds a Backend-owned progress activity and reduces activity outputs to
stable references and bounded summaries. The durable workflow still waits for
publication command acceptance and does not execute Stage 10 publication.

The persisted-reference candidate also wires curriculum, evidence, knowledge,
parallel enrichment, assembly, validation, governance, draft and readiness
through `WorkflowArtifactReferenceMap`. Certification of the full live path is
still pending.
