export function createLearnerSubmissionClient({ baseUrl = '', fetchImpl = globalThis.fetch } = {}) {
  async function submit(path, payload, idempotencyKey, signal) {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(payload),
      signal,
    });
    let body = null;
    try { body = await response.json(); } catch (_) { body = {}; }
    if (!response.ok) {
      const error = new Error(body.message || body.code || `HTTP ${response.status}`);
      error.code = body.code || 'SUBMISSION_FAILED';
      error.status = response.status;
      error.retryable = response.status >= 500 || response.status === 408;
      throw error;
    }
    return body;
  }
  return Object.freeze({
    laboratory: (payload, key, signal) => submit('/api/v1/learner/laboratory-runs', payload, key, signal),
    assessment: (payload, key, signal) => submit('/api/v1/learner/assessment-attempts', payload, key, signal),
  });
}
