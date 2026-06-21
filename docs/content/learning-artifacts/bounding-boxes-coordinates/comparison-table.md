---
artifact_id: "artifact-bounding-boxes-coordinates-comparison-table"
artifact_title: "Coordinate Format Applications"
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
authoritative_source: "Foundational Bounding Boxes and Coordinate Systems literature and scientific object detection papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - bounding boxes
  - coordinate systems
  - xywh format
  - xyxy format
  - relative coordinates
tags:
  - learning-artifact
  - detection
  - coordinates
prerequisite_notes: "Basic mathematical and convolutional comfort."
related_topics:
  - object-detection-fundamentals
  - bounding-boxes-coordinates
  - intersection-over-union
  - anchor-based-vs-free
  - non-maximum-suppression
  - one-stage-vs-two-stage
audience_notes: "Intended for AI engineers and computer vision developers."---

# Coordinate Format Applications

## Artifact Summary

This artifact belongs to the Bounding Boxes and Coordinate Systems topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast xyxy and xywh properties, variables, and usage.

### explanation

| Coordinate Format | Parameters | Normalization Range | Main Usage |
|---|---|---|---|
| Corner Format ($xyxy$) | $[x_{min}, y_{min}, x_{max}, y_{max}]$ | Absolute pixels or relative $[0, 1]$ | IoU calculations, annotations |
| Center Format ($xywh$) | $[x_{center}, y_{center}, w, h]$ | Absolute pixels or relative $[0, 1]$ | YOLO bounding box regressions |

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building autonomous vehicles, industrial inspections, robotic manipulators, and multi-object real-time surveillance backbones.

## Dependency Notes

This artifact is part of the Bounding Boxes and Coordinate Systems content pack.

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
