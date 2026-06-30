/**
 * NV-1300-D1B — Example Registry
 *
 * Deterministic registry of reusable canonical examples.
 * Immutable after load. No randomness. No external state.
 *
 * Each example maps to concepts, artifacts, visualizations, labs,
 * and shared knowledge domains for deterministic resource selection.
 */

var CANONICAL_EXAMPLES = [
  {
    id: 'ex-linear-regression-housing',
    title: 'Linear Regression on Housing Prices',
    summary: 'Predict house prices from square footage using a single linear model.',
    conceptIds: ['linear-models', 'gradient-descent', 'loss-functions'],
    artifactIds: [],
    sharedKnowledgeDomains: ['mathematical-foundations', 'machine-learning'],
    visualizationIds: ['linear-function', 'gradient-descent-loss'],
    laboratoryIds: ['linear-regression-lab'],
    difficulty: 'beginner',
    category: 'regression',
    tags: ['supervised', 'regression', 'continuous-output', 'single-variable'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-logistic-regression-classification',
    title: 'Logistic Regression for Binary Classification',
    summary: 'Classify emails as spam or not spam using logistic regression.',
    conceptIds: ['linear-models', 'activation-functions', 'loss-functions', 'sigmoid-function'],
    artifactIds: [],
    sharedKnowledgeDomains: ['machine-learning'],
    visualizationIds: ['sigmoid-function', 'logistic-curve', 'decision-boundary'],
    laboratoryIds: ['logistic-regression-lab'],
    difficulty: 'beginner',
    category: 'classification',
    tags: ['supervised', 'classification', 'binary', 'sigmoid'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-gradient-descent-optimization',
    title: 'Gradient Descent Loss Landscape',
    summary: 'Visualize how learning rate affects convergence on a 2D loss surface.',
    conceptIds: ['gradient-descent', 'optimizers', 'learning-rate-scheduling'],
    artifactIds: [],
    sharedKnowledgeDomains: ['mathematical-foundations', 'optimization'],
    visualizationIds: ['gradient-descent-loss', 'learning-rate-impact'],
    laboratoryIds: ['gradient-descent-lab'],
    difficulty: 'intermediate',
    category: 'optimization',
    tags: ['optimization', 'loss-landscape', 'convergence', 'learning-rate'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-neural-network-mnist',
    title: 'Neural Network on MNIST',
    summary: 'Classify handwritten digits using a fully connected neural network.',
    conceptIds: ['neural-networks', 'activation-functions', 'backpropagation', 'loss-functions'],
    artifactIds: [],
    sharedKnowledgeDomains: ['deep-learning'],
    visualizationIds: ['relu-function', 'softmax-distribution'],
    laboratoryIds: [],
    difficulty: 'intermediate',
    category: 'classification',
    tags: ['deep-learning', 'classification', 'mnist', 'fully-connected'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-cnn-image-classification',
    title: 'CNN for Image Classification',
    summary: 'Classify images using convolutional layers, pooling, and fully connected head.',
    conceptIds: ['convolution', 'pooling', 'neural-networks', 'activation-functions'],
    artifactIds: [],
    sharedKnowledgeDomains: ['deep-learning', 'computer-vision'],
    visualizationIds: ['relu-function'],
    laboratoryIds: [],
    difficulty: 'intermediate',
    category: 'computer-vision',
    tags: ['cnn', 'image', 'convolution', 'pooling', 'vision'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-self-attention-mechanism',
    title: 'Self-Attention Weight Visualization',
    summary: 'Visualize how attention weights connect tokens in a sequence.',
    conceptIds: ['self-attention', 'transformer-architecture', 'word-embeddings'],
    artifactIds: [],
    sharedKnowledgeDomains: ['deep-learning', 'nlp'],
    visualizationIds: ['attention-head-weights', 'embedding-space-2d'],
    laboratoryIds: ['transformer-attention-lab'],
    difficulty: 'advanced',
    category: 'nlp',
    tags: ['transformer', 'attention', 'sequence', 'weights'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-rag-pipeline',
    title: 'RAG Pipeline End-to-End',
    summary: 'Retrieve relevant documents and generate answers using a RAG pipeline.',
    conceptIds: ['rag-pipeline', 'dense-retrieval', 'chunking', 'word-embeddings', 'semantic-search'],
    artifactIds: [],
    sharedKnowledgeDomains: ['retrieval', 'nlp'],
    visualizationIds: ['embedding-space-2d', 'knn-neighborhood'],
    laboratoryIds: [],
    difficulty: 'advanced',
    category: 'retrieval',
    tags: ['rag', 'retrieval', 'augmented', 'generation', 'pipeline'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-pca-dimensionality-reduction',
    title: 'PCA for Dimensionality Reduction',
    summary: 'Reduce high-dimensional data to 2D for visualization using PCA.',
    conceptIds: ['pca-projection'],
    artifactIds: [],
    sharedKnowledgeDomains: ['mathematical-foundations', 'machine-learning'],
    visualizationIds: ['pca-projection'],
    laboratoryIds: ['pca-projection-lab'],
    difficulty: 'intermediate',
    category: 'dimensionality-reduction',
    tags: ['pca', 'dimensionality', 'reduction', 'visualization'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-knn-classification',
    title: 'KNN Classification with Neighbor Visualization',
    summary: 'Classify points using k-nearest neighbors with visual neighborhood.',
    conceptIds: ['vector-similarity'],
    artifactIds: [],
    sharedKnowledgeDomains: ['machine-learning'],
    visualizationIds: ['knn-neighborhood', 'cosine-similarity'],
    laboratoryIds: ['cosine-similarity-lab'],
    difficulty: 'beginner',
    category: 'classification',
    tags: ['knn', 'neighborhood', 'similarity', 'instance-based'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-bayes-theorem',
    title: 'Bayes Theorem Probability Update',
    summary: 'Update beliefs with evidence using Bayes theorem.',
    conceptIds: ['regularization'],
    artifactIds: [],
    sharedKnowledgeDomains: ['mathematical-foundations', 'statistics'],
    visualizationIds: ['bayes-probability', 'normal-distribution'],
    laboratoryIds: ['bayes-rule-lab'],
    difficulty: 'beginner',
    category: 'probability',
    tags: ['bayes', 'probability', 'prior', 'posterior', 'update'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-overfitting-regularization',
    title: 'Overfitting vs Regularization',
    summary: 'Compare overfit and regularized models on training vs test data.',
    conceptIds: ['overfitting', 'regularization', 'loss-functions'],
    artifactIds: [],
    sharedKnowledgeDomains: ['machine-learning'],
    visualizationIds: ['precision-recall-tradeoff'],
    laboratoryIds: [],
    difficulty: 'intermediate',
    category: 'regularization',
    tags: ['overfitting', 'regularization', 'generalization', 'bias-variance'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-precision-recall-tradeoff',
    title: 'Precision-Recall Tradeoff',
    summary: 'Explore how classification threshold affects precision and recall.',
    conceptIds: ['loss-functions'],
    artifactIds: [],
    sharedKnowledgeDomains: ['machine-learning'],
    visualizationIds: ['precision-recall-tradeoff', 'roc-threshold', 'confusion-matrix'],
    laboratoryIds: ['precision-recall-lab'],
    difficulty: 'intermediate',
    category: 'evaluation',
    tags: ['precision', 'recall', 'threshold', 'tradeoff', 'metrics'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-kmeans-clustering',
    title: 'K-Means Clustering',
    summary: 'Cluster data points into k groups using K-Means.',
    conceptIds: [],
    artifactIds: [],
    sharedKnowledgeDomains: ['machine-learning'],
    visualizationIds: ['embedding-space-2d'],
    laboratoryIds: ['kmeans-clustering-lab'],
    difficulty: 'beginner',
    category: 'clustering',
    tags: ['kmeans', 'clustering', 'unsupervised', 'centroids'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-embedding-similarity',
    title: 'Embedding Similarity Search',
    summary: 'Find similar items using cosine similarity in embedding space.',
    conceptIds: ['word-embeddings', 'vector-similarity', 'semantic-search'],
    artifactIds: [],
    sharedKnowledgeDomains: ['nlp', 'retrieval'],
    visualizationIds: ['cosine-similarity', 'embedding-space-2d'],
    laboratoryIds: ['embedding-similarity-lab'],
    difficulty: 'intermediate',
    category: 'retrieval',
    tags: ['embedding', 'similarity', 'cosine', 'vector', 'search'],
    canonicalStatus: 'Reviewed'
  },
  {
    id: 'ex-decision-boundary',
    title: 'Decision Boundary Visualization',
    summary: 'Visualize how classifiers separate classes in 2D feature space.',
    conceptIds: ['decision-boundaries'],
    artifactIds: [],
    sharedKnowledgeDomains: ['machine-learning'],
    visualizationIds: ['decision-boundary'],
    laboratoryIds: [],
    difficulty: 'beginner',
    category: 'classification',
    tags: ['decision-boundary', 'classification', 'separation', 'visual'],
    canonicalStatus: 'Reviewed'
  }
];

function createExampleRegistry() {
  var _examples = {};
  var _examplesByConcept = {};
  var _examplesByCategory = {};
  var _examplesByDifficulty = {};
  var _initialized = false;

  function initialize() {
    if (_initialized) return;
    _examples = {};
    _examplesByConcept = {};
    _examplesByCategory = {};
    _examplesByDifficulty = {};

    for (var i = 0; i < CANONICAL_EXAMPLES.length; i++) {
      var ex = CANONICAL_EXAMPLES[i];
      _examples[ex.id] = Object.freeze(ex);

      for (var c = 0; c < ex.conceptIds.length; c++) {
        var cid = ex.conceptIds[c];
        if (!_examplesByConcept[cid]) _examplesByConcept[cid] = [];
        _examplesByConcept[cid].push(ex.id);
      }

      if (!_examplesByCategory[ex.category]) _examplesByCategory[ex.category] = [];
      _examplesByCategory[ex.category].push(ex.id);

      if (!_examplesByDifficulty[ex.difficulty]) _examplesByDifficulty[ex.difficulty] = [];
      _examplesByDifficulty[ex.difficulty].push(ex.id);
    }

    _initialized = true;
  }

  function getExample(id) {
    return _examples[id] || null;
  }

  function getAllExamples() {
    var result = [];
    var ids = Object.keys(_examples);
    for (var i = 0; i < ids.length; i++) {
      result.push(_examples[ids[i]]);
    }
    return result;
  }

  function getExamplesByConcept(conceptId) {
    var ids = _examplesByConcept[conceptId] || [];
    var result = [];
    for (var i = 0; i < ids.length; i++) {
      if (_examples[ids[i]]) result.push(_examples[ids[i]]);
    }
    return result;
  }

  function getExamplesByCategory(category) {
    var ids = _examplesByCategory[category] || [];
    var result = [];
    for (var i = 0; i < ids.length; i++) {
      if (_examples[ids[i]]) result.push(_examples[ids[i]]);
    }
    return result;
  }

  function getExamplesByDifficulty(difficulty) {
    var ids = _examplesByDifficulty[difficulty] || [];
    var result = [];
    for (var i = 0; i < ids.length; i++) {
      if (_examples[ids[i]]) result.push(_examples[ids[i]]);
    }
    return result;
  }

  function searchExamples(query) {
    if (!query || typeof query !== 'string') return [];
    var lower = query.toLowerCase();
    var results = [];
    var ids = Object.keys(_examples);
    for (var i = 0; i < ids.length; i++) {
      var ex = _examples[ids[i]];
      if (ex.title.toLowerCase().indexOf(lower) !== -1 ||
          ex.summary.toLowerCase().indexOf(lower) !== -1 ||
          ex.category.toLowerCase().indexOf(lower) !== -1) {
        results.push(ex);
      }
      for (var t = 0; t < ex.tags.length; t++) {
        if (ex.tags[t].toLowerCase().indexOf(lower) !== -1) {
          results.push(ex);
          break;
        }
      }
    }
    return results;
  }

  function getConceptsForExample(exampleId) {
    var ex = _examples[exampleId];
    return ex ? ex.conceptIds.slice() : [];
  }

  function getVisualizationIdsForExample(exampleId) {
    var ex = _examples[exampleId];
    return ex ? ex.visualizationIds.slice() : [];
  }

  function getLaboratoryIdsForExample(exampleId) {
    var ex = _examples[exampleId];
    return ex ? ex.laboratoryIds.slice() : [];
  }

  function getCount() {
    return Object.keys(_examples).length;
  }

  initialize();

  return {
    getExample: getExample,
    getAllExamples: getAllExamples,
    getExamplesByConcept: getExamplesByConcept,
    getExamplesByCategory: getExamplesByCategory,
    getExamplesByDifficulty: getExamplesByDifficulty,
    searchExamples: searchExamples,
    getConceptsForExample: getConceptsForExample,
    getVisualizationIdsForExample: getVisualizationIdsForExample,
    getLaboratoryIdsForExample: getLaboratoryIdsForExample,
    getCount: getCount,
    initialize: initialize,
    CANONICAL_EXAMPLES: CANONICAL_EXAMPLES
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createExampleRegistry = createExampleRegistry;
}

export { createExampleRegistry, CANONICAL_EXAMPLES };
