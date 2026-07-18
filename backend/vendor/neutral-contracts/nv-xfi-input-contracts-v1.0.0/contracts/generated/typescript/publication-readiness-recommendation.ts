// GENERATED FILE. DO NOT EDIT.
// sourceSchemaId = urn:neuralverse:xfi:contract:publication-readiness-recommendation:1.0.0
// sourceSchemaVersion = 1.0.0
// sourceSchemaSha256 = 249ace10693abb245353d747ffec091ed10392bf2b29e064aa2f1f8a8becd926
// generator = neuralverse-contract-projections/1.0.0

export type JsonValue = unknown;

export type Identifiers = readonly string[];
export type Id = string;

export interface Recommender {
  readonly kind: "agent" | "human" | "governance";
  readonly agentId?: string;
  readonly label?: string;
}

export interface CoverageValue {
  readonly status: "evaluated" | "not_applicable" | "not_evaluated";
  readonly value?: number;
}

export interface Coverage {
  readonly source: CoverageValue;
  readonly contentBlock: CoverageValue;
  readonly asset: CoverageValue;
  readonly laboratory: CoverageValue;
  readonly assessment: CoverageValue;
  readonly accessibility: CoverageValue;
  readonly governance: CoverageValue;
}

export interface QualityGateResult {
  readonly gateId: Id;
  readonly gateResult: "PASS" | "PASS_WITH_FINDINGS" | "FAIL" | "UNKNOWN";
  readonly severity: "P0" | "P1" | "P2" | "P3" | "UNKNOWN";
  readonly findings: readonly Finding[];
  readonly evidenceReferences: Identifiers;
  readonly manualReviewRequired: boolean;
  readonly unresolvedUnknowns: Identifiers;
}

export interface Finding {
  readonly findingId: Id;
  readonly findingType: string;
  readonly severity: "P0" | "P1" | "P2" | "P3" | "UNKNOWN";
  readonly description: string;
  readonly evidenceReferences: Identifiers;
  readonly blocking: boolean;
}

export interface BacklogItem {
  readonly backlogItemId: Id;
  readonly category: string;
  readonly description: string;
  readonly severity: "P2" | "P3";
  readonly reasonForAcceptance: string;
  readonly affectedPackageArea: string;
  readonly evidenceReferences: Identifiers;
  readonly requiredFollowUp: string;
  readonly blocking: false;
}

export interface UnresolvedUnknown {
  readonly unknownId: Id;
  readonly affectedArea: string;
  readonly description: string;
  readonly risk: string;
  readonly resolutionPath: string;
  readonly blocking: boolean;
}

export interface ManualReview {
  readonly manualReviewId: string;
  readonly reviewType: string;
  readonly reason: string;
  readonly owner: JsonValue;
  readonly blocking: boolean;
  readonly status?: "PENDING" | "COMPLETED" | "REJECTED" | "UNKNOWN";
  readonly reviewResult?: "APPROVED" | "REJECTED" | "DEFERRED";
  readonly reviewedAt?: string;
  readonly reviewerId?: string;
  readonly evidenceReferences?: readonly string[];
  readonly metadata?: Record<string, JsonValue>;
}

export interface PublicationReadinessRecommendation {
  readonly schema_name: "PublicationReadinessRecommendation";
  readonly schema_version: string;
  readonly minimum_reader_version: string;
  readonly producer_version: string;
  readonly created_at: string;
  readonly extensions?: Record<string, JsonValue>;
  readonly packageId: string;
  readonly packageVersion: string;
  readonly recommendation: "READY_FOR_PUBLICATION" | "READY_WITH_DOCUMENTED_MINOR_BACKLOG" | "REVISION_REQUIRED" | "HUMAN_REVIEW_REQUIRED" | "BLOCKED_BY_EVIDENCE" | "BLOCKED_BY_CONTENT_GAP" | "BLOCKED_BY_ASSET_GAP" | "BLOCKED_BY_GOVERNANCE" | "REJECTED";
  readonly recommender: Recommender;
  readonly recommenderVersion: string;
  readonly qualityGateResults: readonly QualityGateResult[];
  readonly unresolvedFindingIds: Identifiers;
  readonly requiredManualReviews: readonly ManualReview[];
  readonly acceptedBacklog: readonly BacklogItem[];
  readonly unresolvedUnknowns: readonly UnresolvedUnknown[];
  readonly coverage: Coverage;
  readonly governanceRationale: string;
  readonly recommendedAt: string;
  readonly metadata: Record<string, JsonValue>;
}
