---
artifact_id: "artifact-receptive-fields-comparison-table"
artifact_title: "Early vs. Deep Layer Fields"
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

# Early vs. Deep Layer Fields

## Artifact Summary

This artifact belongs to the Receptive Fields topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast early and deep layer receptive fields across size, resolution, and meanings.

### explanation

| Layer Depth | Receptive Field Size | Conceptual Resolution | Feature Representation |
|---|---|---|---|
| Early Layers | Small (e.g., $3 \times 3$ pixels) | High resolution, localized | Gabor-like filters (edges, textures) |
| Deep Layers | Large (e.g., $150 \times 150$ pixels) | Low spatial resolution, global | Semantic objects (faces, cars, parts) |

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
