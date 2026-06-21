---
artifact_id: "artifact-model-serving-and-inference-exercise"
artifact_title: "Designing a Serving Architecture"
artifact_family: "Practice Artifacts"
artifact_type: "Exercise"
canonical_status: "Reviewed"
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
authoritative_source: "Foundational MLOps and production AI literature on model serving architectures and inference optimization."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - model serving
  - inference
  - continuous batching
  - kv-cache
  - speculative decoding
  - quantization
  - autoscaling
  - cold start
tags:
  - learning-artifact
  - production-ai-systems
  - model-serving
prerequisite_notes: "Basic familiarity with LLM architecture, transformer inference, and deployment concepts."
related_topics:
  - model-monitoring-observability
  - data-drift-and-concept-drift
  - ml-pipelines-and-orchestration
audience_notes: "Intended for ML engineers, MLOps practitioners, and backend engineers deploying LLMs in production."
---

# Designing a Serving Architecture

## Artifact Summary

Provides practice applying the concepts of Designing a Serving Architecture — guides the learner through reasoning steps that reinforce understanding of Production AI Systems through active problem-solving.

## Required Contract Fields

### objective

Design a serving architecture for three distinct deployment contexts, selecting appropriate serving approach, inference engine, batching strategy, and optimization techniques.

### learner task

Analyze each of the following three deployment contexts. For each context, complete a table specifying: (1) the recommended serving approach (real-time, batch, or streaming), (2) the inference engine you would choose (vLLM, TensorRT-LLM, TGI, or custom), (3) the batching strategy, (4) applicable optimization techniques, and (5) the rationale for your decisions.

**Context A — Real-time Chatbot:** A customer support chatbot requires sub-second response times for interactive conversations. Average conversation length is 8–12 turns, each turn involves 50–150 tokens. Peak traffic reaches 2,000 concurrent users. Cost efficiency per conversation is a secondary concern behind user experience.

**Context B — Batch Document Processing:** A legal document analysis system processes thousands of PDFs nightly. Each document requires a 4,000–8,000 token analysis with structured JSON output. Processing must complete within a 4-hour nightly window. Latency per document is flexible; throughput and cost efficiency are the primary concerns.

**Context C — Streaming Code Completion:** An AI-powered code editor provides real-time, token-by-token streaming suggestions as developers type. Latency to first token must be under 200ms. Each suggestion is 20–80 tokens. The service handles 5,000 concurrent active users with bursty usage patterns.

### expected learner output

The learner should reason through the problem step by step, showing their work for each part. The expected output illustrates the reasoning format but not the complete solution.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Production ML requires efficient model serving — these optimization techniques ensure deployed models meet latency, throughput, and cost targets.

## Dependency Notes

This artifact is part of the Production AI Systems content pack.

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
