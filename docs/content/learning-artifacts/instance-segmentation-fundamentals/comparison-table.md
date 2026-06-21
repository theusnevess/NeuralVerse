---
artifact_id: "artifact-instance-segmentation-fundamentals-comparison-table"
artifact_title: "Semantic, Instance, and Panoptic Segmentation"
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
authoritative_source: "Foundational Instance Segmentation Fundamentals literature and scientific segmentation papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - instance segmentation
  - object instances
  - mask heads
  - localization and mask
  - panoptic segmentation
tags:
  - learning-artifact
  - segmentation
  - instances
prerequisite_notes: "Basic mathematical and CNN segmentation comfort."
related_topics:
  - semantic-segmentation-fundamentals
  - instance-segmentation-fundamentals
  - pixel-wise-classification
  - segmentation-masks-labels
  - encoder-decoder-segmentation
  - unet-vs-maskrcnn
audience_notes: "Intended for AI engineers and computer vision developers."---

# Semantic, Instance, and Panoptic Segmentation

## Artifact Summary

This artifact belongs to the Instance Segmentation Fundamentals topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast instance tracking, outputs, and standard backbones.

### explanation

| Metric / Property | Semantic Segmentation | Instance Segmentation | Panoptic Segmentation |
|---|---|---|---|
| Instance Distinction | No (same category = same mask) | Yes (individual objects separated) | Yes (combines things and stuff) |
| Output Representation | Categorical label map | Bounding boxes + Binary masks | Unified instance-semantic map |
| Typical Architectures | U-Net, FCN, DeepLab | Mask R-CNN, Yolact | Panoptic FPN, Mask2Former |

## Optional Enrichment Fields

### motivation

Understanding segmentation is critical for building medical scanners, self-driving cars, satellite crop trackers, and human-in-the-loop image editors.

## Dependency Notes

This artifact is part of the Instance Segmentation Fundamentals content pack.

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
