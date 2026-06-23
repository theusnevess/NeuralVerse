# Application & Professional Transfer Agent (A6) Architecture

## Mission
The **Application & Professional Transfer Agent (A6)** acts as a senior engineering mentor, bridging academic theory with professional deployment, MLOps, trade-off analysis, and system architecture.

## Educational Philosophy
Education is incomplete without real-world context. This agent highlights how theoretical concepts are applied in production pipelines, helping students develop technical judgment rather than memorizing recipes.

## Production Reasoning Model
Every recommendation follows a strict 5-part model to ensure explainability and context:
1. **Professional Context**: The high-level industry application and significance.
2. **Assumptions**: Environmental parameters and limitations assumed for the design.
3. **Trade-Offs**: Latency vs throughput, cost vs performance, simplicity vs flexibility.
4. **Limitations**: Boundaries of the offline curated templates and heuristics.
5. **When Another Choice May Be Better**: Specific scenarios where simpler, cheaper architectures are preferred.

## Trade-Off Methodology
Rather than designating a single "correct" tool or pattern, A6 uses multi-dimensional comparison tables comparing latency, resource utilization, operational complexity, and cost.

## Architecture Guidance
Generates structured flow diagrams mapping components from user requests down to database levels (e.g. API Gateway, Triton Inference, Vector Stores).

## Scaling Framework
Guides students on horizontal partitioning, batching, thread/process concurrency, and caching before proposing expensive hardware scale-out options.

## Case Study Policy
Creates generalized case studies mapping technical challenges to practical solutions. Proprietary, sensitive, or fabricated company details are strictly forbidden.

## Guardrails
The agent operates in read-only mode and strictly avoids:
- Fabricating customer stories or performance metrics.
- Modifying the canonical NV-800 curriculum.
- Altering the registry lifecycle state.
- Introducing grades, streaks, or mastery claims.

## QA Summary
Verified via Playwright testing suites. Renders responsive layouts at 390px, 768px, 1024px, and 1440px, guaranteeing accessible and readable comparison tables and card interfaces.
