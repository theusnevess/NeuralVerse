import { createProgressService } from "../progress/progress-service.js";
import { createContentService } from "../content/content-service.js";
import { createLearningService } from "../learning/learning-service.js";
import { createReviewDashboard } from "../spaced-repetition/review-dashboard.js";

function getStatusFromPercent(value) {
  if (value <= 0) return "Not Started";
  if (value >= 100) return "Completed";
  return "In Progress";
}

function formatReadingTime(minutes) {
  const safe = Number(minutes || 0);
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;

  if (!hours) return { text: `${mins}m`, label: `${mins} minutes` };
  if (!mins) return { text: `${hours}h`, label: `${hours} hours` };

  return {
    text: `${hours}h ${mins}m`,
    label: `${hours} hours ${mins} minutes`,
  };
}

function getCompletedIds(progressService) {
  return progressService.getRecords()
    .filter((record) => record.entityType === "content-item" && record.status === "completed")
    .map((record) => record.entityId);
}

function getProgress(completed, total) {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
}

function getPositionByOrder(item, orderedItems) {
  const index = orderedItems.findIndex((entry) => entry.id === item?.id);
  return index === -1 ? "—" : `${index + 1} / ${orderedItems.length}`;
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
  const reviewDashboard = options.reviewDashboard || window.NeuralVerse?.reviewDashboard || createReviewDashboard();

  const _dirtySections = new Set();
  const _sectionRenderers = {
    review: renderReviewDashboard,
    labs: renderRecentLabs,
    memories: renderPinnedMemories,
    semantic: renderSemanticSuggestions,
    visualizations: renderRecentVisualizations,
    pinnedViz: renderPinnedVisualizations,
    continuity: null
  };

  function markDirty(section) {
    _dirtySections.add(section);
  }

  function renderDirty() {
    if (_dirtySections.size === 0) return;
    var sections = Array.from(_dirtySections);
    _dirtySections.clear();
    for (var i = 0; i < sections.length; i++) {
      var renderer = _sectionRenderers[sections[i]];
      if (typeof renderer === 'function') {
        try { renderer(); } catch (e) { /* silent */ }
      }
    }
  }

  function getElements() {
    return {
      homeOnboarding: root.querySelector("[data-home-onboarding]"),
      homeSession: root.querySelector("[data-home-session]"),

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

      orientationPath: root.querySelector("[data-workspace-orientation-path]"),
      orientationModule: root.querySelector("[data-workspace-orientation-module]"),
      orientationContent: root.querySelector("[data-workspace-orientation-content]"),

      pathSummaryProgress: root.querySelector("[data-workspace-path-summary-progress]"),
      pathSummaryCompleted: root.querySelector("[data-workspace-path-summary-completed]"),
      pathSummaryRemaining: root.querySelector("[data-workspace-path-summary-remaining]"),
      pathSummaryReading: root.querySelector("[data-workspace-path-summary-reading]"),
      pathSummaryRemainingReading: root.querySelector("[data-workspace-path-summary-remaining-reading]"),
      pathSummaryStatus: root.querySelector("[data-workspace-path-summary-status]"),

      moduleSummaryProgress: root.querySelector("[data-workspace-module-summary-progress]"),
      moduleSummaryCompleted: root.querySelector("[data-workspace-module-summary-completed]"),
      moduleSummaryRemaining: root.querySelector("[data-workspace-module-summary-remaining]"),
      moduleSummaryReading: root.querySelector("[data-workspace-module-summary-reading]"),
      moduleSummaryRemainingReading: root.querySelector("[data-workspace-module-summary-remaining-reading]"),
      moduleSummaryStatus: root.querySelector("[data-workspace-module-summary-status]"),

      positionContent: root.querySelector("[data-workspace-position-content]"),
      positionModule: root.querySelector("[data-workspace-position-module]"),
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

    const allModules = await learningService.getModules();
    const allContentItems = await learningService.getContentItems();

    const pathModules = path
      ? allModules.filter((item) => item.pathId === path.id).sort((a, b) => a.order - b.order)
      : [];

    const moduleContentItems = module
      ? allContentItems.filter((item) => item.moduleId === module.id).sort((a, b) => a.order - b.order)
      : [];

    const pathContentItems = pathModules.flatMap((pathModule) =>
      allContentItems.filter((item) => item.moduleId === pathModule.id)
    );

    const completedIds = getCompletedIds(progressService);

    const completedPathItems = pathContentItems.filter((item) => completedIds.includes(item.id));
    const completedModuleItems = moduleContentItems.filter((item) => completedIds.includes(item.id));

    const remainingPathItems = pathContentItems.filter((item) => !completedIds.includes(item.id));
    const remainingModuleItems = moduleContentItems.filter((item) => !completedIds.includes(item.id));

    const pathProgress = getProgress(completedPathItems.length, pathContentItems.length);
    const moduleProgress = getProgress(completedModuleItems.length, moduleContentItems.length);

    const nextContent = getNextOrderedContent(contentItem, moduleContentItems);

    return {
      record: lastRecord,
      contentItem,
      module,
      path,
      nextContent,
      pathSummary: {
        progress: pathProgress,
        status: getStatusFromPercent(pathProgress),
        completed: completedPathItems.length,
        total: pathContentItems.length,
        remaining: remainingPathItems.length,
        readingLoad: formatReadingTime(
          pathContentItems.reduce((sum, item) => sum + Number(item.estimatedReadingTime || 0), 0)
        ),
        remainingReading: formatReadingTime(
          remainingPathItems.reduce((sum, item) => sum + Number(item.estimatedReadingTime || 0), 0)
        ),
        modulePosition: getPositionByOrder(module, pathModules),
      },
      moduleSummary: {
        progress: moduleProgress,
        status: getStatusFromPercent(moduleProgress),
        completed: completedModuleItems.length,
        total: moduleContentItems.length,
        remaining: remainingModuleItems.length,
        readingLoad: formatReadingTime(
          moduleContentItems.reduce((sum, item) => sum + Number(item.estimatedReadingTime || 0), 0)
        ),
        remainingReading: formatReadingTime(
          remainingModuleItems.reduce((sum, item) => sum + Number(item.estimatedReadingTime || 0), 0)
        ),
        contentPosition: getPositionByOrder(contentItem, moduleContentItems),
      },
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
      if (elements.homeOnboarding) elements.homeOnboarding.hidden = false;
      if (elements.homeSession) elements.homeSession.hidden = true;

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

      if (elements.orientationPath) elements.orientationPath.textContent = "No learning session started yet.";
      if (elements.orientationModule) elements.orientationModule.textContent = "None";
      if (elements.orientationContent) elements.orientationContent.textContent = "None";

      if (elements.pathSummaryProgress) elements.pathSummaryProgress.textContent = "0%";
      if (elements.pathSummaryCompleted) elements.pathSummaryCompleted.textContent = "0 / 0";
      if (elements.pathSummaryRemaining) elements.pathSummaryRemaining.textContent = "0";
      if (elements.pathSummaryReading) {
        elements.pathSummaryReading.textContent = "0m";
        elements.pathSummaryReading.setAttribute("aria-label", "0 minutes");
      }
      if (elements.pathSummaryRemainingReading) {
        elements.pathSummaryRemainingReading.textContent = "0m";
        elements.pathSummaryRemainingReading.setAttribute("aria-label", "0 minutes");
      }
      if (elements.pathSummaryStatus) elements.pathSummaryStatus.textContent = "Not Started";

      if (elements.moduleSummaryProgress) elements.moduleSummaryProgress.textContent = "0%";
      if (elements.moduleSummaryCompleted) elements.moduleSummaryCompleted.textContent = "0 / 0";
      if (elements.moduleSummaryRemaining) elements.moduleSummaryRemaining.textContent = "0";
      if (elements.moduleSummaryReading) {
        elements.moduleSummaryReading.textContent = "0m";
        elements.moduleSummaryReading.setAttribute("aria-label", "0 minutes");
      }
      if (elements.moduleSummaryRemainingReading) {
        elements.moduleSummaryRemainingReading.textContent = "0m";
        elements.moduleSummaryRemainingReading.setAttribute("aria-label", "0 minutes");
      }
      if (elements.moduleSummaryStatus) elements.moduleSummaryStatus.textContent = "Not Started";

      if (elements.positionContent) elements.positionContent.textContent = "—";
      if (elements.positionModule) elements.positionModule.textContent = "—";

      return;
    }

    if (elements.homeOnboarding) elements.homeOnboarding.hidden = true;
    if (elements.homeSession) elements.homeSession.hidden = false;

    const {
      record,
      contentItem,
      module,
      path,
      nextContent,
      pathSummary,
      moduleSummary,
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

    // Remaining items for the module
    setAllText(elements.nextContentTargets, nextContent?.title || "No next content");
    setAllText(elements.remainingItemsTargets, `${moduleSummary.remaining} remaining`);
    setAllText(elements.remainingReadingTimeTargets, moduleSummary.remainingReading.text);
    setAllAriaLabel(elements.remainingReadingTimeTargets, moduleSummary.remainingReading.label);

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

    // Update Orientation fields
    if (elements.orientationPath) elements.orientationPath.textContent = path?.title || "Unknown path";
    if (elements.orientationModule) elements.orientationModule.textContent = module?.title || "Unknown module";
    if (elements.orientationContent) elements.orientationContent.textContent = contentItem.title;

    if (elements.pathSummaryProgress) elements.pathSummaryProgress.textContent = `${pathSummary.progress}%`;
    if (elements.pathSummaryCompleted) elements.pathSummaryCompleted.textContent = `${pathSummary.completed} / ${pathSummary.total}`;
    if (elements.pathSummaryRemaining) elements.pathSummaryRemaining.textContent = String(pathSummary.remaining);
    if (elements.pathSummaryReading) {
      elements.pathSummaryReading.textContent = pathSummary.readingLoad.text;
      elements.pathSummaryReading.setAttribute("aria-label", pathSummary.readingLoad.label);
    }
    if (elements.pathSummaryRemainingReading) {
      elements.pathSummaryRemainingReading.textContent = pathSummary.remainingReading.text;
      elements.pathSummaryRemainingReading.setAttribute("aria-label", pathSummary.remainingReading.label);
    }
    if (elements.pathSummaryStatus) elements.pathSummaryStatus.textContent = pathSummary.status;

    if (elements.moduleSummaryProgress) elements.moduleSummaryProgress.textContent = `${moduleSummary.progress}%`;
    if (elements.moduleSummaryCompleted) elements.moduleSummaryCompleted.textContent = `${moduleSummary.completed} / ${moduleSummary.total}`;
    if (elements.moduleSummaryRemaining) elements.moduleSummaryRemaining.textContent = String(moduleSummary.remaining);
    if (elements.moduleSummaryReading) {
      elements.moduleSummaryReading.textContent = moduleSummary.readingLoad.text;
      elements.moduleSummaryReading.setAttribute("aria-label", moduleSummary.readingLoad.label);
    }
    if (elements.moduleSummaryRemainingReading) {
      elements.moduleSummaryRemainingReading.textContent = moduleSummary.remainingReading.text;
      elements.moduleSummaryRemainingReading.setAttribute("aria-label", moduleSummary.remainingReading.label);
    }
    if (elements.moduleSummaryStatus) elements.moduleSummaryStatus.textContent = moduleSummary.status;

    if (elements.positionContent) elements.positionContent.textContent = moduleSummary.contentPosition;
    if (elements.positionModule) elements.positionModule.textContent = pathSummary.modulePosition;
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
    if (window.NV_DEBUG) console.log('Syncing workspace DOM with state:', state);

    // Sync text nodes and attributes
    const titleEl = root.querySelector('[data-workspace-title]');
    const descEl = root.querySelector('[data-workspace-description]');
    const viewEl = root.querySelector('[data-workspace-active-view]');
    const liveEl = root.querySelector('[data-workspace-live]');
    const emptyStateEl = root.querySelector('[data-workspace-empty-state]');

    if (titleEl) titleEl.textContent = state.routeTitle;
    if (descEl) descEl.textContent = state.routeDescription;
    if (viewEl) viewEl.setAttribute('data-workspace-active-view', state.activeView);
    if (liveEl) {
      liveEl.textContent = `Current view: ${state.routeTitle}.`;
    }

    // Sync empty state visibility
    if (emptyStateEl) {
      if (state.status === 'empty') {
        emptyStateEl.innerHTML = `
          <div class="nv-empty-state">
            <div class="nv-empty-state__visual" aria-hidden="true">
              <svg viewBox="0 0 100 100" width="80" height="80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto;" aria-hidden="true">
                <rect x="20" y="25" width="60" height="50" rx="4" stroke="rgba(138, 180, 248, 0.2)" stroke-width="1.5" stroke-dasharray="3 3"/>
                <path d="M 20 45 H 80 M 35 45 V 35 H 65 V 45" stroke="var(--sys-color-accent-primary)" stroke-width="1.75"/>
                <circle cx="50" cy="60" r="4" fill="currentColor"/>
              </svg>
            </div>
            <h4 class="nv-empty-state__title">Workspace is Empty</h4>
            <p class="nv-empty-state__message">
              No learning modules, publications, or simulation agents have been initialized for the current path block. Select a path block to get started or initialize the default view.
            </p>
            <div class="nv-empty-state__actions">
              <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: center; align-items: center;">
                <button class="nv-button" data-variant="primary" data-workspace-action="open-workspace">Initialize Workspace</button>
                <button class="nv-button" data-variant="secondary" data-workspace-action="explore-learning">Explore Learning Paths</button>
                <button class="nv-button" data-variant="secondary" data-workspace-action="browse-modules">Browse Modules</button>
              </div>
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
    if (window.NV_DEBUG) console.log(`Workspace action triggered: ${action}`);

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

  function renderWorkspaceSections() {
    renderReviewDashboard();
    wireReviewLaunchers();
    renderRecentLabs();
    renderPinnedMemories();
    renderSemanticSuggestions();
    renderRecentVisualizations();
    renderPinnedVisualizations();
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

    renderWorkspaceSections();

    window.addEventListener('nv:routerendered', (e) => {
      const routeId = e.detail?.routeId;
      if (routeId === 'workspace') {
        renderContinuity().catch(console.error);
        renderWorkspaceSections();
      }
    });

    window.addEventListener("nv:contentloaded", () => {
      renderContinuity().catch(console.error);
      renderReviewDashboard();
      wireReviewLaunchers();
    });

    window.addEventListener("nv:progressupdated", () => {
      renderContinuity().catch(console.error);
      renderReviewDashboard();
      wireReviewLaunchers();
    });

    window.addEventListener("nv:reviewupdated", () => {
      renderReviewDashboard();
      wireReviewLaunchers();
    });

    // NV-1100-P7: Re-render recent labs when lab state changes
    window.addEventListener("nv:lab_recent_updated", () => {
      renderRecentLabs();
    });

    window.addEventListener("nv:lab_state_saved", () => {
      renderRecentLabs();
    });

    // NV-1100-P8: Re-render pinned memories when memory state changes
    window.addEventListener("nv:memory_pinned", () => {
      renderPinnedMemories();
      renderSemanticSuggestions();
    });

    window.addEventListener("nv:memory_created", () => {
      renderPinnedMemories();
      renderSemanticSuggestions();
    });

    window.addEventListener("nv:memory_updated", () => {
      renderPinnedMemories();
      renderSemanticSuggestions();
    });

    // Personalization controller re-renders the workspace DOM. We re-render
    // the review dashboard afterward so the data stays in sync.
    window.addEventListener("nv:workspaceupdated", () => {
      renderReviewDashboard();
    });

    renderDirty();
  }

  function renderReviewDashboard() {
    if (!reviewDashboard || typeof reviewDashboard.render !== 'function') return;
    try {
      reviewDashboard.render(root);
    } catch (error) {
      if (window.NV_DEBUG) console.warn('Review dashboard render failed', error);
    }
    renderReviewDueList();
  }

  function renderReviewDueList() {
    if (!root) return;
    const mount = root.querySelector('[data-review-due-list-mount]');
    if (!mount) return;
    const discovery = window.NeuralVerse?.reviewDiscovery;
    const scheduler = window.NeuralVerse?.reviewScheduler;
    if (!discovery || !scheduler) {
      mount.innerHTML = '';
      return;
    }
    try {
      const html = discovery.renderDueArtifactsList(scheduler, { limit: 5 });
      mount.innerHTML = html;
    } catch (e) {
      mount.innerHTML = '';
    }
  }

  function wireReviewLaunchers() {
    if (!root) return;
    const startBtn = root.querySelector('[data-review-dashboard-start]');
    const continueBtn = root.querySelector('[data-review-dashboard-continue]');
    const skipBtn = root.querySelector('[data-review-dashboard-skip]');
    const dashboardCard = root.querySelector('[data-review-dashboard]');

    function openSession() {
      const ctrl = window.NeuralVerse?.reviewSessionController;
      if (!ctrl) {
        if (window.NV_DEBUG) console.warn('Review session controller not available');
        return;
      }
      // Always start a fresh session from the workspace dashboard.
      // Resume is reserved for reload restoration (the session state marker
      // is honored only by the reload-survival path, not by user-initiated
      // Start Review clicks).
      const result = ctrl.startSession();
      if (window.NV_DEBUG) console.log('Review session opened:', result);
    }

    if (startBtn && !startBtn.dataset.reviewWired) {
      startBtn.addEventListener('click', (e) => { e.preventDefault(); openSession(); });
      startBtn.dataset.reviewWired = '1';
    }
    if (continueBtn && !continueBtn.dataset.reviewWired) {
      continueBtn.addEventListener('click', (e) => { e.preventDefault(); openSession(); });
      continueBtn.dataset.reviewWired = '1';
    }
    if (skipBtn && !skipBtn.dataset.reviewWired) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Skip = do nothing for now; the dashboard closes any visible session state.
        // This is informational only; no state mutation.
      });
      skipBtn.dataset.reviewWired = '1';
    }
    if (dashboardCard && !dashboardCard.dataset.reviewWired) {
      dashboardCard.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        // Clicking the card body does not auto-open a session; reserved for future "click to expand".
      });
      dashboardCard.dataset.reviewWired = '1';
    }
  }

  function renderRecentLabs() {
    var mount = root.querySelector('[data-recent-labs-mount]');
    if (!mount) return;

    var storage = window.NeuralVerse?.LabStateStorage;
    var registry = window.NeuralVerse?.LabRegistry;
    if (!storage || !registry) {
      mount.innerHTML = '<p class="nv-muted">Laboratory system not available.</p>';
      return;
    }

    var recent = storage.getRecentLabs();
    if (!recent || recent.length === 0) {
      mount.innerHTML = '<p class="nv-muted">No laboratories visited yet. <a href="#/laboratory">Browse laboratories</a></p>';
      return;
    }

    var html = '<div class="nv-workspace-card-list">';
    recent.slice(0, 5).forEach(function (r) {
      var lab = registry.get(r.labId);
      var labId = lab ? lab.slug : r.labId;
      html += '<a href="#/laboratory/' + encodeURIComponent(labId) + '" ';
      html += 'class="nv-lab-card nv-lab-card--recent nv-workspace-card-list__item">';
      html += '<h4 class="nv-lab-card-title nv-workspace-card-list__title">' + escapeWorkspaceHtml(r.title || r.labId) + '</h4>';
      html += '<span class="nv-lab-card-time">Last opened: ' + escapeWorkspaceHtml(r.lastOpened ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(r.lastOpened)) : 'Never') + '</span>';
      html += '</a>';
    });
    html += '</div>';
    if (recent.length > 5) {
      html += '<a href="#/laboratory" class="nv-workspace-card-list__more">View all laboratories</a>';
    }
    mount.innerHTML = html;
  }

  function renderPinnedMemories() {
    var mount = root.querySelector('[data-pinned-memories-mount]');
    if (!mount) return;

    var memoryRegistry = window.NeuralVerse?.MemoryRegistry;
    if (!memoryRegistry) {
      mount.innerHTML = '';
      return;
    }

    var pinned = memoryRegistry.getPinned ? memoryRegistry.getPinned() : [];
    if (!pinned || pinned.length === 0) {
      mount.innerHTML = '<p class="nv-muted nv-workspace-card-list__empty">No pinned memories. <a href="#/memory">Create one</a></p>';
      return;
    }

    var html = '<div class="nv-workspace-card-list">';
    pinned.slice(0, 5).forEach(function (mem) {
      html += '<a href="#/memory/' + encodeURIComponent(mem.id) + '" ';
      html += 'class="nv-memory-card nv-workspace-card-list__item">';
      html += '<div class="nv-workspace-card-list__meta-row">';
      html += '<span class="nv-memory-type-badge" data-type="' + escapeWorkspaceHtml(mem.type || 'note') + '">' + escapeWorkspaceHtml(mem.type || 'note') + '</span>';
      html += '<span class="nv-workspace-card-list__pin" aria-hidden="true">&#9733;</span>';
      html += '</div>';
      html += '<h4 class="nv-workspace-card-list__title">' + escapeWorkspaceHtml(mem.title || 'Untitled') + '</h4>';
      if (mem.summary) {
        html += '<p class="nv-workspace-card-list__summary">' + escapeWorkspaceHtml(mem.summary.substring(0, 100)) + '</p>';
      }
      html += '</a>';
    });
    html += '</div>';
    mount.innerHTML = html;
  }

  function renderSemanticSuggestions() {
    var mount = root.querySelector('[data-semantic-suggestions-mount]');
    if (!mount) return;

    var engine = window.NeuralVerse?.SemanticEngine;
    var recs = window.NeuralVerse?.RecommendationEngine;
    if (!engine || !recs) {
      mount.innerHTML = '';
      return;
    }

    // Use the most recently accessed concept from session continuity
    var session = window.NeuralVerse?.SessionContinuity;
    var recentConcepts = session ? (session.loadSession()?.recentConcepts || []) : [];
    var conceptId = recentConcepts.length > 0 ? recentConcepts[0] : null;

    if (!conceptId) {
      mount.innerHTML = '<p class="nv-muted nv-workspace-card-list__empty">No semantic context available. <a href="#/semantic-learning">Explore concepts</a></p>';
      return;
    }

    var concept = engine.getConcept(conceptId);
    if (!concept) {
      mount.innerHTML = '<p class="nv-muted nv-workspace-card-list__empty">Concept not found. <a href="#/semantic-learning">Explore concepts</a></p>';
      return;
    }

    var recommendations = recs.getRecommendations(conceptId);
    var html = '<div class="nv-workspace-card-list">';
    html += '<p class="nv-workspace-card-list__summary">Context: <strong>' + escapeWorkspaceHtml(concept.name || conceptId) + '</strong></p>';

    // Related concepts (max 3)
    if (recommendations.categories.relatedConcepts && recommendations.categories.relatedConcepts.length > 0) {
      html += '<div class="nv-workspace-card-list__label">Related:</div>';
      recommendations.categories.relatedConcepts.slice(0, 3).forEach(function (item) {
        html += '<a href="#/knowledge-graph?focus=' + encodeURIComponent(item.id) + '" class="nv-workspace-card-list__link">' + escapeWorkspaceHtml(item.name || item.id) + '</a>';
      });
    }

    // Suggested labs (max 2)
    if (recommendations.categories.relatedLabs && recommendations.categories.relatedLabs.length > 0) {
      html += '<div class="nv-workspace-card-list__label">Labs:</div>';
      recommendations.categories.relatedLabs.slice(0, 2).forEach(function (item) {
        html += '<a href="#/laboratory/' + encodeURIComponent(item.slug || item.id) + '" class="nv-workspace-card-list__link">' + escapeWorkspaceHtml(item.name || item.id) + '</a>';
      });
    }

    html += '</div>';
    mount.innerHTML = html;
  }

  function escapeWorkspaceHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderRecentVisualizations() {
    var mount = root.querySelector('[data-recent-viz-mount]');
    if (!mount) return;

    var storage = window.NeuralVerse?.VizStateStorage;
    if (!storage) {
      mount.innerHTML = '<p class="nv-muted nv-workspace-card-list__empty">Visualization system not available. <a href="#/visualizations">Browse visualizations</a></p>';
      return;
    }

    var recent = storage.getRecent();
    if (!recent || recent.length === 0) {
      mount.innerHTML = '<p class="nv-muted nv-workspace-card-list__empty">No visualizations visited yet. <a href="#/visualizations">Browse visualizations</a></p>';
      return;
    }

    var html = '<div class="nv-pviz-workspace-recent">';
    recent.slice(0, 5).forEach(function (r) {
      html += '<a href="#/visualizations/' + encodeURIComponent(r.vizId) + '" class="nv-pviz-workspace-item">';
      html += '<div class="nv-pviz-workspace-item-title">' + escapeWorkspaceHtml(r.title || r.vizId) + '</div>';
      html += '<div class="nv-pviz-workspace-item-meta">Last opened: ' + escapeWorkspaceHtml(r.lastOpened ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(r.lastOpened)) : 'Never') + '</div>';
      html += '</a>';
    });
    html += '</div>';
    if (recent.length > 5) {
      html += '<a href="#/visualizations" class="nv-workspace-card-list__more">View all visualizations</a>';
    }
    mount.innerHTML = html;
  }

  function renderPinnedVisualizations() {
    var mount = root.querySelector('[data-pinned-viz-mount]');
    if (!mount) return;

    var storage = window.NeuralVerse?.VizStateStorage;
    var registry = window.NeuralVerse?.ParametricRegistry;
    if (!storage || !registry) {
      mount.innerHTML = '';
      return;
    }

    var favorites = storage.loadFavorites();
    if (!favorites || favorites.length === 0) {
      mount.innerHTML = '<p class="nv-muted nv-workspace-card-list__empty">No pinned visualizations yet. <a href="#/visualizations">Explore visualizations</a></p>';
      return;
    }

    var html = '<div class="nv-pviz-workspace-recent">';
    favorites.slice(0, 5).forEach(function (vizId) {
      var def = registry.get(vizId);
      if (!def) return;
      html += '<a href="#/visualizations/' + encodeURIComponent(def.slug) + '" class="nv-pviz-workspace-item">';
      html += '<div class="nv-pviz-workspace-item-title">&#9733; ' + escapeWorkspaceHtml(def.title || vizId) + '</div>';
      html += '<div class="nv-pviz-workspace-item-meta">' + escapeWorkspaceHtml(def.category || '') + '</div>';
      html += '</a>';
    });
    html += '</div>';
    if (favorites.length > 5) {
      html += '<a href="#/visualizations" class="nv-workspace-card-list__more">View all visualizations</a>';
    }
    mount.innerHTML = html;
  }

  return {
    init,
    renderContinuity,
    renderReviewDashboard,
    renderRecentLabs,
    renderPinnedMemories,
    renderSemanticSuggestions,
    renderRecentVisualizations,
    renderPinnedVisualizations,
    wireReviewLaunchers,
    markDirty,
    renderDirty,
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
