import type { WorldPoint } from "../types.ts";
import type { CanonicalLayoutConstraints } from "../layout-engine.ts";
import type {
  CollisionReport,
  LayoutAnalysisContext,
} from "./types.ts";

const MIN_PUSH_RATIO = 0.5;
const MIN_PUSH_RATIO_HARD = 1.0;
const HUB_LOCK_RATIO = 0.9;
const SEVERITY_BANDS = {
  clean: 0,
  mild: 12,
  moderate: 80,
} as const;
const MAX_ITERATIONS = 8;
const MAX_CYCLES = 16;

interface SpatialGrid {
  set(id: string, position: WorldPoint): void;
  nearby(position: WorldPoint, radius: number): string[];
  clear(): void;
}

export function reduceCollisions(
  initialPositions: ReadonlyMap<string, WorldPoint>,
  context: LayoutAnalysisContext,
): { readonly positions: Map<string, WorldPoint>; readonly report: CollisionReport } {
  const { constraints } = context;
  const cellSize = Math.max(36, constraints.minimumNodeDistance * 1.4);
  const grid = createSpatialGrid(cellSize);
  const orderedIds = [...initialPositions.keys()].sort((a, b) => a.localeCompare(b));
  const positions = new Map<string, WorldPoint>();
  for (const id of orderedIds) positions.set(id, initialPositions.get(id)!);

  const requiredById = new Map<string, number>();
  for (const id of orderedIds) {
    requiredById.set(id, context.requiredSpacingById.get(id) ?? constraints.minimumNodeDistance);
  }
  const seedById = new Map(positions);

  let passesExecuted = 0;
  let converged = false;
  let overlapArea = 0;
  let maxOverlapDepth = 0;
  const maxCycles = orderedIds.length > 50_000 ? 1 : orderedIds.length > 10_000 ? 2 : MAX_CYCLES;
  const maxIterations = orderedIds.length > 50_000 ? 1 : orderedIds.length > 10_000 ? 2 : MAX_ITERATIONS;

  for (let cycle = 0; cycle < maxCycles; cycle += 1) {
    let cycleCollisions = 0;
    let cycleOverlapArea = 0;
    let cycleMaxOverlap = 0;
    let passImproved = true;
    for (let pass = 0; pass < maxIterations && passImproved; pass += 1) {
      const beforeCount = countCollisions(positions, requiredById, cellSize, constraints);
      const conflicts = collectConflicts(positions, requiredById, cellSize, grid, constraints);
      if (!conflicts.length) {
        passesExecuted = cycle * maxIterations + pass + 1;
        converged = true;
        break;
      }
      const sortedConflicts = [...conflicts].sort((a, b) => {
        const importanceDiff = (context.importanceById.get(b.lowImportanceId) ?? 0) - (context.importanceById.get(a.lowImportanceId) ?? 0);
        if (importanceDiff !== 0) return importanceDiff;
        const degreeDiff = (context.degreeById.get(b.lowImportanceId) ?? 0) - (context.degreeById.get(a.lowImportanceId) ?? 0);
        if (degreeDiff !== 0) return -degreeDiff;
        return a.lowImportanceId.localeCompare(b.lowImportanceId);
      });
      for (const conflict of sortedConflicts) {
        const current = positions.get(conflict.lowImportanceId);
        if (!current) continue;
        const other = positions.get(conflict.otherId);
        if (!other) continue;
        const required = conflict.required;
        const direction = angleOf(other, current);
        if (direction === undefined) continue;
        const isHardViolation = required <= constraints.minimumNodeDistance;
        const ratio = isHardViolation ? MIN_PUSH_RATIO_HARD : MIN_PUSH_RATIO;
        const pushMagnitude = Math.max(0, conflict.overlap * ratio);
        if (pushMagnitude === 0) continue;
        const lowSeed = seedById.get(conflict.lowImportanceId) ?? current;
        const lowHubLock = context.hubIds.has(conflict.lowImportanceId) ? HUB_LOCK_RATIO : 0;
        const lowProposed = {
          x: round(current.x + Math.cos(direction) * pushMagnitude),
          y: round(current.y + Math.sin(direction) * pushMagnitude),
        };
        const lowDrift = distance(lowProposed, lowSeed);
        const lowMaxDrift = lowHubLock > 0
          ? constraints.minimumNodeDistance * (1 - lowHubLock) * 0.5
          : constraints.minimumNodeDistance * 1.8;
        positions.set(conflict.lowImportanceId, clampDrift(lowProposed, lowSeed, lowDrift, lowMaxDrift));
      }
      const afterCount = countCollisions(positions, requiredById, cellSize, constraints);
      cycleCollisions = afterCount;
      if (afterCount === 0) {
        passesExecuted = cycle * maxIterations + pass + 1;
        converged = true;
        break;
      }
      if (afterCount >= beforeCount) {
        passImproved = false;
      }
      const collected = collectConflicts(positions, requiredById, cellSize, grid, constraints);
      cycleOverlapArea = collected.reduce((sum, c) => sum + c.overlap * c.required, 0);
      cycleMaxOverlap = collected.reduce((max, c) => Math.max(max, c.overlap), 0);
    }
    if (cycleCollisions === 0) {
      converged = true;
      break;
    }
    const collected = collectConflicts(positions, requiredById, cellSize, grid, constraints);
    if (collected.length === 0) {
      converged = true;
      break;
    }
    overlapArea = round(cycleOverlapArea, 4);
    maxOverlapDepth = maxOverlap([cycleMaxOverlap], constraints.minimumNodeDistance * 0.4);
  }

  if (!converged) passesExecuted = maxCycles * maxIterations;

  const finalCollisions = countCollisions(positions, requiredById, cellSize, constraints);
  return {
    positions,
    report: {
      collisions: finalCollisions,
      passesExecuted,
      converged,
      overlapArea,
      maxOverlapDepth,
      severity: severityFor(finalCollisions),
    },
  };
}

