# NV-210-M6 Modules Page Wireframe Architecture

**Status:** CANONICAL

**Lock:** NV-210-M6 LOCKED

**Parent contracts:** NV-210-M0, NV-210-M1, NV-210-M2, NV-210-M3, NV-210-M4, NV-210-M5

**Canonical concept:** Curriculum Control Tower

**Page:** `#/modules`

## 1. Executive Summary

NV-210-M6 defines the permanent structural blueprint of the Modules Page. It transforms the locked mission, information architecture, learner experience, concept selection, concept review, and canonical UX concept into a hierarchy of structural regions.

This document does not define appearance. It defines where curriculum information belongs, how understanding expands, where decisions become possible, and where Modules hands control to another experience.

The Modules Page structure is:

```text
Global Orientation
  -> Curriculum Orientation
  -> Module Space
  -> Module Interpretation
  -> Readiness And Planning
  -> Transition Layer
```

Every region exists only because it supports curriculum orientation. Any region that cannot be traced to M0-M5 is invalid.

Final verdict:

> CANONICAL — LOCKED

## 2. Structural Blueprint

The canonical structural hierarchy is:

```text
Global Orientation Region
  -> Curriculum Orientation Region
  -> Module Space Region
  -> Module Interpretation Region
  -> Readiness And Planning Region
  -> Transition Layer
```

### Global Orientation Region

Responsibility:

> Establish that the learner is inside the curriculum module map, not inside study, search, practice, or platform introduction.

It begins the learner's orientation by answering:

> Where am I?

### Curriculum Orientation Region

Responsibility:

> Explain the curriculum as an organized module system before individual module interpretation begins.

It answers:

> What is the overall curriculum structure?

### Module Space Region

Responsibility:

> Present modules as distinct curriculum units with recognizable roles.

It answers:

> What modules exist and how do they differ?

### Module Interpretation Region

Responsibility:

> Explain the selected or investigated module by purpose, role, prerequisites, competencies, and unlocked capabilities.

It answers:

> Why does this module matter and what does it require?

### Readiness And Planning Region

Responsibility:

> Convert module understanding into a reasoned curriculum decision.

It answers:

> Am I ready and what should happen next?

### Transition Layer

Responsibility:

> End the Modules experience by sending the learner toward the correct next experience after orientation is complete.

It answers:

> Where should I continue?

## 3. Canonical Wireframe Zones

| Zone | Purpose | Inputs | Outputs | Learner question answered | Neighbor relationship |
| --- | --- | --- | --- | --- | --- |
| Global Orientation | Establish page context and cognitive entry | Curriculum identity, page role, orientation purpose | Learner understands they are in Modules | Where am I? | Feeds Curriculum Orientation by creating context |
| Curriculum Orientation | Make the curriculum understandable as a system | Curriculum structure, paths, module organization | Learner understands the global structure | What is the curriculum shape? | Receives context from Global Orientation and prepares Module Space |
| Module Space | Expose module inventory and distinctions | Module identity, role, purpose summary, order or grouping meaning | Learner recognizes available module options | What modules exist? | Receives curriculum frame and feeds Module Interpretation |
| Module Interpretation | Explain module meaning | Module purpose, role, dependencies, competencies, unlocks | Learner understands one module's significance | Why does this module matter? | Receives module focus and feeds Readiness And Planning |
| Readiness And Planning | Support next-step judgment | Dependencies, readiness, gaps, unlocked capability, learner intent | Learner can make a justified curriculum decision | What should I do next? | Receives module meaning and feeds Transition Layer |
| Transition Layer | Complete orientation and hand off | Chosen direction, readiness outcome, next experience fit | Learner leaves Modules intentionally | Where should I continue? | Ends Modules and hands control elsewhere |

No zone exists for teaching, broad lookup, practice, platform promotion, open-ended relationship exploration, or administrative review.

## 4. Reading Flow

The learner should mentally traverse the structure as:

```text
I know I am in Modules.
  -> I understand the curriculum system.
  -> I recognize the module options.
  -> I understand what one module means.
  -> I understand whether I am ready.
  -> I know what to do next.
  -> I know where to continue.
```

This sequence is mandatory because each step removes uncertainty required by the next step. A learner cannot compare modules before recognizing them. A learner cannot assess readiness before understanding module purpose. A learner cannot choose a destination before forming a curriculum decision.

## 5. Information Flow

The canonical information flow is:

```text
Global
  -> Curriculum
  -> Module
  -> Dependency
  -> Competency
  -> Decision
  -> Transition
```

### Global To Curriculum

The learner first needs to know the surface's purpose before interpreting curriculum information.

### Curriculum To Module

Modules gain meaning from their position inside the curriculum system.

### Module To Dependency

Dependencies are meaningful only after the learner understands what the module is and why it exists.

### Dependency To Competency

Competencies explain why requirements matter and what the module develops.

### Competency To Decision

The learner can make a planning decision only after understanding readiness and capability consequences.

