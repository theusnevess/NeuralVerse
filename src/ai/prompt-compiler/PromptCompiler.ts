/**
 * Prompt Compiler — Structured Prompt Generation
 *
 * Combines user context, agent outputs, and governance into
 * structured prompts for LLM providers.
 */

import type { LLMMessage, LLMModelId } from '../llm-provider/LLMProvider.ts';
import type { EducationalIntent } from '../orchestration/IntentClassifier.ts';
import type { AgentId } from '../orchestration/AgentSelector.ts';
import type { EvidenceBundle } from '../orchestration/EvidenceAggregator.ts';
import type { ConfidenceResult } from '../orchestration/EducationalConfidence.ts';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export const CANONICAL_AI_MODES = [
  'automatic',
  'teaching',
  'research',
  'practice',
  'engineering',
  'visual',
  'knowledge',
  'advanced'
] as const;

export type AIMode = (typeof CANONICAL_AI_MODES)[number];

export const CANONICAL_RESPONSE_STYLES = [
  'default',
  'simple',
  'detailed',
  'mathematical',
  'engineering',
  'research',
  'visual',
  'socratic'
] as const;

export type ResponseStyle = (typeof CANONICAL_RESPONSE_STYLES)[number];

// ============================================================================
// PROMPT COMPILATION CONTEXT
// ============================================================================

export interface PromptCompilationContext {
  readonly userQuery: string;
  readonly mode: AIMode;
  readonly style: ResponseStyle;
  readonly currentRoute: string;
  readonly currentLesson?: LessonContext;
  readonly agentOutputs: readonly AgentOutput[];
  readonly retrievalContext?: RetrievalContext;
  readonly guardrails: GuardrailContext;
  readonly developerMode: boolean;
  readonly requestId: string;
  // Orchestration context
  readonly orchestrationIntents?: readonly EducationalIntent[];
  readonly orchestrationAgents?: readonly AgentId[];
  readonly orchestrationEvidence?: EvidenceBundle;
  readonly orchestrationConfidence?: ConfidenceResult;
  readonly conversationSummary?: string;
  readonly learningContext?: string;
}

export interface LessonContext {
  readonly pathId: string;
  readonly pathTitle: string;
  readonly moduleId: string;
  readonly moduleTitle: string;
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly difficulty?: string;
  readonly progress?: string;
}

export interface AgentOutput {
  readonly agentId: string;
  readonly agentName: string;
  readonly output: string;
  readonly confidence: string;
  readonly metadata?: Record<string, string>;
}

export interface RetrievalContext {
  readonly relevantConcepts: readonly string[];
  readonly relatedLessons: readonly string[];
  readonly knowledgeGraphEdges: readonly string[];
}

export interface GuardrailContext {
  readonly forbiddenTopics: readonly string[];
  readonly requiredDisclaimers: readonly string[];
  readonly governanceLevel: 'standard' | 'strict' | 'educational';
}

// ============================================================================
// COMPILED PROMPT
// ============================================================================

export interface CompiledPrompt {
  readonly messages: readonly LLMMessage[];
  readonly model: LLMModelId;
  readonly metadata: CompiledPromptMetadata;
}

export interface CompiledPromptMetadata {
  readonly requestId: string;
  readonly mode: AIMode;
  readonly style: ResponseStyle;
  readonly contributingAgents: readonly string[];
  readonly promptSections: readonly string[];
  readonly compiledAt: string;
}

// ============================================================================
// SYSTEM INSTRUCTIONS
// ============================================================================

const BASE_SYSTEM_INSTRUCTIONS = `You are NeuralVerse AI, an expert educational assistant integrated into the NeuralVerse learning platform.

Core principles:
- Provide accurate, well-structured educational explanations
- Adapt your response style to the user's learning needs
- Reference specific concepts and their relationships
- When uncertain, acknowledge limitations
- Never fabricate information or citations
- Support diverse learning styles (visual, mathematical, practical)
- Encourage deeper exploration and critical thinking`;

