/**
 * Response Validator — Validates LLM Responses
 *
 * Ensures responses are valid, complete, and safe before rendering.
 */

import type { LLMResponse, LLMProviderError, FinishReason } from '../llm-provider/LLMProvider.ts';
import { isLLMResponse } from '../llm-provider/LLMProvider.ts';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export const CANONICAL_VALIDATION_CODES = [
  'response_valid',
  'response_empty',
  'response_too_short',
  'response_too_long',
  'response_contains_forbidden',
  'response_missing_structure',
  'response_finish_error',
  'response_provider_error',
  'response_timeout',
  'response_metadata_missing'
] as const;

export type ValidationCode = (typeof CANONICAL_VALIDATION_CODES)[number];

export interface ResponseValidationResult {
  readonly valid: boolean;
  readonly code: ValidationCode;
  readonly message: string;
  readonly sanitizedContent?: string;
  readonly metadata: ValidationMetadata;
}

export interface ValidationMetadata {
  readonly originalLength: number;
  readonly sanitizedLength: number;
  readonly checkedAt: string;
  readonly validatorVersion: string;
}

// ============================================================================
// VALIDATION CONFIG
// ============================================================================

export interface ValidationConfig {
  readonly minLength: number;
  readonly maxLength: number;
  readonly requireStructure: boolean;
  readonly forbiddenPatterns: readonly string[];
}

const DEFAULT_CONFIG: ValidationConfig = {
  minLength: 10,
  maxLength: 10000,
  requireStructure: true,
  forbiddenPatterns: [
    'I cannot help with that',
    'I\'m not able to',
    'This request violates'
  ]
};

// ============================================================================
// VALIDATOR
// ============================================================================

export function validateResponse(
  result: LLMResponse | LLMProviderError,
  config: Partial<ValidationConfig> = {}
): ResponseValidationResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const checkedAt = new Date().toISOString();

  // Check if it's a provider error
  if (!isLLMResponse(result)) {
    return {
      valid: false,
      code: 'response_provider_error',
      message: `Provider error: ${result.message}`,
      metadata: {
        originalLength: 0,
        sanitizedLength: 0,
        checkedAt,
        validatorVersion: '1.0.0'
      }
    };
  }

  const content = result.content;

  // Check for empty response
  if (!content || content.trim().length === 0) {
    return {
      valid: false,
      code: 'response_empty',
      message: 'Response content is empty',
      metadata: {
        originalLength: 0,
        sanitizedLength: 0,
        checkedAt,
        validatorVersion: '1.0.0'
      }
    };
  }

  // Check length
  if (content.length < cfg.minLength) {
    return {
      valid: false,
      code: 'response_too_short',
      message: `Response too short: ${content.length} chars (minimum: ${cfg.minLength})`,
      metadata: {
        originalLength: content.length,
        sanitizedLength: content.length,
        checkedAt,
        validatorVersion: '1.0.0'
      }
    };
  }

  if (content.length > cfg.maxLength) {
    return {
      valid: false,
      code: 'response_too_long',
      message: `Response too long: ${content.length} chars (maximum: ${cfg.maxLength})`,
      metadata: {
        originalLength: content.length,
        sanitizedLength: content.length,
        checkedAt,
        validatorVersion: '1.0.0'
      }
    };
  }

  // Check finish reason
  if (result.finishReason === 'error') {
    return {
      valid: false,
      code: 'response_finish_error',
      message: 'Response finished with error',
      metadata: {
        originalLength: content.length,
        sanitizedLength: content.length,
        checkedAt,
        validatorVersion: '1.0.0'
      }
    };
  }

  // Check for forbidden patterns
  const sanitized = sanitizeContent(content, cfg.forbiddenPatterns);
  if (sanitized !== content) {
    return {
      valid: false,
      code: 'response_contains_forbidden',
      message: 'Response contains forbidden content patterns',
      sanitizedContent: sanitized,
      metadata: {
        originalLength: content.length,
        sanitizedLength: sanitized.length,
        checkedAt,
        validatorVersion: '1.0.0'
      }
    };
  }

  // Check structure (basic markdown check)
  if (cfg.requireStructure && !hasBasicStructure(content)) {
    return {
      valid: false,
      code: 'response_missing_structure',
      message: 'Response lacks basic structural elements',
      metadata: {
        originalLength: content.length,
        sanitizedLength: content.length,
        checkedAt,
        validatorVersion: '1.0.0'
      }
    };
  }

  // All checks passed
  return {
    valid: true,
    code: 'response_valid',
    message: 'Response is valid',
    metadata: {
      originalLength: content.length,
      sanitizedLength: content.length,
      checkedAt,
      validatorVersion: '1.0.0'
    }
  };
}

// ============================================================================
// SANITIZATION
// ============================================================================

function sanitizeContent(content: string, forbiddenPatterns: readonly string[]): string {
  let sanitized = content;

  for (const pattern of forbiddenPatterns) {
    if (sanitized.includes(pattern)) {
      sanitized = sanitized.replace(pattern, '[Content filtered]');
    }
  }

  return sanitized;
}

function hasBasicStructure(content: string): boolean {
  // Check for paragraphs, lists, or headers
  const hasParagraphs = content.split('\n\n').length > 1;
  const hasList = /^[-*]\s/m.test(content) || /^\d+\.\s/m.test(content);
  const hasHeaders = /^#+\s/m.test(content);

  return hasParagraphs || hasList || hasHeaders || content.length > 100;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export function isValidResponse(result: LLMResponse | LLMProviderError): boolean {
  return validateResponse(result).valid;
}

export function getSanitizedContent(result: LLMResponse | LLMProviderError): string {
  if (!isLLMResponse(result)) {
    return '';
  }
  const validation = validateResponse(result);
  return validation.sanitizedContent || result.content;
}
