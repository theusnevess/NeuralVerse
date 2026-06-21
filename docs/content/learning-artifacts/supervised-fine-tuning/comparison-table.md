---
artifact_id: "artifact-supervised-fine-tuning-comparison-table"
artifact_title: "Pre-Training vs. SFT"
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
authoritative_source: "Foundational Supervised Fine-Tuning (SFT) literature and scientific adaptation papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - supervised fine-tuning
  - sft
  - labeled data
  - cross-entropy loss
  - data curation
tags:
  - learning-artifact
  - alignment
  - sft
prerequisite_notes: "Basic mathematical and LLM pre-training comfort."
related_topics:
  - fine-tuning-fundamentals
  - instruction-tuning
  - peft
  - supervised-fine-tuning
  - rlhf-concepts
  - domain-adaptation
audience_notes: "Intended for AI engineers and model adaptation developers."---

# Pre-Training vs. SFT

## Artifact Summary

Compares key approaches, algorithms, or architectures within Supervised Fine-Tuning (SFT) — organizes Pre-Training vs. SFT into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Compare alignment roles, data targets, and loss equations.

### explanation

| Alignment Stage | Primary Goal | Dataset Characteristics | Loss Formulation |
|---|---|---|---|
| Pre-Training | Learn general representation | Large scale, noisy web documents | Next-token prediction cross-entropy |
| Supervised Fine-Tuning (SFT) | Adapt to instruction formatting | High quality, curated QA datasets | Target-only next-token cross-entropy |

## Optional Enrichment Fields

### motivation

Adapting pre-trained models to specific tasks is a core practice in modern ML — these techniques enable efficient specialization without full retraining.

## Dependency Notes

This artifact is part of the Supervised Fine-Tuning (SFT) content pack.

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
