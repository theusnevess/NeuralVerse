# NV-1000-A1: Didactic Architecture Agent

**Version:** 1.1
**Status:** READY
**Date:** 2026-06-22

## Overview

The Didactic Architecture Agent (NV-1000-A1) is NeuralVerse's primary didactic agent. It provides structured, multi-section responses with 12 explanation modes, 12 intent categories, 10 educational response modes, integrated misconception detection, multi-domain analogies, expanded comparisons, and layered Socratic questioning.

## Architecture

```
didactic-architecture-agent.js   — Core agent: 12 modes, 12 intents, 10 educational response modes
├── misconception-library.js     — 12 structured misconception profiles with proactive detection
├── analogy-engine.js            — 15 topic analogies with multi-domain generation
├── comparison-engine.js         — 9 known comparisons, bidirectional matching, similarities/tradeoffs
└── socratic-engine.js           — 10 topics, 6 Socratic layers, full spectrum questioning
```

All modules are loaded via ES module imports in `app.js` and registered with the orchestrator via `registerRealAgent()`.

## Explanation Modes

| Mode | Description |
|------|-------------|
| `default` | Balanced explanation with all framework sections |
| `beginner` | Simple language, heavy on intuition and analogies |
| `intermediate` | Assumes foundational knowledge, focuses on connections |
| `advanced` | Technical depth, mathematical rigor, research context |
| `mathematical` | Formula-driven with variable definitions and proofs |
| `engineering` | Implementation-focused, trade-offs, production considerations |
| `research` | Paper-oriented, SOTA context, open questions |
| `visual-intuition` | Spatial reasoning, diagram-first explanations |
| `analogy-first` | Start with everyday analogies, then bridge to technical |
| `step-by-step` | Sequential walkthrough with numbered steps |
| `executive-summary` | 3-sentence overview with key takeaways |
| `socratic` | Guiding questions instead of direct answers |

## Intent Categories

The agent detects 12 intent categories from user queries:

| Intent | Triggers | Response Mode |
|--------|----------|---------------|
| `explain` | explain, what is, describe, tell me about | default |
| `simplify` | simple, easy, beginner, basic | beginner |
| `deepen` | deep, advanced, technical, mathematical | advanced |
| `compare` | compare, vs, versus, difference | comparison |
| `analogy` | analogy, similar to, imagine | analogy |
| `misconception` | misconception, wrong, mistake | misconception |
| `summarize` | summarize, summary, overview, tldr | summary |
| `connect` | connect, relate, prerequisite | connection |
| `socratic` | guide me, help me think, question | socratic |
| `reflection` | reflect, think about, consider | reflection |
| `transfer` | industry, real world, production, career | transfer |
| `reading` | reading, artifact, lesson, module | reading-companion |

Intent detection uses priority ordering: more specific intents (simplify, deepen, compare) are checked before the generic `explain` intent.

## Educational Response Modes

Each intent triggers a distinct response builder with tailored sections:

1. **Explain** (default) — Overview, Intuition, Detailed Explanation, Misconceptions, Connections, Reflection, Suggested Next
2. **Simplify** (beginner) — Accessible language, intuition-first, everyday analogies
3. **Deepen** (advanced) — Technical depth, formal constructs, mathematical rigor
4. **Comparison** — Structured comparison table, key differences, when to use which, similarities, tradeoffs
5. **Analogy** — Primary analogy + alternative domain perspectives, available domains
6. **Misconception** — Detected misconceptions with profiles (wrong, correct, why learners believe it, intuition, verification)
7. **Socratic** — Opening prompt, guiding questions, reflection, layered questions (observation, interpretation, prediction, abstraction, transfer, synthesis)
8. **Reflection** — 5 randomized reflection prompts from 8 candidates
9. **Transfer** — Industry, research, production, software, CV, ML, GenAI domain mapping
10. **Reading Companion** — Summary, key idea, hidden assumptions, terminology, checkpoints, reflection
11. **Connection** — Curriculum context, prerequisites, downstream concepts, cross-topic connections
12. **Summary** — Executive summary with key takeaways

## Response Structure

Each response from the agent is a structured object:

```javascript
{
  agentId: 'didactic-architecture',
  agentName: 'Didactic Architecture Agent',
  topic: 'User query or topic',
  mode: 'comparison',  // reflects detected intent, not just the options.mode
  status: 'operational',
  reasoningStrategy: 'Comparison + Curriculum Context',
  sections: [
    { title: 'Comparison: A vs B', content: '| Aspect | A | B |...', type: 'comparison-table' },
    { title: 'Key Differences', content: '...', type: 'text' },
    { title: 'When to Use Which', content: '...', type: 'text' },
    { title: 'Similarities', content: '...', type: 'text' },
    { title: 'Trade-offs', content: '...', type: 'text' },
  ],
  timestamp: '2026-06-22T...'
}
```

