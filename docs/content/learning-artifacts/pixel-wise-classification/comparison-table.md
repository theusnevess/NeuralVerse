---
artifact_id: "artifact-pixel-wise-classification-comparison-table"
artifact_title: "Global vs. Dense Classifications"
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
authoritative_source: "Foundational Pixel-wise Classification literature and scientific segmentation papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - pixel-wise classification
  - dense prediction
  - channel dimensions
  - soft-max loss
  - cross-entropy
tags:
  - learning-artifact
  - segmentation
  - pixel-wise
prerequisite_notes: "Basic mathematical and CNN segmentation comfort."
related_topics:
  - semantic-segmentation-fundamentals
  - instance-segmentation-fundamentals
  - pixel-wise-classification
  - segmentation-masks-labels
  - encoder-decoder-segmentation
  - unet-vs-maskrcnn
audience_notes: "Intended for AI engineers and computer vision developers."---

# Global vs. Dense Classifications

## Artifact Summary

This artifact belongs to the Pixel-wise Classification topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast tensor sizes, loss aggregations, and activations.

### explanation

| Feature | Image-Level Classification | Pixel-Wise Classification |
|---|---|---|---|
| Logit Tensor Dimensions | $[B, C]$ | $[B, H, W, C]$ |
| Loss Application | Single loss scalar per sample | Sum or average of $H \times W$ loss scalars |
| Final Activation | Softmax over class list | Spatial-preserved Softmax over class list |

## Optional Enrichment Fields

### motivation

Understanding segmentation is critical for building medical scanners, self-driving cars, satellite crop trackers, and human-in-the-loop image editors.

## Dependency Notes

This artifact is part of the Pixel-wise Classification content pack.

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
