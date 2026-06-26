# NeuralVerse — OpenCode Agent Instructions

## Project Role

You are working on NeuralVerse, an AI learning and research platform.

Treat the project as a serious product, not a toy demo. Prioritize clean architecture, visual quality, maintainability, accessibility, and reliable behavior.

## Core Rules

- Make small, controlled changes.
- Do not rewrite large parts of the project unless explicitly requested.
- Preserve existing visual identity and design language.
- Do not add unnecessary dependencies.
- Do not introduce backend, auth, database, or external APIs unless explicitly requested.
- Prefer deterministic, testable implementations.
- After changing UI behavior, verify with browser testing when possible.
- Keep code readable and modular.
- Do not leave dead code, debug logs, unused imports, or placeholder comments.
- Do not invent product requirements. Ask or infer conservatively.

## NeuralVerse Design Direction

The application should feel like a premium dark AI research environment.

Preferred aesthetic:

- dark scientific interface
- precise spacing
- subtle cyan/blue accents
- elegant cards
- restrained animation
- low visual noise
- research observatory / knowledge system feeling
- no generic AI clichés
- no cartoon mascots
- no excessive gradients
- no clutter

## UI Quality Standards

For every UI change, check:

- responsive layout at mobile, tablet, and desktop sizes
- no horizontal overflow
- no broken spacing
- no redundant labels
- no awkward empty areas
- clear hover/focus states
- accessible keyboard navigation
- readable contrast
- consistent typography
- consistent component spacing

## Graph / Knowledge Visualization Rules

For graph-related work:

- prioritize clarity over visual complexity
- avoid tangled node layouts
- keep interactions understandable
- labels must not overlap heavily
- selected/hovered nodes should expose useful context
- graph controls must be obvious and stable
- use Playwright or browser inspection to validate visual behavior

## Testing Discipline

Before considering a task complete:

- run relevant build/test commands
- check console errors
- validate affected routes manually or with Playwright
- report what was tested
- report anything not tested

## Communication Style

When responding:

- be concise
- state changed files
- state commands run
- state test results
- state remaining risks

## Forbidden

- Do not make broad architectural rewrites without approval.
- Do not add fake content just to fill space.
- Do not hide errors.
- Do not claim tests passed unless they were actually run.
- Do not commit unless explicitly asked.

# NeuralVerse Local Agent Rules

## Operating Principle

Use the NeuralVerse Agentic Development Harness for all non-trivial development tasks.

Do not treat the model as the development system. The development system is:

- local project instructions;
- bounded context;
- task-specific skills;
- validation;
- documentation;
- Git hygiene;
- persistent memory.

## Default Workflow

1. Classify the task with `harness-orchestrator`.
2. Limit repository context with `context-governance`.
3. Use `token-economy-auditor` for medium or large tasks.
4. Activate only the skills relevant to the task.
5. Locate before reading; confirm before editing; inspect before refactoring.
6. Apply minimal safe changes.
7. Validate with targeted commands.
8. Use Playwright for UI, route, responsiveness, or browser behavior.
9. Record durable decisions with `obsidian-memory-maintainer` when warranted.
10. Finish with `git-hygiene`.

## Context Rules

- Do not read the whole repository by default.
- Do not inspect `node_modules`, build outputs, backups, logs, caches, or generated artifacts.
- Prefer diffs over rereading entire files after edits.
- Prefer concise summaries over full logs.

## Tool Rules

Use:

- `fd` for file discovery.
- `rg` for text and symbol search.
- `ast-grep` for structural JavaScript/TypeScript searches.
- Playwright for browser validation.
- Context7 for external library/framework documentation.

Do not inspect `node_modules`, `dist`, `build`, `.vite`, caches, screenshots, backups, generated reports, or lock files unless directly relevant.

## Safety Rules

- Do not run destructive commands without explicit approval.
- Do not commit unless explicitly requested.
- Do not install tools, plugins, MCPs, or dependencies without clear justification.
- Do not modify secrets, credentials, `.env` files, or global config unless explicitly requested.

## NeuralVerse Governance

Implementation decisions must respect:

Vision
→ UI Constitution
→ Architecture Guide
→ Local Harness
→ Implementation

## Reporting

For significant work, report:

- task classification;
- skills used;
- context scope;
- files changed;
- commands run;
- validation results;
- remaining risks.

## Repository Inspection Priority

Use repository tools in this order:

1. `git status --short` for worktree safety.
2. `fd` for file discovery.
3. `rg` for text and symbol search.
4. `ast-grep` for structural JavaScript/TypeScript searches.
5. focused file reads.
6. `git diff` after edits.

Do not begin with broad file reads.
