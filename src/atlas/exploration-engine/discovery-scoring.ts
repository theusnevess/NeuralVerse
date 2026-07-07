import type { GraphSnapshot, KnowledgeNode } from "../graph-foundation/index.ts";
import { DEPENDENCY_RELATIONSHIPS } from "../graph-foundation/canonical.ts";
import type { DiscoveryCandidate, DiscoverySignals } from "./types.ts";

const WEIGHTS: Record<keyof DiscoverySignals, number> = {
  semanticProximity: 0.25,
  dependencyRelevance: 0.25,
  bridgeImportance: 0.15,
  hubCentrality: 0.15,
  curriculumProgression: 0.15,
  novelty: 0.05,
};

export function computeDiscoveryCandidates(
  snapshot: GraphSnapshot,
  selectedNodeId: string,
  visitedNodeIds: ReadonlySet<string>,
  maxCandidates: number = 8,
): readonly DiscoveryCandidate[] {
  const selected = snapshot.nodes.get(selectedNodeId);
  if (!selected) return [];

  const candidates = new Map<string, DiscoverySignals>();
  const neighbors = getNeighborIds(snapshot, selectedNodeId);
  const directTargets = getOutgoingIds(snapshot, selectedNodeId);
  const directSources = getIncomingIds(snapshot, selectedNodeId);
  const bridgeIds = new Set(getBridgeNodeIds(snapshot));
  const hubIds = new Set(getHubNodeIds(snapshot));

  for (const neighborId of neighbors) {
    if (neighborId === selectedNodeId) continue;
    const neighbor = snapshot.nodes.get(neighborId);
    if (!neighbor) continue;

    const signals: DiscoverySignals = {
      semanticProximity: computeSemanticProximity(selected, neighbor),
      dependencyRelevance: computeDependencyRelevance(snapshot, selectedNodeId, neighborId, directTargets, directSources),
      bridgeImportance: bridgeIds.has(neighborId) ? 0.9 : 0.2,
      hubCentrality: hubIds.has(neighborId) ? 0.85 : (snapshot.metrics.centrality[neighborId]?.degree ?? 0) / Math.max(1, snapshot.metrics.nodeCount * 0.1),
      curriculumProgression: computeCurriculumProgression(snapshot, selected, neighbor),
      novelty: visitedNodeIds.has(neighborId) ? 0.1 : 0.9,
    };

    candidates.set(neighborId, signals);
  }

  const scored: DiscoveryCandidate[] = [];
  for (const [nodeId, signals] of candidates) {
    const node = snapshot.nodes.get(nodeId)!;
    const score = computeWeightedScore(signals);
    const reason = buildCandidateReason(signals, directTargets.includes(nodeId), directSources.includes(nodeId), bridgeIds.has(nodeId), hubIds.has(nodeId));
    scored.push({
      nodeId,
      label: node.name,
      domain: node.metadata.domain ?? "Unclassified",
      score,
      signals,
      reason,
    });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCandidates);
}

function computeSemanticProximity(source: KnowledgeNode, target: KnowledgeNode): number {
  if (source.metadata.domain === target.metadata.domain) return 0.9;
  const sourceTags = new Set(source.metadata.tags ?? []);
  const targetTags = new Set(target.metadata.tags ?? []);
  let overlap = 0;
  for (const tag of sourceTags) {
    if (targetTags.has(tag)) overlap += 1;
  }
  const maxTags = Math.max(sourceTags.size, targetTags.size, 1);
  return 0.3 + (overlap / maxTags) * 0.5;
}

function computeDependencyRelevance(
  snapshot: GraphSnapshot,
  sourceId: string,
  targetId: string,
  directTargets: readonly string[],
  directSources: readonly string[],
): number {
  if (directTargets.includes(targetId)) return 0.95;
  if (directSources.includes(targetId)) return 0.85;

  const edge = findEdgeBetween(snapshot, sourceId, targetId);
  if (edge && DEPENDENCY_RELATIONSHIPS.has(edge.type)) return 0.8;
  if (edge) return 0.6;

  const targetInDegree = snapshot.index.reverseAdjacencyList.get(targetId)?.size ?? 0;
  const totalNodes = snapshot.metrics.nodeCount;
  return Math.min(0.7, 0.2 + (targetInDegree / Math.max(1, totalNodes * 0.05)) * 0.5);
}

