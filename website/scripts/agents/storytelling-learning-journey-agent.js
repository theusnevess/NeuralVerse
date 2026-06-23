/**
 * NV-1000-A9 — Storytelling & Learning Journey Agent
 *
 * Provides historical narratives, evolution timelines, conceptual models,
 * cross-lesson continuity, and motivational guidance without curriculum mutation.
 */

const NARRATIVE_INTENT_PATTERNS = {
  origin_story: ['origin', 'why invented', 'history', 'how emerged', 'who created'],
  learning_journey: ['journey', 'learning path', 'conceptual progression', 'intermediate', 'frontier'],
  problem_driven: ['problem', 'challenge', 'failed approach', 'limitation', 'engineering challenge'],
  concept_timeline: ['timeline', 'chronological', 'stages', 'evolution timeline'],
  human_perspective: ['human', 'practitioner', 'researcher perspective'],
  cross_lesson: ['connect previous', 'lesson build', 'dependencies', 'dependency'],
  mental_model: ['mental model', 'analogy', 'metaphor', 'library system'],
  scientific_journey: ['scientific evolution', 'field evolved', 'symbolic ai', 'hand-crafted'],
  motivation_relevance: ['why learn', 'matters', 'opportunities', 'practical questions'],
  personalized_orientation: ['orient next', 'completed', 'next major leap']
};

const MODE_LABELS = {
  origin_story: 'Origin Story',
  learning_journey: 'Learning Journey Narrative',
  problem_driven: 'Problem-Driven Storytelling',
  concept_timeline: 'Concept Evolution Timeline',
  human_perspective: 'Human-Centered Explanation',
  cross_lesson: 'Cross-Lesson Continuity',
  mental_model: 'Mental Model Construction',
  scientific_journey: 'Scientific Journey',
  motivation_relevance: 'Motivation & Relevance',
  personalized_orientation: 'Personalized Learning Orientation'
};

