import { createAtlasPageController, createLocalStorageAtlasViewportStorage } from "./atlas-page-controller.ts";
import { createAtlasDomCanvasHost } from "./dom-canvas-host.ts";
import type { AtlasPageController } from "./atlas-page-controller.ts";
import {
  createExplorationState,
  updateExplorationState,
  computeExplorationSnapshot,
  formatBreadcrumbTrail,
  getRecentBreadcrumbs,
  CANONICAL_JOURNEYS,
} from "../exploration-engine/index.ts";
import type { ExplorationState, ExplorationSnapshot, DiscoveryCandidate, LandmarkNarrative, GuidedMessage, JourneyPosition, RegionContext } from "../exploration-engine/index.ts";

type BrowserAtlasController = {
  init(): void;
  renderCurrentRoute(): Promise<void>;
  destroy(): void;
  snapshot(): ReturnType<AtlasPageController["snapshot"]> | null;
};

declare global {
  interface Window {
    NeuralVerse?: Record<string, unknown>;
  }
}

let hoverTooltipEl: HTMLElement | null = null;
let hoverTooltipRaf: number | null = null;
let hoverTooltipTimer: ReturnType<typeof setTimeout> | null = null;
let touchListener: EventListener | null = null;
let lastPinchDistance: number | null = null;

export function createBrowserAtlasController(options: { readonly root?: ParentNode } = {}): BrowserAtlasController {
  const root = options.root ?? document;
  let controller: AtlasPageController | null = null;
  let mountedRoot: HTMLElement | null = null;
  let resetListener: EventListener | null = null;
  let selectionListener: EventListener | null = null;
  let explorationState: ExplorationState = createExplorationState();
  let hoverMoveListener: EventListener | null = null;
  let hoverLeaveListener: EventListener | null = null;
  let keydownListener: EventListener | null = null;

  function target(): HTMLElement | null {
    return root.querySelector("[data-knowledge-graph-root]");
  }

  async function renderCurrentRoute(): Promise<void> {
    const container = target();
    if (!container) {
      destroy();
      return;
    }
    if (container === mountedRoot && controller) return;
    destroy();

    mountedRoot = container;
    container.dataset.atlasController = "nv-700";
    container.classList.add("nv-atlas-browser-host");
    const host = createAtlasDomCanvasHost(container);
    controller = createAtlasPageController({
      host,
      storage: createLocalStorageAtlasViewportStorage(window.localStorage),
    });
    controller.start();
    explorationState = createExplorationState();
    bindAtlasRouteControls(container);
    renderAtlasContext(null, controller, explorationState);
    publishController();
  }

  function init(): void {
    window.addEventListener("nv:routerendered", renderCurrentRoute);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
    void renderCurrentRoute();
  }

  function destroy(): void {
    controller?.destroy();
    controller = null;
    unbindAtlasRouteControls();
    destroyHoverTooltip();
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
    if (mountedRoot) {
      delete mountedRoot.dataset.atlasController;
      mountedRoot.classList.remove("nv-atlas-browser-host");
    }
    mountedRoot = null;
    publishController();
  }

  function handleVisibilityChange(): void {
    if (document.hidden && controller) {
      controller.snapshot();
    }
  }

  function snapshot() {
    return controller?.snapshot() ?? null;
  }

  function publishController(): void {
    window.NeuralVerse = window.NeuralVerse ?? {};
    window.NeuralVerse.atlasPageController = controller;
  }

  function bindAtlasRouteControls(container: HTMLElement): void {
    unbindAtlasRouteControls();
    resetListener = (event) => {
      const target = event.target instanceof Element ? event.target.closest("[data-atlas-reset-view]") : null;
      if (!target) return;
      controller?.resetViewport();
    };
    selectionListener = (event) => {
      const detail = event instanceof CustomEvent ? event.detail : null;
      const raw = (detail as { selected?: InspectorEntityShape } | null)?.selected ?? null;
      if (raw?.id && raw.label) {
        const domain = typeof raw.metadata?.domain === "string" ? raw.metadata.domain : "Unclassified";
        explorationState = updateExplorationState(explorationState, raw.id, raw.label, domain);
      } else if (!raw) {
        explorationState = updateExplorationState(explorationState, null, "", "");
      }
      renderAtlasContext(raw, controller, explorationState);
      renderAtlasOrientation(raw);
    };
    container.addEventListener("click", resetListener);
    window.addEventListener("nv:atlas-selection", selectionListener);

    // Journey click handler (delegated)
    container.addEventListener("click", handleJourneyClick);
    // Candidate click handler (delegated)
    container.addEventListener("click", handleCandidateClick);
    // Keyboard Enter on journey/candidate items
    container.addEventListener("keydown", handlePanelKeydown);

    // Hover tooltip for canvas nodes
    const canvas = container.querySelector("canvas");
    if (canvas) {
      hoverMoveListener = (e: Event) => handleCanvasHover(e as MouseEvent, container);
      hoverLeaveListener = () => hideHoverTooltip();
      canvas.addEventListener("mousemove", hoverMoveListener);
      canvas.addEventListener("mouseleave", hoverLeaveListener);
    }

    // Keyboard navigation on canvas
    if (canvas) {
      keydownListener = (e: Event) => handleCanvasKeydown(e as KeyboardEvent, container, controller);
      canvas.addEventListener("keydown", keydownListener);
    }

    // Skip link
    injectSkipLink(container);

    // Touch pinch-to-zoom
    if (canvas) {
      touchListener = (e: Event) => handleCanvasTouch(e as TouchEvent, container, controller);
      canvas.addEventListener("touchstart", touchListener, { passive: false });
      canvas.addEventListener("touchmove", touchListener, { passive: false });
      canvas.addEventListener("touchend", touchListener);
      canvas.addEventListener("touchcancel", touchListener);
    }
  }

  function unbindAtlasRouteControls(): void {
    if (resetListener && mountedRoot) mountedRoot.removeEventListener("click", resetListener);
    if (selectionListener) window.removeEventListener("nv:atlas-selection", selectionListener);
    if (mountedRoot) {
      mountedRoot.removeEventListener("click", handleJourneyClick);
      mountedRoot.removeEventListener("click", handleCandidateClick);
      mountedRoot.removeEventListener("keydown", handlePanelKeydown);
    }
    if (hoverMoveListener || hoverLeaveListener) {
      const canvas = mountedRoot?.querySelector("canvas");
      if (canvas) {
        if (hoverMoveListener) canvas.removeEventListener("mousemove", hoverMoveListener);
        if (hoverLeaveListener) canvas.removeEventListener("mouseleave", hoverLeaveListener);
      }
    }
    if (keydownListener) {
      const canvas = mountedRoot?.querySelector("canvas");
      if (canvas) canvas.removeEventListener("keydown", keydownListener);
    }
    if (touchListener) {
      const canvas = mountedRoot?.querySelector("canvas");
      if (canvas) {
        canvas.removeEventListener("touchstart", touchListener);
        canvas.removeEventListener("touchmove", touchListener);
        canvas.removeEventListener("touchend", touchListener);
        canvas.removeEventListener("touchcancel", touchListener);
      }
    }
    hideHoverTooltip();
    removeSkipLink();
    resetListener = null;
    selectionListener = null;
    hoverMoveListener = null;
    hoverLeaveListener = null;
    keydownListener = null;
    lastPinchDistance = null;
  }

  return { init, renderCurrentRoute, destroy, snapshot };
}

