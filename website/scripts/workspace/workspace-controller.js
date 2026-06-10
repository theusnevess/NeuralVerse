import { createProgressService } from "../progress/progress-service.js";
import { createContentService } from "../content/content-service.js";
import { createLearningService } from "../learning/learning-service.js";

function formatReadingTime(minutes) {
  const safeMinutes = Number(minutes || 0);

  if (!safeMinutes) {
    return {
      text: "0m",
      label: "0 minutes",
    };
  }

  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (!hours) {
    return {
      text: `${remainingMinutes}m`,
      label: `${remainingMinutes} minutes`,
    };
  }

  if (!remainingMinutes) {
    return {
      text: `${hours}h`,
      label: `${hours} hours`,
    };
  }

  return {
    text: `${hours}h ${remainingMinutes}m`,
    label: `${hours} hours ${remainingMinutes} minutes`,
  };
}

function getCompletedContentIds(progressService) {
  return progressService
    .getRecords()
    .filter(
      (record) =>
        record.entityType === "content-item" &&
        record.status === "completed"
    )
    .map((record) => record.entityId);
}

function getNextOrderedContent(currentContent, moduleContentItems) {
  if (!currentContent) {
    return null;
  }

  const orderedItems = [...moduleContentItems].sort((a, b) => a.order - b.order);
  const currentIndex = orderedItems.findIndex((item) => item.id === currentContent.id);

  if (currentIndex === -1) {
    return null;
  }

  return orderedItems[currentIndex + 1] || null;
}

function getRemainingContentItems(moduleContentItems, completedContentIds) {
  return moduleContentItems.filter(
    (contentItem) => !completedContentIds.includes(contentItem.id)
  );
}

function setAllText(targets, value) {
  targets.forEach((target) => {
    target.textContent = value;
  });
}

function setAllAriaLabel(targets, value) {
  targets.forEach((target) => {
    target.setAttribute("aria-label", value);
  });
}

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

      currentFocusPath: root.querySelector("[data-workspace-focus-path]"),
      currentFocusModule: root.querySelector("[data-workspace-focus-module]"),
      currentFocusContent: root.querySelector("[data-workspace-focus-content]"),

      nextContentTargets: root.querySelectorAll("[data-workspace-next-content]"),
      remainingItemsTargets: root.querySelectorAll("[data-workspace-remaining-items]"),
      remainingReadingTimeTargets: root.querySelectorAll("[data-workspace-remaining-reading-time]"),

      nextContentAction: root.querySelector("[data-workspace-next-content-action]"),
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

    const moduleContentItems = module
      ? await learningService.getContentItemsByModule(module.id)
      : [];

    const completedContentIds = getCompletedContentIds(progressService);
    const nextContent = getNextOrderedContent(contentItem, moduleContentItems);
    const remainingContentItems = getRemainingContentItems(
      moduleContentItems,
      completedContentIds
    );

    const remainingReadingMinutes = remainingContentItems.reduce(
      (total, item) => total + Number(item.estimatedReadingTime || 0),
      0
    );

    return {
      record: lastRecord,
      contentItem,
      module,
      path,
      nextContent,
      remainingContentItems,
      remainingReadingTime: formatReadingTime(remainingReadingMinutes),
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

      if (elements.currentFocusPath) elements.currentFocusPath.textContent = "None";
      if (elements.currentFocusModule) elements.currentFocusModule.textContent = "None";
      if (elements.currentFocusContent) elements.currentFocusContent.textContent = "None";

      setAllText(elements.nextContentTargets, "None");
      setAllText(elements.remainingItemsTargets, "0 remaining");
      setAllText(elements.remainingReadingTimeTargets, "0m");
      setAllAriaLabel(elements.remainingReadingTimeTargets, "0 minutes");

      if (elements.nextContentAction) {
        elements.nextContentAction.hidden = true;
        elements.nextContentAction.removeAttribute("href");
      }

      return;
    }

    const {
      record,
      contentItem,
      module,
      path,
      nextContent,
      remainingContentItems,
      remainingReadingTime,
    } = context;

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

    if (elements.currentFocusPath) {
      elements.currentFocusPath.textContent = path?.title || "Unknown path";
    }
    if (elements.currentFocusModule) {
      elements.currentFocusModule.textContent = module?.title || "Unknown module";
    }
    if (elements.currentFocusContent) {
      elements.currentFocusContent.textContent = contentItem.title;
    }

    setAllText(elements.nextContentTargets, nextContent?.title || "No next content");
    setAllText(elements.remainingItemsTargets, `${remainingContentItems.length} remaining`);
    setAllText(elements.remainingReadingTimeTargets, remainingReadingTime.text);
    setAllAriaLabel(elements.remainingReadingTimeTargets, remainingReadingTime.label);

    if (elements.nextContentAction) {
      if (nextContent) {
        elements.nextContentAction.hidden = false;
        elements.nextContentAction.href = getContentRoute(nextContent.id);
        elements.nextContentAction.setAttribute(
          "aria-label",
          `Open next ordered content: ${nextContent.title}`
        );
      } else {
        elements.nextContentAction.hidden = true;
        elements.nextContentAction.removeAttribute("href");
      }
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
              No learning modules, publications, or simulation agents have been initialized for the current path block. Select a path block to get started or initialize the default view.
            </p>
            <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: center; align-items: center; margin-block-start: var(--sys-space-stack-md);">
              <button class="nv-button" data-variant="primary" data-workspace-action="open-workspace">Initialize Workspace</button>
              <button class="nv-button" data-variant="secondary" data-workspace-action="explore-learning">Explore Learning Paths</button>
              <button class="nv-button" data-variant="secondary" data-workspace-action="browse-modules">Browse Modules</button>
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