### Decision To Transition

The learner should leave Modules only after knowing why another experience is now appropriate.

This order minimizes cognitive effort because it prevents specific decisions from appearing before the mental context needed to evaluate them.

## 6. Experience Mapping

| M2 learner state | Supporting structural region | Trace |
| --- | --- | --- |
| Unknown | Global Orientation | Converts initial uncertainty into page context |
| Curious | Curriculum Orientation | Shows that the curriculum has an understandable structure |
| Exploring | Module Space | Lets the learner inspect module possibilities at module level |
| Comparing | Module Space and Module Interpretation | Supports meaningful distinction between modules |
| Understanding | Module Interpretation | Builds role, purpose, dependency, competency, and unlock meaning |
| Planning | Readiness And Planning | Converts understanding into a possible next move |
| Ready | Readiness And Planning and Transition Layer | Confirms that a next direction is justified |
| Transitioning | Transition Layer | Completes orientation and hands control elsewhere |

Every M2 state has a structural region. No region exists without a learner state to support.

## 7. Decision Architecture

| Decision | Structural point | Why it occurs there |
| --- | --- | --- |
| Identify first module | Module Space | The learner has enough curriculum context to recognize module options |
| Compare possible modules | Module Space and Module Interpretation | Differences become meaningful only after role and purpose are available |
| Review prerequisites | Module Interpretation | Prerequisites require module purpose to be meaningful |
| Return to previous module | Readiness And Planning | The need to return emerges from readiness gaps |
| Continue studying | Readiness And Planning | Study continuation requires confidence that the module is appropriate |
| Enter Learning | Transition Layer | Learning begins after orientation has produced a study direction |
| Enter Labs | Transition Layer | Labs begins only after practice readiness is understood |
| Explore Knowledge Graph | Transition Layer | Relationship exploration belongs elsewhere once module planning needs exceed Modules |
| Use Retrieval | Transition Layer | Lookup begins only when the learner needs knowledge discovery beyond planning |
| Move toward Research | Transition Layer | Inquiry begins when preparation and purpose are clear |
| Move toward Applications | Transition Layer | Application begins when capability readiness is clear |

The page should never force a decision before the region that justifies that decision has completed its job.

## 8. Progressive Disclosure Mapping

| Disclosure stage | Structural location | Information included | Purpose |
| --- | --- | --- | --- |
| Immediate information | Global Orientation and Curriculum Orientation | Page role, curriculum context, high-level structure, module-system presence | Establish orientation |
| Contextual information | Module Space | Module identity, role, purpose summary, grouping meaning | Support recognition and comparison |
| Investigated information | Module Interpretation | Dependencies, competencies, unlocked capabilities, difficulty, readiness context | Support understanding |
| Decision information | Readiness And Planning | Readiness gaps, recommended next move, review implications, progression implications | Support planning |
| Transition information | Transition Layer | Appropriate next experience and reason for handoff | Complete Modules |

Progressive disclosure is structural, not decorative. It exists to reveal the minimum information needed for the next cognitive step.

## 9. Structural Hierarchy

### Primary Structures

Primary structures are required for the page to fulfill its mission:

- Global Orientation;
- Curriculum Orientation;
- Module Space;
- Module Interpretation;
- Readiness And Planning;
- Transition Layer.

These structures directly support M0's mission and M5's canonical experience.

### Secondary Structures

Secondary structures refine decisions but cannot lead the experience:

- difficulty context;
- module grouping rationale;
- competency summaries;
- unlocked capability summaries;
- readiness nuance;
- continuation rationale.

These structures support M1's important or secondary information categories without displacing critical information.

### Supporting Structures

Supporting structures exist only to clarify meaning:

- explanatory micro-rationale;
- relationship labels;
- comparison criteria;
- handoff reasons;
- boundary reminders when needed.

These structures must remain subordinate to orientation. If they attract more attention than the curriculum decision, they are invalid.

## 10. Navigation Boundaries

Modules hands control away when orientation is complete.

| Destination | Boundary condition | Structural source |
| --- | --- | --- |
| Learning | Learner knows what to study and why | Transition Layer after Readiness And Planning |
| Labs | Learner understands practice readiness | Transition Layer after readiness confirmation |
| Knowledge Graph | Learner needs open-ended relationship exploration | Transition Layer after module planning exceeds relationship context |
| Retrieval | Learner needs knowledge lookup beyond curriculum planning | Transition Layer after orientation identifies lookup need |
| Research | Learner is prepared for inquiry-oriented continuation | Transition Layer after capability and purpose are clear |
| Applications | Learner is ready to apply capability | Transition Layer after unlocked capability is understood |

The structure must never continue after Modules has completed orientation. Extending beyond that point creates overlap with adjacent experiences.

## 11. Scalability Assessment

### Six Modules

The same blueprint works because the learner still needs orientation, module recognition, interpretation, planning, and transition. The structure may be simpler, but the hierarchy remains unchanged.

