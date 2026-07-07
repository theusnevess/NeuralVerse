export interface ExplorationJourney {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly steps: readonly ExplorationStep[];
  readonly tags: readonly string[];
}

export interface ExplorationStep {
  readonly nodeId: string;
  readonly label: string;
  readonly domain: string;
  readonly role: "foundation" | "method" | "application" | "specialization" | "bridge";
  readonly isOptional: boolean;
}

export interface JourneyPosition {
  readonly journey: ExplorationJourney;
  readonly currentStepIndex: number;
  readonly completedSteps: readonly string[];
  readonly progress: number;
  readonly nextStep: ExplorationStep | null;
  readonly previousStep: ExplorationStep | null;
}

export interface DiscoveryCandidate {
  readonly nodeId: string;
  readonly label: string;
  readonly domain: string;
  readonly score: number;
  readonly signals: DiscoverySignals;
  readonly reason: string;
}

export interface DiscoverySignals {
  readonly semanticProximity: number;
  readonly dependencyRelevance: number;
  readonly bridgeImportance: number;
  readonly hubCentrality: number;
  readonly curriculumProgression: number;
  readonly novelty: number;
}

export interface LandmarkNarrative {
  readonly nodeId: string;
  readonly label: string;
  readonly scientificRole: string;
  readonly historicalImportance: string;
  readonly structuralImportance: string;
  readonly dependencyImportance: string;
  readonly domainContext: string;
}

export interface ExplorationBreadcrumb {
  readonly nodeId: string;
  readonly label: string;
  readonly domain: string;
  readonly timestamp: number;
  readonly selectionIndex: number;
}

export interface GuidedMessage {
  readonly text: string;
  readonly kind: "discovery" | "journey" | "landmark" | "transition" | "orientation";
  readonly priority: number;
}

export interface ExplorationState {
  readonly selectedNodeId: string | null;
  readonly breadcrumbs: readonly ExplorationBreadcrumb[];
  readonly activeJourneyId: string | null;
  readonly completedJourneySteps: ReadonlySet<string>;
  readonly visitedNodes: ReadonlySet<string>;
}

export interface ExplorationSnapshot {
  readonly currentPosition: JourneyPosition | null;
  readonly candidates: readonly DiscoveryCandidate[];
  readonly landmark: LandmarkNarrative | null;
  readonly breadcrumbs: readonly ExplorationBreadcrumb[];
  readonly guidedMessage: GuidedMessage | null;
  readonly regionContext: RegionContext | null;
}

export interface RegionContext {
  readonly domain: string;
  readonly memberCount: number;
  readonly storyRole: string;
  readonly neighborRegions: readonly string[];
  readonly capitalLabel: string | null;
  readonly hubLabels: readonly string[];
  readonly bridgeLabels: readonly string[];
}
