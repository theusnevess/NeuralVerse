/**
 * Educational Response Pipeline — Public API
 *
 * Transforms LLM answers into structured educational experiences.
 */

// ============================================================================
// RESPONSE
// ============================================================================
export {
  CANONICAL_EDUCATIONAL_RESPONSE_TYPES,
  CANONICAL_CONFIDENCE_LEVELS,
  type EducationalResponseType,
  type ConfidenceLevel,
  type EducationalResponse,
  type EducationalContext,
  type EducationalLessonContext,
  type EducationalModuleContext,
  type EducationalPathContext,
  type EducationalAgentOutput,
  type EducationalRetrievalContext,
  createEducationalResponse
} from './EducationalResponse.ts';

// ============================================================================
// SECTIONS
// ============================================================================
export {
  CANONICAL_SECTION_TYPES,
  type SectionType,
  type EducationalSection,
  generateSections
} from './EducationalSections.ts';

// ============================================================================
// CARDS
// ============================================================================
export {
  CANONICAL_CARD_TYPES,
  type CardType,
  type EducationalCard,
  type CardMetadata,
  generateCards
} from './EducationalCards.ts';

// ============================================================================
// ACTIONS
// ============================================================================
export {
  CANONICAL_ACTION_TYPES,
  type ActionType,
  type EducationalAction,
  generateActions,
  getActionByType,
  getEnabledActions,
  getActionsByPriority
} from './EducationalActions.ts';

// ============================================================================
// METADATA
// ============================================================================
export {
  type EducationalMetadata,
  generateMetadata,
  getMetadataSummary,
  isMetadataConsistent
} from './EducationalMetadata.ts';

// ============================================================================
// VALIDATION
// ============================================================================
export {
  CANONICAL_EDUCATIONAL_VALIDATION_CODES,
  type EducationalValidationCode,
  type EducationalValidationResult,
  type EducationalValidationMetadata,
  validateEducationalResponse,
  validateSection,
  validateCard,
  validateAction,
  isValidEducationalResponse,
  getValidationErrors
} from './EducationalValidation.ts';

// ============================================================================
// PIPELINE
// ============================================================================
export {
  EducationalResponsePipeline,
  getEducationalPipeline,
  resetEducationalPipeline
} from './EducationalResponsePipeline.ts';
