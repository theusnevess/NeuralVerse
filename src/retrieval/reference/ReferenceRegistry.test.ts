import { test, describe } from 'node:test';
import assert from 'node:assert';
import { InMemoryReferenceRepository } from './InMemoryReferenceRepository.ts';
import { ReferenceRegistry } from './ReferenceRegistry.ts';

describe('ReferenceRegistry', () => {
  test('should successfully register a reference', async () => {
    const repository = new InMemoryReferenceRepository();
    const registry = new ReferenceRegistry(repository);

    const ref = await registry.registerReference({
      id: 'ref-01',
      title: 'Neural Networks Paper',
      type: 'paper',
      source: 'https://arxiv.org/abs/1234.5678'
    });

    assert.strictEqual(ref.id, 'ref-01');
    assert.strictEqual(ref.title, 'Neural Networks Paper');
    assert.strictEqual(ref.type, 'paper');
    assert.strictEqual(ref.source, 'https://arxiv.org/abs/1234.5678');
    assert.strictEqual(ref.status, 'active');
    assert.ok(ref.createdAt instanceof Date);
    assert.ok(ref.updatedAt instanceof Date);

    const persisted = await repository.getById('ref-01');
    assert.ok(persisted);
    assert.strictEqual(persisted?.title, 'Neural Networks Paper');
  });

  test('should throw error when registering with empty id', async () => {
    const repository = new InMemoryReferenceRepository();
    const registry = new ReferenceRegistry(repository);

    await assert.rejects(
      registry.registerReference({
        id: '   ',
        title: 'Neural Networks Paper',
        type: 'paper',
        source: 'https://arxiv.org/abs/1234.5678'
      }),
      /Reference ID cannot be empty./
    );
  });

  test('should throw error when registering with empty title', async () => {
    const repository = new InMemoryReferenceRepository();
    const registry = new ReferenceRegistry(repository);

    await assert.rejects(
      registry.registerReference({
        id: 'ref-01',
        title: '',
        type: 'paper',
        source: 'https://arxiv.org/abs/1234.5678'
      }),
      /Reference title cannot be empty./
    );
  });

  test('should throw error when registering with empty source', async () => {
    const repository = new InMemoryReferenceRepository();
    const registry = new ReferenceRegistry(repository);

    await assert.rejects(
      registry.registerReference({
        id: 'ref-01',
        title: 'Neural Networks Paper',
        type: 'paper',
        source: ' '
      }),
      /Reference source cannot be empty./
    );
  });

  test('should forbid duplicate reference ids', async () => {
    const repository = new InMemoryReferenceRepository();
    const registry = new ReferenceRegistry(repository);

    await registry.registerReference({
      id: 'ref-dup',
      title: 'First Ref',
      type: 'book',
      source: 'src-1'
    });

    await assert.rejects(
      registry.registerReference({
        id: 'ref-dup',
        title: 'Second Ref',
        type: 'paper',
        source: 'src-2'
      }),
      /Duplicate reference ID forbidden: ref-dup/
    );
  });

  test('should retrieve reference details', async () => {
    const repository = new InMemoryReferenceRepository();
    const registry = new ReferenceRegistry(repository);

    await registry.registerReference({
      id: 'ref-02',
      title: 'Gradient Descent Book',
      type: 'book',
      source: 'http://example.com'
    });

    const retrieved = await registry.getReference('ref-02');
    assert.strictEqual(retrieved.id, 'ref-02');
    assert.strictEqual(retrieved.title, 'Gradient Descent Book');
  });

  test('should throw error when retrieving non-existent reference', async () => {
    const repository = new InMemoryReferenceRepository();
    const registry = new ReferenceRegistry(repository);

    await assert.rejects(
      registry.getReference('non-existent'),
      /Reference not found: non-existent/
    );
  });

  test('should list all references', async () => {
    const repository = new InMemoryReferenceRepository();
    const registry = new ReferenceRegistry(repository);

    await registry.registerReference({
      id: 'ref-01',
      title: 'Ref One',
      type: 'paper',
      source: 'src-1'
    });

    await registry.registerReference({
      id: 'ref-02',
      title: 'Ref Two',
      type: 'book',
      source: 'src-2'
    });

    const list = await registry.listReferences();
    assert.strictEqual(list.length, 2);
    assert.ok(list.some(r => r.id === 'ref-01'));
    assert.ok(list.some(r => r.id === 'ref-02'));
  });

  test('should update reference attributes', async () => {
    const repository = new InMemoryReferenceRepository();
    const registry = new ReferenceRegistry(repository);

    await registry.registerReference({
      id: 'ref-update',
      title: 'Old Title',
      type: 'paper',
      source: 'http://old-source.com'
    });

    const updated = await registry.updateReference('ref-update', {
      title: 'New Title',
      source: 'http://new-source.com'
    });

    assert.strictEqual(updated.title, 'New Title');
    assert.strictEqual(updated.source, 'http://new-source.com');
    assert.strictEqual(updated.type, 'paper');
  });

  test('should throw error when updating with invalid parameters', async () => {
    const repository = new InMemoryReferenceRepository();
    const registry = new ReferenceRegistry(repository);

    await registry.registerReference({
      id: 'ref-update-fail',
      title: 'Title',
      type: 'paper',
      source: 'http://source.com'
    });

    await assert.rejects(
      registry.updateReference('ref-update-fail', { title: ' ' }),
      /Reference title cannot be empty./
    );

    await assert.rejects(
      registry.updateReference('ref-update-fail', { source: '' }),
      /Reference source cannot be empty./
    );
  });

  test('should archive an active reference', async () => {
    const repository = new InMemoryReferenceRepository();
    const registry = new ReferenceRegistry(repository);

    await registry.registerReference({
      id: 'ref-archive',
      title: 'Archivable Ref',
      type: 'code',
      source: 'http://github.com'
    });

    const archived = await registry.archiveReference('ref-archive');
    assert.strictEqual(archived.status, 'archived');

    const retrieved = await registry.getReference('ref-archive');
    assert.strictEqual(retrieved.status, 'archived');
  });
});
