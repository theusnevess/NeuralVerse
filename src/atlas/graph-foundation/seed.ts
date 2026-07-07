import { RELATIONSHIP_CATEGORY_BY_TYPE, TRANSITIVE_RELATIONSHIPS } from "./canonical.ts";
import { GraphSource } from "./foundation.ts";
import type { EdgeMetadata, EntityFamily, EntityType, KnowledgeEdge, KnowledgeNode, RelationshipType } from "./types.ts";

const timestamp = "2026-07-05T00:00:00.000Z";

interface SeedNodeDefinition {
  key: string;
  type: EntityType;
  family: EntityFamily;
  name: string;
  description: string;
  domain: string;
  tags: string[];
  difficulty: KnowledgeNode["metadata"]["difficulty"];
  metadata?: KnowledgeNode["metadata"];
  aliases?: string[];
  references?: string[];
}

interface SeedEdgeDefinition {
  source: string;
  target: string;
  type: RelationshipType;
  weight?: number;
}

const nodeDefinitions: SeedNodeDefinition[] = [
  concept("linear-algebra", "Linear Algebra", "Vector spaces, linear maps and matrix operations forming the mathematical substrate of modern AI.", "Mathematics", ["vectors", "matrices"], "beginner", ["matrix algebra"], ["Gilbert Strang, Introduction to Linear Algebra"]),
  concept("vectors", "Vectors", "Ordered numerical objects representing points, directions, embeddings and model parameters.", "Mathematics", ["geometry", "embeddings"], "beginner"),
  concept("matrices", "Matrices", "Rectangular arrays encoding linear transformations, batched features and learned weights.", "Mathematics", ["linear-transform", "weights"], "beginner"),
  concept("matrix-multiplication", "Matrix Multiplication", "Compositional operation at the core of dense layers, attention and GPU-accelerated inference.", "Mathematics", ["gemm", "linear-algebra"], "intermediate", ["GEMM"]),
  concept("eigenvalues", "Eigenvalues", "Scalars describing invariant scaling factors of linear transformations.", "Mathematics", ["spectral-analysis"], "intermediate"),
  concept("eigenvectors", "Eigenvectors", "Directions preserved by a linear transformation up to scalar multiplication.", "Mathematics", ["spectral-analysis"], "intermediate"),
  concept("tensor", "Tensor", "Multidimensional numerical array used as the standard data representation in deep learning systems.", "Mathematics", ["array", "deep-learning"], "beginner"),
  concept("norm", "Norm", "Function measuring vector or tensor magnitude for regularization, optimization and similarity.", "Mathematics", ["regularization", "distance"], "beginner"),
  concept("gradient", "Gradient", "Vector of partial derivatives indicating steepest local increase of a scalar objective.", "Calculus", ["derivative", "optimization"], "beginner"),
  concept("jacobian", "Jacobian", "Matrix of first-order partial derivatives for vector-valued functions.", "Calculus", ["derivative", "autodiff"], "advanced"),
  concept("hessian", "Hessian", "Matrix of second-order derivatives used to analyze curvature and optimization dynamics.", "Calculus", ["curvature", "optimization"], "advanced"),
  method("optimization", "Optimization", "Selection of model parameters that minimize or maximize an objective under constraints.", "Mathematics", ["objective", "training"], "intermediate"),
  concept("probability", "Probability", "Mathematical framework for uncertainty, stochastic processes and statistical learning.", "Statistics", ["uncertainty"], "beginner", ["probability theory"], ["Kevin Murphy, Probabilistic Machine Learning"]),
  concept("statistics", "Statistics", "Methods for estimating, testing and reasoning from sampled data.", "Statistics", ["inference", "estimation"], "beginner"),
  concept("calculus", "Calculus", "Study of continuous change underpinning gradients, optimization and differential models.", "Mathematics", ["derivatives", "integrals"], "beginner"),
  concept("bias", "Bias", "Systematic error from simplifying assumptions or non-representative data.", "Machine Learning", ["generalization", "error"], "intermediate"),
  concept("variance", "Variance", "Sensitivity of a model to changes in training data and sampling noise.", "Machine Learning", ["generalization", "error"], "intermediate"),

  engineering("python", "Python", "General-purpose language widely used for AI experimentation, data processing and model serving.", "Programming", "tool", ["language", "ml"], "beginner", { module: "programming" }, ["Python 3"]),
  engineering("cpp", "C++", "Systems programming language used for high-performance runtimes, kernels and inference infrastructure.", "Programming", "tool", ["language", "systems"], "advanced", { module: "programming" }, ["C++"]),
  engineering("rust", "Rust", "Memory-safe systems language used for reliable infrastructure and high-performance AI tooling.", "Programming", "tool", ["language", "systems"], "advanced", { module: "programming" }),
  engineering("cuda", "CUDA", "NVIDIA parallel programming platform for GPU acceleration of tensor operations and kernels.", "Programming", "framework", ["gpu", "parallel-computing"], "advanced", { module: "acceleration" }, ["CUDA Toolkit"]),
  engineering("gpu-memory", "GPU Memory", "Device memory hierarchy and bandwidth constraints shaping training and inference performance.", "Programming", "datastructure", ["memory", "gpu"], "advanced", { module: "acceleration" }),
  engineering("concurrency", "Concurrency", "Execution model for overlapping tasks, IO and parallel work in AI systems.", "Programming", "technique", ["parallelism", "systems"], "intermediate"),
  engineering("algorithmic-complexity", "Algorithmic Complexity", "Asymptotic analysis of computational cost and scalability.", "Programming", "technique", ["big-o", "performance"], "intermediate"),
  engineering("serialization", "Serialization", "Encoding structured data for storage, transport and reproducible artifacts.", "Programming", "technique", ["json", "protobuf"], "beginner"),
  engineering("data-structures", "Data Structures", "Organized representations enabling efficient access, mutation and traversal.", "Programming", "datastructure", ["arrays", "graphs"], "beginner"),

  concept("supervised-learning", "Supervised Learning", "Learning from labeled examples to predict targets for new inputs.", "Machine Learning", ["labels", "prediction"], "beginner", [], ["Bishop, Pattern Recognition and Machine Learning"]),
  concept("unsupervised-learning", "Unsupervised Learning", "Learning structure from unlabeled data through density, compression or grouping objectives.", "Machine Learning", ["unlabeled", "structure"], "beginner"),
  concept("semi-supervised-learning", "Semi-Supervised Learning", "Learning from a mixture of labeled and unlabeled examples.", "Machine Learning", ["labels", "unlabeled"], "intermediate"),
  concept("self-supervised-learning", "Self-Supervised Learning", "Learning representations from prediction tasks derived from the data itself.", "Machine Learning", ["representation-learning"], "intermediate"),
  method("regression", "Regression", "Predictive modeling of continuous target variables.", "Machine Learning", ["prediction", "continuous"], "beginner"),
  method("classification", "Classification", "Predictive modeling of discrete classes or labels.", "Machine Learning", ["prediction", "labels"], "beginner"),
  method("clustering", "Clustering", "Grouping examples by similarity without explicit labels.", "Machine Learning", ["unsupervised", "similarity"], "beginner"),
  method("feature-engineering", "Feature Engineering", "Design and transformation of input variables to improve model performance.", "Machine Learning", ["features", "preprocessing"], "beginner"),
  concept("evaluation-metrics", "Evaluation Metrics", "Quantitative measures for assessing model quality and tradeoffs.", "Machine Learning", ["evaluation", "metrics"], "beginner"),
  method("cross-validation", "Cross Validation", "Evaluation method that estimates generalization across multiple data splits.", "Statistics", ["validation", "resampling"], "beginner"),
  engineering("linear-regression", "Linear Regression", "Algorithm estimating a linear relationship between features and continuous targets.", "Machine Learning", "algorithm", ["regression"], "beginner", { algorithm: "linear-regression" }),
  engineering("logistic-regression", "Logistic Regression", "Classification algorithm modeling class probability through a logistic link.", "Machine Learning", "algorithm", ["classification"], "beginner", { algorithm: "logistic-regression" }),
  engineering("k-means", "k-Means", "Clustering algorithm that partitions points into groups around learned centroids.", "Machine Learning", "algorithm", ["clustering"], "beginner", { algorithm: "k-means" }),
  engineering("random-forest", "Random Forest", "Ensemble algorithm combining decision trees to reduce variance and improve robustness.", "Machine Learning", "algorithm", ["ensemble", "trees"], "intermediate", { algorithm: "random-forest" }),
  engineering("xgboost", "XGBoost", "Gradient-boosted tree framework widely used for tabular machine learning.", "Machine Learning", "framework", ["boosting", "tabular"], "intermediate", { module: "frameworks" }),
  engineering("scikit-learn", "scikit-learn", "Python library for classical machine learning algorithms and evaluation workflows.", "Machine Learning", "library", ["python", "ml"], "beginner", { module: "libraries" }),

  concept("neural-network", "Neural Network", "Parameterized composition of differentiable layers trained from data.", "Deep Learning", ["differentiable", "layers"], "beginner", [], ["Goodfellow, Bengio and Courville, Deep Learning"]),
  engineering("mlp", "MLP", "Feed-forward neural network composed of fully connected layers and nonlinear activations.", "Deep Learning", "architecture", ["feed-forward"], "beginner", { architecture: "mlp" }, ["multilayer perceptron"]),
  engineering("cnn", "CNN", "Neural architecture using convolutional operations for spatial representation learning.", "Computer Vision", "architecture", ["vision", "convolution"], "intermediate", { architecture: "cnn" }, ["Convolutional Neural Network"]),
  engineering("rnn", "RNN", "Recurrent neural architecture processing sequences through stateful recurrence.", "Deep Learning", "architecture", ["sequence"], "intermediate", { architecture: "rnn" }, ["Recurrent Neural Network"]),
  engineering("lstm", "LSTM", "Gated recurrent architecture designed to preserve long-range sequential information.", "Deep Learning", "architecture", ["sequence", "gating"], "intermediate", { architecture: "lstm" }),
  engineering("gru", "GRU", "Gated recurrent unit architecture simplifying LSTM-style recurrence.", "Deep Learning", "architecture", ["sequence", "gating"], "intermediate", { architecture: "gru" }),
  engineering("transformer", "Transformer", "Attention-based architecture for sequence and multimodal modeling.", "LLMs", "architecture", ["attention", "sequence-modeling"], "advanced", { architecture: "transformer" }, ["transformer architecture"]),
  concept("attention", "Attention", "Mechanism computing context-dependent weighted combinations of representations.", "Deep Learning", ["sequence-modeling", "weights"], "advanced", ["attention mechanism"]),
  concept("embedding", "Embedding", "Dense vector representation of discrete or structured objects in a learned space.", "NLP", ["representation", "vectors"], "beginner"),
  method("normalization", "Normalization", "Transformation that stabilizes feature or activation distributions during learning.", "Deep Learning", ["stability", "training"], "intermediate"),
  concept("residual-connections", "Residual Connections", "Skip connections that improve gradient flow through deep architectures.", "Deep Learning", ["skip-connections", "optimization"], "intermediate", ["skip connections"]),
  method("dropout", "Dropout", "Regularization technique randomly masking activations during training.", "Deep Learning", ["regularization"], "intermediate"),
  engineering("batchnorm", "BatchNorm", "Normalization layer using mini-batch statistics to stabilize training.", "Deep Learning", "technique", ["normalization"], "intermediate", { algorithm: "batch-normalization" }, ["Batch Normalization"]),
  engineering("layernorm", "LayerNorm", "Normalization technique computing statistics across features within an example.", "Deep Learning", "technique", ["normalization"], "intermediate", { algorithm: "layer-normalization" }, ["Layer Normalization"]),
  method("backpropagation", "Backpropagation", "Efficient gradient computation through compositions of differentiable operations.", "Deep Learning", ["autodiff", "training"], "intermediate"),
  engineering("sgd", "Stochastic Gradient Descent", "Optimization algorithm using stochastic mini-batch gradient estimates.", "Machine Learning", "algorithm", ["optimizer"], "intermediate", { algorithm: "sgd" }),
  engineering("adam", "Adam", "Adaptive gradient optimization algorithm combining momentum and per-parameter scaling.", "Deep Learning", "algorithm", ["optimizer"], "intermediate", { algorithm: "adam" }),
  engineering("pytorch", "PyTorch", "Deep learning framework for tensor computation, automatic differentiation and model deployment.", "Programming", "framework", ["python", "deep-learning"], "intermediate", { module: "frameworks" }),
  engineering("tensorflow", "TensorFlow", "Machine learning framework for training, deployment and production inference graphs.", "Programming", "framework", ["deep-learning", "serving"], "intermediate", { module: "frameworks" }),

  method("image-classification", "Image Classification", "Computer vision task assigning category labels to images.", "Computer Vision", ["vision", "classification"], "beginner", ["ImageNet Classification"]),
  method("object-detection", "Object Detection", "Computer vision task locating and classifying object instances in images.", "Computer Vision", ["vision", "localization"], "intermediate"),
  method("segmentation", "Segmentation", "Computer vision task assigning labels to pixels or regions.", "Computer Vision", ["vision", "pixels"], "intermediate"),
  method("tracking", "Tracking", "Computer vision task maintaining object identities across time.", "Computer Vision", ["video", "temporal"], "advanced"),
  method("pose-estimation", "Pose Estimation", "Computer vision task estimating body, object or camera pose from sensory data.", "Computer Vision", ["geometry", "keypoints"], "advanced"),
  method("ocr", "OCR", "Recognition of text characters and words from image data.", "Computer Vision", ["text", "vision"], "intermediate", ["Optical Character Recognition"]),
  method("stereo-vision", "Stereo Vision", "Depth inference from multiple calibrated viewpoints.", "Computer Vision", ["geometry", "depth"], "advanced"),
  method("depth-estimation", "Depth Estimation", "Prediction of scene depth from visual inputs.", "Computer Vision", ["geometry", "3d"], "advanced"),
  engineering("slam", "SLAM", "Simultaneous localization and mapping for estimating trajectory and environment structure.", "Computer Vision", "algorithm", ["robotics", "mapping"], "advanced", { algorithm: "slam" }),
  engineering("visual-odometry", "Visual Odometry", "Estimation of camera motion from image sequences.", "Computer Vision", "algorithm", ["motion", "geometry"], "advanced", { algorithm: "visual-odometry" }),
  engineering("yolo", "YOLO", "Single-stage object detection architecture optimized for real-time detection.", "Computer Vision", "architecture", ["object-detection", "real-time"], "advanced", { architecture: "yolo" }, ["You Only Look Once"]),
  concept("anchor-boxes", "Anchor Boxes", "Predefined bounding box priors used by several object detection models.", "Computer Vision", ["detection", "bounding-boxes"], "intermediate"),
  concept("iou", "IoU", "Intersection over Union metric for overlap between predicted and target regions.", "Computer Vision", ["metric", "bounding-boxes"], "beginner", ["Intersection over Union"]),
  engineering("nms", "NMS", "Non-maximum suppression algorithm removing redundant overlapping detections.", "Computer Vision", "algorithm", ["post-processing", "detection"], "intermediate", { algorithm: "nms" }, ["Non-Maximum Suppression"]),

  method("tokenization", "Tokenization", "Conversion of text into discrete units consumed by language models.", "NLP", ["text", "preprocessing"], "beginner"),
  engineering("word2vec", "Word2Vec", "Neural embedding algorithm learning word vectors from local context.", "NLP", "algorithm", ["embeddings"], "intermediate", { algorithm: "word2vec" }),
  engineering("bert", "BERT", "Bidirectional transformer encoder architecture for language understanding.", "NLP", "architecture", ["transformer", "encoder"], "advanced", { architecture: "bert" }, ["Bidirectional Encoder Representations from Transformers"]),
  engineering("gpt", "GPT", "Autoregressive transformer decoder architecture for language generation.", "LLMs", "architecture", ["transformer", "decoder"], "advanced", { architecture: "gpt" }, ["Generative Pre-trained Transformer"]),
  engineering("t5", "T5", "Text-to-text transformer architecture framing NLP tasks as sequence generation.", "NLP", "architecture", ["seq2seq", "transformer"], "advanced", { architecture: "t5" }),
  engineering("seq2seq", "Seq2Seq", "Encoder-decoder architecture mapping input sequences to output sequences.", "NLP", "architecture", ["encoder-decoder"], "intermediate", { architecture: "seq2seq" }),
  method("prompt-engineering", "Prompt Engineering", "Design of instructions and context to steer model behavior.", "LLMs", ["prompts", "instructions"], "intermediate"),
  engineering("rag", "RAG", "Retrieval-augmented generation architecture grounding generation in retrieved external knowledge.", "LLMs", "architecture", ["retrieval", "grounding"], "advanced", { architecture: "rag", application: "question-answering" }, ["Retrieval-Augmented Generation"]),
  engineering("vector-database", "Vector Database", "Storage and retrieval system optimized for embedding similarity search.", "NLP", "tool", ["retrieval", "embeddings"], "intermediate", { module: "retrieval" }),
  engineering("semantic-search", "Semantic Search", "Retrieval application using embedding similarity rather than exact lexical matching.", "NLP", "technique", ["search", "embeddings"], "intermediate", { application: "semantic-search" }),

  method("fine-tuning", "Fine Tuning", "Adapting a pretrained model to a downstream domain or task with additional training.", "LLM Engineering", ["adaptation", "training"], "intermediate"),
  engineering("lora", "LoRA", "Parameter-efficient fine tuning technique using low-rank adaptation matrices.", "LLM Engineering", "technique", ["peft", "fine-tuning"], "advanced", { algorithm: "lora" }, ["Low-Rank Adaptation"]),
  engineering("qlora", "QLoRA", "Quantized low-rank adaptation enabling efficient fine tuning of large models.", "LLM Engineering", "technique", ["peft", "quantization"], "advanced", { algorithm: "qlora" }),
  method("rlhf", "RLHF", "Alignment method training models from human preference feedback through reinforcement learning.", "LLM Engineering", ["alignment", "preferences"], "advanced", ["Reinforcement Learning from Human Feedback"]),
  engineering("dpo", "DPO", "Preference optimization method directly training on preference pairs without explicit reward modeling.", "LLM Engineering", "algorithm", ["alignment", "preferences"], "advanced", { algorithm: "dpo" }, ["Direct Preference Optimization"]),
  method("llm-inference", "LLM Inference", "Runtime process of generating outputs from a trained large language model.", "LLM Engineering", ["serving", "generation"], "intermediate"),
  engineering("quantization", "Quantization", "Technique reducing numerical precision to improve memory and inference efficiency.", "LLM Engineering", "technique", ["compression", "inference"], "advanced", { algorithm: "quantization" }),
  engineering("kv-cache", "KV Cache", "Cached transformer key/value tensors reused during autoregressive generation.", "LLM Engineering", "datastructure", ["inference", "memory"], "advanced", { module: "inference" }),
  engineering("speculative-decoding", "Speculative Decoding", "Inference acceleration method verifying draft-model tokens with a target model.", "LLM Engineering", "algorithm", ["inference", "latency"], "advanced", { algorithm: "speculative-decoding" }),
  engineering("prompt-templates", "Prompt Templates", "Reusable structured prompts with variable slots and constraints.", "LLM Engineering", "pattern", ["prompts", "templates"], "beginner", { module: "prompting" }),

  method("planning", "Planning", "Agent capability for decomposing goals into ordered actions or subgoals.", "Agents", ["goals", "actions"], "advanced"),
  method("reasoning", "Reasoning", "Structured inference over context, goals and constraints to choose actions or explanations.", "Agents", ["inference", "decisions"], "advanced"),
  concept("agent-memory", "Agent Memory", "State retained across turns or tasks to support continuity and adaptation.", "Agents", ["state", "context"], "advanced", ["memory"]),
  method("reflection", "Reflection", "Agent self-evaluation process used to critique, revise or improve outputs.", "Agents", ["self-evaluation"], "advanced"),
  engineering("tool-use", "Tool Use", "Agent pattern for invoking external capabilities through explicit tool interfaces.", "Agents", "pattern", ["tools", "agents"], "advanced", { application: "agentic-systems" }),
  engineering("mcp", "MCP", "Protocol for connecting AI applications to external tools, data sources and contextual capabilities.", "Agents", "protocol", ["tools", "context"], "advanced", { module: "protocols" }, ["Model Context Protocol"]),
  engineering("multi-agent", "Multi-Agent System", "Architecture coordinating multiple agents with specialized roles or shared workflows.", "Agents", "architecture", ["coordination", "agents"], "advanced", { architecture: "multi-agent" }),
  engineering("agent-workflow", "Agent Workflow", "Structured sequence of agent steps, tool calls and validation gates.", "Agents", "pattern", ["workflow", "orchestration"], "intermediate", { module: "orchestration" }),
  concept("autonomy", "Autonomy", "Degree to which an agent can plan, act and recover without direct human steering.", "Agents", ["agency", "control"], "advanced"),

  engineering("experiment-tracking", "Experiment Tracking", "Recording parameters, metrics, artifacts and lineage for model experiments.", "MLOps", "tool", ["experiments", "lineage"], "intermediate", { module: "mlops" }),
  engineering("deployment", "Deployment", "Process of publishing model artifacts into executable production environments.", "MLOps", "technique", ["release", "production"], "intermediate", { path: "mlops/deployment" }),
  engineering("serving", "Serving", "Runtime infrastructure exposing trained models for online or batch inference.", "MLOps", "architecture", ["inference", "production"], "intermediate", { architecture: "serving" }),
  engineering("monitoring", "Monitoring", "Continuous measurement of model, data and system behavior in production.", "MLOps", "technique", ["observability", "drift"], "intermediate"),
  engineering("cicd", "CI/CD", "Automation pipeline for testing, packaging and releasing software and model changes.", "MLOps", "technique", ["automation", "release"], "intermediate", { module: "delivery" }),
  engineering("versioning", "Versioning", "Traceable management of datasets, code, models and configurations over time.", "MLOps", "convention", ["lineage", "governance"], "beginner"),
  engineering("feature-store", "Feature Store", "System for managing, serving and reusing machine learning features.", "MLOps", "architecture", ["features", "serving"], "intermediate", { architecture: "feature-store" }),
  engineering("model-registry", "Model Registry", "Governed catalog of model artifacts, stages and deployment metadata.", "MLOps", "tool", ["models", "governance"], "intermediate", { module: "registry" }),
  engineering("mlflow", "MLflow", "Open-source platform for experiment tracking, model registry and deployment workflows.", "MLOps", "tool", ["tracking", "registry"], "intermediate", { module: "mlops" }),
  concept("data-drift", "Data Drift", "Change in production data distribution relative to training data.", "MLOps", ["monitoring", "distribution-shift"], "intermediate"),
  context("model-deployment-task", "Model Deployment", "Operational task of promoting a trained model into production inference.", "task", "MLOps", ["deployment"], "intermediate", { path: "mlops/deployment" }),

  evidence("imagenet", "ImageNet", "Large-scale image classification dataset and benchmark for visual recognition.", "benchmark", "Computer Vision", ["dataset", "benchmark"], "intermediate", { artifact: "dataset" }),
  evidence("coco", "COCO", "Dataset and benchmark for object detection, segmentation and captioning.", "benchmark", "Computer Vision", ["dataset", "object-detection"], "intermediate", { artifact: "dataset" }, ["Common Objects in Context"]),
  evidence("glue", "GLUE", "Benchmark suite for natural language understanding evaluation.", "benchmark", "NLP", ["benchmark", "language"], "intermediate", { artifact: "dataset" }),
  evidence("squad", "SQuAD", "Question-answering dataset for evaluating reading comprehension systems.", "benchmark", "NLP", ["qa", "benchmark"], "intermediate", { artifact: "dataset" }),
  evidence("mmlu", "MMLU", "Benchmark measuring multitask language understanding across academic and professional domains.", "benchmark", "LLMs", ["benchmark", "knowledge"], "advanced", { artifact: "dataset" }),
  evidence("helm", "HELM", "Holistic evaluation benchmark framework for language models.", "evaluation", "LLMs", ["evaluation", "benchmark"], "advanced"),
  evidence("ablation-study", "Ablation Study", "Experimental method isolating component contributions by removing or varying them.", "experiment", "Research", ["experiments", "causality"], "intermediate"),
  evidence("baseline", "Baseline", "Reference method or result used as a comparison point in empirical research.", "comparison", "Research", ["evaluation", "comparison"], "beginner"),
  evidence("reproducibility", "Reproducibility", "Ability to independently obtain consistent results from documented methods and artifacts.", "validation", "Research", ["science", "governance"], "intermediate"),
  evidence("open-source", "Open Source", "Publicly accessible implementation or artifact enabling inspection, reuse and verification.", "citation", "Research", ["software", "reproducibility"], "beginner"),
  evidence("transformer-paper", "Attention Is All You Need", "Research paper introducing the Transformer architecture.", "citation", "Research", ["paper", "transformer"], "advanced"),
  evidence("bert-paper", "BERT Paper", "Research paper introducing bidirectional encoder representations from transformers.", "citation", "Research", ["paper", "bert"], "advanced"),
  evidence("yolo-paper", "YOLO Paper", "Research paper family introducing real-time single-stage object detection.", "citation", "Research", ["paper", "object-detection"], "advanced"),
  evidence("lora-paper", "LoRA Paper", "Research paper introducing low-rank adaptation for efficient model fine tuning.", "citation", "Research", ["paper", "fine-tuning"], "advanced"),
  context("hallucination", "Hallucination", "Unsupported or contradicted model output relative to available evidence or context.", "problem", "LLMs", ["reliability"], "advanced"),
  context("latency-constraint", "Latency Constraint", "Operational limit on end-to-end response time for inference systems.", "constraint", "MLOps", ["latency", "serving"], "intermediate"),
  context("privacy-constraint", "Privacy Constraint", "Requirement limiting exposure, storage or processing of sensitive data.", "constraint", "MLOps", ["privacy", "governance"], "intermediate"),
  context("reliable-ai-goal", "Reliable AI Goal", "Desired outcome that AI systems remain correct, observable and recoverable in realistic operation.", "goal", "MLOps", ["reliability", "governance"], "advanced"),
];

