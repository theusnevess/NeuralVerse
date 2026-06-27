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

## Harness V2 — Intelligence Layers

V2 extends the v1 foundation with four intelligence layers. They add
discipline, measurement, and self-evaluation without expanding the
runtime surface. No new dependencies are introduced.

### Ponytail Engineering Discipline

A specialist skill that runs before code is written or modified. It
applies a decision ladder that forces the agent to ask:

1. Does this need to exist?
2. Does the codebase already solve this?
3. Can an existing component, function, or module be reused?
4. Can the platform or standard library solve it?
5. Can an existing dependency solve it?
6. Can the change be one line or localized?
7. Only then write the minimal required code.

Ponytail prefers deletion over addition, reuse over new abstraction,
and local fixes over global refactors. It activates for implementation
tasks and is skipped for documentation, audits, dry runs, and
configuration inspection. See
`.opencode/skills/ponytail-engineering/SKILL.md`.

### Telemetry Layer

A compact `## Harness Telemetry` block appears in final reports for
non-trivial tasks. Fields cover task type, cost level, pipeline
variant, skills activated and skipped, files inspected and modified,
commands run, validation performed, documentation and memory updates,
estimated context scope, and remaining risks.

Telemetry is local report telemetry only. There are no external
services, no secret logging, and no persistent storage. See
`.opencode/skills/harness-telemetry/SKILL.md`.

### Confidence Engineering

A `## Confidence Assessment` block appears in final reports for
medium/high cost tasks and all implementation tasks. Scores cover
repository evidence, validation confidence, architecture consistency,
scope control, residual risk, and overall confidence on a 0-100 scale.

Confidence is evidence-based. If overall confidence is below 80, a
required follow-up is stated. If it is below 60, the task is not
presented as complete. See
`.opencode/skills/confidence-engineering/SKILL.md`.

### Codebase Memory MCP — Experimental Candidate

An MCP-based structural code discovery layer is on the candidate
list. Its intended position is inside the repository discovery stage,
after context governance and before `fd`, `rg`, `ast-grep`, and
focused reads.

The candidate is policy-only at this stage. It is not installed and
not configured. It must not replace `fd`, `rg`, `ast-grep`, or focused
reads, and its output must be verified with repository evidence. It
will be promoted only after a pilot that demonstrates real reduction
in files inspected, repeated searches, and module discovery cost,
without introducing stale-index errors or false confidence. See
`docs/architecture/harness/codebase-memory-mcp-policy.md`.

### Headroom — Deferred

Headroom-style context compression remains deferred. It will only be
considered once the telemetry layer has produced enough evidence that
context compression is actually needed. Adding it before that would
be premature optimization.

## Reporting Contract (V2)

Non-trivial final outputs must include, in this order:

1. `## Harness Pipeline Used` — compact checklist.
2. `## Harness Telemetry` — produced by `harness-telemetry`.
3. `## Confidence Assessment` — produced by `confidence-engineering`.

Trivial or read-only responses may omit the telemetry and confidence
blocks.
