# NV-1000-A0 — Didactic Agent Runtime Foundation

## Purpose

This phase establishes the foundational runtime architecture for the NeuralVerse Didactic Agents system. It creates the shared infrastructure required for the 10 canonical didactic agents defined by NV-800-M0, without implementing full autonomous agent behavior.

## Core Principle

Agents assist learning. They do not:
- Modify canonical curriculum
- Determine mastery
- Generate Competency Evidence
- Call external LLM APIs
- Operate autonomously

## Canonical Agents

All 10 agents are registered with scaffolded status:

| # | Agent ID | Name | Category |
|---|----------|------|----------|
| 1 | curriculum-dependency | Curriculum & Dependency Agent | structure |
| 2 | didactic-architecture | Didactic Architecture Agent | design |
| 3 | visual-interactive-media | Visual & Interactive Media Agent | media |
| 4 | code-simulation-lab | Code, Simulation & Laboratory Agent | practice |
| 5 | assessment-reinforcement | Assessment & Reinforcement Agent | evaluation |
| 6 | research-state-of-art | Research & State-of-the-Art Agent | research |
| 7 | application-professional-transfer | Application & Professional Transfer Agent | application |
| 8 | storytelling-learning-journey | Storytelling & Learning Journey Agent | engagement |
| 9 | obsidian-knowledge-governance | Obsidian & Knowledge Governance Agent | governance |
| 10 | curiosity-engagement | Curiosity & Engagement Agent | engagement |

## Runtime Architecture

```
┌─────────────────────────────────────────────────┐
│                  Agent Panel UI                  │
│  (agent selector, input, response, history)     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│             Didactic Orchestrator               │
│  (receives intent, selects agents, applies      │
│   guardrails, invokes agents, returns response) │
└──┬───────────┬───────────────┬──────────────────┘
   │           │               │
┌──▼───┐  ┌───▼────────┐  ┌───▼──────────┐
│Agent │  │  Context    │  │  Guardrails  │
│Reg.  │  │  Builder    │  │  (enforced)  │
└──┬───┘  └───┬────────┘  └───┬──────────┘
   │          │               │
┌──▼──────────▼───────────────▼──────────────────┐
│           Agent Contracts (10)                 │
│  (canHandle, buildPrompt, run, formatResponse) │
│  run() returns scaffolded output only          │
└────────────────────────────────────────────────┘
```

## Orchestrator Model

The Didactic Orchestrator:

1. Receives a user intent (query string)
2. Reads current curriculum context via Context Builder
3. Selects eligible agents via contract `canHandle()` method
4. Applies governance guardrails before invocation
5. Invokes the best-matching scaffolded agent
6. Returns a structured `AgentResponse` object

The orchestrator **must not** modify curriculum content.

## Context Builder

The Context Builder reads current frontend state:

- Current route (hash)
- Selected Learning Path (from URL)
- Selected Module (from URL)
- Selected Lesson (from URL)
- Selected Artifact (from URL)
- Artifact type
- Canonical status
- Instructional objectives
- Learning depth (overview/path/module/lesson/artifact)
- User notes/bookmarks (from personalization service)
- Active study session (from personalization service)
- Recently visited items

It consumes existing frontend services only. No NV-800 Markdown parsing.

## Guardrails

Hard guardrails enforced on every agent invocation:

| Rule | Severity | Description |
|------|----------|-------------|
| no-curriculum-mutation | critical | Agents cannot modify NV-800 content |
| no-lifecycle-modification | critical | Agents cannot change lifecycle status |
| no-mastery-claims | critical | Agents cannot create scores/grades/certifications |
| no-id-mutation | critical | Agents cannot modify entity IDs |
| no-evidence-boundary-bypass | critical | Agents cannot bypass Evidence Boundary |
| no-external-api-calls | critical | No external LLM or backend API calls |
| no-hidden-recommendations | high | All recommendations must be transparent |
| no-sensitive-data-persistence | high | No persistence beyond local session |
| no-agent-escalation | critical | No contract modification or autonomous spawning |

If a request violates guardrails, a **governed refusal** is returned.

## UI Shell

The Agent Panel provides:

- Slide-in panel from the right
- Agent selector (dropdown with all 10 agents)
- Context summary (current route, path, module, etc.)
- User input box (textarea)
- Response area (renders scaffolded output)
- Guardrail notice (shown on refused requests)
- Invocation history (expandable, with clear)
- Trigger button (fixed position, bottom-right)
- Keyboard: Escape to close
- Responsive: full-width on mobile, 340px on tablet, 380px on desktop

## Files Created

| File | Purpose |
|------|---------|
| `website/scripts/agents/agent-registry.js` | Defines 10 canonical agents |
| `website/scripts/agents/agent-contracts.js` | Agent contract interface |
| `website/scripts/agents/didactic-orchestrator.js` | Agent orchestration logic |
| `website/scripts/agents/agent-context-builder.js` | Frontend context reader |
| `website/scripts/agents/agent-guardrails.js` | Governance guardrails |
| `website/scripts/agents/agent-panel-controller.js` | UI panel controller |
| `website/styles/agents.css` | Agent panel styles |
| `scripts/nv-1000-a0-verify.js` | Verification script |
| `docs/architecture/nv-1000/didactic-agent-runtime-foundation.md` | This document |

## Files Modified

| File | Change |
|------|--------|
| `website/index.html` | Added agents.css link, agent trigger button |
| `website/scripts/app.js` | Added agent panel import and initialization |

## Forbidden Scope

This phase does NOT implement:

- Real LLM API calls
- Backend APIs
- Autonomous background agents
- Database persistence
- Cloud sync
- Authentication
- Scoring
- Mastery tracking
- Quiz engines
- Competency Evidence generation
- Curriculum mutation
- Automatic content rewriting

## Future Phases

- **NV-1000-A1**: Didactic Architecture Agent (first real agent)
- **NV-1000-A2+**: Remaining agent implementations
- **NV-1000-B**: Agent autonomy and context awareness
- **NV-1000-C**: Agent-to-agent communication
- **NV-1000-D**: External integration boundaries

## QA Summary

Verified via `scripts/nv-1000-a0-verify.js`:

- Agent panel opens/closes
- All 10 agents listed in selector
- Current curriculum context displayed
- Agent selection works
- Scaffolded response renders
- Guardrail refusal works
- Keyboard navigation (Escape)
- Responsive layout (390/768/1024/1440)
- No horizontal overflow
- No console errors
- No failed requests
- Existing curriculum routes still work
- Existing personalization features still work
