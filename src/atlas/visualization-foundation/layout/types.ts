import type { GraphSnapshot, KnowledgeEdge, KnowledgeNode } from "../../graph-foundation/index.ts";
import type { CanonicalLayoutConstraints, CanonicalLayoutResult, LayoutCluster } from "../layout-engine.ts";
import type { WorldPoint } from "../types.ts";

export interface CollisionReport {
  readonly collisions: number;
  readonly passesExecuted: number;
  readonly converged: boolean;
  readonly overlapArea: number;
  readonly maxOverlapDepth: number;
  readonly severity: "clean" | "mild" | "moderate" | "severe";
}

export interface DensityCell {
  readonly cellX: number;
  readonly cellY: number;
  readonly center: WorldPoint;
  readonly memberIds: readonly string[];
  readonly density: number;
  readonly recommendedSpacing: number;
}

export interface DensityProfile {
  readonly localCells: readonly DensityCell[];
  readonly globalDensity: number;
  readonly denseCellCount: number;
  readonly sparseCellCount: number;
  readonly recommendedInflation: number;
  readonly recommendedContraction: number;
}

export interface CrossingReport {
  readonly crossings: number;
  readonly crossingsPerEdge: number;
  readonly tangleableEdges: number;
  readonly untangledCrossings: number;
  readonly barycentricOrder: readonly string[];
  readonly untangleIterations: number;
  readonly improved: boolean;
}

export interface StabilityReport {
  readonly beforeCount: number;
  readonly afterCount: number;
  readonly addedIds: readonly string[];
  readonly removedIds: readonly string[];
  readonly sharedIds: readonly string[];
  readonly averageDisplacement: number;
  readonly maximumDisplacement: number;
  readonly clusterDisplacement: number;
  readonly hubDisplacement: number;
  readonly bridgeDisplacement: number;
  readonly mentalMapScore: number;
}

export interface DeterminismReport {
  readonly runs: number;
  readonly distinctPositionSignatures: number;
  readonly distinctClusterSignatures: number;
  readonly distinctHubSignatures: number;
  readonly distinctBridgeSignatures: number;
  readonly distinctViewportSignatures: number;
  readonly positionDriftMax: number;
  readonly positionDriftMean: number;
  readonly deterministic: boolean;
  readonly positionHash: string;
  readonly clusterHash: string;
  readonly hubHash: string;
  readonly bridgeHash: string;
  readonly viewportHash: string;
}

export interface MemoryReport {
  readonly heapBeforeBytes: number;
  readonly heapPeakBytes: number;
  readonly heapAfterBytes: number;
  readonly heapDeltaBytes: number;
  readonly externalBytes: number;
  readonly arrayBuffersBytes: number;
  readonly rssBytes: number;
  readonly iterations: number;
  readonly avgIterationMs: number;
  readonly totalLayoutMs: number;
  readonly recycledGridReuseRatio: number;
  readonly stableAllocationEstimate: number;
}

export interface ClusterQualityMetrics {
  readonly clusterCount: number;
  readonly silhouetteScore: number;
  readonly cohesionAverage: number;
  readonly separationAverage: number;
  readonly intraClusterDistanceAverage: number;
  readonly interClusterDistanceAverage: number;
  readonly hubCentralityScore: number;
  readonly bridgeVisibilityScore: number;
  readonly neighborhoodEntropy: number;
  readonly densityHomogeneity: number;
}

export interface LayoutQualityScore {
  readonly collision: number;
  readonly density: number;
  readonly crossing: number;
  readonly stability: number;
  readonly determinism: number;
  readonly hubClarity: number;
  readonly bridgeClarity: number;
  readonly clusterQuality: number;
  readonly viewportQuality: number;
  readonly performance: number;
  readonly overall: number;
  readonly grade: "A" | "B" | "C" | "D" | "F";
}

export interface StressTestResult {
  readonly profile: string;
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly layoutTimeMs: number;
  readonly collisionPairs: number;
  readonly edgeCrossingsEstimate: number;
  readonly clusterCohesion: number;
  readonly bridgeCount: number;
  readonly hubCount: number;
  readonly dependencyCorridorScore: number;
  readonly stabilityScore: number;
  readonly gracefulDegradation: boolean;
  readonly notes: readonly string[];
}

