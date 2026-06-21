---
artifact_id: "artifact-non-maximum-suppression-explanatory-text"
artifact_title: "Candidate Selection and Suppression Loops"
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

# Candidate Selection and Suppression Loops

## Artifact Summary

This artifact belongs to the Non-Maximum Suppression (NMS) topic and serves as a Explanatory Text.

## Required Contract Fields

### objective

Explain NMS steps, confidence sorting, and overlap suppression filters.

### explanation

Object detectors often produce multiple high-confidence bounding boxes around the exact same physical object. Non-Maximum Suppression (NMS) is a crucial post-processing step that filters these redundant candidates. The process is: 1. Sort all predicted boxes by their confidence scores. 2. Select the box with the highest score as the final detection. 3. Calculate IoU between this selected box and all remaining candidate boxes. 4. Discard any remaining box whose IoU exceeds a predefined threshold (e.g., 0.45), assuming it detects the same object. 5. Repeat the process for the remaining candidates.

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
