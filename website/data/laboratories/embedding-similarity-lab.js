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

  var WORDS = ['cat', 'dog', 'car', 'house', 'tree', 'book'];

  var BASE_VECTORS = [
    [0.8, 0.2, 0.7, 0.1, 0.3, 0.5, 0.9, 0.4],
    [0.75, 0.25, 0.65, 0.15, 0.35, 0.45, 0.85, 0.35],
    [0.1, 0.7, 0.2, 0.8, 0.6, 0.3, 0.1, 0.9],
    [0.15, 0.65, 0.25, 0.75, 0.55, 0.35, 0.15, 0.85],
    [0.5, 0.4, 0.6, 0.3, 0.2, 0.7, 0.5, 0.3],
    [0.3, 0.6, 0.4, 0.5, 0.7, 0.2, 0.3, 0.6]
  ];

  function generateEmbeddings(dimension, scale) {
    var vectors = [];
    for (var i = 0; i < WORDS.length; i++) {
      var vec = [];
      for (var d = 0; d < dimension; d++) {
        var baseIdx = d % BASE_VECTORS[i].length;
        vec.push(Math.round(BASE_VECTORS[i][baseIdx] * scale * 10000) / 10000);
      }
      vectors.push(vec);
    }
    return vectors;
  }

  function dotProduct(a, b) {
    var sum = 0;
    for (var i = 0; i < a.length; i++) {
      sum += a[i] * b[i];
    }
    return sum;
  }

  function magnitude(v) {
    var sum = 0;
    for (var i = 0; i < v.length; i++) {
      sum += v[i] * v[i];
    }
    return Math.sqrt(sum);
  }

  function cosineSimilarity(a, b) {
    var magA = magnitude(a);
    var magB = magnitude(b);
    if (magA === 0 || magB === 0) return 0;
    return dotProduct(a, b) / (magA * magB);
  }

  function computeSimilarityMatrix(vectors) {
    var n = vectors.length;
    var matrix = [];
    for (var i = 0; i < n; i++) {
      var row = [];
      for (var j = 0; j < n; j++) {
        row.push(Math.round(cosineSimilarity(vectors[i], vectors[j]) * 10000) / 10000);
      }
      matrix.push(row);
    }
    return matrix;
  }

  function computePairwiseSimilarities(words, matrix) {
    var similarities = [];
    for (var i = 0; i < words.length; i++) {
      for (var j = i + 1; j < words.length; j++) {
        similarities.push({
          word1: words[i],
          word2: words[j],
          score: matrix[i][j]
        });
      }
    }
    similarities.sort(function (a, b) { return b.score - a.score; });
    return similarities;
  }

  var labDefinition = {
    id: 'lab-embedding-similarity',
    slug: 'embedding-similarity',
    title: 'Embedding Similarity',
    summary: 'Explore how word embeddings capture semantic similarity by comparing vector representations of words.',
    category: 'natural-language-processing',
    artifactReferences: [],
    conceptReferences: ['word-embeddings'],
    parameterSchema: [
      {
        name: 'dimension',
        type: 'integer',
        min: 2,
        max: 8,
        step: 1,
        default: 3,
        label: 'Embedding Dimension'
      },
      {
        name: 'scale',
        type: 'slider',
        min: 0.5,
        max: 3.0,
        step: 0.1,
        default: 1.0,
        label: 'Scale'
      }
    ],
    initialState: {
      dimension: 3,
      scale: 1.0
    },
    execute: function (params) {
      var dimension = params.dimension !== undefined ? params.dimension : 3;
      var scale = params.scale !== undefined ? params.scale : 1.0;

      dimension = Math.round(dimension);
      dimension = Math.max(2, Math.min(8, dimension));
      scale = Math.max(0.5, Math.min(3.0, scale));

      var vectors = generateEmbeddings(dimension, scale);
      var similarityMatrix = computeSimilarityMatrix(vectors);
      var similarities = computePairwiseSimilarities(WORDS, similarityMatrix);

      return {
        words: WORDS.slice(),
        vectors: vectors,
        similarityMatrix: similarityMatrix,
        similarities: similarities
      };
    },
    visualization: {
      type: 'heatmap',
      title: 'Embedding Similarity Heatmap'
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
