(function () {
  'use strict';

  window.NeuralVerse = window.NeuralVerse || {};

  var labDefinition = {
    id: 'lab-bayes-rule',
    slug: 'bayes-rule',
    title: "Bayes' Rule",
    summary: "Explore Bayes' theorem by adjusting prior probability, likelihood, and evidence to see how the posterior changes.",
    category: 'probability',
    artifactReferences: [],
    conceptReferences: ['feature-engineering', 'cross-validation'],
    parameterSchema: [
      {
        name: 'priorProbability',
        type: 'slider',
        min: 0.01,
        max: 0.99,
        step: 0.01,
        default: 0.01,
        label: 'Prior Probability P(H)'
      },
      {
        name: 'sensitivity',
        type: 'slider',
        min: 0.01,
        max: 0.99,
        step: 0.01,
        default: 0.90,
        label: 'Sensitivity P(+|H)'
      },
      {
        name: 'falsePositiveRate',
        type: 'slider',
        min: 0.01,
        max: 0.50,
        step: 0.01,
        default: 0.05,
        label: 'False Positive Rate P(+|~H)'
      }
    ],
    initialState: {
      priorProbability: 0.01,
      sensitivity: 0.90,
      falsePositiveRate: 0.05
    },
    execute: function (params) {
      var prior = params.priorProbability !== undefined ? params.priorProbability : 0.01;
      var sensitivity = params.sensitivity !== undefined ? params.sensitivity : 0.90;
      var fpr = params.falsePositiveRate !== undefined ? params.falsePositiveRate : 0.05;

      prior = Math.max(0.01, Math.min(0.99, prior));
      sensitivity = Math.max(0.01, Math.min(0.99, sensitivity));
      fpr = Math.max(0.01, Math.min(0.50, fpr));

      var truePositive = sensitivity;
      var falsePositive = fpr;
      var falseNegative = 1 - sensitivity;
      var trueNegative = 1 - fpr;

      var evidence = sensitivity * prior + fpr * (1 - prior);
      var posterior = evidence > 0 ? (sensitivity * prior) / evidence : 0;

      posterior = Math.round(posterior * 10000) / 10000;
      evidence = Math.round(evidence * 10000) / 10000;

      return {
        prior: prior,
        posterior: posterior,
        likelihood: sensitivity,
        evidence: evidence,
        posteriorProbability: posterior,
        steps: {
          prior: prior,
          sensitivity: sensitivity,
          falsePositiveRate: fpr,
          truePositive: Math.round(truePositive * 10000) / 10000,
          falsePositive: Math.round(falsePositive * 10000) / 10000,
          falseNegative: Math.round(falseNegative * 10000) / 10000,
          trueNegative: Math.round(trueNegative * 10000) / 10000
        }
      };
    },
    visualization: {
      type: 'bar-chart',
      title: "Bayes' Rule — Probability Update"
    },
    canonicalStatus: 'reviewed',
    version: '1.0.0',
    reviewedBy: 'NeuralVerse Team',
    lastReviewed: '2026-06-25',
    estimatedDuration: '10 minutes'
  };

  if (window.NeuralVerse.LabRegistry && window.NeuralVerse.LabRegistry.register) {
    window.NeuralVerse.LabRegistry.register(labDefinition);
  }
})();
