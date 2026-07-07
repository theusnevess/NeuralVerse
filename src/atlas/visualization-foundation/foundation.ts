import { createHash } from "node:crypto";
import { deflateSync, inflateSync } from "node:zlib";
import type { EntityFamily, GraphProjection, GraphSnapshot, KnowledgeEdge, KnowledgeNode } from "../graph-foundation/index.ts";
import { deepFreeze } from "../graph-foundation/immutability.ts";
import type {
  CanonicalViewport,
  LayoutKind,
  LodInformation,
  LodLevel,
  RendererAdapter,
  SceneGraph,
  VisibilityState,
  VisualEdge,
  VisualLabel,
  VisualMetrics,
  VisualNeighborhood,
  VisualNode,
  VisualRegion,
  VisualizationPayload,
  VisualizationPayloadInput,
  WorldBounds,
  WorldPoint,
} from "./types.ts";
import { computeCanonicalLayout, type CanonicalLayoutMetrics, type CanonicalLayoutResult } from "./layout-engine.ts";

const LOD_LEVELS: readonly LodLevel[] = ["LOD0", "LOD1", "LOD2", "LOD3", "LOD4", "LOD5"];
const SCENE_LAYERS = ["regions", "edges", "nodes", "labels", "decorations"] as const;

export function buildVisualizationPayload(input: VisualizationPayloadInput): VisualizationPayload {
  validateProjectionSnapshotCompatibility(input.snapshot, input.projection);
  const layoutKind = input.layout ?? defaultLayoutForProjection(input.projection.kind);
  const lod = computeLod(input.projection.nodeIds.length);
  const layout = computeCanonicalLayout(input.snapshot, input.projection, layoutKind);
  const positions = layout.positions;
  const nodeMarkers = buildNodeMarkers(layout);
  const nodes = input.projection.nodeIds.map((id) => buildVisualNode(input.snapshot.nodes.get(id)!, input.snapshot, positions.get(id)!, lod, nodeMarkers));
  const nodeIds = new Set(nodes.map((node) => node.entityId));
  const placeholderRegions = buildVisualRegions(input.snapshot, nodes, [], nodeMarkers, lod);
  const regionByDomain = new Map(placeholderRegions.map((region) => [region.domain, region.regionId]));
  const edges = input.projection.edgeIds
    .map((id) => input.snapshot.edges.get(id)!)
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .map((edge, index) => buildVisualEdge(edge, input.snapshot, lod, index, regionByDomain));
  const regions = buildVisualRegions(input.snapshot, nodes, edges, nodeMarkers, lod);
  const visible = applyVisibility(nodes, edges, regions, lod);
  const labels = buildLabels(visible.nodes, visible.edges, visible.regions, lod);
  const bounds = computeBounds(visible.nodes, visible.regions);
  const viewport = buildViewport(input.viewport, bounds);
  const scene = buildScene(stableId("scene", input.projection.id, layoutKind), visible.nodes, visible.edges, visible.regions, labels, bounds);
  const metrics = computeVisualMetrics(scene, lod, input.projection, layout.metrics);
  const payload: VisualizationPayload = {
    metadata: {
      payloadId: stableId("payload", input.snapshot.id, input.projection.id, layoutKind, stableStringify(bounds)),
      snapshotId: input.snapshot.id,
      projectionId: input.projection.id,
      projectionKind: input.projection.kind,
      generatedAt: input.generatedAt ?? input.projection.metadata.generatedAt,
      layoutKind,
      rendererIndependent: true,
      worldSpaceOnly: true,
    },
    viewport,
    lod,
    scene,
    nodes: visible.nodes,
    edges: visible.edges,
    regions: visible.regions,
    labels,
    metrics,
  };
  validateVisualizationPayload(payload);
  return deepFreeze(payload);
}

