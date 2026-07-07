import type { GraphSnapshot, KnowledgeEdge, KnowledgeNode } from "../../graph-foundation/index.ts";
import type { WorldPoint } from "../types.ts";
import type { LayoutAnalysisContext, StabilityReport } from "./types.ts";

const MAX_DISPLACEMENT_RATIO = 0.55;
const NEW_NODE_INSERTION_RADIUS = 110;
const ANCHOR_BLEND = 0.85;
const HUB_LOCK_RATIO = 0.95;

export interface IncrementalAnchor {
  readonly positions: ReadonlyMap<string, WorldPoint>;
  readonly clusterCentroids: ReadonlyMap<string, WorldPoint>;
  readonly hubPositions: ReadonlyMap<string, WorldPoint>;
  readonly bridgePositions: ReadonlyMap<string, WorldPoint>;
  readonly timestamp: string;
}

export function createAnchor(
  positions: ReadonlyMap<string, WorldPoint>,
  context: LayoutAnalysisContext,
  timestamp: string,
): IncrementalAnchor {
  const clusterCentroids = new Map<string, WorldPoint>();
  for (const cluster of context.clusters) {
    clusterCentroids.set(cluster.id, cluster.centroid);
  }
  const hubPositions = new Map<string, WorldPoint>();
  const bridgePositions = new Map<string, WorldPoint>();
  for (const id of context.hubIds) {
    const point = positions.get(id);
    if (point) hubPositions.set(id, point);
  }
  for (const id of context.bridgeIds) {
    const point = positions.get(id);
    if (point) bridgePositions.set(id, point);
  }
  return { positions, clusterCentroids, hubPositions, bridgePositions, timestamp };
}

export function applyIncrementalAnchor(
  proposed: ReadonlyMap<string, WorldPoint>,
  context: LayoutAnalysisContext,
  anchor: IncrementalAnchor | undefined,
  snapshot: GraphSnapshot,
): Map<string, WorldPoint> {
  if (!anchor) return new Map(proposed);
  const blended = new Map<string, WorldPoint>();
  const previousPositions = anchor.positions;
  const newIds: string[] = [];
  const removedIds: string[] = [];
  const sharedIds: string[] = [];

  for (const [id, point] of proposed) {
    const previous = previousPositions.get(id);
    if (previous) {
      sharedIds.push(id);
      const importance = context.importanceById.get(id) ?? 0;
      const isHub = context.hubIds.has(id);
      const lockFactor = isHub ? HUB_LOCK_RATIO : 1 - importance * 0.4;
      const blendedPoint = blendPoints(previous, point, lockFactor);
      const maxDisplacement = context.constraints.minimumNodeDistance * MAX_DISPLACEMENT_RATIO * (isHub ? 0.5 : 1);
      const drift = distance(blendedPoint, previous);
      const clamped: WorldPoint = drift > maxDisplacement
        ? {
          x: round(previous.x + (blendedPoint.x - previous.x) * (maxDisplacement / drift)),
          y: round(previous.y + (blendedPoint.y - previous.y) * (maxDisplacement / drift)),
        }
        : blendedPoint;
      blended.set(id, clamped);
    } else {
      newIds.push(id);
    }
  }
  for (const id of previousPositions.keys()) {
    if (!proposed.has(id)) removedIds.push(id);
  }

  insertNewNodes(blended, proposed, newIds, context, snapshot);
  return blended;
}

