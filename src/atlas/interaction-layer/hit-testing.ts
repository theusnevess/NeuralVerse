import type { VisualEdge, VisualNode, WorldPoint } from "../visualization-foundation/index.ts";
import { screenToWorld } from "./camera-controller.ts";
import { freezeInteraction } from "./immutability.ts";
import type { HitTarget, HitTestInput } from "./types.ts";

const DEFAULT_TOLERANCE = 10;

export function hitTest(input: HitTestInput): HitTarget {
  const world = screenToWorld(input.screenPoint, input.viewport, input.viewportSize);
  const tolerance = input.tolerance ?? DEFAULT_TOLERANCE;
  const node = hitTestNode(input.payload.nodes, world, tolerance);
  if (node) return freezeInteraction(node) as HitTarget;
  const edge = hitTestEdge(input.payload.edges, input.payload.nodes, world, tolerance);
  if (edge) return freezeInteraction(edge) as HitTarget;
  const region = hitTestRegion(input.payload.regions, world);
  if (region) return freezeInteraction(region) as HitTarget;
  return freezeInteraction({ kind: "background", distance: 0 }) as HitTarget;
}

function hitTestNode(nodes: readonly VisualNode[], point: WorldPoint, tolerance: number): HitTarget | null {
  let closest: Extract<HitTarget, { kind: "node" }> | null = null;
  for (const node of nodes) {
    if (node.visibility !== "visible") continue;
    const distance = distanceBetween(point, node.position);
    if (distance <= node.radius + tolerance && (!closest || distance < closest.distance)) {
      closest = { kind: "node", id: node.entityId, visualId: node.visualId, node, distance };
    }
  }
  return closest;
}

function hitTestEdge(edges: readonly VisualEdge[], nodes: readonly VisualNode[], point: WorldPoint, tolerance: number): HitTarget | null {
  let closest: Extract<HitTarget, { kind: "edge" }> | null = null;
  for (const edge of edges) {
    if (edge.visibility !== "visible") continue;
    const source = nodes.find((n) => n.entityId === edge.source);
    const target = nodes.find((n) => n.entityId === edge.target);
    if (!source || !target) continue;
    const distance = distanceToSegment(point, source.position, target.position);
    if (distance <= tolerance && (!closest || distance < closest.distance)) closest = { kind: "edge", id: edge.edgeId, edge, distance };
  }
  return closest;
}

function hitTestRegion(regions: HitTestInput["payload"]["regions"], point: WorldPoint): HitTarget | null {
  const candidates = regions
    .filter((region) => region.visibility !== "hidden" && contains(region.boundaryHints.bounds, point))
    .sort((a, b) => a.boundaryHints.bounds.width * a.boundaryHints.bounds.height - b.boundaryHints.bounds.width * b.boundaryHints.bounds.height);
  const region = candidates[0];
  return region ? { kind: "region", id: region.regionId, region, distance: 0 } : null;
}

function distanceToSegment(point: WorldPoint, start: WorldPoint, end: WorldPoint): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return distanceBetween(point, start);
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return distanceBetween(point, { x: start.x + t * dx, y: start.y + t * dy });
}

function distanceBetween(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function contains(bounds: { readonly x: number; readonly y: number; readonly width: number; readonly height: number }, point: WorldPoint): boolean {
  return point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height;
}

