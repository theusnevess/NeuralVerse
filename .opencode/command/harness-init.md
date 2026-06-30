---
description: Manually activate the NeuralVerse Harness pipeline for the current turn. Equivalent to calling the harness_activate tool.
agent: build
---

$ARGUMENTS

# Harness Manual Activation

The user has explicitly invoked the Harness. The plugin `harness-guard` has already
reset the gate for this turn — you must call the `harness_activate` custom tool
before any file mutation or destructive bash command in your response.

## What to do, in order

1. **Call `harness_activate` first.** Required args:
   - `task_classification`: trivial | small | medium | large | audit
   - `cost_level`: low | medium | high
   - `skills_planned`: the specialist skills you will use (comma-separated)
   - `context_scope`: files, directories, or components that will be touched
2. After activation returns, **proceed with the user's request** following the
   adaptive pipeline from `.opencode/skills/harness-orchestrator/SKILL.md`:
   - Context governance — define boundaries.
   - Repository discovery — `fd` → `rg` → `ast-grep` (locate before reading).
   - Specialist skills — activate only the planned set.
   - Implementation — smallest safe change inside the declared scope.
   - Validation — run actual commands, paste real output.
   - Report — end with `## Harness Pipeline Used` if files were modified.
   - Git hygiene — status, diff, files-changed list.
3. **Do not** call `harness_activate` for trivial subagent Q&A inside the same
   turn — the gate stays open for the rest of the turn once activated.
4. **Do not** bypass the gate. The plugin will throw before `edit`, `write`,
   `patch`, `multiedit`, or destructive bash if the gate is closed.

## Failure mode

If the user message above is empty, run the harness activation with the most
conservative defaults:

- `task_classification`: `trivial`
- `cost_level`: `low`
- `skills_planned`: `git-hygiene`
- `context_scope`: `none — activation only`

Then ask the user what they want to do next.
