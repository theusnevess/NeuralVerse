import type { GraphProjection, GraphSnapshot, KnowledgeEdge, KnowledgeNode } from "../../graph-foundation/index.ts";
import { buildIndex, computeMetrics } from "../../graph-foundation/foundation.ts";
import type { PathologicalGraphSpec } from "./types.ts";

const STRESS_DATE = "2026-07-05T00:00:00.000Z";

export const STRESS_PROFILES: readonly PathologicalGraphSpec[] = [
  { id: "giant-hub", kind: "giant-hub", nodeCount: 600, edgeCount: 1200, parameters: { hubDegree: 0.7 } },
  { id: "fully-connected", kind: "fully-connected", nodeCount: 60, edgeCount: 1770, parameters: {} },
  { id: "long-chain", kind: "long-chain", nodeCount: 500, edgeCount: 499, parameters: { chainLength: 500 } },
  { id: "star", kind: "star", nodeCount: 400, edgeCount: 399, parameters: { starArms: 399 } },
  { id: "ring", kind: "ring", nodeCount: 400, edgeCount: 400, parameters: { ringNodes: 400 } },
  { id: "deep-hierarchy", kind: "deep-hierarchy", nodeCount: 300, edgeCount: 299, parameters: { depth: 299 } },
  { id: "extreme-bridge", kind: "extreme-bridge", nodeCount: 200, edgeCount: 240, parameters: { bridgeBottleneck: 1 } },
  { id: "isolated-islands", kind: "isolated-islands", nodeCount: 240, edgeCount: 320, parameters: { islands: 12 } },
  { id: "dense-curriculum", kind: "dense-curriculum", nodeCount: 360, edgeCount: 1800, parameters: { density: 0.028 } },
  { id: "mixed-ontology", kind: "mixed-ontology", nodeCount: 400, edgeCount: 1400, parameters: { domainCount: 8 } },
];

export interface PathologicalGraph {
  readonly spec: PathologicalGraphSpec;
  readonly snapshot: GraphSnapshot;
  readonly projection: GraphProjection;
}

export function generatePathologicalGraph(spec: PathologicalGraphSpec): PathologicalGraph {
  let nodes: KnowledgeNode[] = [];
  let edges: KnowledgeEdge[] = [];
  switch (spec.kind) {
    case "giant-hub":
      ({ nodes, edges } = generateGiantHub(spec));
      break;
    case "fully-connected":
      ({ nodes, edges } = generateFullyConnected(spec));
      break;
    case "long-chain":
      ({ nodes, edges } = generateLongChain(spec));
      break;
    case "star":
      ({ nodes, edges } = generateStar(spec));
      break;
    case "ring":
      ({ nodes, edges } = generateRing(spec));
      break;
    case "deep-hierarchy":
      ({ nodes, edges } = generateDeepHierarchy(spec));
      break;
    case "extreme-bridge":
      ({ nodes, edges } = generateExtremeBridge(spec));
      break;
    case "isolated-islands":
      ({ nodes, edges } = generateIsolatedIslands(spec));
      break;
    case "dense-curriculum":
      ({ nodes, edges } = generateDenseCurriculum(spec));
      break;
    case "mixed-ontology":
      ({ nodes, edges } = generateMixedOntology(spec));
      break;
  }
  return { spec, ...compileGraph(spec, nodes, edges) };
}

function generateGiantHub(spec: PathologicalGraphSpec): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  const hub = syntheticNode("hub-0", "Hub", 1);
  nodes.push(hub);
  for (let i = 1; i < spec.nodeCount; i += 1) {
    const node = syntheticNode(`hub-spoke-${i}`, `Hub Spoke ${i}`, 0.4 + (i % 5) * 0.1);
    nodes.push(node);
    edges.push(syntheticEdge(`hub-edge-${i}`, hub.id, node.id, "uses"));
  }
  for (let i = 1; i < spec.nodeCount; i += 1) {
    const a = nodes[i]!;
    const b = nodes[((i + 7) % (spec.nodeCount - 1)) + 1]!;
    if (a.id === b.id) continue;
    edges.push(syntheticEdge(`hub-cross-${i}`, a.id, b.id, "influences"));
  }
  return { nodes, edges: edges.slice(0, spec.edgeCount) };
}

function generateFullyConnected(spec: PathologicalGraphSpec): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  for (let i = 0; i < spec.nodeCount; i += 1) {
    nodes.push(syntheticNode(`clique-${i}`, `Clique ${i}`, 0.4));
  }
  for (let i = 0; i < spec.nodeCount; i += 1) {
    for (let j = i + 1; j < spec.nodeCount; j += 1) {
      edges.push(syntheticEdge(`clique-${i}-${j}`, nodes[i]!.id, nodes[j]!.id, "influences"));
    }
  }
  return { nodes, edges: edges.slice(0, spec.edgeCount) };
}

