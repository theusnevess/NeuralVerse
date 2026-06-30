/**
 * Governance Tokenizer
 *
 * Deterministic tokenizer that strips comments, string literals,
 * and template literals from JavaScript source code before scanning
 * for forbidden patterns. Operates only on executable code.
 *
 * Used by NV-1300-D1A/D1B validators to eliminate false positives.
 */

function tokenizeSource(source) {
  if (typeof source !== 'string') return '';
  var result = '';
  var i = 0;
  var len = source.length;

  while (i < len) {
    var ch = source[i];
    var next = i + 1 < len ? source[i + 1] : '';

    // Single-line comment
    if (ch === '/' && next === '/') {
      while (i < len && source[i] !== '\n') i++;
      continue;
    }

    // Block comment
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < len - 1 && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    // Single-quoted string
    if (ch === "'") {
      i++;
      while (i < len && source[i] !== "'") {
        if (source[i] === '\\') i++;
        i++;
      }
      i++;
      result += ' ';
      continue;
    }

    // Double-quoted string
    if (ch === '"') {
      i++;
      while (i < len && source[i] !== '"') {
        if (source[i] === '\\') i++;
        i++;
      }
      i++;
      result += ' ';
      continue;
    }

    // Template literal
    if (ch === '`') {
      i++;
      var depth = 1;
      while (i < len && depth > 0) {
        if (source[i] === '\\') { i += 2; continue; }
        if (source[i] === '$' && i + 1 < len && source[i + 1] === '{') {
          depth++;
          i += 2;
          var braceDepth = 1;
          while (i < len && braceDepth > 0) {
            if (source[i] === '{') braceDepth++;
            else if (source[i] === '}') braceDepth--;
            i++;
          }
          continue;
        }
        if (source[i] === '`') depth--;
        i++;
      }
      result += ' ';
      continue;
    }

    // Regular expression literal (simplified detection)
    if (ch === '/' && i > 0) {
      var prevChar = source[i - 1];
      if (prevChar === '=' || prevChar === '(' || prevChar === '[' ||
          prevChar === '!' || prevChar === '&' || prevChar === '|' ||
          prevChar === '?' || prevChar === ':' || prevChar === ',' ||
          prevChar === ';' || prevChar === '{' || prevChar === '}' ||
          prevChar === '\n' || prevChar === ' ') {
        i++;
        while (i < len && source[i] !== '/') {
          if (source[i] === '\\') i++;
          i++;
        }
        i++;
        while (i < len && /[gimsuy]/.test(source[i])) i++;
        continue;
      }
    }

    result += ch;
    i++;
  }

  return result;
}

function stripComments(source) {
  if (typeof source !== 'string') return '';
  var result = '';
  var i = 0;
  var len = source.length;

  while (i < len) {
    var ch = source[i];
    var next = i + 1 < len ? source[i + 1] : '';

    if (ch === '/' && next === '/') {
      while (i < len && source[i] !== '\n') i++;
      continue;
    }

    if (ch === '/' && next === '*') {
      i += 2;
      while (i < len - 1 && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

function hasForbiddenPattern(source, pattern) {
  var stripped = tokenizeSource(source);
  var regex = new RegExp(pattern.source, pattern.flags);
  var matches = stripped.match(regex);
  return matches ? matches.length : 0;
}

function hasForbiddenTerm(source, term) {
  var stripped = tokenizeSource(source);
  var lower = stripped.toLowerCase();
  var termLower = term.toLowerCase();
  var idx = lower.indexOf(termLower);
  if (idx === -1) return false;

  var before = idx > 0 ? lower[idx - 1] : ' ';
  var after = idx + termLower.length < lower.length ? lower[idx + termLower.length] : ' ';
  var wordBoundary = /[^a-z0-9_-]/.test(before) && /[^a-z0-9_-]/.test(after);

  return wordBoundary;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    tokenizeSource: tokenizeSource,
    stripComments: stripComments,
    hasForbiddenPattern: hasForbiddenPattern,
    hasForbiddenTerm: hasForbiddenTerm
  };
}

export { tokenizeSource, stripComments, hasForbiddenPattern, hasForbiddenTerm };
