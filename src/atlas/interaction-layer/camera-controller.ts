import type { CanonicalViewport, WorldBounds, WorldPoint } from "../visualization-foundation/index.ts";
import { freezeInteraction } from "./immutability.ts";
import type { CameraControllerOptions, InteractionViewport, ScreenPoint, ViewportSize } from "./types.ts";

const DEFAULT_MIN_ZOOM = 0.25;
const DEFAULT_MAX_ZOOM = 6;
const DEFAULT_PADDING = 96;
const ANIMATION_DURATION_MS = 280;
const ANIMATION_EASING = (t: number): number => 1 - Math.pow(1 - t, 3);

export class AtlasCameraController {
  private viewport: InteractionViewport;
  private readonly initialViewport: InteractionViewport;
  private baseVisibleBounds: WorldBounds | null = null;
  private readonly minZoom: number;
  private readonly maxZoom: number;
  private readonly padding: number;
  private animationFrame: number | null = null;
  private animationStart: number | null = null;
  private animationFrom: InteractionViewport | null = null;
  private animationTo: InteractionViewport | null = null;
  private animationCallback: (() => void) | null = null;

  constructor(viewport: CanonicalViewport, worldBounds: WorldBounds, options: CameraControllerOptions = {}) {
    this.minZoom = options.minZoom ?? DEFAULT_MIN_ZOOM;
    this.maxZoom = options.maxZoom ?? DEFAULT_MAX_ZOOM;
    this.padding = options.viewportPadding ?? DEFAULT_PADDING;
    this.viewport = this.normalize(viewport, worldBounds);
    this.baseVisibleBounds = this.viewport.visibleBounds;
    this.initialViewport = this.viewport;
  }

  getViewport(): InteractionViewport {
    return this.viewport;
  }

  get isAnimating(): boolean {
    return this.animationFrame !== null;
  }

  reset(): InteractionViewport {
    this.cancelAnimation();
    this.viewport = this.initialViewport;
    return this.viewport;
  }

  resetAnimated(onFrame: () => void): void {
    this.cancelAnimation();
    this.animationFrom = { ...this.viewport };
    this.animationTo = { ...this.initialViewport };
    this.animationStart = performance.now();
    this.animationCallback = onFrame;
    this.animationFrame = requestAnimationFrame((now) => this.stepAnimation(now));
  }

  focusOnAnimated(point: WorldPoint, onFrame: () => void): void {
    this.cancelAnimation();
    const targetViewport = this.withCenter(point);
    this.animationFrom = { ...this.viewport };
    this.animationTo = { ...targetViewport };
    this.animationStart = performance.now();
    this.animationCallback = onFrame;
    this.animationFrame = requestAnimationFrame((now) => this.stepAnimation(now));
  }

  private stepAnimation(now: number): void {
    if (!this.animationFrom || !this.animationTo || this.animationStart === null) return;
    const elapsed = now - this.animationStart;
    const rawT = Math.min(1, elapsed / ANIMATION_DURATION_MS);
    const t = ANIMATION_EASING(rawT);

    this.viewport = {
      ...this.viewport,
      center: {
        x: this.animationFrom.center.x + (this.animationTo.center.x - this.animationFrom.center.x) * t,
        y: this.animationFrom.center.y + (this.animationTo.center.y - this.animationFrom.center.y) * t,
      },
      zoom: this.animationFrom.zoom + (this.animationTo.zoom - this.animationFrom.zoom) * t,
    };
    this.viewport = this.withCenter(this.viewport.center, this.viewport.zoom);

    if (rawT < 1) {
      this.animationFrame = requestAnimationFrame((next) => this.stepAnimation(next));
    } else {
      this.animationFrame = null;
      this.animationFrom = null;
      this.animationTo = null;
      this.animationStart = null;
    }

    this.animationCallback?.();
  }

