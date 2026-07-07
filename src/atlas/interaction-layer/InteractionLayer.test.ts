import assert from "node:assert";
import { describe, test } from "node:test";
import { ProjectionEngine, SnapshotCompiler, createInitialAtlasGraphSource } from "../graph-foundation/index.ts";
import { buildVisualizationPayload } from "../visualization-foundation/foundation.ts";
import type { VisualizationPayload, VisualNode } from "../visualization-foundation/index.ts";
import { screenToWorld, worldToScreen } from "./camera-controller.ts";
import { benchmarkAtlasInteractionScale } from "./benchmark.ts";
import { createAtlasInteractionController } from "./interaction-controller.ts";
import { hitTest } from "./hit-testing.ts";
import { synchronizeViewport } from "./viewport-synchronization.ts";

const generatedAt = "2026-07-05T00:00:00.000Z";
const viewportSize = { width: 1200, height: 800 };

describe("NV-700 Phase 5 Atlas interaction layer", () => {
  test("hit testing resolves nodes, regions, and background from Visualization Payload only", () => {
    const payload = samplePayload();
    const controller = createAtlasInteractionController({ payload, options: { viewportSize } });
    const node = firstVisibleNode(payload);
    const nodePoint = worldToScreen(node.position, controller.snapshot().viewport, viewportSize);
    const nodeHit = hitTest({ payload, viewport: controller.snapshot().viewport, viewportSize, screenPoint: nodePoint });

    assert.strictEqual(nodeHit.kind, "node");
    assert.strictEqual(nodeHit.id, node.entityId);

    const region = payload.regions.find((candidate) => candidate.visibility !== "hidden");
    assert.ok(region);
    const regionPoint = worldToScreen(region.boundaryHints.centroid, controller.snapshot().viewport, viewportSize);
    const regionHit = hitTest({ payload, viewport: controller.snapshot().viewport, viewportSize, screenPoint: regionPoint, tolerance: 0 });
    assert.ok(regionHit.kind === "node" || regionHit.kind === "region");

    const backgroundHit = hitTest({ payload, viewport: controller.snapshot().viewport, viewportSize, screenPoint: { x: -10_000, y: -10_000 } });
    assert.strictEqual(backgroundHit.kind, "background");
  });

  test("single-node selection replaces previous selection and background clears it", () => {
    const payload = samplePayload();
    const controller = createAtlasInteractionController({ payload, options: { viewportSize } });
    const nodes = payload.nodes.filter((node) => node.visibility === "visible").slice(0, 2);
    assert.strictEqual(nodes.length, 2);

    controller.click({ point: worldToScreen(nodes[0]!.position, controller.snapshot().viewport, viewportSize) });
    const firstSelection = controller.snapshot().selection.selected;
    assert.strictEqual(firstSelection?.kind, "node");
    assert.strictEqual(firstSelection.id, nodes[0]!.entityId);

    controller.click({ point: worldToScreen(nodes[1]!.position, controller.snapshot().viewport, viewportSize) });
    const secondSelection = controller.snapshot().selection.selected;
    assert.strictEqual(secondSelection?.kind, "node");
    assert.strictEqual(secondSelection.id, nodes[1]!.entityId);

    controller.click({ point: { x: -1000, y: -1000 } });
    assert.strictEqual(controller.snapshot().selection.selected, null);
  });

  test("focus is independent from selection and updates inspector bridge without mutating payload", () => {
    const payload = samplePayload();
    const before = JSON.stringify(payload);
    const controller = createAtlasInteractionController({ payload, options: { viewportSize } });
    const nodes = payload.nodes.filter((node) => node.visibility === "visible").slice(0, 2);
    assert.strictEqual(nodes.length, 2);

    controller.click({ point: worldToScreen(nodes[0]!.position, controller.snapshot().viewport, viewportSize) });
    const focusTarget = hitTest({ payload, viewport: controller.snapshot().viewport, viewportSize, screenPoint: worldToScreen(nodes[1]!.position, controller.snapshot().viewport, viewportSize) });
    controller.focus(focusTarget);
    const snapshot = controller.snapshot();

    assert.strictEqual(snapshot.selection.selected?.kind, "node");
    assert.strictEqual(snapshot.focus.focused?.kind, "node");
    assert.strictEqual(snapshot.selection.selected.id, nodes[0]!.entityId);
    assert.strictEqual(snapshot.focus.focused.id, nodes[1]!.entityId);
    assert.strictEqual(snapshot.inspector.selected?.id, nodes[0]!.entityId);
    assert.strictEqual(snapshot.inspector.focused?.id, nodes[1]!.entityId);
    assert.strictEqual(JSON.stringify(payload), before);
  });

  test("edge hit testing resolves an explicit visible edge from payload geometry", () => {
    const payload = samplePayload();
    const controller = createAtlasInteractionController({ payload, options: { viewportSize } });
    const nodesById = new Map(payload.nodes.map((node) => [node.entityId, node]));
    const edge = payload.edges.find((candidate) => {
      const source = nodesById.get(candidate.source);
      const target = nodesById.get(candidate.target);
      return candidate.visibility === "visible" && source?.visibility === "visible" && target?.visibility === "visible" && Math.hypot(source.position.x - target.position.x, source.position.y - target.position.y) > source.radius + target.radius + 30;
    });
    assert.ok(edge);
    const source = nodesById.get(edge.source)!;
    const target = nodesById.get(edge.target)!;
    const midpoint = {
      x: (source.position.x + target.position.x) / 2,
      y: (source.position.y + target.position.y) / 2,
    };
    const edgeHit = hitTest({ payload, viewport: controller.snapshot().viewport, viewportSize, screenPoint: worldToScreen(midpoint, controller.snapshot().viewport, viewportSize), tolerance: 8 });

    assert.strictEqual(edgeHit.kind, "edge");
    assert.strictEqual(edgeHit.id, edge.edgeId);
  });

  test("viewport pan, zoom, reset, and clamping remain interaction-state only", () => {
    const payload = samplePayload();
    const controller = createAtlasInteractionController({ payload, options: { viewportSize, camera: { minZoom: 0.5, maxZoom: 2 } } });
    const initial = controller.snapshot().viewport;

    controller.pointerDown({ point: { x: 300, y: 300 } });
    controller.pointerMove({ point: { x: 360, y: 320 } });
    controller.pointerUp();
    const panned = controller.snapshot().viewport;
    assert.notStrictEqual(panned.center.x, initial.center.x);

    const zoomAnchor = { x: 600, y: 400 };
    const anchorBeforeZoom = screenToWorld(zoomAnchor, controller.snapshot().viewport, viewportSize);
    controller.wheel({ point: zoomAnchor, deltaY: -5000 });
    const zoomed = controller.snapshot().viewport;
    const anchorAfterZoom = screenToWorld(zoomAnchor, zoomed, viewportSize);
    assert.ok(zoomed.zoom > panned.zoom);
    assert.ok(zoomed.zoom <= 2);
    assert.ok(Math.hypot(anchorBeforeZoom.x - anchorAfterZoom.x, anchorBeforeZoom.y - anchorAfterZoom.y) < 1);

    controller.resetViewport();
    assert.strictEqual(controller.snapshot().viewport.center.x, initial.center.x);
    assert.strictEqual(controller.snapshot().viewport.center.y, initial.center.y);

    const sync = synchronizeViewport(payload, controller.snapshot().viewport);
    assert.strictEqual(sync.payloadId, payload.metadata.payloadId);
    assert.strictEqual(sync.rendererIndependent, true);
  });

  test("interaction events are immutable and state transitions use canonical states", () => {
    const payload = samplePayload();
    const controller = createAtlasInteractionController({ payload, options: { viewportSize } });
    const node = firstVisibleNode(payload);
    controller.pointerMove({ point: worldToScreen(node.position, controller.snapshot().viewport, viewportSize) });
    controller.click({ point: worldToScreen(node.position, controller.snapshot().viewport, viewportSize) });
    controller.focus();
    const events = controller.drainEvents();

    assert.deepStrictEqual(events.map((event) => event.type), ["HoverChanged", "NodeSelected", "FocusChanged", "ViewportMoved"]);
    assert.ok(Object.isFrozen(events[0]));
    assert.strictEqual(controller.snapshot().state, "Focused");
  });

  test("screen/world conversion is reversible for current interaction viewport", () => {
    const payload = samplePayload();
    const controller = createAtlasInteractionController({ payload, options: { viewportSize } });
    const node = firstVisibleNode(payload);
    const screen = worldToScreen(node.position, controller.snapshot().viewport, viewportSize);
    const world = screenToWorld(screen, controller.snapshot().viewport, viewportSize);
    assert.ok(Math.abs(world.x - node.position.x) < 0.0001);
    assert.ok(Math.abs(world.y - node.position.y) < 0.0001);
  });

  test("interaction benchmark reports canonical latency fields", () => {
    const result = benchmarkAtlasInteractionScale(2_000, 2_000);
    assert.strictEqual(result.nodeCount, 2_000);
    assert.strictEqual(result.edgeCount, 2_000);
    assert.ok(result.hitTestLatencyMs >= 0);
    assert.ok(result.selectionLatencyMs >= 0);
    assert.ok(result.interactionOverheadMs >= result.hitTestLatencyMs);
  });
});

function samplePayload(): VisualizationPayload {
  const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
  const projection = new ProjectionEngine().generate(snapshot, { kind: "topology" });
  return buildVisualizationPayload({ snapshot, projection, layout: "force", generatedAt });
}

function firstVisibleNode(payload: VisualizationPayload): VisualNode {
  const node = payload.nodes.find((candidate) => candidate.visibility === "visible");
  assert.ok(node);
  return node;
}
