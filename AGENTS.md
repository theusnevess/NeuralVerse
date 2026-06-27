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

The Harness follows an adaptive pipeline rather than a fixed sequence.
The Harness Orchestrator dynamically selects the minimum workflow required.

### Common Patterns

**Simple bug fix:**
git status → orchestrator → context → testing-and-debugging → git-hygiene

**Architecture change:**
git status → orchestrator → context → token-auditor → architecture-review → documentation → obsidian → git-hygiene

**UI polish:**
git status → orchestrator → context → design-system → react-ui-polish → accessibility → playwright → git-hygiene

### Pipeline Stages

1. `git status --short` — worktree safety
2. Harness Orchestrator — **always first**. Classify task, select skills. May determine the task is minimal and reduce the pipeline.
3. Context Governance — limit scope
4. Token Economy Auditor — cost evaluation (medium/large only)
5. Repository Discovery — `fd` → `rg` → `ast-grep` (locate before reading)
6. Specialist Skills — activate 3-5 relevant skills
7. Implementation — minimal safe changes
8. Validation — targeted commands
9. Documentation — update if decisions changed
10. Git Hygiene — final status, diff, report

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

Every non-trivial final output must include, in this order:

1. `## Harness Pipeline Used` — compact checklist.
2. `## Harness Telemetry` — produced by the `harness-telemetry` skill.
3. `## Confidence Assessment` — produced by the `confidence-engineering`
   skill.

Trivial or read-only responses may omit telemetry and confidence.

### Harness Pipeline Used

```
## Harness Pipeline Used

- Task classification:
- Cost level:
- Skills activated:
- Skills skipped:
- Context scope:
- Repository discovery:
- Validation:
- Documentation/memory decision:
- Git hygiene:
```

### Harness Telemetry

```
## Harness Telemetry

- Task type:
- Cost level:
- Pipeline variant:
- Skills activated:
- Skills skipped:
- Files inspected:
- Files modified:
- Commands run:
- Validation performed:
- Documentation updated:
- Persistent memory updated:
- Estimated context scope:
- Remaining risks:
```

### Confidence Assessment

```
## Confidence Assessment

- Repository evidence:
- Validation confidence:
- Architecture consistency:
- Scope control:
- Residual risk:
- Overall confidence:
- Reason for score:
- Required follow-up:
```

If overall confidence is below 80, the `Required follow-up` field must
name a concrete next validation step. If overall confidence is below
60, the task must not be presented as complete.

## Repository Inspection Priority

Use repository tools in this order:

1. `git status --short` for worktree safety.
2. `fd` for file discovery.
3. `rg` for text and symbol search.
4. `ast-grep` for structural JavaScript/TypeScript searches.
5. focused file reads.
6. `git diff` after edits.

Do not begin with broad file reads.
