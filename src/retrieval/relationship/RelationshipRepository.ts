import type { Relationship } from "./Relationship.ts";

export interface RelationshipRepository {
  create(relationship: Relationship): Promise<Relationship>;
  update(relationship: Relationship): Promise<Relationship>;
  getById(id: string): Promise<Relationship | null>;
  list(): Promise<Relationship[]>;
  listBySourceReferenceId(sourceReferenceId: string): Promise<Relationship[]>;
  listByTargetReferenceId(targetReferenceId: string): Promise<Relationship[]>;
  delete(id: string): Promise<void>;
}
