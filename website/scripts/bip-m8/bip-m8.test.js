import assert from 'node:assert/strict';
import test from 'node:test';
import { createBipM8Cache } from './cache.js';
import { createBipM8Client } from './client.js';
import { ContractError, decodePublishedLearningPackage, IntegrationState } from './contract.js';
import { createBipM8Flags } from './flags.js';
import { mergeLearnerState } from './learner.js';
import { createRendererRegistry, RendererFamily } from './renderers.js';
import { createLearnerSubmissionClient } from './submission.js';
import { createWorkflowProgressClient } from './workflow.js';
import { CANONICAL_RELEASE_REGISTRY, createReleaseRegistry, RELEASE_REGISTRY_SCHEMA } from './release-registry.js';

const store = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
};

function packagePayload(overrides = {}) {
  return {
    contract_name: 'PublishedLearningPackage', contract_version: '1.0.0', release_schema_version: '1.0.0',
    release_id: 'release-1', publication_release_id: 'release-1', content_package_id: 'package-1', content_version_id: 'version-1',
    generated_from_manifest_id: 'manifest-1', publication_manifest_id: 'publication-manifest-1', released_at: '2026-07-20T00:00:00Z',
    blocks: [
      { content_block_id: 'block-1', block_type: 'overview', sequence_position: 0, semantic_payload: { text: 'Overview' }, extensions: { future: true } },
      { content_block_id: 'block-2', block_type: 'math', sequence_position: 1, semantic_payload: { text: 'x = 1' } },
    ], sources: [], citations: [], assets: [], laboratories: [], assessments: [], provenance: { approved: true }, ...overrides,
  };
}

test('decodes exact package identity and preserves canonical order/extensions', () => {
  const decoded = decodePublishedLearningPackage(packagePayload());
  assert.equal(decoded.publicationReleaseId, 'release-1');
  assert.deepEqual(decoded.blocks.map((block) => block.content_block_id), ['block-1', 'block-2']);
  assert.equal(decoded.blocks[0].extensions.future, true);
});

test('rejects duplicate and reordered blocks without silent repair', () => {
  assert.throws(() => decodePublishedLearningPackage(packagePayload({ blocks: [
    { content_block_id: 'block-2', block_type: 'math', sequence_position: 1, semantic_payload: {} },
    { content_block_id: 'block-1', block_type: 'overview', sequence_position: 0, semantic_payload: {} },
  ] })), ContractError);
  assert.throws(() => decodePublishedLearningPackage(packagePayload({ blocks: [
    { content_block_id: 'same', block_type: 'overview', sequence_position: 0, semantic_payload: {} },
    { content_block_id: 'same', block_type: 'math', sequence_position: 1, semantic_payload: {} },
  ] })), ContractError);
});

test('uses exact-release ETag cache and reuses validated representation on 304', async () => {
  const storage = store(); const cache = createBipM8Cache({ storage, assetStorage: store(), learnerStorage: store() });
  let calls = 0;
  const fetchImpl = async (_url, options) => {
    calls += 1;
    if (calls === 1) return new Response(JSON.stringify(packagePayload()), { status: 200, headers: { ETag: 'W/"release-1"' } });
    assert.equal(options.headers['If-None-Match'], 'W/"release-1"');
    return new Response(null, { status: 304 });
  };
  const client = createBipM8Client({ fetchImpl, cache });
  assert.equal((await client.getRelease('release-1')).state, IntegrationState.READY);
  const second = await client.getRelease('release-1');
  assert.equal(second.state, IntegrationState.READY); assert.equal(second.fromCache, true); assert.equal(calls, 2);
});

test('does not substitute a different release when transport is offline', async () => {
  const cache = createBipM8Cache({ storage: store(), assetStorage: store(), learnerStorage: store() });
  const client = createBipM8Client({ fetchImpl: async () => { throw new Error('offline'); }, cache });
  const result = await client.getRelease('never-cached');
  assert.equal(result.state, IntegrationState.TRANSPORT_ERROR);
});

test('merge preserves newest revision, alternatives and append-only records', () => {
  const merged = mergeLearnerState(
    { progress: [{ id: 'lesson', revision: 1, progress: 0.2 }], notes: [{ id: 'n', revision: 1, body: 'local' }], laboratory_runs: [{ id: 'run-1' }] },
    { progress: [{ id: 'lesson', revision: 2, progress: 0.8 }], notes: [{ id: 'n', revision: 2, body: 'server' }], laboratory_runs: [{ id: 'run-2' }] },
  );
  assert.equal(merged.progress[0].progress, 0.8); assert.equal(merged.notes[0].body, 'server'); assert.equal(merged.laboratory_runs.length, 2);
});

test('merge understands the BIP-M7 learner-state note shape', () => {
  const merged = mergeLearnerState(
    { notes: [{ note_id: 'n', revision: 1, text: 'local' }] },
    { notes: [{ note_id: 'n', revision: 2, text: 'server' }] },
  );
  assert.equal(merged.notes[0].text, 'server');
  assert.equal(merged.notes[0].note_id, 'n');
});

