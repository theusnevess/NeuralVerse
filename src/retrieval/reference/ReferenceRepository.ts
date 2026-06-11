import type { Reference } from "./Reference.ts";

export interface ReferenceRepository {
  create(reference: Reference): Promise<Reference>;
  update(reference: Reference): Promise<Reference>;
  getById(id: string): Promise<Reference | null>;
  list(): Promise<Reference[]>;
  archive(id: string): Promise<Reference>;
}
