/**
 * NV-1100-P6 — Answer Normalizer
 *
 * Pure normalization helpers used by the verification engine. No I/O.
 *
 * Guarantees:
 *   - Never throws on user input (returns safe defaults).
 *   - Deterministic: same input always produces same output.
 *   - Locale-agnostic: works on any Unicode string.
 */

const HTML_ESCAPES = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
});

export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"'`=/]/g, (ch) => HTML_ESCAPES[ch] || ch);
}

export function escapeAttr(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"'`]/g, (ch) => HTML_ESCAPES[ch] || ch);
}

export function stripDangerous(value) {
  if (value === null || value === undefined) return '';
  let s = String(value);
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<[^>]+on\w+\s*=\s*["'][^"']*["']/gi, '');
  s = s.replace(/javascript:/gi, '');
  s = s.replace(/vbscript:/gi, '');
  s = s.replace(/data:text\/html/gi, '');
  return s;
}

export function sanitizeForHtml(value) {
  return escapeHtml(stripDangerous(value));
}

export function safeText(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

const PUNCT_RE = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~«»‹›…—–‐‘’“”„•·¡¿]/g;
const WS_RE = /\s+/g;
const TRIM_RE = /^[\s\u00A0\u2000-\u200B\u2028\u2029\u202F\u205F\u3000]+|[\s\u00A0\u2000-\u200B\u2028\u2029\u202F\u205F\u3000]+$/g;

export function trimText(s) {
  return safeText(s).replace(TRIM_RE, '');
}

export function collapseWhitespace(s) {
  return trimText(s).replace(WS_RE, ' ');
}

export function removePunctuation(s) {
  return safeText(s).replace(PUNCT_RE, '');
}

export function removeAccents(s) {
  return safeText(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeText(value, options) {
  const opts = options || {};
  let s = safeText(value);
  if (opts.trim !== false) s = trimText(s);
  if (opts.ignorePunctuation) s = removePunctuation(s);
  if (opts.ignoreAccents) s = removeAccents(s);
  if (opts.ignoreCase !== false) s = s.toLowerCase();
  if (opts.collapseWhitespace !== false) s = collapseWhitespace(s);
  return s;
}

export function parseNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  const s = safeText(value).trim();
  if (s === '') return null;
  const cleaned = s.replace(/,/g, '').replace(/\s/g, '');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function parseBoolean(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }
  const s = collapseWhitespace(safeText(value).toLowerCase());
  if (['true', 'yes', 'y', 'sim', 's', '1', 'verdadeiro', 't', '✓', '✔'].includes(s)) return true;
  if (['false', 'no', 'n', 'nao', 'não', '0', 'falso', 'f', '✗', '✘'].includes(s)) return false;
  return null;
}

export function normalizeList(value) {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.map(safeText).map(trimText).filter(s => s.length > 0);
  return safeText(value).split(/[,;\n|]+/).map(trimText).filter(s => s.length > 0);
}

export function normalizeAnswerChoice(value) {
  if (value === null || value === undefined) return '';
  let s = trimText(safeText(value));
  if (s.length === 0) return '';
  if (/^[A-Za-z]\d*$/i.test(s)) return s[0].toUpperCase();
  return s;
}

export function normalizeFormulaString(value) {
  let s = safeText(value);
  s = collapseWhitespace(s);
  s = removePunctuation(s);
  s = s.replace(/\s+/g, '');
  s = s.toLowerCase();
  return s;
}

export function tokenizeForKeywords(value) {
  // Strip sentence-final and word-attached punctuation so "value." / "query,"
  // both match the keyword "value" / "query".
  const stripped = removePunctuation(safeText(value).toLowerCase());
  const s = collapseWhitespace(stripped);
  if (!s) return [];
  return s.split(/\s+/).filter(t => t.length > 0);
}

export function isSafeStatus(status) {
  return ['match', 'no_match', 'partial', 'invalid'].includes(status);
}

export function makeResult(partial) {
  const base = {
    status: 'invalid',
    matchesExpected: false,
    needsRetry: false,
    partiallyCheckable: false,
    message: '',
    details: {},
    timestamp: new Date().toISOString()
  };
  return Object.assign(base, partial || {});
}

export const ANSWER_NORMALIZER = Object.freeze({
  escapeHtml,
  escapeAttr,
  stripDangerous,
  sanitizeForHtml,
  safeText,
  trimText,
  collapseWhitespace,
  removePunctuation,
  removeAccents,
  normalizeText,
  parseNumber,
  parseBoolean,
  normalizeList,
  normalizeAnswerChoice,
  normalizeFormulaString,
  tokenizeForKeywords,
  isSafeStatus,
  makeResult
});

export default ANSWER_NORMALIZER;
