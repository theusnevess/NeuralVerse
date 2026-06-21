---
artifact_id: "artifact-embeddings-semantic-similarity-exercise"
artifact_title: "Reasoning About Semantic Similarity"
artifact_family: "Practice Artifacts"
artifact_type: "Exercise"
canonical_status: "Draft"

instructional_objectives:
  - Practice
  - Reflect
learning_depths:
  - Level 2 — Foundations
estimated_duration: "5-8 minutes"
supported_learning_levels:
  - Beginner

reuse_mode: ""
source_artifact: ""

dependencies:
  prerequisite:
    - artifact-embeddings-semantic-similarity-explanatory-text
  recommended_before: []
  recommended_after:
    - artifact-embeddings-semantic-similarity-visual-intuition
    - artifact-embeddings-semantic-similarity-interactive-visualization
  complementary:
    - artifact-embeddings-semantic-similarity-comparison-table
  alternative: []

authoritative_source: "Practice prompt grounded in introductory embedding and semantic similarity concepts."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear item labels and avoid requiring visual-only comparison."
keywords:
  - semantic similarity
  - practice
  - reasoning
tags:
  - learning-artifact
  - embeddings
  - exercise
prerequisite_notes: "Learners should understand that embeddings represent items as vectors that can be compared by similarity."
related_topics:
  - retrieval
  - recommendation
  - clustering
audience_notes: "Practice-only artifact for beginner learners."
---

# Reasoning About Semantic Similarity

## Artifact Summary

This practice artifact asks learners to reason about which items are likely to be semantically similar and to explain why exact wording is not always enough.

## Required Contract Fields

### objective

Help learners practice distinguishing exact word overlap from semantic relatedness.

### learner task

For each query, choose which candidate is likely to be more semantically similar and explain the reasoning in one or two sentences.

Query A:

```text
"find documents related to a research question"
```

Candidate 1:

```text
"retrieve relevant papers for an investigation"
```

Candidate 2:

```text
"sort image files by resolution"
```

Query B:

```text
"recommend articles about neural networks"
```

Candidate 1:

```text
"suggest readings on deep learning models"
```

Candidate 2:

```text
"calculate the storage size of a dataset"
```

Query C:

```text
"cluster similar customer reviews"
```

Candidate 1:

```text
"group feedback by shared themes"
```

Candidate 2:

```text
"translate a user interface into another language"
```

### expected learner output

The learner should identify the semantically closer candidate for each query and explain the decision using meaning, context, or task relationship rather than exact word overlap alone.

The expected reasoning pattern is:

* Candidate 1 for Query A is closer because both describe retrieving relevant research material.
* Candidate 1 for Query B is closer because both describe recommending learning material about neural network topics.
* Candidate 1 for Query C is closer because both describe grouping text items by shared meaning.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

Optional — use only when it improves clarity, accessibility, or instructional value.

### hints

Look for shared intent, task, and context. Do not rely only on repeated words.

### worked example

If "semantic search" and "meaning-based retrieval" appear together, they may be related even though they use different words.

### feedback guidance

If a learner chooses a candidate because it shares only one keyword, ask whether the candidate solves the same kind of problem as the query.

### difficulty note

This is an introductory reasoning exercise. It does not require calculating vector distances.

### references

Use source-grounded references when this artifact is promoted beyond draft status.

## Dependency Notes

This artifact should follow the explanatory text and can follow either the visual or interactive artifact.

## Reuse Notes

No reuse mode is asserted. Future lessons may adapt the prompt structure for retrieval, recommendation, or clustering examples.

## Accessibility Notes

The exercise is text-based and should remain usable without diagrams. If paired with visuals, provide text equivalents for any spatial relationships.

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
