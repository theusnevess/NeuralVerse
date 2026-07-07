import type { GraphProjection, GraphSnapshot, KnowledgeEdge, KnowledgeNode, RelationshipType } from "../graph-foundation/index.ts";
import type { LayoutKind, WorldBounds, WorldPoint } from "./types.ts";

export interface CanonicalLayoutConstraints {
  readonly minimumNodeDistance: number;
  readonly labelPadding: number;
  readonly clusterSpacing: number;
  readonly clusterInflation: number;
  readonly hubSpacing: number;
  readonly bridgeSpacing: number;
  readonly corridorSpacing: number;
  readonly hierarchyLayerSpacing: number;
  readonly boundaryPadding: number;
  readonly densityCellSize: number;
  readonly maxDensityCorrectionPasses: number;
  readonly maxExactEdgeCrossingEdges: number;
}

export interface LayoutCluster {
  readonly id: string;
  readonly kind: "domain" | "research" | "implementation" | "curriculum" | "application";
  readonly label: string;
  readonly members: readonly string[];
  readonly centroid: WorldPoint;
  readonly radius: number;
  readonly importance: number;
  readonly density: number;
  readonly hubCount: number;
}

export interface CanonicalLayoutMetrics {
  readonly collisionPairs: number;
  readonly edgeCrossingsEstimate: number;
  readonly clusterCohesion: number;
  readonly clusterSeparation: number;
  readonly silhouetteScore: number;
  readonly densityScore: number;
  readonly layoutQualityScore: number;
  readonly bridgeCount: number;
  readonly hubCount: number;
  readonly dependencyCorridorScore: number;
  readonly bounds: WorldBounds;
}

export interface CanonicalLayoutResult {
  readonly positions: ReadonlyMap<string, WorldPoint>;
  readonly clusters: readonly LayoutCluster[];
  readonly metrics: CanonicalLayoutMetrics;
  readonly constraints: CanonicalLayoutConstraints;
}

interface NodeAnalysis {
  readonly node: KnowledgeNode;
  readonly degree: number;
  readonly importance: number;
  readonly clusterKey: string;
  readonly dependencyDepth: number;
  readonly hierarchyLayer: number;
  readonly adjacentClusters: readonly string[];
  readonly isHub: boolean;
  readonly isBridge: boolean;
}

const DEPENDENCY_RELATIONSHIPS = new Set<RelationshipType>(["requires", "depends_on", "builds_on", "precedes", "teaches", "enables", "composes", "extends"]);
const IMPLEMENTATION_TERMS = new Set(["cuda", "pytorch", "onnx", "tensorrt", "deployment", "mlops", "runtime", "inference", "serving"]);
const BRIDGE_TERMS = new Set(["cuda", "onnx", "embeddings", "embedding", "vector", "database", "feature", "engineering", "retrieval", "interface"]);

export const DEFAULT_CANONICAL_LAYOUT_CONSTRAINTS: CanonicalLayoutConstraints = Object.freeze({
  minimumNodeDistance: 34,
  labelPadding: 7,
  clusterSpacing: 660,
  clusterInflation: 1.08,
  hubSpacing: 110,
  bridgeSpacing: 138,
  corridorSpacing: 128,
  hierarchyLayerSpacing: 120,
  boundaryPadding: 220,
  densityCellSize: 46,
  maxDensityCorrectionPasses: 5,
  maxExactEdgeCrossingEdges: 700,
});

