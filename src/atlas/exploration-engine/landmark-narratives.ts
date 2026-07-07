import type { GraphSnapshot } from "../graph-foundation/index.ts";
import { DEPENDENCY_RELATIONSHIPS } from "../graph-foundation/canonical.ts";
import type { LandmarkNarrative } from "./types.ts";

const LANDMARK_DESCRIPTIONS: Record<string, { scientific: string; historical: string; structural: string }> = {
  "linear-algebra": {
    scientific: "The mathematical substrate for all vector-based computation in AI",
    historical: "Foundation laid by Gauss, Cayley, and Hamilton in the 19th century",
    structural: "Gateway node connecting mathematics to every downstream AI concept",
  },
  probability: {
    scientific: "Framework for reasoning under uncertainty in stochastic systems",
    historical: "Developed from gambling theory to the backbone of statistical learning",
    structural: "Bridge between pure mathematics and machine learning",
  },
  calculus: {
    scientific: "Mathematics of continuous change, enabling gradient-based optimization",
    historical: "Newton and Leibniz's 17th-century revolution in mathematical analysis",
    structural: "Direct prerequisite for all optimization and learning algorithms",
  },
  optimization: {
    scientific: "The objective-driven selection of parameters that minimize loss",
    historical: "From Lagrange multipliers to modern adaptive gradient methods",
    structural: "Central hub connecting mathematics to deep learning training",
  },
  "neural-network": {
    scientific: "Parameterized composition of differentiable layers trained from data",
    historical: "Inspired by biological neurons, revolutionized by backpropagation in the 1980s",
    structural: "Gateway to all deep learning architectures and methods",
  },
  transformer: {
    scientific: "Attention-based architecture for sequence and multimodal modeling",
    historical: "Introduced in 'Attention Is All You Need' (2017), now dominant architecture",
    structural: "Bridge connecting deep learning to NLP, LLMs, and vision transformers",
  },
  gpt: {
    scientific: "Autoregressive transformer decoder for language generation at scale",
    historical: "Evolved from GPT-1 to GPT-4, demonstrating emergent capabilities",
    structural: "Hub connecting transformers to LLM engineering and agents",
  },
  bert: {
    scientific: "Bidirectional encoder for deep contextual language understanding",
    historical: "Revolutionized NLP by enabling bidirectional pre-training (2018)",
    structural: "Bridge between transformers and modern NLP applications",
  },
  "image-classification": {
    scientific: "Visual recognition task assigning category labels to images",
    historical: "ImageNet challenge catalyzed the deep learning revolution (2012)",
    structural: "Gateway to all computer vision tasks and architectures",
  },
  python: {
    scientific: "The de facto language for AI experimentation and production",
    historical: "Rose to dominance alongside NumPy, scikit-learn, and PyTorch",
    structural: "Universal prerequisite for practical AI engineering",
  },
  pytorch: {
    scientific: "Deep learning framework for tensor computation and automatic differentiation",
    historical: "Meta's open-source framework now dominant in research and production",
    structural: "Bridge connecting programming to deep learning implementation",
  },
  deployment: {
    scientific: "The process of publishing models into executable production environments",
    historical: "From manual serving to automated ML pipelines and MLOps",
    structural: "Gateway connecting model development to production operations",
  },
  "fine-tuning": {
    scientific: "Adapting pretrained models to downstream domains with additional training",
    historical: "Enabled transfer learning revolution in NLP and vision",
    structural: "Bridge connecting foundation models to domain-specific applications",
  },
  reasoning: {
    scientific: "Structured inference over context, goals, and constraints",
    historical: "From symbolic AI to neural reasoning in modern agents",
    structural: "Foundation for all autonomous agent capabilities",
  },
};

