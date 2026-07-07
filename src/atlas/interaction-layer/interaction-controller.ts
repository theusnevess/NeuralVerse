import type { VisualizationPayload, WorldPoint } from "../visualization-foundation/index.ts";
import { AtlasCameraController } from "./camera-controller.ts";
import {
  focusChangedEvent,
  hoverChangedEvent,
  nodeSelectedEvent,
  selectionClearedEvent,
  viewportMovedEvent,
  viewportZoomedEvent,
} from "./events.ts";
import { hitTest } from "./hit-testing.ts";
import { freezeInteraction } from "./immutability.ts";
import { buildInspectorBridgeSnapshot } from "./inspector-bridge.ts";
import { AtlasInteractionMetrics } from "./metrics.ts";
import { AtlasInteractionStateMachine } from "./state-machine.ts";
import type {
  HitTarget,
  InteractionControllerInput,
  InteractionEvent,
  InteractionSnapshot,
  PointerInput,
  ViewportSize,
} from "./types.ts";

const DEFAULT_DRAG_THRESHOLD = 6;

export class AtlasInteractionController {
  private readonly payload: VisualizationPayload;
  private readonly clock: () => number;
  private viewportSize: ViewportSize;
  private readonly camera: AtlasCameraController;
  private readonly stateMachine = new AtlasInteractionStateMachine();
  private readonly metrics = new AtlasInteractionMetrics();
  private readonly events: InteractionEvent[] = [];
  private selected: HitTarget | null = null;
  private selectedAt: number | null = null;
  private hovered: HitTarget | null = null;
  private hoverUpdatedAt: number | null = null;
  private focused: HitTarget | null = null;
  private focusedAt: number | null = null;
  private dragStart: { readonly point: PointerInput["point"] } | null = null;
  private dragConfirmed = false;
  private accumulatedDragDistance = 0;
  private suppressNextClick = false;
  private readonly dragThreshold: number;

  constructor(input: InteractionControllerInput) {
    this.payload = input.payload;
    this.clock = input.options.clock ?? (() => performance.now());
    this.viewportSize = input.options.viewportSize;
    this.dragThreshold = Math.max(5, input.options.dragThreshold ?? DEFAULT_DRAG_THRESHOLD);
    this.camera = new AtlasCameraController(input.payload.viewport, input.payload.scene.bounds, input.options.camera);
  }

  snapshot(): InteractionSnapshot {
    const now = this.clock();
    return freezeInteraction({
      state: this.stateMachine.state,
      viewport: this.camera.getViewport(),
      selection: { selected: this.selected, selectedAt: this.selectedAt },
      hover: { hovered: this.hovered, lastUpdatedAt: this.hoverUpdatedAt },
      focus: { focused: this.focused, focusedAt: this.focusedAt },
      inspector: buildInspectorBridgeSnapshot(this.payload, this.selected, this.focused),
      metrics: this.metrics.snapshot(now),
    }) as InteractionSnapshot;
  }

  drainEvents(): readonly InteractionEvent[] {
    const drained = this.events.splice(0, this.events.length);
    return freezeInteraction(drained) as readonly InteractionEvent[];
  }

  setViewportSize(size: ViewportSize): void {
    this.viewportSize = freezeInteraction({ width: Math.max(1, size.width), height: Math.max(1, size.height) }) as ViewportSize;
  }

  pointerMove(input: PointerInput): HitTarget | null {
    const start = this.clock();
    if (this.dragStart) {
      const dx = input.point.x - this.dragStart.point.x;
      const dy = input.point.y - this.dragStart.point.y;
      this.accumulatedDragDistance = Math.sqrt(dx * dx + dy * dy);

      if (!this.dragConfirmed && this.accumulatedDragDistance >= this.dragThreshold) {
        this.dragConfirmed = true;
      }

      if (this.dragConfirmed) {
        const viewport = this.camera.pan({ x: input.point.x - this.dragStart.point.x, y: input.point.y - this.dragStart.point.y }, this.viewportSize);
        this.dragStart = { point: input.point };
        this.stateMachine.transition("Dragging Viewport");
        this.metrics.recordViewportMove();
        this.push(viewportMovedEvent(this.clock(), this.stateMachine.state, viewport));
        this.metrics.recordDragLatency(this.clock() - start);
      }
      this.metrics.recordInteractionLatency(this.clock() - start);
      return null;
    }

    const target = this.measureHit(input);
    if (!sameTarget(this.hovered, target)) {
      const previous = this.hovered;
      this.hovered = target.kind === "background" ? null : target;
      this.hoverUpdatedAt = this.clock();
      this.stateMachine.transition(this.hovered ? "Hover" : "Idle");
      this.metrics.recordHover();
      this.push(hoverChangedEvent(this.hoverUpdatedAt, this.stateMachine.state, previous, this.hovered));
    }
    this.metrics.recordInteractionLatency(this.clock() - start);
    return this.hovered;
  }

  pointerDown(input: PointerInput): void {
    this.dragStart = { point: input.point };
    this.dragConfirmed = false;
    this.accumulatedDragDistance = 0;
    this.stateMachine.transition("Dragging Viewport");
  }

  pointerUp(): void {
    this.suppressNextClick = this.dragConfirmed || this.accumulatedDragDistance >= this.dragThreshold;
    this.dragStart = null;
    this.dragConfirmed = false;
    this.stateMachine.transition(this.selected ? "Selected" : this.focused ? "Focused" : this.hovered ? "Hover" : "Idle");
  }

