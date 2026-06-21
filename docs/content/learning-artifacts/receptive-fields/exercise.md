---
artifact_id: "artifact-receptive-fields-exercise"
artifact_title: "Two-Layer Output Coverage"
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
authoritative_source: "Foundational Receptive Fields literature and scientific CNN documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - receptive fields
  - effective receptive field
  - spatial coverage
  - hierarchical path
  - dilation
tags:
  - learning-artifact
  - cnn
  - receptive-field
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - convolutional-neural-networks
  - pooling-layers
  - receptive-fields
  - stride-padding
  - hierarchical-feature-learning
  - transfer-learning-vision
audience_notes: "Intended for AI engineers and computer science students."---

# Two-Layer Output Coverage

## Artifact Summary

This artifact belongs to the Receptive Fields topic and serves as a Exercise.

## Required Contract Fields

### objective

Apply the receptive field growth formula to multi-layer CNNs.

### learner task

A 2-layer CNN uses $3 \times 3$ kernels with stride 1 in both layers. Calculate the receptive field size of a single neuron in the second layer output.

### expected learner output

Formula: RF_2 = RF_1 + (K_2 - 1) * S_1. With RF_1 = 3, K_2 = 3, and S_1 = 1, we get RF_2 = 3 + (3 - 1) * 1 = 3 + 2 = 5. The receptive field is 5 x 5 pixels.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale Convolutional Neural Networks and transfer learning backbones.

## Dependency Notes

This artifact is part of the Receptive Fields content pack.

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
