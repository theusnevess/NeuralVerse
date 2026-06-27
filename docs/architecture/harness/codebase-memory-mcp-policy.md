# Codebase Memory MCP — Integration Policy

## Status

Experimental candidate. Not installed. Not configured. Policy only.

## Purpose

Provide a structural code discovery layer for medium and high complexity
tasks. Help the agent find relevant files, call relationships, and module
ownership faster than repeated `fd` and `rg` scans.

The candidate is meant to complement, not replace, existing repository
inspection tools.

## Intended Position in the Pipeline

The MCP would sit inside the repository discovery stage, not above it.

```
Harness Orchestrator
  → Context Governance
  → Codebase Memory MCP        (experimental)
  → Repository Discovery       (fd, rg, ast-grep)
  → Focused Reads
  → Specialist Skills
```

The MCP is a candidate input to discovery. It does not bypass
context-governance, and it does not replace evidence-first inspection.

## Rules

- The MCP must never replace `fd`, `rg`, `ast-grep`, or focused file reads.
- It may suggest relevant files, call relationships, and module ownership.
- Its output must be verified with repository evidence before acting on it.
  Stale indexes are a real risk and must be caught by direct inspection.
- It should not be used for small CSS, text, or documentation tasks.
- It should not be used when the affected area is already known and small.
- It should be evaluated through a pilot before official adoption.
- Do not install or configure it without explicit approval.

## When To Consider It

- Medium or high complexity tasks.
- Tasks that span multiple modules or directories.
- Tasks where the agent would otherwise perform several broad searches
  before locating the right files.
- Architectural or refactor work that needs ownership context.

## When Not To Use It

- Small, localized, or single-file edits.
- Pure documentation, label, or copy changes.
- Read-only audits and dry runs.
- Configuration-only changes.
- Tasks that already have a clear, narrow scope.

## Pilot Criteria

Before promoting the MCP from experimental to active, a pilot must show
that it:

- reduces the number of files inspected per task;
- reduces repeated searches for the same symbols;
- improves module and ownership discovery;
- does not introduce stale-index errors;
- does not cause false confidence from missing or partial results;
- integrates cleanly with OpenCode without breaking the existing
  `harness-orchestrator` workflow.

If any criterion fails, the MCP remains policy-only. Do not paper over
weak results with optimism.

## Failure Modes To Watch

- Stale index after large refactors or file moves.
- Hallucinated call relationships that the agent trusts without checking.
- Coverage gaps in niche directories or generated code.
- Latency that pushes the agent toward skipping the tool.
- Coupling that makes the Harness depend on a single external service.

## Reporting

While the MCP remains policy-only, the Harness Pipeline Used summary
should mention that the Codebase Memory MCP was considered and rejected
for the current task, with a short reason. This keeps the policy
visible until the pilot either promotes it or removes it from the
candidate list.

## Forbidden

- Installing or configuring the MCP without explicit approval.
- Treating MCP suggestions as ground truth.
- Using the MCP for tasks outside its intended scope.
- Promoting the MCP from experimental to active without passing the
  pilot criteria.
