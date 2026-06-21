---
artifact_id: "artifact-bounding-boxes-coordinates-visual-intuition"
artifact_title: "Canvas Painting Coordinates"
artifact_family: "Instruction Artifacts"
artifact_type: "Visual Intuition"
canonical_status: "Draft"
instructional_objectives:
  - Visual
learning_depths:
  - Level 1 — Intuition
  - Level 2 — Foundations
estimated_duration: "4-6 minutes"
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

# Canvas Painting Coordinates

## Artifact Summary

Uses analogy and mental models to build intuition about Canvas Painting Coordinates — maps familiar concepts to the technical mechanics of Bounding Boxes and Coordinate Systems, making abstract ideas concrete.

## Required Contract Fields

### objective

Provide an analogy based on relative coordinates on a canvas.

### explanation

Imagine giving directions to someone on a canvas. You can say 'start at pixel 100, 100 and draw a square 50 pixels wide' ($xywh$), or you can say 'draw a box from coordinate (100, 100) to coordinate (150, 150)' ($xyxy$). Normalized coordinates are like saying 'start at 10% of the canvas width and end at 15% of the canvas width', ensuring your directions remain correct even if the canvas is resized.

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
