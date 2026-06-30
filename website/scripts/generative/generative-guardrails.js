/**
 * NV-1100-P11 — Generation Guardrails
 * Blocks or warns on output containing forbidden patterns.
 * Prevents learner inference, canonical mutation claims, and inappropriate content.
 */
(function () {
  'use strict';

  var BLOCKED_PATTERNS = [
    { pattern: /you mastered/i, reason: 'Learner mastery inference' },
    { pattern: /you are proficient/i, reason: 'Learner proficiency inference' },
    { pattern: /your competence is/i, reason: 'Learner competence inference' },
    { pattern: /your score is/i, reason: 'Score disclosure' },
    { pattern: /you failed as a learner/i, reason: 'Negative learner labeling' },
    { pattern: /you passed this concept/i, reason: 'Pass/fail assertion' },
    { pattern: /\bcertified\b/i, reason: 'Certification claim' },
    { pattern: /\bXP\b/, reason: 'Gamification reference' },
    { pattern: /\bstreak\b/i, reason: 'Gamification reference' },
    { pattern: /\brank\b/i, reason: 'Ranking reference' },
    { pattern: /curriculum updated/i, reason: 'Canonical mutation claim' },
    { pattern: /data modified/i, reason: 'Canonical mutation claim' },
    { pattern: /record saved/i, reason: 'System mutation claim' },
    { pattern: /mastery level/i, reason: 'Mastery inference' },
    { pattern: /learning progress score/i, reason: 'Progress scoring' },
    { pattern: /competency assessment/i, reason: 'Competency assessment' },
    { pattern: /skill level \d/i, reason: 'Skill level quantification' },
    { pattern: /you should review/i, reason: 'Recommendation inference' },
    { pattern: /you need to study/i, reason: 'Study need inference' },
    { pattern: /your understanding is (weak|strong|poor|excellent)/i, reason: 'Understanding assessment' }
  ];

  var WARN_PATTERNS = [
    { pattern: /according to (my|the) (training|knowledge base)/i, reason: 'External source claim' },
    { pattern: /in my (opinion|experience)/i, reason: 'Subjective opinion' },
    { pattern: /i (believe|think|feel) that/i, reason: 'Subjective opinion' },
    { pattern: /medical advice/i, reason: 'Medical advice' },
    { pattern: /legal advice/i, reason: 'Legal advice' },
    { pattern: /financial advice/i, reason: 'Financial advice' }
  ];

  function checkGuardrails(output) {
    if (typeof output !== 'string') return { blocked: false, warnings: [], clean: output || '' };

    var blocked = [];
    var warnings = [];

    BLOCKED_PATTERNS.forEach(function (item) {
      if (item.pattern.test(output)) {
        blocked.push({ pattern: item.pattern.source, reason: item.reason });
      }
    });

    WARN_PATTERNS.forEach(function (item) {
      if (item.pattern.test(output)) {
        warnings.push({ pattern: item.pattern.source, reason: item.reason });
      }
    });

    return {
      blocked: blocked.length > 0,
      blocks: blocked,
      warnings: warnings,
      clean: output
    };
  }

  function addBlockedPattern(pattern, reason) {
    BLOCKED_PATTERNS.push({ pattern: pattern, reason: reason });
  }

  function addWarnPattern(pattern, reason) {
    WARN_PATTERNS.push({ pattern: pattern, reason: reason });
  }

  function getBlockedPatterns() { return BLOCKED_PATTERNS.slice(); }
  function getWarnPatterns() { return WARN_PATTERNS.slice(); }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.GenerativeGuardrails = {
    checkGuardrails: checkGuardrails,
    addBlockedPattern: addBlockedPattern,
    addWarnPattern: addWarnPattern,
    getBlockedPatterns: getBlockedPatterns,
    getWarnPatterns: getWarnPatterns,
    BLOCKED_PATTERNS: BLOCKED_PATTERNS,
    WARN_PATTERNS: WARN_PATTERNS
  };
})();
