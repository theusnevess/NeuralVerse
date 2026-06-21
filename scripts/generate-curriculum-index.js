const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'docs', 'content');
const OUT_FILE = path.join(ROOT, 'website', 'data', 'curriculum-index.json');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function listDirs(dirPath) {
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function stripQuotes(value = '') {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)---/);
  if (!match) return {};

  const lines = match[1].split('\n');
  const data = {};
  let activeKey = null;

  for (const line of lines) {
    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && activeKey) {
      data[activeKey].push(stripQuotes(listMatch[1]));
      continue;
    }

    const fieldMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!fieldMatch) continue;

    const [, key, rawValue] = fieldMatch;
    const value = rawValue.trim();
    activeKey = null;

    if (value === '') {
      data[key] = [];
      activeKey = key;
      continue;
    }

    data[key] = stripQuotes(value);
  }

  return data;
}

function getSection(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = markdown.match(new RegExp(`## ${escaped}\\n([\\s\\S]*?)(?=\\n## |$)`));
  return match ? match[1].trim() : '';
}

function firstParagraph(text) {
  return text.split('\n\n')
    .map((part) => part.replace(/\n/g, ' ').trim())
    .find((part) => part && !part.startsWith('*') && !part.startsWith('```')) || '';
}

function toWebsiteSource(filePath) {
  return `../${path.relative(ROOT, filePath).replace(/\\/g, '/')}`;
}

function parseArtifact(filePath, topicSlug) {
  const markdown = readFile(filePath);
  const meta = parseFrontmatter(markdown);
  return {
    id: meta.artifact_id,
    slug: `${topicSlug}/${path.basename(filePath)}`,
    title: meta.artifact_title,
    family: meta.artifact_family,
    type: meta.artifact_type,
    canonicalStatus: meta.canonical_status,
    instructionalObjectives: meta.instructional_objectives || [],
    estimatedDuration: meta.estimated_duration || '',
    topicSlug,
    source: toWebsiteSource(filePath),
  };
}

function parseLesson(dirName) {
  const filePath = path.join(CONTENT_ROOT, 'lessons', dirName, 'lesson-composition.md');
  const markdown = readFile(filePath);
  const meta = parseFrontmatter(markdown);
  return {
    id: meta.lesson_id,
    slug: dirName,
    title: meta.lesson_title,
    topic: meta.topic,
    canonicalStatus: meta.canonical_status,
    artifactIds: meta.artifact_ids || [],
    overview: firstParagraph(getSection(markdown, '1. Purpose')),
    learningGoal: firstParagraph(getSection(markdown, '2. Learning Goal')),
    source: toWebsiteSource(filePath),
  };
}

function parseModule(dirName) {
  const filePath = path.join(CONTENT_ROOT, 'modules', dirName, 'module-composition.md');
  const markdown = readFile(filePath);
  const meta = parseFrontmatter(markdown);
  return {
    id: meta.module_id,
    slug: dirName,
    title: meta.module_title,
    type: meta.module_type,
    canonicalStatus: meta.canonical_status,
    lessonIds: meta.lesson_ids || [],
    artifactScope: meta.artifact_scope || [],
    overview: firstParagraph(getSection(markdown, '1. Purpose')),
    aim: firstParagraph(getSection(markdown, '2. Module Learning Aim')),
    source: toWebsiteSource(filePath),
  };
}

function parseLearningPath(dirName) {
  const filePath = path.join(CONTENT_ROOT, 'learning-paths', dirName, 'learning-path-composition.md');
  const markdown = readFile(filePath);
  const meta = parseFrontmatter(markdown);
  return {
    id: meta.learning_path_id,
    slug: dirName,
    title: meta.learning_path_title,
    type: meta.path_type,
    canonicalStatus: meta.canonical_status,
    moduleIds: meta.module_ids || [],
    lessonScope: meta.lesson_scope || [],
    artifactScope: meta.artifact_scope || [],
    overview: firstParagraph(getSection(markdown, '1. Purpose')),
    aim: firstParagraph(getSection(markdown, '2. Learning Path Aim')),
    source: toWebsiteSource(filePath),
  };
}

function main() {
  const artifactTopics = listDirs(path.join(CONTENT_ROOT, 'learning-artifacts'));
  const artifacts = artifactTopics.flatMap((topicSlug) => {
    const topicPath = path.join(CONTENT_ROOT, 'learning-artifacts', topicSlug);
    return fs.readdirSync(topicPath)
      .filter((fileName) => fileName.endsWith('.md') && fileName !== 'README.md')
      .sort()
      .map((fileName) => parseArtifact(path.join(topicPath, fileName), topicSlug));
  });

  const lessons = listDirs(path.join(CONTENT_ROOT, 'lessons')).map(parseLesson);
  const modules = listDirs(path.join(CONTENT_ROOT, 'modules')).map(parseModule);
  const learningPaths = listDirs(path.join(CONTENT_ROOT, 'learning-paths')).map(parseLearningPath);

  const index = {
    generatedFrom: 'docs/content',
    generatedAt: new Date().toISOString(),
    counts: {
      learningPaths: learningPaths.length,
      modules: modules.length,
      lessons: lessons.length,
      artifacts: artifacts.length,
    },
    learningPaths,
    modules,
    lessons,
    artifacts,
  };

  fs.writeFileSync(OUT_FILE, `${JSON.stringify(index, null, 2)}\n`);
  console.log(`Generated ${path.relative(ROOT, OUT_FILE)}`);
  console.log(JSON.stringify(index.counts));
}

main();
