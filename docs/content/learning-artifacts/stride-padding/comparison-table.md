---
artifact_id: "artifact-stride-padding-comparison-table"
artifact_title: "Valid vs. Same Padding"
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

# Valid vs. Same Padding

## Artifact Summary

This artifact belongs to the Stride and Padding topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast Valid and Same padding formulas, outputs, and edge behaviors.

### explanation

| Padding Type | Output Dimension Formula ($S=1$) | Boundary Behavior | Feature Preservation |
|---|---|---|---|
| Valid (No Padding) | $H_{in} - K + 1$ | Filters cannot extend past edges | Discards edge information |
| Same (Zero Padding) | $H_{in}$ | Border zeros padded | Equal weight to edge pixels |

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
