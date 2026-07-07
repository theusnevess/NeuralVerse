import assert from "node:assert";
import { describe, test } from "node:test";
import { ProjectionEngine, SnapshotCompiler, createInitialAtlasGraphSource } from "../graph-foundation/index.ts";
import {
  PayloadOnlyRenderer,
  benchmarkVisualizationPayloadScale,
  buildVisualizationPayload,
  compressVisualizationPayload,
  computeCanonicalLayout,
  computeLod,
  createSyntheticBenchmarkData,
  decompressVisualizationPayload,
  deserializeVisualizationPayload,
  estimateIncrementalStability,
  serializeVisualizationPayload,
} from "./index.ts";
import type { VisualizationPayload } from "./index.ts";

const generatedAt = "2026-07-05T00:00:00.000Z";

describe("Atlas visualization foundation", () => {
  test("builds an immutable renderer-independent payload from a projection", () => {
    const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
    const projection = new ProjectionEngine().generate(snapshot, { kind: "topology" });
    const payload = buildVisualizationPayload({ snapshot, projection, layout: "force", generatedAt });

    assert.strictEqual(payload.metadata.snapshotId, snapshot.id);
    assert.strictEqual(payload.metadata.projectionId, projection.id);
    assert.strictEqual(payload.metadata.rendererIndependent, true);
    assert.strictEqual(payload.metadata.worldSpaceOnly, true);
    assert.strictEqual(Object.isFrozen(payload), true);
    assert.strictEqual(Object.isFrozen(payload.scene), true);
    assert.strictEqual(payload.nodes.length, projection.nodeIds.length);
    assert.strictEqual(payload.edges.length, projection.edgeIds.length);
    assert.ok(payload.regions.length > 0);
    assert.ok(payload.labels.length > 0);
    assert.throws(() => (payload.nodes as unknown as unknown[]).push({}), /object is not extensible|read only|Cannot add/i);
  });

  test("preserves scene integrity and canonical layer ordering", () => {
    const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
    const projection = new ProjectionEngine().generate(snapshot, { kind: "dependency" });
    const payload = buildVisualizationPayload({ snapshot, projection, generatedAt });
    const nodeIds = new Set(payload.nodes.map((node) => node.entityId));

    assert.deepStrictEqual(payload.scene.layers, ["regions", "edges", "nodes", "labels", "decorations"]);
    for (const edge of payload.scene.edges) {
      assert.ok(nodeIds.has(edge.source));
      assert.ok(nodeIds.has(edge.target));
      assert.ok(!("path" in edge));
      assert.ok(!("svgPath" in edge));
    }
    for (const node of payload.scene.nodes) {
      assert.ok(Number.isFinite(node.position.x));
      assert.ok(Number.isFinite(node.position.y));
      assert.ok(node.colorToken.startsWith("atlas.family."));
      assert.ok(!("x" in node));
      assert.ok(!("y" in node));
      assert.ok(!("selected" in node));
    }
  });

  test("computes M4 LOD levels and visibility thresholds", () => {
    assert.strictEqual(computeLod(20).level, "LOD0");
    assert.strictEqual(computeLod(200).level, "LOD1");
    assert.strictEqual(computeLod(1_000).level, "LOD2");
    assert.strictEqual(computeLod(5_000).level, "LOD3");
    assert.strictEqual(computeLod(50_000).level, "LOD4");
    assert.strictEqual(computeLod(100_000).level, "LOD5");

    const result = benchmarkVisualizationPayloadScale(2_000, 2_000);
    assert.strictEqual(result.nodeCount, 2_000);
    assert.ok(result.payloadGenerationMs >= 0);
    assert.ok(result.serializationMs >= 0);
  });

  test("serializes and compresses visualization payloads without renderer formats", () => {
    const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
    const projection = new ProjectionEngine().generate(snapshot, { kind: "domain", domain: "Computer Vision" });
    const payload = buildVisualizationPayload({ snapshot, projection, layout: "domain", generatedAt });
    const json = serializeVisualizationPayload(payload);
    const restored = deserializeVisualizationPayload(json);
    const decompressed = decompressVisualizationPayload(compressVisualizationPayload(payload));

    assert.strictEqual(restored.metadata.payloadId, payload.metadata.payloadId);
    assert.strictEqual(decompressed.metadata.payloadId, payload.metadata.payloadId);
    assert.doesNotMatch(json, /"(canvas|svg|svgPath|webgl|webgpu|domElement|css|html)"/i);
  });

  test("keeps renderers payload-only", () => {
    class CountingRenderer extends PayloadOnlyRenderer<number> {
      readonly rendererId = "counting-renderer";
      readonly rendererKind = "custom" as const;

      render(payload: VisualizationPayload): number {
        return payload.nodes.length + payload.edges.length + payload.regions.length;
      }
    }

    const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
    const projection = new ProjectionEngine().generate(snapshot, { kind: "research" });
    const payload = buildVisualizationPayload({ snapshot, projection, generatedAt });
    const renderer = new CountingRenderer();

    assert.strictEqual(renderer.render(payload), payload.nodes.length + payload.edges.length + payload.regions.length);
    assert.strictEqual(CountingRenderer.prototype.render.length, 1);
  });

  test("computes deterministic semantic layout positions", () => {
    const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
    const projection = new ProjectionEngine().generate(snapshot, { kind: "topology" });
    const first = computeCanonicalLayout(snapshot, projection, "force");
    const second = computeCanonicalLayout(snapshot, projection, "force");

    assert.deepStrictEqual([...first.positions.entries()], [...second.positions.entries()]);
    assert.ok(first.metrics.hubCount > 0);
    assert.ok(first.metrics.clusterCohesion >= 0);
    assert.ok(first.metrics.clusterCohesion <= 1.5);
  });

  test("keeps semantic neighborhoods closer than unrelated domains", () => {
    const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
    const projection = new ProjectionEngine().generate(snapshot, { kind: "topology" });
    const layout = computeCanonicalLayout(snapshot, projection, "domain");
    const nodes = projection.nodeIds.map((id) => snapshot.nodes.get(id)!).filter((node) => layout.positions.has(node.id));
    const sameDomain: number[] = [];
    const crossDomain: number[] = [];

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        const bucket = a.metadata.domain === b.metadata.domain ? sameDomain : crossDomain;
        bucket.push(Math.hypot(layout.positions.get(a.id)!.x - layout.positions.get(b.id)!.x, layout.positions.get(a.id)!.y - layout.positions.get(b.id)!.y));
      }
    }

    assert.ok(average(sameDomain) < average(crossDomain));
  });

  test("measures dependency corridors and edge-crossing pressure", () => {
    const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
    const projection = new ProjectionEngine().generate(snapshot, { kind: "dependency" });
    const layout = computeCanonicalLayout(snapshot, projection, "dependency");

    assert.ok(layout.metrics.dependencyCorridorScore >= 0);
    assert.ok(layout.metrics.dependencyCorridorScore <= 1);
    assert.ok(layout.metrics.edgeCrossingsEstimate >= 0);
    assert.ok(layout.metrics.collisionPairs >= 0);
  });

  test("preserves incremental stability for small topology updates", () => {
    const { snapshot, projection } = createSyntheticBenchmarkData(120, 180);
    const baselineProjection = { ...projection, nodeIds: projection.nodeIds.slice(0, 100), edgeIds: projection.edgeIds.slice(0, 140) };
    const baseline = computeCanonicalLayout(snapshot, baselineProjection, "force");
    const updated = computeCanonicalLayout(snapshot, projection, "force");

    assert.ok(estimateIncrementalStability(baseline.positions, updated.positions) > 0.4);
  });
});

function average(values: readonly number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}
