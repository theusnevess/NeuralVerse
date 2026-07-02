/**
 * Response Renderer Module — Public API
 *
 * Formats LLM responses for copilot UI rendering.
 */

export {
  type CopilotResponsePayload,
  type CopilotResponseMetadata,
  type ResponseSection,
  renderCopilotResponse
} from './ResponseRenderer.ts';
