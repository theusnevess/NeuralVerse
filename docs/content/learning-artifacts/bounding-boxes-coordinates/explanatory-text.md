---
artifact_id: "artifact-bounding-boxes-coordinates-explanatory-text"
artifact_title: "Corner, Center, and Normalized Coordinates"
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

# Corner, Center, and Normalized Coordinates

## Artifact Summary

Covers Corner, Center, and Normalized Coordinates within the broader topic of Bounding Boxes and Coordinate Systems — explains the core ideas, their role in AI systems, and what makes them important for practitioners to understand.

## Required Contract Fields

### objective

Explain xyxy and xywh formats and relative normalized formats.

### explanation

Bounding boxes define the spatial extent of objects in an image. The two most common formats are: 1. $[x_{min}, y_{min}, x_{max}, y_{max}]$ ($xyxy$ format), representing the top-left and bottom-right corners. 2. $[x_{center}, y_{center}, w, h]$ ($xywh$ format), representing the box center coordinates, width, and height. To make these box parameters scale-independent across different image sizes, object detectors normalize coordinate values by dividing them by the image width and height, keeping all outputs in the relative range $[0.0, 1.0]$.

## Optional Enrichment Fields

### motivation

Object detection pipelines power real-world applications from autonomous driving to medical imaging — understanding these architectural choices is key to building effective perception systems.

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
