/** Frontend-safe workflow progress client for the approved projection only. */

export const WorkflowStatus = Object.freeze({
  CREATED: 'CREATED', RUNNING: 'RUNNING', WAITING: 'WAITING', SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED', CANCELLED: 'CANCELLED', UNKNOWN: 'UNKNOWN',
});

const SCHEMA_NAME = 'WorkflowProgressEvent';
const SCHEMA_VERSION = '1.0.0';

function validatePayload(payload, workflowId, eventId) {
  if (!payload || payload.schema_name !== SCHEMA_NAME || payload.schema_version !== SCHEMA_VERSION) {
    throw Object.assign(new Error('Unsupported workflow progress event schema'), { code: 'WORKFLOW_SCHEMA_UNSUPPORTED' });
  }
  if (String(payload.workflow_id) !== String(workflowId) || String(payload.event_id) !== String(eventId)) {
    throw Object.assign(new Error('Workflow progress identity mismatch'), { code: 'WORKFLOW_IDENTITY_CONFLICT' });
  }
  return payload;
}

export function createWorkflowProgressClient({
  baseUrl = '',
  eventSourceFactory,
  fetchImpl = globalThis.fetch,
  viewerIdentity = globalThis.NV_BIP_M8_VIEWER_IDENTITY || '',
  onEvent = () => {},
  maxReconnects = 3,
} = {}) {
  if (!eventSourceFactory && typeof fetchImpl !== 'function') throw new TypeError('workflow progress requires fetch');
  let source = null;
  let abortController = null;
  let reconnects = 0;
  let closed = false;
  let lastEventId = null;
  const seen = new Set();
  let generationJobId = null;

  function publish(workflowId, eventId, data) {
    if (closed || (eventId && seen.has(eventId))) return;
    const payload = validatePayload(data, workflowId, eventId);
    if (eventId) { seen.add(eventId); lastEventId = eventId; }
    onEvent({ ...payload, eventId });
    if (payload.terminal || ['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(String(payload.status).toUpperCase())) close();
  }

  function parseFrame(workflowId, frame) {
    const lines = String(frame).split(/\r?\n/);
    let id = '';
    let data = '';
    for (const line of lines) {
      if (line.startsWith('id:')) id = line.slice(3).trim();
      else if (line.startsWith('data:')) data += line.slice(5).trim();
    }
    if (!id || !data) return;
    publish(workflowId, id, JSON.parse(data));
  }

  async function connectFetch(id) {
    const headers = {
      Accept: 'text/event-stream',
      'X-NV-Viewer-Identity': String(viewerIdentity),
    };
    if (lastEventId) headers['Last-Event-ID'] = lastEventId;
    abortController = new AbortController();
    const response = await fetchImpl(`${baseUrl}/orchestration/v1/frontend/generation-jobs/${encodeURIComponent(id)}/events`, { headers, signal: abortController.signal });
    if (!response.ok || !response.body) throw Object.assign(new Error(`workflow progress request failed: ${response.status}`), { code: 'WORKFLOW_PROGRESS_TRANSPORT' });
    const reader = response.body.getReader();
    let buffer = '';
    while (!closed) {
      const result = await reader.read();
      if (result.done) break;
      buffer += new TextDecoder().decode(result.value, { stream: true });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() || '';
      for (const frame of frames) parseFrame(id, frame);
    }
    if (buffer.trim()) parseFrame(id, buffer);
  }

  function connectEventSource(id) {
    // Kept as a deterministic test seam for EventSource-compatible adapters.
    source = eventSourceFactory(`${baseUrl}/orchestration/v1/frontend/generation-jobs/${encodeURIComponent(id)}/events`);
    source.onmessage = (event) => {
      try { publish(id, String(event.lastEventId || ''), JSON.parse(event.data)); }
      catch (error) { onEvent({ type: 'workflow_progress_unavailable', code: error.code || 'WORKFLOW_SCHEMA_UNSUPPORTED' }); }
    };
    source.onerror = () => {
      if (closed) return;
      source?.close?.(); source = null;
      if (reconnects < maxReconnects) { reconnects += 1; connect(id); }
      else onEvent({ type: 'workflow_progress_unavailable', code: 'RECONNECT_LIMIT' });
    };
    return source;
  }

  function connect(id) {
    generationJobId = id;
    closed = false;
    const task = eventSourceFactory ? Promise.resolve(connectEventSource(id)) : connectFetch(id);
    if (!eventSourceFactory) task.catch((error) => {
      if (closed) return;
      if (reconnects < maxReconnects) { reconnects += 1; onEvent({ type: 'workflow_progress_reconnecting', code: error.code || 'WORKFLOW_PROGRESS_TRANSPORT' }); setTimeout(() => connect(id), 0); }
      else onEvent({ type: 'workflow_progress_unavailable', code: error.code || 'RECONNECT_LIMIT' });
    });
    return task;
  }

  function close() { closed = true; source?.close?.(); source = null; abortController?.abort(); abortController = null; }
  return Object.freeze({ connect, close, getLastEventId: () => lastEventId, getReconnects: () => reconnects });
}
