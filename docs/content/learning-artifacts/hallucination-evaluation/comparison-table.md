---
artifact_id: "artifact-hallucination-evaluation-comparison-table"
artifact_title: "Intrinsic vs. Extrinsic Hallucination"
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

# Intrinsic vs. Extrinsic Hallucination

## Artifact Summary

This artifact belongs to the Hallucination Detection and Analysis topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare intrinsic hallucination, extrinsic hallucination, and faithful output across definition, relationship to source, detection approach, severity, and example.

### comparison subjects

Intrinsic hallucination, Extrinsic hallucination, Faithful output

### comparison criteria

Definition, Relationship to source, Detection approach, Severity, Example

### comparative takeaways

| Aspect | Intrinsic Hallucination | Extrinsic Hallucination | Faithful Output |
|---|---|---|---|
| **Definition** | Generated content that contradicts the source | Generated content that introduces unverifiable information not in the source | Generated content fully supported by the source |
| **Relationship to source** | Direct conflict with source claims | No conflict, but no support either — information is extra | Complete alignment with source claims |
| **Detection approach** | NLI contradiction detection, semantic similarity against source | Entailment gap analysis, knowledge base verification | NLI entailment confirmation |
| **Severity** | High — introduces factual errors that misrepresent known information | Medium — introduces plausible but unverified information that may mislead | None — output is factually consistent |
| **Example** | Source: "Revenue was $1M." Output: "Revenue was $10M." | Source: "Revenue was $1M." Output: "Revenue was $1M, driven by strong SaaS sales." | Source: "Revenue was $1M." Output: "Revenue was $1M." |

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
