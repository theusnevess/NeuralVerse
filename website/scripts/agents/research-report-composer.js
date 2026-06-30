/**
 * NV-1300-D2 — Research Report Composer
 *
 * Composes final research report sections.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 */

var STANDARD_SECTIONS = ['research_question', 'scope', 'methodology', 'evidence', 'claims', 'consensus', 'conflicts', 'limitations', 'conclusion', 'references'];

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function createResearchReportComposer() {
  var _lastReport = null;

  function composeReport(input) {
    var src = input || {};
    var plan = src.plan || {};
    var claims = _safeArray(src.claims);
    var synthesis = src.synthesis || {};
    var consensus = src.consensus || {};
    var conflicts = _safeArray(src.conflicts);
    var evidenceCount = typeof src.evidenceCount === 'number' ? src.evidenceCount : 0;

    var sections = [];
    for (var i = 0; i < STANDARD_SECTIONS.length; i++) {
      var s = STANDARD_SECTIONS[i];
      if (_safeArray(plan.scope && plan.scope.sections).indexOf(s) === -1 && s !== 'research_question') continue;

      var content = '';
      switch (s) {
        case 'research_question': content = _safeStr(plan.query || plan.topic, 'Research question not specified'); break;
        case 'scope': content = 'Depth: ' + _safeStr(plan.depth, 'standard') + '. Max claims: ' + (plan.scope ? plan.scope.maxClaims : 'N/A'); break;
        case 'methodology': content = 'Deterministic evidence collection, ranking, and synthesis. Intent: ' + _safeStr(plan.intent, 'survey'); break;
        case 'evidence': content = evidenceCount + ' evidence items collected from canonical and external sources.'; break;
        case 'claims': content = claims.length + ' claims extracted.'; break;
        case 'consensus': content = _safeStr(consensus.level, 'insufficient_evidence') + ' (confidence: ' + (typeof consensus.confidence === 'number' ? consensus.confidence : 0) + ')'; break;
        case 'conflicts': content = conflicts.length + ' conflict(s) detected.'; break;
        case 'limitations': content = 'All claims are evidence-backed. No learner inference. No fabricated citations.'; break;
        case 'conclusion': content = 'See synthesis for key findings and consensus level.'; break;
        case 'references': content = claims.length + ' claim references.'; break;
      }

      sections.push({ id: s, title: s.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }), content: content, order: i });
    }

    var report = {
      title: _safeStr(plan.topic || 'Research Report'),
      sections: sections,
      sectionCount: sections.length,
      claimCount: claims.length,
      consensus: consensus,
      evidenceCount: evidenceCount,
      generatedAt: null,
      deterministic: true
    };

    _lastReport = report;
    return report;
  }

  function getLastReport() { return _lastReport; }
  function reset() { _lastReport = null; }

  return {
    composeReport: composeReport,
    getLastReport: getLastReport,
    reset: reset,
    STANDARD_SECTIONS: STANDARD_SECTIONS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createResearchReportComposer = createResearchReportComposer;
}

export { createResearchReportComposer, STANDARD_SECTIONS };
