---
artifact_id: "artifact-dimensionality-reduction-comparison-table"
artifact_title: "Dimensionality Reduction Algorithms"
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
authoritative_source: "Foundational Dimensionality Reduction literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - dimensionality reduction
  - PCA
  - t-SNE
  - UMAP
  - variance
  - projections
tags:
  - learning-artifact
  - math
  - statistics
  - dimensionality-reduction
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - scalars-vectors-matrices-tensors
  - dot-product-math
  - cosine-similarity-math
  - matrix-multiplication
  - linear-transformations
  - dimensionality-reduction
audience_notes: "Intended for AI engineers and computer science students."---

# Dimensionality Reduction Algorithms

## Artifact Summary

Compares key approaches, algorithms, or architectures within Dimensionality Reduction — organizes Dimensionality Reduction Algorithms into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Compare PCA, t-SNE, and UMAP across properties, speed, and reversibility.

### explanation

| Method | Mathematical Type | Preserves | Computational Cost | Reversible? |
|---|---|---|---|---|
| PCA | Linear projection | Global variance | Very Low | Yes (using inverse transform) |
| t-SNE | Non-linear probabilistic | Local neighborhoods | High | No |
| UMAP | Non-linear manifold | Local & Global structure | Medium | No |

## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on these components working together — mastering them is key to building grounded, trustworthy generation systems.

## Dependency Notes

This artifact is part of the Dimensionality Reduction content pack.

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
