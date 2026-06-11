export interface Relationship {
  id: string;
  sourceReferenceId: string;
  targetReferenceId: string;
  type: string;
  context?: string;
  strength?: number;
  createdAt: Date;
  updatedAt: Date;
}
