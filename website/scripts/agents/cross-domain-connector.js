/**
 * NV-1300-D1B — Cross-Domain Connector
 *
 * Discovers relationships across domains from canonical data.
 * Never invents relationships. Maximum 8 connections returned.
 * Deterministic. No Math.random. No Date.now.
 */

var CANONICAL_CROSS_DOMAIN_CONNECTIONS = [
  {
    sourceConcept: 'linear-models',
    targetConcept: 'word-embeddings',
    relationshipType: 'mathematical-foundation',
    explanation: 'Linear models provide the mathematical foundation for embedding projections, which are linear transformations from token space to vector space.',
    domains: ['mathematics', 'nlp'],
    evidence: 'Embedding layers are linear transformations (matrix multiplication). Linear model theory underpins their behavior.'
  },
  {
    sourceConcept: 'gradient-descent',
    targetConcept: 'optimizers',
    relationshipType: 'generalization',
    explanation: 'Optimizers like Adam and RMSprop are extensions of gradient descent with adaptive learning rates and momentum.',
    domains: ['optimization', 'deep-learning'],
    evidence: 'All neural network optimizers are variants of gradient descent with different update rules.'
  },
  {
    sourceConcept: 'self-attention',
    targetConcept: 'transformer-architecture',
    relationshipType: 'core-component',
    explanation: 'Self-attention is the core mechanism of the transformer architecture, enabling sequence processing without recurrence.',
    domains: ['nlp', 'deep-learning'],
    evidence: 'The transformer architecture replaces recurrent layers with multi-head self-attention layers.'
  },
  {
    sourceConcept: 'word-embeddings',
    targetConcept: 'semantic-search',
    relationshipType: 'enables',
    explanation: 'Word embeddings enable semantic search by representing text as dense vectors where similarity reflects semantic closeness.',
    domains: ['nlp', 'retrieval'],
    evidence: 'Semantic search systems use embedding similarity to find relevant documents.'
  },
  {
    sourceConcept: 'dense-retrieval',
    targetConcept: 'rag-pipeline',
    relationshipType: 'component',
    explanation: 'Dense retrieval is a key component of RAG pipelines, providing the retrieval step before generation.',
    domains: ['retrieval', 'nlp'],
    evidence: 'RAG pipelines combine dense retrieval with language model generation.'
  },
  {
    sourceConcept: 'convolution',
    targetConcept: 'neural-networks',
    relationshipType: 'specialization',
    explanation: 'Convolutional neural networks are a specialization of neural networks using parameter sharing and local connectivity.',
    domains: ['computer-vision', 'deep-learning'],
    evidence: 'CNNs apply the convolution operation as a layer within neural network architectures.'
  },
  {
    sourceConcept: 'regularization',
    targetConcept: 'dropout',
    relationshipType: 'implements',
    explanation: 'Dropout is a specific regularization technique that prevents co-adaptation of neurons by randomly deactivating units during training.',
    domains: ['deep-learning', 'optimization'],
    evidence: 'Dropout implements the regularization principle of preventing overfitting through noise injection.'
  },
  {
    sourceConcept: 'loss-functions',
    targetConcept: 'gradient-descent',
    relationshipType: 'enables',
    explanation: 'Loss functions provide the objective signal that gradient descent optimizes. The gradient of the loss drives parameter updates.',
    domains: ['optimization', 'machine-learning'],
    evidence: 'Gradient descent computes partial derivatives of the loss function with respect to model parameters.'
  },
  {
    sourceConcept: 'activation-functions',
    targetConcept: 'neural-networks',
    relationshipType: 'core-component',
    explanation: 'Activation functions introduce non-linearity into neural networks, enabling them to learn complex patterns.',
    domains: ['deep-learning'],
    evidence: 'Without non-linear activation functions, neural networks would be equivalent to linear models.'
  },
  {
    sourceConcept: 'vector-similarity',
    targetConcept: 'semantic-search',
    relationshipType: 'enables',
    explanation: 'Vector similarity measures (cosine, dot product) enable semantic search by quantifying closeness in embedding space.',
    domains: ['retrieval', 'mathematics'],
    evidence: 'Semantic search ranks documents by vector similarity to query embeddings.'
  },
  {
    sourceConcept: 'decision-boundaries',
    targetConcept: 'linear-models',
    relationshipType: 'visualization',
    explanation: 'Decision boundaries visualize how linear models separate classes in feature space.',
    domains: ['machine-learning'],
    evidence: 'Linear models produce linear decision boundaries; the visualization shows the separation hyperplane.'
  },
  {
    sourceConcept: 'backpropagation',
    targetConcept: 'neural-networks',
    relationshipType: 'training-method',
    explanation: 'Backpropagation is the algorithm used to compute gradients in neural networks, enabling training via gradient descent.',
    domains: ['deep-learning', 'optimization'],
    evidence: 'Backpropagation applies the chain rule to compute gradients layer by layer.'
  },
  {
    sourceConcept: 'tokenization',
    targetConcept: 'word-embeddings',
    relationshipType: 'prerequisite',
    explanation: 'Tokenization converts text into tokens before embedding, making it a prerequisite for any embedding-based system.',
    domains: ['nlp'],
    evidence: 'Embedding models operate on tokenized input, not raw text.'
  },
  {
    sourceConcept: 'batch-normalization',
    targetConcept: 'neural-networks',
    relationshipType: 'component',
    explanation: 'Batch normalization normalizes layer inputs, stabilizing training and enabling deeper networks.',
    domains: ['deep-learning'],
    evidence: 'Batch normalization is inserted between layers to reduce internal covariate shift.'
  },
  {
    sourceConcept: 'cross-validation',
    targetConcept: 'loss-functions',
    relationshipType: 'evaluation',
    explanation: 'Cross-validation uses loss functions to evaluate model performance across different data splits.',
    domains: ['machine-learning'],
    evidence: 'Cross-validation computes average loss across k folds to estimate generalization performance.'
  },
  {
    sourceConcept: 'data-augmentation',
    targetConcept: 'convolution',
    relationshipType: 'complementary',
    explanation: 'Data augmentation increases training diversity for convolutional models, improving generalization.',
    domains: ['computer-vision', 'deep-learning'],
    evidence: 'Image augmentation (rotation, flip, crop) is standard practice for training CNNs.'
  }
];

