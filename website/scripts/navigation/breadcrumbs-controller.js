import { createContentService } from "../content/content-service.js";
import { createLearningService } from "../learning/learning-service.js";

function getRouteParts(hashValue = window.location.hash) {
  const clean = String(hashValue || "").replace(/^#\/?/, "");
  return clean.split("/").filter(Boolean);
}

function getRouteType(parts) {
  if (!parts.length) return "home";
  if (parts[0] === "learning") return "learning";
  if (parts[0] === "modules") return "module";
  if (parts[0] === "content") return "content";
  if (parts[0] === "workspace") return "workspace";
  if (parts[0] === "retrieval-playground") return "retrieval-playground";
  if (parts[0] === "settings") return "settings";
  return "unknown";
}

function getRouteLabel(routeType, parts = []) {
  const labels = {
    home: "Home",
    learning: "Learning Paths",
    module: "Modules",
    content: "Content",
    workspace: "Workspace",
    "retrieval-playground": "Retrieval Playground",
    settings: "Settings",
    unknown: "Not Found",
  };
  return labels[routeType] || parts[0] || "Not Found";
}

function createCrumb(label, href, isCurrent = false) {
  return { label, href, isCurrent };
}

export function createBreadcrumbsController(options = {}) {
  const root = options.root || document;
  const contentService = options.contentService || createContentService();
  const learningService = options.learningService || createLearningService();

  const getBreadcrumbsTarget = () => root.querySelector("[data-breadcrumbs]");
  const getRouteTypeTarget = () => root.querySelector("[data-workspace-context-route-type]");
  const getDepthTarget = () => root.querySelector("[data-workspace-context-depth]");
  const getPathTarget = () => root.querySelector("[data-workspace-context-path]");
  const getModuleTarget = () => root.querySelector("[data-workspace-context-module]");
  const getContentTarget = () => root.querySelector("[data-workspace-context-content]");
  const getLiveRegion = () => root.querySelector("[data-workspace-live]");
  const getContextPanel = () => root.querySelector(".nv-context-panel");
  let contextPanelTransitionCleanup = null;

  function markContextPanelUpdated() {
    const panel = getContextPanel();
    if (!panel) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (contextPanelTransitionCleanup) {
      contextPanelTransitionCleanup();
      contextPanelTransitionCleanup = null;
    }

    panel.classList.remove("nv-context-panel-update");

    if (prefersReducedMotion) return;

    panel.offsetHeight;
    panel.classList.add("nv-context-panel-update");

    const clearUpdate = () => {
      panel.classList.remove("nv-context-panel-update");
      panel.removeEventListener("animationend", clearUpdate);
      contextPanelTransitionCleanup = null;
    };

    contextPanelTransitionCleanup = clearUpdate;
    panel.addEventListener("animationend", clearUpdate);
  }

  function renderBreadcrumbs(crumbs) {
    const breadcrumbsTarget = getBreadcrumbsTarget();
    if (!breadcrumbsTarget) return;

    breadcrumbsTarget.innerHTML = "";

    const list = document.createElement("ol");
    list.className = "nv-breadcrumbs__list nv-motion nv-motion-slide-reveal";

    crumbs.forEach((crumb) => {
      const item = document.createElement("li");
      item.className = "nv-breadcrumbs__item";

      const link = document.createElement("a");
      link.href = crumb.href;
      link.textContent = crumb.label;

      if (crumb.isCurrent) {
        link.setAttribute("aria-current", "location");
        link.setAttribute("aria-label", `${crumb.label}, current location`);
      } else {
        link.setAttribute("aria-label", `Go to ${crumb.label}`);
      }

      item.append(link);
      list.append(item);
    });

    breadcrumbsTarget.append(list);
  }

  function updateContext({ routeType, depth, path, module, content }) {
    const routeTypeTarget = getRouteTypeTarget();
    const depthTarget = getDepthTarget();
    const pathTarget = getPathTarget();
    const moduleTarget = getModuleTarget();
    const contentTarget = getContentTarget();
    const onboardingTarget = root.querySelector("[data-context-onboarding]");
    const detailsTarget = root.querySelector("[data-context-details]");
    const liveRegion = getLiveRegion();

    if (routeTypeTarget) routeTypeTarget.textContent = routeType;
    if (depthTarget) depthTarget.textContent = String(depth);

    const hasContext = !!(path || module || content);
    if (onboardingTarget) onboardingTarget.hidden = hasContext;
    if (detailsTarget) detailsTarget.hidden = !hasContext;

    if (pathTarget) pathTarget.textContent = path?.title || "—";
    if (moduleTarget) moduleTarget.textContent = module?.title || "—";
    if (contentTarget) contentTarget.textContent = content?.title || "—";
    markContextPanelUpdated();

    if (liveRegion) {
      const labels = [path?.title, module?.title, content?.title].filter(Boolean);
      liveRegion.textContent = labels.length
        ? `Current view changed to ${routeType}. Current location: ${labels.join(" > ")}.`
        : `Current view changed to ${routeType}.`;
    }
  }

  async function resolveHierarchy(hashValue = window.location.hash) {
    const parts = getRouteParts(hashValue);
    const routeType = getRouteType(parts);
    const contentId = routeType === "content" ? parts[1] : null;

    let content = null;
    let module = null;
    let path = null;

    if (contentId) {
      content = await contentService.getContentItem(contentId);
      module = content ? await learningService.getModuleById(content.moduleId) : null;
      path = module ? await learningService.getLearningPathById(module.pathId) : null;
    }

    if (routeType === "learning") {
      const paths = await learningService.getLearningPaths();
      path = paths[0] || null;
    }

    if (routeType === "module" || routeType === "modules") {
      const paths = await learningService.getLearningPaths();
      path = paths[0] || null;
    }

    const crumbs = [];

    if (path) {
      crumbs.push(createCrumb(path.title, `#/learning`, !module && !content));
    }

    if (module) {
      crumbs.push(createCrumb(module.title, `#/modules`, !content));
    }

    if (content) {
      crumbs.push(createCrumb(content.title, `#/content/${content.id}`, true));
    }

    if (!path && routeType !== "home") {
      const href = routeType === "unknown" ? `#/${parts.join("/")}` : `#/${routeType}`;
      crumbs.push(createCrumb(getRouteLabel(routeType, parts), href, true));
    }

    renderBreadcrumbs(crumbs);

    updateContext({
      routeType,
      depth: crumbs.length,
      path,
      module,
      content,
    });
  }

  function bindEvents() {
    window.addEventListener("hashchange", () => {
      resolveHierarchy(window.location.hash).catch(console.error);
    });

    window.addEventListener("nv:routechange", (event) => {
      resolveHierarchy(event.detail?.route || window.location.hash).catch(console.error);
    });

    window.addEventListener("nv:contentloaded", () => {
      resolveHierarchy(window.location.hash).catch(console.error);
    });

    window.addEventListener("nv:learningrendered", () => {
      resolveHierarchy(window.location.hash).catch(console.error);
    });
  }

  function init() {
    bindEvents();
    resolveHierarchy(window.location.hash).catch(console.error);
  }

  return {
    init,
    resolveHierarchy,
  };
}
