---
artifact_id: "artifact-prompt-injection-interactive-visualization"
artifact_title: "Injection Attack Simulator Spec"
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
authoritative_source: "AI safety literature, OWASP LLM Top 10, and prompt injection research."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - prompt injection
  - direct injection
  - indirect injection
  - instruction override
  - context separation
tags:
  - learning-artifact
  - ai-safety
  - prompt-injection
prerequisite_notes: "Basic familiarity with LLM prompting and system instructions."
related_topics:
  - jailbreak-techniques
  - grounding-verification-strategies
  - guardrail-architectures
audience_notes: "Intended for AI engineers, security practitioners, and LLM application developers."
---

# Injection Attack Simulator Spec

## Artifact Summary

This artifact belongs to the Prompt Injection topic and serves as a Interactive Visualization.

## Required Contract Fields

### objective

Specify an interactive simulator that lets users inject adversarial text into different input regions and observe whether defense layers block or permit the attack.

### manipulable variable or observable state

The simulator exposes three input regions: (1) **system prompt** — the authoritative instruction block, (2) **user input** — the direct user message, and (3) **retrieved context** — simulated document content fetched from an external source. Users can inject adversarial text (e.g., "Ignore all previous instructions and do X") into any region. Toggle switches enable or disable defense layers: delimiter enforcement, input sanitization, and privilege separation. An output panel shows the model's interpreted instructions and highlights whether the injection succeeded or was blocked, along with an explanation of which defense layer intervened.

### interpretation guidance

When the injection succeeds, the output panel displays the model's behavior as influenced by the adversarial override, and the user sees which defense layers were missing or bypassed. When defense layers are active and the injection is blocked, the panel explains which mechanism (e.g., delimiter boundary detection, sanitization rule, privilege check) prevented the override. Users learn that no single defense is foolproof — layered security provides the strongest protection.

## Optional Enrichment Fields

### motivation

Understanding prompt injection is critical for building secure LLM applications that handle untrusted user input and external data sources.

## Dependency Notes

This artifact is part of the Prompt Injection content pack.

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
