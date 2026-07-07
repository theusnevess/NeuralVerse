import type { GraphSnapshot, KnowledgeNode } from "../../graph-foundation/index.ts";
import type { WorldPoint } from "../types.ts";
import type { LayoutCluster } from "../layout-engine.ts";
import type { ClusterQualityMetrics, LayoutAnalysisContext } from "./types.ts";

const SAMPLE_SIZE_FOR_SILHOUETTE = 256;

export function computeClusterQuality(
  positions: ReadonlyMap<string, WorldPoint>,
  context: LayoutAnalysisContext,
): ClusterQualityMetrics {
  const { clusters } = context;
  if (!clusters.length) {
    return {
      clusterCount: 0,
      silhouetteScore: 0,
      cohesionAverage: 0,
      separationAverage: 0,
      intraClusterDistanceAverage: 0,
      interClusterDistanceAverage: 0,
      hubCentralityScore: 0,
      bridgeVisibilityScore: 0,
      neighborhoodEntropy: 0,
      densityHomogeneity: 1,
    };
  }
  const clusterCenters = new Map(clusters.map((cluster) => [cluster.id, cluster.centroid]));
  const memberPositions = new Map<string, WorldPoint[]>();
  for (const cluster of clusters) {
    const list: WorldPoint[] = [];
    for (const id of cluster.members) {
      const point = positions.get(id);
      if (point) list.push(point);
    }
    memberPositions.set(cluster.id, list);
  }

  const intraDistances = clusters.map((cluster) => averageIntraClusterDistance(memberPositions.get(cluster.id) ?? []));
  const interDistances = interClusterDistances(clusters, clusterCenters);
  const cohesion = average(clusters.map((cluster) => clusterCohesion(memberPositions.get(cluster.id) ?? [], cluster.radius)));
  const separation = interDistances.average;
  const silhouette = sampleSilhouette(positions, clusters, context);
  const hubCentrality = computeHubCentrality(context, clusters, positions);
  const bridgeVisibility = computeBridgeVisibility(context, clusters, positions);
  const entropy = neighborhoodEntropy(context.snapshot, positions, clusters);
  const homogeneity = densityHomogeneity(memberPositions, context);

  return {
    clusterCount: clusters.length,
    silhouetteScore: round(silhouette, 4),
    cohesionAverage: round(cohesion, 4),
    separationAverage: round(separation, 4),
    intraClusterDistanceAverage: round(average(intraDistances), 4),
    interClusterDistanceAverage: round(separation, 4),
    hubCentralityScore: round(hubCentrality, 4),
    bridgeVisibilityScore: round(bridgeVisibility, 4),
    neighborhoodEntropy: round(entropy, 4),
    densityHomogeneity: round(homogeneity, 4),
  };
}

function averageIntraClusterDistance(points: readonly WorldPoint[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  let count = 0;
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      total += distance(points[i]!, points[j]!);
      count += 1;
    }
  }
  return count ? total / count : 0;
}

function interClusterDistances(
  clusters: readonly LayoutCluster[],
  centers: ReadonlyMap<string, WorldPoint>,
): { readonly average: number; readonly min: number } {
  let total = 0;
  let count = 0;
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < clusters.length; i += 1) {
    for (let j = i + 1; j < clusters.length; j += 1) {
      const a = centers.get(clusters[i]!.id);
      const b = centers.get(clusters[j]!.id);
      if (!a || !b) continue;
      const d = distance(a, b);
      total += d;
      count += 1;
      if (d < min) min = d;
    }
  }
  return { average: count ? total / count : 0, min: count ? min : 0 };
}

function clusterCohesion(points: readonly WorldPoint[], radius: number): number {
  if (!points.length || radius === 0) return 0;
  const center = centroid(points);
  const avgDistance = points.reduce((sum, point) => sum + distance(point, center), 0) / points.length;
  return Math.min(1, avgDistance / Math.max(1, radius));
}

function sampleSilhouette(
  positions: ReadonlyMap<string, WorldPoint>,
  clusters: readonly LayoutCluster[],
  context: LayoutAnalysisContext,
): number {
  const idToCluster = new Map<string, string>();
  for (const cluster of clusters) {
    for (const id of cluster.members) idToCluster.set(id, cluster.id);
  }
  const allIds = [...idToCluster.keys()].sort();
  if (allIds.length === 0) return 0;
  const sampleSize = Math.min(SAMPLE_SIZE_FOR_SILHOUETTE, allIds.length);
  const step = Math.max(1, Math.floor(allIds.length / sampleSize));
  const samples: string[] = [];
  for (let i = 0; i < allIds.length && samples.length < sampleSize; i += step) samples.push(allIds[i]!);

  let total = 0;
  for (const id of samples) {
    const ownCluster = idToCluster.get(id)!;
    const ownMembers = clusters.find((c) => c.id === ownCluster)!.members;
    const a = averageDistanceTo(id, ownMembers, positions);
    let b = Number.POSITIVE_INFINITY;
    for (const other of clusters) {
      if (other.id === ownCluster) continue;
      const distanceToOther = averageDistanceTo(id, other.members, positions);
      if (distanceToOther < b) b = distanceToOther;
    }
    if (!Number.isFinite(b)) {
      total += 0;
      continue;
    }
    const denom = Math.max(a, b);
    total += denom === 0 ? 0 : (b - a) / denom;
  }
  return samples.length ? total / samples.length : 0;
}

