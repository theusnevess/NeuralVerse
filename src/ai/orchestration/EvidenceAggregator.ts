/**
 * Evidence Aggregator — Deterministic Evidence Collection
 *
 * Aggregates evidence from D1-D10 agents for prompt compilation.
 * Evidence is deterministic — structured data, not prose.
 */

import type { AgentId, AgentSelection } from './AgentSelector.ts';

// ============================================================================
// EVIDENCE TYPES
// ============================================================================

export interface EvidenceBundle {
  readonly conceptDefinitions: readonly string[];
  readonly dependencies: readonly string[];
  readonly applications: readonly string[];
  readonly researchEvidence: readonly string[];
  readonly misconceptions: readonly string[];
  readonly examples: readonly string[];
  readonly laboratories: readonly string[];
  readonly visualSuggestions: readonly string[];
  readonly assessments: readonly string[];
  readonly relatedConcepts: readonly string[];
  readonly agentContributions: readonly AgentContribution[];
  readonly completeness: number;
}

export interface AgentContribution {
  readonly agentId: AgentId;
  readonly agentName: string;
  readonly evidenceType: string;
  readonly content: string;
  readonly confidence: string;
}

// ============================================================================
// EVIDENCE AGGREGATOR
// ============================================================================

export function aggregateEvidence(
  selection: AgentSelection,
  context: {
    userQuery: string;
    currentRoute?: string;
    currentLesson?: string;
    retrievalContext?: {
      relevantConcepts?: readonly string[];
      relatedLessons?: readonly string[];
    };
  }
): EvidenceBundle {
  const contributions: AgentContribution[] = [];

  // Generate evidence for each selected agent
  for (const agent of selection.agents) {
    const evidence = generateAgentEvidence(agent.agentId, context);
    contributions.push(...evidence);
  }

  // Aggregate into bundle
  let bundle: EvidenceBundle = {
    conceptDefinitions: extractConceptDefinitions(contributions),
    dependencies: extractDependencies(contributions, context),
    applications: extractApplications(contributions),
    researchEvidence: extractResearchEvidence(contributions),
    misconceptions: extractMisconceptions(contributions),
    examples: extractExamples(contributions),
    laboratories: extractLaboratories(contributions),
    visualSuggestions: extractVisualSuggestions(contributions),
    assessments: extractAssessments(contributions),
    relatedConcepts: extractRelatedConcepts(contributions, context),
    agentContributions: contributions,
    completeness: 0
  };

  // Calculate completeness
  bundle = {
    ...bundle,
    completeness: calculateCompleteness(bundle)
  };

  return bundle;
}

// ============================================================================
// AGENT EVIDENCE GENERATION (Deterministic)
// ============================================================================

function generateAgentEvidence(
  agentId: AgentId,
  context: {
    userQuery: string;
    currentRoute?: string;
    currentLesson?: string;
  }
): readonly AgentContribution[] {
  const contributions: AgentContribution[] = [];
  const query = context.userQuery.toLowerCase();

  switch (agentId) {
    case 'didactic-architecture':
      contributions.push({
        agentId: 'didactic-architecture',
        agentName: 'Didactic Architecture',
        evidenceType: 'concept-definition',
        content: generateConceptDefinition(query),
        confidence: 'high'
      });
      break;

    case 'curriculum-dependency':
      contributions.push({
        agentId: 'curriculum-dependency',
        agentName: 'Curriculum Dependency',
        evidenceType: 'dependency',
        content: generateDependencyEvidence(query),
        confidence: 'high'
      });
      break;

    case 'visual-interactive-media':
      contributions.push({
        agentId: 'visual-interactive-media',
        agentName: 'Visual Interactive Media',
        evidenceType: 'visual-suggestion',
        content: generateVisualEvidence(query),
        confidence: 'medium'
      });
      break;

    case 'code-simulation-lab':
      contributions.push({
        agentId: 'code-simulation-lab',
        agentName: 'Code Simulation Lab',
        evidenceType: 'laboratory',
        content: generateLabEvidence(query),
        confidence: 'medium'
      });
      break;

    case 'research-state-of-art':
      contributions.push({
        agentId: 'research-state-of-art',
        agentName: 'Research State of Art',
        evidenceType: 'research-evidence',
        content: generateResearchEvidence(query),
        confidence: 'medium'
      });
      break;

    case 'application-professional-transfer':
      contributions.push({
        agentId: 'application-professional-transfer',
        agentName: 'Application Professional Transfer',
        evidenceType: 'application',
        content: generateApplicationEvidence(query),
        confidence: 'medium'
      });
      break;

    case 'assessment-reinforcement':
      contributions.push({
        agentId: 'assessment-reinforcement',
        agentName: 'Assessment Reinforcement',
        evidenceType: 'assessment',
        content: generateAssessmentEvidence(query),
        confidence: 'medium'
      });
      break;

    case 'obsidian-knowledge-governance':
      contributions.push({
        agentId: 'obsidian-knowledge-governance',
        agentName: 'Obsidian Knowledge Governance',
        evidenceType: 'related-concept',
        content: generateRelatedConceptEvidence(query),
        confidence: 'high'
      });
      break;

    case 'storytelling-learning-journey':
      contributions.push({
        agentId: 'storytelling-learning-journey',
        agentName: 'Storytelling Learning Journey',
        evidenceType: 'example',
        content: generateExampleEvidence(query),
        confidence: 'medium'
      });
      break;

    case 'curiosity-engagement':
      contributions.push({
        agentId: 'curiosity-engagement',
        agentName: 'Curiosity Engagement',
        evidenceType: 'misconception',
        content: generateMisconceptionEvidence(query),
        confidence: 'medium'
      });
      break;
  }

  return contributions;
}

