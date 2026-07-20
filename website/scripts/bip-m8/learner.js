/** BIP-M7 learner-state adapter. Backend is durable authority; local is resilience state. */

export function mergeLearnerState(localState, backendState) {
  const local = localState || {};
  const remote = backendState || {};
  const conflicts = [];
  const byKey = (items = []) => new Map(items.map((item) => [String(item.resource_id || item.note_id || item.id), item]));
  const progress = [...byKey(local.progress).values(), ...byKey(remote.progress).values()];
  const progressById = new Map();
  for (const item of progress) {
    const id = String(item.resource_id || item.id);
    const previous = progressById.get(id);
    if (!previous || Number(item.revision || 0) > Number(previous.revision || 0)) progressById.set(id, item);
    else if (previous.revision !== item.revision && item.content_version_id !== previous.content_version_id) conflicts.push({ type: 'progress', id, alternatives: [previous, item] });
  }
  const notes = [...byKey(local.notes).values(), ...byKey(remote.notes).values()];
  const notesById = new Map();
  for (const item of notes) {
    const id = String(item.resource_id || item.note_id || item.id);
    const previous = notesById.get(id);
    if (!previous || Number(item.revision || 0) > Number(previous.revision || 0)) notesById.set(id, item);
    else if (previous && (item.body ?? item.text) !== (previous.body ?? previous.text)) conflicts.push({ type: 'note', id, alternatives: [previous, item] });
  }
  const appendOnly = (field) => [...new Map([...local[field] || [], ...remote[field] || []].map((item) => [String(item.id), item])).values()];
  return Object.freeze({
    ...remote,
    progress: [...progressById.values()],
    notes: [...notesById.values()],
    laboratory_runs: appendOnly('laboratory_runs'),
    assessment_attempts: appendOnly('assessment_attempts'),
    conflicts: [...(remote.conflicts || []), ...conflicts],
  });
}

export function createLearnerSync({ client, cache, learnerId = 'local', onEvent = () => {} } = {}) {
  if (!client) throw new TypeError('learner sync requires a client');
  return {
    async restore() {
      const local = cache?.getLearner(learnerId) || {};
      const remoteResult = client.getState
        ? await client.getState()
        : (await client.getLearnerState()).learnerState;
      const remote = remoteResult?.learnerState || remoteResult;
      const merged = mergeLearnerState(local, remote);
      cache?.setLearner(learnerId, merged);
      onEvent({ type: 'learner_state_restored', conflicts: merged.conflicts?.length || 0 });
      return merged;
    },
    async persist(kind, payload, idempotencyKey) {
      const result = await client.submit(kind, payload, idempotencyKey);
      const current = cache?.getLearner(learnerId) || {};
      cache?.setLearner(learnerId, { ...current, lastMutation: { kind, result } });
      return result;
    },
  };
}