function generateLongChain(spec: PathologicalGraphSpec): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  for (let i = 0; i < spec.nodeCount; i += 1) {
    nodes.push(syntheticNode(`chain-${i}`, `Chain ${i}`, 0.3));
  }
  for (let i = 0; i < spec.nodeCount - 1; i += 1) {
    edges.push(syntheticEdge(`chain-${i}-${i + 1}`, nodes[i]!.id, nodes[i + 1]!.id, "requires"));
  }
  return { nodes, edges };
}

function generateStar(spec: PathologicalGraphSpec): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  const center = syntheticNode("star-center", "Star Center", 1);
  nodes.push(center);
  for (let i = 1; i < spec.nodeCount; i += 1) {
    const leaf = syntheticNode(`star-leaf-${i}`, `Star Leaf ${i}`, 0.2);
    nodes.push(leaf);
    edges.push(syntheticEdge(`star-edge-${i}`, center.id, leaf.id, "uses"));
  }
  return { nodes, edges };
}

function generateRing(spec: PathologicalGraphSpec): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  for (let i = 0; i < spec.nodeCount; i += 1) {
    nodes.push(syntheticNode(`ring-${i}`, `Ring ${i}`, 0.3));
  }
  for (let i = 0; i < spec.nodeCount; i += 1) {
    const target = nodes[(i + 1) % spec.nodeCount]!;
    edges.push(syntheticEdge(`ring-${i}-${(i + 1) % spec.nodeCount}`, nodes[i]!.id, target.id, "influences"));
  }
  return { nodes, edges };
}

function generateDeepHierarchy(spec: PathologicalGraphSpec): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  for (let i = 0; i < spec.nodeCount; i += 1) {
    nodes.push(syntheticNode(`depth-${i}`, `Depth ${i}`, Math.max(0.1, 1 - i / spec.nodeCount)));
  }
  for (let i = 0; i < spec.nodeCount - 1; i += 1) {
    edges.push(syntheticEdge(`depth-${i}-${i + 1}`, nodes[i]!.id, nodes[i + 1]!.id, "generalizes"));
  }
  return { nodes, edges };
}

function generateExtremeBridge(spec: PathologicalGraphSpec): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  const halfA = Math.floor(spec.nodeCount / 2);
  const halfB = spec.nodeCount - halfA;
  for (let i = 0; i < halfA; i += 1) {
    const node = syntheticNode(`bridge-a-${i}`, `Bridge A ${i}`, 0.5);
    nodes.push(node);
  }
  for (let i = 0; i < halfB; i += 1) {
    const node = syntheticNode(`bridge-b-${i}`, `Bridge B ${i}`, 0.5);
    nodes.push(node);
  }
  for (let i = 0; i < halfA; i += 1) {
    const target = nodes[halfA + (i % halfB)]!;
    edges.push(syntheticEdge(`bridge-link-${i}`, nodes[i]!.id, target.id, "uses"));
  }
  for (let i = 0; i < halfA - 1; i += 1) {
    edges.push(syntheticEdge(`bridge-chain-${i}`, nodes[i]!.id, nodes[i + 1]!.id, "influences"));
  }
  for (let i = halfA; i < nodes.length - 1; i += 1) {
    edges.push(syntheticEdge(`bridge-chain-${i}`, nodes[i]!.id, nodes[i + 1]!.id, "influences"));
  }
  return { nodes, edges: edges.slice(0, spec.edgeCount) };
}

function generateIsolatedIslands(spec: PathologicalGraphSpec): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const islands = Math.max(2, Math.floor(spec.parameters.islands ?? 4));
  const perIsland = Math.floor(spec.nodeCount / islands);
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  for (let island = 0; island < islands; island += 1) {
    const islandNodes: KnowledgeNode[] = [];
    for (let i = 0; i < perIsland; i += 1) {
      const node = syntheticNode(`island-${island}-${i}`, `Island ${island} node ${i}`, 0.3);
      islandNodes.push(node);
    }
    for (let i = 0; i < islandNodes.length - 1; i += 1) {
      edges.push(syntheticEdge(`island-${island}-${i}-${i + 1}`, islandNodes[i]!.id, islandNodes[i + 1]!.id, "influences"));
    }
    nodes.push(...islandNodes);
  }
  return { nodes, edges: edges.slice(0, spec.edgeCount) };
}

function generateDenseCurriculum(spec: PathologicalGraphSpec): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const density = spec.parameters.density ?? 0.02;
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  for (let i = 0; i < spec.nodeCount; i += 1) {
    nodes.push(syntheticNode(`dense-${i}`, `Dense ${i}`, 0.4));
  }
  for (let i = 0; i < spec.nodeCount; i += 1) {
    for (let j = i + 1; j < spec.nodeCount; j += 1) {
      if ((i * 31 + j * 17) % 1000 < density * 1000) {
        edges.push(syntheticEdge(`dense-${i}-${j}`, nodes[i]!.id, nodes[j]!.id, "teaches"));
      }
    }
  }
  return { nodes, edges: edges.slice(0, spec.edgeCount) };
}

