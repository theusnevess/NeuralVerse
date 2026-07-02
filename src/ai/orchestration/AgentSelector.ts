/**
 * Agent Selector — Dynamic Agent Selection
 *
 * Automatically determines which D1-D10 agents contribute evidence.
 * Selection is deterministic — based on intent mappings, not LLM.
 */

import type { EducationalIntent } from './IntentClassifier.ts';

// ============================================================================
// AGENT TYPES
// ============================================================================

export const CANONICAL_AGENT_IDS = [
  'didactic-architecture',
  'curriculum-dependency',
  'visual-interactive-media',
  'code-simulation-lab',
  'research-state-of-art',
  'application-professional-transfer',
  'assessment-reinforcement',
  'obsidian-knowledge-governance',
  'storytelling-learning-journey',
  'curiosity-engagement'
] as const;

export type AgentId = (typeof CANONICAL_AGENT_IDS)[number];

export interface AgentSelection {
  readonly agents: readonly AgentSelectionEntry[];
  readonly reasoning: string;
}

export interface AgentSelectionEntry {
  readonly agentId: AgentId;
  readonly agentName: string;
  readonly contribution: string;
  readonly priority: number;
}

// ============================================================================
// INTENT → AGENT MAPPING
// ============================================================================

const INTENT_AGENT_MAP: Record<EducationalIntent, readonly AgentId[]> = {
  'explain': ['didactic-architecture', 'obsidian-knowledge-governance'],
  'compare': ['obsidian-knowledge-governance', 'research-state-of-art', 'application-professional-transfer', 'assessment-reinforcement'],
  'solve': ['didactic-architecture', 'code-simulation-lab'],
  'visualize': ['visual-interactive-media', 'didactic-architecture'],
  'practice': ['code-simulation-lab', 'assessment-reinforcement', 'application-professional-transfer'],
  'research': ['research-state-of-art', 'obsidian-knowledge-governance', 'application-professional-transfer'],
  'apply': ['application-professional-transfer', 'code-simulation-lab', 'research-state-of-art'],
  'review': ['curriculum-dependency', 'didactic-architecture', 'obsidian-knowledge-governance'],
  'plan-learning': ['curriculum-dependency', 'didactic-architecture', 'obsidian-knowledge-governance'],
  'build-laboratory': ['code-simulation-lab', 'assessment-reinforcement', 'obsidian-knowledge-governance'],
  'assess-knowledge': ['assessment-reinforcement', 'didactic-architecture', 'obsidian-knowledge-governance'],
  'correct-misconceptions': ['didactic-architecture', 'obsidian-knowledge-governance', 'assessment-reinforcement']
};

// ============================================================================
// AGENT CONTRIBUTIONS
// ============================================================================

const AGENT_CONTRIBUTIONS: Record<AgentId, string> = {
  'didactic-architecture': 'Concept definitions, explanations, learning strategies',
  'curriculum-dependency': 'Prerequisites, learning paths, dependency chains',
  'visual-interactive-media': 'Diagrams, visualizations, interactive elements',
  'code-simulation-lab': 'Code examples, simulations, hands-on exercises',
  'research-state-of-art': 'Research findings, papers, evidence',
  'application-professional-transfer': 'Real-world applications, industry use cases',
  'assessment-reinforcement': 'Quizzes, assessments, practice exercises',
  'obsidian-knowledge-governance': 'Knowledge connections, concept maps, related topics',
  'storytelling-learning-journey': 'Narratives, analogies, learning journeys',
  'curiosity-engagement': 'Surprising facts, thought experiments, engagement'
};

// ============================================================================
// SELECTOR
// ============================================================================

export function selectAgents(
  intents: readonly EducationalIntent[],
  context?: {
    currentRoute?: string;
    currentLesson?: string;
    conversationHistory?: readonly string[];
  }
): AgentSelection {
  const selectedAgents = new Map<AgentId, AgentSelectionEntry>();

  // Select agents based on intents
  for (const intent of intents) {
    const agentIds = INTENT_AGENT_MAP[intent] || [];
    for (const agentId of agentIds) {
      if (!selectedAgents.has(agentId)) {
        selectedAgents.set(agentId, {
          agentId,
          agentName: formatAgentName(agentId),
          contribution: AGENT_CONTRIBUTIONS[agentId],
          priority: agentIds.indexOf(agentId) + 1
        });
      }
    }
  }

  // Sort by priority
  const agents = [...selectedAgents.values()].sort((a, b) => a.priority - b.priority);

  // Generate reasoning
  const reasoning = `Selected ${agents.length} agents based on ${intents.length} intent(s): ${intents.join(', ')}.`;

  return {
    agents,
    reasoning
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatAgentName(agentId: AgentId): string {
  return agentId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getAgentContribution(agentId: AgentId): string {
  return AGENT_CONTRIBUTIONS[agentId] || 'General knowledge';
}

export function isAgentSelected(selection: AgentSelection, agentId: AgentId): boolean {
  return selection.agents.some(a => a.agentId === agentId);
}