export function computeLod(nodeCount: number): LodInformation {
  const level: LodLevel = nodeCount < 50 ? "LOD0" : nodeCount <= 200 ? "LOD1" : nodeCount <= 1_000 ? "LOD2" : nodeCount <= 5_000 ? "LOD3" : nodeCount <= 50_000 ? "LOD4" : "LOD5";
  const config: Record<LodLevel, Omit<LodInformation, "level" | "distribution">> = {
    LOD0: { nodeThreshold: 50, labelImportanceThreshold: 0, edgeImportanceThreshold: 0, aggregation: "none" },
    LOD1: { nodeThreshold: 200, labelImportanceThreshold: 0.5, edgeImportanceThreshold: 0.35, aggregation: "small_clusters" },
    LOD2: { nodeThreshold: 1_000, labelImportanceThreshold: 0.7, edgeImportanceThreshold: 0.5, aggregation: "medium_clusters" },
    LOD3: { nodeThreshold: 5_000, labelImportanceThreshold: 0.9, edgeImportanceThreshold: 0.75, aggregation: "large_clusters" },
    LOD4: { nodeThreshold: 50_000, labelImportanceThreshold: 1, edgeImportanceThreshold: 0.9, aggregation: "region_view" },
    LOD5: { nodeThreshold: 500_000, labelImportanceThreshold: 1, edgeImportanceThreshold: 0.98, aggregation: "domain_view" },
  };
  return deepFreeze({ level, ...config[level], distribution: emptyLodDistribution(level, nodeCount) });
}

export function validateVisualizationPayload(payload: VisualizationPayload): void {
  if (!payload.metadata.rendererIndependent || !payload.metadata.worldSpaceOnly) throw new Error("Visualization payload must be renderer independent and world-space only.");
  const nodeIds = new Set(payload.nodes.map((node) => node.entityId));
  for (const edge of payload.edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) throw new Error(`Visual edge references missing visual node: ${edge.edgeId}`);
  }
  if (payload.scene.nodes.length !== payload.nodes.length || payload.scene.edges.length !== payload.edges.length) throw new Error("Scene graph content does not match payload content.");
}

export function serializeVisualizationPayload(payload: VisualizationPayload): string {
  validateVisualizationPayload(payload);
  return stableStringify(payload);
}

export function deserializeVisualizationPayload(json: string): VisualizationPayload {
  const payload = JSON.parse(json) as VisualizationPayload;
  validateVisualizationPayload(payload);
  return deepFreeze(payload);
}

export function compressVisualizationPayload(payload: VisualizationPayload): Buffer {
  return deflateSync(Buffer.from(serializeVisualizationPayload(payload), "utf8"));
}

export function decompressVisualizationPayload(buffer: Buffer): VisualizationPayload {
  return deserializeVisualizationPayload(inflateSync(buffer).toString("utf8"));
}

export abstract class PayloadOnlyRenderer<TOutput = unknown> implements RendererAdapter<TOutput> {
  abstract readonly rendererId: string;
  abstract readonly rendererKind: RendererAdapter<TOutput>["rendererKind"];
  abstract render(payload: VisualizationPayload): TOutput;
}

function buildVisualNode(
  node: KnowledgeNode,
  snapshot: GraphSnapshot,
  position: WorldPoint,
  lod: LodInformation,
  nodeMarkers: ReadonlyMap<string, { readonly isHub: boolean; readonly isBridge: boolean }>,
): VisualNode {
  const centrality = snapshot.metrics.centrality[node.id];
  const graphImportance = centrality ? Math.min(1, centrality.degree / Math.max(1, Math.sqrt(snapshot.metadata.nodeCount))) : 0;
  const evidenceImportance = Math.min(1, (node.metadata.evidenceCount ?? 0) / 10);
  const explicitImportance = typeof node.metadata.importance === "number" ? node.metadata.importance : undefined;
  const importance = clamp(explicitImportance ?? graphImportance * 0.7 + evidenceImportance * 0.3);
  const radius = 6 + importance * 12;
  const markers = nodeMarkers.get(node.id) ?? { isHub: false, isBridge: false };
  return {
    visualId: `visual-node:${node.id}`,
    entityId: node.id,
    label: node.name,
    importance,
    hierarchyLevel: inferHierarchyLevel(node, snapshot),
    radius,
    family: node.family,
    type: node.type,
    colorToken: `atlas.family.${node.family}`,
    labelPriority: Math.round(importance * 1000),
    state: "default",
    position,
    boundingBox: { x: position.x - radius, y: position.y - radius, width: radius * 2, height: radius * 2 },
    visibility: "visible",
    lodLevel: lod.level,
    isHub: markers.isHub,
    isBridge: markers.isBridge,
    domain: node.metadata.domain ?? "Unclassified",
  };
}

