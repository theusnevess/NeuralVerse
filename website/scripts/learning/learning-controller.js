import { createLearningService } from "./learning-service.js";
import { createLearningState } from "./learning-state.js";

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

export function createLearningController(options = {}) {
  const root = options.root || document;
  const learningService = options.learningService || createLearningService();
  const learningState = options.learningState || createLearningState();
  const navigationState = options.navigationState || window.navigationState;

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

      const meta = createElement("div", "nv-card-meta");
      meta.append(
        createMeta("Modules", String(path.moduleIds.length)),
        createMeta("Status", path.status)
      );

      const status = createElement("span", "nv-card-status", path.status);
      status.dataset.status = path.status;

      // Inline progress target
      const progress = createElement("div", "nv-progress-inline");
      progress.setAttribute("aria-label", "Learning path progress");
      progress.innerHTML = `
        <span>Progress:</span>
        <strong data-path-progress-id="${path.id}">0%</strong>
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

      card.append(title, description, meta, status, progress, action);
      elements.pathList.append(card);
    });

    if (elements.learningEmpty) {
      elements.learningEmpty.hidden = paths.length > 0;
    }

    // Trigger progress update for newly created DOM nodes
    window.dispatchEvent(new CustomEvent("nv:viewrendered"));
  }

  function renderModules(modules) {
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

      const meta = createElement("div", "nv-card-meta");
      meta.append(
        createMeta("Content items", String(module.contentItemIds.length)),
        createMeta("Status", module.status)
      );

      const status = createElement("span", "nv-card-status", module.status);
      status.dataset.status = module.status;

      // Inline progress target
      const progress = createElement("div", "nv-progress-inline");
      progress.setAttribute("aria-label", "Module progress");
      progress.innerHTML = `
        <span>Progress:</span>
        <strong data-module-progress-id="${module.id}">0%</strong>
      `;

      const action = createElement("button", "nv-button", "Open Module");
      action.type = "button";
      action.dataset.moduleId = module.id;
      action.setAttribute("aria-label", `Open ${module.title} module`);

      action.addEventListener("click", () => {
        learningState.setSelectedModule(module.id);
        announce(`${module.title} selected.`);
      });

      card.append(title, description, meta, status, progress, action);
      elements.moduleList.append(card);
    });

    // Trigger progress update for newly created DOM nodes
    window.dispatchEvent(new CustomEvent("nv:viewrendered"));
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

  if (navigationState) {
    navigationState.subscribe((navState) => {
      const route = navState.currentRoute;
      if (route && (route.id === 'learning' || route.id === 'modules')) {
        setTimeout(() => {
          init().catch(err => console.error("Dynamic learning init failed", err));
        }, 50);
      }
    });
  }

  return {
    init,
    renderLearningPaths,
    renderModules,
    getState: learningState.getState,
  };
}
