---
artifact_id: "artifact-ai-for-scientific-discovery-exercise"
artifact_title: "Designing an AI-for-Science Pipeline"
artifact_family: "Practice Artifacts"
artifact_type: "Exercise"
canonical_status: "Draft"

instructional_objectives:
  - Practice
  - Analyze
  - Design
learning_depths:
  - Level 2 — Foundations
  - Level 3 — Advanced
estimated_duration: "15-20 minutes"
supported_learning_levels:
  - Intermediate
  - Advanced

reuse_mode: ""
source_artifact: ""

dependencies:
  prerequisite:
    - artifact-ai-for-scientific-discovery-explanatory-text
  recommended_before: []
  recommended_after:
    - artifact-ai-for-scientific-discovery-visual-intuition
    - artifact-ai-for-scientific-discovery-interactive-visualization
  complementary:
    - artifact-ai-for-scientific-discovery-comparison-table
  alternative: []

authoritative_source: "Design prompt grounded in AI-for-science pipeline concepts and real-world discovery challenges."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "All contexts are text-based and should remain usable without diagrams. If paired with visuals, provide text equivalents."
keywords:
  - pipeline design
  - AI for science
  - hypothesis generation
  - data sparsity
  - verification
tags:
  - learning-artifact
  - ai-for-science
  - exercise
prerequisite_notes: "Learners should understand the stages of AI-driven scientific discovery: hypothesis generation, experiment design, simulation, analysis, theory refinement."
related_topics:
  - materials discovery
  - genomics
  - mathematics
  - automated experimentation
audience_notes: "Practice-only artifact for intermediate to advanced learners."
---

# Designing an AI-for-Science Pipeline

## Artifact Summary

This practice artifact asks learners to design an AI-driven scientific discovery pipeline for three different contexts, reasoning about which stages benefit most from AI assistance and how verification challenges differ across domains.

## Required Contract Fields

### objective

Help learners practice translating domain-specific scientific problems into AI-for-science pipeline designs, reasoning about data sparsity, verification, and the appropriate role of human scientists.

### learner task

For each context below, provide a short written response addressing:
1. The stages of the discovery pipeline (literature analysis, hypothesis generation, experiment design, simulation, results analysis, theory refinement) and how AI would assist each.
2. Which stages benefit most from AI assistance and why.
3. How generated hypotheses or predictions will be verified experimentally or mathematically.
4. How data sparsity affects the design and what strategies mitigate it.

**Context A — Discovering new catalysts for chemical reactions.**

A research group wants to find catalysts for converting carbon dioxide into useful hydrocarbons. The space of possible catalyst materials is enormous (millions of compositions, structures, and surface configurations). Experimental testing is slow and expensive. Existing data is scattered across thousands of publications with inconsistent reporting standards.

**Context B — Identifying genetic markers associated with a rare disease.**

A medical research team investigates a rare genetic disease affecting fewer than one in a million people. The team has access to genomic data from approximately 200 patients and 500 controls. They want to identify candidate genetic markers, understand the biological mechanism, and propose potential therapeutic targets.

**Context C — Finding mathematical patterns in prime number distribution.**

A mathematician suspects there are undiscovered patterns in how prime numbers are distributed across certain intervals. The space of possible conjectures is combinatorially vast. Traditional number theory proofs are difficult and time-consuming. Computational exploration can generate data, but connecting empirical patterns to provable theorems requires deep mathematical insight.

### expected learner output

The learner should reason through the problem step by step, showing their work for each part. The expected output illustrates the reasoning format but not the complete solution.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### hints

- Think about what data already exists and what data the AI would need to generate.
- Consider whether the bottleneck is computation, experiment cost, or human insight.
- For each context, ask: can the AI propose something that is both novel and testable?

### worked example

For battery material discovery, a designed pipeline might: use NLP to extract electrode compositions from papers, train a surrogate to predict voltage and cycle life, run Bayesian optimization to select synthesis conditions, and validate top candidates electrochemically in the lab.

### feedback guidance

If a learner proposes AI that fully automates the discovery process without human verification, ask how the system would detect its own errors or whether unknown unknowns could propagate through the pipeline.

### difficulty note

This is a synthesis exercise. Learners should have already encountered the individual stages and challenges through the other artifacts.

### references

Use source-grounded references when this artifact is promoted beyond draft status.

## Dependency Notes

This artifact should follow the explanatory text and benefits from the visual and interactive artifacts that build intuition about pipeline stages and trade-offs.

## Reuse Notes

No reuse mode is asserted. Future lessons may adapt the context prompts for domain-specific AI-for-science modules in materials, biology, or mathematics.

## Accessibility Notes

The exercise is text-based and should remain usable without diagrams. If paired with visuals, provide text equivalents for any spatial or pipeline-flow relationships.

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
