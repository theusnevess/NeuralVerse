# Agent A2: Curriculum & Dependency

## Purpose

Provides curriculum intelligence: prerequisite analysis, dependency traversal, navigation recommendations, and structural awareness of the learning path hierarchy.

## Educational Role

Curriculum navigator. A2 helps users understand their position in the curriculum, what they need to know before proceeding, what comes next, and how concepts connect.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `dependency` | "prerequisite", "dependency", "need to know" | Prerequisite analysis for selected content |
| `next` | "next", "what's next", "continue" | Next recommended artifact/module recommendation |
| `previous` | "previous", "before", "preceding" | Previous/background content recommendation |
| `skip` | "skip", "can I skip", "optional" | Skip impact analysis |
| `summary` | "summary", "curriculum", "overview" | Full curriculum position summary |
| `context` | "context", "position", "where am i" | Current position in curriculum hierarchy |
| `route` | "route", "path", "learning route" | Learning route generation through curriculum |
| `neighbor` | "neighbor", "related", "adjacent" | Neighboring module/lesson discovery |
| `crosslink` | "cross-link", "cross", "also see" | Cross-link explanation between artifacts |
| `hierarchy` | "hierarchy", "parent", "tree" | Parent-child-sibling hierarchy visualization |

## Intent Routing

A2 loads `data/curriculum-index.json` at initialization and builds lookup maps: `pathsById`, `modulesById`, `lessonsById`, `artifactsById`, plus cross-reference maps for parent-child relationships and sibling discovery.

`resolveCurrentPosition(context)` maps the URL hash context to actual curriculum entities.

## Response Structure

Responses include:
- Curriculum position indicators (breadcrumb-like hierarchy)
- Dependency chains with entity references and links
- Skip impact assessments (textual analysis)
- Route maps as ordered lists with artifacts
- Cross-link cards with descriptions and routes

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms, write-canonical-curriculum-files
- Read-only access to curriculum index
- Does not modify or suggest modifications to curriculum structure

## Integration Points

- **Curriculum Service**: Primary data source (curriculum-index.json)
- **Context Builder**: Receives current selection context
- **Curriculum Controller**: Shares entity ID space and route patterns
- **Search System**: Cross-link generation uses same route resolution

## UI Behavior

When A2 is selected:
- Quick actions show: show prerequisites, show next, explain position, dependency chain, can I skip, curriculum summary, learning route, related concepts, parent hierarchy, neighbor lessons
- Responses are rendered with curriculum-style cards and breadcrumb displays

## Examples of Use

- "What are the prerequisites for attention mechanism?" → Dependency mode with chain
- "What should I study next?" → Next mode with recommendation
- "Can I skip regularization?" → Skip impact analysis
- "Where am I in the curriculum?" → Context mode with position display

## Limitations

- Cannot modify curriculum structure or suggest new paths
- Dependency analysis is based on declared prerequisites, not inferred knowledge gaps
- Limited to content within the existing curriculum index

## Related Chapters

- [Didactic Agent Runtime](11-didactic-agent-runtime.md)
- [Curriculum Architecture](05-curriculum-architecture.md)
- [Navigation and Routing](04-navigation-and-routing.md)
