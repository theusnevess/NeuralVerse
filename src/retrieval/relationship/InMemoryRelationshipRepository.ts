import type { Relationship } from "./Relationship.ts";
import type { RelationshipRepository } from "./RelationshipRepository.ts";

export class InMemoryRelationshipRepository implements RelationshipRepository {
  private relationships: Map<string, Relationship> = new Map();

  async create(relationship: Relationship): Promise<Relationship> {
    const clone = { ...relationship };
    this.relationships.set(clone.id, clone);
    return { ...clone };
  }

  async update(relationship: Relationship): Promise<Relationship> {
    if (!this.relationships.has(relationship.id)) {
      throw new Error(`Relationship not found in repository: ${relationship.id}`);
    }
    const clone = { ...relationship };
    this.relationships.set(clone.id, clone);
    return { ...clone };
  }

  async getById(id: string): Promise<Relationship | null> {
    const rel = this.relationships.get(id);
    if (!rel) return null;
    return { ...rel };
  }

  async list(): Promise<Relationship[]> {
    return Array.from(this.relationships.values()).map((rel) => ({ ...rel }));
  }

  async listBySourceReferenceId(sourceReferenceId: string): Promise<Relationship[]> {
    return Array.from(this.relationships.values())
      .filter((rel) => rel.sourceReferenceId === sourceReferenceId)
      .map((rel) => ({ ...rel }));
  }

  async listByTargetReferenceId(targetReferenceId: string): Promise<Relationship[]> {
    return Array.from(this.relationships.values())
      .filter((rel) => rel.targetReferenceId === targetReferenceId)
      .map((rel) => ({ ...rel }));
  }

  async delete(id: string): Promise<void> {
    if (!this.relationships.has(id)) {
      throw new Error(`Relationship not found in repository: ${id}`);
    }
    this.relationships.delete(id);
  }
}
