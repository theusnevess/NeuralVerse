---
artifact_id: "artifact-ai-for-scientific-discovery-comparison-table"
artifact_title: "AI Approaches in Scientific Discovery"
artifact_family: "Reference Artifacts"
artifact_type: "Comparison Table"
canonical_status: "Reviewed"

instructional_objectives:
  - Reference
  - Explain
learning_depths:
  - Level 2 — Foundations
  - Level 3 — Advanced
estimated_duration: "6-10 minutes"
supported_learning_levels:
  - Intermediate
  - Advanced

reuse_mode: ""
source_artifact: ""

dependencies:
  prerequisite: []
  recommended_before: []
  recommended_after:
    - artifact-ai-for-scientific-discovery-explanatory-text
  complementary:
    - artifact-ai-for-scientific-discovery-exercise
  alternative: []

authoritative_source: "Survey of AI-for-science methodologies across hypothesis generation, surrogate simulation, inverse design, and automated experimentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use simple table labels and keep each comparison cell concise. Ensure table remains readable in narrow layouts."
keywords:
  - hypothesis generation
  - surrogate simulation
  - inverse design
  - automated experimentation
  - AI for science comparison
tags:
  - learning-artifact
  - ai-for-science
  - reference
prerequisite_notes: "Can be used before or after the explanatory artifact as a quick reference."
related_topics:
  - materials discovery
  - drug discovery
  - protein folding
  - automated labs
audience_notes: "Designed as a compact reference for learners already familiar with the basic concepts of AI for scientific discovery."
---

# AI Approaches in Scientific Discovery

## Artifact Summary

This reference artifact compares four major AI-for-science approaches — Hypothesis Generation, Surrogate Simulation, Inverse Design, and Automated Experimentation — across six criteria.

## Required Contract Fields

### objective

Clarify the differences between four AI-for-science approaches so learners can identify which technique fits a given scientific problem.

### comparison subjects

* Hypothesis Generation
* Surrogate Simulation
* Inverse Design
* Automated Experimentation

### comparison criteria

| Criterion | Hypothesis Generation | Surrogate Simulation | Inverse Design | Automated Experimentation |
|---|---|---|---|---|
| Scientific domain | Cross-disciplinary: biology, chemistry, physics, materials, mathematics | Physics, climate, molecular dynamics, protein folding, engineering | Materials science, drug discovery, molecular design | Chemistry, materials synthesis, biology lab automation |
| AI approach | Knowledge graph reasoning, NLP over literature, latent relation extraction, pattern detection | Neural network regression (CNNs, GNNs, transformers) trained on simulation input-output pairs | Generative models (VAEs, GANs, diffusion models) conditioned on target properties | Bayesian optimization, active learning, reinforcement learning for experiment selection |
| Data requirements | Large unstructured corpora (papers, patents, databases) | Paired simulation input-output data; can be expensive to generate | Labeled property data for training; unlabeled structures for generation | Sequential data from previous experiments; initial seed data |
| Verification method | Human expert evaluation, targeted experiment or proof | Comparison to full-physics simulation or physical experiment | Physical synthesis and characterization; simulation validation | Replication in laboratory; statistical significance testing |
| Human role | Prioritizing hypotheses, designing validation experiments, rejecting false positives | Choosing surrogate architecture, validating approximation quality, interpreting surrogate predictions | Specifying design objectives, evaluating generated candidates, running physical validation | Defining experimental search space, interpreting results, handling edge cases |
| Research maturity | Active research direction; limited deployment in routine scientific practice | Deployed in specific domains (weather, protein folding); generalizability not consolidated | Active research direction; successes in small-molecule design; challenges in complex systems | Early-stage for fully autonomous labs; hybrid human-AI experimentation is more mature |

### comparative takeaways

Hypothesis generation is about proposing what to investigate. Surrogate simulation is about making computation cheaper. Inverse design is about specifying the goal and having the AI find candidates. Automated experimentation is about letting the AI choose what to test.

In practice, these approaches are combined: hypothesis generation proposes candidates, inverse design screens structures, surrogate simulation evaluates them, and automated experimentation validates top picks. The maturity varies significantly — surrogate models for protein folding are more consolidated than fully autonomous laboratories.

## Optional Enrichment Fields

### recommended use cases

Use hypothesis generation when exploring underexamined connections. Use surrogate simulation when the full simulation is too slow. Use inverse design when desired properties are known but structures are unknown. Use automated experimentation when experimental capacity exceeds the ability to manually design each run.

### limitations

All four approaches depend on data quality. Hypothesis generation reflects literature biases. Surrogate models extrapolate poorly outside training regimes. Inverse design can produce unrealistic structures. Automated experimentation can optimize for the wrong objective.

### references

Use source-grounded references when this artifact is promoted beyond draft status.

### decision cues

If you have a large literature corpus, consider hypothesis generation. If you have a slow but accurate simulator, consider a surrogate. If you can define ideal properties, consider inverse design. If you control the experiment, consider automation.

## Dependency Notes

This artifact can be read independently as a quick reference, but it is most useful when paired with the explanatory text or exercise.

## Reuse Notes

No reuse mode is asserted. Future lessons may reuse the comparison structure for AI-for-science modules covering specific domains or techniques.

## Accessibility Notes

Tables should remain readable in narrow layouts. If converted to another format, preserve row and column headers so screen readers can interpret the comparison.

## Evidence Boundary

This Learning Artifact supports learning.

It does not generate Competency Evidence.

It does not certify mastery.

If this artifact is used in an assessment context, that usage must be governed separately by NV-800-M4 and NV-800-M3.

## Quality Review Checklist

- [ ] Technical accuracy checked.
- [ ] Pedagogical clarity checked.
- [ ] Required contract fields complete.
- [ ] Instructional objectives supported.
- [ ] Internal terminology consistent.
- [ ] Reuse suitability considered.
- [ ] Accessibility considerations documented where relevant.
- [ ] Does not introduce assessment logic.
- [ ] Does not claim Competency Evidence.
- [ ] Does not imply learner mastery.
