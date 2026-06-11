import { test, describe } from 'node:test';
import assert from 'node:assert';
import { InMemoryReferenceRepository } from '../reference/InMemoryReferenceRepository.ts';
import { ReferenceRegistry } from '../reference/ReferenceRegistry.ts';
import { InMemoryRetrievalIndexRepository } from './InMemoryRetrievalIndexRepository.ts';
import { RetrievalIndexService } from './RetrievalIndexService.ts';

describe('RetrievalIndexService', () => {
  const setup = async () => {
    const refRepo = new InMemoryReferenceRepository();
    const refRegistry = new ReferenceRegistry(refRepo);
    const indexRepo = new InMemoryRetrievalIndexRepository();
    const service = new RetrievalIndexService(indexRepo, refRegistry);

    await refRegistry.registerReference({
      id: 'ref-a',
      title: 'Attention Mechanism',
      type: 'paper',
      source: 'http://example.com/a'
    });

    await refRegistry.registerReference({
      id: 'ref-b',
      title: 'BERT Bidirectional',
      type: 'paper',
      source: 'http://example.com/b'
    });

    await refRegistry.registerReference({
      id: 'ref-c',
      title: 'PyTorch Deep Learning',
      type: 'repository',
      source: 'http://example.com/c'
    });

    return { refRegistry, service };
  };

  test('should successfully index a reference', async () => {
    const { service } = await setup();
    const entry = await service.indexReference('ref-a', ['attention', 'mechanism', 'transformer']);

    assert.strictEqual(entry.referenceId, 'ref-a');
    assert.deepStrictEqual(entry.keywords, ['attention', 'mechanism', 'transformer']);
    assert.ok(entry.createdAt instanceof Date);
    assert.ok(entry.updatedAt instanceof Date);
  });

  test('should reject empty reference id', async () => {
    const { service } = await setup();
    await assert.rejects(
      service.indexReference('   ', ['keyword']),
      /Reference ID cannot be empty./
    );
  });

  test('should reject non-existent reference id', async () => {
    const { service } = await setup();
    await assert.rejects(
      service.indexReference('non-existent', ['keyword']),
      /Reference does not exist in registry: non-existent/
    );
  });

  test('should reject empty keyword list', async () => {
    const { service } = await setup();
    await assert.rejects(
      service.indexReference('ref-a', []),
      /Keywords must contain at least one non-empty keyword./
    );

    await assert.rejects(
      service.indexReference('ref-a', ['  ', '']),
      /Keywords must contain at least one non-empty keyword./
    );
  });

  test('should normalize and deduplicate keywords', async () => {
    const { service } = await setup();
    const entry = await service.indexReference('ref-a', ['  ATTENTION  ', 'attention', 'mechanism  theory']);
    assert.deepStrictEqual(entry.keywords, ['attention', 'mechanism theory']);
  });

  test('should retrieve indexed reference entry', async () => {
    const { service } = await setup();
    await service.indexReference('ref-a', ['attention']);
    const entry = await service.getIndexedReference('ref-a');
    assert.strictEqual(entry.referenceId, 'ref-a');
    assert.deepStrictEqual(entry.keywords, ['attention']);
  });

  test('should throw error when retrieving non-existent entry', async () => {
    const { service } = await setup();
    await assert.rejects(
      service.getIndexedReference('ref-a'),
      /Index entry not found for reference ID: ref-a/
    );
  });

  test('should list indexed references', async () => {
    const { service } = await setup();
    await service.indexReference('ref-a', ['attention']);
    await service.indexReference('ref-b', ['bert']);

    const list = await service.listIndexedReferences();
    assert.strictEqual(list.length, 2);
  });

  test('should remove indexed reference', async () => {
    const { service } = await setup();
    await service.indexReference('ref-a', ['attention']);
    await service.removeReference('ref-a');

    const list = await service.listIndexedReferences();
    assert.strictEqual(list.length, 0);

    await assert.rejects(
      service.getIndexedReference('ref-a'),
      /Index entry not found for reference ID: ref-a/
    );
  });

  test('should return empty list when searching with empty query', async () => {
    const { service } = await setup();
    await service.indexReference('ref-a', ['attention']);
    const results = await service.search('   ');
    assert.deepStrictEqual(results, []);
  });

  test('should search by exact keyword', async () => {
    const { service } = await setup();
    await service.indexReference('ref-a', ['attention', 'transformer']);
    await service.indexReference('ref-b', ['bert', 'transformer']);

    const results = await service.search('attention');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].referenceId, 'ref-a');
    assert.strictEqual(results[0].score, 1);
    assert.deepStrictEqual(results[0].matchedKeywords, ['attention']);
  });

  test('should search and score correctly by multiple terms', async () => {
    const { service } = await setup();
    await service.indexReference('ref-a', ['attention', 'mechanism', 'transformer']);
    await service.indexReference('ref-b', ['bert', 'transformer']);

    const results = await service.search('attention transformer mechanism');
    assert.strictEqual(results.length, 2);

    assert.strictEqual(results[0].referenceId, 'ref-a');
    assert.strictEqual(results[0].score, 3);
    assert.deepStrictEqual(results[0].matchedKeywords, ['attention', 'transformer', 'mechanism']);

    assert.strictEqual(results[1].referenceId, 'ref-b');
    assert.strictEqual(results[1].score, 1);
    assert.deepStrictEqual(results[1].matchedKeywords, ['transformer']);
  });

  test('should sort tie scores by referenceId ascending', async () => {
    const { service } = await setup();
    await service.indexReference('ref-b', ['transformer']);
    await service.indexReference('ref-a', ['transformer']);

    const results = await service.search('transformer');
    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].referenceId, 'ref-a');
    assert.strictEqual(results[1].referenceId, 'ref-b');
  });

  test('should exclude archived references by default', async () => {
    const { refRegistry, service } = await setup();
    await service.indexReference('ref-a', ['transformer']);
    await service.indexReference('ref-b', ['transformer']);

    await refRegistry.archiveReference('ref-a');

    const results = await service.search('transformer');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].referenceId, 'ref-b');
  });

  test('should include archived references when includeArchived is true', async () => {
    const { refRegistry, service } = await setup();
    await service.indexReference('ref-a', ['transformer']);
    await service.indexReference('ref-b', ['transformer']);

    await refRegistry.archiveReference('ref-a');

    const results = await service.search('transformer', { includeArchived: true });
    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].referenceId, 'ref-a');
    assert.strictEqual(results[1].referenceId, 'ref-b');
  });

  test('should filter search results by type', async () => {
    const { service } = await setup();
    await service.indexReference('ref-a', ['deep-learning']);
    await service.indexReference('ref-c', ['deep-learning']);

    const results = await service.search('deep-learning', { type: 'repository' });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].referenceId, 'ref-c');
  });

  test('should filter search results by status', async () => {
    const { refRegistry, service } = await setup();
    await service.indexReference('ref-a', ['transformer']);
    await service.indexReference('ref-b', ['transformer']);

    await refRegistry.archiveReference('ref-a');

    const resultsActive = await service.search('transformer', { status: 'active', includeArchived: true });
    assert.strictEqual(resultsActive.length, 1);
    assert.strictEqual(resultsActive[0].referenceId, 'ref-b');

    const resultsArchived = await service.search('transformer', { status: 'archived', includeArchived: true });
    assert.strictEqual(resultsArchived.length, 1);
    assert.strictEqual(resultsArchived[0].referenceId, 'ref-a');
  });
});
