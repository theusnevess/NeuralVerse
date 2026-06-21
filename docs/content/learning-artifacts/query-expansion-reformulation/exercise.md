---
artifact_id: "artifact-query-expansion-reformulation-exercise"
artifact_title: "Reformulating Conversational Queries"
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
authoritative_source: "Foundational Query Expansion and Reformulation literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - query expansion
  - query reformulation
  - query translation
  - HyDE
  - sub-queries
tags:
  - learning-artifact
  - query-processing
  - retrieval
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

# Reformulating Conversational Queries

## Artifact Summary

This artifact belongs to the Query Expansion and Reformulation topic and serves as a Exercise.

## Required Contract Fields

### objective

Practice rewriting conversational search queries for database retrieval.

### learner task

A user is chatting with an assistant. They ask: 'What did they say?' after a previous turn about 'the new security policy'. Rewrite this query to be self-contained for a vector database search, and explain your reformulation rule.

### expected learner output

The learner should reformulate the query to something like 'Summary of the new security policy'. They must explain that the pronouns ('What did they say?') must be resolved using conversational history context before querying the vector index.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Query Expansion and Reformulation content pack.

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
