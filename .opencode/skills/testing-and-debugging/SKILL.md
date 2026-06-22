---
name: testing-and-debugging
description: Diagnose bugs, run focused tests, inspect logs, and fix regressions safely.
---

# Testing and Debugging Skill

Use this skill for failures, regressions, flaky behavior, console errors, and validation.

Rules:
- Reproduce the issue before fixing when possible.
- Inspect logs and errors carefully.
- Prefer minimal fixes.
- Add or update tests only when useful.
- Do not hide errors.
- Do not mark complete unless validation was run.
- If tests cannot be run, explain why.

Workflow:
1. Identify expected behavior.
2. Reproduce actual behavior.
3. Locate likely source.
4. Apply minimal fix.
5. Run targeted validation.
6. Report remaining risk.
