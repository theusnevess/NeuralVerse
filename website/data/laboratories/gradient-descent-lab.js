(function () {
  'use strict';

  window.NeuralVerse = window.NeuralVerse || {};

  var functions = {
    quadratic: {
      f: function (x) { return x * x; },
      df: function (x) { return 2 * x; },
      label: 'f(x) = x²'
    },
    cubic: {
      f: function (x) { return x * x * x - 3 * x; },
      df: function (x) { return 3 * x * x - 3; },
      label: 'f(x) = x³ - 3x'
    },
    sine: {
      f: function (x) { return Math.sin(x) + 0.5 * x * x; },
      df: function (x) { return Math.cos(x) + x; },
      label: 'f(x) = sin(x) + 0.5x²'
    }
  };

  function runGradientDescent(learningRate, initialX, numIterations, functionType) {
    var fn = functions[functionType] || functions.quadratic;
    var x = initialX;
    var path = [];
    var lossHistory = [];
    var converged = false;

    for (var i = 0; i < numIterations; i++) {
      var loss = fn.f(x);
      var gradient = fn.df(x);
      path.push({
        x: Math.round(x * 10000) / 10000,
        y: Math.round(loss * 10000) / 10000,
        gradient: Math.round(gradient * 10000) / 10000
      });
      lossHistory.push(Math.round(loss * 10000) / 10000);

      var newX = x - learningRate * gradient;

      if (Math.abs(newX - x) < 1e-8) {
        converged = true;
        x = newX;
        break;
      }

      if (Math.abs(newX) > 1000) {
        converged = false;
        break;
      }

      x = newX;
    }

    var finalLoss = fn.f(x);

    return {
      path: path,
      lossHistory: lossHistory,
      finalX: Math.round(x * 10000) / 10000,
      finalLoss: Math.round(finalLoss * 10000) / 10000,
      converged: converged
    };
  }

  var labDefinition = {
    id: 'lab-gradient-descent',
    slug: 'gradient-descent',
    title: 'Gradient Descent',
    summary: 'Watch gradient descent optimize a loss function by adjusting learning rate, initial point, and number of iterations.',
    category: 'optimization',
    artifactReferences: [],
    conceptReferences: ['gradient-descent'],
    parameterSchema: [
      {
        name: 'learningRate',
        type: 'slider',
        min: 0.001,
        max: 2.0,
        step: 0.01,
        default: 0.1,
        label: 'Learning Rate'
      },
      {
        name: 'initialX',
        type: 'slider',
        min: -5,
        max: 5,
        step: 0.1,
        default: 3.0,
        label: 'Initial X'
      },
      {
        name: 'numIterations',
        type: 'integer',
        min: 1,
        max: 100,
        step: 1,
        default: 30,
        label: 'Number of Iterations'
      },
      {
        name: 'functionType',
        type: 'select',
        options: ['quadratic', 'cubic', 'sine'],
        default: 'quadratic',
        label: 'Loss Function'
      }
    ],
    initialState: {
      learningRate: 0.1,
      initialX: 3.0,
      numIterations: 30,
      functionType: 'quadratic'
    },
    execute: function (params) {
      var learningRate = params.learningRate !== undefined ? params.learningRate : 0.1;
      var initialX = params.initialX !== undefined ? params.initialX : 3.0;
      var numIterations = params.numIterations !== undefined ? params.numIterations : 30;
      var functionType = params.functionType !== undefined ? params.functionType : 'quadratic';

      numIterations = Math.round(numIterations);
      numIterations = Math.max(1, Math.min(100, numIterations));

      if (!functions[functionType]) {
        functionType = 'quadratic';
      }

      return runGradientDescent(learningRate, initialX, numIterations, functionType);
    },
    visualization: {
      type: 'line-chart',
      title: 'Loss Curve During Optimization'
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
