import type {
  ClusterQualityMetrics,
  CollisionReport,
  CrossingReport,
  DensityProfile,
  DeterminismReport,
  LayoutAnalysisContext,
  LayoutQualityScore,
  MemoryReport,
  StabilityReport,
} from "./types.ts";

const GRADE_BANDS = {
  A: 0.9,
  B: 0.8,
  C: 0.7,
  D: 0.6,
} as const;

const WEIGHTS = {
  collision: 0.18,
  density: 0.12,
  crossing: 0.12,
  stability: 0.1,
  determinism: 0.1,
  hubClarity: 0.08,
  bridgeClarity: 0.08,
  clusterQuality: 0.1,
  viewportQuality: 0.05,
  performance: 0.07,
} as const;

export function scoreLayout(input: {
  readonly collision: CollisionReport;
  readonly density: DensityProfile;
  readonly crossing: CrossingReport;
  readonly stability: StabilityReport;
  readonly determinism: DeterminismReport;
  readonly memory: MemoryReport;
  readonly cluster: ClusterQualityMetrics;
  readonly context: LayoutAnalysisContext;
  readonly layoutTimeMs: number;
}): LayoutQualityScore {
  const collisionScore = scoreCollision(input.collision, input.context);
  const densityScore = scoreDensity(input.density);
  const crossingScore = scoreCrossing(input.crossing, input.context);
  const stabilityScore = scoreStability(input.stability);
  const determinismScore = scoreDeterminism(input.determinism);
  const hubClarity = clamp(0.5 + input.cluster.hubCentralityScore * 0.5);
  const bridgeClarity = clamp(0.4 + input.cluster.bridgeVisibilityScore * 0.6);
  const clusterQuality = clamp(
    0.25 +
      input.cluster.silhouetteScore * 0.35 +
      input.cluster.cohesionAverage * 0.15 +
      (1 - Math.min(1, input.cluster.separationAverage / 600)) * 0.1 +
      input.cluster.densityHomogeneity * 0.15,
  );
  const viewportQuality = scoreViewport(input.context);
  const performance = scorePerformance(input.memory, input.layoutTimeMs, input.context);

  const dimensions = {
    collision: collisionScore,
    density: densityScore,
    crossing: crossingScore,
    stability: stabilityScore,
    determinism: determinismScore,
    hubClarity,
    bridgeClarity,
    clusterQuality,
    viewportQuality,
    performance,
  };

  const overall = clamp(
    collisionScore * WEIGHTS.collision +
      densityScore * WEIGHTS.density +
      crossingScore * WEIGHTS.crossing +
      stabilityScore * WEIGHTS.stability +
      determinismScore * WEIGHTS.determinism +
      hubClarity * WEIGHTS.hubClarity +
      bridgeClarity * WEIGHTS.bridgeClarity +
      clusterQuality * WEIGHTS.clusterQuality +
      viewportQuality * WEIGHTS.viewportQuality +
      performance * WEIGHTS.performance,
  );

  return {
    collision: round(collisionScore, 4),
    density: round(densityScore, 4),
    crossing: round(crossingScore, 4),
    stability: round(stabilityScore, 4),
    determinism: round(determinismScore, 4),
    hubClarity: round(hubClarity, 4),
    bridgeClarity: round(bridgeClarity, 4),
    clusterQuality: round(clusterQuality, 4),
    viewportQuality: round(viewportQuality, 4),
    performance: round(performance, 4),
    overall: round(overall, 4),
    grade: gradeFor(overall),
  };
}

function scoreCollision(report: CollisionReport, context: LayoutAnalysisContext): number {
  const nodeCount = Math.max(1, context.positions.size);
  const ratio = report.collisions / nodeCount;
  if (report.severity === "clean") return 1;
  if (report.severity === "mild") return clamp(0.95 - ratio * 1.5);
  if (report.severity === "moderate") return clamp(0.7 - ratio);
  return clamp(0.45 - ratio * 0.5);
}

function scoreDensity(profile: DensityProfile): number {
  if (!profile.localCells.length) return 1;
  const densities = profile.localCells.map((cell) => cell.density);
  const mean = average(densities);
  const variance = average(densities.map((value) => (value - mean) ** 2));
  const coefficient = mean === 0 ? 0 : Math.sqrt(variance) / mean;
  return clamp(0.95 - coefficient * 0.3 - (profile.denseCellCount / Math.max(1, densities.length)) * 0.15);
}

function scoreCrossing(report: CrossingReport, context: LayoutAnalysisContext): number {
  if (report.crossings === 0) return 1;
  const nodeCount = Math.max(1, context.positions.size);
  const tolerance = Math.max(1, nodeCount * (nodeCount - 1) * 0.05);
  return clamp(1 - report.crossings / tolerance);
}

function scoreStability(report: StabilityReport): number {
  return clamp(report.mentalMapScore);
}

function scoreDeterminism(report: DeterminismReport): number {
  if (!report.deterministic) return 0.4;
  return clamp(1 - report.positionDriftMax * 1e6);
}

function scoreViewport(context: LayoutAnalysisContext): number {
  const bounds = context.positions.size ? context.positions : new Map<string, { x: number; y: number }>();
  if (!bounds.size) return 1;
  const points = [...bounds.values()];
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));
  const width = maxX - minX;
  const height = maxY - minY;
  const aspect = width === 0 || height === 0 ? 0 : Math.min(width, height) / Math.max(width, height);
  return clamp(0.6 + aspect * 0.4);
}

function scorePerformance(memory: MemoryReport, layoutTimeMs: number, context: LayoutAnalysisContext): number {
  const nodeCount = Math.max(1, context.positions.size);
  const perNode = memory.heapDeltaBytes / nodeCount;
  const timePerNode = Math.max(0.001, layoutTimeMs / nodeCount);
  const throughput = 1000 / timePerNode;
  const memoryScore = clamp(1 - perNode / 8192);
  const throughputScore = clamp(throughput / 5000);
  return clamp(memoryScore * 0.4 + throughputScore * 0.6);
}

function gradeFor(score: number): LayoutQualityScore["grade"] {
  if (score >= GRADE_BANDS.A) return "A";
  if (score >= GRADE_BANDS.B) return "B";
  if (score >= GRADE_BANDS.C) return "C";
  if (score >= GRADE_BANDS.D) return "D";
  return "F";
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function average(values: readonly number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
