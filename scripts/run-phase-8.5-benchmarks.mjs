import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

async function main() {
  const l = await import("../.tmp/ts-tests/src/atlas/visualization-foundation/layout/benchmark-suite.js");
  const { benchmarkScale, MATERIALIZED_SCALES, SIMULATED_SCALES } = l;

  const rows = [];
  console.log("Running materialized benchmarks (small Atlas-style)...");
  for (const scale of [2000, 5000, 10000, 25000, 50000]) {
    const t0 = Date.now();
    const row = benchmarkScale(scale, "force");
    const total = Date.now() - t0;
    rows.push({ ...row, totalMs: total });
    console.log([scale, row.mode, row.layoutTimeMs.toFixed(0) + "ms", (row.memoryBytes / 1e6).toFixed(2) + "MB", row.collisionPairs, row.edgeCrossingsEstimate, row.qualityScore].join(" | "));
  }
  console.log();
  console.log("Simulated benchmarks (50k-1M)...");
  for (const scale of SIMULATED_SCALES) {
    const row = benchmarkScale(scale, "force");
    rows.push({ ...row, totalMs: 0 });
    console.log([scale, row.mode, row.layoutTimeMs.toFixed(0) + "ms", (row.memoryBytes / 1e6).toFixed(2) + "MB", row.collisionPairs, row.edgeCrossingsEstimate, row.qualityScore].join(" | "));
  }

  const output = join(process.cwd(), "docs/architecture/nv-700/NV-700-PHASE-8.5_BENCHMARK_DATA.json");
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify({ rows, materialized: MATERIALIZED_SCALES, simulated: SIMULATED_SCALES }, null, 2));
  console.log("Saved: " + output);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
