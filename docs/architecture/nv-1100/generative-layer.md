# NV-1100-P11 — Optional Generative Layer with Local LLMs

## Overview

P11 introduces an optional, explicitly-enabled generative assistance layer powered by local LLMs. The deterministic NeuralVerse core remains authoritative. Generated outputs are non-canonical.

## Architecture

```
Curriculum
  ↓
Concept Layer
  ↓
Shared Knowledge
  ↓
Semantic Learning Intelligence
  ↓
Memory / Reviews / Labs / Visualizations / Verification
  ↓
Optional Local Generative Layer (P11)
```

## Provider Abstraction

| Provider | Default Endpoint | API |
|----------|-----------------|-----|
| Ollama | http://localhost:11434 | /api/tags, /api/generate |
| llama.cpp | http://localhost:8080 | /v1/models, /v1/chat/completions |
| OpenAI-Compat | http://localhost:1234/v1 | /models, /chat/completions |

All endpoints are user-configurable. Only localhost endpoints are allowed by default.

## Model Profiles

| Profile | Purpose | Recommended Models |
|---------|---------|-------------------|
| qwen-coder-local | Coding/Agentic | qwen3-coder-next, qwen3.5-coder |
| deepseek-r1-distill-local | Reasoning | deepseek-r1-distill-qwen-14b/32b |
| gemma-instruct-local | General | gemma-3-12b-it, gemma-3-4b-it |
| neuralverse-didactic-future | Didactic | Future fine-tuned model |
| custom-local-openai-compatible | Custom | Any local model |

## Generation Modes

- Explain concept / Simplify / Deepen
- Generate analogy / Socratic questions
- Summarize artifact / Draft study note
- Suggest lab exploration
- Explain code / visualization
- Generate practice question draft

## Privacy Levels

| Level | Includes |
|-------|----------|
| none | Nothing |
| current_artifact_only | Current artifact (default) |
| curriculum_context | Curriculum data |
| semantic_context | Semantic relationships |
| include_user_memory | User memory (opt-in) |
| include_review_state | Review state (opt-in) |

## Guardrails

Blocked patterns: mastery inference, proficiency claims, score references, gamification, canonical mutation claims, fake citations.

## Security

- No cloud endpoints by default
- No API keys
- No telemetry
- Local-only processing
- XSS-safe rendering
- AbortController for requests
- Timeout control
- Request/response size caps
