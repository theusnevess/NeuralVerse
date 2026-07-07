import type { GraphSnapshot } from "../graph-foundation/index.ts";
import type {
  DiscoveryCandidate,
  ExplorationBreadcrumb,
  ExplorationState,
  GuidedMessage,
  JourneyPosition,
  LandmarkNarrative,
  RegionContext,
  ExplorationSnapshot,
} from "./types.ts";
import { computeDiscoveryCandidates } from "./discovery-scoring.ts";
import { CANONICAL_JOURNEYS, findBestJourneyForNode } from "./journeys.ts";
import { buildLandmarkNarrative } from "./landmark-narratives.ts";
import { buildGuidedMessage } from "./guided-discovery.ts";

export function createExplorationState(): ExplorationState {
  return {
    selectedNodeId: null,
    breadcrumbs: [],
    activeJourneyId: null,
    completedJourneySteps: new Set(),
    visitedNodes: new Set(),
  };
}

export function computeExplorationSnapshot(
  snapshot: GraphSnapshot,
  state: ExplorationState,
  selectedNodeId: string | null,
): ExplorationSnapshot {
  if (!selectedNodeId) {
    return {
      currentPosition: null,
      candidates: [],
      landmark: null,
      breadcrumbs: state.breadcrumbs,
      guidedMessage: buildOverviewMessage(),
      regionContext: null,
    };
  }

  const selected = snapshot.nodes.get(selectedNodeId);
  if (!selected) {
    return {
      currentPosition: null,
      candidates: [],
      landmark: null,
      breadcrumbs: state.breadcrumbs,
      guidedMessage: null,
      regionContext: null,
    };
  }

  const journeyPosition = computeJourneyPosition(snapshot, state, selectedNodeId);
  const candidates = computeDiscoveryCandidates(snapshot, selectedNodeId, state.visitedNodes, 6);
  const landmark = buildLandmarkNarrative(snapshot, selectedNodeId);
  const regionContext = buildRegionContext(snapshot, selectedNodeId);
  const guidedMessage = buildGuidedMessage(snapshot, state, selectedNodeId, journeyPosition, candidates);

  return {
    currentPosition: journeyPosition,
    candidates,
    landmark,
    breadcrumbs: state.breadcrumbs,
    guidedMessage,
    regionContext,
  };
}

export function updateExplorationState(
  state: ExplorationState,
  selectedNodeId: string | null,
  nodeLabel: string,
  nodeDomain: string,
): ExplorationState {
  if (!selectedNodeId) {
    return { ...state, selectedNodeId: null };
  }

  const breadcrumbs = [...state.breadcrumbs];
  if (state.selectedNodeId && state.selectedNodeId !== selectedNodeId) {
    breadcrumbs.push({
      nodeId: state.selectedNodeId,
      label: nodeLabel,
      domain: nodeDomain,
      timestamp: Date.now(),
      selectionIndex: breadcrumbs.length,
    });
    if (breadcrumbs.length > 20) breadcrumbs.shift();
  }

  const visited = new Set(state.visitedNodes);
  visited.add(selectedNodeId);

  const completedSteps = new Set(state.completedJourneySteps);
  for (const journey of CANONICAL_JOURNEYS) {
    const stepIndex = journey.steps.findIndex((s) => s.nodeId === selectedNodeId);
    if (stepIndex >= 0) {
      for (let i = 0; i <= stepIndex; i++) {
        completedSteps.add(journey.steps[i].nodeId);
      }
    }
  }

  const activeJourney = findBestJourneyForNode(selectedNodeId);
  const activeJourneyId = activeJourney?.id ?? state.activeJourneyId;

  return {
    selectedNodeId,
    breadcrumbs,
    activeJourneyId,
    completedJourneySteps: completedSteps,
    visitedNodes: visited,
  };
}

function computeJourneyPosition(
  snapshot: GraphSnapshot,
  state: ExplorationState,
  selectedNodeId: string,
): JourneyPosition | null {
  const journey = findBestJourneyForNode(selectedNodeId);
  if (!journey) return null;

  const currentIndex = journey.steps.findIndex((s) => s.nodeId === selectedNodeId);
  if (currentIndex < 0) return null;

  const completedSteps = journey.steps
    .filter((step) => state.completedJourneySteps.has(step.nodeId))
    .map((step) => step.nodeId);

  const progress = completedSteps.length / journey.steps.length;

  return {
    journey,
    currentStepIndex: currentIndex,
    completedSteps,
    progress,
    nextStep: currentIndex < journey.steps.length - 1 ? journey.steps[currentIndex + 1] : null,
    previousStep: currentIndex > 0 ? journey.steps[currentIndex - 1] : null,
  };
}

function buildRegionContext(snapshot: GraphSnapshot, selectedNodeId: string): RegionContext | null {
  const selected = snapshot.nodes.get(selectedNodeId);
  if (!selected?.metadata.domain) return null;

  const domain = selected.metadata.domain;
  const members: string[] = [];
  const hubLabels: string[] = [];
  const bridgeLabels: string[] = [];
  let capitalLabel: string | null = null;
  let maxImportance = 0;

  const threshold = Math.max(3, Math.sqrt(snapshot.metrics.nodeCount));

  for (const node of snapshot.nodes.values()) {
    if (node.metadata.domain === domain) {
      members.push(node.id);
      const centrality = snapshot.metrics.centrality[node.id];
      if (centrality && centrality.degree >= threshold) {
        hubLabels.push(node.name);
      }
      if (node.metadata.importance !== undefined && node.metadata.importance > maxImportance) {
        maxImportance = node.metadata.importance;
        capitalLabel = node.name;
      }
    }
  }

  const neighborDomains = new Set<string>();
  for (const nodeId of members) {
    for (const targetId of snapshot.index.adjacencyList.get(nodeId) ?? []) {
      const target = snapshot.nodes.get(targetId);
      if (target?.metadata.domain && target.metadata.domain !== domain) {
        neighborDomains.add(target.metadata.domain);
      }
    }
    for (const sourceId of snapshot.index.reverseAdjacencyList.get(nodeId) ?? []) {
      const source = snapshot.nodes.get(sourceId);
      if (source?.metadata.domain && source.metadata.domain !== domain) {
        neighborDomains.add(source.metadata.domain);
      }
    }
  }

  return {
    domain,
    memberCount: members.length,
    storyRole: inferStoryRole(domain),
    neighborRegions: [...neighborDomains].sort(),
    capitalLabel,
    hubLabels: hubLabels.slice(0, 4),
    bridgeLabels: bridgeLabels.slice(0, 3),
  };
}

function inferStoryRole(domain: string): string {
  const roles: Record<string, string> = {
    Mathematics: "foundation",
    Calculus: "foundation",
    Statistics: "foundation",
    Programming: "method",
    Research: "method",
    "Machine Learning": "method",
    "Deep Learning": "specialization",
    "Computer Vision": "specialization",
    NLP: "specialization",
    LLMs: "specialization",
    "LLM Engineering": "application",
    Agents: "application",
    MLOps: "operation",
  };
  return roles[domain] ?? "method";
}

function buildOverviewMessage(): GuidedMessage {
  return {
    text: "Select a concept to begin exploring the AI Engineering knowledge landscape.",
    kind: "orientation",
    priority: 1,
  };
}
