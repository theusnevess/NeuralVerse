import type { GraphSnapshot } from "../graph-foundation/index.ts";
import type {
  DiscoveryCandidate,
  ExplorationState,
  GuidedMessage,
  JourneyPosition,
} from "./types.ts";
import { findJourneysForNode } from "./journeys.ts";

export function buildGuidedMessage(
  snapshot: GraphSnapshot,
  state: ExplorationState,
  selectedNodeId: string,
  journeyPosition: JourneyPosition | null,
  candidates: readonly DiscoveryCandidate[],
): GuidedMessage | null {
  const selected = snapshot.nodes.get(selectedNodeId);
  if (!selected) return null;

  const messages: GuidedMessage[] = [];

  if (journeyPosition) {
    const journeyMsg = buildJourneyMessage(journeyPosition);
    if (journeyMsg) messages.push(journeyMsg);
  }

  if (candidates.length > 0) {
    const discoveryMsg = buildDiscoveryMessage(candidates);
    if (discoveryMsg) messages.push(discoveryMsg);
  }

  const transitionMsg = buildTransitionMessage(snapshot, state, selectedNodeId);
  if (transitionMsg) messages.push(transitionMsg);

  const orientationMsg = buildOrientationMessage(snapshot, selected);
  if (orientationMsg) messages.push(orientationMsg);

  messages.sort((a, b) => b.priority - a.priority);
  return messages.length > 0 ? messages[0] : null;
}

function buildJourneyMessage(position: JourneyPosition): GuidedMessage | null {
  const { journey, currentStepIndex, progress, nextStep } = position;
  const stepCount = journey.steps.length;
  const currentStep = journey.steps[currentStepIndex];

  if (nextStep) {
    return {
      text: `Exploring ${journey.name} · Step ${currentStepIndex + 1} of ${stepCount} · Next: ${nextStep.label}`,
      kind: "journey",
      priority: 8,
    };
  }

  return {
    text: `You've reached the end of ${journey.name}. ${Math.round(progress * 100)}% complete.`,
    kind: "journey",
    priority: 7,
  };
}

function buildDiscoveryMessage(candidates: readonly DiscoveryCandidate[]): GuidedMessage | null {
  if (candidates.length === 0) return null;

  const top = candidates[0];
  if (top.score > 0.7) {
    return {
      text: `Recommended next: ${top.label} — ${top.reason}`,
      kind: "discovery",
      priority: 6,
    };
  }

  if (candidates.length > 1) {
    const labels = candidates.slice(0, 3).map((c) => c.label);
    return {
      text: `Consider exploring: ${labels.join(", ")}`,
      kind: "discovery",
      priority: 5,
    };
  }

  return null;
}

function buildTransitionMessage(
  snapshot: GraphSnapshot,
  state: ExplorationState,
  selectedNodeId: string,
): GuidedMessage | null {
  const selected = snapshot.nodes.get(selectedNodeId);
  if (!selected) return null;

  const currentDomain = selected.metadata.domain;
  const lastBreadcrumb = state.breadcrumbs[state.breadcrumbs.length - 1];

  if (lastBreadcrumb && lastBreadcrumb.domain !== currentDomain) {
    return {
      text: `Crossed into ${currentDomain} from ${lastBreadcrumb.domain}`,
      kind: "transition",
      priority: 4,
    };
  }

  const matchingJourneys = findJourneysForNode(selectedNodeId);
  if (matchingJourneys.length > 0 && !state.activeJourneyId) {
    const journey = matchingJourneys[0];
    return {
      text: `This concept is part of "${journey.name}". Follow the journey for a guided path.`,
      kind: "journey",
      priority: 3,
    };
  }

  return null;
}

function buildOrientationMessage(
  snapshot: GraphSnapshot,
  selected: { metadata: { domain?: string }; family: string; type: string },
): GuidedMessage | null {
  const domain = selected.metadata.domain;
  if (!domain) return null;

  const domainNodes = [...snapshot.nodes.values()].filter((n) => n.metadata.domain === domain);
  const visited = domainNodes.filter((n) => snapshot.metrics.centrality[n.id]?.degree !== undefined).length;
  const total = domainNodes.length;

  if (visited < total * 0.3) {
    return {
      text: `Exploring ${domain} · ${visited} of ${total} concepts visited`,
      kind: "orientation",
      priority: 2,
    };
  }

  return null;
}
