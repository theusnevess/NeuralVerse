/**
 * NV-2100-D9-OPT-14 — Curiosity Safety Kernel Test Suite
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CuriositySafetyProfile,
  HumorRiskMetadata,
  AccessibilityCertification,
  CertificationFindingRecord,
  CertificationRelationship,
  CertificationInput,
  CertificationRegistry,
  CuriositySafetyProvenance,
  CuriositySafetyTrace,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_SAFETY_CERTIFICATION_TYPES,
  CANONICAL_HUMOR_RISK_LEVELS,
  CANONICAL_ACCESSIBILITY_COMPLIANCE,
  CANONICAL_CERTIFICATION_FINDINGS,
  CANONICAL_CERTIFICATION_DIMENSIONS,
  CANONICAL_CERTIFICATION_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

import {
  composeCuriositySafetyProvenance,
  composeCuriositySafetyTrace,
  composeCuriositySafetyProfile,
  composeHumorRiskMetadata,
  composeAccessibilityCertification,
  composeCertificationFinding,
  composeCertificationRelationship,
  composeCertificationRegistry,
  composeCertificationArtifacts,
  composeCuriosityArtifactWithCertification,
  isSupportedSafetyCertificationType,
  isSupportedHumorRiskLevel,
  isSupportedAccessibilityCompliance,
  isSupportedCertificationFinding,
  isSupportedCertificationDimension,
  isSupportedCertificationStatus,
  isSupportedCertificationGovernance,
  getCanonicalSafetyCertificationTypes,
  getCanonicalHumorRiskLevels,
  getCanonicalAccessibilityCompliance,
  getCanonicalCertificationFindings,
  getCanonicalCertificationDimensions,
  getCanonicalCertificationStatuses,
} from './CuriositySafetyKernel.ts';

import {
  validateCuriositySafetyProfile,
  validateHumorRiskMetadata,
  validateAccessibilityCertification,
  validateCertificationFinding,
  validateCertificationRelationship,
  validateCertificationRegistry,
  validateCertificationInput,
  validateCertificationTrace,
  validateCuriosityArtifactWithCertification,
  CERTIFICATION_VALIDATION_CODES,
} from './CuriositySafetyValidation.ts';

const VALID_PROVENANCE: CuriositySafetyProvenance = {
  provider: 'NeuralVerse Team', source: 'Curated Knowledge Base', rationale: 'Core safety certification artifact.', version: '1.0.0',
};

const VALID_TRACE: CuriositySafetyTrace = {
  traceId: '_trace_1', generatedFrom: 'deterministic_curiosity_safety_kernel', deterministic: true, randomUsed: false, timeDependency: false,
};

const VALID_PROFILE: CuriositySafetyProfile = {
  profileId: 'safety-001', title: 'Neural Network Safety Profile', safetyCertificationType: 'educational_safe',
  humorRiskLevel: 'minimal', accessibilityCompliance: 'wcag_standard', conceptIds: ['concept-001', 'concept-002'],
  status: 'published', governance: 'canonical', provenance: VALID_PROVENANCE, trace: VALID_TRACE,
};

const VALID_PROFILE_2: CuriositySafetyProfile = {
  profileId: 'safety-002', title: 'Historical Curiosity Safety Profile', safetyCertificationType: 'controlled_humor',
  humorRiskLevel: 'controlled', accessibilityCompliance: 'screen_reader_ready', conceptIds: ['concept-003'],
  status: 'approved', governance: 'accepted', provenance: { ...VALID_PROVENANCE, source: 'Research Archives' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_HUMOR_RISK: HumorRiskMetadata = {
  metadataId: 'hr-001', profileId: 'safety-001', humorRiskLevel: 'minimal',
  riskDescription: 'Minimal humor risk.', mitigationStrategy: 'Review before publication.',
  reviewRequired: false, safetyJustification: 'Humor is educational.',
};

const VALID_ACCESSIBILITY: AccessibilityCertification = {
  certificationId: 'ac-001', profileId: 'safety-001', accessibilityCompliance: 'wcag_standard',
  complianceDescription: 'WCAG 2.1 AA compliant.', remediationRequired: false,
  alternativeProvided: true, wcagLevel: 'AA',
};

const VALID_FINDING: CertificationFindingRecord = {
  findingId: 'finding-001', profileId: 'safety-001', certificationFinding: 'approved',
  findingDescription: 'All criteria met.', severity: 'low', recommendation: 'No changes needed.',
};

const VALID_RELATIONSHIP: CertificationRelationship = {
  relationshipId: 'cert-rel-001', sourceProfileId: 'safety-001', targetProfileId: 'safety-002',
  relationshipType: 'related_to', description: 'These safety profiles are related.', provenance: VALID_PROVENANCE,
};

const VALID_INPUT: CertificationInput = {
  profiles: [VALID_PROFILE, VALID_PROFILE_2], humorRisks: [VALID_HUMOR_RISK],
  accessibility: [VALID_ACCESSIBILITY], findings: [VALID_FINDING], relationships: [VALID_RELATIONSHIP],
};

describe('Curiosity Safety Kernel — Profile Composition', () => {
  it('should compose valid safety certification provenance', () => {
    const provenance = composeCuriositySafetyProvenance({ provider: 'NeuralVerse Team', source: 'Curated Knowledge Base', rationale: 'Core concept.', version: '1.0.0' });
    assert.equal(provenance.provider, 'NeuralVerse Team');
  });

  it('should compose valid safety certification profile', () => {
    const profile = composeCuriositySafetyProfile({ profileId: 'safety-001', title: 'Neural Network Safety Profile', safetyCertificationType: 'educational_safe', humorRiskLevel: 'minimal', accessibilityCompliance: 'wcag_standard', conceptIds: ['concept-001'], status: 'published', governance: 'canonical', provenance: VALID_PROVENANCE, trace: VALID_TRACE });
    assert.equal(profile.profileId, 'safety-001');
  });

  it('should compose valid safety certification trace', () => {
    const trace = composeCuriositySafetyTrace({ traceId: '_trace_1' });
    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
  });

  it('should compose valid humor risk metadata', () => {
    const metadata = composeHumorRiskMetadata({ metadataId: 'hr-001', profileId: 'safety-001', humorRiskLevel: 'minimal', riskDescription: 'Minimal humor risk.', mitigationStrategy: 'Review before publication.', reviewRequired: false, safetyJustification: 'Humor is educational.' });
    assert.equal(metadata.metadataId, 'hr-001');
  });

  it('should compose valid accessibility certification', () => {
    const certification = composeAccessibilityCertification({ certificationId: 'ac-001', profileId: 'safety-001', accessibilityCompliance: 'wcag_standard', complianceDescription: 'WCAG 2.1 AA compliant.', remediationRequired: false, alternativeProvided: true, wcagLevel: 'AA' });
    assert.equal(certification.certificationId, 'ac-001');
  });

  it('should compose valid certification finding', () => {
    const finding = composeCertificationFinding({ findingId: 'finding-001', profileId: 'safety-001', certificationFinding: 'approved', findingDescription: 'All criteria met.', severity: 'low', recommendation: 'No changes needed.' });
    assert.equal(finding.findingId, 'finding-001');
  });

  it('should validate a valid profile with no errors', () => {
    const errors = validateCuriositySafetyProfile(VALID_PROFILE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeCertificationRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_HUMOR_RISK], [VALID_ACCESSIBILITY], [VALID_FINDING], [VALID_RELATIONSHIP]);
    const result = validateCertificationRegistry(registry);
    assert.equal(result.valid, true);
  });
});

describe('Curiosity Safety Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeCertificationRegistry([], [], [], [], []);
    const result = validateCertificationRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeCertificationRegistry([VALID_PROFILE, VALID_PROFILE], [], [], [], []);
    const result = validateCertificationRegistry(registry);
    const duplicateError = result.errors.find((e) => e.code === CERTIFICATION_VALIDATION_CODES.CERTIFICATION_DUPLICATE_ID);
    assert.ok(duplicateError, 'Should have CERTIFICATION_DUPLICATE_ID error');
  });

  it('should detect self-relationships', () => {
    const selfRelationship: CertificationRelationship = { relationshipId: 'cert-rel-self', sourceProfileId: 'safety-001', targetProfileId: 'safety-001', relationshipType: 'related_to', description: 'Self relationship.', provenance: VALID_PROVENANCE };
    const registry = composeCertificationRegistry([VALID_PROFILE], [], [], [], [selfRelationship]);
    const result = validateCertificationRegistry(registry);
    const selfError = result.errors.find((e) => e.code === CERTIFICATION_VALIDATION_CODES.CERTIFICATION_SELF_RELATIONSHIP);
    assert.ok(selfError, 'Should have CERTIFICATION_SELF_RELATIONSHIP error');
  });
});

describe('Curiosity Safety Kernel — Validation', () => {
  it('should detect invalid safety certification type', () => {
    const profile = { ...VALID_PROFILE, safetyCertificationType: 'unsupported' as any };
    const errors = validateCuriositySafetyProfile(profile);
    const typeError = errors.find((e) => e.code === CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_SAFETY);
    assert.ok(typeError, 'Should have CERTIFICATION_INVALID_SAFETY error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE, provenance: undefined as any };
    const errors = validateCuriositySafetyProfile(profile);
    const provenanceError = errors.find((e) => e.code === CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_PROVENANCE);
    assert.ok(provenanceError, 'Should have CERTIFICATION_MISSING_PROVENANCE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeCuriositySafetyTrace({ traceId: '_trace_1' });
    const result = validateCertificationTrace(trace);
    assert.equal(result.valid, true);
  });

  it('should detect invalid trace', () => {
    const trace: CuriositySafetyTrace = { traceId: '', generatedFrom: 'deterministic_curiosity_safety_kernel', deterministic: false as true, randomUsed: false, timeDependency: false };
    const result = validateCertificationTrace(trace);
    assert.equal(result.valid, false);
  });
});

describe('Curiosity Safety Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeCertificationArtifacts>[] = [];
    for (let i = 0; i < 100; i++) { results.push(composeCertificationArtifacts(VALID_INPUT)); }
    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
    }
  });
});

describe('Curiosity Safety Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE.profileId;
    composeCertificationArtifacts(VALID_INPUT);
    assert.equal(VALID_PROFILE.profileId, originalId);
  });
});

describe('Curiosity Safety Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 safety certification types', () => { assert.equal(CANONICAL_SAFETY_CERTIFICATION_TYPES.length, 10); });
  it('should have exactly 10 humor risk levels', () => { assert.equal(CANONICAL_HUMOR_RISK_LEVELS.length, 10); });
  it('should have exactly 10 accessibility compliance', () => { assert.equal(CANONICAL_ACCESSIBILITY_COMPLIANCE.length, 10); });
  it('should have exactly 10 certification findings', () => { assert.equal(CANONICAL_CERTIFICATION_FINDINGS.length, 10); });
  it('should have exactly 10 certification dimensions', () => { assert.equal(CANONICAL_CERTIFICATION_DIMENSIONS.length, 10); });
  it('should have exactly 6 certification statuses', () => { assert.equal(CANONICAL_CERTIFICATION_STATUS.length, 6); });
  it('should have exactly 5 governance values', () => { assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5); });
});

describe('Curiosity Safety Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(result); });
  it('should not use Date.now', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(result); });
  it('should not perform content moderation', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(!('contentModeration' in result)); });
  it('should not detect toxicity', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(!('toxicity' in result)); });
  it('should not generate humor', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(!('generatedHumor' in result)); });
  it('should not execute certifications', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(!('executedCertifications' in result)); });
  it('should not access filesystem', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(!('filesystem' in result)); });
  it('should not perform network requests', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(!('networkResponse' in result)); });
});

describe('Curiosity Safety Kernel — Cross-Agent Boundary', () => {
  it('should not reference Narrative Agent', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(!('narrativeAgent' in result)); });
  it('should not reference Knowledge Agent', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(!('knowledgeAgent' in result)); });
  it('should not reference Didactic Agent', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(!('didacticAgent' in result)); });
  it('should not reference Assessment Agent', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(!('assessmentAgent' in result)); });
  it('should not reference Laboratory Agent', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(!('laboratoryAgent' in result)); });
  it('should not reference Application Agent', () => { const result = composeCertificationArtifacts(VALID_INPUT); assert.ok(!('applicationAgent' in result)); });
});

describe('Curiosity Safety Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_DUPLICATE_ID, 'CERTIFICATION_DUPLICATE_ID');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_DUPLICATE_TITLE, 'CERTIFICATION_DUPLICATE_TITLE');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_SAFETY, 'CERTIFICATION_INVALID_SAFETY');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_HUMOR, 'CERTIFICATION_INVALID_HUMOR');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_ACCESSIBILITY, 'CERTIFICATION_INVALID_ACCESSIBILITY');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_FINDING, 'CERTIFICATION_INVALID_FINDING');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_DIMENSION, 'CERTIFICATION_INVALID_DIMENSION');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_STATUS, 'CERTIFICATION_INVALID_STATUS');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_GOVERNANCE, 'CERTIFICATION_INVALID_GOVERNANCE');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_PROVENANCE, 'CERTIFICATION_MISSING_PROVENANCE');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_PROVIDER, 'CERTIFICATION_MISSING_PROVIDER');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_RATIONALE, 'CERTIFICATION_MISSING_RATIONALE');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_CURIOSITY_REFERENCE, 'CERTIFICATION_MISSING_CURIOSITY_REFERENCE');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_PROFILE_ID, 'CERTIFICATION_MISSING_PROFILE_ID');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_TITLE, 'CERTIFICATION_MISSING_TITLE');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_CERTIFICATION, 'CERTIFICATION_MISSING_CERTIFICATION');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_SELF_RELATIONSHIP, 'CERTIFICATION_SELF_RELATIONSHIP');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_EMPTY_REGISTRY, 'CERTIFICATION_EMPTY_REGISTRY');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_TRACE, 'CERTIFICATION_INVALID_TRACE');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_REGISTRY_INCONSISTENCY, 'CERTIFICATION_REGISTRY_INCONSISTENCY');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_CONFIGURATION, 'CERTIFICATION_INVALID_CONFIGURATION');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_RELATIONSHIP, 'CERTIFICATION_INVALID_RELATIONSHIP');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_GOVERNANCE, 'CERTIFICATION_MISSING_GOVERNANCE');
    assert.equal(CERTIFICATION_VALIDATION_CODES.CERTIFICATION_UNSUPPORTED_CONFIGURATION, 'CERTIFICATION_UNSUPPORTED_CONFIGURATION');
  });

  it('should have exactly 24 validation codes', () => {
    const codeCount = Object.keys(CERTIFICATION_VALIDATION_CODES).length;
    assert.equal(codeCount, 24);
  });
});

describe('Curiosity Safety Kernel — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeCuriositySafetyProvenance, 'function');
    assert.equal(typeof composeCuriositySafetyTrace, 'function');
    assert.equal(typeof composeCuriositySafetyProfile, 'function');
    assert.equal(typeof composeHumorRiskMetadata, 'function');
    assert.equal(typeof composeAccessibilityCertification, 'function');
    assert.equal(typeof composeCertificationFinding, 'function');
    assert.equal(typeof composeCertificationRelationship, 'function');
    assert.equal(typeof composeCertificationRegistry, 'function');
    assert.equal(typeof composeCertificationArtifacts, 'function');
    assert.equal(typeof composeCuriosityArtifactWithCertification, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedSafetyCertificationType, 'function');
    assert.equal(typeof isSupportedHumorRiskLevel, 'function');
    assert.equal(typeof isSupportedAccessibilityCompliance, 'function');
    assert.equal(typeof isSupportedCertificationFinding, 'function');
    assert.equal(typeof isSupportedCertificationDimension, 'function');
    assert.equal(typeof isSupportedCertificationStatus, 'function');
    assert.equal(typeof isSupportedCertificationGovernance, 'function');
    assert.equal(typeof getCanonicalSafetyCertificationTypes, 'function');
    assert.equal(typeof getCanonicalHumorRiskLevels, 'function');
    assert.equal(typeof getCanonicalAccessibilityCompliance, 'function');
    assert.equal(typeof getCanonicalCertificationFindings, 'function');
    assert.equal(typeof getCanonicalCertificationDimensions, 'function');
    assert.equal(typeof getCanonicalCertificationStatuses, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateCuriositySafetyProfile, 'function');
    assert.equal(typeof validateHumorRiskMetadata, 'function');
    assert.equal(typeof validateAccessibilityCertification, 'function');
    assert.equal(typeof validateCertificationFinding, 'function');
    assert.equal(typeof validateCertificationRelationship, 'function');
    assert.equal(typeof validateCertificationRegistry, 'function');
    assert.equal(typeof validateCertificationInput, 'function');
    assert.equal(typeof validateCertificationTrace, 'function');
    assert.equal(typeof validateCuriosityArtifactWithCertification, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(CERTIFICATION_VALIDATION_CODES);
    assert.equal(typeof CERTIFICATION_VALIDATION_CODES, 'object');
  });
});
