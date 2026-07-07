import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

async function main() {
  const g = await import("../.tmp/ts-tests/src/atlas/graph-foundation/index.js");
  const l = await import("../.tmp/ts-tests/src/atlas/visualization-foundation/layout/index.js");
  const e = await import("../.tmp/ts-tests/src/atlas/visualization-foundation/layout-engine.js");

  const snapshot = new g.SnapshotCompiler().compile(g.createInitialAtlasGraphSource());
  const projection = new g.ProjectionEngine().generate(snapshot, { kind: "topology" });
  console.log("Running certification with 100 determinism runs...");
  const t0 = Date.now();
  const report = l.runCertification(snapshot, projection, {
    layout: "force",
    determinismRuns: 100,
    includeBenchmarkSuite: true,
    includeStressTests: true,
  });
  const summary = l.summarizeCertification(report);
  const elapsed = Date.now() - t0;
  console.log("Certification completed in " + elapsed + " ms");

  const output = join(process.cwd(), "docs/architecture/nv-700/NV-700-PHASE-8.5_CERTIFICATION_DATA.json");
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify({ report, summary, elapsed }, null, 2));
  console.log("Verdict: " + summary.verdict);
  console.log("Overall quality: " + report.qualityScore.overall + " (grade " + report.qualityScore.grade + ")");
  console.log("Collisions: " + report.collision.collisions + " (severity " + report.collision.severity + ")");
  console.log("Crossings: " + report.crossing.crossings);
  console.log("Mental map: " + report.stability.mentalMapScore);
  console.log("Determinism runs: " + report.determinism.runs + ", distinct: " + report.determinism.distinctPositionSignatures);
  console.log("Constraint pass rate: " + report.constraints.passRate);
  console.log("Regression preserved: " + report.regression.preservedChecks + "/" + report.regression.totalChecks);
  console.log("Stress graceful: " + report.stress.gracefulDegradationCount + "/" + report.stress.totalProfiles);
  console.log("Benchmark measured: " + report.benchmark.measuredScales.join(", "));
  console.log("Benchmark simulated: " + report.benchmark.simulatedScales.join(", "));
  console.log("Saved: " + output);
  void e;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
