# NeuralVerse Agentic Development Harness

## Status

Active.

## Purpose

Define how NeuralVerse uses local agent instructions, OpenCode, validation tools, and persistent memory to support controlled AI-assisted development.

## Core Principle

The model is not the development system.

The development system is the combination of:

- local project instructions;
- bounded context;
- task-specific skill selection;
- validation;
- documentation;
- Git hygiene;
- persistent memory.

## Canonical Foundation

- `harness-orchestrator`
- `context-governance`
- `token-economy-auditor`
- `obsidian-memory-maintainer`

These skills control orchestration, context scope, token economy, and durable memory. Specialist skills should delegate those concerns instead of duplicating them.

## Skill Taxonomy

The skill directory remains flat for OpenCode compatibility. Logical grouping is used for selection:

- Core: `harness-orchestrator`, `context-governance`, `token-economy-auditor`, `obsidian-memory-maintainer`.
- Engineering: `architecture-review`, `typescript-expert`, `testing-and-debugging`, `performance-optimization`.
- UI: `design-system-guardian`, `react-ui-polish`, `accessibility-audit`, `playwright-qa`.
- Retrieval: `rag-and-retrieval`, `graph-polish`.
- Workflow: `documentation-maintainer`, `git-hygiene`, `customize-opencode`.
- Domain: `vision-ai`.

## Current Global Tooling Layer

- `ripgrep`
- `fd`
- Node.js / npm
- Playwright CLI
- conservative OpenCode global rules

## Operating Model

1. Classify the task.
2. Select the minimal required local skills.
3. Limit repository context.
4. Apply small changes.
5. Validate with targeted commands.
6. Update documentation or memory only when meaningful.
7. Report changed files, commands run, validation, and remaining risks.

## Evidence-First Policy

- Locate before reading.
- Confirm before editing.
- Inspect before refactoring.
- Validate before concluding.
- Do not recommend architectural changes without repository evidence.

## Repository Inspection Policy

1. `git status --short`
2. `fd`
3. `rg`
4. `ast-grep`
5. focused file reads
6. `git diff` after edits

Avoid `node_modules`, `dist`, `build`, `.vite`, caches, screenshots, backups, generated reports, and lock files unless directly relevant.

## Activation Discipline

Most medium and large tasks should use 3 to 5 skills. Add more only when scope evidence requires it.

Common patterns:

- Architecture: `architecture-review`.
- UI: `design-system-guardian` + `react-ui-polish`.
- Retrieval or graph: `rag-and-retrieval` + `graph-polish`.
- Bug fixing: `testing-and-debugging`.
- Performance: `performance-optimization`.
- Documentation: `documentation-maintainer`.
- OpenCode configuration: `customize-opencode`.

## Current Rule

Do not add new MCPs, plugins, or agent frameworks unless they provide measurable value in at least one of these areas:

- token reduction;
- architecture safety;
- validation quality;
- repository navigation;
- persistent project memory.
