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

  function generateSamples(numPos, numNeg, seed) {
    var rng = seededRandom(seed || 123);
    var samples = [];
    for (var i = 0; i < numPos; i++) {
      samples.push({ score: 0.4 + rng() * 0.6, actual: 1 });
    }
    for (var i = 0; i < numNeg; i++) {
      samples.push({ score: rng() * 0.6, actual: 0 });
    }
    samples.sort(function (a, b) { return b.score - a.score; });
    return samples;
  }

  function confusionAt(samples, threshold) {
    var tp = 0, fp = 0, fn = 0, tn = 0;
    for (var i = 0; i < samples.length; i++) {
      var pred = samples[i].score >= threshold ? 1 : 0;
      if (pred === 1 && samples[i].actual === 1) tp++;
      else if (pred === 1 && samples[i].actual === 0) fp++;
      else if (pred === 0 && samples[i].actual === 1) fn++;
      else tn++;
    }
    return { tp: tp, fp: fp, fn: fn, tn: tn };
  }

  function prMetrics(cm) {
    var p = cm.tp + cm.fp > 0 ? cm.tp / (cm.tp + cm.fp) : 0;
    var r = cm.tp + cm.fn > 0 ? cm.tp / (cm.tp + cm.fn) : 0;
    var f1 = p + r > 0 ? 2 * p * r / (p + r) : 0;
    var acc = (cm.tp + cm.tn) / (cm.tp + cm.fp + cm.fn + cm.tn);
    return { precision: p, recall: r, f1: f1, accuracy: acc };
  }

  function buildPRCurve(samples) {
    var totalPos = 0;
    for (var i = 0; i < samples.length; i++) {
      if (samples[i].actual === 1) totalPos++;
    }
    var curve = [];
    var tp = 0, fp = 0;
    for (var i = 0; i < samples.length; i++) {
      if (samples[i].actual === 1) tp++; else fp++;
      var recall = totalPos > 0 ? tp / totalPos : 0;
      var precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
      curve.push({ recall: recall, precision: precision, threshold: samples[i].score });
    }
    curve.unshift({ recall: 0, precision: 1, threshold: 1 });
    return curve;
  }

  function buildSteps(samples, threshold) {
    var steps = [];

    steps.push({
      label: 'Generate Dataset',
      log: 'Generated ' + samples.length + ' classification samples with known ground truth',
      state: function () { return { samples: samples, phase: 'generate' }; },
      metrics: function () { var p = samples.filter(function (s) { return s.actual === 1; }).length; return { 'Total': samples.length, 'Positive': p, 'Negative': samples.length - p, 'Phase': 'Generate' }; },
      viz: function () { return { samples: samples, phase: 'generate' }; }
    });

    steps.push({
      label: 'Compute Scores',
      log: 'Sorted prediction probabilities for threshold sweep',
      state: function () { return { samples: samples, phase: 'scores' }; },
      metrics: function () { return { 'Sorted': samples.length + ' samples', 'Phase': 'Scores', 'Status': 'Ready' }; },
      viz: function () { return { samples: samples, phase: 'scores' }; }
    });

    steps.push({
      label: 'Apply Threshold',
      log: 'Applying threshold θ = ' + threshold.toFixed(2) + ', classifying predictions',
      state: function () { return { threshold: threshold, phase: 'threshold' }; },
      metrics: function () { return { 'Threshold': threshold.toFixed(2), 'Phase': 'Threshold', 'Status': 'Applied' }; },
      viz: function () { return { samples: samples, threshold: threshold, phase: 'threshold' }; }
    });

    var cm = confusionAt(samples, threshold);
    steps.push({
      label: 'Build Confusion Matrix',
      log: 'Confusion matrix: TP=' + cm.tp + ', FP=' + cm.fp + ', FN=' + cm.fn + ', TN=' + cm.tn,
      state: function () { return { cm: cm, phase: 'confusion' }; },
      metrics: function () { return { 'TP': cm.tp, 'FP': cm.fp, 'FN': cm.fn, 'TN': cm.tn, 'Phase': 'Confusion' }; },
      viz: function () { return { samples: samples, threshold: threshold, cm: cm, phase: 'confusion' }; }
    });

    var m = prMetrics(cm);
    steps.push({
      label: 'Compute Precision',
      log: 'Precision computed: fraction of positive predictions that are correct',
      state: function () { return { precision: m.precision, phase: 'precision' }; },
      metrics: function () { return { 'Precision': m.precision.toFixed(4), 'Phase': 'Precision', 'Status': 'Computed' }; },
      viz: function () { return { samples: samples, threshold: threshold, cm: cm, m: m, phase: 'precision' }; }
    });

    steps.push({
      label: 'Compute Recall',
      log: 'Recall computed: fraction of actual positives detected',
      state: function () { return { recall: m.recall, phase: 'recall' }; },
      metrics: function () { return { 'Recall': m.recall.toFixed(4), 'F1': m.f1.toFixed(4), 'Phase': 'Recall', 'Status': 'Computed' }; },
      viz: function () { return { samples: samples, threshold: threshold, cm: cm, m: m, phase: 'recall' }; }
    });

    var curve = buildPRCurve(samples);
    steps.push({
      label: 'Build PR Curve',
      log: 'Precision-Recall curve constructed from threshold sweep',
      state: function () { return { curve: curve, phase: 'pr-curve' }; },
      metrics: function () { return { 'Curve Points': curve.length, 'Phase': 'PR Curve', 'Status': 'Generated' }; },
      viz: function () { return { samples: samples, threshold: threshold, cm: cm, m: m, curve: curve, phase: 'pr-curve' }; }
    });

    steps.push({
      label: 'Analyze Trade-offs',
      log: 'Evaluation complete: precision=' + m.precision.toFixed(3) + ', recall=' + m.recall.toFixed(3) + ', f1=' + m.f1.toFixed(3),
      state: function () { return { m: m, cm: cm, curve: curve, phase: 'analyze' }; },
      metrics: function () { return { 'Precision': m.precision.toFixed(3), 'Recall': m.recall.toFixed(3), 'F1': m.f1.toFixed(3), 'Phase': 'Analyze' }; },
      viz: function () { return { samples: samples, threshold: threshold, cm: cm, m: m, curve: curve, phase: 'analyze' }; }
    });

    steps.push({
      label: 'Complete',
      log: 'PR analysis complete: trade-off curve characterizes classifier behavior',
      state: function () { return { phase: 'finished' }; },
      metrics: function () { return { 'Phase': 'Complete', 'Status': 'Done' }; },
      viz: function () { return { samples: samples, threshold: threshold, cm: cm, m: m, curve: curve, phase: 'finished' }; }
    });

    return steps;
  }

  var labDefinition = {
    id: 'lab-precision-recall',
    slug: 'precision-recall',
    title: 'Precision vs Recall',
    summary: 'Investigate how decision thresholds alter classifier behavior by watching precision, recall, and the confusion matrix evolve in real time.',
    category: 'evaluation',
    artifactReferences: [],
    conceptReferences: ['cross-validation', 'feature-engineering'],
    parameterSchema: [
      { name: 'threshold', type: 'slider', min: 0.05, max: 0.95, step: 0.05, default: 0.5, label: 'Classification Threshold' },
      { name: 'numPositive', type: 'integer', min: 10, max: 80, step: 5, default: 40, label: 'Positive Samples' },
      { name: 'numNegative', type: 'integer', min: 10, max: 80, step: 5, default: 40, label: 'Negative Samples' }
    ],
    initialState: { threshold: 0.5, numPositive: 40, numNegative: 40 },
    steps: (function () { return buildSteps(generateSamples(40, 40), 0.5); })(),
    inspector: {
      title: 'Evaluation State',
      sections: [
        {
          label: 'Decision Boundary',
          cards: [
            { key: 'threshold', label: 'Threshold θ', interpretation: function (v) { return 'Decision boundary at ' + v; } },
            { key: 'posPred', label: 'Predicted Positive', interpretation: function (v) { return v + ' samples predicted positive'; } },
            { key: 'negPred', label: 'Predicted Negative', interpretation: function (v) { return v + ' samples predicted negative'; } }
          ]
        },
        {
          label: 'Confusion Matrix',
          cards: [
            { key: 'tp', label: 'True Positives (TP)', interpretation: function (v) { return 'Correctly identified positives'; } },
            { key: 'fp', label: 'False Positives (FP)', interpretation: function (v) { return v > 5 ? 'Many false alarms' : v > 0 ? 'Some false alarms' : 'No false alarms'; } },
            { key: 'fn', label: 'False Negatives (FN)', interpretation: function (v) { return v > 5 ? 'Many missed positives' : v > 0 ? 'Some missed' : 'None missed'; } },
            { key: 'tn', label: 'True Negatives (TN)', interpretation: function (v) { return 'Correctly identified negatives'; } }
          ]
        },
        {
          label: 'Evaluation Metrics',
          cards: [
            { key: 'precision', label: 'Precision', interpretation: function (v) { return v > 0.9 ? 'Very few false positives' : v > 0.7 ? 'Good precision' : 'Many false positives'; } },
            { key: 'recall', label: 'Recall', interpretation: function (v) { return v > 0.9 ? 'Catches most positives' : v > 0.7 ? 'Good recall' : 'Many positives missed'; } },
            { key: 'f1', label: 'F1 Score', interpretation: function (v) { return v > 0.85 ? 'Excellent balance' : v > 0.7 ? 'Good balance' : 'Imbalanced'; } },
            { key: 'accuracy', label: 'Accuracy', interpretation: function (v) { return v > 0.9 ? 'High accuracy' : v > 0.7 ? 'Moderate accuracy' : 'Low accuracy'; } }
          ]
        }
      ],
      computeState: function (params) {
        var samples = generateSamples(params.numPositive || 40, params.numNegative || 40);
        var threshold = params.threshold || 0.5;
        var cm = confusionAt(samples, threshold);
        var m = prMetrics(cm);
        return {
          threshold: threshold.toFixed(2),
          posPred: cm.tp + cm.fp,
          negPred: cm.fn + cm.tn,
          tp: cm.tp, fp: cm.fp, fn: cm.fn, tn: cm.tn,
          precision: m.precision.toFixed(4),
          recall: m.recall.toFixed(4),
          f1: m.f1.toFixed(4),
          accuracy: m.accuracy.toFixed(4)
        };
      },
      changeDetector: function (prev, curr) {
        var changes = [];
        if (prev && curr) {
          if (prev.precision !== curr.precision) changes.push({ from: 'precision', to: null, label: 'Precision: ' + curr.precision });
          if (prev.recall !== curr.recall) changes.push({ from: 'recall', to: null, label: 'Recall: ' + curr.recall });
          if (prev.tp !== curr.tp) changes.push({ from: 'tp', to: null, label: 'TP: ' + curr.tp });
        }
        return changes;
      }
    },
    observations: [
      {
        id: 'prediction-distribution',
        title: 'Prediction Distribution',
        purpose: 'How are prediction scores distributed?',
        defaultSize: 'large',
        render: function (container, params) {
          var samples = generateSamples(params.numPositive || 40, params.numNegative || 40);
          var threshold = params.threshold || 0.5;

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Prediction Distribution';
          container.appendChild(title);

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 400 300');
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', 'Prediction score distribution');
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxHeight = '250px';

          var bins = new Array(20).fill(0);
          var binLabels = new Array(20).fill(0);
          for (var i = 0; i < 20; i++) binLabels[i] = i * 0.05;

          samples.forEach(function (s) {
            var bin = Math.min(19, Math.floor(s.score / 0.05));
            bins[bin]++;
          });

          var maxBin = Math.max.apply(null, bins) || 1;

          bins.forEach(function (count, i) {
            var x = 20 + i * 19;
            var h = (count / maxBin) * 160;
            var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', 180 - h);
            rect.setAttribute('width', 16);
            rect.setAttribute('height', h);
            var isInThreshold = binLabels[i] >= threshold;
            rect.setAttribute('fill', isInThreshold ? '#06b6d4' : '#f59e0b');
            rect.setAttribute('opacity', '0.6');
            rect.setAttribute('rx', '2');
            svg.appendChild(rect);
          });

          // Threshold line
          var threshX = 20 + (threshold / 1.0) * 19 * 20;
          var threshLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          threshLine.setAttribute('x1', threshX); threshLine.setAttribute('y1', 10);
          threshLine.setAttribute('x2', threshX); threshLine.setAttribute('y2', 180);
          threshLine.setAttribute('stroke', '#ef4444');
          threshLine.setAttribute('stroke-width', '2');
          threshLine.setAttribute('stroke-dasharray', '4 2');
          svg.appendChild(threshLine);

          var threshLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          threshLbl.setAttribute('x', threshX + 4); threshLbl.setAttribute('y', 25);
          threshLbl.setAttribute('fill', '#ef4444'); threshLbl.setAttribute('font-size', '9');
          threshLbl.textContent = 'θ=' + threshold.toFixed(2);
          svg.appendChild(threshLbl);

          container.appendChild(svg);
        },
        interpretation: function (params, stepIndex) { return 'The threshold line separates predicted positives from predicted negatives.'; }
      },
      {
        id: 'confusion-matrix',
        title: 'Confusion Matrix',
        purpose: 'What mistakes is the classifier making?',
        defaultSize: 'small',
        render: function (container, params) {
          var samples = generateSamples(params.numPositive || 40, params.numNegative || 40);
          var cm = confusionAt(samples, params.threshold || 0.5);

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Confusion Matrix';
          container.appendChild(title);

          var html = '<div class="nv-lab-obs-cm">';
          html += '<div class="nv-lab-obs-cm-header"><span></span><span class="nv-lab-obs-cm-col">Pred +</span><span class="nv-lab-obs-cm-col">Pred −</span></div>';
          html += '<div class="nv-lab-obs-cm-row"><span class="nv-lab-obs-cm-label">Actual +</span>';
          html += '<div class="nv-lab-obs-cm-cell nv-lab-obs-cm-cell--tp">' + cm.tp + '<span>TP</span></div>';
          html += '<div class="nv-lab-obs-cm-cell nv-lab-obs-cm-cell--fn">' + cm.fn + '<span>FN</span></div></div>';
          html += '<div class="nv-lab-obs-cm-row"><span class="nv-lab-obs-cm-label">Actual −</span>';
          html += '<div class="nv-lab-obs-cm-cell nv-lab-obs-cm-cell--fp">' + cm.fp + '<span>FP</span></div>';
          html += '<div class="nv-lab-obs-cm-cell nv-lab-obs-cm-cell--tn">' + cm.tn + '<span>TN</span></div></div>';
          html += '</div>';
          container.innerHTML = html;
        },
        interpretation: function (params, stepIndex) { return 'The confusion matrix shows how the threshold choice affects true and false predictions.'; }
      },
      {
        id: 'pr-curve',
        title: 'PR Curve',
        purpose: 'How does threshold move along the PR curve?',
        defaultSize: 'small',
        render: function (container, params) {
          var samples = generateSamples(params.numPositive || 40, params.numNegative || 40);
          var threshold = params.threshold || 0.5;
          var curve = buildPRCurve(samples);
          var m = prMetrics(confusionAt(samples, threshold));

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Precision–Recall Curve';
          container.appendChild(title);

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 400 300');
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', 'Precision-Recall curve');
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxHeight = '250px';

          var pad = { l: 45, r: 15, t: 15, b: 30 };
          var w = 400 - pad.l - pad.r;
          var h = 250 - pad.t - pad.b;

          // Grid
          for (var g = 0; g <= 4; g++) {
            var gy = pad.t + (h / 4) * g;
            var gl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            gl.setAttribute('x1', pad.l); gl.setAttribute('y1', gy);
            gl.setAttribute('x2', pad.l + w); gl.setAttribute('y2', gy);
            gl.setAttribute('stroke', 'rgba(138,180,248,0.1)'); gl.setAttribute('stroke-width', '0.5');
            svg.appendChild(gl);
          }

          // PR curve
          var pathD = '';
          curve.forEach(function (pt, i) {
            var x = pad.l + pt.recall * w;
            var y = pad.t + (1 - pt.precision) * h;
            pathD += (i === 0 ? 'M' : 'L') + x + ',' + y;
          });
          var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', pathD);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', '#06b6d4');
          path.setAttribute('stroke-width', '2');
          svg.appendChild(path);

          // Operating point
          var opX = pad.l + m.recall * w;
          var opY = pad.t + (1 - m.precision) * h;
          var opDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          opDot.setAttribute('cx', opX); opDot.setAttribute('cy', opY);
          opDot.setAttribute('r', '5'); opDot.setAttribute('fill', '#ef4444');
          opDot.setAttribute('stroke', '#fff'); opDot.setAttribute('stroke-width', '1.5');
          svg.appendChild(opDot);

          var opLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          opLbl.setAttribute('x', opX + 8); opLbl.setAttribute('y', opY - 5);
          opLbl.setAttribute('fill', '#ef4444'); opLbl.setAttribute('font-size', '9');
          opLbl.textContent = 'θ=' + threshold.toFixed(2);
          svg.appendChild(opLbl);

          // Axes labels
          var xLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          xLbl.setAttribute('x', pad.l + w / 2); xLbl.setAttribute('y', 245);
          xLbl.setAttribute('fill', 'rgba(138,180,248,0.5)'); xLbl.setAttribute('font-size', '10');
          xLbl.setAttribute('text-anchor', 'middle'); xLbl.textContent = 'Recall';
          svg.appendChild(xLbl);

          var yLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          yLbl.setAttribute('x', 10); yLbl.setAttribute('y', pad.t + h / 2);
          yLbl.setAttribute('fill', 'rgba(138,180,248,0.5)'); yLbl.setAttribute('font-size', '10');
          yLbl.setAttribute('text-anchor', 'middle'); yLbl.setAttribute('transform', 'rotate(-90, 10, ' + (pad.t + h / 2) + ')');
          yLbl.textContent = 'Precision';
          svg.appendChild(yLbl);

          container.appendChild(svg);
        },
        interpretation: function (params, stepIndex) { return 'The PR curve traces the precision-recall trade-off as the threshold varies.'; }
      },
      {
        id: 'threshold-explorer',
        title: 'Threshold Explorer',
        purpose: 'What changes when the threshold moves?',
        defaultSize: 'small',
        render: function (container, params) {
          var samples = generateSamples(params.numPositive || 40, params.numNegative || 40);
          var threshold = params.threshold || 0.5;
          var cm = confusionAt(samples, threshold);
          var m = prMetrics(cm);

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Threshold Explorer';
          container.appendChild(title);

          var thresholds = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
          var html = '<div class="nv-lab-obs-threshold-table">';
          html += '<div class="nv-lab-obs-th-row nv-lab-obs-th-header"><span>θ</span><span>P</span><span>R</span><span>F1</span></div>';
          thresholds.forEach(function (t) {
            var tcm = confusionAt(samples, t);
            var tm = prMetrics(tcm);
            var active = Math.abs(t - threshold) < 0.03;
            html += '<div class="nv-lab-obs-th-row' + (active ? ' nv-lab-obs-th-row--active' : '') + '">';
            html += '<span>' + t.toFixed(2) + '</span>';
            html += '<span>' + tm.precision.toFixed(2) + '</span>';
            html += '<span>' + tm.recall.toFixed(2) + '</span>';
            html += '<span>' + tm.f1.toFixed(2) + '</span>';
            html += '</div>';
          });
          html += '</div>';
          container.innerHTML = html;
        },
        interpretation: function (params, stepIndex) { return 'Different thresholds produce different precision-recall balances — the optimal choice depends on the application.'; }
      }
    ],
    xai: {
      categories: ['Evaluation', 'Classification'],
      crossLabConnections: [
        { trigger: 'optimalThreshold', target: 'logistic-regression', text: 'Apply this threshold insight to logistic regression classification.', suggestCategory: 'Classification' },
        { trigger: 'highRecall', target: 'precision-recall', text: 'Increasing precision requires accepting some false negatives.', suggestCategory: 'Evaluation' }
      ]
    },
    renderPreparation: function (container, params) {
      var samples = generateSamples(params.numPositive || 40, params.numNegative || 40);
      var threshold = params.threshold || 0.5;
      var curve = buildPRCurve(samples);
      var m = prMetrics(confusionAt(samples, threshold));

      container.innerHTML = '';
      var title = document.createElement('h4');
      title.className = 'nv-lab-obs-title';
      title.textContent = 'Preparation — PR Curve Overview';
      container.appendChild(title);

      var info = document.createElement('p');
      info.className = 'nv-lab-obs-info';
      info.textContent = 'Threshold θ = ' + threshold.toFixed(2) + ' · Precision = ' + m.precision.toFixed(3) + ' · Recall = ' + m.recall.toFixed(3);
      container.appendChild(info);

      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 400 300');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'Precision-Recall curve with current threshold');
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxHeight = '250px';

      var pad = { l: 45, r: 15, t: 15, b: 30 };
      var w = 400 - pad.l - pad.r;
      var h = 250 - pad.t - pad.b;

      for (var g = 0; g <= 4; g++) {
        var gy = pad.t + (h / 4) * g;
        var gl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gl.setAttribute('x1', pad.l); gl.setAttribute('y1', gy);
        gl.setAttribute('x2', pad.l + w); gl.setAttribute('y2', gy);
        gl.setAttribute('stroke', 'rgba(138,180,248,0.1)'); gl.setAttribute('stroke-width', '0.5');
        svg.appendChild(gl);
      }

      var pathD = '';
      curve.forEach(function (pt, i) {
        var x = pad.l + pt.recall * w;
        var y = pad.t + (1 - pt.precision) * h;
        pathD += (i === 0 ? 'M' : 'L') + x + ',' + y;
      });
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#06b6d4');
      path.setAttribute('stroke-width', '2');
      svg.appendChild(path);

      var opX = pad.l + m.recall * w;
      var opY = pad.t + (1 - m.precision) * h;
      var opDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      opDot.setAttribute('cx', opX); opDot.setAttribute('cy', opY);
      opDot.setAttribute('r', '5'); opDot.setAttribute('fill', '#ef4444');
      opDot.setAttribute('stroke', '#fff'); opDot.setAttribute('stroke-width', '1.5');
      svg.appendChild(opDot);

      var opLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      opLbl.setAttribute('x', opX + 8); opLbl.setAttribute('y', opY - 5);
      opLbl.setAttribute('fill', '#ef4444'); opLbl.setAttribute('font-size', '9');
      opLbl.textContent = 'θ=' + threshold.toFixed(2);
      svg.appendChild(opLbl);

      var xLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      xLbl.setAttribute('x', pad.l + w / 2); xLbl.setAttribute('y', 245);
      xLbl.setAttribute('fill', 'rgba(138,180,248,0.5)'); xLbl.setAttribute('font-size', '10');
      xLbl.setAttribute('text-anchor', 'middle'); xLbl.textContent = 'Recall';
      svg.appendChild(xLbl);

      var yLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      yLbl.setAttribute('x', 10); yLbl.setAttribute('y', pad.t + h / 2);
      yLbl.setAttribute('fill', 'rgba(138,180,248,0.5)'); yLbl.setAttribute('font-size', '10');
      yLbl.setAttribute('text-anchor', 'middle'); yLbl.setAttribute('transform', 'rotate(-90, 10, ' + (pad.t + h / 2) + ')');
      yLbl.textContent = 'Precision';
      svg.appendChild(yLbl);

      container.appendChild(svg);
    },
    getPreparationTelemetry: function (params) {
      var samples = generateSamples(params.numPositive || 40, params.numNegative || 40);
      var threshold = params.threshold || 0.5;
      var m = prMetrics(confusionAt(samples, threshold));
      return [
        { key: 'threshold', label: 'Threshold', value: threshold.toFixed(2) },
        { key: 'precision', label: 'Precision', value: m.precision.toFixed(4) },
        { key: 'recall', label: 'Recall', value: m.recall.toFixed(4) },
        { key: 'f1', label: 'F1', value: m.f1.toFixed(4) },
        { key: 'status', label: 'Status', value: 'Ready' }
      ];
    },
    getCompletionSummary: function (result, params) {
      if (!result) return [];
      return [
        { label: 'Final Precision', value: result.precision.toFixed(4) },
        { label: 'Final Recall', value: result.recall.toFixed(4) },
        { label: 'Final F1', value: result.f1Score.toFixed(4) },
        { label: 'Status', value: 'Complete' }
      ];
    },
    execute: function (params) {
      var threshold = params.threshold || 0.5;
      var numPos = params.numPositive || 40;
      var numNeg = params.numNegative || 40;
      var samples = generateSamples(numPos, numNeg);
      var cm = confusionAt(samples, threshold);
      var m = prMetrics(cm);
      var curve = buildPRCurve(samples);
      return { confusionMatrix: [[cm.tp, cm.fp], [cm.fn, cm.tn]], precision: m.precision, recall: m.recall, f1Score: m.f1, accuracy: m.accuracy, threshold: threshold, prCurve: curve };
    },
    visualization: { type: 'line-chart', title: 'Precision-Recall Curve' },
    canonicalStatus: 'reviewed',
    version: '1.0.0',
    reviewedBy: 'NeuralVerse Team',
    lastReviewed: '2026-07-07',
    estimatedDuration: '12 minutes'
  };

  if (window.NeuralVerse.LabRegistry && window.NeuralVerse.LabRegistry.register) {
    window.NeuralVerse.LabRegistry.register(labDefinition);
  }
})();
