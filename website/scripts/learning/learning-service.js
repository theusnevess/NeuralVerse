const DATA_PATHS = Object.freeze({
  learningPaths: "data/learning-paths.json",
  modules: "data/modules.json",
  contentIndex: "data/content-index.json",
});

async function fetchJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return response.json();
}

function sortByOrder(items) {
  return [...items].sort((a, b) => a.order - b.order);
}

export function createLearningService(paths = DATA_PATHS) {
  let cache = null;

  async function loadAll() {
    if (cache) {
      return cache;
    }

    const [learningPaths, modules, contentItems] = await Promise.all([
      fetchJson(paths.learningPaths),
      fetchJson(paths.modules),
      fetchJson(paths.contentIndex),
    ]);

    cache = {
      learningPaths: sortByOrder(learningPaths),
      modules: sortByOrder(modules),
      contentItems: sortByOrder(contentItems),
    };

    return cache;
  }

  async function getLearningPaths() {
    const data = await loadAll();
    return data.learningPaths;
  }

  async function getModules() {
    const data = await loadAll();
    return data.modules;
  }

  async function getModulesByPath(pathId) {
    const data = await loadAll();
    return sortByOrder(data.modules.filter((module) => module.pathId === pathId));
  }

  async function getContentItemsByModule(moduleId) {
    const data = await loadAll();
    return sortByOrder(
      data.contentItems.filter((contentItem) => contentItem.moduleId === moduleId)
    );
  }

  function mapModuleId(moduleId) {
    const mapping = {
      "module-00-foundations": "foundations",
      "module-01-classical-ml": "classical-machine-learning",
      "module-02-deep-learning": "deep-learning",
      "module-03-computer-vision": "computer-vision",
      "module-04-mlops": "mlops",
    };
    return mapping[moduleId] || moduleId;
  }

  async function getModuleById(moduleId) {
    const data = await loadAll();
    const mappedId = mapModuleId(moduleId);
    return data.modules.find((module) => module.id === mappedId) || null;
  }

  async function getLearningPathById(pathId) {
    const data = await loadAll();
    return data.learningPaths.find((path) => path.id === pathId) || null;
  }

  async function getContentItems() {
    const data = await loadAll();
    return data.contentItems;
  }

  return {
    loadAll,
    getLearningPaths,
    getModules,
    getModulesByPath,
    getContentItemsByModule,
    getModuleById,
    getLearningPathById,
    getContentItems,
  };
}
