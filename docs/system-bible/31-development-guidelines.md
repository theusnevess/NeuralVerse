# Development Guidelines

## Overview

These guidelines ensure that contributions to NeuralVerse maintain the project's architectural integrity, governance model, and quality standards.

## Preserve Governance

- Never modify the curriculum index at runtime
- Never allow UI or agents to change lifecycle status
- Never introduce scoring, grading, or mastery claims
- Always display lifecycle badges with correct governance tooltip
- Keep Draft/Reviewed as editorial metadata only

## Avoid Curriculum Mutation

- Curriculum data is read-only from the client perspective
- Content changes must be made to the source files (`docs/content/`) and the index regenerated
- No agent, search, or personalization feature should propose or execute curriculum changes
- The curriculum service caches the index but never writes to it

## Maintain Accessibility

- All new interactive elements must be keyboard accessible
- Use semantic HTML elements (button, nav, main, aside, dialog)
- Provide ARIA attributes where semantics are insufficient
- Test with keyboard-only navigation before submitting
- Support `prefers-reduced-motion` for all animations
- Maintain minimum 44x44px touch targets
- Never trap focus without an escape mechanism

## Preserve Evidence Boundary

- Agents must not claim learner achievement or competence
- Personalization data must not be used for mastery inference
- Curriculum status must not be presented as learner assessment
- All agent responses must include appropriate governance disclaimers
- Do not fabricate citations, scores, or evidence

## Maintain Local-First Behavior

- All user data must use localStorage (not IndexedDB unless approved)
- No data should be transmitted over the network
- No external API calls from client-side code
- No authentication or session management required
- Application must function with JavaScript enabled only

## Avoid External Dependencies

- Do not add npm packages without explicit approval
- Prefer vanilla JavaScript over frameworks for core functionality
- React is approved only for the islands pattern in `react-build/`
- No CDN-loaded scripts or resources
- No third-party analytics, tracking, or telemetry

## Code Conventions

- Use ES modules for new code (`import`/`export`)
- Prefer `const` over `let`; avoid `var`
- Use descriptive function and variable names
- Minimize DOM queries — cache references when reused
- Use the design token system (`var(--nv-*)`) for all styling
- Follow existing file naming: kebab-case for files, camelCase for functions

## Testing Requirements

- All new features must have corresponding audit or test coverage
- Run existing audit scripts before submitting changes
- Ensure zero new Critical or High failures in Extreme Audits
- Verify no console errors in affected routes
- Run `npm run build` to verify React islands compilation
- Check `git diff --check` for whitespace errors

## Component Conventions

- New UI components should match the existing card/button/badge patterns
- Use the CSS custom property system for colors, spacing, and typography
- Components must be responsive at mobile, tablet, and desktop
- Hover and focus states are required for all interactive elements
- Loading states should use skeleton screens when appropriate

## Documentation

- Architectural decisions should be documented in `docs/architecture/`
- New features should update the relevant system bible chapter
- Governance changes must be reflected in the governance model documentation
- Audit scripts should document their check count and pass/fail criteria

## Related Chapters

- [Governance Model](27-governance-model.md)
- [Testing and Certification](28-testing-and-certification.md)
- [System Architecture](02-system-architecture.md)
