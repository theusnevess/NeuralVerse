---
artifact_id: "artifact-one-stage-vs-two-stage-exercise"
artifact_title: "Real-Time Latency Trade-Offs"
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

# Real-Time Latency Trade-Offs

## Artifact Summary

This artifact belongs to the One-Stage vs Two-Stage Detectors topic and serves as a Exercise.

## Required Contract Fields

### objective

Analyze latency constraints to select detector types for safety tasks.

### learner task

In an autonomous vehicle detection system, identify which detector category (one-stage vs. two-stage) is more suitable, explaining why in terms of speed, latency, and safety constraints.

### expected learner output

One-stage detectors (like YOLO) are more suitable. Autonomous driving requires real-time processing (e.g., > 30 FPS) and extremely low latency to react to obstacles. Two-stage detectors generate region proposals sequentially, adding unacceptable latency that violates safety limits.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building autonomous vehicles, industrial inspections, robotic manipulators, and multi-object real-time surveillance backbones.

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