const CURATED_NARRATIVE_MAP = {
  'machine-learning': {
    domainName: 'Machine Learning',
    origin: `
In the mid-20th century, traditional programmers had to hardcode every logical rule to solve problems (Symbolic AI). However, tasks like handwriting recognition proved too complex for rule-based programming because variations were infinite. This limitation motivated Arthur Samuel and other pioneers in the 1950s to invent machine learning—a paradigm where computers adjust parameters based on data to learn rules automatically.
`,
    journey: `
1. **Foundations**: Statistical estimation and linear regression models.
2. **Intermediate**: Support Vector Machines and kernel space mapping.
3. **Current**: Decoupled decision boundaries and gradient updates.
4. **Advanced**: Feature space representations in deep architectures.
`,
    problem: `
- **Challenge**: Programming complex visual character recognition.
- **Failed Approach**: Writing thousands of manual if-else conditional branches.
- **Key Insight**: Model the problem as optimization over a parameterized mathematical boundary.
- **New Solution**: Stochastic gradient descent tuning model coefficients.
`,
    timeline: `
- **1950s**: Arthur Samuel coined "Machine Learning" and built checker-playing models.
- **1960s**: Development of simple linear classifiers (Perceptrons).
- **1980s**: Multi-layer training breakthroughs using backpropagation.
- **2000s**: SVMs and kernel tricks dominate tabular datasets.
`,
    human: `
When practitioners design machine learning solutions, they think like statistical investigators. They do not assume a fixed, correct mathematical program; instead, they examine data distributions, identify biases, and let optimization algorithms discover coefficients.
`,
    continuity: `
Today's linear boundaries lesson builds on coordinate system projections. Understanding hyperplane projections prepares you for high-dimensional support vector machines in the next lesson.
`,
    mental: `
- **Metaphor**: A decision boundary is like a fence built on a coordinate landscape, separating apples from oranges.
- **Limitations**: In high-dimensional spaces, boundaries are complex manifolds that cannot be visualized like a simple 2D fence.
`,
    science: `
The field transitioned from manually engineered statistical tests to parametric models that adjust internal coefficients automatically, laying the foundation for modern artificial intelligence systems.
`,
    motivation: `
Learning machine learning principles empowers you to solve prediction tasks where explicit rules are impossible to write. It enables software to adapt to live telemetry and data changes in production.
`,
    orientation: `
You have examined linear decision boundaries. This connects naturally to support vector machines. The next major conceptual leap is optimizing margin widths.
`
  },
  'deep-learning': {
    domainName: 'Deep Learning',
    origin: `
As datasets and image resolutions scaled in the 2000s, shallow models like SVMs stalled because they required manual feature engineering (e.g. Sobel filters). This limitation led Yann LeCun, Yoshua Bengio, and Geoffrey Hinton to pioneer deep learning—stacking multiple layers of artificial neurons to learn hierarchical feature representations directly from raw data.
`,
    journey: `
1. **Foundations**: Feedforward Multi-Layer Perceptrons.
2. **Intermediate**: Backpropagation and activation mathematics.
3. **Current**: Layered activations and gradient propagation.
4. **Advanced**: Transformer blocks and self-attention dynamics.
`,
    problem: `
- **Challenge**: Automatically extracting abstract features from high-dimensional inputs.
- **Failed Approach**: Designing manual feature extractors like SIFT or HOG.
- **Key Insight**: Build nested mathematical transformations that compose low-level patterns into high-level features.
- **New Solution**: Backpropagating errors through deep layered networks.
`,
    timeline: `
- **1986**: Backpropagation popularized for multi-layer perceptron training.
- **1998**: LeNet architecture establishes convolutional pipelines.
- **2012**: AlexNet wins ImageNet, triggering the deep learning revolution.
- **2017**: Transformer architecture emerges, replacing recurrent architectures.
`,
    human: `
Deep learning engineers visualize models as computational graphs where information flows forward and gradients flow backward. They focus on gradient health, monitoring activations to prevent vanishing or exploding gradients.
`,
    continuity: `
Deep learning builds directly on multi-layer perceptron units. In the next modules, you will explore convolutions and temporal recurrences.
`,
    mental: `
- **Metaphor**: Backpropagation is like a chain of supervisors passing performance reviews backward to update lower-level workers.
- **Limitations**: The brain uses local, biological updates, whereas backpropagation uses centralized, exact mathematical chain rule computations.
`,
    science: `
Deep learning represents the shift from hand-crafted features to end-to-end representation learning, changing how computer vision, speech, and translation systems operate.
`,
    motivation: `
Deep learning allows you to process high-dimensional unstructured data (images, audio, text) directly, bypassing manual processing pipelines.
`,
    orientation: `
You have studied activation dynamics. This connects naturally to backpropagation algorithms. The next major conceptual leap is optimization convergence.
`
  },
  'computer-vision': {
    domainName: 'Computer Vision',
    origin: `
Early computer vision relied on exact pixel matching and geometric transforms, which broke down under lighting or pose variations. This limitation motivated researchers in the 1990s to design convolutional neural networks (CNNs), which share weights across sliding receptive fields to capture translation-invariant patterns like edges and textures.
`,
    journey: `
1. **Foundations**: Hand-crafted filters (Sobel, Canny).
2. **Intermediate**: Convolution layers and feature maps.
3. **Current**: Spatial pooling and weight sharing.
4. **Advanced**: Vision Transformers (ViT) and patch-based self-attention.
`,
    problem: `
- **Challenge**: Recognizing objects in images under arbitrary scaling and translations.
- **Failed Approach**: Designing templates for every possible spatial configuration.
- **Key Insight**: Slide local filters across the image plane to extract invariant features.
- **New Solution**: Stacking convolution and pooling layers in hierarchical networks.
`,
    timeline: `
- **1980**: Neocognitron architecture introduces spatial invariance ideas.
- **1998**: LeNet-5 establishes convolutional networks for handwriting checks.
- **2012**: AlexNet demonstrates massive scalability using GPUs.
- **2020**: Vision Transformers (ViT) apply self-attention directly to image patches.
`,
    human: `
Vision researchers think in terms of spatial receptive fields. They map how deep layers build abstract representations, tracing the network's gaze back to raw pixels.
`,
    continuity: `
Convolutional layers build on basic spatial filters. This prepares you for deep residual connections and multi-scale object detection modules.
`,
    mental: `
- **Metaphor**: A CNN is like a group of local inspectors scanning an image with magnifying glasses, checking for specific shapes.
- **Limitations**: Unlike humans, CNNs are highly sensitive to high-frequency noise and lack global conceptual understanding.
`,
    science: `
The domain evolved from hand-crafted spatial filters (Sobel, Gabor) to convolutional architectures, and finally to attention-based patch transformers.
`,
    motivation: `
Understanding computer vision enables systems to interpret visual data automatically, powering robotics, medical imaging, and automated driving.
`,
    orientation: `
You have analyzed spatial convolutions. This connects to pooling layers. The next major conceptual leap is downsampling feature dimensions.
`
  },
  'llms': {
    domainName: 'Large Language Models',
    origin: `
Recurrent Neural Networks (RNNs) processed text word-by-word, which created a bottleneck since long-term context was lost over long sequences, and training could not be parallelized. This motivated Google researchers in 2017 to invent the Transformer architecture, using self-attention to process entire sequences simultaneously and capture context regardless of distance.
`,
    journey: `
1. **Foundations**: N-gram models and statistical language representations.
2. **Intermediate**: Word Embeddings (Word2Vec) and Recurrent Networks.
3. **Current**: Attention mechanisms and Transformer blocks.
4. **Advanced**: Prompt engineering, instruction tuning, and agent loops.
`,
    problem: `
- **Challenge**: Capturing dependencies between words in long sentences.
- **Failed Approach**: Sequential recurrent state updates (LSTMs).
- **Key Insight**: Let every word dynamically look at and weigh every other word in the sequence.
- **New Solution**: Multi-Head Self-Attention layers optimized on massive text corpora.
`,
    timeline: `
- **2013**: Word2Vec captures semantic relations as vector directions.
- **2017**: Transformer paper ("Attention is All You Need") published.
- **2018**: BERT (Encoder) and GPT-1 (Decoder) show scaling properties.
- **2020**: GPT-3 demonstrates zero-shot and few-shot capabilities.
`,
    human: `
LLM engineers evaluate model performance in terms of token probability distributions. They design optimization pipelines that predict the next token while monitoring vocabulary limits.
`,
    continuity: `
Today's attention mechanism lesson extends the feedforward concepts we studied earlier. This leads directly to causal masking in generative decoders.
`,
    mental: `
- **Metaphor**: Self-attention is like a cocktail party where every guest listens to every conversation and focuses only on people speaking about relevant topics.
- **Limitations**: Transformers process tokens based on statistics, lacking a persistent internal world model or conscious logic.
`,
    science: `
The field shifted from local statistical language patterns (n-grams) to continuous dense embeddings, culminating in unified generative transformer models.
`,
    motivation: `
Mastering LLM architecture allows you to build systems that analyze, summarize, and generate natural language at scale.
`,
    orientation: `
You have completed the self-attention block. This connects to causal masking. The next major conceptual leap is autoregressive decoding.
`
  },
  'rag': {
    domainName: 'Retrieval-Augmented Generation',
    origin: `
Large Language Models, while fluent, frequently hallucinate facts when queried on dynamic or private data, and retraining them is prohibitively expensive. This limitation led Patrick Lewis and Meta researchers in 2020 to introduce Retrieval-Augmented Generation (RAG)—coupling a parametric generator (LLM) with a non-parametric retriever (vector database) to fetch factual context before generation.
`,
    journey: `
1. **Foundations**: Keyword searches and database indexing.
2. **Intermediate**: Embedding generation and vector spaces.
3. **Current**: Hybrid search and retriever integration.
4. **Advanced**: Agentic retrieval, active routing, and query rewriting.
`,
    problem: `
- **Challenge**: Grounding LLM responses in external, factual documents.
- **Failed Approach**: Fine-tuning models on rapidly changing documentation.
- **Key Insight**: Inject retrieved, relevant text snippets directly into the prompt template.
- **New Solution**: Encoding documents into dense vector spaces and matching query embeddings in real time.
`,
    timeline: `
- **2020**: Meta researchers publish the canonical RAG architecture paper.
- **2021**: Hierarchical vector indexes (HNSW) enable low-latency searches.
- **2022**: Advanced retrieval strategies (reranking, metadata filters) enter production.
- **2024**: Agentic RAG structures emerge, allowing iterative retrieval cycles.
`,
    human: `
RAG practitioners design search systems that optimize search relevance and retrieval precision. They balance the trade-offs of embedding model costs against exact keyword matching.
`,
    continuity: `
Our retrieval lesson builds on dense embedding representations. It prepares you for query translation and reranking optimizations in the next lesson.
`,
    mental: `
- **Metaphor**: RAG is like an open-book exam where the student (LLM) looks up relevant pages in a textbook (Vector Database) before writing an answer.
- **Limitations**: If the textbook contains incorrect information or the index points to the wrong page, the student will write an incorrect answer.
`,
    science: `
RAG represents the shift from parametric-only model generation to hybrid systems combining static knowledge weights with dynamic retrieval databases.
`,
    motivation: `
Building RAG architectures enables you to deploy LLMs in production environments that require strict factual correctness and access to private databases.
`,
    orientation: `
You have analyzed basic vector retrieval. This connects to reranking layers. The next major conceptual leap is query classification.
`
  },
  'agents': {
    domainName: 'AI Agents',
    origin: `
Early LLM integrations were passive, answering queries in a single turn without the ability to plan, use tools, or correct errors. This limitation motivated Yao et al. in 2022 to introduce the ReAct (Reason + Act) paradigm—allowing models to generate reasoning traces, choose tools, and observe environment outputs iteratively to solve complex tasks.
`,
    journey: `
1. **Foundations**: Simple chatbot single-turn templates.
2. **Intermediate**: Tool calling APIs and system prompts.
3. **Current**: ReAct loop architectures and planning steps.
4. **Advanced**: Multi-agent orchestration and autonomous coding graphs.
`,
    problem: `
- **Challenge**: Enabling language models to execute multi-step reasoning workflows autonomously.
- **Failed Approach**: Writing complex hardcoded logic loops around prompt responses.
- **Key Insight**: Let the model generate both the next thinking step and the tool call parameters.
- **New Solution**: Implementing reasoning-execution loops like ReAct and Plan-and-Solve.
`,
    timeline: `
- **2022**: ReAct paper demonstrates how reasoning traces improve tool calling success.
- **2023**: AutoGPT and BabyAGI spark interest in autonomous agent loops.
- **2023**: Tool Use APIs are natively integrated into LLM provider backends.
- **2024**: Multi-agent frameworks (LangGraph, Autogen) model complex graph flows.
`,
    human: `
Agent engineers design systems with clean interfaces, sandboxed environments, and feedback loops. They monitor token cost, trace planning cycles, and set up guardrails against infinite execution loops.
`,
    continuity: `
Agent loops extend the core capabilities of LLMs. In the next section, you will examine multi-agent delegation architectures.
`,
    mental: `
- **Metaphor**: An agent loop is like an engineer sitting at a terminal, running a command, reading the error, and correcting their code before running it again.
- **Limitations**: Agents lack genuine intuition; they act based on prompt instructions and statistical next-token predictions, making them prone to looping.
`,
    science: `
The domain transitioned from passive text prediction models to active decision-making loops that interact with external operating systems and APIs.
`,
    motivation: `
Developing agentic architectures allows you to automate complex, multi-step engineering tasks that require tool interaction and self-correction.
`,
    orientation: `
You have examined reasoning loops. This connects to tool calling interfaces. The next major conceptual leap is persistent state memory.
`
  },
  'mlops': {
    domainName: 'MLOps',
    origin: `
Historically, models were developed in Jupyter notebooks, but frequently failed in production because of environment changes, distribution drift, or lack of automated testing. This disconnect motivated engineers to establish MLOps—combining software engineering (DevOps) and machine learning to build continuous training, deployment, and monitoring systems.
`,
    journey: `
1. **Foundations**: Notebooks and manual deployments.
2. **Intermediate**: Dockerization and versioning datasets.
3. **Current**: Continuous training and automated pipelines.
4. **Advanced**: Feature stores and edge model registries.
`,
    problem: `
- **Challenge**: Deploying models to production environments reliably while keeping them aligned with incoming data.
- **Failed Approach**: Copying model weight files manually to production servers.
- **Key Insight**: Treat machine learning assets (data, code, hyperparameters) as version-controlled resources.
- **New Solution**: Continuous integration and automated retraining pipelines.
`,
    timeline: `
- **2015**: Google paper ("Hidden Technical Debt in Machine Learning Systems") published.
- **2018**: MLflow and DVC emerge to track experiments and version datasets.
- **2020**: Focus shifts to online monitoring (data drift, bias tests).
- **2022**: Feature stores unify training and inference data paths.
`,
    human: `
MLOps engineers evaluate models through system health parameters like latency, throughput, and distribution stability. They automate workflows to ensure models remain reliable.
`,
    continuity: `
Today's pipeline lesson builds on model deployment. In the next lesson, we will look at model registration and rollback policies.
`,
    mental: `
- **Metaphor**: An MLOps pipeline is like an automated water treatment plant, constantly checking water quality (Data Drift) and adjusting filters (Retraining) automatically.
- **Limitations**: Automated pipelines can trigger expensive retraining loops on corrupted inputs if validation rules are poorly configured.
`,
    science: `
The discipline shifted from manual, experimental notebooks to structured, automated systems engineering lifecycles.
`,
    motivation: `
Understanding MLOps ensures your machine learning solutions remain stable, operational, and accurate in production.
`,
    orientation: `
You have completed the pipeline design block. This connects to model monitoring. The next major conceptual leap is data validation rules.
`
  }
};

