import { PayloadOnlyRenderer, validateVisualizationPayload } from "./foundation.ts";
import type { LodLevel, VisualizationPayload, VisualEdge, VisualLabel, VisualNode, WorldBounds, WorldPoint } from "./types.ts";

export interface CanvasRendererOptions {
  readonly width: number;
  readonly height: number;
  readonly devicePixelRatio?: number;
  readonly debug?: boolean;
  readonly compact?: boolean;
}

export interface CanvasRendererMetrics {
  readonly frameTimeMs: number;
  readonly fps: number;
  readonly visibleNodes: number;
  readonly visibleEdges: number;
  readonly visibleLabels: number;
  readonly visibleRegions: number;
  readonly visibleCorridors: number;
  readonly labelCollisions: number;
  readonly edgeLabelCollisions: number;
  readonly lodLevel: string;
  readonly zoom: number;
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly drawCalls: number;
  readonly redrawCount: number;
  readonly memoryEstimateBytes: number;
}

export interface CanvasRenderResult {
  readonly rendererId: string;
  readonly payloadId: string;
  readonly metrics: CanvasRendererMetrics;
}

export interface CanvasRendererVisualState {
  readonly hoveredId?: string | null;
  readonly selectedId?: string | null;
  readonly focusedId?: string | null;
  readonly highlightedIds?: readonly string[];
  readonly dimmedIds?: readonly string[];
  readonly suppressedIds?: readonly string[];
  readonly filteredIds?: readonly string[];
}

export interface CanvasLike {
  width: number;
  height: number;
}

export interface CanvasTextMetricsLike {
  readonly width: number;
}

export interface CanvasRenderingContext2DLike {
  fillStyle: string;
  strokeStyle: string;
  globalAlpha: number;
  lineWidth: number;
  font: string;
  letterSpacing: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  save(): void;
  restore(): void;
  clearRect(x: number, y: number, width: number, height: number): void;
  beginPath(): void;
  closePath(): void;
  rect(x: number, y: number, width: number, height: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  fill(): void;
  stroke(): void;
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  measureText(text: string): CanvasTextMetricsLike;
  setLineDash(segments: number[]): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
}

type AtlasGlyphKind =
  | "capital"
  | "landmark"
  | "bridge"
  | "concept"
  | "peripheral";

export class CanvasRenderer extends PayloadOnlyRenderer<CanvasRenderResult> {
  readonly rendererId = "atlas-canvas-renderer-v14";
  readonly rendererKind = "canvas" as const;

  private redrawCount = 0;
  private metrics: CanvasRendererMetrics = emptyMetrics();
  private visualState: CanvasRendererVisualState = {};

  constructor(
    private readonly canvas: CanvasLike,
    private readonly context: CanvasRenderingContext2DLike,
    private readonly options: CanvasRendererOptions,
  ) {
    super();
    this.resize(options.width, options.height, options.devicePixelRatio ?? 1);
  }

  resize(width: number, height: number, devicePixelRatio = this.options.devicePixelRatio ?? 1): void {
    this.canvas.width = Math.max(1, Math.floor(width * devicePixelRatio));
    this.canvas.height = Math.max(1, Math.floor(height * devicePixelRatio));
  }

  render(payload: VisualizationPayload): CanvasRenderResult {
    const start = performance.now();
    validateCanvasPayload(payload);
    const draw = createDrawCounter(this.context);
    const viewport = createViewportTransform(payload, this.canvas.width, this.canvas.height);
    const compact = this.options.compact ?? this.canvas.width <= 720;

    this.beginFrame(payload, draw, compact);
    this.renderCorridors(payload, viewport, draw, compact);
    this.renderRegions(payload, viewport, draw, compact);
    this.renderEdges(payload, viewport, draw, compact);
    this.renderNodes(payload, viewport, draw, compact);
    const labelResult = this.renderLabels(payload, viewport, draw, compact);
    this.renderCompass(payload, viewport, draw, compact);
    if (this.options.debug) this.renderDebugOverlay(payload, viewport, draw);

    this.redrawCount += 1;
    const frameTimeMs = performance.now() - start;
    this.metrics = {
      frameTimeMs,
      fps: frameTimeMs > 0 ? 1000 / frameTimeMs : 0,
      visibleNodes: payload.nodes.filter((node) => node.visibility === "visible").length,
      visibleEdges: payload.edges.filter((edge) => edge.visibility === "visible").length,
      visibleLabels: labelResult.visibleLabels,
      visibleRegions: payload.regions.filter((r) => r.visibility !== "hidden").length,
      visibleCorridors: payload.scene.edges.filter((e) => e.isCorridor && e.visibility === "visible").length,
      labelCollisions: labelResult.labelCollisions,
      edgeLabelCollisions: labelResult.edgeLabelCollisions,
      lodLevel: payload.lod.level,
      zoom: payload.viewport.zoom,
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      drawCalls: draw.count,
      redrawCount: this.redrawCount,
      memoryEstimateBytes: estimatePayloadMemory(payload),
    };

    return { rendererId: this.rendererId, payloadId: payload.metadata.payloadId, metrics: this.metrics };
  }

  getMetrics(): CanvasRendererMetrics {
    return this.metrics;
  }

