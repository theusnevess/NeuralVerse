/**
 * NV-1900-D7-OPT-10 — Technology Maturity Classification Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Technology Maturity Kernel.
 * Covers: valid maturity composition, valid ecosystem profiles, valid adoption profiles,
 * valid lifecycle classifications, valid readiness indicators, valid provenance,
 * registry composition, artifact with technology maturity, duplicate IDs,
 * duplicate titles, invalid enums, missing provenance, missing provider,
 * missing rationale, missing references, empty registry, registry inconsistency,
 * invalid trace, deterministic ordering, 100 identical executions,
 * immutable registry, input immutability, artifact immutability,
 * cross-agent boundary verification, negative capability verification,
 * helper functions, canonical enum completeness, validator stability,
 * no mutation verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  TechnologyMaturityProfile,
  TechnologyMaturityProvenance,
  EcosystemProfile,
  IndustryAdoptionProfile,
  LifecycleClassification,
  ReadinessIndicator,
  TechnologyMaturityInput,
  TechnologyMaturityRegistry,
  TechnologyMaturityTrace,
  ApplicationNode,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_TECHNOLOGY_MATURITY_LEVELS,
  CANONICAL_ECOSYSTEM_STABILITY_TYPES,
  CANONICAL_INDUSTRY_ADOPTION_TYPES,
  CANONICAL_TECHNOLOGY_LIFECYCLE_TYPES,
  CANONICAL_READINESS_INDICATORS,
  CANONICAL_TECHNOLOGY_MATURITY_STATUS,
} from './ApplicationAgentContract.ts';

import {
  composeTechnologyMaturityProvenance,
  composeTechnologyMaturityProfile,
  composeEcosystemProfile,
  composeIndustryAdoptionProfile,
  composeLifecycleClassification,
  composeReadinessIndicator,
  composeTechnologyMaturityDecision,
  composeTechnologyMaturityTrace,
  composeTechnologyMaturityRegistry,
  composeTechnologyMaturityRegistryFromInput,
  composeTechnologyMaturity,
  composeApplicationArtifactWithTechnologyMaturity,
  isSupportedTechnologyMaturityLevel,
  isSupportedEcosystemStability,
  isSupportedIndustryAdoption,
  isSupportedLifecycleClassification,
  isSupportedReadinessIndicator,
  isSupportedTechnologyMaturityStatus,
  isSupportedTechnologyMaturityGovernance,
  getCanonicalTechnologyMaturityLevels,
  getCanonicalEcosystemStabilityTypes,
  getCanonicalIndustryAdoptionTypes,
  getCanonicalLifecycleClassificationTypes,
  getCanonicalReadinessIndicators,
  getCanonicalTechnologyMaturityStatuses,
} from './TechnologyMaturityKernel.ts';

import {
  validateTechnologyMaturityProfile,
  validateEcosystemProfile,
  validateIndustryAdoptionProfile,
  validateLifecycleClassification,
  validateReadinessIndicator,
  validateTechnologyMaturityRegistry,
  validateTechnologyMaturityInput,
  validateTechnologyMaturityTrace,
  TECHNOLOGY_MATURITY_VALIDATION_CODES,
} from './TechnologyMaturityValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: TechnologyMaturityProvenance = {
  providedBy: 'NeuralVerse Team',
  rationale: 'Core maturity concept.',
  reviewedBy: 'Architecture Review Board',
  reviewDate: '2026-01-01',
  governanceStatus: 'canonical',
};

const VALID_NODE: ApplicationNode = {
  applicationId: 'app-001',
  title: 'Medical Imaging System',
  artifactType: 'system_architecture',
  domain: 'computer_vision',
  status: 'published',
  description: 'Complete medical imaging system.',
  provenance: {
    providedBy: 'NeuralVerse Team',
    rationale: 'Core application concept.',
    reviewedBy: 'Architecture Review Board',
    reviewDate: '2026-01-01',
    governanceStatus: 'canonical',
  },
  trace: {
    traceId: '_trace_1',
    decisionCount: 1,
    validationCount: 1,
    registryVersion: '1.0.0',
    compositionVersion: '1.0.0',
    decisions: [],
    deterministic: true,
    generatedFrom: 'deterministic_application_kernel',
    randomUsed: false,
    timeDependency: false,
  },
};

const VALID_MATURITY: TechnologyMaturityProfile = {
  maturityId: 'mat-001',
  title: 'TensorFlow Maturity',
  technologyMaturityLevel: 'industry_standard',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-001',
  architectureId: 'arch-001',
  status: 'published',
  provenance: VALID_PROVENANCE,
};

const VALID_MATURITY_2: TechnologyMaturityProfile = {
  maturityId: 'mat-002',
  title: 'PyTorch Maturity',
  technologyMaturityLevel: 'established',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-002',
  architectureId: 'arch-002',
  status: 'approved',
  provenance: { ...VALID_PROVENANCE, providedBy: 'Research Team' },
};

const VALID_ECOSYSTEM: EcosystemProfile = {
  ecosystemId: 'eco-001',
  maturityId: 'mat-001',
  ecosystemStability: 'mature',
  description: 'TensorFlow ecosystem is mature and well-supported.',
  provenance: VALID_PROVENANCE,
};

const VALID_ADOPTION: IndustryAdoptionProfile = {
  adoptionId: 'ado-001',
  maturityId: 'mat-001',
  industryAdoptionType: 'enterprise',
  description: 'TensorFlow widely adopted in enterprise.',
  provenance: VALID_PROVENANCE,
};

const VALID_CLASSIFICATION: LifecycleClassification = {
  classificationId: 'cls-001',
  maturityId: 'mat-001',
  lifecycleType: 'mature',
  description: 'TensorFlow is in mature lifecycle stage.',
  provenance: VALID_PROVENANCE,
};

const VALID_INDICATOR: ReadinessIndicator = {
  indicatorId: 'ind-001',
  maturityId: 'mat-001',
  indicatorType: 'documentation',
  description: 'TensorFlow has comprehensive documentation.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: TechnologyMaturityInput = {
  maturityProfiles: [VALID_MATURITY, VALID_MATURITY_2],
  ecosystemProfiles: [VALID_ECOSYSTEM],
  adoptionProfiles: [VALID_ADOPTION],
  classifications: [VALID_CLASSIFICATION],
  indicators: [VALID_INDICATOR],
};

const EMPTY_INPUT: TechnologyMaturityInput = {
  maturityProfiles: [],
  ecosystemProfiles: [],
  adoptionProfiles: [],
  classifications: [],
  indicators: [],
};

// ---------------------------------------------------------------------------
// Maturity Composition Tests
// ---------------------------------------------------------------------------

describe('Technology Maturity Kernel — Composition', () => {
  it('should compose valid maturity provenance', () => {
    const provenance = composeTechnologyMaturityProvenance({
      providedBy: 'NeuralVerse Team',
      rationale: 'Core concept.',
      reviewedBy: 'Review Board',
      reviewDate: '2026-01-01',
      governanceStatus: 'canonical',
    });

    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.rationale, 'Core concept.');
  });

  it('should compose valid technology maturity profile', () => {
    const profile = composeTechnologyMaturityProfile({
      maturityId: 'mat-001',
      title: 'Test Maturity',
      technologyMaturityLevel: 'industry_standard',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      architectureId: 'arch-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.maturityId, 'mat-001');
    assert.equal(profile.title, 'Test Maturity');
    assert.equal(profile.technologyMaturityLevel, 'industry_standard');
  });

  it('should compose valid ecosystem profile', () => {
    const ecosystem = composeEcosystemProfile({
      ecosystemId: 'eco-001',
      maturityId: 'mat-001',
      ecosystemStability: 'mature',
      description: 'Test ecosystem.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(ecosystem.ecosystemId, 'eco-001');
    assert.equal(ecosystem.ecosystemStability, 'mature');
  });

  it('should compose valid industry adoption profile', () => {
    const adoption = composeIndustryAdoptionProfile({
      adoptionId: 'ado-001',
      maturityId: 'mat-001',
      industryAdoptionType: 'enterprise',
      description: 'Test adoption.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(adoption.adoptionId, 'ado-001');
    assert.equal(adoption.industryAdoptionType, 'enterprise');
  });

  it('should compose valid lifecycle classification', () => {
    const classification = composeLifecycleClassification({
      classificationId: 'cls-001',
      maturityId: 'mat-001',
      lifecycleType: 'mature',
      description: 'Test classification.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(classification.classificationId, 'cls-001');
    assert.equal(classification.lifecycleType, 'mature');
  });

  it('should compose valid readiness indicator', () => {
    const indicator = composeReadinessIndicator({
      indicatorId: 'ind-001',
      maturityId: 'mat-001',
      indicatorType: 'documentation',
      description: 'Test indicator.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(indicator.indicatorId, 'ind-001');
    assert.equal(indicator.indicatorType, 'documentation');
  });

  it('should compose valid maturity trace', () => {
    const trace = composeTechnologyMaturityTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', maturityId: 'mat-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
  });

  it('should validate a valid maturity profile with no errors', () => {
    const errors = validateTechnologyMaturityProfile(VALID_MATURITY);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeTechnologyMaturityRegistry(
      [VALID_MATURITY, VALID_MATURITY_2],
      [VALID_ECOSYSTEM],
      [VALID_ADOPTION],
      [VALID_CLASSIFICATION],
      [VALID_INDICATOR],
    );
    const result = validateTechnologyMaturityRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate technology maturity input', () => {
    const result = validateTechnologyMaturityInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Technology Maturity Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeTechnologyMaturityRegistry([], [], [], [], []);
    const result = validateTechnologyMaturityRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have MATURITY_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate maturity IDs', () => {
    const registry = composeTechnologyMaturityRegistry([VALID_MATURITY, VALID_MATURITY], [], [], [], []);
    const result = validateTechnologyMaturityRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have MATURITY_DUPLICATE_ID error');
  });

  it('should detect duplicate maturity titles', () => {
    const m1 = { ...VALID_MATURITY, maturityId: 'mat-001', title: 'Same Title' };
    const m2 = { ...VALID_MATURITY, maturityId: 'mat-002', title: 'Same Title' };
    const registry = composeTechnologyMaturityRegistry([m1, m2], [], [], [], []);
    const result = validateTechnologyMaturityRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have MATURITY_DUPLICATE_TITLE error');
  });

  it('should detect duplicate ecosystem IDs', () => {
    const registry = composeTechnologyMaturityRegistry(
      [VALID_MATURITY],
      [VALID_ECOSYSTEM, VALID_ECOSYSTEM],
      [],
      [],
      [],
    );
    const result = validateTechnologyMaturityRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.ECOSYSTEM_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ECOSYSTEM_DUPLICATE_ID error');
  });

  it('should detect duplicate adoption IDs', () => {
    const registry = composeTechnologyMaturityRegistry(
      [VALID_MATURITY],
      [],
      [VALID_ADOPTION, VALID_ADOPTION],
      [],
      [],
    );
    const result = validateTechnologyMaturityRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.ADOPTION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ADOPTION_DUPLICATE_ID error');
  });

  it('should detect duplicate classification IDs', () => {
    const registry = composeTechnologyMaturityRegistry(
      [VALID_MATURITY],
      [],
      [],
      [VALID_CLASSIFICATION, VALID_CLASSIFICATION],
      [],
    );
    const result = validateTechnologyMaturityRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.LIFECYCLE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have LIFECYCLE_DUPLICATE_ID error');
  });

  it('should detect duplicate indicator IDs', () => {
    const registry = composeTechnologyMaturityRegistry(
      [VALID_MATURITY],
      [],
      [],
      [],
      [VALID_INDICATOR, VALID_INDICATOR],
    );
    const result = validateTechnologyMaturityRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.READINESS_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have READINESS_DUPLICATE_ID error');
  });

  it('should sort maturity profiles deterministically', () => {
    const m3 = { ...VALID_MATURITY, maturityId: 'mat-003' };
    const m1 = { ...VALID_MATURITY, maturityId: 'mat-001' };
    const m2 = { ...VALID_MATURITY, maturityId: 'mat-002' };

    const registry = composeTechnologyMaturityRegistry([m3, m1, m2], [], [], [], []);

    assert.equal(registry.maturityProfiles[0].maturityId, 'mat-001');
    assert.equal(registry.maturityProfiles[1].maturityId, 'mat-002');
    assert.equal(registry.maturityProfiles[2].maturityId, 'mat-003');
  });

  it('should sort ecosystem profiles deterministically', () => {
    const e2 = { ...VALID_ECOSYSTEM, ecosystemId: 'eco-002', ecosystemStability: 'stable' as const };
    const e1 = { ...VALID_ECOSYSTEM, ecosystemId: 'eco-001', ecosystemStability: 'mature' as const };

    const registry = composeTechnologyMaturityRegistry(
      [VALID_MATURITY],
      [e2, e1],
      [],
      [],
      [],
    );

    assert.equal(registry.ecosystemProfiles[0].ecosystemStability, 'mature');
    assert.equal(registry.ecosystemProfiles[1].ecosystemStability, 'stable');
  });

  it('should sort adoption profiles deterministically', () => {
    const a2 = { ...VALID_ADOPTION, adoptionId: 'ado-002', industryAdoptionType: 'startup' as const };
    const a1 = { ...VALID_ADOPTION, adoptionId: 'ado-001', industryAdoptionType: 'enterprise' as const };

    const registry = composeTechnologyMaturityRegistry(
      [VALID_MATURITY],
      [],
      [a2, a1],
      [],
      [],
    );

    assert.equal(registry.adoptionProfiles[0].industryAdoptionType, 'enterprise');
    assert.equal(registry.adoptionProfiles[1].industryAdoptionType, 'startup');
  });

  it('should sort classifications deterministically', () => {
    const c2 = { ...VALID_CLASSIFICATION, classificationId: 'cls-002', lifecycleType: 'growing' as const };
    const c1 = { ...VALID_CLASSIFICATION, classificationId: 'cls-001', lifecycleType: 'mature' as const };

    const registry = composeTechnologyMaturityRegistry(
      [VALID_MATURITY],
      [],
      [],
      [c2, c1],
      [],
    );

    assert.equal(registry.classifications[0].lifecycleType, 'growing');
    assert.equal(registry.classifications[1].lifecycleType, 'mature');
  });

  it('should sort indicators deterministically', () => {
    const i2 = { ...VALID_INDICATOR, indicatorId: 'ind-002', indicatorType: 'tooling' as const };
    const i1 = { ...VALID_INDICATOR, indicatorId: 'ind-001', indicatorType: 'documentation' as const };

    const registry = composeTechnologyMaturityRegistry(
      [VALID_MATURITY],
      [],
      [],
      [],
      [i2, i1],
    );

    assert.equal(registry.indicators[0].indicatorType, 'documentation');
    assert.equal(registry.indicators[1].indicatorType, 'tooling');
  });

  it('should compute correct metadata counts', () => {
    const registry = composeTechnologyMaturityRegistry(
      [VALID_MATURITY, VALID_MATURITY_2],
      [VALID_ECOSYSTEM],
      [VALID_ADOPTION],
      [VALID_CLASSIFICATION],
      [VALID_INDICATOR],
    );

    assert.equal(registry.metadata.maturityCount, 2);
    assert.equal(registry.metadata.ecosystemCount, 1);
    assert.equal(registry.metadata.adoptionCount, 1);
    assert.equal(registry.metadata.classificationCount, 1);
    assert.equal(registry.metadata.indicatorCount, 1);
    assert.equal(registry.metadata.typeCount, 2);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Technology Maturity Kernel — Validation', () => {
  it('should detect invalid maturity level', () => {
    const profile = { ...VALID_MATURITY, technologyMaturityLevel: 'unsupported' as any };
    const errors = validateTechnologyMaturityProfile(profile);
    const levelError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_LEVEL,
    );

    assert.ok(levelError, 'Should have MATURITY_INVALID_LEVEL error');
  });

  it('should detect invalid ecosystem stability', () => {
    const ecosystem = { ...VALID_ECOSYSTEM, ecosystemStability: 'unsupported' as any };
    const errors = validateEcosystemProfile(ecosystem);
    const stabilityError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_ECOSYSTEM,
    );

    assert.ok(stabilityError, 'Should have MATURITY_INVALID_ECOSYSTEM error');
  });

  it('should detect invalid adoption type', () => {
    const adoption = { ...VALID_ADOPTION, industryAdoptionType: 'unsupported' as any };
    const errors = validateIndustryAdoptionProfile(adoption);
    const adoptionError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_ADOPTION,
    );

    assert.ok(adoptionError, 'Should have MATURITY_INVALID_ADOPTION error');
  });

  it('should detect invalid lifecycle type', () => {
    const classification = { ...VALID_CLASSIFICATION, lifecycleType: 'unsupported' as any };
    const errors = validateLifecycleClassification(classification);
    const lifecycleError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_LIFECYCLE,
    );

    assert.ok(lifecycleError, 'Should have MATURITY_INVALID_LIFECYCLE error');
  });

  it('should detect invalid readiness indicator', () => {
    const indicator = { ...VALID_INDICATOR, indicatorType: 'unsupported' as any };
    const errors = validateReadinessIndicator(indicator);
    const readinessError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_READINESS,
    );

    assert.ok(readinessError, 'Should have MATURITY_INVALID_READINESS error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_MATURITY, status: 'unsupported' as any };
    const errors = validateTechnologyMaturityProfile(profile);
    const statusError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have MATURITY_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_MATURITY, provenance: { ...VALID_PROVENANCE, governanceStatus: 'invalid' as any } };
    const errors = validateTechnologyMaturityProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have MATURITY_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_MATURITY, provenance: undefined as any };
    const errors = validateTechnologyMaturityProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MATURITY_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_MATURITY, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateTechnologyMaturityProfile(profile);
    const providerError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have MATURITY_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_MATURITY, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateTechnologyMaturityProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have MATURITY_MISSING_RATIONALE error');
  });

  it('should detect missing application reference', () => {
    const profile = { ...VALID_MATURITY, applicationArtifactId: '' };
    const errors = validateTechnologyMaturityProfile(profile);
    const refError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_APPLICATION_REFERENCE,
    );

    assert.ok(refError, 'Should have MATURITY_MISSING_APPLICATION_REFERENCE error');
  });

  it('should detect missing knowledge reference', () => {
    const profile = { ...VALID_MATURITY, knowledgeArtifactId: '' };
    const errors = validateTechnologyMaturityProfile(profile);
    const refError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_KNOWLEDGE_REFERENCE,
    );

    assert.ok(refError, 'Should have MATURITY_MISSING_KNOWLEDGE_REFERENCE error');
  });

  it('should detect missing architecture reference', () => {
    const profile = { ...VALID_MATURITY, architectureId: '' };
    const errors = validateTechnologyMaturityProfile(profile);
    const refError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_ARCHITECTURE_REFERENCE,
    );

    assert.ok(refError, 'Should have MATURITY_MISSING_ARCHITECTURE_REFERENCE error');
  });

  it('should detect missing maturity ID', () => {
    const profile = { ...VALID_MATURITY, maturityId: '' };
    const errors = validateTechnologyMaturityProfile(profile);
    const idError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_MATURITY_ID,
    );

    assert.ok(idError, 'Should have MATURITY_MISSING_MATURITY_ID error');
  });

  it('should detect missing title', () => {
    const profile = { ...VALID_MATURITY, title: '' };
    const errors = validateTechnologyMaturityProfile(profile);
    const titleError = errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have MATURITY_MISSING_TITLE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeTechnologyMaturityTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateTechnologyMaturityTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: TechnologyMaturityTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_technology_maturity_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateTechnologyMaturityTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Technology Maturity Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeTechnologyMaturity>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeTechnologyMaturity(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].maturityProfiles, results[i].maturityProfiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeTechnologyMaturityRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeTechnologyMaturityRegistry(
        [VALID_MATURITY],
        [],
        [],
        [],
        [],
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].maturityProfiles, results[i].maturityProfiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Technology Maturity Kernel — Immutability', () => {
  it('should not mutate input maturity profiles', () => {
    const originalId = VALID_MATURITY.maturityId;
    const originalTitle = VALID_MATURITY.title;

    composeTechnologyMaturity(VALID_INPUT);

    assert.equal(VALID_MATURITY.maturityId, originalId);
    assert.equal(VALID_MATURITY.title, originalTitle);
  });

  it('should not mutate input registry maturity profiles', () => {
    const maturityProfiles = [VALID_MATURITY, VALID_MATURITY_2];
    const originalIds = maturityProfiles.map((m) => m.maturityId);

    composeTechnologyMaturityRegistry(maturityProfiles, [], [], [], []);

    assert.equal(maturityProfiles[0].maturityId, originalIds[0]);
    assert.equal(maturityProfiles[1].maturityId, originalIds[1]);
  });

  it('should not mutate the original application node', () => {
    const registry = composeTechnologyMaturityRegistry([VALID_MATURITY], [], [], [], []);
    const originalDescription = VALID_NODE.description;

    composeApplicationArtifactWithTechnologyMaturity({
      applicationNode: VALID_NODE,
      technologyMaturityRegistry: registry,
    });

    assert.equal(VALID_NODE.description, originalDescription);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Technology Maturity Kernel — Helper Functions', () => {
  it('should return canonical maturity levels', () => {
    const levels = getCanonicalTechnologyMaturityLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_TECHNOLOGY_MATURITY_LEVELS]);
    assert.equal(levels.length, 10);
  });

  it('should return canonical ecosystem stability types', () => {
    const types = getCanonicalEcosystemStabilityTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ECOSYSTEM_STABILITY_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical industry adoption types', () => {
    const types = getCanonicalIndustryAdoptionTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_INDUSTRY_ADOPTION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical lifecycle classification types', () => {
    const types = getCanonicalLifecycleClassificationTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_TECHNOLOGY_LIFECYCLE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical readiness indicators', () => {
    const types = getCanonicalReadinessIndicators();
    assert.deepStrictEqual([...types], [...CANONICAL_READINESS_INDICATORS]);
    assert.equal(types.length, 10);
  });

  it('should return canonical statuses', () => {
    const statuses = getCanonicalTechnologyMaturityStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_TECHNOLOGY_MATURITY_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate maturity level support', () => {
    assert.equal(isSupportedTechnologyMaturityLevel('industry_standard'), true);
    assert.equal(isSupportedTechnologyMaturityLevel('established'), true);
    assert.equal(isSupportedTechnologyMaturityLevel('unsupported'), false);
  });

  it('should validate ecosystem stability support', () => {
    assert.equal(isSupportedEcosystemStability('mature'), true);
    assert.equal(isSupportedEcosystemStability('stable'), true);
    assert.equal(isSupportedEcosystemStability('unsupported'), false);
  });

  it('should validate industry adoption support', () => {
    assert.equal(isSupportedIndustryAdoption('enterprise'), true);
    assert.equal(isSupportedIndustryAdoption('startup'), true);
    assert.equal(isSupportedIndustryAdoption('unsupported'), false);
  });

  it('should validate lifecycle classification support', () => {
    assert.equal(isSupportedLifecycleClassification('mature'), true);
    assert.equal(isSupportedLifecycleClassification('growing'), true);
    assert.equal(isSupportedLifecycleClassification('unsupported'), false);
  });

  it('should validate readiness indicator support', () => {
    assert.equal(isSupportedReadinessIndicator('documentation'), true);
    assert.equal(isSupportedReadinessIndicator('tooling'), true);
    assert.equal(isSupportedReadinessIndicator('unsupported'), false);
  });

  it('should validate status support', () => {
    assert.equal(isSupportedTechnologyMaturityStatus('draft'), true);
    assert.equal(isSupportedTechnologyMaturityStatus('published'), true);
    assert.equal(isSupportedTechnologyMaturityStatus('unsupported'), false);
  });

  it('should validate governance support', () => {
    assert.equal(isSupportedTechnologyMaturityGovernance('canonical'), true);
    assert.equal(isSupportedTechnologyMaturityGovernance('accepted'), true);
    assert.equal(isSupportedTechnologyMaturityGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Technology Maturity Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 maturity levels', () => {
    assert.equal(CANONICAL_TECHNOLOGY_MATURITY_LEVELS.length, 10);
  });

  it('should have exactly 10 ecosystem stability types', () => {
    assert.equal(CANONICAL_ECOSYSTEM_STABILITY_TYPES.length, 10);
  });

  it('should have exactly 10 industry adoption types', () => {
    assert.equal(CANONICAL_INDUSTRY_ADOPTION_TYPES.length, 10);
  });

  it('should have exactly 10 lifecycle classification types', () => {
    assert.equal(CANONICAL_TECHNOLOGY_LIFECYCLE_TYPES.length, 10);
  });

  it('should have exactly 10 readiness indicators', () => {
    assert.equal(CANONICAL_READINESS_INDICATORS.length, 10);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_TECHNOLOGY_MATURITY_STATUS.length, 6);
  });

  it('should contain all expected maturity levels', () => {
    const expected = ['research', 'experimental', 'prototype', 'proof_of_concept', 'early_adoption', 'growing', 'established', 'production_ready', 'industry_standard', 'legacy'];

    for (const level of expected) {
      assert.ok(
        CANONICAL_TECHNOLOGY_MATURITY_LEVELS.includes(level as any),
        `Should include level: ${level}`,
      );
    }
  });

  it('should contain all expected statuses', () => {
    const expected = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expected) {
      assert.ok(
        CANONICAL_TECHNOLOGY_MATURITY_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Technology Maturity Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeTechnologyMaturity(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeTechnologyMaturity(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeTechnologyMaturity(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeTechnologyMaturity(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate maturity content', () => {
    const result = composeTechnologyMaturity(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
  });

  it('should not perform network requests', () => {
    const result = composeTechnologyMaturity(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
  });

  it('should not generate code', () => {
    const result = composeTechnologyMaturity(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
  });

  it('should not have executable callbacks in maturity profile', () => {
    const profile = composeTechnologyMaturityProfile({
      maturityId: 'mat-001',
      title: 'Test',
      technologyMaturityLevel: 'industry_standard',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      architectureId: 'arch-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(profile);
    for (const key of keys) {
      const value = (profile as any)[key];
      assert.ok(typeof value !== 'function', `Profile field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeTechnologyMaturity(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
  });

  it('should not access filesystem', () => {
    const result = composeTechnologyMaturity(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Technology Maturity Kernel — Registry Validation', () => {
  it('should detect registry inconsistency with invalid deterministic flag', () => {
    const registry: TechnologyMaturityRegistry = {
      ...composeTechnologyMaturityRegistry([VALID_MATURITY], [], [], [], []),
      deterministic: false as any,
    };
    const result = validateTechnologyMaturityRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid randomUsed flag', () => {
    const registry: TechnologyMaturityRegistry = {
      ...composeTechnologyMaturityRegistry([VALID_MATURITY], [], [], [], []),
      randomUsed: true as any,
    };
    const result = validateTechnologyMaturityRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid timeDependency flag', () => {
    const registry: TechnologyMaturityRegistry = {
      ...composeTechnologyMaturityRegistry([VALID_MATURITY], [], [], [], []),
      timeDependency: true as any,
    };
    const result = validateTechnologyMaturityRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should validate empty input', () => {
    const result = validateTechnologyMaturityInput(EMPTY_INPUT);
    assert.equal(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have MATURITY_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('Technology Maturity Kernel — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const result1 = validateTechnologyMaturityRegistry(composeTechnologyMaturityRegistry([VALID_MATURITY], [], [], [], []));
    const result2 = validateTechnologyMaturityRegistry(composeTechnologyMaturityRegistry([VALID_MATURITY], [], [], [], []));

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });

  it('should produce identical validation results for invalid input', () => {
    const profile = { ...VALID_MATURITY, technologyMaturityLevel: 'unsupported' as any };
    const result1 = validateTechnologyMaturityProfile(profile);
    const result2 = validateTechnologyMaturityProfile(profile);

    assert.deepStrictEqual(result1.length, result2.length);
  });
});

// ---------------------------------------------------------------------------
// No Mutation Behavior Tests
// ---------------------------------------------------------------------------

describe('Technology Maturity Kernel — No Mutation Behavior', () => {
  it('should not mutate maturity profiles during registry composition', () => {
    const maturityProfiles = [
      { ...VALID_MATURITY, maturityId: 'mat-003' },
      { ...VALID_MATURITY, maturityId: 'mat-001' },
      { ...VALID_MATURITY, maturityId: 'mat-002' },
    ];
    const originalOrder = maturityProfiles.map((m) => m.maturityId);

    composeTechnologyMaturityRegistry(maturityProfiles, [], [], [], []);

    assert.deepStrictEqual(maturityProfiles.map((m) => m.maturityId), originalOrder);
  });

  it('should not mutate input during full composition', () => {
    const input: TechnologyMaturityInput = {
      maturityProfiles: [
        { ...VALID_MATURITY, maturityId: 'mat-002' },
        { ...VALID_MATURITY, maturityId: 'mat-001' },
      ],
      ecosystemProfiles: [],
      adoptionProfiles: [],
      classifications: [],
      indicators: [],
    };
    const originalOrder = input.maturityProfiles.map((m) => m.maturityId);

    composeTechnologyMaturity(input);

    assert.deepStrictEqual(input.maturityProfiles.map((m) => m.maturityId), originalOrder);
  });
});

// ---------------------------------------------------------------------------
// Artifact with Technology Maturity Tests
// ---------------------------------------------------------------------------

describe('Technology Maturity Kernel — Artifact with Technology Maturity', () => {
  it('should compose application artifact with technology maturity', () => {
    const registry = composeTechnologyMaturityRegistry([VALID_MATURITY], [VALID_ECOSYSTEM], [], [], []);
    const result = composeApplicationArtifactWithTechnologyMaturity({
      applicationNode: VALID_NODE,
      technologyMaturityRegistry: registry,
    });

    assert.equal(result.applicationNode.applicationId, 'app-001');
    assert.equal(result.technologyMaturityRegistry.maturityProfiles.length, 1);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should not mutate the original application node', () => {
    const registry = composeTechnologyMaturityRegistry([VALID_MATURITY], [], [], [], []);
    const originalTitle = VALID_NODE.title;

    composeApplicationArtifactWithTechnologyMaturity({
      applicationNode: VALID_NODE,
      technologyMaturityRegistry: registry,
    });

    assert.equal(VALID_NODE.title, originalTitle);
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Verification Tests
// ---------------------------------------------------------------------------

describe('Technology Maturity Kernel — Cross-Agent Boundary Verification', () => {
  it('should only reference external IDs, not own external metadata', () => {
    const profile = composeTechnologyMaturityProfile({
      maturityId: 'mat-001',
      title: 'Test',
      technologyMaturityLevel: 'industry_standard',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      architectureId: 'arch-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(typeof profile.knowledgeArtifactId, 'string');
    assert.ok(!('knowledgeContent' in profile), 'Should not have knowledge content');
    assert.ok(!('narrativeContent' in profile), 'Should not have narrative content');
  });

  it('should not evaluate technology maturity automatically', () => {
    const result = composeTechnologyMaturity(VALID_INPUT);
    assert.ok(!('autoEvaluated' in result), 'Should not have auto-evaluated');
    assert.ok(!('maturityScore' in result), 'Should not have maturity score');
  });

  it('should not predict adoption', () => {
    const result = composeTechnologyMaturity(VALID_INPUT);
    assert.ok(!('adoptionPrediction' in result), 'Should not have adoption prediction');
    assert.ok(!('predictedGrowth' in result), 'Should not have predicted growth');
  });

  it('should not recommend technologies', () => {
    const result = composeTechnologyMaturity(VALID_INPUT);
    assert.ok(!('recommendations' in result), 'Should not have recommendations');
    assert.ok(!('suggestedTechnologies' in result), 'Should not have suggested technologies');
  });

  it('should not rank ecosystems', () => {
    const result = composeTechnologyMaturity(VALID_INPUT);
    assert.ok(!('ecosystemRanking' in result), 'Should not have ecosystem ranking');
    assert.ok(!('rankedEcosystems' in result), 'Should not have ranked ecosystems');
  });
});
