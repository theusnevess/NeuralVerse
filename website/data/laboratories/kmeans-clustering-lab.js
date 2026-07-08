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

  function generateClusterData(numPoints, numClusters, spread, seed) {
    var rng = seededRandom(seed || 789);
    var centers = [];
    for (var c = 0; c < numClusters; c++) {
      centers.push([
        (rng() - 0.5) * 10,
        (rng() - 0.5) * 10
      ]);
    }
    var points = [];
    for (var i = 0; i < numPoints; i++) {
      var clusterIdx = Math.floor(rng() * numClusters);
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

  function initializeCentroids(points, numClusters, seed) {
    var rng = seededRandom(seed || 456);
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
        var maxDist = -1;
        var farthest = 0;
        for (var i = 0; i < points.length; i++) {
          var minC = 0;
          var minD = Infinity;
          for (var cc = 0; cc < numClusters; cc++) {
            if (counts[cc] === 0) continue;
            var dx2 = points[i][0] - (sums[cc][0] / Math.max(counts[cc], 1));
            var dy2 = points[i][1] - (sums[cc][1] / Math.max(counts[cc], 1));
            var d2 = dx2 * dx2 + dy2 * dy2;
            if (d2 < minD) { minD = d2; minC = cc; }
          }
          if (minD > maxDist) { maxDist = minD; farthest = i; }
        }
        newCentroids.push([points[farthest][0], points[farthest][1]]);
      }
    }
    return { centroids: newCentroids, counts: counts };
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

  function computeCentroidShift(oldCentroids, newCentroids) {
    var totalShift = 0;
    for (var c = 0; c < oldCentroids.length; c++) {
      var dx = newCentroids[c][0] - oldCentroids[c][0];
      var dy = newCentroids[c][1] - oldCentroids[c][1];
      totalShift += Math.sqrt(dx * dx + dy * dy);
    }
    return totalShift;
  }

  function buildSteps(points, numClusters, maxIterations) {
    var steps = [];
    var centroids = initializeCentroids(points, numClusters, 456);
    var assignments = [];
    var prevInertia = Infinity;
    var centroidHistory = [centroids.map(function (c) { return [c[0], c[1]]; })];

    steps.push({
      label: 'Initialize Centroids',
      log: 'Randomly initialized ' + numClusters + ' centroids',
      state: function (p) {
        return { centroids: centroids, assignments: [], iteration: 0, phase: 'initialize' };
      },
      metrics: function () {
        return { 'Iteration': 0, 'Phase': 'Initialize', 'Centroids': numClusters, 'Status': 'Starting' };
      },
      viz: function () {
        return { points: points, centroids: centroids, assignments: [], centroidHistory: centroidHistory };
      }
    });

    for (var iter = 0; iter < maxIterations; iter++) {
      (function (iterIdx, centRef, assignRef, prevInertiaRef, histRef) {
        steps.push({
          label: 'Iteration ' + (iterIdx + 1) + ' — Assign',
          log: 'Assigning points to nearest centroids',
          state: function (p) {
            var newAssign = assignClusters(points, centRef);
            return { centroids: centRef, assignments: newAssign, iteration: iterIdx + 1, phase: 'assign' };
          },
          metrics: function () {
            var newAssign = assignClusters(points, centRef);
            var sizes = [];
            for (var c = 0; c < numClusters; c++) {
              var count = 0;
              for (var i = 0; i < newAssign.length; i++) {
                if (newAssign[i] === c) count++;
              }
              sizes.push(count);
            }
            var reassigned = 0;
            if (assignRef.length > 0) {
              for (var i = 0; i < newAssign.length; i++) {
                if (newAssign[i] !== assignRef[i]) reassigned++;
              }
            }
            return { 'Iteration': iterIdx + 1, 'Phase': 'Assign', 'Reassigned': reassigned, 'Status': 'Running' };
          },
          viz: function () {
            var newAssign = assignClusters(points, centRef);
            return { points: points, centroids: centRef, assignments: newAssign, centroidHistory: histRef };
          }
        });

        steps.push({
          label: 'Iteration ' + (iterIdx + 1) + ' — Update',
          log: 'Updating centroid positions',
          state: function (p) {
            var newAssign = assignClusters(points, centRef);
            var updateResult = updateCentroids(points, newAssign, numClusters);
            var newCentroids = updateResult.centroids;
            var newInertia = computeInertia(points, newAssign, newCentroids);
            return { centroids: newCentroids, assignments: newAssign, iteration: iterIdx + 1, phase: 'update', inertia: newInertia };
          },
          metrics: function () {
            var newAssign = assignClusters(points, centRef);
            var updateResult = updateCentroids(points, newAssign, numClusters);
            var newCentroids = updateResult.centroids;
            var newInertia = computeInertia(points, newAssign, newCentroids);
            var shift = computeCentroidShift(centRef, newCentroids);
            var reduction = prevInertiaRef !== Infinity ? ((prevInertiaRef - newInertia) / prevInertiaRef * 100) : 0;
            return {
              'Iteration': iterIdx + 1,
              'Phase': 'Update',
              'Inertia': Math.round(newInertia * 100) / 100,
              'Shift': Math.round(shift * 10000) / 10000,
              'Status': 'Running'
            };
          },
          viz: function () {
            var newAssign = assignClusters(points, centRef);
            var updateResult = updateCentroids(points, newAssign, numClusters);
            var newCentroids = updateResult.centroids;
            var newHist = histRef.slice();
            newHist.push(newCentroids.map(function (c) { return [c[0], c[1]]; }));
            return { points: points, centroids: newCentroids, assignments: newAssign, centroidHistory: newHist };
          }
        });
      })(iter, centroids, assignments, prevInertia, centroidHistory);

      var newAssign = assignClusters(points, centroids);
      var updateResult = updateCentroids(points, newAssign, numClusters);
      var newCentroids = updateResult.centroids;
      var shift = computeCentroidShift(centroids, newCentroids);
      var newInertia = computeInertia(points, newAssign, newCentroids);

      centroidHistory.push(newCentroids.map(function (c) { return [c[0], c[1]]; }));

      var changed = false;
      if (assignments.length === 0) {
        changed = true;
      } else {
        for (var i = 0; i < newAssign.length; i++) {
          if (newAssign[i] !== assignments[i]) { changed = true; break; }
        }
      }

      centroids = newCentroids;
      assignments = newAssign;
      prevInertia = newInertia;

      if (!changed && iter > 0) {
        break;
      }
    }

    var finalInertia = computeInertia(points, assignments, centroids);
    steps.push({
      label: 'Converged',
      log: 'K-Means converged after ' + steps.length + ' steps',
      state: function () {
        return { centroids: centroids, assignments: assignments, iteration: steps.length, phase: 'converged', inertia: finalInertia };
      },
      metrics: function () {
        return { 'Iteration': steps.length, 'Phase': 'Converged', 'Inertia': Math.round(finalInertia * 100) / 100, 'Status': 'Finished' };
      },
      viz: function () {
        return { points: points, centroids: centroids, assignments: assignments, centroidHistory: centroidHistory };
      }
    });

    return steps;
  }

  var labDefinition = {
    id: 'lab-kmeans-clustering',
    slug: 'kmeans-clustering',
    title: 'K-Means Clustering',
    summary: 'Observe how K-Means discovers cluster structure by watching centroids initialize, points assign, and centroids migrate until convergence.',
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
        label: 'Number of Clusters (k)'
      },
      {
        name: 'numPoints',
        type: 'integer',
        min: 20,
        max: 200,
        step: 10,
        default: 60,
        label: 'Dataset Size'
      },
      {
        name: 'spread',
        type: 'slider',
        min: 0.3,
        max: 3.0,
        step: 0.1,
        default: 1.2,
        label: 'Cluster Variance'
      }
    ],
    initialState: {
      numClusters: 3,
      numPoints: 60,
      spread: 1.2
    },
    steps: (function () {
      var points = generateClusterData(60, 3, 1.2, 789);
      return buildSteps(points, 3, 20);
    })(),
    inspector: {
      title: 'K-Means State',
      sections: [
        {
          label: 'Current Iteration',
          cards: [
            { key: 'iteration', label: 'Iteration', interpretation: function (v) { return v === 0 ? 'Initialization' : 'Running'; } },
            { key: 'phase', label: 'Phase', interpretation: function (v) { return v === 'assign' ? 'Points being assigned' : v === 'update' ? 'Centroids moving' : v === 'converged' ? 'No more changes' : 'Ready'; } },
            { key: 'inertia', label: 'Inertia', interpretation: function (v) { return v < 10 ? 'Tight clusters' : v < 50 ? 'Moderate spread' : 'Loose clusters'; } },
            { key: 'status', label: 'Status' }
          ]
        },
        {
          label: 'Centroids',
          cards: [
            { key: 'centroid0', label: 'Centroid 0', interpretation: function (v) { return v ? 'Position: [' + v + ']' : 'Not initialized'; } },
            { key: 'centroid1', label: 'Centroid 1', interpretation: function (v) { return v ? 'Position: [' + v + ']' : 'Not initialized'; } },
            { key: 'centroid2', label: 'Centroid 2', interpretation: function (v) { return v ? 'Position: [' + v + ']' : 'Not initialized'; } },
            { key: 'centroidShift', label: 'Centroid Shift', interpretation: function (v) { return v < 0.01 ? 'Nearly stationary' : v < 0.5 ? 'Moderate movement' : 'Large movement'; } }
          ]
        },
        {
          label: 'Assignment Statistics',
          cards: [
            { key: 'clusterSizes', label: 'Cluster Sizes', interpretation: function (v) { return v || 'No assignments yet'; } },
            { key: 'emptyClusters', label: 'Empty Clusters', interpretation: function (v) { return v === 0 ? 'All clusters occupied' : v + ' cluster(s) empty — will reinitialize'; } },
            { key: 'reassigned', label: 'Reassigned Points', interpretation: function (v) { return v === 0 ? 'No changes' : v + ' points changed cluster'; } },
            { key: 'totalPoints', label: 'Total Points', fixed: true }
          ]
        }
      ],
      computeState: function (params, stepIndex, history) {
        var points = generateClusterData(params.numPoints, params.numClusters, params.spread, 789);
        var centroids = initializeCentroids(points, params.numClusters, 456);
        var assignments = [];
        var prevInertia = Infinity;
        var totalReassigned = 0;

        for (var i = 0; i < Math.floor(stepIndex / 2); i++) {
          var newAssign = assignClusters(points, centroids);
          var changed = false;
          if (assignments.length > 0) {
            for (var j = 0; j < newAssign.length; j++) {
              if (newAssign[j] !== assignments[j]) { changed = true; break; }
            }
          } else { changed = true; }
          assignments = newAssign;
          if (!changed && i > 0) break;
          var updateResult = updateCentroids(points, assignments, params.numClusters);
          centroids = updateResult.centroids;
          prevInertia = computeInertia(points, assignments, centroids);
        }

        if (stepIndex > 0) {
          var finalAssign = assignClusters(points, centroids);
          var reassigned = 0;
          if (assignments.length > 0) {
            for (var k = 0; k < finalAssign.length; k++) {
              if (finalAssign[k] !== assignments[k]) reassigned++;
            }
          }
          totalReassigned = reassigned;
          assignments = finalAssign;
        }

        var sizes = [];
        var emptyCount = 0;
        for (var c = 0; c < params.numClusters; c++) {
          var count = 0;
          for (var i2 = 0; i2 < assignments.length; i2++) {
            if (assignments[i2] === c) count++;
          }
          sizes.push(count);
          if (count === 0) emptyCount++;
        }

        var inertia = assignments.length > 0 ? computeInertia(points, assignments, centroids) : 0;
        var shift = 0;
        if (history && history.length > 1) {
          var prev = history[history.length - 1];
          if (prev && prev.centroids) {
            for (var s = 0; s < centroids.length; s++) {
              if (prev.centroids[s]) {
                var dx = centroids[s][0] - prev.centroids[s][0];
                var dy = centroids[s][1] - prev.centroids[s][1];
                shift += Math.sqrt(dx * dx + dy * dy);
              }
            }
          }
        }

        return {
          iteration: Math.floor(stepIndex / 2),
          phase: stepIndex === 0 ? 'initialize' : (stepIndex % 2 === 1 ? 'assign' : 'update'),
          inertia: Math.round(inertia * 100) / 100,
          status: 'Running',
          centroid0: centroids[0] ? Math.round(centroids[0][0] * 100) / 100 + ', ' + Math.round(centroids[0][1] * 100) / 100 : null,
          centroid1: centroids[1] ? Math.round(centroids[1][0] * 100) / 100 + ', ' + Math.round(centroids[1][1] * 100) / 100 : null,
          centroid2: centroids[2] ? Math.round(centroids[2][0] * 100) / 100 + ', ' + Math.round(centroids[2][1] * 100) / 100 : null,
          centroidShift: Math.round(shift * 10000) / 10000,
          clusterSizes: sizes.join(', '),
          emptyClusters: emptyCount,
          reassigned: totalReassigned,
          totalPoints: params.numPoints
        };
      },
      changeDetector: function (prev, curr) {
        var changes = [];
        if (prev && curr) {
          if (prev.inertia !== curr.inertia) changes.push({ from: 'inertia', to: null, label: curr.inertia < prev.inertia ? 'Inertia decreased — clusters tightening' : 'Inertia changed' });
          if (prev.centroidShift !== curr.centroidShift && curr.centroidShift > 0.01) changes.push({ from: 'centroidShift', to: null, label: 'Centroids shifted ' + curr.centroidShift.toFixed(4) + ' units' });
          if (prev.clusterSizes !== curr.clusterSizes) changes.push({ from: 'clusterSizes', to: null, label: 'Cluster sizes: ' + curr.clusterSizes });
        }
        return changes;
      }
    },
    observations: [
      {
        id: 'cluster-assignment',
        title: 'Cluster Assignment',
        purpose: 'Which point belongs to which centroid?',
        defaultSize: 'large',
        render: function (container, params, stepIndex, history) {
          var points = generateClusterData(params.numPoints, params.numClusters, params.spread, 789);
          var centroids = initializeCentroids(points, params.numClusters, 456);
          var assignments = [];
          for (var i = 0; i < Math.floor(stepIndex / 2); i++) {
            var newAssign = assignClusters(points, centroids);
            var changed = false;
            if (assignments.length > 0) {
              for (var j = 0; j < newAssign.length; j++) {
                if (newAssign[j] !== assignments[j]) { changed = true; break; }
              }
            } else { changed = true; }
            assignments = newAssign;
            if (!changed && i > 0) break;
            var updateResult = updateCentroids(points, assignments, params.numClusters);
            centroids = updateResult.centroids;
          }
          if (stepIndex > 0) {
            assignments = assignClusters(points, centroids);
          }

          var colors = ['#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#6366f1'];
          var labeledPoints = [];
          for (var k = 0; k < points.length; k++) {
            labeledPoints.push([
              Math.round(points[k][0] * 10000) / 10000,
              Math.round(points[k][1] * 10000) / 10000,
              assignments.length > k ? assignments[k] : 0
            ]);
          }

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Cluster Assignment';
          container.appendChild(title);

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 400 300');
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', 'Cluster scatter plot');
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxHeight = '250px';

          var allX = points.map(function (p) { return p[0]; });
          var allY = points.map(function (p) { return p[1]; });
          var minX = Math.min.apply(null, allX) - 1;
          var maxX = Math.max.apply(null, allX) + 1;
          var minY = Math.min.apply(null, allY) - 1;
          var maxY = Math.max.apply(null, allY) + 1;
          var rangeX = maxX - minX || 1;
          var rangeY = maxY - minY || 1;

          labeledPoints.forEach(function (p) {
            var cx = 40 + ((p[0] - minX) / rangeX) * 320;
            var cy = 10 + ((p[1] - minY) / rangeY) * 260;
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', cx);
            circle.setAttribute('cy', cy);
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', colors[p[2] % colors.length]);
            circle.setAttribute('opacity', '0.7');
            svg.appendChild(circle);
          });

          centroids.forEach(function (c, ci) {
            var cx = 40 + ((c[0] - minX) / rangeX) * 320;
            var cy = 10 + ((c[1] - minY) / rangeY) * 260;
            var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', cx - 5);
            rect.setAttribute('y', cy - 5);
            rect.setAttribute('width', '10');
            rect.setAttribute('height', '10');
            rect.setAttribute('fill', colors[ci % colors.length]);
            rect.setAttribute('stroke', '#fff');
            rect.setAttribute('stroke-width', '2');
            svg.appendChild(rect);
          });

          container.appendChild(svg);
        }
      },
      {
        id: 'centroid-evolution',
        title: 'Centroid Evolution',
        purpose: 'How are the centroids moving?',
        defaultSize: 'small',
        render: function (container, params, stepIndex) {
          var points = generateClusterData(params.numPoints, params.numClusters, params.spread, 789);
          var centroids = initializeCentroids(points, params.numClusters, 456);
          var history = [centroids.map(function (c) { return [c[0], c[1]]; })];
          var assignments = [];
          for (var i = 0; i < Math.floor(stepIndex / 2); i++) {
            var newAssign = assignClusters(points, centroids);
            var changed = false;
            if (assignments.length > 0) {
              for (var j = 0; j < newAssign.length; j++) {
                if (newAssign[j] !== assignments[j]) { changed = true; break; }
              }
            } else { changed = true; }
            assignments = newAssign;
            if (!changed && i > 0) break;
            var updateResult = updateCentroids(points, assignments, params.numClusters);
            centroids = updateResult.centroids;
            history.push(centroids.map(function (c) { return [c[0], c[1]]; }));
          }

          var colors = ['#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#6366f1'];
          var allX = points.map(function (p) { return p[0]; });
          var allY = points.map(function (p) { return p[1]; });
          var minX = Math.min.apply(null, allX) - 1;
          var maxX = Math.max.apply(null, allX) + 1;
          var minY = Math.min.apply(null, allY) - 1;
          var maxY = Math.max.apply(null, allY) + 1;
          var rangeX = maxX - minX || 1;
          var rangeY = maxY - minY || 1;

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Centroid Evolution';
          container.appendChild(title);

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 400 300');
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', 'Centroid movement history');
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxHeight = '250px';

          for (var ci = 0; ci < params.numClusters; ci++) {
            var trail = [];
            for (var h = 0; h < history.length; h++) {
              if (history[h][ci]) {
                var tx = 40 + ((history[h][ci][0] - minX) / rangeX) * 320;
                var ty = 10 + ((history[h][ci][1] - minY) / rangeY) * 260;
                trail.push(tx + ',' + ty);
              }
            }
            if (trail.length > 1) {
              var polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
              polyline.setAttribute('points', trail.join(' '));
              polyline.setAttribute('fill', 'none');
              polyline.setAttribute('stroke', colors[ci % colors.length]);
              polyline.setAttribute('stroke-width', '1.5');
              polyline.setAttribute('opacity', '0.5');
              svg.appendChild(polyline);
            }
            if (trail.length > 0) {
              var last = trail[trail.length - 1].split(',');
              var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
              dot.setAttribute('cx', last[0]);
              dot.setAttribute('cy', last[1]);
              dot.setAttribute('r', '5');
              dot.setAttribute('fill', colors[ci % colors.length]);
              dot.setAttribute('stroke', '#fff');
              dot.setAttribute('stroke-width', '1.5');
              svg.appendChild(dot);
            }
          }

          container.appendChild(svg);
        }
      },
      {
        id: 'inertia-curve',
        title: 'Inertia Curve',
        purpose: 'Is the optimization improving?',
        defaultSize: 'small',
        render: function (container, params, stepIndex) {
          var points = generateClusterData(params.numPoints, params.numClusters, params.spread, 789);
          var centroids = initializeCentroids(points, params.numClusters, 456);
          var assignments = [];
          var inertiaHistory = [];
          for (var i = 0; i < Math.floor(stepIndex / 2); i++) {
            var newAssign = assignClusters(points, centroids);
            var changed = false;
            if (assignments.length > 0) {
              for (var j = 0; j < newAssign.length; j++) {
                if (newAssign[j] !== assignments[j]) { changed = true; break; }
              }
            } else { changed = true; }
            assignments = newAssign;
            if (!changed && i > 0) break;
            var updateResult = updateCentroids(points, assignments, params.numClusters);
            centroids = updateResult.centroids;
            inertiaHistory.push(computeInertia(points, assignments, centroids));
          }

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Inertia Curve';
          container.appendChild(title);

          if (inertiaHistory.length > 0) {
            window.NeuralVerse.VisualizationEngine.renderLineChart(container, inertiaHistory, { title: '' });
          } else {
            container.innerHTML += '<p style="font-size:0.75rem;color:var(--nv-lab-text-muted)">Run to see inertia history</p>';
          }
        }
      },
      {
        id: 'cluster-statistics',
        title: 'Cluster Statistics',
        purpose: 'How balanced are the clusters?',
        defaultSize: 'small',
        render: function (container, params, stepIndex) {
          var points = generateClusterData(params.numPoints, params.numClusters, params.spread, 789);
          var centroids = initializeCentroids(points, params.numClusters, 456);
          var assignments = [];
          for (var i = 0; i < Math.floor(stepIndex / 2); i++) {
            var newAssign = assignClusters(points, centroids);
            var changed = false;
            if (assignments.length > 0) {
              for (var j = 0; j < newAssign.length; j++) {
                if (newAssign[j] !== assignments[j]) { changed = true; break; }
              }
            } else { changed = true; }
            assignments = newAssign;
            if (!changed && i > 0) break;
            var updateResult = updateCentroids(points, assignments, params.numClusters);
            centroids = updateResult.centroids;
          }
          if (stepIndex > 0) {
            assignments = assignClusters(points, centroids);
          }

          var sizes = [];
          for (var c = 0; c < params.numClusters; c++) {
            var count = 0;
            for (var i2 = 0; i2 < assignments.length; i2++) {
              if (assignments[i2] === c) count++;
            }
            sizes.push(count);
          }

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Cluster Statistics';
          container.appendChild(title);

          if (sizes.some(function (s) { return s > 0; })) {
            window.NeuralVerse.VisualizationEngine.renderBarChart(container, sizes, {
              title: '',
              labels: sizes.map(function (_, i) { return 'C' + i; })
            });
          } else {
            container.innerHTML += '<p style="font-size:0.75rem;color:var(--nv-lab-text-muted)">Run to see cluster sizes</p>';
          }
        }
      }
    ],
    execute: function (params) {
      var numClusters = params.numClusters !== undefined ? params.numClusters : 3;
      var numPoints = params.numPoints !== undefined ? params.numPoints : 60;
      var spread = params.spread !== undefined ? params.spread : 1.2;

      numClusters = Math.round(numClusters);
      numClusters = Math.max(2, Math.min(8, numClusters));
      numPoints = Math.round(numPoints);
      numPoints = Math.max(20, Math.min(200, numPoints));

      var points = generateClusterData(numPoints, numClusters, spread, 789);
      var centroids = initializeCentroids(points, numClusters, 456);
      var assignments = [];
      var iterations = 0;

      for (var iter = 0; iter < 100; iter++) {
        var newAssign = assignClusters(points, centroids);
        iterations++;
        var changed = false;
        if (assignments.length === 0) { changed = true; }
        else {
          for (var i = 0; i < newAssign.length; i++) {
            if (newAssign[i] !== assignments[i]) { changed = true; break; }
          }
        }
        assignments = newAssign;
        if (!changed && iter > 0) break;
        var updateResult = updateCentroids(points, assignments, numClusters);
        centroids = updateResult.centroids;
      }

      var inertia = computeInertia(points, assignments, centroids);
      var labeledPoints = [];
      for (var i2 = 0; i2 < points.length; i2++) {
        labeledPoints.push([
          Math.round(points[i2][0] * 10000) / 10000,
          Math.round(points[i2][1] * 10000) / 10000,
          assignments[i2]
        ]);
      }
      var roundedCentroids = [];
      for (var c = 0; c < centroids.length; c++) {
        roundedCentroids.push([
          Math.round(centroids[c][0] * 10000) / 10000,
          Math.round(centroids[c][1] * 10000) / 10000
        ]);
      }
      return { points: labeledPoints, centroids: roundedCentroids, iterations: iterations, inertia: Math.round(inertia * 10000) / 10000 };
    },
    visualization: { type: 'scatter-plot', title: 'K-Means Clustering Result' },
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
