---
artifact_id: "artifact-guardrail-architectures-visual-intuition"
artifact_title: "The Fortress with Multiple Walls"
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

# The Fortress with Multiple Walls

## Artifact Summary

This artifact belongs to the Guardrail Architectures topic and serves as a Visual Intuition.

## Required Contract Fields

### objective

Use a medieval fortress analogy to build a mental model of layered guardrail defenses.

### explanation

Imagine a medieval fortress protecting a kingdom. The fortress does not rely on a single wall — it has multiple defensive layers, each with a distinct purpose.

**Outer Wall — Input Guardrails**: Travelers arriving at the outer gate are searched for concealed weapons, checked against wanted lists, and inspected for forged documents. This corresponds to input pre-processing: sanitizing prompts, detecting PII, classifying toxicity, and catching injection attempts before anyone enters.

**Inner Courtyard — Agent Orchestration Guardrails**: Inside the outer wall, the courtyard is patrolled by guards who monitor activity, ensure visitors follow designated paths, and prevent anyone from accessing restricted areas. This represents agent orchestration guardrails: plan validation, tool call verification, and context boundary enforcement.

**Armory — Tool Use Guardrails**: The armory controls access to weapons and siege equipment. Only authorized personnel may draw weapons, and all equipment is inspected before and after use. This maps to tool use guardrails: parameter validation, output sanitization, and tool access control.

**Library — Context Retrieval Guardrails**: Scribes in the library examine every scroll brought in, checking for forged seals, verifying the source's credibility, and rejecting damaged or illegible texts. This represents context retrieval guardrails: document filtering, relevance scoring, and source trust level checks.

**Scribe's Chamber — Generation Guardrails**: Before a message is sent from the fortress, a scribe reviews it to ensure it contains no sensitive information, does not violate the kingdom's laws, and accurately represents the facts. This corresponds to generation guardrails: refusal enforcement, content policy classifiers, and factual consistency checks.

**Final Gate — Post-Processing Guardrails**: All outgoing shipments pass through the final gate, where they are inspected one last time. Packages are checked against manifests, inspected for contraband, and sealed with the kingdom's official mark. This represents post-processing guardrails: output moderation, format validation, and policy enforcement.

The strength of the fortress lies in its layered design. If an attacker slips past the outer wall, inner defenses still stand. A weakness in one layer does not compromise the whole. This is the same principle behind defense-in-depth for guardrail architectures.

## Optional Enrichment Fields

### motivation

Understanding guardrail architecture is critical for deploying safe, production-grade LLM applications that resist prompt injection, jailbreaks, and content policy violations.

## Dependency Notes

This artifact is part of the Guardrail Architectures content pack.

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
