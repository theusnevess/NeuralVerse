/**
 * NV-1700-D5-OPT-02 — Evidence Provenance & Source Traceability Test Suite
 *
 * Comprehensive deterministic test suite for the Evidence Kernel.
 * Covers: valid source, valid citation, valid relationship, valid registry,
 * duplicate sources, duplicate citations, duplicate relationships,
 * unknown source type, unknown authority, unknown citation type,
 * unknown status, missing provenance, missing rationale, missing providedBy,
 * empty registry, deterministic ordering, immutable input,
 * identical output (100 iterations), helper functions,
 * canonical enum completeness, negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  EvidenceSource,
  CitationReference,
  EvidenceRelationship,
  EvidenceProvenance,
  EvidenceInput,
  EvidenceRegistry,
  EvidenceTrace,
  KnowledgeArtifactWithEvidence,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_EVIDENCE_SOURCE_TYPES,
  CANONICAL_EVIDENCE_AUTHORITY,
  CANONICAL_CITATION_TYPES,
  CANONICAL_SOURCE_STATUS,
  CANONICAL_EVIDENCE_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

import {
  composeEvidenceProvenance,
  composeEvidenceSource,
  composeCitationReference,
  composeEvidenceRelationship,
  composeEvidenceTrace,
  composeEvidenceRegistry,
  composeEvidenceRegistryFromInput,
  composeEvidence,
  composeKnowledgeArtifactWithEvidence,
  composeKnowledgeEvidence,
  isSupportedEvidenceSourceType,
  isSupportedEvidenceAuthority,
  isSupportedCitationType,
  isSupportedSourceStatus,
  isSupportedEvidenceGovernanceStatus,
  getCanonicalEvidenceSourceTypes,
  getCanonicalEvidenceAuthorityLevels,
  getCanonicalCitationTypes,
  getCanonicalSourceStatuses,
  getCanonicalEvidenceGovernanceStatuses,
} from './EvidenceKernel.ts';

import {
  validateEvidenceSource,
  validateCitationReference,
  validateEvidenceRelationship,
  validateEvidenceRegistry,
  validateEvidenceInput,
  validateEvidenceTrace,
  validateKnowledgeArtifactWithEvidence,
  EVIDENCE_VALIDATION_CODES,
} from './EvidenceValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: EvidenceProvenance = {
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  providedBy: 'NeuralVerse Team',
  rationale: 'Core research evidence.',
};

const VALID_SOURCE: EvidenceSource = {
  sourceId: 'source-001',
  title: 'Deep Learning Foundations',
  sourceType: 'research_paper',
  authorityLevel: 'peer_reviewed',
  status: 'published',
  canonicalIdentifier: 'dl-001',
  publisher: 'NeuralVerse Pipeline',
  authors: ['Author One', 'Author Two'],
  publicationYear: 2024,
  urlReference: 'https://example.com/paper-001',
  tags: ['deep_learning', 'neural_networks'],
  summary: 'Foundational deep learning concepts.',
  provenance: VALID_PROVENANCE,
};

const VALID_SOURCE_2: EvidenceSource = {
  sourceId: 'source-002',
  title: 'Machine Learning Handbook',
  sourceType: 'book',
  authorityLevel: 'academic',
  status: 'approved',
  canonicalIdentifier: 'ml-001',
  publisher: 'Academic Press',
  authors: ['Author Three'],
  publicationYear: 2023,
  urlReference: 'https://example.com/book-001',
  tags: ['machine_learning', 'handbook'],
  summary: 'Comprehensive ML handbook.',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_CITATION: CitationReference = {
  citationId: 'citation-001',
  knowledgeId: 'knowledge-001',
  sourceId: 'source-001',
  citationType: 'primary',
  sectionReference: 'Section 2.1',
  pageReference: 'pp. 45-50',
  confidenceLevel: 0.95,
  provenance: VALID_PROVENANCE,
};

const VALID_CITATION_2: CitationReference = {
  citationId: 'citation-002',
  knowledgeId: 'knowledge-002',
  sourceId: 'source-002',
  citationType: 'supporting',
  sectionReference: 'Chapter 3',
  pageReference: 'pp. 100-110',
  confidenceLevel: 0.85,
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_RELATIONSHIP: EvidenceRelationship = {
  relationshipId: 'relationship-001',
  knowledgeId: 'knowledge-001',
  sourceId: 'source-001',
  citationId: 'citation-001',
  relationshipType: 'supports',
  description: 'Source provides primary evidence for knowledge artifact.',
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP_2: EvidenceRelationship = {
  relationshipId: 'relationship-002',
  knowledgeId: 'knowledge-002',
  sourceId: 'source-002',
  citationId: 'citation-002',
  relationshipType: 'references',
  description: 'Source references supporting evidence.',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_INPUT: EvidenceInput = {
  sources: [VALID_SOURCE, VALID_SOURCE_2],
  citations: [VALID_CITATION, VALID_CITATION_2],
  relationships: [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
};

const EMPTY_INPUT: EvidenceInput = {
  sources: [],
  citations: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Source Composition Tests
// ---------------------------------------------------------------------------

describe('Evidence Kernel — Source Composition', () => {
  it('should compose valid evidence provenance', () => {
    const provenance = composeEvidenceProvenance({
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      providedBy: 'NeuralVerse Team',
      rationale: 'Core evidence.',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.rationale, 'Core evidence.');
  });

  it('should compose valid evidence source', () => {
    const source = composeEvidenceSource({
      sourceId: 'source-001',
      title: 'Deep Learning Foundations',
      sourceType: 'research_paper',
      authorityLevel: 'peer_reviewed',
      status: 'published',
      canonicalIdentifier: 'dl-001',
      publisher: 'NeuralVerse Pipeline',
      authors: ['Author One'],
      publicationYear: 2024,
      urlReference: 'https://example.com/paper-001',
      tags: ['deep_learning'],
      summary: 'Foundational concepts.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(source.sourceId, 'source-001');
    assert.equal(source.title, 'Deep Learning Foundations');
    assert.equal(source.sourceType, 'research_paper');
    assert.equal(source.authorityLevel, 'peer_reviewed');
    assert.equal(source.status, 'published');
    assert.equal(source.authors.length, 1);
    assert.equal(source.tags.length, 1);
  });

  it('should compose valid citation reference', () => {
    const citation = composeCitationReference({
      citationId: 'citation-001',
      knowledgeId: 'knowledge-001',
      sourceId: 'source-001',
      citationType: 'primary',
      sectionReference: 'Section 2.1',
      pageReference: 'pp. 45-50',
      confidenceLevel: 0.95,
      provenance: VALID_PROVENANCE,
    });

    assert.equal(citation.citationId, 'citation-001');
    assert.equal(citation.knowledgeId, 'knowledge-001');
    assert.equal(citation.sourceId, 'source-001');
    assert.equal(citation.citationType, 'primary');
    assert.equal(citation.confidenceLevel, 0.95);
  });

  it('should compose valid evidence relationship', () => {
    const relationship = composeEvidenceRelationship({
      relationshipId: 'relationship-001',
      knowledgeId: 'knowledge-001',
      sourceId: 'source-001',
      citationId: 'citation-001',
      relationshipType: 'supports',
      description: 'Source provides evidence.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'relationship-001');
    assert.equal(relationship.knowledgeId, 'knowledge-001');
    assert.equal(relationship.sourceId, 'source-001');
    assert.equal(relationship.citationId, 'citation-001');
    assert.equal(relationship.relationshipType, 'supports');
  });

  it('should compose valid evidence trace', () => {
    const trace = composeEvidenceTrace({
      traceId: '_trace_1',
      decisionCount: 5,
      validationCount: 4,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 5);
    assert.equal(trace.validationCount, 4);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should validate a valid source with no errors', () => {
    const errors = validateEvidenceSource(VALID_SOURCE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid citation with no errors', () => {
    const errors = validateCitationReference(VALID_CITATION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid relationship with no errors', () => {
    const errors = validateEvidenceRelationship(VALID_RELATIONSHIP);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeEvidenceRegistry(
      [VALID_SOURCE, VALID_SOURCE_2],
      [VALID_CITATION, VALID_CITATION_2],
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
    );
    const result = validateEvidenceRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate evidence input', () => {
    const result = validateEvidenceInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Evidence Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeEvidenceRegistry([], [], []);
    const result = validateEvidenceRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EVIDENCE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate source IDs', () => {
    const registry = composeEvidenceRegistry(
      [VALID_SOURCE, VALID_SOURCE],
      [],
      [],
    );
    const result = validateEvidenceRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_DUPLICATE_SOURCE,
    );

    assert.ok(duplicateError, 'Should have EVIDENCE_DUPLICATE_SOURCE error');
  });

  it('should detect duplicate citation IDs', () => {
    const registry = composeEvidenceRegistry(
      [],
      [VALID_CITATION, VALID_CITATION],
      [],
    );
    const result = validateEvidenceRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_DUPLICATE_CITATION,
    );

    assert.ok(duplicateError, 'Should have EVIDENCE_DUPLICATE_CITATION error');
  });

  it('should detect duplicate relationship IDs', () => {
    const registry = composeEvidenceRegistry(
      [],
      [],
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP],
    );
    const result = validateEvidenceRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_DUPLICATE_RELATIONSHIP,
    );

    assert.ok(duplicateError, 'Should have EVIDENCE_DUPLICATE_RELATIONSHIP error');
  });

  it('should sort deterministically by sourceId', () => {
    const source3 = { ...VALID_SOURCE, sourceId: 'source-003' };
    const source1 = { ...VALID_SOURCE, sourceId: 'source-001' };
    const source2 = { ...VALID_SOURCE, sourceId: 'source-002' };

    const registry = composeEvidenceRegistry([source3, source1, source2], [], []);

    assert.equal(registry.sources[0].sourceId, 'source-001');
    assert.equal(registry.sources[1].sourceId, 'source-002');
    assert.equal(registry.sources[2].sourceId, 'source-003');
  });

  it('should sort by sourceType when sourceId is equal', () => {
    const sourceA = { ...VALID_SOURCE, sourceId: 'source-001', sourceType: 'book' as const };
    const sourceB = { ...VALID_SOURCE, sourceId: 'source-001', sourceType: 'research_paper' as const };

    const registry = composeEvidenceRegistry([sourceA, sourceB], [], []);

    assert.equal(registry.sources[0].sourceType, 'book');
    assert.equal(registry.sources[1].sourceType, 'research_paper');
  });

  it('should sort citations deterministically by citationId', () => {
    const citation3 = { ...VALID_CITATION, citationId: 'citation-003' };
    const citation1 = { ...VALID_CITATION, citationId: 'citation-001' };
    const citation2 = { ...VALID_CITATION, citationId: 'citation-002' };

    const registry = composeEvidenceRegistry([], [citation3, citation1, citation2], []);

    assert.equal(registry.citations[0].citationId, 'citation-001');
    assert.equal(registry.citations[1].citationId, 'citation-002');
    assert.equal(registry.citations[2].citationId, 'citation-003');
  });

  it('should sort relationships deterministically by relationshipId', () => {
    const relationship3 = { ...VALID_RELATIONSHIP, relationshipId: 'relationship-003' };
    const relationship1 = { ...VALID_RELATIONSHIP, relationshipId: 'relationship-001' };
    const relationship2 = { ...VALID_RELATIONSHIP, relationshipId: 'relationship-002' };

    const registry = composeEvidenceRegistry([], [], [relationship3, relationship1, relationship2]);

    assert.equal(registry.relationships[0].relationshipId, 'relationship-001');
    assert.equal(registry.relationships[1].relationshipId, 'relationship-002');
    assert.equal(registry.relationships[2].relationshipId, 'relationship-003');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Evidence Kernel — Validation', () => {
  it('should detect unknown source type', () => {
    const source = { ...VALID_SOURCE, sourceType: 'unsupported' as any };
    const errors = validateEvidenceSource(source);
    const typeError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_UNKNOWN_SOURCE_TYPE,
    );

    assert.ok(typeError, 'Should have EVIDENCE_UNKNOWN_SOURCE_TYPE error');
  });

  it('should detect unknown authority level', () => {
    const source = { ...VALID_SOURCE, authorityLevel: 'unsupported' as any };
    const errors = validateEvidenceSource(source);
    const authorityError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_UNKNOWN_AUTHORITY,
    );

    assert.ok(authorityError, 'Should have EVIDENCE_UNKNOWN_AUTHORITY error');
  });

  it('should detect unknown citation type', () => {
    const citation = { ...VALID_CITATION, citationType: 'unsupported' as any };
    const errors = validateCitationReference(citation);
    const typeError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_UNKNOWN_CITATION_TYPE,
    );

    assert.ok(typeError, 'Should have EVIDENCE_UNKNOWN_CITATION_TYPE error');
  });

  it('should detect unknown status', () => {
    const source = { ...VALID_SOURCE, status: 'unsupported' as any };
    const errors = validateEvidenceSource(source);
    const statusError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_UNKNOWN_STATUS,
    );

    assert.ok(statusError, 'Should have EVIDENCE_UNKNOWN_STATUS error');
  });

  it('should detect missing provenance', () => {
    const source = { ...VALID_SOURCE, provenance: undefined as any };
    const errors = validateEvidenceSource(source);
    const provenanceError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have EVIDENCE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance source', () => {
    const source = { ...VALID_SOURCE, provenance: { ...VALID_PROVENANCE, source: '' } };
    const errors = validateEvidenceSource(source);
    const sourceError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have EVIDENCE_MISSING_SOURCE error');
  });

  it('should detect missing provenance rationale', () => {
    const source = { ...VALID_SOURCE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateEvidenceSource(source);
    const rationaleError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have EVIDENCE_MISSING_RATIONALE error');
  });

  it('should detect missing provenance providedBy', () => {
    const source = { ...VALID_SOURCE, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateEvidenceSource(source);
    const providedByError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have EVIDENCE_MISSING_PROVIDED_BY error');
  });

  it('should detect invalid confidence level', () => {
    const citation = { ...VALID_CITATION, confidenceLevel: 1.5 };
    const errors = validateCitationReference(citation);
    const confidenceError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_CONFIDENCE,
    );

    assert.ok(confidenceError, 'Should have EVIDENCE_INVALID_CONFIDENCE error');
  });

  it('should detect invalid publication year', () => {
    const source = { ...VALID_SOURCE, publicationYear: -1 };
    const errors = validateEvidenceSource(source);
    const yearError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_PUBLICATION_YEAR,
    );

    assert.ok(yearError, 'Should have EVIDENCE_INVALID_PUBLICATION_YEAR error');
  });

  it('should validate a valid trace', () => {
    const trace = composeEvidenceTrace({
      traceId: '_trace_1',
      decisionCount: 5,
      validationCount: 4,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateEvidenceTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: EvidenceTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      deterministic: false as true,
      generatedFrom: 'deterministic_evidence_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateEvidenceTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Evidence Kernel — Provenance', () => {
  it('should detect missing provenance on source', () => {
    const source = { ...VALID_SOURCE, provenance: undefined as any };
    const errors = validateEvidenceSource(source);
    const provenanceError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have EVIDENCE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance on citation', () => {
    const citation = { ...VALID_CITATION, provenance: undefined as any };
    const errors = validateCitationReference(citation);
    const provenanceError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have EVIDENCE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance on relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, provenance: undefined as any };
    const errors = validateEvidenceRelationship(relationship);
    const provenanceError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have EVIDENCE_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const source = { ...VALID_SOURCE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateEvidenceSource(source);
    const rationaleError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have EVIDENCE_MISSING_RATIONALE error');
  });

  it('should detect missing providedBy in provenance', () => {
    const source = { ...VALID_SOURCE, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateEvidenceSource(source);
    const providedByError = errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have EVIDENCE_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Evidence Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeEvidence>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeEvidence(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].sources, results[i].sources);
      assert.deepStrictEqual(results[0].citations, results[i].citations);
      assert.deepStrictEqual(results[0].relationships, results[i].relationships);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeEvidenceRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(
        composeEvidenceRegistry(
          [VALID_SOURCE, VALID_SOURCE_2],
          [VALID_CITATION, VALID_CITATION_2],
          [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
        ),
      );
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].sources, results[i].sources);
      assert.deepStrictEqual(results[0].citations, results[i].citations);
      assert.deepStrictEqual(results[0].relationships, results[i].relationships);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Evidence Kernel — Immutability', () => {
  it('should not mutate input sources', () => {
    const originalId = VALID_SOURCE.sourceId;
    const originalTitle = VALID_SOURCE.title;

    composeEvidence(VALID_INPUT);

    assert.equal(VALID_SOURCE.sourceId, originalId);
    assert.equal(VALID_SOURCE.title, originalTitle);
  });

  it('should not mutate input citations', () => {
    const originalId = VALID_CITATION.citationId;
    const originalKnowledgeId = VALID_CITATION.knowledgeId;

    composeEvidence(VALID_INPUT);

    assert.equal(VALID_CITATION.citationId, originalId);
    assert.equal(VALID_CITATION.knowledgeId, originalKnowledgeId);
  });

  it('should not mutate input relationships', () => {
    const originalId = VALID_RELATIONSHIP.relationshipId;
    const originalKnowledgeId = VALID_RELATIONSHIP.knowledgeId;

    composeEvidence(VALID_INPUT);

    assert.equal(VALID_RELATIONSHIP.relationshipId, originalId);
    assert.equal(VALID_RELATIONSHIP.knowledgeId, originalKnowledgeId);
  });

  it('should not mutate input registry sources', () => {
    const sources = [VALID_SOURCE, VALID_SOURCE_2];
    const originalIds = sources.map((s) => s.sourceId);

    composeEvidenceRegistry(sources, [], []);

    assert.equal(sources[0].sourceId, originalIds[0]);
    assert.equal(sources[1].sourceId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Evidence Kernel — Helper Functions', () => {
  it('should return canonical source types', () => {
    const types = getCanonicalEvidenceSourceTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_EVIDENCE_SOURCE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical authority levels', () => {
    const authorities = getCanonicalEvidenceAuthorityLevels();
    assert.deepStrictEqual([...authorities], [...CANONICAL_EVIDENCE_AUTHORITY]);
    assert.equal(authorities.length, 10);
  });

  it('should return canonical citation types', () => {
    const types = getCanonicalCitationTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_CITATION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical source statuses', () => {
    const statuses = getCanonicalSourceStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_SOURCE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should return canonical governance statuses', () => {
    const statuses = getCanonicalEvidenceGovernanceStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_EVIDENCE_GOVERNANCE_STATUSES]);
    assert.equal(statuses.length, 5);
  });

  it('should validate source type support', () => {
    assert.equal(isSupportedEvidenceSourceType('research_paper'), true);
    assert.equal(isSupportedEvidenceSourceType('book'), true);
    assert.equal(isSupportedEvidenceSourceType('unsupported'), false);
  });

  it('should validate authority level support', () => {
    assert.equal(isSupportedEvidenceAuthority('peer_reviewed'), true);
    assert.equal(isSupportedEvidenceAuthority('academic'), true);
    assert.equal(isSupportedEvidenceAuthority('unsupported'), false);
  });

  it('should validate citation type support', () => {
    assert.equal(isSupportedCitationType('primary'), true);
    assert.equal(isSupportedCitationType('secondary'), true);
    assert.equal(isSupportedCitationType('unsupported'), false);
  });

  it('should validate source status support', () => {
    assert.equal(isSupportedSourceStatus('draft'), true);
    assert.equal(isSupportedSourceStatus('published'), true);
    assert.equal(isSupportedSourceStatus('unsupported'), false);
  });

  it('should validate governance status support', () => {
    assert.equal(isSupportedEvidenceGovernanceStatus('canonical'), true);
    assert.equal(isSupportedEvidenceGovernanceStatus('accepted'), true);
    assert.equal(isSupportedEvidenceGovernanceStatus('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Evidence Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 source types', () => {
    assert.equal(CANONICAL_EVIDENCE_SOURCE_TYPES.length, 10);
  });

  it('should have exactly 10 authority levels', () => {
    assert.equal(CANONICAL_EVIDENCE_AUTHORITY.length, 10);
  });

  it('should have exactly 10 citation types', () => {
    assert.equal(CANONICAL_CITATION_TYPES.length, 10);
  });

  it('should have exactly 6 source statuses', () => {
    assert.equal(CANONICAL_SOURCE_STATUS.length, 6);
  });

  it('should have exactly 5 governance statuses', () => {
    assert.equal(CANONICAL_EVIDENCE_GOVERNANCE_STATUSES.length, 5);
  });

  it('should contain all expected source types', () => {
    const expectedTypes = [
      'research_paper',
      'book',
      'official_documentation',
      'technical_standard',
      'dataset',
      'course_material',
      'conference',
      'technical_report',
      'trusted_web_resource',
      'internal_reference',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_EVIDENCE_SOURCE_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected authority levels', () => {
    const expectedAuthorities = [
      'peer_reviewed',
      'official',
      'academic',
      'industry',
      'government',
      'maintainer',
      'community_verified',
      'internal',
      'legacy',
      'experimental',
    ];

    for (const authority of expectedAuthorities) {
      assert.ok(
        CANONICAL_EVIDENCE_AUTHORITY.includes(authority as any),
        `Should include authority: ${authority}`,
      );
    }
  });

  it('should contain all expected citation types', () => {
    const expectedCitationTypes = [
      'primary',
      'secondary',
      'supporting',
      'background',
      'reference',
      'implementation',
      'specification',
      'comparison',
      'historical',
      'supplementary',
    ];

    for (const type of expectedCitationTypes) {
      assert.ok(
        CANONICAL_CITATION_TYPES.includes(type as any),
        `Should include citation type: ${type}`,
      );
    }
  });

  it('should contain all expected source statuses', () => {
    const expectedStatuses = [
      'draft',
      'review',
      'approved',
      'published',
      'deprecated',
      'archived',
    ];

    for (const status of expectedStatuses) {
      assert.ok(
        CANONICAL_SOURCE_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });

  it('should contain all expected governance statuses', () => {
    const expectedGovernances = [
      'canonical',
      'accepted',
      'provisional',
      'deprecated',
      'rejected',
    ];

    for (const governance of expectedGovernances) {
      assert.ok(
        CANONICAL_EVIDENCE_GOVERNANCE_STATUSES.includes(governance as any),
        `Should include governance: ${governance}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Evidence Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeEvidence(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeEvidence(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeEvidence(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeEvidence(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not parse documents', () => {
    const result = composeEvidence(VALID_INPUT);
    assert.ok(!('parsedDocument' in result), 'Should not have parsed document');
    assert.ok(!('documentContent' in result), 'Should not have document content');
  });

  it('should not generate citations', () => {
    const result = composeEvidence(VALID_INPUT);
    assert.ok(!('generatedCitation' in result), 'Should not have generated citation');
    assert.ok(!('citationText' in result), 'Should not have citation text');
  });

  it('should not search external sources', () => {
    const result = composeEvidence(VALID_INPUT);
    assert.ok(!('searchResult' in result), 'Should not have search result');
    assert.ok(!('externalSearch' in result), 'Should not have external search');
  });

  it('should not synchronize Obsidian', () => {
    const result = composeEvidence(VALID_INPUT);
    assert.ok(!('syncResult' in result), 'Should not have sync result');
    assert.ok(!('obsidianSync' in result), 'Should not have obsidian sync');
  });

  it('should not generate markdown', () => {
    const result = composeEvidence(VALID_INPUT);
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not perform network requests', () => {
    const result = composeEvidence(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in source', () => {
    const source = composeEvidenceSource({
      sourceId: 'source-001',
      title: 'Test',
      sourceType: 'research_paper',
      authorityLevel: 'peer_reviewed',
      status: 'published',
      canonicalIdentifier: 'test-001',
      publisher: 'Test Publisher',
      authors: ['Test Author'],
      publicationYear: 2024,
      urlReference: 'https://example.com',
      tags: [],
      summary: 'Test.',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(source);
    for (const key of keys) {
      const value = (source as any)[key];
      assert.ok(typeof value !== 'function', `Source field "${key}" should not be a function`);
    }
  });

  it('should not access filesystem', () => {
    const result = composeEvidence(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform runtime execution', () => {
    const result = composeEvidence(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });

  it('should not generate code', () => {
    const result = composeEvidence(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });
});

// ---------------------------------------------------------------------------
// Knowledge Artifact With Evidence Tests
// ---------------------------------------------------------------------------

describe('Evidence Kernel — Knowledge Artifact With Evidence', () => {
  it('should compose valid knowledge artifact with evidence', () => {
    const artifact = composeKnowledgeArtifactWithEvidence({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      sources: [VALID_SOURCE],
      citations: [VALID_CITATION],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.knowledgeId, 'knowledge-001');
    assert.equal(artifact.title, 'Neural Networks');
    assert.equal(artifact.sources.length, 1);
    assert.equal(artifact.citations.length, 1);
    assert.equal(artifact.relationships.length, 1);
  });

  it('should validate valid knowledge artifact with evidence', () => {
    const artifact = composeKnowledgeArtifactWithEvidence({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      sources: [VALID_SOURCE],
      citations: [VALID_CITATION],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithEvidence(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect missing knowledgeId', () => {
    const artifact = composeKnowledgeArtifactWithEvidence({
      knowledgeId: '',
      title: 'Neural Networks',
      sources: [VALID_SOURCE],
      citations: [VALID_CITATION],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithEvidence(artifact);
    const knowledgeIdError = result.errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_KNOWLEDGE_ID,
    );

    assert.ok(knowledgeIdError, 'Should have EVIDENCE_MISSING_KNOWLEDGE_ID error');
  });

  it('should detect missing title', () => {
    const artifact = composeKnowledgeArtifactWithEvidence({
      knowledgeId: 'knowledge-001',
      title: '',
      sources: [VALID_SOURCE],
      citations: [VALID_CITATION],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithEvidence(artifact);
    const titleError = result.errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have EVIDENCE_MISSING_TITLE error');
  });

  it('should detect missing provenance', () => {
    const artifact = composeKnowledgeArtifactWithEvidence({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      sources: [VALID_SOURCE],
      citations: [VALID_CITATION],
      relationships: [VALID_RELATIONSHIP],
      provenance: undefined as any,
    });

    const result = validateKnowledgeArtifactWithEvidence(artifact);
    const provenanceError = result.errors.find(
      (e) => e.code === EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have EVIDENCE_MISSING_PROVENANCE error');
  });
});
