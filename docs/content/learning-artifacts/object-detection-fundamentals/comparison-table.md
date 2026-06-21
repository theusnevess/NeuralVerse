---
artifact_id: "artifact-object-detection-fundamentals-comparison-table"
artifact_title: "Classification vs. Detection Tasks"
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
authoritative_source: "Foundational Object Detection Fundamentals literature and scientific object detection papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - object detection
  - localization
  - classification
  - regression
  - multi-task loss
tags:
  - learning-artifact
  - detection
  - fundamentals
prerequisite_notes: "Basic mathematical and convolutional comfort."
related_topics:
  - object-detection-fundamentals
  - bounding-boxes-coordinates
  - intersection-over-union
  - anchor-based-vs-free
  - non-maximum-suppression
  - one-stage-vs-two-stage
audience_notes: "Intended for AI engineers and computer vision developers."---

# Classification vs. Detection Tasks

## Artifact Summary

Compares key approaches, algorithms, or architectures within Object Detection Fundamentals — organizes Classification vs. Detection Tasks into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast targets, coordinate outputs, and losses between classification and detection.

### explanation

| Task Type | Output Target | Spatial Coordinate Prediction | Loss Function Configuration |
|---|---|---|---|
| Image Classification | Class index probability | No | Single Classification Loss (Cross-Entropy) |
| Object Detection | Class index + Box Coordinates | Yes (x, y, w, h) | Multi-task Loss (Classification + Localization) |

## Optional Enrichment Fields

### motivation

Object detection pipelines power real-world applications from autonomous driving to medical imaging — understanding these architectural choices is key to building effective perception systems.

## Dependency Notes

This artifact is part of the Object Detection Fundamentals content pack.

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