  setVisualState(state: CanvasRendererVisualState): void {
    const prev = this.visualState;
    if (
      prev.hoveredId === state.hoveredId &&
      prev.selectedId === state.selectedId &&
      prev.focusedId === state.focusedId &&
      arrayShallowEqual(prev.highlightedIds, state.highlightedIds) &&
      arrayShallowEqual(prev.dimmedIds, state.dimmedIds) &&
      arrayShallowEqual(prev.suppressedIds, state.suppressedIds) &&
      arrayShallowEqual(prev.filteredIds, state.filteredIds)
    ) return;
    this.visualState = {
      hoveredId: state.hoveredId ?? null,
      selectedId: state.selectedId ?? null,
      focusedId: state.focusedId ?? null,
      highlightedIds: state.highlightedIds ?? [],
      dimmedIds: state.dimmedIds ?? [],
      suppressedIds: state.suppressedIds ?? [],
      filteredIds: state.filteredIds ?? [],
    };
  }

  worldToCanvas(payload: VisualizationPayload, point: WorldPoint): WorldPoint {
    return createViewportTransform(payload, this.canvas.width, this.canvas.height)(point);
  }

  private beginFrame(payload: VisualizationPayload, draw: DrawCounter, compact: boolean): void {
    draw.call(() => this.context.clearRect(0, 0, this.canvas.width, this.canvas.height));
    renderAtmosphere(this.context, this.canvas.width, this.canvas.height, payload, draw, compact);
  }

  private renderCorridors(_payload: VisualizationPayload, _toCanvas: ViewportTransform, _draw: DrawCounter, _compact: boolean): void {
    // Celestial Atlas: corridors are rendered as regular edges, not separately
  }

  private renderRegions(_payload: VisualizationPayload, _toCanvas: ViewportTransform, _draw: DrawCounter, _compact: boolean): void {
    // Celestial Atlas: regions are defined by topology, not drawn
  }

  private renderEdges(payload: VisualizationPayload, toCanvas: ViewportTransform, draw: DrawCounter, compact: boolean): void {
    const nodes = new Map(payload.nodes.map((node) => [node.entityId, node]));
    for (const edge of payload.scene.edges) {
      if (edge.isCorridor) continue;
      if (edge.visibility !== "visible") continue;
      const source = nodes.get(edge.source);
      const target = nodes.get(edge.target);
      if (!source || !target) continue;
      if (!shouldRenderEdge(edge, payload.lod.level, payload.viewport.zoom, this.canvas.width, this.visualState, compact)) continue;
      renderEdge(this.context, edge, source, target, toCanvas, draw, payload.lod.level, this.visualState);
    }
  }

  private renderNodes(payload: VisualizationPayload, toCanvas: ViewportTransform, draw: DrawCounter, compact: boolean): void {
    for (const node of payload.scene.nodes) {
      if (node.visibility !== "visible") continue;
      if (this.visualState.suppressedIds?.includes(node.entityId)) continue;
      if (!shouldRenderNode(node, payload.lod.level, payload.viewport.zoom, this.canvas.width, this.visualState, compact)) continue;
      renderNode(this.context, node, toCanvas, draw, payload.lod.level, this.visualState, compact);
    }
  }

  private renderLabels(payload: VisualizationPayload, toCanvas: ViewportTransform, draw: DrawCounter, compact: boolean): { visibleLabels: number; labelCollisions: number; edgeLabelCollisions: number } {
    const nodes = new Map(payload.nodes.map((node) => [node.entityId, node]));
    const edges = new Map(payload.edges.map((edge) => [edge.edgeId, edge]));
    const drawn: WorldBounds[] = [];
    let visibleLabels = 0;
    let labelCollisions = 0;
    let edgeLabelCollisions = 0;

    const sortedLabels = [...payload.scene.labels]
      .filter((label) => label.ownerKind !== "region")
      .sort((a, b) => {
        const priorityA = a.ownerKind === "node" ? 200 + (nodes.get(a.ownerId)?.importance ?? 0) * 100 : 100 + (edges.get(a.ownerId)?.importance ?? 0) * 100;
        const priorityB = b.ownerKind === "node" ? 200 + (nodes.get(b.ownerId)?.importance ?? 0) * 100 : 100 + (edges.get(b.ownerId)?.importance ?? 0) * 100;
        return priorityB - priorityA;
      });

    for (const label of sortedLabels) {
      if (label.visibility !== "visible") continue;
      const anchor = labelAnchor(label, nodes, edges);
      if (!anchor) continue;
      const point = toCanvas(anchor);
      const profile = labelProfile(label, nodes, edges, payload.lod.level, payload.viewport.zoom, this.canvas.width, this.visualState, compact);
      if (!profile.visible) continue;
      const box = labelBox(this.context, label.text, point, profile);
      if (!isBoxInsideCanvas(box, this.canvas.width, this.canvas.height)) continue;
      const minDistance = label.ownerKind === "node" ? 6 : 4;
      if (intersectsAnyWithPadding(box, drawn, minDistance)) {
        labelCollisions += 1;
        if (label.ownerKind === "edge") edgeLabelCollisions += 1;
        continue;
      }
      renderLabel(this.context, label, point, draw, profile);
      drawn.push(box);
      visibleLabels += 1;
    }

    return { visibleLabels, labelCollisions, edgeLabelCollisions };
  }

  private renderCompass(payload: VisualizationPayload, _toCanvas: ViewportTransform, draw: DrawCounter, compact: boolean): void {
    // Celestial Atlas: minimal HUD only — no compass rose, no legend panel
    renderMinimalHud(this.context, this.canvas.width, this.canvas.height, payload, draw, compact);
  }

