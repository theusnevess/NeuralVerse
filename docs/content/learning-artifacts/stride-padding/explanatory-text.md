---
artifact_id: "artifact-stride-padding-explanatory-text"
artifact_title: "Output Spatial Calculations"
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

# Output Spatial Calculations

## Artifact Summary

Covers Output Spatial Calculations within the broader topic of Stride and Padding — explains the core ideas, their role in AI systems, and what makes them important for practitioners to understand.

## Required Contract Fields

### objective

Explain stride, padding, Valid padding, and Same padding output math.

### explanation

The spatial output dimensions of a convolutional layer depend on the input shape ($H_{in}, W_{in}$), kernel size ($K$), padding ($P$), and stride ($S$). Padding adds borders (usually zeros) to the input boundary, preventing the image size from shrinking too fast. Stride controls the step size of the filter. The formula for the output dimension is: $O = \lfloor \frac{H_{in} - K + 2P}{S} \rfloor + 1$. In deep networks, 'Same' padding is often configured to make $O = H_{in}$ (when $S=1$), while 'Valid' padding performs no padding, causing the output size to shrink.

## Optional Enrichment Fields

### motivation

Computer vision pipelines are built on these perceptual primitives — understanding them enables effective architecture design and troubleshooting.

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