function averageDistanceTo(id: string, members: readonly string[], positions: ReadonlyMap<string, WorldPoint>): number {
  const source = positions.get(id);
  if (!source) return 0;
  let total = 0;
  let count = 0;
  for (const member of members) {
    if (member === id) continue;
    const target = positions.get(member);
    if (!target) continue;
    total += distance(source, target);
    count += 1;
  }
  return count ? total / count : 0;
}

function computeHubCentrality(
  context: LayoutAnalysisContext,
  clusters: readonly LayoutCluster[],
  positions: ReadonlyMap<string, WorldPoint>,
): number {
  if (!context.hubIds.size) return 0;
  const clusterCenters = new Map(clusters.map((cluster) => [cluster.id, cluster.centroid]));
  let weighted = 0;
  let weightTotal = 0;
  for (const id of context.hubIds) {
    const point = positions.get(id);
    if (!point) continue;
    const importance = context.importanceById.get(id) ?? 0;
    const closest = closestClusterCenter(point, clusterCenters);
    const clusterRadius = closest ? clusters.find((c) => c.id === closest)?.radius ?? 0 : 0;
    const distanceFromCenter = closest ? distance(point, clusterCenters.get(closest)!) : 0;
    const inside = clusterRadius > 0 ? Math.max(0, 1 - distanceFromCenter / clusterRadius) : 0;
    weighted += inside * (0.5 + importance * 0.5);
    weightTotal += 0.5 + importance * 0.5;
  }
  return weightTotal > 0 ? weighted / weightTotal : 0;
}

function computeBridgeVisibility(
  context: LayoutAnalysisContext,
  clusters: readonly LayoutCluster[],
  positions: ReadonlyMap<string, WorldPoint>,
): number {
  if (!context.bridgeIds.size) return 0;
  const clusterCenters = new Map(clusters.map((cluster) => [cluster.id, cluster.centroid]));
  let weighted = 0;
  let weightTotal = 0;
  for (const id of context.bridgeIds) {
    const point = positions.get(id);
    if (!point) continue;
    const importance = context.importanceById.get(id) ?? 0;
    const distances = [...clusterCenters.values()].map((center) => distance(point, center));
    const twoClosest = [...distances].sort((a, b) => a - b).slice(0, 2);
    if (twoClosest.length < 2) continue;
    const expected = (twoClosest[0]! + twoClosest[1]!) / 2;
    const gap = Math.abs(twoClosest[0]! - twoClosest[1]!);
    const visibility = expected > 0 ? Math.min(1, gap / expected + 0.4) : 0;
    weighted += visibility * (0.4 + importance * 0.6);
    weightTotal += 0.4 + importance * 0.6;
  }
  return weightTotal > 0 ? weighted / weightTotal : 0;
}

function neighborhoodEntropy(
  snapshot: GraphSnapshot,
  positions: ReadonlyMap<string, WorldPoint>,
  clusters: readonly LayoutCluster[],
): number {
  const clusterDistribution = new Map<string, number>();
  let totalEdges = 0;
  for (const edge of snapshot.edges.values()) {
    if (!positions.has(edge.source) || !positions.has(edge.target)) continue;
    const sourceCluster = clusterOfNode(snapshot.nodes.get(edge.source), clusters);
    if (!sourceCluster) continue;
    clusterDistribution.set(sourceCluster, (clusterDistribution.get(sourceCluster) ?? 0) + 1);
    totalEdges += 1;
  }
  if (!totalEdges) return 0;
  let entropy = 0;
  for (const count of clusterDistribution.values()) {
    if (count === 0) continue;
    const p = count / totalEdges;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function clusterOfNode(node: KnowledgeNode | undefined, clusters: readonly LayoutCluster[]): string | undefined {
  if (!node) return undefined;
  for (const cluster of clusters) {
    if (cluster.members.includes(node.id)) return cluster.id;
  }
  return undefined;
}

function densityHomogeneity(
  memberPositions: ReadonlyMap<string, WorldPoint[]>,
  context: LayoutAnalysisContext,
): number {
  if (memberPositions.size === 0) return 1;
  const densities: number[] = [];
  for (const [clusterId, points] of memberPositions) {
    if (!points.length) continue;
    const cluster = context.clusterById.get(clusterId);
    if (!cluster) continue;
    const area = Math.max(1, Math.PI * cluster.radius * cluster.radius);
    densities.push(points.length / area);
  }
  if (!densities.length) return 1;
  const mean = average(densities);
  if (mean === 0) return 1;
  const variance = average(densities.map((value) => (value - mean) ** 2));
  return Math.max(0, 1 - Math.sqrt(variance) / mean);
}

function centroid(points: readonly WorldPoint[]): WorldPoint {
  if (!points.length) return { x: 0, y: 0 };
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  };
}

function closestClusterCenter(point: WorldPoint, centers: ReadonlyMap<string, WorldPoint>): string | undefined {
  let best: string | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [id, center] of centers) {
    const d = distance(point, center);
    if (d < bestDistance) {
      bestDistance = d;
      best = id;
    }
  }
  return best;
}

function average(values: readonly number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function distance(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
