/**
 * NV-1000-A6 — Application & Professional Transfer Agent
 *
 * Offline, deterministic senior engineering mentor bridging curriculum concepts
 * to real-world production systems, engineering decisions, trade-offs, and scaling.
 */

const TRANSFER_INTENT_PATTERNS = {
  real_world_applications: ['application', 'real-world', 'industry', 'use case', 'where is this used', 'enterprise', 'production use'],
  production_architecture: ['architecture', 'api gateway', 'database', 'system design', 'pipeline diagram', 'end-to-end', 'component mapping'],
  engineering_trade_offs: ['trade-off', 'latency', 'throughput', 'memory', 'cost', 'alternative', 'comparison', 'vs'],
  mlops_perspective: ['mlops', 'monitoring', 'observability', 'drift', 'observability', 'ci/cd', 'deployment', 'reproducibility', 'rollback'],
  decision_framework: ['decision framework', 'decision matrix', 'matrix', 'framework', 'selection criteria', 'how to choose'],
  failure_modes: ['failure', 'failures', 'fail', 'mitigate', 'common mistakes', 'symptom', 'drift', 'injection', 'shift'],
  scaling_strategy: ['scaling', 'scale', 'gpu utilization', 'sharding', 'batching', 'caching', 'concurrency', 'volume'],
  industry_case_study: ['case study', 'business problem', 'lessons learned', 'technical challenge', 'generalized study'],
  career_context: ['career', 'role', 'engineer', 'data scientist', 'mlops engineer', 'software engineer', 'responsibility'],
  design_review: ['design review', 'strength', 'weakness', 'risk', 'security', 'observability', 'evaluate design']
};

const MODE_LABELS = {
  real_world_applications: 'Real-World Applications',
  production_architecture: 'Production Architecture Mapping',
  engineering_trade_offs: 'Engineering Trade-Off Analysis',
  mlops_perspective: 'MLOps & Operational Perspective',
  decision_framework: 'Decision Framework',
  failure_modes: 'Failure Modes in Production',
  scaling_strategy: 'Scaling Considerations',
  industry_case_study: 'Industry Case Study Template',
  career_context: 'Career & Role Context',
  design_review: 'Professional Design Review'
};

