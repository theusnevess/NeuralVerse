# Testing and Certification

## Overview

NeuralVerse has a multi-layered testing and certification system that covers functionality, governance, accessibility, security, and performance. All tests run in the browser or headless environment without external dependencies.

## Certification Layers

### Agent QA

Agent-specific tests verify:
- Each agent registers correctly in the registry
- Each agent handles queries matching its keywords
- Guardrails correctly block forbidden requests
- Governed refusals contain proper rule IDs and messages
- All 10 agents respond to their quick action buttons

### Extreme Audits

Comprehensive audit scripts that validate entire subsystems:

| Audit | Scope | Checks | Status |
|-------|-------|--------|--------|
| QA1 | Full system baseline | 100+ | Pass |
| QA2 | Search + Agent extreme | 200+ | Pass |
| QA3 | Workspace content extreme | 200+ | Pass |
| QA4 | Atlas + Retrieval extreme | 136 | Pass (0 failures) |
| QA5 | Learning + Modules extreme | 309 | Pass (0 failures) |

Each Extreme Audit covers:
- Route loading and rendering
- Count validation (entities, filters, lifecycle)
- Governance semantics (Draft/Reviewed, no mastery language)
- Accessibility (aria-hidden focusable descendants, keyboard nav)
- Responsive layout (multiple viewport sizes)
- Security (XSS, no eval)
- Performance (memory, DOM queries)
- Visual polish (badge rendering, spacing)

### Master Certification Gate

The NV-1000 Master Certification Gate (`nv-1000-master-certification-gate.js`) is the final verification layer. It runs:

- All Extreme Audit scripts in sequence
- Verifies zero Critical or High failures
- Checks build output and whitespace
- Validates documentation coverage
- Provides a single PASS/FAIL decision

### Playwright E2E

Playwright-based end-to-end tests verify:
- Page loading and rendering
- Navigation between routes
- Interactive behavior (search, filters, agent panel)
- No console errors during operation
- Responsive behavior across viewports

**Current Inventory:**
- 28 canonical specifications
- 18 canonical configurations
- Test suites: NV-1000 through NV-2600 (16 suites)

### Workspace Audits

Workspace-specific tests verify:
- Reading experience rendering
- Sticky header behavior
- Table of contents generation
- Copy code button functionality
- Personalization panel rendering
- Continue reading restoration

### Graph Audits

Knowledge graph tests verify:
- Canvas/WebGL rendering
- Force-directed layout computation
- Node selection and highlighting
- Filter controls
- Route synchronization

### Search Audits

Search system tests verify:
- Index building accuracy (counts match curriculum)
- Search results for various queries
- Keyboard navigation (arrows, Enter, Escape)
- Filter interaction (bookmarked, notes, recent)
- Alias resolution
- "View in Graph" links

### Accessibility Audits

Dedicated accessibility tests verify:
- Landmark structure
- ARIA attribute correctness
- Focus management on navigation
- Dialog focus trapping
- Skip-to-content link
- Keyboard-only navigation paths
- `aria-hidden` and `inert` on closed panels
- `prefers-reduced-motion` behavior

### Security Audits

Security tests verify:
- No `eval()` or dynamic code execution
- XSS pattern absence in agent guardrails
- Governed refusal responses for forbidden queries
- Sanitization of rendered content
- No external API calls from agent system

### Regression Suites

Regression scripts validate that existing functionality is preserved after changes:

| Script | Scope |
|--------|-------|
| `full-system-audit.js` | End-to-end system verification |
| `workspace-extra-audit.js` | Workspace-specific regression |
| `nv-ui-search-agent-extreme-audit.js` | Search + Agent regression |
| `nv-ui-workspace-content-extreme-audit.js` | Workspace content regression |
| `nv-1000-master-certification-gate.js` | Final certification gate |

## Build Verification

Before certification:
- `npm run build` must pass (React islands build)
- `git diff --check` must show no whitespace errors

### NV-2900 Automated Closure

- Build: PASS
- Documentation links: PASS, 0 broken links
- Playwright: PASS, 16 suites and 70/70 tests
- Automated accessibility: PASS, 2/2 tests
- Direct headed route review and Obsidian synchronization: deferred by project decision

## Test Statistics

| Layer | Typical Checks | Failure Tolerance |
|-------|---------------|-------------------|
| Extreme Audits | 100-309 per audit | Zero Critical/High |
| Master Gate | All audits combined | Zero failures |
| Playwright (28 specs) | Full route coverage | Zero failures |
| Accessibility | 10-20 per route | Zero violations |
| Security | 5-10 patterns | Zero violations |

## Related Chapters

- [Governance Model](27-governance-model.md)
- [Security Model](26-security-model.md)
- [Current Capabilities](29-current-capabilities.md)
