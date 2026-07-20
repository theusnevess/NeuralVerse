/** Separate exact-release package, asset and learner resilience stores. */

function memoryStore() {
  const values = new Map();
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

function safeStore(candidate) {
  if (!candidate) return memoryStore();
  try {
    const probe = '__nv_bip_m8_probe__';
    candidate.setItem(probe, '1');
    candidate.removeItem(probe);
    return candidate;
  } catch (_) {
    return memoryStore();
  }
}

export function createBipM8Cache({ storage, assetStorage, learnerStorage } = {}) {
  const packageStore = safeStore(storage || globalThis.localStorage);
  const assets = safeStore(assetStorage || globalThis.sessionStorage);
  const learners = safeStore(learnerStorage || globalThis.localStorage);
  const key = (releaseId, schema = '1.0.0') => `nv:bip-m8:package:${schema}:${releaseId}`;
  return {
    packageKey: key,
    getPackage(releaseId, schema) {
      try { return JSON.parse(packageStore.getItem(key(releaseId, schema)) || 'null')?.value || null; } catch (_) { packageStore.removeItem(key(releaseId, schema)); return null; }
    },
    setPackage(releaseId, schema, value, etag) { packageStore.setItem(key(releaseId, schema), JSON.stringify({ etag, value })); },
    getPackageRecord(releaseId, schema) {
      try { return JSON.parse(packageStore.getItem(key(releaseId, schema)) || 'null'); } catch (_) { packageStore.removeItem(key(releaseId, schema)); return null; }
    },
    clearPackage(releaseId, schema) { packageStore.removeItem(key(releaseId, schema)); },
    assetKey: (assetVersionId) => `nv:bip-m8:asset:${assetVersionId}`,
    getAsset(assetVersionId) { try { return JSON.parse(assets.getItem(`nv:bip-m8:asset:${assetVersionId}`) || 'null'); } catch (_) { return null; } },
    setAsset(assetVersionId, value) { assets.setItem(`nv:bip-m8:asset:${assetVersionId}`, JSON.stringify(value)); },
    learnerKey: (learnerId) => `nv:bip-m8:learner:${learnerId}`,
    getLearner(learnerId) { try { return JSON.parse(learners.getItem(`nv:bip-m8:learner:${learnerId}`) || 'null'); } catch (_) { return null; } },
    setLearner(learnerId, value) { learners.setItem(`nv:bip-m8:learner:${learnerId}`, JSON.stringify(value)); },
    removeLearner(learnerId) { learners.removeItem(`nv:bip-m8:learner:${learnerId}`); },
  };
}
