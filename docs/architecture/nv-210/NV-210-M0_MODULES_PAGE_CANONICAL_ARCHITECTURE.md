# NV-210-M0 Modules Page Canonical Architecture

**Status:** CANONICAL

**Lock:** NV-210-M0 LOCKED

**Page:** `#/modules`

**Canonical role:** Curriculum Operating Map

## 1. Purpose

The Modules Page is the curriculum operating map for NeuralVerse. Its purpose is to help learners understand the available curriculum modules, how those modules relate, what each module enables, and where the learner should continue next.

The page is not a learning surface, a retrieval surface, a marketing surface, or a platform overview. It exists to organize curriculum movement at the module layer.

## 2. Primary Responsibility

The Modules Page answers one architectural question:

> Where am I in the curriculum module system, what modules are available, and what should I do next?

It must expose curriculum structure clearly enough for the learner to orient, compare modules, evaluate dependencies, and choose a continuation path.

## 3. Non-Responsibilities

The Modules Page must not become:

- a lesson reader;
- an article or notebook viewer;
- an exercise workspace;
- a retrieval or search results interface;
- a Home page replacement;
- a Labs execution surface;
- a marketing or ecosystem presentation page.

## 4. Relationship To Other Pages

The Modules Page coordinates between curriculum pages without absorbing their responsibilities.

| Surface | Responsibility | Boundary |
| --- | --- | --- |
| Home | Platform identity and entry orientation | Must not explain module dependencies in detail |
| Learning | Study flow and lesson-level progression | Must not own global module architecture |
| Modules | Module-level curriculum map | Must not descend into lesson execution |
| Retrieval | Knowledge lookup and evidence discovery | Must not define curriculum sequencing |
| Labs | Practice and implementation | Must not explain module topology |

## 5. Information Architecture Contract

Every redesign of the Modules Page must preserve these information objects:

- global curriculum orientation;
- module inventory;
- module purpose;
- module dependencies;
- unlocked capabilities;
- readiness signal;
- recommended continuation;
- transition targets.

## 6. Evaluation Criteria

A Modules Page implementation is architecturally valid only if it helps the learner answer:

- where to begin;
- which modules exist;
- why a module exists;
- which prerequisites matter;
- what capability a module unlocks;
- whether the learner is ready;
- where to continue after inspection.

## 7. Mental Model

The learner should experience the Modules Page as a curriculum control room: a stable map of modules, dependencies, readiness, and next actions.

The page should make the curriculum feel navigable rather than merely listed. It should convert a set of modules into an actionable learning map.

## 8. Canonical User Journey

The Modules Page should always guide the learner through five cognitive stages.

### Stage 1: Global Orientation

The learner understands the overall curriculum shape before selecting a specific module.

### Stage 2: Module Discovery

The learner identifies the available modules and understands the role each module plays in the curriculum.

### Stage 3: Dependency Understanding

The learner understands prerequisites, dependency relationships, and capabilities unlocked by each module.

### Stage 4: Planning

The learner decides what should be studied next based on readiness, missing competencies, and desired outcomes.

### Stage 5: Transition

The learner leaves Modules intentionally by navigating to Learning, Labs, or another appropriate surface.

Canonical flow:

```text
User enters
  -> obtains global orientation
  -> identifies the desired module
  -> understands why it exists
  -> understands dependencies
  -> evaluates readiness
  -> chooses where to continue
  -> leaves Modules
```

## 9. Canonical Decisions

After visiting Modules, the learner should be able to decide:

- where to begin;
- whether prerequisites are satisfied;
- which module to study next;
- which competency is currently missing;
- whether a target capability requires previous modules;
- whether the learner is ready to enter Labs;
- whether they should return to previous modules.

These decisions are the UI design contract. Visual hierarchy, component grouping, navigation, labels, and calls to action should all reinforce these decisions.

## 10. Levels Of Abstraction

The Modules Page operates exclusively at the module abstraction level.

Everything displayed must reinforce this level.

The page should never descend into:

- lessons;
- articles;
- notebooks;
- exercises;
- individual concepts.

Likewise, it should never ascend into:

- platform identity;
- marketing;
- ecosystem presentation.

Its responsibility begins and ends at the curriculum-module layer.

## 11. Canonical Design Test

All future Information Architecture, UX, wireframe, component, and UI decisions for the Modules Page must be evaluated with this question:

> Does this solution reinforce the mission of the Modules Page as the Curriculum Operating Map, or is it starting to resemble Learning, Retrieval, or Home?

If the solution descends into lesson execution, ascends into platform presentation, or shifts toward retrieval behavior, it violates the NV-210-M0 boundary.
