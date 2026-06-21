---
artifact_id: "artifact-convolutional-neural-networks-exercise"
artifact_title: "Trainable Filter Weights"
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
authoritative_source: "Foundational Convolutional Neural Networks (CNNs) literature and scientific CNN documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - convolutional neural networks
  - CNNs
  - weight sharing
  - spatial translation invariance
  - tensors
tags:
  - learning-artifact
  - cnn
  - architecture
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - convolutional-neural-networks
  - pooling-layers
  - receptive-fields
  - stride-padding
  - hierarchical-feature-learning
  - transfer-learning-vision
audience_notes: "Intended for AI engineers and computer science students."---

# Trainable Filter Weights

## Artifact Summary

This artifact belongs to the Convolutional Neural Networks (CNNs) topic and serves as a Exercise.

## Required Contract Fields

### objective

Calculate parameter sizing metrics in 3D convolutional layers.

### learner task

An input image has shape $64 \times 64 \times 3$. A convolutional layer applies 16 filters of shape $5 \times 5 \times 3$. Calculate the total number of trainable weight parameters (excluding biases) in this layer.

### expected learner output

Each of the 16 filters has shape 5 * 5 * 3 = 75 parameters. Total trainable weight parameters in the layer = 16 filters * 75 parameters = 1,200 weight parameters.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale Convolutional Neural Networks and transfer learning backbones.

## Dependency Notes

This artifact is part of the Convolutional Neural Networks (CNNs) content pack.

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
