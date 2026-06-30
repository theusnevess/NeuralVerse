/**
 * NV-1100-P9B — Visualization Engine
 * Pure deterministic render model generation.
 * Same inputs always produce the same outputs.
 * No mutation of source data. Referentially transparent.
 */
(function () {
  'use strict';

  var RENDERERS = {};

  function registerRenderer(name, fn) {
    if (typeof name === 'string' && typeof fn === 'function') {
      RENDERERS[name] = fn;
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --- Deterministic math utilities (no random API or Date) ---

  function deterministicRandom(seed) {
    // Simple seeded pseudo-random (mulberry32)
    var t = (seed + 0x6D2B79F5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function generatePoints(count, cx, cy, spread, seed) {
    var points = [];
    for (var i = 0; i < count; i++) {
      var s1 = deterministicRandom(seed + i * 2);
      var s2 = deterministicRandom(seed + i * 2 + 1);
      var x = cx + (s1 - 0.5) * 2 * spread;
      var y = cy + (s2 - 0.5) * 2 * spread;
      points.push({ x: x, y: y });
    }
    return points;
  }

  function generateLinspace(min, max, steps) {
    var result = [];
    if (steps <= 1) {
      result.push(min);
      return result;
    }
    var step = (max - min) / (steps - 1);
    for (var i = 0; i < steps; i++) {
      result.push(min + step * i);
    }
    return result;
  }

  // --- Renderer implementations ---

  function linePlotRenderer(definition, values) {
    var points = [];
    var annotations = [];
    var title = definition.title;
    var xLabel = 'x';
    var yLabel = 'y';

    switch (definition.id) {
      case 'linear-function': {
        var m = values.slope || 1;
        var b = values.intercept || 0;
        var xMin = values.xMin != null ? values.xMin : -10;
        var xMax = values.xMax != null ? values.xMax : 10;
        var xs = generateLinspace(xMin, xMax, 100);
        for (var i = 0; i < xs.length; i++) {
          points.push({ x: xs[i], y: m * xs[i] + b });
        }
        yLabel = 'y = ' + m + 'x + ' + b;
        break;
      }

      case 'quadratic-function': {
        var a = values.a || 1;
        var b2 = values.b || 0;
        var c = values.c || 0;
        var xMinQ = values.xMin != null ? values.xMin : -10;
        var xMaxQ = values.xMax != null ? values.xMax : 10;
        var xsQ = generateLinspace(xMinQ, xMaxQ, 100);
        for (var qi = 0; qi < xsQ.length; qi++) {
          var xv = xsQ[qi];
          points.push({ x: xv, y: a * xv * xv + b2 * xv + c });
        }
        yLabel = 'y = ' + a + 'x² + ' + b2 + 'x + ' + c;
        break;
      }

      case 'sigmoid-function': {
        var k = values.k || 1;
        var x0 = values.x0 || 0;
        var xsS = generateLinspace(-10, 10, 100);
        for (var si = 0; si < xsS.length; si++) {
          var xv2 = xsS[si];
          var sigmoid = 1 / (1 + Math.exp(-k * (xv2 - x0)));
          points.push({ x: xv2, y: sigmoid });
        }
        yLabel = 'σ(x) = 1/(1+e^(-' + k + '(x-' + x0 + ')))';
        break;
      }

      case 'relu-function': {
        var threshold = values.threshold || 0;
        var xsR = generateLinspace(-5, 5, 100);
        for (var ri = 0; ri < xsR.length; ri++) {
          var xv3 = xsR[ri];
          points.push({ x: xv3, y: Math.max(0, xv3 - threshold) });
        }
        yLabel = 'ReLU(x) = max(0, x - ' + threshold + ')';
        break;
      }

      case 'gradient-descent-loss': {
        var lr = values.learningRate || 0.01;
        var initLoss = values.initialLoss || 50;
        var steps = values.steps || 50;
        var lossType = values.lossType || 'quadratic';
        var loss = initLoss;
        points.push({ x: 0, y: loss });
        for (var gi = 1; gi <= steps; gi++) {
          switch (lossType) {
            case 'quadratic':
              loss = loss * (1 - lr);
              break;
            case 'exponential':
              loss = initLoss * Math.exp(-lr * gi);
              break;
            case 'log':
              loss = initLoss / (1 + lr * gi);
              break;
            default:
              loss = loss * (1 - lr);
          }
          loss = Math.max(0, loss);
          points.push({ x: gi, y: loss });
        }
        xLabel = 'Step';
        yLabel = 'Loss (' + lossType + ')';
        break;
      }

      case 'learning-rate-impact': {
        var lrs = [values.lr1 || 0.001, values.lr2 || 0.01, values.lr3 || 0.1];
        var stepsLR = values.steps || 100;
        var series = [];
        for (var li = 0; li < lrs.length; li++) {
          var lrSeries = [];
          var lossLR = 100;
          lrSeries.push({ x: 0, y: lossLR });
          for (var lj = 1; lj <= stepsLR; lj++) {
            lossLR = lossLR * (1 - lrs[li]);
            lossLR = Math.max(0, lossLR);
            lrSeries.push({ x: lj, y: lossLR });
          }
          series.push(lrSeries);
        }
        xLabel = 'Step';
        yLabel = 'Loss';
        return {
          type: 'multi-line',
          title: title,
          series: series,
          seriesLabels: ['LR=' + lrs[0], 'LR=' + lrs[1], 'LR=' + lrs[2]],
          xLabel: xLabel,
          yLabel: yLabel,
          annotations: []
        };
      }

      case 'precision-recall-tradeoff': {
        var thresholdPR = values.threshold || 0.5;
        var baseP = values.basePrecision || 0.8;
        var baseR = values.baseRecall || 0.6;
        var tsPR = generateLinspace(0, 1, 100);
        for (var pri = 0; pri < tsPR.length; pri++) {
          var t = tsPR[pri];
          var precision = baseP * (1 - t * 0.5) + 0.1 * Math.sin(t * Math.PI);
          var recall = baseR * t + 0.1 * (1 - t);
          precision = Math.max(0, Math.min(1, precision));
          recall = Math.max(0, Math.min(1, recall));
          points.push({ x: recall, y: precision });
        }
        xLabel = 'Recall';
        yLabel = 'Precision';
        var thresholdPoint = {
          x: baseR * thresholdPR + 0.1 * (1 - thresholdPR),
          y: baseP * (1 - thresholdPR * 0.5) + 0.1 * Math.sin(thresholdPR * Math.PI)
        };
        annotations.push({
          x: thresholdPoint.x,
          y: thresholdPoint.y,
          label: 'Threshold=' + thresholdPR
        });
        break;
      }

      case 'roc-threshold': {
        var tpr = values.tpr || 0.8;
        var fpr = values.fpr || 0.1;
        var thresholdROC = values.threshold || 0.5;
        var tsROC = generateLinspace(0, 1, 100);
        for (var ri2 = 0; ri2 < tsROC.length; ri2++) {
          var t2 = tsROC[ri2];
          var currentTPR = tpr * t2;
          var currentFPR = fpr * t2;
          points.push({ x: currentFPR, y: currentTPR });
        }
        points.unshift({ x: 0, y: 0 });
        points.push({ x: 1, y: 1 });
        xLabel = 'False Positive Rate';
        yLabel = 'True Positive Rate';
        annotations.push({
          x: fpr * thresholdROC,
          y: tpr * thresholdROC,
          label: 'Threshold=' + thresholdROC
        });
        break;
      }

      case 'normal-distribution': {
        var mean = values.mean || 0;
        var stdDev = values.stdDev || 1;
        var xsND = generateLinspace(mean - 4 * stdDev, mean + 4 * stdDev, 200);
        for (var ni = 0; ni < xsND.length; ni++) {
          var xv4 = xsND[ni];
          var expArg = -0.5 * Math.pow((xv4 - mean) / stdDev, 2);
          var pdf = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(expArg);
          points.push({ x: xv4, y: pdf });
        }
        yLabel = 'PDF (μ=' + mean + ', σ=' + stdDev + ')';
        break;
      }

      case 'logistic-curve': {
        var L = values.L || 50;
        var k2 = values.k || 0.5;
        var x0LC = values.x0 || 0;
        var xMinLC = values.xMin != null ? values.xMin : -20;
        var xMaxLC = values.xMax != null ? values.xMax : 20;
        var xsLC = generateLinspace(xMinLC, xMaxLC, 200);
        for (var lci = 0; lci < xsLC.length; lci++) {
          var xv5 = xsLC[lci];
          var yLC = L / (1 + Math.exp(-k2 * (xv5 - x0LC)));
          points.push({ x: xv5, y: yLC });
        }
        yLabel = 'P(t) = ' + L + '/(1+e^(-' + k2 + '(t-' + x0LC + ')))';
        break;
      }

      default: {
        var xsDef = generateLinspace(-5, 5, 50);
        for (var di = 0; di < xsDef.length; di++) {
          points.push({ x: xsDef[di], y: xsDef[di] * xsDef[di] });
        }
        break;
      }
    }

    return {
      type: 'line-plot',
      title: title,
      points: points,
      xLabel: xLabel,
      yLabel: yLabel,
      annotations: annotations
    };
  }

  function barChartRenderer(definition, values) {
    var bars = [];
    var title = definition.title;

    switch (definition.id) {
      case 'softmax-distribution': {
        var inputs = [
          values.input1 || 1,
          values.input2 || 2,
          values.input3 || 0.5,
          values.input4 || -1
        ];
        var maxInput = Math.max.apply(null, inputs);
        var expSum = 0;
        var exps = [];
        for (var i = 0; i < inputs.length; i++) {
          var expVal = Math.exp(inputs[i] - maxInput);
          exps.push(expVal);
          expSum += expVal;
        }
        for (var j = 0; j < exps.length; j++) {
          bars.push({
            label: 'x' + (j + 1),
            value: exps[j] / expSum
          });
        }
        break;
      }

      case 'bayes-probability': {
        var prior = values.prior || 0.3;
        var likelihood = values.likelihood || 0.8;
        var falsePos = values.falsePositive || 0.1;
        var pB = likelihood * prior + falsePos * (1 - prior);
        var posterior = pB > 0 ? (likelihood * prior / pB) : 0;
        bars = [
          { label: 'Prior P(H)', value: prior },
          { label: 'P(B|H)', value: likelihood },
          { label: 'P(B|¬H)', value: falsePos },
          { label: 'P(B)', value: pB },
          { label: 'P(H|B)', value: posterior }
        ];
        break;
      }

      case 'binomial-distribution': {
        var n = values.n || 10;
        var p = values.p || 0.5;
        for (var k = 0; k <= n; k++) {
          var logComb = 0;
          for (var ci = 0; ci < k; ci++) {
            logComb += Math.log(n - ci) - Math.log(ci + 1);
          }
          var prob = Math.exp(logComb + k * Math.log(p) + (n - k) * Math.log(1 - p));
          bars.push({
            label: String(k),
            value: prob
          });
        }
        break;
      }

      default: {
        bars = [
          { label: 'A', value: 0.5 },
          { label: 'B', value: 0.3 },
          { label: 'C', value: 0.7 }
        ];
        break;
      }
    }

    return {
      type: 'bar-chart',
      title: title,
      bars: bars,
      xLabel: 'Category',
      yLabel: 'Value'
    };
  }

  function scatterPlotRenderer(definition, values) {
    var points = [];
    var title = definition.title;
    var series = [];

    switch (definition.id) {
      case 'cosine-similarity': {
        var ax = values.ax || 1;
        var ay = values.ay || 2;
        var bx = values.bx || 3;
        var by = values.by || 1;
        var dotProduct = ax * bx + ay * by;
        var magA = Math.sqrt(ax * ax + ay * ay);
        var magB = Math.sqrt(bx * bx + by * by);
        var similarity = (magA > 0 && magB > 0) ? dotProduct / (magA * magB) : 0;

        points = [
          { x: 0, y: 0, label: 'Origin' },
          { x: ax, y: ay, label: 'A(' + ax + ',' + ay + ')' },
          { x: bx, y: by, label: 'B(' + bx + ',' + by + ')' }
        ];

        return {
          type: 'scatter-plot',
          title: title + ' — cos(θ) = ' + similarity.toFixed(4),
          points: points,
          lines: [
            { from: { x: 0, y: 0 }, to: { x: ax, y: ay }, color: '#06b6d4' },
            { from: { x: 0, y: 0 }, to: { x: bx, y: by }, color: '#f59e0b' }
          ],
          xLabel: 'x',
          yLabel: 'y',
          annotations: [
            { x: (ax + bx) / 2, y: (ay + by) / 2, label: 'cos(θ)=' + similarity.toFixed(4) }
          ]
        };
      }

      case 'embedding-space-2d': {
        var clusterCount = values.clusterCount || 3;
        var pointsPerCluster = values.pointsPerCluster || 10;
        var spread = values.spread || 1;
        var allPoints = [];
        var clusterCenters = [];
        var colors = ['#06b6d4', '#f59e0b', '#ef4444', '#22c55e', '#a855f7', '#ec4899'];

        for (var ci = 0; ci < clusterCount; ci++) {
          var cx = deterministicRandom(ci * 100 + 1) * 8 - 4;
          var cy = deterministicRandom(ci * 100 + 2) * 8 - 4;
          clusterCenters.push({ x: cx, y: cy });

          var clusterPoints = generatePoints(pointsPerCluster, cx, cy, spread, ci * 1000);
          for (var pi = 0; pi < clusterPoints.length; pi++) {
            allPoints.push({
              x: clusterPoints[pi].x,
              y: clusterPoints[pi].y,
              cluster: ci,
              color: colors[ci % colors.length]
            });
          }
        }

        return {
          type: 'scatter-plot',
          title: title,
          points: allPoints,
          clusterCenters: clusterCenters,
          colors: colors.slice(0, clusterCount),
          xLabel: 'Dimension 1',
          yLabel: 'Dimension 2',
          annotations: []
        };
      }

      case 'knn-neighborhood': {
        var k = values.k || 3;
        var pointCount = values.pointCount || 20;
        var queryX = values.queryX || 0;
        var queryY = values.queryY || 0;
        var seed = values.seed || 42;

        var allKnnPoints = generatePoints(pointCount, 0, 0, 5, seed);
        var distances = [];

        for (var ki = 0; ki < allKnnPoints.length; ki++) {
          var dx = allKnnPoints[ki].x - queryX;
          var dy = allKnnPoints[ki].y - queryY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          distances.push({
            x: allKnnPoints[ki].x,
            y: allKnnPoints[ki].y,
            distance: dist,
            index: ki
          });
        }

        distances.sort(function (a, b) { return a.distance - b.distance; });

        var neighbors = distances.slice(0, k);
        var neighborIndices = {};
        for (var ni = 0; ni < neighbors.length; ni++) {
          neighborIndices[neighbors[ni].index] = true;
        }

        var knnPoints = [];
        for (var pi2 = 0; pi2 < allKnnPoints.length; pi2++) {
          knnPoints.push({
            x: allKnnPoints[pi2].x,
            y: allKnnPoints[pi2].y,
            isNeighbor: !!neighborIndices[pi2],
            cluster: neighborIndices[pi2] ? 1 : 0
          });
        }
        knnPoints.push({ x: queryX, y: queryY, isQuery: true, cluster: 2 });

        return {
          type: 'scatter-plot',
          title: title + ' — K=' + k,
          points: knnPoints,
          colors: ['rgba(138,180,248,0.3)', '#06b6d4', '#f59e0b'],
          queryPoint: { x: queryX, y: queryY },
          xLabel: 'x',
          yLabel: 'y',
          annotations: []
        };
      }

      case 'decision-boundary': {
        var sep = values.separation || 2;
        var noise = values.noise || 0.5;
        var pointCountDB = values.pointCount || 40;
        var seedDB = values.seed || 42;

        var dbPoints = [];
        var halfCount = Math.floor(pointCountDB / 2);

        for (var di = 0; di < halfCount; di++) {
          var rx1 = deterministicRandom(seedDB + di * 4) * 6 - 3;
          var ry1 = deterministicRandom(seedDB + di * 4 + 1) * 4 + noise * (deterministicRandom(seedDB + di * 4 + 2) - 0.5) * 2;
          dbPoints.push({ x: rx1, y: ry1, cluster: 0 });

          var rx2 = deterministicRandom(seedDB + di * 4 + 1000) * 6 - 3;
          var ry2 = deterministicRandom(seedDB + di * 4 + 1001) * 4 - sep + noise * (deterministicRandom(seedDB + di * 4 + 1002) - 0.5) * 2;
          dbPoints.push({ x: rx2, y: ry2, cluster: 1 });
        }

        return {
          type: 'scatter-plot',
          title: title,
          points: dbPoints,
          colors: ['#06b6d4', '#f59e0b'],
          boundaryLine: { slope: -1 / sep, intercept: 0 },
          xLabel: 'Feature 1',
          yLabel: 'Feature 2',
          annotations: []
        };
      }

      case 'pca-projection': {
        var var1 = values.variance1 || 0.7;
        var var2 = values.variance2 || 0.2;
        var pointCountPCA = values.pointCount || 50;
        var seedPCA = values.seed || 42;

        var pcaPoints = [];
        var totalVariance = var1 + var2;
        var normalizedVar1 = var1 / totalVariance;
        var normalizedVar2 = var2 / totalVariance;

        for (var pai = 0; pai < pointCountPCA; pai++) {
          var pc1 = deterministicRandom(seedPCA + pai * 2) * 2 - 1;
          var pc2 = deterministicRandom(seedPCA + pai * 2 + 1) * 2 - 1;
          var x1 = pc1 * Math.sqrt(normalizedVar1) * 5;
          var y1 = pc2 * Math.sqrt(normalizedVar2) * 5;
          pcaPoints.push({ x: x1, y: y1 });
        }

        return {
          type: 'scatter-plot',
          title: title + ' (' + (normalizedVar1 * 100).toFixed(1) + '% + ' + (normalizedVar2 * 100).toFixed(1) + '% variance)',
          points: pcaPoints,
          colors: ['#06b6d4'],
          xLabel: 'PC1 (' + (normalizedVar1 * 100).toFixed(1) + '%)',
          yLabel: 'PC2 (' + (normalizedVar2 * 100).toFixed(1) + '%)',
          annotations: []
        };
      }

      default: {
        points = generatePoints(20, 0, 0, 3, 42);
        break;
      }
    }

    return {
      type: 'scatter-plot',
      title: title,
      points: points,
      xLabel: 'x',
      yLabel: 'y',
      annotations: []
    };
  }

  function heatmapRenderer(definition, values) {
    var title = definition.title;
    var matrix = [];
    var rowLabels = [];
    var colLabels = [];

    switch (definition.id) {
      case 'attention-head-weights': {
        var tokenCount = values.tokens || 5;
        var headCount = values.headCount || 2;
        var temperature = values.temperature || 1;

        var defaultTokens = ['The', 'cat', 'sat', 'on', 'mat'];
        for (var ti = 0; ti < tokenCount; ti++) {
          rowLabels.push(defaultTokens[ti] || 'T' + (ti + 1));
          colLabels.push(defaultTokens[ti] || 'T' + ti);
        }

        for (var hi = 0; hi < headCount; hi++) {
          var headMatrix = [];
          for (var ri = 0; ri < tokenCount; ri++) {
            var row = [];
            var rowSum = 0;
            var rawRow = [];
            for (var ci = 0; ci < tokenCount; ci++) {
              var raw = deterministicRandom(hi * 1000 + ri * 100 + ci) * temperature;
              rawRow.push(raw);
              rowSum += Math.exp(raw);
            }
            for (var ci2 = 0; ci2 < tokenCount; ci2++) {
              row.push(Math.exp(rawRow[ci2]) / rowSum);
            }
            headMatrix.push(row);
          }
          matrix.push(headMatrix);
        }

        return {
          type: 'heatmap',
          title: title + ' — ' + headCount + ' head(s)',
          matrices: matrix,
          matrixLabels: headCount > 1 ? Array.apply(null, { length: headCount }).map(function (_, i) { return 'Head ' + (i + 1); }) : [],
          rowLabels: rowLabels,
          colLabels: colLabels,
          xLabel: 'Key',
          yLabel: 'Query'
        };
      }

      default:
        matrix = [[0.5, 0.3], [0.2, 0.8]];
        rowLabels = ['A', 'B'];
        colLabels = ['A', 'B'];
        break;
    }

    return {
      type: 'heatmap',
      title: title,
      matrices: [matrix],
      matrixLabels: [],
      rowLabels: rowLabels,
      colLabels: colLabels,
      xLabel: 'Key',
      yLabel: 'Query'
    };
  }

  function matrixRenderer(definition, values) {
    var title = definition.title;
    var data = {};

    switch (definition.id) {
      case 'confusion-matrix': {
        var tp = values.tp || 80;
        var fp = values.fp || 10;
        var fn = values.fn || 5;
        var tn = values.tn || 70;
        var total = tp + fp + fn + tn;
        var accuracy = total > 0 ? (tp + tn) / total : 0;
        var precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
        var recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
        var f1 = (precision + recall) > 0 ? 2 * precision * recall / (precision + recall) : 0;

        return {
          type: 'confusion-matrix',
          title: title,
          matrix: [[tp, fp], [fn, tn]],
          rowLabels: ['Actual Positive', 'Actual Negative'],
          colLabels: ['Predicted Positive', 'Predicted Negative'],
          metrics: {
            accuracy: accuracy,
            precision: precision,
            recall: recall,
            f1Score: f1,
            total: total
          }
        };
      }

      default:
        data = { matrix: [[1, 0], [0, 1]] };
        break;
    }

    return {
      type: 'matrix',
      title: title,
      data: data
    };
  }

  function computeRenderModel(definition, params) {
    if (!definition) return null;

    var engine = window.NeuralVerse && window.NeuralVerse.VizParameterEngine
      ? window.NeuralVerse.VizParameterEngine
      : null;

    var safeParams = params;
    if (engine) {
      safeParams = engine.sanitize(definition.parameterSchema, params);
    }

    switch (definition.renderer) {
      case 'line-plot':
        return linePlotRenderer(definition, safeParams);
      case 'bar-chart':
        return barChartRenderer(definition, safeParams);
      case 'scatter-plot':
        return scatterPlotRenderer(definition, safeParams);
      case 'heatmap':
        return heatmapRenderer(definition, safeParams);
      case 'matrix':
        return matrixRenderer(definition, safeParams);
      default:
        return linePlotRenderer(definition, safeParams);
    }
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.VizEngine = {
    computeRenderModel: computeRenderModel,
    registerRenderer: registerRenderer,
    deterministicRandom: deterministicRandom,
    generateLinspace: generateLinspace,
    generatePoints: generatePoints
  };
})();