export function buildLandmarkNarrative(snapshot: GraphSnapshot, nodeId: string): LandmarkNarrative | null {
  const node = snapshot.nodes.get(nodeId);
  if (!node) return null;

  const existing = LANDMARK_DESCRIPTIONS[node.id];

  const inDegree = snapshot.metrics.centrality[node.id]?.inDegree ?? 0;
  const outDegree = snapshot.metrics.centrality[node.id]?.outDegree ?? 0;
  const degree = snapshot.metrics.centrality[node.id]?.degree ?? 0;
  const totalNodes = snapshot.metrics.nodeCount;

  const dependencyCount = countDependencyEdges(snapshot, nodeId, "out");
  const dependentCount = countDependencyEdges(snapshot, nodeId, "in");

  const scientificRole = existing?.scientific ?? inferScientificRole(node.family, node.type, node.metadata.domain);
  const historicalImportance = existing?.historical ?? inferHistoricalImportance(node.metadata.importance, node.metadata.difficulty);
  const structuralImportance = existing?.structural ?? inferStructuralImportance(degree, totalNodes, node.metadata.domain);
  const dependencyImportance = inferDependencyImportance(dependencyCount, dependentCount);

  return {
    nodeId: node.id,
    label: node.name,
    scientificRole,
    historicalImportance,
    structuralImportance,
    dependencyImportance,
    domainContext: node.metadata.domain ?? "Unclassified",
  };
}

function countDependencyEdges(snapshot: GraphSnapshot, nodeId: string, direction: "in" | "out"): number {
  const edgeIds = direction === "out"
    ? snapshot.index.edgesBySource.get(nodeId)
    : snapshot.index.edgesByTarget.get(nodeId);
  let count = 0;
  for (const edgeId of edgeIds ?? []) {
    const edge = snapshot.edges.get(edgeId);
    if (edge && DEPENDENCY_RELATIONSHIPS.has(edge.type)) count += 1;
  }
  return count;
}

function inferScientificRole(family: string, type: string, domain: string | undefined): string {
  if (family === "scientific" && (type === "theory" || type === "principle" || type === "law")) {
    return `Theoretical foundation in ${domain ?? "AI"}`;
  }
  if (family === "scientific" && type === "method") {
    return `Scientific method central to ${domain ?? "AI"} research`;
  }
  if (family === "engineering" && (type === "architecture" || type === "framework")) {
    return `Engineering cornerstone enabling ${domain ?? "AI"} applications`;
  }
  if (family === "engineering" && type === "algorithm") {
    return `Core algorithm driving ${domain ?? "AI"} systems`;
  }
  return `Knowledge entity in the ${domain ?? "AI"} landscape`;
}

function inferHistoricalImportance(importance: number | undefined, difficulty: string | undefined): string {
  const imp = importance ?? 0.5;
  if (imp > 0.85) return "Foundational concept with deep historical roots";
  if (imp > 0.65) return "Structurally significant concept in the field's evolution";
  if (imp > 0.4) return "Supporting concept in the development of AI systems";
  return "Specialized concept in the modern AI landscape";
}

function inferStructuralImportance(degree: number, totalNodes: number, domain: string | undefined): string {
  const ratio = degree / Math.max(1, totalNodes);
  if (ratio > 0.15) return `Highly connected hub with ${degree} relationships across the graph`;
  if (ratio > 0.08) return `Important connector linking ${domain ?? "multiple"} concepts`;
  if (ratio > 0.03) return `Moderately connected entity within its region`;
  return `Focused concept with targeted connections`;
}

function inferDependencyImportance(dependencyCount: number, dependentCount: number): string {
  if (dependencyCount > 3 && dependentCount > 3) {
    return `Requires ${dependencyCount} concepts and unlocks ${dependentCount} downstream — a critical junction`;
  }
  if (dependentCount > 3) {
    return `Unlocks ${dependentCount} downstream concepts — a gateway in the knowledge chain`;
  }
  if (dependencyCount > 3) {
    return `Requires ${dependencyCount} prerequisites — a convergence point of knowledge`;
  }
  if (dependentCount > 0 && dependencyCount > 0) {
    return `Connects ${dependencyCount} prerequisites to ${dependentCount} downstream concepts`;
  }
  return "A standalone concept in the knowledge graph";
}
