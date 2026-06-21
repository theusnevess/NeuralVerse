---
artifact_id: "artifact-prompt-injection-visual-intuition"
artifact_title: "The Impersonator at the Gate"
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

# The Impersonator at the Gate

## Artifact Summary

Uses analogy and mental models to build intuition about The Impersonator at the Gate — maps familiar concepts to the technical mechanics of Prompt Injection, making abstract ideas concrete.

## Required Contract Fields

### objective

Provide an analogy representing prompt injection attacks using the metaphor of a secure facility with access control.

### visual focus

The mental model of a security guard (system prompt) checking badges at a secure facility entrance. Different personnel have distinct badge colors corresponding to clearance levels.

### interpretation guidance

Consider a security guard stationed at the entrance of a secure facility. The guard's orders (system prompt) dictate who may enter and what areas they can access. A visitor (user input) tries to impersonate a VIP to override the rules — this is **direct injection**, where the attacker's input claims a privileged identity to bypass the guard's instructions. Separately, a contractor (retrieved document) brings forged credentials that appear legitimate and fool the guard into granting unauthorized access — this is **indirect injection**, where adversarial content is embedded in trusted-looking external material. Proper access control requires separate badges for different clearance levels (context separation), rigorous verification of credentials (input sanitization), and clear boundaries between different personnel categories (instruction boundaries).

## Optional Enrichment Fields

### motivation

Safe and aligned AI deployment requires understanding these failure modes and defense mechanisms — they are essential for trustworthy production systems.

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
