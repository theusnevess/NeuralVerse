---
name: customize-opencode
description: Safely customize OpenCode configuration, agents, skills, permissions, and project instructions.
---

# Customize OpenCode Skill

Use this skill when modifying OpenCode setup.

Rules:
- Inspect current config before editing.
- Back up config files before changes.
- Prefer project-level configuration over risky global changes.
- Keep configuration minimal and reversible.
- Do not remove working provider/model settings.
- Avoid adding MCPs/plugins unless they provide clear value.
- Validate JSON/JSONC after editing.
- Restart OpenCode after config changes.
- Report exact files changed and rollback path.

Forbidden:
- Do not overwrite existing config without backup.
- Do not add paid providers or API keys.
- Do not enable automatic destructive permissions without approval.
- Do not claim a provider works unless tested.
