---
name: vision-ai
description: Support computer vision pipelines, detection, tracking, behavioral analysis, and VisionFarm architecture.
---

# Vision AI

## Purpose

Support VisionFarm and computer vision pipelines with robust, explainable, and maintainable domain boundaries.

## When To Use

Use for OpenCV, YOLO-style detection, object tracking, video ingestion, frame sampling, behavior scoring, evidence artifacts, alerting pipelines, and evaluation metrics.

## Core Rules

- Prefer robust MVP implementations over fragile sophistication.
- Keep domain logic outside generic runtime/kernel layers.
- Separate capture, detection, tracking, behavior, scoring, evidence, and alerting.
- Do not assume perfect video quality.
- Design for imperfect lighting, occlusion, and noisy detections.
- Preserve explainability: alerts must link to evidence.
- Avoid training-heavy approaches unless explicitly requested.

## Workflow

1. Identify the affected pipeline stage.
2. Inspect current data flow and evidence artifacts.
3. Apply a bounded, testable change.
4. Validate with available tests, simulations, or representative cases.

## Validation

- Check assumptions about input quality and detection noise.
- Verify evidence links remain explainable.
- Run focused tests or simulations when available.

## Report

- Pipeline stage affected.
- Assumptions.
- Tests or simulations run.
- Risks and next validation step.

## Forbidden

- Do not assume perfect cameras, lighting, or detections.
- Do not introduce training-heavy approaches without explicit request.
