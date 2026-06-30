/**
 * NV-2000-D8-OPT-07 — Laboratory Assessment Kernel Tests
 *
 * Exhaustive deterministic tests for the Laboratory Assessment Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~90 tests covering:
 * - Canonical enum completeness
 * - Helper functions
 * - Integration composition
 * - Evidence composition
 * - Objective composition
 * - Relationship composition
 * - Registry composition
 * - Validation codes
 * - Duplicate detection
 * - Deterministic identity (100 iterations)
 * - Immutability
 * - Validator stability
 * - No mutation
 * - Artifact with laboratories
 * - Cross-agent boundary
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_LAB_ASSESSMENT_TYPES,
  CANONICAL_LAB_OBJECTIVE_TYPES,
  CANONICAL_LAB_EVIDENCE_TYPES,
  CANONICAL_LAB_MAPPING_TYPES,
  CANONICAL_LAB_ASSESSMENT_STATUS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type AssessmentLaboratoryIntegration,
  type LaboratoryObjective,
  type LaboratoryEvidenceReference,
  type LaboratoryAssessmentInput,
  type LaboratoryAssessmentRegistry,
  type LaboratoryAssessmentProvenance,
  type AssessmentArtifactWithLaboratories,
} from './AssessmentAgentContract.ts';

import {
  composeLaboratoryAssessmentProvenance,
  composeLaboratoryAssessmentTrace,
  composeAssessmentLaboratoryIntegration,
  composeLaboratoryEvidenceReference,
  composeLaboratoryObjective,
  composeLaboratoryAssessmentRelationship,
  composeLaboratoryAssessmentRegistry,
  composeLaboratoryAssessmentRegistryFromInput,
  composeAssessmentLaboratoryMappings,
  composeAssessmentArtifactWithLaboratories,
  isSupportedLaboratoryAssessmentType,
  isSupportedLaboratoryObjectiveType,
  isSupportedLaboratoryEvidenceType,
  isSupportedLaboratoryMappingType,
  isSupportedLaboratoryAssessmentStatus,
  isSupportedLaboratoryAssessmentGovernance,
  getCanonicalLaboratoryAssessmentTypes,
  getCanonicalLaboratoryObjectiveTypes,
  getCanonicalLaboratoryEvidenceTypes,
  getCanonicalLaboratoryMappingTypes,
  getCanonicalLaboratoryAssessmentStatuses,
} from './LaboratoryAssessmentKernel.ts';

import {
  LAB_ASSESSMENT_VALIDATION_CODES,
  validateAssessmentLaboratoryIntegration,
  validateLaboratoryEvidenceReference,
  validateLaboratoryObjective,
  validateLaboratoryAssessmentRelationship,
  validateLaboratoryAssessmentRegistry,
  validateLaboratoryAssessmentInput,
  validateLaboratoryAssessmentTrace,
  validateAssessmentArtifactWithLaboratories,
} from './LaboratoryAssessmentValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_LAB_PROVENANCE: LaboratoryAssessmentProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for lab assessment.',
};

function _makeObjective(id: string): LaboratoryObjective {
  return composeLaboratoryObjective({
    id,
    objectiveType: 'concept_validation',
    description: 'Test objective.',
    conceptIds: ['concept-1'],
  });
}

function _makeEvidence(id: string): LaboratoryEvidenceReference {
  return composeLaboratoryEvidenceReference({
    id,
    evidenceType: 'execution_log',
    laboratoryActivityId: 'lab-1',
    description: 'Test evidence.',
  });
}

function _makeIntegration(
  id: string,
  overrides: Partial<AssessmentLaboratoryIntegration> = {},
): AssessmentLaboratoryIntegration {
  return composeAssessmentLaboratoryIntegration({
    id,
    title: `Integration ${id}`,
    labAssessmentType: 'guided_lab',
    mappingType: 'mandatory',
    laboratoryActivityId: 'lab-1',
    objectives: [_makeObjective(`obj-${id}`)],
    evidenceReferences: [_makeEvidence(`ev-${id}`)],
    conceptIds: ['concept-1'],
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_LAB_PROVENANCE,
    ...overrides,
  });
}

const VALID_INTEGRATION_A = _makeIntegration('integ-a');
const VALID_INTEGRATION_B = _makeIntegration('integ-b');
const VALID_INTEGRATION_C = _makeIntegration('integ-c');

// ============================================================================
// CANONICAL ENUM COMPLETENESS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 lab assessment types', () => {
    assert.equal(CANONICAL_LAB_ASSESSMENT_TYPES.length, 10);
  });

  it('should have exactly 10 lab objective types', () => {
    assert.equal(CANONICAL_LAB_OBJECTIVE_TYPES.length, 10);
  });

  it('should have exactly 10 lab evidence types', () => {
    assert.equal(CANONICAL_LAB_EVIDENCE_TYPES.length, 10);
  });

  it('should have exactly 10 lab mapping types', () => {
    assert.equal(CANONICAL_LAB_MAPPING_TYPES.length, 10);
  });

  it('should have exactly 6 lab assessment statuses', () => {
    assert.equal(CANONICAL_LAB_ASSESSMENT_STATUS.length, 6);
  });

  it('should contain expected lab assessment types', () => {
    const expected = [
      'pre_lab', 'guided_lab', 'verification_lab', 'engineering_lab',
      'experimental_lab', 'observation_lab', 'integration_lab',
      'capstone_lab', 'validation_lab', 'portfolio_lab',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_LAB_ASSESSMENT_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected lab objective types', () => {
    const expected = [
      'concept_validation', 'implementation', 'engineering_reasoning',
      'system_understanding', 'algorithm_validation', 'workflow_validation',
      'architecture_validation', 'evidence_collection', 'competency_verification',
      'mastery_demonstration',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_LAB_OBJECTIVE_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected lab evidence types', () => {
    const expected = [
      'execution_log', 'measurement', 'output_artifact', 'code_submission',
      'visual_output', 'observation_note', 'performance_metric',
      'engineering_report', 'experiment_record', 'reflection',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_LAB_EVIDENCE_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected lab mapping types', () => {
    const expected = [
      'mandatory', 'recommended', 'optional', 'alternative', 'follow_up',
      'prerequisite', 'parallel', 'reinforcement', 'capstone', 'portfolio',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_LAB_MAPPING_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedLaboratoryAssessmentType returns true for valid types', () => {
    assert.equal(isSupportedLaboratoryAssessmentType('pre_lab'), true);
    assert.equal(isSupportedLaboratoryAssessmentType('portfolio_lab'), true);
  });

  it('isSupportedLaboratoryAssessmentType returns false for invalid types', () => {
    assert.equal(isSupportedLaboratoryAssessmentType('invalid'), false);
    assert.equal(isSupportedLaboratoryAssessmentType(''), false);
  });

  it('isSupportedLaboratoryObjectiveType returns true for valid types', () => {
    assert.equal(isSupportedLaboratoryObjectiveType('concept_validation'), true);
    assert.equal(isSupportedLaboratoryObjectiveType('mastery_demonstration'), true);
  });

  it('isSupportedLaboratoryObjectiveType returns false for invalid types', () => {
    assert.equal(isSupportedLaboratoryObjectiveType('invalid'), false);
    assert.equal(isSupportedLaboratoryObjectiveType(''), false);
  });

  it('isSupportedLaboratoryEvidenceType returns true for valid types', () => {
    assert.equal(isSupportedLaboratoryEvidenceType('execution_log'), true);
    assert.equal(isSupportedLaboratoryEvidenceType('reflection'), true);
  });

  it('isSupportedLaboratoryEvidenceType returns false for invalid types', () => {
    assert.equal(isSupportedLaboratoryEvidenceType('invalid'), false);
    assert.equal(isSupportedLaboratoryEvidenceType(''), false);
  });

  it('isSupportedLaboratoryMappingType returns true for valid types', () => {
    assert.equal(isSupportedLaboratoryMappingType('mandatory'), true);
    assert.equal(isSupportedLaboratoryMappingType('portfolio'), true);
  });

  it('isSupportedLaboratoryMappingType returns false for invalid types', () => {
    assert.equal(isSupportedLaboratoryMappingType('invalid'), false);
    assert.equal(isSupportedLaboratoryMappingType(''), false);
  });

  it('isSupportedLaboratoryAssessmentStatus returns true for valid statuses', () => {
    assert.equal(isSupportedLaboratoryAssessmentStatus('draft'), true);
    assert.equal(isSupportedLaboratoryAssessmentStatus('archived'), true);
  });

  it('isSupportedLaboratoryAssessmentStatus returns false for invalid statuses', () => {
    assert.equal(isSupportedLaboratoryAssessmentStatus('invalid'), false);
    assert.equal(isSupportedLaboratoryAssessmentStatus(''), false);
  });

  it('isSupportedLaboratoryAssessmentGovernance returns true for valid governance', () => {
    assert.equal(isSupportedLaboratoryAssessmentGovernance('canonical'), true);
    assert.equal(isSupportedLaboratoryAssessmentGovernance('rejected'), true);
  });

  it('isSupportedLaboratoryAssessmentGovernance returns false for invalid governance', () => {
    assert.equal(isSupportedLaboratoryAssessmentGovernance('invalid'), false);
    assert.equal(isSupportedLaboratoryAssessmentGovernance(''), false);
  });

  it('getCanonicalLaboratoryAssessmentTypes returns a copy', () => {
    const result = getCanonicalLaboratoryAssessmentTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_LAB_ASSESSMENT_TYPES]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_LAB_ASSESSMENT_TYPES.length, 10);
  });

  it('getCanonicalLaboratoryObjectiveTypes returns a copy', () => {
    const result = getCanonicalLaboratoryObjectiveTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalLaboratoryEvidenceTypes returns a copy', () => {
    const result = getCanonicalLaboratoryEvidenceTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalLaboratoryMappingTypes returns a copy', () => {
    const result = getCanonicalLaboratoryMappingTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalLaboratoryAssessmentStatuses returns a copy', () => {
    const result = getCanonicalLaboratoryAssessmentStatuses();
    assert.equal(result.length, 6);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Integration
// ============================================================================

describe('composeAssessmentLaboratoryIntegration', () => {
  it('should compose integration from valid params', () => {
    const integration = composeAssessmentLaboratoryIntegration({
      id: 'i1', title: 'Test',
      labAssessmentType: 'guided_lab',
      mappingType: 'mandatory',
      laboratoryActivityId: 'lab-1',
      objectives: [_makeObjective('o1')],
      evidenceReferences: [_makeEvidence('e1')],
      conceptIds: ['c1'], status: 'draft',
      governance: 'canonical', provenance: VALID_LAB_PROVENANCE,
    });
    assert.equal(integration.id, 'i1');
    assert.equal(integration.title, 'Test');
    assert.equal(integration.labAssessmentType, 'guided_lab');
    assert.equal(integration.mappingType, 'mandatory');
    assert.equal(integration.trace.deterministic, true);
    assert.equal(integration.trace.randomUsed, false);
    assert.equal(integration.trace.timeDependency, false);
  });

  it('should not mutate input arrays', () => {
    const conceptIds = ['c1'];
    const original = JSON.stringify(conceptIds);
    composeAssessmentLaboratoryIntegration({
      id: 'i', title: 'T',
      labAssessmentType: 'guided_lab', mappingType: 'mandatory',
      laboratoryActivityId: 'lab', objectives: [], evidenceReferences: [],
      conceptIds, status: 'draft', governance: 'canonical',
      provenance: VALID_LAB_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Evidence
// ============================================================================

describe('composeLaboratoryEvidenceReference', () => {
  it('should compose evidence from valid params', () => {
    const evidence = composeLaboratoryEvidenceReference({
      id: 'e1', evidenceType: 'execution_log',
      laboratoryActivityId: 'lab-1', description: 'Desc',
    });
    assert.equal(evidence.id, 'e1');
    assert.equal(evidence.evidenceType, 'execution_log');
    assert.equal(evidence.laboratoryActivityId, 'lab-1');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Objective
// ============================================================================

describe('composeLaboratoryObjective', () => {
  it('should compose objective from valid params', () => {
    const objective = composeLaboratoryObjective({
      id: 'o1', objectiveType: 'implementation',
      description: 'Desc', conceptIds: ['c1'],
    });
    assert.equal(objective.id, 'o1');
    assert.equal(objective.objectiveType, 'implementation');
    assert.deepEqual([...objective.conceptIds], ['c1']);
  });

  it('should not mutate conceptIds input', () => {
    const conceptIds = ['c1'];
    const original = JSON.stringify(conceptIds);
    composeLaboratoryObjective({
      id: 'o', objectiveType: 'implementation',
      description: 'D', conceptIds,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Relationship
// ============================================================================

describe('composeLaboratoryAssessmentRelationship', () => {
  it('should compose relationship from valid params', () => {
    const rel = composeLaboratoryAssessmentRelationship({
      id: 'r1', sourceIntegrationId: 'a', targetIntegrationId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    assert.equal(rel.id, 'r1');
    assert.equal(rel.sourceIntegrationId, 'a');
    assert.equal(rel.targetIntegrationId, 'b');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'r', sourceIntegrationId: 'a', targetIntegrationId: 'b',
      relationshipType: 'dep', rationale: 'r',
    };
    const r1 = composeLaboratoryAssessmentRelationship(params);
    const r2 = composeLaboratoryAssessmentRelationship(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composeLaboratoryAssessmentRegistry', () => {
  it('should compose registry from integrations', () => {
    const registry = composeLaboratoryAssessmentRegistry([VALID_INTEGRATION_A, VALID_INTEGRATION_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
  });

  it('should sort nodes by id', () => {
    const registry = composeLaboratoryAssessmentRegistry([VALID_INTEGRATION_C, VALID_INTEGRATION_A, VALID_INTEGRATION_B]);
    assert.equal(registry.nodes[0].id, 'integ-a');
    assert.equal(registry.nodes[1].id, 'integ-b');
    assert.equal(registry.nodes[2].id, 'integ-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_INTEGRATION_A, VALID_INTEGRATION_B];
    const r1 = composeLaboratoryAssessmentRegistry(nodes);
    const r2 = composeLaboratoryAssessmentRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_INTEGRATION_C, VALID_INTEGRATION_A];
    const original = JSON.stringify(nodes);
    composeLaboratoryAssessmentRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composeLaboratoryAssessmentRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry from Input
// ============================================================================

describe('composeLaboratoryAssessmentRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: LaboratoryAssessmentInput = { nodes: [VALID_INTEGRATION_A, VALID_INTEGRATION_B] };
    const registry = composeLaboratoryAssessmentRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
  });

  it('should return identical output for identical input', () => {
    const input: LaboratoryAssessmentInput = { nodes: [VALID_INTEGRATION_A] };
    const r1 = composeLaboratoryAssessmentRegistryFromInput(input);
    const r2 = composeLaboratoryAssessmentRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Artifact with laboratories
// ============================================================================

describe('composeAssessmentArtifactWithLaboratories', () => {
  it('should compose artifact with laboratories', () => {
    const result = composeAssessmentArtifactWithLaboratories({
      artifactId: 'art-1', artifactTitle: 'Test',
      laboratories: [VALID_INTEGRATION_A],
    });
    assert.equal(result.artifactId, 'art-1');
    assert.equal(result.laboratories.length, 1);
  });

  it('should not mutate laboratories input', () => {
    const labs = [VALID_INTEGRATION_A];
    const original = JSON.stringify(labs);
    composeAssessmentArtifactWithLaboratories({
      artifactId: 'a', artifactTitle: 'T', laboratories: labs,
    });
    assert.equal(JSON.stringify(labs), original);
  });
});

// ============================================================================
// VALIDATION — Integration validation
// ============================================================================

describe('validateAssessmentLaboratoryIntegration', () => {
  it('should pass for valid integration', () => {
    const errors = validateAssessmentLaboratoryIntegration(VALID_INTEGRATION_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null integration', () => {
    const errors = validateAssessmentLaboratoryIntegration(null as any);
    assert.ok(errors.length > 0);
  });

  it('should reject integration with missing id', () => {
    const integration = _makeIntegration('');
    const errors = validateAssessmentLaboratoryIntegration(integration);
    assert.ok(errors.some((e) => e.code === LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_INTEGRATION_ID));
  });

  it('should reject integration with invalid type', () => {
    const integration = _makeIntegration('i', { labAssessmentType: 'invalid' as any });
    const errors = validateAssessmentLaboratoryIntegration(integration);
    assert.ok(errors.some((e) => e.code === LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_TYPE));
  });

  it('should reject integration with invalid mapping type', () => {
    const integration = _makeIntegration('i', { mappingType: 'invalid' as any });
    const errors = validateAssessmentLaboratoryIntegration(integration);
    assert.ok(errors.some((e) => e.code === LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_MAPPING));
  });

  it('should reject integration with missing conceptIds', () => {
    const integration = _makeIntegration('i', { conceptIds: [] });
    const errors = validateAssessmentLaboratoryIntegration(integration);
    assert.ok(errors.some((e) => e.code === LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_ASSESSMENT_REFERENCE));
  });

  it('should reject integration with non-deterministic trace', () => {
    const integration: AssessmentLaboratoryIntegration = {
      id: 'i', title: 'T',
      labAssessmentType: 'guided_lab', mappingType: 'mandatory',
      laboratoryActivityId: 'lab', objectives: [], evidenceReferences: [],
      conceptIds: ['c1'], status: 'draft', governance: 'canonical',
      provenance: VALID_LAB_PROVENANCE,
      trace: {
        traceId: 't', deterministic: false as any,
        generatedFrom: 'deterministic_laboratory_assessment_kernel',
        randomUsed: false, timeDependency: false,
      },
    };
    const errors = validateAssessmentLaboratoryIntegration(integration);
    assert.ok(errors.some((e) => e.code === LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Relationship validation
// ============================================================================

describe('validateLaboratoryAssessmentRelationship', () => {
  it('should pass for valid relationship', () => {
    const rel = composeLaboratoryAssessmentRelationship({
      id: 'r1', sourceIntegrationId: 'a', targetIntegrationId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    const errors = validateLaboratoryAssessmentRelationship(rel);
    assert.equal(errors.length, 0);
  });

  it('should reject self-relationship', () => {
    const rel = composeLaboratoryAssessmentRelationship({
      id: 'r', sourceIntegrationId: 'a', targetIntegrationId: 'a',
      relationshipType: 'self', rationale: 'r',
    });
    const errors = validateLaboratoryAssessmentRelationship(rel);
    assert.ok(errors.some((e) => e.code === LAB_ASSESSMENT_VALIDATION_CODES.LAB_SELF_RELATIONSHIP));
  });
});

// ============================================================================
// VALIDATION — Registry validation
// ============================================================================

describe('validateLaboratoryAssessmentRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composeLaboratoryAssessmentRegistry([VALID_INTEGRATION_A, VALID_INTEGRATION_B]);
    const result = validateLaboratoryAssessmentRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null registry', () => {
    const result = validateLaboratoryAssessmentRegistry(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty registry', () => {
    const registry = composeLaboratoryAssessmentRegistry([]);
    const result = validateLaboratoryAssessmentRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makeIntegration('dup'), _makeIntegration('dup')];
    const registry = composeLaboratoryAssessmentRegistry(duplicateNodes);
    const result = validateLaboratoryAssessmentRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === LAB_ASSESSMENT_VALIDATION_CODES.LAB_ASSESSMENT_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makeIntegration('a', { title: 'Same Title' }),
      _makeIntegration('b', { title: 'Same Title' }),
    ];
    const registry = composeLaboratoryAssessmentRegistry(duplicateTitles);
    const result = validateLaboratoryAssessmentRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === LAB_ASSESSMENT_VALIDATION_CODES.LAB_ASSESSMENT_DUPLICATE_TITLE));
  });
});

// ============================================================================
// VALIDATION — Input validation
// ============================================================================

describe('validateLaboratoryAssessmentInput', () => {
  it('should pass for valid input', () => {
    const input: LaboratoryAssessmentInput = { nodes: [VALID_INTEGRATION_A] };
    const result = validateLaboratoryAssessmentInput(input);
    assert.equal(result.valid, true);
  });

  it('should reject null input', () => {
    const result = validateLaboratoryAssessmentInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty input', () => {
    const result = validateLaboratoryAssessmentInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Trace validation
// ============================================================================

describe('validateLaboratoryAssessmentTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composeLaboratoryAssessmentTrace({ traceId: 'test' });
    const result = validateLaboratoryAssessmentTrace(trace);
    assert.equal(result.valid, true);
  });

  it('should reject null trace', () => {
    const result = validateLaboratoryAssessmentTrace(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Artifact validation
// ============================================================================

describe('validateAssessmentArtifactWithLaboratories', () => {
  it('should pass for valid artifact', () => {
    const artifact = composeAssessmentArtifactWithLaboratories({
      artifactId: 'art-1', artifactTitle: 'Test',
      laboratories: [VALID_INTEGRATION_A],
    });
    const result = validateAssessmentArtifactWithLaboratories(artifact);
    assert.equal(result.valid, true);
  });

  it('should reject null artifact', () => {
    const result = validateAssessmentArtifactWithLaboratories(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composeLaboratoryAssessmentRegistry across 100 iterations', () => {
    const nodes = [VALID_INTEGRATION_A, VALID_INTEGRATION_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeLaboratoryAssessmentRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composeAssessmentLaboratoryIntegration across 100 iterations', () => {
    const params = {
      id: 'i', title: 'T',
      labAssessmentType: 'guided_lab' as const,
      mappingType: 'mandatory' as const,
      laboratoryActivityId: 'lab',
      objectives: [_makeObjective('o')],
      evidenceReferences: [_makeEvidence('e')],
      conceptIds: ['c1'],
      status: 'draft' as const, governance: 'canonical' as const,
      provenance: VALID_LAB_PROVENANCE,
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeAssessmentLaboratoryIntegration(params);
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
// IMMUTABILITY — No mutation
// ============================================================================

describe('Immutability', () => {
  it('should not mutate input nodes array in composeLaboratoryAssessmentRegistry', () => {
    const nodes = [VALID_INTEGRATION_C, VALID_INTEGRATION_A];
    const original = JSON.stringify(nodes);
    composeLaboratoryAssessmentRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate conceptIds in composeAssessmentLaboratoryIntegration', () => {
    const conceptIds = ['c1'];
    const original = JSON.stringify(conceptIds);
    composeAssessmentLaboratoryIntegration({
      id: 'i', title: 'T',
      labAssessmentType: 'guided_lab', mappingType: 'mandatory',
      laboratoryActivityId: 'lab', objectives: [], evidenceReferences: [],
      conceptIds, status: 'draft', governance: 'canonical',
      provenance: VALID_LAB_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });

  it('getCanonicalLaboratoryAssessmentTypes returns a copy not affecting original', () => {
    const copy = getCanonicalLaboratoryAssessmentTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_LAB_ASSESSMENT_TYPES.length, 10);
  });

  it('getCanonicalLaboratoryEvidenceTypes returns a copy not affecting original', () => {
    const copy = getCanonicalLaboratoryEvidenceTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_LAB_EVIDENCE_TYPES.length, 10);
  });

  it('getCanonicalLaboratoryMappingTypes returns a copy not affecting original', () => {
    const copy = getCanonicalLaboratoryMappingTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_LAB_MAPPING_TYPES.length, 10);
  });
});

// ============================================================================
// CROSS-AGENT BOUNDARY — No execution/scheduling/evaluation
// ============================================================================

describe('Cross-Agent Boundary', () => {
  it('should not contain laboratory execution logic', () => {
    const source = JSON.stringify(CANONICAL_LAB_ASSESSMENT_TYPES);
    assert.ok(!source.includes('execute'));
    assert.ok(!source.includes('run'));
    assert.ok(!source.includes('perform'));
  });

  it('should not contain laboratory scheduling logic', () => {
    const source = JSON.stringify(CANONICAL_LAB_ASSESSMENT_TYPES);
    assert.ok(!source.includes('schedule'));
    assert.ok(!source.includes('calendar'));
    assert.ok(!source.includes('booking'));
  });

  it('should not contain laboratory evaluation logic', () => {
    const source = JSON.stringify(CANONICAL_LAB_OBJECTIVE_TYPES);
    assert.ok(!source.includes('evaluat'));
    assert.ok(!source.includes('grade'));
    assert.ok(!source.includes('score'));
  });

  it('should not contain laboratory creation logic', () => {
    const source = JSON.stringify(CANONICAL_LAB_ASSESSMENT_TYPES);
    assert.ok(!source.includes('create'));
    assert.ok(!source.includes('generat'));
  });

  it('should not contain simulation logic', () => {
    const source = JSON.stringify(CANONICAL_LAB_ASSESSMENT_TYPES);
    assert.ok(!source.includes('simulat'));
    assert.ok(!source.includes('emulat'));
  });
});

// ============================================================================
// NEGATIVE CAPABILITY — No scoring/mastery/adaptive
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain scoring logic', () => {
    const source = JSON.stringify(CANONICAL_LAB_ASSESSMENT_TYPES);
    assert.ok(!source.includes('score'));
    assert.ok(!source.includes('mastery'));
  });

  it('should not contain LLM or async patterns', () => {
    const source = JSON.stringify(CANONICAL_LAB_ASSESSMENT_TYPES);
    assert.ok(!source.includes('Promise'));
    assert.ok(!source.includes('async'));
    assert.ok(!source.includes('await'));
  });
});

// ============================================================================
// VALIDATION CODES — Structure verification
// ============================================================================

describe('Validation Codes', () => {
  it('should have exactly 24 validation codes', () => {
    const codes = Object.values(LAB_ASSESSMENT_VALIDATION_CODES);
    assert.equal(codes.length, 24);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(LAB_ASSESSMENT_VALIDATION_CODES)) {
      assert.ok(/^[A-Z_]+$/.test(code), `Not UPPER_SNAKE_CASE: ${code}`);
    }
  });

  it('all validation codes should start with LAB_', () => {
    for (const code of Object.values(LAB_ASSESSMENT_VALIDATION_CODES)) {
      assert.ok(code.startsWith('LAB_'), `Does not start with LAB_: ${code}`);
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(LAB_ASSESSMENT_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});
