/**
 * NV-1000-A8 — Obsidian & Knowledge Governance Agent
 *
 * Helps learners organize personal notes, suggest backlinks, recommend tags,
 * build concept maps, plan knowledge reviews, and explore Obsidian strategy.
 */

import { createSharedKnowledgeService } from '../shared-knowledge/shared-knowledge-service.js';

const FALLBACK_KNOWLEDGE_DATA = {
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

function createObsidianKnowledgeGovernanceAgent() {
  const responseCache = new Map();
  const sharedKnowledge = createSharedKnowledgeService();

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
    const domainData = sharedKnowledge.getSyncDomain(domain);
    if (!domainData) {
      return FALLBACK_KNOWLEDGE_DATA;
    }
    return {
      domainName: domainData.title,
      permanentNote: `# Evergreen: ${domainData.title}\n## Definition\n${domainData.summary}\n\n## Key Insights\n${(domainData.concepts || []).map((c) => `- ${c}`).join('\n')}\n\n## Related Concepts\n${(domainData.relatedConcepts || []).map((c) => `- ${c}`).join('\n')}`,
      backlinks: (domainData.relatedConcepts || []).map((c) => ({
        source: domainData.title,
        target: c,
        reason: `Core concept relationship`
      })),
      tags: (domainData.keywords || []).slice(0, 4).map((k) => `#${k.replace(/\s+/g, '-')}`),
      collections: `NeuralVerse -> ${domainData.title}`,
      conceptMap: `${domainData.title}\n${(domainData.concepts || []).map((c) => `├── ${c}`).join('\n')}`,
      gap: `Explore neighboring concepts in ${domainData.title} to build context.`,
      refinement: `Review and expand key insights with concrete examples.`,
      splitting: `${domainData.title} Note\n${(domainData.concepts || []).slice(0, 2).map((c, i) => `├── Note ${String.fromCharCode(65 + i)}: ${c}`).join('\n')}`,
      review: `Review and consolidate notes on ${domainData.title} concepts.`,
      strategy: `Organize ${domainData.title} notes with extensive tag properties.`
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
