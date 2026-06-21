---
artifact_id: "artifact-transfer-learning-vision-comparison-table"
artifact_title: "Extraction vs. Fine-Tuning"
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
authoritative_source: "Foundational Transfer Learning in Vision literature and scientific CNN documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - transfer learning
  - fine-tuning
  - feature extractor
  - pretrained backbone
  - domain adaptation
tags:
  - learning-artifact
  - cnn
  - transfer-learning
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - convolutional-neural-networks
  - pooling-layers
  - receptive-fields
  - stride-padding
  - hierarchical-feature-learning
  - transfer-learning-vision
audience_notes: "Intended for AI engineers and computer science students."---

# Extraction vs. Fine-Tuning

## Artifact Summary

This artifact belongs to the Transfer Learning in Vision topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare Feature Extractor and Fine-Tuning strategies across data size, parameters, and risk.

### explanation

| Adapt Strategy | Target Dataset Size | Layer Parameter Status | Risk |
|---|---|---|---|
| Feature Extractor | Extremely Small (e.g., < 1,000) | Frozen backbone, trainable classifier | Underfitting if domains differ |
| Fine-Tuning | Medium/Large (e.g., > 10,000) | Trainable backbone (slow updates) | Overfitting (Catastrophic Forgetting) |

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale Convolutional Neural Networks and transfer learning backbones.

## Dependency Notes

This artifact is part of the Transfer Learning in Vision content pack.

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
