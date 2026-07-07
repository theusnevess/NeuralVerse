import type { EntityFamily, EntityType, RelationshipCategory, RelationshipType } from "./types.ts";

export const ENTITY_TYPES_BY_FAMILY = {
  scientific: ["theory", "principle", "concept", "method", "phenomenon", "law", "hypothesis"],
  engineering: [
    "technique",
    "pattern",
    "architecture",
    "algorithm",
    "datastructure",
    "framework",
    "library",
    "api",
    "protocol",
    "convention",
    "tool",
  ],
  evidence: [
    "proof",
    "experiment",
    "observation",
    "casestudy",
    "benchmark",
    "comparison",
    "analysis",
    "evaluation",
    "validation",
    "verification",
    "audit",
    "review",
    "citation",
  ],
  context: ["problem", "task", "constraint", "goal", "assumption"],
} as const satisfies Record<EntityFamily, readonly EntityType[]>;

export const ENTITY_FAMILY_BY_TYPE = Object.fromEntries(
  Object.entries(ENTITY_TYPES_BY_FAMILY).flatMap(([family, types]) => types.map((type) => [type, family])),
) as Record<EntityType, EntityFamily>;

export const RELATIONSHIP_TYPES_BY_CATEGORY = {
  epistemic: [
    "requires",
    "enables",
    "contradicts",
    "refines",
    "generalizes",
    "specializes",
    "composes",
    "decomposes",
    "depends_on",
    "influences",
  ],
  structural: ["implements", "realizes", "constrains", "extends"],
  pedagogical: ["teaches", "demonstrates", "assesses", "builds_on"],
  engineering: ["uses", "configures", "deploys", "monitors", "optimizes", "replaces"],
  evidentiary: ["supports", "refutes", "measures", "benchmarks"],
  temporal: ["precedes", "follows", "evolves_to", "supersedes"],
  inferential: ["implies", "suggests", "contradicts_evidence", "supports_evidence", "questions"],
} as const satisfies Record<RelationshipCategory, readonly RelationshipType[]>;

export const RELATIONSHIP_CATEGORY_BY_TYPE = Object.fromEntries(
  Object.entries(RELATIONSHIP_TYPES_BY_CATEGORY).flatMap(([category, types]) => types.map((type) => [type, category])),
) as Record<RelationshipType, RelationshipCategory>;

export const TRANSITIVE_RELATIONSHIPS = new Set<RelationshipType>([
  "requires",
  "depends_on",
  "generalizes",
  "specializes",
  "precedes",
  "follows",
  "evolves_to",
]);

export const DEPENDENCY_RELATIONSHIPS = new Set<RelationshipType>(["requires", "depends_on", "implements", "uses", "builds_on"]);
export const HIERARCHY_RELATIONSHIPS = new Set<RelationshipType>(["generalizes", "specializes", "composes", "decomposes"]);

export const RELATIONSHIP_FAMILY_RULES: Partial<Record<RelationshipType, { source: EntityFamily[]; target: EntityFamily[] }>> = {
  implements: { source: ["engineering"], target: ["scientific"] },
  realizes: { source: ["engineering"], target: ["scientific"] },
  constrains: { source: ["engineering"], target: ["engineering"] },
  extends: { source: ["engineering"], target: ["engineering"] },
  uses: { source: ["engineering"], target: ["engineering"] },
  configures: { source: ["engineering"], target: ["engineering"] },
  deploys: { source: ["engineering"], target: ["engineering"] },
  monitors: { source: ["engineering"], target: ["engineering"] },
  optimizes: { source: ["engineering"], target: ["engineering"] },
  replaces: { source: ["engineering"], target: ["engineering"] },
  supports: { source: ["evidence"], target: ["scientific", "engineering", "context"] },
  refutes: { source: ["evidence"], target: ["scientific", "engineering", "context"] },
  measures: { source: ["evidence"], target: ["engineering"] },
  benchmarks: { source: ["evidence"], target: ["engineering"] },
  contradicts_evidence: { source: ["evidence"], target: ["evidence"] },
  supports_evidence: { source: ["evidence"], target: ["evidence"] },
};

export const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
