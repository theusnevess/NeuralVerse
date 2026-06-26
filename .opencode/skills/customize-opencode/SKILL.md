---
name: customize-opencode
description: Safely customize OpenCode configuration, agents, skills, permissions, and project instructions.
---

# Customize OpenCode

## Purpose

Safely modify OpenCode project configuration, skills, permissions, agents, and tool integration.

## When To Use

Use for `.opencode` changes, skill contracts, OpenCode config, MCP/plugin proposals, permissions, or agent setup.

## Core Rules

- Inspect current config before editing.
- Prefer project-level configuration over risky global changes.
- Keep configuration minimal and reversible.
- Preserve working provider/model settings.
- Avoid adding MCPs/plugins unless they provide measurable value.
- Validate JSON/JSONC after editing.
- Report exact files changed and rollback path.

## Workflow

1. Locate relevant config or skill files.
2. Inspect existing behavior and constraints.
3. Apply the smallest reversible change.
4. Validate syntax and affected contracts.

## Validation

- Validate JSON/JSONC when config changes.
- Verify skill frontmatter remains valid.
- Verify no secrets or provider keys were added.

## Report

- Config or skill files changed.
- Validation performed.
- Rollback path.
- Remaining setup risk.

## Forbidden

- Do not overwrite existing config without a clear rollback path.
- Do not add paid providers or API keys.
- Do not enable automatic destructive permissions without approval.
- Do not claim a provider works unless tested.
