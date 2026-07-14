(function () {
  'use strict';

  window.NeuralVerse = window.NeuralVerse || {};

  var SEQUENCES = {
    'cat-sat': ['The', 'cat', 'sat', 'on', 'the', 'mat'],
    'attention': ['Attention', 'links', 'tokens', 'to', 'each', 'other'],
    'neural': ['Neural', 'models', 'learn', 'context', 'from', 'data']
  };

  function seededRandom(seed) {
    var state = seed % 2147483647;
    if (state <= 0) state += 2147483646;
    return function () {
      state = (state * 16807) % 2147483647;
      return (state - 1) / 2147483646;
    };
  }

  function buildEmbeddings(tokens, dModel, seed) {
    var rng = seededRandom(seed || 42);
    var embeddings = [];
    for (var i = 0; i < tokens.length; i++) {
      var vec = [];
      for (var d = 0; d < dModel; d++) {
        var hash = 0;
        for (var c = 0; c < tokens[i].length; c++) {
          hash = ((hash << 5) - hash + tokens[i].charCodeAt(c)) | 0;
        }
        vec.push(Math.round(((hash * (d + 1) * 0.001 + rng() * 0.1) % 2 - 1) * 1000) / 1000);
      }
      embeddings.push(vec);
    }
    return embeddings;
  }

  function buildProjectionMatrix(dModel, dHead, seed) {
    var rng = seededRandom(seed);
    var matrix = [];
    for (var i = 0; i < dModel; i++) {
      var row = [];
      for (var j = 0; j < dHead; j++) {
        row.push(Math.round((rng() * 2 - 1) * 1000) / 1000);
      }
      matrix.push(row);
    }
    return matrix;
  }

  function matmul(vecs, matrix) {
    var result = [];
    for (var i = 0; i < vecs.length; i++) {
      var row = [];
      for (var j = 0; j < matrix[0].length; j++) {
        var sum = 0;
        for (var k = 0; k < vecs[i].length; k++) {
          sum += vecs[i][k] * matrix[k][j];
        }
        row.push(Math.round(sum * 1000) / 1000);
      }
      result.push(row);
    }
    return result;
  }

  function transpose(mat) {
    var result = [];
    for (var j = 0; j < mat[0].length; j++) {
      var row = [];
      for (var i = 0; i < mat.length; i++) {
        row.push(mat[i][j]);
      }
      result.push(row);
    }
    return result;
  }

  function matmulAB(A, B) {
    var BT = transpose(B);
    var result = [];
    for (var i = 0; i < A.length; i++) {
      var row = [];
      for (var j = 0; j < BT.length; j++) {
        var sum = 0;
        for (var k = 0; k < A[i].length; k++) {
          sum += A[i][k] * BT[j][k];
        }
        row.push(Math.round(sum * 1000) / 1000);
      }
      result.push(row);
    }
    return result;
  }

  function stableSoftmax(row, temperature) {
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
      if (row[i] > 0) sum -= row[i] * Math.log2(row[i]);
    }
    return Math.round(sum * 10000) / 10000;
  }

  function computeAttention(tokens, dModel, dHead, temperature, causalMask, seed) {
    var embeddings = buildEmbeddings(tokens, dModel, seed || 42);
    var Wq = buildProjectionMatrix(dModel, dHead, seed || 100);
    var Wk = buildProjectionMatrix(dModel, dHead, seed || 200);
    var Wv = buildProjectionMatrix(dModel, dHead, seed || 300);

    var Q = matmul(embeddings, Wq);
    var K = matmul(embeddings, Wk);
    var V = matmul(embeddings, Wv);

    var rawScores = matmulAB(Q, K);
    var scale = Math.sqrt(dHead);
    var scaledScores = [];
    for (var i = 0; i < rawScores.length; i++) {
      var row = [];
      for (var j = 0; j < rawScores[i].length; j++) {
        row.push(Math.round((rawScores[i][j] / scale) * 1000) / 1000);
      }
      scaledScores.push(row);
    }

    if (causalMask) {
      for (var i = 0; i < scaledScores.length; i++) {
        for (var j = i + 1; j < scaledScores[i].length; j++) {
          scaledScores[i][j] = -1e9;
        }
      }
    }

    var attentionWeights = [];
    var entropyPerRow = [];
    for (var i = 0; i < scaledScores.length; i++) {
      var softRow = stableSoftmax(scaledScores[i], temperature);
      attentionWeights.push(softRow);
      entropyPerRow.push(entropy(softRow));
    }

    var context = matmulAB(attentionWeights, V);

    var qNorm = 0, kNorm = 0, vNorm = 0;
    for (var i = 0; i < Q.length; i++) {
      for (var j = 0; j < Q[i].length; j++) {
        qNorm += Q[i][j] * Q[i][j];
        kNorm += K[i][j] * K[i][j];
        vNorm += V[i][j] * V[i][j];
      }
    }
    qNorm = Math.round(Math.sqrt(qNorm) * 100) / 100;
    kNorm = Math.round(Math.sqrt(kNorm) * 100) / 100;
    vNorm = Math.round(Math.sqrt(vNorm) * 100) / 100;

    var totalEntropy = 0;
    for (var i = 0; i < entropyPerRow.length; i++) totalEntropy += entropyPerRow[i];
    var avgEntropy = tokens.length > 0 ? totalEntropy / tokens.length : 0;

    var maxScore = -Infinity, minScore = Infinity;
    for (var i = 0; i < rawScores.length; i++) {
      for (var j = 0; j < rawScores[i].length; j++) {
        if (rawScores[i][j] > maxScore) maxScore = rawScores[i][j];
        if (rawScores[i][j] < minScore) minScore = rawScores[i][j];
      }
    }

    var strongestLink = { from: 0, to: 0, value: 0 };
    for (var i = 0; i < attentionWeights.length; i++) {
      for (var j = 0; j < attentionWeights[i].length; j++) {
        if (attentionWeights[i][j] > strongestLink.value) {
          strongestLink = { from: i, to: j, value: attentionWeights[i][j] };
        }
      }
    }

    return {
      tokens: tokens,
      embeddings: embeddings,
      Q: Q, K: K, V: V,
      Wq: Wq, Wk: Wk, Wv: Wv,
      rawScores: rawScores,
      scaledScores: scaledScores,
      attentionWeights: attentionWeights,
      context: context,
      entropyPerRow: entropyPerRow,
      averageEntropy: Math.round(avgEntropy * 10000) / 10000,
      qNorm: qNorm, kNorm: kNorm, vNorm: vNorm,
      scale: Math.round(scale * 100) / 100,
      scoreRange: [minScore, maxScore],
      strongestLink: strongestLink,
      seqLength: tokens.length,
      dModel: dModel,
      dHead: dHead
    };
  }

  function buildSteps(tokens, dModel, dHead, temperature, causalMask, seed) {
    var steps = [];
    var embeddings = buildEmbeddings(tokens, dModel, seed || 42);
    var Wq = buildProjectionMatrix(dModel, dHead, seed || 100);
    var Wk = buildProjectionMatrix(dModel, dHead, seed || 200);
    var Wv = buildProjectionMatrix(dModel, dHead, seed || 300);

    steps.push({
      label: 'Tokenize',
      log: 'Tokenized input sequence: ' + tokens.length + ' tokens',
      state: function () { return { tokens: tokens, phase: 'tokenize' }; },
      metrics: function () { return { 'Tokens': tokens.length, 'Phase': 'Tokenize', 'Status': 'Ready' }; },
      viz: function () { return { tokens: tokens, phase: 'tokenize' }; }
    });

    steps.push({
      label: 'Embed',
      log: 'Built token embeddings in ' + dModel + '-dimensional space',
      state: function () { return { tokens: tokens, dModel: dModel, phase: 'embed' }; },
      metrics: function () { return { 'Dimension': dModel, 'Phase': 'Embed', 'Status': 'Building' }; },
      viz: function () { return { tokens: tokens, embeddings: embeddings, phase: 'embed' }; }
    });

    var Q = matmul(embeddings, Wq);
    steps.push({
      label: 'Project Q',
      log: 'Query projection computed: Q = X × Wq',
      state: function () { return { Q: Q, phase: 'project-q' }; },
      metrics: function () { return { 'Shape': tokens.length + '×' + dHead, 'Phase': 'Q Projection', 'Status': 'Computing' }; },
      viz: function () { return { tokens: tokens, Q: Q, phase: 'project-q' }; }
    });

    var K = matmul(embeddings, Wk);
    steps.push({
      label: 'Project K',
      log: 'Key projection computed: K = X × Wk',
      state: function () { return { K: K, phase: 'project-k' }; },
      metrics: function () { return { 'Shape': tokens.length + '×' + dHead, 'Phase': 'K Projection', 'Status': 'Computing' }; },
      viz: function () { return { tokens: tokens, K: K, phase: 'project-k' }; }
    });

    var V = matmul(embeddings, Wv);
    steps.push({
      label: 'Project V',
      log: 'Value projection computed: V = X × Wv',
      state: function () { return { V: V, phase: 'project-v' }; },
      metrics: function () { return { 'Shape': tokens.length + '×' + dHead, 'Phase': 'V Projection', 'Status': 'Computing' }; },
      viz: function () { return { tokens: tokens, V: V, phase: 'project-v' }; }
    });

    var rawScores = matmulAB(Q, K);
    steps.push({
      label: 'Score QK\u1D40',
      log: 'Raw attention scores computed: Q×K\u1D40',
      state: function () { return { rawScores: rawScores, phase: 'score' }; },
      metrics: function () { return { 'Shape': tokens.length + '×' + tokens.length, 'Phase': 'Scoring', 'Status': 'Computing' }; },
      viz: function () { return { tokens: tokens, rawScores: rawScores, phase: 'score' }; }
    });

    var scale = Math.sqrt(dHead);
    var scaledScores = [];
    for (var i = 0; i < rawScores.length; i++) {
      var row = [];
      for (var j = 0; j < rawScores[i].length; j++) {
        row.push(Math.round((rawScores[i][j] / scale) * 1000) / 1000);
      }
      scaledScores.push(row);
    }
    steps.push({
      label: 'Scale',
      log: 'Scaled attention scores by \u221Ad_k to prevent gradient vanishing',
      state: function () { return { scaledScores: scaledScores, scale: scale, phase: 'scale' }; },
      metrics: function () { return { 'Scale': scale.toFixed(2), 'Phase': 'Scaling', 'Status': 'Computing' }; },
      viz: function () { return { tokens: tokens, scaledScores: scaledScores, phase: 'scale' }; }
    });

    if (causalMask) {
      for (var i = 0; i < scaledScores.length; i++) {
        for (var j = i + 1; j < scaledScores[i].length; j++) {
          scaledScores[i][j] = -1e9;
        }
      }
      steps.push({
        label: 'Mask',
        log: 'Causal mask applied: future tokens cannot attend to past',
        state: function () { return { scaledScores: scaledScores, causalMask: true, phase: 'mask' }; },
        metrics: function () { return { 'Mask': 'Causal', 'Phase': 'Masking', 'Status': 'Applied' }; },
        viz: function () { return { tokens: tokens, scaledScores: scaledScores, causalMask: true, phase: 'mask' }; }
      });
    }

    var attentionWeights = [];
    var entropyPerRow = [];
    for (var i = 0; i < scaledScores.length; i++) {
      var softRow = stableSoftmax(scaledScores[i], temperature);
      attentionWeights.push(softRow);
      entropyPerRow.push(entropy(softRow));
    }
    steps.push({
      label: 'Softmax',
      log: 'Softmax applied row-wise with temperature T=' + temperature,
      state: function () { return { attentionWeights: attentionWeights, phase: 'softmax' }; },
      metrics: function () { return { 'Rows': tokens.length, 'Phase': 'Softmax', 'Status': 'Normalized' }; },
      viz: function () { return { tokens: tokens, attentionWeights: attentionWeights, phase: 'softmax' }; }
    });

    var context = matmulAB(attentionWeights, V);
    steps.push({
      label: 'Context',
      log: 'Context vectors computed: weighted sum of values',
      state: function () { return { context: context, phase: 'context' }; },
      metrics: function () { return { 'Shape': tokens.length + '×' + dHead, 'Phase': 'Context', 'Status': 'Computed' }; },
      viz: function () { return { tokens: tokens, context: context, attentionWeights: attentionWeights, phase: 'context' }; }
    });

    var totalEntropy = 0;
    for (var i = 0; i < entropyPerRow.length; i++) totalEntropy += entropyPerRow[i];
    var avgEntropy = tokens.length > 0 ? totalEntropy / tokens.length : 0;
    var strongestLink = { from: 0, to: 0, value: 0 };
    for (var i = 0; i < attentionWeights.length; i++) {
      for (var j = 0; j < attentionWeights[i].length; j++) {
        if (attentionWeights[i][j] > strongestLink.value) {
          strongestLink = { from: i, to: j, value: attentionWeights[i][j] };
        }
      }
    }

    steps.push({
      label: 'Analyze',
      log: 'Strongest attention link identified: ' + tokens[strongestLink.from] + ' attends to ' + tokens[strongestLink.to] + ' with weight ' + strongestLink.value.toFixed(3),
      state: function () {
        return {
          tokens: tokens, attentionWeights: attentionWeights, context: context,
          entropyPerRow: entropyPerRow, averageEntropy: Math.round(avgEntropy * 10000) / 10000,
          strongestLink: strongestLink, phase: 'analyze'
        };
      },
      metrics: function () {
        return {
          'Entropy': Math.round(avgEntropy * 10000) / 10000,
          'Strongest': '"' + tokens[strongestLink.from] + '"→"' + tokens[strongestLink.to] + '"',
          'Phase': 'Analyze', 'Status': 'Done'
        };
      },
      viz: function () {
        return { tokens: tokens, attentionWeights: attentionWeights, context: context, strongestLink: strongestLink, phase: 'analyze' };
      }
    });

    steps.push({
      label: 'Complete',
      log: 'Self-attention complete: context vectors formed from weighted value aggregation',
      state: function () {
        return {
          tokens: tokens, attentionWeights: attentionWeights, context: context,
          entropyPerRow: entropyPerRow, averageEntropy: Math.round(avgEntropy * 10000) / 10000,
          strongestLink: strongestLink, phase: 'finished'
        };
      },
      metrics: function () { return { 'Phase': 'Complete', 'Status': 'Done' }; },
      viz: function () {
        return { tokens: tokens, attentionWeights: attentionWeights, context: context, strongestLink: strongestLink, phase: 'finished' };
      }
    });

    return steps;
  }

  var labDefinition = {
    id: 'lab-transformer-attention',
    slug: 'transformer-attention',
    title: 'Transformer Attention',
    summary: 'Watch self-attention being computed step by step: from tokens to embeddings, Q/K/V projections, score computation, softmax normalization, and context vector formation.',
    category: 'deep-learning',
    artifactReferences: [],
    conceptReferences: ['transformer-architecture', 'self-attention'],
    parameterSchema: [
      {
        name: 'seqLength',
        type: 'integer',
        min: 3,
        max: 6,
        step: 1,
        default: 6,
        label: 'Sequence Length'
      },
      {
        name: 'dModel',
        type: 'select',
        options: ['4', '8', '16'],
        default: '4',
        label: 'Embedding Dimension'
      },
      {
        name: 'temperature',
        type: 'slider',
        min: 0.1,
        max: 3.0,
        step: 0.1,
        default: 1.0,
        label: 'Temperature'
      },
      {
        name: 'causalMask',
        type: 'boolean',
        default: false,
        label: 'Causal Mask'
      }
    ],
    initialState: {
      seqLength: 6,
      dModel: '4',
      temperature: 1.0,
      causalMask: false
    },
    steps: (function () {
      var tokens = SEQUENCES['cat-sat'].slice(0, 6);
      return buildSteps(tokens, 4, 4, 1.0, false, 42);
    })(),
    inspector: {
      title: 'Attention State',
      sections: [
        {
          label: 'Input Properties',
          cards: [
            { key: 'seqLength', label: 'Sequence Length', interpretation: function (v) { return v + ' tokens in sequence'; } },
            { key: 'dModel', label: 'Embedding Dimension', interpretation: function (v) { return 'd_model = ' + v; } },
            { key: 'maskMode', label: 'Mask Mode', interpretation: function (v) { return v ? 'Causal — future tokens masked' : 'Bidirectional — all tokens visible'; } }
          ]
        },
        {
          label: 'Projection Magnitudes',
          cards: [
            { key: 'qNorm', label: '||Q|| Query Norm', interpretation: function (v) { return 'Query projection magnitude'; } },
            { key: 'kNorm', label: '||K|| Key Norm', interpretation: function (v) { return 'Key projection magnitude'; } },
            { key: 'vNorm', label: '||V|| Value Norm', interpretation: function (v) { return 'Value projection magnitude'; } }
          ]
        },
        {
          label: 'Attention Properties',
          cards: [
            { key: 'scoreRange', label: 'Score Range', interpretation: function (v) { return 'Raw scores: [' + v + ']'; } },
            { key: 'avgEntropy', aliases: ['attentionEntropy'], label: 'Attention Entropy', interpretation: function (v) { return v < 1.5 ? 'Focused attention' : v < 3.0 ? 'Moderate spread' : 'Diffuse attention'; } },
            { key: 'strongestLink', label: 'Strongest Attention Link', interpretation: function (v) { if (!v) return 'Computing...'; if (typeof v === 'string') return '"' + v + '"'; return '"' + v.from + '" → "' + v.to + '"'; } },
            { key: 'rowSum', label: 'Row Sum Validation', interpretation: function (v) { return v === 1 ? 'Valid probability distribution' : 'Normalized'; } }
          ]
        }
      ],
      computeState: function (params, stepIndex) {
        var tokens = (SEQUENCES['cat-sat'] || SEQUENCES['cat-sat']).slice(0, params.seqLength || 6);
        var dModel = parseInt(params.dModel) || 4;
        var result = computeAttention(tokens, dModel, dModel, params.temperature || 1.0, params.causalMask || false, 42);

        var maxWeight = 0;
        var dominantIdx = 0;
        for (var i = 0; i < result.attentionWeights.length; i++) {
          for (var j = 0; j < result.attentionWeights[i].length; j++) {
            if (result.attentionWeights[i][j] > maxWeight) {
              maxWeight = result.attentionWeights[i][j];
              dominantIdx = j;
            }
          }
        }

        var strongCount = 0;
        for (var i = 0; i < result.attentionWeights.length; i++) {
          for (var j = 0; j < result.attentionWeights[i].length; j++) {
            if (result.attentionWeights[i][j] > 0.3 && i !== j) strongCount++;
          }
        }

        return {
          seqLength: result.seqLength,
          dModel: result.dModel,
          maskMode: params.causalMask || false,
          qNorm: result.qNorm,
          kNorm: result.kNorm,
          vNorm: result.vNorm,
          scoreRange: '[' + result.scoreRange[0].toFixed(2) + ', ' + result.scoreRange[1].toFixed(2) + ']',
          avgEntropy: result.averageEntropy,
          strongestLink: result.strongestLink ? (result.strongestLink.from + ' → ' + result.strongestLink.to) : '—',
          rowSum: 1,
          attentionEntropy: result.averageEntropy,
          numTokens: tokens.length,
          maxAttentionWeight: maxWeight,
          dominantToken: tokens[dominantIdx] || '—',
          strongLinks: strongCount
        };
      },
      changeDetector: function (prev, curr) {
        var changes = [];
        if (prev && curr) {
          if (prev.avgEntropy !== curr.avgEntropy) changes.push({ from: 'avgEntropy', to: null, label: 'Attention entropy changed' });
          if (prev.strongestLink !== curr.strongestLink && curr.strongestLink !== '—') {
            changes.push({ from: 'strongestLink', to: null, label: 'Strongest link: ' + curr.strongestLink });
          }
        }
        return changes;
      }
    },
    observations: [
      {
        id: 'token-flow',
        title: 'Token Flow',
        purpose: 'How does information move across tokens?',
        defaultSize: 'large',
        render: function (container, params, stepIndex) {
          var tokens = (SEQUENCES['cat-sat'] || SEQUENCES['cat-sat']).slice(0, params.seqLength || 6);
          var dModel = parseInt(params.dModel) || 4;
          var result = computeAttention(tokens, dModel, dModel, params.temperature || 1.0, params.causalMask || false, 42);

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Token Flow';
          container.appendChild(title);

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 400 300');
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', 'Token attention flow');
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxHeight = '250px';

          var tokenPositions = [];
          var spacing = 400 / (tokens.length + 1);
          for (var i = 0; i < tokens.length; i++) {
            tokenPositions.push({ x: spacing * (i + 1), y: 50 });
          }

          for (var i = 0; i < tokens.length; i++) {
            for (var j = 0; j < tokens.length; j++) {
              if (i === j) continue;
              var weight = result.attentionWeights[i][j];
              if (weight > 0.05) {
                var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', tokenPositions[j].x);
                line.setAttribute('y1', tokenPositions[j].y + 15);
                line.setAttribute('x2', tokenPositions[i].x);
                line.setAttribute('y2', tokenPositions[i].y - 15);
                line.setAttribute('stroke', '#06b6d4');
                line.setAttribute('stroke-width', String(Math.max(0.5, weight * 4)));
                line.setAttribute('opacity', String(Math.min(1, weight * 2)));
                svg.appendChild(line);
              }
            }
          }

          tokenPositions.forEach(function (pos, i) {
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', pos.x);
            circle.setAttribute('cy', pos.y);
            circle.setAttribute('r', '12');
            circle.setAttribute('fill', '#1e293b');
            circle.setAttribute('stroke', '#06b6d4');
            circle.setAttribute('stroke-width', '1.5');
            svg.appendChild(circle);

            var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', pos.x);
            text.setAttribute('y', pos.y + 4);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#e2e8f0');
            text.setAttribute('font-size', '8');
            text.setAttribute('font-family', 'monospace');
            text.textContent = tokens[i];
            svg.appendChild(text);
          });

          container.appendChild(svg);
        },
        interpretation: function (params, stepIndex) { return 'Attention flow lines show which tokens attend to which — thicker lines indicate stronger attention.'; }
      },
      {
        id: 'qk-scores',
        title: 'QK\u1D40 Scores',
        purpose: 'Which token pairs are similar before softmax?',
        defaultSize: 'small',
        render: function (container, params) {
          var tokens = (SEQUENCES['cat-sat'] || SEQUENCES['cat-sat']).slice(0, params.seqLength || 6);
          var dModel = parseInt(params.dModel) || 4;
          var result = computeAttention(tokens, dModel, dModel, params.temperature || 1.0, params.causalMask || false, 42);

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'QK\u1D40 Scores (Scaled)';
          container.appendChild(title);

          window.NeuralVerse.VisualizationEngine.renderHeatmap(container, result.scaledScores, { title: '' });
        },
        interpretation: function (params, stepIndex) { return 'Scaled QK^T scores before softmax reveal raw similarity between query and key vectors.'; }
      },
      {
        id: 'attention-matrix',
        title: 'Attention Matrix',
        purpose: 'Where does each token attend after softmax?',
        defaultSize: 'small',
        render: function (container, params) {
          var tokens = (SEQUENCES['cat-sat'] || SEQUENCES['cat-sat']).slice(0, params.seqLength || 6);
          var dModel = parseInt(params.dModel) || 4;
          var result = computeAttention(tokens, dModel, dModel, params.temperature || 1.0, params.causalMask || false, 42);

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Attention Weights';
          container.appendChild(title);

          window.NeuralVerse.VisualizationEngine.renderHeatmap(container, result.attentionWeights, { title: '' });
        },
        interpretation: function (params, stepIndex) { return 'After softmax, each row sums to 1 — a probability distribution over tokens.'; }
      },
      {
        id: 'context-vectors',
        title: 'Context Vectors',
        purpose: 'How are value vectors mixed into contextual outputs?',
        defaultSize: 'small',
        render: function (container, params) {
          var tokens = (SEQUENCES['cat-sat'] || SEQUENCES['cat-sat']).slice(0, params.seqLength || 6);
          var dModel = parseInt(params.dModel) || 4;
          var result = computeAttention(tokens, dModel, dModel, params.temperature || 1.0, params.causalMask || false, 42);

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Context Vectors';
          container.appendChild(title);

          var table = document.createElement('div');
          table.className = 'nv-lab-table-wrapper';
          var tbl = document.createElement('table');
          tbl.className = 'nv-lab-table';
          var thead = document.createElement('thead');
          var headRow = document.createElement('tr');
          var thToken = document.createElement('th');
          thToken.textContent = 'Token';
          headRow.appendChild(thToken);
          for (var d = 0; d < Math.min(result.context[0].length, 4); d++) {
            var th = document.createElement('th');
            th.textContent = 'C' + d;
            headRow.appendChild(th);
          }
          thead.appendChild(headRow);
          tbl.appendChild(thead);

          var tbody = document.createElement('tbody');
          for (var i = 0; i < result.context.length; i++) {
            var tr = document.createElement('tr');
            var tdToken = document.createElement('td');
            tdToken.textContent = tokens[i];
            tdToken.style.fontWeight = '600';
            tr.appendChild(tdToken);
            for (var d = 0; d < Math.min(result.context[i].length, 4); d++) {
              var td = document.createElement('td');
              td.textContent = result.context[i][d].toFixed(3);
              tr.appendChild(td);
            }
            tbody.appendChild(tr);
          }
          tbl.appendChild(tbody);
          table.appendChild(tbl);
          container.appendChild(table);
        },
        interpretation: function (params, stepIndex) { return 'Context vectors are weighted averages of values, where weights come from attention.'; }
      }
    ],
    xai: {
      categories: ['Attention', 'Representation', 'Similarity'],
      crossLabConnections: [
        { trigger: 'focusedAttention', target: 'embedding-similarity', text: 'Investigate the geometry of heavily attended tokens.', suggestCategory: 'Representation' },
        { trigger: 'diffuseAttention', target: 'cosine-similarity', text: 'Examine vector similarity when attention is spread evenly.', suggestCategory: 'Similarity' }
      ]
    },
    renderPreparation: function (container, params) {
      var tokens = (SEQUENCES['cat-sat'] || SEQUENCES['cat-sat']).slice(0, params.seqLength || 6);
      var dModel = parseInt(params.dModel) || 4;
      var result = computeAttention(tokens, dModel, dModel, params.temperature || 1.0, params.causalMask || false, 42);

      container.innerHTML = '';
      var title = document.createElement('h4');
      title.className = 'nv-lab-obs-title';
      title.textContent = 'Preparation';
      container.appendChild(title);

      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 400 350');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'Initial attention preparation');
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxHeight = '300px';

      var spacing = 400 / (tokens.length + 1);
      for (var i = 0; i < tokens.length; i++) {
        var x = spacing * (i + 1);
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', String(x - 25));
        rect.setAttribute('y', '20');
        rect.setAttribute('width', '50');
        rect.setAttribute('height', '24');
        rect.setAttribute('rx', '4');
        rect.setAttribute('fill', '#1e293b');
        rect.setAttribute('stroke', '#06b6d4');
        rect.setAttribute('stroke-width', '1');
        svg.appendChild(rect);

        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', String(x));
        text.setAttribute('y', '36');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#e2e8f0');
        text.setAttribute('font-size', '9');
        text.setAttribute('font-family', 'monospace');
        text.textContent = tokens[i];
        svg.appendChild(text);
      }

      var matrix = result.attentionWeights;
      var cellW = 320 / matrix.length;
      var cellH = 240 / matrix.length;
      var offsetX = 40;
      var offsetY = 60;

      for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[i].length; j++) {
          var val = matrix[i][j];
          var r = Math.round(6 + val * 200);
          var g = Math.round(29 + (1 - val) * 80);
          var b = Math.round(59 + (1 - val) * 190);

          var cell = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          cell.setAttribute('x', String(offsetX + j * cellW));
          cell.setAttribute('y', String(offsetY + i * cellH));
          cell.setAttribute('width', String(cellW - 1));
          cell.setAttribute('height', String(cellH - 1));
          cell.setAttribute('rx', '2');
          cell.setAttribute('fill', 'rgb(' + r + ',' + g + ',' + b + ')');
          svg.appendChild(cell);

          var valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          valText.setAttribute('x', String(offsetX + j * cellW + cellW / 2));
          valText.setAttribute('y', String(offsetY + i * cellH + cellH / 2 + 3));
          valText.setAttribute('text-anchor', 'middle');
          valText.setAttribute('fill', val > 0.5 ? '#0f172a' : '#e2e8f0');
          valText.setAttribute('font-size', '8');
          valText.setAttribute('font-family', 'monospace');
          valText.textContent = val.toFixed(2);
          svg.appendChild(valText);
        }
      }

      for (var i = 0; i < matrix.length; i++) {
        var rowLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rowLabel.setAttribute('x', String(offsetX - 5));
        rowLabel.setAttribute('y', String(offsetY + i * cellH + cellH / 2 + 3));
        rowLabel.setAttribute('text-anchor', 'end');
        rowLabel.setAttribute('fill', '#94a3b8');
        rowLabel.setAttribute('font-size', '8');
        rowLabel.setAttribute('font-family', 'monospace');
        rowLabel.textContent = tokens[i];
        svg.appendChild(rowLabel);
      }

      for (var j = 0; j < matrix.length; j++) {
        var colLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        colLabel.setAttribute('x', String(offsetX + j * cellW + cellW / 2));
        colLabel.setAttribute('y', String(offsetY - 5));
        colLabel.setAttribute('text-anchor', 'middle');
        colLabel.setAttribute('fill', '#94a3b8');
        colLabel.setAttribute('font-size', '8');
        colLabel.setAttribute('font-family', 'monospace');
        colLabel.textContent = tokens[j];
        svg.appendChild(colLabel);
      }

      container.appendChild(svg);
    },
    getPreparationTelemetry: function (params) {
      var tokens = (SEQUENCES['cat-sat'] || SEQUENCES['cat-sat']).slice(0, params.seqLength || 6);
      var dModel = parseInt(params.dModel) || 4;
      var result = computeAttention(tokens, dModel, dModel, params.temperature || 1.0, params.causalMask || false, 42);

      return [
        { key: 'tokenCount', label: 'Token Count', value: tokens.length },
        { key: 'selectedHead', label: 'Selected Head', value: 0 },
        { key: 'initialEntropy', label: 'Initial Entropy', value: result.averageEntropy },
        { key: 'matrixSize', label: 'Attention Matrix Size', value: tokens.length + '\u00D7' + tokens.length },
        { key: 'status', label: 'Status', value: 'Ready' }
      ];
    },
    getCompletionSummary: function (result, params) {
      if (!result) return [];
      var tokens = result.tokens || [];
      var strongestLink = result.strongestLink || { from: 0, to: 0, value: 0 };
      var strongestLabel = tokens.length > 0
        ? '\u201C' + tokens[strongestLink.from] + '\u201D \u2192 \u201C' + tokens[strongestLink.to] + '\u201D (' + strongestLink.value.toFixed(3) + ')'
        : '\u2014';

      return [
        { label: 'Average Entropy', value: result.averageEntropy !== undefined ? result.averageEntropy.toFixed(4) : '\u2014' },
        { label: 'Strongest Link', value: strongestLabel },
        { label: 'Status', value: 'Complete' }
      ];
    },
    execute: function (params) {
      var seqLength = params.seqLength !== undefined ? params.seqLength : 6;
      var dModel = parseInt(params.dModel) || 4;
      var temperature = params.temperature !== undefined ? params.temperature : 1.0;
      var causalMask = params.causalMask || false;

      seqLength = Math.max(3, Math.min(6, seqLength));
      var tokens = (SEQUENCES['cat-sat'] || SEQUENCES['cat-sat']).slice(0, seqLength);
      var result = computeAttention(tokens, dModel, dModel, temperature, causalMask, 42);

      return {
        tokens: result.tokens,
        attentionMatrix: result.attentionWeights,
        softmaxMatrix: result.attentionWeights,
        entropyPerRow: result.entropyPerRow,
        averageEntropy: result.averageEntropy,
        context: result.context,
        strongestLink: result.strongestLink
      };
    },
    visualization: { type: 'heatmap', title: 'Attention Weights' },
    canonicalStatus: 'reviewed',
    version: '1.0.0',
    reviewedBy: 'NeuralVerse Team',
    lastReviewed: '2026-07-07',
    estimatedDuration: '12 minutes'
  };

  if (window.NeuralVerse.LabRegistry && window.NeuralVerse.LabRegistry.register) {
    window.NeuralVerse.LabRegistry.register(labDefinition);
  }
})();
