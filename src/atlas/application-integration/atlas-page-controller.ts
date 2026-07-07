import { ProjectionEngine, SnapshotCompiler, createInitialAtlasGraphSource } from "../graph-foundation/index.ts";
import type { GraphProjection, GraphSnapshot, ProjectionKind } from "../graph-foundation/index.ts";
import { createAtlasInteractionController } from "../interaction-layer/index.ts";
import type { AtlasInteractionController, InteractionSnapshot, InteractionViewport, PointerInput } from "../interaction-layer/index.ts";
import type { HitTarget } from "../interaction-layer/index.ts";
import { CanvasRenderer, buildVisualizationPayload } from "../visualization-foundation/index.ts";
import type { CanvasRenderResult, VisualizationPayload } from "../visualization-foundation/index.ts";
import type {
  AtlasApplicationStatus,
  AtlasCanvasEventTarget,
  AtlasCanvasHost,
  AtlasCanvasMount,
  AtlasPageControllerOptions,
  AtlasPageControllerSnapshot,
  AtlasViewportPersistenceState,
  AtlasViewportStorage,
} from "./types.ts";

const DEFAULT_PROJECTION: ProjectionKind = "topology";
const STORAGE_KEY = "nv.atlas.viewport";

export class AtlasPageController {
  private status: AtlasApplicationStatus = "idle";
  private projectionKind: ProjectionKind;
  private snapshotRef: GraphSnapshot | null = null;
  private projectionRef: GraphProjection | null = null;
  private payloadRef: VisualizationPayload | null = null;
  private renderer: CanvasRenderer | null = null;
  private interaction: AtlasInteractionController | null = null;
  private renderResult: CanvasRenderResult | null = null;
  private canvasMount: AtlasCanvasMount | null = null;
  private diagnosticsId: string | null = null;
  private readonly listeners: Array<{ readonly target: AtlasCanvasEventTarget; readonly type: string; readonly listener: EventListener }> = [];
  private pendingFrame: ReturnType<typeof requestAtlasFrame> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resizeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private resizeEntryGuard = false;
  private lastAnnouncedSelectionId: string | null = null;
  private pendingVisualStateUpdate = false;

  constructor(private readonly options: AtlasPageControllerOptions) {
    this.projectionKind = this.readPersistedViewport()?.projection ?? options.initialProjection ?? DEFAULT_PROJECTION;
  }

  start(): AtlasPageControllerSnapshot {
    if (this.status === "destroyed") throw new Error("Atlas page controller cannot restart after destroy.");
    this.cleanupActiveResources();
    this.status = "loading";
    this.diagnosticsId = null;
    this.options.host.showLoading("Preparing Atlas topology");

    try {
      const source = (this.options.graphSourceFactory ?? createInitialAtlasGraphSource)();
      const snapshot = new SnapshotCompiler().compile(source);
      this.snapshotRef = snapshot;

      if (snapshot.nodes.size === 0) {
        this.status = "empty";
        this.options.host.showEmpty({ message: "Atlas has no knowledge entities to render." });
        return this.snapshot();
      }

      const persisted = this.readPersistedViewport();
      this.projectionKind = persisted?.projection ?? this.projectionKind;
      const projection = new ProjectionEngine().generate(snapshot, { kind: this.projectionKind, includeIsolatedNodes: true });
      const viewport = persisted ? persistedViewportToPartial(persisted) : undefined;
      const payload = buildVisualizationPayload({ snapshot, projection, viewport });
      const mount = this.options.host.mountCanvas();
      const renderer = new CanvasRenderer(mount.canvas, mount.context, {
        width: mount.width,
        height: mount.height,
        devicePixelRatio: mount.devicePixelRatio ?? 1,
      });
      const interaction = createAtlasInteractionController({
        payload,
        options: {
          viewportSize: { width: mount.width, height: mount.height },
          clock: this.options.clock,
          dragThreshold: 5,
        },
      });

      this.projectionRef = projection;
      this.payloadRef = payload;
      this.canvasMount = mount;
      this.renderer = renderer;
      this.interaction = interaction;
      this.renderResult = renderer.render(payload);
      this.attachInteraction(mount);
      this.observeCanvasResize(mount);
      this.announceSelection(null);
    this.status = "ready";
    return this.snapshot();
    } catch (error) {
      const diagnosticsId = this.createDiagnosticsId(error);
      this.status = "error";
      this.diagnosticsId = diagnosticsId;
      this.options.host.showError({
        message: "Atlas snapshot could not be built.",
        diagnosticsId,
        retry: () => {
          this.start();
        },
      });
      return this.snapshot();
    }
  }

  resetViewport(): AtlasPageControllerSnapshot {
    if (!this.interaction) return this.snapshot();
    this.interaction.resetViewportAnimated(() => {
      this.syncViewportFromInteraction();
    });
    return this.snapshot();
  }

