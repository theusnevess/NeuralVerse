import type { KnowledgeEdge } from "../../graph-foundation/index.ts";
import type { WorldPoint } from "../types.ts";
import type { CrossingReport, LayoutAnalysisContext } from "./types.ts";

const MAX_UNTANGLE_ITERATIONS = 3;
const BARYCENTRIC_BUCKETS = 32;
const SWAP_IMPROVEMENT_THRESHOLD = 1;
const HUB_NEIGHBORHOOD_RADIUS = 220;
const CROSSING_CELL_SIZE = 180;

export function reduceCrossings(
  positions: ReadonlyMap<string, WorldPoint>,
  edges: readonly KnowledgeEdge[],
  context: LayoutAnalysisContext,
): { readonly positions: Map<string, WorldPoint>; readonly report: CrossingReport } {
  const startingCrossings = estimateCrossings(positions, edges);
  let working = new Map(positions);
  let best = new Map(positions);
  let bestCrossings = startingCrossings;
  let totalUntangled = 0;
  let iterations = 0;

  for (let iteration = 0; iteration < MAX_UNTANGLE_ITERATIONS; iteration += 1) {
    iterations = iteration + 1;
    const barycentric = reorderAroundHubs(working, edges, context);
    working = applyBarycentricReorder(working, barycentric);
    const swapped = applyLocalSwaps(working, edges, context);
    totalUntangled += swapped.improvement;
    working = swapped.positions;
    const candidateCrossings = estimateCrossings(working, edges);
    if (candidateCrossings < bestCrossings) {
      bestCrossings = candidateCrossings;
      best = new Map(working);
    }
    if (swapped.improvement < SWAP_IMPROVEMENT_THRESHOLD && iteration > 0) break;
  }

  const report: CrossingReport = {
    crossings: bestCrossings,
    crossingsPerEdge: round(bestCrossings / Math.max(1, edges.length), 4),
    tangleableEdges: countTangleableEdges(edges, context),
    untangledCrossings: Math.max(0, startingCrossings - bestCrossings),
    barycentricOrder: extractBarycentricSample(best, context),
    untangleIterations: iterations,
    improved: bestCrossings < startingCrossings,
  };
  return { positions: best, report };
}

function estimateCrossings(positions: ReadonlyMap<string, WorldPoint>, edges: readonly KnowledgeEdge[]): number {
  if (edges.length === 0) return 0;
  const edgeLengths = edges.map((edge) => {
    const a = positions.get(edge.source);
    const b = positions.get(edge.target);
    if (!a || !b) return Number.POSITIVE_INFINITY;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  });
  const buckets = new Map<number, KnowledgeEdge[]>();
  for (let i = 0; i < edges.length; i += 1) {
    const length = edgeLengths[i]!;
    if (!Number.isFinite(length)) continue;
    const bucket = Math.floor(length / CROSSING_CELL_SIZE);
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket)!.push(edges[i]!);
  }
  let count = 0;
  const sortedBuckets = [...buckets.keys()].sort((a, b) => a - b);
  for (const bucket of sortedBuckets) {
    const edgesInBucket = buckets.get(bucket)!;
    for (let i = 0; i < edgesInBucket.length; i += 1) {
      const a = edgesInBucket[i]!;
      const a1 = positions.get(a.source);
      const a2 = positions.get(a.target);
      if (!a1 || !a2) continue;
      for (let j = i + 1; j < edgesInBucket.length; j += 1) {
        const b = edgesInBucket[j]!;
        if (a.source === b.source || a.source === b.target || a.target === b.source || a.target === b.target) continue;
        const b1 = positions.get(b.source);
        const b2 = positions.get(b.target);
        if (!b1 || !b2) continue;
        if (segmentsIntersect(a1, a2, b1, b2)) count += 1;
      }
    }
  }
  return count;
}

function reorderAroundHubs(
  positions: ReadonlyMap<string, WorldPoint>,
  edges: readonly KnowledgeEdge[],
  context: LayoutAnalysisContext,
): Map<string, string[]> {
  const result = new Map<string, string[]>();
  for (const hubId of context.hubIds) {
    const center = positions.get(hubId);
    if (!center) continue;
    const buckets: string[][] = Array.from({ length: BARYCENTRIC_BUCKETS }, () => []);
    const neighbors = collectNeighbors(hubId, edges);
    for (const neighborId of neighbors) {
      const point = positions.get(neighborId);
      if (!point) continue;
      if (distance(point, center) > HUB_NEIGHBORHOOD_RADIUS) continue;
      const angle = Math.atan2(point.y - center.y, point.x - center.x);
      const bucket = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * BARYCENTRIC_BUCKETS) % BARYCENTRIC_BUCKETS;
      buckets[bucket]!.push(neighborId);
    }
    for (const bucket of buckets) bucket.sort();
    const flattened: string[] = [];
    for (const bucket of buckets) flattened.push(...bucket);
    result.set(hubId, flattened);
  }
  return result;
}

