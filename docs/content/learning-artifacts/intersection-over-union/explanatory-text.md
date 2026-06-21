---
artifact_id: "artifact-intersection-over-union-explanatory-text"
artifact_title: "Intersection over Union (IoU) Metrics"
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
authoritative_source: "Foundational Intersection over Union (IoU) literature and scientific object detection papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - intersection over union
  - IoU
  - Jaccard index
  - overlap metric
  - localization accuracy
tags:
  - learning-artifact
  - detection
  - iou
prerequisite_notes: "Basic mathematical and convolutional comfort."
related_topics:
  - object-detection-fundamentals
  - bounding-boxes-coordinates
  - intersection-over-union
  - anchor-based-vs-free
  - non-maximum-suppression
  - one-stage-vs-two-stage
audience_notes: "Intended for AI engineers and computer vision developers."---

# Intersection over Union (IoU) Metrics

## Artifact Summary

Covers Intersection over Union (IoU) Metrics within the broader topic of Intersection over Union (IoU) — explains the core ideas, their role in AI systems, and what makes them important for practitioners to understand.

## Required Contract Fields

### objective

Explain IoU mathematics, union and intersection areas, and coordinate losses.

### explanation

Intersection over Union (IoU) is a mathematical metric that evaluates the spatial overlap accuracy of two bounding boxes (typically a predicted box $B_p$ and a ground truth box $B_gt$). It is defined as the area of intersection divided by the area of union: $IoU = \frac{Area(B_p \cap B_gt)}{Area(B_p \cup B_gt)}$. IoU values range from 0.0 (no overlap) to 1.0 (perfect alignment). It is used as a threshold in validation tests, matching detections, and coordinate losses (like GIoU, DIoU, CIoU) that optimize boxes directly.

## Optional Enrichment Fields

### motivation

Object detection pipelines power real-world applications from autonomous driving to medical imaging — understanding these architectural choices is key to building effective perception systems.

## Dependency Notes

This artifact is part of the Intersection over Union (IoU) content pack.

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
