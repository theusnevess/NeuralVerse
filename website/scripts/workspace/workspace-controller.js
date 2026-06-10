import { createProgressService } from "../progress/progress-service.js";
import { createContentService } from "../content/content-service.js";
import { createLearningService } from "../learning/learning-service.js";

export function createWorkspaceController(options = {}) {
  const root = options.root || document;
  const navigationState = options.navigationState || window.navigationState;
  const workspaceState = options.workspaceState || window.NeuralVerse?.workspaceState;
  const progressService = options.progressService || createProgressService();
  const contentService = options.contentService || createContentService();
  const learningService = options.learningService || createLearningService();

  function getElements() {
    return {
      continueCard: root.querySelector("[data-workspace-continue]"),
      continuePath: root.querySelector("[data-workspace-continue-path]"),
      continueModule: root.querySelector("[data-workspace-continue-module]"),
      continueContent: root.querySelector("[data-workspace-continue-content]"),
      continueAction: root.querySelector("[data-workspace-continue-action]"),

      lastOpenedCard: root.querySelector("[data-workspace-last-opened]"),
      lastOpenedTitle: root.querySelector("[data-workspace-last-opened-title]"),
      lastOpenedModule: root.querySelector("[data-workspace-last-opened-module]"),
      lastOpenedPath: root.querySelector("[data-workspace-last-opened-path]"),
      lastOpenedTime: root.querySelector("[data-workspace-last-opened-time]"),
      lastOpenedAction: root.querySelector("[data-workspace-last-opened-action]"),

      contextPath: root.querySelector("[data-workspace-context-path]"),
      contextModule: root.querySelector("[data-workspace-context-module]"),
      contextContent: root.querySelector("[data-workspace-context-content]"),
      contextLastOpened: root.querySelector("[data-workspace-context-last-opened]"),
      contextProgress: root.querySelector("[data-workspace-context-progress]"),

      workspacePathProgress: root.querySelector("[data-workspace-progress-path]"),
      workspaceModuleProgress: root.querySelector("[data-workspace-progress-module]"),
      workspaceContentStatus: root.querySelector("[data-workspace-progress-content-status]"),
      workspaceContentCount: root.querySelector("[data-workspace-progress-count]"),
    };
  }

  function formatTimestamp(value) {
    if (!value) return "None";

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  async function resolveContinuityContext() {
    const lastRecord = progressService.getLastOpenedContentRecord();

    if (!lastRecord) {
      return null;
    }

    const contentItem = await contentService.getContentItem(lastRecord.entityId);

    if (!contentItem) {
      return null;
    }

    const module = await learningService.getModuleById(contentItem.moduleId);
    const path = module ? await learningService.getLearningPathById(module.pathId) : null;

    return {
      record: lastRecord,
      contentItem,
      module,
      path,
    };
  }

  function getContentRoute(contentItemId) {
    return `#/content/${contentItemId}`;
  }

  function setAnchorRoute(anchor, contentItemId, label = "content") {
    if (!anchor || !contentItemId) return;

    anchor.href = getContentRoute(contentItemId);
    anchor.setAttribute("aria-label", label);
  }

  async function renderContinuity() {
    const context = await resolveContinuityContext();
    const elements = getElements();

    if (!context) {
      if (elements.continueCard) elements.continueCard.hidden = true;
      if (elements.lastOpenedCard) elements.lastOpenedCard.hidden = true;

      if (elements.contextPath) elements.contextPath.textContent = "None";
      if (elements.contextModule) elements.contextModule.textContent = "None";
      if (elements.contextContent) elements.contextContent.textContent = "None";
      if (elements.contextLastOpened) elements.contextLastOpened.textContent = "None";
      if (elements.contextProgress) elements.contextProgress.textContent = "No progress recorded yet";

      return;
    }

    const { record, contentItem, module, path } = context;

    if (elements.continueCard) elements.continueCard.hidden = false;
    if (elements.lastOpenedCard) elements.lastOpenedCard.hidden = false;

    if (elements.continuePath) elements.continuePath.textContent = path?.title || "Unknown path";
    if (elements.continueModule) elements.continueModule.textContent = module?.title || "Unknown module";
    if (elements.continueContent) elements.continueContent.textContent = contentItem.title;
    setAnchorRoute(elements.continueAction, contentItem.id, `Resume ${contentItem.title}`);

    if (elements.lastOpenedTitle) elements.lastOpenedTitle.textContent = contentItem.title;
    if (elements.lastOpenedModule) elements.lastOpenedModule.textContent = module?.title || "Unknown module";
    if (elements.lastOpenedPath) elements.lastOpenedPath.textContent = path?.title || "Unknown path";
    if (elements.lastOpenedTime) elements.lastOpenedTime.textContent = formatTimestamp(record.lastOpenedAt);
    setAnchorRoute(elements.lastOpenedAction, contentItem.id, `Open again ${contentItem.title}`);

    if (elements.contextPath) elements.contextPath.textContent = path?.title || "Unknown path";
    if (elements.contextModule) elements.contextModule.textContent = module?.title || "Unknown module";
    if (elements.contextContent) elements.contextContent.textContent = contentItem.title;
    if (elements.contextLastOpened) elements.contextLastOpened.textContent = formatTimestamp(record.lastOpenedAt);
    if (elements.contextProgress) {
      elements.contextProgress.textContent = `${record.status} · ${record.progressValue}%`;
    }
  }

  function handleRouteChange(navState) {
    const route = navState.currentRoute;
    if (!route) return;

    let routeId = route.id;
    let status = 'empty';

    // Map route to workspace state status
    if (routeId === 'home') {
      status = 'idle';
    } else if (routeId === 'workspace') {
      status = 'active';
    } else if (routeId === 'not-found') {
      routeId = 'unavailable';
      status = 'empty';
    }

    workspaceState.setState({
      activeView: routeId,
      routeId: routeId,
      routeTitle: route.title || 'Route Unavailable',
      routeDescription: route.description || 'The requested page is currently offline or not configured.',
      status: status
    });
  }

  function syncDOM(state) {
    console.log('Syncing workspace DOM with state:', state);

    // Sync text nodes and attributes
    const titleEl = root.querySelector('[data-workspace-title]');
    const descEl = root.querySelector('[data-workspace-description]');
    const statusEl = root.querySelector('[data-workspace-status]');
    const viewEl = root.querySelector('[data-workspace-active-view]');
    const routeEl = root.querySelector('[data-workspace-route]');
    const updatedEl = root.querySelector('[data-workspace-updated]');
    const liveEl = root.querySelector('[data-workspace-live]');
    const emptyStateEl = root.querySelector('[data-workspace-empty-state]');

    if (titleEl) titleEl.textContent = state.routeTitle;
    if (descEl) descEl.textContent = state.routeDescription;
    
    if (statusEl) {
      statusEl.textContent = state.status.toUpperCase();
      statusEl.setAttribute('data-status', state.status);
      statusEl.className = 'nv-badge nv-workspace__status';
      if (state.status === 'active') {
        statusEl.setAttribute('data-variant', 'success');
      } else if (state.status === 'idle') {
        statusEl.setAttribute('data-variant', 'info');
      } else {
        statusEl.setAttribute('data-variant', 'neutral');
      }
    }

    if (viewEl) viewEl.setAttribute('data-workspace-active-view', state.activeView);
    if (routeEl) routeEl.textContent = `Route: ${state.routeId}`;
    if (updatedEl) {
      updatedEl.textContent = `Updated: ${new Date(state.lastUpdated).toLocaleTimeString()}`;
    }
    if (liveEl) {
      liveEl.textContent = `Workspace updated. Active node: ${state.routeTitle}. Status: ${state.status}.`;
    }

    // Sync empty state visibility
    if (emptyStateEl) {
      if (state.status === 'empty') {
        emptyStateEl.innerHTML = `
          <div class="nv-empty-state">
            <div class="nv-empty-state-icon" aria-hidden="true">📭</div>
            <h2 class="nv-empty-state-title">Workspace is Empty</h2>
            <p class="nv-empty-state-description">
              No learning modules, publications, or simulation agents have been initialized for the current path block.
            </p>
            <div class="nv-cluster nv-cluster--gap-sm">
              <button class="nv-button" data-variant="primary" data-workspace-action="open-workspace">Initialize Workspace</button>
            </div>
          </div>
        `;
        emptyStateEl.style.display = 'block';
      } else {
        emptyStateEl.innerHTML = '';
        emptyStateEl.style.display = 'none';
      }
    }

    // Sync Context Panel orientation fields
    const orientationTarget = root.querySelector('.nv-context-meta-item:nth-child(2) .nv-context-meta-value');
    const orientationDesc = root.querySelector('.nv-context-description');
    if (orientationTarget) orientationTarget.textContent = state.routeTitle;
    if (orientationDesc) orientationDesc.textContent = state.routeDescription;
  }

  function handleActionClick(e) {
    const button = e.target.closest('[data-workspace-action]');
    if (!button) return;

    const action = button.getAttribute('data-workspace-action');
    console.log(`Workspace action triggered: ${action}`);

    const statusEl = root.querySelector('[data-workspace-status]');
    const liveEl = root.querySelector('[data-workspace-live]');

    if (action === 'open-workspace') {
      workspaceState.setState({
        status: 'active',
        routeTitle: 'Active Workspace Preview',
        routeDescription: 'Interactive real-time model telemetry dashboard activated.'
      });
      if (liveEl) liveEl.textContent = 'Workspace action: Activated Workspace Preview mode.';
    } else if (action === 'explore-learning') {
      window.location.hash = '#/learning';
    } else if (action === 'browse-modules') {
      window.location.hash = '#/modules';
    } else if (action === 'open-content') {
      window.location.hash = '#/content';
    }
  }

  async function init() {
    if (navigationState) {
      navigationState.subscribe((navState) => handleRouteChange(navState));
    }
    
    if (workspaceState) {
      workspaceState.subscribe((state) => syncDOM(state));
    }

    root.addEventListener('click', (e) => handleActionClick(e));

    await renderContinuity().catch((error) => {
      console.error("Workspace continuity failed to render.", error);
    });

    window.addEventListener("nv:contentloaded", () => {
      renderContinuity().catch(console.error);
    });

    window.addEventListener("nv:progressupdated", () => {
      renderContinuity().catch(console.error);
    });
  }

  return {
    init,
    renderContinuity,
  };
}

// Auto-initialize if running as a script (fallback for legacy linked environments)
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    // Only auto-initialize if it hasn't been initialized via modular imports yet
    if (!window.NeuralVerse?.workspaceController && window.navigationState && window.NeuralVerse?.workspaceState) {
      const controller = createWorkspaceController({
        root: document,
        navigationState: window.navigationState,
        workspaceState: window.NeuralVerse.workspaceState,
      });
      controller.init().catch(console.error);
      window.NeuralVerse.workspaceController = controller;
    }
  });
}
