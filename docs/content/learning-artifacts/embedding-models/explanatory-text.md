---
artifact_id: "artifact-embedding-models-explanatory-text"
artifact_title: "Embedding Model Architectures and Selection"
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
authoritative_source: "Foundational Embedding Models literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - embedding models
  - dense embeddings
  - sparse embeddings
  - fine-tuning
  - encoder models
tags:
  - learning-artifact
  - embeddings
  - encoder
  - models
prerequisite_notes: "Comfortable with basic vector representations."
related_topics:
  - chunking-strategies
  - embedding-models
  - query-expansion-reformulation
  - hybrid-search
  - reranking
  - context-window-management
audience_notes: "Intended for AI engineers and computer science students."---

# Embedding Model Architectures and Selection

## Artifact Summary

This artifact belongs to the Embedding Models topic and serves as a Explanatory Text.

## Required Contract Fields

### objective

Explain transformer-based embedding encoders and dense vs. sparse representations.

### explanation

Embedding models map raw data (like text) to dense vector spaces. Modern models are typically based on Transformer encoders (like BERT) trained with contrastive learning. The choice of model determines the dimensionality (e.g., 384, 768, 1536) and the context size. Embedding models can be: 1. Dense (capturing semantic themes but sometimes missing exact keywords). 2. Sparse (capturing exact word occurrences, like BM25 or SPLADE). When selecting a model, engineers consider MTEB leaderboard rankings, latency, memory usage, cost, and language support.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Embedding Models content pack.

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