function buildVisualEdge(
  edge: KnowledgeEdge,
  snapshot: GraphSnapshot,
  lod: LodInformation,
  index: number,
  regionByDomain: ReadonlyMap<string, string>,
): VisualEdge {
  const importance = clamp(edge.metadata.weight * 0.55 + edge.metadata.confidence * 0.35 + Math.min(1, edge.metadata.evidenceCount / 10) * 0.1);
  const sourceNode = snapshot.nodes.get(edge.source);
  const targetNode = snapshot.nodes.get(edge.target);
  const sourceDomain = sourceNode?.metadata.domain ?? "Unclassified";
  const targetDomain = targetNode?.metadata.domain ?? "Unclassified";
  const sourceRegion = regionByDomain.get(sourceDomain) ?? "";
  const targetRegion = regionByDomain.get(targetDomain) ?? "";
  const isCorridor = Boolean(sourceRegion && targetRegion && sourceRegion !== targetRegion);
  return {
    edgeId: edge.id,
    source: edge.source,
    target: edge.target,
    relationshipType: edge.type,
    relationshipCategory: edge.category,
    importance,
    curvatureHint: ((index % 7) - 3) / 10,
    visibility: importance >= lod.edgeImportanceThreshold ? "visible" : "hidden",
    labelPriority: Math.round(importance * 1000),
    lodLevel: lod.level,
    sourceRegion,
    targetRegion,
    isCorridor,
  };
}

function buildVisualRegions(
  snapshot: GraphSnapshot,
  nodes: readonly VisualNode[],
  edges: readonly VisualEdge[],
  nodeMarkers: ReadonlyMap<string, { readonly isHub: boolean; readonly isBridge: boolean }>,
  lod: LodInformation,
): VisualRegion[] {
  const groups = new Map<string, VisualNode[]>();
  for (const visualNode of nodes) {
    const domain = visualNode.domain || snapshot.nodes.get(visualNode.entityId)?.metadata.domain || "Unclassified";
    groups.set(domain, [...(groups.get(domain) ?? []), visualNode]);
  }
  const sortedDomains = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  const regionByDomain = new Map<string, string>();
  const regions: VisualRegion[] = sortedDomains.map(([domain, members], index) => {
    const bounds = computeBounds(members, []);
    const centroid = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const families = countBy(members.map((node) => node.family));
    const dominantFamily = Object.entries(families).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] as EntityFamily | undefined;
    const importance = clamp(members.reduce((sum, node) => sum + node.importance, 0) / Math.max(1, members.length));
    const memberIds = members.map((node) => node.entityId).sort();
    const hubIds = memberIds.filter((id) => nodeMarkers.get(id)?.isHub);
    const bridgeIds = memberIds.filter((id) => nodeMarkers.get(id)?.isBridge);
    const capitalId = pickCapitalId(members, nodeMarkers);
    const neighborhoods = buildNeighborhoods(members, centroid, bounds);
    const storyOrder = storyOrderFor(domain, index);
    const storyRole = storyRoleFor(domain);
    const regionId = `visual-region:${slugifyDomain(domain)}`;
    regionByDomain.set(domain, regionId);
    return {
      regionId,
      domain,
      members: memberIds,
      importance,
      visibility: lod.level === "LOD0" ? "hidden" : "visible",
      lodLevel: lod.level,
      boundaryHints: { centroid, bounds, nestingLevel: 0, dominantFamily: dominantFamily ?? "scientific" },
      hubIds,
      bridgeIds,
      interRegionEdges: [],
      capitalId,
      neighborhoods,
      neighborRegionIds: [],
      storyOrder,
      storyRole,
      identityTag: identityTagFor(slugifyDomain(domain)),
    };
  });
  const interRegionByRegion = new Map<string, Set<string>>();
  const neighborByRegion = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!edge.isCorridor) continue;
    const sourceSet = interRegionByRegion.get(edge.sourceRegion) ?? new Set<string>();
    sourceSet.add(edge.edgeId);
    interRegionByRegion.set(edge.sourceRegion, sourceSet);
    const targetSet = interRegionByRegion.get(edge.targetRegion) ?? new Set<string>();
    targetSet.add(edge.edgeId);
    interRegionByRegion.set(edge.targetRegion, targetSet);
    if (edge.sourceRegion && edge.targetRegion) {
      const sourceNeighbors = neighborByRegion.get(edge.sourceRegion) ?? new Set<string>();
      sourceNeighbors.add(edge.targetRegion);
      neighborByRegion.set(edge.sourceRegion, sourceNeighbors);
      const targetNeighbors = neighborByRegion.get(edge.targetRegion) ?? new Set<string>();
      targetNeighbors.add(edge.sourceRegion);
      neighborByRegion.set(edge.targetRegion, targetNeighbors);
    }
  }
  return regions.map((region) => ({
    ...region,
    interRegionEdges: [...(interRegionByRegion.get(region.regionId) ?? new Set<string>())].sort(),
    neighborRegionIds: [...(neighborByRegion.get(region.regionId) ?? new Set<string>())].sort(),
  }));
}

