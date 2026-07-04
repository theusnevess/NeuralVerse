# NV-210-M1 Modules Page Information Architecture

**Status:** CANONICAL

**Lock:** NV-210-M1 LOCKED

**Parent contract:** NV-210-M0 Modules Page Canonical Architecture

**Page:** `#/modules`

**Canonical role:** Curriculum Operating Map

## 1. Canonical Information Hierarchy

The Modules Page organizes curriculum information from highest abstraction to lowest abstraction. Each layer must reduce uncertainty before the learner reaches the next layer.

| Layer | Purpose | Learner question answered | Why it exists | Why it belongs in Modules |
| --- | --- | --- | --- | --- |
| System Orientation | Establish that the learner is viewing the curriculum module system | What kind of curriculum surface am I in? | Prevents confusion with study, retrieval, or execution surfaces | Modules owns module-level orientation |
| Curriculum Structure | Explain the overall curriculum shape | What is the overall curriculum? | Gives the learner a stable frame before individual module inspection | Modules is the operating map of curriculum structure |
| Module Inventory | Identify the available modules | What modules exist? | Turns the curriculum from an abstract system into selectable learning units | Modules owns the inventory of module-level options |
| Module Identity | Distinguish one module from another | What is this module? | Prevents modules from becoming interchangeable labels | Modules must make each module recognizable |
| Module Role | Explain each module's function in the curriculum | Why does this module exist? | Connects modules to curriculum purpose rather than isolated content | Modules owns role-level meaning |
| Dependency Context | Explain required prior modules or competencies | What does this module depend on? | Prevents premature planning and false readiness | Modules owns prerequisite awareness at the module layer |
| Competency Context | Explain the capabilities addressed by the module | What competency does this module develop? | Connects structure to learner capability | Modules bridges curriculum structure and competency planning |
| Unlock Context | Explain what becomes possible after the module | What does this module enable? | Makes progression meaningful and directional | Modules owns module-to-module and module-to-outcome implications |
| Readiness Context | Indicate whether the learner appears prepared | Am I ready for this module? | Supports planning without forcing execution | Modules owns readiness as orientation, not assessment delivery |
| Planning Context | Help the learner choose a next curriculum move | What should I do next? | Converts understanding into action | Modules exists to support curriculum navigation decisions |
| Transition Context | Clarify where the learner should continue | Where do I leave this map? | Prevents dead ends after orientation | Modules routes intent to the appropriate adjacent surface |

## 2. Canonical Reading Order

The ideal cognitive reading sequence is:

```text
Global Orientation
  -> Curriculum Structure
  -> Module Identification
  -> Module Role
  -> Dependency Understanding
  -> Competency Understanding
  -> Unlock Understanding
  -> Readiness Understanding
  -> Planning
  -> Exit
```

This order minimizes cognitive load because it prevents the learner from making decisions before understanding the system. Structure comes before choice. Role comes before dependency. Dependency comes before readiness. Readiness comes before planning. Planning comes before transition.

The learner should never need to interpret detailed module implications before knowing the curriculum frame. The page must first answer where the learner is, then what exists, then why each module matters, then what is required, then what becomes possible, then where to continue.

## 3. Information Categories

The canonical information categories are:

| Category | Why it exists |
| --- | --- |
| Curriculum Identity | Names the curriculum context being mapped |
| Curriculum Structure | Explains how modules relate within the curriculum |
| Module Identity | Identifies each module as a distinct curriculum unit |
| Module Role | Explains the module's function in the larger curriculum |
| Module Purpose | Explains the reason the module exists |
| Dependencies | Identifies required prior modules or competencies |
| Competencies | Identifies the learner capabilities developed by the module |
| Unlocked Capabilities | Identifies what the module makes possible afterward |
| Difficulty | Sets expectation about required effort and conceptual demand |
| Readiness | Helps the learner evaluate whether they should start, wait, or review |
| Planning | Helps the learner choose the next curriculum action |
| Navigation Intent | Clarifies the learner's intended continuation direction |
| Transition | Connects orientation to the next appropriate surface |

Categories outside this list should not exist unless they directly support module-level orientation. Information about lessons, articles, exercises, execution, retrieval, search, platform identity, or broad ecosystem positioning belongs elsewhere because it either descends below the module layer, ascends above the curriculum-module layer, or shifts the page from orientation to another responsibility.

## 4. Information Priority