  private renderDebugOverlay(payload: VisualizationPayload, _toCanvas: ViewportTransform, draw: DrawCounter): void {
    // Celestial Atlas: minimal debug overlay
    this.context.save();
    this.context.fillStyle = "rgba(160, 184, 200, 0.88)";
    this.context.font = "11px 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
    this.context.textAlign = "left";
    this.context.textBaseline = "top";
    const lines = [
      `CELESTIAL ATLAS`,
      `lod ${payload.lod.level} zoom ${payload.viewport.zoom.toFixed(2)}`,
      `stars ${this.metrics.visibleNodes} corridors ${this.metrics.visibleEdges}`,
      `labels ${this.metrics.visibleLabels} collisions ${this.metrics.labelCollisions}`,
      `fps ${this.metrics.fps.toFixed(1)} draw ${this.metrics.drawCalls}`,
    ];
    for (let index = 0; index < lines.length; index += 1) {
      draw.call(() => this.context.fillText(lines[index]!, 8, 8 + index * 13));
    }
    this.context.restore();
  }
}

type ViewportTransform = (point: WorldPoint) => WorldPoint;

interface DrawCounter {
  count: number;
  call(action: () => void): void;
}

function createDrawCounter(context: CanvasRenderingContext2DLike): DrawCounter {
  return {
    count: 0,
    call(action) {
      action();
      this.count += 1;
    },
  };
}

function createViewportTransform(payload: VisualizationPayload, width: number, height: number): ViewportTransform {
  const { visibleBounds } = payload.viewport;
  const scaleX = visibleBounds.width > 0 ? width / visibleBounds.width : payload.viewport.scale;
  const scaleY = visibleBounds.height > 0 ? height / visibleBounds.height : payload.viewport.scale;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (width - visibleBounds.width * scale) / 2;
  const offsetY = (height - visibleBounds.height * scale) / 2;
  return (point) => ({ x: offsetX + (point.x - visibleBounds.x) * scale, y: offsetY + (point.y - visibleBounds.y) * scale });
}

function renderAtmosphere(context: CanvasRenderingContext2DLike, width: number, height: number, _payload: VisualizationPayload, draw: DrawCounter, compact: boolean): void {
  context.save();
  context.globalAlpha = 1;
  context.fillStyle = "#040810";
  context.setLineDash([]);
  context.beginPath();
  context.rect(0, 0, width, height);
  draw.call(() => context.fill());

  // Minimal calibration grid — astronomical chart style
  context.globalAlpha = compact ? 0.002 : 0.003;
  context.strokeStyle = "#0c1824";
  context.lineWidth = 0.25;
  const step = Math.max(120, Math.min(width, height) / 6);
  for (let x = step; x < width; x += step) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    draw.call(() => context.stroke());
  }
  for (let y = step; y < height; y += step) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    draw.call(() => context.stroke());
  }

  // Subtle calibration ticks at margins
  context.globalAlpha = compact ? 0.015 : 0.025;
  context.strokeStyle = "#1a2a3a";
  context.lineWidth = 0.4;
  const tickSize = 4;
  const margin = 8;
  for (let x = step; x < width; x += step) {
    context.beginPath();
    context.moveTo(x, margin);
    context.lineTo(x, margin + tickSize);
    context.moveTo(x, height - margin);
    context.lineTo(x, height - margin - tickSize);
    draw.call(() => context.stroke());
  }
  for (let y = step; y < height; y += step) {
    context.beginPath();
    context.moveTo(margin, y);
    context.lineTo(margin + tickSize, y);
    context.moveTo(width - margin, y);
    context.lineTo(width - margin - tickSize, y);
    draw.call(() => context.stroke());
  }

  // Faint coordinate references at corners
  if (!compact) {
    context.globalAlpha = 0.04;
    context.fillStyle = "#1a2a3a";
    context.font = "7px 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
    context.textAlign = "left";
    context.textBaseline = "top";
    const coordStep = Math.round(step);
    draw.call(() => context.fillText(`0,0`, margin + 2, margin + 2));
    context.textAlign = "right";
    draw.call(() => context.fillText(`${width},${height}`, width - margin - 2, height - margin - 10));
  }

  context.restore();
}

// renderContinent removed — Celestial Atlas: regions defined by topology

// renderCorridor removed — Celestial Atlas: all edges rendered uniformly

function renderEdge(
  context: CanvasRenderingContext2DLike,
  edge: VisualEdge,
  source: VisualNode,
  target: VisualNode,
  toCanvas: ViewportTransform,
  draw: DrawCounter,
  lod: LodLevel,
  visualState: CanvasRendererVisualState,
): void {
  // Celestial Atlas: stellar corridors — clean, visible connections
  const start = toCanvas(source.position);
  const end = toCanvas(target.position);
  const control = controlPoint(start, end, edge.curvatureHint);
  const selectedContext = isActive(edge.source, visualState) || isActive(edge.target, visualState);
  const dimmed = isDimmed(edge.source, visualState) || isDimmed(edge.target, visualState);
  context.save();
  context.globalAlpha = edgeOpacity(edge, lod, selectedContext, dimmed);
  context.strokeStyle = categoryColor(edge.relationshipCategory);
  context.lineWidth = edgeWidth(edge, lod, selectedContext);
  // Celestial Atlas: no dash patterns — solid lines for clarity
  context.setLineDash([]);
  context.beginPath();
  context.moveTo(start.x, start.y);
  if (Math.abs(edge.curvatureHint) > 0.001) context.quadraticCurveTo(control.x, control.y, end.x, end.y);
  else context.lineTo(end.x, end.y);
  draw.call(() => context.stroke());
  context.restore();
}

