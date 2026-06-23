/**
 * NV-1000-A8 — Obsidian & Knowledge Governance Agent
 *
 * Helps learners organize personal notes, suggest backlinks, recommend tags,
 * build concept maps, plan knowledge reviews, and explore Obsidian strategy.
 */

const KNOWLEDGE_INTENT_PATTERNS = {
  permanent_note: ['permanent note', 'evergreen', 'note template', 'create template'],
  backlink_recommendation: ['backlink', 'suggest link', 'connect notes', 'link notes'],
  tag_recommendation: ['tag', 'tags', 'hashtag', 'label notes'],
  collection_organization: ['collection', 'group notes', 'organize notes', 'grouping'],
  concept_map: ['concept map', 'textual map', 'relationship tree', 'hierarchy'],
  knowledge_gap: ['knowledge gap', 'gap', 'neighboring', 'unexplored', 'prerequisites'],
  note_refinement: ['refine', 'wording', 'better structure', 'review note'],
  atomic_splitting: ['split', 'atomic', 'divide note'],
  knowledge_review: ['review theme', 'periodic review', 'consolidate notes'],
  obsidian_strategy: ['obsidian', 'vault', 'folder', 'para', 'zettelkasten']
};

const MODE_LABELS = {
  permanent_note: 'Permanent Note Builder',
  backlink_recommendation: 'Backlink Recommendation',
  tag_recommendation: 'Tag Recommendation',
  collection_organization: 'Collection Organization',
  concept_map: 'Concept Map Generator',
  knowledge_gap: 'Knowledge Gap Exploration',
  note_refinement: 'Note Refinement Guidance',
  atomic_splitting: 'Atomic Note Splitting',
  knowledge_review: 'Incremental Knowledge Review',
  obsidian_strategy: 'Obsidian Vault Strategy'
};