function createCrossDomainConnector() {
  var _connectionIndex = null;

  function _buildIndex() {
    if (_connectionIndex) return;
    _connectionIndex = {};

    for (var i = 0; i < CANONICAL_CROSS_DOMAIN_CONNECTIONS.length; i++) {
      var conn = CANONICAL_CROSS_DOMAIN_CONNECTIONS[i];
      if (!_connectionIndex[conn.sourceConcept]) _connectionIndex[conn.sourceConcept] = [];
      if (!_connectionIndex[conn.targetConcept]) _connectionIndex[conn.targetConcept] = [];
      _connectionIndex[conn.sourceConcept].push(i);
      _connectionIndex[conn.targetConcept].push(i);
    }
  }

  function getConnections(conceptId) {
    _buildIndex();

    if (!conceptId || typeof conceptId !== 'string') {
      return CANONICAL_CROSS_DOMAIN_CONNECTIONS.slice(0, 8);
    }

    var indices = _connectionIndex[conceptId] || [];
    var result = [];
    for (var i = 0; i < indices.length; i++) {
      result.push(CANONICAL_CROSS_DOMAIN_CONNECTIONS[indices[i]]);
    }

    result.sort(function (a, b) {
      return a.sourceConcept.localeCompare(b.sourceConcept);
    });

    return result.slice(0, 8);
  }

  function explainConnection(sourceConcept, targetConcept) {
    _buildIndex();

    if (!sourceConcept || !targetConcept) {
      return { found: false, reason: 'Invalid input' };
    }

    for (var i = 0; i < CANONICAL_CROSS_DOMAIN_CONNECTIONS.length; i++) {
      var conn = CANONICAL_CROSS_DOMAIN_CONNECTIONS[i];
      if ((conn.sourceConcept === sourceConcept && conn.targetConcept === targetConcept) ||
          (conn.sourceConcept === targetConcept && conn.targetConcept === sourceConcept)) {
        return {
          found: true,
          connection: conn,
          explanation: conn.explanation,
          evidence: conn.evidence,
          bidirectional: conn.sourceConcept !== sourceConcept
        };
      }
    }

    return {
      found: false,
      reason: 'No canonical connection found between ' + sourceConcept + ' and ' + targetConcept
    };
  }

  function rankConnections(conceptIds, maxCount) {
    if (!Array.isArray(conceptIds) || conceptIds.length === 0) {
      return CANONICAL_CROSS_DOMAIN_CONNECTIONS.slice(0, maxCount || 8);
    }

    var scored = [];
    var seen = {};

    for (var i = 0; i < CANONICAL_CROSS_DOMAIN_CONNECTIONS.length; i++) {
      var conn = CANONICAL_CROSS_DOMAIN_CONNECTIONS[i];
      var key = conn.sourceConcept + '->' + conn.targetConcept;
      if (seen[key]) continue;
      seen[key] = true;

      var score = 0;
      for (var c = 0; c < conceptIds.length; c++) {
        if (conn.sourceConcept === conceptIds[c]) score += 2;
        if (conn.targetConcept === conceptIds[c]) score += 2;
        for (var d = 0; d < conn.domains.length; d++) {
          if (conceptIds[c].indexOf(conn.domains[d]) !== -1) score += 0.5;
        }
      }

      scored.push({ connection: conn, score: score });
    }

    scored.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.connection.sourceConcept.localeCompare(b.connection.sourceConcept);
    });

    var limit = maxCount || 8;
    var result = [];
    for (var j = 0; j < scored.length && j < limit; j++) {
      result.push(scored[j].connection);
    }

    return result;
  }

  function filterConnections(options) {
    _buildIndex();

    var result = CANONICAL_CROSS_DOMAIN_CONNECTIONS.slice();

    if (options && options.domain) {
      var filtered = [];
      for (var i = 0; i < result.length; i++) {
        for (var d = 0; d < result[i].domains.length; d++) {
          if (result[i].domains[d] === options.domain) {
            filtered.push(result[i]);
            break;
          }
        }
      }
      result = filtered;
    }

    if (options && options.relationshipType) {
      var filtered2 = [];
      for (var j = 0; j < result.length; j++) {
        if (result[j].relationshipType === options.relationshipType) {
          filtered2.push(result[j]);
        }
      }
      result = filtered2;
    }

    if (options && options.excludeConcept) {
      var excludeId = options.excludeConcept;
      var filtered3 = [];
      for (var k = 0; k < result.length; k++) {
        if (result[k].sourceConcept !== excludeId && result[k].targetConcept !== excludeId) {
          filtered3.push(result[k]);
        }
      }
      result = filtered3;
    }

    return result.slice(0, 8);
  }

  function getAllConnections() {
    return CANONICAL_CROSS_DOMAIN_CONNECTIONS.slice();
  }

  function getConnectionCount() {
    return CANONICAL_CROSS_DOMAIN_CONNECTIONS.length;
  }

  return {
    getConnections: getConnections,
    explainConnection: explainConnection,
    rankConnections: rankConnections,
    filterConnections: filterConnections,
    getAllConnections: getAllConnections,
    getConnectionCount: getConnectionCount,
    CANONICAL_CROSS_DOMAIN_CONNECTIONS: CANONICAL_CROSS_DOMAIN_CONNECTIONS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createCrossDomainConnector = createCrossDomainConnector;
}

export { createCrossDomainConnector, CANONICAL_CROSS_DOMAIN_CONNECTIONS };
