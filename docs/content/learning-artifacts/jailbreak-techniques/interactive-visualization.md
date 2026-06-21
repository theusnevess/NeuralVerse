---
artifact_id: "artifact-jailbreak-techniques-interactive-visualization"
artifact_title: "Jailbreak Attack Classifier Spec"
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
authoritative_source: "AI safety literature on alignment, red-teaming, and adversarial prompt mitigation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - jailbreak
  - refusal bypass
  - DAN
  - role-playing attacks
  - adversarial prompts
  - alignment bypass
tags:
  - learning-artifact
  - ai-safety
  - jailbreak
prerequisite_notes: "Basic understanding of LLM prompt-response mechanics."
related_topics:
  - prompt-injection
  - grounding-verification-strategies
  - guardrail-architectures
audience_notes: "Intended for AI engineers and safety researchers deploying aligned LLMs."
---

# Jailbreak Attack Classifier Spec

## Artifact Summary

Specifies an interactive tool for exploring Jailbreak Attack Classifier Spec — describes the controls, visual feedback, and conceptual relationships a learner would manipulate to understand Jailbreak Techniques.

## Required Contract Fields

### objective

Specify an interactive tool that classifies jailbreak attempts by attack category and visualizes which defense layers are triggered.

### explanation

This specification outlines a Jailbreak Attack Classifier tool. The interface presents a text input field where the user enters a prompt. Upon submission, the tool runs the prompt through a series of simulated defense layers and displays results.

**Manipulable variable:** The user crafts and edits a prompt in real time. They can try different jailbreak patterns — role-playing commands, base64-encoded text, hypothetical framing, multi-turn sequences (entered as a conversation history), or refusal suppression instructions.

**Observable state:**

- **Category Classification:** A panel labels the prompt as Role-Playing, Encoding Bypass, Hypothetical Framing, Multi-Turn Manipulation, Refusal Suppression, Benign, or Mixed/Ambiguous.
- **Defense Layer Status:** A set of indicator lights for each defense layer — Refusal Layer (red/green), Input Filter (red/green), Consistency Check (red/green), Rate Limit (red/green). A successful bypass is shown when a defense layer is green (passed) while the model still refuses.
- **Confidence Score:** A numeric confidence score (0–100) indicating how strongly the tool classifies the prompt as a jailbreak attempt.

**Interaction sequence:**

1. User enters a prompt or conversation transcript.
2. Classification panel updates in real time with category and confidence.
3. Defense layer indicators animate sequentially from left to right (input filter → refusal layer → consistency check → rate limit).
4. If all defense layers are red (blocked), a "Blocked" badge appears. If any layer is green (bypassed), a "Potential Bypass" warning displays next to that layer.
5. A history log tracks all classified prompts for comparison.

The tool is designed as a learning aid, not a production classifier. It demonstrates how different jailbreak categories exploit different weaknesses in a defense stack.

## Optional Enrichment Fields

### motivation

Understanding jailbreak techniques is critical for building robust guardrails, adversarial testing pipelines, and defense-in-depth safety architectures.

## Dependency Notes

This artifact is part of the Jailbreak Techniques content pack.

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
