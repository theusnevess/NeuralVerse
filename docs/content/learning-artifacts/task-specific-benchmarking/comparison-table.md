---
artifact_id: "artifact-task-specific-benchmarking-comparison-table"
artifact_title: "General vs. Specialized Benchmarks"
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
    - automatic-evaluation-metrics
    - human-evaluation
    - rag-evaluation
  alternative:
authoritative_source: "Foundational LLM benchmarking literature, including MMLU, HellaSwag, GSM8K, HumanEval, GLUE, SuperGLUE, and BIG-bench papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - benchmarks
  - MMLU
  - HellaSwag
  - GSM8K
  - HumanEval
  - GLUE
  - SuperGLUE
  - BIG-bench
tags:
  - learning-artifact
  - llm-evaluation
  - benchmarking
prerequisite_notes: "Basic familiarity with LLMs and evaluation concepts."
related_topics:
  - automatic-evaluation-metrics
  - human-evaluation
  - rag-evaluation
audience_notes: "Intended for AI engineers, researchers, and practitioners evaluating LLM performance."
---

# General vs. Specialized Benchmarks

## Artifact Summary

This artifact belongs to the Task-Specific Benchmarking topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast general-purpose and specialized LLM benchmarks across their purpose, task types, breadth versus depth, contamination risk, and interpretation approach.

### comparison subjects

General benchmarks (MMLU, BIG-bench, HellaSwag) vs. Specialized benchmarks (GSM8K, HumanEval, MedicalQA).

### comparison criteria

Purpose, Task types, Breadth vs. Depth, Contamination risk, Interpretation.

### comparative takeaways

| Criterion | General Benchmarks | Specialized Benchmarks |
|---|---|---|
| Purpose | Measure broad, multi-domain capability | Measure deep proficiency in a specific domain |
| Task types | Diverse — multiple-choice, reasoning, knowledge retrieval | Focused — math word problems, code synthesis, clinical Q&A |
| Breadth vs. Depth | Wide breadth across many topics, shallow per-topic coverage | Narrow scope, deep coverage of one skill area |
| Contamination risk | Higher — diverse web text frequently overlaps with training data | Variable — niche datasets (e.g., MedicalQA) may be less exposed, but popular ones (e.g., GSM8K) are widely reproduced |
| Interpretation | Aggregate scores can mask uneven per-task performance. Examine per-category breakdowns. | Scores directly reflect domain capability but do not generalize. Must be paired with general benchmarks for a full picture. |

## Optional Enrichment Fields

### motivation

Understanding benchmark landscapes is critical for selecting appropriate evaluation tools, interpreting published model comparisons, and designing robust evaluation protocols for real-world deployments.

## Dependency Notes

This artifact is part of the Task-Specific Benchmarking content pack.

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
