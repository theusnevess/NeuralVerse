# Codebase Memory MCP — Integration Policy

## Status

Experimental. Configured. Awaiting execution.

- Configuration: present in both `.opencode/opencode.json` and
  `neuralverse/.opencode/opencode.json` under `mcp.codebase-memory`.
- Execution: not verified in the current environment. The runtime
  shell has no Node.js, npm, npx, or bun, so the configured command
  cannot be launched here. A real OpenCode run in a Node-equipped
  environment is required to validate the server.
- Promotion: still requires a pilot that demonstrates real reduction
  in files inspected, repeated searches, and module discovery cost,
  without introducing stale-index errors or false confidence.

## Chosen Package

`codebase-memory-mcp@0.8.1` published by `deusdata` on npm. The
package is the most-downloaded exact-name match for "codebase memory
mcp" on the npm registry at the time of integration. It is MIT-licensed
and uses tree-sitter for structural code analysis. There is no
single "official" Codebase Memory MCP blessed by OpenCode; this
choice is documented and revisable.

Repository: https://github.com/DeusData/codebase-memory-mcp
Package: https://www.npmjs.com/package/codebase-memory-mcp

## Configuration

Both opencode.json files declare the same MCP block:

```json
"mcp": {
  "codebase-memory": {
    "type": "local",
    "command": ["npx", "-y", "codebase-memory-mcp@0.8.1"],
    "cwd": ".",
    "enabled": true,
    "timeout": 15000
  }
}
```

- `type: "local"` — the MCP runs as a child process.
- `command` — uses `npx -y` to fetch and run the pinned version.
- `cwd: "."` — the MCP indexes the workspace root.
- `enabled: true` — OpenCode will attempt to start it.
- `timeout: 15000` — 15 seconds, well above the 5s default to absorb
  cold-start indexing for larger codebases.

## Purpose

Provide a structural code discovery layer for medium and high complexity
tasks. Help the agent find relevant files, call relationships, and module
ownership faster than repeated `fd` and `rg` scans.

The MCP is meant to complement, not replace, existing repository
inspection tools.

## Intended Position in the Pipeline

```
Harness Orchestrator
  → Context Governance
  → Codebase Memory MCP        (experimental, optional)
  → Repository Discovery       (fd, rg, ast-grep)
  → Focused Reads
  → Specialist Skills
```

The MCP is a candidate input to discovery. It does not bypass
context-governance, and it does not replace evidence-first inspection.

## Activation Rules

The orchestrator decides whether to activate the MCP based on task
class.

Activate for:

- medium or high complexity tasks;
- architecture exploration;
- dependency discovery;
- module ownership questions;
- cross-file relationships;
- graph and retrieval systems;
- large refactors.

Do NOT activate for:

- CSS fixes, spacing, padding, label, or tooltip changes;
- documentation, copy, spelling, or formatting edits;
- small UI tweaks;
- trivial bug fixes;
- single-line or single-file edits where scope is already known.

## Rules

- The MCP must never replace `fd`, `rg`, `ast-grep`, or focused file reads.
- It may suggest relevant files, call relationships, and module ownership.
- Its output must be verified with repository evidence before acting on it.
  Stale indexes are a real risk and must be caught by direct inspection.
- It should not be used for small CSS, text, or documentation tasks.
- It should not be used when the affected area is already known and small.

## Rollback

To disable the MCP without removing the configuration block, set
`"enabled": false` in both `mcp.codebase-memory` blocks. To remove
the MCP entirely, delete the `mcp` object from both `opencode.json`
files. No application code, no skills, and no documentation depend on
the MCP being present, so removal is safe.

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

If any criterion fails, the MCP remains experimental. Do not paper over
weak results with optimism.

## Failure Modes To Watch

- Stale index after large refactors or file moves.
- Hallucinated call relationships that the agent trusts without checking.
- Coverage gaps in niche directories or generated code.
- Latency that pushes the agent toward skipping the tool.
- Coupling that makes the Harness depend on a single external service.

## Reporting

While the MCP remains experimental, the `## Harness Pipeline Used`
summary should state whether the MCP was considered and, if so,
whether it was activated or skipped. The `## Confidence Assessment`
should note that MCP output is unverified when it was the primary
input to a discovery decision.

## Forbidden

- Treating MCP suggestions as ground truth.
- Using the MCP for tasks outside its intended scope.
- Promoting the MCP from experimental to active without passing the
  pilot criteria.
- Reporting MCP output as "validated" when no `fd`/`rg`/`ast-grep`/
  focused-read cross-check was run.
