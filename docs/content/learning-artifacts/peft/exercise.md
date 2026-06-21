---
artifact_id: "artifact-peft-exercise"
artifact_title: "LoRA Parameter Calculation"
artifact_family: "Practice Artifacts"
artifact_type: "Exercise"
canonical_status: "Draft"
instructional_objectives:
  - Exercise
learning_depths:
  - Level 1 — Intuition
  - Level 2 — Foundations
estimated_duration: "5-8 minutes"
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
authoritative_source: "Foundational Parameter-Efficient Fine-Tuning (PEFT) literature and scientific adaptation papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - peft
  - lora
  - adapters
  - frozen weights
  - low-rank adaptation
tags:
  - learning-artifact
  - adaptation
  - peft
prerequisite_notes: "Basic mathematical and LLM pre-training comfort."
related_topics:
  - fine-tuning-fundamentals
  - instruction-tuning
  - peft
  - supervised-fine-tuning
  - rlhf-concepts
  - domain-adaptation
audience_notes: "Intended for AI engineers and model adaptation developers."---

# LoRA Parameter Calculation

## Artifact Summary

This artifact belongs to the Parameter-Efficient Fine-Tuning (PEFT) topic and serves as a Exercise.

## Required Contract Fields

### objective

Calculate parameter savings from low-rank constraints.

### learner task

Given a weight matrix $W \in \mathbb{R}^{4096 \times 4096}$ and a LoRA rank $r = 8$. Calculate: 1. The number of parameters in the original matrix. 2. The number of trainable parameters in LoRA matrices $A$ and $B$ combined.

### expected learner output

1. Original parameter count = 4096 * 4096 = 16,777,216 params. 2. LoRA matrices: A is 8 * 4096, B is 4096 * 8. Combined trainable params = (8 * 4096) + (4096 * 8) = 32,768 + 32,768 = 65,536 params. This represents a 99.61% reduction in trainable parameters.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding Fine-Tuning and Adaptation is critical for specializing models for custom tasks, aligning generation safety, deploying LoRA adapters in production, and selecting RAG combinations.

## Dependency Notes

This artifact is part of the Parameter-Efficient Fine-Tuning (PEFT) content pack.

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
