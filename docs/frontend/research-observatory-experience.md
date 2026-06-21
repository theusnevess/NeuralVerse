# NV-600.7 — Research Observatory Experience

## Purpose

The Research Observatory Experience refines NeuralVerse's environmental identity without replacing the existing NV-600 foundations.

The goal is to make the application feel like a calm AI research laboratory, scientific observatory, living knowledge system, and precision instrument while preserving readability and productivity.

## Implementation Boundary

This phase is presentation-only.

It does not modify:

* Router architecture;
* Retrieval Engine;
* Reference Registry;
* Relationship Graph;
* Evidence Compiler;
* persistence;
* domain state;
* React Island ownership;
* assessment systems.

## Environmental Layer

The implementation adds `website/styles/research-observatory.css` as an environmental identity layer that builds on:

* NV-600.1 Motion Foundation;
* NV-600.2 Global Background System;
* NV-600.3 Premium Component Polish;
* NV-600.5 Navigation Motion;
* NV-600.6 Route & Layout Transitions;
* the existing Neural Galaxy canvas layer.

It adds low-opacity observatory calibration marks, contextual field accents, and hero-region environmental depth. These elements remain behind content and use `pointer-events: none`.

## Profile Behavior

The Neural Galaxy profile values now vary by route:

* `landing` and `home`: richest visual identity.
* `learning`, `modules`, and `content`: readable and content-first.
* `workspace`: subdued productivity profile.
* `retrieval`: highly restrained so graph and inspector surfaces dominate.
* `presentation`: calm editorial profile.
* `settings`: static utility-first profile.

## Motion

Motion remains limited to:

* very slow opacity breathing in the environmental layer;
* existing low-frequency neural galaxy movement;
* no cursor tracking;
* no scroll-reactive effects;
* no layout-affecting animation.

Reduced motion disables the added observatory breathing and leaves the environment static.

## Accessibility

All observatory enhancements are decorative.

They do not encode task-critical information, do not receive focus, do not intercept pointer events, and do not alter screen-reader semantics.

## Performance

The new observatory layer is CSS-only. It uses fixed pseudo-elements, gradients, opacity, and background composition.

No new JavaScript animation loops, observers, timers, dependencies, WebGL, Three.js, or shader systems are introduced.
