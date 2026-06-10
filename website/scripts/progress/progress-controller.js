import { createProgressService, PROGRESS_ENTITY_TYPES } from "./progress-service.js";
import { createProgressState } from "./progress-state.js";
import { createLearningService } from "../learning/learning-service.js";

function getContentIdFromHash(hashValue = window.location.hash) {
  const cleanHash = String(hashValue || "").replace(/^#\/?/, "");
  const segments = cleanHash.split("/").filter(Boolean);

  if (segments[0] !== "content") {
    return null;
  }

  return segments[1] || null;
}

function formatStatus(status) {
  return String(status || "not-started").replaceAll("-", " ");
}

function getProgressLabel(value) {
  if (value <= 0) return "Not started";
  if (value >= 100) return "Completed";
  return "In progress";
}

function setText(target, value) {
  if (target) {
    target.textContent = value;
  }
}

function updateMeter(target, value) {
  if (!target) return;

  target.value = value;
  target.max = 100;
  target.setAttribute("aria-valuemin", "0");
  target.setAttribute("aria-valuemax", "100");
  target.setAttribute("aria-valuenow", String(value));
}

export function createProgressController(options = {}) {
  const root = options.root || document;
  const progressService = options.progressService || createProgressService();
  const progressState = options.progressState || createProgressState();
  const learningService = options.learningService || createLearningService();

  function getProgressElements() {
    return {
      contentStatus: root.querySelector("[data-progress-content-status]"),
      contentValue: root.querySelector("[data-progress-content-value]"),
      contentMeter: root.querySelector("[data-progress-content-meter]"),
      completionButton: root.querySelector("[data-progress-complete-content]"),
      completionTimestamp: root.querySelector("[data-progress-completed-at]"),
      liveRegion: root.querySelector("[data-progress-live]"),

      pathProgressTargets: root.querySelectorAll("[data-path-progress-id]"),
      pathProgressMeters: root.querySelectorAll("[data-path-progress-meter]"),
      pathProgressCounts: root.querySelectorAll("[data-path-progress-count]"),
      pathProgressStatuses: root.querySelectorAll("[data-path-progress-status]"),

      moduleProgressTargets: root.querySelectorAll("[data-module-progress-id]"),
      moduleProgressMeters: root.querySelectorAll("[data-module-progress-meter]"),
      moduleProgressCounts: root.querySelectorAll("[data-module-progress-count]"),
      moduleProgressStatuses: root.querySelectorAll("[data-module-progress-status]"),

      workspacePathProgress: root.querySelector("[data-workspace-progress-path]"),
      workspaceModuleProgress: root.querySelector("[data-workspace-progress-module]"),
      workspaceContentStatus: root.querySelector("[data-workspace-progress-content-status]"),
      workspaceContentCount: root.querySelector("[data-workspace-progress-count]"),
    };
  }

  function announce(message) {
    const elements = getProgressElements();
    if (elements.liveRegion) {
      elements.liveRegion.textContent = message;
    }
  }

  function syncRecords() {
    progressState.setRecords(progressService.getRecords());
  }

  function renderContentProgress(contentItemId) {
    if (!contentItemId) return;

    const elements = getProgressElements();
    const record = progressService.getContentProgress(contentItemId);

    setText(elements.contentStatus, getProgressLabel(record.progressValue));
    setText(elements.contentValue, `${record.progressValue}%`);
    updateMeter(elements.contentMeter, record.progressValue);

    if (elements.completionTimestamp) {
      elements.completionTimestamp.textContent = record.completedAt
        ? new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(record.completedAt))
        : "Not completed";
    }

    if (elements.completionButton) {
      elements.completionButton.dataset.contentItemId = contentItemId;
      elements.completionButton.disabled = record.status === "completed";
      elements.completionButton.textContent =
        record.status === "completed" ? "Completed" : "Mark as Completed";
    }

    setText(elements.workspaceContentStatus, getProgressLabel(record.progressValue));
  }

  async function renderLearningAggregates() {
    const elements = getProgressElements();

    const [paths, modules] = await Promise.all([
      learningService.getLearningPaths(),
      learningService.getModules(),
    ]);

    const records = progressService.getRecords();

    elements.pathProgressTargets.forEach((target) => {
      const pathId = target.dataset.pathProgressId;
      const path = paths.find((item) => item.id === pathId);
      if (!path) return;

      const aggregate = progressService.computeLearningPathProgress(path, modules, records);

      target.textContent = `${aggregate.progressValue}%`;
      target.dataset.progressStatus = aggregate.status;
    });

    elements.pathProgressMeters.forEach((meter) => {
      const pathId = meter.dataset.pathProgressMeter;
      const path = paths.find((item) => item.id === pathId);
      if (!path) return;

      const aggregate = progressService.computeLearningPathProgress(path, modules, records);
      updateMeter(meter, aggregate.progressValue);
    });

    elements.pathProgressCounts.forEach((target) => {
      const pathId = target.dataset.pathProgressCount;
      const path = paths.find((item) => item.id === pathId);
      if (!path) return;

      const aggregate = progressService.computeLearningPathProgress(path, modules, records);
      target.textContent = `${aggregate.completed} of ${aggregate.total} completed`;
    });

    elements.pathProgressStatuses.forEach((target) => {
      const pathId = target.dataset.pathProgressStatus;
      const path = paths.find((item) => item.id === pathId);
      if (!path) return;

      const aggregate = progressService.computeLearningPathProgress(path, modules, records);
      target.textContent = getProgressLabel(aggregate.progressValue);
      target.dataset.progressStatus = aggregate.status;
    });

    elements.moduleProgressTargets.forEach((target) => {
      const moduleId = target.dataset.moduleProgressId;
      const module = modules.find((item) => item.id === moduleId);
      if (!module) return;

      const aggregate = progressService.computeModuleProgress(module, records);

      target.textContent = `${aggregate.progressValue}%`;
      target.dataset.progressStatus = aggregate.status;
    });

    elements.moduleProgressMeters.forEach((meter) => {
      const moduleId = meter.dataset.moduleProgressMeter;
      const module = modules.find((item) => item.id === moduleId);
      if (!module) return;

      const aggregate = progressService.computeModuleProgress(module, records);
      updateMeter(meter, aggregate.progressValue);
    });

    elements.moduleProgressCounts.forEach((target) => {
      const moduleId = target.dataset.moduleProgressCount;
      const module = modules.find((item) => item.id === moduleId);
      if (!module) return;

      const aggregate = progressService.computeModuleProgress(module, records);
      target.textContent = `${aggregate.completed} of ${aggregate.total} completed`;
    });

    elements.moduleProgressStatuses.forEach((target) => {
      const moduleId = target.dataset.moduleProgressStatus;
      const module = modules.find((item) => item.id === moduleId);
      if (!module) return;

      const aggregate = progressService.computeModuleProgress(module, records);
      target.textContent = getProgressLabel(aggregate.progressValue);
      target.dataset.progressStatus = aggregate.status;
    });

    const activePath = paths[0] || null;
    const activeModule = modules[0] || null;

    if (activePath && elements.workspacePathProgress) {
      const pathAggregate = progressService.computeLearningPathProgress(
        activePath,
        modules,
        records
      );

      elements.workspacePathProgress.textContent =
        `${pathAggregate.progressValue}% · ${pathAggregate.completed} of ${pathAggregate.total}`;
    }

    if (activeModule && elements.workspaceModuleProgress) {
      const moduleAggregate = progressService.computeModuleProgress(activeModule, records);

      elements.workspaceModuleProgress.textContent =
        `${moduleAggregate.progressValue}% · ${moduleAggregate.completed} of ${moduleAggregate.total}`;
    }

    if (elements.workspaceContentCount) {
      const totalContent = modules.flatMap((module) => module.contentItemIds || []).length;
      const completedContent = records.filter(
        (record) =>
          record.entityType === "content-item" &&
          record.status === "completed"
      ).length;

      elements.workspaceContentCount.textContent =
        totalContent > 0
          ? `${completedContent} of ${totalContent} completed`
          : "No progress yet";
    }
  }

  async function handleContentLoaded(contentItem) {
    if (!contentItem?.id) return;

    const record = progressService.markOpened(
      contentItem.id,
      PROGRESS_ENTITY_TYPES.CONTENT_ITEM
    );

    syncRecords();
    window.dispatchEvent(new CustomEvent("nv:progressupdated"));
    renderContentProgress(contentItem.id);
    await renderLearningAggregates();
    announce(`Progress updated. ${formatStatus(record.status)}.`);
  }

  async function handleRoute(hashValue = window.location.hash) {
    const contentItemId = getContentIdFromHash(hashValue);

    if (!contentItemId) {
      await renderLearningAggregates();
      return;
    }

    renderContentProgress(contentItemId);
    await renderLearningAggregates();
  }

  function bindCompletionButton() {
    root.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-progress-complete-content]");
      if (!button) {
        return;
      }

      const contentItemId = button.dataset.contentItemId;

      if (!contentItemId) {
        return;
      }

      progressService.markCompleted(
        contentItemId,
        PROGRESS_ENTITY_TYPES.CONTENT_ITEM
      );

      syncRecords();
      window.dispatchEvent(new CustomEvent("nv:progressupdated"));
      renderContentProgress(contentItemId);
      await renderLearningAggregates();
      announce("Content marked as completed.");
    });
  }

  function bindRouteEvents() {
    window.addEventListener("hashchange", () => {
      handleRoute(window.location.hash);
    });

    window.addEventListener("nv:routechange", (event) => {
      handleRoute(event.detail?.route || window.location.hash);
    });

    window.addEventListener("nv:contentloaded", async (event) => {
      await handleContentLoaded(event.detail?.contentItem);
    });

    window.addEventListener("nv:learningrendered", async () => {
      await renderLearningAggregates();
    });

    window.addEventListener("nv:modulesrendered", async () => {
      await renderLearningAggregates();
    });
  }

  async function init() {
    syncRecords();
    bindCompletionButton();
    bindRouteEvents();
    await handleRoute(window.location.hash);

    window.NeuralVerse = window.NeuralVerse || {};
    window.NeuralVerse.progress = {
      service: progressService,
      state: progressState,
      refresh: handleRoute,
    };
  }

  return {
    init,
    refresh: handleRoute,
    getState: progressState.getState,
  };
}
