import { createContentService } from "./content-service.js";
import {
  renderContentViewer,
  renderContentEmptyState,
  renderContentLoadingState,
} from "./content-viewer.js";

function getContentIdFromHash(hashValue = window.location.hash) {
  const cleanHash = String(hashValue || "").replace(/^#\/?/, "");
  const segments = cleanHash.split("/").filter(Boolean);

  if (segments[0] !== "content") {
    return null;
  }

  return segments[1] || null;
}

export function createContentController(options = {}) {
  const root = options.root || document;
  const contentService = options.contentService || createContentService();
  const liveRegion = root.querySelector("[data-content-live]");

  function announce(message) {
    const currentLiveRegion = root.querySelector("[data-content-live]");
    if (currentLiveRegion) {
      currentLiveRegion.textContent = message;
    }
  }

  function updateWorkspace(contentItem) {
    const workspace = window.NeuralVerse?.workspace || window.NeuralVerse?.workspaceState;

    if (!workspace || typeof workspace.setState !== "function") {
      return;
    }

    workspace.setState({
      activeView: "content",
      routeId: `content/${contentItem.id}`,
      routeTitle: contentItem.title,
      routeDescription: `Viewing ${contentItem.type}. Estimated reading time: ${contentItem.estimatedReadingTime} minutes.`,
      status: "active",
    });
  }

  async function renderFromRoute(hashValue = window.location.hash) {
    const currentTarget = root.querySelector("[data-content-viewer]");
    if (!currentTarget) {
      return;
    }

    const contentItemId = getContentIdFromHash(hashValue);

    if (!contentItemId) {
      renderContentEmptyState(currentTarget, "No content selected.");
      announce("No content selected.");
      return;
    }

    renderContentLoadingState(currentTarget);

    try {
      const content = await contentService.resolveContent(contentItemId);

      if (!content) {
        renderContentEmptyState(currentTarget, "Unknown content item.");
        announce("Unknown content item.");
        return;
      }

      renderContentViewer(currentTarget, content);
      updateWorkspace(content.metadata);
      announce(`${content.metadata.title} loaded.`);
    } catch (error) {
      console.error("Content viewer failed to load content.", error);
      renderContentEmptyState(currentTarget, "Content could not be loaded.");
      announce("Content could not be loaded.");
    }
  }

  function bindRouteEvents() {
    window.addEventListener("hashchange", () => {
      renderFromRoute(window.location.hash);
    });

    window.addEventListener("nv:routechange", (event) => {
      renderFromRoute(event.detail?.route || window.location.hash);
    });

    // Handle initial navigation if the page is loaded directly with a content hash
    const currentRoute = window.navigationState?.getState()?.currentRoute;
    if (currentRoute && currentRoute.id === 'content') {
      setTimeout(() => {
        renderFromRoute(window.location.hash);
      }, 50);
    }
  }

  function init() {
    bindRouteEvents();
    renderFromRoute(window.location.hash);

    window.NeuralVerse = window.NeuralVerse || {};
    window.NeuralVerse.content = {
      service: contentService,
      renderFromRoute,
    };
  }

  return {
    init,
    renderFromRoute,
  };
}
