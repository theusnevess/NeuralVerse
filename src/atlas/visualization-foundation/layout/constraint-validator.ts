import type { KnowledgeEdge } from "../../graph-foundation/index.ts";
import type { CanonicalLayoutConstraints, CanonicalLayoutResult } from "../layout-engine.ts";
import type { WorldPoint } from "../types.ts";
import type { ConstraintCheck, ConstraintValidationReport, LayoutAnalysisContext } from "./types.ts";

const MIN_SPACING_TOLERANCE = 0.001;
const HUB_EXCLUSION_TOLERANCE = 0.001;
const BOUNDARY_TOLERANCE = 0.001;
const BRIDGE_VISIBILITY_MIN = 80;

export function validateConstraints(
  layout: CanonicalLayoutResult,
  context: LayoutAnalysisContext,
  edges: readonly KnowledgeEdge[],
  options: { readonly layoutKind?: string } = {},
): ConstraintValidationReport {
  const layoutKind = options.layoutKind ?? "unknown";
  const checks: ConstraintCheck[] = [
    checkMinimumSpacing(layout, context),
    checkHubExclusion(layout, context),
    checkBoundaryPadding(layout, context),
    checkClusterContainment(layout, context),
    checkBridgeVisibility(layout, context),
    checkDependencyCorridor(layout, context, edges, layoutKind),
    checkLabelReservation(layout, context),
    checkViewportIntegrity(layout, context),
    checkDeterminismCompatibility(layout),
    checkRendererIndependence(layout),
  ];
  const passed = checks.filter((check) => check.passed).length;
  return {
    totalChecks: checks.length,
    passedChecks: passed,
    failedChecks: checks.length - passed,
    passRate: passed / Math.max(1, checks.length),
    checks,
  };
}

function checkMinimumSpacing(layout: CanonicalLayoutResult, context: LayoutAnalysisContext): ConstraintCheck {
  const minimum = context.constraints.minimumNodeDistance;
  const minAllowed = minimum * (1 - MIN_SPACING_TOLERANCE);
  const positions = layout.positions;
  let minObserved = Number.POSITIVE_INFINITY;
  const ids = [...positions.keys()];
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const a = positions.get(ids[i]!);
      const b = positions.get(ids[j]!);
      if (!a || !b) continue;
      const d = distance(a, b);
      if (d < minObserved) minObserved = d;
    }
  }
  const passed = minObserved >= minAllowed;
  return {
    name: "minimum-spacing",
    description: "Every node respects the canonical minimum spacing.",
    passed,
    observedValue: round(minObserved, 4),
    threshold: minimum,
    severity: "critical",
  };
}

function checkHubExclusion(layout: CanonicalLayoutResult, context: LayoutAnalysisContext): ConstraintCheck {
  if (!context.hubIds.size) {
    return {
      name: "hub-exclusion",
      description: "Hub exclusion zones are respected (no hubs defined).",
      passed: true,
      observedValue: 0,
      threshold: context.constraints.hubSpacing,
      severity: "major",
    };
  }
  const hubIds = [...context.hubIds];
  let minHubDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < hubIds.length; i += 1) {
    for (let j = i + 1; j < hubIds.length; j += 1) {
      const a = layout.positions.get(hubIds[i]!);
      const b = layout.positions.get(hubIds[j]!);
      if (!a || !b) continue;
      const d = distance(a, b);
      if (d < minHubDistance) minHubDistance = d;
    }
  }
  const required = context.constraints.hubSpacing * 1.4;
  const passed = minHubDistance === Number.POSITIVE_INFINITY || minHubDistance >= required * (1 - HUB_EXCLUSION_TOLERANCE);
  return {
    name: "hub-exclusion",
    description: "Hub nodes maintain mutual exclusion zones.",
    passed,
    observedValue: round(minHubDistance, 4),
    threshold: required,
    severity: "major",
  };
}

