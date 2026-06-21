---
artifact_id: "artifact-scalars-vectors-matrices-tensors-exercise"
artifact_title: "Determining Tensor Shapes"
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
authoritative_source: "Foundational Scalars, Vectors, Matrices, and Tensors literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - scalar
  - vector
  - matrix
  - tensor
  - dimensions
  - arrays
tags:
  - learning-artifact
  - math
  - linear-algebra
  - data-structures
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - scalars-vectors-matrices-tensors
  - dot-product-math
  - cosine-similarity-math
  - matrix-multiplication
  - linear-transformations
  - dimensionality-reduction
audience_notes: "Intended for AI engineers and computer science students."---

# Determining Tensor Shapes

## Artifact Summary

This artifact belongs to the Scalars, Vectors, Matrices, and Tensors topic and serves as a Exercise.

## Required Contract Fields

### objective

Analyze dataset configurations and determine target tensor ranks and shapes.

### learner task

An image dataset contains 100 grayscale images, each of size 28x28 pixels. Describe the rank and shape of the tensor required to store this entire dataset. If we switch to RGB color images, how does the tensor shape change?

### expected learner output

For grayscale images, the tensor rank is 3, with shape [100, 28, 28] representing (batch_size, height, width). For RGB color images, the rank increases to 4, with shape [100, 3, 28, 28] or [100, 28, 28, 3] to accommodate the color channels.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Scalars, Vectors, Matrices, and Tensors content pack.

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