function renderNode(
  context: CanvasRenderingContext2DLike,
  node: VisualNode,
  toCanvas: ViewportTransform,
  draw: DrawCounter,
  lod: LodLevel,
  visualState: CanvasRendererVisualState,
  compact: boolean,
): void {
  const point = toCanvas(node.position);
  const active = isActive(node.entityId, visualState);
  const hovered = visualState.hoveredId === node.entityId;
  const dimmed = isDimmed(node.entityId, visualState);
  const glyph = atlasGlyphKind(node);
  const radius = nodeRadius(node, lod, active || hovered);

  context.save();
  context.globalAlpha = nodeOpacity(node, lod, dimmed);
  context.strokeStyle = glyphStroke(node, glyph, active, hovered);
  context.fillStyle = glyphFill(glyph, active);
  context.lineWidth = nodeStrokeWidth(node, active, hovered, glyph);
  context.setLineDash([]);

  renderAtlasGlyph(context, node, point, radius, glyph, active, hovered, dimmed, draw);

  context.restore();
}

function atlasGlyphKind(node: VisualNode): AtlasGlyphKind {
  if (node.isHub && node.importance > 0.9) return "capital";
  if (node.isHub || node.importance > 0.86) return "landmark";
  if (node.isBridge) return "bridge";
  if (node.family === "context" || node.importance < 0.5) return "peripheral";
  return "concept";
}

function renderAtlasGlyph(
  context: CanvasRenderingContext2DLike,
  node: VisualNode,
  center: WorldPoint,
  radius: number,
  glyph: AtlasGlyphKind,
  active: boolean,
  hovered: boolean,
  _dimmed: boolean,
  draw: DrawCounter,
): void {
  if (glyph === "capital") {
    drawCore(context, center, radius * 0.32, active, node, draw);
    drawRing(context, center, radius, draw);
    return;
  }

  if (glyph === "landmark") {
    drawCore(context, center, radius * 0.4, active, node, draw);
    drawRing(context, center, radius, draw);
    return;
  }

  if (glyph === "bridge") {
    drawDiamond(context, center, radius, false, draw);
    return;
  }

  if (glyph === "peripheral") {
    drawCore(context, center, radius * 0.35, active, node, draw);
    return;
  }

  drawRing(context, center, radius, draw);
  if (active || hovered) drawCore(context, center, radius * 0.15, active, node, draw);
}

function drawRing(context: CanvasRenderingContext2DLike, center: WorldPoint, radius: number, draw: DrawCounter): void {
  context.beginPath();
  context.arc(center.x, center.y, radius, 0, Math.PI * 2);
  draw.call(() => context.stroke());
}

function drawCore(context: CanvasRenderingContext2DLike, center: WorldPoint, radius: number, active: boolean, node: VisualNode, draw: DrawCounter): void {
  const previousAlpha = context.globalAlpha;
  context.globalAlpha = Math.min(0.72, previousAlpha + (active ? 0.12 : 0.02));
  context.fillStyle = glyphCoreColor(node, active);
  context.beginPath();
  context.arc(center.x, center.y, radius, 0, Math.PI * 2);
  draw.call(() => context.fill());
  context.globalAlpha = previousAlpha;
}

function drawDiamond(context: CanvasRenderingContext2DLike, center: WorldPoint, radius: number, fill: boolean, draw: DrawCounter): void {
  context.beginPath();
  context.moveTo(center.x, center.y - radius);
  context.lineTo(center.x + radius * 0.72, center.y);
  context.lineTo(center.x, center.y + radius);
  context.lineTo(center.x - radius * 0.72, center.y);
  context.closePath();
  if (fill) draw.call(() => context.fill());
  draw.call(() => context.stroke());
}

interface LabelProfile {
  readonly visible: boolean;
  readonly opacity: number;
  readonly fontSize: number;
  readonly maxWidth: number;
  readonly offsetY: number;
  readonly height: number;
  readonly color: string;
  readonly weight: number;
  readonly letterSpacing: number;
  readonly uppercase: boolean;
}