export function computeCanonicalLayout(snapshot: GraphSnapshot, projection: GraphProjection, layout: LayoutKind, constraints: Partial<CanonicalLayoutConstraints> = {}): CanonicalLayoutResult {
  const resolvedConstraints = Object.freeze({ ...DEFAULT_CANONICAL_LAYOUT_CONSTRAINTS, ...constraints });
  const nodeIds = projection.nodeIds.filter((id) => snapshot.nodes.has(id)).slice().sort();
  const edgeIds = projection.edgeIds.filter((id) => snapshot.edges.has(id)).slice().sort();
  const nodes = nodeIds.map((id) => snapshot.nodes.get(id)!);
  const edges = edgeIds.map((id) => snapshot.edges.get(id)!);
  const clusterKeys = assignSemanticClusters(nodes, layout, projection.kind);
  const dependencyDepths = computeDependencyDepths(nodeIds, edges);
  const adjacentClusters = computeAdjacentClusters(edges, clusterKeys);
  const hubIds = computeHubIds(nodes, snapshot);
  const bridgeIds = computeBridgeIds(nodes, snapshot, adjacentClusters);
  const analysis = nodes.map((node) => analyzeNode(node, snapshot, clusterKeys, dependencyDepths, adjacentClusters, hubIds, bridgeIds));
  const clusterDrafts = buildClusterDrafts(analysis, layout);
  const clusterAnchors = assignClusterAnchors(clusterDrafts, resolvedConstraints);
  const initialPositions = solveSemanticPositions(analysis, clusterAnchors, layout, resolvedConstraints);
  const positions = resolveDensity(initialPositions, analysis, resolvedConstraints);
  const clusters = finalizeClusters(clusterDrafts, positions, analysis, resolvedConstraints);
  const metrics = computeLayoutMetrics(positions, analysis, edges, clusters, resolvedConstraints);
  return { positions, clusters, metrics, constraints: resolvedConstraints };
}

export function estimateIncrementalStability(previous: ReadonlyMap<string, WorldPoint>, next: ReadonlyMap<string, WorldPoint>): number {
  let compared = 0;
  let drift = 0;
  for (const [id, before] of previous) {
    const after = next.get(id);
    if (!after) continue;
    compared += 1;
    drift += distance(before, after);
  }
  if (!compared) return 1;
  return 1 / (1 + drift / compared / 100);
}

function assignSemanticClusters(nodes: readonly KnowledgeNode[], layout: LayoutKind, projectionKind: GraphProjection["kind"]): Map<string, string> {
  const result = new Map<string, string>();
  for (const node of nodes) {
    const metadata = node.metadata;
    const tags = metadata.tags?.map((tag) => tag.toLowerCase()) ?? [];
    const implementationTag = tags.find((tag) => IMPLEMENTATION_TERMS.has(tag));
    const key =
      layout === "research" || projectionKind === "research"
        ? metadata.architecture ?? metadata.algorithm ?? researchTag(tags) ?? metadata.domain ?? node.family
        : layout === "dependency" || layout === "hierarchical" || projectionKind === "curriculum" || projectionKind === "pedagogical"
          ? metadata.module ?? metadata.path ?? metadata.domain ?? node.family
          : projectionKind === "implementation"
            ? implementationTag ?? metadata.application ?? metadata.artifact ?? metadata.algorithm ?? metadata.domain ?? node.family
            : projectionKind === "application"
              ? metadata.application ?? metadata.domain ?? node.family
              : metadata.domain ?? metadata.path ?? metadata.module ?? node.family;
    result.set(node.id, stableClusterKey(String(key)));
  }
  return result;
}

function computeDependencyDepths(nodeIds: readonly string[], edges: readonly KnowledgeEdge[]): Map<string, number> {
  const ids = new Set(nodeIds);
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string[]>();
  for (const id of nodeIds) {
    incoming.set(id, 0);
    outgoing.set(id, []);
  }
  for (const edge of edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target) || !DEPENDENCY_RELATIONSHIPS.has(edge.type)) continue;
    outgoing.get(edge.source)?.push(edge.target);
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
  }
  for (const targets of outgoing.values()) targets.sort();
  const queue = nodeIds.filter((id) => (incoming.get(id) ?? 0) === 0).sort();
  let cursor = 0;
  const depth = new Map(nodeIds.map((id) => [id, 0]));
  while (cursor < queue.length) {
    const source = queue[cursor++]!;
    for (const target of outgoing.get(source) ?? []) {
      depth.set(target, Math.max(depth.get(target) ?? 0, (depth.get(source) ?? 0) + 1));
      incoming.set(target, (incoming.get(target) ?? 1) - 1);
      if ((incoming.get(target) ?? 0) === 0) queue.push(target);
    }
  }
  for (const id of nodeIds) {
    if ((incoming.get(id) ?? 0) > 0) depth.set(id, Math.max(depth.get(id) ?? 0, 1));
  }
  return depth;
}

