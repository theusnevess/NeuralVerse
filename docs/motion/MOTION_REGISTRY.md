# MOTION_REGISTRY.md

## Purpose

This file defines approved NeuralVerse motion patterns.

No animation or transition may be implemented unless registered here.

---

## Motion Rules

- Motion explains change.
- Motion is a cognitive support system.
- Content outranks motion.
- Reading outranks animation.
- Decorative-only motion is prohibited.
- Reduced-motion support is mandatory when motion exists.

---

## Approved Intensity Scale

```text
none
reduced
low
medium
```

No other intensity levels are valid.

---

## Motion Entry Template

```text
Motion ID:
Motion Name:
Purpose:
Trigger:
Target:
Duration Category:
Intensity:
Easing Category:
Allowed Usage:
Forbidden Usage:
Reduced-Motion Variant:
Disabled-Motion Variant:
Accessibility Risk:
Dependencies:
Owner:
Lifecycle Status:
Version:
Review Status:
```

---

## Approved Motion Entries

### Navigation Transition

```text
Motion ID: motion-navigation-transition
Motion Name: Navigation Transition
Purpose: Clarify navigation state changes and spatial continuity.
Trigger: Navigation state change.
Target: Navigation rail, active item, responsive navigation state.
Duration Category: normal
Intensity: low
Easing Category: standard
Allowed Usage: Navigation transitions only.
Forbidden Usage: Decorative navigation animation or attention-grabbing effects.
Reduced-Motion Variant: Instant or minimal opacity/state change.
Disabled-Motion Variant: Static state update.
Accessibility Risk: Low when reduced-motion supported.
Dependencies: motion.duration.normal
Owner: Motion Designer
Lifecycle Status: Approved
Version: 1.0.0
Review Status: Approved
```

### Focus Transition

```text
Motion ID: motion-focus-transition
Motion Name: Focus Transition
Purpose: Improve clarity of focus state changes.
Trigger: Element receives or loses focus.
Target: Interactive components.
Duration Category: normal
Intensity: reduced
Easing Category: standard
Allowed Usage: Focus-visible transitions.
Forbidden Usage: Movement-heavy focus effects.
Reduced-Motion Variant: Immediate focus state.
Disabled-Motion Variant: Static focus indicator.
Accessibility Risk: Low.
Dependencies: motion.duration.normal
Owner: Motion Designer
Lifecycle Status: Approved
Version: 1.0.0
Review Status: Approved
```

### Panel Expansion

```text
Motion ID: motion-panel-expansion
Motion Name: Panel Expansion
Purpose: Clarify expansion and collapse of contextual interface regions.
Trigger: Panel open, close, expand, or collapse.
Target: ContextPanel, NavigationRail when collapsible.
Duration Category: normal
Intensity: low
Easing Category: standard
Allowed Usage: Structural panel transitions.
Forbidden Usage: Elastic, playful, or game-like motion.
Reduced-Motion Variant: Minimal opacity or instant layout state.
Disabled-Motion Variant: Static open/closed state.
Accessibility Risk: Medium if layout shift is excessive.
Dependencies: motion.duration.normal
Owner: Motion Designer
Lifecycle Status: Approved
Version: 1.0.0
Review Status: Approved
```

### Search Invocation

```text
Motion ID: motion-search-invocation
Motion Name: Search Invocation
Purpose: Clarify the opening or expansion of search.
Trigger: Search activation.
Target: SearchBar, search results region.
Duration Category: normal
Intensity: low
Easing Category: standard
Allowed Usage: Search opening, expansion, and result visibility.
Forbidden Usage: Decorative reveal, excessive glow, unrelated motion.
Reduced-Motion Variant: Instant reveal.
Disabled-Motion Variant: Static reveal.
Accessibility Risk: Low when focus remains predictable.
Dependencies: motion.duration.normal
Owner: Motion Designer
Lifecycle Status: Approved
Version: 1.0.0
Review Status: Approved
```

### Command Palette Invocation

