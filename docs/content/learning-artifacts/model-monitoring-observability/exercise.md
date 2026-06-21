---
artifact_id: "artifact-model-monitoring-observability-exercise"
artifact_title: "Defining an Observability Strategy"
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
authoritative_source: "Foundational MLOps and production AI literature on model monitoring, observability, and production telemetry."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - model monitoring
  - observability
  - latency
  - throughput
  - SLO
  - SLI
  - tracing
  - alerting
  - cost tracking
tags:
  - learning-artifact
  - production-ai-systems
  - model-monitoring
prerequisite_notes: "Basic familiarity with model deployment, serving infrastructure, and operational concepts."
related_topics:
  - model-serving-and-inference
  - data-drift-and-concept-drift
  - ml-pipelines-and-orchestration
audience_notes: "Intended for ML engineers, MLOps practitioners, and SREs managing production AI systems."
---

# Defining an Observability Strategy

## Artifact Summary

Provides practice applying the concepts of Defining an Observability Strategy — guides the learner through reasoning steps that reinforce understanding of Model Monitoring and Observability through active problem-solving.

## Required Contract Fields

### objective

Define a complete observability strategy for three distinct production deployment contexts, specifying SLIs, SLOs, alerting thresholds, dashboard panels, and cost tracking approaches.

### learner task

For each of the three deployment contexts below, specify:

1. **Three SLIs** that best capture the service's health.
2. **Corresponding SLO targets** with an explanation of why each target is appropriate.
3. **Alerting thresholds and strategies** (static, dynamic baseline, or SLO burn rate) with a rationale.
4. **Dashboard panels** you would include on a dedicated monitoring dashboard.
5. **Cost tracking approach** describing what costs you attribute, how you normalize them, and what would trigger a cost investigation.

**Context A — Real-Time Chatbot**: A customer-facing conversational AI deployed across 12 regions. Requests arrive continuously with strong seasonality (peak hours 9 AM-9 PM local time). Users expect responses within 2 seconds. The chatbot uses a 7B parameter model served on dedicated GPU instances. The business SLA is 99.5% uptime and responses under 2 seconds for 95% of requests.

**Context B — Batch Document Processor**: A nightly batch job that processes 500,000 documents (invoices, contracts, reports) using a large model (70B parameters). Each document takes 10-30 seconds to process. Results are delivered by 8 AM daily. There is no real-time user interaction. Cost efficiency is critical because processing runs on expensive reserved GPU capacity. The business requires 99.9% of documents processed successfully per batch.

**Context C — Safety-Critical Medical Advisor**: A clinical decision support system that analyzes patient records and suggests treatment options. Used by physicians during patient consultations. Latency must be under 500ms to maintain workflow. A single incorrect output could cause patient harm. The system runs in a private cloud with strict data residency requirements. The medical board requires full audit trails for every recommendation.

### expected learner output

The learner should reason through the problem step by step, showing their work for each part. The expected output illustrates the reasoning format but not the complete solution.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Production ML requires more than deployed models — monitoring and observability ensure ongoing reliability, safety, and cost efficiency at scale.

## Dependency Notes

This artifact is part of the Model Monitoring and Observability content pack.

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