interface InspectorEntityShape {
  readonly id?: string;
  readonly label?: string;
  readonly kind?: string;
  readonly relationships?: readonly {
    readonly source: string;
    readonly target: string;
    readonly relationshipType: string;
    readonly relationshipCategory: string;
    readonly importance: number;
  }[];
  readonly metadata?: Record<string, unknown>;
  readonly lineage?: readonly string[];
}

interface ControllerShape {
  readonly snapshot: () => {
    readonly render?: { readonly metrics?: { readonly visibleNodes?: number; readonly visibleEdges?: number; readonly visibleLabels?: number } | null } | null;
    readonly interaction?: {
      readonly inspector?: {
        readonly selected?: InspectorEntityShape | null;
      } | null;
    } | null;
  } | null;
}

type LiveSnapshot = ReturnType<NonNullable<ControllerShape["snapshot"]>>;

function renderAtlasContext(selected: InspectorEntityShape | null, pageController?: ControllerShape | null, currentState?: ExplorationState): void {
  const panel = document.querySelector(".nv-context-panel");
  if (!panel) return;
  const title = panel.querySelector(".nv-context-title");
  if (title) title.textContent = "Atlas · Exploration";

  const section = panel.querySelector(".nv-workspace-context");
  if (!section) return;
  let readout = section.querySelector<HTMLElement>("[data-atlas-context-readout]");
  if (!readout) {
    readout = document.createElement("div");
    readout.dataset.atlasContextReadout = "true";
    readout.className = "nv-atlas-context-readout";
    readout.setAttribute("role", "region");
    readout.setAttribute("aria-live", "polite");
    readout.setAttribute("aria-label", "Atlas exploration details");
    section.append(readout);
  }

  const onboarding = section.querySelector<HTMLElement>("[data-context-onboarding]");
  const details = section.querySelector<HTMLElement>("[data-context-details]");
  if (details) details.hidden = true;

  if (!selected) {
    if (onboarding) {
      onboarding.hidden = false;
      onboarding.innerHTML = buildOnboardingHtml();
    }
    readout.hidden = true;
    readout.textContent = "";
    return;
  }

  if (onboarding) onboarding.hidden = true;
  readout.hidden = false;
  readout.innerHTML = "";
  const live = pageController?.snapshot() ?? null;
  const explorationSnapshot = computeExplorationSnapshotFromSelection(selected, live, currentState ?? createExplorationState());
  buildAtlasExplorationContext(readout, selected, live, explorationSnapshot);
}

function buildWhyMattersText(
  selected: InspectorEntityShape,
  family: string | null,
  type: string | null,
  domain: string | null,
  dependencies: number,
  dependents: number,
  importance: number | null,
): string {
  if (selected.kind === "region") {
    return `${titleizeToken(domain ?? "")} constellation groups ${selected.relationships?.length ?? 0} stars. Explore its landmarks, bridges, and stellar corridors to understand the constellation.`;
  }
  const role = inferRole(selected.kind, family, type);
  const imp = importance === null ? "key" : importance > 0.85 ? "foundational" : importance > 0.6 ? "structural" : "supporting";
  if (dependents > 0 && dependencies > 0) {
    return `${role}. Connects ${dependencies} prerequisite${dependencies === 1 ? "" : "s"} and unlocks ${dependents} downstream star${dependents === 1 ? "" : "s"}. A ${imp} star in the ${domain ? titleizeToken(domain) : "Atlas"} constellation.`;
  }
  if (dependents > 0) {
    return `${role}. Unlocks ${dependents} downstream star${dependents === 1 ? "" : "s"} with no prerequisites. A ${imp} entry point for the ${domain ? titleizeToken(domain) : "Atlas"} constellation.`;
  }
  if (dependencies > 0) {
    return `${role}. Requires ${dependencies} prerequisite${dependencies === 1 ? "" : "s"}. A ${imp} destination after exploring its dependencies.`;
  }
  return `${role}. An isolated star within its constellation.`;
}

