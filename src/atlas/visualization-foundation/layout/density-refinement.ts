import type { WorldPoint } from "../types.ts";
import type { DensityCell, DensityProfile, LayoutAnalysisContext } from "./types.ts";

const CELL_SIZE_MULTIPLIER = 1.6;
const DENSE_THRESHOLD = 0.55;
const SPARSE_THRESHOLD = 0.15;
const HOMOGENEITY_BANDS = {
  ideal: 0.4,
  acceptable: 0.7,
} as const;

export function refineDensity(
  positions: ReadonlyMap<string, WorldPoint>,
  context: LayoutAnalysisContext,
): { readonly positions: Map<string, WorldPoint>; readonly profile: DensityProfile } {
  const cellSize = Math.max(48, context.constraints.minimumNodeDistance * CELL_SIZE_MULTIPLIER);
  const cells = new Map<string, MutableCell>();
  for (const [id, point] of positions) {
    const key = cellKeyOf(point, cellSize);
    const cell = cells.get(key) ?? createCell(point, cellSize);
    cell.memberIds.push(id);
    cell.localImportance += context.importanceById.get(id) ?? 0;
    cells.set(key, cell);
  }
  const globalCount = positions.size;
  const expectedPerCell = Math.max(1, globalCount / Math.max(1, cells.size));
  const maxRecommendedInflation = context.constraints.clusterInflation * 1.6;
  const maxRecommendedContraction = context.constraints.clusterInflation * 0.6;

  for (const cell of cells.values()) {
    cell.density = round(cell.memberIds.length / expectedPerCell, 4);
    cell.recommendedSpacing = computeRecommendedSpacing(cell, context, expectedPerCell);
  }

  const finalCells: DensityCell[] = [...cells.values()]
    .map((cell) => freezeCell(cell, context))
    .sort((a, b) => b.density - a.density || a.cellX - b.cellX || a.cellY - b.cellY);

  const adjusted = new Map<string, WorldPoint>();
  for (const [id, point] of positions) {
    const cell = lookupCell(point, finalCells, cellSize);
    if (!cell) {
      adjusted.set(id, point);
      continue;
    }
    if (cell.density <= SPARSE_THRESHOLD || cell.density >= DENSE_THRESHOLD) {
      adjusted.set(id, balanceWithinCell(id, point, cell, context, positions));
    } else {
      adjusted.set(id, point);
    }
  }

  const dense = finalCells.filter((cell) => cell.density >= DENSE_THRESHOLD).length;
  const sparse = finalCells.filter((cell) => cell.density <= SPARSE_THRESHOLD).length;
  const globalDensity = round(globalCount / Math.max(1, finalCells.length * expectedPerCell), 4);
  const recommendedInflation = clamp(round(1 + dense / Math.max(1, finalCells.length), 3), 1, maxRecommendedInflation);
  const recommendedContraction = clamp(round(1 - sparse / Math.max(1, finalCells.length) * 0.4, 3), maxRecommendedContraction, 1);
  const homogeneity = densityHomogeneity(finalCells);

  const profile: DensityProfile = {
    localCells: finalCells,
    globalDensity,
    denseCellCount: dense,
    sparseCellCount: sparse,
    recommendedInflation,
    recommendedContraction,
  };
  void homogeneity;
  return { positions: adjusted, profile };
}

interface MutableCell {
  cellX: number;
  cellY: number;
  center: WorldPoint;
  memberIds: string[];
  localImportance: number;
  density: number;
  recommendedSpacing: number;
}

function createCell(position: WorldPoint, cellSize: number): MutableCell {
  return {
    cellX: Math.floor(position.x / cellSize),
    cellY: Math.floor(position.y / cellSize),
    center: {
      x: round((Math.floor(position.x / cellSize) + 0.5) * cellSize),
      y: round((Math.floor(position.y / cellSize) + 0.5) * cellSize),
    },
    memberIds: [],
    localImportance: 0,
    density: 0,
    recommendedSpacing: 0,
  };
}

function freezeCell(cell: MutableCell, context: LayoutAnalysisContext): DensityCell {
  return {
    cellX: cell.cellX,
    cellY: cell.cellY,
    center: cell.center,
    memberIds: [...cell.memberIds].sort(),
    density: cell.density,
    recommendedSpacing: cell.recommendedSpacing,
  };
}

function computeRecommendedSpacing(cell: MutableCell, context: LayoutAnalysisContext, expectedPerCell: number): number {
  const base = context.constraints.minimumNodeDistance;
  if (cell.density >= DENSE_THRESHOLD) {
    return round(base * Math.min(1.6, 1 + (cell.density - DENSE_THRESHOLD) * 0.8), 2);
  }
  if (cell.density <= SPARSE_THRESHOLD) {
    return round(base * Math.max(0.6, 1 - (SPARSE_THRESHOLD - cell.density) * 0.5), 2);
  }
  return round(base * (cell.memberIds.length / expectedPerCell), 2);
}

function lookupCell(point: WorldPoint, cells: readonly DensityCell[], cellSize: number): DensityCell | undefined {
  const cx = Math.floor(point.x / cellSize);
  const cy = Math.floor(point.y / cellSize);
  return cells.find((cell) => cell.cellX === cx && cell.cellY === cy);
}

function balanceWithinCell(
  id: string,
  point: WorldPoint,
  cell: DensityCell,
  context: LayoutAnalysisContext,
  allPositions: ReadonlyMap<string, WorldPoint>,
): WorldPoint {
  const peers = cell.memberIds.filter((memberId) => memberId !== id);
  if (!peers.length) return point;
  const importance = context.importanceById.get(id) ?? 0;
  const meanX = average(peers.map((peer) => allPositions.get(peer)?.x ?? point.x));
  const meanY = average(peers.map((peer) => allPositions.get(peer)?.y ?? point.y));
  const drift = distance(point, { x: meanX, y: meanY });
  if (drift === 0) return point;
  const desired = cell.recommendedSpacing * (1 + importance * 0.3);
  const scale = drift > desired ? desired / drift : 1;
  return {
    x: round(meanX + (point.x - meanX) * scale),
    y: round(meanY + (point.y - meanY) * scale),
  };
}

function densityHomogeneity(cells: readonly DensityCell[]): number {
  if (!cells.length) return 1;
  const densities = cells.map((cell) => cell.density);
  const mean = average(densities);
  if (mean === 0) return 1;
  const variance = average(densities.map((value) => (value - mean) ** 2));
  const stdDev = Math.sqrt(variance);
  return round(Math.max(0, 1 - stdDev / Math.max(1, mean)), 4);
}

function average(values: readonly number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function distance(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function cellKeyOf(position: WorldPoint, cellSize: number): string {
  return `${Math.floor(position.x / cellSize)}:${Math.floor(position.y / cellSize)}`;
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
