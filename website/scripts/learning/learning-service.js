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

  return {
    loadAll,
    getLearningPaths,
    getModules,
    getModulesByPath,
    getContentItemsByModule,
  };
}