function buildGuidanceItem(relationshipType: string, relationshipCategory: string, importance: number, fallback: string): HTMLLIElement {
  const item = document.createElement("li");
  const type = document.createElement("span");
  type.className = "nv-atlas-context-relationship-type";
  type.textContent = humanizeToken(relationshipType || fallback);
  const category = document.createElement("span");
  category.className = `nv-atlas-context-relationship-category nv-atlas-context-category-${relationshipCategory}`;
  category.textContent = humanizeToken(relationshipCategory);
  const weight = document.createElement("span");
  weight.className = "nv-atlas-context-relationship-weight";
  weight.textContent = `${Math.round(importance * 100)}%`;
  item.append(type, category, weight);
  return item;
}

function buildSuggestedNext(
  outgoing: { readonly relationshipType: string; readonly relationshipCategory: string; readonly importance: number }[],
  incoming: { readonly relationshipType: string; readonly relationshipCategory: string; readonly importance: number }[],
): { label: string; weight: number; category: string }[] {
  const suggestions: { label: string; weight: number; category: string }[] = [];
  for (const rel of outgoing) {
    suggestions.push({ label: humanizeToken(rel.relationshipType || "explore further"), weight: rel.importance, category: rel.relationshipCategory });
  }
  for (const rel of incoming) {
    suggestions.push({ label: humanizeToken(rel.relationshipType || "trace back"), weight: rel.importance, category: rel.relationshipCategory });
  }
  return suggestions
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((entry) => ({ label: `${entry.label}`, weight: entry.weight, category: entry.category }));
}

function buildSuggestionItem(suggestion: { label: string; weight: number; category: string }): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "nv-atlas-context-suggestion";
  const label = document.createElement("span");
  label.className = "nv-atlas-context-suggestion-label";
  label.textContent = suggestion.label;
  const meta = document.createElement("span");
  meta.className = `nv-atlas-context-suggestion-meta nv-atlas-context-category-${suggestion.category}`;
  meta.textContent = `${Math.round(suggestion.weight * 100)}%`;
  item.append(label, meta);
  return item;
}

function appendIdentityRow(list: HTMLDListElement, label: string, value: string): void {
  const term = document.createElement("dt");
  term.textContent = label;
  const definition = document.createElement("dd");
  definition.textContent = value;
  list.append(term, definition);
}

function buildOnboardingHtml(): string {
  return `
    <p class="nv-atlas-onboarding-intro">Explore Atlas by selecting a constellation, landmark, bridge, or star.</p>
    <div class="nv-atlas-onboarding-journeys">
      <h4>Guided Journeys</h4>
      <p class="nv-atlas-onboarding-hint">Follow a curated path through the celestial knowledge chart.</p>
      <ul class="nv-atlas-onboarding-journey-list">
        <li data-journey="introduction" tabindex="0" role="button">Introduction to AI Engineering</li>
        <li data-journey="deep-learning" tabindex="0" role="button">Deep Learning Fundamentals</li>
        <li data-journey="computer-vision" tabindex="0" role="button">Computer Vision Path</li>
        <li data-journey="nlp" tabindex="0" role="button">NLP & Transformers</li>
        <li data-journey="llm" tabindex="0" role="button">LLM Engineering</li>
        <li data-journey="agents" tabindex="0" role="button">AI Agents & Autonomy</li>
        <li data-journey="mlops" tabindex="0" role="button">MLOps & Production</li>
      </ul>
    </div>
  `;
}

