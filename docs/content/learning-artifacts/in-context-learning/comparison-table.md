---
artifact_id: "artifact-in-context-learning-comparison-table"
artifact_title: "In-Context Learning vs. Fine-Tuning"
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
authoritative_source: "Foundational In-Context Learning literature and scientific LLM papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - in-context learning
  - parameter frozen
  - pattern recognition
  - activation states
  - meta-gradients
tags:
  - learning-artifact
  - llm
  - learning
prerequisite_notes: "Basic mathematical and Transformer architecture comfort."
related_topics:
  - llm-overview
  - autoregressive-generation
  - prompting-fundamentals
  - context-windows-long
  - in-context-learning
  - hallucinations-reliability
audience_notes: "Intended for AI engineers and language model developers."---

# In-Context Learning vs. Fine-Tuning

## Artifact Summary

Compares key approaches, algorithms, or architectures within In-Context Learning — organizes In-Context Learning vs. Fine-Tuning into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast weights, compute targets, and persistence limits.

### explanation

| Feature | In-Context Learning (ICL) | Fine-Tuning |
|---|---|---|
| Parameter Weights | Frozen (no updates) | Modified via backpropagation |
| Computational Cost | Fast (inference only, but higher prompt cost) | Expensive (requires backward passes and GPUs) |
| Persistence | Temporary (lost when session ends) | Permanent (saved to model weights) |

## Optional Enrichment Fields

### motivation

Modern language models rely on these mechanisms for generation, reasoning, and alignment — understanding them is essential for building reliable LLM applications.

## Dependency Notes

This artifact is part of the In-Context Learning content pack.

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
