---
artifact_id: "artifact-hallucination-evaluation-visual-intuition"
artifact_title: "The Detective and the Witness"
artifact_family: "Instruction Artifacts"
artifact_type: "Visual Intuition"
canonical_status: "Draft"
instructional_objectives:
  - Visual
learning_depths:
  - Level 1 — Intuition
  - Level 2 — Foundations
estimated_duration: "4-6 minutes"
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

# The Detective and the Witness

## Artifact Summary

Uses analogy and mental models to build intuition about The Detective and the Witness — maps familiar concepts to the technical mechanics of Hallucination Detection and Analysis, making abstract ideas concrete.

## Required Contract Fields

### objective

Provide an analogy representing hallucination types through a detective cross-referencing a witness's testimony against evidence.

### visual focus

A detective stands before an evidence board. The witness makes three types of claims: some match the evidence exactly (green highlight — faithful generation), some directly contradict the evidence (red highlight — intrinsic hallucination), and some describe details that are not covered by any evidence on the board (yellow highlight — extrinsic hallucination).

### interpretation guidance

The detective's process mirrors hallucination detection. When a claim matches the evidence, it is grounded and trustworthy. When it contradicts the evidence, it is an intrinsic hallucination — the model is generating against known facts. When the claim goes beyond the available evidence, it is an extrinsic hallucination — the model is introducing unverifiable information. Learners should understand that absence of contradiction does not imply factual correctness; claims may simply be unverifiable within the available context.

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
