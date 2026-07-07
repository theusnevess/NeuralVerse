import type { CanvasRenderingContext2DLike } from "../visualization-foundation/index.ts";
import type { AtlasCanvasHost, AtlasCanvasMount, AtlasEmptyViewState, AtlasErrorViewState } from "./types.ts";

export function createAtlasDomCanvasHost(root: HTMLElement): AtlasCanvasHost {
  return {
    showLoading(message) {
      replaceChildren(root, renderState("status", "Atlas loading", message));
    },
    showError(state) {
      const section = renderState("alert", "Atlas unavailable", `${state.message} Diagnostics: ${state.diagnosticsId}`);
      const retry = document.createElement("button");
      retry.type = "button";
      retry.textContent = "Retry";
      retry.addEventListener("click", state.retry);
      section.append(retry);
      replaceChildren(root, section);
    },
    showEmpty(state: AtlasEmptyViewState) {
      replaceChildren(root, renderState("status", "Atlas empty", state.message));
    },
    mountCanvas() {
      root.replaceChildren();
      const page = document.createElement("section");
      page.className = "nv-atlas-page";
      page.setAttribute("aria-labelledby", "nv-atlas-title");

      const header = document.createElement("header");
      header.className = "nv-atlas-header";
      const eyebrow = document.createElement("p");
      eyebrow.className = "nv-atlas-eyebrow";
      eyebrow.textContent = "Celestial knowledge atlas";
      const heading = document.createElement("h1");
      heading.id = "nv-atlas-title";
      heading.className = "nv-atlas-title";
      heading.textContent = "Atlas";
      const copy = document.createElement("p");
      copy.className = "nv-atlas-copy";
      copy.textContent = "A celestial knowledge atlas of AI Engineering concepts, dependencies, and semantic constellations.";

      const actions = document.createElement("div");
      actions.className = "nv-atlas-actions";
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "nv-atlas-reset";
      reset.dataset.atlasResetView = "true";
      reset.textContent = "Reset view";
      actions.append(reset);

      const summary = document.createElement("p");
      summary.className = "nv-sr-only";
      summary.dataset.atlasSummary = "true";
      summary.textContent = "Atlas graph loaded. Use pointer gestures to pan and zoom. Select a node to inspect its relationships.";
      header.append(eyebrow, heading, copy, actions, summary);

      const canvasFrame = document.createElement("div");
      canvasFrame.className = "nv-atlas-canvas-frame";
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-label", "Atlas knowledge topology");
      canvas.setAttribute("role", "img");
      canvas.tabIndex = 0;
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.touchAction = "none";
      const readout = document.createElement("p");
      readout.className = "nv-atlas-selection-readout";
      readout.dataset.atlasSelectionReadout = "true";
      readout.id = "nv-atlas-selection-readout";
      readout.setAttribute("aria-live", "polite");
      readout.textContent = "Select a star, landmark, or constellation to begin exploring.";
      canvas.setAttribute("aria-describedby", "nv-atlas-selection-readout");
      canvasFrame.append(canvas);

      const orientation = document.createElement("div");
      orientation.className = "nv-atlas-orientation";
      orientation.dataset.atlasOrientation = "true";
      orientation.setAttribute("aria-label", "Atlas orientation strip");
      const orientationEyebrow = document.createElement("span");
      orientationEyebrow.className = "nv-atlas-orientation-eyebrow";
      orientationEyebrow.textContent = "You are exploring";
      const orientationValue = document.createElement("span");
      orientationValue.className = "nv-atlas-orientation-value";
      orientationValue.dataset.atlasOrientationValue = "true";
      orientationValue.textContent = "the world of AI Engineering";
      const orientationHint = document.createElement("span");
      orientationHint.className = "nv-atlas-orientation-hint";
      orientationHint.textContent = "Navigate between constellations · follow the stellar corridors";
      orientation.append(orientationEyebrow, orientationValue, orientationHint);

      const legend = document.createElement("div");
      legend.className = "nv-atlas-legend";
      legend.dataset.atlasLegend = "true";
      legend.setAttribute("aria-hidden", "true");
      legend.innerHTML = "";

      page.append(header, canvasFrame, orientation, legend, readout);
      root.append(page);
      const rect = canvasFrame.getBoundingClientRect();
      const width = Math.max(320, Math.floor(rect.width || canvasFrame.clientWidth || 960));
      const height = Math.max(360, Math.floor(rect.height || canvasFrame.clientHeight || 640));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Atlas canvas context unavailable.");
      return {
        canvas,
        context: context as CanvasRenderingContext2DLike,
        width,
        height,
        devicePixelRatio: window.devicePixelRatio || 1,
        eventTarget: canvas,
      } satisfies AtlasCanvasMount;
    },
    clear() {
      root.replaceChildren();
    },
  };
}

function renderState(role: "status" | "alert", title: string, message: string): HTMLElement {
  const section = document.createElement("section");
  section.setAttribute("role", role);
  section.setAttribute("aria-live", role === "alert" ? "assertive" : "polite");
  section.dataset.atlasState = title.toLowerCase().replace(/\s+/g, "-");
  const heading = document.createElement("h1");
  heading.textContent = title;
  const copy = document.createElement("p");
  copy.textContent = message;
  section.append(heading, copy);
  return section;
}

function replaceChildren(root: HTMLElement, child: HTMLElement): void {
  root.replaceChildren(child);
}
