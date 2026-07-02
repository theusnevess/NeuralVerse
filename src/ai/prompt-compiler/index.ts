/**
 * Prompt Compiler Module — Public API
 *
 * Structured prompt generation for LLM integration.
 */

export {
  CANONICAL_AI_MODES,
  CANONICAL_RESPONSE_STYLES,
  type AIMode,
  type ResponseStyle,
  type PromptCompilationContext,
  type LessonContext,
  type AgentOutput,
  type RetrievalContext,
  type GuardrailContext,
  type CompiledPrompt,
  type CompiledPromptMetadata,
  compilePrompt
} from './PromptCompiler.ts';
