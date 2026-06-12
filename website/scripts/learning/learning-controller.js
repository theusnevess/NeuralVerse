import { createLearningService } from "./learning-service.js";
import { createLearningState } from "./learning-state.js";
import { createContentService } from "../content/content-service.js";
import { createProgressService } from "../progress/progress-service.js";

function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (typeof textContent === "string") {
    element.textContent = textContent;
  }

  return element;
}

function createMeta(label, value) {
  const item = createElement("span", "nv-card-meta__item");
  item.textContent = `${label}: ${value}`;
  return item;
}

function formatReadingTime(minutes) {
  if (!minutes) {
    return {
      text: "0m",
      label: "0 minutes",
    };
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

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

function getProgressStatus(progressValue) {
  if (progressValue <= 0) return "Not Started";
  if (progressValue >= 100) return "Completed";
  return "In Progress";
}

function createMetric(label, value, ariaLabel = null) {
  const item = createElement("div", "nv-overview-metric");

  const term = createElement("span", "nv-overview-metric__label", label);
  const data = createElement("strong", "nv-overview-metric__value", value);

  if (ariaLabel) {
    data.setAttribute("aria-label", ariaLabel);
  }

  item.append(term, data);
  return item;
}

function computeModuleOverview(module, contentItems, progressRecords) {
  const moduleContentItems = contentItems.filter(
    (contentItem) => contentItem.moduleId === module.id
  );

  const completedContentItems = moduleContentItems.filter((contentItem) => {
    return progressRecords.some(
      (record) =>
        record.entityId === contentItem.id &&
        record.entityType === "content-item" &&
        record.status === "completed"
    );
  });

  const contentCount = moduleContentItems.length;
  const completedCount = completedContentItems.length;
  const remainingCount = Math.max(contentCount - completedCount, 0);

  const readingMinutes = moduleContentItems.reduce(
    (total, contentItem) => total + Number(contentItem.estimatedReadingTime || 0),
    0
  );

  const remainingReadingMinutes = moduleContentItems
    .filter((contentItem) => {
      return !completedContentItems.some(
        (completedItem) => completedItem.id === contentItem.id
      );
    })
    .reduce(
      (total, contentItem) => total + Number(contentItem.estimatedReadingTime || 0),
      0
    );

  const progressValue = contentCount
    ? Math.round((completedCount / contentCount) * 100)
    : 0;

  return {
    contentCount,
    completedCount,
    remainingCount,
    readingTime: formatReadingTime(readingMinutes),
    remainingReadingTime: formatReadingTime(remainingReadingMinutes),
    progressValue,
    status: getProgressStatus(progressValue),
  };
}

export function createLearningController(options = {}) {
  const root = options.root || document;
  const learningService = options.learningService || createLearningService();
  const learningState = options.learningState || createLearningState();
  const navigationState = options.navigationState || window.navigationState;
  const contentService = options.contentService || createContentService();
  const progressService = options.progressService || createProgressService();

  const elements = {
    pathList: root.querySelector("[data-learning-path-list]"),
    moduleList: root.querySelector("[data-module-list]"),
    learningEmpty: root.querySelector("[data-learning-empty]"),
    moduleEmpty: root.querySelector("[data-module-empty]"),
    liveRegion: root.querySelector("[data-learning-live]"),
  };

  async function renderLearningPaths(paths) {
    if (!elements.pathList) {
      return;
    }

    elements.pathList.innerHTML = "";

    let modules = [];
    let contentIndex = [];
    let progressRecords = [];

    try {
      modules = await learningService.getModules();
      contentIndex = await contentService.getContentIndex();
      progressRecords = progressService.getRecords();
    } catch (error) {
      console.error("Failed to load metrics data for learning paths", error);
    }

    paths.forEach((path) => {
      const card = createElement("article", "nv-learning-path-card");
      card.setAttribute("aria-labelledby", `learning-path-${path.id}`);

      const title = createElement("h2", "nv-learning-path-card__title", path.title);
      title.id = `learning-path-${path.id}`;

      const description = createElement(
        "p",
        "nv-learning-path-card__description",
        path.description
      );

      const pathModules = modules.filter((module) => module.pathId === path.id);
      const moduleCount = pathModules.length;

      const pathContentItems = contentIndex.filter((item) =>
        pathModules.some((mod) => mod.id === item.moduleId)
      );
      const contentCount = pathContentItems.length;

      const completedContentCount = pathContentItems.filter((item) => {
        const record = progressRecords.find(
          (r) => r.entityId === item.id && r.entityType === "content-item"
        );
        return record?.status === "completed";
      }).length;

      const remainingContentCount = contentCount - completedContentCount;

      const readingLoadMinutes = pathContentItems.reduce(
        (sum, item) => sum + (item.estimatedReadingTime || 0),
        0
      );

      const remainingReadingTimeMinutes = pathContentItems.reduce((sum, item) => {
        const record = progressRecords.find(
          (r) => r.entityId === item.id && r.entityType === "content-item"
        );
        const isCompleted = record?.status === "completed";
        return sum + (isCompleted ? 0 : (item.estimatedReadingTime || 0));
      }, 0);

      const progressPercent =
        contentCount > 0 ? Math.round((completedContentCount / contentCount) * 100) : 0;

      const statusLabel = getProgressStatus(progressPercent);

      const meta = createElement("div", "nv-card-meta");
      meta.append(
        createMeta("Modules", String(moduleCount)),
        createMeta("Status", statusLabel)
      );

      const status = createElement("span", "nv-card-status", statusLabel);
      status.dataset.status = statusLabel.toLowerCase().replace(' ', '-');
      status.dataset.progressStatus = statusLabel.toLowerCase().replace(' ', '-');

      // Inline progress target
      const progressOverview = createElement("div", "nv-progress-overview");
      progressOverview.setAttribute("aria-label", `${path.title} progress`);

      progressOverview.innerHTML = `
        <div class="nv-progress-overview__header">
          <span>Progress</span>
          <strong data-path-progress-id="${path.id}">${progressPercent}%</strong>
        </div>
        <progress
          class="nv-progress-meter"
          value="${progressPercent}"
          max="100"
          role="progressbar"
          aria-label="${path.title} progress"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="${progressPercent}"
          data-path-progress-meter="${path.id}"
        ></progress>
        <div class="nv-progress-overview__meta">
          <span data-path-progress-count="${path.id}">${completedContentCount} of ${contentCount} completed</span>
          <span class="nv-card-status" data-path-progress-status="${path.id}" data-progress-status="${statusLabel.toLowerCase().replace(' ', '-')}">${statusLabel}</span>
        </div>
      `;

      // Metrics block
      const readingLoad = formatReadingTime(readingLoadMinutes);
      const remainingTime = formatReadingTime(remainingReadingTimeMinutes);

      const metricsBlock = createElement("div", "nv-path-metrics");
      metricsBlock.innerHTML = `
        <div class="nv-path-metrics__section" aria-label="Module and Content aggregates">
          <div class="nv-path-metric">
            <span class="nv-path-metric__label">Modules</span>
            <strong class="nv-path-metric__value" aria-label="Module Count: ${moduleCount}">${moduleCount}</strong>
          </div>
          <div class="nv-path-metric">
            <span class="nv-path-metric__label">Content</span>
            <strong class="nv-path-metric__value" aria-label="Content Count: ${contentCount}">${contentCount}</strong>
          </div>
          <div class="nv-path-metric">
            <span class="nv-path-metric__label">Completed</span>
            <strong class="nv-path-metric__value" aria-label="Completed Content: ${completedContentCount}">${completedContentCount}</strong>
          </div>
          <div class="nv-path-metric">
            <span class="nv-path-metric__label">Remaining</span>
            <strong class="nv-path-metric__value" aria-label="Remaining Content: ${remainingContentCount}">${remainingContentCount}</strong>
          </div>
        </div>
        <div class="nv-path-metrics__section" aria-label="Reading estimates">
          <div class="nv-path-metric">
            <span class="nv-path-metric__label">Reading Load</span>
            <strong class="nv-path-metric__value" aria-label="Estimated Reading Time: ${readingLoad.label}">${readingLoad.text}</strong>
          </div>
          <div class="nv-path-metric">
            <span class="nv-path-metric__label">Remaining Time</span>
            <strong class="nv-path-metric__value" aria-label="Remaining Reading Time: ${remainingTime.label}">${remainingTime.text}</strong>
          </div>
        </div>
      `;

      const action = createElement("button", "nv-button", "Select Path");
      action.type = "button";
      action.dataset.learningPathId = path.id;
      action.setAttribute("aria-label", `Select ${path.title} learning path`);

      action.addEventListener("click", async () => {
        const modules = await learningService.getModulesByPath(path.id);

        learningState.setState({
          selectedPathId: path.id,
          selectedModuleId: null,
          availableModules: modules,
        });

        renderModules(modules);
        announce(`${path.title} selected.`);
      });

      card.append(title, description, meta, status, progressOverview, metricsBlock, action);
      elements.pathList.append(card);
    });

    if (elements.learningEmpty) {
      elements.learningEmpty.hidden = paths.length > 0;
    }

    // Trigger progress update for newly created DOM nodes
    window.dispatchEvent(new CustomEvent("nv:learningrendered"));
  }

  async function renderModules(modules) {
    if (!elements.moduleList) {
      return;
    }

    elements.moduleList.innerHTML = "";

    if (!modules.length) {
      if (elements.moduleEmpty) {
        elements.moduleEmpty.hidden = false;
      }
      return;
    }

    if (elements.moduleEmpty) {
      elements.moduleEmpty.hidden = true;
    }

    let contentItems = [];
    try {
      contentItems = await learningService.getContentItems();
    } catch (error) {
      console.error("Failed to load content items for modules overview", error);
    }

    const progressRecords =
      window.NeuralVerse?.progress?.service?.getRecords?.() || progressService.getRecords() || [];

    modules.forEach((module) => {
      const card = createElement("article", "nv-module-card");
      card.setAttribute("aria-labelledby", `module-${module.id}`);

      const title = createElement("h2", "nv-module-card__title", module.title);
      title.id = `module-${module.id}`;

      const description = createElement(
        "p",
        "nv-module-card__description",
        module.description
      );

      const overview = computeModuleOverview(module, contentItems, progressRecords);

      const meta = createElement("div", "nv-card-meta");
      meta.append(
        createMeta("Content items", String(overview.contentCount)),
        createMeta("Status", overview.status)
      );

      const status = createElement("span", "nv-card-status", overview.status);
      status.dataset.status = overview.status.toLowerCase().replace(' ', '-');
      status.dataset.progressStatus = overview.status.toLowerCase().replace(' ', '-');

      // Inline progress target
      const progressOverview = createElement("div", "nv-progress-overview");
      progressOverview.setAttribute("aria-label", `${module.title} progress`);

      progressOverview.innerHTML = `
        <div class="nv-progress-overview__header">
          <span>Progress</span>
          <strong data-module-progress-id="${module.id}">${overview.progressValue}%</strong>
        </div>
        <progress
          class="nv-progress-meter"
          value="${overview.progressValue}"
          max="100"
          role="progressbar"
          aria-label="${module.title} progress"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="${overview.progressValue}"
          data-module-progress-meter="${module.id}"
        ></progress>
        <div class="nv-progress-overview__meta">
          <span data-module-progress-count="${module.id}">${overview.completedCount} of ${overview.contentCount} completed</span>
          <span class="nv-card-status" data-module-progress-status="${module.id}" data-progress-status="${overview.status.toLowerCase().replace(' ', '-')}">${overview.status}</span>
        </div>
      `;

      // Overview Grid
      const overviewBlock = createElement("div", "nv-overview-grid");
      overviewBlock.setAttribute("aria-label", `${module.title} overview`);

      overviewBlock.append(
        createMetric("Content", String(overview.contentCount)),
        createMetric("Completed", String(overview.completedCount)),
        createMetric("Remaining", String(overview.remainingCount)),
        createMetric(
          "Reading Load",
          overview.readingTime.text,
          overview.readingTime.label
        ),
        createMetric(
          "Remaining Time",
          overview.remainingReadingTime.text,
          overview.remainingReadingTime.label
        ),
        createMetric("Status", overview.status)
      );

      const action = createElement("button", "nv-button", "Open Module");
      action.type = "button";
      action.dataset.moduleId = module.id;
      action.setAttribute("aria-label", `Open ${module.title} module`);

      action.addEventListener("click", () => {
        learningState.setSelectedModule(module.id);
        announce(`${module.title} selected.`);
      });

      card.append(
        title,
        description,
        meta,
        status,
        progressOverview,
        overviewBlock,
        action
      );
      elements.moduleList.append(card);
    });

    // Trigger progress update for newly created DOM nodes
    window.dispatchEvent(new CustomEvent("nv:modulesrendered"));
  }

  function announce(message) {
    if (elements.liveRegion) {
      elements.liveRegion.textContent = message;
    }
  }

  async function init() {
    elements.pathList = root.querySelector("[data-learning-path-list]");
    elements.moduleList = root.querySelector("[data-module-list]");
    elements.learningEmpty = root.querySelector("[data-learning-empty]");
    elements.moduleEmpty = root.querySelector("[data-module-empty]");
    elements.liveRegion = root.querySelector("[data-learning-live]");

    const paths = await learningService.getLearningPaths();
    const currentState = learningState.getState();

    learningState.setState({
      availablePaths: paths,
    });

    if (elements.pathList) {
      await renderLearningPaths(paths);
    }

    if (currentState.selectedPathId) {
      const modules = await learningService.getModulesByPath(currentState.selectedPathId);
      learningState.setState({ availableModules: modules });
      if (elements.moduleList) {
        renderModules(modules);
      }
    } else {
      if (elements.moduleList) {
        renderModules([]);
      }
    }

    window.NeuralVerse = window.NeuralVerse || {};
    window.NeuralVerse.learning = {
      state: learningState,
      service: learningService,
      renderModules,
    };
  }

  window.addEventListener('nv:routerendered', (e) => {
    const routeId = e.detail?.routeId;
    if (routeId === 'learning' || routeId === 'modules') {
      init().catch(err => console.error("Dynamic learning init failed", err));
    }
  });

  if (navigationState) {
    navigationState.subscribe((navState) => {
      const route = navState.currentRoute;
      if (route && (route.id === 'learning' || route.id === 'modules')) {
        if (root.querySelector("[data-learning-path-list]") || root.querySelector("[data-module-list]")) {
          init().catch(err => console.error("Dynamic learning init failed", err));
        } else {
          setTimeout(() => {
            if (root.querySelector("[data-learning-path-list]") || root.querySelector("[data-module-list]")) {
              init().catch(err => console.error("Dynamic learning init failed", err));
            }
          }, 50);
        }
      }
    });
  }

  window.addEventListener("nv:progressupdated", () => {
    const state = learningState.getState();

    if (state.availableModules && state.availableModules.length) {
      renderModules(state.availableModules);
    }
  });

  return {
    init,
    renderLearningPaths,
    renderModules,
    getState: learningState.getState,
  };
}