test('learner client validates the BIP-M7 state schema', async () => {
  const client = createBipM8Client({ fetchImpl: async () => new Response(JSON.stringify({ schema_version: 'learner-state:1.0.0', progress: [], notes: [] }), { status: 200 }) });
  const result = await client.getLearnerState();
  assert.equal(result.state, IntegrationState.READY);
  assert.equal(result.learnerState.schema_version, 'learner-state:1.0.0');
});

test('learner submissions use the strict BIP-M7 payload names', async () => {
  let request;
  const submissions = createLearnerSubmissionClient({
    fetchImpl: async (url, options) => {
      request = { url, options, body: JSON.parse(options.body) };
      return new Response(JSON.stringify({ accepted: true }), { status: 200 });
    },
  });
  await submissions.assessment({ content_version_id: 'version-1', assessment_spec_id: 'assessment-1', assessment_spec_version: '1.0.0', responses: {} }, 'key-1');
  assert.equal(request.url, '/api/v1/learner/assessment-attempts');
  assert.deepEqual(request.body, { content_version_id: 'version-1', assessment_spec_id: 'assessment-1', assessment_spec_version: '1.0.0', responses: {} });
  assert.equal(request.options.headers['Idempotency-Key'], 'key-1');
});

test('flags default off and renderer registry has explicit unsupported fallback', () => {
  const flags = createBipM8Flags();
  assert.equal(flags.isEnabled('packageDelivery'), false);
  const registry = createRendererRegistry();
  assert.equal(registry.resolve({ block_type: 'text' }).family, RendererFamily.TEXT);
  assert.equal(registry.resolve({ block_type: 'math' }).family, RendererFamily.MATH);
  assert.equal(registry.resolve({ block_type: 'future_block' }).supported, false);
});

test('global feature-flag values are the controller defaults', async () => {
  const { bipM8Flags } = await import('./flags.js');
  assert.equal(bipM8Flags.isEnabled('packageDelivery'), false);
  assert.equal(typeof bipM8Flags.names.packageDelivery, 'string');
});

test('canonical release registry is versioned, exact and independent of harness globals', () => {
  const registry = createReleaseRegistry(CANONICAL_RELEASE_REGISTRY);
  const entry = registry.resolve('svd-image-compression');
  assert.equal(registry.schemaVersion, RELEASE_REGISTRY_SCHEMA);
  assert.equal(entry.publicationReleaseId, '9e3d4c65-9b7c-4f20-8a95-8f6ce2f0d703');
  assert.equal(registry.resolve('unknown-route'), null);
  assert.throws(() => createReleaseRegistry({ ...CANONICAL_RELEASE_REGISTRY, entries: [...CANONICAL_RELEASE_REGISTRY.entries, CANONICAL_RELEASE_REGISTRY.entries[0]] }), ContractError);
});

test('workflow client deduplicates SSE events and closes on terminal state', () => {
  let instance;
  const received = [];
  const client = createWorkflowProgressClient({ eventSourceFactory: () => { instance = { close: () => { instance.closed = true; } }; return instance; }, onEvent: (event) => received.push(event) });
  client.connect('job-1');
  instance.onmessage({ lastEventId: '1', data: JSON.stringify({ schema_name: 'WorkflowProgressEvent', schema_version: '1.0.0', workflow_id: 'job-1', event_id: '1', status: 'RUNNING', terminal: false }) });
  instance.onmessage({ lastEventId: '1', data: JSON.stringify({ schema_name: 'WorkflowProgressEvent', schema_version: '1.0.0', workflow_id: 'job-1', event_id: '1', status: 'RUNNING', terminal: false }) });
  instance.onmessage({ lastEventId: '2', data: JSON.stringify({ schema_name: 'WorkflowProgressEvent', schema_version: '1.0.0', workflow_id: 'job-1', event_id: '2', status: 'SUCCEEDED', terminal: true }) });
  assert.equal(received.length, 2); assert.equal(client.getLastEventId(), '2'); assert.equal(instance.closed, true);
});

test('fetch workflow reconnect sends Last-Event-ID and validates the projection schema', async () => {
  const calls = [];
  const stream = (payload) => new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(`id: ${payload.event_id}\nevent: workflow.progress\ndata: ${JSON.stringify(payload)}\n\n`)); controller.close(); } });
  const fetchImpl = async (_url, options) => { calls.push(options.headers); return new Response(stream({ schema_name: 'WorkflowProgressEvent', schema_version: '1.0.0', workflow_id: 'job-2', event_id: calls.length === 1 ? '1' : '2', status: calls.length === 1 ? 'RUNNING' : 'SUCCEEDED', terminal: calls.length > 1 })); };
  const events = [];
  const client = createWorkflowProgressClient({ fetchImpl, viewerIdentity: 'learner:1', onEvent: (event) => events.push(event), maxReconnects: 0 });
  await client.connect('job-2');
  client.close();
  await client.connect('job-2');
  assert.equal(calls[0]['X-NV-Viewer-Identity'], 'learner:1');
  assert.equal(calls[1]['Last-Event-ID'], '1');
  assert.equal(events.length, 2);
});
