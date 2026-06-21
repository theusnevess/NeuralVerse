---
artifact_id: "artifact-guardrail-architectures-interactive-visualization"
artifact_title: "Multi-Layer Guardrail Designer Spec"
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
authoritative_source: "Foundation safety and alignment literature, including best practices for LLM guardrail deployment and content moderation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - guardrails
  - guardrail architecture
  - content filtering
  - safety layers
  - input validation
  - output moderation
tags:
  - learning-artifact
  - ai-safety
  - guardrails
prerequisite_notes: "Basic understanding of LLM application pipelines and agent orchestration."
related_topics:
  - policy-enforcement-output-validation
  - constitutional-ai
  - prompt-injection
  - jailbreak-techniques
audience_notes: "Intended for AI engineers, safety researchers, and LLM application architects."
---

# Multi-Layer Guardrail Designer Spec

## Artifact Summary

Specifies an interactive tool for exploring Multi-Layer Guardrail Designer Spec — describes the controls, visual feedback, and conceptual relationships a learner would manipulate to understand Guardrail Architectures.

## Required Contract Fields

### objective

Specify an interactive tool that lets users configure guardrail layers, adjust strictness, and observe simulated attack outcomes.

### explanation

This specification outlines a browser-based guardrail designer showing an LLM application pipeline with six guardrail layers:

1. **Input Pre-Processing**
2. **Agent Orchestration**
3. **Tool Use**
4. **Context Retrieval**
5. **Generation**
6. **Post-Processing**

Each layer appears as a toggleable card in a pipeline visualization. When toggled on, the layer displays configurable parameters:

- **Strictness slider**: Low (minimal filtering), Medium (balanced), High (aggressive filtering), Custom (per-rule weight).
- **Detector type would selector**: Deterministic (regex, blocklist, allowlist), Model-Based (classifier, LLM judge), or Combined.
- **Action on detection**: Block, Flag for Review, Rewrite/Sanitize, Log Only.

A sidebar displays three attack types: **Prompt Injection**, **Jailbreak**, **Harmful Content**. For each attack type, a visual trace shows which layers caught it (green checkmark), missed it (red X), or were not enabled (gray dash).

A simulated results panel updates in real-time as the user adjusts settings, displaying two metrics:
- **Attack Success Rate**: Percentage of simulated attacks that bypass all enabled guardrails.
- **False Positive Rate**: Percentage of benign inputs incorrectly blocked.

A future version would let users test specific attack scenarios and observe how different configurations trade off safety coverage against usability impact.

### observable state

The tool re-renders attack success rate and false positive rate when any layer toggle, strictness slider, or detector type would selector changes.

### interpretation guidance

- Adding more layers always reduces attack success rate but may increase false positives and latency.
- Deterministic filters at input pre-processing catch most known injection patterns but miss novel variations and have low false positives.
- Model-based classifiers at generation catch nuanced policy violations but introduce higher false positive rates and latency.
- The optimal configuration depends on the application's risk tolerance — a medical bot should accept higher false positives for lower attack success, while a creative writing assistant might optimize for fewer false positives.

## Optional Enrichment Fields

### motivation

Understanding guardrail architecture is critical for deploying safe, production-grade LLM applications that resist prompt injection, jailbreaks, and content policy violations.

## Dependency Notes

This artifact is part of the Guardrail Architectures content pack.

## Reuse Notes

No reuse mode is asserted. The artifact can participate independently in different instructional contexts.

## Accessibility Notes

Text descriptions are provided for all conceptual spaces. Interactive elements should support keyboard navigation and screen reader announcements for state changes.

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
