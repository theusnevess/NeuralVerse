import type { Reference } from "./Reference.ts";
import type { ReferenceRepository } from "./ReferenceRepository.ts";

export class InMemoryReferenceRepository implements ReferenceRepository {
  private references: Map<string, Reference> = new Map();

  async create(reference: Reference): Promise<Reference> {
    const clone = { ...reference };
    this.references.set(clone.id, clone);
    return { ...clone };
  }

  async update(reference: Reference): Promise<Reference> {
    if (!this.references.has(reference.id)) {
      throw new Error(`Reference not found in repository: ${reference.id}`);
    }
    const clone = { ...reference };
    this.references.set(clone.id, clone);
    return { ...clone };
  }

  async getById(id: string): Promise<Reference | null> {
    const ref = this.references.get(id);
    if (!ref) return null;
    return { ...ref };
  }

  async list(): Promise<Reference[]> {
    return Array.from(this.references.values()).map((ref) => ({ ...ref }));
  }

  async archive(id: string): Promise<Reference> {
    const ref = this.references.get(id);
    if (!ref) {
      throw new Error(`Reference not found in repository: ${id}`);
    }
    ref.status = "archived";
    ref.updatedAt = new Date();
    return { ...ref };
  }
}
