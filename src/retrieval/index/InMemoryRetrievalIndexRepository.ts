import type { RetrievalIndexEntry } from "./RetrievalIndex.ts";
import type { RetrievalIndexRepository } from "./RetrievalIndexRepository.ts";

export class InMemoryRetrievalIndexRepository implements RetrievalIndexRepository {
  private entries: Map<string, RetrievalIndexEntry> = new Map();

  async upsert(entry: RetrievalIndexEntry): Promise<RetrievalIndexEntry> {
    const clone = { ...entry, keywords: [...entry.keywords] };
    this.entries.set(clone.referenceId, clone);
    return { ...clone, keywords: [...clone.keywords] };
  }

  async getByReferenceId(referenceId: string): Promise<RetrievalIndexEntry | null> {
    const entry = this.entries.get(referenceId);
    if (!entry) return null;
    return { ...entry, keywords: [...entry.keywords] };
  }

  async remove(referenceId: string): Promise<void> {
    if (!this.entries.has(referenceId)) {
      throw new Error(`Index entry not found for reference ID: ${referenceId}`);
    }
    this.entries.delete(referenceId);
  }

  async list(): Promise<RetrievalIndexEntry[]> {
    return Array.from(this.entries.values()).map((entry) => ({
      ...entry,
      keywords: [...entry.keywords],
    }));
  }
}
