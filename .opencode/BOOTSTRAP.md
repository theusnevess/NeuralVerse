# NeuralVerse Mandatory Bootstrap

## HARD REQUIREMENT

This file MUST be read before ANY implementation task.
Direct code changes without this bootstrap are forbidden.

## Bootstrap Sequence

### Step 1: Harness Activation (MANDATORY)

Load `.opencode/skills/harness-orchestrator/SKILL.md`.
This is the mandatory entry point. No task may bypass it.

### Step 2: Context Governance (MANDATORY)

Load `.opencode/skills/context-governance/SKILL.md`.
Scope boundaries must be defined before any file reads.

### Step 3: Pipeline Gatekeeper (MANDATORY)

Load `.opencode/skills/pipeline-gatekeeper/SKILL.md`.
This validates that steps 1 and 2 were completed.

### Step 4: Task Classification

Classify the task:

- Trivial: single-line fix, no architecture impact
- Small: 1-2 files, minimal risk
- Medium: 3-8 files, moderate risk
- Large: 9+ files, high risk
- Audit: repository-wide analysis

### Step 5: Cost Level

Classify token cost:

- Low: trivial/small, 1-3 files
- Medium: medium, 3-8 files, focused scope
- High: large/audit, 9+ files, broad scope

### Step 6: Skill Selection

Select 3-5 specialist skills from the activation matrix.
Include `git-hygiene` for any task that modifies files.
Include `token-economy-auditor` for medium/high cost tasks.

### Step 7: Execution Plan

Produce a plan BEFORE any file changes.
The plan must list:

- Files to change (with rationale)
- Validation commands to run
- Risk assessment
- Backward compatibility check

### Step 8: Implementation

Execute the plan with minimal safe changes.
Do not exceed the planned scope.

### Step 9: Validation

Run all validation commands specified in the plan.
Report actual command output, not assumed results.

### Step 10: Report

Include the mandatory Harness Pipeline Used summary:

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

## Enforcement

Any response that modifies files WITHOUT this summary is non-compliant.
Non-compliant responses must be corrected before proceeding.

## Forbidden

- Skipping any step in this bootstrap
- Direct code changes without harness activation
- Omitting the Harness Pipeline Used summary
- Claiming validation without running commands
- Proceeding without an execution plan
