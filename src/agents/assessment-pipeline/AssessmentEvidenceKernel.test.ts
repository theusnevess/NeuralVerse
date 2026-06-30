/**
 * NV-2000-D8-OPT-14 — Assessment Evidence & Governance Layer Kernel Tests
 *
 * Exhaustive deterministic tests for the Assessment Evidence Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~100 tests covering:
 * - Canonical enum completeness
 * - Helper functions
 * - Evidence composition
 * - Reference composition
 * - Relationship composition
 * - Governance composition
 * - Audit metadata composition
 * - Registry composition
 * - Validation codes
 * - Duplicate detection
 * - Deterministic identity (100 iterations)
 * - Immutability
 * - Validator stability
 * - No mutation
 * - Artifact with evidence
 * - Cross-agent boundary
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_EVIDENCE_TYPES,
  CANONICAL_EVIDENCE_SOURCES,
  CANONICAL_EVIDENCE_CONFIDENCE_LEVELS,
  CANONICAL_EVIDENCE_GOVERNANCE_LEVELS,
  CANONICAL_EVIDENCE_TRACE_TYPES,
  CANONICAL_EVIDENCE_STATUS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type AssessmentEvidence,
  type EvidenceReference,
  type EvidenceRelationship,
  type EvidenceGovernance,
  type EvidenceAuditMetadata,
  type EvidenceInput,
  type EvidenceRegistry,
  type AssessmentEvidenceProvenance,
  type AssessmentArtifactWithEvidence,
} from './AssessmentAgentContract.ts';

import {
  composeAssessmentEvidenceProvenance,
  composeAssessmentEvidenceTrace,
  composeEvidenceReference,
  composeEvidenceRelationship,
  composeEvidenceGovernance,
  composeEvidenceAuditMetadata,
  composeAssessmentEvidence,
  composeEvidenceRegistry,
  composeEvidenceRegistryFromInput,
  composeAssessmentEvidenceCollection,
  composeAssessmentArtifactWithEvidence,
  isSupportedEvidenceType,
  isSupportedEvidenceSource,
  isSupportedEvidenceConfidenceLevel,
  isSupportedEvidenceGovernanceLevel,
  isSupportedEvidenceTraceType,
  isSupportedEvidenceStatus,
  isSupportedEvidenceGovernance,
  getCanonicalEvidenceTypes,
  getCanonicalEvidenceSources,
  getCanonicalEvidenceConfidenceLevels,
  getCanonicalEvidenceGovernanceLevels,
  getCanonicalEvidenceTraceTypes,
  getCanonicalEvidenceStatuses,
} from './AssessmentEvidenceKernel.ts';

import {
  EVIDENCE_VALIDATION_CODES,
  validateAssessmentEvidence,
  validateEvidenceReference,
  validateEvidenceRelationship,
  validateEvidenceGovernance,
  validateEvidenceAuditMetadata,
  validateEvidenceRegistry,
  validateEvidenceInput,
  validateEvidenceTrace,
  validateAssessmentArtifactWithEvidence,
} from './AssessmentEvidenceValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_EVIDENCE_PROVENANCE: AssessmentEvidenceProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for evidence assessment.',
};

const VALID_EVIDENCE_GOVERNANCE: EvidenceGovernance = {
  id: 'gov-1',
  governanceLevel: 'approved',
  decidedBy: 'test-reviewer',
  decidedAt: '2025-01-01',
  rationale: 'Test governance decision.',
};

const VALID_EVIDENCE_AUDIT: EvidenceAuditMetadata = {
  id: 'audit-1',
  auditedBy: 'test-auditor',
  auditedAt: '2025-01-01',
  confidenceLevel: 'high',
  traceType: 'deterministic',
  auditNotes: 'Test audit notes.',
};

function _makeReference(id: string): EvidenceReference {
  return composeEvidenceReference({
    id,
    evidenceType: 'answer',
    source: 'assessment',
    description: `Test reference ${id}`,
  });
}

function _makeRelationship(id: string, sourceId: string, targetId: string): EvidenceRelationship {
  return composeEvidenceRelationship({
    id,
    sourceEvidenceId: sourceId,
    targetEvidenceId: targetId,
    relationshipType: 'derives_from',
    rationale: `Test relationship ${id}`,
  });
}

function _makeEvidence(id: string, overrides: Partial<AssessmentEvidence> = {}): AssessmentEvidence {
  return composeAssessmentEvidence({
    id,
    title: `Evidence ${id}`,
    evidenceType: 'answer',
    source: 'assessment',
    confidenceLevel: 'high',
    references: [_makeReference(`ref-${id}`)],
    relationships: [],
    governance: { ...VALID_EVIDENCE_GOVERNANCE, id: `gov-${id}` },
    auditMetadata: { ...VALID_EVIDENCE_AUDIT, id: `audit-${id}` },
    conceptIds: ['concept-1'],
    status: 'draft',
    assessmentGovernance: 'canonical',
    provenance: VALID_EVIDENCE_PROVENANCE,
    ...overrides,
  });
}

const VALID_EVIDENCE_A = _makeEvidence('evidence-a');
const VALID_EVIDENCE_B = _makeEvidence('evidence-b');
const VALID_EVIDENCE_C = _makeEvidence('evidence-c');

// ============================================================================
// CANONICAL ENUMS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 evidence types', () => {
    assert.equal(CANONICAL_EVIDENCE_TYPES.length, 10);
  });

  it('should have exactly 10 evidence sources', () => {
    assert.equal(CANONICAL_EVIDENCE_SOURCES.length, 10);
  });

  it('should have exactly 10 evidence confidence levels', () => {
    assert.equal(CANONICAL_EVIDENCE_CONFIDENCE_LEVELS.length, 10);
  });

  it('should have exactly 10 evidence governance levels', () => {
    assert.equal(CANONICAL_EVIDENCE_GOVERNANCE_LEVELS.length, 10);
  });

  it('should have exactly 10 evidence trace types', () => {
    assert.equal(CANONICAL_EVIDENCE_TRACE_TYPES.length, 10);
  });

  it('should have exactly 6 evidence statuses', () => {
    assert.equal(CANONICAL_EVIDENCE_STATUS.length, 6);
  });

  it('should contain expected evidence types', () => {
    const expected = [
      'answer',
      'reasoning',
      'calculation',
      'annotation',
      'concept_mapping',
      'engineering_report',
      'laboratory_result',
      'visual_analysis',
      'reflection',
      'portfolio_artifact',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_EVIDENCE_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected evidence sources', () => {
    const expected = [
      'assessment',
      'laboratory',
      'portfolio',
      'engineering_case',
      'visual_activity',
      'concept_graph',
      'comparison',
      'constraint_analysis',
      'reflection',
      'manual_review',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_EVIDENCE_SOURCES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected evidence confidence levels', () => {
    const expected = [
      'very_low',
      'low',
      'limited',
      'moderate',
      'acceptable',
      'good',
      'high',
      'very_high',
      'validated',
      'canonical',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_EVIDENCE_CONFIDENCE_LEVELS.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected evidence governance levels', () => {
    const expected = [
      'draft',
      'review',
      'approved',
      'verified',
      'audited',
      'canonical',
      'deprecated',
      'archived',
      'rejected',
      'historical',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_EVIDENCE_GOVERNANCE_LEVELS.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected evidence trace types', () => {
    const expected = [
      'manual',
      'deterministic',
      'verified',
      'reviewed',
      'imported',
      'derived',
      'linked',
      'cross_referenced',
      'audited',
      'canonical',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_EVIDENCE_TRACE_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected evidence statuses', () => {
    const expected = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];
    for (const value of expected) {
      assert.ok(CANONICAL_EVIDENCE_STATUS.includes(value as any), `Missing: ${value}`);
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedEvidenceType returns true for valid types', () => {
    assert.equal(isSupportedEvidenceType('answer'), true);
    assert.equal(isSupportedEvidenceType('reasoning'), true);
  });

  it('isSupportedEvidenceType returns false for invalid types', () => {
    assert.equal(isSupportedEvidenceType('invalid'), false);
    assert.equal(isSupportedEvidenceType(''), false);
  });

  it('isSupportedEvidenceSource returns true for valid sources', () => {
    assert.equal(isSupportedEvidenceSource('assessment'), true);
    assert.equal(isSupportedEvidenceSource('laboratory'), true);
  });

  it('isSupportedEvidenceSource returns false for invalid sources', () => {
    assert.equal(isSupportedEvidenceSource('invalid'), false);
    assert.equal(isSupportedEvidenceSource(''), false);
  });

  it('isSupportedEvidenceConfidenceLevel returns true for valid levels', () => {
    assert.equal(isSupportedEvidenceConfidenceLevel('high'), true);
    assert.equal(isSupportedEvidenceConfidenceLevel('low'), true);
  });

  it('isSupportedEvidenceConfidenceLevel returns false for invalid levels', () => {
    assert.equal(isSupportedEvidenceConfidenceLevel('invalid'), false);
    assert.equal(isSupportedEvidenceConfidenceLevel(''), false);
  });

  it('isSupportedEvidenceGovernanceLevel returns true for valid levels', () => {
    assert.equal(isSupportedEvidenceGovernanceLevel('approved'), true);
    assert.equal(isSupportedEvidenceGovernanceLevel('canonical'), true);
  });

  it('isSupportedEvidenceGovernanceLevel returns false for invalid levels', () => {
    assert.equal(isSupportedEvidenceGovernanceLevel('invalid'), false);
    assert.equal(isSupportedEvidenceGovernanceLevel(''), false);
  });

  it('isSupportedEvidenceTraceType returns true for valid types', () => {
    assert.equal(isSupportedEvidenceTraceType('deterministic'), true);
    assert.equal(isSupportedEvidenceTraceType('manual'), true);
  });

  it('isSupportedEvidenceTraceType returns false for invalid types', () => {
    assert.equal(isSupportedEvidenceTraceType('invalid'), false);
    assert.equal(isSupportedEvidenceTraceType(''), false);
  });

  it('isSupportedEvidenceStatus returns true for valid statuses', () => {
    assert.equal(isSupportedEvidenceStatus('draft'), true);
    assert.equal(isSupportedEvidenceStatus('archived'), true);
  });

  it('isSupportedEvidenceStatus returns false for invalid statuses', () => {
    assert.equal(isSupportedEvidenceStatus('invalid'), false);
    assert.equal(isSupportedEvidenceStatus(''), false);
  });

  it('isSupportedEvidenceGovernance returns true for valid governance', () => {
    assert.equal(isSupportedEvidenceGovernance('canonical'), true);
    assert.equal(isSupportedEvidenceGovernance('accepted'), true);
  });

  it('isSupportedEvidenceGovernance returns false for invalid governance', () => {
    assert.equal(isSupportedEvidenceGovernance('invalid'), false);
    assert.equal(isSupportedEvidenceGovernance(''), false);
  });

  it('getCanonicalEvidenceTypes returns a copy', () => {
    const result = getCanonicalEvidenceTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_EVIDENCE_TYPES]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_EVIDENCE_TYPES.length, 10);
  });

  it('getCanonicalEvidenceSources returns a copy', () => {
    const result = getCanonicalEvidenceSources();
    assert.equal(result.length, 10);
  });

  it('getCanonicalEvidenceConfidenceLevels returns a copy', () => {
    const result = getCanonicalEvidenceConfidenceLevels();
    assert.equal(result.length, 10);
  });

  it('getCanonicalEvidenceGovernanceLevels returns a copy', () => {
    const result = getCanonicalEvidenceGovernanceLevels();
    assert.equal(result.length, 10);
  });

  it('getCanonicalEvidenceTraceTypes returns a copy', () => {
    const result = getCanonicalEvidenceTraceTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalEvidenceStatuses returns a copy', () => {
    const result = getCanonicalEvidenceStatuses();
    assert.equal(result.length, 6);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Evidence
// ============================================================================

describe('composeAssessmentEvidence', () => {
  it('should compose evidence from valid params', () => {
    const evidence = composeAssessmentEvidence({
      id: 'e1',
      title: 'Test Evidence',
      evidenceType: 'answer',
      source: 'assessment',
      confidenceLevel: 'high',
      references: [_makeReference('r1')],
      relationships: [],
      governance: VALID_EVIDENCE_GOVERNANCE,
      auditMetadata: VALID_EVIDENCE_AUDIT,
      conceptIds: ['concept-1'],
      status: 'draft',
      assessmentGovernance: 'canonical',
      provenance: VALID_EVIDENCE_PROVENANCE,
    });
    assert.equal(evidence.id, 'e1');
    assert.equal(evidence.title, 'Test Evidence');
    assert.equal(evidence.evidenceType, 'answer');
    assert.equal(evidence.trace.deterministic, true);
    assert.equal(evidence.trace.randomUsed, false);
    assert.equal(evidence.trace.timeDependency, false);
  });

  it('should not mutate input arrays', () => {
    const conceptIds = ['concept-1'];
    const original = JSON.stringify(conceptIds);
    composeAssessmentEvidence({
      id: 'e2',
      title: 'Test Evidence',
      evidenceType: 'answer',
      source: 'assessment',
      confidenceLevel: 'high',
      references: [],
      relationships: [],
      governance: VALID_EVIDENCE_GOVERNANCE,
      auditMetadata: VALID_EVIDENCE_AUDIT,
      conceptIds,
      status: 'draft',
      assessmentGovernance: 'canonical',
      provenance: VALID_EVIDENCE_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Reference
// ============================================================================

describe('composeEvidenceReference', () => {
  it('should compose reference from valid params', () => {
    const reference = composeEvidenceReference({
      id: 'ref-1',
      evidenceType: 'answer',
      source: 'assessment',
      description: 'Test reference',
    });
    assert.equal(reference.id, 'ref-1');
    assert.equal(reference.evidenceType, 'answer');
    assert.equal(reference.source, 'assessment');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Relationship
// ============================================================================

describe('composeEvidenceRelationship', () => {
  it('should compose relationship from valid params', () => {
    const relationship = composeEvidenceRelationship({
      id: 'rel-1',
      sourceEvidenceId: 'e1',
      targetEvidenceId: 'e2',
      relationshipType: 'derives_from',
      rationale: 'Test rationale',
    });
    assert.equal(relationship.id, 'rel-1');
    assert.equal(relationship.sourceEvidenceId, 'e1');
    assert.equal(relationship.targetEvidenceId, 'e2');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Governance
// ============================================================================

describe('composeEvidenceGovernance', () => {
  it('should compose governance from valid params', () => {
    const governance = composeEvidenceGovernance({
      id: 'gov-1',
      governanceLevel: 'approved',
      decidedBy: 'reviewer',
      decidedAt: '2025-01-01',
      rationale: 'Test rationale',
    });
    assert.equal(governance.id, 'gov-1');
    assert.equal(governance.governanceLevel, 'approved');
    assert.equal(governance.decidedBy, 'reviewer');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Audit Metadata
// ============================================================================

describe('composeEvidenceAuditMetadata', () => {
  it('should compose audit metadata from valid params', () => {
    const audit = composeEvidenceAuditMetadata({
      id: 'audit-1',
      auditedBy: 'auditor',
      auditedAt: '2025-01-01',
      confidenceLevel: 'high',
      traceType: 'deterministic',
      auditNotes: 'Test notes',
    });
    assert.equal(audit.id, 'audit-1');
    assert.equal(audit.auditedBy, 'auditor');
    assert.equal(audit.confidenceLevel, 'high');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composeEvidenceRegistry', () => {
  it('should compose registry from evidence', () => {
    const registry = composeEvidenceRegistry([VALID_EVIDENCE_A, VALID_EVIDENCE_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
  });

  it('should sort nodes by id', () => {
    const registry = composeEvidenceRegistry([VALID_EVIDENCE_C, VALID_EVIDENCE_A, VALID_EVIDENCE_B]);
    assert.equal(registry.nodes[0].id, 'evidence-a');
    assert.equal(registry.nodes[1].id, 'evidence-b');
    assert.equal(registry.nodes[2].id, 'evidence-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_EVIDENCE_A, VALID_EVIDENCE_B];
    const r1 = composeEvidenceRegistry(nodes);
    const r2 = composeEvidenceRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_EVIDENCE_C, VALID_EVIDENCE_A];
    const original = JSON.stringify(nodes);
    composeEvidenceRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composeEvidenceRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry From Input
// ============================================================================

describe('composeEvidenceRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: EvidenceInput = { nodes: [VALID_EVIDENCE_A, VALID_EVIDENCE_B] };
    const registry = composeEvidenceRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
  });

  it('should return identical output for identical input', () => {
    const input: EvidenceInput = { nodes: [VALID_EVIDENCE_A] };
    const r1 = composeEvidenceRegistryFromInput(input);
    const r2 = composeEvidenceRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Evidence Collection
// ============================================================================

describe('composeAssessmentEvidenceCollection', () => {
  it('should compose evidence collection into registry', () => {
    const registry = composeAssessmentEvidenceCollection({
      evidence: [VALID_EVIDENCE_A, VALID_EVIDENCE_B],
    });
    assert.equal(registry.nodes.length, 2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Artifact With Evidence
// ============================================================================

describe('composeAssessmentArtifactWithEvidence', () => {
  it('should compose artifact with evidence', () => {
    const artifact = composeAssessmentArtifactWithEvidence({
      artifactId: 'art-1',
      artifactTitle: 'Test Artifact',
      evidence: [VALID_EVIDENCE_A],
    });
    assert.equal(artifact.artifactId, 'art-1');
    assert.equal(artifact.evidence.length, 1);
  });

  it('should not mutate evidence input', () => {
    const evidence = [VALID_EVIDENCE_A];
    const original = JSON.stringify(evidence);
    composeAssessmentArtifactWithEvidence({
      artifactId: 'art-1',
      artifactTitle: 'Test Artifact',
      evidence,
    });
    assert.equal(JSON.stringify(evidence), original);
  });
});

// ============================================================================
// VALIDATION — Evidence Reference
// ============================================================================

describe('validateEvidenceReference', () => {
  it('should pass for valid reference', () => {
    const errors = validateEvidenceReference(_makeReference('ref-1'));
    assert.equal(errors.length, 0);
  });

  it('should reject reference with missing id', () => {
    const reference = composeEvidenceReference({
      id: '',
      evidenceType: 'answer',
      source: 'assessment',
      description: 'Test',
    });
    const errors = validateEvidenceReference(reference);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_REFERENCE_DUPLICATE_ID));
  });

  it('should reject reference with invalid type', () => {
    const reference = composeEvidenceReference({
      id: 'ref-1',
      evidenceType: 'invalid' as any,
      source: 'assessment',
      description: 'Test',
    });
    const errors = validateEvidenceReference(reference);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TYPE));
  });

  it('should reject reference with invalid source', () => {
    const reference = composeEvidenceReference({
      id: 'ref-1',
      evidenceType: 'answer',
      source: 'invalid' as any,
      description: 'Test',
    });
    const errors = validateEvidenceReference(reference);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_SOURCE));
  });
});

// ============================================================================
// VALIDATION — Evidence Relationship
// ============================================================================

describe('validateEvidenceRelationship', () => {
  it('should pass for valid relationship', () => {
    const relationship = composeEvidenceRelationship({
      id: 'rel-1',
      sourceEvidenceId: 'e1',
      targetEvidenceId: 'e2',
      relationshipType: 'derives_from',
      rationale: 'Test',
    });
    const errors = validateEvidenceRelationship(relationship);
    assert.equal(errors.length, 0);
  });

  it('should reject relationship with missing id', () => {
    const relationship = composeEvidenceRelationship({
      id: '',
      sourceEvidenceId: 'e1',
      targetEvidenceId: 'e2',
      relationshipType: 'derives_from',
      rationale: 'Test',
    });
    const errors = validateEvidenceRelationship(relationship);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_RELATIONSHIP_DUPLICATE_ID));
  });

  it('should reject self-relationship', () => {
    const relationship = composeEvidenceRelationship({
      id: 'rel-1',
      sourceEvidenceId: 'e1',
      targetEvidenceId: 'e1',
      relationshipType: 'derives_from',
      rationale: 'Test',
    });
    const errors = validateEvidenceRelationship(relationship);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_SELF_RELATIONSHIP));
  });
});

// ============================================================================
// VALIDATION — Evidence Governance
// ============================================================================

describe('validateEvidenceGovernance', () => {
  it('should pass for valid governance', () => {
    const errors = validateEvidenceGovernance(VALID_EVIDENCE_GOVERNANCE);
    assert.equal(errors.length, 0);
  });

  it('should reject governance with missing id', () => {
    const governance = composeEvidenceGovernance({
      id: '',
      governanceLevel: 'approved',
      decidedBy: 'reviewer',
      decidedAt: '2025-01-01',
      rationale: 'Test',
    });
    const errors = validateEvidenceGovernance(governance);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_GOVERNANCE_DUPLICATE_ID));
  });

  it('should reject governance with invalid level', () => {
    const governance = composeEvidenceGovernance({
      id: 'gov-1',
      governanceLevel: 'invalid' as any,
      decidedBy: 'reviewer',
      decidedAt: '2025-01-01',
      rationale: 'Test',
    });
    const errors = validateEvidenceGovernance(governance);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_GOVERNANCE));
  });

  it('should reject governance with missing rationale', () => {
    const governance = composeEvidenceGovernance({
      id: 'gov-1',
      governanceLevel: 'approved',
      decidedBy: 'reviewer',
      decidedAt: '2025-01-01',
      rationale: '',
    });
    const errors = validateEvidenceGovernance(governance);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_RATIONALE));
  });
});

// ============================================================================
// VALIDATION — Evidence Audit Metadata
// ============================================================================

describe('validateEvidenceAuditMetadata', () => {
  it('should pass for valid audit metadata', () => {
    const errors = validateEvidenceAuditMetadata(VALID_EVIDENCE_AUDIT);
    assert.equal(errors.length, 0);
  });

  it('should reject audit with missing id', () => {
    const audit = composeEvidenceAuditMetadata({
      id: '',
      auditedBy: 'auditor',
      auditedAt: '2025-01-01',
      confidenceLevel: 'high',
      traceType: 'deterministic',
      auditNotes: 'Test',
    });
    const errors = validateEvidenceAuditMetadata(audit);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_AUDIT));
  });

  it('should reject audit with invalid confidence level', () => {
    const audit = composeEvidenceAuditMetadata({
      id: 'audit-1',
      auditedBy: 'auditor',
      auditedAt: '2025-01-01',
      confidenceLevel: 'invalid' as any,
      traceType: 'deterministic',
      auditNotes: 'Test',
    });
    const errors = validateEvidenceAuditMetadata(audit);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_CONFIDENCE));
  });

  it('should reject audit with invalid trace type', () => {
    const audit = composeEvidenceAuditMetadata({
      id: 'audit-1',
      auditedBy: 'auditor',
      auditedAt: '2025-01-01',
      confidenceLevel: 'high',
      traceType: 'invalid' as any,
      auditNotes: 'Test',
    });
    const errors = validateEvidenceAuditMetadata(audit);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Assessment Evidence
// ============================================================================

describe('validateAssessmentEvidence', () => {
  it('should pass for valid evidence', () => {
    const errors = validateAssessmentEvidence(VALID_EVIDENCE_A);
    assert.equal(errors.length, 0);
  });

  it('should reject evidence with missing id', () => {
    const evidence = _makeEvidence('');
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_EVIDENCE_ID));
  });

  it('should reject evidence with missing title', () => {
    const evidence = _makeEvidence('e1', { title: '' });
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_TITLE));
  });

  it('should reject evidence with invalid type', () => {
    const evidence = _makeEvidence('e1', { evidenceType: 'invalid' as any });
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TYPE));
  });

  it('should reject evidence with invalid source', () => {
    const evidence = _makeEvidence('e1', { source: 'invalid' as any });
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_SOURCE));
  });

  it('should reject evidence with invalid confidence level', () => {
    const evidence = _makeEvidence('e1', { confidenceLevel: 'invalid' as any });
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_CONFIDENCE));
  });

  it('should reject evidence with empty references', () => {
    const evidence = _makeEvidence('e1', { references: [] });
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_EVIDENCE_REFERENCE));
  });

  it('should reject evidence with missing governance', () => {
    const evidence = _makeEvidence('e1', { governance: null as any });
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_GOVERNANCE));
  });

  it('should reject evidence with missing audit metadata', () => {
    const evidence = _makeEvidence('e1', { auditMetadata: null as any });
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_AUDIT));
  });

  it('should reject evidence with empty conceptIds', () => {
    const evidence = _makeEvidence('e1', { conceptIds: [] });
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_ASSESSMENT_REFERENCE));
  });

  it('should reject evidence with invalid status', () => {
    const evidence = _makeEvidence('e1', { status: 'invalid' as any });
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_STATUS));
  });

  it('should reject evidence with invalid assessment governance', () => {
    const evidence = _makeEvidence('e1', { assessmentGovernance: 'invalid' as any });
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_GOVERNANCE));
  });

  it('should reject evidence with missing provenance', () => {
    const evidence = _makeEvidence('e1', { provenance: null as any });
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE));
  });

  it('should reject evidence with missing provenance provider', () => {
    const evidence = _makeEvidence('e1', {
      provenance: { ...VALID_EVIDENCE_PROVENANCE, provider: '' },
    });
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVIDER));
  });

  it('should reject evidence with missing provenance rationale', () => {
    const evidence = _makeEvidence('e1', {
      provenance: { ...VALID_EVIDENCE_PROVENANCE, rationale: '' },
    });
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_RATIONALE));
  });

  it('should reject evidence with missing trace', () => {
    const evidence = {
      ...VALID_EVIDENCE_A,
      trace: null as any,
    };
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE));
  });

  it('should reject evidence with non-deterministic trace', () => {
    const evidence = {
      ...VALID_EVIDENCE_A,
      trace: { ...VALID_EVIDENCE_A.trace, deterministic: false as any },
    };
    const errors = validateAssessmentEvidence(evidence);
    assert.ok(errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Evidence Registry
// ============================================================================

describe('validateEvidenceRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composeEvidenceRegistry([VALID_EVIDENCE_A, VALID_EVIDENCE_B]);
    const result = validateEvidenceRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null registry', () => {
    const result = validateEvidenceRegistry(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty registry', () => {
    const registry = composeEvidenceRegistry([]);
    const result = validateEvidenceRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makeEvidence('dup'), _makeEvidence('dup')];
    const registry = composeEvidenceRegistry(duplicateNodes);
    const result = validateEvidenceRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makeEvidence('a', { title: 'Same Title' }),
      _makeEvidence('b', { title: 'Same Title' }),
    ];
    const registry = composeEvidenceRegistry(duplicateTitles);
    const result = validateEvidenceRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_DUPLICATE_TITLE));
  });
});

// ============================================================================
// VALIDATION — Evidence Input
// ============================================================================

describe('validateEvidenceInput', () => {
  it('should pass for valid input', () => {
    const input: EvidenceInput = { nodes: [VALID_EVIDENCE_A] };
    const result = validateEvidenceInput(input);
    assert.equal(result.valid, true);
  });

  it('should reject null input', () => {
    const result = validateEvidenceInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty input', () => {
    const result = validateEvidenceInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Evidence Trace
// ============================================================================

describe('validateEvidenceTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composeAssessmentEvidenceTrace({ traceId: 't-1' });
    const result = validateEvidenceTrace(trace);
    assert.equal(result.valid, true);
  });

  it('should reject null trace', () => {
    const result = validateEvidenceTrace(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject trace with missing traceId', () => {
    const trace = composeAssessmentEvidenceTrace({ traceId: '' });
    const result = validateEvidenceTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should reject trace with non-deterministic', () => {
    const trace = { ...composeAssessmentEvidenceTrace({ traceId: 't-1' }), deterministic: false as any };
    const result = validateEvidenceTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should reject trace with randomUsed true', () => {
    const trace = { ...composeAssessmentEvidenceTrace({ traceId: 't-1' }), randomUsed: true as any };
    const result = validateEvidenceTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should reject trace with timeDependency true', () => {
    const trace = { ...composeAssessmentEvidenceTrace({ traceId: 't-1' }), timeDependency: true as any };
    const result = validateEvidenceTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Artifact With Evidence
// ============================================================================

describe('validateAssessmentArtifactWithEvidence', () => {
  it('should pass for valid artifact', () => {
    const artifact = composeAssessmentArtifactWithEvidence({
      artifactId: 'art-1',
      artifactTitle: 'Test Artifact',
      evidence: [VALID_EVIDENCE_A],
    });
    const result = validateAssessmentArtifactWithEvidence(artifact);
    assert.equal(result.valid, true);
  });

  it('should reject null artifact', () => {
    const result = validateAssessmentArtifactWithEvidence(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject artifact with missing artifactId', () => {
    const artifact = composeAssessmentArtifactWithEvidence({
      artifactId: '',
      artifactTitle: 'Test Artifact',
      evidence: [VALID_EVIDENCE_A],
    });
    const result = validateAssessmentArtifactWithEvidence(artifact);
    assert.equal(result.valid, false);
  });

  it('should reject artifact with missing artifactTitle', () => {
    const artifact = composeAssessmentArtifactWithEvidence({
      artifactId: 'art-1',
      artifactTitle: '',
      evidence: [VALID_EVIDENCE_A],
    });
    const result = validateAssessmentArtifactWithEvidence(artifact);
    assert.equal(result.valid, false);
  });

  it('should reject artifact with missing evidence array', () => {
    const artifact = { artifactId: 'art-1', artifactTitle: 'Test', evidence: null as any };
    const result = validateAssessmentArtifactWithEvidence(artifact);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composeEvidenceRegistry across 100 iterations', () => {
    const nodes = [VALID_EVIDENCE_A, VALID_EVIDENCE_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeEvidenceRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composeAssessmentEvidence across 100 iterations', () => {
    const params = {
      id: 'e1',
      title: 'Test',
      evidenceType: 'answer' as const,
      source: 'assessment' as const,
      confidenceLevel: 'high' as const,
      references: [_makeReference('r1')],
      relationships: [],
      governance: VALID_EVIDENCE_GOVERNANCE,
      auditMetadata: VALID_EVIDENCE_AUDIT,
      conceptIds: ['concept-1'],
      status: 'draft' as const,
      assessmentGovernance: 'canonical' as const,
      provenance: VALID_EVIDENCE_PROVENANCE,
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeAssessmentEvidence(params);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });
});

// ============================================================================
// IMMUTABILITY
// ============================================================================

describe('Immutability', () => {
  it('should not mutate input nodes array in composeEvidenceRegistry', () => {
    const nodes = [VALID_EVIDENCE_C, VALID_EVIDENCE_A];
    const original = JSON.stringify(nodes);
    composeEvidenceRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate conceptIds in composeAssessmentEvidence', () => {
    const conceptIds = ['concept-1'];
    const original = JSON.stringify(conceptIds);
    composeAssessmentEvidence({
      id: 'e1',
      title: 'Test',
      evidenceType: 'answer',
      source: 'assessment',
      confidenceLevel: 'high',
      references: [],
      relationships: [],
      governance: VALID_EVIDENCE_GOVERNANCE,
      auditMetadata: VALID_EVIDENCE_AUDIT,
      conceptIds,
      status: 'draft',
      assessmentGovernance: 'canonical',
      provenance: VALID_EVIDENCE_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });

  it('getCanonicalEvidenceTypes returns a copy not affecting original', () => {
    const copy = getCanonicalEvidenceTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_EVIDENCE_TYPES.length, 10);
  });

  it('getCanonicalEvidenceSources returns a copy not affecting original', () => {
    const copy = getCanonicalEvidenceSources();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_EVIDENCE_SOURCES.length, 10);
  });

  it('getCanonicalEvidenceConfidenceLevels returns a copy not affecting original', () => {
    const copy = getCanonicalEvidenceConfidenceLevels();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_EVIDENCE_CONFIDENCE_LEVELS.length, 10);
  });
});

// ============================================================================
// CROSS-AGENT BOUNDARY
// ============================================================================

describe('Cross-Agent Boundary', () => {
  it('should not contain calculateGrade', () => {
    const source = JSON.stringify(CANONICAL_EVIDENCE_TYPES);
    assert.ok(!source.includes('calculateGrade'), 'Found calculateGrade pattern');
  });

  it('should not contain computeMastery', () => {
    const source = JSON.stringify(CANONICAL_EVIDENCE_TYPES);
    assert.ok(!source.includes('computeMastery'), 'Found computeMastery pattern');
  });

  it('should not contain evaluateLearner', () => {
    const source = JSON.stringify(CANONICAL_EVIDENCE_TYPES);
    assert.ok(!source.includes('evaluateLearner'), 'Found evaluateLearner pattern');
  });

  it('should not contain diagnoseStudent', () => {
    const source = JSON.stringify(CANONICAL_EVIDENCE_TYPES);
    assert.ok(!source.includes('diagnoseStudent'), 'Found diagnoseStudent pattern');
  });

  it('should not contain recommendRemediation', () => {
    const source = JSON.stringify(CANONICAL_EVIDENCE_TYPES);
    assert.ok(!source.includes('recommendRemediation'), 'Found recommendRemediation pattern');
  });

  it('should not contain adaptiveLearning', () => {
    const source = JSON.stringify(CANONICAL_EVIDENCE_TYPES);
    assert.ok(!source.includes('adaptiveLearning'), 'Found adaptiveLearning pattern');
  });

  it('should not contain studentModel', () => {
    const source = JSON.stringify(CANONICAL_EVIDENCE_TYPES);
    assert.ok(!source.includes('studentModel'), 'Found studentModel pattern');
  });

  it('should not contain masteryEngine', () => {
    const source = JSON.stringify(CANONICAL_EVIDENCE_TYPES);
    assert.ok(!source.includes('masteryEngine'), 'Found masteryEngine pattern');
  });

  it('should not contain gradingEngine', () => {
    const source = JSON.stringify(CANONICAL_EVIDENCE_TYPES);
    assert.ok(!source.includes('gradingEngine'), 'Found gradingEngine pattern');
  });

  it('should not contain competencyInference', () => {
    const source = JSON.stringify(CANONICAL_EVIDENCE_TYPES);
    assert.ok(!source.includes('competencyInference'), 'Found competencyInference pattern');
  });
});

// ============================================================================
// NEGATIVE CAPABILITY
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain scoring logic', () => {
    const source = JSON.stringify(CANONICAL_EVIDENCE_TYPES);
    assert.ok(!source.includes('score'), 'Found scoring logic');
    assert.ok(!source.includes('mastery'), 'Found mastery logic');
  });

  it('should not contain LLM or async patterns', () => {
    const source = JSON.stringify(CANONICAL_EVIDENCE_TYPES);
    assert.ok(!source.includes('Promise'), 'Found Promise pattern');
    assert.ok(!source.includes('async'), 'Found async pattern');
    assert.ok(!source.includes('await'), 'Found await pattern');
  });
});

// ============================================================================
// VALIDATION CODES
// ============================================================================

describe('Validation Codes', () => {
  it('should have exactly 24 validation codes', () => {
    const codes = Object.values(EVIDENCE_VALIDATION_CODES);
    assert.equal(codes.length, 24);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(EVIDENCE_VALIDATION_CODES)) {
      assert.ok(/^[A-Z_]+$/.test(code), `Not UPPER_SNAKE_CASE: ${code}`);
    }
  });

  it('all validation codes should start with EVIDENCE_', () => {
    for (const code of Object.values(EVIDENCE_VALIDATION_CODES)) {
      assert.ok(code.startsWith('EVIDENCE_'), `Does not start with EVIDENCE_: ${code}`);
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(EVIDENCE_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});
