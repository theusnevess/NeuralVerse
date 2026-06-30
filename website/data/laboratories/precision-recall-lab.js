(function () {
  'use strict';

  window.NeuralVerse = window.NeuralVerse || {};

  function seededRandom(seed) {
    var state = seed % 2147483647;
    if (state <= 0) state += 2147483646;
    return function () {
      state = (state * 16807) % 2147483647;
      return (state - 1) / 2147483646;
    };
  }

  function generateClassificationData(numPositive, numNegative) {
    var rng = seededRandom(123);
    var samples = [];
    var i;

    for (i = 0; i < numPositive; i++) {
      var posScore = 0.4 + rng() * 0.6;
      samples.push({ score: posScore, actual: 1 });
    }

    for (i = 0; i < numNegative; i++) {
      var negScore = rng() * 0.6;
      samples.push({ score: negScore, actual: 0 });
    }

    samples.sort(function (a, b) { return b.score - a.score; });
    return samples;
  }

  function computeConfusionMatrix(samples, threshold) {
    var tp = 0, fp = 0, fn = 0, tn = 0;
    for (var i = 0; i < samples.length; i++) {
      var predicted = samples[i].score >= threshold ? 1 : 0;
      var actual = samples[i].actual;
      if (predicted === 1 && actual === 1) tp++;
      else if (predicted === 1 && actual === 0) fp++;
      else if (predicted === 0 && actual === 1) fn++;
      else tn++;
    }
    return { tp: tp, fp: fp, fn: fn, tn: tn };
  }

  function computePRCurve(samples) {
    var totalPositives = 0;
    var totalNegatives = 0;
    for (var i = 0; i < samples.length; i++) {
      if (samples[i].actual === 1) totalPositives++;
      else totalNegatives++;
    }

    var curve = [];
    var tp = 0, fp = 0;

    for (var i = 0; i < samples.length; i++) {
      if (samples[i].actual === 1) tp++;
      else fp++;

      var recall = totalPositives > 0 ? tp / totalPositives : 0;
      var precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;

      curve.push([
        Math.round(recall * 10000) / 10000,
        Math.round(precision * 10000) / 10000
      ]);
    }

    curve.unshift([0, 1]);
    return curve;
  }

  var labDefinition = {
    id: 'lab-precision-recall',
    slug: 'precision-recall',
    title: 'Precision vs Recall',
    summary: 'Understand the trade-off between precision and recall by adjusting the classification threshold.',
    category: 'evaluation',
    artifactReferences: [],
    conceptReferences: ['cross-validation', 'feature-engineering'],
    parameterSchema: [
      {
        name: 'threshold',
        type: 'slider',
        min: 0.0,
        max: 1.0,
        step: 0.05,
        default: 0.5,
        label: 'Classification Threshold'
      },
      {
        name: 'numPositive',
        type: 'integer',
        min: 10,
        max: 100,
        step: 5,
        default: 50,
        label: 'Number of Positive Samples'
      },
      {
        name: 'numNegative',
        type: 'integer',
        min: 10,
        max: 100,
        step: 5,
        default: 50,
        label: 'Number of Negative Samples'
      }
    ],
    initialState: {
      threshold: 0.5,
      numPositive: 50,
      numNegative: 50
    },
    execute: function (params) {
      var threshold = params.threshold !== undefined ? params.threshold : 0.5;
      var numPositive = params.numPositive !== undefined ? params.numPositive : 50;
      var numNegative = params.numNegative !== undefined ? params.numNegative : 50;

      threshold = Math.max(0, Math.min(1, threshold));
      numPositive = Math.round(Math.max(10, Math.min(100, numPositive)));
      numNegative = Math.round(Math.max(10, Math.min(100, numNegative)));

      var samples = generateClassificationData(numPositive, numNegative);
      var cm = computeConfusionMatrix(samples, threshold);

      var precision = (cm.tp + cm.fp) > 0 ? cm.tp / (cm.tp + cm.fp) : 0;
      var recall = (cm.tp + cm.fn) > 0 ? cm.tp / (cm.tp + cm.fn) : 0;
      var f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

      var prCurve = computePRCurve(samples);

      return {
        confusionMatrix: [
          [cm.tp, cm.fp],
          [cm.fn, cm.tn]
        ],
        precision: Math.round(precision * 10000) / 10000,
        recall: Math.round(recall * 10000) / 10000,
        f1Score: Math.round(f1 * 10000) / 10000,
        threshold: threshold,
        prCurve: prCurve
      };
    },
    visualization: {
      type: 'line-chart',
      title: 'Precision-Recall Curve'
    },
    canonicalStatus: 'reviewed',
    version: '1.0.0',
    reviewedBy: 'NeuralVerse Team',
    lastReviewed: '2026-06-25',
    estimatedDuration: '12 minutes'
  };

  if (window.NeuralVerse.LabRegistry && window.NeuralVerse.LabRegistry.register) {
    window.NeuralVerse.LabRegistry.register(labDefinition);
  }
})();
