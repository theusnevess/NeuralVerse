// GENERATED FILE. DO NOT EDIT.
// sourceSchemaId = urn:neuralverse:xfi:contract:agent-contribution:1.0.0
// sourceSchemaVersion = 1.0.0
// sourceSchemaSha256 = adfead3dc5cc22e9a91b205448227c0b22dd89373d1d3fa5eed6987f8e9f39f3
// generator = neuralverse-contract-projections/1.0.0

export type JsonValue = unknown;

export type Identifiers = readonly string[];

export interface Dependency {
  readonly kind: "contribution" | "source" | "citation" | "concept" | "curriculum_node";
  readonly id: string;
}

export interface ValidationResult {
  readonly status: "PASS" | "PASS_WITH_FINDINGS" | "FAIL" | "UNKNOWN";
  readonly valid: boolean;
  readonly findings: readonly JsonValue[];
  readonly value?: JsonValue;
  readonly checkedAt?: string;
}

export interface AgentContribution {
  readonly schema_name: "AgentContribution";
  readonly schema_version: string;
  readonly minimum_reader_version: string;
  readonly producer_version: string;
  readonly created_at: string;
  readonly extensions?: Record<string, JsonValue>;
  readonly contributionId: string;
  readonly generationJobId: string;
  readonly agentId: string;
  readonly agentVersion: string;
  readonly packageId: string;
  readonly packageVersion: string;
  readonly contributionType: "conceptual_definition" | "dependency_analysis" | "research_evidence" | "application_guidance" | "laboratory_observation" | "assessment_guidance" | "narrative_framing" | "curiosity_prompt" | "didactic_structure" | "governance_finding" | "visual_recommendation";
  readonly inputDependencies: readonly Dependency[];
  readonly payloadSchemaVersion: string;
  readonly structuredPayload: Record<string, JsonValue>;
  readonly citationIds: Identifiers;
  readonly assetRequestIds: Identifiers;
  readonly validationResults: readonly ValidationResult[];
  readonly warnings: readonly JsonValue[];
  readonly confidence: number;
  readonly createdAt: string;
  readonly metadata: Record<string, JsonValue>;
}
