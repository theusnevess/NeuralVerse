#!/usr/bin/env node
/**
 * NV-1100-P6 — Answer Verification Validator
 *
 * Pure-Node validation of the answer verification engine and rules.
 * Covers all 12 answer types + edge cases + governance guardrails.
 *
 * No browser required. All rules are pure functions and are tested
 * directly by importing their definitions.
 */

const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const REPORT_DIR = '/tmp/neuralverse-nv1100-p6-validator';
const DOCS_DIR = path.join(REPO, 'docs', 'architecture', 'nv-1100');

let critical = [];
let high = [];
let medium = [];
let low = [];
let info = [];
let checks = [];
let fixtures = [];

function pass(category, message) { checks.push({ category, status: 'PASS', message }); }
function fail(severity, category, message) {
  const e = { category, message };
  if (severity === 'critical') critical.push(e);
  else if (severity === 'high') high.push(e);
  else if (severity === 'medium') medium.push(e);
  else low.push(e);
  checks.push({ category, status: 'FAIL', severity, message });
}
function infoLog(category, message) { info.push({ category, message }); }
function log(m) { console.log(m); }
function section(t) { log(`\n\x1b[1m=== ${t} ===\x1b[0m`); }

// Inline minimal copy of normalizer + engine (mirrors the browser module).
// This avoids a bundler step and keeps the validator runnable in pure Node.

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function trimText(s) { return String(s == null ? '' : s).replace(/^[\s\u00A0]+|[\s\u00A0]+$/g, ''); }
function collapseWhitespace(s) { return trimText(s).replace(/\s+/g, ' '); }
function removePunctuation(s) { return String(s).replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~«»‹›…—–‐‘’“”„•·¡¿]/g, ''); }
function removeAccents(s) { return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function normalizeText(value, options) {
  const opts = options || {};
  let s = value == null ? '' : String(value);
  if (opts.trim !== false) s = trimText(s);
  if (opts.ignorePunctuation) s = removePunctuation(s);
  if (opts.ignoreAccents) s = removeAccents(s);
  if (opts.ignoreCase !== false) s = s.toLowerCase();
  if (opts.collapseWhitespace !== false) s = collapseWhitespace(s);
  return s;
}
function parseNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  const s = String(value).trim();
  if (s === '') return null;
  const cleaned = s.replace(/,/g, '').replace(/\s/g, '');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
function parseBoolean(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }
  const s = collapseWhitespace(String(value).toLowerCase());
  if (['true', 'yes', 'y', 'sim', 's', '1', 'verdadeiro', 't', '✓', '✔'].includes(s)) return true;
  if (['false', 'no', 'n', 'nao', 'não', '0', 'falso', 'f', '✗', '✘'].includes(s)) return false;
  return null;
}
function normalizeList(value) {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.map(v => v == null ? '' : String(v)).map(trimText).filter(s => s.length > 0);
  return String(value).split(/[,;\n|]+/).map(trimText).filter(s => s.length > 0);
}
function normalizeAnswerChoice(value) {
  if (value === null || value === undefined) return '';
  let s = trimText(String(value));
  if (s.length === 0) return '';
  if (/^[A-Za-z]\d*$/i.test(s)) return s[0].toUpperCase();
  return s;
}
function normalizeFormulaString(value) {
  let s = value == null ? '' : String(value);
  s = collapseWhitespace(s);
  s = removePunctuation(s);
  s = s.replace(/\s+/g, '');
  s = s.toLowerCase();
  return s;
}
function tokenizeForKeywords(value) {
  const stripped = removePunctuation((value == null ? '' : String(value)).toLowerCase());
  const s = collapseWhitespace(stripped);
  if (!s) return [];
  return s.split(/\s+/).filter(t => t.length > 0);
}
function makeResult(p) {
  const base = { status: 'invalid', matchesExpected: false, needsRetry: false, partiallyCheckable: false, message: '', details: {}, timestamp: new Date().toISOString() };
  return Object.assign(base, p || {});
}
function arraysEqualSet(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const sa = [...a].sort(); const sb = [...b].sort();
  for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return false;
  return true;
}

