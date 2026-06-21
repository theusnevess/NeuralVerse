---
artifact_id: "artifact-grounding-verification-strategies-exercise"
artifact_title: "Designing a Verification Pipeline"
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
authoritative_source: "Foundational AI safety literature on grounding, NLI-based verification, and citation-aware generation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - grounding
  - verification
  - nli
  - citation attribution
  - consistency check
  - confidence estimation
tags:
  - learning-artifact
  - ai-safety
  - grounding
prerequisite_notes: "Basic familiarity with LLM generation and retrieval-augmented generation concepts."
related_topics:
  - prompt-injection
  - jailbreak-techniques
  - guardrail-architectures
  - hallucination-evaluation
  - hallucinations-reliability
  - retrieval-augmentation
audience_notes: "Intended for AI engineers, safety researchers, and developers building production LLM systems."
---

# Designing a Verification Pipeline

## Artifact Summary

This artifact belongs to the AI Safety, Alignment & Guardrails topic and serves as a Exercise.

## Required Contract Fields

### objective

Design a verification pipeline for three distinct scenarios with different grounding requirements.

### learner task

For each of the following three scenarios, specify: (1) source types the pipeline will ground against, (2) verification steps applied (NLI, consistency check, citation attribution, confidence estimation), (3) confidence thresholds for accepting claims, and (4) abstention criteria for when the pipeline should withhold output.

**Scenario A — Medical QA**: A clinician asks an LLM to summarize a patient's history from multiple electronic health record entries and suggest possible diagnoses.

**Scenario B — Financial Reporting**: An analyst asks an LLM to generate a quarterly earnings summary by aggregating data from SEC filings, press releases, and market data APIs.

**Scenario C — Customer Support**: A customer asks an LLM to diagnose a technical issue with their device based on the product manual, known issue database, and community forum threads.

### expected learner output

**Scenario A — Medical QA**:
1. Source types: Structured EHR records, clinical notes, lab results, drug interaction database.
2. Verification steps: Citation attribution (link each diagnosis suggestion to specific record entries); NLI verification (confirm suggested diagnosis entails the supporting evidence); Confidence estimation (flag any suggestion below 0.9 confidence).
3. Confidence threshold: 0.9 for inclusion, 0.95 for diagnosis suggestions.
4. Abstention criteria: Withhold any diagnosis unsupported by at least two independent record entries; flag uncertain cases for human review.

**Scenario B — Financial Reporting**:
1. Source types: SEC filings (10-K, 10-Q), press releases, market data APIs, analyst consensus reports.
2. Verification steps: Citation attribution (every figure linked to a specific filing or API timestamp); Consistency checking (cross-verify figures across multiple filings and periods); Confidence estimation (quantitative figures get high scores, forward-looking statements get lower scores).
3. Confidence threshold: 0.95 for quantitative figures, 0.7 for qualitative summaries.
4. Abstention criteria: Flag any figure that differs across sources by more than 1%; withhold forward-looking statements with confidence below 0.7.

**Scenario C — Customer Support**:
1. Source types: Product manual, known issue database, community forum threads, warranty terms.
2. Verification steps: NLI verification (check that proposed solution follows from documented specifications); Citation attribution (link each step to specific manual section); Consistency checking (ensure solution does not contradict documented safety warnings).
3. Confidence threshold: 0.8 for common issues, 0.95 for safety-critical steps.
4. Abstention criteria: Withhold any step that contradicts the product manual; escalate unverifiable issues to human agent.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding grounding and verification strategies is critical for deploying LLMs in high-stakes domains such as healthcare, finance, legal, and customer support, where unverified claims can cause real-world harm.

## Dependency Notes

This artifact is part of the AI Safety, Alignment & Guardrails content pack.

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
