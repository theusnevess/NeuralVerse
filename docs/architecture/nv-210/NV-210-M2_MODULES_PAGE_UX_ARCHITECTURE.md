# NV-210-M2 Modules Page UX Architecture

**Status:** CANONICAL

**Lock:** NV-210-M2 LOCKED

**Parent contracts:** NV-210-M0, NV-210-M1

**Page:** `#/modules`

**Canonical role:** Curriculum Operating Map

## 1. Executive Summary

NV-210-M2 defines the learner experience architecture of the Modules Page. It does not redefine mission, ownership, scope, information hierarchy, or page boundaries. Those responsibilities remain locked by NV-210-M0 and NV-210-M1.

The Modules Page is an orientation surface. Its experience succeeds when the learner moves from uncertainty to curriculum clarity and leaves with a justified next action.

The page does not teach the subject. It prepares the learner to learn by making curriculum position, module purpose, dependencies, readiness, and next movement understandable.

The canonical experience transformation is:

```text
I do not know where I am in the curriculum.
  -> I understand the curriculum system.
  -> I recognize the modules available to me.
  -> I understand why a module matters.
  -> I understand what it requires.
  -> I understand what it enables.
  -> I know what to do next.
```

Architecture verdict:

> CANONICAL — LOCKED

## 2. Experience Mission

The mission of the experience is to orient the learner inside the curriculum module system until a confident next decision becomes possible.

This is separate from the page mission. The page mission defines what Modules owns. The experience mission defines what should happen in the learner's mind while using Modules.

This is separate from information architecture. Information architecture defines what information exists and how it is organized. Experience architecture defines how understanding should mature.

This is separate from future realization. The experience architecture must remain valid regardless of how later phases express it.

The experience mission is fulfilled when the learner can say:

> I understand where I am, what modules mean, what is required, and where I should continue.

## 3. UX Philosophy

The Modules Page does not teach. It prepares learning.

It does not explain concepts. It explains structure.

It does not answer every curriculum question. It helps learners ask the right next question before entering a deeper surface.

It does not maximize time spent. It maximizes orientation gained.

It does not push the learner into action. It builds enough confidence for the learner to choose action deliberately.

The desired learner feeling is:

> I now understand where I am.

The undesired learner feeling is:

> I have started studying this subject here.

## 4. Canonical Cognitive Journey

The canonical cognitive journey is:

```text
Arrival
  -> Orientation
  -> Recognition
  -> Understanding
  -> Planning
  -> Confidence
  -> Transition
```

### Arrival

The learner enters with partial or complete uncertainty about curriculum position.

Mental change:

> I am no longer in a general platform area; I am entering the curriculum module map.

### Orientation

The learner understands the curriculum system at a high level.

Mental change:

> I can place myself inside the overall module system.

### Recognition

The learner recognizes the available modules as distinct curriculum units.

Mental change:

> I can tell which modules exist and distinguish them from one another.

### Understanding

The learner understands the role, purpose, requirements, and consequences of a module.

Mental change:

> I understand why this module exists and how it relates to the curriculum.

### Planning

The learner evaluates readiness and possible next movement.

Mental change:

> I can reason about what should happen next.

### Confidence

The learner has enough clarity to commit to a next action.

Mental change:

> My next step is justified by curriculum understanding, not guesswork.

### Transition

The learner leaves Modules because orientation has completed its job.

Mental change:

> I am leaving this map with a reason.

## 5. Experience States

| State | Purpose | Entry condition | Exit condition |
| --- | --- | --- | --- |
| Unknown | Represent initial uncertainty | Learner lacks curriculum position | Learner recognizes they are viewing module orientation |
| Curious | Create willingness to inspect the curriculum | Learner sees the curriculum as relevant but not yet clear | Learner starts distinguishing available module options |
| Exploring | Support broad module discovery | Learner is comparing curriculum possibilities | Learner identifies a module or path of interest |
| Comparing | Help evaluate differences between modules | Learner sees multiple plausible options | Learner understands why one option matters now |
| Understanding | Build module-level meaning | Learner focuses on purpose, role, dependency, and unlocks | Learner can explain the module's curriculum role |
| Planning | Convert understanding into possible next movement | Learner has enough module meaning to evaluate readiness | Learner can identify a justified next step |
| Ready | Establish decision confidence | Learner understands readiness and consequence | Learner can leave Modules intentionally |
| Transitioning | Complete the orientation experience | Learner has selected a direction of continuation | Learner enters the next appropriate experience |

These are learner states, not interface states. They describe maturity of understanding.

## 6. Experience Objectives

| State | What the learner should understand | Uncertainty removed | Confidence gained |
| --- | --- | --- | --- |
| Unknown | This surface is about curriculum modules | What am I looking at? | I can begin orienting |
| Curious | The curriculum has a navigable module structure | Is there an understandable system here? | I can inspect without being lost |
| Exploring | Multiple modules exist with distinct roles | What options exist? | I can recognize possible paths |
| Comparing | Modules differ by purpose, requirement, and consequence | Are these modules interchangeable? | I can evaluate meaningful differences |
| Understanding | A module has a role, purpose, dependencies, and unlocks | Why does this module matter? | I can interpret the module correctly |
| Planning | Readiness and next movement can be reasoned about | What should I do next? | I can form a study plan |
| Ready | My next step is justified | Am I making the wrong move? | I can proceed with confidence |
| Transitioning | Another surface should now take over | Why am I leaving Modules? | I understand the handoff |

