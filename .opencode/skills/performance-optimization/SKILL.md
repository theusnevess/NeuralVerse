---
name: performance-optimization
description: Improve frontend performance, rendering efficiency, bundle discipline, and interaction smoothness.
---

# Performance Optimization

## Purpose

Improve frontend performance, rendering efficiency, bundle discipline, and interaction smoothness without changing behavior.

## When To Use

Use for performance-sensitive UI, JavaScript, animation, graph rendering, route behavior, and suspected rendering bottlenecks.

## Core Rules

- Measure or inspect before optimizing when possible.
- Prefer small, localized optimizations.
- Avoid premature rewrites.
- Avoid unnecessary dependencies.
- Reduce repeated DOM work and avoid avoidable re-renders.
- Keep animations smooth and restrained.
- Avoid expensive work during pointer, scroll, resize, and animation loops.
- Preserve behavior and accessibility while optimizing.

## Workflow

1. Identify the suspected bottleneck and affected interaction.
2. Inspect before changing code.
3. Apply the smallest optimization.
4. Validate behavior and performance-sensitive interaction.

## Validation

- Run focused checks for affected routes or interactions.
- Compare before/after behavior when practical.
- Verify no accessibility or UX regression was introduced.

## Report

- Bottleneck or suspected bottleneck.
- Files changed.
- Optimization applied.
- Commands or checks run.
- Remaining performance risks.

## Forbidden

- Do not perform speculative rewrites for unmeasured problems.
- Do not add dependencies for minor optimizations.
