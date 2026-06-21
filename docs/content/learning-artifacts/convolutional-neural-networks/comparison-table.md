---
artifact_id: "artifact-convolutional-neural-networks-comparison-table"
artifact_title: "CNN vs. MLP Layers"
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

# CNN vs. MLP Layers

## Artifact Summary

Compares key approaches, algorithms, or architectures within Convolutional Neural Networks (CNNs) — organizes CNN vs. MLP Layers into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast MLP and CNN scaling, layout preservation, and bias assumptions.

### explanation

| Metric | Fully Connected Layer (MLP) | Convolutional Layer (CNN) |
|---|---|---|
| Parameter Scaling | Scales with input size ($H \times W$) | Scales with filter size ($K_h \times K_w$) |
| Spatial Relationships | Discards spatial layout (flattens input) | Preserves local coordinate structure |
| Inductive Bias | Minimal (learns relations from scratch) | High (local connectivity, translation invariance) |

## Optional Enrichment Fields

### motivation

Computer vision pipelines are built on these perceptual primitives — understanding them enables effective architecture design and troubleshooting.

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
