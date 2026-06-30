# D9-OPT-10 — Visual Curiosity Presentation & Accessibility Metadata

## Purpose

This phase extends the Curiosity Agent with Visual Curiosity Presentation & Accessibility Metadata, enabling the platform to define the deterministic metadata model describing how curiosity artifacts are visually presented and made accessible without generating UI, rendering layouts, producing HTML, or invoking any frontend components.

## Motivation

The Curiosity Agent must be capable of expressing how curiosity artifacts are visually presented and made accessible. This layer provides the deterministic metadata structures that enable this without generating any visual output, rendering layouts, producing HTML, or invoking frontend components.

## Architecture

The Visual Presentation Kernel follows the same architectural patterns established by D9-OPT-01 through D9-OPT-09:

- **Pure functions**: All composition and validation functions are pure, with no side effects
- **Immutable contracts**: All interfaces use `readonly` properties
- **Deterministic compose functions**: Composition functions produce identical output for identical input
- **Validation never throws**: Validation returns structured error results
- **Canonical enums as const tuples**: Enums are defined as `as const` arrays
- **Helper functions**: Type guards and canonical getters provide safe access
- **Barrel exports**: Public API is organized through index.ts
- **Defensive copies**: Arrays are copied before sorting
- **Stable ordering**: Deterministic sort comparators ensure consistent output
- **No side effects**: No filesystem, network, or external API access

## Canonical Enums

### Visual Presentation Types (10 values)

| Presentation Type | Description |
|-------------------|-------------|
| `card` | Card |
| `callout` | Callout |
| `sidebar` | Sidebar |
| `modal` | Modal |
| `tooltip` | Tooltip |
| `banner` | Banner |
| `badge` | Badge |
| `chip` | Chip |
| `tag` | Tag |
| `annotation` | Annotation |

### Visual Hierarchy (10 values)

| Hierarchy | Description |
|-----------|-------------|
| `primary` | Primary |
| `secondary` | Secondary |
| `tertiary` | Tertiary |
| `quaternary` | Quaternary |
| `accent` | Accent |
| `subtle` | Subtle |
| `prominent` | Prominent |
| `inline` | Inline |
| `standalone` | Standalone |
| `grouped` | Grouped |

### Accessibility Levels (10 values)

| Level | Description |
|-------|-------------|
| `wcag_a` | WCAG A |
| `wcag_aa` | WCAG AA |
| `wcag_aaa` | WCAG AAA |
| `screen_reader` | Screen reader |
| `keyboard_only` | Keyboard only |
| `voice_control` | Voice control |
| `high_contrast` | High contrast |
| `reduced_motion` | Reduced motion |
| `cognitive_support` | Cognitive support |
| `full_accessibility` | Full accessibility |

### Reading Flow (10 values)

| Flow | Description |
|------|-------------|
| `sequential` | Sequential |
| `hierarchical` | Hierarchical |
| `non_sequential` | Non-sequential |
| `scannable` | Scannable |
| `focused` | Focused |
| `branching` | Branching |
| `progressive` | Progressive |
| `modular` | Modular |
| `linear` | Linear |
| `reference` | Reference |

### Visual Emphasis (10 values)

| Emphasis | Description |
|----------|-------------|
| `bold` | Bold |
| `italic` | Italic |
| `underline` | Underline |
| `highlight` | Highlight |
| `color_accent` | Color accent |
| `icon` | Icon |
| `animation` | Animation |
| `size_variation` | Size variation |
| `spacing` | Spacing |
| `border` | Border |

### Visual Presentation Status (6 values)

| Status | Description |
|--------|-------------|
| `draft` | Draft |
| `review` | Under review |
| `approved` | Approved |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |

## Contracts

### VisualPresentationProfile

```typescript
interface VisualPresentationProfile {
  readonly profileId: string;
  readonly title: string;
  readonly presentationType: VisualPresentationType;
  readonly visualHierarchy: VisualHierarchy;
  readonly accessibilityLevel: AccessibilityLevel;
  readonly readingFlow: ReadingFlow;
  readonly conceptIds: readonly string[];
  readonly status: VisualPresentationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: VisualPresentationProvenance;
  readonly trace: VisualPresentationTrace;
}
```

