---
name: harness-orchestrator
description: Select the correct NeuralVerse local skills, execution order, validation path, and context scope for agentic development tasks.
---

# Harness Orchestrator

## Purpose

Classify non-trivial NeuralVerse tasks, select the smallest effective skill set, and enforce a deterministic inspect-edit-validate-report workflow.

## When To Use

Use at the beginning of medium, large, ambiguous, or governance-sensitive tasks.

Do not use for trivial one-file edits unless classification is unclear.

## Core Rules

- Do not start by editing files.
- Classify the task before activating specialist skills.
- Activate only the skills needed for the task; target 3 to 5 skills for most medium or large tasks.
- Prefer minimal context over broad repository reading.
- Use repository evidence before proposing architecture or workflow changes.
- Preserve NeuralVerse canonical architecture and app behavior unless explicitly asked to change it.
- Avoid unnecessary dependencies, rewrites, MCPs, plugins, or speculative abstractions.
- Do not claim validation unless commands or checks were actually run.
- Always include `context-governance` for medium, large, audit, or repository-wide tasks.
- Include `token-economy-auditor` for high-cost, multi-skill, audit, or repository-wide tasks.
- Finish significant work with `git-hygiene`.

## Skill Taxonomy

- Core: `harness-orchestrator`, `context-governance`, `token-economy-auditor`, `obsidian-memory-maintainer`.
- Engineering: `architecture-review`, `typescript-expert`, `testing-and-debugging`, `performance-optimization`.
- UI: `design-system-guardian`, `react-ui-polish`, `accessibility-audit`, `playwright-qa`.
- Retrieval: `rag-and-retrieval`, `graph-polish`.
- Workflow: `documentation-maintainer`, `git-hygiene`, `customize-opencode`.
- Domain: `vision-ai`.

Keep the flat skill directory layout for OpenCode compatibility; use the taxonomy for selection, not path nesting.

## Workflow

1. Inspect `git status --short`.
2. Define task class, cost level, and affected scope.
3. Select the minimal specialist skill set from the activation matrix.
4. Locate before reading; confirm before editing; inspect before refactoring.
5. Apply the smallest safe change.
6. Run focused validation.
7. Report changed files, commands, validation, and remaining risks.

## Skill Activation Matrix

### Architecture or structural change

Use: `architecture-review`, `typescript-expert`, `testing-and-debugging`, `documentation-maintainer`, `git-hygiene`.

### UI polish or visual refinement

Use: `design-system-guardian`, `react-ui-polish`, `accessibility-audit`, `playwright-qa`, `git-hygiene`.

### Retrieval, semantic navigation, or graph work

Use: `rag-and-retrieval`, `graph-polish`, `playwright-qa`, `documentation-maintainer`, `git-hygiene`.

Add `performance-optimization` only when rendering cost, graph scale, or interaction smoothness is part of the task.

### Bug, regression, console error, or broken behavior

Use: `testing-and-debugging`, `typescript-expert`, `playwright-qa`, `git-hygiene`.

### Performance issue

Use: `performance-optimization`, `typescript-expert`, `playwright-qa`, `git-hygiene`.

### Accessibility issue

Use: `accessibility-audit`, `playwright-qa`, `design-system-guardian`, `git-hygiene`.

### Documentation, ADR, setup, or workflow update

Use: `documentation-maintainer`, `architecture-review` when architecture is affected, `obsidian-memory-maintainer` for durable decisions, `git-hygiene`.

### OpenCode, skill, MCP, permission, or agent configuration

Use: `customize-opencode`, `documentation-maintainer`, `obsidian-memory-maintainer` for durable decisions, `git-hygiene`.

## Validation

- Verify the selected skill set is minimal and task-specific.
- Verify context scope follows `context-governance`.
- Verify broad audits or long reports follow `token-economy-auditor`.
- Verify app code was not changed for harness-only tasks.

## Report

- Task classification.
- Skills used.
- Context scope.
- Files changed.
- Commands run.
- Validation results.
- Remaining risks.

## Forbidden

- Do not activate every skill by default.
- Do not exceed 5 skills unless the reason is explicit.
- Do not read the entire repository unless evidence shows it is necessary.
- Do not add tools, MCPs, or plugins without measurable value.
- Do not bypass existing NeuralVerse governance.
- Do not use broad rewrites when localized changes are sufficient.
