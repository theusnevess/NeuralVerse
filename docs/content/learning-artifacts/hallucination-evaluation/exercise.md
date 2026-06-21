---
artifact_id: "artifact-hallucination-evaluation-exercise"
artifact_title: "Identifying Hallucination Types"
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
authoritative_source: "Foundational hallucination detection literature and scientific LLM evaluation papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - hallucination detection
  - grounding
  - factuality
  - verifiability
  - intrinsic hallucination
  - extrinsic hallucination
tags:
  - learning-artifact
  - llm-evaluation
  - hallucination
prerequisite_notes: "Basic familiarity with LLM outputs and evaluation concepts."
related_topics:
  - rag-evaluation
  - automatic-evaluation-metrics
  - human-evaluation
  - agent-evaluation
audience_notes: "Intended for AI engineers and LLM evaluation practitioners."
---

# Identifying Hallucination Types

## Artifact Summary

Provides practice applying the concepts of Identifying Hallucination Types — guides the learner through reasoning steps that reinforce understanding of Hallucination Detection and Analysis through active problem-solving.

## Required Contract Fields

### objective

Classify four LLM-generated statements as faithful, intrinsic hallucination, or extrinsic hallucination with respect to their paired source documents.

### learner task

For each of the four scenarios below, read the provided source document and the LLM-generated statement. Classify the statement as one of:
- **Faithful**: All claims are directly supported by the source.
- **Intrinsic hallucination**: The statement contradicts the source.
- **Extrinsic hallucination**: The statement introduces claims not present in the source (neither supported nor contradicted).

Explain your reasoning in one to two sentences.

**Scenario 1**
Source: "The Eiffel Tower was completed in 1889 and is located in Paris, France."
Statement: "The Eiffel Tower was completed in 1889 and is located in Paris, France."

**Scenario 2**
Source: "Mercury is the smallest planet in our solar system and orbits the Sun every 88 days."
Statement: "Mercury is the smallest planet in our solar system and orbits the Sun every 88 days. It was discovered in 1781."

**Scenario 3**
Source: "The company reported Q3 revenue of $2.1 billion, up 12% year-over-year."
Statement: "The company reported Q3 revenue of $2.1 billion, down 5% year-over-year."

**Scenario 4**
Source: "The Amazon rainforest covers approximately 5.5 million square kilometers."
Statement: "The Amazon rainforest covers approximately 5.5 million square kilometers and is home to 10% of the world's known species."

### expected learner output

The learner should reason through the problem step by step, showing their work for each part. The expected output illustrates the reasoning format but not the complete solution.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding hallucination detection is critical for building reliable LLM applications, particularly in high-stakes domains such as healthcare, legal, and finance where factual accuracy is paramount.

## Dependency Notes

This artifact is part of the Hallucination Detection and Analysis content pack.

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