const CURATED_KNOWLEDGE_MAP = {
  'machine-learning': {
    domainName: 'Machine Learning',
    permanentNote: `
# Evergreen: Linear Decision Boundaries
## Definition
A boundary determined by a linear combination of input features that separates space into class regions.

## Key Insights
- Simpler models (Logistic Regression, SVM) form linear planes.
- Less prone to overfitting on small datasets but limited in complexity.

## Examples
- 2D coordinate plane divided by a single straight line: y = mx + c.
- High-dimensional hyperplanes separating customer churn classes.

## Related Concepts
- SVM Hyperplane Alignment
- Polynomial Feature Mapping
`,
    backlinks: [
      { source: 'Linear Regression', target: 'Gradient Descent Optimization', reason: 'Linear coefficients are iteratively tuned using gradient algorithms.' },
      { source: 'L2 Regularization', target: 'Bias-Variance Trade-Off', reason: 'Adding coefficient weight constraints decreases variance at the cost of bias.' }
    ],
    tags: ['#machine-learning', '#optimization', '#linear-models', '#regularization'],
    collections: 'Foundations -> Machine Learning Basics -> Linear Estimators',
    conceptMap: `
Machine Learning
├── Supervised Learning
│   ├── Linear Models (Regression, Logistic)
│   └── Tree-Based Models (Decision Trees, Forest)
└── Unsupervised Learning
    ├── Clustering (K-Means)
    └── Dimensionality Reduction (PCA)
`,
    gap: 'Revisit "Polynomial Expansion Techniques" to see how linear models learn non-linear boundaries.',
    refinement: 'Under the "Key Insights" section, explicitly detail how scaling features impacts margin widths in linear classifiers.',
    splitting: `
Linear Boundaries Note
├── Note A: Mathematical Representation of Planes
└── Note B: Optimization Boundaries in Linear Classification
`,
    review: 'Review your notes on weight regularizations and consolidate them with your gradient descent notes.',
    strategy: 'For ML basics, keep a flat directory structures with extensive tag properties rather than nested folders.'
  },
  'deep-learning': {
    domainName: 'Deep Learning',
    permanentNote: `
# Evergreen: Activation Function Saturation
## Definition
A state where inputs to an activation function yield outputs near its boundaries, causing near-zero gradients.

## Key Insights
- Affects Sigmoid and Tanh functions at extreme positive/negative values.
- Blocks weight updates during backpropagation in deep architectures.

## Examples
- Deep MLP training stall when Sigmoid outputs lock at 1.0 or 0.0.

## Related Concepts
- Vanishing Gradients
- ReLU Dead Neurons
`,
    backlinks: [
      { source: 'Sigmoid Activation', target: 'Gradient Vanishing', reason: 'Sigmoid derivative approaches zero as inputs grow large, causing early layer gradients to vanish.' }
    ],
    tags: ['#deep-learning', '#activations', '#optimization', '#gradients'],
    collections: 'Foundations -> Neural Networks -> Activation Dynamics',
    conceptMap: `
Deep Learning
├── Activation Functions
│   ├── Saturated (Sigmoid, Tanh)
│   └── Non-Saturated (ReLU, GeLU)
└── Optimization Algorithms
    ├── Stochastic Gradient Descent
    └── Adaptive Optimizers (Adam, RMSProp)
`,
    gap: 'Examine "Weight Initialization Patterns" to learn how they help avoid early activation saturation.',
    refinement: 'Consider expanding your mathematical breakdown of backpropagation to show the chain rule term containing the activation derivative.',
    splitting: `
Activation Functions Note
├── Note A: Activation Mathematical Properties
└── Note B: Vanishing Gradient Causes and Solutions
`,
    review: 'Consolidate multiple notes discussing learning rate schedules into a single "Optimization Protocols" evergreen note.',
    strategy: 'Implement a Zettelkasten-inspired system for optimization notes, linking activation properties directly to gradient calculations.'
  },
  'computer-vision': {
    domainName: 'Computer Vision',
    permanentNote: `
# Evergreen: Spatial Invariance in CNNs
## Definition
The capacity of a convolutional neural network to recognize features regardless of their spatial location.

## Key Insights
- Achieved primarily through translation invariance in weight sharing.
- Downsampling layers (pooling) reinforce spatial abstraction.

## Examples
- Detecting a face in the corner of a frame vs in the center.
`,
    backlinks: [
      { source: 'Max Pooling', target: 'Translation Invariance', reason: 'Max pooling selects local peak activations, reducing sensitivity to exact position.' }
    ],
    tags: ['#computer-vision', '#cnn', '#pooling', '#invariance'],
    collections: 'Computer Vision -> Convolutional Networks -> Spatial Extraction',
    conceptMap: `
Computer Vision
├── Feature Extraction
│   ├── Convolutions (Kernels, Stride)
│   └── Downsampling (Max Pooling, Average Pooling)
└── Vision Systems
    ├── Object Detection (YOLO, SSD)
    └── Image Segmentation (U-Net)
`,
    gap: 'Examine "Dilated Convolutions" to understand feature extraction over wider fields without losing spatial resolution.',
    refinement: 'Add a comparison table detailing the receptive field expansion rates when using pooling vs strided convolutions.',
    splitting: `
Convolutional Layers Note
├── Note A: Weight Sharing Mechanisms
└── Note B: Pooling and Sub-Sampling Layers
`,
    review: 'Review your spatial convolution notes and draw connections to token-based patching in visual transformers.',
    strategy: 'Organize your visual concepts under a "Computer Vision" folder using Maps of Content (MOCs) to coordinate CNN and ViT notes.'
  },
  'llms': {
    domainName: 'Large Language Models',
    permanentNote: `
# Evergreen: Autoregressive Decoder Models
## Definition
Language models that generate text sequentially by predicting the next token based on all previously generated tokens.

## Key Insights
- Masked self-attention ensures tokens cannot attend to future positions during training.
- Highly scalable but computationally intensive during inference.

## Related Concepts
- Causal Masking
- Key-Value (KV) Caching
`,
    backlinks: [
      { source: 'Autoregressive Decoding', target: 'KV Caching', reason: 'KV caching avoids redundant self-attention computations over generated history.' }
    ],
    tags: ['#llms', '#transformers', '#decoders', '#generation'],
    collections: 'Engineering -> Language Architectures -> Autoregressive Models',
    conceptMap: `
Transformer Architecture
├── Encoder Blocks (BERT)
├── Decoder Blocks (GPT)
└── Encoder-Decoder (T5, BART)
`,
    gap: 'Investigate "Speculative Decoding" to see how small draft models accelerate larger decoder models.',
    refinement: 'Clarify the distinction between causal masking in decoders and bidirectional attention in encoder architectures.',
    splitting: `
Text Generation Note
├── Note A: Decoding Search Strategies (Beam Search, Greedy)
└── Note B: KV Caching Memory Demands
`,
    review: 'Consolidate multiple notes describing generation parameters (temperature, top-p, top-k) into a single "Decoding Strategy" note.',
    strategy: 'Use evergreen notes for architectural blocks (attention, feedforward) and link them to prompt engineering daily files.'
  },
  'rag': {
    domainName: 'Retrieval-Augmented Generation',
    permanentNote: `
# Evergreen: Semantic Vector Search
## Definition
Retrieving documents by calculating semantic proximity (cosine distance) between dense vector embeddings in a shared coordinate space.

## Key Insights
- Bypasses vocabulary limitations of traditional keyword matching.
- Sensitive to embedding quality and out-of-domain terms.

## Related Concepts
- Dense Retrieval
- Hierarchical Navigable Small World (HNSW)
`,
    backlinks: [
      { source: 'Semantic Search', target: 'Chunk Segmentation Strategy', reason: 'Embedding similarity relies on concise, self-contained text segments.' }
    ],
    tags: ['#rag', '#embeddings', '#vector-search', '#dense-retrieval'],
    collections: 'RAG -> Search Technologies -> Vector Search',
    conceptMap: `
RAG Pipelines
├── Document Ingestion (Chunking, Embedding)
├── Retrieval (HNSW Index, Reranking)
└── Generation (Context Packing, LLM Decoding)
`,
    gap: 'Read about "Sparse Embeddings" (e.g. BM25, Splade) to see how hybrid search combines semantic and exact keyword signals.',
    refinement: 'Include details comparing retrieval latency when using flat index comparisons vs hierarchical index routing.',
    splitting: `
Vector Indexes Note
├── Note A: Flat L2 Similarity Calculations
└── Note B: Approximate Nearest Neighbor Heuristics (HNSW, IVF)
`,
    review: 'Revisit your notes on chunk boundaries and link them directly to token context length limitations.',
    strategy: 'Create a dedicated "RAG MOC" (Map of Content) serving as a central hub linking to chunking, indexing, and generator notes.'
  },
  'agents': {
    domainName: 'AI Agents',
    permanentNote: `
# Evergreen: ReAct Agent Loop
## Definition
A paradigm that combines reasoning thoughts with task execution actions to solve multi-step problems sequentially.

## Key Insights
- Promotes step-by-step trace visibility.
- Prone to execution loops and error propagation.

## Related Concepts
- LLM Tool Calling
- Planning Trajectories
`,
    backlinks: [
      { source: 'ReAct Cycle', target: 'Tool Execution Interface', reason: 'Actions generated by the agent are mapped directly to callable API signatures.' }
    ],
    tags: ['#agents', '#react', '#planning', '#execution-loops'],
    collections: 'Engineering -> Agentic Systems -> Planning Frameworks',
    conceptMap: `
Agent Systems
├── Reasoning Loops (ReAct, Plan-and-Solve)
├── Memory Architecture (Conversational, Long-term)
└── Tool Integration (Web Search, Code Interpreter)
`,
    gap: 'Explore "Reflection Patterns" where agents critique their own intermediate outputs to correct trajectories.',
    refinement: 'Elaborate on how to structure prompt templates to prevent agents from falling into repetitive tool calling states.',
    splitting: `
Agent Planning Note
├── Note A: ReAct Planning Cycles
└── Note B: Sandbox Safety Boundaries
`,
    review: 'Verify and clean up your notes comparing static chains with dynamic graph-routed agent architectures.',
    strategy: 'Structure your agent notes using a PARA system, grouping agent design under "Projects" and planning protocols under "Areas".'
  },
  'mlops': {
    domainName: 'MLOps',
    permanentNote: `
# Evergreen: Data Distribution Drift
## Definition
Changes in the statistical properties of production input data compared to the historical training set baseline.

## Key Insights
- Degrades model performance over time.
- Measured using indicators like Population Stability Index (PSI).

## Related Concepts
- Concept Drift
- Shadow Deployments
`,
    backlinks: [
      { source: 'Data Drift', target: 'Model Registry Versioning', reason: 'Detecting data drift triggers automated retraining jobs that commit new weights to the registry.' }
    ],
    tags: ['#mlops', '#drift', '#monitoring', '#deployment'],
    collections: 'MLOps -> System Monitoring -> Drift Operations',
    conceptMap: `
MLOps Pipelines
├── Training & CI (Data Versioning, Testing)
├── Deployment (Shadow Traffic, Canaries)
└── Monitoring (Data Drift, Concept Drift, Latency)
`,
    gap: 'Look into "Shadow Traffic Validation" to understand how it collects drift metrics on candidate models without production impact.',
    refinement: 'Include formulas or algorithms for computing PSI values to measure the divergence of serving inputs.',
    splitting: `
Model Monitoring Note
├── Note A: Drift Detection Statistics (PSI, KS Test)
└── Note B: Shadow Rollout Architecture
`,
    review: 'Review your notes on feature store ingestion and link them to model training pipeline triggers.',
    strategy: 'Organize MLOps notes with a functional structure, splitting concepts into "Data Engineering", "Model Delivery", and "Monitoring Systems".'
  }
};

