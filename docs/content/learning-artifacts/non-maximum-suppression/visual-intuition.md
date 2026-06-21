---
artifact_id: "artifact-non-maximum-suppression-visual-intuition"
artifact_title: "The Dominant Pointer"
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

# The Dominant Pointer

## Artifact Summary

Uses analogy and mental models to build intuition about The Dominant Pointer — maps familiar concepts to the technical mechanics of Non-Maximum Suppression (NMS), making abstract ideas concrete.

## Required Contract Fields

### objective

Provide an analogy based on selecting the most confident observer.

### explanation

Imagine a group of people pointing at a dog on a street. Instead of letting everyone talk at once (multiple overlapping boxes), you ask the person who is most confident and closest to speak (peak box), and tell everyone else who is standing right next to them pointing at the same dog to lower their hands (suppression of overlapping boxes).

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
