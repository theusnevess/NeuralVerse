---
name: token-economy-auditor
description: Audit and reduce token waste in NeuralVerse agentic development workflows, prompts, repository inspection, and validation reports.
---

# Token Economy Auditor

## Purpose

Prevent unnecessary token usage while preserving engineering quality.

Remove redundant context, duplicated explanations, broad scans, excessive validation output, and low-value verbosity without sacrificing correctness.

## When To Use

Use for high-cost tasks, audits, repository-wide work, long reports, many-file inspections, or workflows involving multiple skills/agents.

## Core Rules

- Prefer targeted search over broad reads.
- Prefer diffs over full file re-reading after edits.
- Prefer command summaries over full logs.
- Prefer focused validation over broad validation unless the task is release-critical or explicitly asks for full QA.
- Avoid repeating canonical NeuralVerse principles unless relevant to the task.
- Avoid restating every Skill rule in final reports.
- Avoid verbose implementation narratives.
- Keep reports factual, compact, and traceable.
- Escalate to broader context only when evidence is insufficient.

## Workflow

1. Classify the task as low, medium, or high token cost.
2. Define the smallest useful context set.
3. Prefer search, diffs, and summaries over full-file or full-log reads.
4. Escalate only when evidence is insufficient.
5. Keep final reporting compact and traceable.

## Validation

Flag and avoid:

- reading entire directories without reason;
- opening large files when `rg` would locate the needed symbol;
- pasting full command outputs when summary is enough;
- repeating unchanged architecture context;
- running full QA for small copy or spacing changes;
- including generated files, backups, logs, screenshots, caches, or `node_modules`;
- producing long final reports that do not add actionable value;
- invoking multiple skills when one focused skill is enough.

Use:

- `rg` for targeted search;
- `fd` for file discovery;
- `git diff --stat` and `git diff -- <file>`;
- compact command summaries;
- affected-scope lists;
- evidence-based escalation;
- small validation batches;
- explicit "not inspected" boundaries.

## Report

- Cost level.
- Token risks identified.
- Context avoided.
- Economy techniques used.
- Whether broader inspection was justified.

## Forbidden

- Do not optimize for brevity at the expense of evidence.
- Do not repeat unchanged governance text in final reports.
- Do not paste large logs when a summary is sufficient.