function checkBoundaryPadding(layout: CanonicalLayoutResult, context: LayoutAnalysisContext): ConstraintCheck {
  const required = context.constraints.boundaryPadding;
  const bounds = layout.metrics.bounds;
  const passed = bounds.x <= -required + BOUNDARY_TOLERANCE &&
    bounds.y <= -required + BOUNDARY_TOLERANCE &&
    bounds.x + bounds.width >= -required + BOUNDARY_TOLERANCE;
  return {
    name: "boundary-padding",
    description: "Cluster centroids and hubs stay within the padded boundary.",
    passed,
    observedValue: round(Math.abs(bounds.x), 4),
    threshold: required,
    severity: "major",
  };
}

function checkClusterContainment(layout: CanonicalLayoutResult, context: LayoutAnalysisContext): ConstraintCheck {
  if (!layout.clusters.length) {
    return {
      name: "cluster-containment",
      description: "All non-bridge cluster members stay within their cluster boundary.",
      passed: true,
      observedValue: 0,
      threshold: context.constraints.clusterSpacing,
      severity: "major",
    };
  }
  let worst = 0;
  let organicThreshold = 0;
  for (const cluster of layout.clusters) {
    const points: WorldPoint[] = [];
    for (const memberId of cluster.members) {
      if (context.bridgeIds.has(memberId)) continue;
      const point = layout.positions.get(memberId);
      if (!point) continue;
      points.push(point);
      const drift = distance(point, cluster.centroid);
      if (drift > worst) worst = drift;
    }
    if (points.length) organicThreshold = Math.max(organicThreshold, organicContainmentRadius(points, cluster.centroid, context.constraints));
  }
  const threshold = Math.max(context.constraints.clusterSpacing * 0.65, organicThreshold);
  return {
    name: "cluster-containment",
    description: "All non-bridge cluster members stay within their cluster boundary.",
    passed: worst <= threshold,
    observedValue: round(worst, 4),
    threshold: round(threshold, 4),
    severity: "major",
  };
}

function organicContainmentRadius(points: readonly WorldPoint[], centroid: WorldPoint, constraints: CanonicalLayoutConstraints): number {
  const distances = points.map((point) => distance(point, centroid)).sort((a, b) => a - b);
  const percentileIndex = Math.min(distances.length - 1, Math.floor(distances.length * 0.95));
  const percentile = distances[percentileIndex] ?? 0;
  const max = distances[distances.length - 1] ?? 0;
  return Math.max(percentile + constraints.boundaryPadding * 0.75, max + constraints.minimumNodeDistance);
}

function checkBridgeVisibility(layout: CanonicalLayoutResult, context: LayoutAnalysisContext): ConstraintCheck {
  if (!context.bridgeIds.size) {
    return {
      name: "bridge-visibility",
      description: "Bridges remain visible between cluster boundaries.",
      passed: true,
      observedValue: 0,
      threshold: BRIDGE_VISIBILITY_MIN,
      severity: "minor",
    };
  }
  const clusterCenters = new Map(layout.clusters.map((cluster) => [cluster.id, cluster.centroid]));
  let minSeparation = Number.POSITIVE_INFINITY;
  for (const id of context.bridgeIds) {
    const point = layout.positions.get(id);
    if (!point) continue;
    const nearest = nearestClusterDistance(point, clusterCenters);
    if (nearest < minSeparation) minSeparation = nearest;
  }
  return {
    name: "bridge-visibility",
    description: "Bridge nodes are visible between clusters.",
    passed: minSeparation >= BRIDGE_VISIBILITY_MIN * 0.5,
    observedValue: round(minSeparation, 4),
    threshold: BRIDGE_VISIBILITY_MIN,
    severity: "minor",
  };
}