```text
Motion ID: motion-command-palette-invocation
Motion Name: Command Palette Invocation
Purpose: Clarify command palette entry and exit.
Trigger: Command palette open or close.
Target: Command Palette surface.
Duration Category: normal
Intensity: low
Easing Category: standard
Allowed Usage: Command palette invocation only.
Forbidden Usage: Dramatic overlay animation or game-like effects.
Reduced-Motion Variant: Instant overlay state.
Disabled-Motion Variant: Static open/closed state.
Accessibility Risk: Medium if focus management fails.
Dependencies: motion.duration.normal
Owner: Motion Designer
Lifecycle Status: Approved
Version: 1.0.0
Review Status: Approved
```

---

## Deprecated Motion Entries

None.

---

## Review Log

```text
Initial bootstrap:
Created as part of NV-023-TASK-001.
```

---

## M2 Foundation Component Motion Entries

### Button Press Feedback

```text
Motion ID: motion-button-press-feedback
Motion Name: Button Press Feedback
Purpose: Communicate hover and pressed states on interactive buttons.
Trigger: Button hover entry, hover exit, pointer down, pointer up.
Target: Button surface and label.
Duration Category: feedback
Intensity: low
Easing Category: standard
Allowed Usage: Button hover and press transitions only.
Forbidden Usage: Decorative button animation; scale/bounce effects; high-intensity transforms.
Reduced-Motion Variant: Instant background color state change.
Disabled-Motion Variant: Static state update.
Accessibility Risk: Low when reduced-motion supported.
Dependencies: sys.motion.duration.feedback, sys.motion.ease.interface
Owner: Motion Designer
Lifecycle Status: Approved
Version: 1.0.0
Review Status: Approved
```

### Selection State Transition

```text
Motion ID: motion-selection-state-transition
Motion Name: Selection State Transition
Purpose: Communicate checked/selected/on state changes for selection controls.
Trigger: Checkbox checked/unchecked; Radio selected; Switch toggled.
Target: Checkbox fill; Radio fill; Switch thumb position.
Duration Category: feedback
Intensity: low
Easing Category: standard
Allowed Usage: Checkbox, Radio, and Switch state changes only.
Forbidden Usage: Elastic or bounce effects; scale transforms; attention-grabbing animation.
Reduced-Motion Variant: Instant state visual update.
Disabled-Motion Variant: Static state update.
Accessibility Risk: Low when reduced-motion supported.
Dependencies: sys.motion.duration.feedback, sys.motion.ease.interface
Owner: Motion Designer
Lifecycle Status: Approved
Version: 1.0.0
Review Status: Approved
```

### Switch Thumb Slide

```text
Motion ID: motion-switch-thumb-slide
Motion Name: Switch Thumb Slide
Purpose: Communicate on/off state by sliding the thumb element along the track.
Trigger: Switch toggled.
Target: Switch thumb (position transition along track).
Duration Category: feedback
Intensity: low
Easing Category: standard
Allowed Usage: Switch component only.
Forbidden Usage: High-intensity slide; elastic bounce; overshoot effects.
Reduced-Motion Variant: Instant thumb position change.
Disabled-Motion Variant: Static on/off state.
Accessibility Risk: Low when reduced-motion supported.
Dependencies: sys.motion.duration.feedback, sys.motion.ease.interface
Owner: Motion Designer
Lifecycle Status: Approved
Version: 1.0.0
Review Status: Approved
```

### Tooltip Reveal

```text
Motion ID: motion-tooltip-reveal
Motion Name: Tooltip Reveal
Purpose: Communicate tooltip appearance and disappearance without drawing excessive attention.
Trigger: Trigger hover enter (appear); trigger hover leave or focus blur or Escape (dismiss).
Target: Tooltip panel (opacity or subtle transform).
Duration Category: feedback
Intensity: low
Easing Category: enter on appear; exit on dismiss
Allowed Usage: Tooltip appear and dismiss only.
Forbidden Usage: Slide animation drawing attention away from trigger; scale bounce; delayed dismiss that obscures content.
Reduced-Motion Variant: Instant appear and dismiss.
Disabled-Motion Variant: Static show/hide.
Accessibility Risk: Low when reduced-motion supported and focus behavior is correct.
Dependencies: sys.motion.duration.feedback, sys.motion.ease.enter, sys.motion.ease.exit
Owner: Motion Designer
Lifecycle Status: Approved
Version: 1.0.0
Review Status: Approved
```