  clearSelection(): AtlasPageControllerSnapshot {
    if (!this.interaction) return this.snapshot();
    this.interaction.clearSelection();
    this.announceSelection(null);
    return this.snapshot();
  }

  destroy(): void {
    this.cleanupActiveResources();
    this.options.host.clear();
    this.status = "destroyed";
  }

  snapshot(): AtlasPageControllerSnapshot {
    return {
      status: this.status,
      projection: this.projectionKind,
      payloadId: this.payloadRef?.metadata.payloadId ?? null,
      nodeCount: this.payloadRef?.nodes.length ?? 0,
      edgeCount: this.payloadRef?.edges.length ?? 0,
      render: this.renderResult,
      interaction: this.interaction?.snapshot() ?? null,
      diagnosticsId: this.diagnosticsId,
    };
  }

  private attachInteraction(mount: AtlasCanvasMount): void {
    if (!mount.eventTarget || !this.interaction) return;
    const target = mount.eventTarget;
    this.addListener(target, "pointermove", (event) => {
      const before = this.interaction?.snapshot().viewport ?? null;
      this.interaction?.pointerMove(pointerInputFromEvent(event, this.canvasMount));
      const after = this.interaction?.snapshot().viewport ?? null;
      if (before && after && viewportChanged(before, after)) {
        if ("preventDefault" in event) event.preventDefault();
        this.setCanvasDragging(true);
        this.syncViewportFromInteraction();
        return;
      }
      this.renderInteractionVisualState();
    });
    this.addListener(target, "pointerdown", (event) => {
      if ((event as PointerEvent).button !== 0) return;
      if ("preventDefault" in event) event.preventDefault();
      if (isHtmlCanvasElement(target) && "setPointerCapture" in target && "pointerId" in event) {
        target.setPointerCapture((event as PointerEvent).pointerId);
      }
      this.setCanvasDragging(true);
      this.interaction?.pointerDown(pointerInputFromEvent(event, this.canvasMount));
    });
    this.addListener(target, "pointerup", (event) => {
      if (isHtmlCanvasElement(target) && "releasePointerCapture" in target && "pointerId" in event) {
        try {
          target.releasePointerCapture((event as PointerEvent).pointerId);
        } catch {
          // Pointer capture may already be released by the browser.
        }
      }
      this.interaction?.pointerUp();
      this.setCanvasDragging(false);
      this.syncViewportFromInteraction();
      this.renderInteractionVisualState();
    });
    this.addListener(target, "pointercancel", (event) => {
      if (isHtmlCanvasElement(target) && "releasePointerCapture" in target && "pointerId" in event) {
        try {
          target.releasePointerCapture((event as PointerEvent).pointerId);
        } catch {
          // Pointer capture may already be released by the browser.
        }
      }
      this.interaction?.pointerUp();
      this.setCanvasDragging(false);
      this.renderInteractionVisualState();
    });
    this.addListener(target, "click", (event) => {
      this.interaction?.click(pointerInputFromEvent(event, this.canvasMount));
      this.renderInteractionVisualState();
    });
    this.addListener(target, "dblclick", (event) => {
      if ("preventDefault" in event) event.preventDefault();
      const focused = this.interaction?.focusAt(pointerInputFromEvent(event, this.canvasMount), () => {
        this.syncViewportFromInteraction();
      });
      if (focused) {
        this.renderInteractionVisualState();
      }
    });
    this.addListener(target, "wheel", (event) => {
      if ("preventDefault" in event) event.preventDefault();
      this.interaction?.wheel(pointerInputFromEvent(event, this.canvasMount));
      this.syncViewportFromInteraction();
    });
  }

  private addListener(target: AtlasCanvasEventTarget, type: string, listener: EventListener): void {
    target.addEventListener(type, listener, type === "wheel" ? { passive: false } : undefined);
    this.listeners.push({ target, type, listener });
  }

  private setCanvasDragging(isDragging: boolean): void {
    if (!isHtmlCanvasElement(this.canvasMount?.eventTarget)) return;
    if (isDragging) {
      this.canvasMount.eventTarget.dataset.draggingViewport = "true";
    } else {
      delete this.canvasMount.eventTarget.dataset.draggingViewport;
    }
  }

  private syncViewportFromInteraction(): void {
    if (!this.interaction || !this.snapshotRef || !this.projectionRef || !this.renderer) return;
    const viewport = this.interaction.snapshot().viewport;
    this.persistViewport(viewport);
    this.scheduleRender(viewport);
  }

