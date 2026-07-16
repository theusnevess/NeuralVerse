# NV-1200 Scientific Stage

## Mission

The Scientific Stage is the primary observation surface of a laboratory. It presents direct visual evidence of an experiment's entities, process, state transition, measurement, and terminal result. It is not a configuration surface, telemetry duplicate, or generic dashboard.

## Boundaries

Laboratory definitions own domain algorithms, datasets, primary renderers, preparation renderers, and completion summaries. The Experiment Rail owns configuration and compact telemetry. The Execution Deck owns lifecycle controls. The Completion Deck owns the terminal outcome. The Stage adapter only normalizes existing laboratory evidence for presentation and accessibility; it must not reproduce scientific calculations.

## Rendering Model

`laboratory adapter -> normalized scientific Stage view model -> domain renderer`

Each laboratory declares `scientificStage` with a scientific question, evidence keys, and an evidence-linked interpretation. `ScientificStage.buildViewModel` selects preparation telemetry, inspector state, or completion evidence according to lifecycle state. `ScientificStage.decorate` adds a concise semantic summary and SVG title/description semantics to the domain-owned rendering.

## Layers And States

The Stage combines scientific context (entities and variables), dynamic process (domain renderer transition), scientific evidence (registered measurement keys), and a concise interpretation. Preparation renders meaningful initial entities. Running and paused use the exact current step state. Completed uses the same laboratory completion summary used by the Completion Deck. Motion, where a renderer uses it, must represent a bounded domain state transition and must not be required to understand evidence.

## Responsive And Accessibility Rules

The primary scientific mark remains within the Stage at every canonical viewport. On compact screens the Stage retains the primary mark and stacks surrounding rail content normally. The visible Stage question is local to its renderer. Each Stage exposes a short non-visual summary, state, and labeled SVG representation; color never carries the only available meaning. No renderer may expose invalid numeric text. Reduced-motion mode preserves current evidence without requiring animation.

## Shared Primitives

Shared primitives are intentionally limited to the Stage adapter, local scientific-question label, semantic summary, and SVG accessibility decoration. Domain renderers remain laboratory-specific; no universal visualization renderer is introduced.

## Validation

`tests/nv-1200-scientific-stage.spec.ts` verifies all registered laboratories in preparation, active, and completed states for semantic evidence, valid values, mark containment, horizontal overflow, reduced-motion behavior, and terminal Stage state. The canonical layout suite remains the authority for workspace-region and layout contracts.
