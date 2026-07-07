export function createKnowledgeGraphController(options = {}) {
  const root = options.root || document;
  let browserController = null;
  let loading = null;

  async function loadBrowserController() {
    if (!loading) {
      loading = import("../../dist/atlas-browser.js?v=15.6").then((module) => {
        if (!module.createBrowserAtlasController) {
          throw new Error("Canonical Atlas browser bundle did not expose createBrowserAtlasController.");
        }
        return module.createBrowserAtlasController({ root });
      });
    }
    browserController = browserController || await loading;
    return browserController;
  }

  async function renderCurrentRoute() {
    const controller = await loadBrowserController();
    await controller.renderCurrentRoute();
  }

  function init() {
    window.addEventListener("nv:routerendered", renderCurrentRoute);
    renderCurrentRoute().catch((error) => {
      const target = root.querySelector("[data-knowledge-graph-root]");
      if (target) {
        target.innerHTML = "";
        const section = document.createElement("section");
        section.className = "nv-panel";
        section.setAttribute("role", "alert");
        const title = document.createElement("h1");
        title.textContent = "Atlas unavailable";
        const copy = document.createElement("p");
        copy.textContent = "The canonical Atlas bundle could not be loaded.";
        const code = document.createElement("p");
        code.className = "nv-muted";
        code.textContent = error instanceof Error ? error.message : String(error);
        section.append(title, copy, code);
        target.append(section);
      }
    });
  }

  function destroy() {
    browserController?.destroy();
    browserController = null;
  }

  function snapshot() {
    return browserController?.snapshot() ?? null;
  }

  return { init, renderCurrentRoute, destroy, snapshot };
}
