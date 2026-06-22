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
