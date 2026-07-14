/**
 * NV-900-P9 — XAI Registry
 * Algorithm-specific explanation rules for all 10 canonical laboratories.
 * All rules are pure functions: (params, state, prevState, stepIndex, history) → Finding | null
 * Centralized here — not inside individual lab definition files.
 */

(function () {
  'use strict';

  var Engine;

  function ensureEngine() {
    if (!Engine) Engine = window.NeuralVerse.XAIEngine;
  }

  function F(overrides) {
    ensureEngine();
    return Engine.createFinding(overrides);
  }

  function fmt(n) {
    if (typeof n !== 'number') return String(n);
    return String(Math.round(n * 10000) / 10000);
  }

  function pctChange(prev, curr) {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return Math.round(((curr - prev) / Math.abs(prev)) * 100);
  }

  function absPctChange(prev, curr) {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return Math.round((Math.abs(curr - prev) / Math.abs(prev)) * 100);
  }

  // ═══════════════════════════════════════════════════════════════
  //  GRADIENT DESCENT
  // ═══════════════════════════════════════════════════════════════

  var gradientDescentRules = [
    function gradientMagnitudeRule(params, state, prevState) {
      if (!prevState || state.gradient === undefined) return null;
      var prevGrad = Math.abs(prevState.gradient);
      var currGrad = Math.abs(state.gradient);
      var change = absPctChange(prevGrad, currGrad);

      if (change < 15) return null;

      var direction = currGrad < prevGrad ? 'decreased' : 'increased';
      var severity = 'Information';
      var confidence = 'High';

      if (currGrad < prevGrad && currGrad < 0.01) {
        severity = 'Important';
        confidence = 'Very High';
      } else if (currGrad > prevGrad * 2) {
        severity = 'Significant';
        confidence = 'High';
      }

      return F({
        title: 'Gradient magnitude ' + direction + ' by ' + change + '%',
        observation: 'Gradient magnitude ' + direction + ' from ' + fmt(prevGrad) + ' to ' + fmt(currGrad) + '.',
        cause: currGrad < prevGrad
          ? 'The optimizer has moved into a flatter region of the loss surface where gradients naturally diminish.'
          : 'The optimizer has entered a steeper region of the loss surface.',
        implication: currGrad < prevGrad
          ? 'Optimization is approaching a stationary point. Future parameter updates should become progressively smaller.'
          : 'Parameter updates are becoming larger, indicating movement through a high-curvature region.',
        nextObservation: currGrad < prevGrad
          ? 'Observe whether the gradient continues decreasing toward zero, indicating convergence.'
          : 'Observe whether the gradient stabilizes or continues growing, which may indicate divergence.',
        confidence: confidence,
        severity: severity,
        category: 'Optimization',
        references: ['gradient-descent', 'loss-surface', 'stationary-points'],
        visualEvidence: { type: 'inspector-card', target: 'gradient' }
      });
    },

    function convergenceEventRule(params, state) {
      if (state.gradient === undefined) return null;
      var grad = Math.abs(state.gradient);
      if (grad >= 0.01) return null;

      return F({
        title: 'Optimization entered stable convergence',
        observation: 'Gradient magnitude reduced to ' + fmt(grad) + ', below the 0.01 convergence threshold.',
        cause: 'The optimizer has reached a region where the gradient is nearly zero, indicating proximity to a stationary point (local minimum or saddle point).',
        implication: 'The optimization has effectively converged. Further iterations will produce negligible parameter changes.',
        nextObservation: 'Observe the final loss value. If it is high, the optimizer may have converged to a local minimum rather than the global minimum.',
        confidence: 'Very High',
        severity: 'Important',
        category: 'Convergence',
        references: ['convergence', 'stationary-points', 'local-minima'],
        visualEvidence: { type: 'inspector-card', target: 'status' }
      });
    },

    function oscillationDetectRule(params, state, prevState, stepIndex, history) {
      if (!history || history.length < 4) return null;
      if (state.loss === undefined) return null;

      var recent = history.slice(-4);
      var ups = 0;
      var downs = 0;
      for (var i = 1; i < recent.length; i++) {
        var prevLoss = recent[i - 1].state ? recent[i - 1].state.loss : recent[i - 1].loss;
        var currLoss = recent[i].state ? recent[i].state.loss : recent[i].loss;
        if (prevLoss === undefined || currLoss === undefined) continue;
        if (currLoss > prevLoss) ups++;
        else if (currLoss < prevLoss) downs++;
      }

      if (ups < 2) return null;

      return F({
        title: 'Loss oscillation detected',
        observation: 'Loss alternated between increasing and decreasing over the last ' + recent.length + ' steps.',
        cause: 'The learning rate is likely too large relative to the local curvature, causing the optimizer to overshoot the minimum.',
        implication: 'Oscillation prevents convergence and wastes computation. The effective step size exceeds the distance to the optimum.',
        nextObservation: 'Reduce the learning rate and observe whether oscillation ceases and loss decreases monotonically.',
        confidence: 'High',
        severity: 'Significant',
        category: 'Optimization',
        references: ['oscillation', 'learning-rate', 'overshooting'],
        visualEvidence: { type: 'observation', target: 'loss-curve' }
      });
    },

    function divergenceEventRule(params, state, prevState) {
      if (state.loss === undefined) return null;
      if (prevState && prevState.loss !== undefined && state.loss <= prevState.loss) return null;
      if (state.loss < 100) return null;

      return F({
        title: 'Optimization is diverging',
        observation: 'Loss reached ' + fmt(state.loss) + ', which is uncharacteristically high.',
        cause: 'The learning rate is too large, causing parameter updates that move away from the minimum rather than toward it.',
        implication: 'Divergence means the optimization will not converge under current settings. The loss will continue growing.',
        nextObservation: 'Reduce the learning rate significantly (e.g., divide by 10) and restart the experiment.',
        confidence: 'Very High',
        severity: 'Critical',
        category: 'Optimization',
        references: ['divergence', 'learning-rate', 'instability'],
        visualEvidence: { type: 'inspector-card', target: 'loss' }
      });
    },

    function plateauDetectRule(params, state, prevState, stepIndex, history) {
      if (!history || history.length < 3) return null;
      if (state.gradient === undefined) return null;

      var recent = history.slice(-3);
      var allSmall = true;
      for (var i = 0; i < recent.length; i++) {
        var g = recent[i].state ? Math.abs(recent[i].state.gradient) : 0;
        if (g >= 0.05) { allSmall = false; break; }
      }

      if (!allSmall) return null;
      var grad = Math.abs(state.gradient);
      if (grad >= 0.05) return null;

      return F({
        title: 'Optimizer entered a plateau region',
        observation: 'Gradient magnitude has remained below 0.05 for the last ' + recent.length + ' consecutive steps (current: ' + fmt(grad) + ').',
        cause: 'The loss surface is approximately flat in the current neighborhood, providing very little gradient signal for updates.',
        implication: 'Plateaus slow convergence dramatically. Small gradients yield small steps, prolonging the optimization.',
        nextObservation: 'Increase the learning rate to traverse the plateau faster, or add momentum to accelerate through flat regions.',
        confidence: 'High',
        severity: 'Important',
        category: 'Geometry',
        references: ['plateau', 'flat-region', 'vanishing-gradient'],
        visualEvidence: { type: 'observation', target: 'gradient-magnitude' }
      });
    },

    function learningRateEffectRule(params, state, prevState) {
      if (!prevState || state.stepSize === undefined) return null;
      if (state.gradient === undefined) return null;
      var grad = Math.abs(state.gradient);
      if (grad < 0.001) return null;

      var ratio = state.stepSize / grad;

      if (ratio < 0.5 || ratio > 2.0) {
        var assessment = ratio > 2.0 ? 'overshooting' : 'undershooting';
        return F({
          title: 'Learning rate causing ' + assessment,
          observation: 'Step size (' + fmt(state.stepSize) + ') is ' + (ratio > 2 ? 'more than double' : 'less than half') + ' the gradient magnitude (' + fmt(grad) + ').',
          cause: 'The learning rate ' + (ratio > 2 ? 'is too large relative to the local gradient, causing steps that overshoot the minimum' : 'is too small, causing unnecessarily slow progress'),
          implication: ratio > 2
            ? 'Overshooting wastes computation and may cause oscillation or divergence.'
            : 'Undershooting means convergence will take many more iterations than necessary.',
          nextObservation: ratio > 2
            ? 'Reduce the learning rate to bring step size closer to gradient magnitude.'
            : 'Increase the learning rate to accelerate convergence while avoiding instability.',
          confidence: 'High',
          severity: 'Important',
          category: 'Optimization',
          references: ['learning-rate', 'step-size', 'gradient-magnitude'],
          visualEvidence: { type: 'inspector-card', target: 'learningRate' }
        });
      }
      return null;
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  //  LINEAR REGRESSION
  // ═══════════════════════════════════════════════════════════════

  var linearRegressionRules = [
    function goodnessOfFitRule(params, state) {
      if (state.rSquared === undefined) return null;
      var r2 = state.rSquared;
      var label, severity, confidence;

      if (r2 >= 0.9) {
        label = 'Excellent model fit';
        severity = 'Information';
        confidence = 'Very High';
      } else if (r2 >= 0.7) {
        label = 'Good model fit';
        severity = 'Information';
        confidence = 'High';
      } else if (r2 >= 0.4) {
        label = 'Moderate model fit';
        severity = 'Important';
        confidence = 'Moderate';
      } else {
        label = 'Poor model fit';
        severity = 'Significant';
        confidence = 'High';
      }

      return F({
        title: label + ' (R\u00B2 = ' + fmt(r2) + ')',
        observation: 'The fitted model explains ' + Math.round(r2 * 100) + '% of the variance in the response variable.',
        cause: r2 >= 0.7
          ? 'The linear model captures most of the systematic relationship between the predictor and response variables.'
          : 'Significant variance remains unexplained, suggesting non-linear relationships, missing predictors, or high noise.',
        implication: r2 >= 0.7
          ? 'The linear model is appropriate for this data. Residuals should be examined for patterns.'
          : 'Consider transforming variables, adding features, or using a non-linear model.',
        nextObservation: 'Examine the residual distribution for patterns that might suggest model improvements.',
        confidence: confidence,
        severity: severity,
        category: 'Evaluation',
        references: ['r-squared', 'goodness-of-fit', 'variance-explained'],
        visualEvidence: { type: 'observation', target: 'regression-fit' }
      });
    },

    function slopeMeaningRule(params, state) {
      if (state.fittedSlope === undefined) return null;
      var slope = state.fittedSlope;

      return F({
        title: 'Slope interpretation: ' + fmt(slope) + ' per unit X',
        observation: 'The estimated slope is ' + fmt(slope) + ', indicating the average change in Y for each unit increase in X.',
        cause: 'The least-squares estimation found that ' + (slope > 0 ? 'positive' : 'negative') + ' correlation between X and Y produces the best linear fit.',
        implication: Math.abs(slope) > 1
          ? 'The relationship is relatively strong — Y changes more than one unit per unit of X.'
          : Math.abs(slope) < 0.1
            ? 'The relationship is weak — Y changes very little per unit of X.'
            : 'The relationship is moderate — Y changes proportionally to X.',
        nextObservation: 'Compare the estimated slope to the true generating slope to assess estimation accuracy.',
        confidence: 'High',
        severity: 'Information',
        category: 'Statistical Structure',
        references: ['slope', 'linear-model', 'coefficient-interpretation'],
        visualEvidence: { type: 'inspector-card', target: 'fittedSlope' }
      });
    },

    function residualDistributionRule(params, state, prevState, stepIndex, history) {
      if (stepIndex < 1) return null;
      if (state.residualSumOfSquares === undefined) return null;
      if (state.rSquared === undefined) return null;

      var r2 = state.rSquared;
      var rss = state.residualSumOfSquares;

      var label, severity;
      if (r2 > 0.8 && rss < 10) {
        label = 'Residuals indicate a well-fitted model';
        severity = 'Information';
      } else if (r2 > 0.5) {
        label = 'Residuals suggest moderate unexplained variation';
        severity = 'Important';
      } else {
        label = 'Residuals indicate significant unexplained variation';
        severity = 'Significant';
      }

      return F({
        title: label,
        observation: 'Residual sum of squares: ' + fmt(rss) + ' with R\u00B2 = ' + fmt(r2) + '.',
        cause: r2 > 0.7
          ? 'The linear model captures the dominant pattern in the data, leaving only random noise in the residuals.'
          : 'Substantial systematic variation remains in the residuals, suggesting the model is incomplete.',
        implication: r2 > 0.7
          ? 'Residuals likely approximate random noise — the linear model is appropriate.'
          : 'Look for non-linear patterns, outliers, or heteroscedasticity in the residual plot.',
        nextObservation: 'If residuals show a pattern, consider polynomial features or transformation of variables.',
        confidence: 'High',
        severity: severity,
        category: 'Statistical Structure',
        references: ['residuals', 'model-diagnostics', 'r-squared'],
        visualEvidence: { type: 'observation', target: 'regression-fit' }
      });
    },

    function correlationStrengthRule(params, state) {
      if (state.rSquared === undefined) return null;
      var r = Math.sqrt(Math.abs(state.rSquared));
      if (state.fittedSlope !== undefined && state.fittedSlope < 0) r = -r;

      var label;
      if (Math.abs(r) >= 0.8) label = 'Strong';
      else if (Math.abs(r) >= 0.5) label = 'Moderate';
      else if (Math.abs(r) >= 0.3) label = 'Weak';
      else label = 'Very weak';

      return F({
        title: label + ' correlation (r = ' + fmt(r) + ')',
        observation: 'Pearson correlation coefficient: ' + fmt(r) + ' (' + label.toLowerCase() + ' ' + (r >= 0 ? 'positive' : 'negative') + ' relationship).',
        cause: 'The data exhibits ' + label.toLowerCase() + ' linear association between the predictor and response.',
        implication: Math.abs(r) >= 0.7
          ? 'The strong correlation supports using a linear model for this data.'
          : 'Weak correlation suggests the linear model may not be the best choice, or noise is high.',
        nextObservation: 'Examine scatter plot for non-linear patterns that correlation alone does not capture.',
        confidence: 'High',
        severity: 'Information',
        category: 'Statistical Structure',
        references: ['correlation', 'pearson-r', 'linear-association'],
        visualEvidence: { type: 'observation', target: 'regression-fit' }
      });
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  //  LOGISTIC REGRESSION
  // ═══════════════════════════════════════════════════════════════

  var logisticRegressionRules = [
    function crossEntropyBehaviorRule(params, state, prevState) {
      if (state.loss === undefined) return null;
      if (!prevState || prevState.loss === undefined) return null;

      var change = absPctChange(prevState.loss, state.loss);
      if (change < 5) return null;

      var direction = state.loss < prevState.loss ? 'decreased' : 'increased';
      var severity = 'Information';
      if (state.loss > prevState.loss * 1.5) severity = 'Significant';

      return F({
        title: 'Cross-entropy ' + direction + ' by ' + change + '%',
        observation: 'Loss changed from ' + fmt(prevState.loss) + ' to ' + fmt(state.loss) + ' (' + direction + ' ' + change + '%).',
        cause: direction === 'decreased'
          ? 'The model predictions are becoming better calibrated with the true labels.'
          : 'The model predictions are diverging from the true labels, possibly due to aggressive weight updates.',
        implication: direction === 'decreased'
          ? 'Training is progressing — the model is learning to classify more accurately.'
          : 'Training may be unstable. Consider reducing the learning rate.',
        nextObservation: 'Monitor whether the loss continues to decrease monotonically or begins oscillating.',
        confidence: 'High',
        severity: severity,
        category: 'Optimization',
        references: ['cross-entropy', 'loss-function', 'training-dynamics'],
        visualEvidence: { type: 'inspector-card', target: 'loss' }
      });
    },

    function classificationAccuracyRule(params, state) {
      if (state.accuracy === undefined) return null;
      var acc = state.accuracy;

      var label, severity;
      if (acc >= 0.95) { label = 'Excellent classification accuracy'; severity = 'Information'; }
      else if (acc >= 0.8) { label = 'Good classification accuracy'; severity = 'Information'; }
      else if (acc >= 0.6) { label = 'Moderate classification accuracy'; severity = 'Important'; }
      else { label = 'Low classification accuracy'; severity = 'Significant'; }

      return F({
        title: label + ': ' + Math.round(acc * 100) + '%',
        observation: 'Model classifies ' + Math.round(acc * 100) + '% of training points correctly.',
        cause: acc >= 0.8
          ? 'The decision boundary separates the two classes effectively.'
          : 'The decision boundary fails to separate the classes, possibly due to overlapping distributions or insufficient model capacity.',
        implication: acc >= 0.8
          ? 'The logistic regression model is appropriate for this data distribution.'
          : 'Consider adjusting the separation parameter, reducing noise, or adding polynomial features.',
        nextObservation: 'Examine misclassified points — are they near the decision boundary or systematic outliers?',
        confidence: 'High',
        severity: severity,
        category: 'Classification',
        references: ['accuracy', 'decision-boundary', 'classification-performance'],
        visualEvidence: { type: 'observation', target: 'decision-boundary' }
      });
    },

    function decisionBoundaryShiftRule(params, state, prevState) {
      if (!prevState) return null;
      if (state.w1 === undefined || prevState.w1 === undefined) return null;

      var w1Change = Math.abs(state.w1 - prevState.w1);
      var w2Change = Math.abs((state.w2 || 0) - (prevState.w2 || 0));
      var totalChange = w1Change + w2Change;

      if (totalChange < 0.01) return null;

      return F({
        title: 'Decision boundary shifted (weight change: ' + fmt(totalChange) + ')',
        observation: 'Weight magnitudes changed by ' + fmt(totalChange) + ' across features.',
        cause: 'Gradient updates modified the model weights, rotating and translating the decision boundary.',
        implication: totalChange > 0.1
          ? 'The boundary is still moving significantly — the model has not yet stabilized.'
          : 'The boundary is making fine adjustments — convergence is approaching.',
        nextObservation: 'Track whether boundary shifts correspond to improved accuracy or merely oscillation.',
        confidence: 'Moderate',
        severity: 'Information',
        category: 'Classification',
        references: ['decision-boundary', 'weight-updates', 'convergence'],
        visualEvidence: { type: 'observation', target: 'decision-boundary' }
      });
    },

    function weightEvolutionRule(params, state, prevState) {
      if (!prevState) return null;
      if (state.w1 === undefined) return null;

      var currMag = Math.sqrt(state.w1 * state.w1 + (state.w2 || 0) * (state.w2 || 0));
      var prevMag = Math.sqrt(prevState.w1 * prevState.w1 + (prevState.w2 || 0) * (prevState.w2 || 0));

      if (currMag > prevMag * 3 && currMag > 5) {
        return F({
          title: 'Weight magnitudes growing rapidly',
          observation: 'Weight norm increased from ' + fmt(prevMag) + ' to ' + fmt(currMag) + '.',
          cause: 'Gradient updates are accumulating without sufficient regularization, causing weights to grow unboundedly.',
          implication: 'Large weights produce extreme logistic outputs, reducing calibration and increasing overfitting risk.',
          nextObservation: 'Add regularization or reduce learning rate to constrain weight growth.',
          confidence: 'High',
          severity: 'Significant',
          category: 'Optimization',
          references: ['weight-growth', 'regularization', 'overfitting'],
          visualEvidence: { type: 'inspector-card', target: 'w1' }
        });
      }
      return null;
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  //  K-MEANS CLUSTERING
  // ═══════════════════════════════════════════════════════════════

  var kmeansRules = [
    function centroidMovementRule(params, state, prevState) {
      if (!prevState) return null;
      if (state.centroidDisplacement === undefined) return null;

      var disp = state.centroidDisplacement;
      if (prevState.centroidDisplacement !== undefined) {
        var change = absPctChange(prevState.centroidDisplacement, disp);
        if (change < 10 && disp > 0.01) return null;
      }

      if (disp < 0.01) {
        return F({
          title: 'Centroid movement became negligible',
          observation: 'Centroid displacement: ' + fmt(disp) + ', below the stabilization threshold.',
          cause: 'Centroids have reached their optimal positions — further assignment updates produce no meaningful movement.',
          implication: 'The clustering solution has stabilized. Additional iterations will not change the result.',
          nextObservation: 'Examine cluster compactness and separation to evaluate solution quality.',
          confidence: 'Very High',
          severity: 'Information',
          category: 'Clustering',
          references: ['convergence', 'centroid-position', 'stabilization'],
          visualEvidence: { type: 'inspector-card', target: 'centroidDisplacement' }
        });
      }

      return null;
    },

    function clusterStabilityRule(params, state, prevState) {
      if (!prevState) return null;
      if (state.assignmentChanges === undefined) return null;

      var changes = state.assignmentChanges;
      if (changes === 0) {
        return F({
          title: 'Cluster assignments stabilized',
          observation: 'Zero assignment changes — every point remains in its assigned cluster.',
          cause: 'The current centroids produce a stable partitioning of the data.',
          implication: 'K-Means has converged. The clustering solution is locally optimal.',
          nextObservation: 'Evaluate inertia and cluster separation to assess solution quality.',
          confidence: 'Very High',
          severity: 'Information',
          category: 'Convergence',
          references: ['stability', 'assignment', 'convergence'],
          visualEvidence: { type: 'inspector-card', target: 'assignmentChanges' }
        });
      }

      if (changes > params.numPoints * 0.3) {
        return F({
          title: 'High cluster instability (' + changes + ' assignment changes)',
          observation: Math.round(changes) + ' points changed cluster assignment in this iteration.',
          cause: 'Centroids are still moving significantly, causing widespread reassignment of data points.',
          implication: 'The clustering is still evolving. The current solution is not yet stable.',
          nextObservation: 'Continue iterating. If instability persists, the number of clusters may be inappropriate.',
          confidence: 'High',
          severity: 'Important',
          category: 'Clustering',
          references: ['instability', 'reassignment', 'iteration-dynamics'],
          visualEvidence: { type: 'inspector-card', target: 'assignmentChanges' }
        });
      }

      return null;
    },

    function emptyClusterRule(params, state) {
      if (state.emptyClusters === undefined) return null;
      if (state.emptyClusters === 0) return null;

      return F({
        title: state.emptyClusters + ' empty cluster(s) detected',
        observation: state.emptyClusters + ' of ' + params.numClusters + ' clusters contain no data points.',
        cause: 'Initial centroid placement or data distribution caused one or more clusters to lose all members during assignment.',
        implication: 'Empty clusters reduce the effective number of clusters and may indicate that K is too large for this data.',
        nextObservation: 'Reduce the number of clusters or use k-means++ initialization for better centroid placement.',
        confidence: 'Very High',
        severity: 'Significant',
        category: 'Clustering',
        references: ['empty-clusters', 'initialization', 'cluster-count'],
        visualEvidence: { type: 'observation', target: 'cluster-scatter' }
      });
    },

    function inertiaImprovementRule(params, state, prevState, stepIndex) {
      if (stepIndex < 2) return null;
      if (!prevState || state.inertia === undefined || prevState.inertia === undefined) return null;

      var change = absPctChange(prevState.inertia, state.inertia);
      if (change > 1) return null;

      return F({
        title: 'Inertia improvement became marginal',
        observation: 'Inertia changed by only ' + fmt(change) + '% between iterations (' + fmt(prevState.inertia) + ' → ' + fmt(state.inertia) + ').',
        cause: 'The clustering has reached a point where centroid adjustments yield negligible improvement in within-cluster sum of squares.',
        implication: 'Further iterations are unlikely to meaningfully improve the clustering solution.',
        nextObservation: 'Consider the current solution final. Evaluate cluster separation and compactness.',
        confidence: 'High',
        severity: 'Information',
        category: 'Convergence',
        references: ['inertia', 'marginal-improvement', 'convergence-criterion'],
        visualEvidence: { type: 'inspector-card', target: 'inertia' }
      });
    },

    function clusterCompactnessRule(params, state) {
      if (state.inertia === undefined || state.numPoints === undefined) return null;
      var avgInertia = state.inertia / state.numPoints;

      var label, severity;
      if (avgInertia < 1) { label = 'Highly compact clusters'; severity = 'Information'; }
      else if (avgInertia < 5) { label = 'Moderately compact clusters'; severity = 'Information'; }
      else { label = 'Loosely compact clusters'; severity = 'Important'; }

      return F({
        title: label + ' (avg inertia: ' + fmt(avgInertia) + ')',
        observation: 'Average within-cluster inertia per point: ' + fmt(avgInertia) + '.',
        cause: avgInertia < 2
          ? 'Data points are tightly grouped around their centroids.'
          : 'Data points are spread widely around their centroids, indicating high within-cluster variance.',
        implication: avgInertia < 2
          ? 'The clustering has found tight, well-defined groups.'
          : 'Consider whether K is too small or the data lacks clear cluster structure.',
        nextObservation: 'Compare compactness across different K values to find the optimal number of clusters.',
        confidence: 'Moderate',
        severity: severity,
        category: 'Clustering',
        references: ['compactness', 'inertia', 'cluster-quality'],
        visualEvidence: { type: 'observation', target: 'cluster-scatter' }
      });
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  //  PCA PROJECTION
  // ═══════════════════════════════════════════════════════════════

  var pcaRules = [
    function varianceConcentrationRule(params, state) {
      if (state.variancePC1 === undefined) return null;
      var v1 = state.variancePC1;

      var label, severity, confidence;
      if (v1 >= 0.9) {
        label = 'Dominant principal component';
        severity = 'Information';
        confidence = 'Very High';
      } else if (v1 >= 0.7) {
        label = 'Strong variance concentration';
        severity = 'Information';
        confidence = 'High';
      } else if (v1 >= 0.5) {
        label = 'Moderate variance concentration';
        severity = 'Important';
        confidence = 'Moderate';
      } else {
        label = 'Distributed variance';
        severity = 'Information';
        confidence = 'Moderate';
      }

      return F({
        title: label + ' (PC1 explains ' + Math.round(v1 * 100) + '%)',
        observation: 'The first principal component explains ' + Math.round(v1 * 100) + '% of total variance.',
        cause: v1 > 0.7
          ? 'Most of the data variation lies along a single direction, indicating strong linear structure.'
          : 'Variance is distributed across multiple directions, suggesting complex multi-dimensional structure.',
        implication: v1 > 0.8
          ? 'A one-dimensional projection captures most information — dimensionality reduction is highly effective.'
          : 'A single component loses significant information. Consider retaining more components.',
        nextObservation: 'Examine the second principal component to understand remaining variance structure.',
        confidence: confidence,
        severity: severity,
        category: 'Representation',
        references: ['variance-explained', 'principal-components', 'dimensionality-reduction'],
        visualEvidence: { type: 'inspector-card', target: 'variancePC1' }
      });
    },

    function informationLossRule(params, state) {
      if (state.totalVariance === undefined) return null;
      if (state.projectedVariance === undefined) return null;

      var retention = state.totalVariance > 0 ? state.projectedVariance / state.totalVariance : 1;
      var loss = 1 - retention;

      var severity = 'Information';
      if (loss > 0.3) severity = 'Significant';
      else if (loss > 0.15) severity = 'Important';

      return F({
        title: 'Projection retains ' + Math.round(retention * 100) + '% of variance',
        observation: 'Projected variance: ' + fmt(state.projectedVariance) + ' of ' + fmt(state.totalVariance) + ' total (' + Math.round(retention * 100) + '% retained).',
        cause: loss < 0.1
          ? 'The projection direction aligns closely with the dominant data variation.'
          : 'Significant variation is orthogonal to the projection direction and is lost.',
        implication: loss < 0.1
          ? 'The projection preserves nearly all information — visual analysis is reliable.'
          : 'The projection loses substantial information — conclusions from the 2D view may be misleading.',
        nextObservation: 'If information loss is high, try adjusting the rotation parameter to align with principal axes.',
        confidence: 'Very High',
        severity: severity,
        category: 'Representation',
        references: ['information-loss', 'projection-quality', 'variance-retention'],
        visualEvidence: { type: 'observation', target: 'pca-scatter' }
      });
    },

    function correlationStructureRule(params, state) {
      if (state.correlation === undefined) return null;
      var corr = state.correlation;
      var absCorr = Math.abs(corr);

      if (absCorr < 0.3) return null;

      var label = absCorr > 0.7 ? 'Strong' : 'Moderate';
      var direction = corr > 0 ? 'positive' : 'negative';

      return F({
        title: label + ' ' + direction + ' correlation (r = ' + fmt(corr) + ')',
        observation: 'Correlation between original dimensions: ' + fmt(corr) + '.',
        cause: 'The two dimensions share ' + (absCorr > 0.7 ? 'substantial' : 'moderate') + ' linear dependence.',
        implication: absCorr > 0.7
          ? 'High correlation means PCA can effectively compress the data with minimal information loss.'
          : 'Moderate correlation suggests some redundancy, but independent variation remains.',
        nextObservation: 'Observe how the principal components align with the correlated dimensions.',
        confidence: 'High',
        severity: 'Information',
        category: 'Statistical Structure',
        references: ['correlation', 'covariance', 'redundancy'],
        visualEvidence: { type: 'observation', target: 'pca-scatter' }
      });
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  //  BAYES RULE
  // ═══════════════════════════════════════════════════════════════

  var bayesRules = [
    function beliefUpdateRule(params, state, prevState) {
      if (!prevState) return null;
      if (state.posterior === undefined || prevState.posterior === undefined) return null;

      var shift = Math.abs(state.posterior - prevState.posterior);
      if (shift < 0.01) return null;

      var direction = state.posterior > prevState.posterior ? 'increased' : 'decreased';

      return F({
        title: 'Posterior belief ' + direction + ' by ' + Math.round(shift * 100) + ' percentage points',
        observation: 'Posterior probability shifted from ' + fmt(prevState.posterior) + ' to ' + fmt(state.posterior) + '.',
        cause: 'New evidence has updated the prior belief through Bayes\u2019 theorem. The likelihood of the evidence under each hypothesis drove the update.',
        implication: shift > 0.2
          ? 'Strong evidence has significantly revised the initial belief.'
          : 'The evidence provided a modest update to the existing belief.',
        nextObservation: 'Observe whether additional evidence continues to shift the posterior or if it stabilizes.',
        confidence: 'Very High',
        severity: shift > 0.3 ? 'Important' : 'Information',
        category: 'Probability',
        references: ['bayes-theorem', 'posterior-update', 'evidence'],
        visualEvidence: { type: 'observation', target: 'bayes-chart' }
      });
    },

    function priorDominanceRule(params, state) {
      if (state.posterior === undefined || state.prior === undefined) return null;
      if (state.likelihood === undefined) return null;

      var priorDominance = Math.abs(state.posterior - state.prior) < 0.05;

      if (!priorDominance) return null;

      return F({
        title: 'Prior dominates the posterior',
        observation: 'Posterior (' + fmt(state.posterior) + ') is very close to prior (' + fmt(state.prior) + '), despite evidence likelihood of ' + fmt(state.likelihood) + '.',
        cause: 'The prior was set with high confidence (strong conviction), making it resistant to update by the available evidence.',
        implication: 'The evidence is insufficient to overcome the prior belief. More data or stronger evidence is needed.',
        nextObservation: 'Try a weaker (more uniform) prior, or observe how repeated evidence accumulation shifts the posterior.',
        confidence: 'High',
        severity: 'Important',
        category: 'Probability',
        references: ['prior-dominance', 'evidence-strength', 'prior-sensitivity'],
        visualEvidence: { type: 'observation', target: 'bayes-chart' }
      });
    },

    function uncertaintyReductionRule(params, state, prevState) {
      if (!prevState) return null;
      if (state.posterior === undefined || prevState.posterior === undefined) return null;

      var prevUncert = prevState.posterior * (1 - prevState.posterior);
      var currUncert = state.posterior * (1 - state.posterior);
      if (prevUncert === 0) return null;

      var reduction = pctChange(prevUncert, currUncert);

      if (reduction >= 5) {
        return F({
          title: 'Uncertainty reduced by ' + Math.abs(reduction) + '%',
          observation: 'Posterior entropy decreased from ' + fmt(prevUncert) + ' to ' + fmt(currUncert) + '.',
          cause: 'The evidence has narrowed the range of plausible beliefs, concentrating probability mass.',
          implication: 'Reduced uncertainty means the model is becoming more confident in its classification.',
          nextObservation: 'Monitor whether continued evidence drives certainty toward 0 or 1.',
          confidence: 'High',
          severity: 'Information',
          category: 'Probability',
          references: ['uncertainty', 'entropy', 'information-gain'],
          visualEvidence: { type: 'observation', target: 'bayes-chart' }
        });
      }
      return null;
    },

    function evidenceStrengthRule(params, state) {
      if (state.likelihood === undefined || state.prior === undefined) return null;

      var evidenceRatio = state.likelihood / (1 - state.likelihood + 1e-10);
      var priorRatio = state.prior / (1 - state.prior + 1e-10);
      var bayesFactor = evidenceRatio / (priorRatio + 1e-10);

      var label, severity;
      if (Math.abs(Math.log(bayesFactor)) > 3) { label = 'Decisive evidence'; severity = 'Important'; }
      else if (Math.abs(Math.log(bayesFactor)) > 1) { label = 'Strong evidence'; severity = 'Information'; }
      else { label = 'Weak evidence'; severity = 'Information'; }

      return F({
        title: label + ' (Bayes factor: ' + fmt(bayesFactor) + ')',
        observation: 'Evidence likelihood ratio: ' + fmt(evidenceRatio) + '. Bayes factor relative to prior: ' + fmt(bayesFactor) + '.',
        cause: bayesFactor > 1
          ? 'The observed evidence is more likely under the positive hypothesis than the negative hypothesis.'
          : 'The observed evidence is more likely under the negative hypothesis.',
        implication: Math.abs(Math.log(bayesFactor)) > 3
          ? 'The evidence strongly favors one hypothesis — the posterior will be dominated by likelihood.'
          : 'The evidence is moderate — both prior and likelihood contribute meaningfully to the posterior.',
        nextObservation: 'Observe how multiple independent evidence instances compound the Bayes factor.',
        confidence: 'High',
        severity: severity,
        category: 'Probability',
        references: ['bayes-factor', 'evidence-strength', 'likelihood-ratio'],
        visualEvidence: { type: 'observation', target: 'bayes-chart' }
      });
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  //  EMBEDDING SIMILARITY
  // ═══════════════════════════════════════════════════════════════

  var embeddingSimilarityRules = [
    function nearestNeighborsRule(params, state) {
      if (state.topKSimilarity === undefined) return null;
      var sim = state.topKSimilarity;

      var label, severity;
      if (sim > 0.9) { label = 'Highly similar neighbors'; severity = 'Information'; }
      else if (sim > 0.7) { label = 'Similar neighbors'; severity = 'Information'; }
      else if (sim > 0.4) { label = 'Moderately similar neighbors'; severity = 'Important'; }
      else { label = 'Diverse neighborhood'; severity = 'Information'; }

      return F({
        title: label + ' (similarity: ' + fmt(sim) + ')',
        observation: 'Top-K nearest neighbor average similarity: ' + fmt(sim) + '.',
        cause: sim > 0.7
          ? 'The query embedding is located in a dense region of the embedding space where nearby vectors are semantically similar.'
          : 'The query embedding is in a sparse or transition region where nearby vectors vary in meaning.',
        implication: sim > 0.7
          ? 'The embedding captures coherent semantic neighborhoods for this query.'
          : 'The embedding space may not distinguish fine-grained semantics for this query.',
        nextObservation: 'Examine the specific neighbors to verify semantic coherence.',
        confidence: 'High',
        severity: severity,
        category: 'Representation',
        references: ['nearest-neighbors', 'embedding-density', 'semantic-neighborhood'],
        visualEvidence: { type: 'observation', target: 'similarity-scatter' }
      });
    },

    function distanceInterpretationRule(params, state) {
      if (state.minDistance === undefined || state.maxDistance === undefined) return null;
      if (state.meanDistance === undefined) return null;

      var range = state.maxDistance - state.minDistance;

      return F({
        title: 'Distance distribution: range ' + fmt(range) + ' (mean: ' + fmt(state.meanDistance) + ')',
        observation: 'Pairwise distances range from ' + fmt(state.minDistance) + ' to ' + fmt(state.maxDistance) + ' with mean ' + fmt(state.meanDistance) + '.',
        cause: range > state.meanDistance
          ? 'Large distance variance suggests distinct clusters or outliers in the embedding space.'
          : 'Uniform distances suggest a smooth, evenly distributed embedding space.',
        implication: range > state.meanDistance * 2
          ? 'Clear separation exists between similar and dissimilar items — the embedding is discriminative.'
          : 'Limited distance range may reduce the embedding\u2019s ability to distinguish subtle differences.',
        nextObservation: 'Check whether extreme distances correspond to semantically meaningful pairs.',
        confidence: 'Moderate',
        severity: 'Information',
        category: 'Similarity',
        references: ['distance-distribution', 'embedding-geometry', 'discriminability'],
        visualEvidence: { type: 'observation', target: 'similarity-scatter' }
      });
    },

    function embeddingDensityRule(params, state) {
      if (state.localDensity === undefined) return null;
      var density = state.localDensity;

      var label, severity;
      if (density > 0.8) { label = 'High embedding density'; severity = 'Information'; }
      else if (density > 0.4) { label = 'Moderate embedding density'; severity = 'Information'; }
      else { label = 'Low embedding density'; severity = 'Important'; }

      return F({
        title: label + ' (' + fmt(density) + ')',
        observation: 'Local embedding density around query: ' + fmt(density) + '.',
        cause: density > 0.6
          ? 'Many embeddings are packed into a small region, indicating semantic clustering.'
          : 'Embeddings are sparsely distributed, indicating diverse or heterogeneous semantics.',
        implication: density > 0.6
          ? 'High density means the embedding space groups related concepts tightly.'
          : 'Low density may indicate the concept is underrepresented in the embedding vocabulary.',
        nextObservation: 'Compare density across different queries to identify semantic hotspots.',
        confidence: 'Moderate',
        severity: severity,
        category: 'Representation',
        references: ['embedding-density', 'semantic-clustering', 'vector-space'],
        visualEvidence: { type: 'observation', target: 'similarity-scatter' }
      });
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  //  COSINE SIMILARITY
  // ═══════════════════════════════════════════════════════════════

  var cosineSimilarityRules = [
    function angleInterpretationRule(params, state) {
      if (state.angle === undefined) return null;
      var angle = Number.parseFloat(state.angle);
      if (!Number.isFinite(angle)) return null;
      var cosSim = Number.isFinite(state.cosineSimilarity) ? state.cosineSimilarity : Math.cos(angle * Math.PI / 180);

      var label, severity;
      if (angle < 15) { label = 'Near-identical direction'; severity = 'Information'; }
      else if (angle < 45) { label = 'Strong directional alignment'; severity = 'Information'; }
      else if (angle < 90) { label = 'Moderate directional similarity'; severity = 'Information'; }
      else if (angle < 135) { label = 'Divergent directions'; severity = 'Important'; }
      else { label = 'Near-opposite directions'; severity = 'Information'; }

      return F({
        title: label + ' (angle: ' + fmt(angle) + '\u00B0)',
        observation: 'Angle between vectors: ' + fmt(angle) + '\u00B0. Cosine similarity: ' + fmt(cosSim) + '.',
        cause: angle < 90
          ? 'The vectors share a common directional component, indicating aligned semantics or features.'
          : 'The vectors point in opposing directions, indicating contrasting semantics or features.',
        implication: angle < 30
          ? 'Near-identical vectors suggest redundant or duplicate representations.'
          : angle > 150
            ? 'Opposite vectors may represent antonyms, negative correlations, or complementary concepts.'
            : 'Moderate angles indicate related but distinct concepts.',
        nextObservation: 'Compare magnitudes independently — cosine similarity is scale-invariant.',
        confidence: 'Very High',
        severity: severity,
        category: 'Similarity',
        references: ['cosine-similarity', 'angle', 'directional-similarity'],
        visualEvidence: { type: 'observation', target: 'cosine-viz' }
      });
    },

    function magnitudeIndependenceRule(params, state) {
      if (state.magnitude1 === undefined || state.magnitude2 === undefined) return null;
      var ratio = state.magnitude1 / (state.magnitude2 || 1);

      if (ratio < 1.2 && ratio > 0.8) return null;

      var label = ratio > 2 ? 'significant' : 'moderate';

      return F({
        title: 'Magnitude difference: ' + fmt(state.magnitude1) + ' vs ' + fmt(state.magnitude2),
        observation: 'Vector magnitudes differ by a factor of ' + fmt(ratio > 1 ? ratio : 1 / ratio) + '.',
        cause: 'The vectors have different L2 norms, indicating different scales or energy levels.',
        implication: 'Cosine similarity ignores magnitude — vectors with very different scales can still have high directional similarity.',
        nextObservation: 'Consider whether magnitude differences are semantically meaningful in this context.',
        confidence: 'High',
        severity: 'Information',
        category: 'Similarity',
        references: ['magnitude', 'scale-invariance', 'vector-norm'],
        visualEvidence: { type: 'observation', target: 'cosine-viz' }
      });
    },

    function orthogonalityRule(params, state) {
      if (state.angle === undefined) return null;
      var angle = state.angle;
      if (Math.abs(angle - 90) > 10) return null;

      return F({
        title: 'Vectors are approximately orthogonal',
        observation: 'Angle between vectors: ' + fmt(angle) + '\u00B0 (within 10\u00B0 of 90\u00B0).',
        cause: 'The vectors are perpendicular in the embedding space, sharing no directional component.',
        implication: 'Orthogonal vectors are statistically independent in the linear subspace — they carry non-overlapping information.',
        nextObservation: 'In attention mechanisms, orthogonality between query and key means minimal attention weight.',
        confidence: 'High',
        severity: 'Information',
        category: 'Similarity',
        references: ['orthogonality', 'independence', 'zero-similarity'],
        visualEvidence: { type: 'observation', target: 'cosine-viz' }
      });
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  //  PRECISION VS RECALL
  // ═══════════════════════════════════════════════════════════════

  var precisionRecallRules = [
    function thresholdTradeoffRule(params, state, prevState) {
      if (state.precision === undefined || state.recall === undefined) return null;
      if (!prevState || prevState.precision === undefined) return null;

      var pChange = state.precision - prevState.precision;
      var rChange = state.recall - prevState.recall;

      if (Math.abs(pChange) < 0.02 && Math.abs(rChange) < 0.02) return null;

      var direction;
      if (pChange > 0.02 && rChange < -0.02) direction = 'precision increased at the cost of recall';
      else if (pChange < -0.02 && rChange > 0.02) direction = 'recall increased at the cost of precision';
      else if (pChange > 0.02 && rChange > 0.02) direction = 'both precision and recall improved';
      else direction = 'both precision and recall decreased';

      return F({
        title: 'Threshold shift: ' + direction,
        observation: 'Precision: ' + fmt(prevState.precision) + ' → ' + fmt(state.precision) + '. Recall: ' + fmt(prevState.recall) + ' → ' + fmt(state.recall) + '.',
        cause: 'Moving the classification threshold changes the balance between false positives and false negatives.',
        implication: direction.indexOf('precision increased') >= 0
          ? 'Higher threshold means fewer false positives but more missed detections.'
          : direction.indexOf('recall increased') >= 0
            ? 'Lower threshold means fewer missed detections but more false alarms.'
            : 'The threshold change affected both metrics in the same direction.',
        nextObservation: 'Examine the F1 score to determine if the overall balance improved.',
        confidence: 'High',
        severity: 'Information',
        category: 'Evaluation',
        references: ['precision-recall-tradeoff', 'threshold', 'classification-threshold'],
        visualEvidence: { type: 'observation', target: 'pr-curve' }
      });
    },

    function f1ScoreRule(params, state) {
      if (state.f1Score === undefined) return null;
      var f1 = state.f1Score;

      var label, severity;
      if (f1 >= 0.9) { label = 'Excellent F1 score'; severity = 'Information'; }
      else if (f1 >= 0.7) { label = 'Good F1 score'; severity = 'Information'; }
      else if (f1 >= 0.5) { label = 'Moderate F1 score'; severity = 'Important'; }
      else { label = 'Poor F1 score'; severity = 'Significant'; }

      return F({
        title: label + ': ' + fmt(f1),
        observation: 'F1 score: ' + fmt(f1) + ' (harmonic mean of precision and recall).',
        cause: f1 >= 0.7
          ? 'The model achieves a good balance between precision and recall.'
          : 'Either precision or recall (or both) are low, indicating classification imbalance.',
        implication: f1 >= 0.7
          ? 'The classifier is performing well overall for the current threshold.'
          : 'Adjust the threshold or improve the model to achieve better balance.',
        nextObservation: 'Compare F1 across different thresholds to find the optimal operating point.',
        confidence: 'High',
        severity: severity,
        category: 'Evaluation',
        references: ['f1-score', 'precision', 'recall', 'harmonic-mean'],
        visualEvidence: { type: 'observation', target: 'pr-curve' }
      });
    },

    function optimalThresholdRule(params, state) {
      if (state.optimalThreshold === undefined) return null;
      if (state.threshold === undefined) return null;

      var distance = Math.abs(state.threshold - state.optimalThreshold);
      if (distance < 0.05) return null;

      return F({
        title: 'Current threshold is suboptimal',
        observation: 'Current threshold: ' + fmt(state.threshold) + '. Optimal F1 threshold: ' + fmt(state.optimalThreshold) + '.',
        cause: 'The current operating point does not maximize the harmonic mean of precision and recall.',
        implication: 'Moving toward the optimal threshold would improve overall classification balance.',
        nextObservation: 'Adjust the threshold toward ' + fmt(state.optimalThreshold) + ' and observe F1 improvement.',
        confidence: 'Moderate',
        severity: 'Important',
        category: 'Evaluation',
        references: ['optimal-threshold', 'f1-maximization', 'operating-point'],
        visualEvidence: { type: 'observation', target: 'pr-curve' }
      });
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  //  TRANSFORMER ATTENTION
  // ═══════════════════════════════════════════════════════════════

  var transformerAttentionRules = [
    function attentionEntropyRule(params, state, prevState) {
      if (state.attentionEntropy === undefined) return null;
      var entropy = state.attentionEntropy;
      var maxEntropy = Math.log(state.numTokens || 6);

      var concentration = maxEntropy > 0 ? 1 - entropy / maxEntropy : 0;

      var label, severity;
      if (concentration > 0.7) { label = 'Highly focused attention'; severity = 'Information'; }
      else if (concentration > 0.4) { label = 'Moderately focused attention'; severity = 'Information'; }
      else { label = 'Diffuse attention'; severity = 'Important'; }

      return F({
        title: label + ' (entropy: ' + fmt(entropy) + ')',
        observation: 'Attention entropy: ' + fmt(entropy) + ' (max possible: ' + fmt(maxEntropy) + '). Concentration: ' + Math.round(concentration * 100) + '%.',
        cause: concentration > 0.5
          ? 'The model is assigning high probability to a few specific tokens, focusing on relevant context.'
          : 'The model distributes attention broadly, either due to uncertain context or uniform relevance.',
        implication: concentration > 0.7
          ? 'Strong focus suggests the model has identified clear key tokens for the current task.'
          : 'Diffuse attention may indicate noisy context, ambiguous relationships, or over-smoothing.',
        nextObservation: 'Identify which tokens receive the highest attention weights.',
        confidence: 'High',
        severity: severity,
        category: 'Attention',
        references: ['attention-entropy', 'focus', 'information-concentration'],
        visualEvidence: { type: 'observation', target: 'attention-matrix' }
      });
    },

    function tokenImportanceRule(params, state) {
      if (state.maxAttentionWeight === undefined) return null;
      if (state.dominantToken === undefined) return null;

      var weight = state.maxAttentionWeight;

      var severity = 'Information';
      if (weight > 0.8) severity = 'Important';

      return F({
        title: 'Dominant token: "' + state.dominantToken + '" (' + Math.round(weight * 100) + '% attention)',
        observation: 'Token "' + state.dominantToken + '" receives ' + Math.round(weight * 100) + '% of the total attention weight.',
        cause: weight > 0.5
          ? 'This token has the strongest query-key similarity, making it the primary focus of the attention mechanism.'
          : 'Attention is distributed relatively evenly, with no single dominant token.',
        implication: weight > 0.6
          ? 'The model relies heavily on this token for context — it is the key information carrier.'
          : 'No single token dominates, suggesting balanced contextual relationships.',
        nextObservation: 'Examine whether the dominant token is semantically relevant to the query.',
        confidence: 'High',
        severity: severity,
        category: 'Attention',
        references: ['token-importance', 'attention-weights', 'key-token'],
        visualEvidence: { type: 'observation', target: 'attention-matrix' }
      });
    },

    function attentionDiffusionRule(params, state, prevState) {
      if (!prevState) return null;
      if (state.attentionEntropy === undefined || prevState.attentionEntropy === undefined) return null;

      var entropyChange = state.attentionEntropy - prevState.attentionEntropy;
      if (Math.abs(entropyChange) < 0.1) return null;

      var direction = entropyChange > 0 ? 'increased' : 'decreased';
      var concentrationChange = entropyChange > 0 ? 'more diffuse' : 'more focused';

      return F({
        title: 'Attention became ' + concentrationChange + ' (entropy ' + direction + ' by ' + fmt(Math.abs(entropyChange)) + ')',
        observation: 'Attention entropy shifted from ' + fmt(prevState.attentionEntropy) + ' to ' + fmt(state.attentionEntropy) + '.',
        cause: direction === 'increased'
          ? 'The model is distributing attention more broadly, possibly due to ambiguous or noisy context.'
          : 'The model is concentrating attention on fewer tokens, indicating clearer contextual signals.',
        implication: direction === 'increased'
          ? 'Diffuse attention may reduce the model\u2019s ability to focus on critical information.'
          : 'Concentrated attention improves signal-to-noise ratio in the context representation.',
        nextObservation: 'Monitor whether entropy continues to trend in the same direction across layers.',
        confidence: 'High',
        severity: 'Information',
        category: 'Attention',
        references: ['attention-diffusion', 'entropy-trend', 'context-quality'],
        visualEvidence: { type: 'observation', target: 'attention-matrix' }
      });
    },

    function strongConnectionsRule(params, state) {
      if (state.strongLinks === undefined) return null;
      if (state.strongLinks === 0) return null;

      return F({
        title: state.strongLinks + ' strong attention connection(s) detected',
        observation: state.strongLinks + ' attention links exceed the 0.3 weight threshold.',
        cause: 'Strong links indicate high query-key compatibility between specific token pairs.',
        implication: state.strongLinks > state.numTokens * 0.3
          ? 'Many strong connections suggest the context is highly relevant to the query.'
          : 'Few strong connections suggest the query has limited relevant context.',
        nextObservation: 'Examine which token pairs form strong connections and verify semantic coherence.',
        confidence: 'Moderate',
        severity: 'Information',
        category: 'Attention',
        references: ['strong-connections', 'attention-weights', 'token-pairs'],
        visualEvidence: { type: 'observation', target: 'attention-matrix' }
      });
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  //  REGISTRY
  // ═══════════════════════════════════════════════════════════════

  var registry = {};

  function register(slug, rules) {
    registry[slug] = rules;
  }

  function getRules(slug) {
    return registry[slug] || [];
  }

  function getAllCategories() {
    return [
      'Optimization', 'Convergence', 'Geometry', 'Probability',
      'Representation', 'Classification', 'Clustering', 'Attention',
      'Similarity', 'Evaluation', 'Statistical Structure', 'Data Quality'
    ];
  }

  function init() {
    register('gradient-descent', gradientDescentRules);
    register('linear-regression', linearRegressionRules);
    register('logistic-regression', logisticRegressionRules);
    register('kmeans-clustering', kmeansRules);
    register('pca-projection', pcaRules);
    register('bayes-rule', bayesRules);
    register('embedding-similarity', embeddingSimilarityRules);
    register('cosine-similarity', cosineSimilarityRules);
    register('precision-recall', precisionRecallRules);
    register('transformer-attention', transformerAttentionRules);
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.XAIRegistry = {
    register: register,
    getRules: getRules,
    getAllCategories: getAllCategories,
    init: init
  };

  init();

})();
