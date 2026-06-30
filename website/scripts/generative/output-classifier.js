/**
 * NV-1100-P11 — Output Classifier
 * Classifies generated output into categories for display and audit.
 */
(function () {
  'use strict';

  var CLASSES = {
    generated_explanation: { id: 'generated_explanation', label: 'Generated Explanation', icon: '📖' },
    generated_summary: { id: 'generated_summary', label: 'Generated Summary', icon: '📝' },
    generated_note_draft: { id: 'generated_note_draft', label: 'Generated Note Draft', icon: '📋' },
    generated_question_draft: { id: 'generated_question_draft', label: 'Generated Question Draft', icon: '❓' },
    generated_analogy: { id: 'generated_analogy', label: 'Generated Analogy', icon: '🔗' },
    generated_socratic_prompt: { id: 'generated_socratic_prompt', label: 'Generated Socratic Prompt', icon: '💭' },
    generated_lab_suggestion: { id: 'generated_lab_suggestion', label: 'Generated Lab Suggestion', icon: '🔬' },
    unsupported: { id: 'unsupported', label: 'Unsupported Output', icon: '⚠️' }
  };

  var MODE_TO_CLASS = {
    explain: 'generated_explanation',
    simplify: 'generated_explanation',
    deepen: 'generated_explanation',
    analogy: 'generated_analogy',
    socratic: 'generated_socratic_prompt',
    summarize: 'generated_summary',
    note: 'generated_note_draft',
    lab: 'generated_lab_suggestion',
    code: 'generated_explanation',
    viz: 'generated_explanation',
    question: 'generated_question_draft'
  };

  function classify(mode, output) {
    var classId = MODE_TO_CLASS[mode] || 'unsupported';
    var cls = CLASSES[classId] || CLASSES.unsupported;
    return {
      id: cls.id,
      label: cls.label,
      icon: cls.icon,
      mode: mode,
      disclaimer: 'Generated locally by optional model. Review before relying on this content.'
    };
  }

  function getClass(id) { return CLASSES[id] || null; }
  function getAllClasses() { return Object.keys(CLASSES).map(function (k) { return CLASSES[k]; }); }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.OutputClassifier = {
    classify: classify,
    getClass: getClass,
    getAllClasses: getAllClasses,
    CLASSES: CLASSES,
    MODE_TO_CLASS: MODE_TO_CLASS
  };
})();
