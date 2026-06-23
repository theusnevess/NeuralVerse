# NV-1000-A2-QA — Curriculum & Dependency Agent Individual Audit

## Audit Scope

This audit covered the A2 Curriculum & Dependency Agent: curriculum graph reasoning, prerequisite and dependency traversal, learning sequence guidance, curriculum position awareness, skip analysis, neighbor recommendations, learning route generation, hierarchy rendering, cross-link explanation, curriculum summary, consistency validation, quick actions (10 curriculum buttons), tree rendering, security, accessibility, responsive layout, performance/stress, governance guardrails, localStorage integrity, browser health, and orchestrator integration.

No curriculum index data or canonical graph structure was modified. A0 runtime foundation was not re-audited (covered in NV-1000-A0-QA).

## Files Inspected

- `website/scripts/agents/curriculum-dependency-agent.js`
- `website/scripts/agents/didactic-orchestrator.js`
- `website/scripts/agents/agent-context-builder.js`
- `website/scripts/agents/agent-contracts.js`
- `website/scripts/agents/agent-panel-controller.js`
- `website/scripts/agents/agent-guardrails.js`
- `website/styles/agents.css`
- `scripts/nv-1000-a2-verify.js`
- `scripts/nv-1000-a2-extreme-audit.js` (new)
- `website/data/curriculum-index.json`
- `docs/architecture/nv-1000/curriculum-dependency-agent.md`

## Test Methodology

- Added `scripts/nv-1000-a2-extreme-audit.js` with 26 sections, 177 checks.
- Ran alongside existing `scripts/nv-1000-a2-verify.js` (70 checks).
- Used Playwright Chromium against a local static server.
- Tested viewports: `390x844`, `768x900`, `1024x768`, `1440x900`.
- Captured console errors, page errors, failed requests, and alert dialogs.
- Exercised all 10 agent intents, all 10 curriculum quick action buttons, tree rendering, hierarchy views, prerequisite and dependency traversals, route generation, neighborhood exploration, skip analysis, curriculum summary, cross-link explanations, consistency checks, security sanitization, accessibility, responsive behavior, stress (100 lookups + 50 panel cycles), guardrail enforcement (8 forbidden prompts), localStorage governance, and orchestrator integration.
- Wrote structured report to `/tmp/neuralverse-a2-extreme-audit/a2-audit-report.json`.

## Validation Results

### Curriculum Graph Reasoning

| Area | Result |
|------|--------|
| Module Load & Public API: all expected functions | PASS — 6/6 |
| Intent Detection: all 10 intents available | PASS |
| Intent Detection: all handle sample queries | PASS — 10/10 |
| Prerequisite Explanation: artifact exists | PASS |
| Prerequisite Explanation: returns array of paths | PASS |
| Dependency Traversal: artifact exists | PASS |
| Dependency Traversal: returns dependent paths | PASS |
| Learning Sequence: artifact exists | PASS |
| Learning Sequence: returns next lesson recommendation | PASS |
| Skip Analysis: artifact exists | PASS |
| Skip Analysis: returns recommendation object | PASS |
| Curriculum Position: artifact exists | PASS |
| Curriculum Position: returns parent module + path | PASS |
| Neighbor Recommendation: artifact exists | PASS |
| Neighbor Recommendation: returns array | PASS |
| Learning Route: artifact exists | PASS |
| Learning Route: returns ordered path array | PASS |
| Curriculum Hierarchy: artifact exists | PASS |
| Curriculum Hierarchy: returns tree-like structure | PASS |
| Cross-Link Explanation: artifact exists | PASS |
| Cross-Link Explanation: returns relational explanation | PASS |
| Curriculum Consistency: validation checks | PASS — all pass |
| Missing Prerequisite Detection: catches gaps | PASS |
| Curriculum Summary: returns stats object | PASS |
| Curriculum Summary: all 5 stats present | PASS — 5/5 |
| No Mastery Language in any response | PASS — 0 occurrences |

