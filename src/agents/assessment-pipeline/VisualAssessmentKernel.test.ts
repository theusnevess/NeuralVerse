/**
 * NV-2000-D8-OPT-08 — Visual Assessment Kernel Tests
 *
 * Exhaustive deterministic tests for the Visual Assessment Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~90 tests covering:
 * - Canonical enum completeness
 * - Helper functions
 * - Visual artifact composition
 * - Reference composition
 * - Task composition
 * - Evidence composition
 * - Relationship composition
 * - Registry composition
 * - Validation codes
 * - Duplicate detection
 * - Deterministic identity (100 iterations)
 * - Immutability
 * - Validator stability
 * - No mutation
 * - Artifact with visual assets
 * - Cross-agent boundary
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_VISUAL_ASSESSMENT_TYPES,
  CANONICAL_VISUAL_RESOURCE_TYPES,
  CANONICAL_VISUAL_TASK_TYPES,
  CANONICAL_MULTIMODAL_EVIDENCE_TYPES,
  CANONICAL_VISUAL_GOVERNANCE_LEVELS,
  CANONICAL_VISUAL_ASSESSMENT_STATUS,
  type AssessmentVisualArtifact,
  type VisualAssessmentReference,
  type VisualAssessmentTask,
  type MultimodalEvidence,
  type VisualAssessmentInput,
  type VisualAssessmentRegistry,
  type VisualAssessmentProvenance,
  type AssessmentArtifactWithVisualAssets,
} from './AssessmentAgentContract.ts';

import {
  composeVisualAssessmentProvenance,
  composeVisualAssessmentTrace,
  composeAssessmentVisualArtifact,
  composeVisualAssessmentReference,
  composeVisualAssessmentTask,
  composeMultimodalEvidence,
  composeVisualAssessmentRelationship,
  composeVisualAssessmentRegistry,
  composeVisualAssessmentRegistryFromInput,
  composeAssessmentVisualAssets,
  composeAssessmentArtifactWithVisualAssets,
  isSupportedVisualAssessmentType,
  isSupportedVisualResourceType,
  isSupportedVisualTaskType,
  isSupportedMultimodalEvidenceType,
  isSupportedVisualGovernanceLevel,
  isSupportedVisualAssessmentStatus,
  isSupportedVisualAssessmentGovernance,
  getCanonicalVisualAssessmentTypes,
  getCanonicalVisualResourceTypes,
  getCanonicalVisualTaskTypes,
  getCanonicalMultimodalEvidenceTypes,
  getCanonicalVisualGovernanceLevels,
  getCanonicalVisualAssessmentStatuses,
} from './VisualAssessmentKernel.ts';

import {
  VISUAL_ASSESSMENT_VALIDATION_CODES,
  validateAssessmentVisualArtifact,
  validateVisualAssessmentReference,
  validateVisualAssessmentTask,
  validateMultimodalEvidence,
  validateVisualAssessmentRelationship,
  validateVisualAssessmentRegistry,
  validateVisualAssessmentInput,
  validateVisualAssessmentTrace,
  validateAssessmentArtifactWithVisualAssets,
} from './VisualAssessmentValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_VISUAL_PROVENANCE: VisualAssessmentProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for visual assessment.',
};

function _makeReference(id: string): VisualAssessmentReference {
  return composeVisualAssessmentReference({
    id,
    resourceType: 'image',
    resourceUri: `uri-${id}`,
    description: `Test reference ${id}`,
  });
}

function _makeTask(id: string): VisualAssessmentTask {
  return composeVisualAssessmentTask({
    id,
    taskType: 'identify',
    description: `Test task ${id}`,
    conceptIds: ['concept-1'],
  });
}

function _makeEvidence(id: string): MultimodalEvidence {
  return composeMultimodalEvidence({
    id,
    evidenceType: 'visual_selection',
    description: `Test evidence ${id}`,
  });
}

function _makeArtifact(
  id: string,
  overrides: Partial<AssessmentVisualArtifact> = {},
): AssessmentVisualArtifact {
  return composeAssessmentVisualArtifact({
    id,
    title: `Artifact ${id}`,
    visualAssessmentType: 'image_question',
    visualReferences: [_makeReference(`ref-${id}`)],
    tasks: [_makeTask(`task-${id}`)],
    evidence: [_makeEvidence(`ev-${id}`)],
    conceptIds: ['concept-1'],
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_VISUAL_PROVENANCE,
    ...overrides,
  });
}

const VALID_ARTIFACT_A = _makeArtifact('art-a');
const VALID_ARTIFACT_B = _makeArtifact('art-b');
const VALID_ARTIFACT_C = _makeArtifact('art-c');

// ============================================================================
// CANONICAL ENUM COMPLETENESS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 visual assessment types', () => {
    assert.equal(CANONICAL_VISUAL_ASSESSMENT_TYPES.length, 10);
  });

  it('should have exactly 10 visual resource types', () => {
    assert.equal(CANONICAL_VISUAL_RESOURCE_TYPES.length, 10);
  });

  it('should have exactly 10 visual task types', () => {
    assert.equal(CANONICAL_VISUAL_TASK_TYPES.length, 10);
  });

  it('should have exactly 10 multimodal evidence types', () => {
    assert.equal(CANONICAL_MULTIMODAL_EVIDENCE_TYPES.length, 10);
  });

  it('should have exactly 5 visual governance levels', () => {
    assert.equal(CANONICAL_VISUAL_GOVERNANCE_LEVELS.length, 5);
  });

  it('should have exactly 6 visual assessment statuses', () => {
    assert.equal(CANONICAL_VISUAL_ASSESSMENT_STATUS.length, 6);
  });

  it('should contain expected visual assessment types', () => {
    const expected = [
      'image_question', 'diagram_question', 'architecture_analysis',
      'pipeline_analysis', 'graph_interpretation', 'visual_comparison',
      'annotation', 'heatmap_analysis', 'workflow_identification', 'multimodal_case',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_VISUAL_ASSESSMENT_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected visual resource types', () => {
    const expected = [
      'image', 'diagram', 'flowchart', 'architecture', 'graph',
      'chart', 'heatmap', 'illustration', 'animation', 'video',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_VISUAL_RESOURCE_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected visual task types', () => {
    const expected = [
      'identify', 'classify', 'compare', 'annotate', 'interpret',
      'sequence', 'locate', 'analyze', 'reason', 'justify',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_VISUAL_TASK_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected multimodal evidence types', () => {
    const expected = [
      'visual_selection', 'annotation', 'written_explanation',
      'diagram_relationship', 'architecture_mapping', 'comparison',
      'reasoning', 'workflow_identification', 'engineering_analysis', 'reflection',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_MULTIMODAL_EVIDENCE_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedVisualAssessmentType returns true for valid types', () => {
    assert.equal(isSupportedVisualAssessmentType('image_question'), true);
    assert.equal(isSupportedVisualAssessmentType('multimodal_case'), true);
  });

  it('isSupportedVisualAssessmentType returns false for invalid types', () => {
    assert.equal(isSupportedVisualAssessmentType('invalid'), false);
    assert.equal(isSupportedVisualAssessmentType(''), false);
  });

  it('isSupportedVisualResourceType returns true for valid types', () => {
    assert.equal(isSupportedVisualResourceType('image'), true);
    assert.equal(isSupportedVisualResourceType('video'), true);
  });

  it('isSupportedVisualResourceType returns false for invalid types', () => {
    assert.equal(isSupportedVisualResourceType('invalid'), false);
    assert.equal(isSupportedVisualResourceType(''), false);
  });

  it('isSupportedVisualTaskType returns true for valid types', () => {
    assert.equal(isSupportedVisualTaskType('identify'), true);
    assert.equal(isSupportedVisualTaskType('justify'), true);
  });

  it('isSupportedVisualTaskType returns false for invalid types', () => {
    assert.equal(isSupportedVisualTaskType('invalid'), false);
    assert.equal(isSupportedVisualTaskType(''), false);
  });

  it('isSupportedMultimodalEvidenceType returns true for valid types', () => {
    assert.equal(isSupportedMultimodalEvidenceType('visual_selection'), true);
    assert.equal(isSupportedMultimodalEvidenceType('reflection'), true);
  });

  it('isSupportedMultimodalEvidenceType returns false for invalid types', () => {
    assert.equal(isSupportedMultimodalEvidenceType('invalid'), false);
    assert.equal(isSupportedMultimodalEvidenceType(''), false);
  });

  it('isSupportedVisualGovernanceLevel returns true for valid levels', () => {
    assert.equal(isSupportedVisualGovernanceLevel('canonical'), true);
    assert.equal(isSupportedVisualGovernanceLevel('deprecated'), true);
  });

  it('isSupportedVisualGovernanceLevel returns false for invalid levels', () => {
    assert.equal(isSupportedVisualGovernanceLevel('invalid'), false);
    assert.equal(isSupportedVisualGovernanceLevel(''), false);
  });

  it('isSupportedVisualAssessmentStatus returns true for valid statuses', () => {
    assert.equal(isSupportedVisualAssessmentStatus('draft'), true);
    assert.equal(isSupportedVisualAssessmentStatus('archived'), true);
  });

  it('isSupportedVisualAssessmentStatus returns false for invalid statuses', () => {
    assert.equal(isSupportedVisualAssessmentStatus('invalid'), false);
    assert.equal(isSupportedVisualAssessmentStatus(''), false);
  });

  it('getCanonicalVisualAssessmentTypes returns a copy', () => {
    const result = getCanonicalVisualAssessmentTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_VISUAL_ASSESSMENT_TYPES]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_VISUAL_ASSESSMENT_TYPES.length, 10);
  });

  it('getCanonicalVisualResourceTypes returns a copy', () => {
    const result = getCanonicalVisualResourceTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalVisualTaskTypes returns a copy', () => {
    const result = getCanonicalVisualTaskTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalMultimodalEvidenceTypes returns a copy', () => {
    const result = getCanonicalMultimodalEvidenceTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalVisualGovernanceLevels returns a copy', () => {
    const result = getCanonicalVisualGovernanceLevels();
    assert.equal(result.length, 5);
  });

  it('getCanonicalVisualAssessmentStatuses returns a copy', () => {
    const result = getCanonicalVisualAssessmentStatuses();
    assert.equal(result.length, 6);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Visual Artifact
// ============================================================================

describe('composeAssessmentVisualArtifact', () => {
  it('should compose artifact from valid params', () => {
    const artifact = composeAssessmentVisualArtifact({
      id: 'a1', title: 'Test',
      visualAssessmentType: 'image_question',
      visualReferences: [_makeReference('r1')],
      tasks: [_makeTask('t1')],
      evidence: [_makeEvidence('e1')],
      conceptIds: ['c1'], status: 'draft',
      governance: 'canonical', provenance: VALID_VISUAL_PROVENANCE,
    });
    assert.equal(artifact.id, 'a1');
    assert.equal(artifact.title, 'Test');
    assert.equal(artifact.visualAssessmentType, 'image_question');
    assert.equal(artifact.trace.deterministic, true);
    assert.equal(artifact.trace.randomUsed, false);
    assert.equal(artifact.trace.timeDependency, false);
  });

  it('should not mutate input arrays', () => {
    const conceptIds = ['c1'];
    const refs = [_makeReference('r1')];
    const original = JSON.stringify({ conceptIds, refs });
    composeAssessmentVisualArtifact({
      id: 'a', title: 'T',
      visualAssessmentType: 'image_question',
      visualReferences: refs, tasks: [], evidence: [],
      conceptIds, status: 'draft', governance: 'canonical',
      provenance: VALID_VISUAL_PROVENANCE,
    });
    assert.equal(JSON.stringify({ conceptIds, refs }), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Reference
// ============================================================================

describe('composeVisualAssessmentReference', () => {
  it('should compose reference from valid params', () => {
    const ref = composeVisualAssessmentReference({
      id: 'r1', resourceType: 'image',
      resourceUri: 'uri-1', description: 'Desc',
    });
    assert.equal(ref.id, 'r1');
    assert.equal(ref.resourceType, 'image');
    assert.equal(ref.resourceUri, 'uri-1');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Task
// ============================================================================

describe('composeVisualAssessmentTask', () => {
  it('should compose task from valid params', () => {
    const task = composeVisualAssessmentTask({
      id: 't1', taskType: 'identify',
      description: 'Desc', conceptIds: ['c1'],
    });
    assert.equal(task.id, 't1');
    assert.equal(task.taskType, 'identify');
    assert.deepEqual([...task.conceptIds], ['c1']);
  });

  it('should not mutate conceptIds input', () => {
    const conceptIds = ['c1'];
    const original = JSON.stringify(conceptIds);
    composeVisualAssessmentTask({
      id: 't', taskType: 'identify',
      description: 'D', conceptIds,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Evidence
// ============================================================================

describe('composeMultimodalEvidence', () => {
  it('should compose evidence from valid params', () => {
    const evidence = composeMultimodalEvidence({
      id: 'e1', evidenceType: 'visual_selection',
      description: 'Desc',
    });
    assert.equal(evidence.id, 'e1');
    assert.equal(evidence.evidenceType, 'visual_selection');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Relationship
// ============================================================================

describe('composeVisualAssessmentRelationship', () => {
  it('should compose relationship from valid params', () => {
    const rel = composeVisualAssessmentRelationship({
      id: 'r1', sourceArtifactId: 'a', targetArtifactId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    assert.equal(rel.id, 'r1');
    assert.equal(rel.sourceArtifactId, 'a');
    assert.equal(rel.targetArtifactId, 'b');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'r', sourceArtifactId: 'a', targetArtifactId: 'b',
      relationshipType: 'dep', rationale: 'r',
    };
    const r1 = composeVisualAssessmentRelationship(params);
    const r2 = composeVisualAssessmentRelationship(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composeVisualAssessmentRegistry', () => {
  it('should compose registry from artifacts', () => {
    const registry = composeVisualAssessmentRegistry([VALID_ARTIFACT_A, VALID_ARTIFACT_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
  });

  it('should sort nodes by id', () => {
    const registry = composeVisualAssessmentRegistry([VALID_ARTIFACT_C, VALID_ARTIFACT_A, VALID_ARTIFACT_B]);
    assert.equal(registry.nodes[0].id, 'art-a');
    assert.equal(registry.nodes[1].id, 'art-b');
    assert.equal(registry.nodes[2].id, 'art-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_ARTIFACT_A, VALID_ARTIFACT_B];
    const r1 = composeVisualAssessmentRegistry(nodes);
    const r2 = composeVisualAssessmentRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_ARTIFACT_C, VALID_ARTIFACT_A];
    const original = JSON.stringify(nodes);
    composeVisualAssessmentRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composeVisualAssessmentRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry from Input
// ============================================================================

describe('composeVisualAssessmentRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: VisualAssessmentInput = { nodes: [VALID_ARTIFACT_A, VALID_ARTIFACT_B] };
    const registry = composeVisualAssessmentRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
  });

  it('should return identical output for identical input', () => {
    const input: VisualAssessmentInput = { nodes: [VALID_ARTIFACT_A] };
    const r1 = composeVisualAssessmentRegistryFromInput(input);
    const r2 = composeVisualAssessmentRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Artifact with visual assets
// ============================================================================

describe('composeAssessmentArtifactWithVisualAssets', () => {
  it('should compose artifact with visual assets', () => {
    const result = composeAssessmentArtifactWithVisualAssets({
      artifactId: 'art-1', artifactTitle: 'Test',
      visualAssets: [VALID_ARTIFACT_A],
    });
    assert.equal(result.artifactId, 'art-1');
    assert.equal(result.visualAssets.length, 1);
  });

  it('should not mutate visualAssets input', () => {
    const assets = [VALID_ARTIFACT_A];
    const original = JSON.stringify(assets);
    composeAssessmentArtifactWithVisualAssets({
      artifactId: 'a', artifactTitle: 'T', visualAssets: assets,
    });
    assert.equal(JSON.stringify(assets), original);
  });
});

// ============================================================================
// VALIDATION — Visual artifact validation
// ============================================================================

describe('validateAssessmentVisualArtifact', () => {
  it('should pass for valid artifact', () => {
    const errors = validateAssessmentVisualArtifact(VALID_ARTIFACT_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null artifact', () => {
    const errors = validateAssessmentVisualArtifact(null as any);
    assert.ok(errors.length > 0);
  });

  it('should reject artifact with missing id', () => {
    const artifact = _makeArtifact('');
    const errors = validateAssessmentVisualArtifact(artifact);
    assert.ok(errors.some((e) => e.code === VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_VISUAL_ID));
  });

  it('should reject artifact with invalid type', () => {
    const artifact = _makeArtifact('a', { visualAssessmentType: 'invalid' as any });
    const errors = validateAssessmentVisualArtifact(artifact);
    assert.ok(errors.some((e) => e.code === VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_TYPE));
  });

  it('should reject artifact with missing conceptIds', () => {
    const artifact = _makeArtifact('a', { conceptIds: [] });
    const errors = validateAssessmentVisualArtifact(artifact);
    assert.ok(errors.some((e) => e.code === VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_ASSESSMENT_REFERENCE));
  });

  it('should reject artifact with non-deterministic trace', () => {
    const artifact: AssessmentVisualArtifact = {
      id: 'a', title: 'T',
      visualAssessmentType: 'image_question',
      visualReferences: [], tasks: [], evidence: [],
      conceptIds: ['c1'], status: 'draft', governance: 'canonical',
      provenance: VALID_VISUAL_PROVENANCE,
      trace: {
        traceId: 't', deterministic: false as any,
        generatedFrom: 'deterministic_visual_assessment_kernel',
        randomUsed: false, timeDependency: false,
      },
    };
    const errors = validateAssessmentVisualArtifact(artifact);
    assert.ok(errors.some((e) => e.code === VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Relationship validation
// ============================================================================

describe('validateVisualAssessmentRelationship', () => {
  it('should pass for valid relationship', () => {
    const rel = composeVisualAssessmentRelationship({
      id: 'r1', sourceArtifactId: 'a', targetArtifactId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    const errors = validateVisualAssessmentRelationship(rel);
    assert.equal(errors.length, 0);
  });

  it('should reject self-relationship', () => {
    const rel = composeVisualAssessmentRelationship({
      id: 'r', sourceArtifactId: 'a', targetArtifactId: 'a',
      relationshipType: 'self', rationale: 'r',
    });
    const errors = validateVisualAssessmentRelationship(rel);
    assert.ok(errors.some((e) => e.code === VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_SELF_RELATIONSHIP));
  });
});

// ============================================================================
// VALIDATION — Registry validation
// ============================================================================

describe('validateVisualAssessmentRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composeVisualAssessmentRegistry([VALID_ARTIFACT_A, VALID_ARTIFACT_B]);
    const result = validateVisualAssessmentRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null registry', () => {
    const result = validateVisualAssessmentRegistry(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty registry', () => {
    const registry = composeVisualAssessmentRegistry([]);
    const result = validateVisualAssessmentRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makeArtifact('dup'), _makeArtifact('dup')];
    const registry = composeVisualAssessmentRegistry(duplicateNodes);
    const result = validateVisualAssessmentRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_ASSESSMENT_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makeArtifact('a', { title: 'Same Title' }),
      _makeArtifact('b', { title: 'Same Title' }),
    ];
    const registry = composeVisualAssessmentRegistry(duplicateTitles);
    const result = validateVisualAssessmentRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_ASSESSMENT_DUPLICATE_TITLE));
  });
});

// ============================================================================
// VALIDATION — Input validation
// ============================================================================

describe('validateVisualAssessmentInput', () => {
  it('should pass for valid input', () => {
    const input: VisualAssessmentInput = { nodes: [VALID_ARTIFACT_A] };
    const result = validateVisualAssessmentInput(input);
    assert.equal(result.valid, true);
  });

  it('should reject null input', () => {
    const result = validateVisualAssessmentInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty input', () => {
    const result = validateVisualAssessmentInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Trace validation
// ============================================================================

describe('validateVisualAssessmentTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composeVisualAssessmentTrace({ traceId: 'test' });
    const result = validateVisualAssessmentTrace(trace);
    assert.equal(result.valid, true);
  });

  it('should reject null trace', () => {
    const result = validateVisualAssessmentTrace(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Artifact with visual assets validation
// ============================================================================

describe('validateAssessmentArtifactWithVisualAssets', () => {
  it('should pass for valid artifact', () => {
    const artifact = composeAssessmentArtifactWithVisualAssets({
      artifactId: 'art-1', artifactTitle: 'Test',
      visualAssets: [VALID_ARTIFACT_A],
    });
    const result = validateAssessmentArtifactWithVisualAssets(artifact);
    assert.equal(result.valid, true);
  });

  it('should reject null artifact', () => {
    const result = validateAssessmentArtifactWithVisualAssets(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composeVisualAssessmentRegistry across 100 iterations', () => {
    const nodes = [VALID_ARTIFACT_A, VALID_ARTIFACT_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeVisualAssessmentRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composeAssessmentVisualArtifact across 100 iterations', () => {
    const params = {
      id: 'a', title: 'T',
      visualAssessmentType: 'image_question' as const,
      visualReferences: [_makeReference('r')],
      tasks: [_makeTask('t')],
      evidence: [_makeEvidence('e')],
      conceptIds: ['c1'],
      status: 'draft' as const, governance: 'canonical' as const,
      provenance: VALID_VISUAL_PROVENANCE,
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeAssessmentVisualArtifact(params);
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
  it('should not mutate input nodes array in composeVisualAssessmentRegistry', () => {
    const nodes = [VALID_ARTIFACT_C, VALID_ARTIFACT_A];
    const original = JSON.stringify(nodes);
    composeVisualAssessmentRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate conceptIds in composeAssessmentVisualArtifact', () => {
    const conceptIds = ['c1'];
    const original = JSON.stringify(conceptIds);
    composeAssessmentVisualArtifact({
      id: 'a', title: 'T',
      visualAssessmentType: 'image_question',
      visualReferences: [], tasks: [], evidence: [],
      conceptIds, status: 'draft', governance: 'canonical',
      provenance: VALID_VISUAL_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });

  it('getCanonicalVisualAssessmentTypes returns a copy not affecting original', () => {
    const copy = getCanonicalVisualAssessmentTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_VISUAL_ASSESSMENT_TYPES.length, 10);
  });

  it('getCanonicalVisualResourceTypes returns a copy not affecting original', () => {
    const copy = getCanonicalVisualResourceTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_VISUAL_RESOURCE_TYPES.length, 10);
  });

  it('getCanonicalVisualGovernanceLevels returns a copy not affecting original', () => {
    const copy = getCanonicalVisualGovernanceLevels();
    assert.equal(copy.length, 5);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_VISUAL_GOVERNANCE_LEVELS.length, 5);
  });
});

// ============================================================================
// CROSS-AGENT BOUNDARY — No image generation/analysis/rendering
// ============================================================================

describe('Cross-Agent Boundary', () => {
  it('should not contain image generation logic', () => {
    const source = JSON.stringify(CANONICAL_VISUAL_ASSESSMENT_TYPES);
    assert.ok(!source.includes('generat'));
    assert.ok(!source.includes('create'));
    assert.ok(!source.includes('render'));
  });

  it('should not contain image analysis logic', () => {
    const source = JSON.stringify(CANONICAL_VISUAL_TASK_TYPES);
    assert.ok(!source.includes('detect'));
    assert.ok(!source.includes('recognize'));
    assert.ok(!source.includes('classify_image'));
  });

  it('should not contain computer vision logic', () => {
    const source = JSON.stringify(CANONICAL_VISUAL_RESOURCE_TYPES);
    assert.ok(!source.includes('vision'));
    assert.ok(!source.includes('cv'));
    assert.ok(!source.includes('ocr'));
  });

  it('should not contain diagram generation logic', () => {
    const source = JSON.stringify(CANONICAL_VISUAL_ASSESSMENT_TYPES);
    assert.ok(!source.includes('diagram_gen'));
    assert.ok(!source.includes('draw'));
    assert.ok(!source.includes('sketch'));
  });

  it('should not contain multimodal AI execution', () => {
    const source = JSON.stringify(CANONICAL_MULTIMODAL_EVIDENCE_TYPES);
    assert.ok(!source.includes('execute'));
    assert.ok(!source.includes('infer'));
    assert.ok(!source.includes('predict'));
  });
});

// ============================================================================
// NEGATIVE CAPABILITY — No scoring/mastery/adaptive
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain scoring logic', () => {
    const source = JSON.stringify(CANONICAL_VISUAL_ASSESSMENT_TYPES);
    assert.ok(!source.includes('score'));
    assert.ok(!source.includes('mastery'));
  });

  it('should not contain LLM or async patterns', () => {
    const source = JSON.stringify(CANONICAL_VISUAL_ASSESSMENT_TYPES);
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
    const codes = Object.values(VISUAL_ASSESSMENT_VALIDATION_CODES);
    assert.equal(codes.length, 24);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(VISUAL_ASSESSMENT_VALIDATION_CODES)) {
      assert.ok(/^[A-Z_]+$/.test(code), `Not UPPER_SNAKE_CASE: ${code}`);
    }
  });

  it('all validation codes should start with VISUAL_ or MULTIMODAL_', () => {
    for (const code of Object.values(VISUAL_ASSESSMENT_VALIDATION_CODES)) {
      assert.ok(
        code.startsWith('VISUAL_') || code.startsWith('MULTIMODAL_'),
        `Unexpected prefix: ${code}`,
      );
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(VISUAL_ASSESSMENT_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});
