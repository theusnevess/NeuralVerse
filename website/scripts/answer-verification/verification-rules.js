/**
 * NV-1100-P6 — Verification Rules
 *
 * One rule per answer type. Each rule exports a `verify(expected, actual, options)`
 * function that returns an `EngineResult` (use `makeResult` from the normalizer).
 *
 * Rules are pure. They do not throw. Malformed inputs return `partial` or
 * `invalid` rather than raising an exception.
 */

import {
  safeText, trimText, collapseWhitespace, removePunctuation, removeAccents,
  parseNumber, parseBoolean, normalizeList, normalizeAnswerChoice,
  normalizeFormulaString, normalizeText, tokenizeForKeywords, makeResult
} from './answer-normalizer.js';

const SAFE_STATUSES = new Set(['match', 'no_match', 'partial', 'invalid']);

function ok(partial) {
  const r = makeResult(partial);
  if (!SAFE_STATUSES.has(r.status)) r.status = 'invalid';
  return r;
}

function safeString(v) {
  return v === null || v === undefined ? '' : String(v);
}

function checkExactText(expected, actual, options) {
  const opts = options || {};
  const caseSensitive = !!opts.caseSensitive;
  const trim = opts.trim !== false;
  let e = safeString(expected);
  let a = safeString(actual);
  if (trim) { e = trimText(e); a = trimText(a); }
  if (!caseSensitive) { e = e.toLowerCase(); a = a.toLowerCase(); }
  if (e === '') return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'No expected answer configured.', details: { reason: 'empty-expected' } });
  const match = e === a;
  return ok({
    status: match ? 'match' : 'no_match',
    matchesExpected: match,
    needsRetry: !match,
    partiallyCheckable: false,
    message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.',
    details: { expected: e, actual: a, caseSensitive, trim }
  });
}

function checkNormalizedText(expected, actual, options) {
  const opts = options || {};
  if (safeString(expected).length === 0) {
    return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'No expected answer configured.', details: { reason: 'empty-expected' } });
  }
  const e = normalizeText(expected, opts);
  const a = normalizeText(actual, opts);
  const match = e === a;
  return ok({
    status: match ? 'match' : 'no_match',
    matchesExpected: match,
    needsRetry: !match,
    partiallyCheckable: false,
    message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.',
    details: { expectedNormalized: e, actualNormalized: a, options: opts }
  });
}

function checkNumeric(expected, actual, options) {
  const e = parseNumber(expected);
  const a = parseNumber(actual);
  if (e === null) {
    return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected numeric value is not parseable.', details: { reason: 'expected-not-numeric' } });
  }
  if (a === null) {
    return ok({ status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false, message: 'Your answer is not a valid number.', details: { reason: 'actual-not-numeric', actual } });
  }
  const match = e === a;
  return ok({
    status: match ? 'match' : 'no_match',
    matchesExpected: match,
    needsRetry: !match,
    partiallyCheckable: false,
    message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.',
    details: { expected: e, actual: a }
  });
}

function checkNumericTolerance(expected, actual, options) {
  const opts = options || {};
  const e = parseNumber(expected);
  const a = parseNumber(actual);
  if (e === null) return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected numeric value is not parseable.', details: { reason: 'expected-not-numeric' } });
  if (a === null) return ok({ status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false, message: 'Your answer is not a valid number.', details: { reason: 'actual-not-numeric' } });
  const absT = opts.absoluteTolerance;
  const relT = opts.relativeTolerance;
  if (absT !== undefined && (typeof absT !== 'number' || !Number.isFinite(absT) || absT < 0)) {
    return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Invalid absoluteTolerance.', details: { reason: 'bad-tolerance', absoluteTolerance: absT } });
  }
  if (relT !== undefined && (typeof relT !== 'number' || !Number.isFinite(relT) || relT < 0)) {
    return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Invalid relativeTolerance.', details: { reason: 'bad-tolerance', relativeTolerance: relT } });
  }
  const diff = Math.abs(e - a);
  let match = false;
  let reason = '';
  if (absT !== undefined && diff <= absT) { match = true; reason = 'absolute'; }
  else if (relT !== undefined && e !== 0 && diff / Math.abs(e) <= relT) { match = true; reason = 'relative'; }
  else if (relT !== undefined && e === 0 && diff <= relT) { match = true; reason = 'relative-zero'; }
  return ok({
    status: match ? 'match' : 'no_match',
    matchesExpected: match,
    needsRetry: !match,
    partiallyCheckable: false,
    message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer within the allowed tolerance.',
    details: { expected: e, actual: a, diff, absoluteTolerance: absT, relativeTolerance: relT, matchReason: reason || 'none' }
  });
}