function computeExplorationSnapshotFromSelection(
  selected: InspectorEntityShape,
  live: LiveSnapshot | null,
  currentState: ExplorationState,
): ExplorationSnapshot | null {
  if (!selected.id) return null;

  const relationships = Array.isArray(selected.relationships) ? selected.relationships : [];
  const incoming = relationships.filter((rel) => rel.target === selected.id);
  const outgoing = relationships.filter((rel) => rel.source === selected.id);
  const meta = selected.metadata ?? {};
  const family = typeof meta.family === "string" ? meta.family : null;
  const type = typeof meta.type === "string" ? meta.type : null;
  const domain = typeof meta.domain === "string" ? meta.domain : null;
  const importance = typeof meta.importance === "number" ? meta.importance : null;

  const candidates: DiscoveryCandidate[] = [];
  for (const rel of outgoing.slice(0, 4)) {
    candidates.push({
      nodeId: rel.target,
      label: humanizeToken(rel.relationshipType),
      domain: domain ?? "Unclassified",
      score: rel.importance,
      signals: {
        semanticProximity: 0.7,
        dependencyRelevance: rel.importance,
        bridgeImportance: 0.3,
        hubCentrality: 0.5,
        curriculumProgression: 0.6,
        novelty: 0.5,
      },
      reason: "outgoing relationship",
    });
  }

  const journeyPosition = findJourneyPositionForNode(selected.id, currentState);

  return {
    currentPosition: journeyPosition,
    candidates,
    landmark: {
      nodeId: selected.id,
      label: selected.label || selected.id || "",
      scientificRole: inferRole(selected.kind, family, type),
      historicalImportance: importance !== null ? (importance > 0.85 ? "Foundational concept" : importance > 0.6 ? "Structurally significant" : "Supporting concept") : "Knowledge entity",
      structuralImportance: `Connects ${incoming.length} prerequisites to ${outgoing.length} downstream concepts`,
      dependencyImportance: `${incoming.length} dependencies · ${outgoing.length} dependents`,
      domainContext: domain ?? "Unclassified",
    },
    breadcrumbs: currentState.breadcrumbs,
    guidedMessage: journeyPosition ? {
      text: `Exploring ${journeyPosition.journey.name} · Step ${journeyPosition.currentStepIndex + 1} of ${journeyPosition.journey.steps.length}`,
      kind: "journey" as const,
      priority: 8,
    } : null,
    regionContext: domain ? {
      domain,
      memberCount: relationships.length,
      storyRole: "method",
      neighborRegions: [],
      capitalLabel: null,
      hubLabels: [],
      bridgeLabels: [],
    } : null,
  };
}

function findJourneyPositionForNode(nodeId: string, currentState: ExplorationState): JourneyPosition | null {
  for (const journey of CANONICAL_JOURNEYS) {
    const stepIndex = journey.steps.findIndex((s) => s.nodeId === nodeId);
    if (stepIndex >= 0) {
      const completedSteps = journey.steps
        .filter((s) => currentState.completedJourneySteps.has(s.nodeId))
        .map((s) => s.nodeId);
      return {
        journey,
        currentStepIndex: stepIndex,
        completedSteps,
        progress: completedSteps.length / journey.steps.length,
        nextStep: stepIndex < journey.steps.length - 1 ? journey.steps[stepIndex + 1] : null,
        previousStep: stepIndex > 0 ? journey.steps[stepIndex - 1] : null,
      };
    }
  }
  return null;
}

