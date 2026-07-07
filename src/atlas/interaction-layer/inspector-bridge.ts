import type { VisualizationPayload, VisualEdge } from "../visualization-foundation/index.ts";
import { freezeInteraction } from "./immutability.ts";
import type { HitTarget, InspectorBridgeSnapshot, InspectorEntity, InspectorRelationship } from "./types.ts";

export function buildInspectorBridgeSnapshot(payload: VisualizationPayload, selected: HitTarget | null, focused: HitTarget | null): InspectorBridgeSnapshot {
  return freezeInteraction({
    selected: toInspectorEntity(payload, selected),
    focused: toInspectorEntity(payload, focused),
    metadata: {
      payloadId: payload.metadata.payloadId,
      projectionId: payload.metadata.projectionId,
      projectionKind: payload.metadata.projectionKind,
      generatedAt: payload.metadata.generatedAt,
    },
  }) as InspectorBridgeSnapshot;
}

function toInspectorEntity(payload: VisualizationPayload, target: HitTarget | null): InspectorEntity | null {
  if (!target || target.kind === "background") return null;
  if (target.kind === "node") {
    return {
      kind: "node",
      id: target.id,
      label: target.node.label,
      metadata: {
        visualId: target.node.visualId,
        family: target.node.family,
        type: target.node.type,
        importance: target.node.importance,
        hierarchyLevel: target.node.hierarchyLevel,
        lodLevel: target.node.lodLevel,
      },
      lineage: [`family:${target.node.family}`, `type:${target.node.type}`],
      relationships: relationshipsForNode(payload.edges, target.id),
    };
  }
  if (target.kind === "edge") {
    return {
      kind: "edge",
      id: target.id,
      label: target.edge.relationshipType,
      metadata: {
        source: target.edge.source,
        target: target.edge.target,
        relationshipType: target.edge.relationshipType,
        relationshipCategory: target.edge.relationshipCategory,
        importance: target.edge.importance,
        lodLevel: target.edge.lodLevel,
      },
      lineage: [`relationship:${target.edge.relationshipCategory}`, `type:${target.edge.relationshipType}`],
      relationships: [relationshipFromEdge(target.edge)],
    };
  }
  return {
    kind: "region",
    id: target.id,
    label: target.region.domain,
    metadata: {
      domain: target.region.domain,
      memberCount: target.region.members.length,
      importance: target.region.importance,
      dominantFamily: target.region.boundaryHints.dominantFamily,
      lodLevel: target.region.lodLevel,
    },
    lineage: [`domain:${target.region.domain}`, `family:${target.region.boundaryHints.dominantFamily}`],
    relationships: relationshipsForRegion(payload.edges, target.region.members),
  };
}

function relationshipsForNode(edges: readonly VisualEdge[], nodeId: string): readonly InspectorRelationship[] {
  return edges.filter((edge) => edge.source === nodeId || edge.target === nodeId).map(relationshipFromEdge);
}

function relationshipsForRegion(edges: readonly VisualEdge[], members: readonly string[]): readonly InspectorRelationship[] {
  const memberSet = new Set(members);
  return edges.filter((edge) => memberSet.has(edge.source) || memberSet.has(edge.target)).slice(0, 50).map(relationshipFromEdge);
}

function relationshipFromEdge(edge: VisualEdge): InspectorRelationship {
  return {
    edgeId: edge.edgeId,
    source: edge.source,
    target: edge.target,
    relationshipType: edge.relationshipType,
    relationshipCategory: edge.relationshipCategory,
    importance: edge.importance,
  };
}

