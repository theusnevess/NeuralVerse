# Motion Foundation

## Purpose

`NV-600.1` establishes the canonical NeuralVerse motion infrastructure.

Motion exists to communicate state, preserve continuity, and improve orientation. It must never compete with content or become decorative spectacle.

## Principles

- Motion communicates state.
- Content outranks motion.
- Common interactions must remain under 250 ms.
- Reduced motion is mandatory.
- No feature may define ad hoc transition timing when a canonical token exists.

## Implementation Surfaces

The foundation is implemented through:

- CSS tokens in `website/styles/tokens.css`
- Global motion utilities in `website/styles/motion.css`
- React primitives in `react-build/src/motion/NvMotion.jsx`
- React island wrapping in `react-build/src/index.jsx`

## Allowed Motion

- opacity
- small scale
- small `translateY`
- collapse height/visibility
- state and presence transitions
- staggered reveal, disabled under reduced motion

## Forbidden Motion

- bounce
- elastic or spring effects
- infinite loops
- particles
- random movement
- physics simulation
- decorative pulse
- graph engine animation coupling

## Reduced Motion

`prefers-reduced-motion: reduce` remaps canonical durations to instant and disables stagger/transform motion through `motion.css`.

Essential state feedback may remain visible as an instant state change.

## Performance Contract

The foundation does not use:

- `requestAnimationFrame`
- intervals
- polling
- animation libraries
- graph coupling
- domain state subscriptions

## Adoption

Initial low-risk adoption includes:

- Hover Preview
- Discovery Panels
- Contextual Menus
- Inspector panels
- Memory Layer
- Workspace Snapshot
- Compare Workspace
- Research Presentation

Future UI work must consume these primitives rather than creating local timing/easing rules.
