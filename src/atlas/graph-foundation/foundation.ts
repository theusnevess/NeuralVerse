import { createHash } from "node:crypto";
import { deflateSync, inflateSync } from "node:zlib";
import {
  DEPENDENCY_RELATIONSHIPS,
  ENTITY_FAMILY_BY_TYPE,
  HIERARCHY_RELATIONSHIPS,
  RELATIONSHIP_CATEGORY_BY_TYPE,
  RELATIONSHIP_FAMILY_RULES,
  TRANSITIVE_RELATIONSHIPS,
  UUID_V4_PATTERN,
} from "./canonical.ts";
import { deepFreeze, readonlyMap, readonlySet } from "./immutability.ts";
import type {
  EdgeMetadata,
  EntityFamily,
  EntityType,
  GraphIndex,
  GraphMetadata,
  GraphMetrics,
  GraphProjection,
  GraphSnapshot,
  KnowledgeEdge,
  KnowledgeNode,
  ProjectionRequest,
  RelationshipCategory,
  RelationshipType,
  ValidationIssue,
  ValidationResult,
} from "./types.ts";

type MutableIndex = {
  [K in keyof GraphIndex]: Map<string, Set<string>>;
};

export class EntityRegistry {
  private readonly entities = new Map<string, KnowledgeNode>();

  register(entity: KnowledgeNode): KnowledgeNode {
    validateEntityShape(entity);
    if (this.entities.has(entity.id)) {
      throw new Error(`Duplicate entity ID forbidden: ${entity.id}`);
    }
    if (ENTITY_FAMILY_BY_TYPE[entity.type] !== entity.family) {
      throw new Error(`Invalid family/type combination: ${entity.family}/${entity.type}`);
    }
    const immutable = deepFreeze(clone(entity));
    this.entities.set(immutable.id, immutable);
    return immutable;
  }

  get(id: string): KnowledgeNode | undefined {
    return this.entities.get(id);
  }

  list(): KnowledgeNode[] {
    return [...this.entities.values()];
  }
}

export class RelationshipRegistry {
  private readonly edges = new Map<string, KnowledgeEdge>();
  private readonly edgeKeys = new Set<string>();

  constructor(private readonly entityRegistry: EntityRegistry) {}

  register(edge: KnowledgeEdge): KnowledgeEdge {
    validateEdgeShape(edge);
    if (this.edges.has(edge.id)) {
      throw new Error(`Duplicate relationship ID forbidden: ${edge.id}`);
    }
    if (edge.source === edge.target) {
      throw new Error(`Self-loop relationship forbidden: ${edge.id}`);
    }
    if (!this.entityRegistry.get(edge.source)) {
      throw new Error(`Missing source entity: ${edge.source}`);
    }
    if (!this.entityRegistry.get(edge.target)) {
      throw new Error(`Missing target entity: ${edge.target}`);
    }
    const expectedCategory = RELATIONSHIP_CATEGORY_BY_TYPE[edge.type];
    if (expectedCategory !== edge.category) {
      throw new Error(`Invalid relationship category for ${edge.type}: ${edge.category}`);
    }
    const duplicateKey = `${edge.source}\u0000${edge.target}\u0000${edge.type}`;
    if (this.edgeKeys.has(duplicateKey)) {
      throw new Error(`Duplicate relationship tuple forbidden: ${edge.source} -> ${edge.target} (${edge.type})`);
    }
    const source = this.entityRegistry.get(edge.source)!;
    const target = this.entityRegistry.get(edge.target)!;
    const rule = RELATIONSHIP_FAMILY_RULES[edge.type];
    if (rule && (!rule.source.includes(source.family) || !rule.target.includes(target.family))) {
      throw new Error(`Invalid relationship family combination for ${edge.type}: ${source.family} -> ${target.family}`);
    }

    const immutable = deepFreeze(clone(edge));
    this.edges.set(immutable.id, immutable);
    this.edgeKeys.add(duplicateKey);
    return immutable;
  }

  get(id: string): KnowledgeEdge | undefined {
    return this.edges.get(id);
  }

  list(): KnowledgeEdge[] {
    return [...this.edges.values()];
  }
}

export class GraphSource {
  readonly entities = new EntityRegistry();
  readonly relationships = new RelationshipRegistry(this.entities);

  constructor(readonly id: string, readonly version: string) {}

  registerEntity(entity: KnowledgeNode): KnowledgeNode {
    return this.entities.register(entity);
  }

  registerRelationship(edge: KnowledgeEdge): KnowledgeEdge {
    return this.relationships.register(edge);
  }

  toDraftGraph(): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[]; metadata: GraphMetadata; index: GraphIndex; metrics: GraphMetrics } {
    const nodes = this.entities.list();
    const edges = this.relationships.list();
    const index = buildIndex(nodes, edges);
    const metrics = computeMetrics(nodes, edges, index);
    return { nodes, edges, metadata: buildMetadata(this.id, this.version, nodes, edges), index, metrics };
  }
}

