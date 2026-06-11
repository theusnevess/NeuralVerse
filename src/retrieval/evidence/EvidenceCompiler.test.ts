import { test, describe } from 'node:test';
import assert from 'node:assert';
import { InMemoryReferenceRepository } from '../reference/InMemoryReferenceRepository.ts';
import { ReferenceRegistry } from '../reference/ReferenceRegistry.ts';
import { InMemoryRelationshipRepository } from '../relationship/InMemoryRelationshipRepository.ts';
import { RelationshipGraph } from '../relationship/RelationshipGraph.ts';
import { InMemoryRetrievalIndexRepository } from '../index/InMemoryRetrievalIndexRepository.ts';
import { RetrievalIndexService } from '../index/RetrievalIndexService.ts';
import { EvidenceCompiler } from './EvidenceCompiler.ts';

describe('EvidenceCompiler', () => {
  const setup = async () => {
    const refRepo = new InMemoryReferenceRepository();
    const refRegistry = new ReferenceRegistry(refRepo);

    const relRepo = new InMemoryRelationshipRepository();
    const graph = new RelationshipGraph(relRepo, refRegistry);

    const indexRepo = new InMemoryRetrievalIndexRepository();
    const indexService = new RetrievalIndexService(indexRepo, refRegistry);

    const compiler = new EvidenceCompiler(refRegistry, indexService, graph);

    await refRegistry.registerReference({
      id: 'ref-a',
      title: 'Attention Mechanism Paper',
      type: 'paper',
      source: 'http://source-a.com'
    });
    await refRegistry.registerReference({
      id: 'ref-b',
      title: 'Transformer Architecture Paper',
      type: 'paper',
      source: 'http://source-b.com'
    });
    await refRegistry.registerReference({
      id: 'ref-c',
      title: 'PyTorch Framework Library',
      type: 'repository',
      source: 'http://source-c.com'
    });

    await indexService.indexReference('ref-a', ['attention', 'mechanism', 'deep-learning']);
    await indexService.indexReference('ref-b', ['transformer', 'architecture', 'deep-learning']);
    await indexService.indexReference('ref-c', ['pytorch', 'deep-learning']);

    return { refRegistry, graph, indexService, compiler };
  };

  test('should compile from query with multiple matches and relationships (high confidence)', async () => {
    const { graph, compiler } = await setup();

    await graph.createRelationship({
      id: 'rel-ab',
      sourceReferenceId: 'ref-a',
      targetReferenceId: 'ref-b',
      type: 'cites'
    });

    const comp = await compiler.compileFromQuery('deep-learning');

    assert.strictEqual(comp.mode, 'query');
    assert.strictEqual(comp.input, 'deep-learning');
    assert.strictEqual(comp.matchedReferences.length, 3);
    assert.strictEqual(comp.relationships.length, 1);
    assert.strictEqual(comp.relatedReferences.length, 0);
    assert.strictEqual(comp.confidence, 'high');
    assert.ok(comp.summary.includes('Confidence level is assessed as high'));
  });

  test('should compile from query with one match and no relationships (medium confidence)', async () => {
    const { compiler } = await setup();
    const comp = await compiler.compileFromQuery('pytorch');

    assert.strictEqual(comp.matchedReferences.length, 1);
    assert.strictEqual(comp.relationships.length, 0);
    assert.strictEqual(comp.confidence, 'medium');
    assert.ok(comp.summary.includes('Confidence level is assessed as medium'));
  });

  test('should compile from query with no matches (low confidence)', async () => {
    const { compiler } = await setup();
    const comp = await compiler.compileFromQuery('non-existent-keyword');

    assert.strictEqual(comp.matchedReferences.length, 0);
    assert.strictEqual(comp.relationships.length, 0);
    assert.strictEqual(comp.confidence, 'low');
    assert.ok(comp.summary.includes('No evidence was found'));
  });

  test('should reject empty query', async () => {
    const { compiler } = await setup();
    await assert.rejects(
      compiler.compileFromQuery('  '),
      /Query cannot be empty./
    );
  });

  test('should compile from reference with multiple relationships (high confidence)', async () => {
    const { graph, compiler } = await setup();

    await graph.createRelationship({
      id: 'rel-ab',
      sourceReferenceId: 'ref-a',
      targetReferenceId: 'ref-b',
      type: 'cites'
    });

    await graph.createRelationship({
      id: 'rel-ac',
      sourceReferenceId: 'ref-a',
      targetReferenceId: 'ref-c',
      type: 'implements'
    });

    const comp = await compiler.compileFromReference('ref-a');

    assert.strictEqual(comp.mode, 'reference');
    assert.strictEqual(comp.input, 'ref-a');
    assert.strictEqual(comp.matchedReferences.length, 1);
    assert.strictEqual(comp.matchedReferences[0].referenceId, 'ref-a');
    assert.strictEqual(comp.relationships.length, 2);
    assert.strictEqual(comp.relatedReferences.length, 2);
    assert.strictEqual(comp.confidence, 'high');
  });

  test('should compile from reference with one relationship (medium confidence)', async () => {
    const { graph, compiler } = await setup();

    await graph.createRelationship({
      id: 'rel-ab',
      sourceReferenceId: 'ref-a',
      targetReferenceId: 'ref-b',
      type: 'cites'
    });

    const comp = await compiler.compileFromReference('ref-a');
    assert.strictEqual(comp.relationships.length, 1);
    assert.strictEqual(comp.confidence, 'medium');
  });

  test('should compile from reference with no relationships (low confidence)', async () => {
    const { compiler } = await setup();

    const comp = await compiler.compileFromReference('ref-a');
    assert.strictEqual(comp.relationships.length, 0);
    assert.strictEqual(comp.confidence, 'low');
  });

  test('should reject empty referenceId', async () => {
    const { compiler } = await setup();
    await assert.rejects(
      compiler.compileFromReference('  '),
      /Reference ID cannot be empty./
    );
  });

  test('should reject non-existent referenceId', async () => {
    const { compiler } = await setup();
    await assert.rejects(
      compiler.compileFromReference('non-existent'),
      /Reference not found: non-existent/
    );
  });
});