const MODE_INSTRUCTIONS: Record<AIMode, string> = {
  automatic: 'Select the most appropriate response approach based on the question type and context.',
  teaching: 'Focus on clear, step-by-step explanations. Use analogies and examples. Build from fundamentals.',
  research: 'Emphasize research findings, citations, and evidence-based explanations. Reference key papers and methodologies.',
  practice: 'Provide hands-on exercises, code examples, and practical applications. Focus on implementation.',
  engineering: 'Address engineering trade-offs, production considerations, and real-world applications.',
  visual: 'Describe visual representations, diagrams, and spatial relationships. Help the user build mental models.',
  knowledge: 'Emphasize connections between concepts, prerequisite relationships, and knowledge graph structure.',
  advanced: 'Provide deep technical analysis, mathematical formulations, and advanced theoretical insights.'
};

const STYLE_INSTRUCTIONS: Record<ResponseStyle, string> = {
  default: 'Use a balanced, clear explanation style.',
  simple: 'Use plain language, short sentences, and everyday analogies. Avoid jargon.',
  detailed: 'Provide comprehensive explanations with multiple examples and edge cases.',
  mathematical: 'Include mathematical formulations, equations, and formal proofs where relevant.',
  engineering: 'Focus on practical implementation, system design, and engineering trade-offs.',
  research: 'Reference research literature, methodologies, and evidence strength.',
  visual: 'Describe visual representations and help build mental models.',
  socratic: 'Ask guiding questions to help the user discover answers themselves.'
};

// ============================================================================
// PROMPT COMPILER
// ============================================================================

