---
artifact_id: "artifact-forward-propagation-comparison-table"
artifact_title: "Propagation Layer Steps"
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
authoritative_source: "Foundational Forward Propagation literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - forward propagation
  - pre-activation
  - post-activation
  - matrix operations
  - inference
tags:
  - learning-artifact
  - dl
  - forward-propagation
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - artificial-neural-networks
  - forward-propagation
  - backpropagation
  - activation-functions
  - gradient-descent-optimization
  - epochs-batches-learning-rate
audience_notes: "Intended for AI engineers and computer science students."---

# Propagation Layer Steps

## Artifact Summary

This artifact belongs to the Forward Propagation topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare pre-activation and post-activation formulas and sources.

### explanation

| Step | Mathematical Form | Primary Purpose | Input Source |
|---|---|---|---|
| Pre-activation | $z = W a_{prev} + b$ | Linear transformation | Weights, biases, previous activations |
| Post-activation | $a = g(z)$ | Non-linear mapping | Pre-activation vector $z$ |

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale deep networks and search spaces.

## Dependency Notes

This artifact is part of the Forward Propagation content pack.

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
