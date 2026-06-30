(function () {
  'use strict';

  window.NeuralVerse = window.NeuralVerse || {};

  var TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat', 'and', 'looked', 'at', 'me'];

  var ATTENTION_PATTERNS = {
    'head-1': [
      [0.9, 0.1, 0.05, 0.02, 0.01, 0.01, 0.005, 0.003, 0.001, 0.001],
      [0.2, 0.7, 0.05, 0.03, 0.01, 0.005, 0.003, 0.001, 0.001, 0.000],
      [0.05, 0.15, 0.6, 0.1, 0.05, 0.03, 0.01, 0.005, 0.003, 0.002],
      [0.02, 0.03, 0.1, 0.5, 0.15, 0.1, 0.05, 0.03, 0.01, 0.01],
      [0.01, 0.02, 0.05, 0.15, 0.5, 0.15, 0.05, 0.03, 0.02, 0.02],
      [0.01, 0.01, 0.03, 0.1, 0.15, 0.5, 0.1, 0.05, 0.03, 0.02],
      [0.005, 0.01, 0.01, 0.05, 0.05, 0.1, 0.5, 0.15, 0.07, 0.055],
      [0.003, 0.005, 0.005, 0.03, 0.03, 0.05, 0.15, 0.5, 0.12, 0.107],
      [0.001, 0.003, 0.003, 0.02, 0.03, 0.05, 0.07, 0.12, 0.5, 0.193],
      [0.001, 0.001, 0.002, 0.02, 0.03, 0.05, 0.1, 0.15, 0.2, 0.446]
    ],
    'head-2': [
      [0.5, 0.3, 0.1, 0.05, 0.02, 0.01, 0.01, 0.005, 0.003, 0.002],
      [0.3, 0.5, 0.1, 0.05, 0.02, 0.01, 0.01, 0.005, 0.003, 0.002],
      [0.1, 0.1, 0.5, 0.15, 0.05, 0.05, 0.03, 0.01, 0.005, 0.005],
      [0.05, 0.05, 0.15, 0.5, 0.1, 0.05, 0.05, 0.03, 0.01, 0.01],
      [0.02, 0.02, 0.05, 0.1, 0.5, 0.15, 0.05, 0.05, 0.03, 0.03],
      [0.01, 0.01, 0.05, 0.05, 0.15, 0.5, 0.1, 0.05, 0.05, 0.03],
      [0.01, 0.01, 0.03, 0.05, 0.05, 0.1, 0.5, 0.15, 0.05, 0.05],
      [0.005, 0.005, 0.01, 0.03, 0.05, 0.05, 0.15, 0.5, 0.1, 0.1],
      [0.003, 0.003, 0.005, 0.01, 0.03, 0.05, 0.05, 0.1, 0.5, 0.244],
      [0.002, 0.002, 0.005, 0.01, 0.03, 0.03, 0.05, 0.1, 0.244, 0.524]
    ],
    'head-3': [
      [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
      [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
      [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
      [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
      [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
      [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
      [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
      [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
      [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
      [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]
    ]
  };

  function softmax(row, temperature) {
    var maxVal = -Infinity;
    for (var i = 0; i < row.length; i++) {
      if (row[i] > maxVal) maxVal = row[i];
    }
    var scaled = [];
    var sumExp = 0;
    for (var i = 0; i < row.length; i++) {
      var val = Math.exp((row[i] - maxVal) / temperature);
      scaled.push(val);
      sumExp += val;
    }
    var result = [];
    for (var i = 0; i < scaled.length; i++) {
      result.push(Math.round((scaled[i] / sumExp) * 10000) / 10000);
    }
    return result;
  }

  function entropy(row) {
    var sum = 0;
    for (var i = 0; i < row.length; i++) {
      if (row[i] > 0) {
        sum -= row[i] * Math.log2(row[i]);
      }
    }
    return Math.round(sum * 10000) / 10000;
  }

  function averageHeads(head1, head2, head3, seqLength) {
    var result = [];
    for (var i = 0; i < seqLength; i++) {
      var row = [];
      for (var j = 0; j < seqLength; j++) {
        var avg = (head1[i][j] + head2[i][j] + head3[i][j]) / 3;
        row.push(Math.round(avg * 10000) / 10000);
      }
      result.push(row);
    }
    return result;
  }

  var labDefinition = {
    id: 'lab-transformer-attention',
    slug: 'transformer-attention',
    title: 'Transformer Attention Visualization',
    summary: 'Visualize self-attention weights in a transformer model by adjusting sequence length and attention patterns.',
    category: 'deep-learning',
    artifactReferences: [],
    conceptReferences: ['transformer-architecture', 'self-attention'],
    parameterSchema: [
      {
        name: 'seqLength',
        type: 'integer',
        min: 3,
        max: 10,
        step: 1,
        default: 6,
        label: 'Sequence Length'
      },
      {
        name: 'temperature',
        type: 'slider',
        min: 0.1,
        max: 5.0,
        step: 0.1,
        default: 1.0,
        label: 'Temperature'
      },
      {
        name: 'headFocus',
        type: 'select',
        options: ['head-1', 'head-2', 'head-3', 'average'],
        default: 'head-1',
        label: 'Attention Head'
      }
    ],
    initialState: {
      seqLength: 6,
      temperature: 1.0,
      headFocus: 'head-1'
    },
    execute: function (params) {
      var seqLength = params.seqLength !== undefined ? params.seqLength : 6;
      var temperature = params.temperature !== undefined ? params.temperature : 1.0;
      var headFocus = params.headFocus || 'head-1';

      seqLength = Math.round(Math.max(3, Math.min(10, seqLength)));
      temperature = Math.max(0.1, Math.min(5.0, temperature));

      var tokens = TOKENS.slice(0, seqLength);

      var rawMatrix;
      if (headFocus === 'average') {
        rawMatrix = averageHeads(
          ATTENTION_PATTERNS['head-1'],
          ATTENTION_PATTERNS['head-2'],
          ATTENTION_PATTERNS['head-3'],
          seqLength
        );
      } else {
        var source = ATTENTION_PATTERNS[headFocus];
        rawMatrix = [];
        for (var i = 0; i < seqLength; i++) {
          var row = [];
          for (var j = 0; j < seqLength; j++) {
            row.push(source[i][j]);
          }
          rawMatrix.push(row);
        }
      }

      var softmaxMatrix = [];
      var entropyPerRow = [];
      for (var i = 0; i < seqLength; i++) {
        var softRow = softmax(rawMatrix[i], temperature);
        softmaxMatrix.push(softRow);
        entropyPerRow.push(entropy(softRow));
      }

      var totalEntropy = 0;
      for (var i = 0; i < entropyPerRow.length; i++) {
        totalEntropy += entropyPerRow[i];
      }
      var avgEntropy = seqLength > 0 ? totalEntropy / seqLength : 0;

      return {
        attentionMatrix: rawMatrix,
        tokens: tokens,
        softmaxMatrix: softmaxMatrix,
        entropyPerRow: entropyPerRow,
        averageEntropy: Math.round(avgEntropy * 10000) / 10000
      };
    },
    visualization: {
      type: 'heatmap',
      title: 'Self-Attention Weights'
    },
    canonicalStatus: 'reviewed',
    version: '1.0.0',
    reviewedBy: 'NeuralVerse Team',
    lastReviewed: '2026-06-25',
    estimatedDuration: '12 minutes'
  };

  if (window.NeuralVerse.LabRegistry && window.NeuralVerse.LabRegistry.register) {
    window.NeuralVerse.LabRegistry.register(labDefinition);
  }
})();