const CURATED_TRANSFER_MAP = {
  'machine-learning': {
    domainName: 'Machine Learning',
    applications: ['Fraud detection pipelines', 'E-commerce recommendation systems', 'Predictive maintenance for manufacturing'],
    architecture: 'Client\n↓\nAPI Gateway\n↓\nFeature Store (e.g. Feast)\n↓\nInference Pipeline (e.g. Triton/Seldon)\n↓\nModel Registry\n↓\nPrediction Logging',
    tradeOffs: '| Option | Latency | Operational Cost | Explainability |\n|---|---|---|---|\n| Batch Scoring | High (delayed) | Low (offline resource) | High (auditable) |\n| Real-time Scoring | Low (<50ms) | High (always-on container) | Medium (dynamic input) |',
    mlops: 'Monitor prediction drift using population stability index (PSI) and feature distributions in your data warehouse.',
    framework: '| Constraint | Batch Processing | Real-Time API | Recommendation |\n|---|---|---|---|\n| Latency < 100ms | No | Yes | Use Real-Time API |\n| Throughput-focused | Yes | No | Use Batch Processing |',
    failures: '| Sourced Failure | Root Cause | Mitigation |\n|---|---|---|\n| Feature Drift | Environment change | Schedule automated model retraining |\n| Stale Features | Offline pipeline lag | Implement streaming feature engineering |',
    scaling: 'Implement offline sharding of feature tables and read-through caching for high-concurrency real-time lookups.',
    caseStudy: 'A retail platform migrated from batch recommendations to a real-time retrieval setup. By indexing items in a feature store, they reduced prediction lag by 90% while maintaining retrieval recall.',
    roles: 'ML Engineer: Handles model serving and feature pipeline integration.\nData Scientist: Prototypes offline feature formulas.'
  },
  'deep-learning': {
    domainName: 'Deep Learning',
    applications: ['Large-scale visual inspection', 'Real-time document intelligence', 'Industrial audio anomaly detection'],
    architecture: 'Client\n↓\nRequest Batcher\n↓\nGPU Inference Server (Triton)\n↓\nTensorRT Engine\n↓\nResponse Broker',
    tradeOffs: '| Option | Latency | Compute Resource | Model Accuracy |\n|---|---|---|---|\n| FP16 TensorRT | Low | GPU (optimized) | Negligible change |\n| FP32 Native | High | GPU (standard) | Baseline accuracy |',
    mlops: 'Track GPU memory utilization and dynamic batch size queues via Prometheus metrics dashboard.',
    framework: '| Constraint | GPU Optimization | CPU Fallback | Recommendation |\n|---|---|---|---|\n| Edge deployment | TensorRT / ONNX | OpenVINO | ONNX Runtime |\n| Cloud scaling | Triton | Standard serving | Triton Server |',
    failures: '| Sourced Failure | Root Cause | Mitigation |\n|---|---|---|\n| GPU Out-Of-Memory | Large input dimensions | Implement strict request validation and dynamic batch size limits |',
    scaling: 'Use concurrent model execution instances on a single GPU and implement model parallelization for extremely large model weights.',
    caseStudy: 'A document QA system implemented model quantization (INT8) to deploy vision-language models on edge hardware. This reduced GPU memory utilization by 50% with less than 1% degradation in score metrics.',
    roles: 'ML Engineer: Writes Triton configurations.\nPlatform Engineer: Allocates GPU clusters.'
  },
  'computer-vision': {
    domainName: 'Computer Vision',
    applications: ['Edge-based assembly line inspection', 'Live video analytics for retail safety', 'Autonomous vehicle perception blocks'],
    architecture: 'Client (Video Stream)\n↓\nFrame Extractor & Resizer\n↓\nObject Detector (e.g. YOLO)\n↓\nTracker (e.g. ByteTrack)\n↓\nMetadata Publisher',
    tradeOffs: '| Option | Edge Processing | Cloud Processing | Recommendation |\n|---|---|---|---|\n| Edge Device | Local, low latency | Limited compute power | Edge for safety |\n| Cloud Server | High compute power | Network dependency | Cloud for batch analytics |',
    mlops: 'Observe camera drift (blur, lighting shifts) by monitoring average contrast and brightness parameters in the incoming frame stream.',
    framework: '| Constraint | Local DSP / NPU | Cloud GPU | Recommendation |\n|---|---|---|---|\n| Offline Operation | Yes | No | Edge Deployment |\n| High Resolution | No | Yes | Hybrid/Cloud |',
    failures: '| Sourced Failure | Root Cause | Mitigation |\n|---|---|---|\n| False Positives | Lighting shifts | Augment training dataset with synthetic lighting variations |',
    scaling: 'Employ hardware-accelerated video decoding (e.g., NVIDIA NVDEC) and drop frames dynamically when the analysis queue backs up.',
    caseStudy: 'An industrial inspection line implemented edge-based vision models. To avoid network latency bottleneck, frames were downsampled on-device and only anomalous frames were uploaded to the cloud repository.',
    roles: 'CV Engineer: Benchmarks detector backbones.\nEmbedded Engineer: Compiles models for target NPUs.'
  },
  'llms': {
    domainName: 'Large Language Models',
    applications: ['Context-aware enterprise copilots', 'Structured metadata extraction', 'Automated customer support agents'],
    architecture: 'User Client\n↓\nUser Input\n↓\nInput Guardrails\n↓\nOrchestrator (e.g. LangChain)\n↓\nLLM API / Host (vLLM)\n↓\nOutput Guardrails\n↓\nUser Response',
    tradeOffs: '| Option | Latency | Hosting Cost | Domain Adaptation |\n|---|---|---|---|\n| API (Closed) | Variable | Pay-per-token | System prompting |\n| Self-hosted (vLLM) | Low (with batching) | High fixed hardware cost | Fine-tuning capability |',
    mlops: 'Monitor token throughput (tokens/sec), generation latency, cost metrics, and detect semantic drift or policy violations in user prompts.',
    framework: '| Constraint | Proprietary API | Self-Hosted Open LLM | Recommendation |\n|---|---|---|---|\n| Sensitive Data | No | Yes | Self-Hosted Open LLM |\n| Rapid Prototyping | Yes | No | Proprietary API |',
    failures: '| Sourced Failure | Root Cause | Mitigation |\n|---|---|---|\n| Prompt Injection | Malicious inputs | Implement input schema validation and separate system instructions |',
    scaling: 'Deploy vLLM with PagedAttention to maximize GPU memory efficiency and enable continuous batching for high concurrent traffic.',
    caseStudy: 'An enterprise copilot team migrated from commercial APIs to a self-hosted 8x7B Mixture-of-Experts (MoE) model. By using vLLM, they reduced per-query latency by 40% and gained absolute data privacy.',
    roles: 'AI Engineer: Engineers prompts and orchestrates tools.\nMLOps Engineer: Configures LLM host clusters.'
  },
  'rag': {
    domainName: 'Retrieval-Augmented Generation',
    applications: ['Internal developer documentation QA', 'Legal contract search systems', 'Medical guideline assistants'],
    architecture: 'User Client\n↓\nQuery\n↓\nEmbedding Generator\n↓\nVector Search (ANN)\n↓\nMetadata Filtering\n↓\nReranker (Cross-Encoder)\n↓\nPrompt Constructor\n↓\nGenerator (LLM)',
    tradeOffs: '| Component | Latency | Retrieval Accuracy | Resource Cost |\n|---|---|---|---|\n| Dense Retriever Only | Low | Medium | Low (vector search) |\n| Dense + Reranker | Medium | High | Medium (GPU inference) |',
    mlops: 'Observe system performance using evaluation frameworks like RAGAS, measuring faithfulness, answer relevance, and context precision.',
    framework: '| Constraint | Vector Store (ANN) | Relational DB | Recommendation |\n|---|---|---|---|\n| High-dimensional Search | Yes | No | Dedicated Vector Database |\n| Simple Keyword Search | No | Yes | Traditional BM25 |',
    failures: '| Sourced Failure | Root Cause | Mitigation |\n|---|---|---|\n| Hallucination | Retrieval gap | Enforce strict grounding prompts and verify citation matches |',
    scaling: 'Use vector index sharding and partition indices by tenant or metadata to avoid scanning unnecessary sections of the database.',
    caseStudy: 'A customer support RAG pipeline integrated a Cross-Encoder reranker. This raised context precision by 25% while maintaining latency bounds by filtering candidate passages to the top 5 before reranking.',
    roles: 'Search Engineer: Tunes vector indices and hybrid search.\nAI Engineer: Integrates retrieved context with LLM generation.'
  },
  'agents': {
    domainName: 'AI Agents',
    applications: ['Autonomous developer workspaces', 'Complex data analysis workflows', 'Automated ticketing and triage engines'],
    architecture: 'Goal\n↓\nPlanning Block\n↓\nTool Selector\n↓\nTool Execution (Sandbox)\n↓\nEvaluation Loop\n↓\nGoal Assessment',
    tradeOffs: '| Pattern | Latency | Token Cost | Reliability |\n|---|---|---|---|\n| ReAct (Looping) | High | High | Low (can drift) |\n| Linear Pipeline | Low | Low | High (predictable) |',
    mlops: 'Audit agent traces to monitor step execution count, token usage, tool errors, and flag infinite execution loops in production.',
    framework: '| Constraint | ReAct Planner | Linear DAG Router | Recommendation |\n|---|---|---|---|\n| Unpredictable tasks | Yes | No | ReAct Planner |\n| Deterministic process | No | Yes | Linear DAG Router |',
    failures: '| Sourced Failure | Root Cause | Mitigation |\n|---|---|---|\n| Loop Lock | Tool failure | Impose strict loop counts and fallback safety boundaries |',
    scaling: 'Isolate tool execution in self-contained worker pools and use asynchronous queues to manage long-running planning steps.',
    caseStudy: 'An operations automation agent was modified from a free-form ReAct model to a structured routing graph. This reduced task failure rates from 30% to less than 2% by restricting tool paths.',
    roles: 'AI Engineer: Builds graph topologies and tool interfaces.\nPlatform Engineer: Maintains sandbox execution environments.'
  },
  'mlops': {
    domainName: 'MLOps',
    applications: ['Continuous integration for ML models', 'Real-time drift monitoring', 'Enterprise model governance dashboards'],
    architecture: 'Model Train Trigger\n↓\nCI/CD Pipeline\n↓\nModel Registration\n↓\nCanary Deployment\n↓\nMonitoring & Logging\n↓\nAlert / Rollback Engine',
    tradeOffs: '| Deployment | Rollback Speed | Traffic Control | Infrastructure Cost |\n|---|---|---|---|\n| Canary (Split) | Fast | Fine-grained | High (duplicate pods) |\n| Blue/Green | Fast | Binary | High (duplicate pods) |',
    mlops: 'Centralize logs, configure alerting thresholds on prediction latency anomalies, and track feature drift metrics across model versions.',
    framework: '| Constraint | Canary Deploy | Direct Deploy | Recommendation |\n|---|---|---|---|\n| Critical Business | Yes | No | Canary Deployment |\n| Internal prototype | No | Yes | Direct Deployment |',
    failures: '| Sourced Failure | Root Cause | Mitigation |\n|---|---|---|\n| Deployment Failure | Schema mismatch | Validate model input/output signatures in CI/CD pipeline |',
    scaling: 'Use auto-scaling pod groups triggered by model server queue length rather than simple CPU/memory metrics.',
    caseStudy: 'An online service automated model deployment using GitOps. Pre-deployment checks blocked a newly trained model from deploying when its signature validation detected a missing field, avoiding a production outage.',
    roles: 'MLOps Engineer: Configures CI/CD pipelines.\nPlatform Engineer: Allocates Kubernetes nodes.'
  }
};

