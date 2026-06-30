---
name: pipeline-gatekeeper
description: Validates harness pipeline adherence before allowing file modifications. MANDATORY for every task. Load this skill BEFORE any implementation.
---

# Pipeline Gatekeeper

## Purpose

Prevents non-compliant execution by validating that the harness pipeline is being followed before any file modification is permitted.

## When To Use

ALWAYS. This skill must be loaded for EVERY task that involves file changes.

This is not optional. This is not conditional. This is mandatory.

## Enforcement Rules

### Pre-Implementation Gate

Before ANY file edit, verify ALL of the following:

1. **harness-orchestrator was loaded**
   - Check: task classification exists (trivial/small/medium/large/audit)
   - Check: cost level was determined (low/medium/high)

2. **context-governance was loaded**
   - Check: context scope was defined
   - Check: affected files were identified

3. **At least 1 specialist skill was selected**
   - Check: skill list exists with rationale

4. **An execution plan exists**
   - Check: files to change are listed
   - Check: validation commands are defined

5. **Repository discovery was performed**
   - Check: `fd`, `rg`, or `ast-grep` was used before reading files

### Gate Decision

**ALL conditions met** -> PROCEED with implementation

**ANY condition missing** -> BLOCK implementation

### Required Output

When blocking, output exactly:

```
HARNESS GATE: BLOCKED
Missing: [list each missing step]
Required: Complete the missing steps before proceeding.
Example: Load harness-orchestrator, define context scope, select skills.
```

When allowing, output exactly:

```
HARNESS GATE: PASSED
Pipeline: [task-class] -> [skills] -> [validation]
```

### Post-Implementation Gate

After ALL file changes are complete, verify:

1. All validation commands were actually run (not just listed)
2. The Harness Pipeline Used summary is present in the response
3. No unplanned changes were made
4. `git-hygiene` was included if files were modified

If post-implementation gate fails, output:

```
HARNESS POST-GATE: NON-COMPLIANT
Issue: [what is missing]
Required: Add the missing component before marking complete.
```

## Checklist Template

Use this checklist for every task:

```
HARNESS CHECKLIST:
[ ] harness-orchestrator loaded
[ ] context-governance loaded
[ ] pipeline-gatekeeper loaded
[ ] task classified: [trivial/small/medium/large/audit]
[ ] cost level: [low/medium/high]
[ ] skills selected: [list]
[ ] execution plan produced
[ ] repository discovery performed
[ ] validation commands defined
[ ] implementation complete
[ ] validation executed
[ ] Harness Pipeline Used summary included
```

## Forbidden

- Proceeding without task classification
- Proceeding without context-governance
- Proceeding without at least one specialist skill
- Proceeding without an execution plan
- Allowing file changes without validation commands defined
- Allowing file changes without the Harness Pipeline Used summary
- Skipping the checklist
- Marking complete without running validation