function applyVisibility(nodes: readonly VisualNode[], edges: readonly VisualEdge[], regions: readonly VisualRegion[], lod: LodInformation): { nodes: VisualNode[]; edges: VisualEdge[]; regions: VisualRegion[] } {
  const nodesById = new Map(nodes.map((node) => [node.entityId, node]));
  const visibleNodes = nodes.map((node) => ({ ...node, visibility: nodeVisibility(node, lod) }));
  const visibleNodeIds = new Set(visibleNodes.filter((node) => node.visibility !== "hidden").map((node) => node.entityId));
  const visibleEdges = edges.map((edge) => ({ ...edge, visibility: edge.importance >= lod.edgeImportanceThreshold && visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target) ? "visible" : "hidden" }) as VisualEdge);
  const visibleRegions = regions.map((region) => ({ ...region, visibility: regionVisibility(region, lod, nodesById) }) as VisualRegion);
  return { nodes: visibleNodes, edges: visibleEdges, regions: visibleRegions };
}

function nodeVisibility(node: VisualNode, lod: LodInformation): VisibilityState {
  if (lod.level === "LOD5" && node.importance < 0.98) return "hidden";
  if (lod.level === "LOD4" && node.importance < 0.9) return "summary";
  if (lod.level === "LOD3" && node.importance < 0.35) return "summary";
  return "visible";
}

function regionVisibility(region: VisualRegion, lod: LodInformation, nodesById: Map<string, VisualNode>): VisibilityState {
  if (lod.level === "LOD0") return "hidden";
  if (lod.level === "LOD5" || lod.level === "LOD4") return "summary";
  return region.members.some((id) => nodesById.has(id)) ? "visible" : "hidden";
}

function buildLabels(nodes: readonly VisualNode[], edges: readonly VisualEdge[], regions: readonly VisualRegion[], lod: LodInformation): VisualLabel[] {
  const nodeLabels = nodes.map((node) => ({
    labelId: `label:${node.visualId}`,
    ownerId: node.entityId,
    ownerKind: "node" as const,
    text: node.label,
    priority: node.labelPriority,
    visibility: node.importance >= lod.labelImportanceThreshold && node.visibility === "visible" ? "visible" as const : "hidden" as const,
    lodLevel: lod.level,
  }));
  const edgeLabels = edges.map((edge) => ({
    labelId: `label:edge:${edge.edgeId}`,
    ownerId: edge.edgeId,
    ownerKind: "edge" as const,
    text: edge.relationshipType,
    priority: edge.labelPriority,
    visibility: lod.level === "LOD0" || (edge.importance > 0.85 && edge.visibility === "visible") ? "visible" as const : "hidden" as const,
    lodLevel: lod.level,
  }));
  const regionLabels = regions.map((region) => ({
    labelId: `label:${region.regionId}`,
    ownerId: region.regionId,
    ownerKind: "region" as const,
    text: region.domain,
    priority: Math.round(region.importance * 1000),
    visibility: region.visibility === "hidden" ? "hidden" as const : "visible" as const,
    lodLevel: lod.level,
  }));
  return [...nodeLabels, ...edgeLabels, ...regionLabels].sort((a, b) => b.priority - a.priority || a.labelId.localeCompare(b.labelId));
}

