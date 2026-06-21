---
artifact_id: "artifact-cosine-similarity-math-explanatory-text"
artifact_title: "Cosine Similarity Mathematical Formulation"
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

# Cosine Similarity Mathematical Formulation

## Artifact Summary

This artifact belongs to the Cosine Similarity topic and serves as a Explanatory Text.

## Required Contract Fields

### objective

Explain the formula for cosine similarity and its vector magnitude normalization.

### explanation

Cosine Similarity measures the cosine of the angle between two non-zero vectors: Cosine(a, b) = (a . b) / (||a|| ||b||). It normalizes the dot product by dividing it by the product of the vector magnitudes. This forces the output range to be [-1, 1], making it invariant to vector length. In AI, this is critical because a long document and a short document containing the same keyword ratios will have a Cosine Similarity of 1.0, even though their raw dot product and Euclidean distance would differ significantly.

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