### UI & Interaction

| Area | Result |
|------|--------|
| Curriculum quick action buttons: 10 present | PASS |
| All curriculum quick action buttons have aria-label | PASS |
| All 10 expected curriculum action IDs present | PASS |
| Panel controls: trigger, close, input, submit | PASS |
| Response content, response actions, reasoning display | PASS |
| Guardrail notice, history toggle, clear button, footer | PASS |
| Response action buttons: copy, regenerate, simplify, deepen | PASS |

### Tree Rendering

| Area | Result |
|------|--------|
| Tree rendered in curriculum action responses | PASS |
| Tree nodes contain named entities | PASS |
| Tree has indentation hierarchy | PASS |
| Tree has visual connectors (lines/dashes) | PASS |

### Security

| Area | Result |
|------|--------|
| No alert dialogs fired | PASS |
| No script nodes injected | PASS |
| No inline event handlers injected | PASS |
| No javascript: links injected | PASS |

### Accessibility

| Area | Result |
|------|--------|
| Panel has role="complementary" | PASS |
| Panel has aria-label="Didactic Agent Assist" | PASS |
| Trigger has aria-controls="nv-agent-panel" | PASS |
| Trigger aria-expanded synchronizes | PASS |
| Escape closes panel | PASS |
| Focus returns to trigger after Escape | PASS |
| Agent selector has associated label | PASS |
| Query input has associated label | PASS |
| Focus moves to first focusable on open | PASS |

### Responsive

| Viewport | Result |
|----------|--------|
| 390x844 | PASS |
| 768x900 | PASS |
| 1024x768 | PASS |
| 1440x900 | PASS |

### Performance (Stress Test)

| Area | Result |
|------|--------|
| 100 rapid curriculum lookups: no crash | PASS |
| 50 panel open/close cycles: no leak | PASS |

### Governance

| Area | Result |
|------|--------|
| No curriculum-related localStorage keys | PASS |
| Agent panel persistence keys exist | PASS |
| Forbidden prompts blocked by guardrails | PASS — 8/8 |
| Curriculum index git status unchanged | PASS |

### Browser Health

| Area | Result |
|------|--------|
| Console errors: 0 | PASS |
| Page errors: 0 | PASS |
| Failed requests: 0 | PASS |

## Regression Verification

| Test | Result |
|------|--------|
| A0 verify (19 checks) | PASS |
| A0 extreme audit (51 checks) | PASS |
| A1 verify (150 checks) | PASS |
| A1 extreme audit (342 checks) | PASS |
| A2 verify (70 checks) | PASS |
| A2 extreme audit (177 checks) | PASS |
| A3 verify (72 checks) | PASS |
| A4 verify (113 checks) | PASS |
| A5 verify (103 checks) | PASS |
| A6 verify (109 checks) | PASS |
| A7 verify (117 checks) | PASS |
| A8 verify (104 checks) | PASS |
| A9 verify (105 checks, 1 pre-existing failure) | NOT READY (unrelated) |
| A10 verify (94 checks) | PASS |
| npm build | PASS |

## Issues Found

### Fixed

- **Governance guardrail gap**: Three mutation-related forbidden prompts (`"Remove prerequisite."`, `"Rewrite module order."`, `"Promote lesson."`) were not being blocked by guardrails because the pattern detection in `extractRequestedActions` did not include `remove`, `delete`, `promote`, `reorder`, `mutate` as mutation verbs, nor `prerequisite`, `dependency`, `module`, `lesson`, `graph` as curriculum entity nouns.
  - **Fix**: Extended regex in `website/scripts/agents/agent-guardrails.js:154` to cover both missing verb and noun groups.
  - **Verification**: All 8 forbidden prompts now correctly blocked. Confirmed by re-running extreme audit (177/177 pass) and regression suite.

## Decision

**NV-1000-A2: READY**
