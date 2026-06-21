---
artifact_id: "artifact-non-maximum-suppression-comparison-table"
artifact_title: "NMS Threshold Behaviors"
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

# NMS Threshold Behaviors

## Artifact Summary

Compares key approaches, algorithms, or architectures within Non-Maximum Suppression (NMS) — organizes NMS Threshold Behaviors into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast confidence score and IoU suppression thresholds across behaviors and effects.

### explanation

| NMS Parameter | Configuration Range | High Value Effect | Low Value Effect |
|---|---|---|---|
| Confidence Score Threshold | $[0.0, 1.0]$ | Filters out weak, noisy boxes | Preserves low-confidence candidates |
| IoU Suppression Threshold | $[0.0, 1.0]$ | Suppresses less; keeps tight overlaps | Suppresses aggressively; merges objects |

## Optional Enrichment Fields

### motivation

Object detection pipelines power real-world applications from autonomous driving to medical imaging — understanding these architectural choices is key to building effective perception systems.

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
