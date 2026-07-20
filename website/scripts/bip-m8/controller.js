import { createBipM8Cache } from './cache.js';
import { createBipM8Client } from './client.js';
import { IntegrationState } from './contract.js';
import { bipM8Flags } from './flags.js';
import { createRendererRegistry, renderBlockElement } from './renderers.js';
import { createLearnerSubmissionClient } from './submission.js';
import { createLearnerSync } from './learner.js';
import { canonicalReleaseRegistry } from './release-registry.js';
import { createWorkflowProgressClient } from './workflow.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function parseLessonId(route = window.location.hash) {
  const match = String(route).match(/\/lesson\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function stateView(state, error, retry) {
  const root = element('section', `bip-m8-state bip-m8-state--${state}`, undefined);
  root.setAttribute('role', state === IntegrationState.LOADING ? 'status' : 'alert');
  const labels = {
    [IntegrationState.LOADING]: ['Loading published lesson', 'Validating the exact publication release.'],
    [IntegrationState.PARTIAL_LOADING]: ['Restoring learner state', 'Published content remains stable while learner state reconnects.'],
    [IntegrationState.OFFLINE]: ['Offline or degraded state', 'Showing the previously validated exact release. Mutations are disabled until reconnection.'],
    [IntegrationState.SCHEMA_ERROR]: ['Schema error', 'This published response cannot be safely rendered by this reader.'],
    [IntegrationState.UNSUPPORTED_VERSION]: ['Unsupported version', 'This release requires a newer compatible reader.'],
    [IntegrationState.BLOCKED_PUBLICATION]: ['Publication unavailable', 'The requested release is not available for learner delivery.'],
    [IntegrationState.TRANSPORT_ERROR]: ['Unable to load published lesson', 'The network request failed. Your local learner input was preserved.'],
  };
  const [title, description] = labels[state] || ['Integration state', 'The requested operation is unavailable.'];
  root.append(element('h1', 'bip-m8-state__title', title), element('p', 'bip-m8-state__description', description));
  if (retry && state !== IntegrationState.BLOCKED_PUBLICATION && state !== IntegrationState.UNSUPPORTED_VERSION) {
    const button = element('button', 'nv-button', 'Retry');
    button.type = 'button'; button.addEventListener('click', retry); root.append(button);
  }
  if (error?.code) root.dataset.errorCode = error.code;
  return root;
}

function renderPackage(root, pkg, { registry, onLab, onAssessment }) {
  root.replaceChildren();
  const header = element('header', 'bip-m8-package__header');
  header.append(element('p', 'bip-m8-package__identity', `Release ${pkg.publicationReleaseId}`), element('h1', 'bip-m8-package__title', `Published package ${pkg.packageId}`));
  header.dataset.contentVersionId = pkg.contentVersionId;
  root.append(header);
  const blocks = element('div', 'bip-m8-package__blocks');
  for (const block of pkg.blocks) blocks.append(renderBlockElement(block, { registry, resolveAsset: (id) => pkg.assets.find((asset) => asset.asset_version_id === id) }));
  root.append(blocks);
  if (pkg.laboratories.length) {
    const lab = element('section', 'bip-m8-package__interaction');
    lab.append(element('h2', '', 'Laboratory')); const button = element('button', 'nv-button', 'Submit laboratory run');
    button.type = 'button'; button.addEventListener('click', () => onLab(pkg, lab)); lab.append(button); root.append(lab);
  }
  if (pkg.assessments.length) {
    const assessment = element('section', 'bip-m8-package__interaction');
    assessment.append(element('h2', '', 'Assessment')); const button = element('button', 'nv-button', 'Submit assessment attempt');
    button.type = 'button'; button.addEventListener('click', () => onAssessment(pkg, assessment)); assessment.append(button); root.append(assessment);
  }
}

export function createBipM8Controller({ root = document, flags = bipM8Flags, client, cache = createBipM8Cache(), baseUrl = '', onEvent = () => {}, eventSourceFactory, releaseRegistry = canonicalReleaseRegistry } = {}) {
  const api = client || createBipM8Client({ baseUrl, cache, onEvent });
  const submissions = createLearnerSubmissionClient({ baseUrl });
  const workflow = flags.isEnabled('workflowProgress') ? createWorkflowProgressClient({ baseUrl, eventSourceFactory, onEvent }) : null;
  const learnerSync = flags.isEnabled('learnerState') ? createLearnerSync({
    client: {
      getLearnerState: async () => {
        const result = await api.getLearnerState();
        if (result.state !== IntegrationState.READY) throw result.error || new Error('Learner state unavailable');
        return result;
      },
      submit: (kind, payload, key, signal) => submissions[kind](payload, key, signal),
    },
    cache,
    onEvent,
  }) : null;
  let learnerRestorePromise = null;
  const registry = createRendererRegistry();
  let abortController;
  let destroyed = false;

  async function renderRoute(route = window.location.hash) {
    if (destroyed || !flags.isEnabled('packageDelivery') || !String(route).includes('/lesson/')) return;
    const target = root.querySelector('[data-curriculum-root]');
    if (!target) return;
    const lessonId = parseLessonId(route);
    const release = releaseRegistry.resolve(lessonId);
    if (!release) return; // legacy projection remains user-visible by default.
    const releaseId = release.publicationReleaseId;
    abortController?.abort(); abortController = new AbortController();
    target.replaceChildren(stateView(IntegrationState.LOADING));
    const result = await api.getRelease(releaseId, { signal: abortController.signal });
    if (destroyed || abortController.signal.aborted) return;
    if (result.package) {
      if (learnerSync && !learnerRestorePromise) {
        learnerRestorePromise = learnerSync.restore().catch((error) => {
          onEvent({ type: 'learner_state_restore_failed', code: error.code || 'LEARNER_STATE_UNAVAILABLE' });
          return null;
        });
      }
      renderPackage(target, result.package, {
        registry,
        onLab: async (pkg, surface) => {
          if (!flags.isEnabled('laboratorySubmission')) return;
          const key = `bip-m8-lab:${pkg.publicationReleaseId}:${crypto.randomUUID()}`;
          try { await submissions.laboratory({ content_version_id: pkg.contentVersionId, laboratory_spec_id: pkg.laboratories[0].laboratory_spec_id, laboratory_spec_version: pkg.laboratories[0].laboratory_spec_version, inputs: {} }, key); surface.append(element('p', '', 'Laboratory submission accepted.')); }
          catch (error) { surface.append(stateView(IntegrationState.LABORATORY_FAILURE, error)); }
        },
        onAssessment: async (pkg, surface) => {
          if (!flags.isEnabled('assessmentSubmission')) return;
          const key = `bip-m8-assessment:${pkg.publicationReleaseId}:${crypto.randomUUID()}`;
          try { await submissions.assessment({ content_version_id: pkg.contentVersionId, assessment_spec_id: pkg.assessments[0].assessment_spec_id, assessment_spec_version: pkg.assessments[0].assessment_spec_version, responses: {} }, key); surface.append(element('p', '', 'Assessment submission accepted.')); }
          catch (error) { surface.append(stateView(IntegrationState.ASSESSMENT_FAILURE, error)); }
        },
      });
      if (result.state === IntegrationState.OFFLINE) target.prepend(stateView(IntegrationState.OFFLINE));
      const workflowJobId = result.package.extensions?.workflow_job_id;
      if (flags.isEnabled('workflowProgress') && workflow && workflowJobId) {
        const progress = element('section', 'bip-m8-workflow-progress');
        progress.append(element('h2', '', 'Workflow progress'), element('p', '', 'Connecting to the approved progress projection…'));
        target.append(progress);
        workflow.connect(String(workflowJobId));
      }
      return;
    }
    target.replaceChildren(stateView(result.state, result.error, () => renderRoute(route)));
  }

  function init() {
    const listener = (event) => renderRoute(event.detail?.route || window.location.hash);
    window.addEventListener('nv:routerendered', listener);
    window.addEventListener('hashchange', listener);
    if (window.location.hash) renderRoute(window.location.hash);
    return () => { window.removeEventListener('nv:routerendered', listener); window.removeEventListener('hashchange', listener); abortController?.abort(); };
  }
  return Object.freeze({ init, renderRoute, destroy: () => { destroyed = true; abortController?.abort(); } });
}