function checkMultipleChoice(expected, actual, options) {
  const e = normalizeAnswerChoice(expected);
  const a = normalizeAnswerChoice(actual);
  if (!e) return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected choice is empty.', details: { reason: 'empty-expected' } });
  const match = e === a;
  return ok({
    status: match ? 'match' : 'no_match',
    matchesExpected: match,
    needsRetry: !match,
    partiallyCheckable: false,
    message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.',
    details: { expected: e, actual: a }
  });
}

function arraysEqualSet(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return false;
  return true;
}

function checkMultiSelect(expected, actual, options) {
  const opts = options || {};
  const eRaw = Array.isArray(expected) ? expected : normalizeList(expected);
  const aRaw = Array.isArray(actual) ? actual : normalizeList(actual);
  if (eRaw.length === 0) return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected list is empty.', details: { reason: 'empty-expected' } });
  const e = eRaw.map(normalizeAnswerChoice);
  const a = aRaw.map(normalizeAnswerChoice).filter(x => x.length > 0);
  const orderSensitive = !!opts.orderSensitive;
  const match = orderSensitive
    ? JSON.stringify(e) === JSON.stringify(a)
    : arraysEqualSet(e, a);
  return ok({
    status: match ? 'match' : 'no_match',
    matchesExpected: match,
    needsRetry: !match,
    partiallyCheckable: false,
    message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.',
    details: { expected: e, actual: a, orderSensitive }
  });
}

function checkKeywordPresence(expected, actual, options) {
  const opts = options || {};
  const e = Array.isArray(expected) ? expected.map(safeText) : normalizeList(expected);
  if (e.length === 0) return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected keywords list is empty.', details: { reason: 'empty-expected' } });
  const aTokens = tokenizeForKeywords(actual);
  const aSet = new Set(aTokens);
  const matched = [];
  const missing = [];
  for (const kw of e) {
    const tokens = tokenizeForKeywords(kw);
    const allPresent = tokens.length > 0 && tokens.every(t => aSet.has(t));
    if (allPresent) matched.push(kw);
    else missing.push(kw);
  }
  // minRequired lets a learner pass with N out of M keywords.
  // When minRequired is explicitly set, the missing keywords are still
  // reported in details but do not affect the match status — the user
  // is acknowledging that N of M is sufficient.
  const minRequired = opts.minRequired != null ? Math.max(1, Math.floor(Number(opts.minRequired))) : e.length;
  const matchedCount = matched.length;
  const match = matchedCount >= minRequired;
  return ok({
    status: match ? 'match' : (matchedCount > 0 ? 'partial' : 'no_match'),
    matchesExpected: match,
    needsRetry: !match,
    partiallyCheckable: !match && matchedCount > 0,
    message: match
      ? 'Your answer matches the expected answer.'
      : (matchedCount > 0
          ? 'Some expected keywords are missing from your answer.'
          : 'Your answer does not match the expected answer.'),
    details: { expectedKeywords: e, matchedKeywords: matched, missingKeywords: missing, minRequired }
  });
}

function checkOrderedList(expected, actual) {
  const e = Array.isArray(expected) ? expected.map(safeText) : normalizeList(expected);
  const a = Array.isArray(actual) ? actual.map(safeText) : normalizeList(actual);
  if (e.length === 0) return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected ordered list is empty.', details: { reason: 'empty-expected' } });
  if (a.length === 0) return ok({ status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false, message: 'Your answer is empty.', details: { reason: 'empty-actual' } });
  const match = e.length === a.length && e.every((v, i) => v === a[i]);
  return ok({
    status: match ? 'match' : 'no_match',
    matchesExpected: match,
    needsRetry: !match,
    partiallyCheckable: false,
    message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.',
    details: { expected: e, actual: a }
  });
}

