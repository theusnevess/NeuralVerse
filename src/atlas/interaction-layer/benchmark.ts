import type { VisualizationPayload, VisualEdge, VisualNode, VisualRegion } from "../visualization-foundation/index.ts";
import { createAtlasInteractionController } from "./interaction-controller.ts";
import type { InteractionBenchmarkResult } from "./types.ts";

export function benchmarkAtlasInteractionScale(nodeCount: number, edgeCount = nodeCount): InteractionBenchmarkResult {
  const payload = createInteractionBenchmarkPayload(nodeCount, edgeCount);
  const controller = createAtlasInteractionController({ payload, options: { viewportSize: { width: 1600, height: 1000 } } });

  const panStart = performance.now();
  controller.pointerDown({ point: { x: 800, y: 500 } });
  controller.pointerMove({ point: { x: 860, y: 540 } });
  controller.pointerUp();
  const panLatencyMs = performance.now() - panStart;

  const zoomStart = performance.now();
  controller.wheel({ point: { x: 800, y: 500 }, deltaY: -180 });
  const zoomLatencyMs = performance.now() - zoomStart;

  const hitStart = performance.now();
  controller.pointerMove({ point: { x: 800, y: 500 } });
  const hitTestLatencyMs = performance.now() - hitStart;

  const selectionStart = performance.now();
  controller.click({ point: { x: 800, y: 500 } });
  const selectionLatencyMs = performance.now() - selectionStart;

  return {
    nodeCount,
    edgeCount,
    panLatencyMs,
    zoomLatencyMs,
    hitTestLatencyMs,
    selectionLatencyMs,
    estimatedPanFps: fpsFromLatency(panLatencyMs),
    estimatedZoomFps: fpsFromLatency(zoomLatencyMs),
    interactionOverheadMs: panLatencyMs + zoomLatencyMs + hitTestLatencyMs + selectionLatencyMs,
  };
}

export function benchmarkAtlasInteractionScales(scales = [2_000, 10_000, 25_000, 50_000, 100_000]): readonly InteractionBenchmarkResult[] {
  return scales.map((scale) => benchmarkAtlasInteractionScale(scale, scale));
}

function fpsFromLatency(ms: number): number {
  return ms > 0 ? 1000 / ms : 0;
}

function createInteractionBenchmarkPayload(nodeCount: number, edgeCount: number): VisualizationPayload {
  const nodes = Array.from({ length: nodeCount }, (_, index) => syntheticVisualNode(index));
  const edges = Array.from({ length: edgeCount }, (_, index) => syntheticVisualEdge(index, nodeCount));
  const regions = syntheticRegions(nodes);
  const bounds = computeBounds(nodes, regions);
  return {
    metadata: {
      payloadId: `interaction-benchmark-${nodeCount}-${edgeCount}`,
      snapshotId: "payload-only-benchmark",
      projectionId: "payload-only-benchmark",
      projectionKind: "topology",
      generatedAt: "2026-07-05T00:00:00.000Z",
      layoutKind: "force",
      rendererIndependent: true,
      worldSpaceOnly: true,
    },
    viewport: {
      center: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 },
      zoom: 1,
      visibleBounds: bounds,
      scale: 1,
      clippingBounds: bounds,
    },
    lod: {
      level: nodeCount <= 5_000 ? "LOD3" : nodeCount <= 50_000 ? "LOD4" : "LOD5",
      nodeThreshold: nodeCount <= 5_000 ? 5_000 : nodeCount <= 50_000 ? 50_000 : 500_000,
      labelImportanceThreshold: 1,
      edgeImportanceThreshold: 0.9,
      aggregation: nodeCount <= 5_000 ? "large_clusters" : nodeCount <= 50_000 ? "region_view" : "domain_view",
      distribution: { LOD0: 0, LOD1: 0, LOD2: 0, LOD3: nodeCount <= 5_000 ? nodeCount : 0, LOD4: nodeCount > 5_000 && nodeCount <= 50_000 ? nodeCount : 0, LOD5: nodeCount > 50_000 ? nodeCount : 0 },
    },
    scene: {
      sceneId: `interaction-benchmark-scene-${nodeCount}-${edgeCount}`,
      layers: ["regions", "edges", "nodes", "labels", "decorations"],
      regions,
      edges,
      nodes,
      labels: [],
      decorations: [],
      bounds,
    },
    nodes,
    edges,
    regions,
    labels: [],
    metrics: {
      visibleNodes: nodes.length,
      visibleEdges: edges.length,
      collapsedRegions: 0,
      averageDensity: edgeCount / Math.max(1, nodeCount),
      edgeCrossingsEstimate: 0,
      clusterCount: regions.length,
      hiddenLabels: 0,
      lodDistribution: { LOD0: 0, LOD1: 0, LOD2: 0, LOD3: nodeCount <= 5_000 ? nodeCount : 0, LOD4: nodeCount > 5_000 && nodeCount <= 50_000 ? nodeCount : 0, LOD5: nodeCount > 50_000 ? nodeCount : 0 },
    },
  };
}

