import { test, describe } from 'node:test';
import assert from 'node:assert';
import { InMemoryReferenceRepository } from '../reference/InMemoryReferenceRepository.ts';
import { ReferenceRegistry } from '../reference/ReferenceRegistry.ts';
import { InMemoryRelationshipRepository } from './InMemoryRelationshipRepository.ts';
import { RelationshipGraph } from './RelationshipGraph.ts';

describe('RelationshipGraph', () => {
  const setup = async () => {
    const refRepo = new InMemoryReferenceRepository();
    const refRegistry = new ReferenceRegistry(refRepo);
    const relRepo = new InMemoryRelationshipRepository();
    const graph = new RelationshipGraph(relRepo, refRegistry);

    await refRegistry.registerReference({
      id: 'ref-a',
      title: 'Reference A',
      type: 'paper',
      source: 'http://source-a.com'
    });

    await refRegistry.registerReference({
      id: 'ref-b',
      title: 'Reference B',
      type: 'book',
      source: 'http://source-b.com'
    });

    return { refRegistry, graph };
  };

  test('should successfully create a relationship', async () => {
    const { graph } = await setup();

    const rel = await graph.createRelationship({
      id: 'rel-1',
      sourceReferenceId: 'ref-a',
      targetReferenceId: 'ref-b',
      type: 'cites',
      context: 'intro section',
      strength: 0.85
    });

    assert.strictEqual(rel.id, 'rel-1');
    assert.strictEqual(rel.sourceReferenceId, 'ref-a');
    assert.strictEqual(rel.targetReferenceId, 'ref-b');
    assert.strictEqual(rel.type, 'cites');
    assert.strictEqual(rel.context, 'intro section');
    assert.strictEqual(rel.strength, 0.85);
    assert.ok(rel.createdAt instanceof Date);
    assert.ok(rel.updatedAt instanceof Date);
  });

  test('should reject duplicate relationship ID', async () => {
    const { graph } = await setup();

    await graph.createRelationship({
      id: 'rel-dup',
      sourceReferenceId: 'ref-a',
      targetReferenceId: 'ref-b',
      type: 'cites'
    });

    await assert.rejects(
      graph.createRelationship({
        id: 'rel-dup',
        sourceReferenceId: 'ref-a',
        targetReferenceId: 'ref-b',
        type: 'cites'
      }),
      /Duplicate relationship ID forbidden: rel-dup/
    );
  });

  test('should reject empty id', async () => {
    const { graph } = await setup();
    await assert.rejects(
      graph.createRelationship({
        id: '  ',
        sourceReferenceId: 'ref-a',
        targetReferenceId: 'ref-b',
        type: 'cites'
      }),
      /Relationship ID cannot be empty./
    );
  });

  test('should reject empty source', async () => {
    const { graph } = await setup();
    await assert.rejects(
      graph.createRelationship({
        id: 'rel-1',
        sourceReferenceId: '',
        targetReferenceId: 'ref-b',
        type: 'cites'
      }),
      /Source reference ID cannot be empty./
    );
  });

  test('should reject empty target', async () => {
    const { graph } = await setup();
    await assert.rejects(
      graph.createRelationship({
        id: 'rel-1',
        sourceReferenceId: 'ref-a',
        targetReferenceId: ' ',
        type: 'cites'
      }),
      /Target reference ID cannot be empty./
    );
  });

  test('should reject empty type', async () => {
    const { graph } = await setup();
    await assert.rejects(
      graph.createRelationship({
        id: 'rel-1',
        sourceReferenceId: 'ref-a',
        targetReferenceId: 'ref-b',
        type: '\t'
      }),
      /Relationship type cannot be empty./
    );
  });

  test('should reject self-relationship', async () => {
    const { graph } = await setup();
    await assert.rejects(
      graph.createRelationship({
        id: 'rel-1',
        sourceReferenceId: 'ref-a',
        targetReferenceId: 'ref-a',
        type: 'cites'
      }),
      /Self-relationship is forbidden./
    );
  });

  test('should reject non-existent source reference', async () => {
    const { graph } = await setup();
    await assert.rejects(
      graph.createRelationship({
        id: 'rel-1',
        sourceReferenceId: 'non-existent',
        targetReferenceId: 'ref-b',
        type: 'cites'
      }),
      /Source reference does not exist in registry: non-existent/
    );
  });

  test('should reject non-existent target reference', async () => {
    const { graph } = await setup();
    await assert.rejects(
      graph.createRelationship({
        id: 'rel-1',
        sourceReferenceId: 'ref-a',
        targetReferenceId: 'non-existent',
        type: 'cites'
      }),
      /Target reference does not exist in registry: non-existent/
    );
  });

  test('should reject invalid strength', async () => {
    const { graph } = await setup();
    await assert.rejects(
      graph.createRelationship({
        id: 'rel-1',
        sourceReferenceId: 'ref-a',
        targetReferenceId: 'ref-b',
        type: 'cites',
        strength: -0.1
      }),
      /Relationship strength must be between 0 and 1 inclusive./
    );

    await assert.rejects(
      graph.createRelationship({
        id: 'rel-2',
        sourceReferenceId: 'ref-a',
        targetReferenceId: 'ref-b',
        type: 'cites',
        strength: 1.1
      }),
      /Relationship strength must be between 0 and 1 inclusive./
    );
  });

  test('should retrieve relationship by id', async () => {
    const { graph } = await setup();
    await graph.createRelationship({
      id: 'rel-1',
      sourceReferenceId: 'ref-a',
      targetReferenceId: 'ref-b',
      type: 'cites'
    });

    const rel = await graph.getRelationship('rel-1');
    assert.strictEqual(rel.id, 'rel-1');
  });

  test('should list all relationships', async () => {
    const { graph } = await setup();
    await graph.createRelationship({
      id: 'rel-1',
      sourceReferenceId: 'ref-a',
      targetReferenceId: 'ref-b',
      type: 'cites'
    });

    const list = await graph.listRelationships();
    assert.strictEqual(list.length, 1);
  });

  test('should list relationships by source', async () => {
    const { graph } = await setup();
    await graph.createRelationship({
      id: 'rel-1',
      sourceReferenceId: 'ref-a',
      targetReferenceId: 'ref-b',
      type: 'cites'
    });

    const list = await graph.listRelationshipsBySource('ref-a');
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].id, 'rel-1');

    const emptyList = await graph.listRelationshipsBySource('ref-b');
    assert.strictEqual(emptyList.length, 0);
  });

  test('should list relationships by target', async () => {
    const { graph } = await setup();
    await graph.createRelationship({
      id: 'rel-1',
      sourceReferenceId: 'ref-a',
      targetReferenceId: 'ref-b',
      type: 'cites'
    });

    const list = await graph.listRelationshipsByTarget('ref-b');
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].id, 'rel-1');

    const emptyList = await graph.listRelationshipsByTarget('ref-a');
    assert.strictEqual(emptyList.length, 0);
  });

  test('should delete relationship', async () => {
    const { graph } = await setup();
    await graph.createRelationship({
      id: 'rel-1',
      sourceReferenceId: 'ref-a',
      targetReferenceId: 'ref-b',
      type: 'cites'
    });

    await graph.deleteRelationship('rel-1');

    const list = await graph.listRelationships();
    assert.strictEqual(list.length, 0);

    await assert.rejects(
      graph.getRelationship('rel-1'),
      /Relationship not found: rel-1/
    );
  });

  test('should traverse direct connections', async () => {
    const { refRegistry, graph } = await setup();

    await refRegistry.registerReference({
      id: 'ref-c',
      title: 'Reference C',
      type: 'code',
      source: 'http://source-c.com'
    });

    await graph.createRelationship({
      id: 'rel-ab',
      sourceReferenceId: 'ref-a',
      targetReferenceId: 'ref-b',
      type: 'cites'
    });

    await graph.createRelationship({
      id: 'rel-ca',
      sourceReferenceId: 'ref-c',
      targetReferenceId: 'ref-a',
      type: 'extends'
    });

    const connections = await graph.traverseDirectConnections('ref-a');
    assert.strictEqual(connections.length, 2);
    assert.ok(connections.some(c => c.id === 'rel-ab'));
    assert.ok(connections.some(c => c.id === 'rel-ca'));
  });
});