function renderLabel(context: CanvasRenderingContext2DLike, label: VisualLabel, point: WorldPoint, draw: DrawCounter, profile: LabelProfile): void {
  context.save();
  context.globalAlpha = profile.opacity;
  context.fillStyle = profile.color;
  const fontKerning = profile.letterSpacing > 0 ? `${profile.letterSpacing}px ` : "";
  const fontFamily = profile.uppercase ? "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace" : "'IBM Plex Sans', 'Inter', system-ui, sans-serif";
  context.font = `${profile.weight} ${fontKerning}${profile.fontSize}px ${fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const text = profile.uppercase ? label.text.toUpperCase() : label.text;
  if (profile.uppercase) {
    const haloAlpha = Math.min(0.45, profile.opacity * 0.4);
    context.globalAlpha = haloAlpha;
    context.fillStyle = "#020408";
    for (const [dx, dy] of [[-0.5, 0], [0.5, 0], [0, -0.5], [0, 0.5]] as const) {
      draw.call(() => context.fillText(text, point.x + dx, point.y + profile.offsetY + dy, profile.maxWidth));
    }
    context.globalAlpha = profile.opacity;
    context.fillStyle = profile.color;
  }
  draw.call(() => context.fillText(text, point.x, point.y + profile.offsetY, profile.maxWidth));
  context.restore();
}

function validateCanvasPayload(payload: VisualizationPayload): void {
  validateVisualizationPayload(payload);
  if (!Number.isFinite(payload.viewport.zoom) || payload.viewport.zoom <= 0) throw new Error("Canvas renderer viewport zoom must be positive.");
  if (payload.viewport.visibleBounds.width < 0 || payload.viewport.visibleBounds.height < 0) throw new Error("Canvas renderer viewport bounds must be non-negative.");
  for (const node of payload.nodes) {
    if (!Number.isFinite(node.position.x) || !Number.isFinite(node.position.y)) throw new Error(`Invalid visual node position: ${node.entityId}`);
    if (node.radius < 0) throw new Error(`Invalid visual node radius: ${node.entityId}`);
  }
}

function labelAnchor(label: VisualLabel, nodes: Map<string, VisualNode>, edges: Map<string, VisualEdge>): WorldPoint | undefined {
  if (label.ownerKind === "node") return nodes.get(label.ownerId)?.position;
  const edge = edges.get(label.ownerId);
  if (!edge) return undefined;
  const source = nodes.get(edge.source);
  const target = nodes.get(edge.target);
  if (!source || !target) return undefined;
  return { x: (source.position.x + target.position.x) / 2, y: (source.position.y + target.position.y) / 2 };
}

function labelProfile(
  label: VisualLabel,
  nodes: Map<string, VisualNode>,
  edges: Map<string, VisualEdge>,
  lod: LodLevel,
  zoom: number,
  canvasWidth: number,
  visualState: CanvasRendererVisualState,
  compact: boolean,
): LabelProfile {
  const active = isActive(label.ownerId, visualState);
  if (label.ownerKind === "edge") {
    if (compact) return { visible: false, opacity: 0, fontSize: 0, maxWidth: 0, offsetY: 0, height: 0, color: "#000", weight: 0, letterSpacing: 0, uppercase: false };
    const edge = edges.get(label.ownerId);
    const important = Boolean(edge && edge.importance > edgeLabelThreshold(lod, zoom));
    const importance = edge?.importance ?? 0;
    return {
      visible: active || important,
      opacity: active ? 0.55 : importance > 0.85 ? 0.22 : 0.12,
      fontSize: active ? 9.5 : 8,
      maxWidth: 110,
      offsetY: -8,
      height: 10,
      color: active ? "#a0c0d0" : "#5a7080",
      weight: active ? 480 : 400,
      letterSpacing: 0.15,
      uppercase: false,
    };
  }

  const node = nodes.get(label.ownerId);
  const importance = node?.importance ?? 0;
  const isLandmark = node?.isHub || importance > 0.82;
  const isBridge = node?.isBridge;
  const visible = Boolean(node && (active || (isCompactOverview(zoom, canvasWidth) && isLandmark) || importance >= nodeLabelThreshold(lod, zoom) || (isBridge && zoom > 1.4 && !compact)));
  if (compact) {
    return {
      visible: visible && Boolean(node?.isHub),
      opacity: 0.78,
      fontSize: 10,
      maxWidth: 96,
      offsetY: -(nodeRadius(node, lod, active) + 7),
      height: 12,
      color: active ? "#e0e8f0" : "#a0b8c8",
      weight: 600,
      letterSpacing: 0.3,
      uppercase: false,
    };
  }
  if (node?.isHub) {
    return {
      visible,
      opacity: active ? 0.78 : 0.45,
      fontSize: active ? 11 : 10,
      maxWidth: active ? 170 : 140,
      offsetY: active ? -(nodeRadius(node, lod, true) + 14) : -(nodeRadius(node, lod, false) + 11),
      height: active ? 16 : 14,
      color: active ? "#e0f0ff" : "#a0c0d0",
      weight: 600,
      letterSpacing: 0.3,
      uppercase: false,
    };
  }
  if (isBridge) {
    return {
      visible,
      opacity: active ? 0.65 : 0.30,
      fontSize: active ? 10 : 9,
      maxWidth: active ? 150 : 130,
      offsetY: active ? -(nodeRadius(node, lod, true) + 12) : -(nodeRadius(node, lod, false) + 9),
      height: active ? 14 : 12,
      color: active ? "#d8c878" : "#a09050",
      weight: 520,
      letterSpacing: 0.2,
      uppercase: false,
    };
  }
  return {
    visible,
    opacity: active ? 0.72 : importance > 0.75 ? 0.20 : importance > 0.55 ? 0.14 : 0.08,
    fontSize: active ? 9.5 : importance > 0.75 ? 8.5 : 7.5,
    maxWidth: active ? 130 : importance > 0.75 ? 100 : 70,
    offsetY: active ? -(nodeRadius(node, lod, true) + 8) : -(nodeRadius(node, lod, false) + 6),
    height: active ? 12 : 9,
    color: active ? "#d0e8f0" : importance > 0.75 ? "#8a9ca8" : "#5a6a78",
    weight: active ? 480 : importance > 0.75 ? 440 : 400,
    letterSpacing: importance > 0.75 ? 0.08 : 0.04,
    uppercase: false,
  };
}

function labelBox(context: CanvasRenderingContext2DLike, text: string, point: WorldPoint, profile: LabelProfile): WorldBounds {
  context.save();
  const fontKerning = profile.letterSpacing > 0 ? `${profile.letterSpacing}px ` : "";
  const fontFamily = profile.uppercase ? "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace" : "'IBM Plex Sans', 'Inter', system-ui, sans-serif";
  context.font = `${profile.weight} ${fontKerning}${profile.fontSize}px ${fontFamily}`;
  const width = Math.min(profile.maxWidth, Math.max(24, context.measureText(profile.uppercase ? text.toUpperCase() : text).width + 10));
  context.restore();
  return { x: point.x - width / 2, y: point.y + profile.offsetY - profile.height / 2, width, height: profile.height };
}

function controlPoint(start: WorldPoint, end: WorldPoint, curvature: number): WorldPoint {
  const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return { x: mid.x - dy * curvature, y: mid.y + dx * curvature };
}

function pseudoNoise(seed: number, index: number): number {
  const value = Math.sin(seed * 0.0001 + index * 12.9898) * 43758.5453;
  return ((value - Math.floor(value)) - 0.5) * 2;
}

function pseudoUnit(seed: number, index: number): number {
  const value = Math.sin(seed * 0.00013 + index * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function midpoint(a: WorldPoint, b: WorldPoint): WorldPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function glyphFill(glyph: AtlasGlyphKind, active: boolean): string {
  if (glyph === "capital") return active ? "#0a1014" : "#050a0e";
  if (active && glyph === "landmark") return "rgba(6, 12, 18, 0.15)";
  if (glyph === "bridge") return "rgba(0, 0, 0, 0)";
  if (glyph === "peripheral") return "rgba(0, 0, 0, 0)";
  return "rgba(0, 0, 0, 0)";
}

function glyphStroke(node: VisualNode, glyph: AtlasGlyphKind, active: boolean, hovered: boolean): string {
  if (active) return "#d0e8f8";
  if (hovered && glyph === "bridge") return "#c8b868";
  if (hovered) return "#68a8c0";
  if (glyph === "capital") return "#4890a8";
  if (glyph === "landmark") return "#3a7888";
  if (glyph === "bridge") return "#8a7a40";
  if (glyph === "peripheral") return "#4a6070";
  return familyNodeStroke(node);
}

function glyphCoreColor(node: VisualNode, active: boolean): string {
  if (active) return "#e0f0ff";
  if (node.family === "scientific") return "#2a6a7a";
  if (node.family === "engineering") return "#2a7868";
  if (node.family === "evidence") return "#7a6a28";
  return "#5a4a6a";
}

function familyNodeStroke(node: VisualNode): string {
  // Celestial Atlas: distinct family colors for constellation identity
  if (node.family === "scientific") return "#408898";
  if (node.family === "engineering") return "#408878";
  if (node.family === "evidence") return "#8a7a38";
  return "#6a5a7a";
}

function shouldRenderCorridor(edge: VisualEdge, lod: LodLevel, zoom: number, canvasWidth: number, visualState: CanvasRendererVisualState): boolean {
  // Celestial Atlas: corridors are now regular edges — kept for compatibility
  if (isActive(edge.source, visualState) || isActive(edge.target, visualState)) return true;
  if (edge.visibility !== "visible") return false;
  if (canvasWidth <= 720) return edge.importance > 0.90;
  if (isCompactOverview(zoom, canvasWidth)) return edge.importance > 0.82;
  if (lod === "LOD0") return edge.importance > 0.82;
  if (lod === "LOD1") return edge.importance > 0.76;
  return edge.importance > 0.62;
}

function corridorFadeFactor(edge: VisualEdge, lod: LodLevel, zoom: number, canvasWidth: number): number {
  // Celestial Atlas: corridors are now regular edges — kept for compatibility
  if (canvasWidth <= 720) return smoothStep(edge.importance, 0.88, 0.92);
  if (isCompactOverview(zoom, canvasWidth)) return smoothStep(edge.importance, 0.80, 0.84);
  if (lod === "LOD0") return smoothStep(edge.importance, 0.76, 0.80);
  if (lod === "LOD1") return smoothStep(edge.importance, 0.72, 0.76);
  return smoothStep(edge.importance, 0.56, 0.62);
}

function shouldRenderEdge(edge: VisualEdge, lod: LodLevel, zoom: number, canvasWidth: number, visualState: CanvasRendererVisualState, compact: boolean): boolean {
  // Celestial Atlas: edges define topology — render more of them
  if (isActive(edge.source, visualState) || isActive(edge.target, visualState)) return true;
  if (edge.visibility !== "visible") return false;
  if (compact) return edge.importance > 0.88;
  if (lod === "LOD0") return edge.importance > 0.80;
  if (lod === "LOD1") return edge.importance > 0.72;
  return edge.importance >= edgeVisibilityThreshold(lod, zoom, canvasWidth);
}

function edgeFadeFactor(edge: VisualEdge, lod: LodLevel, zoom: number, canvasWidth: number, compact: boolean): number {
  // Celestial Atlas: softer fade — edges should be visible
  if (compact) return smoothStep(edge.importance, 0.86, 0.90);
  const threshold = edgeVisibilityThreshold(lod, zoom, canvasWidth);
  return smoothStep(edge.importance, threshold - 0.06, threshold + 0.04);
}

function shouldRenderNode(node: VisualNode, lod: LodLevel, zoom: number, canvasWidth: number, visualState: CanvasRendererVisualState, compact: boolean): boolean {
  // Celestial Atlas: render more nodes — stars are the atlas
  if (isActive(node.entityId, visualState)) return true;
  if (compact) return node.isHub || node.isBridge || node.importance > 0.78;
  if (isCompactOverview(zoom, canvasWidth) && node.importance < 0.82 && !node.isHub && !node.isBridge) return false;
  if (lod === "LOD0") return node.isHub || node.isBridge || node.importance > 0.48;
  if (lod === "LOD1") return node.isHub || node.isBridge || node.importance > 0.38;
  return true;
}

function nodeFadeFactor(node: VisualNode, lod: LodLevel, zoom: number, canvasWidth: number, compact: boolean): number {
  // Celestial Atlas: softer fade — nodes should be visible
  if (compact) {
    if (node.isHub || node.isBridge) return 1;
    return smoothStep(node.importance, 0.76, 0.80);
  }
  if (isCompactOverview(zoom, canvasWidth)) {
    if (node.isHub || node.isBridge) return 1;
    return smoothStep(node.importance, 0.80, 0.84);
  }
  if (lod === "LOD0") return smoothStep(node.importance, 0.36, 0.42);
  return 1;
}

function edgeVisibilityThreshold(lod: LodLevel, zoom: number, canvasWidth: number): number {
  // Celestial Atlas: lower thresholds — edges define geography
  if (isCompactOverview(zoom, canvasWidth)) return 0.88;
  if (zoom > 3) return 0.82;
  if (zoom > 2.2) return 0.76;
  if (lod === "LOD0") return 0.70;
  if (lod === "LOD1") return 0.80;
  if (lod === "LOD2") return 0.60;
  if (lod === "LOD3") return 0.48;
  return 0.76;
}

function isHighZoom(zoom: number): boolean {
  return zoom > 2.2;
}

function highZoomFadeFactor(zoom: number): number {
  if (zoom <= 2.2) return 1;
  return clamp(1 - (zoom - 2.2) * 0.3, 0.3, 1);
}

function isCompactOverview(zoom: number, canvasWidth: number): boolean {
  return canvasWidth <= 720 && zoom <= 1.2;
}

function smoothStep(value: number, edge0: number, edge1: number): number {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0 || 1)));
  return t * t * (3 - 2 * t);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function edgeOpacity(edge: VisualEdge, lod: LodLevel, selectedContext: boolean, dimmed: boolean): number {
  // Celestial Atlas: edges define topology — more visible
  if (dimmed) return 0.03;
  const importance = edge.importance;
  if (selectedContext) {
    if (importance > 0.85) return 0.75;
    if (importance > 0.7) return 0.55;
    return 0.38;
  }
  if (lod === "LOD0") {
    if (importance > 0.9) return 0.18;
    if (importance > 0.82) return 0.12;
    return 0.06;
  }
  if (lod === "LOD1") {
    if (importance > 0.88) return 0.22;
    if (importance > 0.78) return 0.14;
    return 0.08;
  }
  if (importance > 0.85) return 0.32;
  if (importance > 0.7) return 0.22;
  if (importance > 0.6) return 0.14;
  return 0.08;
}

function edgeWidth(edge: VisualEdge, lod: LodLevel, selectedContext: boolean): number {
  // Celestial Atlas: stellar corridors — visible connections
  const importance = edge.importance;
  if (selectedContext) {
    if (importance > 0.85) return 2.2;
    if (importance > 0.7) return 1.7;
    return 1.2;
  }
  const lodMultiplier = lod === "LOD0" ? 0.4 : lod === "LOD1" ? 0.6 : lod === "LOD2" ? 0.85 : 1;
  if (importance > 0.85) return (1.5 + importance * 0.6) * lodMultiplier;
  if (importance > 0.7) return (1.2 + importance * 0.5) * lodMultiplier;
  if (importance > 0.6) return (0.9 + importance * 0.4) * lodMultiplier;
  return Math.max(0.4, (0.6 + importance * 0.3) * lodMultiplier);
}

function corridorOpacity(_lod: LodLevel, selectedContext: boolean, dimmed: boolean): number {
  // Celestial Atlas: corridors are now regular edges — kept for compatibility
  if (dimmed) return 0.02;
  if (selectedContext) return 0.25;
  return 0.08;
}

function corridorWidth(_lod: LodLevel, selectedContext: boolean): number {
  // Celestial Atlas: corridors are now regular edges — kept for compatibility
  if (selectedContext) return 0.7;
  return 0.3;
}

function nodeRadius(node: VisualNode | undefined, lod: LodLevel, active: boolean): number {
  if (!node) return 4;
  const glyph = atlasGlyphKind(node);
  const familyBoost = node.family === "context" ? -0.4 : node.family === "evidence" ? -0.06 : 0.1;
  const lodScale = lod === "LOD0" ? 0.72 : lod === "LOD1" ? 0.84 : lod === "LOD2" ? 1 : 1.12;
  const importanceScale = node.importance > 0.85 ? 1.15 : node.importance > 0.7 ? 1.05 : node.importance > 0.5 ? 0.9 : 0.76;
  const base = (node.radius + familyBoost) * lodScale * importanceScale + (active ? 0.6 : 0);
  if (glyph === "capital") return Math.max(6.0, (base + 4.2) * 0.82);
  if (glyph === "landmark") return Math.max(4.8, (base + 2.8) * 0.78);
  if (glyph === "bridge") return Math.max(2.4, base * 0.48);
  if (glyph === "peripheral") return Math.max(1.8, base * 0.24);
  return Math.max(2.6, base * 0.32);
}

function nodeOpacity(node: VisualNode, lod: LodLevel, dimmed: boolean): number {
  if (dimmed) return 0.08;
  const importance = node.importance;
  const glyph = atlasGlyphKind(node);
  if (glyph === "capital") {
    if (lod === "LOD0") return 0.85;
    if (lod === "LOD1") return 0.90;
    return 0.95;
  }
  if (glyph === "landmark") {
    if (lod === "LOD0") return 0.80;
    if (lod === "LOD1") return 0.85;
    return 0.90;
  }
  if (glyph === "bridge") {
    if (lod === "LOD0") return 0.52;
    if (lod === "LOD1") return 0.62;
    return 0.72;
  }
  if (glyph === "peripheral") {
    if (lod === "LOD0") return 0.12;
    if (lod === "LOD1") return 0.18;
    return 0.25;
  }
  if (importance > 0.82) {
    if (lod === "LOD0") return 0.52;
    return 0.62;
  }
  if (importance > 0.65) {
    if (lod === "LOD0") return 0.38;
    if (lod === "LOD1") return 0.45;
    return 0.52;
  }
  if (lod === "LOD0") return 0.22;
  if (lod === "LOD1") return 0.30;
  return 0.38;
}

function nodeStrokeWidth(_node: VisualNode, active: boolean, hovered: boolean, glyph: AtlasGlyphKind): number {
  if (active) return glyph === "capital" ? 1.2 : glyph === "landmark" ? 1.0 : 0.7;
  if (hovered) return glyph === "capital" ? 1.1 : glyph === "landmark" ? 0.9 : 0.6;
  if (glyph === "capital") return 0.9;
  if (glyph === "landmark") return 0.7;
  if (glyph === "bridge") return 0.5;
  if (glyph === "peripheral") return 0.25;
  return 0.4;
}

function nodeLabelThreshold(lod: LodLevel, zoom: number): number {
  // Celestial Atlas: show labels at lower thresholds — stars need names
  const zoomAdjustment = zoom > 2.4 ? -0.28 : zoom > 1.6 ? -0.18 : zoom > 1.15 ? -0.06 : zoom < 0.95 ? 0.12 : 0;
  const base = lod === "LOD0" ? 0.94 : lod === "LOD1" ? 0.92 : lod === "LOD2" ? 0.80 : lod === "LOD3" ? 0.62 : 0.48;
  return Math.max(0.12, base + zoomAdjustment);
}

function edgeLabelThreshold(lod: LodLevel, zoom: number): number {
  // Celestial Atlas: show more edge labels — relationships matter
  const base = lod === "LOD0" ? 0.96 : lod === "LOD1" ? 0.94 : 0.84;
  return zoom > 2 ? base - 0.14 : base;
}

function isActive(id: string, visualState: CanvasRendererVisualState): boolean {
  return visualState.selectedId === id || visualState.focusedId === id || visualState.hoveredId === id || Boolean(visualState.highlightedIds?.includes(id));
}

function isDimmed(id: string, visualState: CanvasRendererVisualState): boolean {
  if (visualState.dimmedIds?.includes(id)) return true;
  if (visualState.filteredIds?.length) return !visualState.filteredIds.includes(id);
  return false;
}

function intersectsAny(box: WorldBounds, boxes: readonly WorldBounds[]): boolean {
  return boxes.some((other) => box.x < other.x + other.width && box.x + box.width > other.x && box.y < other.y + other.height && box.y + box.height > other.y);
}

function intersectsAnyWithPadding(box: WorldBounds, boxes: readonly WorldBounds[], padding: number): boolean {
  return boxes.some((other) =>
    box.x - padding < other.x + other.width + padding &&
    box.x + box.width + padding > other.x - padding &&
    box.y - padding < other.y + other.height + padding &&
    box.y + box.height + padding > other.y - padding
  );
}

function isBoxInsideCanvas(box: WorldBounds, width: number, height: number): boolean {
  return box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height;
}

function categoryColor(category: VisualEdge["relationshipCategory"]): string {
  // Celestial Atlas: stellar corridor colors — subtle but distinct
  const colors: Record<VisualEdge["relationshipCategory"], string> = {
    epistemic: "#5a7a8a",
    structural: "#508898",
    pedagogical: "#408878",
    engineering: "#409080",
    evidentiary: "#9a8a48",
    temporal: "#6a5a78",
    inferential: "#409080",
  };
  return colors[category];
}

function categoryDash(_category: VisualEdge["relationshipCategory"], _importance: number): number[] {
  // Celestial Atlas: no dash patterns — solid lines for clarity
  return [];
}

// renderCompassRose removed — Celestial Atlas: minimal HUD replaces compass

// renderCartographicLegend removed — Celestial Atlas: no legend panel

// renderCompactLegend removed — Celestial Atlas: no legend panel

function renderMinimalHud(
  context: CanvasRenderingContext2DLike,
  width: number,
  height: number,
  payload: VisualizationPayload,
  draw: DrawCounter,
  compact: boolean,
): void {
  const margin = 10;
  context.save();

  // Top-left: Atlas identifier
  context.globalAlpha = 0.12;
  context.fillStyle = "#4a6070";
  context.font = "7px 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
  context.textAlign = "left";
  context.textBaseline = "top";
  const snapshotTag = payload.metadata.snapshotId.slice(0, 6).toUpperCase();
  draw.call(() => context.fillText(`ATLAS · ${snapshotTag}`, margin, margin));

  // Top-right: LOD level
  if (!compact) {
    context.textAlign = "right";
    context.globalAlpha = 0.08;
    draw.call(() => context.fillText(payload.lod.level, width - margin, margin));
  }

  // Bottom-left: node count (scientific chart style)
  if (!compact) {
    context.textAlign = "left";
    context.textBaseline = "bottom";
    context.globalAlpha = 0.06;
    draw.call(() => context.fillText(`${payload.nodes.length} nodes · ${payload.edges.length} edges`, margin, height - margin));
  }

  context.restore();
}

function roundedRect(context: CanvasRenderingContext2DLike, x: number, y: number, w: number, h: number, r: number): void {
  context.moveTo(x + r, y);
  context.lineTo(x + w - r, y);
  context.arcTo(x + w, y, x + w, y + r, r);
  context.lineTo(x + w, y + h - r);
  context.arcTo(x + w, y + h, x + w - r, y + h, r);
  context.lineTo(x + r, y + h);
  context.arcTo(x, y + h, x, y + h - r, r);
  context.lineTo(x, y + r);
  context.arcTo(x, y, x + r, y, r);
  context.closePath();
}

function estimatePayloadMemory(payload: VisualizationPayload): number {
  return payload.nodes.length * 248 + payload.edges.length * 152 + payload.labels.length * 104 + payload.regions.length * 220;
}

function emptyMetrics(): CanvasRendererMetrics {
  return { frameTimeMs: 0, fps: 0, visibleNodes: 0, visibleEdges: 0, visibleLabels: 0, visibleRegions: 0, visibleCorridors: 0, labelCollisions: 0, edgeLabelCollisions: 0, lodLevel: "LOD0", zoom: 1, canvasWidth: 0, canvasHeight: 0, drawCalls: 0, redrawCount: 0, memoryEstimateBytes: 0 };
}

function arrayShallowEqual(a: readonly string[] | undefined, b: readonly string[] | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