| Category | Priority | Reasoning |
| --- | --- | --- |
| Curriculum Identity | Critical | The learner must know the curriculum context before interpreting modules |
| Curriculum Structure | Critical | The learner needs the operating map before module selection |
| Module Identity | Critical | Modules cannot be evaluated if they are not clearly distinguishable |
| Module Role | Critical | The learner must understand why a module exists before planning around it |
| Module Purpose | Critical | Purpose anchors all later dependency and readiness interpretation |
| Dependencies | Critical | Readiness and sequencing are impossible without prerequisite context |
| Readiness | Critical | The page must help the learner avoid entering the wrong next step |
| Planning | Critical | Modules exists to convert curriculum understanding into a next move |
| Transition | Critical | The learner must leave the map intentionally |
| Competencies | Important | Competencies explain what the module develops, but after identity and role |
| Unlocked Capabilities | Important | Unlocks explain progression value, but depend on understanding dependencies |
| Difficulty | Important | Difficulty helps expectation-setting but should not lead the experience |
| Navigation Intent | Important | Intent helps continuation, but only after planning is meaningful |
| Curriculum Metadata | Secondary | Counts, labels, or supporting descriptors may help but must not lead |
| Extended Rationale | Optional | Deeper explanation may help investigation but is not required for orientation |

The learner should never need secondary or optional information before critical information. Secondary information may refine understanding but must not become required for basic orientation.

## 5. Progressive Disclosure Model

Information must appear in stages of increasing specificity.

### Immediately Visible Information

Immediately visible information should answer:

- what curriculum system is being viewed;
- what modules exist;
- what broad structure organizes them;
- which module-level choices are available;
- which high-level next-step signals are relevant.

This stage exists to create orientation without forcing inspection.

### Information After Initial Engagement

After the learner engages with the curriculum map, information should answer:

- what role a module plays;
- why the module exists;
- what competencies it develops;
- what dependencies are associated with it;
- what readiness signals matter.

This stage exists to convert recognition into understanding.

### Information During Intentional Module Investigation

When the learner intentionally investigates a module, information should answer:

- what prior modules or competencies are required;
- what capabilities are unlocked afterward;
- what missing competency may block progress;
- what planning decision is recommended;
- which transition is most appropriate next.

This stage exists to convert understanding into action.

## 6. Information Relationships

The Modules Page must express curriculum relationships semantically, not mechanically.

| Relationship | Meaning |
| --- | --- |
| Curriculum contains Modules | The curriculum is composed of module-level learning units |
| Modules belong to Curriculum | A module derives meaning from its position in the curriculum |
| Modules contain Competencies | A module develops one or more learner capabilities |
| Competencies support Readiness | Competencies indicate whether the learner is prepared for a module |
| Modules depend on Modules | Some modules require prior module-level preparation |
| Modules unlock Modules | Some modules enable later module-level progression |
| Modules unlock Capabilities | Some modules make new learner abilities possible |
| Modules prepare for Labs | Some modules create readiness for practice or implementation work |
| Modules prepare for Research | Some modules create readiness for research-oriented understanding |
| Modules prepare for Applications | Some modules create readiness for applied work |
| Readiness informs Planning | Preparation state determines the recommended next move |
| Planning informs Transition | The chosen curriculum move determines where the learner should continue |

These relationships should help the learner understand meaning, sequence, and consequence. They must not require the learner to interpret internal data structures or implementation concepts.

## 7. Canonical User Journey

The ideal cognitive journey is:

```text
I understand the curriculum.
  -> I recognize the available modules.
  -> I identify one module.
  -> I understand why it exists.
  -> I understand what it requires.
  -> I understand what it develops.
  -> I understand what it enables.
  -> I understand whether I am ready.
  -> I know what to do next.
```

This is a mental progression, not a navigation prescription. The page succeeds when the learner moves from uncertainty to structured understanding to a curriculum decision.

## 8. Decision Support Architecture

After leaving Modules, the learner should be capable of making these decisions:

| Decision | Supported by |
| --- | --- |
| Where should I begin? | Curriculum structure, module role, readiness, and planning context |
| Which module should I study next? | Dependencies, unlocked capabilities, and readiness context |
| Am I ready for this module? | Required competencies, prior module relationships, and readiness signals |
| Should I review another module first? | Dependency context and missing competency indicators |
| Which capability am I missing? | Competency context and readiness interpretation |
| What will this module enable? | Unlock context and downstream module relationships |
| Can I safely start Labs? | Module preparation relationships and readiness context |
| Should I move into Learning? | Planning context and transition context |
| Should I continue toward Research? | Research preparation relationship and unlocked capability context |
| Should I pursue an applied path? | Application preparation relationship and capability context |
| Should I return to a previous module? | Dependency context, readiness gaps, and planning context |

The page must support decisions without performing the downstream activity itself. It informs the learner's next move; it does not execute that move.

## 9. Levels Of Abstraction

The allowed abstraction levels are:

```text
Curriculum
  -> Modules
  -> Competencies
  -> Dependencies
  -> Planning
```

These levels belong in Modules because they describe how a learner understands the curriculum operating map.

The forbidden abstraction levels are:

- lessons;
- articles;
- exercises;
- notebook execution;
- research papers;
- semantic search;
- knowledge traversal;
- analytics dashboards.

These levels are forbidden because they shift the page into study, execution, retrieval, research, or measurement. The Modules Page may point toward those surfaces through transition meaning, but it must not absorb their information architecture.