function computeAdjacentClusters(edges: readonly KnowledgeEdge[], clusters: ReadonlyMap<string, string>): Map<string, readonly string[]> {
  const result = new Map<string, Set<string>>();
  for (const edge of edges) {
    const sourceCluster = clusters.get(edge.source);
    const targetCluster = clusters.get(edge.target);
    if (!sourceCluster || !targetCluster || sourceCluster === targetCluster) continue;
    if (!result.has(edge.source)) result.set(edge.source, new Set());
    if (!result.has(edge.target)) result.set(edge.target, new Set());
    result.get(edge.source)!.add(targetCluster);
    result.get(edge.target)!.add(sourceCluster);
  }
  return new Map([...result.entries()].map(([id, set]) => [id, [...set].sort()]));
}

function computeHubIds(nodes: readonly KnowledgeNode[], snapshot: GraphSnapshot): ReadonlySet<string> {
  const targetCount = Math.max(4, Math.ceil(Math.sqrt(nodes.length) * 0.75));
  const ranked = nodes.map((node) => {
    const centrality = snapshot.metrics.centrality[node.id];
    const degree = centrality?.degree ?? 0;
    const explicit = typeof node.metadata.importance === "number" ? node.metadata.importance : 0;
    return { id: node.id, score: degree * 4 + explicit * 3 + (centrality?.pageRank ?? 0) };
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return new Set(ranked.slice(0, targetCount).map((item) => item.id));
}

function computeBridgeIds(nodes: readonly KnowledgeNode[], snapshot: GraphSnapshot, adjacentClusters: ReadonlyMap<string, readonly string[]>): ReadonlySet<string> {
  const targetCount = Math.max(4, Math.ceil(Math.sqrt(nodes.length) * 0.8));
  const ranked = nodes.map((node) => {
    const centrality = snapshot.metrics.centrality[node.id];
    const degree = centrality?.degree ?? 0;
    const adjacentClusterCount = adjacentClusters.get(node.id)?.length ?? 0;
    const text = `${node.name} ${(node.metadata.tags ?? []).join(" ")} ${node.metadata.domain ?? ""}`.toLowerCase();
    const bridgeTerm = [...BRIDGE_TERMS].some((term) => text.includes(term)) ? 3 : 0;
    return { id: node.id, score: adjacentClusterCount * 8 + degree * 1.5 + bridgeTerm + (centrality?.pageRank ?? 0) };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return new Set(ranked.slice(0, targetCount).map((item) => item.id));
}

function analyzeNode(
  node: KnowledgeNode,
  snapshot: GraphSnapshot,
  clusters: ReadonlyMap<string, string>,
  dependencyDepths: ReadonlyMap<string, number>,
  adjacentClusters: ReadonlyMap<string, readonly string[]>,
  hubIds: ReadonlySet<string>,
  bridgeIds: ReadonlySet<string>,
): NodeAnalysis {
  const centrality = snapshot.metrics.centrality[node.id];
  const degree = centrality?.degree ?? 0;
  const explicit = typeof node.metadata.importance === "number" ? node.metadata.importance : undefined;
  const graphImportance = degree / Math.max(1, Math.sqrt(snapshot.metadata.nodeCount));
  const importance = clamp(explicit ?? graphImportance);
  const adjacent = adjacentClusters.get(node.id) ?? [];
  return {
    node,
    degree,
    importance,
    clusterKey: clusters.get(node.id) ?? stableClusterKey(node.family),
    dependencyDepth: dependencyDepths.get(node.id) ?? 0,
    hierarchyLayer: inferHierarchyLayer(node),
    adjacentClusters: adjacent,
    isHub: hubIds.has(node.id),
    isBridge: bridgeIds.has(node.id),
  };
}

function buildClusterDrafts(analysis: readonly NodeAnalysis[], layout: LayoutKind): readonly Omit<LayoutCluster, "centroid" | "radius" | "density" | "hubCount">[] {
  const groups = new Map<string, NodeAnalysis[]>();
  for (const item of analysis) {
    const group = groups.get(item.clusterKey);
    if (group) group.push(item);
    else groups.set(item.clusterKey, [item]);
  }
  const kind = layout === "research" ? "research" : layout === "dependency" || layout === "hierarchical" ? "curriculum" : layout === "domain" ? "domain" : "implementation";
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([id, members]) => ({
    id,
    kind,
    label: id,
    members: members.map((member) => member.node.id).sort(),
    importance: clamp(members.reduce((sum, member) => sum + member.importance, 0) / Math.max(1, members.length)),
  }));
}

function assignClusterAnchors(clusters: readonly Omit<LayoutCluster, "centroid" | "radius" | "density" | "hubCount">[], constraints: CanonicalLayoutConstraints): Map<string, WorldPoint> {
  const count = Math.max(1, clusters.length);
  const orbit = Math.max(constraints.clusterSpacing, constraints.clusterSpacing * Math.sqrt(count) * 0.58);
  const result = new Map<string, WorldPoint>();
  clusters.forEach((cluster, index) => {
    const semanticAnchor = semanticClusterAnchor(cluster.id, constraints.clusterSpacing);
    if (semanticAnchor) {
      result.set(cluster.id, semanticAnchor);
      return;
    }
    const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
    const weight = 1 + cluster.importance * 0.18;
    result.set(cluster.id, { x: Math.cos(angle) * orbit * weight, y: Math.sin(angle) * orbit * 0.72 * weight });
  });
  return result;
}

function semanticClusterAnchor(clusterId: string, spacing: number): WorldPoint | null {
  const scale = spacing / 660;
  const anchors: Record<string, WorldPoint> = {
    mathematics: { x: -680, y: 180 },
    calculus: { x: -560, y: -40 },
    statistics: { x: -420, y: -220 },
    programming: { x: -360, y: 280 },
    research: { x: -240, y: -340 },
    "machine-learning": { x: -80, y: 60 },
    "deep-learning": { x: 120, y: -10 },
    "computer-vision": { x: 380, y: -240 },
    nlp: { x: 340, y: 200 },
    llms: { x: 560, y: 60 },
    "llm-engineering": { x: 720, y: 260 },
    agents: { x: 800, y: -160 },
    mlops: { x: 540, y: 400 },
  };
  const anchor = anchors[clusterId];
  return anchor ? { x: round(anchor.x * scale), y: round(anchor.y * scale) } : null;
}

interface ClusterShape {
  readonly xScale: number;
  readonly yScale: number;
  readonly hubBias: number;
  readonly perimeterWeight: number;
}

const CLUSTER_SHAPES: Record<string, ClusterShape> = {
  mathematics: { xScale: 1.0, yScale: 0.75, hubBias: 0.6, perimeterWeight: 0.3 },
  calculus: { xScale: 0.85, yScale: 1.1, hubBias: 0.5, perimeterWeight: 0.25 },
  statistics: { xScale: 1.15, yScale: 0.8, hubBias: 0.55, perimeterWeight: 0.35 },
  programming: { xScale: 1.3, yScale: 0.7, hubBias: 0.45, perimeterWeight: 0.2 },
  research: { xScale: 0.9, yScale: 1.2, hubBias: 0.65, perimeterWeight: 0.4 },
  "machine-learning": { xScale: 1.1, yScale: 1.0, hubBias: 0.5, perimeterWeight: 0.3 },
  "deep-learning": { xScale: 1.0, yScale: 1.15, hubBias: 0.55, perimeterWeight: 0.35 },
  "computer-vision": { xScale: 0.75, yScale: 1.3, hubBias: 0.6, perimeterWeight: 0.3 },
  nlp: { xScale: 1.2, yScale: 0.85, hubBias: 0.5, perimeterWeight: 0.25 },
  llms: { xScale: 1.05, yScale: 1.05, hubBias: 0.55, perimeterWeight: 0.3 },
  "llm-engineering": { xScale: 1.15, yScale: 0.9, hubBias: 0.5, perimeterWeight: 0.25 },
  agents: { xScale: 0.95, yScale: 1.15, hubBias: 0.6, perimeterWeight: 0.35 },
  mlops: { xScale: 1.25, yScale: 0.8, hubBias: 0.45, perimeterWeight: 0.2 },
};

const DEFAULT_CLUSTER_SHAPE: ClusterShape = { xScale: 1.0, yScale: 1.0, hubBias: 0.5, perimeterWeight: 0.3 };

function clusterShapeFor(clusterId: string): ClusterShape {
  return CLUSTER_SHAPES[clusterId] ?? DEFAULT_CLUSTER_SHAPE;
}

function solveSemanticPositions(analysis: readonly NodeAnalysis[], clusterAnchors: ReadonlyMap<string, WorldPoint>, layout: LayoutKind, constraints: CanonicalLayoutConstraints): Map<string, WorldPoint> {
  const groups = new Map<string, NodeAnalysis[]>();
  for (const item of analysis) {
    const group = groups.get(item.clusterKey);
    if (group) group.push(item);
    else groups.set(item.clusterKey, [item]);
  }
  const result = new Map<string, WorldPoint>();
  for (const [clusterKey, members] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const center = clusterAnchors.get(clusterKey) ?? { x: 0, y: 0 };
    const shape = clusterShapeFor(clusterKey);
    const sorted = [...members].sort((a, b) => b.isHub === a.isHub ? a.node.id.localeCompare(b.node.id) : Number(b.isHub) - Number(a.isHub));
    const hubRankById = new Map(sorted.filter((item) => item.isHub).map((item, rank) => [item.node.id, rank]));
    const bridgeRankById = new Map(sorted.filter((item) => item.isBridge && !item.isHub).map((item, rank) => [item.node.id, rank]));
    const averageDepth = sorted.reduce((sum, item) => sum + item.dependencyDepth, 0) / Math.max(1, sorted.length);
    const totalMembers = sorted.length;
    sorted.forEach((item, index) => {
      const importanceRank = index / Math.max(1, totalMembers);
      const ring = Math.ceil(Math.sqrt(index + 1));
      const goldenAngle = ((index + 1) * 2.399963229728653 + stableAngle(clusterKey) * 0.13) % (Math.PI * 2);
      const baseRadius = (constraints.minimumNodeDistance + constraints.labelPadding + labelWidth(item.node)) * ring * constraints.clusterInflation;
      const importanceFactor = 1.0 - importanceRank * 0.25;
      const semanticRadius = baseRadius * importanceFactor;
      let x = center.x + Math.cos(goldenAngle) * semanticRadius * shape.xScale;
      let y = center.y + Math.sin(goldenAngle) * semanticRadius * shape.yScale;
      if (layout === "dependency" || layout === "hierarchical") {
        x = center.x + (item.dependencyDepth - averageDepth) * constraints.corridorSpacing;
        y = center.y + (item.hierarchyLayer - 0.5) * constraints.hierarchyLayerSpacing + (index - sorted.length / 2) * constraints.minimumNodeDistance * 0.48;
      }
      if (item.isHub) {
        const hubRadiusMultiplier = 1.0 + shape.hubBias * 0.4;
        const hubRank = hubRankById.get(item.node.id) ?? 0;
        const hubRing = Math.ceil(Math.sqrt(hubRank + 1));
        const hubAngle = ((hubRank + 1) * 2.399963229728653 + stableAngle(`hub:${clusterKey}`) * 0.17) % (Math.PI * 2);
        const hubRadius = (constraints.hubSpacing * hubRadiusMultiplier + labelWidth(item.node) * 0.8) * hubRing;
        x = center.x + Math.cos(hubAngle) * hubRadius * shape.xScale;
        y = center.y + Math.sin(hubAngle) * hubRadius * shape.yScale;
      }
      if (item.isBridge && item.adjacentClusters.length > 0) {
        const adjacentCenters = item.adjacentClusters.map((key) => clusterAnchors.get(key)).filter((point): point is WorldPoint => Boolean(point));
        const target = averagePoint([center, ...adjacentCenters]);
        const bridgeRank = bridgeRankById.get(item.node.id) ?? 0;
        const bridgeRing = Math.ceil(Math.sqrt(bridgeRank + 1));
        const offsetAngle = ((bridgeRank + 1) * 2.399963229728653 + stableAngle(`bridge:${clusterKey}`) * 0.11) % (Math.PI * 2);
        const bridgeRadius = (constraints.bridgeSpacing + labelWidth(item.node) * 0.55) * bridgeRing;
        x = (center.x + target.x) / 2 + Math.cos(offsetAngle) * bridgeRadius * shape.xScale;
        y = (center.y + target.y) / 2 + Math.sin(offsetAngle) * bridgeRadius * shape.yScale;
      }
      result.set(item.node.id, { x: round(x), y: round(y) });
    });
  }
  return result;
}

function resolveDensity(positions: ReadonlyMap<string, WorldPoint>, analysis: readonly NodeAnalysis[], constraints: CanonicalLayoutConstraints): Map<string, WorldPoint> {
  let current = new Map(positions);
  const hubIds = new Set(analysis.filter((item) => item.isHub).map((item) => item.node.id));
  for (let pass = 0; pass < constraints.maxDensityCorrectionPasses; pass += 1) {
    const grid = new Map<string, string[]>();
    const next = new Map<string, WorldPoint>();
    for (const item of [...analysis].sort((a, b) => b.importance - a.importance || a.node.id.localeCompare(b.node.id))) {
      const position = current.get(item.node.id)!;
      const isHub = hubIds.has(item.node.id);
      const hubBonus = isHub ? constraints.minimumNodeDistance * 0.6 : 0;
      const radius = constraints.minimumNodeDistance + labelWidth(item.node) * 0.18 + hubBonus;
      let resolved = position;
      for (const neighborId of nearbyIds(position, grid, constraints.densityCellSize)) {
        const neighbor = next.get(neighborId);
        if (!neighbor) continue;
        const gap = distance(resolved, neighbor);
        if (gap >= radius) continue;
        const angle = stableAngle(`${item.node.id}:${neighborId}:${pass}`);
        const push = (radius - gap + constraints.minimumNodeDistance * 0.35) / 2;
        resolved = { x: round(resolved.x + Math.cos(angle) * push), y: round(resolved.y + Math.sin(angle) * push) };
      }
      next.set(item.node.id, resolved);
      const cell = cellKey(resolved, constraints.densityCellSize);
      const bucket = grid.get(cell);
      if (bucket) bucket.push(item.node.id);
      else grid.set(cell, [item.node.id]);
    }
    current = next;
  }
  return current;
}

function finalizeClusters(
  drafts: readonly Omit<LayoutCluster, "centroid" | "radius" | "density" | "hubCount">[],
  positions: ReadonlyMap<string, WorldPoint>,
  analysis: readonly NodeAnalysis[],
  constraints: CanonicalLayoutConstraints,
): readonly LayoutCluster[] {
  const analysisById = new Map(analysis.map((item) => [item.node.id, item]));
  return drafts.map((cluster) => {
    const points = cluster.members.map((id) => positions.get(id)).filter((point): point is WorldPoint => Boolean(point));
    const centroid = averagePoint(points);
    const radius = Math.max(constraints.clusterSpacing * 0.28, Math.max(...points.map((point) => distance(point, centroid)), 0) + constraints.boundaryPadding * 0.25);
    return {
      ...cluster,
      centroid,
      radius: round(radius),
      density: round(cluster.members.length / Math.max(1, Math.PI * radius * radius), 8),
      hubCount: cluster.members.filter((id) => analysisById.get(id)?.isHub).length,
    };
  });
}

function computeLayoutMetrics(
  positions: ReadonlyMap<string, WorldPoint>,
  analysis: readonly NodeAnalysis[],
  edges: readonly KnowledgeEdge[],
  clusters: readonly LayoutCluster[],
  constraints: CanonicalLayoutConstraints,
): CanonicalLayoutMetrics {
  const bounds = computePositionBounds(positions, constraints.boundaryPadding);
  const clusterQuality = computeClusterQuality(positions, clusters);
  const collisionScore = 1 / (1 + countCollisions(positions, analysis, constraints) / Math.max(1, analysis.length));
  const crossingScore = 1 / (1 + estimateEdgeCrossings(positions, edges, constraints) / Math.max(1, edges.length * 20));
  const densityScore = computeDensityScore(positions, analysis, constraints);
  const dependencyScore = computeDependencyCorridorScore(positions, edges);
  const layoutQualityScore = round((collisionScore * 0.22 + crossingScore * 0.14 + densityScore * 0.16 + clusterQuality.silhouetteScore * 0.2 + dependencyScore * 0.16 + Math.min(1, clusterQuality.clusterSeparation) * 0.12) * 100, 2);
  return {
    collisionPairs: countCollisions(positions, analysis, constraints),
    edgeCrossingsEstimate: estimateEdgeCrossings(positions, edges, constraints),
    clusterCohesion: clusterQuality.clusterCohesion,
    clusterSeparation: clusterQuality.clusterSeparation,
    silhouetteScore: clusterQuality.silhouetteScore,
    densityScore,
    layoutQualityScore,
    bridgeCount: analysis.filter((item) => item.isBridge).length,
    hubCount: analysis.filter((item) => item.isHub).length,
    dependencyCorridorScore: dependencyScore,
    bounds,
  };
}

function computeClusterQuality(positions: ReadonlyMap<string, WorldPoint>, clusters: readonly LayoutCluster[]): Pick<CanonicalLayoutMetrics, "clusterCohesion" | "clusterSeparation" | "silhouetteScore"> {
  const cohesion = average(clusters.map((cluster) => cluster.members.reduce((sum, id) => sum + distance(positions.get(id) ?? cluster.centroid, cluster.centroid), 0) / Math.max(1, cluster.members.length) / Math.max(1, cluster.radius)));
  const centroidDistances: number[] = [];
  for (let i = 0; i < clusters.length; i += 1) {
    for (let j = i + 1; j < clusters.length; j += 1) centroidDistances.push(distance(clusters[i]!.centroid, clusters[j]!.centroid) / Math.max(1, clusters[i]!.radius + clusters[j]!.radius));
  }
  const separation = average(centroidDistances);
  const silhouette = clamp(separation / (separation + cohesion + 0.001));
  return { clusterCohesion: round(cohesion, 4), clusterSeparation: round(separation, 4), silhouetteScore: round(silhouette, 4) };
}

function computeDensityScore(positions: ReadonlyMap<string, WorldPoint>, analysis: readonly NodeAnalysis[], constraints: CanonicalLayoutConstraints): number {
  const grid = new Map<string, number>();
  for (const item of analysis) {
    const position = positions.get(item.node.id);
    if (!position) continue;
    const key = cellKey(position, constraints.densityCellSize * 2);
    grid.set(key, (grid.get(key) ?? 0) + 1);
  }
  const values = [...grid.values()];
  if (!values.length) return 1;
  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return round(1 / (1 + Math.sqrt(variance) / Math.max(1, mean)), 4);
}

function countCollisions(positions: ReadonlyMap<string, WorldPoint>, analysis: readonly NodeAnalysis[], constraints: CanonicalLayoutConstraints): number {
  const grid = new Map<string, string[]>();
  const radiusById = new Map(analysis.map((item) => [item.node.id, constraints.minimumNodeDistance + labelWidth(item.node) * 0.15]));
  let collisions = 0;
  for (const item of analysis) {
    const position = positions.get(item.node.id);
    if (!position) continue;
    for (const id of nearbyIds(position, grid, constraints.densityCellSize)) {
      const other = positions.get(id);
      if (!other) continue;
      if (distance(position, other) < Math.max(radiusById.get(id) ?? 0, radiusById.get(item.node.id) ?? 0)) collisions += 1;
    }
    const cell = cellKey(position, constraints.densityCellSize);
    const bucket = grid.get(cell);
    if (bucket) bucket.push(item.node.id);
    else grid.set(cell, [item.node.id]);
  }
  return collisions;
}

function estimateEdgeCrossings(positions: ReadonlyMap<string, WorldPoint>, edges: readonly KnowledgeEdge[], constraints: CanonicalLayoutConstraints): number {
  const candidates = edges.filter((edge) => positions.has(edge.source) && positions.has(edge.target)).slice(0, constraints.maxExactEdgeCrossingEdges);
  if (edges.length > constraints.maxExactEdgeCrossingEdges) {
    const exact = estimateEdgeCrossings(positions, candidates, { ...constraints, maxExactEdgeCrossingEdges: candidates.length });
    return Math.round(exact * (edges.length / Math.max(1, candidates.length)) * 0.55);
  }
  let crossings = 0;
  for (let i = 0; i < candidates.length; i += 1) {
    const a = candidates[i]!;
    const a1 = positions.get(a.source)!;
    const a2 = positions.get(a.target)!;
    for (let j = i + 1; j < candidates.length; j += 1) {
      const b = candidates[j]!;
      if (a.source === b.source || a.source === b.target || a.target === b.source || a.target === b.target) continue;
      if (segmentsIntersect(a1, a2, positions.get(b.source)!, positions.get(b.target)!)) crossings += 1;
    }
  }
  return crossings;
}

function computeDependencyCorridorScore(positions: ReadonlyMap<string, WorldPoint>, edges: readonly KnowledgeEdge[]): number {
  const dependencyEdges = edges.filter((edge) => DEPENDENCY_RELATIONSHIPS.has(edge.type) && positions.has(edge.source) && positions.has(edge.target));
  if (!dependencyEdges.length) return 1;
  const ordered = dependencyEdges.filter((edge) => (positions.get(edge.target)!.x - positions.get(edge.source)!.x) >= -20).length;
  return round(ordered / dependencyEdges.length, 4);
}

function computePositionBounds(positions: ReadonlyMap<string, WorldPoint>, padding: number): WorldBounds {
  const points = [...positions.values()];
  if (!points.length) return { x: 0, y: 0, width: 0, height: 0 };
  const minX = Math.min(...points.map((point) => point.x)) - padding;
  const minY = Math.min(...points.map((point) => point.y)) - padding;
  const maxX = Math.max(...points.map((point) => point.x)) + padding;
  const maxY = Math.max(...points.map((point) => point.y)) + padding;
  return { x: round(minX), y: round(minY), width: round(maxX - minX), height: round(maxY - minY) };
}

function nearbyIds(position: WorldPoint, grid: ReadonlyMap<string, readonly string[]>, cellSize: number): readonly string[] {
  const x = Math.floor(position.x / cellSize);
  const y = Math.floor(position.y / cellSize);
  const result: string[] = [];
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dy = -1; dy <= 1; dy += 1) result.push(...(grid.get(`${x + dx}:${y + dy}`) ?? []));
  }
  return result;
}

function cellKey(position: WorldPoint, cellSize: number): string {
  return `${Math.floor(position.x / cellSize)}:${Math.floor(position.y / cellSize)}`;
}

function inferHierarchyLayer(node: KnowledgeNode): number {
  if (node.type === "theory" || node.type === "principle") return 0;
  if (node.type === "concept" || node.type === "method" || node.type === "algorithm") return 1;
  if (node.type === "architecture" || node.type === "framework" || node.type === "library" || node.type === "tool") return 2;
  if (node.family === "evidence" || node.type === "benchmark" || node.type === "experiment") return 3;
  return 1;
}

function researchTag(tags: readonly string[]): string | undefined {
  return tags.find((tag) => tag.includes("transformer") || tag.includes("attention") || tag.includes("embedding") || tag.includes("vision") || tag.includes("robot"));
}

function stableClusterKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unclassified";
}

function stableAngle(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) / 4294967295) * Math.PI * 2;
}

function labelWidth(node: KnowledgeNode): number {
  return Math.min(120, Math.max(24, node.name.length * 5.8));
}

function average(values: readonly number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function averagePoint(points: readonly WorldPoint[]): WorldPoint {
  if (!points.length) return { x: 0, y: 0 };
  return { x: round(points.reduce((sum, point) => sum + point.x, 0) / points.length), y: round(points.reduce((sum, point) => sum + point.y, 0) / points.length) };
}

function distance(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function segmentsIntersect(a: WorldPoint, b: WorldPoint, c: WorldPoint, d: WorldPoint): boolean {
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);
  return o1 !== o2 && o3 !== o4;
}

function orientation(a: WorldPoint, b: WorldPoint, c: WorldPoint): number {
  const value = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
  if (Math.abs(value) < 0.000001) return 0;
  return value > 0 ? 1 : 2;
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