const explicitEdges: SeedEdgeDefinition[] = [
  rel("vectors", "linear-algebra", "composes"),
  rel("matrices", "linear-algebra", "composes"),
  rel("matrix-multiplication", "matrices", "requires"),
  rel("eigenvalues", "matrices", "requires"),
  rel("eigenvectors", "eigenvalues", "requires"),
  rel("gradient", "calculus", "requires"),
  rel("jacobian", "gradient", "requires"),
  rel("hessian", "jacobian", "requires"),
  rel("optimization", "gradient", "requires"),
  rel("probability", "statistics", "influences"),
  rel("bias", "statistics", "requires"),
  rel("variance", "statistics", "requires"),
  rel("supervised-learning", "probability", "requires"),
  rel("unsupervised-learning", "statistics", "requires"),
  rel("semi-supervised-learning", "supervised-learning", "requires"),
  rel("self-supervised-learning", "unsupervised-learning", "requires"),
  rel("regression", "supervised-learning", "specializes"),
  rel("classification", "supervised-learning", "specializes"),
  rel("clustering", "unsupervised-learning", "specializes"),
  rel("cross-validation", "evaluation-metrics", "requires"),
  rel("linear-regression", "regression", "implements"),
  rel("logistic-regression", "classification", "implements"),
  rel("k-means", "clustering", "implements"),
  rel("random-forest", "classification", "implements"),
  rel("xgboost", "random-forest", "extends"),
  rel("scikit-learn", "linear-regression", "uses"),
  rel("scikit-learn", "logistic-regression", "uses"),
  rel("scikit-learn", "k-means", "uses"),
  rel("neural-network", "linear-algebra", "requires"),
  rel("neural-network", "optimization", "requires"),
  rel("mlp", "neural-network", "implements"),
  rel("cnn", "neural-network", "implements"),
  rel("rnn", "neural-network", "implements"),
  rel("lstm", "rnn", "extends"),
  rel("gru", "rnn", "extends"),
  rel("transformer", "attention", "implements"),
  rel("transformer", "embedding", "requires"),
  rel("transformer", "matrix-multiplication", "requires"),
  rel("attention", "matrix-multiplication", "requires"),
  rel("backpropagation", "gradient", "requires"),
  rel("sgd", "optimization", "implements"),
  rel("adam", "sgd", "extends"),
  rel("pytorch", "tensor", "implements"),
  rel("pytorch", "backpropagation", "implements"),
  rel("pytorch", "cuda", "uses"),
  rel("tensorflow", "tensor", "implements"),
  rel("batchnorm", "normalization", "implements"),
  rel("layernorm", "normalization", "implements"),
  rel("dropout", "neural-network", "requires"),
  rel("residual-connections", "gradient", "influences"),
  rel("image-classification", "cnn", "requires"),
  rel("object-detection", "image-classification", "requires"),
  rel("segmentation", "image-classification", "requires"),
  rel("tracking", "object-detection", "requires"),
  rel("pose-estimation", "linear-algebra", "requires"),
  rel("stereo-vision", "linear-algebra", "requires"),
  rel("depth-estimation", "stereo-vision", "requires"),
  rel("slam", "visual-odometry", "uses"),
  rel("visual-odometry", "matrix-multiplication", "requires"),
  rel("yolo", "object-detection", "implements"),
  rel("yolo", "anchor-boxes", "requires"),
  rel("yolo", "nms", "uses"),
  rel("nms", "iou", "requires"),
  rel("coco", "yolo", "benchmarks"),
  rel("imagenet", "cnn", "benchmarks"),
  rel("tokenization", "statistics", "requires"),
  rel("embedding", "vectors", "requires"),
  rel("word2vec", "embedding", "implements"),
  rel("bert", "transformer", "extends"),
  rel("gpt", "transformer", "extends"),
  rel("t5", "transformer", "extends"),
  rel("seq2seq", "rnn", "extends"),
  rel("prompt-engineering", "gpt", "requires"),
  rel("rag", "semantic-search", "uses"),
  rel("rag", "vector-database", "uses"),
  rel("rag", "hallucination", "influences"),
  rel("semantic-search", "embedding", "requires"),
  rel("glue", "bert", "benchmarks"),
  rel("squad", "bert", "benchmarks"),
  rel("fine-tuning", "transformer", "requires"),
  rel("lora", "fine-tuning", "implements"),
  rel("qlora", "lora", "extends"),
  rel("rlhf", "fine-tuning", "requires"),
  rel("dpo", "rlhf", "requires"),
  rel("llm-inference", "gpt", "requires"),
  rel("quantization", "gpu-memory", "influences"),
  rel("kv-cache", "llm-inference", "requires"),
  rel("speculative-decoding", "llm-inference", "requires"),
  rel("prompt-templates", "prompt-engineering", "implements"),
  rel("mmlu", "gpt", "benchmarks"),
  rel("helm", "gpt", "benchmarks"),
  rel("planning", "reasoning", "requires"),
  rel("reflection", "reasoning", "requires"),
  rel("tool-use", "planning", "requires"),
  rel("mcp", "tool-use", "extends"),
  rel("multi-agent", "agent-workflow", "uses"),
  rel("agent-workflow", "tool-use", "uses"),
  rel("autonomy", "planning", "requires"),
  rel("agent-memory", "embedding", "requires"),
  rel("experiment-tracking", "versioning", "uses"),
  rel("deployment", "model-registry", "uses"),
  rel("serving", "deployment", "extends"),
  rel("monitoring", "data-drift", "implements"),
  rel("cicd", "deployment", "uses"),
  rel("feature-store", "feature-engineering", "implements"),
  rel("model-registry", "versioning", "uses"),
  rel("mlflow", "experiment-tracking", "uses"),
  rel("mlflow", "model-registry", "uses"),
  rel("model-deployment-task", "deployment", "precedes"),
  rel("latency-constraint", "quantization", "influences"),
  rel("privacy-constraint", "deployment", "influences"),
  rel("reliable-ai-goal", "monitoring", "influences"),
  rel("ablation-study", "baseline", "requires"),
  rel("reproducibility", "open-source", "supports_evidence"),
  rel("transformer-paper", "transformer", "supports"),
  rel("bert-paper", "bert", "supports"),
  rel("yolo-paper", "yolo", "supports"),
  rel("lora-paper", "lora", "supports"),
  rel("baseline", "evaluation-metrics", "supports"),
  rel("ablation-study", "evaluation-metrics", "supports"),
  rel("cuda", "cpp", "uses"),
  rel("cuda", "gpu-memory", "uses"),
  rel("concurrency", "algorithmic-complexity", "requires"),
  rel("concurrency", "cuda", "influences"),
  rel("rust", "concurrency", "influences"),
  rel("serialization", "versioning", "influences"),
  rel("data-structures", "algorithmic-complexity", "influences"),
  rel("data-structures", "python", "influences"),
  rel("python", "pytorch", "precedes"),
  rel("python", "scikit-learn", "precedes"),
];

