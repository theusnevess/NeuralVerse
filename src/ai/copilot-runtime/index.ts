/**
 * Copilot Runtime Module — Public API
 *
 * Orchestrates LLM integration for NeuralVerse AI.
 */

export {
  type CopilotRequest,
  type CopilotRuntimeConfig,
  type ClarificationResponse,
  type ClarificationMetadata,
  CopilotRuntime,
  getCopilotRuntime,
  resetCopilotRuntime
} from './CopilotRuntime.ts';
