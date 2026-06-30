# Agent A6: Application & Professional Transfer

## Purpose

Provides guidance on real-world applications, production architectures, engineering trade-offs, MLOps perspectives, and career context for AI concepts.

## Educational Role

Engineering and professional mentor. A6 bridges the gap between theoretical understanding and practical application in production environments.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `real_world_applications` | "application", "real world", "use case" | Real-world application examples |
| `production_architecture` | "production", "deploy", "architecture" | Production system architecture guidance |
| `engineering_trade_offs` | "trade-off", "pros and cons" | Engineering trade-off analysis |
| `mlops_perspective` | "MLOps", "pipeline", "deployment" | MLOps/DevOps perspective |
| `decision_framework` | "decision", "choose", "select" | Decision framework for choosing approaches |
| `failure_modes` | "fail", "pitfall", "gotcha" | Common failure modes in production |
| `scaling_strategy` | "scale", "scalability", "large" | Scaling strategies for production systems |
| `industry_case_study` | "case study", "industry", "company" | Industry case study description |
| `career_context` | "career", "role", "skill" | Career and role context for skills |
| `design_review` | (default) | Design review guidance |

## Intent Routing

Pattern matching against application/engineering keywords. Uses domain resolution for context-appropriate responses.

## Response Structure

Responses use a `CURATED_TRANSFER_MAP` with domain-keyed data covering the same 7 domains as A5. Each response includes:
- Production considerations
- Architecture descriptions
- Trade-off analyses
- Failure mode warnings

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms
- No proprietary metrics or live cloud connections
- Production advice is general and not specific to any organization
- All responses include disclaimer: "No proprietary metrics, live cloud connection, or curriculum modifications"

## Integration Points

- **Context Builder**: Receives curriculum position for contextual application examples
- **Domain resolution**: Shared pattern across A5-A10

## UI Behavior

When A6 is selected:
- Quick actions show 10 professional transfer prompts
- Responses use engineering-card section types
- Trade-off analyses use comparison-table format

## Examples of Use

- "How is BERT used in production?" → Real-world applications with architecture
- "What are the trade-offs between batch and real-time inference?" → Engineering trade-offs
- "What MLOps practices matter for LLM deployment?" → MLOps perspective
- "How does Netflix use recommendation systems?" → Industry case study

## Limitations

- Production advice is general and not organization-specific
- No access to live infrastructure, metrics, or deployment tools
- Case studies are illustrative and may not reflect current industry practices

## Related Chapters

- [Didactic Agent Runtime](11-didactic-agent-runtime.md)
- [Curriculum Architecture](05-curriculum-architecture.md)
- [Governance Model](27-governance-model.md)
