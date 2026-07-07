import type { GraphSource, ProjectionKind } from "../graph-foundation/index.ts";
import type { CanvasLike, CanvasRenderingContext2DLike, CanvasRenderResult } from "../visualization-foundation/index.ts";
import type { InteractionSnapshot, InteractionViewport } from "../interaction-layer/index.ts";

export type AtlasApplicationStatus = "idle" | "loading" | "ready" | "empty" | "error" | "destroyed";

export interface AtlasViewportPersistenceState {
  readonly projection: ProjectionKind;
  readonly zoom: number;
  readonly pan: {
    readonly x: number;
    readonly y: number;
  };
}

export interface AtlasViewportStorage {
  load(): AtlasViewportPersistenceState | null;
  save(state: AtlasViewportPersistenceState): void;
}

export interface AtlasCanvasMount {
  readonly canvas: CanvasLike;
  readonly context: CanvasRenderingContext2DLike;
  readonly width: number;
  readonly height: number;
  readonly devicePixelRatio?: number;
  readonly eventTarget?: AtlasCanvasEventTarget;
}

export interface AtlasCanvasEventTarget {
  addEventListener(type: string, listener: EventListener, options?: AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListener, options?: EventListenerOptions): void;
}

export interface AtlasCanvasHost {
  showLoading(message: string): void;
  showError(state: AtlasErrorViewState): void;
  showEmpty(state: AtlasEmptyViewState): void;
  mountCanvas(): AtlasCanvasMount;
  clear(): void;
}

export interface AtlasErrorViewState {
  readonly message: string;
  readonly diagnosticsId: string;
  readonly retry: () => void;
}

export interface AtlasEmptyViewState {
  readonly message: string;
}

export interface AtlasPageControllerOptions {
  readonly host: AtlasCanvasHost;
  readonly graphSourceFactory?: () => GraphSource;
  readonly initialProjection?: ProjectionKind;
  readonly storage?: AtlasViewportStorage;
  readonly diagnostics?: {
    createId(error: unknown): string;
  };
  readonly clock?: () => number;
}

export interface AtlasPageControllerSnapshot {
  readonly status: AtlasApplicationStatus;
  readonly projection: ProjectionKind;
  readonly payloadId: string | null;
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly render: CanvasRenderResult | null;
  readonly interaction: InteractionSnapshot | null;
  readonly diagnosticsId: string | null;
}

export interface AtlasLifecycleResources {
  readonly viewport?: InteractionViewport;
}
