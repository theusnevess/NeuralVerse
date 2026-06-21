---
artifact_id: "artifact-pooling-layers-exercise"
artifact_title: "Downsampling Window Calculations"
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
authoritative_source: "Foundational Pooling Layers literature and scientific CNN documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - pooling layers
  - max pooling
  - average pooling
  - downsampling
  - dimensionality reduction
tags:
  - learning-artifact
  - cnn
  - pooling
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - convolutional-neural-networks
  - pooling-layers
  - receptive-fields
  - stride-padding
  - hierarchical-feature-learning
  - transfer-learning-vision
audience_notes: "Intended for AI engineers and computer science students."---

# Downsampling Window Calculations

## Artifact Summary

This artifact belongs to the Pooling Layers topic and serves as a Exercise.

## Required Contract Fields

### objective

Manually compute max and average downsampled output matrices.

### learner task

Given a $2 \times 2$ sub-grid of activations: $\begin{pmatrix} 12 & 8 \\ 4 & 16 \end{pmatrix}$. Calculate: 1. Max pooling output. 2. Average pooling output.

### expected learner output

1. Max pooling selects the maximum value in the grid: max(12, 8, 4, 16) = 16. 2. Average pooling computes the average: (12 + 8 + 4 + 16) / 4 = 40 / 4 = 10.0.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale Convolutional Neural Networks and transfer learning backbones.

## Dependency Notes

This artifact is part of the Pooling Layers content pack.

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
