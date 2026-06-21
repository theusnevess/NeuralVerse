---
artifact_id: "artifact-semantic-segmentation-fundamentals-comparison-table"
artifact_title: "Classification, Detection, and Segmentation"
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
authoritative_source: "Foundational Semantic Segmentation Fundamentals literature and scientific segmentation papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - semantic segmentation
  - pixel labeling
  - category maps
  - visual context
  - dense prediction
tags:
  - learning-artifact
  - segmentation
  - fundamentals
prerequisite_notes: "Basic mathematical and CNN segmentation comfort."
related_topics:
  - semantic-segmentation-fundamentals
  - instance-segmentation-fundamentals
  - pixel-wise-classification
  - segmentation-masks-labels
  - encoder-decoder-segmentation
  - unet-vs-maskrcnn
audience_notes: "Intended for AI engineers and computer vision developers."---

# Classification, Detection, and Segmentation

## Artifact Summary

Compares key approaches, algorithms, or architectures within Semantic Segmentation Fundamentals — organizes Classification, Detection, and Segmentation into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast output resolutions, preservation constraints, and target units.

### explanation

| Task Type | Target Output Unit | Spatial Resolution Preservation | Primary Downstream Use Cases |
|---|---|---|---|
| Image Classification | Entire image label | No (fully pooled) | Scene tagging, cataloging |
| Object Detection | Bounding boxes ($xyxy$) | Coarse (grid heads) | Object counting, localization |
| Semantic Segmentation | Pixel-wise label map | Full (same as input) | Autonomous driving road parsing |

## Optional Enrichment Fields

### motivation

Segmentation techniques enable pixel-level understanding of visual data — they are fundamental to medical imaging, autonomous navigation, and remote sensing applications.

## Dependency Notes

This artifact is part of the Semantic Segmentation Fundamentals content pack.

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
