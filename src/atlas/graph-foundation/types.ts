export type ISO8601 = string;

export type EntityFamily = "scientific" | "engineering" | "evidence" | "context";

export type EntityType =
  | "theory"
  | "principle"
  | "concept"
  | "method"
  | "phenomenon"
  | "law"
  | "hypothesis"
  | "technique"
  | "pattern"
  | "architecture"
  | "algorithm"
  | "datastructure"
  | "framework"
  | "library"
  | "api"
  | "protocol"
  | "convention"
  | "tool"
  | "proof"
  | "experiment"
  | "observation"
  | "casestudy"
  | "benchmark"
  | "comparison"
  | "analysis"
  | "evaluation"
  | "validation"
  | "verification"
  | "audit"
  | "review"
  | "citation"
  | "problem"
  | "task"
  | "constraint"
  | "goal"
  | "assumption";

export type EntityStatus = "active" | "archived" | "deprecated";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type CanonicalStatus = "canonical" | "draft" | "deprecated";
export type EdgeStatus = "active" | "archived" | "deprecated";

export type RelationshipCategory =
  | "epistemic"
  | "structural"
  | "pedagogical"
  | "engineering"
  | "evidentiary"
  | "temporal"
  | "inferential";

export type RelationshipType =
  | "requires"
  | "enables"
  | "contradicts"
  | "refines"
  | "generalizes"
  | "specializes"
  | "composes"
  | "decomposes"
  | "depends_on"
  | "influences"
  | "implements"
  | "realizes"
  | "constrains"
  | "extends"
  | "teaches"
  | "demonstrates"
  | "assesses"
  | "builds_on"
  | "uses"
  | "configures"
  | "deploys"
  | "monitors"
  | "optimizes"
  | "replaces"
  | "supports"
  | "refutes"
  | "measures"
  | "benchmarks"
  | "precedes"
  | "follows"
  | "evolves_to"
  | "supersedes"
  | "implies"
  | "suggests"
  | "contradicts_evidence"
  | "supports_evidence"
  | "questions";

export interface VersionRecord {
  id: string;
  version: number;
  changes: string[];
  author: string;
  timestamp: ISO8601;
  reason: string;
  snapshot: Partial<KnowledgeNode>;
}

export interface NodeMetadata {
  domain?: string;
  module?: string;
  path?: string;
  application?: string;
  artifact?: string;
  algorithm?: string;
  architecture?: string;
  aliases?: string[];
  tags?: string[];
  difficulty?: DifficultyLevel;
  importance?: number;
  confidence?: number;
  evidenceCount?: number;
  lastValidated?: ISO8601;
  validatedBy?: string;
  [key: string]: unknown;
}

export interface KnowledgeNode {
  id: string;
  type: EntityType;
  family: EntityFamily;
  name: string;
  description: string;
  metadata: NodeMetadata;
  versions: VersionRecord[];
  createdAt: ISO8601;
  updatedAt: ISO8601;
  status: EntityStatus;
}

export interface TemporalMetadata {
  createdAt: ISO8601;
  updatedAt: ISO8601;
  expiresAt?: ISO8601 | null;
}

export interface EdgeMetadata {
  weight: number;
  confidence: number;
  evidenceCount: number;
  canonicalStatus: CanonicalStatus;
  temporal: TemporalMetadata;
  sourceEvidence: string[];
  direction: "directed";
  transitive: boolean;
  multiplicity: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
  [key: string]: unknown;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  category: RelationshipCategory;
  metadata: EdgeMetadata;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  status: EdgeStatus;
}

export interface GraphIndex {
  nodesByType: ReadonlyMap<EntityType, ReadonlySet<string>>;
  nodesByFamily: ReadonlyMap<EntityFamily, ReadonlySet<string>>;
  nodesByDomain: ReadonlyMap<string, ReadonlySet<string>>;
  nodesByModule: ReadonlyMap<string, ReadonlySet<string>>;
  nodesByPath: ReadonlyMap<string, ReadonlySet<string>>;
  nodesByApplication: ReadonlyMap<string, ReadonlySet<string>>;
  nodesByArtifact: ReadonlyMap<string, ReadonlySet<string>>;
  nodesByAlgorithm: ReadonlyMap<string, ReadonlySet<string>>;
  nodesByArchitecture: ReadonlyMap<string, ReadonlySet<string>>;
  nodesByTag: ReadonlyMap<string, ReadonlySet<string>>;
  nodesByAlias: ReadonlyMap<string, ReadonlySet<string>>;
  edgesByType: ReadonlyMap<RelationshipType, ReadonlySet<string>>;
  edgesByCategory: ReadonlyMap<RelationshipCategory, ReadonlySet<string>>;
  edgesBySource: ReadonlyMap<string, ReadonlySet<string>>;
  edgesByTarget: ReadonlyMap<string, ReadonlySet<string>>;
  adjacencyList: ReadonlyMap<string, ReadonlySet<string>>;
  reverseAdjacencyList: ReadonlyMap<string, ReadonlySet<string>>;
}

export interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  degreeDistribution: Record<number, number>;
  connectedComponents: string[][];
  clusters: string[][];
  bridgeCount: number;
  hubCount: number;
  centrality: Record<string, { degree: number; inDegree: number; outDegree: number; closeness: number; pageRank: number }>;
  hierarchyDepth: number;
  averageBranching: number;
  orphanCount: number;
  dependencyDepth: number;
}

export interface GraphMetadata {
  id: string;
  version: string;
  lastUpdated: ISO8601;
  nodeCount: number;
  edgeCount: number;
  domainDistribution: Record<string, number>;
  familyDistribution: Record<EntityFamily, number>;
  relationshipDistribution: Record<RelationshipCategory, number>;
}

export interface GraphSnapshot {
  id: string;
  version: string;
  checksum: string;
  createdAt: ISO8601;
  nodes: ReadonlyMap<string, KnowledgeNode>;
  edges: ReadonlyMap<string, KnowledgeEdge>;
  index: GraphIndex;
  metrics: GraphMetrics;
  metadata: GraphMetadata;
}

export type ProjectionKind =
  | "topology"
  | "curriculum"
  | "domain"
  | "dependency"
  | "application"
  | "implementation"
  | "pedagogical"
  | "research";

export interface ProjectionRequest {
  kind: ProjectionKind;
  domain?: string;
  application?: string;
  module?: string;
  includeIsolatedNodes?: boolean;
}

export interface GraphProjection {
  id: string;
  snapshotId: string;
  kind: ProjectionKind;
  request: ProjectionRequest;
  nodeIds: readonly string[];
  edgeIds: readonly string[];
  metrics: GraphMetrics;
  metadata: {
    nodeCount: number;
    edgeCount: number;
    density: number;
    checksum: string;
    generatedAt: ISO8601;
  };
}

export interface ValidationIssue {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  entityId?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}