  private renderInteractionVisualState(): void {
    if (!this.interaction || !this.renderer || !this.payloadRef) return;
    if (this.pendingVisualStateUpdate) return;
    this.pendingVisualStateUpdate = true;
    requestAtlasFrame(() => {
      this.pendingVisualStateUpdate = false;
      if (!this.interaction || !this.renderer || !this.payloadRef) return;
      const snapshot = this.interaction.snapshot();
      const selectedId = targetId(snapshot.selection.selected);
      const focusedId = targetId(snapshot.focus.focused);
      const hoveredId = targetId(snapshot.hover.hovered);
      const connectedIds: string[] = [selectedId, focusedId, hoveredId].filter((id): id is string => Boolean(id));
      if (selectedId && snapshot.inspector.selected) {
        for (const relationship of snapshot.inspector.selected.relationships) {
          if (relationship.source !== selectedId) connectedIds.push(relationship.source);
          if (relationship.target !== selectedId) connectedIds.push(relationship.target);
        }
      }
      this.renderer.setVisualState({
        selectedId,
        focusedId,
        hoveredId,
        highlightedIds: connectedIds,
      });
      this.renderResult = this.renderer.render(this.payloadRef);
      this.announceSelection(snapshot.inspector.selected);

      if (isHtmlCanvasElement(this.canvasMount?.eventTarget)) {
        const canvas = this.canvasMount.eventTarget;
        if (hoveredId) {
          canvas.dataset.hoveringNode = "true";
        } else {
          delete canvas.dataset.hoveringNode;
        }
      }
    });
  }

  private scheduleRender(viewport: InteractionViewport): void {
    if (this.pendingFrame) cancelAtlasFrame(this.pendingFrame);
    this.pendingFrame = requestAtlasFrame(() => {
      this.pendingFrame = null;
      if (!this.snapshotRef || !this.projectionRef || !this.renderer) return;
      const payload = buildVisualizationPayload({ snapshot: this.snapshotRef, projection: this.projectionRef, viewport });
      this.payloadRef = payload;
      this.renderResult = this.renderer.render(payload);
    });
  }

  private observeCanvasResize(mount: AtlasCanvasMount): void {
    if (!isHtmlCanvasElement(mount.eventTarget) || typeof ResizeObserver === "undefined") return;
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => this.scheduleResizeSync());
    this.resizeObserver.observe(mount.eventTarget);
  }

  private scheduleResizeSync(): void {
    if (this.resizeEntryGuard) return;
    if (this.resizeDebounceTimer !== null) clearTimeout(this.resizeDebounceTimer);
    this.resizeDebounceTimer = setTimeout(() => {
      this.resizeDebounceTimer = null;
      this.syncCanvasSizeToLayout();
    }, 0);
  }

  private syncCanvasSizeToLayout(): void {
    if (!this.canvasMount || !this.renderer || !this.interaction || !isHtmlCanvasElement(this.canvasMount.eventTarget)) return;
    if (this.resizeEntryGuard) return;
    this.resizeEntryGuard = true;
    try {
      const rect = this.canvasMount.eventTarget.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(320, Math.floor(rect.width || this.canvasMount.width));
      const height = Math.max(360, Math.floor(rect.height || this.canvasMount.height));
      if (width === this.canvasMount.width && height === this.canvasMount.height) return;

      this.canvasMount = { ...this.canvasMount, width, height, devicePixelRatio: dpr };
      this.renderer.resize(width, height, dpr);
      this.interaction.setViewportSize({ width, height });
      this.scheduleRender(this.interaction.snapshot().viewport);
    } finally {
      this.resizeEntryGuard = false;
    }
  }

  private cleanupActiveResources(): void {
    for (const { target, type, listener } of this.listeners.splice(0)) {
      target.removeEventListener(type, listener);
    }
    if (this.pendingFrame) {
      cancelAtlasFrame(this.pendingFrame);
      this.pendingFrame = null;
    }
    if (this.resizeDebounceTimer !== null) {
      clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = null;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.resizeEntryGuard = false;
    this.pendingVisualStateUpdate = false;
    if (this.interaction) {
      this.interaction.resetViewport();
    }
    this.snapshotRef = null;
    this.projectionRef = null;
    this.payloadRef = null;
    this.renderer = null;
    this.interaction = null;
    this.renderResult = null;
    this.canvasMount = null;
    this.lastAnnouncedSelectionId = null;
    this.options.host.clear();
  }

  private announceSelection(selected: NonNullable<InteractionSnapshot["inspector"]["selected"]> | null): void {
    const selectionId = selected?.id ?? null;
    if (selectionId === this.lastAnnouncedSelectionId) return;
    this.lastAnnouncedSelectionId = selectionId;

    if (isHtmlCanvasElement(this.canvasMount?.eventTarget)) {
      this.canvasMount.eventTarget.setAttribute(
        "aria-label",
        selected
          ? `Atlas knowledge topology. Selected ${selected.label}.`
          : "Atlas knowledge topology. No entity selected.",
      );
      const root = this.canvasMount.eventTarget.closest("[data-knowledge-graph-root]");
      const readout = root?.querySelector<HTMLElement>("[data-atlas-selection-readout]");
      if (readout) {
        readout.textContent = selected
          ? `${selected.label} · ${selected.kind} · ${selected.relationships.length} relationships`
          : "No Atlas entity selected. Select a concept, landmark, or continent to begin exploring.";
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nv:atlas-selection", { detail: { selected } }));
    }
  }

  private readPersistedViewport(): AtlasViewportPersistenceState | null {
    const state = this.options.storage?.load() ?? null;
    return isValidPersistenceState(state) ? state : null;
  }

  private persistViewport(viewport: InteractionViewport): void {
    this.options.storage?.save({
      projection: this.projectionKind,
      zoom: viewport.zoom,
      pan: { x: viewport.center.x, y: viewport.center.y },
    });
  }

  private createDiagnosticsId(error: unknown): string {
    if (this.options.diagnostics) return this.options.diagnostics.createId(error);
    const message = error instanceof Error ? error.message : String(error);
    let hash = 0;
    for (let index = 0; index < message.length; index += 1) hash = (hash * 31 + message.charCodeAt(index)) >>> 0;
    return `atlas-${hash.toString(16).padStart(8, "0")}`;
  }
}

export function createAtlasPageController(options: AtlasPageControllerOptions): AtlasPageController {
  return new AtlasPageController(options);
}

export function createLocalStorageAtlasViewportStorage(storage: Pick<Storage, "getItem" | "setItem">, key = STORAGE_KEY): AtlasViewportStorage {
  return {
    load() {
      const raw = storage.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as AtlasViewportPersistenceState;
      } catch {
        return null;
      }
    },
    save(state) {
      storage.setItem(key, JSON.stringify(state));
    },
  };
}