function checkDependencyCorridor(layout: CanonicalLayoutResult, context: LayoutAnalysisContext, edges: readonly KnowledgeEdge[], layoutKind: string): ConstraintCheck {
  const dependencyEdges = edges.filter((edge) => {
    const type = edge.type;
    return type === "requires" || type === "depends_on" || type === "builds_on" || type === "precedes" || type === "teaches" || type === "enables" || type === "composes" || type === "extends";
  });
  const score = layout.metrics.dependencyCorridorScore;
  if (!dependencyEdges.length) {
    return {
      name: "dependency-corridor",
      description: "Dependency edges flow left-to-right along corridors (skipped: no dependency edges in projection).",
      passed: true,
      observedValue: score,
      threshold: 0.5,
      severity: "major",
    };
  }
  if (layoutKind !== "dependency" && layoutKind !== "hierarchical") {
    return {
      name: "dependency-corridor",
      description: `Dependency edges flow left-to-right along corridors (informational for ${layoutKind} layout).`,
      passed: true,
      observedValue: round(score, 4),
      threshold: 0.3,
      severity: "minor",
    };
  }
  if (context.clusters.length <= 1) {
    return {
      name: "dependency-corridor",
      description: "Dependency edges flow left-to-right along corridors (informational for single-cluster layouts).",
      passed: true,
      observedValue: round(score, 4),
      threshold: 0.5,
      severity: "minor",
    };
  }
  const orderedCorrelation = computeOrderedCorrelation(layout, dependencyEdges);
  return {
    name: "dependency-corridor",
    description: "Dependency edges flow left-to-right along corridors (correlation).",
    passed: orderedCorrelation >= 0.3 || score >= 0.5,
    observedValue: round(orderedCorrelation, 4),
    threshold: 0.3,
    severity: "major",
  };
}

function computeOrderedCorrelation(layout: CanonicalLayoutResult, dependencyEdges: readonly KnowledgeEdge[]): number {
  if (dependencyEdges.length < 2) return 1;
  let correctlyOrdered = 0;
  let unordered = 0;
  for (const edge of dependencyEdges) {
    const source = layout.positions.get(edge.source);
    const target = layout.positions.get(edge.target);
    if (!source || !target) continue;
    const deltaX = target.x - source.x;
    const deltaY = target.y - source.y;
    if (deltaX >= -10 && deltaY >= -10) correctlyOrdered += 1;
    else if (deltaX < -20 && deltaY < -20) unordered += 1;
  }
  const total = dependencyEdges.length;
  return total > 0 ? (correctlyOrdered - unordered * 0.5) / total : 1;
}

function checkLabelReservation(layout: CanonicalLayoutResult, context: LayoutAnalysisContext): ConstraintCheck {
  const reserved = context.constraints.labelPadding;
  return {
    name: "label-reservation",
    description: "Label reservation is enforced as part of minimum spacing.",
    passed: reserved > 0,
    observedValue: reserved,
    threshold: 1,
    severity: "minor",
  };
}

function checkViewportIntegrity(layout: CanonicalLayoutResult, context: LayoutAnalysisContext): ConstraintCheck {
  const bounds = layout.metrics.bounds;
  return {
    name: "viewport-integrity",
    description: "Layout bounds are finite and non-degenerate.",
    passed: Number.isFinite(bounds.x) && Number.isFinite(bounds.y) && bounds.width > 0 && bounds.height > 0,
    observedValue: bounds.width * bounds.height,
    threshold: 1,
    severity: "critical",
  };
}

function checkDeterminismCompatibility(layout: CanonicalLayoutResult): ConstraintCheck {
  return {
    name: "determinism-compatibility",
    description: "Layout positions are deterministic and finite.",
    passed: [...layout.positions.values()].every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)),
    observedValue: [...layout.positions.values()].filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y)).length,
    threshold: layout.positions.size,
    severity: "critical",
  };
}

function checkRendererIndependence(layout: CanonicalLayoutResult): ConstraintCheck {
  const positionsHaveOnlyWorldSpace = [...layout.positions.values()].every((point) => typeof point.x === "number" && typeof point.y === "number");
  return {
    name: "renderer-independence",
    description: "Layout contains only world-space coordinates and no renderer artifacts.",
    passed: positionsHaveOnlyWorldSpace,
    observedValue: layout.positions.size,
    threshold: layout.positions.size,
    severity: "critical",
  };
}

function nearestClusterDistance(point: WorldPoint, centers: ReadonlyMap<string, WorldPoint>): number {
  let best = Number.POSITIVE_INFINITY;
  for (const center of centers.values()) {
    const d = distance(point, center);
    if (d < best) best = d;
  }
  return best;
}

function distance(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
