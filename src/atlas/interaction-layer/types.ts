import type {
  CanonicalViewport,
  VisualizationPayload,
  VisualEdge,
  VisualNode,
  VisualRegion,
  WorldBounds,
  WorldPoint,
} from "../visualization-foundation/index.ts";

export type InteractionStateName = "Idle" | "Hover" | "Selected" | "Focused" | "Dragging Viewport" | "Zooming";
export type InteractionTargetKind = "node" | "edge" | "region" | "background";
export type InteractionEventType = "NodeSelected" | "SelectionCleared" | "HoverChanged" | "FocusChanged" | "ViewportMoved" | "ViewportZoomed";

export interface ScreenPoint {
  readonly x: number;
  readonly y: number;
}

export interface ViewportSize {
  readonly width: number;
  readonly height: number;
}

export interface InteractionViewport extends CanonicalViewport {
  readonly worldBounds: WorldBounds;
}

export interface CameraControllerOptions {
  readonly minZoom?: number;
  readonly maxZoom?: number;
  readonly viewportPadding?: number;
}

export interface HitTestInput {
  readonly payload: VisualizationPayload;
  readonly viewport: InteractionViewport;
  readonly viewportSize: ViewportSize;
  readonly screenPoint: ScreenPoint;
  readonly tolerance?: number;
}

export type HitTarget =
  | { readonly kind: "node"; readonly id: string; readonly visualId: string; readonly node: VisualNode; readonly distance: number }
  | { readonly kind: "edge"; readonly id: string; readonly edge: VisualEdge; readonly distance: number }
  | { readonly kind: "region"; readonly id: string; readonly region: VisualRegion; readonly distance: number }
  | { readonly kind: "background"; readonly distance: number };

export interface SelectionState {
  readonly selected: HitTarget | null;
  readonly selectedAt: number | null;
}

export interface HoverState {
  readonly hovered: HitTarget | null;
  readonly lastUpdatedAt: number | null;
}

export interface FocusState {
  readonly focused: HitTarget | null;
  readonly focusedAt: number | null;
}

export interface InspectorRelationship {
  readonly edgeId: string;
  readonly source: string;
  readonly target: string;
  readonly relationshipType: string;
  readonly relationshipCategory: string;
  readonly importance: number;
}

export interface InspectorEntity {
  readonly kind: Exclude<InteractionTargetKind, "background">;
  readonly id: string;
  readonly label: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly lineage: readonly string[];
  readonly relationships: readonly InspectorRelationship[];
}

export interface InspectorBridgeSnapshot {
  readonly selected: InspectorEntity | null;
  readonly focused: InspectorEntity | null;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface InteractionMetrics {
  readonly selections: number;
  readonly hoverEvents: number;
  readonly viewportMoves: number;
  readonly zoomCount: number;
  readonly selectionDurationMs: number;
  readonly interactionLatencyMs: number;
  readonly hitTestLatencyMs: number;
  readonly dragLatencyMs: number;
  readonly wheelLatencyMs: number;
  readonly selectionLatencyMs: number;
}

export interface InteractionEventBase {
  readonly type: InteractionEventType;
  readonly timestamp: number;
  readonly state: InteractionStateName;
}

export type InteractionEvent =
  | (InteractionEventBase & { readonly type: "NodeSelected"; readonly target: HitTarget })
  | (InteractionEventBase & { readonly type: "SelectionCleared"; readonly previous: HitTarget | null })
  | (InteractionEventBase & { readonly type: "HoverChanged"; readonly previous: HitTarget | null; readonly current: HitTarget | null })
  | (InteractionEventBase & { readonly type: "FocusChanged"; readonly previous: HitTarget | null; readonly current: HitTarget | null })
  | (InteractionEventBase & { readonly type: "ViewportMoved"; readonly viewport: InteractionViewport })
  | (InteractionEventBase & { readonly type: "ViewportZoomed"; readonly viewport: InteractionViewport });

export interface InteractionSnapshot {
  readonly state: InteractionStateName;
  readonly viewport: InteractionViewport;
  readonly selection: SelectionState;
  readonly hover: HoverState;
  readonly focus: FocusState;
  readonly inspector: InspectorBridgeSnapshot;
  readonly metrics: InteractionMetrics;
}

export interface InteractionControllerOptions {
  readonly viewportSize: ViewportSize;
  readonly camera?: CameraControllerOptions;
  readonly clock?: () => number;
  readonly dragThreshold?: number;
}

export interface InteractionControllerInput {
  readonly payload: VisualizationPayload;
  readonly options: InteractionControllerOptions;
}

export interface PointerInput {
  readonly point: ScreenPoint;
  readonly buttons?: number;
  readonly deltaY?: number;
}

export interface InteractionBenchmarkResult {
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly panLatencyMs: number;
  readonly zoomLatencyMs: number;
  readonly hitTestLatencyMs: number;
  readonly selectionLatencyMs: number;
  readonly estimatedPanFps: number;
  readonly estimatedZoomFps: number;
  readonly interactionOverheadMs: number;
}
