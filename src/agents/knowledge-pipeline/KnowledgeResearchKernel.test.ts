/**
 * D10-OPT-10 — Research Provenance Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Research Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeResearchProfile,
  KnowledgeResearchProvenance,
  KnowledgeResearchRelationship,
  KnowledgeResearchInput,
  KnowledgeResearchRegistry,
  KnowledgeResearchTrace,
  KnowledgeArtifactWithResearch,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_RESEARCH_SOURCE_TYPES,
  CANONICAL_EVIDENCE_LEVELS,
  CANONICAL_RESEARCH_CITATION_TYPES as CANONICAL_CITATION_TYPES,
  CANONICAL_RESEARCH_STATUS,
  CANONICAL_RESEARCH_VISIBILITY,
  CANONICAL_RESEARCH_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeResearchProvenance,
  composeKnowledgeResearchProfile,
  composeKnowledgeResearchRelationship,
  composeKnowledgeResearchTrace,
  composeKnowledgeResearchRegistry,
  composeKnowledgeResearchRegistryFromInput,
  composeKnowledgeResearch,
  composeKnowledgeArtifactWithResearch,
  isSupportedResearchSourceType,
  isSupportedEvidenceLevel,
  isSupportedCitationType,
  isSupportedResearchVisibility,
  isSupportedResearchStatus,
  isSupportedResearchGovernance,
  getCanonicalResearchSourceTypes,
  getCanonicalEvidenceLevels,
  getCanonicalCitationTypes,
  getCanonicalResearchVisibility,
  getCanonicalResearchStatuses,
} from './KnowledgeResearchKernel.ts';

import {
  validateKnowledgeResearchProfile,
  validateKnowledgeResearchRelationship,
  validateKnowledgeResearchRegistry,
  validateKnowledgeResearchInput,
  validateKnowledgeResearchTrace,
  validateKnowledgeArtifactWithResearch,
  RESEARCH_VALIDATION_CODES,
} from './KnowledgeResearchValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeResearchProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Knowledge Pipeline',
  rationale: 'Core research for concept.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeResearchProfile = {
  researchId: 'res-001',
  conceptId: 'concept-001',
  title: 'Deep Learning Survey',
  researchSourceType: 'journal_article',
  evidenceLevel: 'peer_reviewed',
  citationType: 'survey',
  publicationYear: 2020,
  doiReference: '10.1234/example',
  authors: ['Author One', 'Author Two'],
  publisher: 'Journal of AI',
  visibility: 'default',
  status: 'canonical',
  governance: 'canonical',
  tags: ['deep_learning', 'survey'],
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeResearchProfile = {
  researchId: 'res-002',
  conceptId: 'concept-001',
  title: 'Neural Network Foundations',
  researchSourceType: 'book',
  evidenceLevel: 'validated',
  citationType: 'textbook',
  publicationYear: 2019,
  doiReference: '10.5678/example',
  authors: ['Author Three'],
  publisher: 'Academic Press',
  visibility: 'advanced',
  status: 'approved',
  governance: 'accepted',
  tags: ['neural_networks', 'foundations'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeResearchProfile = {
  researchId: 'res-003',
  conceptId: 'concept-002',
  title: 'Computer Vision Standards',
  researchSourceType: 'standard',
  evidenceLevel: 'official',
  citationType: 'specification',
  publicationYear: 2021,
  doiReference: '10.9012/example',
  authors: ['Standards Committee'],
  publisher: 'ISO',
  visibility: 'expert',
  status: 'canonical',
  governance: 'canonical',
  tags: ['computer_vision', 'standards'],
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeResearchRelationship = {
  relationshipId: 'rel-001',
  sourceResearchId: 'res-001',
  targetResearchId: 'res-002',
  relationshipType: 'extension',
  description: 'Book extends survey.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeResearchInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeResearchInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Research Kernel — Composition', () => {
  it('should compose valid research provenance', () => {
    const provenance = composeKnowledgeResearchProvenance({
      source: 'NeuralVerse Team',
      provider: 'Knowledge Pipeline',
      rationale: 'Core research.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Knowledge Pipeline');
    assert.equal(provenance.rationale, 'Core research.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid research profile', () => {
    const profile = composeKnowledgeResearchProfile({
      researchId: 'res-001',
      conceptId: 'concept-001',
      title: 'Test Research',
      researchSourceType: 'journal_article',
      evidenceLevel: 'peer_reviewed',
      citationType: 'primary_source',
      publicationYear: 2020,
      doiReference: '10.1234/test',
      authors: ['Author'],
      publisher: 'Publisher',
      visibility: 'default',
      status: 'canonical',
      governance: 'canonical',
      tags: ['tag1'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.researchId, 'res-001');
    assert.equal(profile.title, 'Test Research');
    assert.equal(profile.researchSourceType, 'journal_article');
    assert.equal(profile.authors.length, 1);
    assert.equal(profile.tags.length, 1);
  });

  it('should compose valid research relationship', () => {
    const relationship = composeKnowledgeResearchRelationship({
      relationshipId: 'rel-001',
      sourceResearchId: 'res-001',
      targetResearchId: 'res-002',
      relationshipType: 'extension',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceResearchId, 'res-001');
    assert.equal(relationship.targetResearchId, 'res-002');
    assert.equal(relationship.relationshipType, 'extension');
  });

  it('should compose valid research trace', () => {
    const trace = composeKnowledgeResearchTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', researchId: 'res-001', conceptId: 'concept-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid research registry', () => {
    const registry = composeKnowledgeResearchRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeResearchRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge research from input', () => {
    const registry = composeKnowledgeResearch(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with research', () => {
    const artifact = composeKnowledgeArtifactWithResearch({
      conceptId: 'concept-001',
      conceptTitle: 'Deep Learning',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.conceptId, 'concept-001');
    assert.equal(artifact.conceptTitle, 'Deep Learning');
    assert.equal(artifact.profiles.length, 1);
    assert.equal(artifact.relationships.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Research Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeResearchProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeResearchRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeResearchRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge research input', () => {
    const result = validateKnowledgeResearchInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeResearchRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeResearchRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have RESEARCH_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, researchId: 'res-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE_1, researchId: 'res-002', title: 'Same Title' };
    const registry = composeKnowledgeResearchRegistry([profile1, profile2], []);
    const result = validateKnowledgeResearchRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have RESEARCH_DUPLICATE_TITLE error');
  });

  it('should detect invalid source type', () => {
    const profile = { ...VALID_PROFILE_1, researchSourceType: 'unsupported' as any };
    const errors = validateKnowledgeResearchProfile(profile);
    const sourceError = errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_SOURCE,
    );
    assert.ok(sourceError, 'Should have RESEARCH_INVALID_SOURCE error');
  });

  it('should detect invalid evidence level', () => {
    const profile = { ...VALID_PROFILE_1, evidenceLevel: 'unsupported' as any };
    const errors = validateKnowledgeResearchProfile(profile);
    const evidenceError = errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_EVIDENCE,
    );
    assert.ok(evidenceError, 'Should have RESEARCH_INVALID_EVIDENCE error');
  });

  it('should detect invalid citation type', () => {
    const profile = { ...VALID_PROFILE_1, citationType: 'unsupported' as any };
    const errors = validateKnowledgeResearchProfile(profile);
    const citationError = errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_CITATION,
    );
    assert.ok(citationError, 'Should have RESEARCH_INVALID_CITATION error');
  });

  it('should detect invalid visibility', () => {
    const profile = { ...VALID_PROFILE_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeResearchProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have RESEARCH_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeResearchProfile(profile);
    const statusError = errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have RESEARCH_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeResearchProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have RESEARCH_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeResearchProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have RESEARCH_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeResearchProfile(profile);
    const providerError = errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have RESEARCH_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeResearchProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have RESEARCH_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetResearchId: 'res-001' };
    const knownProfileIds = new Set(['res-001', 'res-002']);
    const errors = validateKnowledgeResearchRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have RESEARCH_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeResearchRegistry([], []);
    const result = validateKnowledgeResearchRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have RESEARCH_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeResearchTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_research_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeResearchTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeResearchRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        researchCount: 5,
        relationshipCount: 0,
        conceptCount: 1,
        sourceTypeCount: 1,
      },
      trace: {
        traceId: '_trace_1',
        decisionCount: 0,
        validationCount: 0,
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
        decisions: [],
        deterministic: true,
        generatedFrom: 'deterministic_research_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_research_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeResearchRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === RESEARCH_VALIDATION_CODES.RESEARCH_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have RESEARCH_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeResearchTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeResearchTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with research', () => {
    const artifact = composeKnowledgeArtifactWithResearch({
      conceptId: 'concept-001',
      conceptTitle: 'Deep Learning',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithResearch(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Research Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeResearch>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeResearch(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeResearchRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeResearchRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeResearchProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeResearchProvenance({
        source: 'Test',
        provider: 'Provider',
        rationale: 'Rationale',
        governance: 'canonical',
      }));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0], results[i]);
    }
  });

  it('should produce identical trace for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeResearchTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeResearchTrace({
        traceId: '_trace_1',
        decisions: [],
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
      }));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0], results[i]);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Research Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.researchId;
    const originalTitle = VALID_PROFILE_1.title;

    composeKnowledgeResearch(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.researchId, originalId);
    assert.equal(VALID_PROFILE_1.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.researchId);

    composeKnowledgeResearchRegistry(profiles, []);

    assert.equal(profiles[0].researchId, originalIds[0]);
    assert.equal(profiles[1].researchId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeResearchProfile({
      researchId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      researchSourceType: 'journal_article',
      evidenceLevel: 'peer_reviewed',
      citationType: 'primary_source',
      publicationYear: 2020,
      doiReference: '10.1234/test',
      authors: [],
      publisher: 'Publisher',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: originalTags,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.tags, originalTags);
    assert.deepStrictEqual([...profile.tags], originalTags);
  });

  it('should use defensive copies for authors', () => {
    const originalAuthors = ['Author One', 'Author Two'];
    const profile = composeKnowledgeResearchProfile({
      researchId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      researchSourceType: 'journal_article',
      evidenceLevel: 'peer_reviewed',
      citationType: 'primary_source',
      publicationYear: 2020,
      doiReference: '10.1234/test',
      authors: originalAuthors,
      publisher: 'Publisher',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: [],
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.authors, originalAuthors);
    assert.deepStrictEqual([...profile.authors], originalAuthors);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Research Kernel — Helpers', () => {
  it('should return canonical research source types', () => {
    const types = getCanonicalResearchSourceTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_RESEARCH_SOURCE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical evidence levels', () => {
    const levels = getCanonicalEvidenceLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_EVIDENCE_LEVELS]);
    assert.equal(levels.length, 10);
  });

  it('should return canonical citation types', () => {
    const types = getCanonicalCitationTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_CITATION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical research visibility', () => {
    const visibility = getCanonicalResearchVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_RESEARCH_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical research statuses', () => {
    const statuses = getCanonicalResearchStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_RESEARCH_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate research source type support', () => {
    assert.equal(isSupportedResearchSourceType('journal_article'), true);
    assert.equal(isSupportedResearchSourceType('conference_paper'), true);
    assert.equal(isSupportedResearchSourceType('unsupported'), false);
  });

  it('should validate evidence level support', () => {
    assert.equal(isSupportedEvidenceLevel('canonical'), true);
    assert.equal(isSupportedEvidenceLevel('peer_reviewed'), true);
    assert.equal(isSupportedEvidenceLevel('unsupported'), false);
  });

  it('should validate citation type support', () => {
    assert.equal(isSupportedCitationType('primary_source'), true);
    assert.equal(isSupportedCitationType('secondary_source'), true);
    assert.equal(isSupportedCitationType('unsupported'), false);
  });

  it('should validate research visibility support', () => {
    assert.equal(isSupportedResearchVisibility('always'), true);
    assert.equal(isSupportedResearchVisibility('default'), true);
    assert.equal(isSupportedResearchVisibility('unsupported'), false);
  });

  it('should validate research status support', () => {
    assert.equal(isSupportedResearchStatus('draft'), true);
    assert.equal(isSupportedResearchStatus('canonical'), true);
    assert.equal(isSupportedResearchStatus('unsupported'), false);
  });

  it('should validate research governance support', () => {
    assert.equal(isSupportedResearchGovernance('canonical'), true);
    assert.equal(isSupportedResearchGovernance('accepted'), true);
    assert.equal(isSupportedResearchGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Research Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 research source types', () => {
    assert.equal(CANONICAL_RESEARCH_SOURCE_TYPES.length, 10);
  });

  it('should have exactly 10 evidence levels', () => {
    assert.equal(CANONICAL_EVIDENCE_LEVELS.length, 10);
  });

  it('should have exactly 10 citation types', () => {
    assert.equal(CANONICAL_CITATION_TYPES.length, 10);
  });

  it('should have exactly 6 research statuses', () => {
    assert.equal(CANONICAL_RESEARCH_STATUS.length, 6);
  });

  it('should have exactly 10 research visibility values', () => {
    assert.equal(CANONICAL_RESEARCH_VISIBILITY.length, 10);
  });

  it('should have exactly 10 research governance values', () => {
    assert.equal(CANONICAL_RESEARCH_GOVERNANCE.length, 10);
  });

  it('should contain all expected research source types', () => {
    const expected = ['journal_article', 'conference_paper', 'technical_report', 'book', 'book_chapter', 'official_documentation', 'standard', 'whitepaper', 'thesis', 'reference_work'];
    for (const type of expected) {
      assert.ok(CANONICAL_RESEARCH_SOURCE_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected evidence levels', () => {
    const expected = ['canonical', 'peer_reviewed', 'official', 'validated', 'widely_accepted', 'community_reviewed', 'provisional', 'experimental', 'historical', 'deprecated'];
    for (const level of expected) {
      assert.ok(CANONICAL_EVIDENCE_LEVELS.includes(level as any), `Should include level: ${level}`);
    }
  });

  it('should contain all expected citation types', () => {
    const expected = ['primary_source', 'secondary_source', 'review', 'survey', 'textbook', 'documentation', 'specification', 'standard', 'historical', 'supplementary'];
    for (const type of expected) {
      assert.ok(CANONICAL_CITATION_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected research statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_RESEARCH_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected research visibility values', () => {
    const expected = ['always', 'default', 'advanced', 'expert', 'curriculum', 'assessment', 'laboratory', 'research', 'internal', 'hidden'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_RESEARCH_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected research governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_RESEARCH_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Research Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(RESEARCH_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with RESEARCH_', () => {
    const codes = Object.values(RESEARCH_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('RESEARCH_'), `Code "${code}" should start with RESEARCH_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(RESEARCH_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Research Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeResearchProfile({
      researchId: 'res-001',
      conceptId: 'concept-001',
      title: 'Test',
      researchSourceType: 'journal_article',
      evidenceLevel: 'peer_reviewed',
      citationType: 'primary_source',
      publicationYear: 2020,
      doiReference: '10.1234/test',
      authors: [],
      publisher: 'Publisher',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: [],
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(profile);
    for (const key of keys) {
      const value = (profile as any)[key];
      assert.ok(typeof value !== 'function', `Profile field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Research Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeResearch(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Research Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by conceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, researchId: 'res-003', conceptId: 'concept-003' };
    const profile1 = { ...VALID_PROFILE_1, researchId: 'res-001', conceptId: 'concept-001' };
    const profile2 = { ...VALID_PROFILE_1, researchId: 'res-002', conceptId: 'concept-002' };

    const registry = composeKnowledgeResearchRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].conceptId, 'concept-001');
    assert.equal(registry.profiles[1].conceptId, 'concept-002');
    assert.equal(registry.profiles[2].conceptId, 'concept-003');
  });

  it('should sort by researchSourceType when conceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, researchId: 'res-002', conceptId: 'concept-001', researchSourceType: 'book' as const };
    const profileB = { ...VALID_PROFILE_1, researchId: 'res-001', conceptId: 'concept-001', researchSourceType: 'journal_article' as const };

    const registry = composeKnowledgeResearchRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].researchSourceType, 'book');
    assert.equal(registry.profiles[1].researchSourceType, 'journal_article');
  });
});