### AccessibilityMetadata

```typescript
interface AccessibilityMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly accessibilityLevel: AccessibilityLevel;
  readonly screenReaderSupport: boolean;
  readonly keyboardNavigation: boolean;
  readonly voiceControl: boolean;
  readonly highContrast: boolean;
  readonly reducedMotion: boolean;
  readonly cognitiveSupport: boolean;
  readonly altText: string;
  readonly ariaLabel: string;
  readonly tabIndex: number;
}
```

### ReadingFlowMetadata

```typescript
interface ReadingFlowMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly readingFlow: ReadingFlow;
  readonly scannable: boolean;
  readonly progressiveDisclosure: boolean;
  readonly chunkSize: string;
  readonly readingOrder: number;
  readonly cognitiveLoad: string;
}
```

### PresentationRegistry

```typescript
interface PresentationRegistry {
  readonly registryId: string;
  readonly profiles: readonly VisualPresentationProfile[];
  readonly accessibility: readonly AccessibilityMetadata[];
  readonly readingFlows: readonly ReadingFlowMetadata[];
  readonly emphasis: readonly VisualEmphasisMetadata[];
  readonly relationships: readonly PresentationRelationship[];
  readonly metadata: PresentationRegistryMetadata;
  readonly trace: VisualPresentationTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_visual_presentation_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Composition Functions

| Function | Description |
|----------|-------------|
| `composeVisualPresentationProvenance` | Composes visual presentation provenance from parameters |
| `composeVisualPresentationTrace` | Composes a visual presentation trace from metadata |
| `composeVisualPresentationProfile` | Composes a visual presentation profile from parameters |
| `composeAccessibilityMetadata` | Composes accessibility metadata from parameters |
| `composeReadingFlowMetadata` | Composes reading flow metadata from parameters |
| `composeVisualEmphasisMetadata` | Composes visual emphasis metadata from parameters |
| `composePresentationRelationship` | Composes a presentation relationship from parameters |
| `composePresentationRegistry` | Composes a presentation registry |
| `composePresentationRegistryFromInput` | Composes a registry from input |
| `composePresentationArtifacts` | Main entry point for presentation composition |
| `composeCuriosityArtifactWithPresentation` | Composes an artifact with presentation |

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateVisualPresentationProfile` | Validates a single presentation profile |
| `validateAccessibilityMetadata` | Validates accessibility metadata |
| `validateReadingFlowMetadata` | Validates reading flow metadata |
| `validateVisualEmphasisMetadata` | Validates visual emphasis metadata |
| `validatePresentationRelationship` | Validates a presentation relationship |
| `validatePresentationRegistry` | Validates a presentation registry |
| `validatePresentationInput` | Validates presentation input |
| `validatePresentationTrace` | Validates a presentation trace |
| `validateCuriosityArtifactWithPresentation` | Validates an artifact with presentation |

## Validation Codes (24 stable codes)