  cancelAnimation(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
      this.animationFrom = null;
      this.animationTo = null;
      this.animationStart = null;
    }
  }

  pan(delta: ScreenPoint, viewportSize: ViewportSize): InteractionViewport {
    const scale = effectiveScale(this.viewport, viewportSize);
    const moved = {
      ...this.viewport,
      center: {
        x: this.viewport.center.x - delta.x / scale,
        y: this.viewport.center.y - delta.y / scale,
      },
    };
    this.viewport = this.withCenter(moved.center);
    return this.viewport;
  }

  zoom(deltaY: number, anchor: ScreenPoint, viewportSize: ViewportSize): InteractionViewport {
    const delta = normalizeWheelDelta(deltaY);
    if (delta === 0) return this.viewport;

    const beforeAnchor = screenToWorld(anchor, this.viewport, viewportSize);
    const factor = Math.exp(-delta * 0.0012);
    const zoom = clamp(this.viewport.zoom * factor, this.minZoom, this.maxZoom);
    const scaled = { ...this.rebuildViewport(this.viewport.center, zoom), worldBounds: this.viewport.worldBounds };
    const afterAnchor = screenToWorld(anchor, scaled, viewportSize);
    const correction = {
      x: beforeAnchor.x - afterAnchor.x,
      y: beforeAnchor.y - afterAnchor.y,
    };
    this.viewport = this.withCenter({ x: scaled.center.x + correction.x, y: scaled.center.y + correction.y }, zoom);
    return this.viewport;
  }

  focusOn(point: WorldPoint): InteractionViewport {
    this.cancelAnimation();
    this.viewport = this.withCenter(point);
    return this.viewport;
  }

  private normalize(viewport: CanonicalViewport, worldBounds: WorldBounds): InteractionViewport {
    const zoom = clamp(viewport.zoom, this.minZoom, this.maxZoom);
    const center = viewport.center ?? { x: worldBounds.x + worldBounds.width / 2, y: worldBounds.y + worldBounds.height / 2 };
    return freezeInteraction({ ...this.rebuildViewport(center, zoom, viewport.visibleBounds), worldBounds }) as InteractionViewport;
  }

  private withCenter(center: WorldPoint, zoom = this.viewport.zoom): InteractionViewport {
    return freezeInteraction({ ...this.rebuildViewport(clampCenter(center, this.viewport.worldBounds, this.padding), zoom), worldBounds: this.viewport.worldBounds }) as InteractionViewport;
  }

  private rebuildViewport(center: WorldPoint, zoom: number, baseBounds = this.baseVisibleBounds ?? this.viewport.visibleBounds): Omit<InteractionViewport, "worldBounds"> {
    const width = baseBounds.width / zoom;
    const height = baseBounds.height / zoom;
    const visibleBounds = {
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
    };
    return {
      center,
      zoom,
      visibleBounds,
      scale: zoom,
      clippingBounds: visibleBounds,
    };
  }
}

export function screenToWorld(point: ScreenPoint, viewport: InteractionViewport, viewportSize: ViewportSize): WorldPoint {
  const scale = effectiveScale(viewport, viewportSize);
  const offset = viewportOffset(viewport, viewportSize, scale);
  return {
    x: viewport.visibleBounds.x + (point.x - offset.x) / scale,
    y: viewport.visibleBounds.y + (point.y - offset.y) / scale,
  };
}

export function worldToScreen(point: WorldPoint, viewport: InteractionViewport, viewportSize: ViewportSize): ScreenPoint {
  const scale = effectiveScale(viewport, viewportSize);
  const offset = viewportOffset(viewport, viewportSize, scale);
  return {
    x: offset.x + (point.x - viewport.visibleBounds.x) * scale,
    y: offset.y + (point.y - viewport.visibleBounds.y) * scale,
  };
}

export function effectiveScale(viewport: InteractionViewport, viewportSize: ViewportSize): number {
  const scaleX = viewport.visibleBounds.width > 0 ? viewportSize.width / viewport.visibleBounds.width : viewport.scale;
  const scaleY = viewport.visibleBounds.height > 0 ? viewportSize.height / viewport.visibleBounds.height : viewport.scale;
  return Math.max(0.0001, Math.min(scaleX, scaleY));
}

function viewportOffset(viewport: InteractionViewport, viewportSize: ViewportSize, scale = effectiveScale(viewport, viewportSize)): ScreenPoint {
  return {
    x: (viewportSize.width - viewport.visibleBounds.width * scale) / 2,
    y: (viewportSize.height - viewport.visibleBounds.height * scale) / 2,
  };
}

function clampCenter(center: WorldPoint, bounds: WorldBounds, padding: number): WorldPoint {
  return {
    x: clamp(center.x, bounds.x - padding, bounds.x + bounds.width + padding),
    y: clamp(center.y, bounds.y - padding, bounds.y + bounds.height + padding),
  };
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function normalizeWheelDelta(deltaY: number): number {
  if (!Number.isFinite(deltaY) || Math.abs(deltaY) < 0.01) return 0;
  return clamp(deltaY, -480, 480);
}