function buildScene(sceneId: string, nodes: readonly VisualNode[], edges: readonly VisualEdge[], regions: readonly VisualRegion[], labels: readonly VisualLabel[], bounds: WorldBounds): SceneGraph {
  return deepFreeze({
    sceneId,
    layers: SCENE_LAYERS,
    regions: [...regions].sort((a, b) => a.regionId.localeCompare(b.regionId)),
    edges: [...edges].sort((a, b) => b.importance - a.importance || a.edgeId.localeCompare(b.edgeId)),
    nodes: [...nodes].sort((a, b) => a.hierarchyLevel - b.hierarchyLevel || b.importance - a.importance || a.entityId.localeCompare(b.entityId)),
    labels: [...labels],
    decorations: regions.map((region) => ({ decorationId: `decoration:${region.regionId}`, kind: "region_summary" as const, ownerId: region.regionId, visibility: region.visibility, lodLevel: region.lodLevel })),
    bounds,
  });
}

function buildViewport(input: Partial<CanonicalViewport> | undefined, bounds: WorldBounds): CanonicalViewport {
  const center = input?.center ?? { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const zoom = input?.zoom ?? 1;
  const scale = input?.scale ?? zoom;
  const visibleBounds = input?.visibleBounds ?? bounds;
  const clippingBounds = input?.clippingBounds ?? visibleBounds;
  return deepFreeze({ center, zoom, visibleBounds, scale, clippingBounds });
}

function computeVisualMetrics(scene: SceneGraph, lod: LodInformation, projection: GraphProjection, layoutMetrics: CanonicalLayoutMetrics): VisualMetrics {
  const visibleNodes = scene.nodes.filter((node) => node.visibility === "visible").length;
  const visibleEdges = scene.edges.filter((edge) => edge.visibility === "visible").length;
  return deepFreeze({
    visibleNodes,
    visibleEdges,
    collapsedRegions: scene.regions.filter((region) => region.visibility === "summary").length,
    averageDensity: projection.metadata.density,
    edgeCrossingsEstimate: layoutMetrics.edgeCrossingsEstimate,
    clusterCount: scene.regions.filter((region) => region.members.length > 1).length,
    hiddenLabels: scene.labels.filter((label) => label.visibility === "hidden").length,
    lodDistribution: lod.distribution,
  });
}

function validateProjectionSnapshotCompatibility(snapshot: GraphSnapshot, projection: GraphProjection): void {
  if (projection.snapshotId !== snapshot.id) throw new Error("Projection does not belong to snapshot.");
  for (const id of projection.nodeIds) if (!snapshot.nodes.has(id)) throw new Error(`Projection references missing node: ${id}`);
  for (const id of projection.edgeIds) if (!snapshot.edges.has(id)) throw new Error(`Projection references missing edge: ${id}`);
}

function defaultLayoutForProjection(kind: GraphProjection["kind"]): LayoutKind {
  if (kind === "dependency") return "dependency";
  if (kind === "domain" || kind === "application") return "domain";
  if (kind === "research") return "research";
  if (kind === "pedagogical" || kind === "curriculum") return "hierarchical";
  return "force";
}

function inferHierarchyLevel(node: KnowledgeNode, snapshot: GraphSnapshot): number {
  return snapshot.index.edgesByTarget.get(node.id)?.size ? 1 : 0;
}

function computeBounds(nodes: readonly Pick<VisualNode, "boundingBox">[], regions: readonly VisualRegion[]): WorldBounds {
  const boxes = [...nodes.map((node) => node.boundingBox), ...regions.map((region) => region.boundaryHints.bounds)];
  if (boxes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function emptyLodDistribution(level: LodLevel, count: number): Record<LodLevel, number> {
  return Object.fromEntries(LOD_LEVELS.map((candidate) => [candidate, candidate === level ? count : 0])) as Record<LodLevel, number>;
}

function countBy<T extends string>(values: readonly T[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const value of values) result[value] = (result[value] ?? 0) + 1;
  return result;
}

function stableId(...parts: readonly string[]): string {
  return createHash("sha256").update(parts.join("\u0000")).digest("hex").slice(0, 32);
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortForJson(value));
}

function sortForJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortForJson);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, sortForJson(child)]));
  return value;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function pickCapitalId(members: readonly VisualNode[], nodeMarkers: ReadonlyMap<string, { readonly isHub: boolean; readonly isBridge: boolean }>): string | null {
  let bestId: string | null = null;
  let bestScore = -1;
  for (const node of members) {
    const markers = nodeMarkers.get(node.entityId);
    const score = node.importance * 2 + (markers?.isHub ? 1.2 : 0) + (markers?.isBridge ? 0.4 : 0);
    if (score > bestScore) {
      bestScore = score;
      bestId = node.entityId;
    }
  }
  return bestId;
}