The `mode` field now reflects the detected intent, not just the options passed to `run()`. This allows the UI to display which educational mode was activated.

## Sub-Engines

### Misconception Library

12 structured misconception profiles with:

- `title`, `wrong`, `correct` — basic correction
- `triggers` — keywords for detection
- `whyLearnersBelieveIt` — pedagogical insight
- `intuition` — intuitive explanation
- `verificationPrompt` — self-check question

Functions: `detect()`, `detectProactive()`, `getFormattedProfile()`, `getProfileById()`, `getAll()`

### Analogy Engine

15 topics × 1-3 domain variants each (physics, everyday life, engineering, transportation, libraries, cities, manufacturing, biology).

Functions: `generate()`, `generateMultiDomain()`, `generateByDomain()`, `getAvailableDomains()`, `getAnalogiesByDomain()`, `getAvailableAnalogies()`

### Comparison Engine

9 known comparisons with full aspect tables, similarities, assumptions, and tradeoffs:

- Supervised vs Unsupervised Learning
- RNN vs Transformer
- CNN vs Transformer
- Precision vs Recall
- GAN vs Autoencoder
- SGD vs Adam
- BERT vs GPT
- Batch vs Mini-Batch vs SGD
- ReLU vs Sigmoid vs Tanh

Bidirectional matching with fallback to generic comparison framework.

Functions: `parseComparisonQuery()`, `compare()`, `getKnownComparisons()`, `getComparisonDetails()`

### Socratic Engine

10 topics with `opening`, `main`, `reflection` structure. 6 Socratic layers: observation, interpretation, prediction, abstraction, transfer, synthesis.

Functions: `generate()` (with `options.layers`), `generateByLayer()`, `generateFullSpectrum()`, `generateLayeredQuestions()`, `getAvailableTopics()`, `getAvailableLayers()`, `getQuestionsForLayer()`

## Panel UI Features

- **Mode Selector**: Dropdown with 12 explanation modes
- **Quick Actions**: 9 one-click buttons (Explain Simply, Explain Deeply, Give Analogy, Compare, Find Misconceptions, Socratic Mode, Reflection Prompts, Connect Concepts, Summarize)
- **Structured Sections**: Expandable/collapsible sections with chevron toggle
- **Action Buttons**: Copy, Regenerate, Simplify (mode→beginner), Deepen (mode→advanced)
- **Reasoning Strategy**: Displays which educational strategy was activated
- **Comparison Tables**: Markdown tables rendered with proper HTML
- **Socratic Questions**: Ordered list with styled question items
- **Local Persistence**: Mode selection, collapsed sections, recent prompts saved to localStorage

## Guardrails

The agent inherits all NV-1000-A0 guardrails:

- No curriculum mutation
- No lifecycle modification
- No mastery claims
- No ID mutation
- No evidence boundary bypass
- No external API calls
- No hidden recommendations
- No sensitive data persistence
- No agent escalation

## Files

| File | Purpose |
|------|---------|
| `didactic-architecture-agent.js` | Core agent: 12 intents, 10 response modes |
| `misconception-library.js` | 12 structured misconception profiles |
| `analogy-engine.js` | 15-topic multi-domain analogy engine |
| `comparison-engine.js` | 9 known comparisons with tradeoffs |
| `socratic-engine.js` | 10 topics, 6-layer Socratic engine |
| `agents.css` | Panel styles with quick actions and sections |
| `agent-panel-controller.js` | Panel controller with 9 quick actions |
| `didactic-orchestrator.js` | Orchestrator with registerRealAgent |
| `app.js` | Agent imports and registration |
| `scripts/nv-1000-a1-verify.js` | Playwright verification (150 checks) |

## Verification

All 150 Playwright E2E checks pass:

- Agent modules loaded (6 checks)
- Explanation modes (4 checks)
- Intent detection (3 checks)
- All 10 educational modes (52 checks)
- Misconception detection (8 checks)
- Analogy engine with multi-domain (8 checks)
- Comparison engine with tradeoffs (9 checks)
- Socratic engine with layers (11 checks)
- Structured response format (10 checks)
- Mode selector UI (2 checks)
- Quick action buttons (4 checks)
- Panel structured response (3 checks)
- Section collapse/expand (2 checks)
- Guardrails (1 check)
- Mode-specific responses (8 checks)
- Responsive layout (4 checks)
- Existing routes (4 checks)
- Error checks (2 checks)
