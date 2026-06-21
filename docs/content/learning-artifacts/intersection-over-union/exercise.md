---
artifact_id: "artifact-intersection-over-union-exercise"
artifact_title: "Overlapping Box Ratios"
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

# Overlapping Box Ratios

## Artifact Summary

This artifact belongs to the Intersection over Union (IoU) topic and serves as a Exercise.

## Required Contract Fields

### objective

Compute intersection, union, and IoU values from coordinate points.

### learner task

Box A has coordinates $[10, 10, 30, 30]$ ($xyxy$ absolute format). Box B has coordinates $[20, 10, 40, 30]$ ($xyxy$ absolute format). Calculate: 1. Area of intersection. 2. Area of union. 3. Intersection over Union (IoU) value.

### expected learner output

Both boxes have width = 20, height = 20, Area = 400. 1. Intersection: X overlaps from 20 to 30 (width = 10). Y overlaps from 10 to 30 (height = 20). Area of Intersection = 10 * 20 = 200. 2. Union: Area(A) + Area(B) - Intersection = 400 + 400 - 200 = 600. 3. IoU = 200 / 600 = 1/3 ≈ 0.333.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building autonomous vehicles, industrial inspections, robotic manipulators, and multi-object real-time surveillance backbones.

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
