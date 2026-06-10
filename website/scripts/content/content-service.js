const CONTENT_INDEX_PATH = "data/content-index.json";

async function fetchText(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return response.text();
}

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

export function createContentService(options = {}) {
  const contentIndexPath = options.contentIndexPath || CONTENT_INDEX_PATH;
  let contentIndexCache = null;
  const markdownCache = new Map();

  async function getContentIndex() {
    if (contentIndexCache) {
      return contentIndexCache;
    }

    contentIndexCache = sortByOrder(await fetchJson(contentIndexPath));
    return contentIndexCache;
  }

  async function getContentItem(contentItemId) {
    const contentIndex = await getContentIndex();
    return contentIndex.find((item) => item.id === contentItemId) || null;
  }

  async function loadMarkdown(contentItem) {
    if (!contentItem?.source) {
      throw new Error("Content item source is missing.");
    }

    if (markdownCache.has(contentItem.source)) {
      return markdownCache.get(contentItem.source);
    }

    const markdown = await fetchText(contentItem.source);
    markdownCache.set(contentItem.source, markdown);

    return markdown;
  }

  async function resolveContent(contentItemId) {
    const contentItem = await getContentItem(contentItemId);

    if (!contentItem) {
      return null;
    }

    const markdown = await loadMarkdown(contentItem);

    return {
      metadata: contentItem,
      markdown,
    };
  }

  return {
    getContentIndex,
    getContentItem,
    loadMarkdown,
    resolveContent,
  };
}