export function createInitialAtlasGraphSource(): GraphSource {
  const source = new GraphSource("atlas-canonical-knowledge", "2.0.0");
  const ids = new Map(nodeDefinitions.map((definition, index) => [definition.key, makeId("10000000", index + 1)]));
  const edges = buildEdges(ids);

  for (const [index, definition] of nodeDefinitions.entries()) {
    source.registerEntity(toKnowledgeNode(definition, ids.get(definition.key)!, index + 1));
  }
  for (const [index, edge] of edges.entries()) {
    source.registerRelationship(toKnowledgeEdge(edge, ids, index + 1));
  }
  return source;
}

function buildEdges(ids: ReadonlyMap<string, string>): SeedEdgeDefinition[] {
  const byKey = new Map(nodeDefinitions.map((definition) => [definition.key, definition]));
  const edgeKeys = new Set<string>();
  const edges: SeedEdgeDefinition[] = [];
  const add = (edge: SeedEdgeDefinition): void => {
    if (!ids.has(edge.source) || !ids.has(edge.target) || edge.source === edge.target) return;
    const key = `${edge.source}\u0000${edge.target}\u0000${edge.type}`;
    if (!edgeKeys.has(key)) {
      edgeKeys.add(key);
      edges.push(edge);
    }
  };
  for (const edge of explicitEdges) add(edge);

  const domainHubs = ["linear-algebra", "probability", "supervised-learning", "neural-network", "transformer", "image-classification", "embedding", "llm-inference", "reasoning", "deployment"];
  for (const definition of nodeDefinitions) {
    const hub = domainHubs.find((candidate) => byKey.get(candidate)?.domain === definition.domain);
    if (hub && hub !== definition.key) {
      const hubFamily = byKey.get(hub)?.family;
      const type = definition.family === "engineering" && hubFamily === "engineering" ? "influences" : definition.family === "engineering" && hubFamily === "scientific" ? "realizes" : "requires";
      add(rel(definition.key, hub, type, 0.66));
    }
    if (definition.family === "engineering") {
      if (definition.domain !== "Programming") add(rel(definition.key, "python", "uses", 0.6));
      if (["Deep Learning", "Computer Vision", "LLMs", "LLM Engineering"].includes(definition.domain)) add(rel(definition.key, "pytorch", "uses", 0.68));
    }
    if (definition.family === "scientific" && definition.key !== "statistics") add(rel(definition.key, "statistics", "influences", 0.55));
    if (definition.family === "context") add(rel(definition.key, "reliable-ai-goal", "influences", 0.58));
  }

  const evidenceTargets = new Map<string, string>([
    ["Computer Vision", "object-detection"],
    ["NLP", "bert"],
    ["LLMs", "gpt"],
    ["Research", "reproducibility"],
    ["MLOps", "monitoring"],
  ]);
  for (const definition of nodeDefinitions.filter((nodeDefinition) => nodeDefinition.family === "evidence")) {
    const target = evidenceTargets.get(definition.domain) ?? "evaluation-metrics";
    const targetFamily = byKey.get(target)?.family;
    const type = targetFamily === "evidence" ? "supports_evidence" : targetFamily === "engineering" && definition.type !== "citation" ? "benchmarks" : "supports";
    add(rel(definition.key, target, type, 0.75));
  }

  return edges;
}

