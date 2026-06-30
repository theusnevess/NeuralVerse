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

  function sigmoid(z) {
    if (z >= 0) {
      return 1 / (1 + Math.exp(-z));
    }
    var expZ = Math.exp(z);
    return expZ / (1 + expZ);
  }

  function generateClassificationData(weight, bias, numPoints) {
    var rng = seededRandom(123);
    var points = [];
    for (var i = 0; i < numPoints; i++) {
      var x = rng() * 10 - 5;
      var prob = sigmoid(weight * x + bias);
      var actualClass = rng() < prob ? 1 : 0;
      points.push([x, prob, actualClass]);
    }
    return points;
  }

  function computeConfusionMatrix(dataPoints, weight, bias, threshold) {
    var tp = 0, fp = 0, fn = 0, tn = 0;
    for (var i = 0; i < dataPoints.length; i++) {
      var x = dataPoints[i][0];
      var actualClass = dataPoints[i][2];
      var predictedProb = sigmoid(weight * x + bias);
      var predictedClass = predictedProb >= threshold ? 1 : 0;
      if (actualClass === 1 && predictedClass === 1) tp++;
      else if (actualClass === 0 && predictedClass === 1) fp++;
      else if (actualClass === 1 && predictedClass === 0) fn++;
      else tn++;
    }
    return [[tp, fp], [fn, tn]];
  }

  function computeAccuracy(confusionMatrix) {
    var tp = confusionMatrix[0][0];
    var fp = confusionMatrix[0][1];
    var fn = confusionMatrix[1][0];
    var tn = confusionMatrix[1][1];
    var total = tp + fp + fn + tn;
    return total > 0 ? (tp + tn) / total : 0;
  }

  function generateSigmoidCurve(weight, bias, numPoints) {
    var points = [];
    for (var i = 0; i < numPoints; i++) {
      var x = -6 + (i / (numPoints - 1)) * 12;
      var y = sigmoid(weight * x + bias);
      points.push([Math.round(x * 1000) / 1000, Math.round(y * 10000) / 10000]);
    }
    return points;
  }

  var labDefinition = {
    id: 'lab-logistic-regression',
    slug: 'logistic-regression',
    title: 'Logistic Regression',
    summary: 'Visualize logistic regression by adjusting the decision boundary and observing probability curves.',
    category: 'machine-learning',
    artifactReferences: [],
    conceptReferences: ['decision-boundaries'],
    parameterSchema: [
      {
        name: 'weight',
        type: 'slider',
        min: -5,
        max: 5,
        step: 0.1,
        default: 1.0,
        label: 'Weight'
      },
      {
        name: 'bias',
        type: 'slider',
        min: -5,
        max: 5,
        step: 0.1,
        default: 0.0,
        label: 'Bias'
      },
      {
        name: 'threshold',
        type: 'slider',
        min: 0.1,
        max: 0.9,
        step: 0.05,
        default: 0.5,
        label: 'Classification Threshold'
      }
    ],
    initialState: {
      weight: 1.0,
      bias: 0.0,
      threshold: 0.5
    },
    execute: function (params) {
      var weight = params.weight !== undefined ? params.weight : 1.0;
      var bias = params.bias !== undefined ? params.bias : 0.0;
      var threshold = params.threshold !== undefined ? params.threshold : 0.5;
      var numPoints = params.numPoints !== undefined ? params.numPoints : 50;

      var sigmoidCurve = generateSigmoidCurve(weight, bias, 100);
      var dataPoints = generateClassificationData(weight, bias, numPoints);
      var confusionMatrix = computeConfusionMatrix(dataPoints, weight, bias, threshold);
      var accuracy = computeAccuracy(confusionMatrix);

      return {
        sigmoidCurve: sigmoidCurve,
        dataPoints: dataPoints,
        accuracy: Math.round(accuracy * 10000) / 10000,
        confusionMatrix: confusionMatrix
      };
    },
    visualization: {
      type: 'line-chart',
      title: 'Logistic Regression — Sigmoid Curve'
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
