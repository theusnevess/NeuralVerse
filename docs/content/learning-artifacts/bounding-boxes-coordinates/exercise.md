---
artifact_id: "artifact-bounding-boxes-coordinates-exercise"
artifact_title: "Relative Coordinate Conversions"
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

# Relative Coordinate Conversions

## Artifact Summary

Provides practice applying the concepts of Relative Coordinate Conversions — guides the learner through reasoning steps that reinforce understanding of Bounding Boxes and Coordinate Systems through active problem-solving.

## Required Contract Fields

### objective

Convert corner absolute pixel dimensions to normalized coordinates.

### learner task

Given an image of size $800 \times 600$ pixels, and an object bounding box with absolute coordinates $[200, 150, 400, 450]$ in $xyxy$ format. Convert this box into: 1. Normalized $xyxy$ coordinates. 2. Absolute $xywh$ coordinates.

### expected learner output

The learner should reason through the problem step by step, showing their work for each part. The expected output illustrates the reasoning format but not the complete solution.

This practice does not assign a score and does not certify mastery.

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
