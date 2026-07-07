/* eslint-disable */
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

interface RunResult {
  readonly phase8Collisions: number;
  readonly phase8TimeMs: number;
  readonly phase8MemoryBytes: number;
  readonly phase85Collisions: number;
  readonly phase85TimeMs: number;
  readonly phase85MemoryBytes: number;
  readonly nodeCount: number;
}

async function main(): Promise<void> {
  const g = await import("../.tmp/ts-tests/src/atlas/graph-foundation/index.js");
  const l = await import("../.tmp/ts-tests/src/atlas/visualization-foundation/layout/index.js");
  const e = await import("../.tmp/ts-tests/src/atlas/visualization-foundation/layout-engine.js");

  const snapshot = new g.SnapshotCompiler().compile(g.createInitialAtlasGraphSource());
  const projection = new g.ProjectionEngine().generate(snapshot, { kind: "topology" });
  const report = l.runCertification(snapshot, projection, {
    layout: "force",
    determinismRuns: 100,
    includeBenchmarkSuite: true,
    includeStressTests: true,
  });
  const summary = l.summarizeCertification(report);

  const output = join(process.cwd(), "docs/architecture/nv-700/NV-700-PHASE-8.5_CERTIFICATION_DATA.json");
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify({ report, summary }, null, 2));
  console.log(`Certification verdict: ${summary.verdict}`);
  console.log(`Overall quality score: ${report.qualityScore.overall} (grade ${report.qualityScore.grade})`);
  console.log(`Collisions: ${report.collision.collisions} (severity ${report.collision.severity})`);
  console.log(`Crossings: ${report.crossing.crossings}`);
  console.log(`Mental map: ${report.stability.mentalMapScore}`);
  console.log(`Determinism runs: ${report.determinism.runs}, distinct: ${report.determinism.distinctPositionSignatures}`);
  console.log(`Constraint pass rate: ${report.constraints.passRate}`);
  console.log(`Regression preserved: ${report.regression.preservedChecks}/${report.regression.totalChecks}`);
  console.log(`Stress graceful: ${report.stress.gracefulDegradationCount}/${report.stress.totalProfiles}`);
  console.log(`Benchmark scales: ${report.benchmark.scales.join(", ")}`);
  console.log(`Saved to: ${output}`);
  void RunResult;
  void createHash;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