export function measureStability(
  before: ReadonlyMap<string, WorldPoint>,
  after: ReadonlyMap<string, WorldPoint>,
  context: LayoutAnalysisContext,
): StabilityReport {
  const beforeIds = [...before.keys()];
  const afterIds = new Set(after.keys());
  const addedIds = beforeIds.filter((id) => !afterIds.has(id));
  const removedIds: string[] = [];
  const sharedIds: string[] = [];
  for (const id of afterIds) {
    if (before.has(id)) sharedIds.push(id);
    else removedIds.push(id);
  }

  let total = 0;
  let max = 0;
  let hubTotal = 0;
  let hubCount = 0;
  let bridgeTotal = 0;
  let bridgeCount = 0;
  const clusterDisplacements = new Map<string, { total: number; count: number }>();
  for (const id of sharedIds) {
    const previous = before.get(id)!;
    const next = after.get(id)!;
    const drift = distance(previous, next);
    total += drift;
    if (drift > max) max = drift;
    if (context.hubIds.has(id)) {
      hubTotal += drift;
      hubCount += 1;
    }
    if (context.bridgeIds.has(id)) {
      bridgeTotal += drift;
      bridgeCount += 1;
    }
    const clusterId = clusterOfId(id, context);
    const entry = clusterDisplacements.get(clusterId) ?? { total: 0, count: 0 };
    entry.total += drift;
    entry.count += 1;
    clusterDisplacements.set(clusterId, entry);
  }

  const average = sharedIds.length ? total / sharedIds.length : 0;
  const hubAverage = hubCount ? hubTotal / hubCount : 0;
  const bridgeAverage = bridgeCount ? bridgeTotal / bridgeCount : 0;
  let clusterTotal = 0;
  let clusterMembers = 0;
  for (const value of clusterDisplacements.values()) {
    clusterTotal += value.total / Math.max(1, value.count);
    clusterMembers += 1;
  }
  const clusterAverage = clusterMembers ? clusterTotal / clusterMembers : 0;
  const referenceScale = context.constraints.boundaryPadding * 4;
  const mentalMapScore = referenceScale > 0 ? round(1 / (1 + average / referenceScale), 4) : 1;

  return {
    beforeCount: before.size,
    afterCount: after.size,
    addedIds,
    removedIds,
    sharedIds,
    averageDisplacement: round(average, 4),
    maximumDisplacement: round(max, 4),
    clusterDisplacement: round(clusterAverage, 4),
    hubDisplacement: round(hubAverage, 4),
    bridgeDisplacement: round(bridgeAverage, 4),
    mentalMapScore,
  };
}

function insertNewNodes(
  blended: Map<string, WorldPoint>,
  proposed: ReadonlyMap<string, WorldPoint>,
  newIds: readonly string[],
  context: LayoutAnalysisContext,
  snapshot: GraphSnapshot,
): void {
  for (const id of newIds) {
    const point = proposed.get(id);
    if (!point) continue;
    const cluster = clusterOfId(id, context);
    const clusterAnchor = context.clusterById.get(cluster)?.centroid;
    if (clusterAnchor) {
      const drift = distance(point, clusterAnchor);
      if (drift > NEW_NODE_INSERTION_RADIUS) {
        const scale = NEW_NODE_INSERTION_RADIUS / drift;
        blended.set(id, {
          x: round(clusterAnchor.x + (point.x - clusterAnchor.x) * scale),
          y: round(clusterAnchor.y + (point.y - clusterAnchor.y) * scale),
        });
        continue;
      }
    }
    const relatedPoint = findRelatedNodePosition(id, context, snapshot);
    if (relatedPoint) {
      const drift = distance(point, relatedPoint);
      const target = drift > NEW_NODE_INSERTION_RADIUS
        ? {
          x: round(relatedPoint.x + (point.x - relatedPoint.x) * (NEW_NODE_INSERTION_RADIUS / drift)),
          y: round(relatedPoint.y + (point.y - relatedPoint.y) * (NEW_NODE_INSERTION_RADIUS / drift)),
        }
        : point;
      blended.set(id, target);
      continue;
    }
    blended.set(id, point);
  }
}

function findRelatedNodePosition(id: string, context: LayoutAnalysisContext, snapshot: GraphSnapshot): WorldPoint | undefined {
  for (const candidate of snapshot.index.adjacencyList.get(id) ?? new Set<string>()) {
    const point = context.positions.get(candidate);
    if (point) return point;
  }
  for (const candidate of snapshot.index.reverseAdjacencyList.get(id) ?? new Set<string>()) {
    const point = context.positions.get(candidate);
    if (point) return point;
  }
  return undefined;
}

function clusterOfId(id: string, context: LayoutAnalysisContext): string {
  for (const cluster of context.clusters) {
    if (cluster.members.includes(id)) return cluster.id;
  }
  return "unclassified";
}

function blendPoints(a: WorldPoint, b: WorldPoint, factor: number): WorldPoint {
  return {
    x: round(a.x + (b.x - a.x) * (1 - factor * ANCHOR_BLEND)),
    y: round(a.y + (b.y - a.y) * (1 - factor * ANCHOR_BLEND)),
  };
}

function distance(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
