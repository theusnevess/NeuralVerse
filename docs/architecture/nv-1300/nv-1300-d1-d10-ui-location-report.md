# NeuralVerse D1-D10 UI Agent Location Report

**Audit Date:** 2026-06-30T17:42:04.660Z
**Verification Tool:** Playwright (Chromium Headless)

## Summary of Agent UI Presence

All 10 agents are registered in the global Didactic Orchestrator and are accessible via the **Agent Assist Panel** across all application routes. The Agent Assist Panel is persistent and can be toggled using the header trigger button (`#nv-agent-trigger`).

When selected inside the panel, each agent exposes a dedicated **Quick Action Grid** containing custom prompt macros.

---

## Detailed Agent UI Mapping

### Curriculum & Dependency Agent (`curriculum-dependency`)

- **Primary UI Shell:** Didactic Agent Assist Panel (`#nv-agent-panel`)
- **Agent Specific Selector:** `[data-agent-curriculum-actions]`
- **Availability across Routes:** Verified on all 13 routes:
  - [✓] Home
  - [✓] Learning Paths
  - [✓] Modules
  - [✓] Workspace
  - [✓] Content Pack
  - [✓] Retrieval Playground
  - [✓] Settings
  - [✓] Knowledge Graph
  - [✓] Laboratory
  - [✓] Memory
  - [✓] Semantic Learning
  - [✓] Visualizations
  - [✓] Generative Layer
- **Specific UI Action Controls:**
  - Selector dropdown element: `#nv-agent-select`
  - Input query field: `#nv-agent-input`
  - Send action button: `.nv-agent-submit`

### Didactic Architecture Agent (`didactic-architecture`)

- **Primary UI Shell:** Didactic Agent Assist Panel (`#nv-agent-panel`)
- **Agent Specific Selector:** `[data-agent-quick-actions]`
- **Availability across Routes:** Verified on all 13 routes:
  - [✓] Home
  - [✓] Learning Paths
  - [✓] Modules
  - [✓] Workspace
  - [✓] Content Pack
  - [✓] Retrieval Playground
  - [✓] Settings
  - [✓] Knowledge Graph
  - [✓] Laboratory
  - [✓] Memory
  - [✓] Semantic Learning
  - [✓] Visualizations
  - [✓] Generative Layer
- **Specific UI Action Controls:**
  - Selector dropdown element: `#nv-agent-select`
  - Input query field: `#nv-agent-input`
  - Send action button: `.nv-agent-submit`

### Visual & Interactive Media Agent (`visual-interactive-media`)

- **Primary UI Shell:** Didactic Agent Assist Panel (`#nv-agent-panel`)
- **Agent Specific Selector:** `[data-agent-visual-actions]`
- **Availability across Routes:** Verified on all 13 routes:
  - [✓] Home
  - [✓] Learning Paths
  - [✓] Modules
  - [✓] Workspace
  - [✓] Content Pack
  - [✓] Retrieval Playground
  - [✓] Settings
  - [✓] Knowledge Graph
  - [✓] Laboratory
  - [✓] Memory
  - [✓] Semantic Learning
  - [✓] Visualizations
  - [✓] Generative Layer
- **Specific UI Action Controls:**
  - Selector dropdown element: `#nv-agent-select`
  - Input query field: `#nv-agent-input`
  - Send action button: `.nv-agent-submit`

### Code, Simulation & Laboratory Agent (`code-simulation-lab`)

- **Primary UI Shell:** Didactic Agent Assist Panel (`#nv-agent-panel`)
- **Agent Specific Selector:** `[data-agent-code-lab-actions]`
- **Availability across Routes:** Verified on all 13 routes:
  - [✓] Home
  - [✓] Learning Paths
  - [✓] Modules
  - [✓] Workspace
  - [✓] Content Pack
  - [✓] Retrieval Playground
  - [✓] Settings
  - [✓] Knowledge Graph
  - [✓] Laboratory
  - [✓] Memory
  - [✓] Semantic Learning
  - [✓] Visualizations
  - [✓] Generative Layer
- **Specific UI Action Controls:**
  - Selector dropdown element: `#nv-agent-select`
  - Input query field: `#nv-agent-input`
  - Send action button: `.nv-agent-submit`

### Assessment & Reinforcement Agent (`assessment-reinforcement`)

- **Primary UI Shell:** Didactic Agent Assist Panel (`#nv-agent-panel`)
- **Agent Specific Selector:** `[data-agent-assessment-actions]`
- **Availability across Routes:** Verified on all 13 routes:
  - [✓] Home
  - [✓] Learning Paths
  - [✓] Modules
  - [✓] Workspace
  - [✓] Content Pack
  - [✓] Retrieval Playground
  - [✓] Settings
  - [✓] Knowledge Graph
  - [✓] Laboratory
  - [✓] Memory
  - [✓] Semantic Learning
  - [✓] Visualizations
  - [✓] Generative Layer
