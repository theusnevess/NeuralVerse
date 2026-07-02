/**
 * Educational Orchestration — Public API
 *
 * Educational reasoning pipeline for NeuralVerse AI Copilot.
 */

// ============================================================================
// INTENT CLASSIFIER
// ============================================================================
export {
  CANONICAL_INTENTS,
  type EducationalIntent,
  type IntentClassification,
  classifyIntent,
  hasIntent,
  getPrimaryIntent
} from './IntentClassifier.ts';

// ============================================================================
// AGENT SELECTOR
// ============================================================================
export {
  CANONICAL_AGENT_IDS,
  type AgentId,
  type AgentSelection,
  type AgentSelectionEntry,
  selectAgents,
  getAgentContribution,
  isAgentSelected
} from './AgentSelector.ts';

// ============================================================================
// EVIDENCE AGGREGATOR
// ============================================================================
export {
  type EvidenceBundle,
  type AgentContribution,
  aggregateEvidence
} from './EvidenceAggregator.ts';

// ============================================================================
// CONFIDENCE
// ============================================================================
export {
  CANONICAL_CONFIDENCE_LEVELS,
  type ConfidenceLevel,
  type ConfidenceResult,
  type ConfidenceFactor,
  calculateConfidence,
  shouldAskClarification,
  getConfidenceSummary
} from './EducationalConfidence.ts';

// ============================================================================
// ORCHESTRATOR
// ============================================================================
export {
  type OrchestrationRequest,
  type OrchestrationResult,
  type PromptContext,
  type OrchestrationMetadata,
  EducationalOrchestrator,
  getEducationalOrchestrator,
  resetEducationalOrchestrator
} from './EducationalOrchestrator.ts';
