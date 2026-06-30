(function () {
  'use strict';

  window.NeuralVerse = window.NeuralVerse || {};

  function dotProduct(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }

  function magnitude(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  }

  var labDefinition = {
    id: 'lab-cosine-similarity',
    slug: 'cosine-similarity',
    title: 'Cosine Similarity',
    summary: 'Understand cosine similarity by adjusting two vectors and observing the angle and similarity score.',
    category: 'mathematics',
    artifactReferences: [],
    conceptReferences: ['vector-similarity'],
    parameterSchema: [
      {
        name: 'vec1X',
        type: 'slider',
        min: -5,
        max: 5,
        step: 0.1,
        default: 1.0,
        label: 'Vector 1 — X'
      },
      {
        name: 'vec1Y',
        type: 'slider',
        min: -5,
        max: 5,
        step: 0.1,
        default: 2.0,
        label: 'Vector 1 — Y'
      },
      {
        name: 'vec2X',
        type: 'slider',
        min: -5,
        max: 5,
        step: 0.1,
        default: 3.0,
        label: 'Vector 2 — X'
      },
      {
        name: 'vec2Y',
        type: 'slider',
        min: -5,
        max: 5,
        step: 0.1,
        default: 1.0,
        label: 'Vector 2 — Y'
      }
    ],
    initialState: {
      vec1X: 1.0,
      vec1Y: 2.0,
      vec2X: 3.0,
      vec2Y: 1.0
    },
    execute: function (params) {
      var vec1X = params.vec1X !== undefined ? params.vec1X : 1.0;
      var vec1Y = params.vec1Y !== undefined ? params.vec1Y : 2.0;
      var vec2X = params.vec2X !== undefined ? params.vec2X : 3.0;
      var vec2Y = params.vec2Y !== undefined ? params.vec2Y : 1.0;

      var v1 = [vec1X, vec1Y];
      var v2 = [vec2X, vec2Y];

      var mag1 = magnitude(v1);
      var mag2 = magnitude(v2);
      var dp = dotProduct(v1, v2);

      var cosineSim = 0;
      if (mag1 > 0 && mag2 > 0) {
        cosineSim = dp / (mag1 * mag2);
      }
      cosineSim = Math.max(-1, Math.min(1, cosineSim));

      var euclideanDist = Math.sqrt(
        Math.pow(v1[0] - v2[0], 2) + Math.pow(v1[1] - v2[1], 2)
      );

      var angleRad = Math.acos(cosineSim);
      var angleDeg = angleRad * (180 / Math.PI);

      return {
        vector1: [Math.round(v1[0] * 10000) / 10000, Math.round(v1[1] * 10000) / 10000],
        vector2: [Math.round(v2[0] * 10000) / 10000, Math.round(v2[1] * 10000) / 10000],
        cosineSimilarity: Math.round(cosineSim * 10000) / 10000,
        euclideanDistance: Math.round(euclideanDist * 10000) / 10000,
        dotProduct: Math.round(dp * 10000) / 10000,
        angleDegrees: Math.round(angleDeg * 10000) / 10000,
        visualization: {
          vectors: [
            [Math.round(v1[0] * 10000) / 10000, Math.round(v1[1] * 10000) / 10000],
            [Math.round(v2[0] * 10000) / 10000, Math.round(v2[1] * 10000) / 10000]
          ],
          angle: Math.round(angleDeg * 10000) / 10000
        }
      };
    },
    visualization: {
      type: 'svg-diagram',
      title: 'Vector Similarity Visualization'
    },
    canonicalStatus: 'reviewed',
    version: '1.0.0',
    reviewedBy: 'NeuralVerse Team',
    lastReviewed: '2026-06-25',
    estimatedDuration: '8 minutes'
  };

  if (window.NeuralVerse.LabRegistry && window.NeuralVerse.LabRegistry.register) {
    window.NeuralVerse.LabRegistry.register(labDefinition);
  }
})();
