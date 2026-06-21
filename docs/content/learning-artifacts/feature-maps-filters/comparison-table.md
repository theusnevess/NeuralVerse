---
artifact_id: "artifact-feature-maps-filters-comparison-table"
artifact_title: "Edge Detector vs. Blur Filter"
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
authoritative_source: "Foundational Feature Maps and Filters literature and scientific CV documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - feature maps
  - filters
  - edge detection
  - Sobel filter
  - activations
  - channels
tags:
  - learning-artifact
  - cv
  - filters
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - pixel-representation
  - color-spaces
  - resolution-sampling-resizing
  - convolution-intuition
  - feature-maps-filters
  - classical-vs-deep-vision
audience_notes: "Intended for AI engineers and computer science students."---

# Edge Detector vs. Blur Filter

## Artifact Summary

This artifact belongs to the Feature Maps and Filters topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare Sobel vertical and average blur kernel structures, feature maps, and applications.

### explanation

| Filter Type | Kernel Structure | Extracted Feature Map | AI Application |
|---|---|---|---|
| Sobel Vertical | Left negative, right positive weights | Vertical edges/gradients | Initial CNN layers, boundary detection |
| Average Blur | Uniform positive weights summing to 1 | Blurry, low-frequency details | Noise reduction, downsampling prep |

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale computer vision and multimodal retrieval pipelines.

## Dependency Notes

This artifact is part of the Feature Maps and Filters content pack.

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