function buildAtlasExplorationContext(
  host: HTMLElement,
  selected: InspectorEntityShape,
  live: LiveSnapshot | null,
  exploration: ExplorationSnapshot | null,
): void {
  const relationships = Array.isArray(selected.relationships) ? selected.relationships : [];
  const incoming = relationships.filter((rel) => rel.target === selected.id);
  const outgoing = relationships.filter((rel) => rel.source === selected.id);
  const meta = selected.metadata ?? {};
  const family = typeof meta.family === "string" ? meta.family : null;
  const type = typeof meta.type === "string" ? meta.type : null;
  const domain = typeof meta.domain === "string" ? meta.domain : null;
  const importance = typeof meta.importance === "number" ? meta.importance : null;
  const kind = typeof selected.kind === "string" ? selected.kind : "entity";
  const role = inferRole(kind, family, type);

  const header = document.createElement("header");
  header.className = "nv-atlas-context-header";
  const eyebrow = document.createElement("p");
  eyebrow.className = "nv-atlas-context-eyebrow";
  eyebrow.textContent = kind === "region" ? "CONSTELLATION" : "STAR";
  const heading = document.createElement("h3");
  heading.className = "nv-atlas-context-heading";
  heading.textContent = selected.label || selected.id || "Selected Atlas entity";
  header.append(eyebrow, heading);
  if (role) {
    const roleEl = document.createElement("p");
    roleEl.className = "nv-atlas-context-role";
    roleEl.textContent = role;
    header.append(roleEl);
  }
  host.append(header);

  if (exploration?.guidedMessage) {
    const guidanceBanner = document.createElement("div");
    guidanceBanner.className = "nv-atlas-context-guidance-banner";
    guidanceBanner.textContent = exploration.guidedMessage.text;
    host.append(guidanceBanner);
  }

  if (exploration?.currentPosition) {
    const journeySection = buildJourneyProgressSection(exploration.currentPosition);
    host.append(journeySection);
  }

  const whySection = document.createElement("section");
  whySection.className = "nv-atlas-context-why";
  const whyTitle = document.createElement("h4");
  whyTitle.textContent = "Why it matters";
  whySection.append(whyTitle);
  const whyCopy = document.createElement("p");
  whyCopy.className = "nv-atlas-context-why-copy";
  whyCopy.textContent = buildWhyMattersText(selected, family, type, domain, incoming.length, outgoing.length, importance);
  whySection.append(whyCopy);
  host.append(whySection);

  if (exploration?.landmark) {
    const landmarkSection = buildLandmarkSection(exploration.landmark);
    host.append(landmarkSection);
  }

  const guidanceSection = document.createElement("section");
  guidanceSection.className = "nv-atlas-context-guidance";

  if (outgoing.length) {
    const unlocksGroup = document.createElement("div");
    unlocksGroup.className = "nv-atlas-context-group";
    const unlocksHeading = document.createElement("h5");
    unlocksHeading.textContent = "What it unlocks";
    unlocksGroup.append(unlocksHeading);
    const unlocksList = document.createElement("ul");
    for (const rel of outgoing.slice(0, 4)) {
      unlocksList.append(buildGuidanceItem(rel.relationshipType, rel.relationshipCategory, rel.importance, "enables"));
    }
    if (outgoing.length > 4) {
      const more = document.createElement("li");
      more.className = "nv-atlas-context-overflow";
      more.textContent = `+${outgoing.length - 4} more destinations`;
      unlocksList.append(more);
    }
    unlocksGroup.append(unlocksList);
    guidanceSection.append(unlocksGroup);
  }

  if (incoming.length) {
    const dependsGroup = document.createElement("div");
    dependsGroup.className = "nv-atlas-context-group";
    const dependsHeading = document.createElement("h5");
    dependsHeading.textContent = "What depends on it";
    dependsGroup.append(dependsHeading);
    const dependsList = document.createElement("ul");
    for (const rel of incoming.slice(0, 4)) {
      dependsList.append(buildGuidanceItem(rel.relationshipType, rel.relationshipCategory, rel.importance, "depends on"));
    }
    if (incoming.length > 4) {
      const more = document.createElement("li");
      more.className = "nv-atlas-context-overflow";
      more.textContent = `+${incoming.length - 4} more prerequisites`;
      dependsList.append(more);
    }
    dependsGroup.append(dependsList);
    guidanceSection.append(dependsGroup);
  }

  if (exploration?.candidates && exploration.candidates.length > 0) {
    const nextGroup = document.createElement("div");
    nextGroup.className = "nv-atlas-context-group nv-atlas-context-suggestions";
    const nextHeading = document.createElement("h5");
    nextHeading.textContent = "Recommended next";
    nextGroup.append(nextHeading);
    const nextList = document.createElement("ol");
    for (const candidate of exploration.candidates.slice(0, 3)) {
      nextList.append(buildCandidateItem(candidate));
    }
    nextGroup.append(nextList);
    guidanceSection.append(nextGroup);
  } else {
    const suggestions = buildSuggestedNext(outgoing, incoming);
    if (suggestions.length) {
      const nextGroup = document.createElement("div");
      nextGroup.className = "nv-atlas-context-group nv-atlas-context-suggestions";
      const nextHeading = document.createElement("h5");
      nextHeading.textContent = "Suggested next";
      nextGroup.append(nextHeading);
      const nextList = document.createElement("ol");
      for (const suggestion of suggestions.slice(0, 3)) {
        nextList.append(buildSuggestionItem(suggestion));
      }
      nextGroup.append(nextList);
      guidanceSection.append(nextGroup);
    }
  }
  host.append(guidanceSection);

  if (exploration?.breadcrumbs && exploration.breadcrumbs.length > 0) {
    const breadcrumbSection = buildBreadcrumbSection(exploration.breadcrumbs);
    host.append(breadcrumbSection);
  }

  const identity = document.createElement("dl");
  identity.className = "nv-atlas-context-identity";
  appendIdentityRow(identity, "Entity family", family ? capitalize(family) : "—");
  appendIdentityRow(identity, "Entity type", type ? humanizeToken(type) : "—");
  appendIdentityRow(identity, "Constellation", domain ? titleizeToken(domain) : "Unclassified");
  appendIdentityRow(identity, "Atlas importance", importance === null ? "—" : `${Math.round(importance * 100)}%`);
  const hierarchyLevel = typeof meta.hierarchyLevel === "number" ? meta.hierarchyLevel : null;
  appendIdentityRow(identity, "Hierarchy layer", hierarchyLevel === null ? "—" : `Layer ${hierarchyLevel}`);
  host.append(identity);

  const cartographySection = document.createElement("section");
  cartographySection.className = "nv-atlas-context-cartography";
  const cartographyTitle = document.createElement("h4");
  cartographyTitle.textContent = "Stellar identity";
  cartographySection.append(cartographyTitle);
  const dl = document.createElement("dl");
  const lineage = Array.isArray(selected.lineage) ? selected.lineage : [];
  if (lineage.length === 0) {
    appendIdentityRow(dl, "Atlas tag", kind);
  } else {
    for (const entry of lineage) {
      const [prefix, value] = entry.includes(":") ? entry.split(/:(.+)/) : [entry, ""];
      appendIdentityRow(dl, prefix ? capitalize(prefix.replace(/-/g, " ")) : "Tag", value ? humanizeToken(value) : "—");
    }
  }
  const metrics = live?.render?.metrics;
  if (metrics) {
    appendIdentityRow(dl, "Atlas chart", `${metrics.visibleNodes ?? 0} stars · ${metrics.visibleEdges ?? 0} corridors · ${metrics.visibleLabels ?? 0} labels`);
  }
  cartographySection.append(dl);
  host.append(cartographySection);
}

function buildJourneyProgressSection(position: JourneyPosition): HTMLElement {
  const section = document.createElement("section");
  section.className = "nv-atlas-context-journey";

  const journeyHeader = document.createElement("div");
  journeyHeader.className = "nv-atlas-journey-header";
  const journeyLabel = document.createElement("span");
  journeyLabel.className = "nv-atlas-journey-label";
  journeyLabel.textContent = position.journey.name;
  const journeyProgress = document.createElement("span");
  journeyProgress.className = "nv-atlas-journey-progress";
  journeyProgress.textContent = `Step ${position.currentStepIndex + 1} of ${position.journey.steps.length}`;
  journeyHeader.append(journeyLabel, journeyProgress);
  section.append(journeyHeader);

  const progressBar = document.createElement("div");
  progressBar.className = "nv-atlas-journey-bar";
  progressBar.setAttribute("role", "progressbar");
  progressBar.setAttribute("aria-valuenow", String(Math.round(position.progress * 100)));
  progressBar.setAttribute("aria-valuemin", "0");
  progressBar.setAttribute("aria-valuemax", "100");
  const progressFill = document.createElement("div");
  progressFill.className = "nv-atlas-journey-bar-fill";
  progressFill.style.width = `${Math.round(position.progress * 100)}%`;
  progressBar.append(progressFill);
  section.append(progressBar);

  if (position.nextStep) {
    const nextHint = document.createElement("p");
    nextHint.className = "nv-atlas-journey-next";
    nextHint.textContent = `Next: ${position.nextStep.label}`;
    section.append(nextHint);
  }

  return section;
}

