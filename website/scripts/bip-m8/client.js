import { classifyDeliveryError, ContractError, decodePublishedLearningPackage, IntegrationState, LEARNER_STATE_SCHEMA } from './contract.js';
import { createBipM8Cache } from './cache.js';

export function createBipM8Client({ baseUrl = '', fetchImpl = globalThis.fetch, cache = createBipM8Cache(), onEvent = () => {} } = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('BIP-M8 requires a fetch implementation');
  async function getRelease(releaseId, { signal } = {}) {
    if (!releaseId) throw new ContractError('RELEASE_ID_REQUIRED', 'An exact publication release is required');
    const cached = cache.getPackageRecord(releaseId, '1.0.0');
    const headers = {
      Accept: 'application/vnd.neuralverse.published-learning-package+json;version=1',
      ...(cached?.etag ? { 'If-None-Match': cached.etag } : {}),
    };
    onEvent({ type: 'package_fetch_started', releaseId, cache: Boolean(cached) });
    let response;
    try {
      response = await fetchImpl(`${baseUrl}/api/v1/publication/releases/${encodeURIComponent(releaseId)}`, { headers, signal });
    } catch (error) {
      onEvent({ type: 'package_fetch_failed', releaseId, code: 'TRANSPORT_FAILURE' });
      if (cached?.value) return { state: IntegrationState.OFFLINE, package: decodePublishedLearningPackage(cached.value), fromCache: true };
      return { state: IntegrationState.TRANSPORT_ERROR, error };
    }
    if (response.status === 304 && cached?.value) {
      onEvent({ type: 'package_fetch_completed', releaseId, status: 304, cache: 'validated-reuse' });
      return { state: IntegrationState.READY, package: decodePublishedLearningPackage(cached.value), etag: cached.etag, fromCache: true };
    }
    let payload = null;
    try { payload = await response.json(); } catch (_) { payload = {}; }
    if (!response.ok) {
      const failure = classifyDeliveryError(response.status, payload);
      onEvent({ type: 'package_fetch_failed', releaseId, status: response.status, code: failure.code });
      return { state: failure.state, error: Object.assign(new Error(payload.message || failure.code), failure) };
    }
    try {
      const decoded = decodePublishedLearningPackage(payload);
      cache.setPackage(releaseId, decoded.releaseSchemaVersion, payload, response.headers?.get?.('ETag') || null);
      onEvent({ type: 'package_fetch_completed', releaseId, status: response.status, cache: 'network' });
      return { state: IntegrationState.READY, package: decoded, etag: response.headers?.get?.('ETag') || null, fromCache: false };
    } catch (error) {
      cache.clearPackage(releaseId, '1.0.0');
      onEvent({ type: 'package_decode_failed', releaseId, code: error.code || 'SCHEMA_INVALID' });
      return { state: error.code === 'UNSUPPORTED_VERSION' ? IntegrationState.UNSUPPORTED_VERSION : IntegrationState.SCHEMA_ERROR, error };
    }
  }
  async function getLearnerState({ signal } = {}) {
    let response;
    try {
      response = await fetchImpl(`${baseUrl}/api/v1/learner/state`, { signal, headers: { Accept: 'application/json' } });
    } catch (error) {
      return { state: IntegrationState.TRANSPORT_ERROR, error };
    }
    let payload = null;
    try { payload = await response.json(); } catch (_) { payload = {}; }
    if (!response.ok) {
      const failure = classifyDeliveryError(response.status, payload);
      return { state: failure.state, error: Object.assign(new Error(payload.message || failure.code), failure) };
    }
    if (payload.schema_version !== LEARNER_STATE_SCHEMA) {
      return { state: IntegrationState.SCHEMA_ERROR, error: new ContractError('SCHEMA_INVALID', 'Unsupported learner-state schema', { schema: payload.schema_version }) };
    }
    return { state: IntegrationState.READY, learnerState: payload };
  }
  return Object.freeze({ getRelease, getLearnerState });
}