function buildNeighborhoods(members: readonly VisualNode[], regionCentroid: WorldPoint, regionBounds: WorldBounds): readonly VisualNeighborhood[] {
  if (members.length < 2) return [];
  const groups = new Map<EntityFamily, VisualNode[]>();
  for (const node of members) {
    const list = groups.get(node.family) ?? [];
    list.push(node);
    groups.set(node.family, list);
  }
  const neighborhoods: VisualNeighborhood[] = [];
  for (const [family, nodes] of groups) {
    if (nodes.length < 1) continue;
    const memberPositions = nodes
      .map((node) => node.position)
      .filter((position): position is WorldPoint => Boolean(position));
    if (memberPositions.length === 0) continue;
    const center = averagePoint(memberPositions);
    const maxDistance = Math.max(0, ...memberPositions.map((position) => Math.hypot(position.x - center.x, position.y - center.y)));
    const importance = clamp(nodes.reduce((sum, node) => sum + node.importance, 0) / Math.max(1, nodes.length));
    neighborhoods.push({
      neighborhoodId: `neighborhood:${family}:${nodes.length}`,
      label: neighborhoodLabelFor(family, nodes.length),
      family,
      memberIds: nodes.map((node) => node.entityId).sort(),
      centroid: center,
      radius: Math.max(36, maxDistance + 24),
      importance,
      isSubregion: nodes.length > 1,
    });
  }
  if (neighborhoods.length === 0) return [];
  return neighborhoods.sort((a, b) => b.importance - a.importance || a.family.localeCompare(b.family));
}

function averagePoint(points: readonly WorldPoint[]): WorldPoint {
  if (!points.length) return { x: 0, y: 0 };
  return { x: points.reduce((sum, point) => sum + point.x, 0) / points.length, y: points.reduce((sum, point) => sum + point.y, 0) / points.length };
}

function neighborhoodLabelFor(family: EntityFamily, memberCount: number): string {
  const base: Record<EntityFamily, string> = {
    scientific: "Theoretical Core",
    engineering: "Engineering Practice",
    evidence: "Empirical Layer",
    context: "Contextual Layer",
  };
  if (memberCount === 1) return `${base[family]} · Singleton`;
  return base[family];
}

const STORY_ORDER: Record<string, number> = {
  mathematics: 0,
  calculus: 1,
  statistics: 2,
  programming: 3,
  research: 4,
  "machine-learning": 5,
  "deep-learning": 6,
  "computer-vision": 7,
  nlp: 8,
  llms: 9,
  "llm-engineering": 10,
  agents: 11,
  mlops: 12,
};

const STORY_ROLE: Record<string, VisualRegion["storyRole"]> = {
  mathematics: "foundation",
  calculus: "foundation",
  statistics: "foundation",
  programming: "method",
  research: "method",
  "machine-learning": "method",
  "deep-learning": "specialization",
  "computer-vision": "specialization",
  nlp: "specialization",
  llms: "specialization",
  "llm-engineering": "application",
  agents: "application",
  mlops: "operation",
};

function storyOrderFor(domain: string, fallbackIndex: number): number {
  const slug = slugifyDomain(domain);
  return STORY_ORDER[slug] ?? fallbackIndex;
}

