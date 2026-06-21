---
artifact_id: "artifact-non-maximum-suppression-exercise"
artifact_title: "Suppression Threshold Dynamics"
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
authoritative_source: "Foundational Non-Maximum Suppression (NMS) literature and scientific object detection papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - non-maximum suppression
  - NMS
  - post-processing
  - redundant detections
  - confidence score
tags:
  - learning-artifact
  - detection
  - nms
prerequisite_notes: "Basic mathematical and convolutional comfort."
related_topics:
  - object-detection-fundamentals
  - bounding-boxes-coordinates
  - intersection-over-union
  - anchor-based-vs-free
  - non-maximum-suppression
  - one-stage-vs-two-stage
audience_notes: "Intended for AI engineers and computer vision developers."---

# Suppression Threshold Dynamics

## Artifact Summary

This artifact belongs to the Non-Maximum Suppression (NMS) topic and serves as a Exercise.

## Required Contract Fields

### objective

Evaluate how IoU thresholds affect overlapping object detections.

### learner task

Explain the consequence of setting the NMS IoU threshold: 1. Extremely close to 0.0 (e.g., 0.05). 2. Extremely close to 1.0 (e.g., 0.99).

### expected learner output

1. IoU threshold at 0.05: Suppresses boxes that overlap even slightly, meaning close objects (like a flock of sheep) are incorrectly merged into a single detection. 2. IoU threshold at 0.99: Suppresses almost nothing, causing the model to output multiple redundant bounding boxes around a single object.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building autonomous vehicles, industrial inspections, robotic manipulators, and multi-object real-time surveillance backbones.

## Dependency Notes

This artifact is part of the Non-Maximum Suppression (NMS) content pack.

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