function checkUnorderedList(expected, actual) {
  const e = Array.isArray(expected) ? expected.map(safeText) : normalizeList(expected);
  const a = Array.isArray(actual) ? actual.map(safeText) : normalizeList(actual);
  if (e.length === 0) return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected unordered list is empty.', details: { reason: 'empty-expected' } });
  if (a.length === 0) return ok({ status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false, message: 'Your answer is empty.', details: { reason: 'empty-actual' } });
  const match = arraysEqualSet(e, a);
  return ok({
    status: match ? 'match' : 'no_match',
    matchesExpected: match,
    needsRetry: !match,
    partiallyCheckable: false,
    message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.',
    details: { expected: e, actual: a }
  });
}

function checkBoolean(expected, actual) {
  const e = parseBoolean(expected);
  const a = parseBoolean(actual);
  if (e === null) return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected boolean is not parseable.', details: { reason: 'expected-not-boolean' } });
  if (a === null) return ok({ status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false, message: 'Your answer is not a recognizable yes/no value.', details: { reason: 'actual-not-boolean' } });
  const match = e === a;
  return ok({
    status: match ? 'match' : 'no_match',
    matchesExpected: match,
    needsRetry: !match,
    partiallyCheckable: false,
    message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.',
    details: { expected: e, actual: a }
  });
}

function checkFormulaString(expected, actual) {
  if (safeString(expected).length === 0) return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected formula is empty.', details: { reason: 'empty-expected' } });
  const e = normalizeFormulaString(expected);
  const a = normalizeFormulaString(actual);
  const match = e === a;
  return ok({
    status: match ? 'match' : 'no_match',
    matchesExpected: match,
    needsRetry: !match,
    partiallyCheckable: false,
    message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.',
    details: { expectedNormalized: e, actualNormalized: a }
  });
}

function checkExplanationChecklist(expected, actual, options) {
  const opts = options || {};
  const e = Array.isArray(expected) ? expected.map(safeText) : normalizeList(expected);
  if (e.length === 0) return ok({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected checklist is empty.', details: { reason: 'empty-expected' } });
  const aTokens = tokenizeForKeywords(actual);
  const aSet = new Set(aTokens);
  const matched = [];
  const missing = [];
  for (const crit of e) {
    // Strip leading meta-verbs ("mentions", "discusses", "describes", etc.)
    // so "mentions attention weights" is treated as "attention weights".
    const stripped = String(crit).replace(/^(mentions?|discusses?|describes?|covers?|addresses?|includes?|uses?|states?|explains?)\s+/i, '');
    const tokens = tokenizeForKeywords(stripped);
    const present = tokens.length > 0 && tokens.every(t => aSet.has(t));
    if (present) matched.push(crit);
    else missing.push(crit);
  }
  const allMatch = missing.length === 0;
  return ok({
    status: allMatch ? 'match' : (matched.length > 0 ? 'partial' : 'no_match'),
    matchesExpected: allMatch,
    needsRetry: !allMatch,
    partiallyCheckable: !allMatch && matched.length > 0,
    message: allMatch
      ? 'Your answer matches the expected answer.'
      : (matched.length > 0
          ? 'This answer can only be partially checked automatically. Some criteria are not verifiable by deterministic rules.'
          : 'This answer can only be partially checked automatically. No criteria matched.'),
    details: { expectedCriteria: e, matchedCriteria: matched, missingCriteria: missing, partial: !allMatch, storeAttempt: !!opts.storeAttempt }
  });
}

export const VERIFICATION_RULES = Object.freeze({
  exact_text: checkExactText,
  normalized_text: checkNormalizedText,
  numeric: checkNumeric,
  numeric_tolerance: checkNumericTolerance,
  multiple_choice: checkMultipleChoice,
  multi_select: checkMultiSelect,
  keyword_presence: checkKeywordPresence,
  ordered_list: checkOrderedList,
  unordered_list: checkUnorderedList,
  boolean: checkBoolean,
  formula_string: checkFormulaString,
  explanation_checklist: checkExplanationChecklist
});

export const SUPPORTED_TYPES = Object.freeze(Object.keys(VERIFICATION_RULES));

export function getRule(type) {
  if (!type || typeof type !== 'string') return null;
  return VERIFICATION_RULES[type] || null;
}

export default VERIFICATION_RULES;