function createStorytellingLearningJourneyAgent() {
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
    for (const [intent, patterns] of Object.entries(NARRATIVE_INTENT_PATTERNS)) {
      if (patterns.some((pattern) => lower.includes(pattern))) return intent;
    }
    return 'origin_story';
  }

  function buildResponse(mode, topic, domain, context, query) {
    const sections = addRequiredNarrativeSections(buildSectionsForMode(mode, topic, domain, context, query), mode, topic, domain);
    return {
      agentId: 'storytelling-learning-journey',
      agentName: 'Storytelling & Learning Journey Agent',
      mode,
      modeLabel: MODE_LABELS[mode] || 'Academic Storyteller',
      topic,
      domain,
      reasoningStrategy: `Contextualize ${topic} using factual histories, conceptual timelines, and structured evolution narratives.`,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: 'Factual historical narratives only. Curriculum files remain unmodified.'
    };
  }

  function buildSectionsForMode(mode, topic, domain, context, query) {
    const builders = {
      origin_story: () => buildOriginStory(topic, domain),
      learning_journey: () => buildLearningJourney(topic, domain),
      problem_driven: () => buildProblemDriven(topic, domain),
      concept_timeline: () => buildConceptTimeline(topic, domain),
      human_perspective: () => buildHumanPerspective(topic, domain),
      cross_lesson: () => buildCrossLesson(topic, domain),
      mental_model: () => buildMentalModel(topic, domain),
      scientific_journey: () => buildScientificJourney(topic, domain),
      motivation_relevance: () => buildMotivationRelevance(topic, domain),
      personalized_orientation: () => buildPersonalizedOrientation(topic, domain)
    };
    return (builders[mode] || builders.origin_story)();
  }

  function buildOriginStory(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Origin Story', `Historical context detailing how the concept of **${topic}** emerged.`),
      { title: 'The Historical Narrative', type: 'text', content: data.origin }
    ];
  }

  function buildLearningJourney(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Learning Journey Arc', `Conceptual path mapping your learning journey through **${topic}**.`),
      { title: 'Learning Pathway Steps', type: 'text', content: data.journey }
    ];
  }

  function buildProblemDriven(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Problem Frame', `Framing **${topic}** around fundamental engineering challenges.`),
      { title: 'The Engineering Narrative', type: 'text', content: data.problem }
    ];
  }

  function buildConceptTimeline(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Concept Timeline', `Chronological milestones of paradigms surrounding **${topic}**.`),
      { title: 'Chronological Milestones', type: 'text', content: data.timeline }
    ];
  }

  function buildHumanPerspective(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Practitioner Perspective', `Understanding how researchers and engineers conceptualize **${topic}**.`),
      { title: 'Inside the Practitioner\'s Mind', type: 'text', content: data.human }
    ];
  }

  function buildCrossLesson(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Lesson Connections', `Bridges connecting **${topic}** to surrounding lessons.`),
      { title: 'Cross-Lesson Dependencies', type: 'text', content: data.continuity }
    ];
  }

  function buildMentalModel(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Mental Metaphor', `memorable analogies to help internalize **${topic}**.`),
      { title: 'Conceptual Analogy', type: 'text', content: data.mental }
    ];
  }

  function buildScientificJourney(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Scientific Paradigm Shift', `Evolution of the scientific field surrounding **${topic}**.`),
      { title: 'Scientific History', type: 'text', content: data.science }
    ];
  }

  function buildMotivationRelevance(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Motivation & Relevance', `Why mastering **${topic}** is critical in production systems.`),
      { title: 'Why This Matters', type: 'text', content: data.motivation }
    ];
  }

  function buildPersonalizedOrientation(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Next Learning Step', `Advisory roadmap outlining what concepts lie ahead of **${topic}**.`),
      { title: 'Orientation Steps', type: 'text', content: data.orientation }
    ];
  }

  function addRequiredNarrativeSections(sections, mode, topic, domain) {
    const data = getDomainData(domain);
    return [
      { title: 'Narrative Objective', type: 'narrative-card', content: `Mode: **${MODE_LABELS[mode]}**\nTopic: **${topic}**\nDomain: **${data.domainName}**\nGoal: Contextualize conceptual foundations using fact-grounded narratives.` },
      ...sections,
      { title: 'Historical/Factual Basis', type: 'text', content: 'This narrative is constructed from peer-reviewed scientific literature and documented engineering paradigms.' },
      { title: 'Metaphorical Elements', type: 'text', content: 'We employ analogies to represent mathematical concepts visually without mutating underlying formulas.' },
      { title: 'Limitations', type: 'text', content: 'Simplified mental metaphors serve only as temporary conceptual bridges and cannot replace exact mathematical implementations.' },
      { title: 'Suggested Follow-up Topic', type: 'text', content: `Read the next lesson in the curriculum to explore this concept's formal applications.` }
    ];
  }

  function narrativeCard(title, content) {
    return { title, type: 'narrative-card', content };
  }

  function getDomainData(domain) {
    return CURATED_NARRATIVE_MAP[domain] || {
      domainName: 'Systems Engineering Foundations',
      origin: `
Traditional software modularity concepts emerged in the 1960s to address the spaghetti-code software crisis. The introduction of structured interfaces allowed engineers to decouple execution paths, transforming programming into a repeatable engineering discipline.
`,
      journey: `
1. **Foundations**: Monolithic program routines.
2. **Intermediate**: Structured subroutines and local function calls.
3. **Current**: Decoupled component interfaces.
4. **Advanced**: Event-driven microservice meshes.
`,
      problem: `
- **Challenge**: Building scalable systems that can be updated concurrently.
- **Failed Approach**: Compiling all systems into a single tight global binary.
- **Key Insight**: Program to abstract interfaces instead of concrete classes.
- **New Solution**: Decoupled dynamic dependencies.
`,
      timeline: `
- **1968**: NATO Conference defines the term "Software Engineering".
- **1972**: David Parnas introduces criteria for modular software partition.
- **1994**: Design Patterns book formalizes decoupling structures.
`,
      human: `
Systems architects view applications as sets of interacting nodes. They measure dependency coupling densities and prioritize interface stability above all.
`,
      continuity: `
Decoupled interfaces build on functions and subroutines. Understanding this prepares you for dependency injection frameworks in the next lesson.
`,
      mental: `
- **Metaphor**: Decoupled components are like standardized wall plugs; any appliance fitting the plug can draw power without knowing the plant source.
- **Limitations**: Real interfaces have state transitions and network failures that simpler wall plugs do not model.
`,
      science: `
Systems engineering transitioned from static compiled structures to modular architectures, and finally to decentralized, containerized environments.
`,
      motivation: `
Mastering component decoupling ensures your systems remain modular, testable, and maintainable over decades of service.
`,
      orientation: `
You have analyzed interface decoupling. This connects to dependency injection. The next major conceptual leap is service discovery.
`
    };
  }

  function resolveDomain(topic, query) {
    const lower = `${topic} ${query}`.toLowerCase();
    if (lower.includes('mlops') || lower.includes('monitoring') || lower.includes('drift') || lower.includes('pipeline')) return 'mlops';
    if (lower.includes('llm') || lower.includes('gpt') || lower.includes('transformer') || lower.includes('attention')) return 'llms';
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
    const cleaned = (query || '').replace(/what are|what is|show me|explain|origin story|learning journey|problem|timeline|human|connect previous|mental model|scientific evolution|why learn|orient next/ig, '').replace(/[?!.]/g, '').trim();
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
  window.NeuralVerse.storytellingLearningJourneyAgent = createStorytellingLearningJourneyAgent();
}

export { createStorytellingLearningJourneyAgent };
