import type { ReferenceRegistry } from "../reference/ReferenceRegistry.ts";
import type { RetrievalIndexService } from "../index/RetrievalIndexService.ts";
import type { RelationshipGraph } from "../relationship/RelationshipGraph.ts";
import type {
  EvidenceCompilation,
  EvidenceConfidence,
  EvidenceReference,
  EvidenceRelationship,
} from "./EvidenceCompilation.ts";

export class EvidenceCompiler {
  private referenceRegistry: ReferenceRegistry;
  private retrievalIndexService: RetrievalIndexService;
  private relationshipGraph: RelationshipGraph;

  constructor(
    referenceRegistry: ReferenceRegistry,
    retrievalIndexService: RetrievalIndexService,
    relationshipGraph: RelationshipGraph
  ) {
    this.referenceRegistry = referenceRegistry;
    this.retrievalIndexService = retrievalIndexService;
    this.relationshipGraph = relationshipGraph;
  }

  async compileFromQuery(query: string): Promise<EvidenceCompilation> {
    if (!query || query.trim() === "") {
      throw new Error("Query cannot be empty.");
    }

    const searchResults = await this.retrievalIndexService.search(query);
    const matchedReferences: EvidenceReference[] = [];
    for (const res of searchResults) {
      try {
        const ref = await this.referenceRegistry.getReference(res.referenceId);
        matchedReferences.push({
          referenceId: ref.id,
          title: ref.title,
          type: ref.type,
          source: ref.source,
          status: ref.status,
        });
      } catch (err) {
        // Ignore missing reference details
      }
    }

    const relationshipMap = new Map<string, EvidenceRelationship>();
    for (const match of matchedReferences) {
      try {
        const rels = await this.relationshipGraph.traverseDirectConnections(match.referenceId);
        for (const rel of rels) {
          relationshipMap.set(rel.id, {
            relationshipId: rel.id,
            sourceReferenceId: rel.sourceReferenceId,
            targetReferenceId: rel.targetReferenceId,
            type: rel.type,
            context: rel.context,
            strength: rel.strength,
          });
        }
      } catch (err) {
        // Ignore missing relationship details
      }
    }
    const relationships = Array.from(relationshipMap.values());

    const matchedIds = new Set(matchedReferences.map((r) => r.referenceId));
    const relatedReferenceMap = new Map<string, EvidenceReference>();

    for (const rel of relationships) {
      const candidates = [rel.sourceReferenceId, rel.targetReferenceId];
      for (const id of candidates) {
        if (!matchedIds.has(id) && !relatedReferenceMap.has(id)) {
          try {
            const ref = await this.referenceRegistry.getReference(id);
            if (ref.status === "active") {
              relatedReferenceMap.set(id, {
                referenceId: ref.id,
                title: ref.title,
                type: ref.type,
                source: ref.source,
                status: ref.status,
              });
            }
          } catch (err) {
            // Ignore missing referenced references
          }
        }
      }
    }
    const relatedReferences = Array.from(relatedReferenceMap.values());

    let confidence: EvidenceConfidence = "low";
    if (matchedReferences.length >= 2 && relationships.length >= 1) {
      confidence = "high";
    } else if (matchedReferences.length >= 1) {
      confidence = "medium";
    }

    let summary = "";
    if (matchedReferences.length === 0) {
      summary = `No evidence was found for the query: "${query}".`;
    } else {
      summary = `Evidence compilation for query "${query}" retrieved ${matchedReferences.length} matched reference(s) and detected ${relationships.length} relationship(s) linking to ${relatedReferences.length} related reference(s). Confidence level is assessed as ${confidence}.`;
    }

    const id = `comp-query-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      id,
      mode: "query",
      input: query,
      matchedReferences,
      relatedReferences,
      relationships,
      confidence,
      summary,
      createdAt: new Date(),
    };
  }

  async compileFromReference(referenceId: string): Promise<EvidenceCompilation> {
    if (!referenceId || referenceId.trim() === "") {
      throw new Error("Reference ID cannot be empty.");
    }

    const seed = await this.referenceRegistry.getReference(referenceId);
    const matchedReferences: EvidenceReference[] = [
      {
        referenceId: seed.id,
        title: seed.title,
        type: seed.type,
        source: seed.source,
        status: seed.status,
      },
    ];

    const rels = await this.relationshipGraph.traverseDirectConnections(referenceId);
    const relationships = rels.map((rel) => ({
      relationshipId: rel.id,
      sourceReferenceId: rel.sourceReferenceId,
      targetReferenceId: rel.targetReferenceId,
      type: rel.type,
      context: rel.context,
      strength: rel.strength,
    }));

    const relatedReferenceMap = new Map<string, EvidenceReference>();
    for (const rel of relationships) {
      const candidates = [rel.sourceReferenceId, rel.targetReferenceId];
      for (const id of candidates) {
        if (id !== referenceId && !relatedReferenceMap.has(id)) {
          try {
            const ref = await this.referenceRegistry.getReference(id);
            if (ref.status === "active") {
              relatedReferenceMap.set(id, {
                referenceId: ref.id,
                title: ref.title,
                type: ref.type,
                source: ref.source,
                status: ref.status,
              });
            }
          } catch (err) {
            // Ignore missing related references
          }
        }
      }
    }
    const relatedReferences = Array.from(relatedReferenceMap.values());

    let confidence: EvidenceConfidence = "low";
    if (relationships.length >= 2) {
      confidence = "high";
    } else if (relationships.length === 1) {
      confidence = "medium";
    }

    const summary = `Evidence compilation using seed reference "${seed.title}" (${seed.id}) identified ${relationships.length} relationship(s) linking to ${relatedReferences.length} active related reference(s). Confidence level is assessed as ${confidence}.`;

    const id = `comp-ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      id,
      mode: "reference",
      input: referenceId,
      matchedReferences,
      relatedReferences,
      relationships,
      confidence,
      summary,
      createdAt: new Date(),
    };
  }
}
