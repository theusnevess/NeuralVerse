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

  function generateData(slope, intercept, noise, numPoints) {
    var rng = seededRandom(42);
    var points = [];
    for (var i = 0; i < numPoints; i++) {
      var x = (i / (numPoints - 1)) * 10 - 5;
      var noiseVal = (rng() - 0.5) * 2 * noise;
      var y = slope * x + intercept + noiseVal;
      points.push([x, y]);
    }
    return points;
  }

  function leastSquaresFit(points) {
    var n = points.length;
    var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (var i = 0; i < n; i++) {
      sumX += points[i][0];
      sumY += points[i][1];
      sumXY += points[i][0] * points[i][1];
      sumX2 += points[i][0] * points[i][0];
      sumY2 += points[i][1] * points[i][1];
    }
    var meanX = sumX / n;
    var meanY = sumY / n;
    var ssXY = sumXY - n * meanX * meanY;
    var ssXX = sumX2 - n * meanX * meanX;
    var ssYY = sumY2 - n * meanY * meanY;
    var fittedSlope = ssXX !== 0 ? ssXY / ssXX : 0;
    var fittedIntercept = meanY - fittedSlope * meanX;
    var ssRes = 0;
    for (var i = 0; i < n; i++) {
      var predicted = fittedSlope * points[i][0] + fittedIntercept;
      ssRes += (points[i][1] - predicted) * (points[i][1] - predicted);
    }
    var ssTot = ssYY;
    var rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 1;
    return {
      slope: fittedSlope,
      intercept: fittedIntercept,
      rSquared: rSquared,
      meanX: meanX,
      meanY: meanY,
      residualSumOfSquares: ssRes
    };
  }

  var labDefinition = {
    id: 'lab-linear-regression',
    slug: 'linear-regression',
    title: 'Linear Regression',
    summary: 'Explore simple linear regression by adjusting slope, intercept, and data noise to see how the fitted line changes.',
    category: 'machine-learning',
    artifactReferences: [],
    conceptReferences: ['linear-models'],
    parameterSchema: [
      {
        name: 'slope',
        type: 'slider',
        min: -5,
        max: 5,
        step: 0.1,
        default: 2.0,
        label: 'Slope'
      },
      {
        name: 'intercept',
        type: 'slider',
        min: -10,
        max: 10,
        step: 0.5,
        default: 1.0,
        label: 'Intercept'
      },
      {
        name: 'noise',
        type: 'slider',
        min: 0,
        max: 2,
        step: 0.1,
        default: 0.5,
        label: 'Noise Level'
      },
      {
        name: 'numPoints',
        type: 'integer',
        min: 5,
        max: 50,
        step: 1,
        default: 20,
        label: 'Number of Points'
      }
    ],
    initialState: {
      slope: 2.0,
      intercept: 1.0,
      noise: 0.5,
      numPoints: 20
    },
    execute: function (params) {
      var slope = params.slope !== undefined ? params.slope : 2.0;
      var intercept = params.intercept !== undefined ? params.intercept : 1.0;
      var noise = params.noise !== undefined ? params.noise : 0.5;
      var numPoints = params.numPoints !== undefined ? params.numPoints : 20;

      numPoints = Math.round(numPoints);
      numPoints = Math.max(5, Math.min(50, numPoints));

      var dataPoints = generateData(slope, intercept, noise, numPoints);
      var fit = leastSquaresFit(dataPoints);

      return {
        dataPoints: dataPoints,
        fittedLine: {
          slope: Math.round(fit.slope * 10000) / 10000,
          intercept: Math.round(fit.intercept * 10000) / 10000,
          rSquared: Math.round(fit.rSquared * 10000) / 10000
        },
        statistics: {
          meanX: Math.round(fit.meanX * 10000) / 10000,
          meanY: Math.round(fit.meanY * 10000) / 10000,
          residualSumOfSquares: Math.round(fit.residualSumOfSquares * 10000) / 10000
        }
      };
    },
    visualization: {
      type: 'scatter-plot',
      title: 'Linear Regression Fit',
      line: true
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
