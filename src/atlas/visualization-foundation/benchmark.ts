import type { GraphProjection, GraphSnapshot, KnowledgeEdge, KnowledgeNode } from "../graph-foundation/index.ts";
import { buildIndex, computeMetrics } from "../graph-foundation/foundation.ts";
import { buildVisualizationPayload, computeLod, serializeVisualizationPayload } from "./foundation.ts";
import type { VisualizationBenchmarkResult } from "./types.ts";

const BENCHMARK_DATE = "2026-07-05T00:00:00.000Z";

export function benchmarkVisualizationPayloadScale(nodeCount: number, edgeCount = nodeCount): VisualizationBenchmarkResult {
  const memoryStart = process.memoryUsage().heapUsed;
  const { snapshot, projection } = createSyntheticBenchmarkData(nodeCount, edgeCount);
  const lodStart = performance.now();
  computeLod(nodeCount);
  const afterLod = performance.now();
  const start = performance.now();
  const payload = buildVisualizationPayload({ snapshot, projection, layout: "force", generatedAt: BENCHMARK_DATE });
  const afterPayload = performance.now();
  const visibilityStart = performance.now();
  const visible = payload.metrics.visibleNodes + payload.metrics.visibleEdges;
  const afterVisibility = performance.now();
  const serializationStart = performance.now();
  const json = serializeVisualizationPayload(payload);
  const afterSerialization = performance.now();
  const memoryEnd = process.memoryUsage().heapUsed;
  return {
    nodeCount,
    edgeCount,
    payloadGenerationMs: afterPayload - start,
    lodGenerationMs: afterLod - lodStart,
    visibilityComputationMs: Math.max(0, afterVisibility - visibilityStart + visible * 0),
    serializationMs: afterSerialization - serializationStart,
    sceneConstructionMs: afterPayload - start,
    memoryBytes: Math.max(0, memoryEnd - memoryStart + json.length),
  };
}

export function benchmarkVisualizationPayloadScales(scales = [2_000, 10_000, 25_000, 50_000, 100_000]): readonly VisualizationBenchmarkResult[] {
  return scales.map((scale) => benchmarkVisualizationPayloadScale(scale, scale));
}

export function createSyntheticBenchmarkData(nodeCount: number, edgeCount: number): { snapshot: GraphSnapshot; projection: GraphProjection } {
  const nodes = Array.from({ length: nodeCount }, (_, index) => syntheticNode(index));
  const edges = Array.from({ length: edgeCount }, (_, index) => syntheticEdge(index, nodeCount));
  const index = buildIndex(nodes, edges);
  const metrics = computeMetrics(nodes, edges, index);
  const snapshot: GraphSnapshot = {
    id: `synthetic-snapshot-${nodeCount}-${edgeCount}`,
    version: "benchmark",
    checksum: `synthetic-checksum-${nodeCount}-${edgeCount}`,
    createdAt: BENCHMARK_DATE,
    nodes: new Map(nodes.map((node) => [node.id, node])),
    edges: new Map(edges.map((edge) => [edge.id, edge])),
    index,
    metrics,
    metadata: {
      id: "synthetic",
      version: "benchmark",
      lastUpdated: BENCHMARK_DATE,
      nodeCount,
      edgeCount,
      domainDistribution: { Synthetic: nodeCount },
      familyDistribution: { scientific: nodeCount, engineering: 0, evidence: 0, context: 0 },
      relationshipDistribution: { epistemic: edgeCount, structural: 0, pedagogical: 0, engineering: 0, evidentiary: 0, temporal: 0, inferential: 0 },
    },
  };
  const projection: GraphProjection = {
    id: `synthetic-projection-${nodeCount}-${edgeCount}`,
    snapshotId: snapshot.id,
    kind: "topology",
    request: { kind: "topology" },
    nodeIds: nodes.map((node) => node.id),
    edgeIds: edges.map((edge) => edge.id),
    metrics,
    metadata: { nodeCount, edgeCount, density: metrics.density, checksum: "synthetic", generatedAt: BENCHMARK_DATE },
  };
  return { snapshot, projection };
}

function syntheticNode(index: number): KnowledgeNode {
  const id = syntheticUuid(index);
  return {
    id,
    type: "concept",
    family: "scientific",
    name: `Synthetic ${index}`,
    description: "Synthetic benchmark node",
    metadata: { domain: `Domain ${index % 12}`, importance: (index % 100) / 100, confidence: 0.8, evidenceCount: index % 7 },
    versions: [{ id, version: 1, changes: ["benchmark"], author: "benchmark", timestamp: BENCHMARK_DATE, reason: "benchmark", snapshot: { id } }],
    createdAt: BENCHMARK_DATE,
    updatedAt: BENCHMARK_DATE,
    status: "active",
  };
}

function syntheticEdge(index: number, nodeCount: number): KnowledgeEdge {
  return {
    id: syntheticUuid(index + nodeCount),
    source: syntheticUuid(index % nodeCount),
    target: syntheticUuid((index * 7 + 1) % nodeCount),
    type: "influences",
    category: "epistemic",
    metadata: {
      weight: 0.2 + (index % 80) / 100,
      confidence: 0.7,
      evidenceCount: index % 5,
      canonicalStatus: "canonical",
      temporal: { createdAt: BENCHMARK_DATE, updatedAt: BENCHMARK_DATE, expiresAt: null },
      sourceEvidence: [],
      direction: "directed",
      transitive: false,
      multiplicity: "many-to-many",
    },
    createdAt: BENCHMARK_DATE,
    updatedAt: BENCHMARK_DATE,
    status: "active",
  };
}

function syntheticUuid(index: number): string {
  const hex = index.toString(16).padStart(12, "0").slice(-12);
  return `00000000-0000-4000-8000-${hex}`;
}
