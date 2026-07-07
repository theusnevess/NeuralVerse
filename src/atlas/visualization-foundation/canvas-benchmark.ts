import type { VisualizationPayload } from "./types.ts";
import { buildVisualizationPayload } from "./foundation.ts";
import { createSyntheticBenchmarkData } from "./benchmark.ts";
import { CanvasRenderer, type CanvasLike, type CanvasRenderingContext2DLike } from "./canvas-renderer.ts";

export interface CanvasRendererBenchmarkResult {
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly payloadLoadMs: number;
  readonly sceneUploadMs: number;
  readonly renderTimeMs: number;
  readonly frameTimeMs: number;
  readonly fps: number;
  readonly memoryBytes: number;
  readonly visibleNodes: number;
  readonly visibleEdges: number;
  readonly drawCalls: number;
  readonly redrawCostMs: number;
}

export function benchmarkCanvasRendererPayload(payload: VisualizationPayload, width = 1600, height = 1000): CanvasRendererBenchmarkResult {
  const loadStart = performance.now();
  const canvas: CanvasLike = { width, height };
  const context = createBenchmarkContext();
  const renderer = new CanvasRenderer(canvas, context, { width, height, devicePixelRatio: 1 });
  const afterLoad = performance.now();
  const renderStart = performance.now();
  const result = renderer.render(payload);
  const afterRender = performance.now();
  const redrawStart = performance.now();
  renderer.render(payload);
  const afterRedraw = performance.now();
  return {
    nodeCount: payload.nodes.length,
    edgeCount: payload.edges.length,
    payloadLoadMs: afterLoad - loadStart,
    sceneUploadMs: afterLoad - loadStart,
    renderTimeMs: afterRender - renderStart,
    frameTimeMs: result.metrics.frameTimeMs,
    fps: result.metrics.fps,
    memoryBytes: result.metrics.memoryEstimateBytes,
    visibleNodes: result.metrics.visibleNodes,
    visibleEdges: result.metrics.visibleEdges,
    drawCalls: result.metrics.drawCalls,
    redrawCostMs: afterRedraw - redrawStart,
  };
}

export function benchmarkCanvasRendererScales(scales = [2_000, 10_000, 25_000, 50_000, 100_000]): readonly CanvasRendererBenchmarkResult[] {
  return scales.map((scale) => {
    const payload = createRendererBenchmarkPayload(scale, scale);
    return benchmarkCanvasRendererPayload(payload);
  });
}

function createRendererBenchmarkPayload(nodeCount: number, edgeCount: number): VisualizationPayload {
  const data = createSyntheticBenchmarkData(nodeCount, edgeCount);
  return buildVisualizationPayload({ snapshot: data.snapshot, projection: data.projection, layout: "force", generatedAt: "2026-07-05T00:00:00.000Z" });
}

export function createBenchmarkContext(): CanvasRenderingContext2DLike {
  return {
    fillStyle: "#000000",
    strokeStyle: "#000000",
    globalAlpha: 1,
    lineWidth: 1,
    font: "12px sans-serif",
    letterSpacing: "normal",
    textAlign: "left",
    textBaseline: "top",
    save() {},
    restore() {},
    clearRect() {},
    beginPath() {},
    closePath() {},
    rect() {},
    arc() {},
    arcTo() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    fill() {},
    stroke() {},
    fillText() {},
    measureText(text: string) { return { width: Math.min(160, text.length * 7) }; },
    setLineDash() {},
    translate() {},
    rotate() {},
  };
}