function generateMixedOntology(spec: PathologicalGraphSpec): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const domains = Math.max(2, Math.floor(spec.parameters.domainCount ?? 4));
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  for (let i = 0; i < spec.nodeCount; i += 1) {
    const node = syntheticNode(`mixed-${i}`, `Mixed ${i}`, 0.4, `Domain ${i % domains}`);
    nodes.push(node);
  }
  for (let i = 0; i < spec.nodeCount; i += 1) {
    for (let j = i + 1; j < spec.nodeCount; j += 1) {
      const sameDomain = nodes[i]!.metadata.domain === nodes[j]!.metadata.domain;
      if (sameDomain) edges.push(syntheticEdge(`mixed-${i}-${j}`, nodes[i]!.id, nodes[j]!.id, "composes"));
      else if (i % 4 === 0) edges.push(syntheticEdge(`mixed-${i}-${j}`, nodes[i]!.id, nodes[j]!.id, "implements"));
    }
  }
  return { nodes, edges: edges.slice(0, spec.edgeCount) };
}

function syntheticNode(id: string, name: string, importance: number, domain = "Stress"): KnowledgeNode {
  return {
    id: deterministicId(id),
    type: "concept",
    family: "scientific",
    name,
    description: `Stress graph ${name}`,
    metadata: { domain, importance: round(importance, 3), confidence: 0.7, evidenceCount: 1 },
    versions: [{ id: deterministicId(`ver-${id}`), version: 1, changes: ["stress"], author: "stress", timestamp: STRESS_DATE, reason: "stress", snapshot: { id: deterministicId(id) } }],
    createdAt: STRESS_DATE,
    updatedAt: STRESS_DATE,
    status: "active",
  };
}

function syntheticEdge(id: string, source: string, target: string, type: KnowledgeEdge["type"]): KnowledgeEdge {
  return {
    id: deterministicId(id),
    source: deterministicId(source),
    target: deterministicId(target),
    type,
    category: "epistemic",
    metadata: {
      weight: 0.6,
      confidence: 0.7,
      evidenceCount: 1,
      canonicalStatus: "canonical",
      temporal: { createdAt: STRESS_DATE, updatedAt: STRESS_DATE, expiresAt: null },
      sourceEvidence: [],
      direction: "directed",
      transitive: false,
      multiplicity: "many-to-many",
    },
    createdAt: STRESS_DATE,
    updatedAt: STRESS_DATE,
    status: "active",
  };
}

function compileGraph(spec: PathologicalGraphSpec, nodes: KnowledgeNode[], edges: KnowledgeEdge[]): { snapshot: GraphSnapshot; projection: GraphProjection } {
  const trimmedEdges = edges.slice(0, spec.edgeCount);
  const index = buildIndex(nodes, trimmedEdges);
  const metrics = computeMetrics(nodes, trimmedEdges, index);
  const snapshot: GraphSnapshot = {
    id: `stress-${spec.id}`,
    version: "stress",
    checksum: `stress-checksum-${spec.id}`,
    createdAt: STRESS_DATE,
    nodes: new Map(nodes.map((node) => [node.id, node])),
    edges: new Map(trimmedEdges.map((edge) => [edge.id, edge])),
    index,
    metrics,
    metadata: {
      id: `stress-${spec.id}`,
      version: "stress",
      lastUpdated: STRESS_DATE,
      nodeCount: nodes.length,
      edgeCount: trimmedEdges.length,
      domainDistribution: countBy(nodes.map((node) => node.metadata.domain ?? "Stress")),
      familyDistribution: { scientific: nodes.length, engineering: 0, evidence: 0, context: 0 },
      relationshipDistribution: { epistemic: trimmedEdges.length, structural: 0, pedagogical: 0, engineering: 0, evidentiary: 0, temporal: 0, inferential: 0 },
    },
  };
  const projection: GraphProjection = {
    id: `stress-projection-${spec.id}`,
    snapshotId: snapshot.id,
    kind: "topology",
    request: { kind: "topology" },
    nodeIds: nodes.map((node) => node.id),
    edgeIds: trimmedEdges.map((edge) => edge.id),
    metrics,
    metadata: { nodeCount: nodes.length, edgeCount: trimmedEdges.length, density: metrics.density, checksum: "stress", generatedAt: STRESS_DATE },
  };
  return { snapshot, projection };
}

function deterministicId(label: string): string {
  let hash = 2166136261;
  for (let i = 0; i < label.length; i += 1) {
    hash ^= label.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `00000000-0000-4000-8000-${hex}00000000`;
}

function countBy(values: readonly string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const value of values) result[value] = (result[value] ?? 0) + 1;
  return result;
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