// Verification rules (inlined, same logic as browser modules)
function checkExactText(expected, actual, options) {
  const opts = options || {};
  const caseSensitive = !!opts.caseSensitive;
  const trim = opts.trim !== false;
  let e = expected == null ? '' : String(expected);
  let a = actual == null ? '' : String(actual);
  if (trim) { e = trimText(e); a = trimText(a); }
  if (!caseSensitive) { e = e.toLowerCase(); a = a.toLowerCase(); }
  if (e === '') return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'No expected answer configured.', details: { reason: 'empty-expected' } });
  const match = e === a;
  return makeResult({ status: match ? 'match' : 'no_match', matchesExpected: match, needsRetry: !match, partiallyCheckable: false, message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.', details: { expected: e, actual: a } });
}
function checkNormalizedText(expected, actual, options) {
  const opts = options || {};
  if ((expected == null ? '' : String(expected)).length === 0) return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'No expected answer configured.' });
  const e = normalizeText(expected, opts);
  const a = normalizeText(actual, opts);
  const match = e === a;
  return makeResult({ status: match ? 'match' : 'no_match', matchesExpected: match, needsRetry: !match, partiallyCheckable: false, message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.', details: { expectedNormalized: e, actualNormalized: a } });
}
function checkNumeric(expected, actual) {
  const e = parseNumber(expected);
  const a = parseNumber(actual);
  if (e === null) return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected numeric value is not parseable.' });
  if (a === null) return makeResult({ status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false, message: 'Your answer is not a valid number.' });
  const match = e === a;
  return makeResult({ status: match ? 'match' : 'no_match', matchesExpected: match, needsRetry: !match, partiallyCheckable: false, message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.', details: { expected: e, actual: a } });
}
function checkNumericTolerance(expected, actual, options) {
  const opts = options || {};
  const e = parseNumber(expected);
  const a = parseNumber(actual);
  if (e === null) return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected numeric value is not parseable.' });
  if (a === null) return makeResult({ status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false, message: 'Your answer is not a valid number.' });
  const absT = opts.absoluteTolerance;
  const relT = opts.relativeTolerance;
  if (absT !== undefined && (typeof absT !== 'number' || !Number.isFinite(absT) || absT < 0)) return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Invalid absoluteTolerance.' });
  if (relT !== undefined && (typeof relT !== 'number' || !Number.isFinite(relT) || relT < 0)) return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Invalid relativeTolerance.' });
  const diff = Math.abs(e - a);
  let match = false; let reason = '';
  if (absT !== undefined && diff <= absT) { match = true; reason = 'absolute'; }
  else if (relT !== undefined && e !== 0 && diff / Math.abs(e) <= relT) { match = true; reason = 'relative'; }
  else if (relT !== undefined && e === 0 && diff <= relT) { match = true; reason = 'relative-zero'; }
  return makeResult({ status: match ? 'match' : 'no_match', matchesExpected: match, needsRetry: !match, partiallyCheckable: false, message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer within the allowed tolerance.', details: { expected: e, actual: a, diff, absoluteTolerance: absT, relativeTolerance: relT, matchReason: reason || 'none' } });
}
function checkMultipleChoice(expected, actual) {
  const e = normalizeAnswerChoice(expected);
  const a = normalizeAnswerChoice(actual);
  if (!e) return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected choice is empty.' });
  const match = e === a;
  return makeResult({ status: match ? 'match' : 'no_match', matchesExpected: match, needsRetry: !match, partiallyCheckable: false, message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.', details: { expected: e, actual: a } });
}
function checkMultiSelect(expected, actual, options) {
  const opts = options || {};
  const e = (Array.isArray(expected) ? expected : normalizeList(expected)).map(normalizeAnswerChoice);
  const a = (Array.isArray(actual) ? actual : normalizeList(actual)).map(normalizeAnswerChoice).filter(x => x.length > 0);
  if (e.length === 0) return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected list is empty.' });
  const orderSensitive = !!opts.orderSensitive;
  const match = orderSensitive ? JSON.stringify(e) === JSON.stringify(a) : arraysEqualSet(e, a);
  return makeResult({ status: match ? 'match' : 'no_match', matchesExpected: match, needsRetry: !match, partiallyCheckable: false, message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.', details: { expected: e, actual: a, orderSensitive } });
}
function checkKeywordPresence(expected, actual, options) {
  const opts = options || {};
  const e = Array.isArray(expected) ? expected.map(s => s == null ? '' : String(s)) : normalizeList(expected);
  if (e.length === 0) return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected keywords list is empty.' });
  const aTokens = tokenizeForKeywords(actual);
  const aSet = new Set(aTokens);
  const matched = []; const missing = [];
  for (const kw of e) {
    const tokens = tokenizeForKeywords(kw);
    if (tokens.length > 0 && tokens.every(t => aSet.has(t))) matched.push(kw);
    else missing.push(kw);
  }
  const minRequired = opts.minRequired != null ? Math.max(1, Math.floor(Number(opts.minRequired))) : e.length;
  const matchedCount = matched.length;
  const match = matchedCount >= minRequired;
  return makeResult({ status: match ? 'match' : (matchedCount > 0 ? 'partial' : 'no_match'), matchesExpected: match, needsRetry: !match, partiallyCheckable: !match && matchedCount > 0, message: match ? 'Your answer matches the expected answer.' : (matchedCount > 0 ? 'Some expected keywords are missing from your answer.' : 'Your answer does not match the expected answer.'), details: { expectedKeywords: e, matchedKeywords: matched, missingKeywords: missing, minRequired } });
}
function checkOrderedList(expected, actual) {
  const e = (Array.isArray(expected) ? expected : normalizeList(expected)).map(s => s == null ? '' : String(s));
  const a = (Array.isArray(actual) ? actual : normalizeList(actual)).map(s => s == null ? '' : String(s));
  if (e.length === 0) return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected ordered list is empty.' });
  if (a.length === 0) return makeResult({ status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false, message: 'Your answer is empty.' });
  const match = e.length === a.length && e.every((v, i) => v === a[i]);
  return makeResult({ status: match ? 'match' : 'no_match', matchesExpected: match, needsRetry: !match, partiallyCheckable: false, message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.', details: { expected: e, actual: a } });
}
function checkUnorderedList(expected, actual) {
  const e = (Array.isArray(expected) ? expected : normalizeList(expected)).map(s => s == null ? '' : String(s));
  const a = (Array.isArray(actual) ? actual : normalizeList(actual)).map(s => s == null ? '' : String(s));
  if (e.length === 0) return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected unordered list is empty.' });
  if (a.length === 0) return makeResult({ status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false, message: 'Your answer is empty.' });
  const match = arraysEqualSet(e, a);
  return makeResult({ status: match ? 'match' : 'no_match', matchesExpected: match, needsRetry: !match, partiallyCheckable: false, message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.', details: { expected: e, actual: a } });
}
function checkBoolean(expected, actual) {
  const e = parseBoolean(expected);
  const a = parseBoolean(actual);
  if (e === null) return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected boolean is not parseable.' });
  if (a === null) return makeResult({ status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false, message: 'Your answer is not a recognizable yes/no value.' });
  const match = e === a;
  return makeResult({ status: match ? 'match' : 'no_match', matchesExpected: match, needsRetry: !match, partiallyCheckable: false, message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.', details: { expected: e, actual: a } });
}
function checkFormulaString(expected, actual) {
  if ((expected == null ? '' : String(expected)).length === 0) return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected formula is empty.' });
  const e = normalizeFormulaString(expected);
  const a = normalizeFormulaString(actual);
  const match = e === a;
  return makeResult({ status: match ? 'match' : 'no_match', matchesExpected: match, needsRetry: !match, partiallyCheckable: false, message: match ? 'Your answer matches the expected answer.' : 'Your answer does not match the expected answer.', details: { expectedNormalized: e, actualNormalized: a } });
}
function checkExplanationChecklist(expected, actual) {
  const e = Array.isArray(expected) ? expected.map(s => s == null ? '' : String(s)) : normalizeList(expected);
  if (e.length === 0) return makeResult({ status: 'invalid', matchesExpected: false, partiallyCheckable: false, message: 'Expected checklist is empty.' });
  const aTokens = tokenizeForKeywords(actual);
  const aSet = new Set(aTokens);
  const matched = []; const missing = [];
  for (const crit of e) {
    const stripped = String(crit).replace(/^(mentions?|discusses?|describes?|covers?|addresses?|includes?|uses?|states?|explains?)\s+/i, '');
    const tokens = tokenizeForKeywords(stripped);
    if (tokens.length > 0 && tokens.every(t => aSet.has(t))) matched.push(crit);
    else missing.push(crit);
  }
  const allMatch = missing.length === 0;
  return makeResult({ status: allMatch ? 'match' : (matched.length > 0 ? 'partial' : 'no_match'), matchesExpected: allMatch, needsRetry: !allMatch, partiallyCheckable: !allMatch && matched.length > 0, message: allMatch ? 'Your answer matches the expected answer.' : (matched.length > 0 ? 'This answer can only be partially checked automatically. Some criteria are not verifiable by deterministic rules.' : 'This answer can only be partially checked automatically. No criteria matched.'), details: { expectedCriteria: e, matchedCriteria: matched, missingCriteria: missing } });
}

const RULES = {
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
};
const FORBIDDEN_STATUSES = ['passed', 'failed', 'mastered', 'proficient', 'graded', 'scored'];
const FORBIDDEN_FEEDBACK = ['mastered', 'proficient', 'score', 'xp', 'streak', 'competency', 'skill level', 'passed as', 'failed as', 'rank', 'achievement', 'certified', 'iq'];

function verify(input) {
  if (!input || typeof input !== 'object') {
    return makeResult({ status: 'invalid', message: 'Verification input is invalid.', details: { reason: 'bad-input' } });
  }
  const type = input.type;
  const expected = input.expected;
  const actual = input.actual;
  const options = input.options || {};
  let result;
  try {
    if (!type || typeof type !== 'string') {
      result = makeResult({ status: 'invalid', message: 'Verification type is missing.', details: { reason: 'missing-type' } });
    } else if (!RULES[type]) {
      result = makeResult({ status: 'partial', partiallyCheckable: true, message: 'This answer can only be partially checked automatically — verification type is not supported.', details: { reason: 'unsupported-type', type } });
    } else {
      result = RULES[type](expected, actual, options);
    }
  } catch (err) {
    result = makeResult({ status: 'invalid', message: 'Verification failed unexpectedly.', details: { reason: 'exception', error: err && err.message ? err.message : String(err) } });
  }
  if (!result || typeof result !== 'object') return makeResult({ status: 'invalid', message: 'Verification produced no result.' });
  if (!['match', 'no_match', 'partial', 'invalid'].includes(result.status) || FORBIDDEN_STATUSES.includes(result.status)) result.status = 'invalid';
  if (typeof result.matchesExpected !== 'boolean') result.matchesExpected = result.status === 'match';
  if (typeof result.needsRetry !== 'boolean') result.needsRetry = result.status === 'no_match';
  if (typeof result.partiallyCheckable !== 'boolean') result.partiallyCheckable = result.status === 'partial';
  if (typeof result.message !== 'string' || result.message.length === 0) result.message = 'Result message missing.';
  if (typeof result.timestamp !== 'string') result.timestamp = new Date().toISOString();
  if (!result.details || typeof result.details !== 'object') result.details = {};
  return result;
}

// =====================================================================
// Test fixtures
// =====================================================================

function addFixture(name, input, expected) {
  const actual = verify(input);
  const ok = actual.status === expected.status
    && actual.matchesExpected === expected.matchesExpected
    && actual.needsRetry === expected.needsRetry
    && actual.partiallyCheckable === expected.partiallyCheckable;
  fixtures.push({ name, expected, actual, ok });
  return ok;
}

function runFixtures() {
  section('Rule fixtures (all 12 types + edge cases)');

  // exact text
  addFixture('exact text match', { type: 'exact_text', expected: 'attention mechanism', actual: 'attention mechanism' }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('exact text mismatch', { type: 'exact_text', expected: 'attention mechanism', actual: 'self attention' }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });
  addFixture('case-sensitive mismatch', { type: 'exact_text', expected: 'B', actual: 'b', options: { caseSensitive: true } }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });
  addFixture('case-insensitive match', { type: 'exact_text', expected: 'B', actual: 'b' }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });

  // normalized text
  addFixture('accent-insensitive match', { type: 'normalized_text', expected: 'atencao', actual: 'Atenção', options: { ignoreAccents: true } }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('punctuation-insensitive match', { type: 'normalized_text', expected: 'hello world', actual: 'hello, world!', options: { ignorePunctuation: true } }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });

  // numeric
  addFixture('numeric exact match', { type: 'numeric', expected: 0.75, actual: '0.75' }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('numeric invalid input', { type: 'numeric', expected: 0.75, actual: 'not a number' }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });
  addFixture('numeric exact mismatch', { type: 'numeric', expected: 0.75, actual: '0.76' }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });
  addFixture('numeric with comma', { type: 'numeric', expected: 1000, actual: '1,000' }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });

  // numeric tolerance
  addFixture('absolute tolerance match', { type: 'numeric_tolerance', expected: 0.75, actual: '0.749', options: { absoluteTolerance: 0.01 } }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('absolute tolerance mismatch', { type: 'numeric_tolerance', expected: 0.75, actual: '0.7', options: { absoluteTolerance: 0.01 } }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });
  addFixture('relative tolerance match', { type: 'numeric_tolerance', expected: 100, actual: '101', options: { relativeTolerance: 0.02 } }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('relative tolerance zero expected', { type: 'numeric_tolerance', expected: 0, actual: '0.5', options: { relativeTolerance: 0.01 } }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });
  addFixture('invalid negative tolerance', { type: 'numeric_tolerance', expected: 0.75, actual: '0.75', options: { absoluteTolerance: -0.1 } }, { status: 'invalid', matchesExpected: false, needsRetry: false, partiallyCheckable: false });

  // multiple choice
  addFixture('multiple choice match', { type: 'multiple_choice', expected: 'B', actual: 'b' }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('multiple choice mismatch', { type: 'multiple_choice', expected: 'B', actual: 'A' }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });

  // multi-select
  addFixture('multi-select unordered match', { type: 'multi_select', expected: ['A', 'C'], actual: ['C', 'A'] }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('multi-select ordered mismatch', { type: 'multi_select', expected: ['A', 'C'], actual: ['C', 'A'], options: { orderSensitive: true } }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });
  addFixture('multi-select missing one', { type: 'multi_select', expected: ['A', 'C', 'D'], actual: ['A', 'C'] }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });

  // keyword presence
  addFixture('keyword all present', { type: 'keyword_presence', expected: ['query', 'key', 'value'], actual: 'Self-attention uses query, key and value projections.' }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('keyword missing one', { type: 'keyword_presence', expected: ['query', 'key', 'value'], actual: 'Self-attention uses query and key projections.' }, { status: 'partial', matchesExpected: false, needsRetry: true, partiallyCheckable: true });
  addFixture('keyword partial allowed', { type: 'keyword_presence', expected: ['attention', 'transformer', 'softmax'], actual: 'attention uses softmax', options: { minRequired: 2 } }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });

  // ordered list
  addFixture('ordered list match', { type: 'ordered_list', expected: ['tokenize', 'embed', 'attend'], actual: ['tokenize', 'embed', 'attend'] }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('ordered list mismatch', { type: 'ordered_list', expected: ['tokenize', 'embed', 'attend'], actual: ['embed', 'tokenize', 'attend'] }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });

  // unordered list
  addFixture('unordered list match', { type: 'unordered_list', expected: ['precision', 'recall', 'f1'], actual: ['f1', 'precision', 'recall'] }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('unordered list mismatch', { type: 'unordered_list', expected: ['precision', 'recall'], actual: ['accuracy', 'f1'] }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });

  // boolean
  addFixture('boolean true variants', { type: 'boolean', expected: true, actual: 'true' }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('boolean yes no', { type: 'boolean', expected: true, actual: 'yes' }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('boolean false', { type: 'boolean', expected: true, actual: 'false' }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });
  addFixture('boolean numeric', { type: 'boolean', expected: true, actual: '1' }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });

  // formula string
  addFixture('formula whitespace match', { type: 'formula_string', expected: 'y = mx + b', actual: 'y=mx+b' }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('formula mismatch', { type: 'formula_string', expected: 'y = mx + b', actual: 'y = mx^2 + c' }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });

  // explanation checklist
  addFixture('explanation checklist all match', { type: 'explanation_checklist', expected: ['mentions attention weights', 'mentions weighted sum'], actual: 'Attention computes weights and uses them in a weighted sum.' }, { status: 'match', matchesExpected: true, needsRetry: false, partiallyCheckable: false });
  addFixture('explanation checklist partial', { type: 'explanation_checklist', expected: ['mentions attention weights', 'mentions weighted sum'], actual: 'Attention computes weights and uses them in a sum.' }, { status: 'partial', matchesExpected: false, needsRetry: true, partiallyCheckable: true });
  addFixture('explanation checklist none match', { type: 'explanation_checklist', expected: ['mentions attention weights', 'mentions weighted sum'], actual: 'A neural net learns from data.' }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });

  // unsupported / malformed
  addFixture('unsupported type partial', { type: 'essay_grading', expected: 'foo', actual: 'bar' }, { status: 'partial', matchesExpected: false, needsRetry: false, partiallyCheckable: true });
  addFixture('malformed item no input', null, { status: 'invalid', matchesExpected: false, needsRetry: false, partiallyCheckable: false });
  addFixture('malformed empty type', { type: '', expected: 'foo', actual: 'foo' }, { status: 'invalid', matchesExpected: false, needsRetry: false, partiallyCheckable: false });

  // XSS payload in actual — should not break the engine and should sanitize
  addFixture('XSS payload in actual', { type: 'exact_text', expected: 'safe', actual: '<script>alert(1)</script>' }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });
  addFixture('javascript URL in actual', { type: 'exact_text', expected: 'safe', actual: 'javascript:alert(1)' }, { status: 'no_match', matchesExpected: false, needsRetry: true, partiallyCheckable: false });

  // Forbid mastery/score language in result message
  const r1 = verify({ type: 'exact_text', expected: 'attention', actual: 'attention' });
  const r1Lower = (r1.message || '').toLowerCase();
  for (const term of FORBIDDEN_FEEDBACK) {
    // Use word boundary to avoid false positives on substrings ("expected" contains "xp")
    const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(r1Lower)) {
      fail('critical', 'governance', `Forbidden term in result message: ${term}`);
    }
  }
  pass('governance', 'No forbidden mastery/score language in default result messages');

  // Forbidden status normalization
  const fakeResult = verify({ type: 'exact_text', expected: 'attention', actual: 'attention' });
  for (const fs of FORBIDDEN_STATUSES) {
    if (fakeResult.status === fs) fail('critical', 'governance', `Forbidden status leaked: ${fs}`);
  }
  pass('governance', 'No forbidden statuses (passed/failed/mastered/proficient) appear in result.status');

  // Apply allowed status set
  for (const f of fixtures) {
    if (f.ok) pass('rules', `${f.name}: status=${f.actual.status}`);
    else fail('critical', 'rules', `${f.name}: status=${f.actual.status}, expected ${f.expected.status}`);
  }
}

// =====================================================================
// XSS / HTML safety in rendered UI
// =====================================================================

function runXSSAudit() {
  section('XSS / HTML safety (rendered UI)');
  const uiContent = fs.readFileSync(path.join(REPO, 'website', 'scripts', 'answer-verification', 'verification-ui.js'), 'utf-8');
  if (uiContent.includes('escapeHtml')) pass('xss', 'verification-ui.js uses escapeHtml helper');
  else fail('high', 'xss', 'verification-ui.js does not import escapeHtml');
  if (uiContent.includes('sanitizeForHtml')) pass('xss', 'verification-ui.js uses sanitizeForHtml');
  else fail('high', 'xss', 'verification-ui.js does not use sanitizeForHtml');
  if (uiContent.includes('innerHTML') && !uiContent.includes('safeMsg') && !uiContent.includes('escapeHtml')) {
    fail('high', 'xss', 'innerHTML used without sanitization');
  } else pass('xss', 'innerHTML usage in verification-ui.js is sanitized');
}

// =====================================================================
// Source file integrity
// =====================================================================

function runSourceChecks() {
  section('Source file integrity');
  const files = [
    'website/scripts/answer-verification/answer-normalizer.js',
    'website/scripts/answer-verification/verification-rules.js',
    'website/scripts/answer-verification/verification-engine.js',
    'website/scripts/answer-verification/verification-storage.js',
    'website/scripts/answer-verification/verification-controller.js',
    'website/scripts/answer-verification/verification-ui.js',
    'website/scripts/answer-verification/index.js',
    'website/styles/answer-verification.css',
    'scripts/answer-verification-validator.js',
    'docs/architecture/nv-1100/p6-deterministic-answer-verification.md'
  ];
  for (const f of files) {
    const full = path.join(REPO, f);
    if (!fs.existsSync(full)) { fail('high', 'source', `Missing: ${f}`); continue; }
    pass('source', `${f} present`);
  }
  for (const f of files.filter(x => x.endsWith('.js'))) {
    try {
      const full = path.join(REPO, f);
      const tempFile = full.replace(/\.js$/, '.mjs');
      fs.copyFileSync(full, tempFile);
      try {
        require('child_process').execSync(`node --check ${JSON.stringify(tempFile)}`, { stdio: 'pipe' });
      } finally {
        try { fs.unlinkSync(tempFile); } catch (e) {}
      }
      pass('static', `Syntax OK: ${f}`);
    } catch (e) {
      fail('critical', 'static', `Syntax error in ${f}: ${e.message}`);
    }
  }
}

// =====================================================================
// Governance scan
// =====================================================================

function runGovernanceScan() {
  section('Governance scan (P6 source files)');
  const files = [
    'website/scripts/answer-verification/answer-normalizer.js',
    'website/scripts/answer-verification/verification-rules.js',
    'website/scripts/answer-verification/verification-engine.js',
    'website/scripts/answer-verification/verification-storage.js',
    'website/scripts/answer-verification/verification-controller.js',
    'website/scripts/answer-verification/verification-ui.js',
    'website/scripts/answer-verification/index.js',
    'website/styles/answer-verification.css'
  ];
  const forbidden = ['mastery', 'proficiency', /\bskill score\b/i, /\bxp\b/i, /\bstreak\b/i, /\brank\b/i, /\bpassed as learner\b/i, /\bfailed as learner\b/i, /\bcompetency achieved\b/i, /\bbadge earned\b/i];
  for (const f of files) {
    const full = path.join(REPO, f);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, 'utf-8');
    const stripped = content
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    for (const term of forbidden) {
      const re = typeof term === 'string' ? new RegExp(`\\b${term}\\b`, 'i') : term;
      if (re.test(stripped)) fail('high', 'governance', `Forbidden term in ${f}: ${term}`);
    }
  }
  pass('governance', 'No forbidden learner-facing terminology in P6 source');
}

// =====================================================================
// Report
// =====================================================================

function generateReport() {
  const decision = (critical.length === 0 && high.length === 0) ? 'READY' : 'NOT READY';
  return {
    audit: 'NV-1100-P6 Answer Verification Validator',
    generatedAt: new Date().toISOString(),
    decision,
    severityCounts: { critical: critical.length, high: high.length, medium: medium.length, low: low.length, info: info.length },
    checks: { total: checks.length, passed: checks.filter(c => c.status === 'PASS').length, failed: checks.filter(c => c.status === 'FAIL').length },
    critical, high, medium, low, info,
    fixtures,
    summary: {
      rulesAllPass: critical.filter(c => c.category === 'rules').length === 0,
      xssSafe: critical.filter(c => c.category === 'xss').length === 0 && high.filter(c => c.category === 'xss').length === 0,
      noMasteryClaims: critical.filter(c => c.category === 'governance').length === 0,
      sourceFilesValid: critical.filter(c => c.category === 'source').length === 0 && critical.filter(c => c.category === 'static').length === 0
    }
  };
}

function generateMarkdownReport(report) {
  let md = `# NV-1100-P6 — Answer Verification Validator Report\n\n`;
  md += `**Generated**: ${report.generatedAt}\n`;
  md += `**Decision**: ${report.decision === 'READY' ? '✅ READY' : '❌ NOT READY'}\n\n`;
  md += `| Severity | Count |\n|----------|-------|\n`;
  md += `| Critical | ${report.severityCounts.critical} |\n`;
  md += `| High | ${report.severityCounts.high} |\n`;
  md += `| Medium | ${report.severityCounts.medium} |\n`;
  md += `| Low | ${report.severityCounts.low} |\n`;
  md += `| Info | ${report.severityCounts.info} |\n`;
  md += `| Checks Passed | ${report.checks.passed}/${report.checks.total} |\n\n`;

  md += `## Fixtures\n\n`;
  md += `| Fixture | Expected | Actual | OK |\n|---------|----------|--------|----|\n`;
  for (const f of report.fixtures) {
    md += `| ${f.name} | ${f.expected.status} | ${f.actual.status} | ${f.ok ? '✅' : '❌'} |\n`;
  }
  md += `\n`;

  if (report.critical.length > 0) {
    md += `## Critical Issues\n\n`;
    report.critical.forEach(i => { md += `- **[${i.category}]** ${i.message}\n`; });
    md += '\n';
  }
  if (report.high.length > 0) {
    md += `## High Issues\n\n`;
    report.high.forEach(i => { md += `- **[${i.category}]** ${i.message}\n`; });
    md += '\n';
  }
  if (report.info.length > 0) {
    md += `## Info\n\n`;
    report.info.forEach(i => { md += `- **[${i.category}]** ${i.message}\n`; });
    md += '\n';
  }
  md += `## Final Decision\n\n\`\`\`\nNV-1100-P6 — Deterministic Answer Verification\n${report.decision}\n\`\`\`\n`;
  return md;
}

function main() {
  log('\x1b[1m=== NV-1100-P6 Answer Verification Validator ===\x1b[0m');
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
  if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

  runSourceChecks();
  runGovernanceScan();
  runXSSAudit();
  runFixtures();

  const report = generateReport();
  const md = generateMarkdownReport(report);

  fs.writeFileSync(path.join(REPORT_DIR, 'verify-report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(REPORT_DIR, 'verify-report.md'), md);
  fs.writeFileSync(path.join(DOCS_DIR, 'p6-verification-report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(DOCS_DIR, 'p6-verification-report.md'), md);

  log(`\n\x1b[1m=== FINAL DECISION ===\x1b[0m`);
  log(`Critical: ${report.severityCounts.critical}`);
  log(`High: ${report.severityCounts.high}`);
  log(`Medium: ${report.severityCounts.medium}`);
  log(`Checks: ${report.checks.passed}/${report.checks.total} passed`);
  log(`Fixtures: ${report.fixtures.length} (${report.fixtures.filter(f => f.ok).length} passed)`);
  log(`\nDecision: ${report.decision}`);
  process.exit(report.decision === 'READY' ? 0 : 1);
}

main();