function applyBarycentricReorder(
  positions: ReadonlyMap<string, WorldPoint>,
  barycentric: Map<string, string[]>,
): Map<string, WorldPoint> {
  const next = new Map(positions);
  for (const [hubId, order] of barycentric) {
    const center = positions.get(hubId);
    if (!center) continue;
    const angles: number[] = [];
    for (const id of order) {
      const point = positions.get(id);
      if (!point) continue;
      angles.push(Math.atan2(point.y - center.y, point.x - center.x));
    }
    angles.sort((a, b) => a - b);
    order.forEach((id, index) => {
      const angle = angles[index] ?? angles[angles.length - 1] ?? 0;
      const radius = distance(positions.get(id) ?? center, center);
      next.set(id, {
        x: round(center.x + Math.cos(angle) * radius),
        y: round(center.y + Math.sin(angle) * radius),
      });
    });
  }
  return next;
}

function applyLocalSwaps(
  positions: ReadonlyMap<string, WorldPoint>,
  edges: readonly KnowledgeEdge[],
  context: LayoutAnalysisContext,
): { readonly positions: Map<string, WorldPoint>; readonly improvement: number } {
  const next = new Map(positions);
  let improvement = 0;
  for (const hubId of context.hubIds) {
    const center = positions.get(hubId);
    if (!center) continue;
    const neighbors = collectNeighbors(hubId, edges)
      .map((id) => positions.get(id))
      .filter((point): point is WorldPoint => Boolean(point))
      .sort((a, b) => Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x));
    for (let i = 0; i < neighbors.length - 1; i += 1) {
      const aId = edgeIdAt(neighbors[i]!, positions);
      const bId = edgeIdAt(neighbors[i + 1]!, positions);
      if (!aId || !bId) continue;
      const beforeCrossings = estimateCrossingsForPair(next, aId, bId, edges);
      swapPositions(next, aId, bId);
      const afterCrossings = estimateCrossingsForPair(next, aId, bId, edges);
      if (afterCrossings > beforeCrossings) {
        swapPositions(next, aId, bId);
      } else {
        improvement += beforeCrossings - afterCrossings;
      }
    }
  }
  return { positions: next, improvement };
}

function estimateCrossingsForPair(
  positions: ReadonlyMap<string, WorldPoint>,
  aId: string,
  bId: string,
  edges: readonly KnowledgeEdge[],
): number {
  const aEdges = edges.filter((edge) => edge.source === aId || edge.target === aId);
  const bEdges = edges.filter((edge) => edge.source === bId || edge.target === bId);
  let count = 0;
  for (const aEdge of aEdges) {
    const a1 = positions.get(aEdge.source);
    const a2 = positions.get(aEdge.target);
    if (!a1 || !a2) continue;
    for (const bEdge of bEdges) {
      if (aEdge.id === bEdge.id) continue;
      const b1 = positions.get(bEdge.source);
      const b2 = positions.get(bEdge.target);
      if (!b1 || !b2) continue;
      if (segmentsIntersect(a1, a2, b1, b2)) count += 1;
    }
  }
  return count;
}

function swapPositions(positions: Map<string, WorldPoint>, aId: string, bId: string): void {
  const a = positions.get(aId);
  const b = positions.get(bId);
  if (!a || !b) return;
  positions.set(aId, b);
  positions.set(bId, a);
}

function edgeIdAt(point: WorldPoint, positions: ReadonlyMap<string, WorldPoint>): string | undefined {
  for (const [id, candidate] of positions) {
    if (candidate.x === point.x && candidate.y === point.y) return id;
  }
  return undefined;
}

function collectNeighbors(hubId: string, edges: readonly KnowledgeEdge[]): string[] {
  const result = new Set<string>();
  for (const edge of edges) {
    if (edge.source === hubId) result.add(edge.target);
    else if (edge.target === hubId) result.add(edge.source);
  }
  return [...result].sort();
}

function countTangleableEdges(edges: readonly KnowledgeEdge[], context: LayoutAnalysisContext): number {
  let count = 0;
  for (const edge of edges) {
    if (context.hubIds.has(edge.source) || context.hubIds.has(edge.target)) count += 1;
  }
  return count;
}

function extractBarycentricSample(positions: ReadonlyMap<string, WorldPoint>, context: LayoutAnalysisContext): string[] {
  if (!context.hubIds.size) return [];
  const firstHub = [...context.hubIds][0]!;
  const center = positions.get(firstHub);
  if (!center) return [];
  return [...positions.entries()]
    .filter(([, point]) => distance(point, center) <= HUB_NEIGHBORHOOD_RADIUS && point !== center)
    .sort(([, a], [, b]) => Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x))
    .slice(0, 16)
    .map(([id]) => id);
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

function distance(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
