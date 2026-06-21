const CURRICULUM_INDEX_PATH = 'data/curriculum-index.json';

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

async function fetchText(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.text();
}

function byId(items, id) {
  return items.find((item) => item.id === id) || null;
}

function stripFrontmatter(markdown) {
  return String(markdown || '').replace(/^---\n[\s\S]*?---\s*/, '').trim();
}

function orderArtifacts(artifacts) {
  const order = [
    'Explanatory Text',
    'Visual Intuition',
    'Interactive Visualization',
    'Exercise',
    'Comparison Table',
  ];
  return [...artifacts].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
}

export function createCurriculumService(options = {}) {
  const indexPath = options.indexPath || CURRICULUM_INDEX_PATH;
  let indexCache = null;
  const artifactMarkdownCache = new Map();

  async function getIndex() {
    if (!indexCache) indexCache = await fetchJson(indexPath);
    return indexCache;
  }

  async function getLearningPaths() {
    const index = await getIndex();
    return index.learningPaths;
  }

  async function getModules() {
    const index = await getIndex();
    return index.modules;
  }

  async function getLessons() {
    const index = await getIndex();
    return index.lessons;
  }

  async function getArtifacts() {
    const index = await getIndex();
    return index.artifacts;
  }

  async function getLearningPath(pathId) {
    const index = await getIndex();
    return byId(index.learningPaths, pathId);
  }

  async function getModule(moduleId) {
    const index = await getIndex();
    return byId(index.modules, moduleId);
  }

  async function getLesson(lessonId) {
    const index = await getIndex();
    return byId(index.lessons, lessonId);
  }

  async function getArtifact(artifactId) {
    const index = await getIndex();
    return byId(index.artifacts, artifactId);
  }

  async function getModulesForPath(pathId) {
    const [index, learningPath] = await Promise.all([getIndex(), getLearningPath(pathId)]);
    if (!learningPath) return [];
    return learningPath.moduleIds.map((moduleId) => byId(index.modules, moduleId)).filter(Boolean);
  }

  async function getLessonsForModule(moduleId) {
    const [index, module] = await Promise.all([getIndex(), getModule(moduleId)]);
    if (!module) return [];
    return module.lessonIds.map((lessonId) => byId(index.lessons, lessonId)).filter(Boolean);
  }

  async function getArtifactsForLesson(lessonId) {
    const [index, lesson] = await Promise.all([getIndex(), getLesson(lessonId)]);
    if (!lesson) return [];
    return orderArtifacts(lesson.artifactIds.map((artifactId) => byId(index.artifacts, artifactId)).filter(Boolean));
  }

  async function loadArtifactMarkdown(artifactId) {
    const artifact = await getArtifact(artifactId);
    if (!artifact) return null;
    if (!artifactMarkdownCache.has(artifact.source)) {
      artifactMarkdownCache.set(artifact.source, stripFrontmatter(await fetchText(artifact.source)));
    }
    return {
      artifact,
      markdown: artifactMarkdownCache.get(artifact.source),
    };
  }

  return {
    getIndex,
    getLearningPaths,
    getModules,
    getLessons,
    getArtifacts,
    getLearningPath,
    getModule,
    getLesson,
    getArtifact,
    getModulesForPath,
    getLessonsForModule,
    getArtifactsForLesson,
    loadArtifactMarkdown,
  };
}