function concept(
  key: string,
  name: string,
  description: string,
  domain: string,
  tags: string[],
  difficulty: KnowledgeNode["metadata"]["difficulty"],
  aliases: string[] = [],
  references: string[] = [],
): SeedNodeDefinition {
  return { key, type: "concept", family: "scientific", name, description, domain, tags, difficulty, aliases, references };
}

function method(
  key: string,
  name: string,
  description: string,
  domain: string,
  tags: string[],
  difficulty: KnowledgeNode["metadata"]["difficulty"],
  aliases: string[] = [],
): SeedNodeDefinition {
  return { key, type: "method", family: "scientific", name, description, domain, tags, difficulty, aliases };
}

function engineering(
  key: string,
  name: string,
  description: string,
  domain: string,
  type: EntityType,
  tags: string[],
  difficulty: KnowledgeNode["metadata"]["difficulty"],
  metadata: KnowledgeNode["metadata"] = {},
  aliases: string[] = [],
): SeedNodeDefinition {
  return { key, type, family: "engineering", name, description, domain, tags, difficulty, metadata, aliases };
}

function evidence(
  key: string,
  name: string,
  description: string,
  type: EntityType,
  domain: string,
  tags: string[],
  difficulty: KnowledgeNode["metadata"]["difficulty"],
  metadata: KnowledgeNode["metadata"] = {},
  aliases: string[] = [],
): SeedNodeDefinition {
  return { key, type, family: "evidence", name, description, domain, tags, difficulty, metadata, aliases };
}