  click(input: PointerInput): HitTarget | null {
    const start = this.clock();

    if (this.suppressNextClick || this.accumulatedDragDistance >= this.dragThreshold) {
      this.suppressNextClick = false;
      this.accumulatedDragDistance = 0;
      this.metrics.recordInteractionLatency(this.clock() - start);
      return null;
    }
    this.accumulatedDragDistance = 0;

    const target = this.measureHit(input);
    const now = this.clock();

    if (target.kind !== "node") {
      this.clearSelection();
      this.metrics.recordInteractionLatency(this.clock() - start);
      return null;
    }

    this.selected = target;
    this.selectedAt = now;
    this.stateMachine.transition("Selected");
    this.metrics.recordSelection(now);
    this.push(nodeSelectedEvent(now, this.stateMachine.state, target));
    this.metrics.recordSelectionLatency(this.clock() - start);
    this.metrics.recordInteractionLatency(this.clock() - start);
    return target;
  }

  focus(target: HitTarget | null = this.selected): HitTarget | null {
    const previous = this.focused;
    this.focused = target && target.kind !== "background" ? target : null;
    this.focusedAt = this.focused ? this.clock() : null;
    this.stateMachine.transition(this.focused ? "Focused" : "Idle");
    const focusedViewport = this.focused?.kind === "node" ? this.camera.focusOn(this.focused.node.position) : this.focused?.kind === "region" ? this.camera.focusOn(this.focused.region.boundaryHints.centroid) : null;
    this.push(focusChangedEvent(this.clock(), this.stateMachine.state, previous, this.focused));
    if (focusedViewport) this.push(viewportMovedEvent(this.clock(), this.stateMachine.state, focusedViewport));
    return this.focused;
  }

  focusAnimated(onFrame: () => void, target: HitTarget | null = this.selected): HitTarget | null {
    const previous = this.focused;
    this.focused = target && target.kind !== "background" ? target : null;
    this.focusedAt = this.focused ? this.clock() : null;
    this.stateMachine.transition(this.focused ? "Focused" : "Idle");
    this.push(focusChangedEvent(this.clock(), this.stateMachine.state, previous, this.focused));

    if (this.focused?.kind === "node") {
      this.camera.focusOnAnimated(this.focused.node.position, () => {
        this.push(viewportMovedEvent(this.clock(), this.stateMachine.state, this.camera.getViewport()));
        onFrame();
      });
    } else if (this.focused?.kind === "region") {
      this.camera.focusOnAnimated(this.focused.region.boundaryHints.centroid, () => {
        this.push(viewportMovedEvent(this.clock(), this.stateMachine.state, this.camera.getViewport()));
        onFrame();
      });
    }

    return this.focused;
  }

  focusAt(input: PointerInput, onFrame: () => void): HitTarget | null {
    const target = this.measureHit(input);
    return this.focusAnimated(onFrame, target.kind === "background" ? null : target);
  }

  wheel(input: PointerInput): void {
    const start = this.clock();
    const viewport = this.camera.zoom(input.deltaY ?? 0, input.point, this.viewportSize);
    this.stateMachine.transition("Zooming");
    this.metrics.recordZoom();
    this.push(viewportZoomedEvent(this.clock(), this.stateMachine.state, viewport));
    this.stateMachine.transition(this.hovered ? "Hover" : this.selected ? "Selected" : this.focused ? "Focused" : "Idle");
    this.metrics.recordWheelLatency(this.clock() - start);
    this.metrics.recordInteractionLatency(this.clock() - start);
  }

  resetViewport(): void {
    const viewport = this.camera.reset();
    this.push(viewportMovedEvent(this.clock(), this.stateMachine.state, viewport));
  }

  resetViewportAnimated(onFrame: () => void): void {
    this.camera.resetAnimated(() => {
      const viewport = this.camera.getViewport();
      this.push(viewportMovedEvent(this.clock(), this.stateMachine.state, viewport));
      onFrame();
    });
  }

  clearSelection(): void {
    const previous = this.selected;
    this.selected = null;
    this.selectedAt = null;
    this.stateMachine.transition(this.focused ? "Focused" : this.hovered ? "Hover" : "Idle");
    this.metrics.clearSelection(this.clock());
    this.push(selectionClearedEvent(this.clock(), this.stateMachine.state, previous));
  }

  private measureHit(input: PointerInput): HitTarget {
    const start = this.clock();
    const target = hitTest({ payload: this.payload, viewport: this.camera.getViewport(), viewportSize: this.viewportSize, screenPoint: input.point });
    this.metrics.recordHitTestLatency(this.clock() - start);
    return target;
  }

  private push(event: InteractionEvent): void {
    this.events.push(event);
  }
}

export function createAtlasInteractionController(input: InteractionControllerInput): AtlasInteractionController {
  return new AtlasInteractionController(input);
}

export function targetPosition(target: HitTarget): WorldPoint | null {
  if (target.kind === "node") return target.node.position;
  if (target.kind === "region") return target.region.boundaryHints.centroid;
  return null;
}

function sameTarget(a: HitTarget | null, b: HitTarget | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.kind === "background" || b.kind === "background") return a.kind === b.kind;
  return a.kind === b.kind && a.id === b.id;
}
