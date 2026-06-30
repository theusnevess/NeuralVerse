/**
 * NV-1000-A6 — Application & Professional Transfer Agent
 *
 * Offline, deterministic senior engineering mentor bridging curriculum concepts
 * to real-world production systems, engineering decisions, trade-offs, and scaling.
 *
 * Uses the shared knowledge repository (NV-1100-P3) for domain data.
 * Falls back to local defaults if shared data is unavailable.
 */

import { createSharedKnowledgeService } from '../shared-knowledge/shared-knowledge-service.js';

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

const FALLBACK_TRANSFER_DATA = {
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

function createApplicationProfessionalTransferAgent() {
  const responseCache = new Map();
  const sharedKnowledge = (typeof window !== 'undefined' && window.NeuralVerse?.sharedKnowledgeService)
    ? window.NeuralVerse.sharedKnowledgeService
    : createSharedKnowledgeService();

  async function initialize() {
    await sharedKnowledge.initialize();
    return { status: 'ready', modes: Object.keys(MODE_LABELS).length };
  }

  function canHandle(context) {
    return Boolean(context?.userQuery || context?.selectedArtifact || context?.selectedLesson);
  }

  async function run(context = {}, options = {}) {
    await initialize();
    if (!context) context = {};
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
    const cached = sharedKnowledge.getSyncDomain(domain);
    if (cached) {
      return {
        domainName: cached.title,
        applications: cached.industryApplications || [],
        architecture: (cached.professionalInsights || []).join('\n'),
        tradeOffs: '',
        mlops: (cached.professionalInsights || []).slice(0, 2).join('\n'),
        framework: '',
        failures: '',
        scaling: (cached.professionalInsights || []).slice(-1).join('\n'),
        caseStudy: '',
        roles: ''
      };
    }
    return FALLBACK_TRANSFER_DATA;
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
