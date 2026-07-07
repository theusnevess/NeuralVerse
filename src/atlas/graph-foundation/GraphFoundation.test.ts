import assert from "node:assert";
import { describe, test } from "node:test";
import {
  GraphSource,
  ProjectionEngine,
  QueryEngine,
  SnapshotCompiler,
  compressSnapshot,
  createInitialAtlasGraphSource,
  decompressSnapshot,
  deserializeSnapshot,
  exportMetadata,
  serializeSnapshot,
  validateGraph,
  validateSnapshotIntegrity,
} from "./index.ts";
import type { KnowledgeEdge, KnowledgeNode } from "./index.ts";

const now = "2026-07-05T00:00:00.000Z";

describe("Atlas graph foundation", () => {
  test("compiles the canonical seed into an immutable snapshot", () => {
    const source = createInitialAtlasGraphSource();
    const snapshot = new SnapshotCompiler().compile(source);

    assert.strictEqual(snapshot.metadata.nodeCount, 133);
    assert.strictEqual(snapshot.metadata.edgeCount, 361);
    assert.strictEqual(validateSnapshotIntegrity(snapshot).valid, true);
    assert.throws(() => (snapshot.nodes as Map<string, KnowledgeNode>).set(sampleNode().id, sampleNode()), /immutable/i);
    assert.ok(snapshot.metrics.density > 0);
    assert.ok(snapshot.metrics.dependencyDepth > 0);
    assert.strictEqual(snapshot.metrics.orphanCount, 0);
    assert.strictEqual(snapshot.metrics.connectedComponents.length, 1);
    assert.ok((2 * snapshot.edges.size) / snapshot.nodes.size >= 5);
    assert.deepStrictEqual(snapshot.metadata.familyDistribution, { scientific: 55, engineering: 59, evidence: 14, context: 5 });
    assert.ok(snapshot.index.nodesByDomain.get("LLMs")?.size);
    assert.ok(snapshot.index.nodesByDomain.get("Computer Vision")?.size);
    assert.ok(snapshot.index.nodesByDomain.get("MLOps")?.size);
  });

  test("populates canonical aliases without duplicate alias keys", () => {
    const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
    const aliases = new Set<string>();

    for (const node of snapshot.nodes.values()) {
      const nodeAliases = node.metadata.aliases ?? [];
      assert.ok(nodeAliases.length >= 1);
      for (const alias of nodeAliases) {
        assert.ok(!aliases.has(alias), `Duplicate alias: ${alias}`);
        aliases.add(alias);
      }
    }
  });

  test("rejects invalid registry entries before compilation", () => {
    const source = new GraphSource("invalid", "1.0.0");
    assert.throws(
      () =>
        source.registerEntity({
          ...sampleNode(),
          id: "not-a-uuid",
        }),
      /UUID v4/,
    );
  });

  test("rejects broken edges and circular dependency graphs", () => {
    const a = sampleNode("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "A");
    const b = sampleNode("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", "B");
    const edgeA = sampleEdge("cccccccc-cccc-4ccc-8ccc-cccccccccccc", a.id, b.id, "requires");
    const edgeB = sampleEdge("dddddddd-dddd-4ddd-8ddd-dddddddddddd", b.id, a.id, "requires");

    const validation = validateGraph([a, b], [edgeA, edgeB]);

    assert.strictEqual(validation.valid, false);
    assert.ok(validation.issues.some((issue) => issue.code === "CIRCULAR_DEPENDENCY"));
  });

  test("generates projections exclusively from snapshots", () => {
    const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
    const projection = new ProjectionEngine().generate(snapshot, { kind: "dependency" });
    const computerVision = new ProjectionEngine().generate(snapshot, { kind: "domain", domain: "Computer Vision" });
    const names = computerVision.nodeIds.map((id) => snapshot.nodes.get(id)?.name);

    assert.strictEqual(projection.snapshotId, snapshot.id);
    assert.ok(projection.edgeIds.length > 0);
    for (const edgeId of projection.edgeIds) {
      assert.ok(snapshot.edges.has(edgeId));
    }
    assert.strictEqual(Object.isFrozen(projection), true);
    assert.ok(names.includes("Object Detection"));
    assert.ok(names.includes("YOLO"));
    assert.ok(names.includes("Anchor Boxes"));
    assert.ok(names.includes("IoU"));
    assert.ok(names.includes("NMS"));
    assert.ok(names.includes("COCO"));
  });

  test("serializes, compresses and restores snapshots without integrity loss", () => {
    const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
    const restored = deserializeSnapshot(serializeSnapshot(snapshot));
    const decompressed = decompressSnapshot(compressSnapshot(snapshot));
    const metadata = exportMetadata(snapshot);

    assert.strictEqual(restored.checksum, snapshot.checksum);
    assert.strictEqual(decompressed.checksum, snapshot.checksum);
    assert.strictEqual(metadata.nodeCount, snapshot.metadata.nodeCount);
    assert.strictEqual(validateSnapshotIntegrity(restored).valid, true);
  });

  test("answers read-only query patterns from indexes", () => {
    const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
    const query = new QueryEngine(snapshot);
    const transformer = getNodeByName(snapshot, "Transformer");

    assert.strictEqual(query.getEntity(transformer.id)?.name, "Transformer");
    assert.ok(query.getDependencies(transformer.id).some((node) => node.name === "Attention" || node.name === "Embedding" || node.name === "Matrix Multiplication"));
    assert.ok(query.getDomain("MLOps").length > 0);
    assert.ok(query.getApplications("semantic-search").some((node) => node.name === "Semantic Search"));
    assert.ok(query.getAlgorithms().some((node) => node.name === "Stochastic Gradient Descent"));
    assert.ok(query.getModules().some((node) => node.name === "PyTorch"));
    assert.ok(query.getPaths().some((node) => node.name === "Model Deployment"));
  });
});

function getNodeByName(snapshot: { nodes: ReadonlyMap<string, KnowledgeNode> }, name: string): KnowledgeNode {
  const node = [...snapshot.nodes.values()].find((candidate) => candidate.name === name);
  assert.ok(node, `Expected node: ${name}`);
  return node;
}

function sampleNode(id = "99999999-9999-4999-8999-999999999999", name = "Sample"): KnowledgeNode {
  return {
    id,
    type: "concept",
    family: "scientific",
    name,
    description: `${name} concept`,
    metadata: { domain: "Test", evidenceCount: 1, confidence: 0.9, importance: 0.5 },
    versions: [{ id, version: 1, changes: ["initial"], author: "test", timestamp: now, reason: "test", snapshot: { id, name } }],
    createdAt: now,
    updatedAt: now,
    status: "active",
  };
}

function sampleEdge(id: string, source: string, target: string, type: KnowledgeEdge["type"]): KnowledgeEdge {
  return {
    id,
    source,
    target,
    type,
    category: "epistemic",
    metadata: {
      weight: 0.6,
      confidence: 0.8,
      evidenceCount: 1,
      canonicalStatus: "canonical",
      temporal: { createdAt: now, updatedAt: now, expiresAt: null },
      sourceEvidence: [],
      direction: "directed",
      transitive: true,
      multiplicity: "many-to-many",
    },
    createdAt: now,
    updatedAt: now,
    status: "active",
  };
}
