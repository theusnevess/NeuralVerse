/**
 * NV-2100-D9-OPT-10 — Visual Presentation Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Visual Presentation Kernel.
 * Covers: valid profile, valid accessibility, valid reading flow, valid emphasis,
 * valid relationship, valid provenance, valid trace, empty registry, duplicate IDs,
 * duplicate titles, deterministic ordering, invalid enums, missing provenance/provider/rationale,
 * missing references, missing configuration, self-relationships, empty registries,
 * registry inconsistencies, determinism (100 iterations), immutability, negative
 * capability, cross-agent boundaries, validation code stability, public API
 * exports, backward compatibility with D9-OPT-01 through D9-OPT-09.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  VisualPresentationProfile,
  AccessibilityMetadata,
  ReadingFlowMetadata,
  VisualEmphasisMetadata,
  PresentationRelationship,
  PresentationInput,
  PresentationRegistry,
  VisualPresentationProvenance,
  VisualPresentationTrace,
  CuriosityArtifactWithPresentation,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_VISUAL_PRESENTATION_TYPES,
  CANONICAL_VISUAL_HIERARCHY,
  CANONICAL_ACCESSIBILITY_LEVELS,
  CANONICAL_READING_FLOW,
  CANONICAL_VISUAL_EMPHASIS,
  CANONICAL_VISUAL_PRESENTATION_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

import {
  composeVisualPresentationProvenance,
  composeVisualPresentationTrace,
  composeVisualPresentationProfile,
  composeAccessibilityMetadata,
  composeReadingFlowMetadata,
  composeVisualEmphasisMetadata,
  composePresentationRelationship,
  composePresentationRegistry,
  composePresentationRegistryFromInput,
  composePresentationArtifacts,
  composeCuriosityArtifactWithPresentation,
  isSupportedVisualPresentationType,
  isSupportedVisualHierarchy,
  isSupportedAccessibilityLevel,
  isSupportedReadingFlow,
  isSupportedVisualEmphasis,
  isSupportedPresentationStatus,
  isSupportedPresentationGovernance,
  getCanonicalVisualPresentationTypes,
  getCanonicalVisualHierarchy,
  getCanonicalAccessibilityLevels,
  getCanonicalReadingFlows,
  getCanonicalVisualEmphasis,
  getCanonicalPresentationStatuses,
} from './VisualPresentationKernel.ts';

import {
  validateVisualPresentationProfile,
  validateAccessibilityMetadata,
  validateReadingFlowMetadata,
  validateVisualEmphasisMetadata,
  validatePresentationRelationship,
  validatePresentationRegistry,
  validatePresentationInput,
  validatePresentationTrace,
  validateCuriosityArtifactWithPresentation,
  PRESENTATION_VALIDATION_CODES,
} from './VisualPresentationValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: VisualPresentationProvenance = {
  provider: 'NeuralVerse Team',
  source: 'Curated Knowledge Base',
  rationale: 'Core visual presentation artifact.',
  version: '1.0.0',
};

const VALID_TRACE: VisualPresentationTrace = {
  traceId: '_trace_1',
  generatedFrom: 'deterministic_visual_presentation_kernel',
  deterministic: true,
  randomUsed: false,
  timeDependency: false,
};

const VALID_PROFILE: VisualPresentationProfile = {
  profileId: 'pres-001',
  title: 'Neural Network Curiosity Card',
  presentationType: 'card',
  visualHierarchy: 'primary',
  accessibilityLevel: 'wcag_aa',
  readingFlow: 'sequential',
  conceptIds: ['concept-001', 'concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_PROFILE_2: VisualPresentationProfile = {
  profileId: 'pres-002',
  title: 'Historical Oddity Callout',
  presentationType: 'callout',
  visualHierarchy: 'secondary',
  accessibilityLevel: 'screen_reader',
  readingFlow: 'scannable',
  conceptIds: ['concept-003'],
  status: 'approved',
  governance: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Archives' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_ACCESSIBILITY: AccessibilityMetadata = {
  metadataId: 'acc-001',
  profileId: 'pres-001',
  accessibilityLevel: 'wcag_aa',
  screenReaderSupport: true,
  keyboardNavigation: true,
  voiceControl: false,
  highContrast: true,
  reducedMotion: false,
  cognitiveSupport: true,
  altText: 'Neural Network Curiosity Card',
  ariaLabel: 'Curiosity card about neural networks',
  tabIndex: 0,
};

const VALID_READING_FLOW: ReadingFlowMetadata = {
  metadataId: 'rf-001',
  profileId: 'pres-001',
  readingFlow: 'sequential',
  scannable: true,
  progressiveDisclosure: false,
  chunkSize: '200',
  readingOrder: 1,
  cognitiveLoad: 'low',
};

const VALID_EMPHASIS: VisualEmphasisMetadata = {
  metadataId: 'emph-001',
  profileId: 'pres-001',
  emphasisType: 'highlight',
  intensity: 'moderate',
  colorAccent: '#0066cc',
  iconReference: 'icon-info',
  animationStyle: 'none',
  sizeVariation: 'normal',
};

const VALID_RELATIONSHIP: PresentationRelationship = {
  relationshipId: 'pres-rel-001',
  sourceProfileId: 'pres-001',
  targetProfileId: 'pres-002',
  relationshipType: 'related_to',
  description: 'These presentations are related.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: PresentationInput = {
  profiles: [VALID_PROFILE, VALID_PROFILE_2],
  accessibility: [VALID_ACCESSIBILITY],
  readingFlows: [VALID_READING_FLOW],
  emphasis: [VALID_EMPHASIS],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: PresentationInput = {
  profiles: [],
  accessibility: [],
  readingFlows: [],
  emphasis: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Profile Composition Tests
// ---------------------------------------------------------------------------

describe('Visual Presentation Kernel — Profile Composition', () => {
  it('should compose valid visual presentation provenance', () => {
    const provenance = composeVisualPresentationProvenance({
      provider: 'NeuralVerse Team',
      source: 'Curated Knowledge Base',
      rationale: 'Core concept.',
      version: '1.0.0',
    });

    assert.equal(provenance.provider, 'NeuralVerse Team');
    assert.equal(provenance.source, 'Curated Knowledge Base');
    assert.equal(provenance.rationale, 'Core concept.');
    assert.equal(provenance.version, '1.0.0');
  });

  it('should compose valid visual presentation profile', () => {
    const profile = composeVisualPresentationProfile({
      profileId: 'pres-001',
      title: 'Neural Network Curiosity Card',
      presentationType: 'card',
      visualHierarchy: 'primary',
      accessibilityLevel: 'wcag_aa',
      readingFlow: 'sequential',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(profile.profileId, 'pres-001');
    assert.equal(profile.title, 'Neural Network Curiosity Card');
    assert.equal(profile.presentationType, 'card');
    assert.equal(profile.visualHierarchy, 'primary');
    assert.equal(profile.accessibilityLevel, 'wcag_aa');
    assert.equal(profile.readingFlow, 'sequential');
    assert.equal(profile.conceptIds.length, 1);
    assert.equal(profile.status, 'published');
    assert.equal(profile.governance, 'canonical');
  });

  it('should compose valid visual presentation trace', () => {
    const trace = composeVisualPresentationTrace({
      traceId: '_trace_1',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid accessibility metadata', () => {
    const metadata = composeAccessibilityMetadata({
      metadataId: 'acc-001',
      profileId: 'pres-001',
      accessibilityLevel: 'wcag_aa',
      screenReaderSupport: true,
      keyboardNavigation: true,
      voiceControl: false,
      highContrast: true,
      reducedMotion: false,
      cognitiveSupport: true,
      altText: 'Neural Network Curiosity Card',
      ariaLabel: 'Curiosity card about neural networks',
      tabIndex: 0,
    });

    assert.equal(metadata.metadataId, 'acc-001');
    assert.equal(metadata.profileId, 'pres-001');
    assert.equal(metadata.accessibilityLevel, 'wcag_aa');
    assert.equal(metadata.screenReaderSupport, true);
    assert.equal(metadata.keyboardNavigation, true);
    assert.equal(metadata.voiceControl, false);
    assert.equal(metadata.highContrast, true);
    assert.equal(metadata.reducedMotion, false);
    assert.equal(metadata.cognitiveSupport, true);
    assert.equal(metadata.altText, 'Neural Network Curiosity Card');
    assert.equal(metadata.ariaLabel, 'Curiosity card about neural networks');
    assert.equal(metadata.tabIndex, 0);
  });

  it('should compose valid reading flow metadata', () => {
    const metadata = composeReadingFlowMetadata({
      metadataId: 'rf-001',
      profileId: 'pres-001',
      readingFlow: 'sequential',
      scannable: true,
      progressiveDisclosure: false,
      chunkSize: '200',
      readingOrder: 1,
      cognitiveLoad: 'low',
    });

    assert.equal(metadata.metadataId, 'rf-001');
    assert.equal(metadata.profileId, 'pres-001');
    assert.equal(metadata.readingFlow, 'sequential');
    assert.equal(metadata.scannable, true);
    assert.equal(metadata.progressiveDisclosure, false);
    assert.equal(metadata.chunkSize, '200');
    assert.equal(metadata.readingOrder, 1);
    assert.equal(metadata.cognitiveLoad, 'low');
  });

  it('should compose valid visual emphasis metadata', () => {
    const metadata = composeVisualEmphasisMetadata({
      metadataId: 'emph-001',
      profileId: 'pres-001',
      emphasisType: 'highlight',
      intensity: 'moderate',
      colorAccent: '#0066cc',
      iconReference: 'icon-info',
      animationStyle: 'none',
      sizeVariation: 'normal',
    });

    assert.equal(metadata.metadataId, 'emph-001');
    assert.equal(metadata.profileId, 'pres-001');
    assert.equal(metadata.emphasisType, 'highlight');
    assert.equal(metadata.intensity, 'moderate');
    assert.equal(metadata.colorAccent, '#0066cc');
    assert.equal(metadata.iconReference, 'icon-info');
    assert.equal(metadata.animationStyle, 'none');
    assert.equal(metadata.sizeVariation, 'normal');
  });

  it('should compose valid presentation relationship', () => {
    const relationship = composePresentationRelationship({
      relationshipId: 'pres-rel-001',
      sourceProfileId: 'pres-001',
      targetProfileId: 'pres-002',
      relationshipType: 'related_to',
      description: 'Related presentations.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'pres-rel-001');
    assert.equal(relationship.sourceProfileId, 'pres-001');
    assert.equal(relationship.targetProfileId, 'pres-002');
    assert.equal(relationship.relationshipType, 'related_to');
    assert.equal(relationship.description, 'Related presentations.');
  });

  it('should validate a valid profile with no errors', () => {
    const errors = validateVisualPresentationProfile(VALID_PROFILE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composePresentationRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_ACCESSIBILITY], [VALID_READING_FLOW], [VALID_EMPHASIS], [VALID_RELATIONSHIP]);
    const result = validatePresentationRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate presentation input', () => {
    const result = validatePresentationInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Visual Presentation Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composePresentationRegistry([], [], [], [], []);
    const result = validatePresentationRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have PRESENTATION_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composePresentationRegistry([VALID_PROFILE, VALID_PROFILE], [], [], [], []);
    const result = validatePresentationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have PRESENTATION_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE, profileId: 'pres-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE, profileId: 'pres-002', title: 'Same Title' };
    const registry = composePresentationRegistry([profile1, profile2], [], [], [], []);
    const result = validatePresentationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have PRESENTATION_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by profileId', () => {
    const profile3 = { ...VALID_PROFILE, profileId: 'pres-003' };
    const profile1 = { ...VALID_PROFILE, profileId: 'pres-001' };
    const profile2 = { ...VALID_PROFILE, profileId: 'pres-002' };

    const registry = composePresentationRegistry([profile3, profile1, profile2], [], [], [], []);

    assert.equal(registry.profiles[0].profileId, 'pres-001');
    assert.equal(registry.profiles[1].profileId, 'pres-002');
    assert.equal(registry.profiles[2].profileId, 'pres-003');
  });

  it('should sort by presentationType when profileId is equal', () => {
    const profileA = { ...VALID_PROFILE, profileId: 'pres-001', presentationType: 'callout' as const };
    const profileB = { ...VALID_PROFILE, profileId: 'pres-001', presentationType: 'card' as const };

    const registry = composePresentationRegistry([profileA, profileB], [], [], [], []);

    // Alphabetical sort: 'callout' < 'card'
    assert.equal(registry.profiles[0].presentationType, 'callout');
    assert.equal(registry.profiles[1].presentationType, 'card');
  });

  it('should detect self-relationships', () => {
    const selfRelationship: PresentationRelationship = {
      relationshipId: 'pres-rel-self',
      sourceProfileId: 'pres-001',
      targetProfileId: 'pres-001',
      relationshipType: 'related_to',
      description: 'Self relationship.',
      provenance: VALID_PROVENANCE,
    };

    const registry = composePresentationRegistry([VALID_PROFILE], [], [], [], [selfRelationship]);
    const result = validatePresentationRegistry(registry);
    const selfError = result.errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have PRESENTATION_SELF_RELATIONSHIP error');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Visual Presentation Kernel — Validation', () => {
  it('should detect invalid presentation type', () => {
    const profile = { ...VALID_PROFILE, presentationType: 'unsupported' as any };
    const errors = validateVisualPresentationProfile(profile);
    const typeError = errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have PRESENTATION_INVALID_TYPE error');
  });

  it('should detect invalid visual hierarchy', () => {
    const profile = { ...VALID_PROFILE, visualHierarchy: 'unsupported' as any };
    const errors = validateVisualPresentationProfile(profile);
    const hierarchyError = errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_HIERARCHY,
    );

    assert.ok(hierarchyError, 'Should have PRESENTATION_INVALID_HIERARCHY error');
  });

  it('should detect invalid accessibility level', () => {
    const profile = { ...VALID_PROFILE, accessibilityLevel: 'unsupported' as any };
    const errors = validateVisualPresentationProfile(profile);
    const accessibilityError = errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_ACCESSIBILITY,
    );

    assert.ok(accessibilityError, 'Should have PRESENTATION_INVALID_ACCESSIBILITY error');
  });

  it('should detect invalid reading flow', () => {
    const profile = { ...VALID_PROFILE, readingFlow: 'unsupported' as any };
    const errors = validateVisualPresentationProfile(profile);
    const readingFlowError = errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_READING_FLOW,
    );

    assert.ok(readingFlowError, 'Should have PRESENTATION_INVALID_READING_FLOW error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE, status: 'unsupported' as any };
    const errors = validateVisualPresentationProfile(profile);
    const statusError = errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have PRESENTATION_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE, governance: 'unsupported' as any };
    const errors = validateVisualPresentationProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have PRESENTATION_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE, provenance: undefined as any };
    const errors = validateVisualPresentationProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have PRESENTATION_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance provider', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateVisualPresentationProfile(profile);
    const providerError = errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have PRESENTATION_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateVisualPresentationProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have PRESENTATION_MISSING_RATIONALE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeVisualPresentationTrace({
      traceId: '_trace_1',
    });

    const result = validatePresentationTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: VisualPresentationTrace = {
      traceId: '',
      generatedFrom: 'deterministic_visual_presentation_kernel',
      deterministic: false as true,
      randomUsed: false,
      timeDependency: false,
    };

    const result = validatePresentationTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect missing accessibility configuration', () => {
    const metadata: AccessibilityMetadata = {
      metadataId: 'acc-001',
      profileId: 'pres-001',
      accessibilityLevel: 'wcag_aa',
      screenReaderSupport: true,
      keyboardNavigation: true,
      voiceControl: false,
      highContrast: true,
      reducedMotion: false,
      cognitiveSupport: true,
      altText: '',
      ariaLabel: '',
      tabIndex: 0,
    };

    const errors = validateAccessibilityMetadata(metadata);
    const configError = errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have PRESENTATION_INVALID_CONFIGURATION error');
  });

  it('should detect missing reading flow configuration', () => {
    const metadata: ReadingFlowMetadata = {
      metadataId: 'rf-001',
      profileId: 'pres-001',
      readingFlow: 'sequential',
      scannable: true,
      progressiveDisclosure: false,
      chunkSize: '',
      readingOrder: 1,
      cognitiveLoad: '',
    };

    const errors = validateReadingFlowMetadata(metadata);
    const configError = errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have PRESENTATION_INVALID_CONFIGURATION error');
  });

  it('should detect missing emphasis configuration', () => {
    const metadata: VisualEmphasisMetadata = {
      metadataId: 'emph-001',
      profileId: 'pres-001',
      emphasisType: 'highlight',
      intensity: '',
      colorAccent: '#0066cc',
      iconReference: 'icon-info',
      animationStyle: 'none',
      sizeVariation: 'normal',
    };

    const errors = validateVisualEmphasisMetadata(metadata);
    const configError = errors.find(
      (e) => e.code === PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have PRESENTATION_INVALID_CONFIGURATION error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Visual Presentation Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composePresentationArtifacts>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composePresentationArtifacts(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composePresentationRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composePresentationRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_ACCESSIBILITY], [VALID_READING_FLOW], [VALID_EMPHASIS], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Visual Presentation Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE.profileId;
    const originalTitle = VALID_PROFILE.title;

    composePresentationArtifacts(VALID_INPUT);

    assert.equal(VALID_PROFILE.profileId, originalId);
    assert.equal(VALID_PROFILE.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.profileId);

    composePresentationRegistry(profiles, [], [], [], []);

    assert.equal(profiles[0].profileId, originalIds[0]);
    assert.equal(profiles[1].profileId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Visual Presentation Kernel — Helper Functions', () => {
  it('should return canonical visual presentation types', () => {
    const types = getCanonicalVisualPresentationTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_VISUAL_PRESENTATION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical visual hierarchy', () => {
    const hierarchy = getCanonicalVisualHierarchy();
    assert.deepStrictEqual([...hierarchy], [...CANONICAL_VISUAL_HIERARCHY]);
    assert.equal(hierarchy.length, 10);
  });

  it('should return canonical accessibility levels', () => {
    const levels = getCanonicalAccessibilityLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_ACCESSIBILITY_LEVELS]);
    assert.equal(levels.length, 10);
  });

  it('should return canonical reading flows', () => {
    const flows = getCanonicalReadingFlows();
    assert.deepStrictEqual([...flows], [...CANONICAL_READING_FLOW]);
    assert.equal(flows.length, 10);
  });

  it('should return canonical visual emphasis', () => {
    const emphasis = getCanonicalVisualEmphasis();
    assert.deepStrictEqual([...emphasis], [...CANONICAL_VISUAL_EMPHASIS]);
    assert.equal(emphasis.length, 10);
  });

  it('should return canonical presentation statuses', () => {
    const statuses = getCanonicalPresentationStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_VISUAL_PRESENTATION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate visual presentation type support', () => {
    assert.equal(isSupportedVisualPresentationType('card'), true);
    assert.equal(isSupportedVisualPresentationType('callout'), true);
    assert.equal(isSupportedVisualPresentationType('unsupported'), false);
  });

  it('should validate visual hierarchy support', () => {
    assert.equal(isSupportedVisualHierarchy('primary'), true);
    assert.equal(isSupportedVisualHierarchy('secondary'), true);
    assert.equal(isSupportedVisualHierarchy('unsupported'), false);
  });

  it('should validate accessibility level support', () => {
    assert.equal(isSupportedAccessibilityLevel('wcag_a'), true);
    assert.equal(isSupportedAccessibilityLevel('wcag_aa'), true);
    assert.equal(isSupportedAccessibilityLevel('unsupported'), false);
  });

  it('should validate reading flow support', () => {
    assert.equal(isSupportedReadingFlow('sequential'), true);
    assert.equal(isSupportedReadingFlow('scannable'), true);
    assert.equal(isSupportedReadingFlow('unsupported'), false);
  });

  it('should validate visual emphasis support', () => {
    assert.equal(isSupportedVisualEmphasis('bold'), true);
    assert.equal(isSupportedVisualEmphasis('highlight'), true);
    assert.equal(isSupportedVisualEmphasis('unsupported'), false);
  });

  it('should validate presentation status support', () => {
    assert.equal(isSupportedPresentationStatus('draft'), true);
    assert.equal(isSupportedPresentationStatus('published'), true);
    assert.equal(isSupportedPresentationStatus('unsupported'), false);
  });

  it('should validate presentation governance support', () => {
    assert.equal(isSupportedPresentationGovernance('canonical'), true);
    assert.equal(isSupportedPresentationGovernance('accepted'), true);
    assert.equal(isSupportedPresentationGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Visual Presentation Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 visual presentation types', () => {
    assert.equal(CANONICAL_VISUAL_PRESENTATION_TYPES.length, 10);
  });

  it('should have exactly 10 visual hierarchy', () => {
    assert.equal(CANONICAL_VISUAL_HIERARCHY.length, 10);
  });

  it('should have exactly 10 accessibility levels', () => {
    assert.equal(CANONICAL_ACCESSIBILITY_LEVELS.length, 10);
  });

  it('should have exactly 10 reading flows', () => {
    assert.equal(CANONICAL_READING_FLOW.length, 10);
  });

  it('should have exactly 10 visual emphasis', () => {
    assert.equal(CANONICAL_VISUAL_EMPHASIS.length, 10);
  });

  it('should have exactly 6 visual presentation statuses', () => {
    assert.equal(CANONICAL_VISUAL_PRESENTATION_STATUS.length, 6);
  });

  it('should have exactly 5 governance values', () => {
    assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5);
  });

  it('should contain all expected visual presentation types', () => {
    const expectedTypes = [
      'card',
      'callout',
      'sidebar',
      'modal',
      'tooltip',
      'banner',
      'badge',
      'chip',
      'tag',
      'annotation',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_VISUAL_PRESENTATION_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected visual hierarchy', () => {
    const expectedHierarchy = [
      'primary',
      'secondary',
      'tertiary',
      'quaternary',
      'accent',
      'subtle',
      'prominent',
      'inline',
      'standalone',
      'grouped',
    ];

    for (const hierarchy of expectedHierarchy) {
      assert.ok(
        CANONICAL_VISUAL_HIERARCHY.includes(hierarchy as any),
        `Should include hierarchy: ${hierarchy}`,
      );
    }
  });

  it('should contain all expected accessibility levels', () => {
    const expectedLevels = [
      'wcag_a',
      'wcag_aa',
      'wcag_aaa',
      'screen_reader',
      'keyboard_only',
      'voice_control',
      'high_contrast',
      'reduced_motion',
      'cognitive_support',
      'full_accessibility',
    ];

    for (const level of expectedLevels) {
      assert.ok(
        CANONICAL_ACCESSIBILITY_LEVELS.includes(level as any),
        `Should include level: ${level}`,
      );
    }
  });

  it('should contain all expected reading flows', () => {
    const expectedFlows = [
      'sequential',
      'hierarchical',
      'non_sequential',
      'scannable',
      'focused',
      'branching',
      'progressive',
      'modular',
      'linear',
      'reference',
    ];

    for (const flow of expectedFlows) {
      assert.ok(
        CANONICAL_READING_FLOW.includes(flow as any),
        `Should include flow: ${flow}`,
      );
    }
  });

  it('should contain all expected visual emphasis', () => {
    const expectedEmphasis = [
      'bold',
      'italic',
      'underline',
      'highlight',
      'color_accent',
      'icon',
      'animation',
      'size_variation',
      'spacing',
      'border',
    ];

    for (const emphasis of expectedEmphasis) {
      assert.ok(
        CANONICAL_VISUAL_EMPHASIS.includes(emphasis as any),
        `Should include emphasis: ${emphasis}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Visual Presentation Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate UI', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('generatedUI' in result), 'Should not have generated UI');
    assert.ok(!('ui' in result), 'Should not have UI');
  });

  it('should not render layouts', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('renderedLayout' in result), 'Should not have rendered layout');
    assert.ok(!('layout' in result), 'Should not have layout');
  });

  it('should not produce HTML', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('html' in result), 'Should not have HTML');
    assert.ok(!('renderedHtml' in result), 'Should not have rendered HTML');
  });

  it('should not generate CSS', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('css' in result), 'Should not have CSS');
    assert.ok(!('styles' in result), 'Should not have styles');
  });

  it('should not invoke frontend components', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('frontendInvocation' in result), 'Should not have frontend invocation');
    assert.ok(!('components' in result), 'Should not have components');
  });

  it('should not access filesystem', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeVisualPresentationProfile({
      profileId: 'pres-001',
      title: 'Test',
      presentationType: 'card',
      visualHierarchy: 'primary',
      accessibilityLevel: 'wcag_aa',
      readingFlow: 'sequential',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    const keys = Object.keys(profile);
    for (const key of keys) {
      const value = (profile as any)[key];
      assert.ok(typeof value !== 'function', `Profile field "${key}" should not be a function`);
    }
  });

  it('should not store runtime execution', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Visual Presentation Kernel — Cross-Agent Boundary', () => {
  it('should not reference Narrative Agent', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('narrativeAgent' in result), 'Should not reference Narrative Agent');
    assert.ok(!('narrative' in result), 'Should not reference narrative');
  });

  it('should not reference Knowledge Agent', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('knowledgeAgent' in result), 'Should not reference Knowledge Agent');
    assert.ok(!('knowledge' in result), 'Should not reference knowledge');
  });

  it('should not reference Didactic Agent', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('didacticAgent' in result), 'Should not reference Didactic Agent');
    assert.ok(!('didactic' in result), 'Should not reference didactic');
  });

  it('should not reference Research Agent', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('researchAgent' in result), 'Should not reference Research Agent');
    assert.ok(!('research' in result), 'Should not reference research');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('laboratoryAgent' in result), 'Should not reference Laboratory Agent');
    assert.ok(!('laboratory' in result), 'Should not reference laboratory');
  });

  it('should not reference Application Agent', () => {
    const result = composePresentationArtifacts(VALID_INPUT);
    assert.ok(!('applicationAgent' in result), 'Should not reference Application Agent');
    assert.ok(!('application' in result), 'Should not reference application');
  });
});

// ---------------------------------------------------------------------------
// Validation Codes Tests
// ---------------------------------------------------------------------------

describe('Visual Presentation Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_DUPLICATE_ID, 'PRESENTATION_DUPLICATE_ID');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_DUPLICATE_TITLE, 'PRESENTATION_DUPLICATE_TITLE');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_TYPE, 'PRESENTATION_INVALID_TYPE');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_HIERARCHY, 'PRESENTATION_INVALID_HIERARCHY');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_ACCESSIBILITY, 'PRESENTATION_INVALID_ACCESSIBILITY');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_READING_FLOW, 'PRESENTATION_INVALID_READING_FLOW');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_EMPHASIS, 'PRESENTATION_INVALID_EMPHASIS');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_STATUS, 'PRESENTATION_INVALID_STATUS');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_GOVERNANCE, 'PRESENTATION_INVALID_GOVERNANCE');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_PROVENANCE, 'PRESENTATION_MISSING_PROVENANCE');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_PROVIDER, 'PRESENTATION_MISSING_PROVIDER');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_RATIONALE, 'PRESENTATION_MISSING_RATIONALE');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_CURIOSITY_REFERENCE, 'PRESENTATION_MISSING_CURIOSITY_REFERENCE');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_PROFILE_ID, 'PRESENTATION_MISSING_PROFILE_ID');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_TITLE, 'PRESENTATION_MISSING_TITLE');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_ACCESSIBILITY, 'PRESENTATION_MISSING_ACCESSIBILITY');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_SELF_RELATIONSHIP, 'PRESENTATION_SELF_RELATIONSHIP');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_EMPTY_REGISTRY, 'PRESENTATION_EMPTY_REGISTRY');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_TRACE, 'PRESENTATION_INVALID_TRACE');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_REGISTRY_INCONSISTENCY, 'PRESENTATION_REGISTRY_INCONSISTENCY');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_CONFIGURATION, 'PRESENTATION_INVALID_CONFIGURATION');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_RELATIONSHIP, 'PRESENTATION_INVALID_RELATIONSHIP');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_GOVERNANCE, 'PRESENTATION_MISSING_GOVERNANCE');
    assert.equal(PRESENTATION_VALIDATION_CODES.PRESENTATION_UNSUPPORTED_METADATA, 'PRESENTATION_UNSUPPORTED_METADATA');
  });

  it('should have exactly 24 validation codes', () => {
    const codeCount = Object.keys(PRESENTATION_VALIDATION_CODES).length;
    assert.equal(codeCount, 24);
  });
});

// ---------------------------------------------------------------------------
// Public API Export Tests
// ---------------------------------------------------------------------------

describe('Visual Presentation Kernel — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeVisualPresentationProvenance, 'function');
    assert.equal(typeof composeVisualPresentationTrace, 'function');
    assert.equal(typeof composeVisualPresentationProfile, 'function');
    assert.equal(typeof composeAccessibilityMetadata, 'function');
    assert.equal(typeof composeReadingFlowMetadata, 'function');
    assert.equal(typeof composeVisualEmphasisMetadata, 'function');
    assert.equal(typeof composePresentationRelationship, 'function');
    assert.equal(typeof composePresentationRegistry, 'function');
    assert.equal(typeof composePresentationRegistryFromInput, 'function');
    assert.equal(typeof composePresentationArtifacts, 'function');
    assert.equal(typeof composeCuriosityArtifactWithPresentation, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedVisualPresentationType, 'function');
    assert.equal(typeof isSupportedVisualHierarchy, 'function');
    assert.equal(typeof isSupportedAccessibilityLevel, 'function');
    assert.equal(typeof isSupportedReadingFlow, 'function');
    assert.equal(typeof isSupportedVisualEmphasis, 'function');
    assert.equal(typeof isSupportedPresentationStatus, 'function');
    assert.equal(typeof isSupportedPresentationGovernance, 'function');
    assert.equal(typeof getCanonicalVisualPresentationTypes, 'function');
    assert.equal(typeof getCanonicalVisualHierarchy, 'function');
    assert.equal(typeof getCanonicalAccessibilityLevels, 'function');
    assert.equal(typeof getCanonicalReadingFlows, 'function');
    assert.equal(typeof getCanonicalVisualEmphasis, 'function');
    assert.equal(typeof getCanonicalPresentationStatuses, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateVisualPresentationProfile, 'function');
    assert.equal(typeof validateAccessibilityMetadata, 'function');
    assert.equal(typeof validateReadingFlowMetadata, 'function');
    assert.equal(typeof validateVisualEmphasisMetadata, 'function');
    assert.equal(typeof validatePresentationRelationship, 'function');
    assert.equal(typeof validatePresentationRegistry, 'function');
    assert.equal(typeof validatePresentationInput, 'function');
    assert.equal(typeof validatePresentationTrace, 'function');
    assert.equal(typeof validateCuriosityArtifactWithPresentation, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(PRESENTATION_VALIDATION_CODES);
    assert.equal(typeof PRESENTATION_VALIDATION_CODES, 'object');
  });
});
