---
artifact_id: "artifact-receptive-fields-explanatory-text"
artifact_title: "Hierarchical Receptive Field Sizing"
artifact_family: "Instruction Artifacts"
artifact_type: "Explanatory Text"
canonical_status: "Draft"
instructional_objectives:
  - Explanatory
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

# Hierarchical Receptive Field Sizing

## Artifact Summary

This artifact belongs to the Receptive Fields topic and serves as a Explanatory Text.

## Required Contract Fields

### objective

Explain receptive field calculations, growth steps, and context resolutions.

### explanation

The receptive field of a neuron in a convolutional neural network is the local spatial region of the input image that can influence that neuron's activation. In the first layer, the receptive field is equal to the kernel size (e.g., $3 \times 3$). As we go deeper into the network, neurons combine information from previous feature maps. Consequently, the receptive field grows larger layer by layer: $RF_{l} = RF_{l-1} + (K_l - 1) \times \prod_{i=1}^{l-1} S_i$. This hierarchy allows deep neurons to capture global context (e.g., a whole face) while early neurons capture local details (e.g., a tiny vertical edge).

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