function buildLandmarkSection(landmark: LandmarkNarrative): HTMLElement {
  const section = document.createElement("section");
  section.className = "nv-atlas-context-landmark";

  const title = document.createElement("h4");
  title.textContent = "Landmark Narrative";
  section.append(title);

  const items = document.createElement("dl");
  items.className = "nv-atlas-landmark-items";
  appendIdentityRow(items, "Scientific role", landmark.scientificRole);
  appendIdentityRow(items, "Historical context", landmark.historicalImportance);
  appendIdentityRow(items, "Structural position", landmark.structuralImportance);
  appendIdentityRow(items, "Dependency role", landmark.dependencyImportance);
  section.append(items);

  return section;
}

function buildCandidateItem(candidate: DiscoveryCandidate): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "nv-atlas-context-candidate";
  item.dataset.candidateNodeId = candidate.nodeId;
  item.tabIndex = 0;
  item.setAttribute("role", "button");
  item.setAttribute("aria-label", `Navigate to ${candidate.label}`);
  const label = document.createElement("span");
  label.className = "nv-atlas-context-candidate-label";
  label.textContent = candidate.label;
  const reason = document.createElement("span");
  reason.className = "nv-atlas-context-candidate-reason";
  reason.textContent = candidate.reason;
  const score = document.createElement("span");
  score.className = "nv-atlas-context-candidate-score";
  score.textContent = `${Math.round(candidate.score * 100)}%`;
  item.append(label, reason, score);
  return item;
}

function buildBreadcrumbSection(breadcrumbs: readonly { nodeId: string; label: string; domain: string }[]): HTMLElement {
  const section = document.createElement("section");
  section.className = "nv-atlas-context-breadcrumbs";

  const title = document.createElement("h4");
  title.textContent = "Exploration path";
  section.append(title);

  const trail = document.createElement("ol");
  trail.className = "nv-atlas-breadcrumb-trail";
  const recent = getRecentBreadcrumbs(breadcrumbs as any, 8);
  for (const crumb of recent) {
    const li = document.createElement("li");
    li.className = "nv-atlas-breadcrumb-item";
    li.textContent = crumb.label;
    trail.append(li);
  }
  section.append(trail);

  const domainTransitions = new Set(recent.map((b) => b.domain)).size;
  if (domainTransitions > 1) {
    const meta = document.createElement("p");
    meta.className = "nv-atlas-breadcrumb-meta";
    meta.textContent = `${domainTransitions} constellations explored · ${recent.length} steps`;
    section.append(meta);
  }

  return section;
}

function inferRole(kind: string | null | undefined, family: string | null, type: string | null): string {
  if (kind === "region") return "Constellation";
  if (family === "scientific" && (type === "theory" || type === "principle" || type === "law")) return "Theoretical foundation";
  if (family === "scientific" && (type === "method" || type === "algorithm")) return "Scientific method";
  if (family === "engineering" && (type === "library" || type === "framework" || type === "tool")) return "Engineering instrument";
  if (family === "evidence") return "Empirical evidence";
  if (family === "context") return "Contextual constraint";
  return "Knowledge star";
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function humanizeToken(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.toLowerCase() === part ? part : part.toLowerCase())
    .join(" ");
}

function titleizeToken(value: string): string {
  return value
    .split(" ")
    .map((part) => (part.length <= 3 ? part.toUpperCase() : capitalize(part.toLowerCase())))
    .join(" ");
}

function renderAtlasOrientation(selected: InspectorEntityShape | null): void {
  const value = document.querySelector<HTMLElement>("[data-atlas-orientation-value]");
  if (!value) return;
  if (!selected) {
    value.textContent = "the celestial knowledge chart";
    value.dataset.atlasOrientationState = "overview";
    return;
  }
  const kind = selected.kind ?? "entity";
  if (kind === "region") {
    const domain = typeof selected.metadata?.domain === "string" ? selected.metadata.domain : "Unclassified";
    value.textContent = `the ${titleizeToken(domain)} constellation`;
    value.dataset.atlasOrientationState = "constellation";
    return;
  }
  const family = typeof selected.metadata?.family === "string" ? selected.metadata.family : "scientific";
  const label = selected.label || selected.id || "selected entity";
  value.textContent = `${label} · ${family}`;
  value.dataset.atlasOrientationState = "entity";
}

/* ── NV-700 Phase 13.5 — Panel Keyboard Handler ─────────────────────────── */

function handlePanelKeydown(event: KeyboardEvent): void {
  if (event.key !== "Enter") return;
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  if (target.closest("[data-journey]")) {
    handleJourneyClick(event);
  } else if (target.closest("[data-candidate-node-id]")) {
    handleCandidateClick(event);
  }
}

