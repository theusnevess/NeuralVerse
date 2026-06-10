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

function updateProgressMeter(element, aggregate) {
  if (!element || !aggregate) {
    return;
  }

  element.value = aggregate.progressValue;
  element.max = 100;
  element.setAttribute("aria-valuemin", "0");
  element.setAttribute("aria-valuemax", "100");
  element.setAttribute("aria-valuenow", String(aggregate.progressValue));
}

export function createProgressController(options = {}) {
  const root = options.root || document;
  const progressService = options.progressService || createProgressService();
  const progressState = options.progressState || createProgressState();
  const learningService = options.learningService || createLearningService();

  function getElements() {
    return {
      contentStatus: root.querySelector("[data-progress-content-status]"),
      contentValue: root.querySelector("[data-progress-content-value]"),
      contentMeter: root.querySelector("[data-progress-content-meter]"),
      completionButton: root.querySelector("[data-progress-complete-content]"),
      pathProgressTargets: root.querySelectorAll("[data-path-progress-id]"),
      moduleProgressTargets: root.querySelectorAll("[data-module-progress-id]"),
      liveRegion: root.querySelector("[data-progress-live]"),
    };
  }

  function announce(message) {
    const elements = getElements();
    if (elements.liveRegion) {
      elements.liveRegion.textContent = message;
    }
  }

  function syncRecords() {
    progressState.setRecords(progressService.getRecords());
  }

  function renderContentProgress(contentItemId) {
    if (!contentItemId) {
      return;
    }

    const record = progressService.getContentProgress(contentItemId);
    const elements = getElements();

    if (elements.contentStatus) {
      elements.contentStatus.textContent = formatStatus(record.status);
    }

    if (elements.contentValue) {
      elements.contentValue.textContent = `${record.progressValue}%`;
    }

    updateProgressMeter(elements.contentMeter, {
      progressValue: record.progressValue,
    });

    if (elements.completionButton) {
      elements.completionButton.dataset.contentItemId = contentItemId;
      elements.completionButton.disabled = record.status === "completed";
      elements.completionButton.textContent =
        record.status === "completed" ? "Completed" : "Mark as Completed";
    }
  }

  async function renderLearningAggregates() {
    const [paths, modules] = await Promise.all([
      learningService.getLearningPaths(),
      learningService.getModules(),
    ]);

    const records = progressService.getRecords();
    const elements = getElements();

    elements.pathProgressTargets.forEach((target) => {
      const pathId = target.dataset.pathProgressId;
      const path = paths.find((item) => item.id === pathId);

      if (!path) {
        return;
      }

      const aggregate = progressService.computeLearningPathProgress(
        path,
        modules,
        records
      );

      target.textContent = `${aggregate.progressValue}%`;
      target.dataset.progressStatus = aggregate.status;
    });

    elements.moduleProgressTargets.forEach((target) => {
      const moduleId = target.dataset.moduleProgressId;
      const module = modules.find((item) => item.id === moduleId);

      if (!module) {
        return;
      }

      const aggregate = progressService.computeModuleProgress(module, records);

      target.textContent = `${aggregate.progressValue}%`;
      target.dataset.progressStatus = aggregate.status;
    });
  }

  async function handleContentLoaded(contentItem) {
    if (!contentItem?.id) return;

    const record = progressService.markOpened(
      contentItem.id,
      PROGRESS_ENTITY_TYPES.CONTENT_ITEM
    );

    syncRecords();
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
