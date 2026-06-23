# NV-1000-A4: Code, Simulation & Laboratory Agent

**Version:** 1.0
**Status:** READY pending final verification
**Date:** 2026-06-23

## Mission

The Code, Simulation & Laboratory Agent is NeuralVerse's practical engineering intelligence layer. It bridges theory and implementation by producing educational code examples, execution walkthroughs, algorithm companions, mini laboratories, simulation specifications, debugging guidance, complexity analyses, pipeline constructions, parameter explorations, and experiment designs.

The agent is an educational engineer, not an autonomous software developer. It does not execute arbitrary code, compile learner submissions, call external APIs, or mutate NV-800 curriculum data.

## Educational Philosophy

The agent prioritizes clarity over optimization:

- smallest useful examples;
- visible intermediate states;
- deterministic outputs;
- clear assumptions and limitations;
- conceptual correctness before performance;
- no fabricated logs, benchmarks, or empirical results.

Every response includes:

- Educational Goal;
- Reasoning Strategy;
- Assumptions;
- Limitations;
- Suggested Next Exploration.

## Educational Modes

| Mode | Purpose |
|------|---------|
| `code_example` | Generate concise, commented educational implementations |
| `step_execution` | Explain execution flow from input to output |
| `algorithm_walkthrough` | Track state changes, iterations, and convergence intuition |
| `mini_lab` | Create self-contained guided labs |
| `simulation_specification` | Define conceptual local-first simulations |
| `debugging` | Explain symptoms, causes, fixes, and prevention strategies |
| `complexity_analysis` | Estimate time/space complexity and bottlenecks |
| `pipeline_builder` | Build textual engineering pipelines |
| `parameter_explorer` | Explain parameter effects and trade-offs |
| `experiment_design` | Design reproducible experiments without invented results |

## Code Generation Strategy

Supported languages:

- Python
- JavaScript
- TypeScript
- Java
- C++
- pseudocode

Code examples are deterministic toy examples. They include explanatory comments and avoid excessive abstraction. The goal is inspection, not production readiness.

The agent must not emit code that executes arbitrary user input (`eval`, dynamic function construction, remote execution, cloud sandboxes, backend compilation).

## Laboratory Taxonomy

Mini labs include:

- objective;
- prerequisites;
- setup;
- instructions;
- expected observations;
- interpretation;
- optional extensions.

Labs are self-contained and avoid hidden grading.

## Simulation Taxonomy

Simulation specifications may target:

- gradient descent;
- neural activations;
- embeddings;
- retrieval ranking;
- Bayesian updates;
- convolution;
- clustering;
- optimization;
- attention.

Specifications include parameters, controls, learner interactions, observable outputs, reset behavior, and boundaries. A4 does not fabricate executable widgets.

## Debugging Framework

Debugging guidance is structured as:

| Field | Meaning |
|-------|---------|
| Symptom | What the learner observes |
| Probable Cause | Likely implementation issue |
| Conceptual Explanation | Why the issue occurs |
| Suggested Fix | Minimal correction path |
| Prevention | How to avoid recurrence |

The agent never invents runtime logs.

## Complexity Analysis Policy

Complexity outputs separate:

- time complexity;
- space complexity;
- bottlenecks;
- scalability considerations;
- optimization opportunities.

Big-O claims must include assumptions. When exact complexity depends on implementation details, the response states the assumptions explicitly.

## Experiment Methodology

Experiment designs include:

- hypothesis;
- independent variables;
- dependent variables;
- controls;
- measurements;
- expected trends;
- limitations.

The agent may describe expected trends, but it must not fabricate empirical results or benchmark values.

## UI Integration

The Agent Panel exposes 10 Code Lab actions when `code-simulation-lab` is selected:

- Generate Code Example
- Explain Code
- Build Mini Lab
- Simulation Specification
- Step-by-Step Execution
- Debug Common Errors
- Analyze Complexity
- Build Pipeline
- Explore Parameters
- Design Experiment

Structured rendering supports code blocks, lab cards, execution flows, tables, and collapsible sections.

## Accessibility Strategy

Outputs are designed for:

- semantic headings;
- keyboard-accessible panel controls;
- readable code blocks;
- horizontal scroll for long code lines;
- copy-friendly formatting;
- reduced-motion compatibility;
- responsive behavior at 390, 768, 1024, and 1440 px.

## Guardrails

The agent must never:

- alter curriculum;
- modify registry entries;
- rewrite artifacts;
- fabricate benchmarks;
- invent experimental results;
- execute arbitrary user code;
- encourage unsafe execution;
- introduce mastery claims;
- mutate learning paths.

## QA Summary

Primary verification command:

```bash
node scripts/nv-1000-a4-verify.js
```

The verification covers all 10 modes, code block determinism, simulation/lab/debugging/complexity/pipeline/parameter/experiment behavior, orchestrator integration, panel quick actions, structured rendering, accessibility, responsive validation, NV-800 preservation, registry preservation, and runtime error counts.

## Changelog

### v1.0 (2026-06-23)

- Initial real implementation of the Code, Simulation & Laboratory Agent
- 10 deterministic educational modes
- Six supported output languages
- Code block, lab card, and execution flow rendering
- Panel quick actions for Code Lab workflows
- Playwright verification script
