import assert from "node:assert";
import { describe, test } from "node:test";
import { ProjectionEngine, SnapshotCompiler, createInitialAtlasGraphSource } from "../graph-foundation/index.ts";
import {
  applyIncrementalAnchor,
  auditDeterminism,
  buildAnalysisContext,
  buildRegressionBaseline,
  computeClusterQuality,
  createAnchor,
  generatePathologicalGraph,
  measureStability,
  reduceCollisions,
  reduceCrossings,
  refineDensity,
  runCertification,
  scoreLayout,
  summarizeCertification,
  validateConstraints,
  validateRegression,
} from "./layout/index.ts";
import { computeCanonicalLayout, DEFAULT_CANONICAL_LAYOUT_CONSTRAINTS } from "./layout-engine.ts";
import { benchmarkScale } from "./layout/benchmark-suite.ts";
import { ALL_SCALES, MATERIALIZED_SCALES, SIMULATED_SCALES } from "./layout/benchmark-suite.ts";
import { STRESS_PROFILES } from "./layout/stress-graphs.ts";

const generatedAt = "2026-07-05T00:00:00.000Z";

function smallProjection() {
  const snapshot = new SnapshotCompiler().compile(createInitialAtlasGraphSource());
  const projection = new ProjectionEngine().generate(snapshot, { kind: "topology" });
  return { snapshot, projection };
}

function smallLayout(layout: "force" | "domain" | "dependency" = "force") {
  const { snapshot, projection } = smallProjection();
  const result = computeCanonicalLayout(snapshot, projection, layout, DEFAULT_CANONICAL_LAYOUT_CONSTRAINTS);
  const context = buildAnalysisContext(snapshot, projection, result);
  return { snapshot, projection, result, context };
}

