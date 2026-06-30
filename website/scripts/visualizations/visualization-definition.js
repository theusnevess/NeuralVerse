(function() {
  'use strict';

  window.NeuralVerse = window.NeuralVerse || {};

  const definitions = [
    {
      id: 'linear-function',
      title: 'Linear Function',
      slug: 'linear-function',
      summary: 'Visualize y = mx + b with adjustable slope and intercept.',
      category: 'mathematics',
      concepts: ['linear-functions', 'slope-intercept'],
      artifactReferences: ['artifact-linear-function-interactive-visualization'],
      sharedKnowledgeDomains: ['mathematical-foundations'],
      parameterSchema: [
        {
          id: 'slope',
          label: 'Slope (m)',
          type: 'number',
          min: -5,
          max: 5,
          step: 0.1,
          defaultValue: 1,
          unit: '',
          description: 'Controls the steepness and direction of the line'
        },
        {
          id: 'intercept',
          label: 'Y-Intercept (b)',
          type: 'number',
          min: -10,
          max: 10,
          step: 0.1,
          defaultValue: 0,
          unit: '',
          description: 'The y-value where the line crosses the y-axis'
        },
        {
          id: 'xMin',
          label: 'X Minimum',
          type: 'number',
          min: -10,
          max: 0,
          step: 0.5,
          defaultValue: -10,
          unit: '',
          description: 'Left boundary of the x-axis range'
        },
        {
          id: 'xMax',
          label: 'X Maximum',
          type: 'number',
          min: 0,
          max: 10,
          step: 0.5,
          defaultValue: 10,
          unit: '',
          description: 'Right boundary of the x-axis range'
        }
      ],
      defaultParameters: {
        slope: 1,
        intercept: 0,
        xMin: -10,
        xMax: 10
      },
      renderer: 'line-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'quadratic-function',
      title: 'Quadratic Function',
      slug: 'quadratic-function',
      summary: 'Visualize y = ax² + bx + c with adjustable coefficients.',
      category: 'mathematics',
      concepts: ['quadratic-functions'],
      artifactReferences: ['artifact-quadratic-function-interactive-visualization'],
      sharedKnowledgeDomains: ['mathematical-foundations'],
      parameterSchema: [
        {
          id: 'a',
          label: 'Coefficient a',
          type: 'number',
          min: -5,
          max: 5,
          step: 0.1,
          defaultValue: 1,
          unit: '',
          description: 'Controls the width and direction of the parabola'
        },
        {
          id: 'b',
          label: 'Coefficient b',
          type: 'number',
          min: -5,
          max: 5,
          step: 0.1,
          defaultValue: 0,
          unit: '',
          description: 'Shifts the parabola left or right'
        },
        {
          id: 'c',
          label: 'Coefficient c',
          type: 'number',
          min: -10,
          max: 10,
          step: 0.1,
          defaultValue: 0,
          unit: '',
          description: 'Shifts the parabola up or down'
        },
        {
          id: 'xMin',
          label: 'X Minimum',
          type: 'number',
          min: -10,
          max: 0,
          step: 0.5,
          defaultValue: -10,
          unit: '',
          description: 'Left boundary of the x-axis range'
        },
        {
          id: 'xMax',
          label: 'X Maximum',
          type: 'number',
          min: 0,
          max: 10,
          step: 0.5,
          defaultValue: 10,
          unit: '',
          description: 'Right boundary of the x-axis range'
        }
      ],
      defaultParameters: {
        a: 1,
        b: 0,
        c: 0,
        xMin: -10,
        xMax: 10
      },
      renderer: 'line-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'sigmoid-function',
      title: 'Sigmoid Function',
      slug: 'sigmoid-function',
      summary: 'Visualize σ(x) = 1/(1+e^(-k(x-x0))) with adjustable steepness and center.',
      category: 'mathematics',
      concepts: ['activation-functions'],
      artifactReferences: ['artifact-sigmoid-function-interactive-visualization'],
      sharedKnowledgeDomains: ['mathematical-foundations', 'deep-learning'],
      parameterSchema: [
        {
          id: 'k',
          label: 'Steepness (k)',
          type: 'number',
          min: 0.1,
          max: 5,
          step: 0.1,
          defaultValue: 1,
          unit: '',
          description: 'Controls how sharply the sigmoid transitions'
        },
        {
          id: 'x0',
          label: 'Center (x₀)',
          type: 'number',
          min: -5,
          max: 5,
          step: 0.1,
          defaultValue: 0,
          unit: '',
          description: 'The x-value where the sigmoid is at 0.5'
        }
      ],
      defaultParameters: {
        k: 1,
        x0: 0
      },
      renderer: 'line-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'relu-function',
      title: 'ReLU Function',
      slug: 'relu-function',
      summary: 'Visualize ReLU(x) = max(0, x) with adjustable threshold.',
      category: 'deep-learning',
      concepts: ['activation-functions'],
      artifactReferences: ['artifact-relu-function-interactive-visualization'],
      sharedKnowledgeDomains: ['deep-learning', 'mathematical-foundations'],
      parameterSchema: [
        {
          id: 'threshold',
          label: 'Threshold',
          type: 'number',
          min: -2,
          max: 2,
          step: 0.1,
          defaultValue: 0,
          unit: '',
          description: 'The x-value below which the output is zero'
        }
      ],
      defaultParameters: {
        threshold: 0
      },
      renderer: 'line-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'softmax-distribution',
      title: 'Softmax Distribution',
      slug: 'softmax-distribution',
      summary: 'Visualize softmax output for a 4-element vector.',
      category: 'deep-learning',
      concepts: ['softmax'],
      artifactReferences: ['artifact-softmax-distribution-interactive-visualization'],
      sharedKnowledgeDomains: ['deep-learning'],
      parameterSchema: [
        {
          id: 'input1',
          label: 'Input 1',
          type: 'number',
          min: -10,
          max: 10,
          step: 0.5,
          defaultValue: 1,
          unit: '',
          description: 'First element of the input vector'
        },
        {
          id: 'input2',
          label: 'Input 2',
          type: 'number',
          min: -10,
          max: 10,
          step: 0.5,
          defaultValue: 2,
          unit: '',
          description: 'Second element of the input vector'
        },
        {
          id: 'input3',
          label: 'Input 3',
          type: 'number',
          min: -10,
          max: 10,
          step: 0.5,
          defaultValue: 0.5,
          unit: '',
          description: 'Third element of the input vector'
        },
        {
          id: 'input4',
          label: 'Input 4',
          type: 'number',
          min: -10,
          max: 10,
          step: 0.5,
          defaultValue: -1,
          unit: '',
          description: 'Fourth element of the input vector'
        }
      ],
      defaultParameters: {
        input1: 1,
        input2: 2,
        input3: 0.5,
        input4: -1
      },
      renderer: 'bar-chart',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'gradient-descent-loss',
      title: 'Gradient Descent Loss Curve',
      slug: 'gradient-descent-loss',
      summary: 'Visualize loss reduction during gradient descent with configurable learning rate.',
      category: 'optimization',
      concepts: ['gradient-descent'],
      artifactReferences: ['artifact-gradient-descent-loss-interactive-visualization'],
      sharedKnowledgeDomains: ['optimization-theory'],
      parameterSchema: [
        {
          id: 'learningRate',
          label: 'Learning Rate',
          type: 'number',
          min: 0.001,
          max: 1,
          step: 0.001,
          defaultValue: 0.01,
          unit: '',
          description: 'Step size for parameter updates'
        },
        {
          id: 'initialLoss',
          label: 'Initial Loss',
          type: 'number',
          min: 1,
          max: 100,
          step: 1,
          defaultValue: 50,
          unit: '',
          description: 'Starting loss value before optimization'
        },
        {
          id: 'steps',
          label: 'Training Steps',
          type: 'integer',
          min: 10,
          max: 200,
          step: 1,
          defaultValue: 50,
          unit: '',
          description: 'Number of optimization iterations'
        },
        {
          id: 'lossType',
          label: 'Loss Function Type',
          type: 'enum',
          options: ['quadratic', 'exponential', 'log'],
          defaultValue: 'quadratic',
          description: 'Type of loss function'
        }
      ],
      defaultParameters: {
        learningRate: 0.01,
        initialLoss: 50,
        steps: 50,
        lossType: 'quadratic'
      },
      renderer: 'line-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'learning-rate-impact',
      title: 'Learning Rate Impact Comparison',
      slug: 'learning-rate-impact',
      summary: 'Compare how different learning rates affect loss convergence.',
      category: 'optimization',
      concepts: ['learning-rates', 'gradient-descent'],
      artifactReferences: ['artifact-learning-rate-impact-interactive-visualization'],
      sharedKnowledgeDomains: ['optimization-theory'],
      parameterSchema: [
        {
          id: 'lr1',
          label: 'Learning Rate 1',
          type: 'number',
          min: 0.001,
          max: 1,
          step: 0.001,
          defaultValue: 0.001,
          unit: '',
          description: 'First learning rate to compare'
        },
        {
          id: 'lr2',
          label: 'Learning Rate 2',
          type: 'number',
          min: 0.001,
          max: 1,
          step: 0.001,
          defaultValue: 0.01,
          unit: '',
          description: 'Second learning rate to compare'
        },
        {
          id: 'lr3',
          label: 'Learning Rate 3',
          type: 'number',
          min: 0.001,
          max: 1,
          step: 0.001,
          defaultValue: 0.1,
          unit: '',
          description: 'Third learning rate to compare'
        },
        {
          id: 'steps',
          label: 'Training Steps',
          type: 'integer',
          min: 20,
          max: 200,
          step: 1,
          defaultValue: 100,
          unit: '',
          description: 'Number of optimization iterations'
        }
      ],
      defaultParameters: {
        lr1: 0.001,
        lr2: 0.01,
        lr3: 0.1,
        steps: 100
      },
      renderer: 'line-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'bayes-probability',
      title: 'Bayesian Probability Update',
      slug: 'bayes-probability',
      summary: 'Visualize Bayesian posterior probability with prior, likelihood, and false positive rate.',
      category: 'probability',
      concepts: ['bayes-theorem'],
      artifactReferences: ['artifact-bayes-probability-interactive-visualization'],
      sharedKnowledgeDomains: ['probability-theory'],
      parameterSchema: [
        {
          id: 'prior',
          label: 'Prior Probability',
          type: 'number',
          min: 0.01,
          max: 0.99,
          step: 0.01,
          defaultValue: 0.3,
          unit: '',
          description: 'Initial probability of the hypothesis'
        },
        {
          id: 'likelihood',
          label: 'Likelihood',
          type: 'number',
          min: 0.01,
          max: 0.99,
          step: 0.01,
          defaultValue: 0.8,
          unit: '',
          description: 'Probability of observing evidence given the hypothesis'
        },
        {
          id: 'falsePositive',
          label: 'False Positive Rate',
          type: 'number',
          min: 0.01,
          max: 0.99,
          step: 0.01,
          defaultValue: 0.1,
          unit: '',
          description: 'Probability of positive result when hypothesis is false'
        }
      ],
      defaultParameters: {
        prior: 0.3,
        likelihood: 0.8,
        falsePositive: 0.1
      },
      renderer: 'bar-chart',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'cosine-similarity',
      title: 'Cosine Similarity',
      slug: 'cosine-similarity',
      summary: 'Visualize two 2D vectors and their cosine similarity.',
      category: 'mathematics',
      concepts: ['cosine-similarity'],
      artifactReferences: ['artifact-cosine-similarity-interactive-visualization'],
      sharedKnowledgeDomains: ['mathematical-foundations'],
      parameterSchema: [
        {
          id: 'ax',
          label: 'Vector A - X',
          type: 'number',
          min: -10,
          max: 10,
          step: 0.5,
          defaultValue: 1,
          unit: '',
          description: 'X component of vector A'
        },
        {
          id: 'ay',
          label: 'Vector A - Y',
          type: 'number',
          min: -10,
          max: 10,
          step: 0.5,
          defaultValue: 2,
          unit: '',
          description: 'Y component of vector A'
        },
        {
          id: 'bx',
          label: 'Vector B - X',
          type: 'number',
          min: -10,
          max: 10,
          step: 0.5,
          defaultValue: 3,
          unit: '',
          description: 'X component of vector B'
        },
        {
          id: 'by',
          label: 'Vector B - Y',
          type: 'number',
          min: -10,
          max: 10,
          step: 0.5,
          defaultValue: 1,
          unit: '',
          description: 'Y component of vector B'
        }
      ],
      defaultParameters: {
        ax: 1,
        ay: 2,
        bx: 3,
        by: 1
      },
      renderer: 'scatter-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'embedding-space-2d',
      title: '2D Embedding Space',
      slug: 'embedding-space-2d',
      summary: 'Visualize clustered embedding points in 2D space.',
      category: 'embeddings',
      concepts: ['embeddings'],
      artifactReferences: ['artifact-embedding-space-2d-interactive-visualization'],
      sharedKnowledgeDomains: ['representation-learning'],
      parameterSchema: [
        {
          id: 'clusterCount',
          label: 'Number of Clusters',
          type: 'integer',
          min: 2,
          max: 6,
          step: 1,
          defaultValue: 3,
          unit: '',
          description: 'How many distinct clusters to generate'
        },
        {
          id: 'pointsPerCluster',
          label: 'Points Per Cluster',
          type: 'integer',
          min: 5,
          max: 30,
          step: 1,
          defaultValue: 10,
          unit: '',
          description: 'Number of embedding points in each cluster'
        },
        {
          id: 'spread',
          label: 'Cluster Spread',
          type: 'number',
          min: 0.1,
          max: 3,
          step: 0.1,
          defaultValue: 1,
          unit: '',
          description: 'How tightly grouped points are within each cluster'
        }
      ],
      defaultParameters: {
        clusterCount: 3,
        pointsPerCluster: 10,
        spread: 1
      },
      renderer: 'scatter-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'attention-head-weights',
      title: 'Attention Head Weights',
      slug: 'attention-head-weights',
      summary: 'Visualize attention weight heatmaps for transformer heads.',
      category: 'transformers',
      concepts: ['attention-mechanism'],
      artifactReferences: ['artifact-attention-head-weights-interactive-visualization'],
      sharedKnowledgeDomains: ['transformer-architecture'],
      parameterSchema: [
        {
          id: 'tokens',
          label: 'Number of Tokens',
          type: 'integer',
          min: 3,
          max: 8,
          step: 1,
          defaultValue: 5,
          unit: '',
          description: 'Number of tokens in the sequence'
        },
        {
          id: 'headCount',
          label: 'Number of Heads',
          type: 'integer',
          min: 1,
          max: 4,
          step: 1,
          defaultValue: 2,
          unit: '',
          description: 'Number of attention heads to display'
        },
        {
          id: 'temperature',
          label: 'Temperature',
          type: 'number',
          min: 0.1,
          max: 5,
          step: 0.1,
          defaultValue: 1,
          unit: '',
          description: 'Controls the sharpness of attention weights'
        }
      ],
      defaultParameters: {
        tokens: 5,
        headCount: 2,
        temperature: 1
      },
      renderer: 'heatmap',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'knn-neighborhood',
      title: 'K-Nearest Neighbors',
      slug: 'knn-neighborhood',
      summary: 'Visualize KNN classification neighborhood in 2D space.',
      category: 'machine-learning',
      concepts: ['knn'],
      artifactReferences: ['artifact-knn-neighborhood-interactive-visualization'],
      sharedKnowledgeDomains: ['supervised-learning'],
      parameterSchema: [
        {
          id: 'k',
          label: 'K (Neighbors)',
          type: 'integer',
          min: 1,
          max: 10,
          step: 1,
          defaultValue: 3,
          unit: '',
          description: 'Number of nearest neighbors to consider'
        },
        {
          id: 'pointCount',
          label: 'Point Count',
          type: 'integer',
          min: 10,
          max: 50,
          step: 1,
          defaultValue: 20,
          unit: '',
          description: 'Total number of data points'
        },
        {
          id: 'queryX',
          label: 'Query Point X',
          type: 'number',
          min: -5,
          max: 5,
          step: 0.5,
          defaultValue: 0,
          unit: '',
          description: 'X coordinate of the query point'
        },
        {
          id: 'queryY',
          label: 'Query Point Y',
          type: 'number',
          min: -5,
          max: 5,
          step: 0.5,
          defaultValue: 0,
          unit: '',
          description: 'Y coordinate of the query point'
        },
        {
          id: 'seed',
          label: 'Random Seed',
          type: 'integer',
          min: 1,
          max: 100,
          step: 1,
          defaultValue: 42,
          unit: '',
          description: 'Seed for deterministic point generation'
        }
      ],
      defaultParameters: {
        k: 3,
        pointCount: 20,
        queryX: 0,
        queryY: 0,
        seed: 42
      },
      renderer: 'scatter-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'decision-boundary',
      title: 'Decision Boundary',
      slug: 'decision-boundary',
      summary: 'Visualize a linear decision boundary between two classes.',
      category: 'machine-learning',
      concepts: ['decision-boundaries'],
      artifactReferences: ['artifact-decision-boundary-interactive-visualization'],
      sharedKnowledgeDomains: ['supervised-learning'],
      parameterSchema: [
        {
          id: 'separation',
          label: 'Class Separation',
          type: 'number',
          min: 0.5,
          max: 5,
          step: 0.5,
          defaultValue: 2,
          unit: '',
          description: 'Distance between class centers'
        },
        {
          id: 'noise',
          label: 'Noise Level',
          type: 'number',
          min: 0,
          max: 2,
          step: 0.1,
          defaultValue: 0.5,
          unit: '',
          description: 'Amount of random noise in point positions'
        },
        {
          id: 'pointCount',
          label: 'Point Count',
          type: 'integer',
          min: 20,
          max: 100,
          step: 5,
          defaultValue: 40,
          unit: '',
          description: 'Total number of data points'
        },
        {
          id: 'seed',
          label: 'Random Seed',
          type: 'integer',
          min: 1,
          max: 100,
          step: 1,
          defaultValue: 42,
          unit: '',
          description: 'Seed for deterministic point generation'
        }
      ],
      defaultParameters: {
        separation: 2,
        noise: 0.5,
        pointCount: 40,
        seed: 42
      },
      renderer: 'scatter-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'pca-projection',
      title: 'PCA 2D Projection',
      slug: 'pca-projection',
      summary: 'Visualize dimensionality reduction via PCA into 2D.',
      category: 'machine-learning',
      concepts: ['pca'],
      artifactReferences: ['artifact-pca-projection-interactive-visualization'],
      sharedKnowledgeDomains: ['representation-learning', 'supervised-learning'],
      parameterSchema: [
        {
          id: 'variance1',
          label: 'PC1 Variance Explained',
          type: 'number',
          min: 0.1,
          max: 0.9,
          step: 0.05,
          defaultValue: 0.7,
          unit: '',
          description: 'Proportion of variance captured by first component'
        },
        {
          id: 'variance2',
          label: 'PC2 Variance Explained',
          type: 'number',
          min: 0.05,
          max: 0.5,
          step: 0.05,
          defaultValue: 0.2,
          unit: '',
          description: 'Proportion of variance captured by second component'
        },
        {
          id: 'pointCount',
          label: 'Point Count',
          type: 'integer',
          min: 20,
          max: 100,
          step: 5,
          defaultValue: 50,
          unit: '',
          description: 'Total number of data points to project'
        },
        {
          id: 'seed',
          label: 'Random Seed',
          type: 'integer',
          min: 1,
          max: 100,
          step: 1,
          defaultValue: 42,
          unit: '',
          description: 'Seed for deterministic point generation'
        }
      ],
      defaultParameters: {
        variance1: 0.7,
        variance2: 0.2,
        pointCount: 50,
        seed: 42
      },
      renderer: 'scatter-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'precision-recall-tradeoff',
      title: 'Precision-Recall Tradeoff',
      slug: 'precision-recall-tradeoff',
      summary: 'Visualize the precision-recall curve for different classification thresholds.',
      category: 'evaluation',
      concepts: ['precision-recall'],
      artifactReferences: ['artifact-precision-recall-tradeoff-interactive-visualization'],
      sharedKnowledgeDomains: ['model-evaluation'],
      parameterSchema: [
        {
          id: 'threshold',
          label: 'Classification Threshold',
          type: 'number',
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 0.5,
          unit: '',
          description: 'Threshold for positive classification'
        },
        {
          id: 'basePrecision',
          label: 'Base Precision',
          type: 'number',
          min: 0.1,
          max: 1,
          step: 0.05,
          defaultValue: 0.8,
          unit: '',
          description: 'Maximum achievable precision'
        },
        {
          id: 'baseRecall',
          label: 'Base Recall',
          type: 'number',
          min: 0.1,
          max: 1,
          step: 0.05,
          defaultValue: 0.6,
          unit: '',
          description: 'Maximum achievable recall'
        }
      ],
      defaultParameters: {
        threshold: 0.5,
        basePrecision: 0.8,
        baseRecall: 0.6
      },
      renderer: 'line-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'roc-threshold',
      title: 'ROC Curve',
      slug: 'roc-threshold',
      summary: 'Visualize the ROC curve with adjustable TPR and FPR.',
      category: 'evaluation',
      concepts: ['roc-curves'],
      artifactReferences: ['artifact-roc-threshold-interactive-visualization'],
      sharedKnowledgeDomains: ['model-evaluation'],
      parameterSchema: [
        {
          id: 'threshold',
          label: 'Operating Threshold',
          type: 'number',
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 0.5,
          unit: '',
          description: 'Current operating point threshold'
        },
        {
          id: 'tpr',
          label: 'True Positive Rate',
          type: 'number',
          min: 0.1,
          max: 1,
          step: 0.05,
          defaultValue: 0.8,
          unit: '',
          description: 'Sensitivity or recall at current threshold'
        },
        {
          id: 'fpr',
          label: 'False Positive Rate',
          type: 'number',
          min: 0,
          max: 0.5,
          step: 0.01,
          defaultValue: 0.1,
          unit: '',
          description: 'Fall-out rate at current threshold'
        }
      ],
      defaultParameters: {
        threshold: 0.5,
        tpr: 0.8,
        fpr: 0.1
      },
      renderer: 'line-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'confusion-matrix',
      title: 'Confusion Matrix',
      slug: 'confusion-matrix',
      summary: 'Interactive confusion matrix visualization.',
      category: 'evaluation',
      concepts: ['confusion-matrix'],
      artifactReferences: ['artifact-confusion-matrix-interactive-visualization'],
      sharedKnowledgeDomains: ['model-evaluation'],
      parameterSchema: [
        {
          id: 'tp',
          label: 'True Positives',
          type: 'integer',
          min: 0,
          max: 100,
          step: 1,
          defaultValue: 80,
          unit: '',
          description: 'Number of correctly predicted positives'
        },
        {
          id: 'fp',
          label: 'False Positives',
          type: 'integer',
          min: 0,
          max: 50,
          step: 1,
          defaultValue: 10,
          unit: '',
          description: 'Number of incorrectly predicted positives'
        },
        {
          id: 'fn',
          label: 'False Negatives',
          type: 'integer',
          min: 0,
          max: 50,
          step: 1,
          defaultValue: 5,
          unit: '',
          description: 'Number of incorrectly predicted negatives'
        },
        {
          id: 'tn',
          label: 'True Negatives',
          type: 'integer',
          min: 0,
          max: 100,
          step: 1,
          defaultValue: 70,
          unit: '',
          description: 'Number of correctly predicted negatives'
        }
      ],
      defaultParameters: {
        tp: 80,
        fp: 10,
        fn: 5,
        tn: 70
      },
      renderer: 'matrix',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'normal-distribution',
      title: 'Normal Distribution',
      slug: 'normal-distribution',
      summary: 'Visualize the normal (Gaussian) distribution curve.',
      category: 'probability',
      concepts: ['normal-distribution'],
      artifactReferences: ['artifact-normal-distribution-interactive-visualization'],
      sharedKnowledgeDomains: ['probability-theory'],
      parameterSchema: [
        {
          id: 'mean',
          label: 'Mean (μ)',
          type: 'number',
          min: -5,
          max: 5,
          step: 0.1,
          defaultValue: 0,
          unit: '',
          description: 'Center of the distribution'
        },
        {
          id: 'stdDev',
          label: 'Standard Deviation (σ)',
          type: 'number',
          min: 0.1,
          max: 5,
          step: 0.1,
          defaultValue: 1,
          unit: '',
          description: 'Spread of the distribution'
        },
        {
          id: 'sampleSize',
          label: 'Sample Size',
          type: 'integer',
          min: 10,
          max: 1000,
          step: 10,
          defaultValue: 200,
          unit: '',
          description: 'Number of samples to generate for histogram overlay'
        },
        {
          id: 'seed',
          label: 'Random Seed',
          type: 'integer',
          min: 1,
          max: 100,
          step: 1,
          defaultValue: 42,
          unit: '',
          description: 'Seed for deterministic sample generation'
        }
      ],
      defaultParameters: {
        mean: 0,
        stdDev: 1,
        sampleSize: 200,
        seed: 42
      },
      renderer: 'line-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'binomial-distribution',
      title: 'Binomial Distribution',
      slug: 'binomial-distribution',
      summary: 'Visualize the binomial probability distribution.',
      category: 'probability',
      concepts: ['binomial-distribution'],
      artifactReferences: ['artifact-binomial-distribution-interactive-visualization'],
      sharedKnowledgeDomains: ['probability-theory'],
      parameterSchema: [
        {
          id: 'n',
          label: 'Number of Trials (n)',
          type: 'integer',
          min: 1,
          max: 30,
          step: 1,
          defaultValue: 10,
          unit: '',
          description: 'Number of independent trials'
        },
        {
          id: 'p',
          label: 'Success Probability (p)',
          type: 'number',
          min: 0.05,
          max: 0.95,
          step: 0.05,
          defaultValue: 0.5,
          unit: '',
          description: 'Probability of success in each trial'
        }
      ],
      defaultParameters: {
        n: 10,
        p: 0.5
      },
      renderer: 'bar-chart',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    },
    {
      id: 'logistic-curve',
      title: 'Logistic Growth Curve',
      slug: 'logistic-curve',
      summary: 'Visualize logistic growth L / (1 + e^(-k(x-x0))).',
      category: 'mathematics',
      concepts: ['logistic-growth'],
      artifactReferences: ['artifact-logistic-curve-interactive-visualization'],
      sharedKnowledgeDomains: ['mathematical-foundations'],
      parameterSchema: [
        {
          id: 'L',
          label: 'Carrying Capacity (L)',
          type: 'number',
          min: 1,
          max: 100,
          step: 1,
          defaultValue: 50,
          unit: '',
          description: 'Maximum value the curve approaches'
        },
        {
          id: 'k',
          label: 'Growth Rate (k)',
          type: 'number',
          min: 0.01,
          max: 2,
          step: 0.01,
          defaultValue: 0.5,
          unit: '',
          description: 'How quickly the curve transitions'
        },
        {
          id: 'x0',
          label: 'Midpoint (x₀)',
          type: 'number',
          min: -10,
          max: 10,
          step: 0.5,
          defaultValue: 0,
          unit: '',
          description: 'X-value at the inflection point'
        },
        {
          id: 'xMin',
          label: 'X Minimum',
          type: 'number',
          min: -20,
          max: 0,
          step: 1,
          defaultValue: -20,
          unit: '',
          description: 'Left boundary of the x-axis range'
        },
        {
          id: 'xMax',
          label: 'X Maximum',
          type: 'number',
          min: 0,
          max: 20,
          step: 1,
          defaultValue: 20,
          unit: '',
          description: 'Right boundary of the x-axis range'
        }
      ],
      defaultParameters: {
        L: 50,
        k: 0.5,
        x0: 0,
        xMin: -20,
        xMax: 20
      },
      renderer: 'line-plot',
      version: '1.0.0',
      canonicalStatus: true,
      reviewedBy: 'system',
      lastReviewed: '2026-06-25'
    }
  ];

  Object.freeze(definitions);
  definitions.forEach(function(def) { Object.freeze(def); });

  window.NeuralVerse.VisualizationDefinitions = definitions;

  window.NeuralVerse.getDefinition = function(id) {
    for (var i = 0; i < definitions.length; i++) {
      if (definitions[i].id === id) {
        return definitions[i];
      }
    }
    return null;
  };

})();
