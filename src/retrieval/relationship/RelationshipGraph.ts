import type { ReferenceRegistry } from "../reference/ReferenceRegistry.ts";
import type { Relationship } from "./Relationship.ts";
import type { RelationshipRepository } from "./RelationshipRepository.ts";

export class RelationshipGraph {
  private repository: RelationshipRepository;
  private referenceRegistry: ReferenceRegistry;

  constructor(repository: RelationshipRepository, referenceRegistry: ReferenceRegistry) {
    this.repository = repository;
    this.referenceRegistry = referenceRegistry;
  }

  async createRelationship(data: {
    id: string;
    sourceReferenceId: string;
    targetReferenceId: string;
    type: string;
    context?: string;
    strength?: number;
  }): Promise<Relationship> {
    if (!data.id || data.id.trim() === "") {
      throw new Error("Relationship ID cannot be empty.");
    }
    if (!data.sourceReferenceId || data.sourceReferenceId.trim() === "") {
      throw new Error("Source reference ID cannot be empty.");
    }
    if (!data.targetReferenceId || data.targetReferenceId.trim() === "") {
      throw new Error("Target reference ID cannot be empty.");
    }
    if (!data.type || data.type.trim() === "") {
      throw new Error("Relationship type cannot be empty.");
    }
    if (data.sourceReferenceId === data.targetReferenceId) {
      throw new Error("Self-relationship is forbidden.");
    }
    if (data.strength !== undefined) {
      if (typeof data.strength !== "number" || isNaN(data.strength) || data.strength < 0 || data.strength > 1) {
        throw new Error("Relationship strength must be between 0 and 1 inclusive.");
      }
    }

    const existing = await this.repository.getById(data.id);
    if (existing) {
      throw new Error(`Duplicate relationship ID forbidden: ${data.id}`);
    }

    try {
      await this.referenceRegistry.getReference(data.sourceReferenceId);
    } catch (err) {
      throw new Error(`Source reference does not exist in registry: ${data.sourceReferenceId}`);
    }

    try {
      await this.referenceRegistry.getReference(data.targetReferenceId);
    } catch (err) {
      throw new Error(`Target reference does not exist in registry: ${data.targetReferenceId}`);
    }

    const now = new Date();
    const relationship: Relationship = {
      id: data.id,
      sourceReferenceId: data.sourceReferenceId,
      targetReferenceId: data.targetReferenceId,
      type: data.type,
      context: data.context,
      strength: data.strength,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(relationship);
  }

  async getRelationship(id: string): Promise<Relationship> {
    if (!id || id.trim() === "") {
      throw new Error("Relationship ID cannot be empty.");
    }
    const rel = await this.repository.getById(id);
    if (!rel) {
      throw new Error(`Relationship not found: ${id}`);
    }
    return rel;
  }

  async listRelationships(): Promise<Relationship[]> {
    return this.repository.list();
  }

  async listRelationshipsBySource(sourceReferenceId: string): Promise<Relationship[]> {
    if (!sourceReferenceId || sourceReferenceId.trim() === "") {
      throw new Error("Source reference ID cannot be empty.");
    }
    return this.repository.listBySourceReferenceId(sourceReferenceId);
  }

  async listRelationshipsByTarget(targetReferenceId: string): Promise<Relationship[]> {
    if (!targetReferenceId || targetReferenceId.trim() === "") {
      throw new Error("Target reference ID cannot be empty.");
    }
    return this.repository.listByTargetReferenceId(targetReferenceId);
  }

  async deleteRelationship(id: string): Promise<void> {
    if (!id || id.trim() === "") {
      throw new Error("Relationship ID cannot be empty.");
    }
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new Error(`Relationship not found: ${id}`);
    }
    await this.repository.delete(id);
  }

  async traverseDirectConnections(referenceId: string): Promise<Relationship[]> {
    if (!referenceId || referenceId.trim() === "") {
      throw new Error("Reference ID cannot be empty.");
    }
    try {
      await this.referenceRegistry.getReference(referenceId);
    } catch (err) {
      throw new Error(`Reference does not exist in registry: ${referenceId}`);
    }

    const [outgoing, incoming] = await Promise.all([
      this.repository.listBySourceReferenceId(referenceId),
      this.repository.listByTargetReferenceId(referenceId),
    ]);

    return [...outgoing, ...incoming];
  }
}
