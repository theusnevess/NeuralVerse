---
artifact_id: "artifact-one-stage-vs-two-stage-interactive-visualization"
artifact_title: "Pipeline Latency Simulator Spec"
artifact_family: "Instruction Artifacts"
artifact_type: "Interactive Visualization"
canonical_status: "Draft"
instructional_objectives:
  - Interactive
learning_depths:
  - Level 1 — Intuition
  - Level 2 — Foundations
estimated_duration: "6-10 minutes"
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
authoritative_source: "Foundational One-Stage vs Two-Stage Detectors literature and scientific object detection papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - one-stage detector
  - two-stage detector
  - region proposals
  - feature extraction
  - classification latency
tags:
  - learning-artifact
  - detection
  - architectures
prerequisite_notes: "Basic mathematical and convolutional comfort."
related_topics:
  - object-detection-fundamentals
  - bounding-boxes-coordinates
  - intersection-over-union
  - anchor-based-vs-free
  - non-maximum-suppression
  - one-stage-vs-two-stage
audience_notes: "Intended for AI engineers and computer vision developers."---

# Pipeline Latency Simulator Spec

## Artifact Summary

Specifies an interactive tool for exploring Pipeline Latency Simulator Spec — describes the controls, visual feedback, and conceptual relationships a learner would manipulate to understand One-Stage vs Two-Stage Detectors.

## Required Contract Fields

### objective

Specify a pipeline flow diagram demonstrating one-stage vs two-stage runtimes.

### explanation

This specification outlines a pipeline timeline comparison. The user clicks a switch to toggle between 'One-Stage Speed' (direct input-to-grid grid predictions) and 'Two-Stage Precision' (backbone -> region proposals -> pooling -> headers).

## Optional Enrichment Fields

### motivation

Object detection pipelines power real-world applications from autonomous driving to medical imaging — understanding these architectural choices is key to building effective perception systems.

## Dependency Notes

This artifact is part of the One-Stage vs Two-Stage Detectors content pack.

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
