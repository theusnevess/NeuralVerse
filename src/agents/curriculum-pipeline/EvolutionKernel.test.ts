/**
 * NV-1500-D3-OPT-08 — Curriculum Evolution & Version Governance Kernel Tests
 *
 * Deterministic test suite for the Curriculum Evolution & Version Governance Kernel.
 * Every test is deterministic and reproducible.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CurriculumVersion,
  CurriculumLifecycleRecord,
  CurriculumEvolutionRecord,
  CurriculumEvolutionRegistry,
  CurriculumEvolutionInput,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_CURRICULUM_VERSION_TYPES,
  CANONICAL_CURRICULUM_LIFECYCLE,
  CANONICAL_EVOLUTION_RELATIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

import {
  composeCurriculumVersion,
  composeLifecycleRecord,
  composeEvolutionRecord,
  composeEvolutionRegistry,
  composeEvolutionTrace,
  composeEvolutionProvenance,
  composeCurriculumEvolution,
  composeCurriculumArtifactWithEvolution,
  isSupportedVersionType,
  isSupportedLifecycleState,
  isSupportedEvolutionRelation,
  isSupportedEvolutionGovernanceStatus,
  getCanonicalVersionTypes,
  getCanonicalLifecycleStates,
  getCanonicalEvolutionRelations,
} from './EvolutionKernel.ts';

import {
  validateCurriculumVersion,
  validateLifecycleRecord,
  validateEvolutionRecord,
  validateEvolutionRegistry,
  validateCurriculumArtifactWithEvolution,
  validateEvolutionInput,
  EVOLUTION_VALIDATION_CODES,
} from './EvolutionValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_VERSION_V1: CurriculumVersion = {
  versionId: 'version-001',
  versionType: 'major',
  versionNumber: '1.0.0',
  lifecycleState: 'active',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Initial version of the curriculum.',
  providedBy: 'curriculum-board',
};

const VALID_VERSION_V2: CurriculumVersion = {
  versionId: 'version-002',
  versionType: 'minor',
  versionNumber: '1.1.0',
  lifecycleState: 'superseded',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Minor update to the curriculum.',
  providedBy: 'curriculum-board',
};

const VALID_VERSION_V3: CurriculumVersion = {
  versionId: 'version-003',
  versionType: 'patch',
  versionNumber: '1.0.1',
  lifecycleState: 'deprecated',
  source: 'governance-committee',
  governanceStatus: 'accepted',
  rationale: 'Patch update.',
  providedBy: 'curriculum-board',
};

const VALID_VERSION_EXPERIMENTAL: CurriculumVersion = {
  versionId: 'version-exp-001',
  versionType: 'experimental',
  versionNumber: '2.0.0-exp',
  lifecycleState: 'draft',
  source: 'research-committee',
  governanceStatus: 'provisional',
  rationale: 'Experimental version for testing.',
  providedBy: 'research-board',
};

const VALID_VERSION_LEGACY: CurriculumVersion = {
  versionId: 'version-legacy-001',
  versionType: 'legacy',
  versionNumber: '0.9.0',
  lifecycleState: 'retired',
  source: 'governance-committee',
  governanceStatus: 'deprecated',
  rationale: 'Legacy version.',
  providedBy: 'curriculum-board',
};

const VALID_VERSION_REJECTED: CurriculumVersion = {
  versionId: 'version-rejected-001',
  versionType: 'candidate',
  versionNumber: '1.2.0',
  lifecycleState: 'rejected',
  source: 'governance-committee',
  governanceStatus: 'rejected',
  rationale: 'Rejected candidate version.',
  providedBy: 'curriculum-board',
};

const VALID_LIFECYCLE_1: CurriculumLifecycleRecord = {
  lifecycleId: 'lifecycle-001',
  versionId: 'version-001',
  previousState: null,
  newState: 'draft',
  transitionReason: 'Initial creation.',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Version created.',
  providedBy: 'curriculum-board',
};

const VALID_LIFECYCLE_2: CurriculumLifecycleRecord = {
  lifecycleId: 'lifecycle-002',
  versionId: 'version-001',
  previousState: 'draft',
  newState: 'active',
  transitionReason: 'Approved by board.',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Version activated.',
  providedBy: 'curriculum-board',
};

const VALID_EVOLUTION_1: CurriculumEvolutionRecord = {
  relationId: 'relation-001',
  sourceVersionId: 'version-001',
  targetVersionId: 'version-002',
  relationType: 'supersedes',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Version 2 supersedes version 1.',
  providedBy: 'curriculum-board',
};

const VALID_EVOLUTION_2: CurriculumEvolutionRecord = {
  relationId: 'relation-002',
  sourceVersionId: 'version-legacy-001',
  targetVersionId: 'version-001',
  relationType: 'derived_from',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Version 1 derived from legacy version.',
  providedBy: 'curriculum-board',
};

// ---------------------------------------------------------------------------
// Valid Version Composition Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Valid Version Composition', () => {
  it('should compose a valid version', () => {
    const version = composeCurriculumVersion(VALID_VERSION_V1);
    assert.strictEqual(version.versionId, 'version-001');
    assert.strictEqual(version.versionType, 'major');
    assert.strictEqual(version.versionNumber, '1.0.0');
    assert.strictEqual(version.lifecycleState, 'active');
  });

  it('should validate a valid version with no errors', () => {
    const errors = validateCurriculumVersion(VALID_VERSION_V1, []);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Valid Lifecycle Record Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Valid Lifecycle Record', () => {
  it('should compose a valid lifecycle record', () => {
    const record = composeLifecycleRecord(VALID_LIFECYCLE_1);
    assert.strictEqual(record.lifecycleId, 'lifecycle-001');
    assert.strictEqual(record.versionId, 'version-001');
    assert.strictEqual(record.previousState, null);
    assert.strictEqual(record.newState, 'draft');
  });

  it('should validate a valid lifecycle record with no errors', () => {
    const errors = validateLifecycleRecord(VALID_LIFECYCLE_1, [], ['version-001']);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Valid Evolution Record Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Valid Evolution Record', () => {
  it('should compose a valid evolution record', () => {
    const record = composeEvolutionRecord(VALID_EVOLUTION_1);
    assert.strictEqual(record.relationId, 'relation-001');
    assert.strictEqual(record.sourceVersionId, 'version-001');
    assert.strictEqual(record.targetVersionId, 'version-002');
    assert.strictEqual(record.relationType, 'supersedes');
  });

  it('should validate a valid evolution record with no errors', () => {
    const errors = validateEvolutionRecord(VALID_EVOLUTION_1, [], ['version-001', 'version-002']);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Valid Registry Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Valid Registry', () => {
  it('should compose a valid registry', () => {
    const registry = composeEvolutionRegistry({
      registryId: 'reg-001',
      versions: [VALID_VERSION_V1, VALID_VERSION_V2],
      lifecycleRecords: [VALID_LIFECYCLE_1],
      evolutionRecords: [VALID_EVOLUTION_1],
    });
    assert.strictEqual(registry.registryId, 'reg-001');
    assert.strictEqual(registry.versionCount, 2);
    assert.strictEqual(registry.lifecycleCount, 1);
    assert.strictEqual(registry.evolutionCount, 1);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeEvolutionRegistry({
      registryId: 'reg-001',
      versions: [VALID_VERSION_V1, VALID_VERSION_V2],
      lifecycleRecords: [VALID_LIFECYCLE_1],
      evolutionRecords: [VALID_EVOLUTION_1],
    });
    const result = validateEvolutionRegistry(registry);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
    assert.strictEqual(result.checkedAt, 'curriculum_evolution_version_governance');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Version Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Duplicate Version', () => {
  it('should detect duplicate version IDs', () => {
    const registry = composeEvolutionRegistry({
      registryId: 'reg-dup',
      versions: [
        VALID_VERSION_V1,
        { ...VALID_VERSION_V1, versionType: 'minor', versionNumber: '1.0.1' },
      ],
      lifecycleRecords: [],
      evolutionRecords: [],
    });
    const result = validateEvolutionRegistry(registry);
    assert.strictEqual(result.valid, false);
    const dupError = result.errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_VERSION,
    );
    assert.ok(dupError, 'Should have EVOLUTION_DUPLICATE_VERSION error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Relation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Duplicate Relation', () => {
  it('should detect duplicate evolution relation IDs', () => {
    const registry = composeEvolutionRegistry({
      registryId: 'reg-dup-rel',
      versions: [VALID_VERSION_V1, VALID_VERSION_V2],
      lifecycleRecords: [],
      evolutionRecords: [
        VALID_EVOLUTION_1,
        { ...VALID_EVOLUTION_1, relationType: 'derived_from' },
      ],
    });
    const result = validateEvolutionRegistry(registry);
    assert.strictEqual(result.valid, false);
    const dupError = result.errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_RELATION,
    );
    assert.ok(dupError, 'Should have EVOLUTION_DUPLICATE_RELATION error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Version Type Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Unsupported Version Type', () => {
  it('should detect unsupported version type', () => {
    const version = {
      ...VALID_VERSION_V1,
      versionType: 'invalid_type' as any,
    };
    const errors = validateCurriculumVersion(version, []);
    const typeError = errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_UNKNOWN_VERSION,
    );
    assert.ok(typeError, 'Should have EVOLUTION_UNKNOWN_VERSION error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Lifecycle State Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Unsupported Lifecycle State', () => {
  it('should detect unsupported lifecycle state', () => {
    const version = {
      ...VALID_VERSION_V1,
      lifecycleState: 'invalid_state' as any,
    };
    const errors = validateCurriculumVersion(version, []);
    const stateError = errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_UNKNOWN_STATE,
    );
    assert.ok(stateError, 'Should have EVOLUTION_UNKNOWN_STATE error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Relation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Unsupported Relation', () => {
  it('should detect unsupported evolution relation', () => {
    const record = {
      ...VALID_EVOLUTION_1,
      relationType: 'invalid_relation' as any,
    };
    const errors = validateEvolutionRecord(record, [], ['version-001', 'version-002']);
    const relError = errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_UNKNOWN_RELATION,
    );
    assert.ok(relError, 'Should have EVOLUTION_UNKNOWN_RELATION error');
  });
});

// ---------------------------------------------------------------------------
// Self Reference Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Self Reference', () => {
  it('should detect self-referencing evolution record', () => {
    const record: CurriculumEvolutionRecord = {
      relationId: 'relation-self',
      sourceVersionId: 'version-001',
      targetVersionId: 'version-001',
      relationType: 'supersedes',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Self-reference test.',
      providedBy: 'curriculum-board',
    };
    const errors = validateEvolutionRecord(record, [], ['version-001']);
    const selfRefError = errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_SELF_REFERENCE,
    );
    assert.ok(selfRefError, 'Should have EVOLUTION_SELF_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Successor Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Invalid Successor', () => {
  it('should detect invalid reference to non-existent version', () => {
    const record: CurriculumEvolutionRecord = {
      relationId: 'relation-invalid',
      sourceVersionId: 'version-001',
      targetVersionId: 'version-999',
      relationType: 'supersedes',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Invalid successor test.',
      providedBy: 'curriculum-board',
    };
    const errors = validateEvolutionRecord(record, [], ['version-001']);
    const refError = errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_REFERENCE,
    );
    assert.ok(refError, 'Should have EVOLUTION_INVALID_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Multiple Active Versions Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Multiple Active Versions', () => {
  it('should detect multiple active versions', () => {
    const registry = composeEvolutionRegistry({
      registryId: 'reg-multi-active',
      versions: [
        { ...VALID_VERSION_V1, lifecycleState: 'active' },
        { ...VALID_VERSION_V2, lifecycleState: 'active' },
      ],
      lifecycleRecords: [],
      evolutionRecords: [],
    });
    const result = validateEvolutionRegistry(registry);
    assert.strictEqual(result.valid, false);
    const multiActiveError = result.errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_MULTIPLE_ACTIVE,
    );
    assert.ok(multiActiveError, 'Should have EVOLUTION_MULTIPLE_ACTIVE error');
  });
});

// ---------------------------------------------------------------------------
// Retired Successor Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Retired Successor', () => {
  it('should detect retired version with supersedes relation', () => {
    const registry = composeEvolutionRegistry({
      registryId: 'reg-retired',
      versions: [
        VALID_VERSION_LEGACY,
        { ...VALID_VERSION_V1, lifecycleState: 'active' },
      ],
      lifecycleRecords: [],
      evolutionRecords: [
        {
          ...VALID_EVOLUTION_1,
          sourceVersionId: 'version-legacy-001',
          targetVersionId: 'version-001',
          relationType: 'supersedes',
        },
      ],
    });
    const result = validateEvolutionRegistry(registry);
    assert.strictEqual(result.valid, false);
    const retiredError = result.errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_RETIRED_HAS_SUCCESSOR,
    );
    assert.ok(retiredError, 'Should have EVOLUTION_RETIRED_HAS_SUCCESSOR error');
  });
});

// ---------------------------------------------------------------------------
// Rejected Relation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Rejected Relation', () => {
  it('should detect rejected version with outgoing relation', () => {
    const registry = composeEvolutionRegistry({
      registryId: 'reg-rejected',
      versions: [
        VALID_VERSION_REJECTED,
        { ...VALID_VERSION_V1, lifecycleState: 'active' },
      ],
      lifecycleRecords: [],
      evolutionRecords: [
        {
          ...VALID_EVOLUTION_1,
          sourceVersionId: 'version-rejected-001',
          targetVersionId: 'version-001',
          relationType: 'supersedes',
        },
      ],
    });
    const result = validateEvolutionRegistry(registry);
    assert.strictEqual(result.valid, false);
    const rejectedError = result.errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_REJECTED_HAS_RELATION,
    );
    assert.ok(rejectedError, 'Should have EVOLUTION_REJECTED_HAS_RELATION error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Missing Provenance', () => {
  it('should detect missing source', () => {
    const version = { ...VALID_VERSION_V1, source: '' };
    const errors = validateCurriculumVersion(version, []);
    const sourceError = errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
    );
    assert.ok(sourceError, 'Should have EVOLUTION_MISSING_SOURCE error');
  });

  it('should detect missing rationale', () => {
    const version = { ...VALID_VERSION_V1, rationale: '' };
    const errors = validateCurriculumVersion(version, []);
    const rationaleError = errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have EVOLUTION_MISSING_RATIONALE error');
  });

  it('should detect missing providedBy', () => {
    const version = { ...VALID_VERSION_V1, providedBy: '' };
    const errors = validateCurriculumVersion(version, []);
    const providedByError = errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVIDED_BY,
    );
    assert.ok(providedByError, 'Should have EVOLUTION_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Missing Source', () => {
  it('should detect missing source in version', () => {
    const version = { ...VALID_VERSION_V1, source: '' };
    const errors = validateCurriculumVersion(version, []);
    const sourceError = errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
    );
    assert.ok(sourceError, 'Should have EVOLUTION_MISSING_SOURCE error');
  });

  it('should detect missing source in evolution record', () => {
    const record = { ...VALID_EVOLUTION_1, source: '' };
    const errors = validateEvolutionRecord(record, [], ['version-001', 'version-002']);
    const sourceError = errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
    );
    assert.ok(sourceError, 'Should have EVOLUTION_MISSING_SOURCE error');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Empty Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeEvolutionRegistry({
      registryId: 'reg-empty',
      versions: [],
      lifecycleRecords: [],
      evolutionRecords: [],
    });
    const result = validateEvolutionRegistry(registry);
    assert.strictEqual(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have EVOLUTION_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Deterministic Ordering', () => {
  it('should sort versions by versionId', () => {
    const input: CurriculumEvolutionInput = {
      registryId: 'reg-sort',
      versions: [
        { ...VALID_VERSION_V2, versionId: 'version-b' },
        { ...VALID_VERSION_V1, versionId: 'version-a' },
      ],
      lifecycleRecords: [],
      evolutionRecords: [],
    };
    const registry = composeCurriculumEvolution(input);
    assert.strictEqual(registry.versions[0].versionId, 'version-a');
    assert.strictEqual(registry.versions[1].versionId, 'version-b');
  });

  it('should sort evolution records by sourceVersionId', () => {
    const input: CurriculumEvolutionInput = {
      registryId: 'reg-sort-evo',
      versions: [VALID_VERSION_V1, VALID_VERSION_V2, VALID_VERSION_V3],
      lifecycleRecords: [],
      evolutionRecords: [
        {
          ...VALID_EVOLUTION_1,
          sourceVersionId: 'version-003',
          targetVersionId: 'version-001',
          relationType: 'replaces',
        },
        VALID_EVOLUTION_1,
      ],
    };
    const registry = composeCurriculumEvolution(input);
    assert.strictEqual(registry.evolutionRecords[0].sourceVersionId, 'version-001');
    assert.strictEqual(registry.evolutionRecords[1].sourceVersionId, 'version-003');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Immutable Input', () => {
  it('should not mutate input versions', () => {
    const versions = [VALID_VERSION_V1];
    const original = [...versions];
    composeCurriculumEvolution({
      registryId: 'reg-immutable',
      versions,
      lifecycleRecords: [],
      evolutionRecords: [],
    });
    assert.deepStrictEqual(versions, original);
  });

  it('should not mutate input evolution records', () => {
    const records = [VALID_EVOLUTION_1];
    const original = [...records];
    composeCurriculumEvolution({
      registryId: 'reg-immutable-evo',
      versions: [VALID_VERSION_V1, VALID_VERSION_V2],
      lifecycleRecords: [],
      evolutionRecords: records,
    });
    assert.deepStrictEqual(records, original);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Identical Output', () => {
  it('should produce identical output for identical input', () => {
    const input: CurriculumEvolutionInput = {
      registryId: 'reg-identical',
      versions: [VALID_VERSION_V1],
      lifecycleRecords: [VALID_LIFECYCLE_1],
      evolutionRecords: [],
    };
    const reg1 = composeCurriculumEvolution(input);
    const reg2 = composeCurriculumEvolution(input);
    assert.deepStrictEqual(reg1, reg2);
  });

  it('should produce identical output across 100 iterations', () => {
    const input: CurriculumEvolutionInput = {
      registryId: 'reg-100',
      versions: [VALID_VERSION_V1, VALID_VERSION_V2],
      lifecycleRecords: [VALID_LIFECYCLE_1],
      evolutionRecords: [VALID_EVOLUTION_1],
    };
    const reg1 = composeCurriculumEvolution(input);
    for (let i = 0; i < 99; i++) {
      const reg = composeCurriculumEvolution(input);
      assert.deepStrictEqual(reg, reg1);
    }
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Helper Functions', () => {
  it('isSupportedVersionType should return true for valid types', () => {
    for (const type of CANONICAL_CURRICULUM_VERSION_TYPES) {
      assert.strictEqual(isSupportedVersionType(type), true);
    }
  });

  it('isSupportedVersionType should return false for invalid types', () => {
    assert.strictEqual(isSupportedVersionType('invalid'), false);
    assert.strictEqual(isSupportedVersionType(''), false);
  });

  it('isSupportedLifecycleState should return true for valid states', () => {
    for (const state of CANONICAL_CURRICULUM_LIFECYCLE) {
      assert.strictEqual(isSupportedLifecycleState(state), true);
    }
  });

  it('isSupportedLifecycleState should return false for invalid states', () => {
    assert.strictEqual(isSupportedLifecycleState('invalid'), false);
    assert.strictEqual(isSupportedLifecycleState(''), false);
  });

  it('isSupportedEvolutionRelation should return true for valid relations', () => {
    for (const relation of CANONICAL_EVOLUTION_RELATIONS) {
      assert.strictEqual(isSupportedEvolutionRelation(relation), true);
    }
  });

  it('isSupportedEvolutionRelation should return false for invalid relations', () => {
    assert.strictEqual(isSupportedEvolutionRelation('invalid'), false);
    assert.strictEqual(isSupportedEvolutionRelation(''), false);
  });

  it('isSupportedEvolutionGovernanceStatus should return true for valid statuses', () => {
    for (const status of CANONICAL_GOVERNANCE_STATUSES) {
      assert.strictEqual(isSupportedEvolutionGovernanceStatus(status), true);
    }
  });

  it('isSupportedEvolutionGovernanceStatus should return false for invalid statuses', () => {
    assert.strictEqual(isSupportedEvolutionGovernanceStatus('invalid'), false);
    assert.strictEqual(isSupportedEvolutionGovernanceStatus(''), false);
  });

  it('getCanonicalVersionTypes should return all canonical types', () => {
    const types = getCanonicalVersionTypes();
    assert.strictEqual(types.length, 10);
    assert.deepStrictEqual(types, CANONICAL_CURRICULUM_VERSION_TYPES);
  });

  it('getCanonicalLifecycleStates should return all canonical states', () => {
    const states = getCanonicalLifecycleStates();
    assert.strictEqual(states.length, 10);
    assert.deepStrictEqual(states, CANONICAL_CURRICULUM_LIFECYCLE);
  });

  it('getCanonicalEvolutionRelations should return all canonical relations', () => {
    const relations = getCanonicalEvolutionRelations();
    assert.strictEqual(relations.length, 10);
    assert.deepStrictEqual(relations, CANONICAL_EVOLUTION_RELATIONS);
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Registry Validation', () => {
  it('should validate a valid registry', () => {
    const registry = composeEvolutionRegistry({
      registryId: 'reg-valid',
      versions: [VALID_VERSION_V1],
      lifecycleRecords: [],
      evolutionRecords: [],
    });
    const result = validateEvolutionRegistry(registry);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

// ---------------------------------------------------------------------------
// Artifact Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Artifact Validation', () => {
  it('should compose and validate a valid artifact', () => {
    const registry = composeEvolutionRegistry({
      registryId: 'reg-artifact',
      versions: [VALID_VERSION_V1],
      lifecycleRecords: [],
      evolutionRecords: [],
    });
    const trace = composeEvolutionTrace('reg-artifact', [VALID_VERSION_V1], [], []);
    const artifact = composeCurriculumArtifactWithEvolution({
      artifactId: 'artifact-001',
      evolutionRegistry: registry,
      evolutionTrace: trace,
      validation: {
        valid: true,
        errors: [],
        checkedAt: 'curriculum_evolution_version_governance',
      },
    });
    const result = validateCurriculumArtifactWithEvolution(artifact);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Trace Validation', () => {
  it('should compose a trace with correct counts', () => {
    const trace = composeEvolutionTrace(
      'reg-trace',
      [VALID_VERSION_V1, VALID_VERSION_V2],
      [VALID_LIFECYCLE_1],
      [VALID_EVOLUTION_1],
    );
    assert.strictEqual(trace.versionCount, 2);
    assert.strictEqual(trace.lifecycleCount, 1);
    assert.strictEqual(trace.evolutionCount, 1);
    assert.strictEqual(trace.decisionsCount, 4);
    assert.strictEqual(trace.validatedCount, 4);
    assert.strictEqual(trace.invalidCount, 0);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
    assert.strictEqual(trace.curriculumMutated, false);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Provenance', () => {
  it('should compose evolution provenance', () => {
    const registry = composeEvolutionRegistry({
      registryId: 'reg-provenance',
      versions: [VALID_VERSION_V1],
      lifecycleRecords: [],
      evolutionRecords: [],
    });
    const provenance = composeEvolutionProvenance(registry);
    assert.strictEqual(provenance.registryId, 'reg-provenance');
    assert.strictEqual(provenance.source, 'curriculum-evolution-kernel');
    assert.strictEqual(provenance.governanceStatus, 'canonical');
    assert.strictEqual(provenance.providedBy, 'curriculum-board');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Metadata Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Deterministic Metadata', () => {
  it('registry should have deterministic metadata', () => {
    const registry = composeEvolutionRegistry({
      registryId: 'reg-meta',
      versions: [],
      lifecycleRecords: [],
      evolutionRecords: [],
    });
    assert.strictEqual(registry.deterministic, true);
    assert.strictEqual(registry.randomUsed, false);
    assert.strictEqual(registry.timeDependency, false);
  });

  it('trace should have deterministic metadata', () => {
    const trace = composeEvolutionTrace('reg-meta', [], [], []);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
    assert.strictEqual(trace.curriculumMutated, false);
  });
});

// ---------------------------------------------------------------------------
// Input Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Input Validation', () => {
  it('should validate valid input with no errors', () => {
    const input: CurriculumEvolutionInput = {
      registryId: 'reg-input',
      versions: [VALID_VERSION_V1],
      lifecycleRecords: [VALID_LIFECYCLE_1],
      evolutionRecords: [],
    };
    const errors = validateEvolutionInput(input);
    assert.deepStrictEqual(errors, []);
  });

  it('should detect missing registry ID', () => {
    const input: CurriculumEvolutionInput = {
      registryId: '',
      versions: [],
      lifecycleRecords: [],
      evolutionRecords: [],
    };
    const errors = validateEvolutionInput(input);
    const idError = errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_REGISTRY_ID,
    );
    assert.ok(idError, 'Should have EVOLUTION_MISSING_REGISTRY_ID error');
  });

  it('should detect empty versions in input', () => {
    const input: CurriculumEvolutionInput = {
      registryId: 'reg-001',
      versions: [],
      lifecycleRecords: [],
      evolutionRecords: [],
    };
    const errors = validateEvolutionInput(input);
    const emptyError = errors.find(
      (e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have EVOLUTION_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 canonical version types', () => {
    assert.strictEqual(CANONICAL_CURRICULUM_VERSION_TYPES.length, 10);
  });

  it('should have exactly 10 canonical lifecycle states', () => {
    assert.strictEqual(CANONICAL_CURRICULUM_LIFECYCLE.length, 10);
  });

  it('should have exactly 10 canonical evolution relations', () => {
    assert.strictEqual(CANONICAL_EVOLUTION_RELATIONS.length, 10);
  });

  it('should contain all required version types', () => {
    const required = [
      'major',
      'minor',
      'patch',
      'experimental',
      'snapshot',
      'legacy',
      'candidate',
      'canonical',
      'hotfix',
      'archived',
    ];
    for (const type of required) {
      assert.ok(
        CANONICAL_CURRICULUM_VERSION_TYPES.includes(type as any),
        `Missing version type: ${type}`,
      );
    }
  });

  it('should contain all required lifecycle states', () => {
    const required = [
      'draft',
      'proposed',
      'review',
      'approved',
      'active',
      'deprecated',
      'superseded',
      'retired',
      'archived',
      'rejected',
    ];
    for (const state of required) {
      assert.ok(
        CANONICAL_CURRICULUM_LIFECYCLE.includes(state as any),
        `Missing lifecycle state: ${state}`,
      );
    }
  });

  it('should contain all required evolution relations', () => {
    const required = [
      'supersedes',
      'derived_from',
      'fork_of',
      'merged_into',
      'replaces',
      'equivalent_to',
      'historical_copy',
      'canonical_successor',
      'experimental_branch',
      'restores',
    ];
    for (const relation of required) {
      assert.ok(
        CANONICAL_EVOLUTION_RELATIONS.includes(relation as any),
        `Missing evolution relation: ${relation}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Negative Capability', () => {
  it('should not infer learner behavior', () => {
    // Evolution metadata should not contain learner-related fields
    const version = composeCurriculumVersion(VALID_VERSION_V1);
    assert.ok(!('learnerId' in version));
    assert.ok(!('mastery' in version));
    assert.ok(!('completionRate' in version));
  });

  it('should not modify curriculum', () => {
    // Evolution metadata should not contain curriculum modification fields
    const version = composeCurriculumVersion(VALID_VERSION_V1);
    assert.ok(!('modifiedNodes' in version));
    assert.ok(!('addedEdges' in version));
    assert.ok(!('removedContent' in version));
  });

  it('should not perform runtime scheduling', () => {
    // Evolution metadata should not contain scheduling fields
    const version = composeCurriculumVersion(VALID_VERSION_V1);
    assert.ok(!('scheduledAt' in version));
    assert.ok(!('expiresAt' in version));
    assert.ok(!('activationDate' in version));
  });
});

// ---------------------------------------------------------------------------
// Version Lifecycle Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Version Lifecycle', () => {
  it('should compose version with draft state', () => {
    const version = composeCurriculumVersion({
      versionId: 'version-draft',
      versionType: 'experimental',
      versionNumber: '0.1.0',
      lifecycleState: 'draft',
      source: 'research-committee',
      governanceStatus: 'provisional',
      rationale: 'Draft version.',
      providedBy: 'research-board',
    });
    assert.strictEqual(version.lifecycleState, 'draft');
  });

  it('should compose version with proposed state', () => {
    const version = composeCurriculumVersion({
      versionId: 'version-proposed',
      versionType: 'candidate',
      versionNumber: '1.0.0-rc',
      lifecycleState: 'proposed',
      source: 'governance-committee',
      governanceStatus: 'accepted',
      rationale: 'Proposed version.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(version.lifecycleState, 'proposed');
  });

  it('should compose version with archived state', () => {
    const version = composeCurriculumVersion({
      versionId: 'version-archived',
      versionType: 'archived',
      versionNumber: '0.5.0',
      lifecycleState: 'archived',
      source: 'governance-committee',
      governanceStatus: 'deprecated',
      rationale: 'Archived version.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(version.lifecycleState, 'archived');
  });
});

// ---------------------------------------------------------------------------
// Evolution Relation Types Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Evolution Relation Types', () => {
  it('should compose supersedes relation', () => {
    const record = composeEvolutionRecord({
      relationId: 'rel-supersedes',
      sourceVersionId: 'version-001',
      targetVersionId: 'version-002',
      relationType: 'supersedes',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Version 2 supersedes version 1.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(record.relationType, 'supersedes');
  });

  it('should compose derived_from relation', () => {
    const record = composeEvolutionRecord({
      relationId: 'rel-derived',
      sourceVersionId: 'version-002',
      targetVersionId: 'version-001',
      relationType: 'derived_from',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Version 2 derived from version 1.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(record.relationType, 'derived_from');
  });

  it('should compose fork_of relation', () => {
    const record = composeEvolutionRecord({
      relationId: 'rel-fork',
      sourceVersionId: 'version-exp-001',
      targetVersionId: 'version-001',
      relationType: 'fork_of',
      source: 'research-committee',
      governanceStatus: 'provisional',
      rationale: 'Experimental fork of version 1.',
      providedBy: 'research-board',
    });
    assert.strictEqual(record.relationType, 'fork_of');
  });

  it('should compose replaces relation', () => {
    const record = composeEvolutionRecord({
      relationId: 'rel-replaces',
      sourceVersionId: 'version-002',
      targetVersionId: 'version-001',
      relationType: 'replaces',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Version 2 replaces version 1.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(record.relationType, 'replaces');
  });

  it('should compose restores relation', () => {
    const record = composeEvolutionRecord({
      relationId: 'rel-restores',
      sourceVersionId: 'version-003',
      targetVersionId: 'version-001',
      relationType: 'restores',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Version 3 restores version 1.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(record.relationType, 'restores');
  });
});

// ---------------------------------------------------------------------------
// Complex Registry Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Complex Registry', () => {
  it('should handle complex registry with multiple versions and relations', () => {
    const input: CurriculumEvolutionInput = {
      registryId: 'reg-complex',
      versions: [
        VALID_VERSION_V1,
        VALID_VERSION_V2,
        VALID_VERSION_V3,
        VALID_VERSION_EXPERIMENTAL,
        VALID_VERSION_LEGACY,
      ],
      lifecycleRecords: [
        VALID_LIFECYCLE_1,
        VALID_LIFECYCLE_2,
        {
          lifecycleId: 'lifecycle-003',
          versionId: 'version-002',
          previousState: null,
          newState: 'draft',
          transitionReason: 'Version 2 creation.',
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Version 2 created.',
          providedBy: 'curriculum-board',
        },
      ],
      evolutionRecords: [
        VALID_EVOLUTION_1,
        VALID_EVOLUTION_2,
        {
          relationId: 'relation-003',
          sourceVersionId: 'version-002',
          targetVersionId: 'version-003',
          relationType: 'merged_into',
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Version 3 merged into version 2.',
          providedBy: 'curriculum-board',
        },
      ],
    };
    const registry = composeCurriculumEvolution(input);
    assert.strictEqual(registry.versionCount, 5);
    assert.strictEqual(registry.lifecycleCount, 3);
    assert.strictEqual(registry.evolutionCount, 3);
    const result = validateEvolutionRegistry(registry);
    assert.strictEqual(result.valid, true);
  });
});

// ---------------------------------------------------------------------------
// Trace Decision Tests
// ---------------------------------------------------------------------------

describe('Curriculum Evolution Kernel — Trace Decisions', () => {
  it('should compose trace with valid decisions', () => {
    const trace = composeEvolutionTrace(
      'reg-decisions',
      [VALID_VERSION_V1],
      [],
      [],
    );
    assert.strictEqual(trace.decisions.length, 1);
    assert.strictEqual(trace.decisions[0].decisionType, 'version');
    assert.strictEqual(trace.decisions[0].validationPassed, true);
  });

  it('should compose trace with invalid decisions', () => {
    const invalidVersion = {
      ...VALID_VERSION_V1,
      versionId: '',
      versionType: 'invalid' as any,
    };
    const trace = composeEvolutionTrace(
      'reg-invalid',
      [invalidVersion],
      [],
      [],
    );
    assert.strictEqual(trace.decisions.length, 1);
    assert.strictEqual(trace.decisions[0].validationPassed, false);
    assert.ok(trace.decisions[0].validationErrors.length > 0);
  });
});