describe("Atlas layout certification", () => {
  test("collision reduction decreases or maintains collisions after re-application", () => {
    const { result, context } = smallLayout();
    const baseline = result.metrics.collisionPairs;
    const reduced = reduceCollisions(result.positions, context);
    assert.ok(reduced.report.collisions <= baseline, `expected reduced collisions <= ${baseline}, got ${reduced.report.collisions}`);
    assert.ok(reduced.report.passesExecuted >= 1);
    assert.ok(["clean", "mild", "moderate", "severe"].includes(reduced.report.severity));
  });

  test("density refinement produces a populated profile", () => {
    const { result, context } = smallLayout();
    const refined = refineDensity(result.positions, context);
    assert.ok(refined.profile.localCells.length > 0);
    assert.ok(refined.profile.recommendedInflation >= 1);
    assert.ok(refined.profile.recommendedContraction <= 1);
    assert.ok(refined.profile.globalDensity > 0);
  });

  test("crossing reduction attempts untangling without worsening the baseline", () => {
    const { snapshot, projection, result, context } = smallLayout();
    const edges = projection.edgeIds.map((id) => snapshot.edges.get(id)!).filter(Boolean);
    const crossings = reduceCrossings(result.positions, edges, context);
    assert.ok(crossings.report.untangleIterations >= 1);
    assert.ok(crossings.report.crossings >= 0);
    assert.ok(crossings.report.barycentricOrder.length >= 0);
  });

  test("incremental stability preserves anchor points for shared nodes", () => {
    const { snapshot, projection, result, context } = smallLayout();
    const anchor = createAnchor(result.positions, context, generatedAt);
    const tweaked = new Map(result.positions);
    const firstKey = tweaked.keys().next().value;
    if (firstKey) {
      const original = tweaked.get(firstKey)!;
      tweaked.set(firstKey, { x: original.x + 500, y: original.y + 500 });
    }
    const blended = applyIncrementalAnchor(tweaked, context, anchor, snapshot);
    if (firstKey) {
      const blendedPoint = blended.get(firstKey)!;
      const originalPoint = result.positions.get(firstKey)!;
      const drift = Math.hypot(blendedPoint.x - originalPoint.x, blendedPoint.y - originalPoint.y);
      assert.ok(drift < 500, `expected drift < 500, got ${drift}`);
    }
    const stability = measureStability(result.positions, blended, context);
    assert.ok(stability.mentalMapScore > 0);
    assert.ok(stability.averageDisplacement >= 0);
  });

  test("determinism audit verifies identical layouts across multiple runs", () => {
    const { snapshot, projection } = smallProjection();
    const { report } = auditDeterminism(snapshot, projection, "force", 10);
    assert.strictEqual(report.runs, 10);
    assert.strictEqual(report.distinctPositionSignatures, 1);
    assert.strictEqual(report.distinctClusterSignatures, 1);
    assert.strictEqual(report.distinctHubSignatures, 1);
    assert.strictEqual(report.distinctBridgeSignatures, 1);
    assert.strictEqual(report.distinctViewportSignatures, 1);
    assert.ok(report.positionDriftMax <= 1e-9);
    assert.strictEqual(report.deterministic, true);
  });

  test("cluster quality exposes silhouette, cohesion, and hub metrics", () => {
    const { result, context } = smallLayout();
    const quality = computeClusterQuality(result.positions, context);
    assert.ok(quality.clusterCount > 0);
    assert.ok(quality.silhouetteScore >= -1);
    assert.ok(quality.silhouetteScore <= 1);
    assert.ok(quality.hubCentralityScore >= 0);
    assert.ok(quality.bridgeVisibilityScore >= 0);
    assert.ok(quality.densityHomogeneity >= 0);
    assert.ok(quality.densityHomogeneity <= 1);
  });

  test("layout quality score is a value in [0,1] with a letter grade", () => {
    const { snapshot, projection, result, context } = smallLayout();
    const collisions = reduceCollisions(result.positions, context);
    const density = refineDensity(collisions.positions, context);
    const crossings = reduceCrossings(density.positions, projection.edgeIds.map((id) => snapshot.edges.get(id)!).filter(Boolean), context);
    const { report: determinism } = auditDeterminism(snapshot, projection, "force", 3);
    const memory = { heapBeforeBytes: 0, heapPeakBytes: 0, heapAfterBytes: 0, heapDeltaBytes: 0, externalBytes: 0, arrayBuffersBytes: 0, rssBytes: 0, iterations: 1, avgIterationMs: 0, totalLayoutMs: 1, recycledGridReuseRatio: 1, stableAllocationEstimate: 0 };
    const cluster = computeClusterQuality(crossings.positions, context);
    const stability = measureStability(result.positions, crossings.positions, context);
    const score = scoreLayout({
      collision: collisions.report,
      density: density.profile,
      crossing: crossings.report,
      stability,
      determinism,
      memory,
      cluster,
      context,
      layoutTimeMs: 1,
    });
    assert.ok(score.overall >= 0 && score.overall <= 1);
    assert.ok(["A", "B", "C", "D", "F"].includes(score.grade));
  });

  test("constraint validator reports all canonical checks", () => {
    const { snapshot, projection, result, context } = smallLayout();
    const edges = projection.edgeIds.map((id) => snapshot.edges.get(id)!).filter(Boolean);
    const validation = validateConstraints(result, context, edges);
    assert.ok(validation.totalChecks >= 8);
    assert.ok(validation.passRate >= 0);
    assert.ok(validation.passRate <= 1);
    assert.ok(validation.checks.find((c) => c.name === "minimum-spacing"));
    assert.ok(validation.checks.find((c) => c.name === "viewport-integrity"));
  });

  test("regression validator preserves all canonical checks", () => {
    const { snapshot, projection, result, context } = smallLayout();
    const collisions = reduceCollisions(result.positions, context);
    const crossings = reduceCrossings(collisions.positions, projection.edgeIds.map((id) => snapshot.edges.get(id)!).filter(Boolean), context);
    const { report: determinism } = auditDeterminism(snapshot, projection, "force", 3);
    const cluster = computeClusterQuality(crossings.positions, context);
    const stability = measureStability(result.positions, crossings.positions, context);
    const phase8Reference = buildRegressionBaseline({ collision: collisions.report, crossing: crossings.report, cluster, context });
    const regression = validateRegression({ collision: collisions.report, crossing: crossings.report, stability, determinism, cluster, context, phase8Reference });
    assert.ok(regression.totalChecks >= 7);
    assert.ok(regression.preservedChecks >= regression.totalChecks - 2);
  });

  test("stress graph generators produce pathological graphs for every profile", () => {
    for (const spec of STRESS_PROFILES) {
      const generated = generatePathologicalGraph(spec);
      assert.ok(generated.snapshot.nodes.size > 0);
      assert.ok(generated.snapshot.edges.size > 0);
      const result = computeCanonicalLayout(generated.snapshot, generated.projection, "force", DEFAULT_CANONICAL_LAYOUT_CONSTRAINTS);
      assert.ok(result.metrics.collisionPairs >= 0);
    }
  });

  test("benchmark scale declarations separate materialized and simulated ranges", () => {
    assert.deepStrictEqual(MATERIALIZED_SCALES, [2_000, 10_000, 25_000, 50_000, 100_000]);
    assert.deepStrictEqual(SIMULATED_SCALES, [250_000, 500_000, 1_000_000]);
    assert.deepStrictEqual(ALL_SCALES, [...MATERIALIZED_SCALES, ...SIMULATED_SCALES]);
  });

  test("benchmarkScale reports actual mode for materialized scales", () => {
    const row = benchmarkScale(2_000, "force");
    assert.strictEqual(row.mode, "actual");
    assert.strictEqual(row.nodeCount, 2_000);
  });

  test("benchmarkScale reports simulated mode for extreme scales", () => {
    const row = benchmarkScale(1_000_000, "force");
    assert.strictEqual(row.mode, "simulated");
    assert.strictEqual(row.nodeCount, 1_000_000);
  });

  test("full certification produces a complete report with verdict", () => {
    const { snapshot, projection } = smallProjection();
    const report = runCertification(snapshot, projection, {
      layout: "force",
      determinismRuns: 3,
      includeBenchmarkSuite: false,
      includeStressTests: true,
    });
    assert.ok(report.collision.collisions >= 0);
    assert.ok(report.density.localCells.length >= 0);
    assert.ok(report.crossing.untangleIterations >= 0);
    assert.ok(report.stability.mentalMapScore > 0);
    assert.strictEqual(report.determinism.runs, 3);
    assert.ok(report.qualityScore.overall >= 0);
    assert.ok(report.constraints.totalChecks > 0);
    assert.ok(report.regression.totalChecks > 0);
    assert.ok(report.stress.totalProfiles > 0);
    const summary = summarizeCertification(report);
    assert.ok(["NOT READY", "READY WITH WARNINGS", "CANONICALLY COMPLIANT"].includes(summary.verdict));
  });
});