## 7. Progressive Orientation Model

Orientation increases through this sequence:

```text
System Orientation
  -> Curriculum Orientation
  -> Module Orientation
  -> Dependency Orientation
  -> Competency Orientation
  -> Planning Orientation
  -> Execution Readiness
```

### System Orientation

The learner understands that Modules is an orientation surface for curriculum movement.

Why it comes first:

> Without system orientation, all later information lacks context.

### Curriculum Orientation

The learner understands the overall curriculum shape before individual module judgment.

Why it comes second:

> A module's meaning depends on the curriculum it belongs to.

### Module Orientation

The learner identifies distinct module units and their roles.

Why it comes third:

> The learner must know what module is being evaluated before reasoning about requirements.

### Dependency Orientation

The learner understands prerequisites and required preparation.

Why it comes fourth:

> Dependency meaning depends on knowing the module's purpose.

### Competency Orientation

The learner understands capabilities involved in the module.

Why it comes fifth:

> Competencies explain why dependencies and readiness matter.

### Planning Orientation

The learner forms a next curriculum decision.

Why it comes sixth:

> Planning should be based on purpose, dependencies, and competencies.

### Execution Readiness

The learner becomes prepared to leave Modules for a deeper surface.

Why it comes last:

> Entering action before orientation creates false confidence.

## 8. Decision Confidence Model

Decision confidence grows by replacing vague intention with structured understanding.

| Learner confidence statement | What supports it |
| --- | --- |
| I know where to start | Curriculum orientation and module role clarity |
| I know what to review | Dependency orientation and readiness gaps |
| I know why this module matters | Module purpose and curriculum role |
| I know what this module unlocks | Unlock context and downstream readiness |
| I know whether I am ready | Dependency, competency, and readiness interpretation |
| I know whether to continue to Learning | Planning orientation and study intent |
| I know whether Labs are appropriate | Practice readiness and prerequisite clarity |
| I know when to explore knowledge relationships elsewhere | Recognition that open-ended knowledge exploration belongs outside Modules |

Confidence grows in four steps:

```text
Recognition
  -> Interpretation
  -> Evaluation
  -> Commitment
```

Recognition means the learner sees the relevant curriculum information.

Interpretation means the learner understands what it means.

Evaluation means the learner relates it to their current readiness or goal.

Commitment means the learner can choose a next direction without guessing.

## 9. Cognitive Transitions

Cognitive transitions happen when one uncertainty is resolved and a more specific question becomes possible.

| Transition | Triggering mental realization |
| --- | --- |
| Unknown to Curious | I recognize this page can orient me |
| Curious to Exploring | I see that the curriculum has module options |
| Exploring to Comparing | I need to understand differences between modules |
| Comparing to Understanding | One module is relevant enough to inspect conceptually |
| Understanding to Planning | I understand purpose, requirements, and possible outcomes |
| Planning to Ready | I can justify a next action |
| Ready to Transitioning | Another experience is now the right place to continue |

Canonical mental progression:

```text
I know this is the module map.
  -> I know what modules exist.
  -> I know how modules differ.
  -> I know why one module matters.
  -> I know what it requires.
  -> I know what it enables.
  -> I know what to do next.
```

## 10. Experience Boundaries

The following experiences belong elsewhere:

| Experience | Why it must not occur inside Modules |
| --- | --- |
| Deep study | Modules prepares study; Learning performs study |
| Research | Modules may prepare research readiness; Research owns inquiry work |
| Experimentation | Modules may indicate readiness; Labs owns practice and experimentation |
| Assessment | Modules may express readiness; assessment belongs to evaluation surfaces |
| Semantic exploration | Modules may point to knowledge relationships; Retrieval and Knowledge Graph own exploration |
| Coding | Modules may prepare applied work; coding belongs to applied or laboratory contexts |
| Article reading | Modules may identify module relevance; content reading belongs to Learning or content surfaces |
| Notebook execution | Modules may prepare readiness; execution belongs outside Modules |
| Platform introduction | Modules assumes curriculum intent; Home owns platform-level introduction |

These boundaries protect Modules from becoming a general-purpose learning environment. The experience should end when orientation is sufficient.

## 11. Experience Success Criteria

Success is measured by orientation, not duration.

The experience succeeds when the learner can:

- explain the overall curriculum structure at module level;
- identify relevant modules;
- distinguish module purposes;
- understand module dependencies;
- understand what a module develops;
- understand what a module enables;
- identify readiness gaps;
- choose a next module or review target;
- decide whether to continue to Learning;
- decide whether Labs are appropriate;
- leave Modules without feeling interrupted.

The page has completed its mission when the learner no longer needs orientation to decide the next curriculum move.

