/**
 * NV-900-P7 — Lab Ecosystem Relationships
 * Deterministic cross-laboratory scientific relationships.
 */

(function () {
  'use strict';

  var E = window.NeuralVerse.LabEcosystem;
  if (!E || !E.register) return;

  // ── Gradient Descent → Logistic Regression ──
  E.register({
    source: 'gradient-descent',
    target: 'logistic-regression',
    type: 'prerequisite',
    reason: 'Logistic Regression uses gradient descent to optimize cross-entropy loss.',
    outcome: 'Connect optimization mechanics to classifier training.'
  });

  // ── Logistic Regression → Precision vs Recall ──
  E.register({
    source: 'logistic-regression',
    target: 'precision-recall',
    type: 'application',
    reason: 'Classifier probabilities become threshold decisions evaluated by precision and recall.',
    outcome: 'Understand how model outputs become evaluation trade-offs.'
  });

  // ── Linear Regression → Logistic Regression ──
  E.register({
    source: 'linear-regression',
    target: 'logistic-regression',
    type: 'comparison',
    reason: 'Both learn linear parameters, but one predicts continuous values while the other predicts probabilities.',
    outcome: 'Compare regression and classification learning.'
  });

  // ── K-Means → Embedding Similarity ──
  E.register({
    source: 'kmeans-clustering',
    target: 'embedding-similarity',
    type: 'extension',
    reason: 'Cluster structure depends on distance relationships in representation spaces.',
    outcome: 'Understand how similarity geometry supports grouping.'
  });

  // ── Embedding Similarity → Cosine Similarity ──
  E.register({
    source: 'embedding-similarity',
    target: 'cosine-similarity',
    type: 'prerequisite',
    reason: 'Cosine similarity explains how embedding vectors are compared by direction.',
    outcome: 'Understand the geometric basis of embedding retrieval.'
  });

  // ── Cosine Similarity → Transformer Attention ──
  E.register({
    source: 'cosine-similarity',
    target: 'transformer-attention',
    type: 'conceptual-neighbor',
    reason: 'Attention also compares vector representations through similarity-like score computation.',
    outcome: 'Connect vector geometry to attention scoring.'
  });

  // ── PCA → Embedding Similarity ──
  E.register({
    source: 'pca-projection',
    target: 'embedding-similarity',
    type: 'conceptual-neighbor',
    reason: 'Both expose how high-dimensional representations can be projected or compared.',
    outcome: 'Relate dimensionality reduction to representation geometry.'
  });

  // ── Bayes Rule → Precision vs Recall ──
  E.register({
    source: 'bayes-rule',
    target: 'precision-recall',
    type: 'diagnostic',
    reason: 'Both explain how evidence, false positives, and false negatives affect decisions.',
    outcome: 'Understand uncertainty and evaluation in probabilistic decisions.'
  });

  // ── Transformer Attention → Embedding Similarity ──
  E.register({
    source: 'transformer-attention',
    target: 'embedding-similarity',
    type: 'application',
    reason: 'Attention produces contextual representations whose similarity can be inspected.',
    outcome: 'Connect attention outputs to representation analysis.'
  });

  // ── Gradient Descent → Linear Regression ──
  E.register({
    source: 'gradient-descent',
    target: 'linear-regression',
    type: 'conceptual-neighbor',
    reason: 'Linear regression can be solved analytically, but gradient descent provides an alternative optimization perspective.',
    outcome: 'Compare analytical and iterative solutions for linear models.'
  });

  // ── Linear Regression → PCA ──
  E.register({
    source: 'linear-regression',
    target: 'pca-projection',
    type: 'conceptual-neighbor',
    reason: 'Both deal with linear relationships in data — regression predicts outcomes, PCA reveals structure.',
    outcome: 'Relate predictive modeling to exploratory data analysis.'
  });

  // ── Logistic Regression → Bayes Rule ──
  E.register({
    source: 'logistic-regression',
    target: 'bayes-rule',
    type: 'conceptual-neighbor',
    reason: 'Logistic regression models P(y=1|x) which relates to Bayesian posterior computation.',
    outcome: 'Connect discriminative classification to probabilistic reasoning.'
  });

})();
