---
artifact_id: "artifact-peft-comparison-table"
artifact_title: "Full Fine-Tuning vs. LoRA PEFT"
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

# Full Fine-Tuning vs. LoRA PEFT

## Artifact Summary

This artifact belongs to the Parameter-Efficient Fine-Tuning (PEFT) topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast parameter scales, GPU memory loads, and output file sizes.

### explanation

| Adaptation Method | Trainable Parameters | GPU Memory Sizing | Checkpoint Output File Size |
|---|---|---|---|
| Full Fine-Tuning | $100\%$ of model weights | Extremely High (requires optimizer states) | Full model size (e.g., $14$ GB for a 7B model) |
| LoRA (PEFT) | $<1\%$ of model weights | Low (pre-trained weights frozen) | Megabytes (e.g., $10-50$ MB adapters) |

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