function syntheticVisualNode(index: number): VisualNode {
  const angle = (index * 2.399963229728653) % (Math.PI * 2);
  const ring = Math.ceil(Math.sqrt(index + 1));
  const radius = 6 + (index % 10) / 2;
  const position = { x: Math.cos(angle) * ring * 9, y: Math.sin(angle) * ring * 9 };
  return {
    visualId: `visual-node:synthetic-${index}`,
    entityId: `synthetic-${index}`,
    label: `Synthetic ${index}`,
    importance: (index % 100) / 100,
    hierarchyLevel: index % 5,
    radius,
    family: "scientific",
    type: "concept",
    colorToken: "atlas.family.scientific",
    labelPriority: index % 100,
    state: "default",
    position,
    boundingBox: { x: position.x - radius, y: position.y - radius, width: radius * 2, height: radius * 2 },
    visibility: "visible",
    lodLevel: index < 5_000 ? "LOD3" : index < 50_000 ? "LOD4" : "LOD5",
    isHub: index % 11 === 0,
    isBridge: index % 17 === 0,
    domain: "Synthetic",
  };
}

function syntheticVisualEdge(index: number, nodeCount: number): VisualEdge {
  return {
    edgeId: `synthetic-edge-${index}`,
    source: `synthetic-${index % nodeCount}`,
    target: `synthetic-${(index * 7 + 1) % nodeCount}`,
    relationshipType: "influences",
    relationshipCategory: "epistemic",
    importance: 0.9 + (index % 10) / 100,
    curvatureHint: 0,
    visibility: "visible",
    labelPriority: index % 100,
    lodLevel: nodeCount <= 5_000 ? "LOD3" : nodeCount <= 50_000 ? "LOD4" : "LOD5",
    sourceRegion: "visual-region:synthetic",
    targetRegion: "visual-region:synthetic",
    isCorridor: false,
  };
}

function syntheticRegions(nodes: readonly VisualNode[]): readonly VisualRegion[] {
  const bounds = computeBounds(nodes, []);
  return [{
    regionId: "visual-region:synthetic",
    domain: "Synthetic",
    members: nodes.map((node) => node.entityId),
    importance: 1,
    visibility: "visible",
    lodLevel: nodes.length <= 5_000 ? "LOD3" : nodes.length <= 50_000 ? "LOD4" : "LOD5",
    boundaryHints: {
      centroid: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 },
      bounds,
      nestingLevel: 0,
      dominantFamily: "scientific",
    },
    hubIds: [],
    bridgeIds: [],
    interRegionEdges: [],
    capitalId: null,
    neighborhoods: [],
    neighborRegionIds: [],
    storyOrder: 0,
    storyRole: "method",
    identityTag: "SYN",
  }];
}

function computeBounds(nodes: readonly Pick<VisualNode, "boundingBox">[], regions: readonly VisualRegion[]): { readonly x: number; readonly y: number; readonly width: number; readonly height: number } {
  const boxes = [...nodes.map((node) => node.boundingBox), ...regions.map((region) => region.boundaryHints.bounds)];
  if (boxes.length === 0) return { x: 0, y: 0, width: 1, height: 1 };
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));
  return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
}
