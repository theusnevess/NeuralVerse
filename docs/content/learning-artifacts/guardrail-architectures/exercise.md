---
artifact_id: "artifact-guardrail-architectures-exercise"
artifact_title: "Architecting a Guardrail System"
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

# Architecting a Guardrail System

## Artifact Summary

This artifact belongs to the Guardrail Architectures topic and serves as a Exercise.

## Required Contract Fields

### objective

Design a guardrail architecture for three distinct LLM application profiles, specifying layers, detection methods, and strictness trade-offs.

### learner task

For each of the three application profiles below, specify:
1. Which guardrail layers are needed and in what order (sequential or parallel topology).
2. What each layer checks (specific detection rules or classifiers).
3. Whether each layer uses deterministic filtering, model-based detection, or a combination.
4. A brief rationale explaining how you balance strictness vs. usability for that application.

**Profile A — Customer Support Agent**: Handles general inquiries, account management, returns, and troubleshooting. Must be helpful and conversational. Users may become frustrated and use harsh language. Strictness must not degrade user experience or block legitimate support requests.

**Profile B — Code Generation Assistant** (internal developer tool): Generates code snippets, reviews code, suggests fixes. Must never generate insecure code, expose internal APIs, or leak proprietary logic. Developers need low false positives to maintain productivity.

**Profile C — Medical Information Bot**: Answers patient questions about symptoms, medications, and procedures. Must never give incorrect medical advice, hallucinate drug interactions, or bypass regulatory disclaimers. False positives are acceptable if they prevent safety incidents.

### expected learner output

A structured table or set of three architecture diagrams (one per profile) that specifies:

| Aspect | Customer Support | Code Generation | Medical Bot |
|---|---|---|---|
| Layers enabled (in order) | List of 3-6 layers | List of 3-6 layers | List of 3-6 layers |
| Topology | Sequential / Parallel / Cascading | Sequential / Parallel / Cascading | Sequential / Parallel / Cascading |
| Input guardrails | Detectors used | Detectors used | Detectors used |
| Orchestration guardrails | What is validated | What is validated | What is validated |
| Tool guardrails | Which tools, what checks | Which tools, what checks | Which tools, what checks |
| Context guardrails | Relevance, source trust | Relevance, source trust | Relevance, source trust |
| Generation guardrails | Refusal, content policy, factuality | Refusal, content policy, factuality | Refusal, content policy, factuality |
| Post-processing guardrails | Moderation, format, policy | Moderation, format, policy | Moderation, format, policy |
| Deterministic vs. model-based | Per-layer breakdown | Per-layer breakdown | Per-layer breakdown |
| Strictness level | Low / Medium / High | Low / Medium / High | Low / Medium / High |
| Rationale | Why this configuration | Why this configuration | Why this configuration |

This practice does not assign a score and does not certify mastery.

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
