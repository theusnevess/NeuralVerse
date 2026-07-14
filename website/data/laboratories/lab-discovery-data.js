/**
 * NV-900-M3 — Discovery Architecture Data Layer
 * Scientific questions, concepts, trails, and relationships.
 * Replaces experiment-first navigation with question-first discovery.
 */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════
  //  SCIENTIFIC QUESTIONS — Primary Navigation Language
  // ══════════════════════════════════════════════════════════════

  var DISCOVERY_QUESTIONS = [
    {
      id: 'q-overfitting',
      question: 'Why do models overfit?',
      category: 'Learning',
      experiments: ['linear-regression', 'gradient-descent'],
      concept: 'Bias-variance tradeoff',
      summary: 'Models can memorize training data instead of learning general patterns.',
      relatedQuestions: ['q-gradient-descent', 'q-logistic-linear', 'q-pca-loss']
    },
    {
      id: 'q-gradient-descent',
      question: 'How does Gradient Descent actually move?',
      category: 'Optimization',
      experiments: ['gradient-descent'],
      concept: 'Iterative optimization',
      summary: 'The algorithm takes small steps downhill on a loss surface.',
      relatedQuestions: ['q-overfitting', 'q-linear-learn', 'q-kmeans-fail']
    },
    {
      id: 'q-embeddings-meaning',
      question: 'Why do embeddings capture meaning?',
      category: 'Representation',
      experiments: ['embedding-similarity', 'cosine-similarity'],
      concept: 'Semantic vector spaces',
      summary: 'Similar words cluster together in high-dimensional space.',
      relatedQuestions: ['q-cosine-why', 'q-high-dim', 'q-pca-compress']
    },
    {
      id: 'q-attention-works',
      question: 'What makes Attention work?',
      category: 'Transformers',
      experiments: ['transformer-attention'],
      concept: 'Selective focus mechanisms',
      summary: 'Transformers learn to weight relevant information dynamically.',
      relatedQuestions: ['q-embeddings-meaning', 'q-qkv', 'q-why-linear']
    },
    {
      id: 'q-pca-loss',
      question: 'How does PCA lose information?',
      category: 'Geometry',
      experiments: ['pca-projection'],
      concept: 'Dimensionality reduction',
      summary: 'Projecting to fewer dimensions discards variance.',
      relatedQuestions: ['q-overfitting', 'q-embeddings-meaning', 'q-kmeans-fail']
    },
    {
      id: 'q-logistic-linear',
      question: 'Why is Logistic Regression linear?',
      category: 'Learning',
      experiments: ['logistic-regression'],
      concept: 'Linear decision boundaries',
      summary: 'The sigmoid function maps linear combinations to probabilities.',
      relatedQuestions: ['q-overfitting', 'q-precision-recall', 'q-bayes-update']
    },
    {
      id: 'q-bayes-update',
      question: 'How does Bayes update belief?',
      category: 'Reasoning',
      experiments: ['bayes-rule'],
      concept: 'Bayesian inference',
      summary: 'Prior beliefs combine with evidence to form posterior beliefs.',
      relatedQuestions: ['q-logistic-linear', 'q-precision-recall', 'q-kmeans-fail']
    },
    {
      id: 'q-kmeans-fail',
      question: 'Why does K-Means sometimes fail?',
      category: 'Geometry',
      experiments: ['kmeans-clustering'],
      concept: 'Cluster initialization sensitivity',
      summary: 'Bad initial centroids lead to poor convergence.',
      relatedQuestions: ['q-gradient-descent', 'q-pca-loss', 'q-embeddings-meaning']
    },
    {
      id: 'q-cosine-why',
      question: 'Why cosine similarity?',
      category: 'Representation',
      experiments: ['cosine-similarity'],
      concept: 'Angular distance in vector spaces',
      summary: 'Magnitude-invariant comparison of direction.',
      relatedQuestions: ['q-embeddings-meaning', 'q-high-dim', 'q-attention-works']
    },
    {
      id: 'q-precision-recall',
      question: 'How is model performance measured?',
      category: 'Evaluation',
      experiments: ['precision-recall'],
      concept: 'Tradeoff between precision and recall',
      summary: 'No single metric captures all aspects of performance.',
      relatedQuestions: ['q-logistic-linear', 'q-bayes-update', 'q-overfitting']
    },
    {
      id: 'q-linear-learn',
      question: 'How does a model learn from data?',
      category: 'Learning',
      experiments: ['linear-regression'],
      concept: 'Supervised learning fundamentals',
      summary: 'Fitting parameters to minimize prediction error.',
      relatedQuestions: ['q-gradient-descent', 'q-overfitting', 'q-logistic-linear']
    },
    {
      id: 'q-high-dim',
      question: 'Why do high dimensions matter?',
      category: 'Geometry',
      experiments: ['pca-projection', 'embedding-similarity'],
      concept: 'Curse of dimensionality',
      summary: 'Distance metrics become less meaningful in high dimensions.',
      relatedQuestions: ['q-pca-loss', 'q-cosine-why', 'q-embeddings-meaning']
    },
    {
      id: 'q-qkv',
      question: 'What are Q, K, V in attention?',
      category: 'Transformers',
      experiments: ['transformer-attention'],
      concept: 'Query-Key-Value decomposition',
      summary: 'Three projections that enable selective information retrieval.',
      relatedQuestions: ['q-attention-works', 'q-embeddings-meaning', 'q-high-dim']
    },
    {
      id: 'q-why-linear',
      question: 'Why do linear models still matter?',
      category: 'Learning',
      experiments: ['linear-regression', 'logistic-regression'],
      concept: 'Interpretable baselines',
      summary: 'Simple models provide clarity and baselines for comparison.',
      relatedQuestions: ['q-linear-learn', 'q-logistic-linear', 'q-overfitting']
    }
  ];

  // ══════════════════════════════════════════════════════════════
  //  DISCOVERY CATEGORIES — Cognitive Themes
  // ══════════════════════════════════════════════════════════════

  var DISCOVERY_CATEGORIES = [
    { id: 'Learning', label: 'Learning', description: 'How models learn from data', icon: '&#x27E1;' },
    { id: 'Optimization', label: 'Optimization', description: 'How models find better solutions', icon: '&#x2197;' },
    { id: 'Representation', label: 'Representation', description: 'How data becomes meaningful', icon: '&#x25C7;' },
    { id: 'Reasoning', label: 'Reasoning', description: 'How evidence updates beliefs', icon: '&#x2261;' },
    { id: 'Geometry', label: 'Geometry', description: 'How structure emerges from data', icon: '&#x25B3;' },
    { id: 'Evaluation', label: 'Evaluation', description: 'How performance is measured', icon: '&#x25CF;' },
    { id: 'Transformers', label: 'Transformers', description: 'How attention enables intelligence', icon: '&#x26A1;' }
  ];

  // ══════════════════════════════════════════════════════════════
  //  SCIENTIFIC TRAILS — Investigation Narratives
  // ══════════════════════════════════════════════════════════════

  var SCIENTIFIC_TRAILS = [
    {
      id: 'trail-how-models-learn',
      title: 'How Models Learn',
      description: 'From data to prediction: the journey of supervised learning.',
      steps: [
        { experiment: 'linear-regression', question: 'How does fitting a line work?' },
        { experiment: 'gradient-descent', question: 'How does the algorithm find the best fit?' },
        { experiment: 'logistic-regression', question: 'How do we extend this to classification?' }
      ]
    },
    {
      id: 'trail-representation',
      title: 'How Models Represent Information',
      description: 'From raw data to semantic understanding.',
      steps: [
        { experiment: 'embedding-similarity', question: 'How do words become vectors?' },
        { experiment: 'cosine-similarity', question: 'How do we measure meaning?' },
        { experiment: 'transformer-attention', question: 'How do transformers use these representations?' }
      ]
    },
    {
      id: 'trail-geometry',
      title: 'Data Geometry',
      description: 'Understanding structure through mathematical lenses.',
      steps: [
        { experiment: 'pca-projection', question: 'How do we simplify complex data?' },
        { experiment: 'kmeans-clustering', question: 'How do we discover natural groups?' },
        { experiment: 'embedding-similarity', question: 'How does similarity work geometrically?' }
      ]
    },
    {
      id: 'trail-probabilistic',
      title: 'Probabilistic Thinking',
      description: 'From uncertainty to informed decisions.',
      steps: [
        { experiment: 'bayes-rule', question: 'How do we update beliefs with evidence?' },
        { experiment: 'precision-recall', question: 'How do we measure tradeoffs?' },
        { experiment: 'logistic-regression', question: 'How do probabilistic models make predictions?' }
      ]
    }
  ];

  // ══════════════════════════════════════════════════════════════
  //  CONCEPT NODES — Connected Scientific Concepts
  // ══════════════════════════════════════════════════════════════

  var CONCEPT_NODES = [
    { id: 'c-supervised-learning', label: 'Supervised Learning', experiments: ['linear-regression', 'logistic-regression'] },
    { id: 'c-optimization', label: 'Optimization', experiments: ['gradient-descent'] },
    { id: 'c-vector-spaces', label: 'Vector Spaces', experiments: ['embedding-similarity', 'cosine-similarity'] },
    { id: 'c-probability', label: 'Probability Theory', experiments: ['bayes-rule', 'precision-recall'] },
    { id: 'c-dimensionality', label: 'Dimensionality Reduction', experiments: ['pca-projection'] },
    { id: 'c-clustering', label: 'Clustering', experiments: ['kmeans-clustering'] },
    { id: 'c-attention', label: 'Attention Mechanisms', experiments: ['transformer-attention'] },
    { id: 'c-evaluation', label: 'Model Evaluation', experiments: ['precision-recall'] },
    { id: 'c-loss-functions', label: 'Loss Functions', experiments: ['linear-regression', 'gradient-descent', 'logistic-regression'] },
    { id: 'c-gradient', label: 'Gradient Computation', experiments: ['gradient-descent'] },
    { id: 'c-similarity', label: 'Similarity Measures', experiments: ['embedding-similarity', 'cosine-similarity'] },
    { id: 'c-decision-boundaries', label: 'Decision Boundaries', experiments: ['logistic-regression', 'linear-regression'] }
  ];

  // ══════════════════════════════════════════════════════════════
  //  EXPERIMENT FRAMING — Scientific Instrument Context
  // ══════════════════════════════════════════════════════════════

  var EXPERIMENT_FRAMING = {
    'linear-regression': {
      scientificQuestion: 'Can we model the relationship between variables with a straight line?',
      whatYouObserve: 'How parameters affect the fitted line and prediction quality',
      keyInsight: 'The best-fit line minimizes the sum of squared residuals'
    },
    'gradient-descent': {
      scientificQuestion: 'How does an algorithm find the minimum of a function?',
      whatYouObserve: 'The path taken through the loss landscape',
      keyInsight: 'Gradient direction and learning rate determine convergence'
    },
    'logistic-regression': {
      scientificQuestion: 'How do we classify data using probabilities?',
      whatYouObserve: 'The sigmoid transformation and decision boundary',
      keyInsight: 'Linear combination + sigmoid = probability'
    },
    'pca-projection': {
      scientificQuestion: 'How can we reduce dimensions while preserving information?',
      whatYouObserve: 'The projection onto principal components',
      keyInsight: 'Eigenvectors of the covariance matrix define the directions of maximum variance'
    },
    'kmeans-clustering': {
      scientificQuestion: 'How do algorithms discover natural groupings in data?',
      whatYouObserve: 'Centroid movement and cluster assignment',
      keyInsight: 'Iterative assignment and update converges to local optima'
    },
    'bayes-rule': {
      scientificQuestion: 'How do we update our beliefs when we observe new evidence?',
      whatYouObserve: 'The prior-to-posterior probability transformation',
      keyInsight: 'Posterior is proportional to likelihood times prior'
    },
    'embedding-similarity': {
      scientificQuestion: 'How do high-dimensional vectors capture semantic meaning?',
      whatYouObserve: 'Similarity patterns in vector space',
      keyInsight: 'Semantic relationships emerge from geometric proximity'
    },
    'cosine-similarity': {
      scientificQuestion: 'Why is direction more important than magnitude for meaning?',
      whatYouObserve: 'The angle between vectors as a similarity measure',
      keyInsight: 'Cosine similarity is magnitude-invariant and bounded'
    },
    'precision-recall': {
      scientificQuestion: 'How do we measure the tradeoff between precision and recall?',
      whatYouObserve: 'The precision-recall curve under threshold variation',
      keyInsight: 'No single metric captures all aspects of classifier performance'
    },
    'transformer-attention': {
      scientificQuestion: 'How do transformers focus on the most relevant information?',
      whatYouObserve: 'Attention weight patterns across tokens',
      keyInsight: 'Self-attention learns task-specific relevance weighting'
    }
  };

  // ══════════════════════════════════════════════════════════════
  //  PUBLIC API
  // ══════════════════════════════════════════════════════════════

  var api = {
    DISCOVERY_QUESTIONS: DISCOVERY_QUESTIONS,
    DISCOVERY_CATEGORIES: DISCOVERY_CATEGORIES,
    SCIENTIFIC_TRAILS: SCIENTIFIC_TRAILS,
    CONCEPT_NODES: CONCEPT_NODES,
    EXPERIMENT_FRAMING: EXPERIMENT_FRAMING,

    getQuestionsByCategory: function (categoryId) {
      return DISCOVERY_QUESTIONS.filter(function (q) { return q.category === categoryId; });
    },

    getQuestionById: function (questionId) {
      return DISCOVERY_QUESTIONS.find(function (q) { return q.id === questionId; }) || null;
    },

    getRelatedQuestions: function (questionId) {
      var q = this.getQuestionById(questionId);
      if (!q || !q.relatedQuestions) return [];
      return q.relatedQuestions.map(this.getQuestionById.bind(this)).filter(Boolean);
    },

    getTrailById: function (trailId) {
      return SCIENTIFIC_TRAILS.find(function (t) { return t.id === trailId; }) || null;
    },

    getFramingForExperiment: function (slug) {
      return EXPERIMENT_FRAMING[slug] || null;
    },

    getConceptsForExperiment: function (slug) {
      return CONCEPT_NODES.filter(function (c) {
        return c.experiments.indexOf(slug) !== -1;
      });
    },

    getQuestionsForExperiment: function (slug) {
      return DISCOVERY_QUESTIONS.filter(function (q) {
        return q.experiments.indexOf(slug) !== -1;
      });
    },

    getAllCategories: function () {
      return DISCOVERY_CATEGORIES.slice();
    },

    getAllTrails: function () {
      return SCIENTIFIC_TRAILS.slice();
    },

    getAllConcepts: function () {
      return CONCEPT_NODES.slice();
    }
  };

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.DiscoveryData = api;

})();
