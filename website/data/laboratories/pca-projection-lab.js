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

  function generateData2D(numPoints, variance1, variance2, rotation) {
    var rng = seededRandom(321);
    var cosR = Math.cos(rotation);
    var sinR = Math.sin(rotation);
    var points = [];
    for (var i = 0; i < numPoints; i++) {
      var z1 = boxMuller(rng) * Math.sqrt(variance1);
      var z2 = boxMuller(rng) * Math.sqrt(variance2);
      var x = cosR * z1 - sinR * z2;
      var y = sinR * z1 + cosR * z2;
      points.push([x, y]);
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
    return {
      xx: cxx / n,
      xy: cxy / n,
      yy: cyy / n
    };
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
      if (cov.xx >= cov.yy) {
        v1 = [1, 0];
        v2 = [0, 1];
      } else {
        v1 = [0, 1];
        v2 = [1, 0];
      }
    }

    var norm1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    var norm2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
    if (norm1 > 1e-10) {
      v1[0] /= norm1;
      v1[1] /= norm1;
    }
    if (norm2 > 1e-10) {
      v2[0] /= norm2;
      v2[1] /= norm2;
    }

    return {
      eigenvalues: [lambda1, lambda2],
      eigenvectors: [v1, v2]
    };
  }

  function projectData(centered, eigenvectors) {
    var projected = [];
    for (var i = 0; i < centered.length; i++) {
      var pc1 = centered[i][0] * eigenvectors[0][0] + centered[i][1] * eigenvectors[0][1];
      var pc2 = centered[i][0] * eigenvectors[1][0] + centered[i][1] * eigenvectors[1][1];
      projected.push([
        Math.round(pc1 * 10000) / 10000,
        Math.round(pc2 * 10000) / 10000
      ]);
    }
    return projected;
  }

  var labDefinition = {
    id: 'lab-pca-projection',
    slug: 'pca-projection',
    title: 'PCA Projection',
    summary: 'Project high-dimensional data to 2D using Principal Component Analysis and observe variance explained.',
    category: 'dimensionality-reduction',
    artifactReferences: [],
    conceptReferences: ['feature-engineering', 'regularization'],
    parameterSchema: [
      {
        name: 'numPoints',
        type: 'integer',
        min: 20,
        max: 100,
        step: 5,
        default: 40,
        label: 'Number of Points'
      },
      {
        name: 'variance1',
        type: 'slider',
        min: 0.5,
        max: 5.0,
        step: 0.1,
        default: 2.0,
        label: 'Variance (PC1)'
      },
      {
        name: 'variance2',
        type: 'slider',
        min: 0.1,
        max: 3.0,
        step: 0.1,
        default: 0.5,
        label: 'Variance (PC2)'
      },
      {
        name: 'rotation',
        type: 'slider',
        min: 0,
        max: 3.14,
        step: 0.1,
        default: 0.78,
        label: 'Rotation Angle (radians)'
      }
    ],
    initialState: {
      numPoints: 40,
      variance1: 2.0,
      variance2: 0.5,
      rotation: 0.78
    },
    execute: function (params) {
      var numPoints = params.numPoints !== undefined ? params.numPoints : 40;
      var variance1 = params.variance1 !== undefined ? params.variance1 : 2.0;
      var variance2 = params.variance2 !== undefined ? params.variance2 : 0.5;
      var rotation = params.rotation !== undefined ? params.rotation : 0.78;

      numPoints = Math.round(numPoints);
      numPoints = Math.max(20, Math.min(100, numPoints));

      var originalPoints = generateData2D(numPoints, variance1, variance2, rotation);
      var mean = computeMean(originalPoints);
      var centered = centerData(originalPoints, mean);
      var cov = computeCovarianceMatrix(centered);
      var eigen = eigenDecomposition2x2(cov);

      var totalVariance = eigen.eigenvalues[0] + eigen.eigenvalues[1];
      var explainedVariance = [
        Math.round((eigen.eigenvalues[0] / totalVariance) * 10000) / 10000,
        Math.round((eigen.eigenvalues[1] / totalVariance) * 10000) / 10000
      ];

      var projectedPoints = projectData(centered, eigen.eigenvectors);

      var roundedOriginal = [];
      for (var i = 0; i < originalPoints.length; i++) {
        roundedOriginal.push([
          Math.round(originalPoints[i][0] * 10000) / 10000,
          Math.round(originalPoints[i][1] * 10000) / 10000
        ]);
      }

      return {
        projectedPoints: projectedPoints,
        explainedVariance: explainedVariance,
        loadings: [
          [
            Math.round(eigen.eigenvectors[0][0] * 10000) / 10000,
            Math.round(eigen.eigenvectors[0][1] * 10000) / 10000
          ],
          [
            Math.round(eigen.eigenvectors[1][0] * 10000) / 10000,
            Math.round(eigen.eigenvectors[1][1] * 10000) / 10000
          ]
        ],
        originalPoints: roundedOriginal
      };
    },
    visualization: {
      type: 'scatter-plot',
      title: 'PCA Projection'
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
