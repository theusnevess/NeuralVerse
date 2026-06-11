import type { RetrievalIndexEntry } from "./RetrievalIndex.ts";

export interface RetrievalIndexRepository {
  upsert(entry: RetrievalIndexEntry): Promise<RetrievalIndexEntry>;
  getByReferenceId(referenceId: string): Promise<RetrievalIndexEntry | null>;
  remove(referenceId: string): Promise<void>;
  list(): Promise<RetrievalIndexEntry[]>;
}