export interface ConstraintCheck {
  readonly name: string;
  readonly description: string;
  readonly passed: boolean;
  readonly observedValue: number;
  readonly threshold: number;
  readonly severity: "critical" | "major" | "minor";
}

export interface ConstraintValidationReport {
  readonly totalChecks: number;
  readonly passedChecks: number;
  readonly failedChecks: number;
  readonly passRate: number;
  readonly checks: readonly ConstraintCheck[];
}

export interface RegressionCheck {
  readonly name: string;
  readonly description: string;
  readonly before: number;
  readonly after: number;
  readonly delta: number;
  readonly preserved: boolean;
  readonly severity: "critical" | "major" | "minor";
}

export interface RegressionValidationReport {
  readonly totalChecks: number;
  readonly preservedChecks: number;
  readonly regressedChecks: number;
  readonly checks: readonly RegressionCheck[];
}

export interface PathologicalGraphSpec {
  readonly id: string;
  readonly kind:
    | "giant-hub"
    | "fully-connected"
    | "long-chain"
    | "star"
    | "ring"
    | "deep-hierarchy"
    | "extreme-bridge"
    | "isolated-islands"
    | "dense-curriculum"
    | "mixed-ontology";
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly parameters: Readonly<Record<string, number>>;
}

export interface StressTestSuite {
  readonly specs: readonly PathologicalGraphSpec[];
  readonly results: readonly StressTestResult[];
  readonly totalProfiles: number;
  readonly gracefulDegradationCount: number;
}

export interface BenchmarkSuite {
  readonly scales: readonly number[];
  readonly results: readonly CanonicalLayoutBenchmarkRow[];
  readonly measuredScales: readonly number[];
  readonly simulatedScales: readonly number[];
}

export interface CanonicalLayoutBenchmarkRow {
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly mode: "actual" | "simulated";
  readonly layoutTimeMs: number;
  readonly memoryBytes: number;
  readonly collisionPairs: number;
  readonly collisionRatio: number;
  readonly edgeCrossingsEstimate: number;
  readonly clusterCohesion: number;
  readonly dependencyCorridorScore: number;
  readonly deterministic: boolean;
  readonly incrementalStability: number;
  readonly qualityScore: number;
}

export interface CertificationReport {
  readonly snapshot: { readonly nodeCount: number; readonly edgeCount: number };
  readonly layout: CanonicalLayoutResult;
  readonly collision: CollisionReport;
  readonly density: DensityProfile;
  readonly crossing: CrossingReport;
  readonly stability: StabilityReport;
  readonly determinism: DeterminismReport;
  readonly memory: MemoryReport;
  readonly clusterQuality: ClusterQualityMetrics;
  readonly qualityScore: LayoutQualityScore;
  readonly constraints: ConstraintValidationReport;
  readonly regression: RegressionValidationReport;
  readonly stress: StressTestSuite;
  readonly benchmark: BenchmarkSuite;
  readonly generatedAt: string;
  readonly harnessVersion: string;
}

export interface LayoutNodeContext {
  readonly node: KnowledgeNode;
  readonly position: WorldPoint;
  readonly clusterId: string;
  readonly isHub: boolean;
  readonly isBridge: boolean;
  readonly importance: number;
  readonly degree: number;
  readonly requiredSpacing: number;
}

export interface LayoutEdgeContext {
  readonly edge: KnowledgeEdge;
  readonly source: WorldPoint;
  readonly target: WorldPoint;
  readonly category: KnowledgeEdge["category"];
  readonly importance: number;
}

export interface LayoutAnalysisContext {
  readonly snapshot: GraphSnapshot;
  readonly constraints: CanonicalLayoutConstraints;
  readonly clusters: readonly LayoutCluster[];
  readonly positions: ReadonlyMap<string, WorldPoint>;
  readonly nodeById: ReadonlyMap<string, KnowledgeNode>;
  readonly hubIds: ReadonlySet<string>;
  readonly bridgeIds: ReadonlySet<string>;
  readonly clusterById: ReadonlyMap<string, LayoutCluster>;
  readonly importanceById: ReadonlyMap<string, number>;
  readonly degreeById: ReadonlyMap<string, number>;
  readonly requiredSpacingById: ReadonlyMap<string, number>;
}
