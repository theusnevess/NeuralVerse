/**
 * NV-1100-P6 — Verification Engine
 *
 * Top-level façade. `verifyAnswer` dispatches to the appropriate rule and
 * returns a canonical result. Safe by default: any thrown error becomes
 * an `invalid` result; any unsupported type returns `partial` per spec.
 */

import { makeResult, isSafeStatus } from './answer-normalizer.js';
import { VERIFICATION_RULES, SUPPORTED_TYPES, getRule } from './verification-rules.js';

const FORBIDDEN_STATUSES = new Set(['passed', 'failed', 'mastered', 'proficient', 'graded', 'scored']);

function safeFeedbackForStatus(status, feedback) {
  const fb = feedback || {};
  if (status === 'match') return fb.match || 'Your answer matches the expected answer.';
  if (status === 'no_match') return fb.noMatch || 'Your answer does not match the expected answer.';
  if (status === 'partial') return fb.partial || 'This answer can only be partially checked automatically.';
  return fb.invalid || 'This answer could not be checked.';
}

export function verifyAnswer(input) {
  if (!input || typeof input !== 'object') {
    return makeResult({
      status: 'invalid',
      matchesExpected: false,
      needsRetry: false,
      partiallyCheckable: false,
      message: 'Verification input is invalid.',
      details: { reason: 'bad-input' }
    });
  }
  const type = input.type;
  const expected = input.expected;
  const actual = input.actual;
  const options = input.options || {};
  const feedback = input.feedback || {};

  let result;
  try {
    if (!type || typeof type !== 'string') {
      result = makeResult({
        status: 'invalid',
        matchesExpected: false,
        needsRetry: false,
        partiallyCheckable: false,
        message: 'Verification type is missing.',
        details: { reason: 'missing-type' }
      });
    } else if (!SUPPORTED_TYPES.includes(type)) {
      result = makeResult({
        status: 'partial',
        matchesExpected: false,
        needsRetry: false,
        partiallyCheckable: true,
        message: 'This answer can only be partially checked automatically — verification type is not supported.',
        details: { reason: 'unsupported-type', type }
      });
    } else {
      const rule = getRule(type);
      result = rule(expected, actual, options);
    }
  } catch (err) {
    result = makeResult({
      status: 'invalid',
      matchesExpected: false,
      needsRetry: false,
      partiallyCheckable: false,
      message: 'Verification could not complete.',
      details: { reason: 'exception', error: err && err.message ? err.message : String(err) }
    });
  }

  // Defensive normalization
  if (!result || typeof result !== 'object') {
    return makeResult({ status: 'invalid', message: 'Verification produced no result.' });
  }
  if (!isSafeStatus(result.status) || FORBIDDEN_STATUSES.has(result.status)) {
    result.status = 'invalid';
  }
  if (typeof result.matchesExpected !== 'boolean') result.matchesExpected = result.status === 'match';
  if (typeof result.needsRetry !== 'boolean') result.needsRetry = result.status === 'no_match';
  if (typeof result.partiallyCheckable !== 'boolean') result.partiallyCheckable = result.status === 'partial';
  if (typeof result.message !== 'string' || result.message.length === 0) {
    result.message = safeFeedbackForStatus(result.status, feedback);
  }
  if (typeof result.timestamp !== 'string') result.timestamp = new Date().toISOString();
  if (!result.details || typeof result.details !== 'object') result.details = {};
  return result;
}

export const VERIFICATION_ENGINE = Object.freeze({
  SUPPORTED_TYPES,
  verifyAnswer,
  isSafeStatus
});

export default VERIFICATION_ENGINE;