function computeCurriculumProgression(snapshot: GraphSnapshot, source: KnowledgeNode, target: KnowledgeNode): number {
  const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
  const sourceDiff = difficultyOrder[source.metadata.difficulty ?? "beginner"];
  const targetDiff = difficultyOrder[target.metadata.difficulty ?? "beginner"];
  if (targetDiff === sourceDiff + 1) return 0.9;
  if (targetDiff === sourceDiff) return 0.6;
  if (targetDiff > sourceDiff) return 0.5;
  return 0.3;
}

function computeWeightedScore(signals: DiscoverySignals): number {
  let total = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    total += signals[key as keyof DiscoverySignals] * weight;
  }
  return Math.min(1, Math.max(0, total));
}

function buildCandidateReason(
  signals: DiscoverySignals,
  isDirectTarget: boolean,
  isDirectSource: boolean,
  isBridge: boolean,
  isHub: boolean,
): string {
  const parts: string[] = [];
  if (isDirectTarget) parts.push("unlocks this concept");
  if (isDirectSource) parts.push("prerequisite for current");
  if (isBridge) parts.push("bridge to another region");
  if (isHub) parts.push("central hub concept");
  if (signals.curriculumProgression > 0.7) parts.push("natural progression");
  if (signals.novelty > 0.8) parts.push("unexplored territory");
  if (signals.semanticProximity > 0.8) parts.push("same domain");
  return parts.length > 0 ? parts.join(" · ") : "connected concept";
}

function getNeighborIds(snapshot: GraphSnapshot, nodeId: string): string[] {
  const ids = new Set<string>();
  for (const target of snapshot.index.adjacencyList.get(nodeId) ?? []) ids.add(target);
  for (const source of snapshot.index.reverseAdjacencyList.get(nodeId) ?? []) ids.add(source);
  return [...ids];
}

function getOutgoingIds(snapshot: GraphSnapshot, nodeId: string): string[] {
  return [...(snapshot.index.adjacencyList.get(nodeId) ?? [])];
}

function getIncomingIds(snapshot: GraphSnapshot, nodeId: string): string[] {
  return [...(snapshot.index.reverseAdjacencyList.get(nodeId) ?? [])];
}

function getBridgeNodeIds(snapshot: GraphSnapshot): string[] {
  const bridges: string[] = [];
  for (const node of snapshot.nodes.values()) {
    const centrality = snapshot.metrics.centrality[node.id];
    if (centrality && centrality.inDegree > 0 && centrality.outDegree > 0) {
      const domains = new Set<string>();
      for (const edgeId of snapshot.index.edgesBySource.get(node.id) ?? []) {
        const edge = snapshot.edges.get(edgeId);
        if (edge) {
          const target = snapshot.nodes.get(edge.target);
          if (target?.metadata.domain) domains.add(target.metadata.domain);
        }
      }
      for (const edgeId of snapshot.index.edgesByTarget.get(node.id) ?? []) {
        const edge = snapshot.edges.get(edgeId);
        if (edge) {
          const source = snapshot.nodes.get(edge.source);
          if (source?.metadata.domain) domains.add(source.metadata.domain);
        }
      }
      if (domains.size > 1) bridges.push(node.id);
    }
  }
  return bridges;
}

function getHubNodeIds(snapshot: GraphSnapshot): string[] {
  const threshold = Math.max(3, Math.sqrt(snapshot.metrics.nodeCount));
  return [...snapshot.nodes.values()]
    .filter((node) => {
      const centrality = snapshot.metrics.centrality[node.id];
      return centrality && centrality.degree >= threshold;
    })
    .map((node) => node.id);
}

function findEdgeBetween(snapshot: GraphSnapshot, sourceId: string, targetId: string) {
  for (const edgeId of snapshot.index.edgesBySource.get(sourceId) ?? []) {
    const edge = snapshot.edges.get(edgeId);
    if (edge && edge.target === targetId) return edge;
  }
  for (const edgeId of snapshot.index.edgesByTarget.get(sourceId) ?? []) {
    const edge = snapshot.edges.get(edgeId);
    if (edge && edge.source === targetId) return edge;
  }
  return null;
}