function storyRoleFor(domain: string): VisualRegion["storyRole"] {
  const slug = slugifyDomain(domain);
  return STORY_ROLE[slug] ?? "method";
}

function slugifyDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unclassified";
}

function buildNodeMarkers(layout: CanonicalLayoutResult): ReadonlyMap<string, { readonly isHub: boolean; readonly isBridge: boolean }> {
  const result = new Map<string, { readonly isHub: boolean; readonly isBridge: boolean }>();
  if (layout.clusters.length === 0 || layout.positions.size === 0) return result;

  for (const cluster of layout.clusters) {
    const ranked = cluster.members
      .map((id) => {
        const position = layout.positions.get(id);
        if (!position) return null;
        const distance = Math.hypot(position.x - cluster.centroid.x, position.y - cluster.centroid.y);
        return { id, distance, importance: 1 / (1 + distance) };
      })
      .filter((entry): entry is { id: string; distance: number; importance: number } => entry !== null)
      .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
    const hubSlots = Math.max(1, Math.min(2, Math.round(cluster.members.length / 7) + 1));
    const hubIds = new Set(ranked.slice(0, hubSlots).map((entry) => entry.id));
    for (const id of cluster.members) {
      result.set(id, { isHub: hubIds.has(id), isBridge: false });
    }
  }

  const clusterDistance: Array<{ from: string; to: string; distance: number }> = [];
  for (let i = 0; i < layout.clusters.length; i += 1) {
    for (let j = i + 1; j < layout.clusters.length; j += 1) {
      const a = layout.clusters[i]!;
      const b = layout.clusters[j]!;
      clusterDistance.push({ from: a.id, to: b.id, distance: Math.hypot(a.centroid.x - b.centroid.x, a.centroid.y - b.centroid.y) });
    }
  }
  const clusterById = new Map(layout.clusters.map((cluster) => [cluster.id, cluster]));
  for (const node of layout.positions.keys()) {
    const position = layout.positions.get(node)!;
    const nearest = nearestClusters(position, clusterById, layout.positions, 3);
    if (nearest.length < 2) continue;
    const ownerCluster = clusterById.get(nearest[0]!.clusterId);
    if (!ownerCluster || !ownerCluster.members.includes(node)) continue;
    const adjacency: Set<string> = new Set();
    for (const candidate of nearest.slice(1)) {
      if (candidate.distance < nearest[0]!.distance * 1.65) adjacency.add(candidate.clusterId);
    }
    if (adjacency.size === 0) continue;
    const existing = result.get(node);
    if (!existing) continue;
    result.set(node, { ...existing, isBridge: true });
  }
  return result;
}

interface NearestCluster { readonly clusterId: string; readonly distance: number; readonly memberId: string; }

function nearestClusters(position: WorldPoint, clusters: ReadonlyMap<string, { readonly members: readonly string[]; readonly centroid: WorldPoint }>, positions: ReadonlyMap<string, WorldPoint>, limit: number): readonly NearestCluster[] {
  const nearest: NearestCluster[] = [];
  for (const [clusterId, cluster] of clusters) {
    let bestMember: { id: string; distance: number } | null = null;
    for (const id of cluster.members) {
      const memberPosition = positions.get(id);
      if (!memberPosition) continue;
      const distance = Math.hypot(memberPosition.x - position.x, memberPosition.y - position.y);
      if (!bestMember || distance < bestMember.distance) bestMember = { id, distance };
    }
    if (bestMember) nearest.push({ clusterId, distance: bestMember.distance, memberId: bestMember.id });
  }
  nearest.sort((a, b) => a.distance - b.distance || a.clusterId.localeCompare(b.clusterId));
  return nearest.slice(0, limit);
}

function identityTagFor(slug: string): string {
  const codes: Record<string, string> = {
    mathematics: "MTH",
    calculus: "CAL",
    statistics: "STA",
    programming: "PRG",
    research: "RES",
    "machine-learning": "ML",
    "deep-learning": "DL",
    "computer-vision": "CV",
    nlp: "NLP",
    llms: "LLM",
    "llm-engineering": "LLE",
    agents: "AGT",
    mlops: "OPS",
  };
  return codes[slug] ?? slug.slice(0, 3).toUpperCase();
}
