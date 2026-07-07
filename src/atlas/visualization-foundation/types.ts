import type {
  EntityFamily,
  EntityType,
  GraphProjection,
  GraphSnapshot,
  ISO8601,
  ProjectionKind,
  RelationshipCategory,
  RelationshipType,
} from "../graph-foundation/index.ts";

export type LodLevel = "LOD0" | "LOD1" | "LOD2" | "LOD3" | "LOD4" | "LOD5";
export type LayoutKind = "force" | "hierarchical" | "radial" | "dependency" | "domain" | "research";
export type VisualState = "default" | "filtered" | "hidden" | "collapsed" | "aggregated" | "disabled";
export type VisibilityState = "visible" | "hidden" | "summary";
export type SceneLayer = "regions" | "edges" | "nodes" | "labels" | "decorations";

export interface WorldPoint {
  readonly x: number;
  readonly y: number;
}

export interface WorldBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface CanonicalViewport {
  readonly center: WorldPoint;
  readonly zoom: number;
  readonly visibleBounds: WorldBounds;
  readonly scale: number;
  readonly clippingBounds: WorldBounds;
}

export interface VisualNode {
  readonly visualId: string;
  readonly entityId: string;
  readonly label: string;
  readonly importance: number;
  readonly hierarchyLevel: number;
  readonly radius: number;
  readonly family: EntityFamily;
  readonly type: EntityType;
  readonly colorToken: string;
  readonly labelPriority: number;
  readonly state: VisualState;
  readonly position: WorldPoint;
  readonly boundingBox: WorldBounds;
  readonly visibility: VisibilityState;
  readonly lodLevel: LodLevel;
  readonly isHub: boolean;
  readonly isBridge: boolean;
  readonly domain: string;
}

export interface VisualNeighborhood {
  readonly neighborhoodId: string;
  readonly label: string;
  readonly family: EntityFamily;
  readonly memberIds: readonly string[];
  readonly centroid: WorldPoint;
  readonly radius: number;
  readonly importance: number;
  readonly isSubregion: boolean;
}

export interface VisualRegion {
  readonly regionId: string;
  readonly domain: string;
  readonly members: readonly string[];
  readonly importance: number;
  readonly visibility: VisibilityState;
  readonly lodLevel: LodLevel;
  readonly boundaryHints: {
    readonly centroid: WorldPoint;
    readonly bounds: WorldBounds;
    readonly nestingLevel: number;
    readonly dominantFamily: EntityFamily;
  };
  readonly hubIds: readonly string[];
  readonly bridgeIds: readonly string[];
  readonly interRegionEdges: readonly string[];
  readonly capitalId: string | null;
  readonly neighborhoods: readonly VisualNeighborhood[];
  readonly neighborRegionIds: readonly string[];
  readonly storyOrder: number;
  readonly storyRole: "foundation" | "method" | "application" | "specialization" | "operation";
  readonly identityTag: string;
}

export interface VisualEdge {
  readonly edgeId: string;
  readonly source: string;
  readonly target: string;
  readonly relationshipType: RelationshipType;
  readonly relationshipCategory: RelationshipCategory;
  readonly importance: number;
  readonly curvatureHint: number;
  readonly visibility: VisibilityState;
  readonly labelPriority: number;
  readonly lodLevel: LodLevel;
  readonly sourceRegion: string;
  readonly targetRegion: string;
  readonly isCorridor: boolean;
}

export interface VisualLabel {
  readonly labelId: string;
  readonly ownerId: string;
  readonly ownerKind: "node" | "edge" | "region";
  readonly text: string;
  readonly priority: number;
  readonly visibility: VisibilityState;
  readonly lodLevel: LodLevel;
}

export interface VisualDecoration {
  readonly decorationId: string;
  readonly kind: "cluster_boundary" | "region_summary";
  readonly ownerId: string;
  readonly visibility: VisibilityState;
  readonly lodLevel: LodLevel;
}

export interface SceneGraph {
  readonly sceneId: string;
  readonly layers: readonly SceneLayer[];
  readonly regions: readonly VisualRegion[];
  readonly edges: readonly VisualEdge[];
  readonly nodes: readonly VisualNode[];
  readonly labels: readonly VisualLabel[];
  readonly decorations: readonly VisualDecoration[];
  readonly bounds: WorldBounds;
}

export interface LodInformation {
  readonly level: LodLevel;
  readonly nodeThreshold: number;
  readonly labelImportanceThreshold: number;
  readonly edgeImportanceThreshold: number;
  readonly aggregation: "none" | "small_clusters" | "medium_clusters" | "large_clusters" | "region_view" | "domain_view";
  readonly distribution: Record<LodLevel, number>;
}

export interface VisualMetrics {
  readonly visibleNodes: number;
  readonly visibleEdges: number;
  readonly collapsedRegions: number;
  readonly averageDensity: number;
  readonly edgeCrossingsEstimate: number;
  readonly clusterCount: number;
  readonly hiddenLabels: number;
  readonly lodDistribution: Record<LodLevel, number>;
}

export interface VisualizationPayloadMetadata {
  readonly payloadId: string;
  readonly snapshotId: string;
  readonly projectionId: string;
  readonly projectionKind: ProjectionKind;
  readonly generatedAt: ISO8601;
  readonly layoutKind: LayoutKind;
  readonly rendererIndependent: true;
  readonly worldSpaceOnly: true;
}

export interface VisualizationPayload {
  readonly metadata: VisualizationPayloadMetadata;
  readonly viewport: CanonicalViewport;
  readonly lod: LodInformation;
  readonly scene: SceneGraph;
  readonly nodes: readonly VisualNode[];
  readonly edges: readonly VisualEdge[];
  readonly regions: readonly VisualRegion[];
  readonly labels: readonly VisualLabel[];
  readonly metrics: VisualMetrics;
}

export interface VisualizationPayloadInput {
  readonly snapshot: GraphSnapshot;
  readonly projection: GraphProjection;
  readonly layout?: LayoutKind;
  readonly viewport?: Partial<CanonicalViewport>;
  readonly generatedAt?: ISO8601;
}

export interface RendererAdapter<TOutput = unknown> {
  readonly rendererId: string;
  readonly rendererKind: "canvas" | "svg" | "webgl" | "webgpu" | "custom";
  render(payload: VisualizationPayload): TOutput;
}

export interface VisualizationBenchmarkResult {
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly payloadGenerationMs: number;
  readonly lodGenerationMs: number;
  readonly visibilityComputationMs: number;
  readonly serializationMs: number;
  readonly sceneConstructionMs: number;
  readonly memoryBytes: number;
}
