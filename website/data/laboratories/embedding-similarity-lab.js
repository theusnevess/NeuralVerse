(function () {
  'use strict';

  window.NeuralVerse = window.NeuralVerse || {};

  var EPSILON = 1e-10;

  var ITEMS = ['embedding', 'vector', 'token', 'attention', 'query', 'retrieval', 'database', 'index', 'document'];

  var SEMANTIC_DIMENSIONS = ['representation', 'geometry', 'retrieval', 'language', 'modeling', 'data'];

  var BASE_EMBEDDINGS = {
    embedding:    [0.95, 0.80, 0.85, 0.70, 0.90, 0.60],
    vector:       [0.85, 0.90, 0.70, 0.60, 0.75, 0.80],
    token:        [0.70, 0.50, 0.60, 0.90, 0.65, 0.55],
    attention:    [0.80, 0.60, 0.75, 0.85, 0.90, 0.50],
    query:        [0.65, 0.55, 0.90, 0.70, 0.70, 0.75],
    retrieval:    [0.70, 0.60, 0.95, 0.65, 0.80, 0.85],
    database:     [0.50, 0.45, 0.85, 0.40, 0.55, 0.95],
    index:        [0.55, 0.50, 0.80, 0.45, 0.60, 0.90],
    document:     [0.60, 0.40, 0.70, 0.75, 0.50, 0.85]
  };

  function safeDiv(a, b) {
    if (b < EPSILON) return 0;
    return a / b;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function round4(val) {
    return Math.round(val * 10000) / 10000;
  }

  function vectorNorm(v) {
    var sum = 0;
    for (var i = 0; i < v.length; i++) {
      sum += v[i] * v[i];
    }
    return Math.sqrt(sum);
  }

  function normalizeVector(v) {
    var norm = vectorNorm(v);
    if (norm < EPSILON) return v.slice();
    var result = [];
    for (var i = 0; i < v.length; i++) {
      result.push(round4(v[i] / norm));
    }
    return result;
  }

  function dotProduct(a, b) {
    var sum = 0;
    for (var i = 0; i < a.length; i++) {
      sum += a[i] * b[i];
    }
    return sum;
  }

  function cosineSimilarity(a, b) {
    var normA = vectorNorm(a);
    var normB = vectorNorm(b);
    if (normA < EPSILON || normB < EPSILON) return 0;
    return round4(dotProduct(a, b) / (normA * normB));
  }

  function euclideanDistance(a, b) {
    var sum = 0;
    for (var i = 0; i < a.length; i++) {
      var diff = a[i] - b[i];
      sum += diff * diff;
    }
    return round4(Math.sqrt(sum));
  }

  function computeNorms(vectors) {
    var norms = [];
    for (var i = 0; i < vectors.length; i++) {
      norms.push(round4(vectorNorm(vectors[i])));
    }
    return norms;
  }

  function computeNormalizedVectors(vectors) {
    var normalized = [];
    for (var i = 0; i < vectors.length; i++) {
      normalized.push(normalizeVector(vectors[i]));
    }
    return normalized;
  }

  function computeDotProductMatrix(vectors) {
    var n = vectors.length;
    var matrix = [];
    for (var i = 0; i < n; i++) {
      var row = [];
      for (var j = 0; j < n; j++) {
        row.push(round4(dotProduct(vectors[i], vectors[j])));
      }
      matrix.push(row);
    }
    return matrix;
  }

  function computeCosineMatrix(vectors) {
    var n = vectors.length;
    var matrix = [];
    for (var i = 0; i < n; i++) {
      var row = [];
      for (var j = 0; j < n; j++) {
        row.push(cosineSimilarity(vectors[i], vectors[j]));
      }
      matrix.push(row);
    }
    return matrix;
  }

  function computeDistanceMatrix(vectors) {
    var n = vectors.length;
    var matrix = [];
    for (var i = 0; i < n; i++) {
      var row = [];
      for (var j = 0; j < n; j++) {
        row.push(euclideanDistance(vectors[i], vectors[j]));
      }
      matrix.push(row);
    }
    return matrix;
  }

  function rankNeighbors(queryIdx, cosineMatrix) {
    var scores = [];
    for (var i = 0; i < cosineMatrix.length; i++) {
      if (i !== queryIdx) {
        scores.push({ index: i, score: cosineMatrix[queryIdx][i] });
      }
    }
    scores.sort(function (a, b) { return b.score - a.score; });
    return scores;
  }

  function computeDimensionContributions(queryVec, neighborVec) {
    var contributions = [];
    var queryNorm = vectorNorm(queryVec);
    var neighborNorm = vectorNorm(neighborVec);

    for (var i = 0; i < queryVec.length; i++) {
      var qNormed = queryNorm > EPSILON ? queryVec[i] / queryNorm : 0;
      var nNormed = neighborNorm > EPSILON ? neighborVec[i] / neighborNorm : 0;
      contributions.push({
        dimension: SEMANTIC_DIMENSIONS[i] || 'dim_' + i,
        query: round4(qNormed),
        neighbor: round4(nNormed),
        contribution: round4(qNormed * nNormed)
      });
    }
    return contributions;
  }

  function runEmbeddingPipeline(params) {
    var items = ITEMS.slice();
    var vectors = [];
    for (var i = 0; i < items.length; i++) {
      vectors.push(BASE_EMBEDDINGS[items[i]].slice());
    }

    var norms = computeNorms(vectors);
    var normalizedVectors = computeNormalizedVectors(vectors);
    var dotMatrix = computeDotProductMatrix(vectors);
    var cosineMatrix = computeCosineMatrix(vectors);
    var distanceMatrix = computeDistanceMatrix(vectors);

    var queryIdx = 0;
    var neighbors = rankNeighbors(queryIdx, cosineMatrix);
    var topMatch = neighbors.length > 0 ? items[neighbors[0].index] : '';
    var topScore = neighbors.length > 0 ? neighbors[0].score : 0;

    var contributions = computeDimensionContributions(vectors[queryIdx], vectors[neighbors.length > 0 ? neighbors[0].index : 0]);

    return {
      items: items,
      vectors: vectors,
      norms: norms,
      normalizedVectors: normalizedVectors,
      dotProductMatrix: dotMatrix,
      cosineMatrix: cosineMatrix,
      distanceMatrix: distanceMatrix,
      queryIndex: queryIdx,
      neighbors: neighbors,
      topMatch: topMatch,
      topScore: topScore,
      dimensionContributions: contributions
    };
  }

  var labDefinition = {
    id: 'lab-embedding-similarity',
    slug: 'embedding-similarity',
    title: 'Embedding Similarity Laboratory',
    summary: 'Explore how vector representations encode semantic relationships. Watch similarity emerge from vector geometry through normalization, dot product, cosine similarity, and nearest-neighbor retrieval.',
    category: 'natural-language-processing',
    artifactReferences: [],
    conceptReferences: ['word-embeddings', 'cosine-similarity', 'nearest-neighbor', 'semantic-search'],
    parameterSchema: [
      {
        name: 'queryItem',
        type: 'select',
        options: ITEMS.slice(),
        default: 'embedding',
        label: 'Query Item', description: 'Selects the embedding used as the similarity query.', scientificMeaning: 'Categorical query-vector choice.', unitClassification: 'not-applicable'
      },
      {
        name: 'topK',
        type: 'integer',
        min: 1,
        max: 8,
        step: 1,
        default: 3,
        label: 'Top-K Neighbors', description: 'Sets how many nearest embeddings are returned.', scientificMeaning: 'Discrete nearest-neighbor result count.', unit: 'neighbors'
      }
    ],
    initialState: {
      queryItem: 'embedding',
      topK: 3
    },
    steps: (function () {
      var steps = [];

      steps.push({
        label: 'Load',
        log: 'Loaded 9 embedding vectors, each in 6-dimensional semantic space',
        state: function (p) {
          return {
            query: p.queryItem,
            dimension: 6,
            vectorNorm: 0,
            normalized: false,
            topMatch: '—',
            cosineSim: 0,
            dotProduct: 0,
            euclideanDist: 0,
            topK: p.topK,
            avgSimilarity: 0,
            magnitudeEffect: 'Pending',
            angleInterpretation: 'Pending',
            clusterDensity: 'Pending'
          };
        },
        metrics: function (p) {
          return {
            'Items': ITEMS.length,
            'Dimensions': 6,
            'Query': p.queryItem,
            'Status': 'Loaded'
          };
        },
        viz: function (p) {
          var result = runEmbeddingPipeline(p);
          return {
            phase: 'load',
            items: result.items,
            vectors: result.vectors,
            queryIndex: result.queryIndex
          };
        }
      });

      steps.push({
        label: 'Inspect Norms',
        log: 'Computed L2 norms: vector magnitudes vary across items',
        state: function (p) {
          var result = runEmbeddingPipeline(p);
          var queryIdx = result.items.indexOf(p.queryItem);
          if (queryIdx < 0) queryIdx = 0;
          var norm = result.norms[queryIdx];

          return {
            query: p.queryItem,
            dimension: 6,
            vectorNorm: norm,
            normalized: false,
            topMatch: '—',
            cosineSim: 0,
            dotProduct: 0,
            euclideanDist: 0,
            topK: p.topK,
            avgSimilarity: 0,
            magnitudeEffect: norm > 2.0 ? 'Large magnitude' : norm > 1.5 ? 'Moderate magnitude' : 'Small magnitude',
            angleInterpretation: 'Pending normalization',
            clusterDensity: 'Pending'
          };
        },
        metrics: function (p) {
          var result = runEmbeddingPipeline(p);
          var queryIdx = result.items.indexOf(p.queryItem);
          if (queryIdx < 0) queryIdx = 0;
          return {
            'Query': p.queryItem,
            'Norm': result.norms[queryIdx],
            'All Norms': result.norms.join(', '),
            'Status': 'Norms computed'
          };
        },
        viz: function (p) {
          var result = runEmbeddingPipeline(p);
          return {
            phase: 'norms',
            items: result.items,
            vectors: result.vectors,
            norms: result.norms,
            queryIndex: result.items.indexOf(p.queryItem) >= 0 ? result.items.indexOf(p.queryItem) : 0
          };
        }
      });

      steps.push({
        label: 'Normalize',
        log: 'Normalized vectors to unit length, removing magnitude from similarity',
        state: function (p) {
          var result = runEmbeddingPipeline(p);
          var queryIdx = result.items.indexOf(p.queryItem);
          if (queryIdx < 0) queryIdx = 0;

          return {
            query: p.queryItem,
            dimension: 6,
            vectorNorm: 1.0,
            normalized: true,
            topMatch: '—',
            cosineSim: 0,
            dotProduct: 0,
            euclideanDist: 0,
            topK: p.topK,
            avgSimilarity: 0,
            magnitudeEffect: 'Removed by normalization',
            angleInterpretation: 'Vectors on unit sphere',
            clusterDensity: 'Pending'
          };
        },
        metrics: function (p) {
          return {
            'Query': p.queryItem,
            'Normalized': 'Yes',
            'Unit Norm': '1.0',
            'Status': 'Normalized'
          };
        },
        viz: function (p) {
          var result = runEmbeddingPipeline(p);
          return {
            phase: 'normalize',
            items: result.items,
            vectors: result.vectors,
            normalizedVectors: result.normalizedVectors,
            norms: result.norms,
            queryIndex: result.items.indexOf(p.queryItem) >= 0 ? result.items.indexOf(p.queryItem) : 0
          };
        }
      });

      steps.push({
        label: 'Dot Product',
        log: 'Dot product matrix computed: scores reflect both direction and magnitude',
        state: function (p) {
          var result = runEmbeddingPipeline(p);
          var queryIdx = result.items.indexOf(p.queryItem);
          if (queryIdx < 0) queryIdx = 0;

          var dotScores = result.dotProductMatrix[queryIdx];
          var maxDot = 0;
          var maxIdx = 0;
          for (var i = 0; i < dotScores.length; i++) {
            if (i !== queryIdx && dotScores[i] > maxDot) {
              maxDot = dotScores[i];
              maxIdx = i;
            }
          }

          return {
            query: p.queryItem,
            dimension: 6,
            vectorNorm: result.norms[queryIdx],
            normalized: false,
            topMatch: result.items[maxIdx],
            cosineSim: 0,
            dotProduct: round4(maxDot),
            euclideanDist: 0,
            topK: p.topK,
            avgSimilarity: 0,
            magnitudeEffect: 'Dot product includes magnitude',
            angleInterpretation: 'Pending cosine',
            clusterDensity: 'Pending'
          };
        },
        metrics: function (p) {
          var result = runEmbeddingPipeline(p);
          var queryIdx = result.items.indexOf(p.queryItem);
          if (queryIdx < 0) queryIdx = 0;
          return {
            'Query': p.queryItem,
            'Top Dot Product': result.dotProductMatrix[queryIdx][queryIdx === 0 ? 1 : 0],
            'Status': 'Dot products computed'
          };
        },
        viz: function (p) {
          var result = runEmbeddingPipeline(p);
          return {
            phase: 'dotproduct',
            items: result.items,
            dotProductMatrix: result.dotProductMatrix,
            queryIndex: result.items.indexOf(p.queryItem) >= 0 ? result.items.indexOf(p.queryItem) : 0
          };
        }
      });

      steps.push({
        label: 'Cosine',
        log: 'Cosine similarity computed: direction-only comparison of vectors',
        state: function (p) {
          var result = runEmbeddingPipeline(p);
          var queryIdx = result.items.indexOf(p.queryItem);
          if (queryIdx < 0) queryIdx = 0;

          var neighbors = result.neighbors;
          var topMatch = neighbors.length > 0 ? result.items[neighbors[0].index] : '—';
          var topScore = neighbors.length > 0 ? neighbors[0].score : 0;

          var totalScore = 0;
          for (var i = 0; i < neighbors.length; i++) {
            totalScore += neighbors[i].score;
          }
          var avgSim = neighbors.length > 0 ? round4(totalScore / neighbors.length) : 0;

          return {
            query: p.queryItem,
            dimension: 6,
            vectorNorm: 1.0,
            normalized: true,
            topMatch: topMatch,
            cosineSim: topScore,
            dotProduct: result.dotProductMatrix[queryIdx][neighbors.length > 0 ? neighbors[0].index : 0],
            euclideanDist: 0,
            topK: p.topK,
            avgSimilarity: avgSim,
            magnitudeEffect: 'Irrelevant for cosine',
            angleInterpretation: topScore > 0.9 ? 'Very small angle' : topScore > 0.7 ? 'Small angle' : 'Moderate angle',
            clusterDensity: 'Pending'
          };
        },
        metrics: function (p) {
          var result = runEmbeddingPipeline(p);
          return {
            'Query': p.queryItem,
            'Top Match': result.topMatch,
            'Cosine': result.topScore,
            'Status': 'Cosine computed'
          };
        },
        viz: function (p) {
          var result = runEmbeddingPipeline(p);
          return {
            phase: 'cosine',
            items: result.items,
            cosineMatrix: result.cosineMatrix,
            queryIndex: result.items.indexOf(p.queryItem) >= 0 ? result.items.indexOf(p.queryItem) : 0
          };
        }
      });

      steps.push({
        label: 'Distance',
        log: 'Euclidean distance matrix computed: geometric proximity measured',
        state: function (p) {
          var result = runEmbeddingPipeline(p);
          var queryIdx = result.items.indexOf(p.queryItem);
          if (queryIdx < 0) queryIdx = 0;

          var neighbors = result.neighbors;
          var topMatch = neighbors.length > 0 ? result.items[neighbors[0].index] : '—';
          var topScore = neighbors.length > 0 ? neighbors[0].score : 0;

          var totalScore = 0;
          for (var i = 0; i < neighbors.length; i++) {
            totalScore += neighbors[i].score;
          }
          var avgSim = neighbors.length > 0 ? round4(totalScore / neighbors.length) : 0;

          var closestDist = neighbors.length > 0 ? result.distanceMatrix[queryIdx][neighbors[0].index] : 0;

          return {
            query: p.queryItem,
            dimension: 6,
            vectorNorm: 1.0,
            normalized: true,
            topMatch: topMatch,
            cosineSim: topScore,
            dotProduct: result.dotProductMatrix[queryIdx][neighbors.length > 0 ? neighbors[0].index : 0],
            euclideanDist: closestDist,
            topK: p.topK,
            avgSimilarity: avgSim,
            magnitudeEffect: 'Irrelevant for cosine',
            angleInterpretation: topScore > 0.9 ? 'Very small angle' : topScore > 0.7 ? 'Small angle' : 'Moderate angle',
            clusterDensity: closestDist < 0.5 ? 'Tight cluster' : closestDist < 1.0 ? 'Moderate spread' : 'Sparse'
          };
        },
        metrics: function (p) {
          var result = runEmbeddingPipeline(p);
          var queryIdx = result.items.indexOf(p.queryItem);
          if (queryIdx < 0) queryIdx = 0;
          var neighbors = result.neighbors;
          var closestDist = neighbors.length > 0 ? result.distanceMatrix[queryIdx][neighbors[0].index] : 0;
          return {
            'Query': p.queryItem,
            'Closest Distance': closestDist,
            'Status': 'Distances computed'
          };
        },
        viz: function (p) {
          var result = runEmbeddingPipeline(p);
          return {
            phase: 'distance',
            items: result.items,
            distanceMatrix: result.distanceMatrix,
            cosineMatrix: result.cosineMatrix,
            queryIndex: result.items.indexOf(p.queryItem) >= 0 ? result.items.indexOf(p.queryItem) : 0
          };
        }
      });

      steps.push({
        label: 'Rank',
        log: 'Ranked neighbors by cosine similarity, top match identified',
        state: function (p) {
          var result = runEmbeddingPipeline(p);
          var queryIdx = result.items.indexOf(p.queryItem);
          if (queryIdx < 0) queryIdx = 0;

          var neighbors = result.neighbors;
          var topKNeighbors = neighbors.slice(0, p.topK);
          var topMatch = topKNeighbors.length > 0 ? result.items[topKNeighbors[0].index] : '—';
          var topScore = topKNeighbors.length > 0 ? topKNeighbors[0].score : 0;

          var totalScore = 0;
          for (var i = 0; i < topKNeighbors.length; i++) {
            totalScore += topKNeighbors[i].score;
          }
          var avgSim = topKNeighbors.length > 0 ? round4(totalScore / topKNeighbors.length) : 0;

          var closestDist = topKNeighbors.length > 0 ? result.distanceMatrix[queryIdx][topKNeighbors[0].index] : 0;

          return {
            query: p.queryItem,
            dimension: 6,
            vectorNorm: 1.0,
            normalized: true,
            topMatch: topMatch,
            cosineSim: topScore,
            dotProduct: result.dotProductMatrix[queryIdx][topKNeighbors.length > 0 ? topKNeighbors[0].index : 0],
            euclideanDist: closestDist,
            topK: p.topK,
            avgSimilarity: avgSim,
            magnitudeEffect: 'Irrelevant for cosine',
            angleInterpretation: topScore > 0.9 ? 'Very small angle' : topScore > 0.7 ? 'Small angle' : 'Moderate angle',
            clusterDensity: closestDist < 0.5 ? 'Tight cluster' : closestDist < 1.0 ? 'Moderate spread' : 'Sparse'
          };
        },
        metrics: function (p) {
          var result = runEmbeddingPipeline(p);
          var queryIdx = result.items.indexOf(p.queryItem);
          if (queryIdx < 0) queryIdx = 0;
          var neighbors = result.neighbors.slice(0, p.topK);
          var topNames = neighbors.map(function (n) { return result.items[n.index] + '(' + n.score + ')'; }).join(', ');
          return {
            'Query': p.queryItem,
            'Top-K': p.topK,
            'Neighbors': topNames,
            'Status': 'Ranked'
          };
        },
        viz: function (p) {
          var result = runEmbeddingPipeline(p);
          return {
            phase: 'rank',
            items: result.items,
            cosineMatrix: result.cosineMatrix,
            distanceMatrix: result.distanceMatrix,
            neighbors: result.neighbors.slice(0, p.topK),
            queryIndex: result.items.indexOf(p.queryItem) >= 0 ? result.items.indexOf(p.queryItem) : 0,
            dimensionContributions: result.dimensionContributions
          };
        }
      });

      steps.push({
        label: 'Complete',
        log: 'Analysis complete: semantic structure revealed through vector geometry',
        state: function (p) {
          var result = runEmbeddingPipeline(p);
          var queryIdx = result.items.indexOf(p.queryItem);
          if (queryIdx < 0) queryIdx = 0;

          var neighbors = result.neighbors;
          var topKNeighbors = neighbors.slice(0, p.topK);
          var topMatch = topKNeighbors.length > 0 ? result.items[topKNeighbors[0].index] : '—';
          var topScore = topKNeighbors.length > 0 ? topKNeighbors[0].score : 0;

          var totalScore = 0;
          for (var i = 0; i < topKNeighbors.length; i++) {
            totalScore += topKNeighbors[i].score;
          }
          var avgSim = topKNeighbors.length > 0 ? round4(totalScore / topKNeighbors.length) : 0;

          var closestDist = topKNeighbors.length > 0 ? result.distanceMatrix[queryIdx][topKNeighbors[0].index] : 0;

          return {
            query: p.queryItem,
            dimension: 6,
            vectorNorm: 1.0,
            normalized: true,
            topMatch: topMatch,
            cosineSim: topScore,
            dotProduct: result.dotProductMatrix[queryIdx][topKNeighbors.length > 0 ? topKNeighbors[0].index : 0],
            euclideanDist: closestDist,
            topK: p.topK,
            avgSimilarity: avgSim,
            magnitudeEffect: 'Magnitude irrelevant for cosine',
            angleInterpretation: topScore > 0.9 ? 'Vectors nearly aligned' : topScore > 0.7 ? 'Vectors moderately aligned' : 'Vectors divergent',
            clusterDensity: closestDist < 0.5 ? 'Tight semantic cluster' : closestDist < 1.0 ? 'Moderate spread' : 'Sparse distribution'
          };
        },
        metrics: function (p) {
          var result = runEmbeddingPipeline(p);
          var queryIdx = result.items.indexOf(p.queryItem);
          if (queryIdx < 0) queryIdx = 0;
          var neighbors = result.neighbors.slice(0, p.topK);
          var topNames = neighbors.map(function (n) { return result.items[n.index] + '(' + n.score + ')'; }).join(', ');
          return {
            'Query': p.queryItem,
            'Top Match': result.topMatch,
            'Cosine': result.topScore,
            'Avg Similarity': result.topScore,
            'Status': 'Complete'
          };
        },
        viz: function (p) {
          var result = runEmbeddingPipeline(p);
          return {
            phase: 'analyze',
            items: result.items,
            vectors: result.vectors,
            normalizedVectors: result.normalizedVectors,
            cosineMatrix: result.cosineMatrix,
            distanceMatrix: result.distanceMatrix,
            neighbors: result.neighbors.slice(0, p.topK),
            queryIndex: result.items.indexOf(p.queryItem) >= 0 ? result.items.indexOf(p.queryItem) : 0,
            dimensionContributions: result.dimensionContributions
          };
        }
      });

      return steps;
    })(),
    observations: [
      {
        id: 'embedding-space',
        title: 'Embedding Space',
        purpose: 'Where do items sit in representation space?',
        defaultSize: 'large',
        render: function (container, params, stepIndex, history) {
          var result = runEmbeddingPipeline(params);
          var queryIdx = result.items.indexOf(params.queryItem);
          if (queryIdx < 0) queryIdx = 0;

          var neighbors = result.neighbors.slice(0, params.topK);
          var neighborIndices = neighbors.map(function (n) { return n.index; });

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Embedding Space (2D Projection)';
          container.appendChild(title);

          var space = document.createElement('div');
          space.className = 'nv-embed-space';
          space.setAttribute('role', 'img');
          space.setAttribute('aria-label', '2D projection of embedding vectors with query ' + params.queryItem + ' highlighted');

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 400 300');
          svg.setAttribute('class', 'nv-embed-space-svg');
          svg.setAttribute('aria-hidden', 'true');

          var gridLines = '';
            for (var g = 0; g <= 4; g++) {
              var gx = 35 + (g * 82.5);
              var gy = 25 + (g * 60);
              gridLines += '<line x1="' + gx + '" y1="25" x2="' + gx + '" y2="265" class="nv-embed-space-grid"/>';
              gridLines += '<line x1="35" y1="' + gy + '" x2="365" y2="' + gy + '" class="nv-embed-space-grid"/>';
          }

          // Normalize the projected coordinates to the active data range so
          // scientific marks use the available drawing area at every size.
          var projection = result.vectors.map(function (vec) {
            return { x: (vec[0] + vec[1]) / 2, y: (vec[2] + vec[3]) / 2 };
          });
          var xs = projection.map(function (point) { return point.x; });
          var ys = projection.map(function (point) { return point.y; });
          var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
          var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
          var spanX = maxX - minX || 1, spanY = maxY - minY || 1;
          var points = '';
          for (var i = 0; i < result.items.length; i++) {
            var px = 45 + ((projection[i].x - minX) / spanX) * 290;
            var py = 45 + ((projection[i].y - minY) / spanY) * 190;

            var isQuery = i === queryIdx;
            var isNeighbor = neighborIndices.indexOf(i) >= 0;

            var fillColor = isQuery ? '#06b6d4' : isNeighbor ? '#22c55e' : '#475569';
            var radius = isQuery ? 6 : isNeighbor ? 5 : 4;
            var strokeColor = isQuery ? '#06b6d4' : isNeighbor ? '#22c55e' : '#64748b';

            points += '<circle cx="' + px + '" cy="' + py + '" r="' + radius + '" fill="' + fillColor + '" stroke="' + strokeColor + '" stroke-width="1.5" class="nv-embed-space-point"/>';
            points += '<text x="' + (px + 8) + '" y="' + (py + 3) + '" class="nv-embed-space-label">' + result.items[i] + '</text>';
          }

          svg.innerHTML = gridLines + points;
          space.appendChild(svg);

          var legend = document.createElement('div');
          legend.className = 'nv-embed-space-legend';
          legend.innerHTML =
            '<span class="nv-embed-space-legend-item"><span class="nv-embed-space-legend-dot" style="background:#06b6d4"></span>Query</span>' +
            '<span class="nv-embed-space-legend-item"><span class="nv-embed-space-legend-dot" style="background:#22c55e"></span>Top Neighbors</span>' +
            '<span class="nv-embed-space-legend-item"><span class="nv-embed-space-legend-dot" style="background:#475569"></span>Other Items</span>';

          container.appendChild(space);
          container.appendChild(legend);
        },
        interpretation: function (params, stepIndex) { return 'Items closer in embedding space share more semantic similarity — distance reflects meaning.'; }
      },
      {
        id: 'similarity-matrix',
        title: 'Similarity Matrix',
        purpose: 'Which items are most similar to each other?',
        defaultSize: 'large',
        render: function (container, params, stepIndex, history) {
          var result = runEmbeddingPipeline(params);
          var queryIdx = result.items.indexOf(params.queryItem);
          if (queryIdx < 0) queryIdx = 0;

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Cosine Similarity Matrix';
          container.appendChild(title);

          var matrix = document.createElement('div');
          matrix.className = 'nv-embed-matrix';
          matrix.setAttribute('role', 'table');
          matrix.setAttribute('aria-label', 'Cosine similarity matrix');

          var headerRow = '<div class="nv-embed-matrix-row" role="row"><div class="nv-embed-matrix-cell nv-embed-matrix-cell--header" role="columnheader"></div>';
          for (var h = 0; h < result.items.length; h++) {
            headerRow += '<div class="nv-embed-matrix-cell nv-embed-matrix-cell--header" role="columnheader">' + result.items[h].substring(0, 3) + '</div>';
          }
          headerRow += '</div>';

          var rows = headerRow;
          for (var i = 0; i < result.items.length; i++) {
            rows += '<div class="nv-embed-matrix-row" role="row">';
            rows += '<div class="nv-embed-matrix-cell nv-embed-matrix-cell--header" role="rowheader">' + result.items[i].substring(0, 3) + '</div>';
            for (var j = 0; j < result.items.length; j++) {
              var val = result.cosineMatrix[i][j];
              var bg = val > 0.9 ? 'rgba(6,182,212,0.4)' : val > 0.7 ? 'rgba(6,182,212,0.2)' : val > 0.5 ? 'rgba(6,182,212,0.1)' : 'transparent';
              var isQueryRow = i === queryIdx;
              var borderClass = isQueryRow ? ' nv-embed-matrix-cell--highlight' : '';
              rows += '<div class="nv-embed-matrix-cell' + borderClass + '" role="cell" style="background:' + bg + '" aria-label="' + result.items[i] + ' to ' + result.items[j] + ': ' + val + '">' + val.toFixed(2) + '</div>';
            }
            rows += '</div>';
          }

          matrix.innerHTML = rows;
          container.appendChild(matrix);
        },
        interpretation: function (params, stepIndex) { return 'High cosine similarity values indicate vectors point in similar directions in semantic space.'; }
      },
      {
        id: 'nearest-neighbors',
        title: 'Nearest Neighbors',
        purpose: 'What would retrieval return first?',
        defaultSize: 'large',
        render: function (container, params, stepIndex, history) {
          var result = runEmbeddingPipeline(params);
          var queryIdx = result.items.indexOf(params.queryItem);
          if (queryIdx < 0) queryIdx = 0;

          var neighbors = result.neighbors.slice(0, params.topK);

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Top-' + params.topK + ' Nearest Neighbors';
          container.appendChild(title);

          var list = document.createElement('div');
          list.className = 'nv-embed-neighbors';
          list.setAttribute('role', 'list');
          list.setAttribute('aria-label', 'Ranked nearest neighbors for ' + params.queryItem);

          for (var i = 0; i < neighbors.length; i++) {
            var n = neighbors[i];
            var item = document.createElement('div');
            item.className = 'nv-embed-neighbor';
            item.setAttribute('role', 'listitem');

            var rank = document.createElement('span');
            rank.className = 'nv-embed-neighbor-rank';
            rank.textContent = '#' + (i + 1);

            var name = document.createElement('span');
            name.className = 'nv-embed-neighbor-name';
            name.textContent = result.items[n.index];

            var scores = document.createElement('div');
            scores.className = 'nv-embed-neighbor-scores';

            var cosineScore = document.createElement('span');
            cosineScore.className = 'nv-embed-neighbor-score';
            cosineScore.textContent = 'cos: ' + n.score.toFixed(3);

            var dotScore = document.createElement('span');
            dotScore.className = 'nv-embed-neighbor-score nv-embed-neighbor-score--dim';
            dotScore.textContent = 'dot: ' + result.dotProductMatrix[queryIdx][n.index].toFixed(3);

            var distScore = document.createElement('span');
            distScore.className = 'nv-embed-neighbor-score nv-embed-neighbor-score--dim';
            distScore.textContent = 'dist: ' + result.distanceMatrix[queryIdx][n.index].toFixed(3);

            scores.appendChild(cosineScore);
            scores.appendChild(dotScore);
            scores.appendChild(distScore);

            item.appendChild(rank);
            item.appendChild(name);
            item.appendChild(scores);
            list.appendChild(item);
          }

          container.appendChild(list);
        },
        interpretation: function (params, stepIndex) { return 'Nearest neighbors are retrieved by cosine similarity — the most semantically similar items.'; }
      },
      {
        id: 'vector-anatomy',
        title: 'Vector Anatomy',
        purpose: 'Which dimensions explain similarity?',
        defaultSize: 'small',
        render: function (container, params, stepIndex, history) {
          var result = runEmbeddingPipeline(params);
          var contributions = result.dimensionContributions;

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Dimension Contributions';
          container.appendChild(title);

          var bars = document.createElement('div');
          bars.className = 'nv-embed-anatomy';
          bars.setAttribute('role', 'list');
          bars.setAttribute('aria-label', 'Dimension contribution comparison');

          var maxContrib = 0;
          for (var c = 0; c < contributions.length; c++) {
            if (contributions[c].contribution > maxContrib) maxContrib = contributions[c].contribution;
          }

          for (var i = 0; i < contributions.length; i++) {
            var contrib = contributions[i];
            var bar = document.createElement('div');
            bar.className = 'nv-embed-anatomy-bar';
            bar.setAttribute('role', 'listitem');

            var label = document.createElement('span');
            label.className = 'nv-embed-anatomy-label';
            label.textContent = contrib.dimension;

            var tracks = document.createElement('div');
            tracks.className = 'nv-embed-anatomy-tracks';

            var queryTrack = document.createElement('div');
            queryTrack.className = 'nv-embed-anatomy-track';
            queryTrack.innerHTML = '<div class="nv-embed-anatomy-fill nv-embed-anatomy-fill--query" style="width:' + (contrib.query * 100) + '%"></div>';

            var neighborTrack = document.createElement('div');
            neighborTrack.className = 'nv-embed-anatomy-track';
            neighborTrack.innerHTML = '<div class="nv-embed-anatomy-fill nv-embed-anatomy-fill--neighbor" style="width:' + (contrib.contribution * 100 / Math.max(maxContrib, 0.01)) + '%"></div>';

            var value = document.createElement('span');
            value.className = 'nv-embed-anatomy-value';
            value.textContent = contrib.contribution.toFixed(3);

            tracks.appendChild(queryTrack);
            tracks.appendChild(neighborTrack);

            bar.appendChild(label);
            bar.appendChild(tracks);
            bar.appendChild(value);
            bars.appendChild(bar);
          }

          var legend = document.createElement('div');
          legend.className = 'nv-embed-anatomy-legend';
          legend.innerHTML =
            '<span class="nv-embed-anatomy-legend-item"><span class="nv-embed-anatomy-legend-dot" style="background:#06b6d4"></span>Query</span>' +
            '<span class="nv-embed-anatomy-legend-item"><span class="nv-embed-anatomy-legend-dot" style="background:#22c55e"></span>Contribution</span>';

          container.appendChild(bars);
          container.appendChild(legend);
        },
        interpretation: function (params, stepIndex) { return 'Dimension contributions reveal which semantic aspects drive similarity between query and neighbor.'; }
      }
    ],
    inspector: {
      title: 'Embedding Similarity State',
      sections: [
        {
          label: 'Query Properties',
          cards: [
            { key: 'query', label: 'Query Item', unit: '', interpretation: function (v) { return 'Query item selected'; } },
            { key: 'dimension', label: 'Dimensionality', unit: '', interpretation: function (v) { return v + '-dimensional space'; } },
            { key: 'vectorNorm', label: 'Vector Norm ||v||', unit: '', interpretation: function (v) { return v === 1.0 ? 'Unit vector' : v > 2.0 ? 'Large magnitude' : 'Moderate magnitude'; } },
            { key: 'normalized', label: 'Normalization State', unit: '', interpretation: function (v) { return v === true ? 'Yes — cosine comparison enabled' : 'No — magnitude affects dot product'; } }
          ]
        },
        {
          label: 'Similarity Metrics',
          cards: [
            { key: 'topMatch', label: 'Nearest Neighbor', unit: '', interpretation: function (v) { return v !== '—' ? 'Nearest neighbor selected' : 'Pending computation'; } },
            { key: 'cosineSim', label: 'Cosine Similarity', unit: '', interpretation: function (v) { return v > 0.9 ? 'Very strong alignment' : v > 0.7 ? 'Strong alignment' : v > 0.5 ? 'Moderate alignment' : 'Weak alignment'; } },
            { key: 'dotProduct', label: 'Dot Product', unit: '', interpretation: function (v) { return v > 3.0 ? 'Large dot product' : v > 1.0 ? 'Moderate dot product' : 'Small dot product'; } },
            { key: 'euclideanDist', label: 'Euclidean Distance', unit: '', interpretation: function (v) { return v < 0.5 ? 'Very close' : v < 1.0 ? 'Close' : 'Distant'; } }
          ]
        },
        {
          label: 'Retrieval Properties',
          cards: [
            { key: 'topK', label: 'Top-K Value', unit: '', interpretation: function (v) { return 'Retrieving ' + v + ' neighbors'; } },
            { key: 'nearestNeighbor', label: 'Primary Neighbor', unit: '', interpretation: function (v) { return v || 'Pending'; } },
            { key: 'rankStability', label: 'Rank Stability', unit: '', interpretation: function (v) { return 'Stable ranking'; } },
            { key: 'avgSimilarity', label: 'Mean Similarity', unit: '', interpretation: function (v) { return v > 0.8 ? 'High cluster cohesion' : v > 0.6 ? 'Moderate cohesion' : 'Low cohesion'; } }
          ]
        },
        {
          label: 'Geometric Interpretation',
          cards: [
            { key: 'magnitudeEffect', label: 'Magnitude Effect', unit: '', interpretation: function (v) { return v; } },
            { key: 'angleInterpretation', label: 'Angular Relationship', unit: '', interpretation: function (v) { return v; } },
            { key: 'clusterDensity', label: 'Local Density', unit: '', interpretation: function (v) { return v; } }
          ]
        }
      ],
      computeState: function (params, stepIndex, history) {
        var result = runEmbeddingPipeline(params);
        var queryIdx = result.items.indexOf(params.queryItem);
        if (queryIdx < 0) queryIdx = 0;

        var neighbors = result.neighbors.slice(0, params.topK);
        var topMatch = neighbors.length > 0 ? result.items[neighbors[0].index] : '—';
        var topScore = neighbors.length > 0 ? neighbors[0].score : 0;

        var totalScore = 0;
        for (var i = 0; i < neighbors.length; i++) {
          totalScore += neighbors[i].score;
        }
        var avgSim = neighbors.length > 0 ? round4(totalScore / neighbors.length) : 0;

        var closestDist = neighbors.length > 0 ? result.distanceMatrix[queryIdx][neighbors[0].index] : 0;
        var dotProd = neighbors.length > 0 ? result.dotProductMatrix[queryIdx][neighbors[0].index] : 0;

        return {
          query: params.queryItem,
          dimension: 6,
          vectorNorm: result.norms[queryIdx],
          normalized: stepIndex >= 2,
          topMatch: topMatch,
          cosineSim: topScore,
          dotProduct: dotProd,
          euclideanDist: closestDist,
          topK: params.topK,
          nearestNeighbor: topMatch,
          rankStability: 'Stable',
          avgSimilarity: avgSim,
          magnitudeEffect: stepIndex >= 2 ? 'Removed by normalization' : 'Affects dot product',
          angleInterpretation: topScore > 0.9 ? 'Very small angle' : topScore > 0.7 ? 'Small angle' : 'Moderate angle',
          clusterDensity: closestDist < 0.5 ? 'Tight cluster' : closestDist < 1.0 ? 'Moderate spread' : 'Sparse'
        };
      },
      changeDetector: function (prev, curr) {
        var changes = [];
        if (prev && curr) {
          if (prev.topMatch !== curr.topMatch) {
            changes.push({
              from: 'topMatch',
              to: null,
              label: 'Top match changed to "' + curr.topMatch + '"'
            });
          }
          if (prev.cosineSim !== curr.cosineSim) {
            changes.push({
              from: 'cosineSim',
              to: null,
              label: 'Cosine similarity updated to ' + curr.cosineSim.toFixed(3)
            });
          }
          if (prev.normalized !== curr.normalized) {
            changes.push({
              from: 'normalized',
              to: null,
              label: curr.normalized ? 'Vectors normalized — magnitude removed' : 'Normalization pending'
            });
          }
          if (prev.magnitudeEffect !== curr.magnitudeEffect) {
            changes.push({
              from: 'magnitudeEffect',
              to: null,
              label: 'Magnitude effect: ' + curr.magnitudeEffect
            });
          }
        }
        return changes;
      }
    },
    xai: {
      categories: ['Similarity', 'Representation', 'Geometry'],
      crossLabConnections: [
        { trigger: 'highSimilarity', target: 'cosine-similarity', text: 'Compare Euclidean and cosine similarity for these embeddings.', suggestCategory: 'Similarity' },
        { trigger: 'clusterStructure', target: 'kmeans-clustering', text: 'Apply K-Means to discover clusters in the embedding space.', suggestCategory: 'Clustering' }
      ]
    },
    renderPreparation: function (container, params) {
      var result = runEmbeddingPipeline(params);
      var queryIdx = result.items.indexOf(params.queryItem);
      if (queryIdx < 0) queryIdx = 0;

      var neighbors = result.neighbors.slice(0, params.topK);
      var neighborIndices = neighbors.map(function (n) { return n.index; });

      container.innerHTML = '';
      var title = document.createElement('h4');
      title.className = 'nv-lab-obs-title';
      title.textContent = 'Preparation — Embedding Neighborhood View';
      container.appendChild(title);

      var space = document.createElement('div');
      space.className = 'nv-embed-space';
      space.setAttribute('role', 'img');
      space.setAttribute('aria-label', 'Preparation scatter visualization for ' + params.queryItem);

      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 400 300');
      svg.setAttribute('class', 'nv-embed-space-svg');
      svg.setAttribute('aria-hidden', 'true');

      var gridLines = '';
      for (var g = 0; g <= 4; g++) {
        var gx = 40 + (g * 60);
        var gy = 10 + (g * 45);
        gridLines += '<line x1="' + gx + '" y1="10" x2="' + gx + '" y2="190" class="nv-embed-space-grid"/>';
        gridLines += '<line x1="40" y1="' + gy + '" x2="280" y2="' + gy + '" class="nv-embed-space-grid"/>';
      }

      var points = '';
      for (var i = 0; i < result.items.length; i++) {
        var vec = result.vectors[i];
        var px = 35 + ((vec[0] + vec[1]) / 2) * 330;
        var py = 25 + ((vec[2] + vec[3]) / 2) * 240;
        px = Math.max(35, Math.min(365, px));
        py = Math.max(25, Math.min(265, py));

        var isQuery = i === queryIdx;
        var isNeighbor = neighborIndices.indexOf(i) >= 0;

        var fillColor = isQuery ? '#06b6d4' : isNeighbor ? '#22c55e' : '#475569';
        var radius = isQuery ? 6 : isNeighbor ? 5 : 4;
        var strokeColor = isQuery ? '#06b6d4' : isNeighbor ? '#22c55e' : '#64748b';

        points += '<circle cx="' + px + '" cy="' + py + '" r="' + radius + '" fill="' + fillColor + '" stroke="' + strokeColor + '" stroke-width="1.5" class="nv-embed-space-point"/>';
        points += '<text x="' + (px + 8) + '" y="' + (py + 3) + '" class="nv-embed-space-label">' + result.items[i] + '</text>';
      }

      svg.innerHTML = gridLines + points;
      space.appendChild(svg);

      var legend = document.createElement('div');
      legend.className = 'nv-embed-space-legend';
      legend.innerHTML =
        '<span class="nv-embed-space-legend-item"><span class="nv-embed-space-legend-dot" style="background:#06b6d4"></span>Selected</span>' +
        '<span class="nv-embed-space-legend-item"><span class="nv-embed-space-legend-dot" style="background:#22c55e"></span>Neighbors</span>' +
        '<span class="nv-embed-space-legend-item"><span class="nv-embed-space-legend-dot" style="background:#475569"></span>Other Items</span>';

      container.appendChild(space);
      container.appendChild(legend);
    },
    getPreparationTelemetry: function (params) {
      var result = runEmbeddingPipeline(params);
      var queryIdx = result.items.indexOf(params.queryItem);
      if (queryIdx < 0) queryIdx = 0;
      var secondIdx = result.neighbors.length > 0 ? result.neighbors[0].index : 1;
      var initialSimilarity = cosineSimilarity(result.vectors[queryIdx], result.vectors[secondIdx]);

      return [
        { key: 'selectedPair', label: 'Selected Pair', value: params.queryItem + ' / ' + result.items[secondIdx] },
        { key: 'vectorDimensions', label: 'Vector Dimensions', value: '6' },
        { key: 'initialSimilarity', label: 'Initial Similarity', value: String(Math.round(initialSimilarity * 10000) / 10000) },
        { key: 'comparisonState', label: 'Comparison State', value: 'Pending' },
        { key: 'status', label: 'Status', value: 'Ready' }
      ];
    },
    getCompletionSummary: function (result, params) {
      if (!result) return [];
      var queryIdx = result.items.indexOf(params.queryItem);
      if (queryIdx < 0) queryIdx = 0;
      var neighbors = result.neighbors.slice(0, params.topK);
      var bestMatch = neighbors.length > 0 ? result.items[neighbors[0].index] : '\u2014';
      var similarity = neighbors.length > 0 ? neighbors[0].score : 0;

      return [
        { label: 'Best Match', value: bestMatch },
        { label: 'Similarity', value: String(Math.round(similarity * 10000) / 10000) },
        { label: 'Status', value: 'Complete' }
      ];
    },
    execute: function (params) {
      var queryItem = params.queryItem || 'embedding';
      var topK = Math.round(clamp(params.topK || 3, 1, 8));

      if (ITEMS.indexOf(queryItem) < 0) queryItem = 'embedding';

      var result = runEmbeddingPipeline({ queryItem: queryItem, topK: topK });

      return {
        items: result.items,
        vectors: result.vectors,
        norms: result.norms,
        normalizedVectors: result.normalizedVectors,
        dotProductMatrix: result.dotProductMatrix,
        cosineMatrix: result.cosineMatrix,
        distanceMatrix: result.distanceMatrix,
        queryIndex: result.queryIndex,
        neighbors: result.neighbors,
        topMatch: result.topMatch,
        topScore: result.topScore,
        topK: topK
      };
    },
    visualization: {
      type: 'numeric-summary',
      title: 'Embedding Similarity — Representation Geometry'
    },
    scientificStage: { title: 'Embedding neighborhood', scientificQuestion: 'Which embedded items are nearest to the selected query and by how much?', evidence: [{ key: 'Best Match', label: 'Best match' }, { key: 'Similarity', label: 'Similarity' }, { key: 'Vector Dimensions', label: 'Vector dimensions' }], interpretation: 'The selected point, its neighbors, and their geometry provide the similarity evidence.' },
    canonicalStatus: 'reviewed',
    version: '2.0.0',
    reviewedBy: 'NeuralVerse Team',
    lastReviewed: '2026-07-07',
    estimatedDuration: '15 minutes'
  };

  if (window.NeuralVerse.LabRegistry && window.NeuralVerse.LabRegistry.register) {
    window.NeuralVerse.LabRegistry.register(labDefinition);
  }
})();