### Twenty Modules

The Module Space becomes more important because comparison requires stronger grouping and role clarity. The structural sequence remains unchanged.

### Fifty Modules

The blueprint becomes more valuable because global-to-local orientation prevents option overload. Module Space must preserve meaning rather than become a flat inventory.

### Multiple Learning Paths

Curriculum Orientation absorbs path-level context while Module Space explains module role across paths. The blueprint remains valid because it is based on orientation, not count.

### Future Curriculum Branches

Curriculum Orientation explains branch logic, Module Space exposes branch-relevant modules, and Readiness And Planning clarifies which branch movement is justified. No new primary region is required.

## 12. Structural Anti-Patterns

| Anti-pattern | Why it violates architecture |
| --- | --- |
| Marketing opener | Shifts Modules toward platform promotion instead of orientation |
| Metrics surface | Turns Curriculum Control Tower into status consumption |
| Content feed | Creates browsing behavior rather than curriculum understanding |
| Lesson list | Descends below the module abstraction level |
| Endless content stream | Prevents completion of orientation and transition |
| Large article region | Converts Modules into reading or teaching |
| Semantic search | Turns Modules into Retrieval |
| Chat-first exchange | Replaces structured curriculum orientation with open-ended dialogue |
| Graph explorer | Turns Modules into Knowledge Graph |
| Administrative area | Exposes governance concerns instead of learner orientation |
| Operations console | Literalizes Control Tower and violates M4 guardrails |
| Course catalog | Treats modules as inventory rather than curriculum movement units |
| LMS-like progression area | Blurs Modules with Learning and assessment experiences |
| Laboratory launcher | Pushes execution before readiness and planning are complete |

Any structure that exists primarily for presentation, browsing, status, search, teaching, execution, or administration is invalid.

## 13. Traceability Matrix

| Structural region | M0 mission | M1 information | M2 UX | M3 concept | M4 review | M5 canonical UX |
| --- | --- | --- | --- | --- | --- | --- |
| Global Orientation | Establish Modules as curriculum map | System Orientation, Curriculum Identity | Unknown to Curious | Control Tower starts from system position | Avoids Home confusion | Learner knows where they are |
| Curriculum Orientation | Explain overall curriculum | Curriculum Structure | Curious to Exploring | Coordinates routes through curriculum | Prevents flat inventory drift | Learner understands engineered curriculum |
| Module Space | Identify available modules | Module Inventory, Identity, Role | Exploring and Comparing | Modules as route units | Avoids course catalog if role-driven | Learner recognizes available paths |
| Module Interpretation | Explain module purpose and relationships | Purpose, Dependencies, Competencies, Unlocks | Understanding | Route meaning and readiness context | Avoids relationship drift by staying module-centered | Learner knows why and what is required |
| Readiness And Planning | Support next curriculum move | Readiness, Planning | Planning and Ready | Safe next movement | Guarded against over-control | Learner decides with confidence |
| Transition Layer | Hand off after orientation | Transition, Navigation Intent | Transitioning | Movement to next surface | Avoids status-surface continuation | Learner leaves with a reason |

Every structural region traces to all prior canonical documents. No untraced region is permitted.

## 14. Wireframe Validation

| Region | Why it exists | Uncertainty reduced | Decision enabled | Required by |
| --- | --- | --- | --- | --- |
| Global Orientation | Establishes page purpose | What surface am I in? | Whether to use Modules for orientation | M0, M1, M2, M5 |
| Curriculum Orientation | Frames module meaning | What is the curriculum shape? | How to interpret module options | M0, M1, M2, M5 |
| Module Space | Makes module options visible as distinct units | What modules exist? | Which module deserves attention | M0, M1, M2, M3, M5 |
| Module Interpretation | Explains purpose, requirements, and outcomes | Why does this module matter? | Whether this module fits the learner's needs | M1, M2, M3, M5 |
| Readiness And Planning | Converts understanding into judgment | Am I ready and what should I do? | Review, continue, begin, or defer | M0, M1, M2, M4, M5 |
| Transition Layer | Ends orientation cleanly | Where should I continue? | Enter Learning, Labs, Retrieval, Knowledge Graph, Research, or Applications | M0, M1, M2, M5 |

If a future region cannot answer these four validation questions, it must not be added.

## 15. Future-Proof Assessment

This blueprint remains valid if the visual language changes because the blueprint defines cognitive order, not appearance.

It remains valid if the product design system changes because no structural region depends on a specific visual expression.

It remains valid if the technical rendering foundation changes because the structure is semantic and learner-centered.

It remains valid if interaction models evolve because the required progression is mental: orientation, recognition, understanding, planning, confidence, transition.

It remains valid if the platform doubles in size because increased curriculum complexity strengthens the need for the same structural sequence.

The future-proof rule is:

> Preserve the structural sequence and traceability; allow future expression to change only if the learner's orientation journey remains identical.

## 16. Architecture Verdict

CANONICAL — LOCKED
