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
    steps: [
      {
        label: 'Generate Dataset',
        log: 'Generating data points with noise',
        state: function (p) { return { phase: 'dataset' }; },
        metrics: function (p) {
          return { 'Phase': 'Dataset', 'Points': p.numPoints, 'Noise': p.noise, 'Status': 'Ready' };
        },
        viz: function (p) {
          return { dataPoints: generateData(p.slope, p.intercept, p.noise, p.numPoints), fittedLine: null };
        }
      },
      {
        label: 'Compute Statistics',
        log: 'Computing mean and variance',
        state: function (p) { return { phase: 'statistics' }; },
        metrics: function (p) {
          var pts = generateData(p.slope, p.intercept, p.noise, p.numPoints);
          var fit = leastSquaresFit(pts);
          return { 'Phase': 'Statistics', 'Mean X': Math.round(fit.meanX * 100) / 100, 'Mean Y': Math.round(fit.meanY * 100) / 100, 'Status': 'Computing' };
        },
        viz: function (p) {
          return { dataPoints: generateData(p.slope, p.intercept, p.noise, p.numPoints), fittedLine: null };
        }
      },
      {
        label: 'Fit Model',
        log: 'Computing least squares fit',
        state: function (p) { return { phase: 'fitting' }; },
        metrics: function (p) {
          var pts = generateData(p.slope, p.intercept, p.noise, p.numPoints);
          var fit = leastSquaresFit(pts);
          return { 'Phase': 'Fitting', 'Slope': Math.round(fit.slope * 10000) / 10000, 'Intercept': Math.round(fit.intercept * 10000) / 10000, 'Status': 'Fitting' };
        },
        viz: function (p) {
          var pts = generateData(p.slope, p.intercept, p.noise, p.numPoints);
          var fit = leastSquaresFit(pts);
          return { dataPoints: pts, fittedLine: { slope: fit.slope, intercept: fit.intercept } };
        }
      },
      {
        label: 'Compute Residuals',
        log: 'Computing residual sum of squares',
        state: function (p) { return { phase: 'residuals' }; },
        metrics: function (p) {
          var pts = generateData(p.slope, p.intercept, p.noise, p.numPoints);
          var fit = leastSquaresFit(pts);
          return { 'Phase': 'Residuals', 'RSS': Math.round(fit.residualSumOfSquares * 10000) / 10000, 'R²': Math.round(fit.rSquared * 10000) / 10000, 'Status': 'Computing' };
        },
        viz: function (p) {
          var pts = generateData(p.slope, p.intercept, p.noise, p.numPoints);
          var fit = leastSquaresFit(pts);
          return { dataPoints: pts, fittedLine: { slope: fit.slope, intercept: fit.intercept } };
        }
      },
      {
        label: 'Complete',
        log: 'Linear regression complete',
        state: function (p) { return { phase: 'complete' }; },
        metrics: function (p) {
          var pts = generateData(p.slope, p.intercept, p.noise, p.numPoints);
          var fit = leastSquaresFit(pts);
          return { 'R²': Math.round(fit.rSquared * 10000) / 10000, 'Slope': Math.round(fit.slope * 10000) / 10000, 'Intercept': Math.round(fit.intercept * 10000) / 10000, 'Status': 'Complete' };
        },
        viz: function (p) {
          var pts = generateData(p.slope, p.intercept, p.noise, p.numPoints);
          var fit = leastSquaresFit(pts);
          return { dataPoints: pts, fittedLine: { slope: fit.slope, intercept: fit.intercept, rSquared: fit.rSquared } };
        }
      }
    ],
    observations: [
      {
        id: 'regression-fit',
        title: 'Regression Fit',
        purpose: 'How well does the model fit?',
        defaultSize: 'large',
        render: function (container, params) {
          var pts = generateData(params.slope, params.intercept, params.noise, params.numPoints);
          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Regression Fit';
          container.appendChild(title);
          window.NeuralVerse.VisualizationEngine.renderScatterPlot(container, pts, { title: '', line: true });
        }
      },
      {
        id: 'residual-plot',
        title: 'Residual Plot',
        purpose: 'Where are errors?',
        defaultSize: 'small',
        render: function (container, params) {
          var pts = generateData(params.slope, params.intercept, params.noise, params.numPoints);
          var fit = leastSquaresFit(pts);
          var residuals = pts.map(function (p) { return p[1] - (fit.slope * p[0] + fit.intercept); });
          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Residuals';
          container.appendChild(title);
          window.NeuralVerse.VisualizationEngine.renderBarChart(container, residuals, { title: '' });
        }
      },
      {
        id: 'dataset-view',
        title: 'Dataset',
        purpose: 'How does the dataset influence the fit?',
        defaultSize: 'small',
        render: function (container, params) {
          var pts = generateData(params.slope, params.intercept, params.noise, params.numPoints);
          var html = '<h4 class="nv-lab-obs-title">Dataset</h4>';
          html += '<div class="nv-lab-obs-dataset">';
          html += '<div class="nv-lab-obs-ds-stat"><span class="nv-lab-obs-ds-label">Points</span><span class="nv-lab-obs-ds-value">' + pts.length + '</span></div>';
          html += '<div class="nv-lab-obs-ds-stat"><span class="nv-lab-obs-ds-label">Noise</span><span class="nv-lab-obs-ds-value">' + params.noise + '</span></div>';
          var xs = pts.map(function (p) { return p[0]; });
          var ys = pts.map(function (p) { return p[1]; });
          html += '<div class="nv-lab-obs-ds-stat"><span class="nv-lab-obs-ds-label">X range</span><span class="nv-lab-obs-ds-value">' + Math.round(Math.min.apply(null, xs) * 10) / 10 + ' to ' + Math.round(Math.max.apply(null, xs) * 10) / 10 + '</span></div>';
          html += '<div class="nv-lab-obs-ds-stat"><span class="nv-lab-obs-ds-label">Y range</span><span class="nv-lab-obs-ds-value">' + Math.round(Math.min.apply(null, ys) * 10) / 10 + ' to ' + Math.round(Math.max.apply(null, ys) * 10) / 10 + '</span></div>';
          html += '</div>';
          container.innerHTML = html;
        }
      },
      {
        id: 'fit-quality',
        title: 'Fit Quality',
        purpose: 'How good is the fit?',
        defaultSize: 'small',
        render: function (container, params) {
          var pts = generateData(params.slope, params.intercept, params.noise, params.numPoints);
          var fit = leastSquaresFit(pts);
          var r2 = Math.round(fit.rSquared * 10000) / 10000;
          var pct = Math.round(r2 * 100);
          container.innerHTML = '<div class="nv-lab-obs-fit-quality">' +
            '<h4 class="nv-lab-obs-title">Fit Quality</h4>' +
            '<div class="nv-lab-obs-fit-r2">' + r2 + '</div>' +
            '<div class="nv-lab-obs-fit-bar"><div class="nv-lab-obs-fit-fill" style="width:' + pct + '%"></div></div>' +
            '<span class="nv-lab-obs-fit-label">R² = ' + r2 + '</span></div>';
        }
      }
    ],
    inspector: {
      title: 'Linear Regression State',
      sections: [
        {
          label: 'Fitted Model',
          cards: [
            { key: 'fittedSlope', label: 'Slope', unit: '', interpretation: function (v) { return 'Rate of change per unit X'; } },
            { key: 'fittedIntercept', label: 'Intercept', unit: '', interpretation: function (v) { return 'Value when X = 0'; } },
            { key: 'rSquared', label: 'R²', unit: '', interpretation: function (v) { return v > 0.9 ? 'Excellent fit' : v > 0.7 ? 'Good fit' : v > 0.5 ? 'Moderate fit' : 'Poor fit'; } }
          ]
        },
        {
          label: 'Data Statistics',
          cards: [
            { key: 'meanX', label: 'Mean X', unit: '' },
            { key: 'meanY', label: 'Mean Y', unit: '' },
            { key: 'rss', label: 'Residual Sum', unit: '', interpretation: function (v) { return v < 1 ? 'Low residuals' : 'High residuals'; } }
          ]
        },
        {
          label: 'Phase',
          cards: [
            { key: 'phase', label: 'Current Phase', unit: '' },
            { key: 'dataPoints', label: 'Data Points', unit: '' },
            { key: 'noiseLevel', label: 'Noise Level', unit: '' }
          ]
        }
      ],
      computeState: function (params, stepIndex) {
        var pts = generateData(params.slope, params.intercept, params.noise, params.numPoints);
        var fit = leastSquaresFit(pts);
        var phases = ['Dataset', 'Statistics', 'Fitting', 'Residuals', 'Complete'];
        return {
          fittedSlope: Math.round(fit.slope * 10000) / 10000,
          fittedIntercept: Math.round(fit.intercept * 10000) / 10000,
          rSquared: Math.round(fit.rSquared * 10000) / 10000,
          meanX: Math.round(fit.meanX * 100) / 100,
          meanY: Math.round(fit.meanY * 100) / 100,
          rss: Math.round(fit.residualSumOfSquares * 100) / 100,
          phase: phases[Math.min(stepIndex, phases.length - 1)],
          dataPoints: params.numPoints,
          noiseLevel: params.noise
        };
      },
      changeDetector: function (prev, curr) {
        var changes = [];
        if (prev && curr) {
          if (prev.fittedSlope !== curr.fittedSlope) changes.push({ from: 'fittedSlope', to: 'rSquared', label: 'Slope updated → Fit quality changed' });
          if (prev.rSquared !== curr.rSquared) changes.push({ from: 'rSquared', to: null, label: curr.rSquared > (prev.rSquared || 0) ? 'Fit improved' : 'Fit quality changed' });
        }
        return changes;
      }
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