interface Conflict {
  readonly lowImportanceId: string;
  readonly otherId: string;
  readonly gap: number;
  readonly required: number;
  readonly overlap: number;
}

function collectConflicts(
  positions: ReadonlyMap<string, WorldPoint>,
  requiredById: ReadonlyMap<string, number>,
  cellSize: number,
  grid: SpatialGrid,
  constraints: CanonicalLayoutConstraints,
): readonly Conflict[] {
  grid.clear();
  const conflicts: Conflict[] = [];
  const seen = new Set<string>();
  for (const [id, point] of positions) {
    const requiredRadius = requiredById.get(id) ?? constraints.minimumNodeDistance;
    const nearby = grid.nearby(point, requiredRadius * 1.6);
    for (const neighborId of nearby) {
      const neighborPoint = positions.get(neighborId);
      if (!neighborPoint) continue;
      const neighborRequired = requiredById.get(neighborId) ?? constraints.minimumNodeDistance;
      const required = Math.max(requiredRadius, neighborRequired);
      const gap = distance(point, neighborPoint);
      if (gap >= required) continue;
      const key = id < neighborId ? `${id}|${neighborId}` : `${neighborId}|${id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const idImportance = requiredById.get(id) ?? constraints.minimumNodeDistance;
      const neighborImportance = requiredById.get(neighborId) ?? constraints.minimumNodeDistance;
      const lowImportanceId = idImportance <= neighborImportance || (idImportance === neighborImportance && id > neighborId) ? id : neighborId;
      const otherId = lowImportanceId === id ? neighborId : id;
      conflicts.push({
        lowImportanceId,
        otherId,
        gap,
        required,
        overlap: required - gap,
      });
    }
    grid.set(id, point);
  }
  return conflicts;
}

function countCollisions(
  positions: ReadonlyMap<string, WorldPoint>,
  requiredById: ReadonlyMap<string, number>,
  cellSize: number,
  constraints: CanonicalLayoutConstraints,
): number {
  const grid = createSpatialGrid(cellSize);
  let collisions = 0;
  for (const [id, point] of positions) {
    const requiredRadius = requiredById.get(id) ?? constraints.minimumNodeDistance;
    const nearby = grid.nearby(point, requiredRadius * 1.6);
    for (const neighborId of nearby) {
      const neighborPoint = positions.get(neighborId);
      if (!neighborPoint) continue;
      const neighborRadius = requiredById.get(neighborId) ?? constraints.minimumNodeDistance;
      const required = Math.max(requiredRadius, neighborRadius);
      if (distance(point, neighborPoint) < required) collisions += 1;
    }
    grid.set(id, point);
  }
  return collisions;
}

function createSpatialGrid(cellSize: number): SpatialGrid {
  const buckets = new Map<string, string[]>();
  return {
    set(id, position) {
      const key = cellKeyOf(position, cellSize);
      const bucket = buckets.get(key);
      if (bucket) bucket.push(id);
      else buckets.set(key, [id]);
    },
    nearby(position, radius) {
      const result: string[] = [];
      const span = Math.max(1, Math.ceil(radius / cellSize));
      const cx = Math.floor(position.x / cellSize);
      const cy = Math.floor(position.y / cellSize);
      for (let dx = -span; dx <= span; dx += 1) {
        for (let dy = -span; dy <= span; dy += 1) {
          const bucket = buckets.get(`${cx + dx}:${cy + dy}`);
          if (bucket) result.push(...bucket);
        }
      }
      return result;
    },
    clear() {
      buckets.clear();
    },
  };
}

function severityFor(collisions: number): CollisionReport["severity"] {
  if (collisions <= SEVERITY_BANDS.clean) return "clean";
  if (collisions <= SEVERITY_BANDS.mild) return "mild";
  if (collisions <= SEVERITY_BANDS.moderate) return "moderate";
  return "severe";
}

function maxOverlap(overlaps: readonly number[], divisor: number): number {
  let max = 0;
  for (const value of overlaps) {
    if (value > max) max = value;
  }
  return Math.max(1, Math.ceil(max / Math.max(1, divisor)));
}

function distance(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clampDrift(proposed: WorldPoint, seed: WorldPoint, drift: number, maxDrift: number): WorldPoint {
  if (drift <= maxDrift || maxDrift <= 0) return proposed;
  const scale = maxDrift / drift;
  return {
    x: round(seed.x + (proposed.x - seed.x) * scale),
    y: round(seed.y + (proposed.y - seed.y) * scale),
  };
}

function angleOf(from: WorldPoint, to: WorldPoint): number | undefined {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return undefined;
  return Math.atan2(dy, dx);
}

function cellKeyOf(position: WorldPoint, cellSize: number): string {
  return `${Math.floor(position.x / cellSize)}:${Math.floor(position.y / cellSize)}`;
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
