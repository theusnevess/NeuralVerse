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

## Codebase Memory MCP (Experimental)

A local MCP server named `codebase-memory` is configured in
`neuralverse/.opencode/opencode.json` (and mirrored in the root
`.opencode/opencode.json`). It is an experimental structural discovery
accelerator. It must not be used for trivial CSS, text, or
documentation tasks. Activation is decided by `harness-orchestrator`
based on task class. Its output is a hint, never evidence. Every
suggestion must be confirmed through `fd` → `rg` → `ast-grep` →
focused reads. See
`docs/architecture/harness/codebase-memory-mcp-policy.md`.

## Reporting

The Harness produces a single **Harness Execution Report** for every
non-trivial task. Trivial or pure Q&A responses may omit it.

The canonical template lives in
`.opencode/skills/harness-orchestrator/SKILL.md` under
`## Report Format`. Telemetry, confidence, and git-hygiene all fill
fields into that single template — they do not emit separate blocks.

### Report Sections (in order)

1. `HARNESS SUMMARY` — ultra-compact header. 2-second scan.
2. `HARNESS EXECUTION REPORT` — full header.
3. `PIPELINE` — horizontal flow with `→`. Skipped stages omitted.
4. `EXECUTION TIMELINE` — chronological list of executed skills.
5. `ACTIVE SKILLS` / `SKIPPED SKILLS` — one skill per line.
6. `REPOSITORY DISCOVERY` — compact table.
7. `VALIDATION` — compact table.
8. `TELEMETRY` — dot-aligned metrics.
9. `CONFIDENCE` — aligned bars.
10. `REMAINING RISKS` — max 5 bullets.
11. `FOOTER` — tool-style status block.

### Icons

- `[✓]` executed, pass, yes
- `[•]` considered, active, info
- `[-]` skipped, no
- `[!]` warning, risk
- `[→]` flow, arrow

### Skeleton

```
════════════════════════════════════════════════════════════════════════════════
HARNESS SUMMARY

Task             <one short line>
Status           SUCCESS | PARTIAL | FAILED
Confidence       <n>%
Pipeline         <short name>
Skills           <n> active
Files            <n> modified
Validation       PASS | FAIL | PARTIAL
════════════════════════════════════════════════════════════════════════════════

--------------------------------------------------------------------------------
HARNESS EXECUTION REPORT

Task.................<one short line>
Status...............SUCCESS | PARTIAL | FAILED
Overall Confidence...<n>%
Cost Level...........low | medium | high
Pipeline Variant.....<short name>
Duration.............<n> s

--------------------------------------------------------------------------------
PIPELINE

Request → Classification → Context → Discovery
       → Skills → Validation → Confidence → Git

CONSIDERED   [•] Codebase Memory MCP
             [•] token-economy-auditor

--------------------------------------------------------------------------------
EXECUTION TIMELINE

01 <skill>          <short action>
02 <skill>          <short action>
03 <skill>          <short action>

--------------------------------------------------------------------------------
ACTIVE SKILLS

[✓] <skill>
[✓] <skill>

SKIPPED SKILLS

[-] <n> skills omitted

--------------------------------------------------------------------------------
REPOSITORY DISCOVERY

Discovered        <n>
Inspected         <n>
Modified          <n>
Ignored           <n> folders

Search tools      [✓] git status  [✓] fd  [✓] rg  [✓] ast-grep  [✓] focused reads

--------------------------------------------------------------------------------
VALIDATION

<command>          [✓] PASS
<command>          [✓] PASS
<command>          [✗] FAIL

--------------------------------------------------------------------------------
TELEMETRY

Task Type............<name>
Pipeline.............<name>
Context..............<n> files
Commands.............<n>
Duration.............<n> s
Files Modified.......<n>
Documentation........Updated | No Changes
Persistent Memory....Updated | No Changes

--------------------------------------------------------------------------------
CONFIDENCE

Repository Evidence       █████████░ 95%
Validation                ████████░░ 90%
Architecture              ██████████ 100%
Scope Control             █████████░ 93%
Residual Risk             LOW
Overall                   93%

--------------------------------------------------------------------------------
REMAINING RISKS

[!] <risk>
[!] <risk>
[!] <risk>

--------------------------------------------------------------------------------
FOOTER

Harness v2.0
Status            SUCCESS | PARTIAL | FAILED
Confidence        <n>%
Pipeline          <short name>
Duration          <n> s
════════════════════════════════════════════════════════════════════════════════
```

### HARNESS SUMMARY Rules

- First block in the report. 2-second scan.
- Pad the label column to 14 characters.
- The 7 fields are required: Task, Status, Confidence, Pipeline,
  Skills, Files, Validation.

