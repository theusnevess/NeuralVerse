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

  function generateClusterData(numPoints, numClusters, spread) {
    var rng = seededRandom(789);
    var centers = [];
    for (var c = 0; c < numClusters; c++) {
      centers.push([
        (rng() - 0.5) * 10,
        (rng() - 0.5) * 10
      ]);
    }
    var points = [];
    for (var i = 0; i < numPoints; i++) {
      var clusterIdx = i % numClusters;
      var cx = centers[clusterIdx][0];
      var cy = centers[clusterIdx][1];
      var angle = rng() * 2 * Math.PI;
      var radius = rng() * spread;
      var x = cx + radius * Math.cos(angle);
      var y = cy + radius * Math.sin(angle);
      points.push([x, y]);
    }
    return points;
  }

  function initializeCentroids(points, numClusters) {
    var rng = seededRandom(456);
    var indices = [];
    for (var i = 0; i < points.length; i++) {
      indices.push(i);
    }
    var selected = [];
    for (var i = 0; i < numClusters && i < indices.length; i++) {
      var j = Math.floor(rng() * indices.length);
      selected.push(indices[j]);
      indices.splice(j, 1);
    }
    var centroids = [];
    for (var i = 0; i < selected.length; i++) {
      centroids.push([points[selected[i]][0], points[selected[i]][1]]);
    }
    return centroids;
  }

  function assignClusters(points, centroids) {
    var assignments = [];
    for (var i = 0; i < points.length; i++) {
      var minDist = Infinity;
      var minIdx = 0;
      for (var c = 0; c < centroids.length; c++) {
        var dx = points[i][0] - centroids[c][0];
        var dy = points[i][1] - centroids[c][1];
        var dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          minIdx = c;
        }
      }
      assignments.push(minIdx);
    }
    return assignments;
  }

  function updateCentroids(points, assignments, numClusters) {
    var sums = [];
    var counts = [];
    for (var c = 0; c < numClusters; c++) {
      sums.push([0, 0]);
      counts.push(0);
    }
    for (var i = 0; i < points.length; i++) {
      var cluster = assignments[i];
      sums[cluster][0] += points[i][0];
      sums[cluster][1] += points[i][1];
      counts[cluster]++;
    }
    var newCentroids = [];
    for (var c = 0; c < numClusters; c++) {
      if (counts[c] > 0) {
        newCentroids.push([
          sums[c][0] / counts[c],
          sums[c][1] / counts[c]
        ]);
      } else {
        newCentroids.push([sums[c][0], sums[c][1]]);
      }
    }
    return newCentroids;
  }

  function computeInertia(points, assignments, centroids) {
    var inertia = 0;
    for (var i = 0; i < points.length; i++) {
      var c = assignments[i];
      var dx = points[i][0] - centroids[c][0];
      var dy = points[i][1] - centroids[c][1];
      inertia += dx * dx + dy * dy;
    }
    return inertia;
  }

  function runKMeans(points, numClusters, maxIterations) {
    var centroids = initializeCentroids(points, numClusters);
    var assignments = [];
    var iterations = 0;

    for (var iter = 0; iter < maxIterations; iter++) {
      var newAssignments = assignClusters(points, centroids);
      iterations++;

      var changed = false;
      if (assignments.length === 0) {
        changed = true;
      } else {
        for (var i = 0; i < newAssignments.length; i++) {
          if (newAssignments[i] !== assignments[i]) {
            changed = true;
            break;
          }
        }
      }

      assignments = newAssignments;

      if (!changed && iter > 0) break;

      centroids = updateCentroids(points, assignments, numClusters);
    }

    var inertia = computeInertia(points, assignments, centroids);

    return {
      assignments: assignments,
      centroids: centroids,
      iterations: iterations,
      inertia: Math.round(inertia * 10000) / 10000
    };
  }

  var labDefinition = {
    id: 'lab-kmeans-clustering',
    slug: 'kmeans-clustering',
    title: 'K-Means Clustering',
    summary: 'Observe how K-Means partitions data into clusters by adjusting the number of clusters and data distribution.',
    category: 'machine-learning',
    artifactReferences: [],
    conceptReferences: ['feature-engineering', 'linear-models'],
    parameterSchema: [
      {
        name: 'numClusters',
        type: 'integer',
        min: 2,
        max: 8,
        step: 1,
        default: 3,
        label: 'Number of Clusters'
      },
      {
        name: 'numPoints',
        type: 'integer',
        min: 10,
        max: 100,
        step: 5,
        default: 30,
        label: 'Number of Points'
      },
      {
        name: 'spread',
        type: 'slider',
        min: 0.5,
        max: 3.0,
        step: 0.1,
        default: 1.0,
        label: 'Cluster Spread'
      }
    ],
    initialState: {
      numClusters: 3,
      numPoints: 30,
      spread: 1.0
    },
    execute: function (params) {
      var numClusters = params.numClusters !== undefined ? params.numClusters : 3;
      var numPoints = params.numPoints !== undefined ? params.numPoints : 30;
      var spread = params.spread !== undefined ? params.spread : 1.0;

      numClusters = Math.round(numClusters);
      numClusters = Math.max(2, Math.min(8, numClusters));
      numPoints = Math.round(numPoints);
      numPoints = Math.max(10, Math.min(100, numPoints));

      var points = generateClusterData(numPoints, numClusters, spread);
      var result = runKMeans(points, numClusters, 100);

      var labeledPoints = [];
      for (var i = 0; i < points.length; i++) {
        labeledPoints.push([
          Math.round(points[i][0] * 10000) / 10000,
          Math.round(points[i][1] * 10000) / 10000,
          result.assignments[i]
        ]);
      }

      var roundedCentroids = [];
      for (var c = 0; c < result.centroids.length; c++) {
        roundedCentroids.push([
          Math.round(result.centroids[c][0] * 10000) / 10000,
          Math.round(result.centroids[c][1] * 10000) / 10000
        ]);
      }

      return {
        points: labeledPoints,
        centroids: roundedCentroids,
        iterations: result.iterations,
        inertia: result.inertia
      };
    },
    visualization: {
      type: 'scatter-plot',
      title: 'K-Means Clustering Result'
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