export class SnapshotCompiler {
  private readonly cache = new Map<string, GraphSnapshot>();

  compile(source: GraphSource): GraphSnapshot {
    const draft = source.toDraftGraph();
    const validation = validateGraph(draft.nodes, draft.edges);
    if (!validation.valid) {
      throw new Error(`Graph validation failed: ${validation.issues.filter((issue) => issue.severity === "error").map((issue) => issue.message).join("; ")}`);
    }

    const createdAt = new Date().toISOString();
    const checksumInput = stableStringify({ nodes: draft.nodes, edges: draft.edges, metadata: draft.metadata });
    const checksum = sha256(checksumInput);
    const cacheKey = `${source.id}:${source.version}:${checksum}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const frozenNodes = new Map(draft.nodes.map((node) => [node.id, deepFreeze(clone(node))]));
    const frozenEdges = new Map(draft.edges.map((edge) => [edge.id, deepFreeze(clone(edge))]));
    const snapshot: GraphSnapshot = deepFreeze({
      id: sha256(`${source.id}:${source.version}:${checksum}`).slice(0, 32),
      version: source.version,
      checksum,
      createdAt,
      nodes: readonlyMap(frozenNodes),
      edges: readonlyMap(frozenEdges),
      index: draft.index,
      metrics: draft.metrics,
      metadata: draft.metadata,
    });
    this.cache.set(cacheKey, snapshot);
    return snapshot;
  }
}

export class ProjectionEngine {
  generate(snapshot: GraphSnapshot, request: ProjectionRequest): GraphProjection {
    validateSnapshotIntegrity(snapshot);
    const edgeIds = selectProjectionEdges(snapshot, request);
    const nodeIds = new Set<string>();
    for (const edgeId of edgeIds) {
      const edge = snapshot.edges.get(edgeId)!;
      nodeIds.add(edge.source);
      nodeIds.add(edge.target);
    }
    if (request.includeIsolatedNodes) {
      for (const node of snapshot.nodes.values()) {
        if (matchesProjectionNode(node, request)) {
          nodeIds.add(node.id);
        }
      }
    }
    const nodes = [...nodeIds].map((id) => snapshot.nodes.get(id)!).filter(Boolean);
    const edges = edgeIds.map((id) => snapshot.edges.get(id)!).filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
    const index = buildIndex(nodes, edges);
    const metrics = computeMetrics(nodes, edges, index);
    const generatedAt = new Date().toISOString();
    const checksum = sha256(stableStringify({ snapshotId: snapshot.id, request, nodeIds: [...nodeIds].sort(), edgeIds: edges.map((edge) => edge.id).sort() }));
    const projection: GraphProjection = {
      id: checksum.slice(0, 32),
      snapshotId: snapshot.id,
      kind: request.kind,
      request: clone(request),
      nodeIds: deepFreeze([...nodeIds].sort()),
      edgeIds: deepFreeze(edges.map((edge) => edge.id).sort()),
      metrics,
      metadata: {
        nodeCount: nodeIds.size,
        edgeCount: edges.length,
        density: metrics.density,
        checksum,
        generatedAt,
      },
    };
    validateProjectionConsistency(snapshot, projection);
    return deepFreeze(projection);
  }
}

export class QueryEngine {
  constructor(private readonly snapshot: GraphSnapshot) {}

  getEntity(id: string): KnowledgeNode | undefined {
    return this.snapshot.nodes.get(id);
  }

  getNeighbors(id: string, direction: "in" | "out" | "both" = "both"): KnowledgeNode[] {
    const ids = new Set<string>();
    if (direction === "out" || direction === "both") {
      for (const target of this.snapshot.index.adjacencyList.get(id) ?? []) ids.add(target);
    }
    if (direction === "in" || direction === "both") {
      for (const source of this.snapshot.index.reverseAdjacencyList.get(id) ?? []) ids.add(source);
    }
    return [...ids].map((nodeId) => this.snapshot.nodes.get(nodeId)).filter((node): node is KnowledgeNode => Boolean(node));
  }

  getParents(id: string): KnowledgeNode[] {
    return this.relatedByTypes(id, ["generalizes", "composes"], "in");
  }

  getChildren(id: string): KnowledgeNode[] {
    return this.relatedByTypes(id, ["generalizes", "composes", "decomposes", "specializes"], "out");
  }

  getDependencies(id: string): KnowledgeNode[] {
    return this.relatedByTypes(id, [...DEPENDENCY_RELATIONSHIPS], "out");
  }

  getDependents(id: string): KnowledgeNode[] {
    return this.relatedByTypes(id, [...DEPENDENCY_RELATIONSHIPS], "in");
  }

  getRelated(id: string): KnowledgeNode[] {
    return this.getNeighbors(id, "both");
  }

  getDomain(domain: string): KnowledgeNode[] {
    return this.nodesFromIndex(this.snapshot.index.nodesByDomain.get(domain));
  }

  getApplications(application: string): KnowledgeNode[] {
    return this.nodesFromIndex(this.snapshot.index.nodesByApplication.get(application));
  }

  getAlgorithms(): KnowledgeNode[] {
    return this.nodesFromIndex(this.snapshot.index.nodesByType.get("algorithm"));
  }

  getArtifacts(): KnowledgeNode[] {
    return this.nodesFromIndex(this.snapshot.index.nodesByArtifact.get("true"));
  }

  getModules(module?: string): KnowledgeNode[] {
    return module ? this.nodesFromIndex(this.snapshot.index.nodesByModule.get(module)) : this.nodesFromIndex(allIndexIds(this.snapshot.index.nodesByModule));
  }

  getPaths(path?: string): KnowledgeNode[] {
    return path ? this.nodesFromIndex(this.snapshot.index.nodesByPath.get(path)) : this.nodesFromIndex(allIndexIds(this.snapshot.index.nodesByPath));
  }

  private relatedByTypes(id: string, types: RelationshipType[], direction: "in" | "out"): KnowledgeNode[] {
    const edgeIds = direction === "out" ? this.snapshot.index.edgesBySource.get(id) : this.snapshot.index.edgesByTarget.get(id);
    const related = new Set<string>();
    for (const edgeId of edgeIds ?? []) {
      const edge = this.snapshot.edges.get(edgeId);
      if (edge && types.includes(edge.type)) {
        related.add(direction === "out" ? edge.target : edge.source);
      }
    }
    return [...related].map((nodeId) => this.snapshot.nodes.get(nodeId)).filter((node): node is KnowledgeNode => Boolean(node));
  }

  private nodesFromIndex(ids?: ReadonlySet<string>): KnowledgeNode[] {
    return [...(ids ?? [])].map((id) => this.snapshot.nodes.get(id)).filter((node): node is KnowledgeNode => Boolean(node));
  }
}

export function validateGraph(nodes: readonly KnowledgeNode[], edges: readonly KnowledgeEdge[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set<string>();
  const nodeById = new Map<string, KnowledgeNode>();
  const edgeIds = new Set<string>();
  const edgeTuples = new Set<string>();
  const degree = new Map<string, number>();

  for (const node of nodes) {
    collectEntityIssues(node, issues);
    if (nodeIds.has(node.id)) issues.push(error("DUPLICATE_ENTITY_ID", `Duplicate entity ID: ${node.id}`, node.id));
    nodeIds.add(node.id);
    nodeById.set(node.id, node);
    degree.set(node.id, 0);
  }

  for (const edge of edges) {
    collectEdgeIssues(edge, issues);
    if (edgeIds.has(edge.id)) issues.push(error("DUPLICATE_EDGE_ID", `Duplicate edge ID: ${edge.id}`, edge.id));
    edgeIds.add(edge.id);
    if (edge.source === edge.target) issues.push(error("SELF_LOOP", `Self-loop edge: ${edge.id}`, edge.id));
    if (!nodeIds.has(edge.source)) issues.push(error("MISSING_SOURCE", `Missing source entity: ${edge.source}`, edge.id));
    if (!nodeIds.has(edge.target)) issues.push(error("MISSING_TARGET", `Missing target entity: ${edge.target}`, edge.id));
    const tuple = `${edge.source}\u0000${edge.target}\u0000${edge.type}`;
    if (edgeTuples.has(tuple)) issues.push(error("DUPLICATE_EDGE_TUPLE", `Duplicate edge tuple: ${edge.source} -> ${edge.target} (${edge.type})`, edge.id));
    edgeTuples.add(tuple);
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);

    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    const rule = RELATIONSHIP_FAMILY_RULES[edge.type];
    if (source && target && rule && (!rule.source.includes(source.family) || !rule.target.includes(target.family))) {
      issues.push(error("INVALID_RELATIONSHIP_FAMILY", `Invalid ${edge.type} family combination: ${source.family} -> ${target.family}`, edge.id));
    }
  }

  for (const [id, count] of degree) {
    if (count === 0) issues.push(warning("ORPHAN_NODE", `Orphan node: ${id}`, id));
  }

  if (hasCycle(nodes.map((node) => node.id), edges.filter((edge) => DEPENDENCY_RELATIONSHIPS.has(edge.type)))) {
    issues.push(error("CIRCULAR_DEPENDENCY", "Circular dependency detected in dependency relationships."));
  }
  if (hasCycle(nodes.map((node) => node.id), edges.filter((edge) => HIERARCHY_RELATIONSHIPS.has(edge.type)))) {
    issues.push(error("INVALID_HIERARCHY", "Circular hierarchy detected."));
  }

  return { valid: !issues.some((issue) => issue.severity === "error"), issues };
}

export function validateSnapshotIntegrity(snapshot: GraphSnapshot): ValidationResult {
  const validation = validateGraph([...snapshot.nodes.values()], [...snapshot.edges.values()]);
  const checksum = sha256(stableStringify({ nodes: [...snapshot.nodes.values()], edges: [...snapshot.edges.values()], metadata: snapshot.metadata }));
  if (checksum !== snapshot.checksum) {
    validation.issues.push(error("CHECKSUM_MISMATCH", "Snapshot checksum validation failed.", snapshot.id));
  }
  if (snapshot.metadata.nodeCount !== snapshot.nodes.size || snapshot.metadata.edgeCount !== snapshot.edges.size) {
    validation.issues.push(error("SNAPSHOT_METADATA_MISMATCH", "Snapshot metadata counts do not match graph content.", snapshot.id));
  }
  return { valid: !validation.issues.some((issue) => issue.severity === "error"), issues: validation.issues };
}

export function serializeSnapshot(snapshot: GraphSnapshot): string {
  validateSnapshotIntegrity(snapshot);
  return stableStringify(snapshotToSerializable(snapshot));
}

export function deserializeSnapshot(json: string): GraphSnapshot {
  const data = JSON.parse(json) as ReturnType<typeof snapshotToSerializable>;
  const nodes = new Map(data.nodes.map((node) => [node.id, deepFreeze(node)]));
  const edges = new Map(data.edges.map((edge) => [edge.id, deepFreeze(edge)]));
  const index = buildIndex(data.nodes, data.edges);
  const metrics = computeMetrics(data.nodes, data.edges, index);
  const snapshot: GraphSnapshot = deepFreeze({ ...data, nodes: readonlyMap(nodes), edges: readonlyMap(edges), index, metrics });
  validateSnapshotIntegrity(snapshot);
  return snapshot;
}

export function compressSnapshot(snapshot: GraphSnapshot): Buffer {
  return deflateSync(Buffer.from(serializeSnapshot(snapshot), "utf8"));
}

export function decompressSnapshot(buffer: Buffer): GraphSnapshot {
  return deserializeSnapshot(inflateSync(buffer).toString("utf8"));
}

export function exportMetadata(snapshot: GraphSnapshot): GraphMetadata {
  return clone(snapshot.metadata);
}

export function buildIndex(nodes: readonly KnowledgeNode[], edges: readonly KnowledgeEdge[]): GraphIndex {
  const index = createMutableIndex();
  for (const node of nodes) {
    add(index.nodesByType, node.type, node.id);
    add(index.nodesByFamily, node.family, node.id);
    addOptional(index.nodesByDomain, node.metadata.domain, node.id);
    addOptional(index.nodesByModule, node.metadata.module, node.id);
    addOptional(index.nodesByPath, node.metadata.path, node.id);
    addOptional(index.nodesByApplication, node.metadata.application, node.id);
    addOptional(index.nodesByArtifact, node.metadata.artifact ? "true" : undefined, node.id);
    addOptional(index.nodesByAlgorithm, node.metadata.algorithm, node.id);
    addOptional(index.nodesByArchitecture, node.metadata.architecture, node.id);
    for (const tag of node.metadata.tags ?? []) add(index.nodesByTag, tag, node.id);
    for (const alias of node.metadata.aliases ?? []) add(index.nodesByAlias, alias.toLowerCase(), node.id);
  }
  for (const edge of edges) {
    add(index.edgesByType, edge.type, edge.id);
    add(index.edgesByCategory, edge.category, edge.id);
    add(index.edgesBySource, edge.source, edge.id);
    add(index.edgesByTarget, edge.target, edge.id);
    add(index.adjacencyList, edge.source, edge.target);
    add(index.reverseAdjacencyList, edge.target, edge.source);
  }
  return freezeIndex(index);
}

export function computeMetrics(nodes: readonly KnowledgeNode[], edges: readonly KnowledgeEdge[], index = buildIndex(nodes, edges)): GraphMetrics {
  const nodeIds = nodes.map((node) => node.id);
  const n = nodeIds.length;
  const density = n > 1 ? edges.length / (n * (n - 1)) : 0;
  const centrality: GraphMetrics["centrality"] = {};
  const degreeDistribution: Record<number, number> = {};
  let hubCount = 0;
  let branchingTotal = 0;
  let branchingNodes = 0;

  const components = connectedComponents(nodeIds, edges);
  const closenessByNode = estimateCloseness(nodeIds, edges);

  for (const id of nodeIds) {
    const outDegree = index.adjacencyList.get(id)?.size ?? 0;
    const inDegree = index.reverseAdjacencyList.get(id)?.size ?? 0;
    const degree = outDegree + inDegree;
    degreeDistribution[degree] = (degreeDistribution[degree] ?? 0) + 1;
    if (degree >= Math.max(3, Math.sqrt(Math.max(n, 1)))) hubCount += 1;
    if (outDegree > 0) {
      branchingTotal += outDegree;
      branchingNodes += 1;
    }
    centrality[id] = {
      degree,
      inDegree,
      outDegree,
      closeness: closenessByNode.get(id) ?? 0,
      pageRank: 1 / Math.max(n, 1),
    };
  }

  return deepFreeze({
    nodeCount: n,
    edgeCount: edges.length,
    density,
    degreeDistribution,
    connectedComponents: components,
    clusters: components.filter((component) => component.length > 1),
    bridgeCount: countBridges(nodeIds, edges),
    hubCount,
    centrality,
    hierarchyDepth: longestPathDepth(nodeIds, edges.filter((edge) => HIERARCHY_RELATIONSHIPS.has(edge.type))),
    averageBranching: branchingNodes > 0 ? branchingTotal / branchingNodes : 0,
    orphanCount: Object.entries(centrality).filter(([, value]) => value.degree === 0).length,
    dependencyDepth: longestPathDepth(nodeIds, edges.filter((edge) => DEPENDENCY_RELATIONSHIPS.has(edge.type))),
  });
}

function selectProjectionEdges(snapshot: GraphSnapshot, request: ProjectionRequest): string[] {
  const all = [...snapshot.edges.values()];
  const typeFilters: Partial<Record<ProjectionRequest["kind"], Set<RelationshipType>>> = {
    curriculum: new Set(["teaches", "demonstrates", "assesses", "builds_on", "requires"]),
    dependency: new Set(["requires", "depends_on", "implements", "uses", "builds_on"]),
    implementation: new Set(["uses", "configures", "deploys", "extends", "implements", "monitors", "optimizes"]),
    pedagogical: new Set(["teaches", "demonstrates", "assesses", "builds_on"]),
    application: new Set(["supports", "refutes", "measures", "benchmarks", "implements", "uses"]),
  };
  const categoryFilters: Partial<Record<ProjectionRequest["kind"], Set<RelationshipCategory>>> = {
    research: new Set(["epistemic", "structural", "engineering", "evidentiary", "temporal", "inferential"]),
  };
  return all
    .filter((edge) => {
      const source = snapshot.nodes.get(edge.source)!;
      const target = snapshot.nodes.get(edge.target)!;
      const typeFilter = typeFilters[request.kind];
      const categoryFilter = categoryFilters[request.kind];
      const kindMatches = request.kind === "topology" || request.kind === "domain" || typeFilter?.has(edge.type) || categoryFilter?.has(edge.category);
      const domainMatches = !request.domain || source.metadata.domain === request.domain || target.metadata.domain === request.domain;
      const applicationMatches = !request.application || source.metadata.application === request.application || target.metadata.application === request.application;
      const moduleMatches = !request.module || source.metadata.module === request.module || target.metadata.module === request.module;
      return Boolean(kindMatches && domainMatches && applicationMatches && moduleMatches);
    })
    .map((edge) => edge.id);
}

function matchesProjectionNode(node: KnowledgeNode, request: ProjectionRequest): boolean {
  return (!request.domain || node.metadata.domain === request.domain) && (!request.application || node.metadata.application === request.application) && (!request.module || node.metadata.module === request.module);
}

function validateProjectionConsistency(snapshot: GraphSnapshot, projection: GraphProjection): void {
  const projectedNodeIds = new Set(projection.nodeIds);
  for (const id of projection.nodeIds) {
    if (!snapshot.nodes.has(id)) throw new Error(`Projection references missing node: ${id}`);
  }
  for (const id of projection.edgeIds) {
    const edge = snapshot.edges.get(id);
    if (!edge) throw new Error(`Projection references missing edge: ${id}`);
    if (!projectedNodeIds.has(edge.source) || !projectedNodeIds.has(edge.target)) {
      throw new Error(`Projection edge endpoints missing from projection: ${id}`);
    }
  }
}

function buildMetadata(id: string, version: string, nodes: readonly KnowledgeNode[], edges: readonly KnowledgeEdge[]): GraphMetadata {
  const familyDistribution = { scientific: 0, engineering: 0, evidence: 0, context: 0 } satisfies Record<EntityFamily, number>;
  const relationshipDistribution = { epistemic: 0, structural: 0, pedagogical: 0, engineering: 0, evidentiary: 0, temporal: 0, inferential: 0 } satisfies Record<RelationshipCategory, number>;
  const domainDistribution: Record<string, number> = {};
  for (const node of nodes) {
    familyDistribution[node.family] += 1;
    if (node.metadata.domain) domainDistribution[node.metadata.domain] = (domainDistribution[node.metadata.domain] ?? 0) + 1;
  }
  for (const edge of edges) relationshipDistribution[edge.category] += 1;
  const lastUpdated = [...nodes.map((node) => node.updatedAt), ...edges.map((edge) => edge.updatedAt)].sort().at(-1) ?? new Date(0).toISOString();
  return deepFreeze({ id, version, lastUpdated, nodeCount: nodes.length, edgeCount: edges.length, domainDistribution, familyDistribution, relationshipDistribution });
}

function validateEntityShape(entity: KnowledgeNode): void {
  const issues: ValidationIssue[] = [];
  collectEntityIssues(entity, issues);
  const fatal = issues.find((issue) => issue.severity === "error");
  if (fatal) throw new Error(fatal.message);
}

function validateEdgeShape(edge: KnowledgeEdge): void {
  const issues: ValidationIssue[] = [];
  collectEdgeIssues(edge, issues);
  const fatal = issues.find((issue) => issue.severity === "error");
  if (fatal) throw new Error(fatal.message);
}

function collectEntityIssues(entity: KnowledgeNode, issues: ValidationIssue[]): void {
  if (!UUID_V4_PATTERN.test(entity.id)) issues.push(error("INVALID_ENTITY_ID", `Entity ID must be UUID v4: ${entity.id}`, entity.id));
  if (!entity.name.trim()) issues.push(error("MISSING_ENTITY_NAME", `Entity name is required: ${entity.id}`, entity.id));
  if (!entity.description.trim()) issues.push(error("MISSING_ENTITY_DESCRIPTION", `Entity description is required: ${entity.id}`, entity.id));
  if (ENTITY_FAMILY_BY_TYPE[entity.type] !== entity.family) issues.push(error("INVALID_FAMILY_TYPE", `Invalid family/type combination: ${entity.family}/${entity.type}`, entity.id));
  if (!entity.metadata.domain) issues.push(warning("MISSING_DOMAIN", `Entity domain metadata is recommended: ${entity.id}`, entity.id));
  if (entity.metadata.importance !== undefined && !inRange(entity.metadata.importance)) issues.push(error("INVALID_IMPORTANCE", `Entity importance must be 0..1: ${entity.id}`, entity.id));
  if (entity.metadata.confidence !== undefined && !inRange(entity.metadata.confidence)) issues.push(error("INVALID_CONFIDENCE", `Entity confidence must be 0..1: ${entity.id}`, entity.id));
  if (entity.metadata.evidenceCount !== undefined && entity.metadata.evidenceCount < 0) issues.push(error("INVALID_EVIDENCE_COUNT", `Entity evidenceCount must be >= 0: ${entity.id}`, entity.id));
  if (!isIso(entity.createdAt) || !isIso(entity.updatedAt)) issues.push(error("INVALID_ENTITY_TIMESTAMP", `Entity timestamps must be ISO 8601: ${entity.id}`, entity.id));
  if (entity.versions.some((version) => !UUID_V4_PATTERN.test(version.id) || !isIso(version.timestamp))) issues.push(error("INVALID_VERSION", `Entity versions require UUID v4 IDs and ISO timestamps: ${entity.id}`, entity.id));
}

function collectEdgeIssues(edge: KnowledgeEdge, issues: ValidationIssue[]): void {
  if (!UUID_V4_PATTERN.test(edge.id)) issues.push(error("INVALID_EDGE_ID", `Edge ID must be UUID v4: ${edge.id}`, edge.id));
  if (RELATIONSHIP_CATEGORY_BY_TYPE[edge.type] !== edge.category) issues.push(error("INVALID_RELATIONSHIP_TYPE", `Invalid relationship type/category: ${edge.type}/${edge.category}`, edge.id));
  if (!inRange(edge.metadata.weight)) issues.push(error("INVALID_WEIGHT", `Edge weight must be 0..1: ${edge.id}`, edge.id));
  if (!inRange(edge.metadata.confidence)) issues.push(error("INVALID_EDGE_CONFIDENCE", `Edge confidence must be 0..1: ${edge.id}`, edge.id));
  if (edge.metadata.evidenceCount < 0) issues.push(error("INVALID_EDGE_EVIDENCE_COUNT", `Edge evidenceCount must be >= 0: ${edge.id}`, edge.id));
  if (edge.metadata.direction !== "directed") issues.push(error("INVALID_DIRECTION", `Edges must be directed: ${edge.id}`, edge.id));
  if (edge.metadata.transitive !== TRANSITIVE_RELATIONSHIPS.has(edge.type)) issues.push(warning("TRANSITIVITY_MISMATCH", `Edge transitivity does not match canonical default: ${edge.id}`, edge.id));
  if (!isIso(edge.createdAt) || !isIso(edge.updatedAt) || !isIso(edge.metadata.temporal.createdAt) || !isIso(edge.metadata.temporal.updatedAt)) {
    issues.push(error("INVALID_EDGE_TIMESTAMP", `Edge timestamps must be ISO 8601: ${edge.id}`, edge.id));
  }
  if (edge.metadata.temporal.expiresAt && !isIso(edge.metadata.temporal.expiresAt)) issues.push(error("INVALID_EXPIRY_TIMESTAMP", `Edge expiresAt must be ISO 8601: ${edge.id}`, edge.id));
  if (edge.metadata.weight > 0.8 && edge.metadata.evidenceCount === 0) issues.push(warning("HIGH_WEIGHT_WITHOUT_EVIDENCE", `High-weight edge lacks evidence: ${edge.id}`, edge.id));
}

function createMutableIndex(): MutableIndex {
  return {
    nodesByType: new Map(),
    nodesByFamily: new Map(),
    nodesByDomain: new Map(),
    nodesByModule: new Map(),
    nodesByPath: new Map(),
    nodesByApplication: new Map(),
    nodesByArtifact: new Map(),
    nodesByAlgorithm: new Map(),
    nodesByArchitecture: new Map(),
    nodesByTag: new Map(),
    nodesByAlias: new Map(),
    edgesByType: new Map(),
    edgesByCategory: new Map(),
    edgesBySource: new Map(),
    edgesByTarget: new Map(),
    adjacencyList: new Map(),
    reverseAdjacencyList: new Map(),
  };
}

function freezeIndex(index: MutableIndex): GraphIndex {
  const freezeMap = (map: Map<string, Set<string>>) => readonlyMap(new Map([...map].map(([key, value]) => [key, readonlySet(value)])));
  return deepFreeze(Object.fromEntries(Object.entries(index).map(([key, value]) => [key, freezeMap(value)])) as unknown as GraphIndex);
}

function add(map: Map<string, Set<string>>, key: string, id: string): void {
  const bucket = map.get(key) ?? new Set<string>();
  bucket.add(id);
  map.set(key, bucket);
}

function addOptional(map: Map<string, Set<string>>, key: string | undefined, id: string): void {
  if (key) add(map, key, id);
}

function allIndexIds(map: ReadonlyMap<string, ReadonlySet<string>>): Set<string> {
  const ids = new Set<string>();
  for (const bucket of map.values()) for (const id of bucket) ids.add(id);
  return ids;
}

function connectedComponents(nodeIds: readonly string[], edges: readonly KnowledgeEdge[]): string[][] {
  const adjacency = new Map<string, Set<string>>(nodeIds.map((id) => [id, new Set<string>()]));
  for (const edge of edges) {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  }
  const seen = new Set<string>();
  const components: string[][] = [];
  for (const id of nodeIds) {
    if (seen.has(id)) continue;
    const queue = [id];
    const component: string[] = [];
    seen.add(id);
    for (let i = 0; i < queue.length; i += 1) {
      const current = queue[i]!;
      component.push(current);
      for (const next of adjacency.get(current) ?? []) {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
    components.push(component.sort());
  }
  return components;
}

function estimateCloseness(nodeIds: readonly string[], edges: readonly KnowledgeEdge[]): Map<string, number> {
  const closeness = new Map<string, number>(nodeIds.map((id) => [id, 0]));
  if (nodeIds.length === 0) return closeness;
  const sampleSize = nodeIds.length <= 512 ? nodeIds.length : Math.min(64, nodeIds.length);
  const starts = nodeIds.length <= sampleSize ? nodeIds : Array.from({ length: sampleSize }, (_, index) => nodeIds[Math.floor((index * nodeIds.length) / sampleSize)]!);
  const distances = shortestDistancesFrom(starts, nodeIds, edges);
  for (const [start, values] of distances) {
    const reachable = values.filter((distance) => distance > 0);
    const totalDistance = reachable.reduce((sum, distance) => sum + distance, 0);
    closeness.set(start, totalDistance > 0 ? reachable.length / totalDistance : 0);
  }
  return closeness;
}

function shortestDistancesFrom(starts: readonly string[], nodeIds: readonly string[], edges: readonly KnowledgeEdge[]): Map<string, number[]> {
  const adjacency = new Map<string, Set<string>>(nodeIds.map((id) => [id, new Set<string>()]));
  for (const edge of edges) adjacency.get(edge.source)?.add(edge.target);
  const result = new Map<string, number[]>();
  for (const start of starts) {
    const distances = new Map<string, number>([[start, 0]]);
    const queue = [start];
    for (let i = 0; i < queue.length; i += 1) {
      const current = queue[i]!;
      for (const next of adjacency.get(current) ?? []) {
        if (!distances.has(next)) {
          distances.set(next, distances.get(current)! + 1);
          queue.push(next);
        }
      }
    }
    result.set(start, [...distances.values()]);
  }
  return result;
}

function countBridges(nodeIds: readonly string[], edges: readonly KnowledgeEdge[]): number {
  const adjacency = new Map<string, Array<{ to: string; edgeId: string }>>(nodeIds.map((id) => [id, []]));
  for (const edge of edges) {
    adjacency.get(edge.source)?.push({ to: edge.target, edgeId: edge.id });
    adjacency.get(edge.target)?.push({ to: edge.source, edgeId: edge.id });
  }
  const discovered = new Map<string, number>();
  const low = new Map<string, number>();
  let time = 0;
  let bridges = 0;

  for (const root of nodeIds) {
    if (discovered.has(root)) continue;
    time += 1;
    discovered.set(root, time);
    low.set(root, time);
    const stack: Array<{ nodeId: string; parent?: string; parentEdgeId?: string; nextIndex: number }> = [{ nodeId: root, nextIndex: 0 }];
    while (stack.length > 0) {
      const frame = stack[stack.length - 1]!;
      const neighbors = adjacency.get(frame.nodeId) ?? [];
      if (frame.nextIndex < neighbors.length) {
        const { to, edgeId } = neighbors[frame.nextIndex]!;
        frame.nextIndex += 1;
        if (edgeId === frame.parentEdgeId) continue;
        if (!discovered.has(to)) {
          time += 1;
          discovered.set(to, time);
          low.set(to, time);
          stack.push({ nodeId: to, parent: frame.nodeId, parentEdgeId: edgeId, nextIndex: 0 });
        } else {
          low.set(frame.nodeId, Math.min(low.get(frame.nodeId)!, discovered.get(to)!));
        }
      } else {
        stack.pop();
        if (frame.parent) {
          low.set(frame.parent, Math.min(low.get(frame.parent)!, low.get(frame.nodeId)!));
          if (low.get(frame.nodeId)! > discovered.get(frame.parent)!) bridges += 1;
        }
      }
    }
  }
  return bridges;
}

function longestPathDepth(nodeIds: readonly string[], edges: readonly KnowledgeEdge[]): number {
  const adjacency = new Map<string, string[]>(nodeIds.map((id) => [id, []]));
  const indegree = new Map<string, number>(nodeIds.map((id) => [id, 0]));
  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }
  const depth = new Map<string, number>(nodeIds.map((id) => [id, 0]));
  const queue = nodeIds.filter((id) => (indegree.get(id) ?? 0) === 0);
  for (let i = 0; i < queue.length; i += 1) {
    const current = queue[i]!;
    for (const next of adjacency.get(current) ?? []) {
      depth.set(next, Math.max(depth.get(next) ?? 0, (depth.get(current) ?? 0) + 1));
      indegree.set(next, (indegree.get(next) ?? 0) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }
  return Math.max(0, ...depth.values());
}

function hasCycle(nodeIds: readonly string[], edges: readonly KnowledgeEdge[]): boolean {
  const adjacency = new Map<string, string[]>(nodeIds.map((id) => [id, []]));
  for (const edge of edges) adjacency.get(edge.source)?.push(edge.target);
  const state = new Map<string, 0 | 1 | 2>(nodeIds.map((id) => [id, 0]));
  for (const root of nodeIds) {
    if (state.get(root) !== 0) continue;
    const stack: Array<{ nodeId: string; nextIndex: number }> = [{ nodeId: root, nextIndex: 0 }];
    state.set(root, 1);
    while (stack.length > 0) {
      const frame = stack[stack.length - 1]!;
      const neighbors = adjacency.get(frame.nodeId) ?? [];
      if (frame.nextIndex < neighbors.length) {
        const next = neighbors[frame.nextIndex]!;
        frame.nextIndex += 1;
        const nextState = state.get(next) ?? 0;
        if (nextState === 1) return true;
        if (nextState === 0) {
          state.set(next, 1);
          stack.push({ nodeId: next, nextIndex: 0 });
        }
      } else {
        state.set(frame.nodeId, 2);
        stack.pop();
      }
    }
  }
  return false;
}

function snapshotToSerializable(snapshot: GraphSnapshot) {
  return {
    id: snapshot.id,
    version: snapshot.version,
    checksum: snapshot.checksum,
    createdAt: snapshot.createdAt,
    nodes: [...snapshot.nodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...snapshot.edges.values()].sort((a, b) => a.id.localeCompare(b.id)),
    metadata: snapshot.metadata,
    metrics: snapshot.metrics,
  };
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortForJson(value));
}

function sortForJson(value: unknown): unknown {
  if (value instanceof Map) return sortForJson(Object.fromEntries([...value.entries()].sort(([a], [b]) => String(a).localeCompare(String(b)))));
  if (value instanceof Set) return [...value].sort();
  if (Array.isArray(value)) return value.map(sortForJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, sortForJson(child)]));
  }
  return value;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function inRange(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function isIso(value: string): boolean {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) && value.includes("T");
}

function error(code: string, message: string, entityId?: string): ValidationIssue {
  return { severity: "error", code, message, entityId };
}

function warning(code: string, message: string, entityId?: string): ValidationIssue {
  return { severity: "warning", code, message, entityId };
}

export function createEdgeMetadata(input: {
  weight: number;
  confidence: number;
  evidenceCount: number;
  canonicalStatus: EdgeMetadata["canonicalStatus"];
  temporal: EdgeMetadata["temporal"];
  sourceEvidence: string[];
  multiplicity: EdgeMetadata["multiplicity"];
  relationshipType: RelationshipType;
  transitive?: boolean;
}): EdgeMetadata {
  const { relationshipType, transitive, ...metadata } = input;
  return { ...metadata, direction: "directed", transitive: transitive ?? TRANSITIVE_RELATIONSHIPS.has(relationshipType) };
}
