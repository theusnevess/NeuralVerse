import type { ReferenceRegistry } from "../reference/ReferenceRegistry.ts";
import type { RetrievalIndexEntry, RetrievalSearchResult, RetrievalSearchOptions } from "./RetrievalIndex.ts";
import type { RetrievalIndexRepository } from "./RetrievalIndexRepository.ts";

function normalizeKeywords(keywords: string[]): string[] {
  const normalized = keywords
    .map((k) => k.trim().toLowerCase().replace(/\s+/g, " "))
    .filter((k) => k !== "");
  return Array.from(new Set(normalized));
}

export class RetrievalIndexService {
  private repository: RetrievalIndexRepository;
  private referenceRegistry: ReferenceRegistry;

  constructor(repository: RetrievalIndexRepository, referenceRegistry: ReferenceRegistry) {
    this.repository = repository;
    this.referenceRegistry = referenceRegistry;
  }

  async indexReference(referenceId: string, keywords: string[]): Promise<RetrievalIndexEntry> {
    if (!referenceId || referenceId.trim() === "") {
      throw new Error("Reference ID cannot be empty.");
    }

    try {
      await this.referenceRegistry.getReference(referenceId);
    } catch (err) {
      throw new Error(`Reference does not exist in registry: ${referenceId}`);
    }

    if (!keywords || !Array.isArray(keywords)) {
      throw new Error("Keywords must be a valid array.");
    }

    const normalized = normalizeKeywords(keywords);
    if (normalized.length === 0) {
      throw new Error("Keywords must contain at least one non-empty keyword.");
    }

    const existing = await this.repository.getByReferenceId(referenceId);
    const now = new Date();
    const entry: RetrievalIndexEntry = {
      referenceId,
      keywords: normalized,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    return this.repository.upsert(entry);
  }

  async removeReference(referenceId: string): Promise<void> {
    if (!referenceId || referenceId.trim() === "") {
      throw new Error("Reference ID cannot be empty.");
    }
    const existing = await this.repository.getByReferenceId(referenceId);
    if (!existing) {
      throw new Error(`Index entry not found for reference ID: ${referenceId}`);
    }
    await this.repository.remove(referenceId);
  }

  async getIndexedReference(referenceId: string): Promise<RetrievalIndexEntry> {
    if (!referenceId || referenceId.trim() === "") {
      throw new Error("Reference ID cannot be empty.");
    }
    const entry = await this.repository.getByReferenceId(referenceId);
    if (!entry) {
      throw new Error(`Index entry not found for reference ID: ${referenceId}`);
    }
    return entry;
  }

  async listIndexedReferences(): Promise<RetrievalIndexEntry[]> {
    return this.repository.list();
  }

  async search(query: string, options?: RetrievalSearchOptions): Promise<RetrievalSearchResult[]> {
    if (!query || query.trim() === "") {
      return [];
    }

    const queryTerms = Array.from(
      new Set(
        query
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ")
          .split(" ")
          .filter((t) => t !== "")
      )
    );

    if (queryTerms.length === 0) {
      return [];
    }

    const entries = await this.repository.list();
    const results: RetrievalSearchResult[] = [];

    for (const entry of entries) {
      let ref;
      try {
        ref = await this.referenceRegistry.getReference(entry.referenceId);
      } catch (err) {
        continue;
      }

      const includeArchived = options?.includeArchived ?? false;
      if (ref.status === "archived" && !includeArchived) {
        continue;
      }

      if (options?.status && ref.status !== options.status) {
        continue;
      }

      if (options?.type && ref.type !== options.type) {
        continue;
      }

      const matchedKeywords: string[] = [];
      for (const term of queryTerms) {
        if (entry.keywords.includes(term)) {
          matchedKeywords.push(term);
        }
      }

      const score = matchedKeywords.length;
      if (score > 0) {
        results.push({
          referenceId: entry.referenceId,
          score,
          matchedKeywords,
        });
      }
    }

    results.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.referenceId.localeCompare(b.referenceId);
    });

    return results;
  }
}
