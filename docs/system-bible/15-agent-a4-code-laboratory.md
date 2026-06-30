# Agent A4: Code, Simulation & Laboratory

## Purpose

Provides guidance on code examples, algorithms, simulations, and practical implementation. Supports learning through code comprehension and experiment design.

## Educational Role

Code and laboratory mentor. A4 helps users understand implementations, run mental simulations, and design learning experiments.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `code_example` | "code", "example", "implementation" | Code example with explanation |
| `step_execution` | "step", "execute", "trace" | Step-by-step execution trace |
| `algorithm` | "algorithm", "pseudocode", "procedure" | Algorithm description and pseudocode |
| `mini_lab` | "lab", "experiment", "try" | Mini laboratory/experiment suggestion |
| `simulation` | "simulate", "simulation", "what if" | Conceptual simulation description |
| `debugging` | "debug", "error", "fix" | Debugging guidance for common errors |
| `complexity` | "complexity", "big O", "efficiency" | Computational complexity analysis |
| `pipeline` | "pipeline", "workflow", "pipeline" | Processing pipeline description |
| `parameter_explorer` | "parameter", "hyperparameter", "tune" | Hyperparameter understanding guidance |
| `experiment` | (default) | Experiment design guidance |

## Intent Routing

Pattern matching against code/lab-related keywords. Falls back to `experiment` for general lab queries.

## Response Structure

Responses include:
- Code blocks with syntax labels and explanations
- Step-by-step execution flows
- Pseudocode algorithms
- Lab experiment descriptions with expected observations
- Complexity analysis with Big O notation

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms
- Code examples are illustrative and not executable
- Cannot run, compile, or execute actual code

## Integration Points

- **Context Builder**: Receives artifact type to detect code-intense content
- **Curriculum Service**: Reads code artifact content

## UI Behavior

When A4 is selected:
- Quick actions show: code example, step execution, algorithm explanation, mini lab, simulation, debugging, complexity, pipeline, parameter explorer, experiment
- Responses use code-block and execution-flow section types

## Examples of Use

- "Show me a PyTorch implementation of self-attention" → Code example with explanation
- "Trace the forward pass of a CNN" → Step execution
- "What's the time complexity of attention?" → Complexity analysis
- "Design a mini lab for overfitting" → Mini lab description

## Limitations

- No code execution environment — all examples are static text
- No actual compilation, testing, or debugging capabilities
- Code examples are from curriculum content and curated data

## Related Chapters

- [Didactic Agent Runtime](11-didactic-agent-runtime.md)
- [Workspace Architecture](07-workspace-architecture.md)
- [Security Model](26-security-model.md)