export function compilePrompt(context: PromptCompilationContext): CompiledPrompt {
  const messages: LLMMessage[] = [];
  const promptSections: string[] = [];

  // 1. System instructions
  messages.push({
    role: 'system',
    content: buildSystemInstructions(context)
  });
  promptSections.push('system');

  // 2. Orchestration context (if available)
  if (context.orchestrationIntents && context.orchestrationIntents.length > 0) {
    messages.push({
      role: 'system',
      content: buildOrchestrationContext(context)
    });
    promptSections.push('orchestration');
  }

  // 3. Developer constraints (if enabled)
  if (context.developerMode) {
    messages.push({
      role: 'system',
      content: buildDeveloperConstraints(context)
    });
    promptSections.push('developer');
  }

  // 4. Context bundle
  const contextBundle = buildContextBundle(context);
  if (contextBundle) {
    messages.push({
      role: 'system',
      content: contextBundle
    });
    promptSections.push('context');
  }

  // 5. Agent evidence
  const agentEvidence = buildAgentEvidence(context);
  if (agentEvidence) {
    messages.push({
      role: 'system',
      content: agentEvidence
    });
    promptSections.push('agents');
  }

  // 6. Retrieval context
  if (context.retrievalContext) {
    const retrievalContent = buildRetrievalContext(context.retrievalContext);
    if (retrievalContent) {
      messages.push({
        role: 'system',
        content: retrievalContent
      });
      promptSections.push('retrieval');
    }
  }

  // 7. Guardrails
  const guardrails = buildGuardrails(context.guardrails);
  if (guardrails) {
    messages.push({
      role: 'system',
      content: guardrails
    });
    promptSections.push('guardrails');
  }

  // 8. User message
  messages.push({
    role: 'user',
    content: context.userQuery
  });
  promptSections.push('user');

  // 9. Response format request
  messages.push({
    role: 'system',
    content: `Response style: ${STYLE_INSTRUCTIONS[context.style]}

Format your response with clear structure:
- Use markdown headers for main sections
- Use bullet points for lists
- Use code blocks for technical examples
- Keep paragraphs concise and focused`
  });
  promptSections.push('format');

  // Determine model based on mode
  const model = selectModel(context.mode);

  // Build contributing agents list
  const contributingAgents = context.orchestrationAgents && context.orchestrationAgents.length > 0
    ? context.orchestrationAgents
    : context.agentOutputs.map(o => o.agentId);

  return {
    messages,
    model,
    metadata: {
      requestId: context.requestId,
      mode: context.mode,
      style: context.style,
      contributingAgents,
      promptSections,
      compiledAt: new Date().toISOString()
    }
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function buildSystemInstructions(context: PromptCompilationContext): string {
  const parts = [
    BASE_SYSTEM_INSTRUCTIONS,
    '',
    MODE_INSTRUCTIONS[context.mode]
  ];

  if (context.currentLesson) {
    parts.push('');
    parts.push(`Current learning context:
- Path: ${context.currentLesson.pathTitle}
- Module: ${context.currentLesson.moduleTitle}
- Lesson: ${context.currentLesson.lessonTitle}`);
    if (context.currentLesson.difficulty) {
      parts.push(`- Difficulty: ${context.currentLesson.difficulty}`);
    }
    if (context.currentLesson.progress) {
      parts.push(`- Progress: ${context.currentLesson.progress}`);
    }
  }

  return parts.join('\n');
}

function buildDeveloperConstraints(_context: PromptCompilationContext): string {
  return `Developer Mode Active.
Include metadata in your response:
- Confidence level (high/medium/low)
- Key reasoning steps
- Contributing knowledge sources`;
}

function buildOrchestrationContext(context: PromptCompilationContext): string {
  const parts: string[] = ['Educational Orchestration Context:'];

  // Intents
  if (context.orchestrationIntents && context.orchestrationIntents.length > 0) {
    parts.push(`Detected intents: ${context.orchestrationIntents.join(', ')}`);
  }

  // Selected agents
  if (context.orchestrationAgents && context.orchestrationAgents.length > 0) {
    parts.push(`Contributing agents: ${context.orchestrationAgents.join(', ')}`);
  }

  // Evidence summary
  if (context.orchestrationEvidence) {
    const evidence = context.orchestrationEvidence;
    parts.push(`Evidence: ${evidence.conceptDefinitions.length} concepts, ${evidence.applications.length} applications, ${evidence.researchEvidence.length} research items`);
  }

  // Confidence
  if (context.orchestrationConfidence) {
    parts.push(`Confidence: ${context.orchestrationConfidence.overall} (${Math.round(context.orchestrationConfidence.evidenceCompleteness * 100)}% evidence)`);
  }

  // Conversation summary
  if (context.conversationSummary) {
    parts.push(`Conversation: ${context.conversationSummary}`);
  }

  // Learning context
  if (context.learningContext) {
    parts.push(`Learning: ${context.learningContext}`);
  }

  return parts.join('\n');
}

function buildContextBundle(context: PromptCompilationContext): string | null {
  const parts: string[] = [];

  parts.push(`Current route: ${context.currentRoute}`);

  if (context.currentLesson) {
    parts.push(`Learning position: ${context.currentLesson.pathTitle} > ${context.currentLesson.moduleTitle} > ${context.currentLesson.lessonTitle}`);
  }

  return parts.length > 0 ? parts.join('\n') : null;
}

function buildAgentEvidence(context: PromptCompilationContext): string | null {
  if (context.agentOutputs.length === 0) return null;

  const parts: string[] = ['Agent analysis results:'];

  for (const output of context.agentOutputs) {
    parts.push(`[${output.agentName}] (${output.confidence} confidence): ${output.output}`);
  }

  return parts.join('\n');
}

function buildRetrievalContext(retrieval: RetrievalContext): string | null {
  const parts: string[] = [];

  if (retrieval.relevantConcepts.length > 0) {
    parts.push(`Relevant concepts: ${retrieval.relevantConcepts.join(', ')}`);
  }
  if (retrieval.relatedLessons.length > 0) {
    parts.push(`Related lessons: ${retrieval.relatedLessons.join(', ')}`);
  }

  return parts.length > 0 ? parts.join('\n') : null;
}

function buildGuardrails(guardrails: GuardrailContext): string | null {
  const parts: string[] = [];

  if (guardrails.forbiddenTopics.length > 0) {
    parts.push(`Do not discuss: ${guardrails.forbiddenTopics.join(', ')}`);
  }
  if (guardrails.requiredDisclaimers.length > 0) {
    parts.push(`Include disclaimers: ${guardrails.requiredDisclaimers.join('; ')}`);
  }
  parts.push(`Governance level: ${guardrails.governanceLevel}`);

  return parts.join('\n');
}

function selectModel(mode: AIMode): LLMModelId {
  // In mock/test mode, always use mock-model
  if (process.env.LLM_PROVIDER === 'mock' || !process.env.LLM_PROVIDER) {
    return 'mock-model';
  }

  // Model selection based on mode complexity
  const complexModes: AIMode[] = ['advanced', 'research', 'engineering'];
  if (complexModes.includes(mode)) {
    return 'gpt-4';
  }

  return 'gpt-3.5-turbo';
}
