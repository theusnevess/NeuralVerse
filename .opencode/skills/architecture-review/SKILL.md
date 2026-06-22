---
name: architecture-review
description: Review NeuralVerse architecture, boundaries, modularity, and maintainability before implementation.
---

# Architecture Review Skill

Use this skill before structural changes.

Rules:
- Inspect existing files before proposing changes.
- Preserve current architecture unless explicitly asked to refactor.
- Prefer small, incremental changes.
- Do not introduce backend, database, auth, or APIs unless requested.
- Identify risks before editing.
- Separate UI, state, data, and presentation concerns.
- Avoid duplication and dead abstractions.

Output:
- Current architecture understanding
- Proposed minimal change
- Files likely affected
- Risks
- Verification commands
