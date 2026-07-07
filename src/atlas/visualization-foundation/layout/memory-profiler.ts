import { performance } from "node:perf_hooks";
import type { MemoryReport } from "./types.ts";

export interface MemoryProfilerHandle {
  readonly report: MemoryReport;
  startIteration(): void;
  endIteration(): void;
  recordReuseRatio(reused: number, allocated: number): void;
  finish(): MemoryReport;
}

export function createMemoryProfiler(): MemoryProfilerHandle {
  const heapBefore = currentHeap();
  const start = performance.now();
  let peak = heapBefore;
  let iterations = 0;
  let totalMs = 0;
  let reused = 0;
  let allocated = 0;
  const pollHandle = setInterval(() => {
    const current = currentHeap();
    if (current > peak) peak = current;
  }, 25).unref();

  return {
    get report() {
      return buildReport(heapBefore, peak, iterations, totalMs, reused, allocated, start);
    },
    startIteration() {
      iterations += 1;
    },
    endIteration() {
      totalMs = performance.now() - start;
      const current = currentHeap();
      if (current > peak) peak = current;
    },
    recordReuseRatio(reusedCount: number, allocatedCount: number) {
      reused += Math.max(0, reusedCount);
      allocated += Math.max(0, allocatedCount);
    },
    finish() {
      clearInterval(pollHandle);
      const current = currentHeap();
      if (current > peak) peak = current;
      totalMs = performance.now() - start;
      return buildReport(heapBefore, peak, iterations, totalMs, reused, allocated, start);
    },
  };
}

function buildReport(
  heapBefore: number,
  heapPeak: number,
  iterations: number,
  totalMs: number,
  reused: number,
  allocated: number,
  start: number,
): MemoryReport {
  const usage = process.memoryUsage();
  const ratio = allocated > 0 ? reused / allocated : 1;
  return {
    heapBeforeBytes: heapBefore,
    heapPeakBytes: heapPeak,
    heapAfterBytes: usage.heapUsed,
    heapDeltaBytes: Math.max(0, usage.heapUsed - heapBefore),
    externalBytes: usage.external,
    arrayBuffersBytes: usage.arrayBuffers,
    rssBytes: usage.rss,
    iterations,
    avgIterationMs: iterations ? totalMs / iterations : 0,
    totalLayoutMs: round(totalMs, 4),
    recycledGridReuseRatio: round(Math.min(1, ratio), 4),
    stableAllocationEstimate: round(allocated, 0),
  };
}

function currentHeap(): number {
  return process.memoryUsage().heapUsed;
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
