import { createContentService } from "./content-service.js?v=5";
import {
  renderContentViewer,
  renderContentLibrary,
  renderLibraryEmptyState,
  renderReaderEmptyState,
  renderContentLoadingState,
} from "./content-viewer.js?v=5";

function getContentIdFromHash(hashValue = window.location.hash) {
  const cleanHash = String(hashValue || "").replace(/^#\/?/, "");
  const segments = cleanHash.split("/").filter(Boolean);

  if (segments[0] !== "content") {
    return null;
  }

  return segments[1] || null;
}

function updateWorkspaceState(viewType, title, description) {
  const workspace = window.NeuralVerse?.workspace || window.NeuralVerse?.workspaceState;
  if (!workspace || typeof workspace.setState !== "function") return;
  workspace.setState({
    activeView: viewType,
    routeTitle: title,
    routeDescription: description,
    status: "active",
  });
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

  async function renderLibrary() {
    const currentTarget = root.querySelector("[data-content-viewer]");
    if (!currentTarget) return;

    renderContentLoadingState(currentTarget);
    updateWorkspaceState("content", "Reference Library", "Browse standalone reference material.");

    try {
      const index = await contentService.getContentIndex();
      renderContentLibrary(currentTarget, index);
      announce(`Reference library loaded. ${index.length} items available.`);
    } catch (error) {
      console.error("Content library failed to load.", error);
      renderLibraryEmptyState(currentTarget);
      announce("Content library could not be loaded.");
    }
  }

  async function renderReader(contentItemId) {
    const currentTarget = root.querySelector("[data-content-viewer]");
    if (!currentTarget) return;

    renderContentLoadingState(currentTarget);

    try {
      const content = await contentService.resolveContent(contentItemId);

      if (!content) {
        renderReaderEmptyState(currentTarget);
        updateWorkspaceState("content", "Content Not Found", "The requested reference could not be located.");
        announce("Content not found.");
        return;
      }

      renderContentViewer(currentTarget, content);
      updateWorkspaceState("content", content.metadata.title, `Reading ${content.metadata.type}.`);
      announce(`${content.metadata.title} loaded.`);
      window.dispatchEvent(
        new CustomEvent("nv:contentloaded", {
          detail: {
            contentItem: content.metadata,
          },
        })
      );
    } catch (error) {
      console.error("Content viewer failed to load content.", error);
      renderReaderEmptyState(currentTarget);
      updateWorkspaceState("content", "Content Error", "Content could not be loaded.");
      announce("Content could not be loaded.");
    }
  }

  async function renderFromRoute(hashValue = window.location.hash) {
    const contentItemId = getContentIdFromHash(hashValue);

    if (!contentItemId) {
      await renderLibrary();
      return;
    }

    await renderReader(contentItemId);
  }

  function bindRouteEvents() {
    window.addEventListener("hashchange", () => {
      renderFromRoute(window.location.hash);
    });

    window.addEventListener("nv:routechange", (event) => {
      renderFromRoute(event.detail?.route || window.location.hash);
    });

    window.addEventListener("nv:routerendered", (event) => {
      if (event.detail?.routeId === "content" || event.detail?.routeId === "content-detail") {
        renderFromRoute(window.location.hash);
      }
    });

    const currentRoute = window.navigationState?.state?.currentRoute || window.navigationState?.getCurrentRoute?.();
    if (currentRoute && (currentRoute.id === 'content' || currentRoute.id === 'content-detail')) {
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