/* ── NV-700 Phase 13.5 — Journey Click Handler ─────────────────────────── */

function handleJourneyClick(event: Event): void {
  const target = event.target instanceof Element ? event.target.closest("[data-journey]") : null;
  if (!target) return;
  event.preventDefault();
  const journeyId = target.getAttribute("data-journey");
  if (!journeyId) return;
  const journey = CANONICAL_JOURNEYS.find((j) => j.id.endsWith(journeyId) || j.id === journeyId);
  if (!journey || journey.steps.length === 0) return;
  const firstStepNodeId = journey.steps[0].nodeId;
  selectNodeById(firstStepNodeId);
}

/* ── NV-700 Phase 13.5 — Candidate Click Handler ───────────────────────── */

function handleCandidateClick(event: Event): void {
  const target = event.target instanceof Element ? event.target.closest("[data-candidate-node-id]") : null;
  if (!target) return;
  event.preventDefault();
  const nodeId = target.getAttribute("data-candidate-node-id");
  if (!nodeId) return;
  selectNodeById(nodeId);
}

/* ── NV-700 Phase 13.5 — Select Node by ID ─────────────────────────────── */

function selectNodeById(nodeId: string): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-atlas-controller="nv-700"] canvas');
  if (!canvas) return;

  const ctrl = (window.NeuralVerse?.atlasPageController as any) ?? null;
  if (!ctrl) return;

  const payload = ctrl.payloadRef ?? null;
  if (!payload?.nodes || !payload?.viewport) return;

  const node = payload.nodes.find((n: any) => n.entityId === nodeId || n.visualId === nodeId);
  if (!node?.position) return;

  const screenPoint = atlasNodeToScreen(node, canvas, ctrl);
  if (!screenPoint) return;
  const clientX = screenPoint.x;
  const clientY = screenPoint.y;

  canvas.dispatchEvent(new PointerEvent("pointerdown", { clientX, clientY, bubbles: true, cancelable: true }));
  canvas.dispatchEvent(new PointerEvent("pointerup", { clientX, clientY, bubbles: true, cancelable: true }));
  canvas.dispatchEvent(new MouseEvent("click", { clientX, clientY, bubbles: true, cancelable: true }));
}

/* ── NV-700 Phase 15 — Touch Pinch-to-Zoom ─────────────────────────────── */

function handleCanvasTouch(event: TouchEvent, container: HTMLElement, _ctrl: any): void {
  if (event.touches.length === 2) {
    event.preventDefault();
    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (lastPinchDistance !== null) {
      const delta = lastPinchDistance - distance;
      const midX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const midY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
      const canvas = container.querySelector("canvas");
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const wheelEvent = new WheelEvent("wheel", {
          deltaY: delta * 2,
          clientX: midX,
          clientY: midY,
          bubbles: true,
          cancelable: true,
        });
        canvas.dispatchEvent(wheelEvent);
      }
    }
    lastPinchDistance = distance;
  } else {
    lastPinchDistance = null;
  }
}

/* ── NV-700 Phase 13.5 — Canvas Hover Tooltip ──────────────────────────── */

interface HoverHitResult {
  readonly nodeId: string;
  readonly label: string;
  readonly domain: string;
  readonly screenX: number;
  readonly screenY: number;
}

function measureCanvasHit(event: MouseEvent, container: HTMLElement): HoverHitResult | null {
  const canvas = container.querySelector<HTMLCanvasElement>("canvas");
  if (!canvas) return null;

  const ctrl = (window.NeuralVerse?.atlasPageController as any) ?? null;
  if (!ctrl) return null;

  const payload = ctrl.payloadRef ?? null;
  if (!payload?.nodes || !payload?.viewport) return null;

  const hitRadius = 18;
  let closestNode: HoverHitResult | null = null;
  let closestDist = Infinity;

  for (const node of payload.nodes) {
    if (!node?.position) continue;
    const screenPoint = atlasNodeToScreen(node, canvas, ctrl);
    if (!screenPoint) continue;
    const screenX = screenPoint.x;
    const screenY = screenPoint.y;
    const dx = event.clientX - screenX;
    const dy = event.clientY - screenY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < hitRadius && dist < closestDist) {
      closestDist = dist;
      closestNode = {
        nodeId: node.entityId,
        label: node.label || node.entityId,
        domain: node.domain || "",
        screenX,
        screenY,
      };
    }
  }

  return closestNode;
}

function atlasNodeToScreen(node: { position?: { x: number; y: number } } | null, canvas: HTMLCanvasElement, ctrl: any): { x: number; y: number } | null {
  if (!node?.position) return null;
  const viewport = ctrl?.snapshot?.()?.interaction?.viewport ?? ctrl?.payloadRef?.viewport ?? null;
  if (!viewport?.visibleBounds) return null;
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(rect.width / viewport.visibleBounds.width, rect.height / viewport.visibleBounds.height);
  const offsetX = (rect.width - viewport.visibleBounds.width * scale) / 2;
  const offsetY = (rect.height - viewport.visibleBounds.height * scale) / 2;
  return {
    x: rect.left + offsetX + (node.position.x - viewport.visibleBounds.x) * scale,
    y: rect.top + offsetY + (node.position.y - viewport.visibleBounds.y) * scale,
  };
}