- **Specific UI Action Controls:**
  - Selector dropdown element: `#nv-agent-select`
  - Input query field: `#nv-agent-input`
  - Send action button: `.nv-agent-submit`

### Research & State-of-the-Art Agent (`research-state-of-art`)

- **Primary UI Shell:** Didactic Agent Assist Panel (`#nv-agent-panel`)
- **Agent Specific Selector:** `[data-agent-research-actions]`
- **Availability across Routes:** Verified on all 13 routes:
  - [✓] Home
  - [✓] Learning Paths
  - [✓] Modules
  - [✓] Workspace
  - [✓] Content Pack
  - [✓] Retrieval Playground
  - [✓] Settings
  - [✓] Knowledge Graph
  - [✓] Laboratory
  - [✓] Memory
  - [✓] Semantic Learning
  - [✓] Visualizations
  - [✓] Generative Layer
- **Specific UI Action Controls:**
  - Selector dropdown element: `#nv-agent-select`
  - Input query field: `#nv-agent-input`
  - Send action button: `.nv-agent-submit`

### Application & Professional Transfer Agent (`application-professional-transfer`)

- **Primary UI Shell:** Didactic Agent Assist Panel (`#nv-agent-panel`)
- **Agent Specific Selector:** `[data-agent-transfer-actions]`
- **Availability across Routes:** Verified on all 13 routes:
  - [✓] Home
  - [✓] Learning Paths
  - [✓] Modules
  - [✓] Workspace
  - [✓] Content Pack
  - [✓] Retrieval Playground
  - [✓] Settings
  - [✓] Knowledge Graph
  - [✓] Laboratory
  - [✓] Memory
  - [✓] Semantic Learning
  - [✓] Visualizations
  - [✓] Generative Layer
- **Specific UI Action Controls:**
  - Selector dropdown element: `#nv-agent-select`
  - Input query field: `#nv-agent-input`
  - Send action button: `.nv-agent-submit`

### Storytelling & Learning Journey Agent (`storytelling-learning-journey`)

- **Primary UI Shell:** Didactic Agent Assist Panel (`#nv-agent-panel`)
- **Agent Specific Selector:** `[data-agent-narrative-actions]`
- **Availability across Routes:** Verified on all 13 routes:
  - [✓] Home
  - [✓] Learning Paths
  - [✓] Modules
  - [✓] Workspace
  - [✓] Content Pack
  - [✓] Retrieval Playground
  - [✓] Settings
  - [✓] Knowledge Graph
  - [✓] Laboratory
  - [✓] Memory
  - [✓] Semantic Learning
  - [✓] Visualizations
  - [✓] Generative Layer
- **Specific UI Action Controls:**
  - Selector dropdown element: `#nv-agent-select`
  - Input query field: `#nv-agent-input`
  - Send action button: `.nv-agent-submit`

### Obsidian & Knowledge Governance Agent (`obsidian-knowledge-governance`)

- **Primary UI Shell:** Didactic Agent Assist Panel (`#nv-agent-panel`)
- **Agent Specific Selector:** `[data-agent-obsidian-actions]`
- **Availability across Routes:** Verified on all 13 routes:
  - [✓] Home
  - [✓] Learning Paths
  - [✓] Modules
  - [✓] Workspace
  - [✓] Content Pack
  - [✓] Retrieval Playground
  - [✓] Settings
  - [✓] Knowledge Graph
  - [✓] Laboratory
  - [✓] Memory
  - [✓] Semantic Learning
  - [✓] Visualizations
  - [✓] Generative Layer
- **Specific UI Action Controls:**
  - Selector dropdown element: `#nv-agent-select`
  - Input query field: `#nv-agent-input`
  - Send action button: `.nv-agent-submit`

### Curiosity & Engagement Agent (`curiosity-engagement`)

- **Primary UI Shell:** Didactic Agent Assist Panel (`#nv-agent-panel`)
- **Agent Specific Selector:** `[data-agent-curiosity-actions]`
- **Availability across Routes:** Verified on all 13 routes:
  - [✓] Home
  - [✓] Learning Paths
  - [✓] Modules
  - [✓] Workspace
  - [✓] Content Pack
  - [✓] Retrieval Playground
  - [✓] Settings
  - [✓] Knowledge Graph
  - [✓] Laboratory
  - [✓] Memory
  - [✓] Semantic Learning
  - [✓] Visualizations
  - [✓] Generative Layer
- **Specific UI Action Controls:**
  - Selector dropdown element: `#nv-agent-select`
  - Input query field: `#nv-agent-input`
  - Send action button: `.nv-agent-submit`


---
*Report generated automatically by NeuralVerse Agentic Validation Harness.*
