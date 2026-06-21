---
artifact_id: "artifact-hallucination-evaluation-explanatory-text"
artifact_title: "Hallucination Detection and Analysis in LLMs"
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

# Hallucination Detection and Analysis in LLMs

## Artifact Summary

This artifact belongs to the Hallucination Detection and Analysis topic and serves as a Explanatory Text.

## Required Contract Fields

### objective

Explain types of hallucination (intrinsic and extrinsic), detection approaches (NLI-based classifiers, uncertainty estimation, self-consistency checks, retrieval-augmented verification), challenges (partial grounding, subtle factual errors, verifiability boundaries), and limitations of current detection methods.

### explanation

Hallucination in LLMs refers to generated content that is not faithful to the source data or real-world facts. Two primary categories exist. **Intrinsic hallucination** occurs when the output directly contradicts the provided source context — for example, a summarization model stating "the revenue was $10M" when the source says "$1M." **Extrinsic hallucination** occurs when the output introduces information that is neither supported nor contradicted by the source — for example, adding plausible-sounding details that have no basis in the input.

Detection approaches fall into several categories. **NLI-based classifiers** treat hallucination detection as a natural language inference task, where a model determines whether the generated statement is entailed by, contradicted by, or neutral with respect to the source. **Uncertainty estimation** methods leverage token-level log probabilities or entropy to flag low-confidence generations that are more likely to hallucinate. **Self-consistency checks** sample multiple responses and measure agreement — divergent answers suggest hallucination risk. **Retrieval-augmented verification** queries external knowledge bases to fact-check generated claims against authoritative sources.

Key challenges persist. Partial grounding makes it difficult to determine whether a statement is truly supported or only appears plausible. Subtle factual errors — such as incorrect dates, names, or numerical values — evade surface-level detection. Verifiability boundaries arise when claims cannot be confirmed or refuted due to knowledge cutoffs or missing sources. Current detection methods also face trade-offs between precision and recall, and many approaches struggle with domain-specific or rare factual content.

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