function context(
  key: string,
  name: string,
  description: string,
  type: EntityType,
  domain: string,
  tags: string[],
  difficulty: KnowledgeNode["metadata"]["difficulty"],
  metadata: KnowledgeNode["metadata"] = {},
): SeedNodeDefinition {
  return { key, type, family: "context", name, description, domain, tags, difficulty, metadata };
}

function rel(source: string, target: string, type: RelationshipType, weight = 0.72): SeedEdgeDefinition {
  return { source, target, type, weight };
}

function toKnowledgeNode(definition: SeedNodeDefinition, id: string, index: number): KnowledgeNode {
  const aliases = [...new Set([definition.name.toLowerCase(), definition.key, ...(definition.aliases ?? []).map((alias) => alias.toLowerCase())])];
  return {
    id,
    type: definition.type,
    family: definition.family,
    name: definition.name,
    description: definition.description,
    metadata: {
      domain: definition.domain,
      tags: definition.tags,
      difficulty: definition.difficulty,
      importance: definition.metadata?.importance ?? 0.82,
      confidence: definition.metadata?.confidence ?? 0.92,
      evidenceCount: definition.metadata?.evidenceCount ?? Math.max(1, definition.references?.length ?? 1),
      aliases,
      references: definition.references ?? [],
      ...definition.metadata,
    },
    versions: [
      {
        id: makeId("20000000", index),
        version: 1,
        changes: ["phase 2 canonical AI engineering population"],
        author: "atlas-knowledge-population",
        timestamp,
        reason: "NV-700 Phase 2 Knowledge Population",
        snapshot: { id, name: definition.name, type: definition.type, family: definition.family },
      },
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
    status: "active",
  };
}

function toKnowledgeEdge(definition: SeedEdgeDefinition, ids: ReadonlyMap<string, string>, index: number): KnowledgeEdge {
  const type = definition.type;
  const metadata: EdgeMetadata = {
    weight: definition.weight ?? 0.72,
    confidence: 0.9,
    evidenceCount: 1,
    canonicalStatus: "canonical",
    temporal: { createdAt: timestamp, updatedAt: timestamp, expiresAt: null },
    sourceEvidence: [],
    direction: "directed",
    transitive: TRANSITIVE_RELATIONSHIPS.has(type),
    multiplicity: "many-to-many",
  };
  return {
    id: makeId("30000000", index),
    source: ids.get(definition.source)!,
    target: ids.get(definition.target)!,
    type,
    category: RELATIONSHIP_CATEGORY_BY_TYPE[type],
    metadata,
    createdAt: timestamp,
    updatedAt: timestamp,
    status: "active",
  };
}

function makeId(prefix: string, index: number): string {
  return `${prefix}-0000-4000-8000-${index.toString(16).padStart(12, "0")}`;
}
