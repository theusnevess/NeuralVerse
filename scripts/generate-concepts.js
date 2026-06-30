#!/usr/bin/env node
/**
 * NV-1100-P4 — Concept Registry Generator
 * Generates concept JSON files for the Concept Layer.
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'website', 'data', 'concepts');
const CONCEPTS_DIR = path.join(BASE, 'concepts');

if (!fs.existsSync(CONCEPTS_DIR)) fs.mkdirSync(CONCEPTS_DIR, { recursive: true });

const concepts = [
  {
    id: "linear-models", name: "Linear Models", category: "machine-learning", difficulty: "beginner",
    summary: "Parametric models that learn a linear combination of input features to make predictions.",
    definition: "A linear model computes output as a weighted sum of input features plus a bias term: y = w₁x₁ + w₂x₂ + ... + b. These models form the foundation of classical machine learning.",
    aliases: ["linear classifiers", "linear regression", "linear estimators"],
    keywords: ["linear", "regression", "classification", "weights", "bias"],
    sharedKnowledgeDomains: ["machine-learning"],
    prerequisiteConcepts: [],
    relatedConcepts: [
      { concept: "gradient-descent", type: "depends_on" },
      { concept: "decision-boundaries", type: "related_to" },
      { concept: "regularization", type: "uses" }
    ],
    difficulty_label: "Beginner", sourceReferences: [
      { id: "ref-linear-0", title: "The Elements of Statistical Learning", type: "book", description: "Comprehensive ML textbook covering linear methods" }
    ]
  },
  {
    id: "gradient-descent", name: "Gradient Descent", category: "optimization", difficulty: "beginner",
    summary: "An iterative optimization algorithm that minimizes a loss function by moving in the direction of steepest descent.",
    definition: "Gradient descent updates model parameters by subtracting the gradient of the loss function scaled by a learning rate: θ = θ - α∇L(θ).",
    aliases: ["steepest descent", "gradient optimization"],
    keywords: ["optimization", "gradient", "learning rate", "loss", "convergence"],
    sharedKnowledgeDomains: ["optimization"],
    prerequisiteConcepts: [],
    relatedConcepts: [
      { concept: "linear-models", type: "uses" },
      { concept: "regularization", type: "supports" },
      { concept: "optimizers", type: "extends" }
    ],
    sourceReferences: [
      { id: "ref-gd-0", title: "An overview of gradient descent optimization algorithms", type: "article", description: "Survey of gradient descent variants" }
    ]
  },
  {
    id: "regularization", name: "Regularization", category: "machine-learning", difficulty: "intermediate",
    summary: "Techniques that constrain model complexity to prevent overfitting and improve generalization.",
    definition: "Regularization adds a penalty term to the loss function to discourage complex models. Common forms include L1 (Lasso), L2 (Ridge), and dropout.",
    aliases: ["overfitting prevention", "model constraint"],
    keywords: ["regularization", "L1", "L2", "dropout", "overfitting", "generalization"],
    sharedKnowledgeDomains: ["machine-learning", "optimization"],
    prerequisiteConcepts: ["gradient-descent"],
    relatedConcepts: [
      { concept: "dropout", type: "implements" },
      { concept: "batch-normalization", type: "related_to" },
      { concept: "gradient-descent", type: "uses" }
    ],
    sourceReferences: [
      { id: "ref-reg-0", title: "Dropout: A Simple Way to Prevent Neural Networks from Overfitting", type: "paper", description: "Srivastava et al. 2014 - Dropout regularization" }
    ]
  },
  {
    id: "decision-boundaries", name: "Decision Boundaries", category: "machine-learning", difficulty: "beginner",
    summary: "The hypersurface that partitions the feature space into regions assigned to different classes.",
    definition: "A decision boundary is the set of points where the model's prediction changes from one class to another. Linear models produce linear boundaries; nonlinear models produce complex surfaces.",
    aliases: ["classification boundary", "decision surface"],
    keywords: ["boundary", "classification", "separation", "hyperplane"],
    sharedKnowledgeDomains: ["machine-learning"],
    prerequisiteConcepts: ["linear-models"],
    relatedConcepts: [
      { concept: "linear-models", type: "uses" },
      { concept: "neural-networks", type: "extends" }
    ],
    sourceReferences: []
  },
  {
    id: "neural-networks", name: "Neural Networks", category: "deep-learning", difficulty: "beginner",
    summary: "Computational models composed of layers of interconnected neurons that learn hierarchical feature representations.",
    definition: "A neural network consists of an input layer, hidden layers, and an output layer. Each neuron applies a weighted linear transformation followed by a nonlinear activation function.",
    aliases: ["artificial neural networks", "ANN", "MLP", "feedforward networks"],
    keywords: ["neural network", "layers", "neurons", "activation", "weights"],
    sharedKnowledgeDomains: ["deep-learning"],
    prerequisiteConcepts: ["linear-models", "gradient-descent"],
    relatedConcepts: [
      { concept: "backpropagation", type: "depends_on" },
      { concept: "activation-functions", type: "uses" },
      { concept: "decision-boundaries", type: "extends" }
    ],
    sourceReferences: [
      { id: "ref-nn-0", title: "Deep Learning (Goodfellow et al.)", type: "book", description: "Comprehensive deep learning textbook" }
    ]
  },
  {
    id: "backpropagation", name: "Backpropagation", category: "deep-learning", difficulty: "intermediate",
    summary: "An algorithm for computing gradients of the loss with respect to each weight using the chain rule.",
    definition: "Backpropagation efficiently computes the gradient of the loss function with respect to each weight by propagating errors backward through the network using the chain rule of calculus.",
    aliases: ["backward propagation", "reverse-mode autodiff"],
    keywords: ["backpropagation", "gradient", "chain rule", "training", "weights"],
    sharedKnowledgeDomains: ["deep-learning", "optimization"],
    prerequisiteConcepts: ["neural-networks"],
    relatedConcepts: [
      { concept: "neural-networks", type: "uses" },
      { concept: "gradient-descent", type: "implements" },
      { concept: "recurrent-networks", type: "uses" }
    ],
    sourceReferences: [
      { id: "ref-bp-0", title: "Learning representations by back-propagating errors", type: "paper", description: "Rumelhart, Hinton, Williams 1986" }
    ]
  },
  {
    id: "activation-functions", name: "Activation Functions", category: "deep-learning", difficulty: "beginner",
    summary: "Nonlinear functions applied to neuron outputs to introduce expressiveness into neural networks.",
    definition: "Activation functions transform the weighted sum of inputs in a neuron. Common choices include ReLU, sigmoid, tanh, and GeLU. They enable neural networks to learn nonlinear mappings.",
    aliases: ["transfer functions", "nonlinearities"],
    keywords: ["activation", "ReLU", "sigmoid", "tanh", "nonlinearity"],
    sharedKnowledgeDomains: ["deep-learning"],
    prerequisiteConcepts: ["neural-networks"],
    relatedConcepts: [
      { concept: "neural-networks", type: "uses" },
      { concept: "self-attention", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "convolution", name: "Convolution", category: "computer-vision", difficulty: "intermediate",
    summary: "A mathematical operation that slides learnable filters across input data to extract local features.",
    definition: "Convolution applies a set of learnable kernels (filters) across the input using sliding windows. Each kernel detects specific patterns such as edges, textures, or complex features at different layers.",
    aliases: ["convolutional operation", "conv layer", "convolutional layer"],
    keywords: ["convolution", "kernel", "filter", "feature map", "sliding window"],
    sharedKnowledgeDomains: ["computer-vision", "deep-learning"],
    prerequisiteConcepts: ["neural-networks"],
    relatedConcepts: [
      { concept: "pooling", type: "supports" },
      { concept: "neural-networks", type: "uses" },
      { concept: "object-detection", type: "uses" }
    ],
    sourceReferences: [
      { id: "ref-conv-0", title: "Deep Learning (Goodfellow et al.) Chapter 9: Convolutional Networks", type: "book", description: "Comprehensive treatment of convolutional architectures" }
    ]
  },
  {
    id: "pooling", name: "Pooling", category: "computer-vision", difficulty: "intermediate",
    summary: "Downsampling operations that reduce spatial dimensions while preserving important features.",
    definition: "Pooling reduces the spatial size of feature maps by aggregating local regions. Max pooling takes the maximum value; average pooling computes the mean. Pooling introduces translation invariance.",
    aliases: ["subsampling", "downsampling", "max pooling", "average pooling"],
    keywords: ["pooling", "max pooling", "average pooling", "subsampling", "invariance"],
    sharedKnowledgeDomains: ["computer-vision"],
    prerequisiteConcepts: ["convolution"],
    relatedConcepts: [
      { concept: "convolution", type: "supports" },
      { concept: "image-segmentation", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "recurrent-networks", name: "Recurrent Neural Networks", category: "nlp", difficulty: "intermediate",
    summary: "Neural networks with recurrent connections that process sequential data by maintaining hidden state.",
    definition: "RNNs process sequences by maintaining a hidden state that is updated at each timestep. The hidden state captures information from previous elements in the sequence, enabling temporal modeling.",
    aliases: ["RNN", "recurrent networks", "LSTM", "GRU"],
    keywords: ["RNN", "sequence", "hidden state", "temporal", "LSTM", "GRU"],
    sharedKnowledgeDomains: ["deep-learning"],
    prerequisiteConcepts: ["neural-networks", "backpropagation"],
    relatedConcepts: [
      { concept: "neural-networks", type: "specializes" },
      { concept: "self-attention", type: "contrasts" },
      { concept: "backpropagation", type: "uses" }
    ],
    sourceReferences: [
      { id: "ref-rnn-0", title: "Long Short-Term Memory", type: "paper", description: "Hochreiter & Schmidhuber 1997" }
    ]
  },
  {
    id: "self-attention", name: "Self-Attention", category: "transformers", difficulty: "advanced",
    summary: "A mechanism that allows each element in a sequence to attend to all other elements using learned attention weights.",
    definition: "Self-attention computes query, key, and value projections for each token, then computes attention weights as softmax(QK^T/√d) and applies them to values. It captures global dependencies in parallel.",
    aliases: ["scaled dot-product attention", "multi-head attention"],
    keywords: ["attention", "self-attention", "query", "key", "value", "transformer"],
    sharedKnowledgeDomains: ["transformers"],
    prerequisiteConcepts: ["neural-networks"],
    relatedConcepts: [
      { concept: "transformer-architecture", type: "uses" },
      { concept: "recurrent-networks", type: "contrasts" },
      { concept: "positional-encoding", type: "supports" }
    ],
    sourceReferences: [
      { id: "ref-attn-0", title: "Attention Is All You Need", type: "paper", description: "Vaswani et al. 2017 - Foundational transformer paper" }
    ]
  },
  {
    id: "transformer-architecture", name: "Transformer Architecture", category: "transformers", difficulty: "advanced",
    summary: "A sequence model based entirely on self-attention mechanisms, replacing recurrence and convolutions.",
    definition: "The Transformer consists of encoder-decoder stacks with multi-head self-attention and feed-forward layers. It processes entire sequences in parallel, enabling efficient training at scale.",
    aliases: ["transformer", "encoder-decoder transformer"],
    keywords: ["transformer", "encoder", "decoder", "self-attention", "parallel"],
    sharedKnowledgeDomains: ["transformers"],
    prerequisiteConcepts: ["self-attention", "positional-encoding"],
    relatedConcepts: [
      { concept: "self-attention", type: "uses" },
      { concept: "causal-masking", type: "uses" },
      { concept: "positional-encoding", type: "uses" }
    ],
    sourceReferences: [
      { id: "ref-tf-0", title: "Attention Is All You Need", type: "paper", description: "Vaswani et al. 2017" }
    ]
  },
  {
    id: "positional-encoding", name: "Positional Encoding", category: "transformers", difficulty: "intermediate",
    summary: "Injecting sequence order information into transformer inputs since self-attention is permutation-invariant.",
    definition: "Positional encodings are added to token embeddings to provide order information. Common approaches include sinusoidal functions (fixed) and learned embeddings.",
    aliases: ["position encoding", "position embeddings"],
    keywords: ["positional", "encoding", "position", "order", "sequence"],
    sharedKnowledgeDomains: ["transformers"],
    prerequisiteConcepts: ["self-attention"],
    relatedConcepts: [
      { concept: "transformer-architecture", type: "uses" },
      { concept: "self-attention", type: "supports" }
    ],
    sourceReferences: []
  },
  {
    id: "word-embeddings", name: "Word Embeddings", category: "embeddings", difficulty: "beginner",
    summary: "Dense vector representations of words that capture semantic relationships.",
    definition: "Word embeddings map words to dense vectors in continuous space where semantically similar words are close together. Word2Vec, GloVe, and FastText are foundational approaches.",
    aliases: ["embeddings", "word vectors", "word representations"],
    keywords: ["embedding", "word2vec", "glove", "vector", "semantic"],
    sharedKnowledgeDomains: ["embeddings"],
    prerequisiteConcepts: [],
    relatedConcepts: [
      { concept: "semantic-search", type: "uses" },
      { concept: "vector-similarity", type: "uses" }
    ],
    sourceReferences: [
      { id: "ref-emb-0", title: "Efficient Estimation of Word Representations in Vector Space", type: "paper", description: "Mikolov et al. 2013 - Word2Vec" }
    ]
  },
  {
    id: "semantic-search", name: "Semantic Search", category: "retrieval", difficulty: "intermediate",
    summary: "Information retrieval based on meaning and context rather than exact keyword matching.",
    definition: "Semantic search uses dense vector embeddings to find documents similar in meaning to a query, using cosine similarity or other distance metrics in embedding space.",
    aliases: ["meaning-based search", "vector search"],
    keywords: ["semantic", "search", "meaning", "embedding", "retrieval"],
    sharedKnowledgeDomains: ["embeddings", "rag"],
    prerequisiteConcepts: ["word-embeddings", "vector-similarity"],
    relatedConcepts: [
      { concept: "dense-retrieval", type: "implements" },
      { concept: "vector-similarity", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "vector-similarity", name: "Vector Similarity", category: "embeddings", difficulty: "intermediate",
    summary: "Measures of closeness between vectors in embedding space, including cosine similarity and Euclidean distance.",
    definition: "Vector similarity metrics quantify how close two embedding vectors are. Cosine similarity measures angular distance; L2 norm measures Euclidean distance. Used as the foundation for retrieval systems.",
    aliases: ["similarity metrics", "distance metrics"],
    keywords: ["cosine similarity", "Euclidean", "distance", "similarity", "vector"],
    sharedKnowledgeDomains: ["embeddings"],
    prerequisiteConcepts: ["word-embeddings"],
    relatedConcepts: [
      { concept: "semantic-search", type: "uses" },
      { concept: "dense-retrieval", type: "uses" },
      { concept: "reranking", type: "supports" }
    ],
    sourceReferences: []
  },
  {
    id: "dense-retrieval", name: "Dense Retrieval", category: "retrieval", difficulty: "intermediate",
    summary: "Retrieving documents by encoding queries and documents as dense vectors and computing similarity.",
    definition: "Dense retrieval uses neural encoders to map queries and documents into a shared embedding space, then retrieves the most similar documents via approximate nearest neighbor search.",
    aliases: ["neural retrieval", "dense passage retrieval", "DPR"],
    keywords: ["dense", "retrieval", "DPR", "ANN", "passage retrieval"],
    sharedKnowledgeDomains: ["rag", "embeddings"],
    prerequisiteConcepts: ["semantic-search"],
    relatedConcepts: [
      { concept: "semantic-search", type: "implements" },
      { concept: "reranking", type: "supports" },
      { concept: "chunking", type: "uses" }
    ],
    sourceReferences: [
      { id: "ref-dpr-0", title: "Dense Passage Retrieval for Open-Domain Question Answering", type: "paper", description: "Karpukhin et al. 2020" }
    ]
  },
  {
    id: "reranking", name: "Reranking", category: "retrieval", difficulty: "advanced",
    summary: "Re-ordering initial retrieval results using a more computationally expensive scoring model.",
    definition: "Reranking takes the top-K candidates from an initial retrieval stage and re-scores them using a cross-encoder or more sophisticated model to improve precision.",
    aliases: ["cross-encoder reranking", "second-stage ranking"],
    keywords: ["reranking", "cross-encoder", "re-ranking", "precision"],
    sharedKnowledgeDomains: ["rag"],
    prerequisiteConcepts: ["dense-retrieval", "vector-similarity"],
    relatedConcepts: [
      { concept: "dense-retrieval", type: "extends" },
      { concept: "vector-similarity", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "chunking", name: "Chunking", category: "rag", difficulty: "intermediate",
    summary: "Splitting documents into smaller segments for retrieval and indexing.",
    definition: "Chunking divides documents into manageable segments (chunks) that can be individually embedded and retrieved. Chunk size and overlap affect retrieval quality.",
    aliases: ["text chunking", "document segmentation", "passage splitting"],
    keywords: ["chunk", "segment", "split", "document", "passage"],
    sharedKnowledgeDomains: ["rag"],
    prerequisiteConcepts: [],
    relatedConcepts: [
      { concept: "dense-retrieval", type: "uses" },
      { concept: "rag-pipeline", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "rag-pipeline", name: "RAG Pipeline", category: "rag", difficulty: "advanced",
    summary: "An architecture that combines document retrieval with language model generation for grounded responses.",
    definition: "RAG (Retrieval-Augmented Generation) pipelines retrieve relevant documents from a knowledge base and inject them into the LLM prompt context before generation, grounding responses in factual data.",
    aliases: ["retrieval-augmented generation", "RAG system"],
    keywords: ["RAG", "retrieval", "augmented", "generation", "pipeline"],
    sharedKnowledgeDomains: ["rag"],
    prerequisiteConcepts: ["dense-retrieval", "chunking"],
    relatedConcepts: [
      { concept: "dense-retrieval", type: "uses" },
      { concept: "query-routing", type: "uses" },
      { concept: "knowledge-grounding", type: "uses" }
    ],
    sourceReferences: [
      { id: "ref-rag-0", title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", type: "paper", description: "Lewis et al. 2020" }
    ]
  },
  {
    id: "knowledge-grounding", name: "Knowledge Grounding", category: "rag", difficulty: "advanced",
    summary: "Ensuring generated responses are supported by retrieved evidence from the knowledge base.",
    definition: "Knowledge grounding verifies that LLM outputs are traceable to specific retrieved passages, reducing hallucination and ensuring factual accuracy.",
    aliases: ["grounding", "factual grounding", "attribution"],
    keywords: ["grounding", "attribution", "factuality", "evidence", "citation"],
    sharedKnowledgeDomains: ["rag"],
    prerequisiteConcepts: ["rag-pipeline"],
    relatedConcepts: [
      { concept: "rag-pipeline", type: "uses" },
      { concept: "agentic-rag", type: "supports" }
    ],
    sourceReferences: []
  },
  {
    id: "query-routing", name: "Query Routing", category: "rag", difficulty: "advanced",
    summary: "Directing user queries to the appropriate retrieval source or processing pipeline.",
    definition: "Query routing analyzes incoming queries and routes them to the most suitable retrieval strategy, knowledge base, or processing pipeline based on intent and content.",
    aliases: ["query classification", "intent routing"],
    keywords: ["query", "routing", "classification", "intent", "dispatch"],
    sharedKnowledgeDomains: ["rag"],
    prerequisiteConcepts: ["rag-pipeline"],
    relatedConcepts: [
      { concept: "rag-pipeline", type: "uses" },
      { concept: "agentic-rag", type: "supports" }
    ],
    sourceReferences: []
  },
  {
    id: "agentic-rag", name: "Agentic RAG", category: "agents", difficulty: "expert",
    summary: "RAG systems enhanced with autonomous planning, tool use, and iterative retrieval strategies.",
    definition: "Agentic RAG extends basic RAG with agent capabilities: the system can decompose complex queries, iteratively retrieve, evaluate results, and use tools to augment retrieval.",
    aliases: ["agent RAG", "agentic retrieval"],
    keywords: ["agentic", "RAG", "agent", "planning", "iterative"],
    sharedKnowledgeDomains: ["rag", "agents"],
    prerequisiteConcepts: ["rag-pipeline", "react-pattern"],
    relatedConcepts: [
      { concept: "rag-pipeline", type: "extends" },
      { concept: "react-pattern", type: "uses" },
      { concept: "tool-calling", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "react-pattern", name: "ReAct Pattern", category: "agents", difficulty: "advanced",
    summary: "A framework combining reasoning traces with action execution in language model agents.",
    definition: "ReAct alternates between reasoning (thinking through a problem) and acting (executing tools), creating a trace of Thought → Action → Observation cycles.",
    aliases: ["reasoning and acting", "ReAct framework"],
    keywords: ["ReAct", "reasoning", "acting", "agent", "trace"],
    sharedKnowledgeDomains: ["agents"],
    prerequisiteConcepts: ["transformer-architecture"],
    relatedConcepts: [
      { concept: "planning-loops", type: "implements" },
      { concept: "tool-calling", type: "uses" },
      { concept: "agentic-rag", type: "uses" }
    ],
    sourceReferences: [
      { id: "ref-react-0", title: "ReAct: Synergizing Reasoning and Acting in Language Models", type: "paper", description: "Yao et al. 2022" }
    ]
  },
  {
    id: "tool-calling", name: "Tool Calling", category: "agents", difficulty: "advanced",
    summary: "The ability of language model agents to invoke external tools and APIs to extend their capabilities.",
    definition: "Tool calling allows agents to format structured requests for external functions (search, calculators, databases) and incorporate the results into their reasoning process.",
    aliases: ["function calling", "tool use", "API calling"],
    keywords: ["tool", "calling", "function", "API", "execution"],
    sharedKnowledgeDomains: ["agents"],
    prerequisiteConcepts: ["react-pattern"],
    relatedConcepts: [
      { concept: "react-pattern", type: "uses" },
      { concept: "agentic-rag", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "planning-loops", name: "Planning Loops", category: "agents", difficulty: "expert",
    summary: "Iterative reasoning cycles where agents decompose tasks, execute steps, and evaluate progress.",
    definition: "Planning loops enable agents to break complex goals into subtasks, execute them sequentially, evaluate results, and adjust plans based on intermediate outcomes.",
    aliases: ["agent planning", "execution loops"],
    keywords: ["planning", "loop", "decomposition", "iteration", "evaluation"],
    sharedKnowledgeDomains: ["agents"],
    prerequisiteConcepts: ["react-pattern"],
    relatedConcepts: [
      { concept: "react-pattern", type: "implements" },
      { concept: "tool-calling", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "causal-masking", name: "Causal Masking", category: "transformers", difficulty: "intermediate",
    summary: "A masking mechanism that prevents tokens from attending to future positions during training.",
    definition: "Causal masking applies a triangular mask to the attention matrix so each token can only attend to itself and previous tokens, enabling autoregressive generation.",
    aliases: ["causal attention mask", "look-ahead mask", "autoregressive mask"],
    keywords: ["causal", "mask", "autoregressive", "future tokens", "decoder"],
    sharedKnowledgeDomains: ["transformers", "llms"],
    prerequisiteConcepts: ["transformer-architecture"],
    relatedConcepts: [
      { concept: "transformer-architecture", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "tokenization", name: "Tokenization", category: "nlp", difficulty: "beginner",
    summary: "The process of converting text into discrete tokens for model input.",
    definition: "Tokenization splits text into subword units (tokens) using algorithms like Byte-Pair Encoding (BPE), WordPiece, or SentencePiece. It bridges human language and model vocabulary.",
    aliases: ["text tokenization", "BPE", "WordPiece"],
    keywords: ["tokenization", "BPE", "token", "subword", "vocabulary"],
    sharedKnowledgeDomains: ["llms", "transformers"],
    prerequisiteConcepts: [],
    relatedConcepts: [
      { concept: "word-embeddings", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "batch-normalization", name: "Batch Normalization", category: "deep-learning", difficulty: "intermediate",
    summary: "A technique that normalizes layer inputs to stabilize and accelerate training.",
    definition: "Batch normalization normalizes activations across the mini-batch to zero mean and unit variance, then applies learnable scale and shift parameters. It reduces internal covariate shift.",
    aliases: ["batch norm", "BatchNorm"],
    keywords: ["batch normalization", "normalization", "training stability", "covariate shift"],
    sharedKnowledgeDomains: ["deep-learning"],
    prerequisiteConcepts: ["neural-networks"],
    relatedConcepts: [
      { concept: "neural-networks", type: "uses" },
      { concept: "regularization", type: "related_to" }
    ],
    sourceReferences: [
      { id: "ref-bn-0", title: "Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift", type: "paper", description: "Ioffe & Szegedy 2015" }
    ]
  },
  {
    id: "dropout", name: "Dropout", category: "deep-learning", difficulty: "intermediate",
    summary: "A regularization technique that randomly deactivates neurons during training.",
    definition: "Dropout randomly sets a fraction of neuron activations to zero during each training step. This prevents co-adaptation of neurons and acts as an ensemble of sub-networks.",
    aliases: ["dropout regularization"],
    keywords: ["dropout", "regularization", "random", "neurons", "training"],
    sharedKnowledgeDomains: ["deep-learning"],
    prerequisiteConcepts: ["neural-networks"],
    relatedConcepts: [
      { concept: "regularization", type: "implements" },
      { concept: "neural-networks", type: "uses" }
    ],
    sourceReferences: [
      { id: "ref-drop-0", title: "Dropout: A Simple Way to Prevent Neural Networks from Overfitting", type: "paper", description: "Srivastava et al. 2014" }
    ]
  },
  {
    id: "loss-functions", name: "Loss Functions", category: "optimization", difficulty: "beginner",
    summary: "Mathematical functions that quantify the difference between predictions and target values.",
    definition: "Loss functions measure prediction error. Common choices include cross-entropy for classification, MSE for regression, and contrastive loss for similarity learning.",
    aliases: ["objective functions", "cost functions", "error functions"],
    keywords: ["loss", "objective", "error", "cross-entropy", "MSE"],
    sharedKnowledgeDomains: ["optimization"],
    prerequisiteConcepts: [],
    relatedConcepts: [
      { concept: "gradient-descent", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "data-augmentation", name: "Data Augmentation", category: "deep-learning", difficulty: "beginner",
    summary: "Techniques that artificially expand training data by applying transformations to existing samples.",
    definition: "Data augmentation creates new training examples by applying random but realistic transformations (rotation, flipping, cropping, color jitter) to existing data.",
    aliases: ["augmentation", "data expansion"],
    keywords: ["augmentation", "transformation", "training data", "diversity"],
    sharedKnowledgeDomains: ["deep-learning", "computer-vision"],
    prerequisiteConcepts: [],
    relatedConcepts: [
      { concept: "convolution", type: "supports" }
    ],
    sourceReferences: []
  },
  {
    id: "learning-rate-scheduling", name: "Learning Rate Scheduling", category: "optimization", difficulty: "intermediate",
    summary: "Strategies that adjust the learning rate during training to improve convergence.",
    definition: "Learning rate scheduling modifies the learning rate over time. Strategies include step decay, cosine annealing, warmup schedules, and reduce-on-plateau.",
    aliases: ["LR scheduling", "learning rate decay"],
    keywords: ["learning rate", "schedule", "decay", "warmup", "cosine"],
    sharedKnowledgeDomains: ["optimization"],
    prerequisiteConcepts: ["gradient-descent"],
    relatedConcepts: [
      { concept: "gradient-descent", type: "supports" },
      { concept: "optimizers", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "optimizers", name: "Optimizers", category: "optimization", difficulty: "intermediate",
    summary: "Algorithms that update model parameters to minimize the loss function.",
    definition: "Optimizers extend basic gradient descent with adaptive learning rates, momentum, and other mechanisms. SGD, Adam, RMSprop, and AdamW are widely used.",
    aliases: ["optimization algorithms", "gradient optimizers"],
    keywords: ["optimizer", "Adam", "SGD", "momentum", "adaptive"],
    sharedKnowledgeDomains: ["optimization"],
    prerequisiteConcepts: ["gradient-descent"],
    relatedConcepts: [
      { concept: "gradient-descent", type: "extends" },
      { concept: "learning-rate-scheduling", type: "uses" }
    ],
    sourceReferences: [
      { id: "ref-opt-0", title: "Adam: A Method for Stochastic Optimization", type: "paper", description: "Kingma & Ba 2014" }
    ]
  },
  {
    id: "data-drift", name: "Data Drift", category: "mlops", difficulty: "advanced",
    summary: "Changes in the statistical properties of production input data compared to training data.",
    definition: "Data drift occurs when the distribution of incoming data shifts from what the model was trained on, leading to degraded performance. Detected via monitoring input statistics.",
    aliases: ["distribution shift", "covariate shift", "concept drift"],
    keywords: ["drift", "distribution", "shift", "monitoring", "statistics"],
    sharedKnowledgeDomains: ["mlops"],
    prerequisiteConcepts: [],
    relatedConcepts: [
      { concept: "model-monitoring", type: "uses" },
      { concept: "model-deployment", type: "supports" }
    ],
    sourceReferences: []
  },
  {
    id: "model-deployment", name: "Model Deployment", category: "mlops", difficulty: "advanced",
    summary: "The process of making trained models available for serving predictions in production.",
    definition: "Model deployment encompasses packaging, serving, versioning, and scaling models for production inference. Includes containerization, API endpoints, and load balancing.",
    aliases: ["model serving", "inference deployment"],
    keywords: ["deployment", "serving", "inference", "production", "API"],
    sharedKnowledgeDomains: ["mlops"],
    prerequisiteConcepts: [],
    relatedConcepts: [
      { concept: "model-monitoring", type: "supports" },
      { concept: "data-drift", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "model-monitoring", name: "Model Monitoring", category: "mlops", difficulty: "advanced",
    summary: "Continuously tracking model performance and data quality in production systems.",
    definition: "Model monitoring tracks prediction latency, accuracy, data drift, and resource utilization to ensure models maintain expected performance in production.",
    aliases: ["performance monitoring", "production monitoring"],
    keywords: ["monitoring", "performance", "latency", "accuracy", "drift"],
    sharedKnowledgeDomains: ["mlops"],
    prerequisiteConcepts: ["model-deployment"],
    relatedConcepts: [
      { concept: "data-drift", type: "uses" },
      { concept: "model-deployment", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "feature-engineering", name: "Feature Engineering", category: "machine-learning", difficulty: "intermediate",
    summary: "Creating and selecting input features from raw data to improve model performance.",
    definition: "Feature engineering transforms raw data into informative features that better represent the underlying problem to the model, improving predictive accuracy.",
    aliases: ["feature creation", "feature extraction", "feature selection"],
    keywords: ["feature", "engineering", "extraction", "selection", "transform"],
    sharedKnowledgeDomains: ["machine-learning"],
    prerequisiteConcepts: ["linear-models"],
    relatedConcepts: [
      { concept: "linear-models", type: "uses" }
    ],
    sourceReferences: []
  },
  {
    id: "cross-validation", name: "Cross-Validation", category: "statistics", difficulty: "intermediate",
    summary: "A technique for estimating model performance by partitioning data into training and validation folds.",
    definition: "Cross-validation splits data into K folds, training on K-1 and validating on the remaining fold, rotating through all folds. It provides robust performance estimates.",
    aliases: ["k-fold cross-validation", "CV"],
    keywords: ["cross-validation", "folds", "validation", "estimation", "generalization"],
    sharedKnowledgeDomains: ["machine-learning"],
    prerequisiteConcepts: [],
    relatedConcepts: [
      { concept: "regularization", type: "supports" }
    ],
    sourceReferences: []
  },
  {
    id: "object-detection", name: "Object Detection", category: "computer-vision", difficulty: "advanced",
    summary: "Identifying and localizing objects in images using bounding boxes and class labels.",
    definition: "Object detection combines classification and localization to identify objects within images. Architectures like YOLO, SSD, and Faster R-CNN are standard approaches.",
    aliases: ["detection", "bounding box detection"],
    keywords: ["detection", "bounding box", "YOLO", "localization", "object"],
    sharedKnowledgeDomains: ["computer-vision"],
    prerequisiteConcepts: ["convolution", "pooling"],
    relatedConcepts: [
      { concept: "convolution", type: "uses" },
      { concept: "image-segmentation", type: "related_to" }
    ],
    sourceReferences: [
      { id: "ref-det-0", title: "You Only Look Once: Unified, Real-Time Object Detection", type: "paper", description: "Redmon et al. 2016" }
    ]
  },
  {
    id: "image-segmentation", name: "Image Segmentation", category: "computer-vision", difficulty: "advanced",
    summary: "Partitioning an image into pixel-level regions belonging to different classes.",
    definition: "Image segmentation assigns a class label to every pixel in an image. Semantic segmentation labels classes; instance segmentation distinguishes individual objects.",
    aliases: ["segmentation", "semantic segmentation", "instance segmentation"],
    keywords: ["segmentation", "pixel", "semantic", "instance", "U-Net"],
    sharedKnowledgeDomains: ["computer-vision"],
    prerequisiteConcepts: ["convolution", "pooling"],
    relatedConcepts: [
      { concept: "convolution", type: "uses" },
      { concept: "object-detection", type: "related_to" }
    ],
    sourceReferences: []
  }
];

// Write index.json
const index = {
  version: "1.0.0",
  schemaVersion: "1.0",
  lastUpdated: "2026-06-24",
  governance: {
    status: "active",
    owner: "NV-1100 Governance",
    lastReviewed: "2026-06-24",
    reviewPolicy: "Concept additions require cross-domain validation"
  },
  validCategories: ["machine-learning", "deep-learning", "computer-vision", "nlp", "retrieval", "rag", "agents", "optimization", "mathematics", "statistics", "mlops", "transformers", "embeddings"],
  validDifficulty: ["beginner", "intermediate", "advanced", "expert"],
  validRelationTypes: ["depends_on", "extends", "contrasts", "implements", "uses", "supports", "generalizes", "specializes", "related_to"],
  validStatuses: ["Draft", "Reviewed"],
  concepts: concepts.map(c => ({ id: c.id, file: `concepts/${c.id}.json` }))
};

fs.writeFileSync(path.join(BASE, 'index.json'), JSON.stringify(index, null, 2));

// Write each concept file
for (const c of concepts) {
  const conceptData = {
    id: c.id,
    name: c.name,
    slug: c.id,
    summary: c.summary,
    definition: c.definition,
    aliases: c.aliases || [],
    keywords: c.keywords || [],
    sharedKnowledgeDomains: c.sharedKnowledgeDomains || [],
    relatedConcepts: c.relatedConcepts || [],
    prerequisiteConcepts: c.prerequisiteConcepts || [],
    artifactReferences: [],
    difficulty: c.difficulty,
    category: c.category,
    canonicalStatus: "Reviewed",
    version: "1.0.0",
    reviewedBy: "NV-1100-P4 Implementation",
    lastReviewed: "2026-06-24",
    sourceReferences: c.sourceReferences || [],
    examples: [],
    counterExamples: [],
    commonMisconceptions: [],
    recommendedVisualizations: [],
    recommendedLabs: []
  };
  fs.writeFileSync(path.join(CONCEPTS_DIR, `${c.id}.json`), JSON.stringify(conceptData, null, 2));
}

console.log(`Generated ${concepts.length} concept files and index.json`);