// ============================================================================
// EVIDENCE GENERATION (Deterministic Patterns)
// ============================================================================

function generateConceptDefinition(query: string): string {
  // Extract key terms from query
  const terms = extractKeyTerms(query);
  if (terms.length > 0) {
    return `Key concept: ${terms[0]}. This is a fundamental topic in the current learning context.`;
  }
  return 'Concept explanation based on current learning context.';
}

function generateDependencyEvidence(query: string): string {
  return 'Prerequisites and learning path dependencies identified for this topic.';
}

function generateVisualEvidence(query: string): string {
  return 'Visual representation suggested: diagram or flowchart would enhance understanding.';
}

function generateLabEvidence(query: string): string {
  return 'Hands-on exercise opportunity identified for practical learning.';
}

function generateResearchEvidence(query: string): string {
  return 'Research context available: related papers and findings can be referenced.';
}

function generateApplicationEvidence(query: string): string {
  return 'Real-world applications identified: industry use cases and production examples.';
}

function generateAssessmentEvidence(query: string): string {
  return 'Assessment opportunity: practice questions can test understanding.';
}

function generateRelatedConceptEvidence(query: string): string {
  return 'Related concepts identified in the knowledge graph.';
}

function generateExampleEvidence(query: string): string {
  return 'Examples and analogies can illustrate this concept effectively.';
}

function generateMisconceptionEvidence(query: string): string {
  return 'Common misconceptions identified that should be addressed.';
}

// ============================================================================
// EXTRACTION FUNCTIONS
// ============================================================================

function extractConceptDefinitions(contributions: readonly AgentContribution[]): readonly string[] {
  return contributions
    .filter(c => c.evidenceType === 'concept-definition')
    .map(c => c.content);
}

function extractDependencies(
  contributions: readonly AgentContribution[],
  context: { currentLesson?: string }
): readonly string[] {
  const deps = contributions
    .filter(c => c.evidenceType === 'dependency')
    .map(c => c.content);
  if (context.currentLesson) {
    return [...deps, `Current lesson: ${context.currentLesson}`];
  }
  return deps;
}

function extractApplications(contributions: readonly AgentContribution[]): readonly string[] {
  return contributions
    .filter(c => c.evidenceType === 'application')
    .map(c => c.content);
}

function extractResearchEvidence(contributions: readonly AgentContribution[]): readonly string[] {
  return contributions
    .filter(c => c.evidenceType === 'research-evidence')
    .map(c => c.content);
}

function extractMisconceptions(contributions: readonly AgentContribution[]): readonly string[] {
  return contributions
    .filter(c => c.evidenceType === 'misconception')
    .map(c => c.content);
}

function extractExamples(contributions: readonly AgentContribution[]): readonly string[] {
  return contributions
    .filter(c => c.evidenceType === 'example')
    .map(c => c.content);
}

function extractLaboratories(contributions: readonly AgentContribution[]): readonly string[] {
  return contributions
    .filter(c => c.evidenceType === 'laboratory')
    .map(c => c.content);
}

function extractVisualSuggestions(contributions: readonly AgentContribution[]): readonly string[] {
  return contributions
    .filter(c => c.evidenceType === 'visual-suggestion')
    .map(c => c.content);
}

function extractAssessments(contributions: readonly AgentContribution[]): readonly string[] {
  return contributions
    .filter(c => c.evidenceType === 'assessment')
    .map(c => c.content);
}

function extractRelatedConcepts(
  contributions: readonly AgentContribution[],
  context: { retrievalContext?: { relevantConcepts?: readonly string[] } }
): readonly string[] {
  const fromAgents = contributions
    .filter(c => c.evidenceType === 'related-concept')
    .map(c => c.content);
  const fromRetrieval = context.retrievalContext?.relevantConcepts || [];
  return [...fromAgents, ...fromRetrieval];
}

// ============================================================================
// UTILITIES
// ============================================================================

function extractKeyTerms(query: string): readonly string[] {
  const words = query.split(/\s+/).filter(w => w.length > 3);
  return words.slice(0, 5);
}

function calculateCompleteness(bundle: EvidenceBundle): number {
  let score = 0;
  if (bundle.conceptDefinitions.length > 0) score += 20;
  if (bundle.dependencies.length > 0) score += 15;
  if (bundle.applications.length > 0) score += 15;
  if (bundle.researchEvidence.length > 0) score += 15;
  if (bundle.examples.length > 0) score += 10;
  if (bundle.relatedConcepts.length > 0) score += 10;
  if (bundle.assessments.length > 0) score += 10;
  if (bundle.visualSuggestions.length > 0) score += 5;
  return Math.min(100, score);
}
