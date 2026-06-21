---
artifact_id: "artifact-stride-padding-exercise"
artifact_title: "Dimensional Padding Outputs"
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
authoritative_source: "Foundational Stride and Padding literature and scientific CNN documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - stride
  - padding
  - convolution dimensions
  - zero-padding
  - same padding
tags:
  - learning-artifact
  - cnn
  - dimensions
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - convolutional-neural-networks
  - pooling-layers
  - receptive-fields
  - stride-padding
  - hierarchical-feature-learning
  - transfer-learning-vision
audience_notes: "Intended for AI engineers and computer science students."---

# Dimensional Padding Outputs

## Artifact Summary

This artifact belongs to the Stride and Padding topic and serves as a Exercise.

## Required Contract Fields

### objective

Solve spatial dimension equations with non-zero padding.

### learner task

An input image of size $28 \times 28$ is convolved with a $5 \times 5$ kernel. The stride is 1 and padding is 2. Calculate the resulting spatial output dimension.

### expected learner output

Formula: O = ((H_in - K + 2P) / S) + 1. Substituting: O = ((28 - 5 + 2*2) / 1) + 1 = ((23 + 4) / 1) + 1 = 27 + 1 = 28. The spatial output dimension is 28.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale Convolutional Neural Networks and transfer learning backbones.

## Dependency Notes

This artifact is part of the Stride and Padding content pack.

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