| Code | Description |
|------|-------------|
| `PRESENTATION_DUPLICATE_ID` | Duplicate profile ID |
| `PRESENTATION_DUPLICATE_TITLE` | Duplicate profile title |
| `PRESENTATION_INVALID_TYPE` | Invalid presentation type |
| `PRESENTATION_INVALID_HIERARCHY` | Invalid visual hierarchy |
| `PRESENTATION_INVALID_ACCESSIBILITY` | Invalid accessibility level |
| `PRESENTATION_INVALID_READING_FLOW` | Invalid reading flow |
| `PRESENTATION_INVALID_EMPHASIS` | Invalid visual emphasis |
| `PRESENTATION_INVALID_STATUS` | Invalid presentation status |
| `PRESENTATION_INVALID_GOVERNANCE` | Invalid governance |
| `PRESENTATION_MISSING_PROVENANCE` | Missing provenance |
| `PRESENTATION_MISSING_PROVIDER` | Missing provider |
| `PRESENTATION_MISSING_RATIONALE` | Missing rationale |
| `PRESENTATION_MISSING_CURIOSITY_REFERENCE` | Missing curiosity reference |
| `PRESENTATION_MISSING_PROFILE_ID` | Missing profile ID |
| `PRESENTATION_MISSING_TITLE` | Missing title |
| `PRESENTATION_MISSING_ACCESSIBILITY` | Missing accessibility |
| `PRESENTATION_SELF_RELATIONSHIP` | Self-relationship |
| `PRESENTATION_EMPTY_REGISTRY` | Empty registry |
| `PRESENTATION_INVALID_TRACE` | Invalid trace |
| `PRESENTATION_REGISTRY_INCONSISTENCY` | Registry inconsistency |
| `PRESENTATION_INVALID_CONFIGURATION` | Invalid configuration |
| `PRESENTATION_INVALID_RELATIONSHIP` | Invalid relationship |
| `PRESENTATION_MISSING_GOVERNANCE` | Missing governance |
| `PRESENTATION_UNSUPPORTED_METADATA` | Unsupported presentation metadata |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedVisualPresentationType` | Type guard for presentation types |
| `isSupportedVisualHierarchy` | Type guard for visual hierarchy |
| `isSupportedAccessibilityLevel` | Type guard for accessibility levels |
| `isSupportedReadingFlow` | Type guard for reading flows |
| `isSupportedVisualEmphasis` | Type guard for visual emphasis |
| `isSupportedPresentationStatus` | Type guard for presentation statuses |
| `isSupportedPresentationGovernance` | Type guard for governance values |
| `getCanonicalVisualPresentationTypes` | Returns canonical presentation types |
| `getCanonicalVisualHierarchy` | Returns canonical visual hierarchy |
| `getCanonicalAccessibilityLevels` | Returns canonical accessibility levels |
| `getCanonicalReadingFlows` | Returns canonical reading flows |
| `getCanonicalVisualEmphasis` | Returns canonical visual emphasis |
| `getCanonicalPresentationStatuses` | Returns canonical presentation statuses |

## Determinism

All composition functions are deterministic:

- No `Math.random`
- No `Date.now`
- No `new Date`
- No `performance.now`
- No `crypto.randomUUID`
- No `Promise`
- No `async`/`await`
- No `fetch`
- No filesystem access
- No network access
- No environment variables

The test suite includes 100-iteration identity tests to verify determinism.

## Accessibility Metadata

The accessibility metadata layer models:

- WCAG compliance levels
- Screen reader support
- Keyboard navigation
- Voice control
- High contrast
- Reduced motion
- Cognitive support
- Alt text
- ARIA labels
- Tab indices

All metadata is deterministic and immutable.

## Reading Flow Metadata

The reading flow metadata layer models:

- Reading flow patterns
- Scannability
- Progressive disclosure
- Chunk sizes
- Reading order
- Cognitive load

All metadata is deterministic and immutable.

## Visual Hierarchy

The visual hierarchy metadata layer models:

- Primary, secondary, tertiary, quaternary hierarchy
- Accent and subtle hierarchy
- Prominent, inline, standalone, grouped hierarchy

All metadata is deterministic and immutable.

## Visual Emphasis

The visual emphasis metadata layer models:

- Bold, italic, underline
- Highlight, color accent
- Icon, animation
- Size variation, spacing, border

All metadata is deterministic and immutable.

## Cross-Agent Boundaries

The Curiosity Agent must NOT:

- Generate UI
- Render layouts
- Produce HTML
- Generate CSS
- Invoke frontend components
- Perform accessibility runtime adaptation
- Modify Narrative Agent
- Modify Knowledge Agent
- Modify Didactic Agent
- Modify Research Agent
- Modify Laboratory Agent
- Modify Application Agent

Everything remains metadata.

## Runtime Limitations

This phase defines only metadata structures. No runtime UI generation, layout rendering, HTML production, CSS generation, frontend invocation, or accessibility runtime adaptation exists.

## Out-of-Scope

- UI generation
- Layout rendering
- HTML production
- CSS generation
- Frontend invocation
- Accessibility runtime adaptation
- LLM invocation

## Relationship with D9-OPT-01

D9-OPT-10 extends D9-OPT-01 with Visual Curiosity Presentation & Accessibility Metadata. The base curiosity metadata infrastructure established in D9-OPT-01 remains unchanged. D9-OPT-10 adds:

- New canonical enums for visual presentation modeling
- New contracts for presentation profiles, accessibility metadata, reading flow metadata, and emphasis metadata
- New composition functions for visual presentation metadata
- New validation functions for visual presentation metadata
- Backward compatibility with D9-OPT-01

## Relationship with D9-OPT-02

D9-OPT-10 extends D9-OPT-02 with visual presentation modeling. The educational purpose modeling established in D9-OPT-02 remains unchanged. D9-OPT-10 adds:

- Visual presentation type modeling
- Visual hierarchy modeling
- Accessibility level modeling
- Backward compatibility with D9-OPT-02

## Relationship with D9-OPT-03

D9-OPT-10 extends D9-OPT-03 with visual presentation modeling. The humor layer established in D9-OPT-03 remains unchanged. D9-OPT-10 adds:

- Reading flow modeling
- Visual emphasis modeling
- Backward compatibility with D9-OPT-03

## Relationship with D9-OPT-04

D9-OPT-10 extends D9-OPT-04 with visual presentation modeling. The cultural reference governance established in D9-OPT-04 remains unchanged. D9-OPT-10 adds:

- Presentation relationship modeling
- Presentation registry structure
- Backward compatibility with D9-OPT-04

## Relationship with D9-OPT-05

D9-OPT-10 extends D9-OPT-05 with visual presentation modeling. The curiosity card, engineer note & field note modeling established in D9-OPT-05 remains unchanged. D9-OPT-10 adds:

- Visual presentation profile modeling
- Accessibility metadata modeling
- Reading flow metadata modeling
- Backward compatibility with D9-OPT-05

## Relationship with D9-OPT-06

D9-OPT-10 extends D9-OPT-06 with visual presentation modeling. The historical oddity, research trail & knowledge evolution curiosity modeling established in D9-OPT-06 remains unchanged. D9-OPT-10 adds:

- Visual emphasis metadata modeling
- Backward compatibility with D9-OPT-06

## Relationship with D9-OPT-07

D9-OPT-10 extends D9-OPT-07 with visual presentation modeling. The unexpected connection, limitation warning & application surprise modeling established in D9-OPT-07 remains unchanged. D9-OPT-10 adds:

- Presentation relationship modeling
- Backward compatibility with D9-OPT-07

## Relationship with D9-OPT-08

D9-OPT-10 extends D9-OPT-08 with visual presentation modeling. The laboratory challenge, what-if prompt & experiment curiosity modeling established in D9-OPT-08 remains unchanged. D9-OPT-10 adds:

- Presentation metadata modeling
- Backward compatibility with D9-OPT-08

## Relationship with D9-OPT-09

D9-OPT-10 extends D9-OPT-09 with visual presentation modeling. The misconception card & assessment reinforcement curiosity modeling established in D9-OPT-09 remains unchanged. D9-OPT-10 adds:

- Visual presentation metadata modeling
- Accessibility metadata modeling
- Backward compatibility with D9-OPT-09

## Public Exports

The barrel export (`index.ts`) provides:

- **Contracts**: All interfaces and types
- **Kernel**: All composition functions
- **Validation**: All validation functions and error codes
- **Helpers**: Type guards and canonical getters

## Repository Scope

### Allowed

```
src/agents/curiosity-pipeline/**
docs/architecture/nv-2100/**
```

### Forbidden

```
assessment-pipeline
didactic-pipeline
knowledge-pipeline
research-pipeline
laboratory-pipeline
application-pipeline
narrative-pipeline
runtime
frontend
shared
```
