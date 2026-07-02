/**
 * Educational Validation — Validation Rules
 *
 * Validates educational responses.
 * Validation is deterministic — no LLM involvement.
 */

import type { EducationalResponse } from './EducationalResponse.ts';
import type { EducationalSectionRef, EducationalCardRef, EducationalActionRef } from './EducationalResponse.ts';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export const CANONICAL_EDUCATIONAL_VALIDATION_CODES = [
  'response_valid',
  'response_empty',
  'response_no_sections',
  'section_invalid_type',
  'section_empty_content',
  'card_invalid_type',
  'card_empty_content',
  'action_invalid_type',
  'action_disabled',
  'metadata_inconsistent',
  'duplicate_section_ids',
  'duplicate_card_ids',
  'duplicate_action_ids'
] as const;

export type EducationalValidationCode = (typeof CANONICAL_EDUCATIONAL_VALIDATION_CODES)[number];

export interface EducationalValidationResult {
  readonly valid: boolean;
  readonly code: EducationalValidationCode;
  readonly message: string;
  readonly metadata: EducationalValidationMetadata;
}

export interface EducationalValidationMetadata {
  readonly checkedAt: string;
  readonly validatorVersion: string;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateEducationalResponse(
  response: EducationalResponse
): EducationalValidationResult {
  const checkedAt = new Date().toISOString();
  const metadata: EducationalValidationMetadata = {
    checkedAt,
    validatorVersion: '1.0.0'
  };

  // Check content
  if (!response.content || response.content.trim().length === 0) {
    return {
      valid: false,
      code: 'response_empty',
      message: 'Response has empty content',
      metadata
    };
  }

  // Check sections
  if (response.sections.length === 0) {
    return {
      valid: false,
      code: 'response_no_sections',
      message: 'Response has no sections',
      metadata
    };
  }

  // Validate sections
  for (const section of response.sections) {
    const sectionResult = validateSection(section);
    if (!sectionResult.valid) {
      return sectionResult;
    }
  }

  // Validate cards
  for (const card of response.cards) {
    const cardResult = validateCard(card);
    if (!cardResult.valid) {
      return cardResult;
    }
  }

  // Validate actions
  for (const action of response.actions) {
    const actionResult = validateAction(action);
    if (!actionResult.valid) {
      return actionResult;
    }
  }

  // Check for duplicate IDs
  if (!hasNoDuplicateIds(response.sections.map(s => s.id))) {
    return {
      valid: false,
      code: 'duplicate_section_ids',
      message: 'Response has duplicate section IDs',
      metadata
    };
  }

  if (!hasNoDuplicateIds(response.cards.map(c => c.id))) {
    return {
      valid: false,
      code: 'duplicate_card_ids',
      message: 'Response has duplicate card IDs',
      metadata
    };
  }

  if (!hasNoDuplicateIds(response.actions.map(a => a.id))) {
    return {
      valid: false,
      code: 'duplicate_action_ids',
      message: 'Response has duplicate action IDs',
      metadata
    };
  }

  return {
    valid: true,
    code: 'response_valid',
    message: 'Response is valid',
    metadata
  };
}

export function validateSection(section: EducationalSectionRef): EducationalValidationResult {
  const checkedAt = new Date().toISOString();
  const metadata: EducationalValidationMetadata = {
    checkedAt,
    validatorVersion: '1.0.0'
  };

  const validTypes = [
    'explanation', 'key-concepts', 'important-observations', 'examples',
    'mathematical-insight', 'engineering-perspective', 'applications',
    'research-notes', 'visual-suggestions', 'laboratory-suggestions',
    'assessment-suggestions', 'common-misconceptions', 'related-concepts',
    'learning-path-recommendations', 'summary', 'next-steps', 'references', 'confidence'
  ];

  if (!validTypes.includes(section.type)) {
    return {
      valid: false,
      code: 'section_invalid_type',
      message: `Invalid section type: ${section.type}`,
      metadata
    };
  }

  if (!section.content || section.content.trim().length === 0) {
    return {
      valid: false,
      code: 'section_empty_content',
      message: `Section "${section.title}" has empty content`,
      metadata
    };
  }

  return {
    valid: true,
    code: 'response_valid',
    message: 'Section is valid',
    metadata
  };
}

export function validateCard(card: EducationalCardRef): EducationalValidationResult {
  const checkedAt = new Date().toISOString();
  const metadata: EducationalValidationMetadata = {
    checkedAt,
    validatorVersion: '1.0.0'
  };

  const validTypes = [
    'concept', 'comparison', 'timeline', 'warning', 'misconception',
    'research', 'application', 'laboratory', 'assessment', 'reference',
    'visual', 'code', 'formula', 'step-by-step'
  ];

  if (!validTypes.includes(card.type)) {
    return {
      valid: false,
      code: 'card_invalid_type',
      message: `Invalid card type: ${card.type}`,
      metadata
    };
  }

  if (!card.content || card.content.trim().length === 0) {
    return {
      valid: false,
      code: 'card_empty_content',
      message: `Card "${card.title}" has empty content`,
      metadata
    };
  }

  return {
    valid: true,
    code: 'response_valid',
    message: 'Card is valid',
    metadata
  };
}

export function validateAction(action: EducationalActionRef): EducationalValidationResult {
  const checkedAt = new Date().toISOString();
  const metadata: EducationalValidationMetadata = {
    checkedAt,
    validatorVersion: '1.0.0'
  };

  const validTypes = [
    'explain-more', 'show-diagram', 'generate-quiz', 'open-laboratory',
    'compare-concepts', 'show-applications', 'view-references', 'practice',
    'save', 'continue-learning', 'simplify', 'deepen', 'show-examples',
    'generate-flashcards', 'view-visual'
  ];

  if (!validTypes.includes(action.type)) {
    return {
      valid: false,
      code: 'action_invalid_type',
      message: `Invalid action type: ${action.type}`,
      metadata
    };
  }

  if (!action.enabled) {
    return {
      valid: false,
      code: 'action_disabled',
      message: `Action "${action.label}" is disabled`,
      metadata
    };
  }

  return {
    valid: true,
    code: 'response_valid',
    message: 'Action is valid',
    metadata
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

function hasNoDuplicateIds(ids: readonly string[]): boolean {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) return false;
    seen.add(id);
  }
  return true;
}

export function isValidEducationalResponse(response: EducationalResponse): boolean {
  return validateEducationalResponse(response).valid;
}

export function getValidationErrors(response: EducationalResponse): readonly EducationalValidationResult[] {
  const errors: EducationalValidationResult[] = [];

  const responseResult = validateEducationalResponse(response);
  if (!responseResult.valid) {
    errors.push(responseResult);
  }

  for (const section of response.sections) {
    const result = validateSection(section);
    if (!result.valid) errors.push(result);
  }

  for (const card of response.cards) {
    const result = validateCard(card);
    if (!result.valid) errors.push(result);
  }

  for (const action of response.actions) {
    const result = validateAction(action);
    if (!result.valid) errors.push(result);
  }

  return errors;
}
