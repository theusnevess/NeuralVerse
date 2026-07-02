# LLM Integration Architecture

## Overview

This document describes the LLM integration layer for NeuralVerse AI Copilot. The architecture separates deterministic D1-D10 agents from the generative LLM layer, ensuring that agent logic remains pure and testable while enabling natural language synthesis.

## Why LLM is Separate

The D1-D10 agent system is designed to be **deterministic**. Every agent:

- Produces identical output for identical input
- Uses no randomness (`Math.random`)
- Uses no time dependency (`Date.now`)
- Makes no network calls
- Has no filesystem access
- Is fully synchronous

Adding LLM calls directly to agents would break these guarantees. The LLM layer is therefore isolated behind a dedicated adapter/runtime layer.

## Architecture

```
UI Copilot
    ↓
Copilot Runtime
    ↓
Agent Orchestrator
    ↓
D1-D10 Deterministic Agents
    ↓
Prompt Compiler
    ↓
LLM Provider Adapter
    ↓
Response Validator
    ↓
Response Renderer
```

## Provider Abstraction

### LLMProvider Interface

All providers implement the `LLMProvider` interface:

```typescript
interface LLMProvider {
  readonly id: LLMProviderId;
  readonly isAvailable: boolean;
  complete(request: LLMRequest): Promise<LLMResponse | LLMProviderError>;
  getSupportedModels(): readonly LLMModelId[];
  validateConfig(config: LLMProviderConfig): boolean;
}
```

### Available Providers

| Provider | Status | Purpose |
|----------|--------|---------|
| MockProvider | Active | Deterministic responses for tests |
| OpenAIProvider | Placeholder | Future OpenAI integration |
| LocalProvider | Placeholder | Future Ollama/local model integration |

### Provider Selection

The `ProviderFactory` selects the appropriate provider:

1. If `LLM_PROVIDER` env var is set, use that provider
2. If the provider is not configured (missing API key, etc.), fall back to MockProvider
3. Default is always MockProvider

## Prompt Compiler

The Prompt Compiler combines:

- **User query** — the question being asked
- **Current route** — where the user is in the app
- **Current lesson** — path, module, lesson context
- **Agent outputs** — results from D1-D10 agents
- **Retrieval context** — related concepts and lessons
- **Guardrails** — forbidden topics, required disclaimers
- **Response style** — how to format the answer
- **AI mode** — which agents to prioritize
- **Developer metadata** — when developer mode is enabled

The compiler produces a structured `CompiledPrompt` with typed messages and metadata.

## Copilot Runtime

The Copilot Runtime orchestrates the full pipeline:

1. Receive UI request
2. Build prompt compilation context
3. Compile prompt
4. Call selected LLM provider
5. Validate response
6. Render response payload
7. Return to UI

### Modes

| Mode | Description | Primary Agents |
|------|-------------|----------------|
| Automatic | AI decides best approach | All |
| Teaching | Step-by-step explanations | Didactic, Narrative, Assessment |
| Research | Papers and evidence | Research, Knowledge, Application |
| Practice | Hands-on exercises | Laboratory, Assessment, Application |
| Engineering | Real-world trade-offs | Application, Laboratory, Research |
| Visual | Diagrams and models | Visual, Didactic, Curiosity |
| Knowledge | Connections and graphs | Knowledge, Curriculum, Didactic |
| Advanced | Deep technical analysis | Research, Laboratory, Didactic |

### Response Styles

| Style | Description |
|-------|-------------|
| Default | Balanced explanation |
| Simple | Plain language, no jargon |
| Detailed | Comprehensive with examples |
| Mathematical | Equations and formal proofs |
| Engineering | Implementation focus |
| Research | Literature and evidence |
| Visual | Mental models and diagrams |
| Socratic | Guiding questions |

## Response Validator

Validates LLM responses for:

- **Completeness** — not empty, meets length requirements
- **Structure** — has paragraphs, lists, or headers
- **Safety** — no forbidden content patterns
- **Finish reason** — not error or content filter

## Security

### API Key Management

- API keys **never** appear in browser JavaScript
- Keys are stored in environment variables only
- If no backend server exists, only MockProvider is available

### Content Governance

- Guardrails are compiled into prompts
- Responses are validated for forbidden patterns
- Provider errors are caught and handled gracefully

### Frontend/Backend Boundary

```
Browser (Frontend)
├── Copilot UI
├── Copilot Runtime (client-side wrapper)
└── No direct LLM calls

Server (Backend) — Future
├── LLM Provider Adapters
├── API Key Management
├── Rate Limiting
└── Response Caching
```

Currently, the app is static-only. Only MockProvider is functional. Real LLM integration requires a backend server.

## Testing Strategy

### MockProvider

- Returns deterministic responses
- No network calls
- Configurable response overrides
- Tracks call count and last request
- Blocks forbidden content patterns

### Test Coverage

All LLM-related tests use MockProvider:

- Provider selection and fallback
- Prompt compilation with all modes/styles
- Response validation (valid, empty, too short, too long, forbidden)
- Copilot Runtime request processing
- Response rendering and formatting
- Guardrail enforcement
- Developer mode metadata

### Test Commands

```bash
npm run typecheck    # TypeScript validation
npm test             # All unit tests (8449+)
npm run build        # Production build
```

## Future Integration

### OpenAI/Claude/Gemini

When adding real providers:

1. Create provider adapter implementing `LLMProvider`
2. Add backend API endpoint for secure key management
3. Configure environment variables
4. Update `ProviderFactory` to select new provider

### Ollama/Local Models

For local development:

1. Start Ollama server
2. Configure `LLM_PROVIDER_LOCAL_URL`
3. Use `LocalProvider` adapter

## File Structure

```
src/ai/
├── index.ts                    # Main barrel export
├── llm-provider/
│   ├── index.ts               # Provider barrel export
│   ├── LLMProvider.ts         # Core interfaces
│   ├── MockProvider.ts        # Test provider
│   ├── OpenAIProvider.ts      # Placeholder
│   ├── LocalProvider.ts       # Placeholder
│   ├── ProviderFactory.ts     # Provider selection
│   └── MockProvider.test.ts   # Tests
├── prompt-compiler/
│   ├── index.ts               # Compiler barrel export
│   ├── PromptCompiler.ts      # Prompt generation
│   └── PromptCompiler.test.ts # Tests
├── response-validator/
│   ├── index.ts               # Validator barrel export
│   ├── ResponseValidator.ts   # Response validation
│   └── ResponseValidator.test.ts # Tests
├── response-renderer/
│   ├── index.ts               # Renderer barrel export
│   ├── ResponseRenderer.ts    # Response formatting
│   └── ResponseRenderer.test.ts # Tests
└── copilot-runtime/
    ├── index.ts               # Runtime barrel export
    ├── CopilotRuntime.ts      # Orchestration
    └── CopilotRuntime.test.ts # Tests
```

## Key Design Decisions

1. **MockProvider is default** — ensures tests never depend on real APIs
2. **Prompt Compiler produces structured objects** — not just strings — enabling metadata tracking
3. **Response Validator runs before rendering** — catches issues early
4. **Copilot Runtime is stateless** — each request is independent
5. **All interfaces use `readonly`** — immutability by default
6. **No barrel re-exports from main src/** — AI layer is self-contained
