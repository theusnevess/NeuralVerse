import { createHash } from "node:crypto";
import type { GraphProjection, GraphSnapshot } from "../../graph-foundation/index.ts";
import type { LayoutKind, WorldPoint } from "../types.ts";
import type { CanonicalLayoutResult, LayoutCluster } from "../layout-engine.ts";
import { computeCanonicalLayout, DEFAULT_CANONICAL_LAYOUT_CONSTRAINTS } from "../layout-engine.ts";
import type { DeterminismReport } from "./types.ts";

const DEFAULT_RUNS = 100;
const FLOAT_TOLERANCE = 1e-9;
const COORDINATE_DIGITS = 6;

export function auditDeterminism(
  snapshot: GraphSnapshot,
  projection: GraphProjection,
  layout: LayoutKind,
  runs: number = DEFAULT_RUNS,
): { readonly reference: CanonicalLayoutResult; readonly report: DeterminismReport } {
  const reference = computeCanonicalLayout(snapshot, projection, layout, DEFAULT_CANONICAL_LAYOUT_CONSTRAINTS);
  const signatures = new Set<string>();
  const clusterSignatures = new Set<string>();
  const hubSignatures = new Set<string>();
  const bridgeSignatures = new Set<string>();
  const viewportSignatures = new Set<string>();
  const positionHashes: string[] = [];
  let maxDrift = 0;
  let totalDrift = 0;
  let compared = 0;

  signatures.add(signatureForPositions(reference.positions));
  clusterSignatures.add(signatureForClusters(reference.clusters));
  hubSignatures.add(signatureForHubs(reference, snapshot));
  bridgeSignatures.add(signatureForBridges(reference, snapshot));
  viewportSignatures.add(signatureForBounds(reference.metrics.bounds));
  positionHashes.push(hashForPositions(reference.positions));

  for (let run = 1; run < runs; run += 1) {
    const candidate = computeCanonicalLayout(snapshot, projection, layout, DEFAULT_CANONICAL_LAYOUT_CONSTRAINTS);
    signatures.add(signatureForPositions(candidate.positions));
    clusterSignatures.add(signatureForClusters(candidate.clusters));
    hubSignatures.add(signatureForHubs(candidate, snapshot));
    bridgeSignatures.add(signatureForBridges(candidate, snapshot));
    viewportSignatures.add(signatureForBounds(candidate.metrics.bounds));
    positionHashes.push(hashForPositions(candidate.positions));
    const drift = comparePositions(reference.positions, candidate.positions);
    maxDrift = Math.max(maxDrift, drift.max);
    totalDrift += drift.mean;
    compared += 1;
  }

  const meanDrift = compared ? totalDrift / compared : 0;
  const deterministic =
    signatures.size <= 1 &&
    clusterSignatures.size <= 1 &&
    hubSignatures.size <= 1 &&
    bridgeSignatures.size <= 1 &&
    viewportSignatures.size <= 1 &&
    maxDrift <= FLOAT_TOLERANCE;

  return {
    reference,
    report: {
      runs,
      distinctPositionSignatures: signatures.size,
      distinctClusterSignatures: clusterSignatures.size,
      distinctHubSignatures: hubSignatures.size,
      distinctBridgeSignatures: bridgeSignatures.size,
      distinctViewportSignatures: viewportSignatures.size,
      positionDriftMax: round(maxDrift, 12),
      positionDriftMean: round(meanDrift, 12),
      deterministic,
      positionHash: positionHashes[0]!,
      clusterHash: [...clusterSignatures][0] ?? "",
      hubHash: [...hubSignatures][0] ?? "",
      bridgeHash: [...bridgeSignatures][0] ?? "",
      viewportHash: [...viewportSignatures][0] ?? "",
    },
  };
}

function signatureForPositions(positions: ReadonlyMap<string, WorldPoint>): string {
  return [...positions.entries()]
    .map(([id, point]) => `${id}:${point.x.toFixed(COORDINATE_DIGITS)}:${point.y.toFixed(COORDINATE_DIGITS)}`)
    .join("|");
}

function signatureForClusters(clusters: readonly LayoutCluster[]): string {
  return clusters
    .map((cluster) => `${cluster.id}:${cluster.members.length}:${cluster.centroid.x.toFixed(COORDINATE_DIGITS)}:${cluster.centroid.y.toFixed(COORDINATE_DIGITS)}`)
    .join("|");
}

function signatureForHubs(layout: CanonicalLayoutResult, snapshot: GraphSnapshot): string {
  return layout.clusters
    .filter((cluster) => cluster.hubCount > 0)
    .map((cluster) => `${cluster.id}:${cluster.hubCount}:${cluster.centroid.x.toFixed(3)}:${cluster.centroid.y.toFixed(3)}`)
    .join("|");
}

function signatureForBridges(layout: CanonicalLayoutResult, snapshot: GraphSnapshot): string {
  return `${layout.metrics.bridgeCount}:${layout.metrics.bounds.x.toFixed(COORDINATE_DIGITS)}:${layout.metrics.bounds.y.toFixed(COORDINATE_DIGITS)}`;
}

function signatureForBounds(bounds: CanonicalLayoutResult["metrics"]["bounds"]): string {
  return `${bounds.x.toFixed(COORDINATE_DIGITS)}:${bounds.y.toFixed(COORDINATE_DIGITS)}:${bounds.width.toFixed(COORDINATE_DIGITS)}:${bounds.height.toFixed(COORDINATE_DIGITS)}`;
}

function hashForPositions(positions: ReadonlyMap<string, WorldPoint>): string {
  const hash = createHash("sha256");
  for (const [id, point] of positions) {
    hash.update(id);
    hash.update(":");
    hash.update(point.x.toFixed(COORDINATE_DIGITS));
    hash.update(":");
    hash.update(point.y.toFixed(COORDINATE_DIGITS));
    hash.update("|");
  }
  return hash.digest("hex").slice(0, 32);
}

function comparePositions(
  reference: ReadonlyMap<string, WorldPoint>,
  candidate: ReadonlyMap<string, WorldPoint>,
): { readonly max: number; readonly mean: number } {
  let max = 0;
  let total = 0;
  let count = 0;
  for (const [id, point] of reference) {
    const other = candidate.get(id);
    if (!other) continue;
    const drift = Math.max(Math.abs(point.x - other.x), Math.abs(point.y - other.y));
    if (drift > max) max = drift;
    total += drift;
    count += 1;
  }
  return { max, mean: count ? total / count : 0 };
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
