---
artifact_id: "artifact-human-evaluation-comparison-table"
artifact_title: "Human Evaluation Dimensions"
artifact_family: "Reference Artifacts"
artifact_type: "Comparison Table"
canonical_status: "Draft"
instructional_objectives:
  - Comparison
learning_depths:
  - Level 1 — Intuition
  - Level 2 — Foundations
estimated_duration: "3-5 minutes"
supported_learning_levels:
  - Beginner
reuse_mode: ""
source_artifact: ""
dependencies:
  prerequisite:
  recommended_before:
  recommended_after:
  complementary:
  alternative:
authoritative_source: "Foundational LLM Evaluation literature and scientific human evaluation papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - human evaluation
  - fluency
  - coherence
  - factuality
  - annotation protocols
tags:
  - learning-artifact
  - human-evaluation
  - annotation
prerequisite_notes: "Basic familiarity with LLM concepts."
related_topics:
  - automatic-evaluation-metrics
  - task-specific-benchmarking
  - hallucination-evaluation
audience_notes: "Intended for AI engineers and evaluation practitioners."
---

# Human Evaluation Dimensions

## Artifact Summary

This artifact belongs to the Human Evaluation of LLMs topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare Fluency, Coherence, Factuality, and Helpfulness across definition, evaluation method, typical scale, and key challenges.

### explanation

| Dimension | Definition | Evaluation Method | Typical Scale | Key Challenges |
|---|---|---|---|---|
| Fluency | Linguistic naturalness and grammatical correctness | Readability assessment, grammar check, native speaker judgment | 1-5 Likert (1 = Incomprehensible, 5 = Native-level) | Language variation, dialect differences |
| Coherence | Logical flow and structural consistency of ideas | Narrative analysis, transition evaluation, topic tracking | 1-5 Likert (1 = Disjointed, 5 = Seamlessly structured) | Long-form text, multi-turn conversations |
| Factuality | Accuracy of claims relative to known information | Fact-checking against trusted sources, verification | Binary or 1-5 (1 = Mostly false, 5 = Entirely correct) | Evolving knowledge, unverifiable claims |
| Helpfulness | Usefulness and relevance to user's intent | Task completion assessment, relevance rating | 1-5 Likert (1 = Not helpful, 5 = Highly helpful) | Subjective user expectations, context dependence |

## Optional Enrichment Fields

### motivation

Understanding human evaluation protocols is critical for building reliable LLM assessment pipelines, ensuring quality in production deployments, and identifying when automation is insufficient.

## Dependency Notes

This artifact is part of the LLM Evaluation & Benchmarking content pack.

## Reuse Notes

No reuse mode is asserted. The artifact can participate independently in different instructional contexts.

## Accessibility Notes

Text descriptions are provided for all conceptual spaces.

## Evidence Boundary

This Learning Artifact supports learning.

It does not generate Competency Evidence.

It does not certify mastery.

If this artifact is used in an assessment context, that usage must be governed separately by NV-800-M4 and NV-800-M3.

## Quality Review Checklist

- [ ] Technical accuracy checked.
- [ ] Pedagogical clarity checked.
- [ ] Required contract fields complete.
- [ ] Summary matched with objectives.
- [ ] Internal terminology consistent.
- [ ] Reuse suitability considered.
- [ ] Accessibility considerations documented.
- [ ] Does not introduce assessment logic.
- [ ] Does not claim Competency Evidence.
- [ ] Does not imply learner mastery.