### Pipeline Rules

- Render the executed pipeline as a **horizontal flow** with `→`.
- Maximum 8 stages per line. Wrap to a second line if needed.
- Skipped stages do not render in the flow. They go to
  `SKIPPED SKILLS` or to `CONSIDERED` beneath the flow.
- For trivial or read-only tasks, the flow collapses to the
  stages that actually ran.

### Execution Timeline Rules

- One entry per executed skill, in chronological order.
- Two-digit zero-padded number, then skill name padded to 22
  characters, then short action label (max 60 chars).
- The action label is the standard mapping from
  `harness-orchestrator/SKILL.md` unless a task-specific override
  is justified.
- Skills in `SKIPPED SKILLS` do not appear in the timeline.

### Active / Skipped Skills Rules

- Active: one per line, `[✓]` marker. Maximum 8 entries; the
  rest go to SKIPPED.
- Skipped: **summary only**. Show the count. Optionally list
  the first 3 names.
- Do not list every skipped skill by default.

### Repository Discovery Rules

- `Discovered` — count of files surfaced by `git status`, `fd`,
  `rg`, `ast-grep`, and focused reads.
- `Inspected` — count of files actually read.
- `Modified` — count of files actually written or edited.
- `Ignored` — count of folder patterns in the default ignore
  list. Default list: `node_modules`, `dist`, `build`, `coverage`,
  `docs`, `backups`, `artifacts`.
- `Search tools` — single line with `[✓]` markers for each tool
  actually used.

### Validation Rules

- One line per check.
- Command name padded to 24 characters, then `[✓] PASS`,
  `[✗] FAIL`, or `[~] PARTIAL`.

### Confidence Rules

- One line per metric: label, bar, score with `%`.
- Labels left-padded to 22 characters.
- Bars 10 cells wide: `█` filled, `░` empty.
- Bars round to the nearest 10.
- `Residual Risk` and `Overall` rows use the same alignment.
- Use exactly these four labels: `Repository Evidence`,
  `Validation`, `Architecture`, `Scope Control`.

### Remaining Risks Rules

- Maximum 5 bullets, `[!]` marker, no paragraphs.
- No duplication of facts that already appear in other sections.

### Footer Rules

- Compact status block.
- Mirrors the HARNESS SUMMARY `Status` and `Confidence`.
- Adds `Duration` for a tool-style close.

### Field Discipline

- One fact per line. No paragraphs anywhere in the report.
- A fact appears in at most one section.
- The `Status` and `Confidence` shown in the HARNESS SUMMARY,
  CONFIDENCE block, and FOOTER are the same value, by design
  (the report is allowed to repeat the absolute essentials at
  the boundary, but the body sections are deduplicated).
- Dot alignment is 18 characters for `TELEMETRY` and the
  `HARNESS EXECUTION REPORT` header lines.
- HARNESS SUMMARY label column is 14 characters.
- REPOSITORY DISCOVERY label column is 14 characters.
- VALIDATION command column is 24 characters.
- CONFIDENCE label column is 22 characters.
- FOOTER label column is 14 characters.
- Maximum 5 lines in `REMAINING RISKS`.
- The total report must remain scannable in under 10 seconds.
- HARNESS SUMMARY must scan in under 2 seconds.

### Status Mapping

- `SUCCESS` — overall confidence >= 80 and all validations passed.
- `PARTIAL` — overall confidence 60-79, or any validation PARTIAL.
- `FAILED` — overall confidence below 60, or any required validation
  failed.

### Confidence Thresholds

- Below 80 — first bullet in `REMAINING RISKS` is the required
  follow-up step.
- Below 60 — `Status` becomes `FAILED` or `PARTIAL`; the task is
  not presented as complete.

## Codebase Memory MCP

The Codebase Memory MCP is configured as an optional advisory
layer. It sits inside the canonical evidence chain:

```
Context Governance
  ↓
Codebase Memory MCP  (optional, advisory)
  ↓
fd
  ↓
rg
  ↓
ast-grep
  ↓
Focused Reads
  ↓
Evidence
```

The MCP may suggest candidate files. It never replaces repository
evidence. Every MCP suggestion must be confirmed through the
lower stages before being acted on. See
`docs/architecture/harness/codebase-memory-mcp-policy.md`.

## Repository Inspection Priority

Use repository tools in this order:

1. `git status --short` for worktree safety.
2. `fd` for file discovery.
3. `rg` for text and symbol search.
4. `ast-grep` for structural JavaScript/TypeScript searches.
5. focused file reads.
6. `git diff` after edits.

Do not begin with broad file reads.
