---
artifact_id: "artifact-distance-metrics-exercise"
artifact_title: "Reasoning About Distance Metrics"
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
authoritative_source: "Foundational Distance Metrics literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - distance metrics
  - cosine similarity
  - euclidean distance
  - dot product
  - similarity metrics
tags:
  - learning-artifact
  - distance-metrics
  - vector-comparison
  - math
prerequisite_notes: "Comfortable with basic vector representations."
related_topics:
  - vector-spaces
  - distance-metrics
  - nearest-neighbor-search
  - vector-databases
  - rag-foundations
audience_notes: "Intended for AI engineers and computer science students."---

# Reasoning About Distance Metrics

## Artifact Summary

This artifact belongs to the Distance Metrics topic and serves as a Exercise.

## Required Contract Fields

### objective

Analyze vector pairs under different similarity metrics and explain how normalization affects results.

### learner task

You have Vector X (3, 4) and Vector Y (6, 8). Calculate if they are identical under Cosine Similarity. Then explain why they are not identical under Euclidean Distance.

### expected learner output

The learner should show that Vector Y is exactly twice Vector X (6/3 = 8/4 = 2). Because they point in the same direction, the angle is 0, so Cosine Similarity is 1.0. However, the straight line distance between points (3,4) and (6,8) is sqrt((6-3)^2 + (8-4)^2) = 5.0, so they are not identical under Euclidean Distance.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Distance Metrics content pack.

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
- [ ] Instructional objectives supported.
- [ ] Internal terminology consistent.
- [ ] Reuse suitability considered.
- [ ] Accessibility considerations documented where relevant.
- [ ] Does not introduce assessment logic.
- [ ] Does not claim Competency Evidence.
- [ ] Does not imply learner mastery.
