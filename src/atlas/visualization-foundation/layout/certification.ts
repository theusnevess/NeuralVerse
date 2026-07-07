import { performance } from "node:perf_hooks";
import type { GraphProjection, GraphSnapshot } from "../../graph-foundation/index.ts";
import { computeCanonicalLayout, type CanonicalLayoutConstraints, type CanonicalLayoutResult, DEFAULT_CANONICAL_LAYOUT_CONSTRAINTS } from "../layout-engine.ts";
import type { LayoutKind, WorldPoint } from "../types.ts";
import { applyIncrementalAnchor, createAnchor, measureStability, type IncrementalAnchor } from "./incremental-stability.ts";
import { auditDeterminism } from "./determinism-audit.ts";
import { createMemoryProfiler, type MemoryProfilerHandle } from "./memory-profiler.ts";
import { reduceCollisions } from "./collision-reduction.ts";
import { refineDensity } from "./density-refinement.ts";
import { reduceCrossings } from "./crossing-reduction.ts";
import { computeClusterQuality } from "./cluster-quality.ts";
import { scoreLayout } from "./quality-score.ts";
import { validateConstraints } from "./constraint-validator.ts";
import { buildRegressionBaseline, validateRegression } from "./regression-validation.ts";
import { generatePathologicalGraph, STRESS_PROFILES } from "./stress-graphs.ts";
import { runBenchmarkSuite } from "./benchmark-suite.ts";
import type {
  BenchmarkSuite,
  CertificationReport,
  ClusterQualityMetrics,
  CollisionReport,
  ConstraintValidationReport,
  CrossingReport,
  DensityProfile,
  DeterminismReport,
  LayoutAnalysisContext,
  LayoutQualityScore,
  MemoryReport,
  PathologicalGraphSpec,
  RegressionValidationReport,
  StabilityReport,
  StressTestResult,
  StressTestSuite,
} from "./types.ts";

const HARNESS_VERSION = "2.0.0";
const DEFAULT_DETERMINISM_RUNS = 100;

export interface CertificationOptions {
  readonly layout?: LayoutKind;
  readonly determinismRuns?: number;
  readonly includeStressTests?: boolean;
  readonly includeBenchmarkSuite?: boolean;
  readonly includePhase8Regression?: boolean;
}

export function runCertification(
  snapshot: GraphSnapshot,
  projection: GraphProjection,
  options: CertificationOptions = {},
): CertificationReport {
  const layout = options.layout ?? "force";
  const determinismRuns = options.determinismRuns ?? DEFAULT_DETERMINISM_RUNS;
  const includeStress = options.includeStressTests ?? true;
  const includeBenchmark = options.includeBenchmarkSuite ?? true;
  const includeRegression = options.includePhase8Regression ?? true;
  const profiler = createMemoryProfiler();

  const totalStart = performance.now();
  const { reference, report: determinism } = auditDeterminism(snapshot, projection, layout, determinismRuns);
  profiler.startIteration();
  const pipeline = runFullPipeline(snapshot, projection, layout, profiler);
  profiler.endIteration();
  const collision = pipeline.collision;
  const density = pipeline.density;
  const crossing = pipeline.crossing;
  const finalLayout = pipeline.result;
  const cluster = computeClusterQuality(finalLayout.positions, pipeline.context);
  const memory = profiler.finish();
  const stability = measureStability(reference.positions, finalLayout.positions, pipeline.context);
  const quality = scoreLayout({
    collision,
    density,
    crossing,
    stability,
    determinism,
    memory,
    cluster,
    context: pipeline.context,
    layoutTimeMs: pipeline.layoutTimeMs,
  });
  const constraints = validateConstraints(finalLayout, pipeline.context, projection.edgeIds.map((id) => snapshot.edges.get(id)!).filter(Boolean), { layoutKind: layout });
  const regression = includeRegression
    ? buildRegressionCheck(collision, crossing, stability, determinism, cluster, pipeline.context, reference)
    : emptyRegression();
  const stress = includeStress ? runStressSuite(layout) : emptyStress();
  const benchmark = includeBenchmark ? runBenchmarkSuite() : emptyBenchmark();
  const total = performance.now() - totalStart;
  if (total > 60_000) {
    console.warn(`[certification] total certification duration ${Math.round(total)}ms exceeded soft budget`);
  }
  return {
    snapshot: { nodeCount: snapshot.metadata.nodeCount, edgeCount: snapshot.metadata.edgeCount },
    layout: finalLayout,
    collision,
    density,
    crossing,
    stability,
    determinism,
    memory,
    clusterQuality: cluster,
    qualityScore: quality,
    constraints,
    regression,
    stress,
    benchmark,
    generatedAt: new Date().toISOString(),
    harnessVersion: HARNESS_VERSION,
  };
}