## 12. Failure Modes

| Failure mode | Why it occurs | Experience harm |
| --- | --- | --- |
| Information overload | Too many details appear before orientation | Learner cannot tell what matters |
| Decision paralysis | Too many options lack prioritization | Learner cannot choose a next move |
| Curriculum ambiguity | Structure is unclear | Learner cannot place modules in context |
| Confusing progression | Dependencies and unlocks are unclear | Learner cannot reason about sequence |
| Feeling lost | Global orientation is weak | Learner lacks a stable mental anchor |
| Feeling forced | Readiness is framed as command rather than guidance | Learner loses agency |
| Feeling overwhelmed | Competencies or dependencies appear without explanation | Learner perceives the curriculum as hostile |
| False confidence | Planning appears before readiness | Learner chooses an inappropriate next step |
| Premature action | Transition appears before understanding | Learner leaves without orientation |
| Study drift | The experience starts teaching content | Modules becomes Learning |
| Search drift | The experience starts answering open-ended lookup needs | Modules becomes Retrieval |
| Relationship drift | Relationship exploration overtakes planning | Modules becomes Knowledge Graph |
| Motivation without structure | The page inspires but does not orient | Learner feels interested but still uncertain |

## 13. Emotional Architecture

The emotional progression should be:

```text
Uncertainty
  -> Curiosity
  -> Clarity
  -> Confidence
  -> Motivation
  -> Readiness
```

### Uncertainty

The learner may not know where they are or what to do next.

Experience responsibility:

> Provide orientation without demanding prior knowledge.

### Curiosity

The learner sees that the curriculum has meaningful structure.

Experience responsibility:

> Invite inspection through relevance, not spectacle.

### Clarity

The learner understands module purpose and relationship.

Experience responsibility:

> Make structure intelligible before asking for decisions.

### Confidence

The learner can reason about readiness and next movement.

Experience responsibility:

> Replace guesswork with justified choice.

### Motivation

The learner sees why the next action matters.

Experience responsibility:

> Connect action to capability and progression.

### Readiness

The learner is prepared to leave Modules.

Experience responsibility:

> Complete orientation and hand off to the right next experience.

The page must never manipulate emotion. Confidence should emerge from understanding.

## 14. Relationship With Other Experiences

Modules should hand control to other experiences when orientation is complete.

| Destination experience | Handoff condition | Learner feeling |
| --- | --- | --- |
| Learning | Learner knows which module or path should be studied | I know what to study and why |
| Labs | Learner understands practice readiness | I know why practice is appropriate now |
| Retrieval | Learner needs knowledge lookup beyond curriculum planning | I know I need to investigate information, not choose a module |
| Knowledge Graph | Learner needs open-ended relationship exploration | I know I need to explore knowledge structure beyond module planning |
| Research | Learner is ready for inquiry-oriented work | I know what research direction is supported by my preparation |
| Applications | Learner is ready to apply capabilities | I know which capability is ready for applied use |

The learner should never feel interrupted. The handoff should feel like the natural completion of orientation.

## 15. Long-Term UX Evolution

The UX architecture remains valid as NeuralVerse grows because it is based on cognitive orientation rather than a fixed expression.

At 50 modules, the experience must protect learners from option overload by preserving global-to-local orientation.

At 500 lessons, the experience must continue preventing Modules from becoming a study surface.

With thousands of concepts, the experience must keep concept-level detail outside Modules unless it supports module-level readiness.

With hundreds of labs, the experience must clarify practice readiness without becoming practice.

With millions of knowledge relationships, the experience must distinguish curriculum planning from open-ended knowledge exploration.

The long-term rule is:

> As NeuralVerse grows, Modules should become better at orientation, not broader in responsibility.

## 16. Immutable UX Principles

1. Orientation comes before exploration.
2. Structure comes before detail.
3. Confidence comes before execution.
4. Purpose comes before progression.
5. Planning comes before learning.
6. Understanding comes before action.
7. Every experience layer must reduce uncertainty.
8. Every experience layer must answer one learner question.
9. No experience exists without purpose.
10. Modules prepares learning; it does not become learning.
11. Modules explains structure; it does not teach subject matter.
12. The learner must understand where they are before choosing where to go.
13. Module purpose must be understood before readiness.
14. Readiness must feel supportive, not restrictive.
15. Dependencies must clarify preparation, not punish curiosity.
16. The learner's agency must be preserved.
17. Motivation must come from understanding, not pressure.
18. Transition must feel earned by orientation.
19. The page succeeds when the learner can leave confidently.
20. Time spent is not a success metric.
21. More information is not better orientation.
22. The experience must remain module-centric.
23. The experience must not descend into lessons, articles, exercises, or execution.
24. The experience must not become search, research, practice, or assessment.
25. Future redesigns may change expression but must preserve the cognitive journey.
26. The learner should never need technical construction knowledge to understand the experience.
27. Every handoff must have a learner-understandable reason.
28. The Modules Page has completed its mission when the learner knows the next justified curriculum move.

## 17. Architecture Verdict

CANONICAL — LOCKED
