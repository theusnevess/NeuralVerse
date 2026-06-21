---
artifact_id: "artifact-hallucination-evaluation-interactive-visualization"
artifact_title: "Hallucination Types Classifier Spec"
artifact_family: "Instruction Artifacts"
artifact_type: "Interactive Visualization"
canonical_status: "Draft"
instructional_objectives:
  - Interactive
learning_depths:
  - Level 1 — Intuition
  - Level 2 — Foundations
estimated_duration: "6-10 minutes"
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

# Hallucination Types Classifier Spec

## Artifact Summary

This artifact belongs to the Hallucination Detection and Analysis topic and serves as a Interactive Visualization.

## Required Contract Fields

### objective

Specify an interactive tool where users input a generated statement and reference context to classify each segment as grounded, contradictory, or unsupported.

### manipulable variable or observable state

The user provides a generated statement (e.g., "Einstein was born in 1879 in Ulm, Germany, and won the Nobel Prize in Chemistry") and a reference context (e.g., "Albert Einstein was born on 14 March 1879 in Ulm, Germany. He won the Nobel Prize in Physics in 1921."). The tool tokenizes the statement and highlights each segment: grounded text in green ("born in 1879 in Ulm, Germany"), contradictory text in red ("Nobel Prize in Chemistry" contradicts "Nobel Prize in Physics"), and unsupported text in yellow ("—" when no match exists). Users can modify either input and observe how classifications shift.

### interpretation guidance

Green segments indicate factual grounding — the claim is directly supported by the reference. Red segments indicate intrinsic hallucination — the model contradicts the source. Yellow segments indicate extrinsic hallucination — the claim is unverifiable from the source. Learners should notice that changing the reference context changes which segments are classified as grounded versus unsupported, and that a segment may shift from yellow to green when a broader reference is provided.

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
