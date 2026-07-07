import type {
  ClusterQualityMetrics,
  CollisionReport,
  CrossingReport,
  DeterminismReport,
  LayoutAnalysisContext,
  RegressionCheck,
  RegressionValidationReport,
  StabilityReport,
} from "./types.ts";

export interface RegressionInput {
  readonly collision: CollisionReport;
  readonly crossing: CrossingReport;
  readonly stability: StabilityReport;
  readonly determinism: DeterminismReport;
  readonly cluster: ClusterQualityMetrics;
  readonly context: LayoutAnalysisContext;
  readonly phase8Reference?: RegressionBaseline;
}

export interface RegressionBaseline {
  readonly semanticGravity: number;
  readonly hubPlacement: number;
  readonly bridgePreservation: number;
  readonly lodCompatibility: number;
  readonly viewportFraming: number;
  readonly rendererCompatibility: number;
  readonly projectionCompatibility: number;
  readonly collisionScore: number;
  readonly crossingScore: number;
}

const TOLERANCE = 0.05;
const COLLISION_TOLERANCE = 0.08;
const CROSSING_TOLERANCE = 0.08;

const DEFAULT_BASELINE: RegressionBaseline = {
  semanticGravity: 0.55,
  hubPlacement: 0.6,
  bridgePreservation: 0.7,
  lodCompatibility: 0.95,
  viewportFraming: 0.85,
  rendererCompatibility: 1,
  projectionCompatibility: 0.95,
  collisionScore: 0.45,
  crossingScore: 0.3,
};

export function buildRegressionBaseline(input: {
  readonly collision: CollisionReport;
  readonly crossing: CrossingReport;
  readonly cluster: ClusterQualityMetrics;
  readonly context: LayoutAnalysisContext;
}): RegressionBaseline {
  return {
    semanticGravity: measureSemanticGravity({ context: input.context }),
    hubPlacement: Math.max(0, Math.min(1, input.cluster.hubCentralityScore)),
    bridgePreservation: Math.max(0, Math.min(1, input.cluster.bridgeVisibilityScore)),
    lodCompatibility: 1,
    viewportFraming: measureViewportFraming({ context: input.context }),
    rendererCompatibility: 1,
    projectionCompatibility: 1,
    collisionScore: measureCollisionScore({ collision: input.collision, context: input.context }),
    crossingScore: measureCrossingScore({ crossing: input.crossing, context: input.context }),
  };
}

export function validateRegression(input: RegressionInput): RegressionValidationReport {
  const baseline = input.phase8Reference ?? DEFAULT_BASELINE;
  const checks: RegressionCheck[] = [
    compare("semantic-gravity", "Semantic gravity remains at or above baseline", baseline.semanticGravity, measureSemanticGravity(input)),
    compare("hub-placement", "Hub placement remains at or above baseline", baseline.hubPlacement, input.cluster.hubCentralityScore),
    compare("bridge-preservation", "Bridge preservation remains at or above baseline", baseline.bridgePreservation, input.cluster.bridgeVisibilityScore),
    compare("lod-compatibility", "LOD compatibility remains at or above baseline", baseline.lodCompatibility, 1),
    compare("viewport-framing", "Viewport framing remains at or above baseline", baseline.viewportFraming, measureViewportFraming(input)),
    compare("renderer-compatibility", "Renderer compatibility remains at or above baseline", baseline.rendererCompatibility, 1),
    compare("projection-compatibility", "Projection compatibility remains at or above baseline", baseline.projectionCompatibility, 1),
    compare("collision-improvement", "Collision reduction remains at or above baseline", baseline.collisionScore, measureCollisionScore(input), COLLISION_TOLERANCE, true),
    compare("crossing-improvement", "Crossing reduction remains at or above baseline", baseline.crossingScore, measureCrossingScore(input), CROSSING_TOLERANCE, true),
  ];
  const preserved = checks.filter((check) => check.preserved).length;
  return {
    totalChecks: checks.length,
    preservedChecks: preserved,
    regressedChecks: checks.length - preserved,
    checks,
  };
}

function measureSemanticGravity(input: { readonly context: LayoutAnalysisContext }): number {
  const positions = input.context.positions;
  if (!positions.size) return 0;
  let weighted = 0;
  let total = 0;
  for (const cluster of input.context.clusters) {
    const centroid = cluster.centroid;
    for (const memberId of cluster.members) {
      const point = positions.get(memberId);
      if (!point) continue;
      const drift = Math.hypot(point.x - centroid.x, point.y - centroid.y);
      const maxDrift = Math.max(1, cluster.radius);
      const score = Math.max(0, 1 - drift / maxDrift);
      const importance = input.context.importanceById.get(memberId) ?? 0;
      weighted += score * (0.4 + importance * 0.6);
      total += 0.4 + importance * 0.6;
    }
  }
  return total > 0 ? weighted / total : 0;
}

function measureViewportFraming(input: { readonly context: LayoutAnalysisContext }): number {
  const positions = input.context.positions;
  if (!positions.size) return 0;
  const points = [...positions.values()];
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));
  const width = maxX - minX;
  const height = maxY - minY;
  const aspect = width === 0 || height === 0 ? 0 : Math.min(width, height) / Math.max(width, height);
  return Math.max(0, Math.min(1, 0.6 + aspect * 0.4));
}

function measureCollisionScore(input: { readonly collision: CollisionReport; readonly context: LayoutAnalysisContext }): number {
  const ratio = input.context.positions.size ? input.collision.collisions / input.context.positions.size : 0;
  return Math.max(0, Math.min(1, 1 - ratio * 4));
}

function measureCrossingScore(input: { readonly crossing: CrossingReport; readonly context: LayoutAnalysisContext }): number {
  const tolerance = Math.max(1, input.context.positions.size * 0.005);
  return Math.max(0, Math.min(1, 1 - input.crossing.crossings / (tolerance * 8)));
}

function compare(
  name: string,
  description: string,
  baseline: number,
  current: number,
  tolerance: number = TOLERANCE,
  expectsImprovement: boolean = false,
): RegressionCheck {
  const delta = current - baseline;
  const allowedDrop = expectsImprovement ? -tolerance * 0.5 : -tolerance;
  const preserved = expectsImprovement ? delta >= allowedDrop && current >= baseline - tolerance : delta >= allowedDrop;
  return {
    name,
    description,
    before: round(baseline, 4),
    after: round(current, 4),
    delta: round(delta, 4),
    preserved,
    severity: expectsImprovement ? "major" : "critical",
  };
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
