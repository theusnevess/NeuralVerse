---
artifact_id: "artifact-automatic-evaluation-metrics-comparison-table"
artifact_title: "BLEU vs. ROUGE vs. METEOR vs. BERTScore"
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
authoritative_source: "Academic NLP evaluation literature and established benchmarking frameworks."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - BLEU
  - ROUGE
  - METEOR
  - BERTScore
  - n-gram overlap
tags:
  - learning-artifact
  - llm-evaluation
  - nlp-metrics
prerequisite_notes: "Basic familiarity with NLP tasks and LLM outputs."
related_topics:
  - human-evaluation
  - task-specific-benchmarking
  - hallucination-evaluation
audience_notes: "Intended for ML engineers, NLP practitioners, and AI evaluators."
---

# BLEU vs. ROUGE vs. METEOR vs. BERTScore

## Artifact Summary

This artifact belongs to the Automatic Evaluation Metrics topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast BLEU, ROUGE, METEOR, and BERTScore across type, measurement approach, score range, strengths, and weaknesses.

### comparison subjects

BLEU, ROUGE, METEOR, BERTScore.

### comparison criteria

Type, What it measures, Range, Strengths, Weaknesses.

### comparative takeaways

| Metric | Type | What It Measures | Range | Strengths | Weaknesses |
|---|---|---|---|---|---|
| **BLEU** | Precision-based n-gram overlap | Exact n-gram precision with brevity penalty | 0–1 (corpus); 0–1 (sentence, less reliable) | Simple, interpretable; correlates at corpus level; widely used in MT | Poor sentence-level correlation; ignores recall and meaning; penalizes valid paraphrases |
| **ROUGE** | Recall-based n-gram overlap | N-gram recall, longest common subsequence, skip-bigram co-occurrence | 0–1 | Captures content coverage; multiple variants for different granularities; standard for summarization | Does not penalize irrelevant extra content; no synonym handling |
| **METEOR** | Alignment-based with synonym matching | Precision-recall harmonic mean with synonym/stem matching and word-order penalty | 0–1 | Better sentence-level correlation than BLEU; handles synonyms and stems; explicit word-order penalty | Requires external lexical resources (WordNet); more complex implementation; language-dependent |
| **BERTScore** | Semantic embedding similarity | Token-level cosine similarity from contextual embeddings | -1–1 (typically 0–1) | Strong correlation with human judgment; captures paraphrases and semantic equivalence; reference-free variants | Computationally expensive; sensitive to embedding model choice; less interpretable |

## Optional Enrichment Fields

### motivation

A structured comparison helps practitioners quickly identify the appropriate metric for their evaluation task and understand trade-offs.

## Dependency Notes

This artifact is part of the Automatic Evaluation Metrics content pack.

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
