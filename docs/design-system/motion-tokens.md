# Motion Tokens

## Canonical Duration Tokens

| Token | Value | Usage |
|---|---:|---|
| `motion.duration.hover` | `100ms` | hover and press feedback |
| `motion.duration.state` | `140ms` | selected/open/active state changes |
| `motion.duration.enter` | `160ms` | component entry |
| `motion.duration.exit` | `120ms` | component exit |
| `motion.duration.page` | `180ms` | lightweight page or surface continuity |
| `motion.duration.staggerStep` | `24ms` | small stagger offset, disabled under reduced motion |

CSS variables:

```css
--motion-duration-hover
--motion-duration-state
--motion-duration-enter
--motion-duration-exit
--motion-duration-page
--motion-duration-stagger-step
```

## Canonical Easing Tokens

| Token | CSS variable | Usage |
|---|---|---|
| `motion.easing.standard` | `--motion-easing-standard` | standard state transition |
| `motion.easing.emphasized` | `--motion-easing-emphasized` | restrained emphasis |
| `motion.easing.decelerate` | `--motion-easing-decelerate` | entry/reveal |
| `motion.easing.accelerate` | `--motion-easing-accelerate` | exit/dismiss |

## Reduced Motion

Under `prefers-reduced-motion: reduce`, every canonical duration remaps to:

```css
var(--ref-motion-duration-instant)
```

Stagger delay and transform movement are disabled in `motion.css`.

## Budget

Maximum permitted common interaction duration:

```text
250ms
```

Any request to exceed this budget requires design-system review and accessibility validation.
