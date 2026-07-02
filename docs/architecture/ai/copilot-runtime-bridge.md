# Copilot Runtime Bridge Architecture

## Overview

The Copilot Runtime Bridge connects the frontend NeuralVerse AI Copilot UI to the AI runtime pipeline. It provides a browser-compatible implementation of the orchestration pipeline that mirrors the backend TypeScript implementation.

## Why the Bridge Exists

The NeuralVerse architecture has two separate systems:

1. **Frontend** (`website/scripts/`) — Vanilla JS, runs in browser
2. **Backend** (`src/ai/`) — TypeScript, runs in Node.js

These systems are architecturally parallel but disconnected. The bridge creates a browser-compatible version of the runtime pipeline that can execute in the frontend.

## Architecture

```
UI (agent-panel-controller.js)
    ↓
Copilot Runtime Bridge (copilot-runtime-bridge.js)
    ├── Intent Classification
    ├── Agent Selection
    ├── Evidence Aggregation
    ├── Confidence Calculation
    ├── Provider (MockProvider / LocalProvider)
    ├── Response Validation
    └── Educational Response Pipeline
    ↓
UI Response
```

## Bridge Interface

```javascript
const bridge = createCopilotRuntimeBridge();

// Send a message
const response = await bridge.sendMessage({
  message: 'Explain neural networks',
  mode: 'teaching',
  style: 'simple',
  route: '#/learning',
  developerMode: false
});

// Manage conversation
bridge.restoreSession();
bridge.clearSession();

// Provider info
bridge.getProviderInfo();
bridge.getDeveloperMetadata();
```

## Provider Policy

**Default:** MockProvider
**Local:** LocalProvider (only when explicitly configured)

Configuration sources:
- `window.NeuralVerse.aiConfig`
- `localStorage neuralverse.ai.provider`
- Environment-injected config

Accepted values: `mock`, `local`

## Static App Constraint

The website is served as static files. The bridge:

- Uses MockProvider by default (no network calls)
- Supports LocalProvider only when local dev mode is enabled
- Falls back gracefully if local provider is unavailable

## Request Shape

```javascript
{
  message: string,
  mode: 'automatic' | 'teaching' | 'research' | ...,
  style: 'default' | 'simple' | 'detailed' | ...,
  route: string,
  currentLesson?: object,
  currentModule?: string,
  currentPath?: string,
  developerMode: boolean
}
```

## Response Shape

```javascript
{
  type: 'success' | 'clarification' | 'error',
  content: string,
  educationalResponse?: object,
  suggestedActions?: array,
  developerMetadata: object,
  provider: string,
  model: string,
  validation: object
}
```

## Clarification Flow

When confidence is insufficient:

```javascript
{
  type: 'clarification',
  clarification: 'I need more context...',
  missingEvidence: ['concept-definitions'],
  suggestedNextPrompts: ['Explain simply', 'Give details', 'Show examples'],
  developerMetadata: { ... }
}
```

## Educational Response Pipeline

For successful responses:

```javascript
{
  type: 'success',
  content: '...',
  educationalResponse: {
    sections: [...],
    cards: [...],
    actions: [...],
    metadata: { ... }
  },
  suggestedActions: [...]
}
```

## Error Handling

User-facing errors are calm:

- "NeuralVerse AI is running in safe local mode."
- "The local model is not available right now."
- "The response could not be validated."

Stack traces only in Developer Mode.

## Browser Compatibility

The bridge is implemented in vanilla JavaScript (no TypeScript compilation needed).

Key browser APIs used:
- `fetch()` for LocalProvider HTTP calls
- `localStorage` for provider configuration
- `AbortController` for request timeout

## File Structure

```
website/scripts/agents/copilot-runtime-bridge.js
├── Intent Classification
├── Agent Selection
├── Evidence Aggregation
├── Confidence Calculation
├── Mock Provider
├── Local Provider
├── Response Validation
├── Educational Response Pipeline
├── Conversation Management
├── Error Classification
└── Bridge Interface
```

## Testing

```bash
# Unit tests (browser-compatible)
npm test

# Playwright tests
npx playwright test tests/playwright/copilot-runtime-bridge.spec.ts
```

## Future Backend Bridge

When a backend server is available:

1. Replace browser-compatible pipeline with HTTP calls to backend
2. Backend runs full TypeScript CopilotRuntime
3. Frontend bridge becomes a thin HTTP client
4. All orchestration moves to server-side

## Security

- API keys never exposed to browser
- LocalProvider only connects to localhost
- MockProvider makes no network calls
- Provider configuration stored in localStorage only