function persistedViewportToPartial(state: AtlasViewportPersistenceState) {
  return {
    center: { x: state.pan.x, y: state.pan.y },
    zoom: state.zoom,
    scale: state.zoom,
  };
}

function isValidPersistenceState(state: AtlasViewportPersistenceState | null): state is AtlasViewportPersistenceState {
  return Boolean(
    state &&
      typeof state.zoom === "number" &&
      Number.isFinite(state.zoom) &&
      state.zoom > 0 &&
      typeof state.pan?.x === "number" &&
      typeof state.pan?.y === "number" &&
      typeof state.projection === "string",
  );
}

function pointerInputFromEvent(event: Event, mount: AtlasCanvasMount | null): PointerInput {
  const pointer = event as MouseEvent & WheelEvent & { offsetX?: number; offsetY?: number };
  const point = normalizedPointerPoint(pointer, mount);
  return {
    point,
    buttons: pointer.buttons,
    deltaY: typeof pointer.deltaY === "number" ? pointer.deltaY : undefined,
  };
}

function normalizedPointerPoint(pointer: MouseEvent & { offsetX?: number; offsetY?: number }, mount: AtlasCanvasMount | null): PointerInput["point"] {
  const fallback = {
    x: Number.isFinite(pointer.offsetX) ? pointer.offsetX ?? 0 : pointer.clientX,
    y: Number.isFinite(pointer.offsetY) ? pointer.offsetY ?? 0 : pointer.clientY,
  };
  if (!mount || !isHtmlCanvasElement(mount.eventTarget)) return fallback;
  const rect = mount.eventTarget.getBoundingClientRect();
  if (!rect.width || !rect.height) return fallback;
  const cssX = typeof pointer.clientX === "number" ? pointer.clientX - rect.left : fallback.x;
  const cssY = typeof pointer.clientY === "number" ? pointer.clientY - rect.top : fallback.y;
  return {
    x: cssX * (mount.width / rect.width),
    y: cssY * (mount.height / rect.height),
  };
}

function targetId(target: HitTarget | null): string | null {
  if (!target || target.kind === "background") return null;
  return target.id;
}

function viewportChanged(a: InteractionViewport, b: InteractionViewport): boolean {
  return a.zoom !== b.zoom || a.center.x !== b.center.x || a.center.y !== b.center.y;
}

function isHtmlCanvasElement(value: unknown): value is HTMLCanvasElement {
  return typeof HTMLCanvasElement !== "undefined" && value instanceof HTMLCanvasElement;
}

function requestAtlasFrame(callback: FrameRequestCallback): ReturnType<typeof setTimeout> | number {
  if (typeof requestAnimationFrame === "function") return requestAnimationFrame(callback);
  return setTimeout(() => callback(Date.now()), 0);
}

function cancelAtlasFrame(frame: ReturnType<typeof setTimeout> | number): void {
  if (typeof cancelAnimationFrame === "function" && typeof frame === "number") {
    cancelAnimationFrame(frame);
    return;
  }
  clearTimeout(frame as ReturnType<typeof setTimeout>);
}
