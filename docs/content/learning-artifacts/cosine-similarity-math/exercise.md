---
artifact_id: "artifact-cosine-similarity-math-exercise"
artifact_title: "Proving Cosine Length Invariance"
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
authoritative_source: "Foundational Cosine Similarity literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - cosine similarity
  - normalization
  - angular distance
  - unit vectors
tags:
  - learning-artifact
  - math
  - geometry
  - similarity
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - scalars-vectors-matrices-tensors
  - dot-product-math
  - cosine-similarity-math
  - matrix-multiplication
  - linear-transformations
  - dimensionality-reduction
audience_notes: "Intended for AI engineers and computer science students."---

# Proving Cosine Length Invariance

## Artifact Summary

This artifact belongs to the Cosine Similarity topic and serves as a Exercise.

## Required Contract Fields

### objective

Perform calculations proving length scale invariance for parallel vectors.

### learner task

Vector X is [1, 2] and Vector Y is [10, 20]. Prove mathematically that their cosine similarity is 1.0, demonstrating length invariance.

### expected learner output

||X|| = sqrt(1^2 + 2^2) = sqrt(5). ||Y|| = sqrt(10^2 + 20^2) = sqrt(500) = 10*sqrt(5). Dot product X . Y = (1 * 10) + (2 * 20) = 50. Cosine(X, Y) = 50 / (sqrt(5) * 10*sqrt(5)) = 50 / (10 * 5) = 50 / 50 = 1.0. This proves their cosine similarity is 1.0 despite the scale differences.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Cosine Similarity content pack.

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
