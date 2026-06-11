export interface RetrievalIndexEntry {
  referenceId: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RetrievalSearchResult {
  referenceId: string;
  score: number;
  matchedKeywords: string[];
}

export interface RetrievalSearchOptions {
  includeArchived?: boolean;
  type?: string;
  status?: "active" | "archived";
}