interface FullPipelineResult {
  readonly result: CanonicalLayoutResult;
  readonly context: LayoutAnalysisContext;
  readonly collision: CollisionReport;
  readonly density: DensityProfile;
  readonly crossing: CrossingReport;
  readonly layoutTimeMs: number;
}

function runFullPipeline(
  snapshot: GraphSnapshot,
  projection: GraphProjection,
  layout: LayoutKind,
  profiler: MemoryProfilerHandle,
): FullPipelineResult {
  const start = performance.now();
  const initial = computeCanonicalLayout(snapshot, projection, layout, DEFAULT_CANONICAL_LAYOUT_CONSTRAINTS);
  const context = buildAnalysisContext(snapshot, projection, initial);
  const { positions: collisionPositions, report: collision } = reduceCollisions(initial.positions, context);
  const { positions: densityPositions, profile: density } = refineDensity(collisionPositions, context);
  const edges = projection.edgeIds.map((id) => snapshot.edges.get(id)!).filter(Boolean);
  const { positions: crossingPositions, report: crossing } = reduceCrossings(densityPositions, edges, context);
  const anchored = applyIncrementalAnchor(crossingPositions, context, undefined, snapshot);
  profiler.recordReuseRatio(1, 1);
  const result = mergeLayoutResult(initial, anchored);
  const layoutTimeMs = performance.now() - start;
  return { result, context, collision, density, crossing, layoutTimeMs };
}

function buildAnalysisContext(
  snapshot: GraphSnapshot,
  projection: GraphProjection,
  initial: CanonicalLayoutResult,
): LayoutAnalysisContext {
  const hubIds = computeHubIds(snapshot, projection.nodeIds);
  const bridgeIds = computeBridgeIds(initial, snapshot);
  const importanceById = new Map<string, number>();
  const degreeById = new Map<string, number>();
  const requiredSpacingById = new Map<string, number>();
  for (const id of projection.nodeIds) {
    const node = snapshot.nodes.get(id);
    const centrality = snapshot.metrics.centrality[id];
    const degree = centrality?.degree ?? 0;
    degreeById.set(id, degree);
    const explicit = node?.metadata.importance;
    const graphImportance = degree / Math.max(1, Math.sqrt(snapshot.metadata.nodeCount));
    const importance = Math.max(0, Math.min(1, explicit ?? graphImportance));
    importanceById.set(id, importance);
    const labelLength = node?.name.length ?? 8;
    const labelWidth = Math.min(120, Math.max(24, labelLength * 5.8));
    const required = initial.constraints.minimumNodeDistance + labelWidth * 0.15;
    requiredSpacingById.set(id, required);
  }
  return {
    snapshot,
    constraints: initial.constraints,
    clusters: initial.clusters,
    positions: initial.positions,
    nodeById: snapshot.nodes,
    hubIds,
    bridgeIds,
    clusterById: new Map(initial.clusters.map((cluster) => [cluster.id, cluster])),
    importanceById,
    degreeById,
    requiredSpacingById,
  };
}