function handleCanvasHover(event: MouseEvent, container: HTMLElement): void {
  if (hoverTooltipRaf !== null) cancelAnimationFrame(hoverTooltipRaf);
  hoverTooltipRaf = requestAnimationFrame(() => {
    const hit = measureCanvasHit(event, container);
    if (!hit) {
      hideHoverTooltip();
      return;
    }
    const x = event.clientX;
    const y = event.clientY;
    if (hoverTooltipTimer !== null) clearTimeout(hoverTooltipTimer);
    hoverTooltipTimer = setTimeout(() => {
      showHoverTooltip(hit.label, hit.domain, x, y);
      hoverTooltipTimer = null;
    }, 90);
  });
}

function showHoverTooltip(label: string, domain: string, x: number, y: number): void {
  if (!hoverTooltipEl) {
    hoverTooltipEl = document.createElement("div");
    hoverTooltipEl.className = "nv-atlas-hover-tooltip";
    hoverTooltipEl.setAttribute("role", "tooltip");
    hoverTooltipEl.setAttribute("aria-hidden", "true");
    document.body.append(hoverTooltipEl);
  }
  hoverTooltipEl.innerHTML = "";
  const labelSpan = document.createElement("span");
  labelSpan.className = "nv-atlas-hover-tooltip-label";
  labelSpan.textContent = label;
  hoverTooltipEl.append(labelSpan);
  if (domain) {
    const domainSpan = document.createElement("span");
    domainSpan.className = "nv-atlas-hover-tooltip-domain";
    domainSpan.textContent = domain;
    hoverTooltipEl.append(domainSpan);
  }
  hoverTooltipEl.style.left = `${x + 12}px`;
  hoverTooltipEl.style.top = `${y - 8}px`;
  hoverTooltipEl.dataset.visible = "true";
}

function hideHoverTooltip(): void {
  if (hoverTooltipTimer !== null) {
    clearTimeout(hoverTooltipTimer);
    hoverTooltipTimer = null;
  }
  if (hoverTooltipRaf !== null) {
    cancelAnimationFrame(hoverTooltipRaf);
    hoverTooltipRaf = null;
  }
  if (hoverTooltipEl) {
    hoverTooltipEl.dataset.visible = "false";
  }
}

function destroyHoverTooltip(): void {
  if (hoverTooltipTimer !== null) {
    clearTimeout(hoverTooltipTimer);
    hoverTooltipTimer = null;
  }
  if (hoverTooltipRaf !== null) {
    cancelAnimationFrame(hoverTooltipRaf);
    hoverTooltipRaf = null;
  }
  if (hoverTooltipEl) {
    hoverTooltipEl.remove();
    hoverTooltipEl = null;
  }
}

/* ── NV-700 Phase 13.5 — Keyboard Canvas Navigation ────────────────────── */

function handleCanvasKeydown(event: KeyboardEvent, container: HTMLElement, ctrl: any): void {
  if (event.key === "Escape") {
    ctrl?.clearSelection?.();
    renderAtlasContext(null, ctrl, undefined);
    renderAtlasOrientation(null);
    event.preventDefault();
    return;
  }

  if (event.key !== "ArrowUp" && event.key !== "ArrowDown" && event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Enter") {
    return;
  }

  if (event.key === "Enter") {
    const snapshot = ctrl?.snapshot?.();
    const selected = snapshot?.interaction?.inspector?.selected;
    if (selected?.id) {
      selectNodeById(selected.id);
    }
    event.preventDefault();
    return;
  }

  const snapshot = ctrl?.snapshot?.();
  const selectedId = snapshot?.interaction?.inspector?.selected?.id ?? null;

  const payload = ctrl?.payloadRef ?? null;
  if (!payload?.nodes) return;

  const nodeIds = payload.nodes.map((n: any) => n.entityId).filter(Boolean);
  if (nodeIds.length === 0) return;

  if (!selectedId) {
    selectNodeById(nodeIds[0]);
    event.preventDefault();
    return;
  }

  const currentIndex = nodeIds.indexOf(selectedId);
  let nextIndex: number;
  switch (event.key) {
    case "ArrowDown":
    case "ArrowRight":
      nextIndex = currentIndex < nodeIds.length - 1 ? currentIndex + 1 : 0;
      break;
    case "ArrowUp":
    case "ArrowLeft":
      nextIndex = currentIndex > 0 ? currentIndex - 1 : nodeIds.length - 1;
      break;
    default:
      return;
  }
  selectNodeById(nodeIds[nextIndex]);
  event.preventDefault();
}

/* ── NV-700 Phase 13.5 — Skip Link ─────────────────────────────────────── */

function injectSkipLink(container: HTMLElement): void {
  removeSkipLink();
  const link = document.createElement("a");
  link.className = "nv-atlas-skip-link";
  link.href = "#atlas-context-panel";
  link.textContent = "Skip graph, go to context panel";
  const contextPanel = document.querySelector(".nv-context-panel");
  if (contextPanel) {
    if (!contextPanel.id) contextPanel.id = "atlas-context-panel";
    link.href = `#${contextPanel.id}`;
  }
  container.prepend(link);
}

function removeSkipLink(): void {
  const existing = document.querySelector(".nv-atlas-skip-link");
  if (existing) existing.remove();
}

window.NeuralVerse = window.NeuralVerse ?? {};
window.NeuralVerse.createBrowserAtlasController = createBrowserAtlasController;