## 10. Information Density Principles

The Modules Page must maintain restrained information density.

- One concept should govern each information layer.
- Information should not repeat unless repetition reduces ambiguity.
- Explanations should not duplicate the same purpose in multiple categories.
- Planning information should not compete with orientation information.
- Dependency information should not compete with module identity.
- Readiness information should not appear before the learner understands what readiness refers to.
- Transition information should not appear as a substitute for planning.
- Orientation should not become teaching.
- Planning should not become execution.
- Detail should never obscure structure.

These principles preserve the Modules Page as an orientation surface. The learner should encounter enough information to decide, not so much information that deciding becomes harder.

## 11. Cognitive Load Rules

The canonical cognitive load rules are:

| Rule | Justification |
| --- | --- |
| Reveal before explaining | The learner must know what exists before interpreting meaning |
| Structure before detail | A stable frame reduces the effort required to place details |
| Identity before purpose | The learner must know which module is being considered before why it matters |
| Purpose before dependency | Dependencies are meaningful only when tied to module purpose |
| Dependency before progression | The learner must know requirements before evaluating advancement |
| Competency before readiness | Readiness depends on the capabilities the module expects or develops |
| Readiness before planning | Planning without readiness creates false confidence |
| Planning before transition | The learner should know the reason for leaving before leaving |
| Orientation before teaching | Modules explains curriculum position, not instructional content |
| Planning before execution | The learner chooses the next action before entering an action surface |
| Consequence after requirement | The learner should understand what is required before what is unlocked |
| Local meaning after global meaning | A module's role depends on the curriculum system it belongs to |

These rules keep the page predictable and reduce the number of simultaneous interpretations required from the learner.

## 12. Information Lifecycle

Information in Modules matures through these states:

```text
Unknown
  -> Visible
  -> Recognized
  -> Explored
  -> Understood
  -> Actionable
  -> Completed
```

| State | Meaning |
| --- | --- |
| Unknown | The learner has not yet encountered the information |
| Visible | The information is available at the right abstraction level |
| Recognized | The learner can identify the information category |
| Explored | The learner intentionally investigates the information |
| Understood | The learner can interpret meaning, relationship, or consequence |
| Actionable | The information supports a planning decision |
| Completed | The information has served its orientation purpose and can hand off to another surface |

This lifecycle describes information maturity, not learner progress. Its purpose is to ensure that information becomes useful before it becomes actionable.

## 13. Failure Modes

| Failure mode | Why it harms orientation |
| --- | --- |
| Too much information | The learner cannot identify what matters first |
| Too little information | The learner cannot make a justified curriculum decision |
| Wrong abstraction | The page stops behaving like a module-level operating map |
| Mixing Learning with Modules | Study flow replaces orientation flow |
| Mixing Retrieval with Modules | Search and evidence discovery replace curriculum sequencing |
| Mixing Home with Modules | Platform identity replaces module decision support |
| Module details before curriculum | The learner evaluates parts without understanding the whole |
| Dependencies before purpose | Requirements feel arbitrary rather than meaningful |
| Execution before planning | The learner is pushed into action before understanding readiness |
| Graph before structure | Relationship complexity appears before semantic meaning |
| Competencies without module role | Capabilities lose curriculum context |
| Transition without planning | The learner leaves without knowing why |
| Difficulty before purpose | Effort becomes more salient than learning value |
| Redundant explanations | Repetition competes with decision clarity |
| Hidden prerequisites | The learner may choose an inappropriate next step |

Each failure mode increases uncertainty or shifts the page away from the Modules Page mission defined by NV-210-M0.

## 14. Immutable IA Principles

1. Information must flow from global to local.
2. Every information layer must reduce uncertainty.
3. Curriculum structure precedes module interpretation.
4. Module identity is mandatory.
5. Module purpose is mandatory.
6. Module role must be expressed before dependency meaning.
7. Dependencies are always contextual.
8. Competencies must connect modules to learner capability.
9. Readiness must be based on curriculum meaning, not isolated labels.
10. Planning comes before transition.
11. Transition must follow a learner decision.
12. No information exists without architectural justification.
13. The learner never sees implementation concepts.
14. The page never descends into lesson-level instruction.
15. The page never becomes retrieval or search architecture.
16. The page never becomes a practice or execution surface.
17. The page never replaces platform-level orientation.
18. Detail must not obscure structure.
19. Secondary information must never be required before critical information.
20. Information must be organized by learner questions, not internal data convenience.
21. Each category must have a distinct responsibility.
22. Redundant information must be removed unless it reduces ambiguity.
23. Dependencies must clarify readiness, not intimidate the learner.
24. Unlocks must clarify progression, not promise unrelated outcomes.
25. The Modules Page must remain valid even if the interface is redesigned.

## Verdict

CANONICAL — LOCKED
