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

  function stableSigmoid(z) {
    if (z >= 0) return 1 / (1 + Math.exp(-z));
    var expZ = Math.exp(z);
    return expZ / (1 + expZ);
  }

  function generateDataset(numPoints, separation, noise, seed) {
    var rng = seededRandom(seed || 42);
    var points = [];
    for (var i = 0; i < numPoints; i++) {
      var x1 = (rng() - 0.5) * 6;
      var x2 = (rng() - 0.5) * 6;
      var score = separation * (x1 + x2) + (rng() - 0.5) * noise;
      var label = score > 0 ? 1 : 0;
      points.push({ x1: x1, x2: x2, y: label });
    }
    return points;
  }

  function initWeights(numFeatures, seed) {
    var rng = seededRandom(seed || 777);
    var w = [];
    for (var i = 0; i < numFeatures; i++) {
      w.push((rng() - 0.5) * 0.1);
    }
    return { w: w, b: 0 };
  }

  function forward(model, points) {
    var preds = [];
    for (var i = 0; i < points.length; i++) {
      var z = model.b;
      for (var j = 0; j < model.w.length; j++) {
        z += model.w[j] * points[i]['x' + (j + 1)];
      }
      preds.push(stableSigmoid(z));
    }
    return preds;
  }

  function computeLoss(preds, labels) {
    var eps = 1e-7;
    var loss = 0;
    for (var i = 0; i < preds.length; i++) {
      var p = Math.max(eps, Math.min(1 - eps, preds[i]));
      loss -= labels[i] * Math.log(p) + (1 - labels[i]) * Math.log(1 - p);
    }
    return loss / preds.length;
  }

  function computeGradients(model, points, preds, labels) {
    var n = points.length;
    var dw = [];
    for (var j = 0; j < model.w.length; j++) dw.push(0);
    var db = 0;

    for (var i = 0; i < n; i++) {
      var err = preds[i] - labels[i];
      for (var j = 0; j < model.w.length; j++) {
        dw[j] += err * points[i]['x' + (j + 1)];
      }
      db += err;
    }

    for (var j = 0; j < dw.length; j++) dw[j] /= n;
    db /= n;

    return { dw: dw, b: db };
  }

  function updateWeights(model, grads, lr) {
    for (var j = 0; j < model.w.length; j++) {
      model.w[j] -= lr * grads.dw[j];
    }
    model.b -= lr * grads.b;
  }

  function gradientNorm(grads) {
    var norm = grads.b * grads.b;
    for (var j = 0; j < grads.dw.length; j++) {
      norm += grads.dw[j] * grads.dw[j];
    }
    return Math.sqrt(norm);
  }

  function classify(model, points, threshold) {
    var preds = forward(model, points);
    var labels = [];
    for (var i = 0; i < preds.length; i++) {
      labels.push(preds[i] >= threshold ? 1 : 0);
    }
    return labels;
  }

  function confusionMatrix(predLabels, actualLabels) {
    var tp = 0, fp = 0, fn = 0, tn = 0;
    for (var i = 0; i < predLabels.length; i++) {
      if (actualLabels[i] === 1 && predLabels[i] === 1) tp++;
      else if (actualLabels[i] === 0 && predLabels[i] === 1) fp++;
      else if (actualLabels[i] === 1 && predLabels[i] === 0) fn++;
      else tn++;
    }
    return { tp: tp, fp: fp, fn: fn, tn: tn };
  }

  function precisionRecall(cm) {
    var p = cm.tp + cm.fp > 0 ? cm.tp / (cm.tp + cm.fp) : 0;
    var r = cm.tp + cm.fn > 0 ? cm.tp / (cm.tp + cm.fn) : 0;
    var f1 = p + r > 0 ? 2 * p * r / (p + r) : 0;
    return { precision: p, recall: r, f1: f1 };
  }

  function accuracy(cm) {
    var total = cm.tp + cm.fp + cm.fn + cm.tn;
    return total > 0 ? (cm.tp + cm.tn) / total : 0;
  }

  function buildSteps(points, labels, lr, maxIter) {
    var steps = [];
    var model = initWeights(2, 777);
    var prevLoss = Infinity;
    var lossHistory = [];

    steps.push({
      label: 'Initialize Weights',
      log: 'Initialized weights near zero: w=[' + model.w[0].toFixed(3) + ', ' + model.w[1].toFixed(3) + '], b=' + model.b.toFixed(3),
      state: function () {
        return { w1: model.w[0], w2: model.w[1], bias: model.b, iteration: 0, phase: 'initialize', loss: 0, gradNorm: 0 };
      },
      metrics: function () { return { 'Iteration': 0, 'Phase': 'Init', 'Loss': '—', 'Status': 'Ready' }; },
      viz: function () { return { model: { w: model.w.slice(), b: model.b }, lossHistory: [], points: points, labels: labels }; }
    });

    for (var iter = 0; iter < maxIter; iter++) {
      (function (iterIdx, mRef, prevLossRef) {
        steps.push({
          label: 'Iteration ' + (iterIdx + 1),
          log: 'Computing logits and gradients',
          state: function () {
            var preds = forward(mRef, points);
            var loss = computeLoss(preds, labels);
            var grads = computeGradients(mRef, points, preds, labels);
            var gNorm = gradientNorm(grads);
            var predLabels = classify(mRef, points, 0.5);
            var cm = confusionMatrix(predLabels, labels);
            var acc = accuracy(cm);
            var pr = precisionRecall(cm);
            return {
              w1: mRef.w[0], w2: mRef.w[1], bias: mRef.b,
              iteration: iterIdx + 1, phase: 'update',
              loss: Math.round(loss * 10000) / 10000,
              gradNorm: Math.round(gNorm * 10000) / 10000,
              accuracy: Math.round(acc * 10000) / 10000,
              precision: Math.round(pr.precision * 10000) / 10000,
              recall: Math.round(pr.recall * 10000) / 10000,
              tp: cm.tp, fp: cm.fp, fn: cm.fn, tn: cm.tn,
              status: 'Running'
            };
          },
          metrics: function () {
            var preds = forward(mRef, points);
            var loss = computeLoss(preds, labels);
            var grads = computeGradients(mRef, points, preds, labels);
            var gNorm = gradientNorm(grads);
            var predLabels = classify(mRef, points, 0.5);
            var cm = confusionMatrix(predLabels, labels);
            var acc = accuracy(cm);
            return {
              'Iteration': iterIdx + 1,
              'Loss': Math.round(loss * 10000) / 10000,
              'Grad Norm': Math.round(gNorm * 10000) / 10000,
              'Accuracy': Math.round(acc * 10000) / 10000,
              'Status': 'Running'
            };
          },
          viz: function () {
            var preds = forward(mRef, points);
            var loss = computeLoss(preds, labels);
            lossHistory.push(loss);
            updateWeights(mRef, computeGradients(mRef, points, preds, labels), lr);
            return { model: { w: mRef.w.slice(), b: mRef.b }, lossHistory: lossHistory.slice(), points: points, labels: labels };
          }
        });
      })(iter, model, prevLoss);

      var preds = forward(model, points);
      var loss = computeLoss(preds, labels);
      var grads = computeGradients(model, points, preds, labels);
      lossHistory.push(loss);
      updateWeights(model, grads, lr);
      prevLoss = loss;
    }

    var finalPreds = forward(model, points);
    var finalLoss = computeLoss(finalPreds, labels);
    var finalPredLabels = classify(model, points, 0.5);
    var finalCm = confusionMatrix(finalPredLabels, labels);
    var finalAcc = accuracy(finalCm);
    var finalPr = precisionRecall(finalCm);

    steps.push({
      label: 'Finished',
      log: 'Training finished. Accuracy: ' + (finalAcc * 100).toFixed(1) + '%, Loss: ' + finalLoss.toFixed(4),
      state: function () {
        return {
          w1: model.w[0], w2: model.w[1], bias: model.b,
          iteration: maxIter, phase: 'converged',
          loss: Math.round(finalLoss * 10000) / 10000,
          gradNorm: 0,
          accuracy: Math.round(finalAcc * 10000) / 10000,
          precision: Math.round(finalPr.precision * 10000) / 10000,
          recall: Math.round(finalPr.recall * 10000) / 10000,
          tp: finalCm.tp, fp: finalCm.fp, fn: finalCm.fn, tn: finalCm.tn,
          status: 'Finished'
        };
      },
      metrics: function () {
        return {
          'Iteration': maxIter,
          'Loss': Math.round(finalLoss * 10000) / 10000,
          'Accuracy': Math.round(finalAcc * 10000) / 10000,
          'Status': 'Finished'
        };
      },
      viz: function () {
        return { model: { w: model.w.slice(), b: model.b }, lossHistory: lossHistory.slice(), points: points, labels: labels };
      }
    });

    return steps;
  }

  var labDefinition = {
    id: 'lab-logistic-regression',
    slug: 'logistic-regression',
    title: 'Logistic Regression',
    summary: 'Watch a logistic regression classifier learn a decision boundary by observing gradient descent on cross-entropy loss.',
    category: 'machine-learning',
    artifactReferences: [],
    conceptReferences: ['decision-boundaries'],
    parameterSchema: [
      {
        name: 'numPoints',
        type: 'integer',
        min: 40,
        max: 200,
        step: 10,
        default: 80,
        label: 'Dataset Size'
      },
      {
        name: 'separation',
        type: 'slider',
        min: 0.2,
        max: 3.0,
        step: 0.1,
        default: 1.0,
        label: 'Class Separation'
      },
      {
        name: 'noise',
        type: 'slider',
        min: 0.1,
        max: 3.0,
        step: 0.1,
        default: 1.0,
        label: 'Noise Level'
      },
      {
        name: 'learningRate',
        type: 'slider',
        min: 0.01,
        max: 2.0,
        step: 0.01,
        default: 0.5,
        label: 'Learning Rate'
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
      numPoints: 80,
      separation: 1.0,
      noise: 1.0,
      learningRate: 0.5,
      threshold: 0.5
    },
    steps: (function () {
      var pts = generateDataset(80, 1.0, 1.0, 42);
      var labels = pts.map(function (p) { return p.y; });
      return buildSteps(pts, labels, 0.5, 30);
    })(),
    inspector: {
      title: 'Logistic Regression State',
      sections: [
        {
          label: 'Current State',
          cards: [
            { key: 'iteration', label: 'Iteration', interpretation: function (v) { return v === 0 ? 'Initialization' : 'Training'; } },
            { key: 'phase', label: 'Phase' },
            { key: 'loss', label: 'Loss', interpretation: function (v) { return v < 0.3 ? 'Well fit' : v < 0.6 ? 'Improving' : 'High loss'; } },
            { key: 'status', label: 'Status' }
          ]
        },
        {
          label: 'Model Parameters',
          cards: [
            { key: 'w1', label: 'Weight 1', interpretation: function (v) { return 'Controls x1 influence'; } },
            { key: 'w2', label: 'Weight 2', interpretation: function (v) { return 'Controls x2 influence'; } },
            { key: 'bias', label: 'Bias', interpretation: function (v) { return 'Decision boundary offset'; } }
          ]
        },
        {
          label: 'Optimization',
          cards: [
            { key: 'gradNorm', label: 'Gradient Norm', interpretation: function (v) { return v < 0.01 ? 'Near convergence' : v < 0.1 ? 'Moderate update' : 'Large update'; } },
            { key: 'accuracy', label: 'Accuracy', interpretation: function (v) { return v > 0.9 ? 'Excellent' : v > 0.7 ? 'Good' : 'Needs improvement'; } },
            { key: 'precision', label: 'Precision', interpretation: function (v) { return v > 0.85 ? 'Few false positives' : 'Some false positives'; } },
            { key: 'recall', label: 'Recall', interpretation: function (v) { return v > 0.85 ? 'Few false negatives' : 'Some false negatives'; } }
          ]
        }
      ],
      computeState: function (params, stepIndex) {
        var pts = generateDataset(params.numPoints, params.separation, params.noise, 42);
        var labels = pts.map(function (p) { return p.y; });
        var lr = params.learningRate || 0.5;
        var model = initWeights(2, 777);

        for (var i = 0; i < Math.floor(stepIndex / 1); i++) {
          var preds = forward(model, pts);
          var grads = computeGradients(model, pts, preds, labels);
          updateWeights(model, grads, lr);
        }

        var finalPreds = forward(model, pts);
        var loss = computeLoss(finalPreds, labels);
        var grads = computeGradients(model, pts, finalPreds, labels);
        var gNorm = gradientNorm(grads);
        var predLabels = classify(model, pts, params.threshold || 0.5);
        var cm = confusionMatrix(predLabels, labels);
        var acc = accuracy(cm);
        var pr = precisionRecall(cm);

        return {
          iteration: stepIndex,
          phase: stepIndex === 0 ? 'initialize' : 'update',
          loss: Math.round(loss * 10000) / 10000,
          gradNorm: Math.round(gNorm * 10000) / 10000,
          accuracy: Math.round(acc * 10000) / 10000,
          precision: Math.round(pr.precision * 10000) / 10000,
          recall: Math.round(pr.recall * 10000) / 10000,
          w1: Math.round(model.w[0] * 10000) / 10000,
          w2: Math.round(model.w[1] * 10000) / 10000,
          bias: Math.round(model.b * 10000) / 10000,
          tp: cm.tp, fp: cm.fp, fn: cm.fn, tn: cm.tn,
          status: stepIndex >= 30 ? 'Finished' : 'Running'
        };
      },
      changeDetector: function (prev, curr) {
        var changes = [];
        if (prev && curr) {
          if (prev.loss !== curr.loss) changes.push({ from: 'loss', to: null, label: curr.loss < prev.loss ? 'Loss decreased' : 'Loss changed' });
          if (prev.gradNorm !== curr.gradNorm) changes.push({ from: 'gradNorm', to: null, label: 'Gradient norm: ' + curr.gradNorm });
          if (prev.accuracy !== curr.accuracy) changes.push({ from: 'accuracy', to: null, label: 'Accuracy: ' + (curr.accuracy * 100).toFixed(1) + '%' });
        }
        return changes;
      }
    },
    observations: [
      {
        id: 'decision-boundary',
        title: 'Decision Boundary',
        purpose: 'How is the classifier separating the classes?',
        defaultSize: 'large',
        render: function (container, params, stepIndex) {
          var pts = generateDataset(params.numPoints, params.separation, params.noise, 42);
          var labels = pts.map(function (p) { return p.y; });
          var lr = params.learningRate || 0.5;
          var model = initWeights(2, 777);
          for (var i = 0; i < stepIndex; i++) {
            var preds = forward(model, pts);
            var grads = computeGradients(model, pts, preds, labels);
            updateWeights(model, grads, lr);
          }

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Decision Boundary';
          container.appendChild(title);

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 400 300');
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', 'Decision boundary scatter plot');
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxHeight = '250px';

          var allX = pts.map(function (p) { return p.x1; });
          var allY = pts.map(function (p) { return p.x2; });
          var minX = Math.min.apply(null, allX) - 0.5;
          var maxX = Math.max.apply(null, allX) + 0.5;
          var minY = Math.min.apply(null, allY) - 0.5;
          var maxY = Math.max.apply(null, allY) + 0.5;
          var rangeX = maxX - minX || 1;
          var rangeY = maxY - minY || 1;

          // Decision boundary line: w1*x1 + w2*x2 + b = 0 => x2 = -(w1*x1 + b) / w2
          if (Math.abs(model.w[1]) > 0.001) {
            var x1Line = minX;
            var x2Line = -(model.w[0] * x1Line + model.b) / model.w[1];
            var x1Line2 = maxX;
            var x2Line2 = -(model.w[0] * x1Line2 + model.b) / model.w[1];
            var sx1 = 40 + ((x1Line - minX) / rangeX) * 320;
            var sy1 = 10 + ((x2Line - minY) / rangeY) * 260;
            var sx2 = 40 + ((x1Line2 - minX) / rangeX) * 320;
            var sy2 = 10 + ((x2Line2 - minY) / rangeY) * 260;
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', sx1); line.setAttribute('y1', sy1);
            line.setAttribute('x2', sx2); line.setAttribute('y2', sy2);
            line.setAttribute('stroke', '#06b6d4'); line.setAttribute('stroke-width', '2');
            line.setAttribute('stroke-dasharray', '4 2');
            svg.appendChild(line);
          }

          pts.forEach(function (p, idx) {
            var cx = 40 + ((p.x1 - minX) / rangeX) * 320;
            var cy = 10 + ((p.x2 - minY) / rangeY) * 260;
            var prob = stableSigmoid(model.w[0] * p.x1 + model.w[1] * p.x2 + model.b);
            var predicted = prob >= (params.threshold || 0.5) ? 1 : 0;
            var correct = predicted === labels[idx];
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', cx);
            circle.setAttribute('cy', cy);
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', labels[idx] === 1 ? '#06b6d4' : '#f59e0b');
            circle.setAttribute('opacity', correct ? '0.7' : '0.4');
            circle.setAttribute('stroke', correct ? 'none' : '#ef4444');
            circle.setAttribute('stroke-width', correct ? '0' : '1.5');
            svg.appendChild(circle);
          });

          container.appendChild(svg);
        }
      },
      {
        id: 'loss-curve',
        title: 'Loss Curve',
        purpose: 'Is training improving?',
        defaultSize: 'small',
        render: function (container, params, stepIndex) {
          var pts = generateDataset(params.numPoints, params.separation, params.noise, 42);
          var labels = pts.map(function (p) { return p.y; });
          var lr = params.learningRate || 0.5;
          var model = initWeights(2, 777);
          var lossHistory = [];
          for (var i = 0; i < stepIndex; i++) {
            var preds = forward(model, pts);
            var loss = computeLoss(preds, labels);
            lossHistory.push(loss);
            var grads = computeGradients(model, pts, preds, labels);
            updateWeights(model, grads, lr);
          }

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Loss Curve';
          container.appendChild(title);

          if (lossHistory.length > 0) {
            window.NeuralVerse.VisualizationEngine.renderLineChart(container, lossHistory, { title: '' });
          } else {
            container.innerHTML += '<p style="font-size:0.75rem;color:var(--nv-lab-text-muted)">Train to see loss history</p>';
          }
        }
      },
      {
        id: 'probability-dist',
        title: 'Prediction Confidence',
        purpose: 'How confident are the predictions?',
        defaultSize: 'small',
        render: function (container, params, stepIndex) {
          var pts = generateDataset(params.numPoints, params.separation, params.noise, 42);
          var labels = pts.map(function (p) { return p.y; });
          var lr = params.learningRate || 0.5;
          var model = initWeights(2, 777);
          for (var i = 0; i < stepIndex; i++) {
            var preds = forward(model, pts);
            var grads = computeGradients(model, pts, preds, labels);
            updateWeights(model, grads, lr);
          }
          var finalPreds = forward(model, pts);

          var bins = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          finalPreds.forEach(function (p) {
            var bin = Math.min(9, Math.floor(p * 10));
            bins[bin]++;
          });

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Prediction Confidence';
          container.appendChild(title);

          window.NeuralVerse.VisualizationEngine.renderBarChart(container, bins, {
            title: '',
            labels: ['0-0.1', '0.1-0.2', '0.2-0.3', '0.3-0.4', '0.4-0.5', '0.5-0.6', '0.6-0.7', '0.7-0.8', '0.8-0.9', '0.9-1.0']
          });
        }
      },
      {
        id: 'confusion-matrix',
        title: 'Confusion Matrix',
        purpose: 'What types of errors is the classifier making?',
        defaultSize: 'small',
        render: function (container, params, stepIndex) {
          var pts = generateDataset(params.numPoints, params.separation, params.noise, 42);
          var labels = pts.map(function (p) { return p.y; });
          var lr = params.learningRate || 0.5;
          var model = initWeights(2, 777);
          for (var i = 0; i < stepIndex; i++) {
            var preds = forward(model, pts);
            var grads = computeGradients(model, pts, preds, labels);
            updateWeights(model, grads, lr);
          }
          var predLabels = classify(model, pts, params.threshold || 0.5);
          var cm = confusionMatrix(predLabels, labels);

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Confusion Matrix';
          container.appendChild(title);

          var matrix = [[cm.tn, cm.fp], [cm.fn, cm.tp]];
          window.NeuralVerse.VisualizationEngine.renderMatrix(container, matrix, { title: '' });
        }
      }
    ],
    execute: function (params) {
      var numPoints = params.numPoints !== undefined ? params.numPoints : 80;
      var separation = params.separation !== undefined ? params.separation : 1.0;
      var noise = params.noise !== undefined ? params.noise : 1.0;
      var lr = params.learningRate !== undefined ? params.learningRate : 0.5;
      var threshold = params.threshold !== undefined ? params.threshold : 0.5;

      var pts = generateDataset(numPoints, separation, noise, 42);
      var labels = pts.map(function (p) { return p.y; });
      var model = initWeights(2, 777);
      var lossHistory = [];

      for (var iter = 0; iter < 30; iter++) {
        var preds = forward(model, pts);
        var loss = computeLoss(preds, labels);
        lossHistory.push(loss);
        var grads = computeGradients(model, pts, preds, labels);
        updateWeights(model, grads, lr);
      }

      var finalPreds = forward(model, pts);
      var finalLoss = computeLoss(finalPreds, labels);
      var predLabels = classify(model, pts, threshold);
      var cm = confusionMatrix(predLabels, labels);
      var acc = accuracy(cm);

      return {
        lossHistory: lossHistory,
        accuracy: Math.round(acc * 10000) / 10000,
        confusionMatrix: [[cm.tn, cm.fp], [cm.fn, cm.tp]],
        finalWeights: { w1: model.w[0], w2: model.w[1], b: model.b }
      };
    },
    visualization: { type: 'scatter-plot', title: 'Logistic Regression Training' },
    canonicalStatus: 'reviewed',
    version: '1.0.0',
    reviewedBy: 'NeuralVerse Team',
    lastReviewed: '2026-07-07',
    estimatedDuration: '10 minutes'
  };

  if (window.NeuralVerse.LabRegistry && window.NeuralVerse.LabRegistry.register) {
    window.NeuralVerse.LabRegistry.register(labDefinition);
  }
})();
