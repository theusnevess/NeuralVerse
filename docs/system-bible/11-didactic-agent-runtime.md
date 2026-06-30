# Didactic Agent Runtime

## Architectural Overview

The didactic agent runtime is a deterministic, browser-based system that provides educational guidance through 10 specialized agents (A1-A10). It operates without external API calls, LLM integration, or backend services.

```
┌──────────────────────────────────────────────────────────┐
│                   Agent Panel Controller                  │
│            (UI shell: selector, input, output)            │
└──────────────────────┬───────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────┐
│                  Didactic Orchestrator                     │
│  (intent routing, agent selection, guardrail enforcement)  │
└──┬────────────┬──────────────┬───────────────────────────┘
   │            │              │
┌──▼───┐  ┌─────▼────────┐  ┌─▼──────────────┐
│Agent  │  │   Context    │  │   Guardrails    │
│Registry│  │   Builder    │  │  (9 rules)      │
└──┬───┘  └─────┬────────┘  └───┬────────────┘
   │            │               │
┌──▼────────────▼───────────────▼─────────────────────────┐
│             10 Agent Contracts + 10 Real Agents          │
│    (canHandle, run, formatResponse — deterministic)      │
│    ┌──────┐ ┌──────┐ ┌──────┐           ┌──────┐       │
│    │  A1  │ │  A2  │ │  A3  │    ...    │ A10  │       │
│    └──────┘ └──────┘ └──────┘           └──────┘       │
│    Supporting Engines: Analogy, Comparison, Socratic,    │
│    Misconception Library                                 │
└──────────────────────────────────────────────────────────┘
```

## Pipeline

The complete request pipeline:

1. **User submits query** via panel textarea or quick action button
2. **Panel Controller** calls orchestrator with query and context
3. **Context Builder** reads current frontend state: URL hash, route, curriculum selection, personalization data, learning depth
4. **Guardrails** scan query for forbidden patterns: curriculum mutation, mastery claims, external API calls, XSS
5. **Agent Selection**: orchestrator iterates all agents calling `canHandle(context)` — keyword-based matching
6. **Execution**: selected agent's `run()` produces a structured result
7. **Formatting**: result is normalized into a standard response with typed sections
8. **Logging**: invocation is recorded in history (both orchestrator and guardrails logs)
9. **Rendering**: panel controller displays the response

## Registry

`agent-registry.js` maintains a `Map<string, AgentDefinition>` with deep-frozen entries. Each agent definition includes:

- `id`, `name`, `role`, `category`, `description`
- `supportedModes`, `capabilities`
- `forbiddenActions` (5-6 per agent)
- `status` (all 10 are `operational`)
- `registeredAt` timestamp

Retrieval returns deep-cloned copies to prevent mutation.

## Orchestrator

`didactic-orchestrator.js` is the central coordination hub. Responsibilities:

- `orchestrate(query, options)` — Full pipeline: context → guardrail → agent selection → execution → formatting
- `invokeAgent(agentId, query, options)` — Direct invocation of a specific agent
- `registerRealAgent(id, implementation)` — Register an operational agent implementation
- `selectEligibleAgents(context)` — Match agents via `canHandle()`
- `findBestAgentForQuery(query)` — Fallback scoring by keyword density

## Contracts

`agent-contracts.js` defines the interface each agent must implement:

- `canHandle(context)` → boolean
- `buildPrompt(context, options)` → string
- `run(context, options)` → `AgentResult`
- `formatResponse(result)` → `AgentResponse`

Scaffolded contracts provide fallback behavior for agents without full implementations. All 10 agents are promoted to operational status with real implementations.

## Context Builder

`agent-context-builder.js` produces a structured context object:

```
{
  currentRoute, routeParams,
  selectedPath, selectedModule,
  selectedLesson, selectedArtifact,
  artifactType, canonicalStatus,
  instructionalObjectives, learningDepth,
  userNotes, userBookmarks,
  studySession, recentlyVisited,
  timestamp, summary
}
```

All curriculum lookups are read-only reads from `window.NeuralVerse.curriculumIndex`. Personalization data comes from `window.NeuralVerse.PersonalizationService`.

## Guardrails

`agent-guardrails.js` enforces 9 rules:

| Rule ID | Severity | Detection |
|---------|----------|-----------|
| `no-curriculum-mutation` | Critical | Mutation keywords + entity names |
| `no-lifecycle-modification` | Critical | Lifecycle status change keywords |
| `no-mastery-claims` | Critical | Score/grade/mastery/certification terms |
| `no-id-mutation` | Critical | ID modification keywords |
| `no-evidence-boundary-bypass` | Critical | Evidence boundary bypass language |
| `no-external-api-calls` | Critical | External API/LLM invocation patterns |
| `no-hidden-recommendations` | High | Hidden recommendation language |
| `no-sensitive-data-persistence` | High | Sensitive data storage requests |
| `no-agent-escalation` | Critical | Contract modification or agent spawning |

Violations return a `governed-refusal` response with rule ID, severity, and refusal message. All violations are logged.

## Panel Controller

`agent-panel-controller.js` manages the Agent Assist panel UI:

- Agent selector dropdown (populated from registry)
- Quick action buttons (90 predefined prompts across 9 categories)
- Query textarea with Submit button
- Response display with structured section rendering
- 12 section types: comparison-table, socratic-questions, visual-card, timeline, code-block, execution-flow, lab-card, research-card, confidence-card, engineering-card, reinforcement-card, narrative-card, knowledge-card, curiosity-card
- Response action buttons: copy, regenerate, simplify, deepen
- Invocation history panel (persisted in localStorage)
- Guardrail notice display (red banner for blocked requests)

## Response Pipeline

After execution, responses are rendered as structured sections (each with collapsible toggles) or formatted Markdown. Section types control visual presentation:

- Tables for comparisons
- Numbered lists for socratic questions
- Gradient cards for different domain responses
- Code blocks with syntax labels
- Flow steps with arrow connectors

## Security

The runtime enforces:

- No curriculum mutation (architectural + guardrail)
- No external API calls (architectural + guardrail)
- No autonomous background agents
- No LLM integration
- XSS pattern detection in queries
- Input sanitization

## Governance

Every agent response includes relevant security disclaimers:
- "No curriculum modifications"
- "No grades, scoring, competency evaluations"
- "Canonical curriculum files remain unmodified"
- "No live search, fabricated citations, or curriculum mutations"

## Supporting Engines

Four pedagogical engines support A1 (Didactic Architecture):

- **Analogy Engine**: 14 topics with 3 analogies each, domain-mapped
- **Comparison Engine**: 10 known comparisons with 9 aspects each
- **Misconception Library**: 12 documented misconceptions with structured profiles
- **Socratic Engine**: 6 question layers, 10 topic-specific question sets

## Related Chapters

- [Agent A1: Didactic Architecture](12-agent-a1-didactic-architecture.md)
- [Agent A2: Curriculum & Dependency](13-agent-a2-curriculum-dependency.md)
- [Security Model](26-security-model.md)
- [Governance Model](27-governance-model.md)
