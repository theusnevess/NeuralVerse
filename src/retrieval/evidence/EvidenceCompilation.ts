export type EvidenceConfidence = "low" | "medium" | "high";

export interface EvidenceReference {
  referenceId: string;
  title: string;
  type: string;
  source: string;
  status: "active" | "archived";
}

export interface EvidenceRelationship {
  relationshipId: string;
  sourceReferenceId: string;
  targetReferenceId: string;
  type: string;
  context?: string;
  strength?: number;
}

export interface EvidenceCompilation {
  id: string;
  mode: "query" | "reference";
  input: string;
  matchedReferences: EvidenceReference[];
  relatedReferences: EvidenceReference[];
  relationships: EvidenceRelationship[];
  confidence: EvidenceConfidence;
  summary: string;
  createdAt: Date;
}
