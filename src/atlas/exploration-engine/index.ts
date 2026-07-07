export type {
  DiscoveryCandidate,
  DiscoverySignals,
  ExplorationBreadcrumb,
  ExplorationJourney,
  ExplorationSnapshot,
  ExplorationState,
  ExplorationStep,
  GuidedMessage,
  JourneyPosition,
  LandmarkNarrative,
  RegionContext,
} from "./types.ts";

export { CANONICAL_JOURNEYS, findBestJourneyForNode, findJourneysForNode } from "./journeys.ts";
export { computeDiscoveryCandidates } from "./discovery-scoring.ts";
export {
  computeExplorationSnapshot,
  createExplorationState,
  updateExplorationState,
} from "./recommendation-engine.ts";
export {
  addBreadcrumb,
  formatBreadcrumbTrail,
  getBreadcrumbsByDomain,
  getDomainTransitionCount,
  getExplorationDuration,
  getExplorationPath,
  getRecentBreadcrumbs,
} from "./exploration-history.ts";
export { buildLandmarkNarrative } from "./landmark-narratives.ts";
export { buildGuidedMessage } from "./guided-discovery.ts";