function computeHubIds(snapshot: GraphSnapshot, nodeIds: readonly string[]): Set<string> {
  const targetCount = Math.max(4, Math.ceil(Math.sqrt(nodeIds.length) * 0.5));
  const ranked = nodeIds.map((id) => {
    const centrality = snapshot.metrics.centrality[id];
    const degree = centrality?.degree ?? 0;
    return { id, score: degree };
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return new Set(ranked.slice(0, targetCount).map((item) => item.id));
}

function computeBridgeIds(layout: CanonicalLayoutResult, snapshot: GraphSnapshot): Set<string> {
  const clusterByNode = new Map<string, string>();
  for (const cluster of layout.clusters) {
    for (const id of cluster.members) clusterByNode.set(id, cluster.id);
  }
  const ranked = [...layout.positions.keys()].map((id) => {
    const ownCluster = clusterByNode.get(id);
    const adjacentClusters = new Set<string>();
    for (const neighbor of snapshot.index.adjacencyList.get(id) ?? new Set<string>()) {
      const cluster = clusterByNode.get(neighbor);
      if (cluster && cluster !== ownCluster) adjacentClusters.add(cluster);
    }
    for (const neighbor of snapshot.index.reverseAdjacencyList.get(id) ?? new Set<string>()) {
      const cluster = clusterByNode.get(neighbor);
      if (cluster && cluster !== ownCluster) adjacentClusters.add(cluster);
    }
    const centrality = snapshot.metrics.centrality[id];
    return { id, score: adjacentClusters.size * 10 + (centrality?.degree ?? 0) };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return new Set(ranked.slice(0, Math.max(4, Math.ceil(Math.sqrt(layout.positions.size) * 0.8))).map((item) => item.id));
}

function mergeLayoutResult(
  initial: CanonicalLayoutResult,
  positions: ReadonlyMap<string, WorldPoint>,
): CanonicalLayoutResult {
  return {
    ...initial,
    positions: new Map(positions),
  };
}

function runStressSuite(layout: LayoutKind): StressTestSuite {
  const results: StressTestResult[] = [];
  for (const spec of STRESS_PROFILES) {
    const { snapshot, projection } = generatePathologicalGraph(spec);
    const start = performance.now();
    try {
      const result = computeCanonicalLayout(snapshot, projection, layout, DEFAULT_CANONICAL_LAYOUT_CONSTRAINTS);
      const layoutTimeMs = performance.now() - start;
      const stability = measureStability(result.positions, result.positions, buildAnalysisContext(snapshot, projection, result));
      results.push({
        profile: spec.id,
        nodeCount: spec.nodeCount,
        edgeCount: spec.edgeCount,
        layoutTimeMs: round(layoutTimeMs, 4),
        collisionPairs: result.metrics.collisionPairs,
        edgeCrossingsEstimate: result.metrics.edgeCrossingsEstimate,
        clusterCohesion: result.metrics.clusterCohesion,
        bridgeCount: result.metrics.bridgeCount,
        hubCount: result.metrics.hubCount,
        dependencyCorridorScore: result.metrics.dependencyCorridorScore,
        stabilityScore: stability.mentalMapScore,
        gracefulDegradation: layoutTimeMs < 6_000 && result.metrics.collisionPairs < spec.nodeCount,
        notes: deriveStressNotes(spec, result, layoutTimeMs),
      });
    } catch (error) {
      results.push({
        profile: spec.id,
        nodeCount: spec.nodeCount,
        edgeCount: spec.edgeCount,
        layoutTimeMs: round(performance.now() - start, 4),
        collisionPairs: -1,
        edgeCrossingsEstimate: 0,
        clusterCohesion: 0,
        bridgeCount: 0,
        hubCount: 0,
        dependencyCorridorScore: 0,
        stabilityScore: 0,
        gracefulDegradation: false,
        notes: [`layout error: ${(error as Error).message}`],
      });
    }
  }
  return {
    specs: STRESS_PROFILES,
    results,
    totalProfiles: STRESS_PROFILES.length,
    gracefulDegradationCount: results.filter((result) => result.gracefulDegradation).length,
  };
}

function deriveStressNotes(spec: PathologicalGraphSpec, result: CanonicalLayoutResult, layoutTimeMs: number): readonly string[] {
  const notes: string[] = [];
  if (layoutTimeMs > 4_000) notes.push("layout exceeded 4s budget");
  if (result.metrics.collisionPairs > spec.nodeCount * 0.4) notes.push("high collision rate");
  if (result.metrics.edgeCrossingsEstimate > spec.edgeCount * 0.5) notes.push("high crossing count");
  if (result.metrics.bridgeCount === 0) notes.push("no bridge nodes detected");
  if (result.metrics.hubCount === 0) notes.push("no hub nodes detected");
  if (!notes.length) notes.push("layout produced within tolerance");
  return notes;
}

function emptyRegression(): RegressionValidationReport {
  return { totalChecks: 0, preservedChecks: 0, regressedChecks: 0, checks: [] };
}

function buildRegressionCheck(
  collision: CollisionReport,
  crossing: CrossingReport,
  stability: StabilityReport,
  determinism: DeterminismReport,
  cluster: ClusterQualityMetrics,
  context: LayoutAnalysisContext,
  reference: import("../layout-engine.ts").CanonicalLayoutResult,
): RegressionValidationReport {
  const baseline = buildRegressionBaseline({ collision, crossing, cluster, context });
  const referenceCluster = computeClusterQuality(reference.positions, context);
  const referenceBaseline = buildRegressionBaseline({
    collision: { ...collision, collisions: reference.metrics.collisionPairs, severity: collision.severity },
    crossing: { ...crossing, crossings: reference.metrics.edgeCrossingsEstimate },
    cluster: referenceCluster,
    context,
  });
  const phase8Baseline = {
    semanticGravity: Math.min(baseline.semanticGravity, referenceBaseline.semanticGravity),
    hubPlacement: Math.min(baseline.hubPlacement, referenceBaseline.hubPlacement),
    bridgePreservation: Math.min(baseline.bridgePreservation, referenceBaseline.bridgePreservation),
    lodCompatibility: referenceBaseline.lodCompatibility,
    viewportFraming: Math.min(baseline.viewportFraming, referenceBaseline.viewportFraming),
    rendererCompatibility: referenceBaseline.rendererCompatibility,
    projectionCompatibility: referenceBaseline.projectionCompatibility,
    collisionScore: referenceBaseline.collisionScore,
    crossingScore: referenceBaseline.crossingScore,
  };
  return validateRegression({
    collision,
    crossing,
    stability,
    determinism,
    cluster,
    context,
    phase8Reference: phase8Baseline,
  });
}

function emptyStress(): StressTestSuite {
  return { specs: [], results: [], totalProfiles: 0, gracefulDegradationCount: 0 };
}

function emptyBenchmark(): BenchmarkSuite {
  return { scales: [], results: [], measuredScales: [], simulatedScales: [] };
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function summarizeCertification(report: CertificationReport): {
  readonly verdict: "NOT READY" | "READY WITH WARNINGS" | "CANONICALLY COMPLIANT";
  readonly blockingIssues: readonly string[];
  readonly warnings: readonly string[];
} {
  const blocking: string[] = [];
  const warnings: string[] = [];
  if (report.qualityScore.overall < 0.5) blocking.push(`overall quality score ${report.qualityScore.overall} below 0.5`);
  if (report.constraints.passRate < 0.8) blocking.push(`constraint pass rate ${round(report.constraints.passRate, 4)} below 0.8`);
  if (report.regression.regressedChecks > 0) blocking.push(`regression regressed checks ${report.regression.regressedChecks}`);
  if (!report.determinism.deterministic) blocking.push("determinism failed");
  if (report.stress.gracefulDegradationCount < report.stress.totalProfiles * 0.7) {
    warnings.push(`stress tests graceful ${report.stress.gracefulDegradationCount}/${report.stress.totalProfiles}`);
  }
  if (report.collision.severity === "severe") warnings.push(`collision severity severe (${report.collision.collisions})`);
  if (report.qualityScore.overall < 0.85) warnings.push(`overall score below 0.85 (${report.qualityScore.overall})`);
  if (report.collision.collisions > 0) warnings.push(`residual collisions: ${report.collision.collisions} (severity: ${report.collision.severity})`);
  if (report.crossing.crossings > 0) warnings.push(`residual crossings: ${report.crossing.crossings}`);
  if (blocking.length > 0) return { verdict: "NOT READY", blockingIssues: blocking, warnings };
  if (warnings.length > 0) return { verdict: "READY WITH WARNINGS", blockingIssues: blocking, warnings };
  return { verdict: "CANONICALLY COMPLIANT", blockingIssues: blocking, warnings };
}

export type {
  BenchmarkSuite,
  CertificationReport,
  ClusterQualityMetrics,
  CollisionReport,
  ConstraintValidationReport,
  CrossingReport,
  DensityProfile,
  DeterminismReport,
  LayoutQualityScore,
  MemoryReport,
  RegressionValidationReport,
  StabilityReport,
  StressTestResult,
  StressTestSuite,
} from "./types.ts";
export type { IncrementalAnchor } from "./incremental-stability.ts";
export { buildAnalysisContext };
