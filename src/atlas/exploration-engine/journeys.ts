import type { ExplorationJourney, ExplorationStep } from "./types.ts";

export const CANONICAL_JOURNEYS: readonly ExplorationJourney[] = [
  {
    id: "journey-introduction-to-ai",
    name: "Introduction to AI Engineering",
    description: "A foundational path from mathematics through machine learning to deep learning fundamentals.",
    tags: ["beginner", "foundations", "mathematics", "machine-learning"],
    steps: [
      step("linear-algebra", "Linear Algebra", "Mathematics", "foundation"),
      step("probability", "Probability", "Statistics", "foundation"),
      step("calculus", "Calculus", "Mathematics", "foundation"),
      step("optimization", "Optimization", "Mathematics", "method"),
      step("statistics", "Statistics", "Statistics", "foundation"),
      step("supervised-learning", "Supervised Learning", "Machine Learning", "method"),
      step("neural-network", "Neural Network", "Deep Learning", "method"),
      step("backpropagation", "Backpropagation", "Deep Learning", "method"),
      step("python", "Python", "Programming", "foundation"),
      step("pytorch", "PyTorch", "Programming", "bridge"),
    ],
  },
  {
    id: "journey-deep-learning-fundamentals",
    name: "Deep Learning Fundamentals",
    description: "From neural network basics through architectures to modern deep learning techniques.",
    tags: ["intermediate", "deep-learning", "architectures"],
    steps: [
      step("neural-network", "Neural Network", "Deep Learning", "foundation"),
      step("mlp", "MLP", "Deep Learning", "method"),
      step("backpropagation", "Backpropagation", "Deep Learning", "method"),
      step("optimization", "Optimization", "Mathematics", "method"),
      step("sgd", "Stochastic Gradient Descent", "Machine Learning", "method"),
      step("adam", "Adam", "Deep Learning", "method"),
      step("normalization", "Normalization", "Deep Learning", "method"),
      step("dropout", "Dropout", "Deep Learning", "method"),
      step("residual-connections", "Residual Connections", "Deep Learning", "method"),
      step("cnn", "CNN", "Computer Vision", "specialization"),
      step("rnn", "RNN", "Deep Learning", "specialization"),
      step("transformer", "Transformer", "LLMs", "specialization"),
    ],
  },
  {
    id: "journey-computer-vision",
    name: "Computer Vision Path",
    description: "From image classification foundations to advanced detection and segmentation.",
    tags: ["intermediate", "computer-vision", "detection", "segmentation"],
    steps: [
      step("linear-algebra", "Linear Algebra", "Mathematics", "foundation"),
      step("neural-network", "Neural Network", "Deep Learning", "foundation"),
      step("cnn", "CNN", "Computer Vision", "method"),
      step("image-classification", "Image Classification", "Computer Vision", "method"),
      step("object-detection", "Object Detection", "Computer Vision", "method"),
      step("segmentation", "Segmentation", "Computer Vision", "specialization"),
      step("yolo", "YOLO", "Computer Vision", "application"),
      step("tracking", "Tracking", "Computer Vision", "specialization"),
      step("pose-estimation", "Pose Estimation", "Computer Vision", "specialization"),
      step("depth-estimation", "Depth Estimation", "Computer Vision", "specialization"),
    ],
  },
  {
    id: "journey-nlp-transformers",
    name: "NLP & Transformers",
    description: "From tokenization and embeddings through transformer architectures to modern NLP.",
    tags: ["advanced", "nlp", "transformers", "embeddings"],
    steps: [
      step("tokenization", "Tokenization", "NLP", "foundation"),
      step("embedding", "Embedding", "NLP", "foundation"),
      step("word2vec", "Word2Vec", "NLP", "method"),
      step("attention", "Attention", "Deep Learning", "method"),
      step("transformer", "Transformer", "LLMs", "method"),
      step("bert", "BERT", "NLP", "application"),
      step("gpt", "GPT", "LLMs", "application"),
      step("t5", "T5", "NLP", "application"),
      step("semantic-search", "Semantic Search", "NLP", "application"),
      step("rag", "RAG", "LLMs", "application"),
    ],
  },
  {
    id: "journey-llm-engineering",
    name: "LLM Engineering",
    description: "From transformer foundations through fine-tuning and alignment to production deployment.",
    tags: ["advanced", "llms", "fine-tuning", "deployment"],
    steps: [
      step("transformer", "Transformer", "LLMs", "foundation"),
      step("gpt", "GPT", "LLMs", "foundation"),
      step("prompt-engineering", "Prompt Engineering", "LLMs", "method"),
      step("fine-tuning", "Fine Tuning", "LLM Engineering", "method"),
      step("lora", "LoRA", "LLM Engineering", "method"),
      step("qlora", "QLoRA", "LLM Engineering", "method"),
      step("rlhf", "RLHF", "LLM Engineering", "method"),
      step("dpo", "DPO", "LLM Engineering", "method"),
      step("llm-inference", "LLM Inference", "LLM Engineering", "application"),
      step("quantization", "Quantization", "LLM Engineering", "method"),
      step("kv-cache", "KV Cache", "LLM Engineering", "application"),
    ],
  },
  {
    id: "journey-agents",
    name: "AI Agents & Autonomy",
    description: "From reasoning fundamentals through tool use to multi-agent orchestration.",
    tags: ["advanced", "agents", "reasoning", "orchestration"],
    steps: [
      step("reasoning", "Reasoning", "Agents", "foundation"),
      step("planning", "Planning", "Agents", "method"),
      step("agent-memory", "Agent Memory", "Agents", "method"),
      step("tool-use", "Tool Use", "Agents", "method"),
      step("reflection", "Reflection", "Agents", "method"),
      step("agent-workflow", "Agent Workflow", "Agents", "application"),
      step("mcp", "MCP", "Agents", "application"),
      step("multi-agent", "Multi-Agent System", "Agents", "application"),
      step("autonomy", "Autonomy", "Agents", "specialization"),
    ],
  },
  {
    id: "journey-mlops",
    name: "MLOps & Production",
    description: "From experiment tracking through deployment to production monitoring.",
    tags: ["intermediate", "mlops", "deployment", "monitoring"],
    steps: [
      step("python", "Python", "Programming", "foundation"),
      step("versioning", "Versioning", "MLOps", "foundation"),
      step("experiment-tracking", "Experiment Tracking", "MLOps", "method"),
      step("mlflow", "MLflow", "MLOps", "application"),
      step("model-registry", "Model Registry", "MLOps", "application"),
      step("deployment", "Deployment", "MLOps", "method"),
      step("serving", "Serving", "MLOps", "application"),
      step("monitoring", "Monitoring", "MLOps", "method"),
      step("data-drift", "Data Drift", "MLOps", "specialization"),
      step("cicd", "CI/CD", "MLOps", "application"),
    ],
  },
  {
    id: "journey-practical-engineering",
    name: "Practical AI Engineering",
    description: "From programming foundations through frameworks to production systems.",
    tags: ["beginner", "programming", "frameworks", "practical"],
    steps: [
      step("python", "Python", "Programming", "foundation"),
      step("data-structures", "Data Structures", "Programming", "foundation"),
      step("algorithmic-complexity", "Algorithmic Complexity", "Programming", "foundation"),
      step("pytorch", "PyTorch", "Programming", "method"),
      step("tensorflow", "TensorFlow", "Programming", "method"),
      step("scikit-learn", "scikit-learn", "Machine Learning", "application"),
      step("cuda", "CUDA", "Programming", "specialization"),
      step("deployment", "Deployment", "MLOps", "application"),
    ],
  },
];

function step(nodeId: string, label: string, domain: string, role: ExplorationStep["role"]): ExplorationStep {
  return { nodeId, label, domain, role, isOptional: false };
}

export function findJourneysForNode(nodeId: string): readonly ExplorationJourney[] {
  return CANONICAL_JOURNEYS.filter((journey) => journey.steps.some((step) => step.nodeId === nodeId));
}

export function findBestJourneyForNode(nodeId: string): ExplorationJourney | null {
  const matching = findJourneysForNode(nodeId);
  if (matching.length === 0) return null;
  return matching.reduce((best, journey) => {
    const bestIndex = best.steps.findIndex((s) => s.nodeId === nodeId);
    const currentIndex = journey.steps.findIndex((s) => s.nodeId === nodeId);
    const bestDistance = Math.min(bestIndex, best.steps.length - 1 - bestIndex);
    const currentDistance = Math.min(currentIndex, journey.steps.length - 1 - currentIndex);
    return currentDistance < bestDistance ? journey : best;
  });
}