function createApplicationProfessionalTransferAgent() {
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
    for (const [intent, patterns] of Object.entries(TRANSFER_INTENT_PATTERNS)) {
      if (patterns.some((pattern) => lower.includes(pattern))) return intent;
    }
    return 'real_world_applications';
  }

  function buildResponse(mode, topic, domain, context, query) {
    const sections = addRequiredTransferSections(buildSectionsForMode(mode, topic, domain, context, query), mode, topic, domain);
    return {
      agentId: 'application-professional-transfer',
      agentName: 'Application & Professional Transfer Agent',
      mode,
      modeLabel: MODE_LABELS[mode] || 'Senior Engineering Mentor',
      topic,
      domain,
      reasoningStrategy: `Align educational concepts with engineering trade-offs, architecture styles, and operational realities for ${topic}.`,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: 'Offline educational engineering guidance only. No proprietary metrics, live cloud connection, or curriculum modifications.'
    };
  }

  function buildSectionsForMode(mode, topic, domain, context, query) {
    const builders = {
      real_world_applications: () => buildRealWorldApplications(topic, domain),
      production_architecture: () => buildProductionArchitecture(topic, domain),
      engineering_trade_offs: () => buildEngineeringTradeOffs(topic, domain),
      mlops_perspective: () => buildMlopsPerspective(topic, domain),
      decision_framework: () => buildDecisionFramework(topic, domain),
      failure_modes: () => buildFailureModes(topic, domain),
      scaling_strategy: () => buildScalingStrategy(topic, domain),
      industry_case_study: () => buildIndustryCaseStudy(topic, domain),
      career_context: () => buildCareerContext(topic, domain),
      design_review: () => buildDesignReview(topic, domain)
    };
    return (builders[mode] || builders.real_world_applications)();
  }

  function buildRealWorldApplications(topic, domain) {
    const data = getDomainData(domain);
    return [
      engineeringCard('Real-World Applications Scope', `Analyzing where **${topic}** fits within industry sectors like healthcare, finance, or manufacturing.`),
      { title: 'Industry Use Cases', type: 'text', content: data.applications.map(app => `- **${app}**: standard production deployment.`).join('\n') },
      { title: 'Application Note', type: 'text', content: 'These examples represent typical integrations, not exhaustive requirements.' }
    ];
  }

  function buildProductionArchitecture(topic, domain) {
    const data = getDomainData(domain);
    return [
      engineeringCard('Architecture Scope', `Component-level interface diagram showing how **${topic}** is embedded in enterprise pipelines.`),
      { title: 'Production Component Flow', type: 'execution-flow', content: data.architecture },
      { title: 'Flow Responsibilities', type: 'text', content: 'Each block in the pipeline represents an decoupled service with dedicated scaling and fault boundaries.' }
    ];
  }

  function buildEngineeringTradeOffs(topic, domain) {
    const data = getDomainData(domain);
    return [
      engineeringCard('Trade-Off Scope', `Balanced comparative analysis for designs related to **${topic}**.`),
      { title: 'Trade-off Matrix', type: 'comparison-table', content: data.tradeOffs },
      { title: 'Decisive Factors', type: 'text', content: 'Choosing between these designs depends heavily on your system constraints (e.g. latency vs accuracy).' }
    ];
  }

  function buildMlopsPerspective(topic, domain) {
    const data = getDomainData(domain);
    return [
      engineeringCard('MLOps Scope', `Operational lifecycle considerations for **${topic}**, including monitoring and pipeline validation.`),
      { title: 'Monitoring & Observability', type: 'text', content: data.mlops },
      { title: 'Operational Guidelines', type: 'text', content: 'Always implement automated alerting before moving models to target endpoints.' }
    ];
  }

  function buildDecisionFramework(topic, domain) {
    const data = getDomainData(domain);
    return [
      engineeringCard('Decision Matrix', `Structured criteria for choosing implementations of **${topic}**.`),
      { title: 'Selection Matrix', type: 'comparison-table', content: data.framework },
      { title: 'Underlying Assumptions', type: 'text', content: 'Assumes predictable network connectivity and standard scale workloads.' }
    ];
  }

  function buildFailureModes(topic, domain) {
    const data = getDomainData(domain);
    return [
      engineeringCard('Failure Mode Scope', `Sourced failure analysis for systems using **${topic}**.`),
      { title: 'Common Production Failures', type: 'comparison-table', content: data.failures },
      { title: 'Mitigation Philosophy', type: 'text', content: 'Incorporate fallback routes and circuit breakers to prevent partial failures from crashing entire systems.' }
    ];
  }

  function buildScalingStrategy(topic, domain) {
    const data = getDomainData(domain);
    return [
      engineeringCard('Scaling Strategy', `Analyzing performance scaling dimensions for **${topic}**.`),
      { title: 'Performance Engineering', type: 'text', content: data.scaling },
      { title: 'Resource Efficiency', type: 'text', content: 'Optimize batch size and execution concurrency before scaling out cluster instances.' }
    ];
  }

  function buildIndustryCaseStudy(topic, domain) {
    const data = getDomainData(domain);
    return [
      engineeringCard('Case Study Template', `Generalized business case mapping for **${topic}**.`),
      { title: 'Case Study Details', type: 'text', content: data.caseStudy },
      { title: 'Disclaimer', type: 'text', content: 'Proprietary details are excluded. Use this case study to structure technical reviews.' }
    ];
  }

  function buildCareerContext(topic, domain) {
    const data = getDomainData(domain);
    return [
      engineeringCard('Career & Role Scope', `Aligning **${topic}** familiarity with engineering roles.`),
      { title: 'Role Mapping', type: 'text', content: data.roles },
      { title: 'Professional Growth', type: 'text', content: 'Focus on understanding trade-offs and lifecycle implications to level up your engineering skills.' }
    ];
  }

  function buildDesignReview(topic, domain) {
    const data = getDomainData(domain);
    return [
      engineeringCard('Design Review Scope', `Systematic evaluation of design architectures utilizing **${topic}**.`),
      { title: 'Hypothetical Architecture Review', type: 'text', content: `**Strengths**: High scalability, clean interface boundaries.\n**Weaknesses**: Operational complexity, potential latency overhead.\n**Risks**: Security configuration, error handling validation.` },
      { title: 'Future Evolution', type: 'text', content: 'Design with extensibility in mind so you can swap out components as technology matures.' }
    ];
  }

  function addRequiredTransferSections(sections, mode, topic, domain) {
    const data = getDomainData(domain);
    return [
      { title: 'Professional Context', type: 'engineering-card', content: `Mode: **${MODE_LABELS[mode]}**\nTopic: **${topic}**\nDomain Context: **${data.domainName}**\nSenior engineering advisory session grounded in offline production benchmarks.` },
      ...sections,
      { title: 'Assumptions', type: 'text', content: '- Standard cloud environments (AWS, GCP, or Azure)\n- Dedicated staging and testing environments are active\n- Scaled workload follows typical enterprise distribution' },
      { title: 'Trade-Offs', type: 'text', content: '- Speed vs cost: highly optimized clusters offer lower latency but higher fixed pricing\n- Flexibility vs simplicity: granular custom microservices are more flexible but increase maintenance overhead' },
      { title: 'Limitations', type: 'text', content: '- Mappings are offline educational templates, not direct live production audits\n- Avoids quantitative claims without specific context' },
      { title: 'When Another Choice May Be Better', type: 'text', content: 'If your scale is small or traffic is highly predictable, using standard simple monolithic architectures or basic servers will be much cheaper and simpler than fully scaled microservice pipelines.' }
    ];
  }

  function engineeringCard(title, content) {
    return { title, type: 'engineering-card', content };
  }

  function getDomainData(domain) {
    return CURATED_TRANSFER_MAP[domain] || {
      domainName: 'General Systems Engineering',
      applications: ['Automated business reporting pipelines', 'API request throttling databases', 'Enterprise search interfaces'],
      architecture: 'User Client\n↓\nLoad Balancer\n↓\nApplication Backend\n↓\nDatabase Server\n↓\nCache Memory',
      tradeOffs: '| Design | Latency | Compute Resource | Maintenance Cost |\n|---|---|---|---|\n| Simple Monolith | Medium | Low | Low |\n| Microservices | Low (with cache) | High | High |',
      mlops: 'Log prediction/request latency metrics to observe systems health over time.',
      framework: '| Constraint | Standard Database | Vector Index | Recommendation |\n|---|---|---|---|\n| Text Search | Yes | No | Relational Database |\n| Semantic Match | No | Yes | Vector Database |',
      failures: '| Sourced Failure | Root Cause | Mitigation |\n|---|---|---|\n| Memory Leak | Unclosed connections | Implement strict context closures and pool recycling |',
      scaling: 'Add read-through cache nodes and partition databases to handle traffic surges.',
      caseStudy: 'An enterprise service successfully scaled its read capacity 10x by implementing a multi-node read replica database setup.',
      roles: 'Software Engineer: Implements database transactions.\nPlatform Engineer: Maintains load balancer configurations.'
    };
  }

  function resolveDomain(topic, query) {
    const lower = `${topic} ${query}`.toLowerCase();
    if (lower.includes('mlops') || lower.includes('monitoring') || lower.includes('observability')) return 'mlops';
    if (lower.includes('llm') || lower.includes('gpt') || lower.includes('copilot') || lower.includes('prompt')) return 'llms';
    if (lower.includes('rag') || lower.includes('retrieval') || lower.includes('indexing')) return 'rag';
    if (lower.includes('agent') || lower.includes('planning') || lower.includes('tool use')) return 'agents';
    if (lower.includes('vision') || lower.includes('image') || lower.includes('yolo') || lower.includes('segmentation')) return 'computer-vision';
    if (lower.includes('deep learning') || lower.includes('pytorch') || lower.includes('tensor') || lower.includes('gpu')) return 'deep-learning';
    if (lower.includes('machine learning') || lower.includes('feature') || lower.includes('predictive') || lower.includes('classification')) return 'machine-learning';
    return 'general-systems';
  }

  function resolveTopic(context, query) {
    return context.selectedArtifact?.title || context.selectedLesson?.title || context.selectedModule?.title || context.selectedPath?.title || extractTopicFromQuery(query) || 'current concept';
  }

  function extractTopicFromQuery(query) {
    const cleaned = (query || '').replace(/what are|what is|show me|explain|real-world applications|production architecture|trade-offs|mlops perspective|decision framework|failure modes|scaling strategy|case study|career context|design review/ig, '').replace(/[?!.]/g, '').trim();
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
  window.NeuralVerse.applicationProfessionalTransferAgent = createApplicationProfessionalTransferAgent();
}

export { createApplicationProfessionalTransferAgent };
