---
artifact_id: "artifact-llm-overview-comparison-table"
artifact_title: "Task-Specific vs. Foundational Systems"
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
authoritative_source: "Foundational Large Language Models Overview literature and scientific LLM papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - large language models
  - scaling laws
  - pre-training
  - downstream tasks
  - emergent capabilities
tags:
  - learning-artifact
  - llm
  - fundamentals
prerequisite_notes: "Basic mathematical and Transformer architecture comfort."
related_topics:
  - llm-overview
  - autoregressive-generation
  - prompting-fundamentals
  - context-windows-long
  - in-context-learning
  - hallucinations-reliability
audience_notes: "Intended for AI engineers and language model developers."---

# Task-Specific vs. Foundational Systems

## Artifact Summary

This artifact belongs to the Large Language Models Overview topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast objectives, parameters, and generalization properties.

### explanation

| Metric / Feature | Task-Specific Models | Foundational LLMs |
|---|---|---|
| Training Objective | Supervised task loss (e.g., classification) | Next-token prediction (self-supervised) |
| Model Parameters | Millions ($10^6 - 10^8$) | Billions ($10^9 - 10^{11}+$) |
| Generalization | Restricted to training distribution | High (adapts to unseen tasks via prompting) |

## Optional Enrichment Fields

### motivation

Understanding LLM foundations is critical for building generative chatbots, few-shot classifiers, long-context search retrievers, and aligned AI systems.

## Dependency Notes

This artifact is part of the Large Language Models Overview content pack.

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
