---
artifact_id: "artifact-segmentation-masks-labels-comparison-table"
artifact_title: "Mask Representations Compared"
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
authoritative_source: "Foundational Segmentation Masks and Label Maps literature and scientific segmentation papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - segmentation masks
  - label maps
  - one-hot masks
  - class indexes
  - color maps
tags:
  - learning-artifact
  - segmentation
  - masks
prerequisite_notes: "Basic mathematical and CNN segmentation comfort."
related_topics:
  - semantic-segmentation-fundamentals
  - instance-segmentation-fundamentals
  - pixel-wise-classification
  - segmentation-masks-labels
  - encoder-decoder-segmentation
  - unet-vs-maskrcnn
audience_notes: "Intended for AI engineers and computer vision developers."---

# Mask Representations Compared

## Artifact Summary

This artifact belongs to the Segmentation Masks and Label Maps topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast shape dimensions, value types, and usage for labels, one-hot, and colors.

### explanation

| Data Structure | Shape | Values | Main Purpose |
|---|---|---|---|
| Label Map | $H \times W$ | Integer indices $[0, C-1]$ | Storage, ground truth annotations |
| One-Hot Mask | $H \times W \times C$ | Binary values $\{0, 1\}$ | Direct loss computation inputs |
| Visual Mask | $H \times W \times 3$ | RGB color codes $[0, 255]$ | Human-in-the-loop inspection |

## Optional Enrichment Fields

### motivation

Understanding segmentation is critical for building medical scanners, self-driving cars, satellite crop trackers, and human-in-the-loop image editors.

## Dependency Notes

This artifact is part of the Segmentation Masks and Label Maps content pack.

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
