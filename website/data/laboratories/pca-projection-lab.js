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

  function boxMuller(rng) {
    var u1 = rng();
    var u2 = rng();
    return Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
  }

  function generateData2D(numPoints, variance1, variance2, rotation, seed) {
    var rng = seededRandom(seed || 321);
    var cosR = Math.cos(rotation);
    var sinR = Math.sin(rotation);
    var points = [];
    for (var i = 0; i < numPoints; i++) {
      var z1 = boxMuller(rng) * Math.sqrt(variance1);
      var z2 = boxMuller(rng) * Math.sqrt(variance2);
      var x = cosR * z1 - sinR * z2;
      var y = sinR * z1 + cosR * z2;
      points.push([Math.round(x * 10000) / 10000, Math.round(y * 10000) / 10000]);
    }
    return points;
  }

  function computeMean(points) {
    var sumX = 0, sumY = 0;
    for (var i = 0; i < points.length; i++) {
      sumX += points[i][0];
      sumY += points[i][1];
    }
    return [sumX / points.length, sumY / points.length];
  }

  function centerData(points, mean) {
    var centered = [];
    for (var i = 0; i < points.length; i++) {
      centered.push([points[i][0] - mean[0], points[i][1] - mean[1]]);
    }
    return centered;
  }

  function computeCovarianceMatrix(centered) {
    var n = centered.length;
    var cxx = 0, cxy = 0, cyy = 0;
    for (var i = 0; i < n; i++) {
      cxx += centered[i][0] * centered[i][0];
      cxy += centered[i][0] * centered[i][1];
      cyy += centered[i][1] * centered[i][1];
    }
    return { xx: cxx / n, xy: cxy / n, yy: cyy / n };
  }

  function eigenDecomposition2x2(cov) {
    var trace = cov.xx + cov.yy;
    var det = cov.xx * cov.yy - cov.xy * cov.xy;
    var disc = Math.sqrt(Math.max(0, trace * trace / 4 - det));
    var lambda1 = trace / 2 + disc;
    var lambda2 = trace / 2 - disc;

    var v1, v2;
    if (Math.abs(cov.xy) > 1e-10) {
      v1 = [cov.xy, lambda1 - cov.xx];
      v2 = [cov.xy, lambda2 - cov.xx];
    } else {
      if (cov.xx >= cov.yy) { v1 = [1, 0]; v2 = [0, 1]; }
      else { v1 = [0, 1]; v2 = [1, 0]; }
    }

    var norm1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    var norm2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
    if (norm1 > 1e-10) { v1[0] /= norm1; v1[1] /= norm1; }
    if (norm2 > 1e-10) { v2[0] /= norm2; v2[1] /= norm2; }

    if (lambda1 < lambda2) {
      var tempL = lambda1; lambda1 = lambda2; lambda2 = tempL;
      var tempV = v1; v1 = v2; v2 = tempV;
    }

    return { eigenvalues: [lambda1, lambda2], eigenvectors: [v1, v2] };
  }

  function projectData(centered, eigenvectors) {
    var projected = [];
    for (var i = 0; i < centered.length; i++) {
      var pc1 = centered[i][0] * eigenvectors[0][0] + centered[i][1] * eigenvectors[0][1];
      var pc2 = centered[i][0] * eigenvectors[1][0] + centered[i][1] * eigenvectors[1][1];
      projected.push([Math.round(pc1 * 10000) / 10000, Math.round(pc2 * 10000) / 10000]);
    }
    return projected;
  }

  function runPCA(params) {
    var numPoints = Math.max(20, Math.min(100, Math.round(params.numPoints || 40)));
    var v1 = params.variance1 !== undefined ? params.variance1 : 2.0;
    var v2 = params.variance2 !== undefined ? params.variance2 : 0.5;
    var rot = params.rotation !== undefined ? params.rotation : 0.78;
    var seed = params.seed !== undefined ? params.seed : 321;

    var points = generateData2D(numPoints, v1, v2, rot, seed);
    var mean = computeMean(points);
    var centered = centerData(points, mean);
    var cov = computeCovarianceMatrix(centered);
    var eigen = eigenDecomposition2x2(cov);
    var projected = projectData(centered, eigen.eigenvectors);
    var totalVar = eigen.eigenvalues[0] + eigen.eigenvalues[1];
    var explained = [
      Math.round((eigen.eigenvalues[0] / totalVar) * 10000) / 10000,
      Math.round((eigen.eigenvalues[1] / totalVar) * 10000) / 10000
    ];

    return { points: points, mean: mean, centered: centered, cov: cov, eigen: eigen, projected: projected, explained: explained };
  }

  function buildSteps(params) {
    var steps = [];
    var p = runPCA(params);

    steps.push({
      label: 'Generate Dataset',
      log: 'Generated ' + p.points.length + ' correlated data points with specified variance structure',
      state: function () { return { points: p.points, phase: 'generate' }; },
      metrics: function () { return { 'Samples': p.points.length, 'Phase': 'Generate', 'Status': 'Ready' }; },
      viz: function () { return { points: p.points, phase: 'generate' }; }
    });

    steps.push({
      label: 'Center Data',
      log: 'Centered data by subtracting mean vector',
      state: function () { return { mean: p.mean, centered: p.centered, phase: 'center' }; },
      metrics: function () { return { 'Mean X': p.mean[0].toFixed(3), 'Mean Y': p.mean[1].toFixed(3), 'Phase': 'Center', 'Status': 'Computed' }; },
      viz: function () { return { points: p.points, mean: p.mean, centered: p.centered, phase: 'center' }; }
    });

    steps.push({
      label: 'Covariance Matrix',
      log: 'Computed sample covariance matrix',
      state: function () { return { cov: p.cov, phase: 'covariance' }; },
      metrics: function () { return { 'Cov(X,X)': p.cov.xx.toFixed(3), 'Cov(X,Y)': p.cov.xy.toFixed(3), 'Cov(Y,Y)': p.cov.yy.toFixed(3), 'Phase': 'Covariance' }; },
      viz: function () { return { centered: p.centered, cov: p.cov, phase: 'covariance' }; }
    });

    steps.push({
      label: 'Eigenvalues',
      log: 'Eigen decomposition: λ₁ captures most variance',
      state: function () { return { eigenvalues: p.eigen.eigenvalues, phase: 'eigenvalues' }; },
      metrics: function () { return { 'λ₁': p.eigen.eigenvalues[0].toFixed(3), 'λ₂': p.eigen.eigenvalues[1].toFixed(3), 'Phase': 'Eigenvalues' }; },
      viz: function () { return { centered: p.centered, eigenvalues: p.eigen.eigenvalues, phase: 'eigenvalues' }; }
    });

    steps.push({
      label: 'Eigenvectors',
      log: 'Principal components computed: PC1 and PC2 are orthogonal',
      state: function () { return { eigenvectors: p.eigen.eigenvectors, phase: 'eigenvectors' }; },
      metrics: function () { return { 'PC1': '[' + p.eigen.eigenvectors[0].map(function (v) { return v.toFixed(2); }).join(', ') + ']', 'PC2': '[' + p.eigen.eigenvectors[1].map(function (v) { return v.toFixed(2); }).join(', ') + ']', 'Phase': 'Eigenvectors' }; },
      viz: function () { return { centered: p.centered, eigenvectors: p.eigen.eigenvectors, phase: 'eigenvectors' }; }
    });

    steps.push({
      label: 'Project Data',
      log: 'Projected data onto principal component basis',
      state: function () { return { projected: p.projected, phase: 'project' }; },
      metrics: function () { return { 'Projected': p.projected.length + ' points', 'Phase': 'Project', 'Status': 'Computed' }; },
      viz: function () { return { centered: p.centered, projected: p.projected, eigenvectors: p.eigen.eigenvectors, phase: 'project' }; }
    });

    steps.push({
      label: 'Explained Variance',
      log: 'Explained variance: PC1 captures ' + (p.explained[0] * 100).toFixed(1) + '%, PC2 captures ' + (p.explained[1] * 100).toFixed(1) + '%',
      state: function () { return { explained: p.explained, phase: 'variance' }; },
      metrics: function () { return { 'PC1': (p.explained[0] * 100).toFixed(1) + '%', 'PC2': (p.explained[1] * 100).toFixed(1) + '%', 'Phase': 'Variance', 'Status': 'Complete' }; },
      viz: function () { return { projected: p.projected, explained: p.explained, eigenvectors: p.eigen.eigenvectors, phase: 'variance' }; }
    });

    steps.push({
      label: 'Analyze',
      log: 'PCA complete. Total variance: ' + (p.eigen.eigenvalues[0] + p.eigen.eigenvalues[1]).toFixed(3),
      state: function () { return { explained: p.explained, eigenvalues: p.eigen.eigenvalues, phase: 'analyze' }; },
      metrics: function () { return { 'Total Var': (p.eigen.eigenvalues[0] + p.eigen.eigenvalues[1]).toFixed(3), 'Phase': 'Analyze', 'Status': 'Done' }; },
      viz: function () { return { projected: p.projected, explained: p.explained, eigenvectors: p.eigen.eigenvectors, phase: 'analyze' }; }
    });

    steps.push({
      label: 'Complete',
      log: 'PCA complete: data transformed to principal component space',
      state: function () { return { explained: p.explained, phase: 'finished' }; },
      metrics: function () { return { 'Phase': 'Complete', 'Status': 'Done' }; },
      viz: function () { return { projected: p.projected, explained: p.explained, eigenvectors: p.eigen.eigenvectors, phase: 'finished' }; }
    });

    return steps;
  }

  var labDefinition = {
    id: 'lab-pca-projection',
    slug: 'pca-projection',
    aliases: ['pca', 'pca-projection-lab'],
    title: 'PCA — Principal Component Analysis',
    summary: 'Discover the directions of maximum variance in data by watching PCA compute covariance, eigen decomposition, and projection step by step.',
    category: 'dimensionality-reduction',
    artifactReferences: [],
    conceptReferences: ['feature-engineering', 'regularization'],
    parameterSchema: [
      { name: 'numPoints', type: 'integer', min: 20, max: 100, step: 5, default: 50, label: 'Sample Count' },
      { name: 'variance1', type: 'slider', min: 0.5, max: 5.0, step: 0.1, default: 3.0, label: 'Variance (Major Axis)' },
      { name: 'variance2', type: 'slider', min: 0.1, max: 3.0, step: 0.1, default: 0.5, label: 'Variance (Minor Axis)' },
      { name: 'rotation', type: 'slider', min: 0, max: 3.14, step: 0.1, default: 0.78, label: 'Data Rotation (rad)' }
    ],
    initialState: { numPoints: 50, variance1: 3.0, variance2: 0.5, rotation: 0.78 },
    steps: (function () {
      return buildSteps({ numPoints: 50, variance1: 3.0, variance2: 0.5, rotation: 0.78 });
    })(),
    inspector: {
      title: 'PCA State',
      sections: [
        {
          label: 'Data Properties',
          cards: [
            { key: 'samples', label: 'Sample Count', interpretation: function (v) { return v + ' data points'; } },
            { key: 'meanX', label: 'Mean X', interpretation: function (v) { return 'Dataset centroid'; } },
            { key: 'meanY', label: 'Mean Y', interpretation: function (v) { return 'Dataset centroid'; } },
            { key: 'correlation', label: 'Correlation Coefficient', interpretation: function (v) { return Math.abs(v) > 0.7 ? 'Strong correlation' : Math.abs(v) > 0.3 ? 'Moderate correlation' : 'Weak correlation'; } }
          ]
        },
        {
          label: 'Covariance Structure',
          cards: [
            { key: 'cxx', label: 'Var(X)', interpretation: function (v) { return 'Variance of X'; } },
            { key: 'cxy', label: 'Cov(X,Y)', interpretation: function (v) { return Math.abs(v) > 0.5 ? 'Strong joint movement' : 'Weak joint movement'; } },
            { key: 'cyy', label: 'Var(Y)', interpretation: function (v) { return 'Variance of Y'; } },
            { key: 'determinant', label: 'Determinant', interpretation: function (v) { return v > 0 ? 'Positive definite — valid covariance' : 'Near-singular'; } }
          ]
        },
        {
          label: 'Principal Components',
          cards: [
            { key: 'lambda1', label: 'Eigenvalue λ₁', interpretation: function (v) { return 'PC1 captures most variance'; } },
            { key: 'lambda2', label: 'Eigenvalue λ₂', interpretation: function (v) { return 'PC2 captures remaining variance'; } },
            { key: 'explained1', label: 'Explained Variance PC1', interpretation: function (v) { return v > 0.8 ? 'Dominant component' : v > 0.6 ? 'Majority of variance' : 'Shared variance'; } },
            { key: 'explained2', label: 'Explained Variance PC2', interpretation: function (v) { return 'Remaining information'; } }
          ]
        }
      ],
      computeState: function (params) {
        var p = runPCA(params);
        var corr = Math.sqrt(p.cov.xx * p.cov.yy) > 0 ? p.cov.xy / Math.sqrt(p.cov.xx * p.cov.yy) : 0;
        var det = p.cov.xx * p.cov.yy - p.cov.xy * p.cov.xy;
        return {
          samples: p.points.length, meanX: p.mean[0].toFixed(3), meanY: p.mean[1].toFixed(3),
          correlation: Math.round(corr * 10000) / 10000,
          cxx: p.cov.xx.toFixed(3), cxy: p.cov.xy.toFixed(3), cyy: p.cov.yy.toFixed(3),
          determinant: Math.round(det * 10000) / 10000,
          lambda1: p.eigen.eigenvalues[0].toFixed(3), lambda2: p.eigen.eigenvalues[1].toFixed(3),
          explained1: (p.explained[0] * 100).toFixed(1) + '%', explained2: (p.explained[1] * 100).toFixed(1) + '%'
        };
      },
      changeDetector: function (prev, curr) {
        var changes = [];
        if (prev && curr) {
          if (prev.explained1 !== curr.explained1) changes.push({ from: 'explained1', to: null, label: 'PC1 variance: ' + curr.explained1 });
          if (prev.correlation !== curr.correlation) changes.push({ from: 'correlation', to: null, label: 'Correlation: ' + curr.correlation });
        }
        return changes;
      }
    },
    observations: [
      {
        id: 'original-dataset',
        title: 'Original Dataset',
        purpose: 'What structure exists before PCA?',
        defaultSize: 'large',
        render: function (container, params) {
          var p = runPCA(params);
          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Original Dataset';
          container.appendChild(title);

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 400 300');
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', 'Original scatter plot');
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxHeight = '250px';

          var allX = p.points.map(function (pt) { return pt[0]; });
          var allY = p.points.map(function (pt) { return pt[1]; });
          var minX = Math.min.apply(null, allX) - 0.5;
          var maxX = Math.max.apply(null, allX) + 0.5;
          var minY = Math.min.apply(null, allY) - 0.5;
          var maxY = Math.max.apply(null, allY) + 0.5;
          var rangeX = maxX - minX || 1;
          var rangeY = maxY - minY || 1;

          // Centroid
          var cx = 40 + ((p.mean[0] - minX) / rangeX) * 320;
          var cy = 10 + ((p.mean[1] - minY) / rangeY) * 260;
          var centroid = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          centroid.setAttribute('cx', cx); centroid.setAttribute('cy', cy);
          centroid.setAttribute('r', '4'); centroid.setAttribute('fill', '#f59e0b');
          centroid.setAttribute('stroke', '#fff'); centroid.setAttribute('stroke-width', '1.5');
          svg.appendChild(centroid);

          p.points.forEach(function (pt) {
            var sx = 40 + ((pt[0] - minX) / rangeX) * 320;
            var sy = 10 + ((pt[1] - minY) / rangeY) * 260;
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', sx); circle.setAttribute('cy', sy);
            circle.setAttribute('r', '3'); circle.setAttribute('fill', '#06b6d4');
            circle.setAttribute('opacity', '0.6');
            svg.appendChild(circle);
          });

          container.appendChild(svg);
        },
        interpretation: function (params, stepIndex) { return 'The original data shows correlations that PCA will decompose into principal components.'; }
      },
      {
        id: 'covariance-pcs',
        title: 'Covariance & PCs',
        purpose: 'What directions maximize variance?',
        defaultSize: 'small',
        render: function (container, params) {
          var p = runPCA(params);
          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Principal Components';
          container.appendChild(title);

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 400 300');
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', 'Principal component directions');
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxHeight = '250px';

          var allX = p.points.map(function (pt) { return pt[0]; });
          var allY = p.points.map(function (pt) { return pt[1]; });
          var minX = Math.min.apply(null, allX) - 1;
          var maxX = Math.max.apply(null, allX) + 1;
          var minY = Math.min.apply(null, allY) - 1;
          var maxY = Math.max.apply(null, allY) + 1;
          var rangeX = maxX - minX || 1;
          var rangeY = maxY - minY || 1;
          var scale = Math.min(320 / rangeX, 260 / rangeY) * 0.8;

          var cx = 200;
          var cy = 150;

          // PC1 arrow
          var pc1x = p.eigen.eigenvectors[0][0] * scale * 2;
          var pc1y = -p.eigen.eigenvectors[0][1] * scale * 2;
          var line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line1.setAttribute('x1', cx - pc1x); line1.setAttribute('y1', cy - pc1y);
          line1.setAttribute('x2', cx + pc1x); line1.setAttribute('y2', cy + pc1y);
          line1.setAttribute('stroke', '#06b6d4'); line1.setAttribute('stroke-width', '2');
          svg.appendChild(line1);

          // PC2 arrow
          var pc2x = p.eigen.eigenvectors[1][0] * scale * 1.5;
          var pc2y = -p.eigen.eigenvectors[1][1] * scale * 1.5;
          var line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line2.setAttribute('x1', cx - pc2x); line2.setAttribute('y1', cy - pc2y);
          line2.setAttribute('x2', cx + pc2x); line2.setAttribute('y2', cy + pc2y);
          line2.setAttribute('stroke', '#f59e0b'); line2.setAttribute('stroke-width', '2');
          line2.setAttribute('stroke-dasharray', '4 2');
          svg.appendChild(line2);

          // Points
          p.points.forEach(function (pt) {
            var sx = cx + (pt[0] - p.mean[0]) * scale;
            var sy = cy - (pt[1] - p.mean[1]) * scale;
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', sx); circle.setAttribute('cy', sy);
            circle.setAttribute('r', '2.5'); circle.setAttribute('fill', '#06b6d4');
            circle.setAttribute('opacity', '0.4');
            svg.appendChild(circle);
          });

          // Labels
          var lbl1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          lbl1.setAttribute('x', cx + pc1x + 5); lbl1.setAttribute('y', cy + pc1y);
          lbl1.setAttribute('fill', '#06b6d4'); lbl1.setAttribute('font-size', '10');
          lbl1.textContent = 'PC1';
          svg.appendChild(lbl1);

          var lbl2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          lbl2.setAttribute('x', cx + pc2x + 5); lbl2.setAttribute('y', cy + pc2y);
          lbl2.setAttribute('fill', '#f59e0b'); lbl2.setAttribute('font-size', '10');
          lbl2.textContent = 'PC2';
          svg.appendChild(lbl2);

          container.appendChild(svg);
        },
        interpretation: function (params, stepIndex) { return 'Principal components point in the directions of maximum variance in the data.'; }
      },
      {
        id: 'projected-dataset',
        title: 'Projected Dataset',
        purpose: 'What changes after projection?',
        defaultSize: 'small',
        render: function (container, params) {
          var p = runPCA(params);
          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Projected Coordinates';
          container.appendChild(title);

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 400 300');
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', 'Projected scatter plot');
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxHeight = '250px';

          var allX = p.projected.map(function (pt) { return pt[0]; });
          var allY = p.projected.map(function (pt) { return pt[1]; });
          var minX = Math.min.apply(null, allX) - 0.5;
          var maxX = Math.max.apply(null, allX) + 0.5;
          var minY = Math.min.apply(null, allY) - 0.5;
          var maxY = Math.max.apply(null, allY) + 0.5;
          var rangeX = maxX - minX || 1;
          var rangeY = maxY - minY || 1;

          p.projected.forEach(function (pt) {
            var sx = 40 + ((pt[0] - minX) / rangeX) * 320;
            var sy = 10 + ((pt[1] - minY) / rangeY) * 260;
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', sx); circle.setAttribute('cy', sy);
            circle.setAttribute('r', '3'); circle.setAttribute('fill', '#10b981');
            circle.setAttribute('opacity', '0.6');
            svg.appendChild(circle);
          });

          // Axes
          var xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          xAxis.setAttribute('x1', 40); xAxis.setAttribute('y1', 270);
          xAxis.setAttribute('x2', 360); xAxis.setAttribute('y2', 270);
          xAxis.setAttribute('stroke', 'rgba(138,180,248,0.2)'); xAxis.setAttribute('stroke-width', '1');
          svg.appendChild(xAxis);

          var lblPC1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          lblPC1.setAttribute('x', 200); lblPC1.setAttribute('y', 295);
          lblPC1.setAttribute('fill', 'rgba(138,180,248,0.5)'); lblPC1.setAttribute('font-size', '10');
          lblPC1.setAttribute('text-anchor', 'middle'); lblPC1.textContent = 'PC1';
          svg.appendChild(lblPC1);

          container.appendChild(svg);
        },
        interpretation: function (params, stepIndex) { return 'Projected data reveals the structure captured by the principal components.'; }
      },
      {
        id: 'explained-variance',
        title: 'Explained Variance',
        purpose: 'How much information is preserved?',
        defaultSize: 'small',
        render: function (container, params) {
          var p = runPCA(params);
          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Explained Variance';
          container.appendChild(title);

          var pct1 = Math.round(p.explained[0] * 100);
          var pct2 = Math.round(p.explained[1] * 100);

          var html = '<div class="nv-lab-obs-variance">';
          html += '<div class="nv-lab-obs-var-row"><span class="nv-lab-obs-var-label">PC1</span>';
          html += '<div class="nv-lab-obs-var-bar"><div class="nv-lab-obs-var-fill" style="width:' + pct1 + '%"></div></div>';
          html += '<span class="nv-lab-obs-var-pct">' + pct1 + '%</span></div>';
          html += '<div class="nv-lab-obs-var-row"><span class="nv-lab-obs-var-label">PC2</span>';
          html += '<div class="nv-lab-obs-var-bar"><div class="nv-lab-obs-var-fill nv-lab-obs-var-fill--secondary" style="width:' + pct2 + '%"></div></div>';
          html += '<span class="nv-lab-obs-var-pct">' + pct2 + '%</span></div>';
          html += '<div class="nv-lab-obs-var-total">Total: ' + (pct1 + pct2) + '%</div>';
          html += '</div>';
          container.innerHTML = html;
        },
        interpretation: function (params, stepIndex) { return 'Explained variance shows how much information each component preserves.'; }
      }
    ],
    renderPreparation: function (container, params) {
      var p = runPCA(params);
      container.innerHTML = '';
      var title = document.createElement('h4');
      title.className = 'nv-lab-obs-title';
      title.textContent = 'Original Data Distribution';
      container.appendChild(title);

      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 400 300');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'Original data scatter plot with centroid');
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxHeight = '250px';

      var allX = p.points.map(function (pt) { return pt[0]; });
      var allY = p.points.map(function (pt) { return pt[1]; });
      var minX = Math.min.apply(null, allX) - 0.5;
      var maxX = Math.max.apply(null, allX) + 0.5;
      var minY = Math.min.apply(null, allY) - 0.5;
      var maxY = Math.max.apply(null, allY) + 0.5;
      var rangeX = maxX - minX || 1;
      var rangeY = maxY - minY || 1;

      p.points.forEach(function (pt) {
        var sx = 40 + ((pt[0] - minX) / rangeX) * 320;
        var sy = 10 + ((pt[1] - minY) / rangeY) * 260;
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', sx); circle.setAttribute('cy', sy);
        circle.setAttribute('r', '3'); circle.setAttribute('fill', '#06b6d4');
        circle.setAttribute('opacity', '0.6');
        svg.appendChild(circle);
      });

      var cx = 40 + ((p.mean[0] - minX) / rangeX) * 320;
      var cy = 10 + ((p.mean[1] - minY) / rangeY) * 260;
      var centroid = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      centroid.setAttribute('cx', cx); centroid.setAttribute('cy', cy);
      centroid.setAttribute('r', '5'); centroid.setAttribute('fill', '#f59e0b');
      centroid.setAttribute('stroke', '#fff'); centroid.setAttribute('stroke-width', '1.5');
      svg.appendChild(centroid);

      var centroidLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      centroidLabel.setAttribute('x', cx + 8); centroidLabel.setAttribute('y', cy + 3);
      centroidLabel.setAttribute('fill', '#f59e0b'); centroidLabel.setAttribute('font-size', '10');
      centroidLabel.textContent = 'Centroid';
      svg.appendChild(centroidLabel);

      container.appendChild(svg);
    },
    getPreparationTelemetry: function (params) {
      var p = runPCA(params);
      return [
        { key: 'dimensions', label: 'Original Dimensions', value: '2' },
        { key: 'samples', label: 'Sample Count', value: String(p.points.length) },
        { key: 'explainedVariance', label: 'Explained Variance', value: (p.explained[0] * 100).toFixed(1) + '% / ' + (p.explained[1] * 100).toFixed(1) + '%' },
        { key: 'status', label: 'Status', value: 'Ready' }
      ];
    },
    getCompletionSummary: function (result, params) {
      if (!result) return [];
      var explained = result.explainedVariance || [0, 0];
      var total = explained[0] + explained[1];
      return [
        { label: 'PC1 Variance', value: (explained[0] * 100).toFixed(1) + '%' },
        { label: 'PC2 Variance', value: (explained[1] * 100).toFixed(1) + '%' },
        { label: 'Total Variance', value: (total * 100).toFixed(1) + '%' },
        { label: 'Status', value: 'Complete' }
      ];
    },
    xai: {
      categories: ['Representation', 'Statistical Structure', 'Geometry'],
      crossLabConnections: [
        { trigger: 'highVariance', target: 'embedding-similarity', text: 'Explore how embeddings capture variance in high-dimensional spaces.', suggestCategory: 'Representation' },
        { trigger: 'lowVariance', target: 'linear-regression', text: 'Check if linear regression benefits from dimensionality reduction.', suggestCategory: 'Statistical Structure' }
      ]
    },
    execute: function (params) {
      var p = runPCA(params);
      return {
        projectedPoints: p.projected,
        explainedVariance: p.explained,
        loadings: p.eigen.eigenvectors.map(function (v) {
          return [Math.round(v[0] * 10000) / 10000, Math.round(v[1] * 10000) / 10000];
        }),
        originalPoints: p.points,
        covarianceMatrix: [[p.cov.xx, p.cov.xy], [p.cov.xy, p.cov.yy]],
        eigenvalues: p.eigen.eigenvalues
      };
    },
    visualization: { type: 'scatter-plot', title: 'PCA Projection' },
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
