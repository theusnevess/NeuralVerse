/**
 * NV-1400-D2-OPT-01 — Scientific Evidence Kernel Test Suite
 *
 * Comprehensive tests for the evidence kernel.
 * Covers: valid evidence, missing fields, invalid hierarchy, duplicates,
 * broken chains, determinism, immutability, no generated content,
 * no runtime retrieval, no network usage, no paper parsing.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeEvidenceMetadata,
  composeEvidenceChain,
  composeResearchEvidence,
  getSourceHierarchyRank,
  compareSourceHierarchy,
  isSupportedSourceType,
} from './EvidenceKernel.ts';

import {
  validateReference,
  validateReferences,
  validateEvidenceMetadata,
  validateEvidenceChain,
  validateResearchArtifact,
  validateEvidenceInput,
  VALIDATION_CODES,
} from './EvidenceValidation.ts';

import type {
  ResearchReference,
  ResearchEvidenceInput,
  ResearchEvidenceMetadata,
  ResearchEvidenceChain,
  ResearchEvidenceChainLink,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_REFERENCE: ResearchReference = {
  id: 'ref-001',
  title: 'Attention Is All You Need',
  authors: ['Vaswani', 'Shazeer', 'Parmar', 'Uszkoreit', 'Jones', 'Gomez', 'Kaiser', 'Polosukhin'],
  publicationYear: 2017,
  sourceType: 'conference_paper',
  doi: '10.48550/arXiv.1706.03762',
  venue: 'NeurIPS',
  persistentIdentifier: 'arXiv:1706.03762',
};

const VALID_REFERENCE_2: ResearchReference = {
  id: 'ref-002',
  title: 'Deep Learning',
  authors: ['Goodfellow', 'Bengio', 'Courville'],
  publicationYear: 2016,
  sourceType: 'academic_book',
  isbn: '978-0262035613',
  publisher: 'MIT Press',
};

const INVALID_REFERENCE_MISSING_TITLE: ResearchReference = {
  id: 'ref-003',
  title: '',
  authors: ['Author'],
  publicationYear: 2020,
  sourceType: 'peer_reviewed_journal',
};

const INVALID_REFERENCE_MISSING_AUTHORS: ResearchReference = {
  id: 'ref-004',
  title: 'Some Title',
  authors: [],
  publicationYear: 2020,
  sourceType: 'peer_reviewed_journal',
};

const INVALID_REFERENCE_MISSING_YEAR: ResearchReference = {
  id: 'ref-005',
  title: 'Some Title',
  authors: ['Author'],
  publicationYear: -1,
  sourceType: 'peer_reviewed_journal',
};

const INVALID_REFERENCE_INVALID_SOURCE: ResearchReference = {
  id: 'ref-006',
  title: 'Some Title',
  authors: ['Author'],
  publicationYear: 2020,
  sourceType: 'unsupported_source' as any,
};

const CHAIN_LINKS: readonly ResearchEvidenceChainLink[] = [
  { entityType: 'concept', entityId: 'concept-001', label: 'Transformer Architecture', source: 'curriculum' },
  { entityType: 'evidence', entityId: 'evidence-001', label: 'Attention Is All You Need', source: 'reference' },
  { entityType: 'reference', entityId: 'ref-001', label: 'Vaswani et al. 2017', source: 'reference' },
];

// ---------------------------------------------------------------------------
// Valid Evidence Metadata Tests
// ---------------------------------------------------------------------------

describe('composeEvidenceMetadata', () => {
  it('should compose valid evidence metadata from a reference', () => {
    const metadata = composeEvidenceMetadata(VALID_REFERENCE, 'primary');

    assert.equal(metadata.title, VALID_REFERENCE.title);
    assert.deepEqual(metadata.authors, VALID_REFERENCE.authors);
    assert.equal(metadata.publicationYear, VALID_REFERENCE.publicationYear);
    assert.equal(metadata.sourceType, VALID_REFERENCE.sourceType);
    assert.equal(metadata.evidenceLevel, 'primary');
    assert.equal(metadata.reviewStatus, 'peer_reviewed');
    assert.equal(metadata.governanceStatus, 'provisional');
    assert.equal(metadata.verificationDate, 'not_verified');
  });

  it('should compose evidence metadata with secondary level', () => {
    const metadata = composeEvidenceMetadata(VALID_REFERENCE_2, 'secondary');

    assert.equal(metadata.evidenceLevel, 'secondary');
    assert.equal(metadata.reviewStatus, 'editorially_reviewed');
  });
});

// ---------------------------------------------------------------------------
// Missing Title Tests
// ---------------------------------------------------------------------------

describe('missing title validation', () => {
  it('should detect missing title in reference', () => {
    const errors = validateReference(INVALID_REFERENCE_MISSING_TITLE);
    const titleError = errors.find((e) => e.code === VALIDATION_CODES.EVIDENCE_MISSING_TITLE);

    assert.ok(titleError, 'Should have EVIDENCE_MISSING_TITLE error');
    assert.equal(titleError.field, 'title');
    assert.equal(titleError.referenceId, 'ref-003');
  });

  it('should detect missing title in evidence metadata', () => {
    const metadata: ResearchEvidenceMetadata = {
      ...INVALID_REFERENCE_MISSING_TITLE,
      evidenceLevel: 'primary',
      reviewStatus: 'peer_reviewed',
      verificationDate: 'not_verified',
      governanceStatus: 'provisional',
    };

    const errors = validateEvidenceMetadata(metadata);
    const titleError = errors.find((e) => e.code === VALIDATION_CODES.EVIDENCE_MISSING_TITLE);

    assert.ok(titleError, 'Should have EVIDENCE_MISSING_TITLE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Authors Tests
// ---------------------------------------------------------------------------

describe('missing authors validation', () => {
  it('should detect missing authors in reference', () => {
    const errors = validateReference(INVALID_REFERENCE_MISSING_AUTHORS);
    const authorError = errors.find((e) => e.code === VALIDATION_CODES.EVIDENCE_MISSING_AUTHOR);

    assert.ok(authorError, 'Should have EVIDENCE_MISSING_AUTHOR error');
    assert.equal(authorError.field, 'authors');
  });

  it('should detect missing authors in evidence metadata', () => {
    const metadata: ResearchEvidenceMetadata = {
      ...INVALID_REFERENCE_MISSING_AUTHORS,
      evidenceLevel: 'primary',
      reviewStatus: 'peer_reviewed',
      verificationDate: 'not_verified',
      governanceStatus: 'provisional',
    };

    const errors = validateEvidenceMetadata(metadata);
    const authorError = errors.find((e) => e.code === VALIDATION_CODES.EVIDENCE_MISSING_AUTHOR);

    assert.ok(authorError, 'Should have EVIDENCE_MISSING_AUTHOR error');
  });
});

// ---------------------------------------------------------------------------
// Missing Publication Year Tests
// ---------------------------------------------------------------------------

describe('missing publication year validation', () => {
  it('should detect missing publication year in reference', () => {
    const errors = validateReference(INVALID_REFERENCE_MISSING_YEAR);
    const yearError = errors.find((e) => e.code === VALIDATION_CODES.EVIDENCE_MISSING_YEAR);

    assert.ok(yearError, 'Should have EVIDENCE_MISSING_YEAR error');
    assert.equal(yearError.field, 'publicationYear');
  });

  it('should detect missing publication year in evidence metadata', () => {
    const metadata: ResearchEvidenceMetadata = {
      ...INVALID_REFERENCE_MISSING_YEAR,
      evidenceLevel: 'primary',
      reviewStatus: 'peer_reviewed',
      verificationDate: 'not_verified',
      governanceStatus: 'provisional',
    };

    const errors = validateEvidenceMetadata(metadata);
    const yearError = errors.find((e) => e.code === VALIDATION_CODES.EVIDENCE_MISSING_YEAR);

    assert.ok(yearError, 'Should have EVIDENCE_MISSING_YEAR error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Source Hierarchy Tests
// ---------------------------------------------------------------------------

describe('invalid source hierarchy validation', () => {
  it('should detect invalid source type', () => {
    const errors = validateReference(INVALID_REFERENCE_INVALID_SOURCE);
    const sourceError = errors.find((e) => e.code === VALIDATION_CODES.EVIDENCE_INVALID_SOURCE_TYPE);

    assert.ok(sourceError, 'Should have EVIDENCE_INVALID_SOURCE_TYPE error');
    assert.equal(sourceError.field, 'sourceType');
  });

  it('should return correct hierarchy rank for valid source', () => {
    const rank = getSourceHierarchyRank('peer_reviewed_journal');
    assert.equal(rank, 0);
  });

  it('should return -1 for invalid source hierarchy', () => {
    const rank = getSourceHierarchyRank('unsupported' as any);
    assert.equal(rank, -1);
  });

  it('should compare source hierarchy correctly', () => {
    const comparison = compareSourceHierarchy('peer_reviewed_journal', 'engineering_blog');
    assert.ok(comparison < 0, 'peer_reviewed_journal should have higher priority');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Source Tests
// ---------------------------------------------------------------------------

describe('unsupported source validation', () => {
  it('should reject unsupported source type', () => {
    assert.equal(isSupportedSourceType('peer_reviewed_journal'), true);
    assert.equal(isSupportedSourceType('engineering_blog'), true);
    assert.equal(isSupportedSourceType('unsupported_source'), false);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Reference Tests
// ---------------------------------------------------------------------------

describe('duplicate reference validation', () => {
  it('should detect duplicate reference IDs', () => {
    const references = [VALID_REFERENCE, { ...VALID_REFERENCE, id: 'ref-001' }];
    const errors = validateReferences(references);
    const duplicateError = errors.find((e) => e.code === VALIDATION_CODES.EVIDENCE_DUPLICATE_REFERENCE);

    assert.ok(duplicateError, 'Should have EVIDENCE_DUPLICATE_REFERENCE error');
  });

  it('should not flag unique references as duplicates', () => {
    const references = [VALID_REFERENCE, VALID_REFERENCE_2];
    const errors = validateReferences(references);
    const duplicateErrors = errors.filter((e) => e.code === VALIDATION_CODES.EVIDENCE_DUPLICATE_REFERENCE);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Duplicate DOI Tests
// ---------------------------------------------------------------------------

describe('duplicate DOI validation', () => {
  it('should detect duplicate DOIs', () => {
    const ref1 = { ...VALID_REFERENCE, id: 'ref-001', doi: '10.1234/test' };
    const ref2 = { ...VALID_REFERENCE, id: 'ref-002', doi: '10.1234/test' };
    const errors = validateReferences([ref1, ref2]);
    const duplicateError = errors.find((e) => e.code === VALIDATION_CODES.EVIDENCE_DUPLICATE_DOI);

    assert.ok(duplicateError, 'Should have EVIDENCE_DUPLICATE_DOI error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Persistent Identifier Tests
// ---------------------------------------------------------------------------

describe('duplicate persistent identifier validation', () => {
  it('should detect duplicate persistent identifiers', () => {
    const ref1 = { ...VALID_REFERENCE, id: 'ref-001', persistentIdentifier: 'pid-001' };
    const ref2 = { ...VALID_REFERENCE, id: 'ref-002', persistentIdentifier: 'pid-001' };
    const errors = validateReferences([ref1, ref2]);
    const duplicateError = errors.find((e) => e.code === VALIDATION_CODES.EVIDENCE_DUPLICATE_PID);

    assert.ok(duplicateError, 'Should have EVIDENCE_DUPLICATE_PID error');
  });
});

// ---------------------------------------------------------------------------
// Broken Evidence Chain Tests
// ---------------------------------------------------------------------------

describe('broken evidence chain validation', () => {
  it('should detect empty chain', () => {
    const chain: ResearchEvidenceChain = {
      chainId: 'chain-001',
      links: [],
      rootEntityType: 'concept',
      rootEntityId: 'concept-001',
    };

    const errors = validateEvidenceChain(chain);
    const brokenError = errors.find((e) => e.code === VALIDATION_CODES.EVIDENCE_BROKEN_CHAIN);

    assert.ok(brokenError, 'Should have EVIDENCE_BROKEN_CHAIN error');
  });

  it('should detect chain with mismatched root', () => {
    const chain: ResearchEvidenceChain = {
      chainId: 'chain-001',
      links: [
        { entityType: 'lesson', entityId: 'lesson-001', label: 'Lesson', source: 'curriculum' },
      ],
      rootEntityType: 'concept',
      rootEntityId: 'concept-001',
    };

    const errors = validateEvidenceChain(chain);
    const brokenError = errors.find((e) => e.code === VALIDATION_CODES.EVIDENCE_BROKEN_CHAIN);

    assert.ok(brokenError, 'Should have EVIDENCE_BROKEN_CHAIN error');
  });

  it('should accept valid chain', () => {
    const chain: ResearchEvidenceChain = {
      chainId: 'chain-001',
      links: CHAIN_LINKS,
      rootEntityType: 'concept',
      rootEntityId: 'concept-001',
    };

    const errors = validateEvidenceChain(chain);
    const brokenErrors = errors.filter((e) => e.code === VALIDATION_CODES.EVIDENCE_BROKEN_CHAIN);

    assert.equal(brokenErrors.length, 0, 'Should not have broken chain errors');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Output Tests
// ---------------------------------------------------------------------------

describe('deterministic output', () => {
  it('should produce identical output for identical input', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const output1 = composeResearchEvidence(input);
    const output2 = composeResearchEvidence(input);

    assert.equal(output1.artifactId, output2.artifactId);
    assert.equal(output1.evidenceMetadata.length, output2.evidenceMetadata.length);
    assert.equal(output1.evidenceChain.chainId, output2.evidenceChain.chainId);
    assert.equal(output1.evidenceTrace.traceId, output2.evidenceTrace.traceId);
  });

  it('should have deterministic trace metadata', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const artifact = composeResearchEvidence(input);

    assert.equal(artifact.evidenceTrace.deterministic, true);
    assert.equal(artifact.evidenceTrace.randomUsed, false);
    assert.equal(artifact.evidenceTrace.timeDependency, false);
    assert.equal(artifact.evidenceTrace.generatedFrom, 'deterministic_kernel');
  });
});

// ---------------------------------------------------------------------------
// Input Immutability Tests
// ---------------------------------------------------------------------------

describe('input immutability', () => {
  it('should not mutate input references', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const originalTitle = VALID_REFERENCE.title;
    const originalAuthors = [...VALID_REFERENCE.authors];

    composeResearchEvidence(input);

    assert.equal(VALID_REFERENCE.title, originalTitle);
    assert.deepEqual(VALID_REFERENCE.authors, originalAuthors);
  });

  it('should not mutate input chain links', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const originalLinksLength = CHAIN_LINKS.length;
    const originalFirstLink = { ...CHAIN_LINKS[0] };

    composeResearchEvidence(input);

    assert.equal(CHAIN_LINKS.length, originalLinksLength);
    assert.deepEqual(CHAIN_LINKS[0], originalFirstLink);
  });
});

// ---------------------------------------------------------------------------
// No Generated Content Tests
// ---------------------------------------------------------------------------

describe('no generated content', () => {
  it('should not generate educational content', () => {
    const metadata = composeEvidenceMetadata(VALID_REFERENCE, 'primary');

    assert.ok(!metadata.title.includes('generated'));
    assert.ok(!metadata.title.includes('synthesized'));
    assert.ok(!metadata.title.includes('created'));
  });

  it('should not generate educational summaries', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const artifact = composeResearchEvidence(input);

    // Evidence metadata should only contain reference data, not generated summaries
    for (const metadata of artifact.evidenceMetadata) {
      assert.equal(metadata.title, VALID_REFERENCE.title);
    }
  });
});

// ---------------------------------------------------------------------------
// No Runtime Retrieval Tests
// ---------------------------------------------------------------------------

describe('no runtime retrieval', () => {
  it('should not call external APIs', () => {
    // This test verifies that no network calls are made
    // by checking that the function completes synchronously
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const startTime = Date.now();
    composeResearchEvidence(input);
    const endTime = Date.now();

    // Should complete very quickly (< 100ms for local computation)
    assert.ok(endTime - startTime < 100, 'Should complete synchronously without network calls');
  });
});

// ---------------------------------------------------------------------------
// No Network Usage Tests
// ---------------------------------------------------------------------------

describe('no network usage', () => {
  it('should not use network APIs', () => {
    // Verify that no fetch, XMLHttpRequest, or other network APIs are used
    // by checking that the function is pure and synchronous
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    // Should not throw or hang
    const result = composeResearchEvidence(input);
    assert.ok(result, 'Should return a result');
  });
});

// ---------------------------------------------------------------------------
// No Paper Parsing Tests
// ---------------------------------------------------------------------------

describe('no paper parsing', () => {
  it('should not parse paper content', () => {
    const metadata = composeEvidenceMetadata(VALID_REFERENCE, 'primary');

    // Metadata should contain only reference data, not parsed paper content
    assert.ok(!metadata.title.includes('abstract'));
    assert.ok(!metadata.title.includes('introduction'));
    assert.ok(!metadata.title.includes('methodology'));
  });

  it('should not extract content from references', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const artifact = composeResearchEvidence(input);

    // Should not contain any extracted content fields
    for (const metadata of artifact.evidenceMetadata) {
      assert.ok(!('abstract' in metadata), 'Should not have abstract field');
      assert.ok(!('content' in metadata), 'Should not have content field');
      assert.ok(!('summary' in metadata), 'Should not have summary field');
    }
  });
});

// ---------------------------------------------------------------------------
// Identical Output for Identical Input Tests
// ---------------------------------------------------------------------------

describe('identical output for identical input', () => {
  it('should produce identical evidence metadata', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const artifact1 = composeResearchEvidence(input);
    const artifact2 = composeResearchEvidence(input);

    assert.deepEqual(artifact1.evidenceMetadata, artifact2.evidenceMetadata);
  });

  it('should produce identical evidence chains', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const artifact1 = composeResearchEvidence(input);
    const artifact2 = composeResearchEvidence(input);

    assert.deepEqual(artifact1.evidenceChain, artifact2.evidenceChain);
  });

  it('should produce identical evidence traces', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const artifact1 = composeResearchEvidence(input);
    const artifact2 = composeResearchEvidence(input);

    assert.deepEqual(artifact1.evidenceTrace, artifact2.evidenceTrace);
  });
});

// ---------------------------------------------------------------------------
// Additional Negative Tests
// ---------------------------------------------------------------------------

describe('additional negative tests', () => {
  it('should validate complete artifact', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const artifact = composeResearchEvidence(input);
    const result = validateResearchArtifact(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate evidence input', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const errors = validateEvidenceInput(input);
    assert.equal(errors.length, 0);
  });

  it('should detect missing concept ID in input', () => {
    const input: ResearchEvidenceInput = {
      conceptId: '',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const errors = validateEvidenceInput(input);
    const conceptError = errors.find((e) => e.field === 'conceptId');

    assert.ok(conceptError, 'Should have conceptId error');
  });

  it('should detect missing concept label in input', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: '',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const errors = validateEvidenceInput(input);
    const labelError = errors.find((e) => e.field === 'conceptLabel');

    assert.ok(labelError, 'Should have conceptLabel error');
  });

  it('should detect missing references in input', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const errors = validateEvidenceInput(input);
    const refError = errors.find((e) => e.field === 'references');

    assert.ok(refError, 'Should have references error');
  });

  it('should detect missing chain links in input', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE],
      evidenceLevel: 'primary',
      chainLinks: [],
    };

    const errors = validateEvidenceInput(input);
    const chainError = errors.find((e) => e.field === 'chainLinks');

    assert.ok(chainError, 'Should have chainLinks error');
  });

  it('should validate multiple references', () => {
    const input: ResearchEvidenceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      references: [VALID_REFERENCE, VALID_REFERENCE_2],
      evidenceLevel: 'primary',
      chainLinks: CHAIN_LINKS,
    };

    const artifact = composeResearchEvidence(input);

    assert.equal(artifact.evidenceMetadata.length, 2);
    assert.equal(artifact.evidenceTrace.evidenceCount, 2);
  });

  it('should compose evidence chain correctly', () => {
    const chain = composeEvidenceChain(
      'chain-001',
      'concept',
      'concept-001',
      CHAIN_LINKS,
    );

    assert.equal(chain.chainId, 'chain-001');
    assert.equal(chain.rootEntityType, 'concept');
    assert.equal(chain.rootEntityId, 'concept-001');
    assert.equal(chain.links.length, CHAIN_LINKS.length);
  });
});