function createObsidianKnowledgeGovernanceAgent() {
  const responseCache = new Map();

  function initialize() {
    return Promise.resolve({ status: 'ready', modes: Object.keys(MODE_LABELS).length });
  }

  function canHandle(context) {
    return Boolean(context?.userQuery || context?.selectedArtifact || context?.selectedLesson);
  }

  async function run(context = {}, options = {}) {
    await initialize();
    const query = context.userQuery || '';
    const mode = options.mode || detectIntent(query);
    const topic = resolveTopic(context, query);
    const domain = resolveDomain(topic, query);
    const cacheKey = JSON.stringify({ mode, topic, domain, query: normalizeQuery(query) });

    if (responseCache.has(cacheKey)) return cloneWithTimestamp(responseCache.get(cacheKey));

    const result = buildResponse(mode, topic, domain, context, query);
    responseCache.set(cacheKey, result);
    return cloneWithTimestamp(result);
  }

  function detectIntent(query) {
    const lower = ` ${(query || '').toLowerCase()} `;
    for (const [intent, patterns] of Object.entries(KNOWLEDGE_INTENT_PATTERNS)) {
      if (patterns.some((pattern) => lower.includes(pattern))) return intent;
    }
    return 'permanent_note';
  }

  function buildResponse(mode, topic, domain, context, query) {
    const sections = addRequiredKnowledgeSections(buildSectionsForMode(mode, topic, domain, context, query), mode, topic, domain);
    return {
      agentId: 'obsidian-knowledge-governance',
      agentName: 'Obsidian & Knowledge Governance Agent',
      mode,
      modeLabel: MODE_LABELS[mode] || 'Knowledge Architect',
      topic,
      domain,
      reasoningStrategy: `Advise on personal note structures, backlinks, tags, and Obsidian layout strategies for ${topic} without curriculum mutation.`,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: 'Personal knowledge management recommendations only. Canonical curriculum files remain unmodified.'
    };
  }

  function buildSectionsForMode(mode, topic, domain, context, query) {
    const builders = {
      permanent_note: () => buildPermanentNote(topic, domain),
      backlink_recommendation: () => buildBacklinks(topic, domain),
      tag_recommendation: () => buildTags(topic, domain),
      collection_organization: () => buildCollections(topic, domain),
      concept_map: () => buildConceptMap(topic, domain),
      knowledge_gap: () => buildKnowledgeGap(topic, domain),
      note_refinement: () => buildNoteRefinement(topic, domain),
      atomic_splitting: () => buildAtomicSplitting(topic, domain),
      knowledge_review: () => buildKnowledgeReview(topic, domain),
      obsidian_strategy: () => buildObsidianStrategy(topic, domain)
    };
    return (builders[mode] || builders.permanent_note)();
  }

  function buildPermanentNote(topic, domain) {
    const data = getDomainData(domain);
    return [
      knowledgeCard('Evergreen Note Template', `Template structure for **${topic}** ready to copy to your personal Zettelkasten.`),
      { title: 'Zettelkasten Template Layout', type: 'text', content: data.permanentNote },
      { title: 'Creation Guideline', type: 'text', content: 'Copy this layout to your Obsidian vault. Customize the key insights using your own words.' }
    ];
  }

  function buildBacklinks(topic, domain) {
    const data = getDomainData(domain);
    return [
      knowledgeCard('Backlink Suggestions', `Improve connectivity in your personal vault for **${topic}**.`),
      {
        title: 'Recommended Vault Links',
        type: 'text',
        content: data.backlinks.map((lnk) => `- Link **[[${lnk.source}]]** to **[[${lnk.target}]]**\n  *Why*: ${lnk.reason}`).join('\n\n')
      }
    ];
  }

  function buildTags(topic, domain) {
    const data = getDomainData(domain);
    return [
      knowledgeCard('Tag Recommendations', `Semantic tagging structure for **${topic}** notes.`),
      { title: 'Tags to Apply', type: 'text', content: data.tags.map(t => `- \`${t}\``).join('\n') },
      { title: 'Taxonomy Note', type: 'text', content: 'These tags align with standard machine learning classifications, ensuring discoverability across tag search indices.' }
    ];
  }

  function buildCollections(topic, domain) {
    const data = getDomainData(domain);
    return [
      knowledgeCard('Collection Paths', `Suggested categorization folder structure for **${topic}**.`),
      { title: 'Category Tree Hierarchy', type: 'text', content: `**Hierarchy**: \`${data.collections}\`` },
      { title: 'Organization Philosophy', type: 'text', content: 'Folder hierarchies remain local and advisory. Balance folders with extensive tags to keep vault structures flat.' }
    ];
  }

  function buildConceptMap(topic, domain) {
    const data = getDomainData(domain);
    return [
      knowledgeCard('Textual Concept Map', `Visual topology outline mapping concepts surrounding **${topic}**.`),
      { title: 'Concept Relationship Tree', type: 'text', content: `\`\`\`text\n${data.conceptMap}\n\`\`\`` }
    ];
  }

  function buildKnowledgeGap(topic, domain) {
    const data = getDomainData(domain);
    return [
      knowledgeCard('Neighboring Explorations', `Potential concept gaps surrounding **${topic}**.`),
      { title: 'Next Concept Targets', type: 'text', content: data.gap },
      { title: 'Study Strategy', type: 'text', content: 'Review the lessons for these neighboring concepts to build context before writing new notes.' }
    ];
  }

  function buildNoteRefinement(topic, domain) {
    const data = getDomainData(domain);
    return [
      knowledgeCard('Note Refinement Feedback', `Suggestions to improve clarity of your **${topic}** notes.`),
      { title: 'Suggested Adjustments', type: 'text', content: data.refinement },
      { title: 'Refinement Checklist', type: 'text', content: '- Do you have concrete coding examples?\n- Is the mathematical foundation explicitly detailed?' }
    ];
  }

  function buildAtomicSplitting(topic, domain) {
    const data = getDomainData(domain);
    return [
      knowledgeCard('Atomic Note Partitioning', `Separate mixed topics under **${topic}** into concise, modular files.`),
      { title: 'Suggested Splits', type: 'text', content: `\`\`\`text\n${data.splitting}\n\`\`\`` },
      { title: 'Splitting Rationale', type: 'text', content: 'Zettelkasten notes should focus on a single concept, maximizing link density and reuse.' }
    ];
  }

  function buildKnowledgeReview(topic, domain) {
    const data = getDomainData(domain);
    return [
      knowledgeCard('Knowledge Consolidation Activity', `Review and consolidate notes related to **${topic}**.`),
      { title: 'Consolidation Prompt', type: 'text', content: data.review },
      { title: 'Review Goal', type: 'text', content: 'Consolidate terminology across duplicate files to avoid layout decay.' }
    ];
  }

  function buildObsidianStrategy(topic, domain) {
    const data = getDomainData(domain);
    return [
      knowledgeCard('Obsidian Vault Strategy', `Structure advice for notes related to **${topic}**.`),
      { title: 'Vault Layout Recommendation', type: 'text', content: data.strategy },
      { title: 'Layout Alternatives', type: 'text', content: '- Flat Folder layout with strict tag parameters\n- PARA folder separation (Projects, Areas, Resources, Archives)\n- MOC (Map of Content) directory pages linking notes' }
    ];
  }

  function addRequiredKnowledgeSections(sections, mode, topic, domain) {
    const data = getDomainData(domain);
    return [
      { title: 'Knowledge Objective', type: 'knowledge-card', content: `Mode: **${MODE_LABELS[mode]}**\nTopic: **${topic}**\nDomain Context: **${data.domainName}**\nEstablish durable knowledge files without editing the canonical curriculum.` },
      ...sections,
      { title: 'Why This Organization Helps', type: 'text', content: 'Proper tag boundaries and semantic backlinks reduce cognitive load and enhance retrieval discoverability in personal vaults.' },
      { title: 'Potential Alternatives', type: 'text', content: 'You can use flat tags instead of nested folders, or build central MOCs rather than extensive inline linking chains.' },
      { title: 'Maintenance Considerations', type: 'text', content: 'Keep notes short and atomic to prevent links from breaking when renaming files inside Obsidian.' },
      { title: 'Suggested Next Connection', type: 'text', content: 'Connect this note to your central dashboard or home MOC to integrate it into your primary study path.' }
    ];
  }

  function knowledgeCard(title, content) {
    return { title, type: 'knowledge-card', content };
  }

  function getDomainData(domain) {
    return CURATED_KNOWLEDGE_MAP[domain] || {
      domainName: 'Systems Engineering Foundations',
      permanentNote: `
# Evergreen: Interface Decoupling
## Definition
Designing software components to communicate via interfaces, isolating them from concrete implementations.

## Key Insights
- Maximizes testability and pluggability.
- Reduces dependency graph density.

## Related Concepts
- Dependency Inversion
- Interface Segregation
`,
      backlinks: [
        { source: 'Interface Spec', target: 'Dependency Injection', reason: 'Injecting dependency structures is simpler when using interface abstractions.' }
      ],
      tags: ['#systems-engineering', '#decoupling', '#architecture', '#interfaces'],
      collections: 'Foundations -> Software Architecture -> Decoupled Systems',
      conceptMap: `
Software Design
├── Component Isolation
│   ├── Interfaces & Contracts
│   └── Dependency Injection
└── System Coupling
    ├── Tight Coupling (Direct Import)
    └── Loose Coupling (Event Bus)
`,
      gap: 'Explore "Service Registry Patterns" to see how discovery services map decoupled interfaces dynamically.',
      refinement: 'Under the interfaces section, specify the trade-offs of interface changes in distributed microservices.',
      splitting: `
System Coupling Note
├── Note A: Tight vs Loose Coupling Metrics
└── Note B: Event-Driven Indirection Patterns
`,
      review: 'Consolidate multiple notes discussing component patterns into a central "Design Patterns MOC".',
      strategy: 'For architecture vaults, organize notes into directories mapped to system levels (Data, Logic, Interface).'
    };
  }

  function resolveDomain(topic, query) {
    const lower = `${topic} ${query}`.toLowerCase();
    if (lower.includes('mlops') || lower.includes('monitoring') || lower.includes('drift')) return 'mlops';
    if (lower.includes('llm') || lower.includes('gpt') || lower.includes('copilot') || lower.includes('decoder')) return 'llms';
    if (lower.includes('rag') || lower.includes('retrieval') || lower.includes('vector search')) return 'rag';
    if (lower.includes('agent') || lower.includes('react') || lower.includes('planning')) return 'agents';
    if (lower.includes('vision') || lower.includes('image') || lower.includes('cnn') || lower.includes('pooling')) return 'computer-vision';
    if (lower.includes('deep learning') || lower.includes('activations') || lower.includes('gradients')) return 'deep-learning';
    if (lower.includes('machine learning') || lower.includes('linear') || lower.includes('boundary') || lower.includes('regularization')) return 'machine-learning';
    return 'general-systems';
  }

  function resolveTopic(context, query) {
    return context.selectedArtifact?.title || context.selectedLesson?.title || context.selectedModule?.title || context.selectedPath?.title || extractTopicFromQuery(query) || 'current concept';
  }

  function extractTopicFromQuery(query) {
    const cleaned = (query || '').replace(/what are|what is|show me|explain|permanent note|backlinks|tags|collections|concept map|knowledge gap|refine|split|review theme|obsidian/ig, '').replace(/[?!.]/g, '').trim();
    return cleaned ? titleCase(cleaned) : null;
  }

  function normalizeQuery(query) {
    return (query || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function titleCase(value) {
    return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  function cloneWithTimestamp(result) {
    return { ...JSON.parse(JSON.stringify(result)), timestamp: new Date().toISOString() };
  }

  function getAvailableModes() {
    return Object.keys(MODE_LABELS);
  }

  function getCacheStats() {
    return { entries: responseCache.size };
  }

  return { initialize, canHandle, run, detectIntent, getAvailableModes, getCacheStats };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.obsidianKnowledgeGovernanceAgent = createObsidianKnowledgeGovernanceAgent();
}

export { createObsidianKnowledgeGovernanceAgent };
