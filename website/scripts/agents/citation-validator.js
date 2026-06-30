/**
 * NV-1300-D2 — Citation Validator
 *
 * Verifies duplicate references, malformed citations,
 * missing evidence, unsupported claims, orphan references.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 */

function _safeArray(v) { return Array.isArray(v) ? v : []; }

function createCitationValidator() {
  var _lastValidation = null;

  function validate(claims, references) {
    var claimArr = _safeArray(claims);
    var refArr = _safeArray(references);
    var errors = [];
    var warnings = [];

    var refIds = {};
    for (var i = 0; i < refArr.length; i++) {
      if (refArr[i] && refArr[i].id) {
        if (refIds[refArr[i].id]) errors.push('Duplicate reference id: ' + refArr[i].id);
        refIds[refArr[i].id] = true;
      } else {
        warnings.push('Reference at index ' + i + ' missing id');
      }
    }

    var usedRefs = {};
    for (var c = 0; c < claimArr.length; c++) {
      var claim = claimArr[c];
      if (!claim) continue;
      if (!claim.claim) {
        errors.push('Claim at index ' + c + ' has no text');
        continue;
      }
      var refs = _safeArray(claim.supportingReferences);
      if (refs.length === 0) {
        warnings.push('Claim "' + claim.claim.substring(0, 50) + '..." has no supporting references');
      }
      for (var r = 0; r < refs.length; r++) {
        if (!refIds[refs[r]]) {
          errors.push('Claim references unknown source: ' + refs[r]);
        }
        usedRefs[refs[r]] = true;
      }
    }

    for (var rid in refIds) {
      if (!usedRefs[rid]) warnings.push('Orphan reference (not cited by any claim): ' + rid);
    }

    _lastValidation = {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      claimCount: claimArr.length,
      referenceCount: refArr.length
    };
    return _lastValidation;
  }

  function getLastValidation() { return _lastValidation; }
  function reset() { _lastValidation = null; }

  return {
    validate: validate,
    getLastValidation: getLastValidation,
    reset: reset
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createCitationValidator = createCitationValidator;
}

export { createCitationValidator };
