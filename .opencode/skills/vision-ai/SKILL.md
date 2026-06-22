---
name: vision-ai
description: Support computer vision pipelines, detection, tracking, behavioral analysis, and VisionFarm architecture.
---

# Vision AI Skill

Use this skill for VisionFarm and computer vision work.

Scope:
- OpenCV
- YOLO-style detection
- object tracking
- video ingestion
- frame sampling
- behavior scoring
- evidence artifacts
- alerting pipelines
- evaluation metrics

Rules:
- Prefer robust MVP implementations over fragile sophistication.
- Keep domain logic outside generic runtime/kernel layers.
- Separate capture, detection, tracking, behavior, scoring, evidence, and alerting.
- Do not assume perfect video quality.
- Design for imperfect lighting, occlusion, and noisy detections.
- Preserve explainability: alerts must link to evidence.
- Avoid training-heavy approaches unless explicitly requested.

Report:
- Pipeline stage affected
- Assumptions
- Tests or simulations run
- Risks and next validation step
