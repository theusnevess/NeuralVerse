---
artifact_id: "artifact-chunking-strategies-exercise"
artifact_title: "Designing Chunking Configurations"
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
authoritative_source: "Foundational Chunking Strategies literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - chunking
  - text splitting
  - overlap
  - character splitter
  - semantic chunking
tags:
  - learning-artifact
  - chunking
  - data-ingestion
  - rag
prerequisite_notes: "Comfortable with basic vector representations."
related_topics:
  - chunking-strategies
  - embedding-models
  - query-expansion-reformulation
  - hybrid-search
  - reranking
  - context-window-management
audience_notes: "Intended for AI engineers and computer science students."---

# Designing Chunking Configurations

## Artifact Summary

This artifact belongs to the Chunking Strategies topic and serves as a Exercise.

## Required Contract Fields

### objective

Practice selecting and justifying chunk size and overlap parameters for unstructured text.

### learner task

Given a document containing a list of recipes and their histories, select a chunking strategy that keeps each recipe whole while separating them from the historical text. Explain your choice of strategy, chunk size, and overlap.

### expected learner output

The learner should choose recursive character chunking or semantic chunking. They must justify a chunk size large enough to cover single recipes (e.g., 500-1000 tokens) with a moderate overlap (e.g., 100 tokens) to preserve transition contexts, demonstrating understanding of boundary preservation.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Chunking Strategies content pack.

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
- [ ] Maintainability reviewed.
- [ ] Does not introduce assessment logic.
- [ ] Does not claim Competency Evidence.
- [ ] Does not imply learner mastery.
