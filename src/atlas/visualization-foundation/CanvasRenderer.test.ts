import assert from "node:assert";
import { describe, test } from "node:test";
import { ProjectionEngine, SnapshotCompiler, createInitialAtlasGraphSource } from "../graph-foundation/index.ts";
import { buildVisualizationPayload } from "./foundation.ts";
import { CanvasRenderer } from "./canvas-renderer.ts";
import type { CanvasLike, CanvasRenderingContext2DLike } from "./canvas-renderer.ts";

const generatedAt = "2026-07-05T00:00:00.000Z";

describe("Atlas canvas renderer MVP", () => {
  test("renders payloads in canonical order without mutating payload", () => {
    const payload = samplePayload();
    const before = JSON.stringify(payload);
    const canvas: CanvasLike = { width: 0, height: 0 };
    const context = createRecordingContext();
    const renderer = new CanvasRenderer(canvas, context, { width: 1024, height: 768, devicePixelRatio: 2 });
    const result = renderer.render(payload);

    assert.strictEqual(canvas.width, 2048);
    assert.strictEqual(canvas.height, 1536);
    assert.strictEqual(result.payloadId, payload.metadata.payloadId);
    assert.strictEqual(JSON.stringify(payload), before);

    const clear = context.operations.indexOf("clearRect");
    const region = context.operations.indexOf("rect");
    const edge = context.operations.indexOf("moveTo");
    const node = context.operations.indexOf("arc");
    const label = context.operations.indexOf("fillText");
    assert.ok(clear >= 0);
    assert.ok(region > clear);
    assert.ok(edge > region);
    assert.ok(node > edge);
    assert.ok(label > node);
  });

  test("performs renderer-local world to canvas conversion", () => {
    const payload = samplePayload();
    const canvas: CanvasLike = { width: 0, height: 0 };
    const context = createRecordingContext();
    const renderer = new CanvasRenderer(canvas, context, { width: 800, height: 600, devicePixelRatio: 1 });
    const first = payload.nodes.find((node) => node.visibility === "visible")!;
    const converted = renderer.worldToCanvas(payload, first.position);
    const expectedScale = Math.min(canvas.width / payload.viewport.visibleBounds.width, canvas.height / payload.viewport.visibleBounds.height);
    const offsetX = (canvas.width - payload.viewport.visibleBounds.width * expectedScale) / 2;
    const offsetY = (canvas.height - payload.viewport.visibleBounds.height * expectedScale) / 2;

    assert.strictEqual(converted.x, offsetX + (first.position.x - payload.viewport.visibleBounds.x) * expectedScale);
    assert.strictEqual(converted.y, offsetY + (first.position.y - payload.viewport.visibleBounds.y) * expectedScale);
  });

  test("consumes LOD and visibility without computing or mutating LOD", () => {
    const payload = samplePayload();
    const context = createRecordingContext();
    const renderer = new CanvasRenderer({ width: 0, height: 0 }, context, { width: 1200, height: 800 });
    const result = renderer.render(payload);

    assert.strictEqual(result.metrics.visibleNodes, payload.nodes.filter((node) => node.visibility === "visible").length);
    assert.strictEqual(result.metrics.visibleEdges, payload.edges.filter((edge) => edge.visibility === "visible").length);
    assert.strictEqual(payload.lod.level, payload.nodes[0]?.lodLevel);
    assert.ok(result.metrics.drawCalls > 0);
  });

  test("renders interaction visual states without mutating payload", () => {
    const payload = samplePayload();
    const before = JSON.stringify(payload);
    const context = createRecordingContext();
    const renderer = new CanvasRenderer({ width: 0, height: 0 }, context, { width: 1200, height: 800 });
    const baseline = renderer.render(payload);
    const selected = payload.nodes.find((node) => node.visibility === "visible")!;

    renderer.setVisualState({ selectedId: selected.entityId, hoveredId: selected.entityId });
    const highlighted = renderer.render(payload);

    assert.strictEqual(JSON.stringify(payload), before);
    assert.ok(highlighted.metrics.drawCalls > baseline.metrics.drawCalls);
  });

  test("rejects invalid viewport payloads at renderer boundary", () => {
    const payload = samplePayload();
    const invalid = { ...payload, viewport: { ...payload.viewport, zoom: 0 } };
    const renderer = new CanvasRenderer({ width: 0, height: 0 }, createRecordingContext(), { width: 100, height: 100 });

    assert.throws(() => renderer.render(invalid), /zoom must be positive/);
  });

  test("debug overlay is optional and renderer-local", () => {
    const payload = samplePayload();
    const normalContext = createRecordingContext();
    const debugContext = createRecordingContext();
    new CanvasRenderer({ width: 0, height: 0 }, normalContext, { width: 900, height: 600 }).render(payload);
    new CanvasRenderer({ width: 0, height: 0 }, debugContext, { width: 900, height: 600, debug: true }).render(payload);

    assert.ok(debugContext.operations.filter((operation) => operation === "fillText").length > normalContext.operations.filter((operation) => operation === "fillText").length);
  });
});

function samplePayload() {
  const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
  const projection = new ProjectionEngine().generate(snapshot, { kind: "topology" });
  return buildVisualizationPayload({ snapshot, projection, layout: "force", generatedAt });
}

function createRecordingContext(): CanvasRenderingContext2DLike & { operations: string[] } {
  const operations: string[] = [];
  return {
    operations,
    fillStyle: "#000000",
    strokeStyle: "#000000",
    globalAlpha: 1,
    lineWidth: 1,
    font: "12px sans-serif",
    letterSpacing: "normal",
    textAlign: "left",
    textBaseline: "top",
    save: () => operations.push("save"),
    restore: () => operations.push("restore"),
    clearRect: () => operations.push("clearRect"),
    beginPath: () => operations.push("beginPath"),
    closePath: () => operations.push("closePath"),
    rect: () => operations.push("rect"),
    arc: () => operations.push("arc"),
    arcTo: () => operations.push("arcTo"),
    moveTo: () => operations.push("moveTo"),
    lineTo: () => operations.push("lineTo"),
    quadraticCurveTo: () => operations.push("quadraticCurveTo"),
    fill: () => operations.push("fill"),
    stroke: () => operations.push("stroke"),
    fillText: () => operations.push("fillText"),
    measureText: (text: string) => ({ width: Math.min(160, text.length * 7) }),
    setLineDash: () => operations.push("setLineDash"),
    translate: () => {},
    rotate: () => {},
  };
}
