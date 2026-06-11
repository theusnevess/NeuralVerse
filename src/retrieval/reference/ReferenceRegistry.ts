import type { Reference } from "./Reference.ts";
import type { ReferenceRepository } from "./ReferenceRepository.ts";

export class ReferenceRegistry {
  private repository: ReferenceRepository;

  constructor(repository: ReferenceRepository) {
    this.repository = repository;
  }

  async registerReference(data: {
    id: string;
    title: string;
    type: string;
    source: string;
  }): Promise<Reference> {
    if (!data.id || data.id.trim() === "") {
      throw new Error("Reference ID cannot be empty.");
    }
    if (!data.title || data.title.trim() === "") {
      throw new Error("Reference title cannot be empty.");
    }
    if (!data.source || data.source.trim() === "") {
      throw new Error("Reference source cannot be empty.");
    }

    const existing = await this.repository.getById(data.id);
    if (existing) {
      throw new Error(`Duplicate reference ID forbidden: ${data.id}`);
    }

    const now = new Date();
    const reference: Reference = {
      id: data.id,
      title: data.title,
      type: data.type || "unknown",
      source: data.source,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(reference);
  }

  async updateReference(
    id: string,
    updates: { title?: string; type?: string; source?: string }
  ): Promise<Reference> {
    if (!id || id.trim() === "") {
      throw new Error("Reference ID cannot be empty.");
    }

    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new Error(`Reference not found: ${id}`);
    }

    if (updates.title !== undefined) {
      if (updates.title.trim() === "") {
        throw new Error("Reference title cannot be empty.");
      }
      existing.title = updates.title;
    }

    if (updates.source !== undefined) {
      if (updates.source.trim() === "") {
        throw new Error("Reference source cannot be empty.");
      }
      existing.source = updates.source;
    }

    if (updates.type !== undefined) {
      existing.type = updates.type;
    }

    existing.updatedAt = new Date();

    return this.repository.update(existing);
  }

  async getReference(id: string): Promise<Reference> {
    if (!id || id.trim() === "") {
      throw new Error("Reference ID cannot be empty.");
    }
    const reference = await this.repository.getById(id);
    if (!reference) {
      throw new Error(`Reference not found: ${id}`);
    }
    return reference;
  }

  async listReferences(): Promise<Reference[]> {
    return this.repository.list();
  }

  async archiveReference(id: string): Promise<Reference> {
    if (!id || id.trim() === "") {
      throw new Error("Reference ID cannot be empty.");
    }
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new Error(`Reference not found: ${id}`);
    }
    return this.repository.archive(id);
  }
}
