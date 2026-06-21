---
artifact_id: "artifact-linear-transformations-comparison-table"
artifact_title: "Standard Transformation Matrices"
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
authoritative_source: "Foundational Linear Transformations literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - linear transformation
  - matrix projection
  - scaling
  - rotation
  - shear
  - vector space mapping
tags:
  - learning-artifact
  - math
  - geometry
  - linear-algebra
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - scalars-vectors-matrices-tensors
  - dot-product-math
  - cosine-similarity-math
  - matrix-multiplication
  - linear-transformations
  - dimensionality-reduction
audience_notes: "Intended for AI engineers and computer science students."---

# Standard Transformation Matrices

## Artifact Summary

This artifact belongs to the Linear Transformations topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare matrices, determinants, and effects of scaling, rotation, shear, and projection.

### explanation

| Transformation Matrix | Determinant | Geometric Effect | AI Application |
|---|---|---|---|
| [[2, 0], [0, 2]] | 4 | Uniform Scaling (Expansion) | Feature scaling, layer normalization |
| [[cos(t), -sin(t)], [sin(t), cos(t)]] | 1 | Rotation | Rotary Position Embeddings (RoPE) |
| [[1, k], [0, 1]] | 1 | Shear | Space deformation |
| [[1, 0], [0, 0]] | 0 | Projection (collapses Y-axis) | Dimensionality reduction, bottleneck layers |

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Linear Transformations content pack.

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
