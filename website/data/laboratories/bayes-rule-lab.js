(function () {
  'use strict';

  window.NeuralVerse = window.NeuralVerse || {};

  var EPSILON = 1e-10;

  var scenarios = {
    medical: {
      name: 'Medical Diagnosis',
      prior: 0.01,
      sensitivity: 0.90,
      falsePositiveRate: 0.05,
      prevalence: 0.01,
      label: 'Rare Disease (1% prevalence)',
      observations: [
        { type: 'positive', label: 'Positive Test Result' },
        { type: 'positive', label: 'Second Positive Test' },
        { type: 'negative', label: 'Negative Test Result' }
      ]
    },
    spam: {
      name: 'Spam Detection',
      prior: 0.30,
      sensitivity: 0.95,
      falsePositiveRate: 0.02,
      prevalence: 0.30,
      label: 'Email Spam (30% spam rate)',
      observations: [
        { type: 'positive', label: 'Contains "free money"' },
        { type: 'positive', label: 'Contains suspicious link' },
        { type: 'negative', label: 'From known contact' }
      ]
    },
    manufacturing: {
      name: 'Manufacturing Defects',
      prior: 0.02,
      sensitivity: 0.85,
      falsePositiveRate: 0.10,
      prevalence: 0.02,
      label: 'Defective Parts (2% defect rate)',
      observations: [
        { type: 'positive', label: 'Visual Inspection Fail' },
        { type: 'positive', label: 'Dimensional Check Fail' },
        { type: 'negative', label: 'Stress Test Pass' }
      ]
    },
    weather: {
      name: 'Weather Prediction',
      prior: 0.20,
      sensitivity: 0.80,
      falsePositiveRate: 0.15,
      prevalence: 0.20,
      label: 'Rain Tomorrow (20% base rate)',
      observations: [
        { type: 'positive', label: 'Clouds Forming' },
        { type: 'positive', label: 'Humidity Rising' },
        { type: 'negative', label: 'Wind Direction Change' }
      ]
    },
    quality: {
      name: 'Quality Inspection',
      prior: 0.05,
      sensitivity: 0.92,
      falsePositiveRate: 0.08,
      prevalence: 0.05,
      label: 'Product Defect (5% defect rate)',
      observations: [
        { type: 'positive', label: 'Surface Scratches Detected' },
        { type: 'negative', label: 'Color Consistency Pass' },
        { type: 'positive', label: 'Weight Out of Spec' }
      ]
    }
  };

  function safeDiv(a, b) {
    if (b < EPSILON) return 0;
    return a / b;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function round4(val) {
    return Math.round(val * 10000) / 10000;
  }

  function computeBayesianUpdate(prior, likelihood, fpr, evidencePositive) {
    var truePositive = likelihood;
    var falsePositive = fpr;
    var falseNegative = 1 - likelihood;
    var trueNegative = 1 - fpr;

    var pEvidence;
    if (evidencePositive) {
      pEvidence = truePositive * prior + falsePositive * (1 - prior);
    } else {
      pEvidence = falseNegative * prior + trueNegative * (1 - prior);
    }

    var numerator;
    if (evidencePositive) {
      numerator = truePositive * prior;
    } else {
      numerator = falseNegative * prior;
    }

    var posterior = safeDiv(numerator, pEvidence);

    var evidenceProbability = pEvidence;

    return {
      prior: round4(prior),
      posterior: round4(posterior),
      likelihood: round4(evidencePositive ? truePositive : falseNegative),
      evidenceProbability: round4(evidenceProbability),
      normalizationConstant: round4(pEvidence),
      truePositive: round4(truePositive),
      falsePositive: round4(falsePositive),
      falseNegative: round4(falseNegative),
      trueNegative: round4(trueNegative),
      evidencePositive: evidencePositive,
      beliefChange: round4(posterior - prior),
      confidence: round4(Math.abs(posterior - 0.5) * 2)
    };
  }

  function runSequentialInference(scenario, observations) {
    var results = [];
    var currentPrior = scenarios[scenario].prior;

    for (var i = 0; i < observations.length; i++) {
      var obs = observations[i];
      var update = computeBayesianUpdate(
        currentPrior,
        scenarios[scenario].sensitivity,
        scenarios[scenario].falsePositiveRate,
        obs.type === 'positive'
      );

      results.push({
        step: i,
        observation: obs,
        inputPrior: round4(currentPrior),
        update: update,
        newPrior: update.posterior
      });

      currentPrior = update.posterior;
    }

    return results;
  }

  function computeBeliefEvolution(scenario, numIterations) {
    var prior = scenarios[scenario].prior;
    var sensitivity = scenarios[scenario].sensitivity;
    var fpr = scenarios[scenario].falsePositiveRate;
    var history = [round4(prior)];

    for (var i = 0; i < numIterations; i++) {
      var update = computeBayesianUpdate(prior, sensitivity, fpr, true);
      prior = update.posterior;
      history.push(round4(prior));
    }

    return history;
  }

  var labDefinition = {
    id: 'lab-bayes-rule',
    slug: 'bayes-rule',
    title: "Bayes' Rule Laboratory",
    summary: "Experience Bayesian inference as a sequential belief-updating process. Watch posterior probabilities evolve as evidence accumulates across multiple observations.",
    category: 'probability',
    artifactReferences: [],
    conceptReferences: ['bayesian-inference', 'diagnostic-testing', 'base-rate-fallacy'],
    parameterSchema: [
      {
        name: 'scenario',
        type: 'select',
        options: ['medical', 'spam', 'manufacturing', 'weather', 'quality'],
        default: 'medical',
        label: 'Scenario'
      },
      {
        name: 'priorProbability',
        type: 'slider',
        min: 0.01,
        max: 0.99,
        step: 0.01,
        default: 0.01,
        label: 'Prior Probability P(H)'
      },
      {
        name: 'sensitivity',
        type: 'slider',
        min: 0.01,
        max: 0.99,
        step: 0.01,
        default: 0.90,
        label: 'Sensitivity P(+|H)'
      },
      {
        name: 'falsePositiveRate',
        type: 'slider',
        min: 0.01,
        max: 0.50,
        step: 0.01,
        default: 0.05,
        label: 'False Positive Rate P(+|~H)'
      },
      {
        name: 'numObservations',
        type: 'integer',
        min: 1,
        max: 10,
        step: 1,
        default: 3,
        label: 'Number of Observations'
      }
    ],
    initialState: {
      scenario: 'medical',
      priorProbability: 0.01,
      sensitivity: 0.90,
      falsePositiveRate: 0.05,
      numObservations: 3
    },
    steps: (function () {
      var steps = [];

      steps.push({
        label: 'Initialize',
        log: 'Initializing prior probability from scenario parameters',
        state: function (p) {
          var scenario = scenarios[p.scenario] || scenarios.medical;
          return {
            prior: p.priorProbability,
            iteration: 0,
            hypothesis: scenario.name,
            evidenceCount: 0,
            posterior: p.priorProbability,
            confidence: 0,
            beliefChange: 0,
            convergence: 'Starting'
          };
        },
        metrics: function (p) {
          var scenario = scenarios[p.scenario] || scenarios.medical;
          return {
            'Scenario': scenario.name,
            'Prior': round4(p.priorProbability),
            'Sensitivity': round4(p.sensitivity),
            'FPR': round4(p.falsePositiveRate),
            'Status': 'Initialized'
          };
        },
        viz: function (p) {
          return {
            prior: p.priorProbability,
            posterior: p.priorProbability,
            likelihood: p.sensitivity,
            evidenceProbability: 0,
            step: 0,
            type: 'initialize'
          };
        }
      });

      for (var i = 1; i <= 10; i++) {
        (function (stepNum) {
          steps.push({
            label: 'Observe ' + stepNum,
            log: 'Applying Bayes\' theorem: updating posterior with new evidence',
            state: function (p) {
              var scenario = scenarios[p.scenario] || scenarios.medical;
              var obsType = stepNum <= scenario.observations.length
                ? scenario.observations[stepNum - 1].type
                : 'positive';
              var currentPrior = p.priorProbability;

              for (var j = 0; j < stepNum - 1; j++) {
                var prevObs = j < scenario.observations.length
                  ? scenario.observations[j].type === 'positive'
                  : true;
                var prevUpdate = computeBayesianUpdate(currentPrior, p.sensitivity, p.falsePositiveRate, prevObs);
                currentPrior = prevUpdate.posterior;
              }

              var update = computeBayesianUpdate(currentPrior, p.sensitivity, p.falsePositiveRate, obsType === 'positive');

              return {
                prior: update.prior,
                posterior: update.posterior,
                likelihood: update.likelihood,
                evidenceProbability: update.evidenceProbability,
                iteration: stepNum,
                hypothesis: scenario.name,
                evidenceCount: stepNum,
                confidence: update.confidence,
                beliefChange: update.beliefChange,
                convergence: Math.abs(update.beliefChange) < 0.01 ? 'Converged' : 'Updating'
              };
            },
            metrics: function (p) {
              var scenario = scenarios[p.scenario] || scenarios.medical;
              var obsType = stepNum <= scenario.observations.length
                ? scenario.observations[stepNum - 1].type
                : 'positive';
              var obsLabel = stepNum <= scenario.observations.length
                ? scenario.observations[stepNum - 1].label
                : 'Observation ' + stepNum;

              var currentPrior = p.priorProbability;
              for (var j = 0; j < stepNum - 1; j++) {
                var prevObs = j < scenario.observations.length
                  ? scenario.observations[j].type === 'positive'
                  : true;
                var prevUpdate = computeBayesianUpdate(currentPrior, p.sensitivity, p.falsePositiveRate, prevObs);
                currentPrior = prevUpdate.posterior;
              }

              var update = computeBayesianUpdate(currentPrior, p.sensitivity, p.falsePositiveRate, obsType === 'positive');

              return {
                'Observation': obsLabel,
                'Type': obsType === 'positive' ? 'Positive' : 'Negative',
                'Prior': round4(update.prior),
                'Posterior': round4(update.posterior),
                'Change': (update.beliefChange >= 0 ? '+' : '') + round4(update.beliefChange),
                'Status': Math.abs(update.beliefChange) < 0.01 ? 'Stable' : 'Active'
              };
            },
            viz: function (p) {
              var scenario = scenarios[p.scenario] || scenarios.medical;
              var obsType = stepNum <= scenario.observations.length
                ? scenario.observations[stepNum - 1].type
                : 'positive';

              var currentPrior = p.priorProbability;
              for (var j = 0; j < stepNum - 1; j++) {
                var prevObs = j < scenario.observations.length
                  ? scenario.observations[j].type === 'positive'
                  : true;
                var prevUpdate = computeBayesianUpdate(currentPrior, p.sensitivity, p.falsePositiveRate, prevObs);
                currentPrior = prevUpdate.posterior;
              }

              var update = computeBayesianUpdate(currentPrior, p.sensitivity, p.falsePositiveRate, obsType === 'positive');

              var evolution = [p.priorProbability];
              var tempPrior = p.priorProbability;
              for (var k = 0; k < stepNum; k++) {
                var kObs = k < scenario.observations.length
                  ? scenario.observations[k].type === 'positive'
                  : true;
                var kUpdate = computeBayesianUpdate(tempPrior, p.sensitivity, p.falsePositiveRate, kObs);
                tempPrior = kUpdate.posterior;
                evolution.push(round4(tempPrior));
              }

              return {
                prior: update.prior,
                posterior: update.posterior,
                likelihood: update.likelihood,
                evidenceProbability: update.evidenceProbability,
                step: stepNum,
                type: 'update',
                evolution: evolution,
                evidencePositive: obsType === 'positive',
                scenario: scenario
              };
            }
          });
        })(i);
      }

      steps.push({
        label: 'Complete',
        log: 'Sequential inference complete: posterior probability updated across all observations',
        state: function (p) {
          var scenario = scenarios[p.scenario] || scenarios.medical;
          var finalPrior = p.priorProbability;

          for (var j = 0; j < p.numObservations; j++) {
            var obsType = j < scenario.observations.length
              ? scenario.observations[j].type === 'positive'
              : true;
            var update = computeBayesianUpdate(finalPrior, p.sensitivity, p.falsePositiveRate, obsType);
            finalPrior = update.posterior;
          }

          return {
            prior: p.priorProbability,
            posterior: finalPrior,
            iteration: p.numObservations,
            hypothesis: scenario.name,
            evidenceCount: p.numObservations,
            confidence: round4(Math.abs(finalPrior - 0.5) * 2),
            beliefChange: round4(finalPrior - p.priorProbability),
            convergence: 'Complete'
          };
        },
        metrics: function (p) {
          var scenario = scenarios[p.scenario] || scenarios.medical;
          var finalPrior = p.priorProbability;

          for (var j = 0; j < p.numObservations; j++) {
            var obsType = j < scenario.observations.length
              ? scenario.observations[j].type === 'positive'
              : true;
            var update = computeBayesianUpdate(finalPrior, p.sensitivity, p.falsePositiveRate, obsType);
            finalPrior = update.posterior;
          }

          return {
            'Final Posterior': round4(finalPrior),
            'Initial Prior': round4(p.priorProbability),
            'Total Change': (finalPrior - p.priorProbability >= 0 ? '+' : '') + round4(finalPrior - p.priorProbability),
            'Iterations': p.numObservations,
            'Status': 'Complete'
          };
        },
        viz: function (p) {
          var scenario = scenarios[p.scenario] || scenarios.medical;
          var evolution = [p.priorProbability];
          var tempPrior = p.priorProbability;

          for (var k = 0; k < p.numObservations; k++) {
            var kObs = k < scenario.observations.length
              ? scenario.observations[k].type === 'positive'
              : true;
            var kUpdate = computeBayesianUpdate(tempPrior, p.sensitivity, p.falsePositiveRate, kObs);
            tempPrior = kUpdate.posterior;
            evolution.push(round4(tempPrior));
          }

          return {
            prior: p.priorProbability,
            posterior: tempPrior,
            step: p.numObservations,
            type: 'analyze',
            evolution: evolution,
            scenario: scenario
          };
        }
      });

      return steps;
    })(),
    observations: [
      {
        id: 'probability-tree',
        title: 'Probability Tree',
        purpose: 'How do outcomes split?',
        defaultSize: 'large',
        render: function (container, params, stepIndex, history) {
          var scenario = scenarios[params.scenario] || scenarios.medical;
          var prior = params.priorProbability;
          var sensitivity = params.sensitivity;
          var fpr = params.falsePositiveRate;

          if (stepIndex > 0 && history.length > 0) {
            var lastSnapshot = history[history.length - 1];
            if (lastSnapshot && lastSnapshot.state) {
              prior = lastSnapshot.state.prior || prior;
            }
          }

          var pDisease = prior;
          var pHealthy = 1 - prior;
          var pPosGivenDisease = sensitivity;
          var pNegGivenDisease = 1 - sensitivity;
          var pPosGivenHealthy = fpr;
          var pNegGivenHealthy = 1 - fpr;

          var pDiseasePos = pDisease * pPosGivenDisease;
          var pDiseaseNeg = pDisease * pNegGivenDisease;
          var pHealthyPos = pHealthy * pPosGivenHealthy;
          var pHealthyNeg = pHealthy * pNegGivenHealthy;

          var activePath = stepIndex > 0 && history.length > 0
            ? (history[history.length - 1].viz && history[history.length - 1].viz.evidencePositive ? 'positive' : 'negative')
            : null;

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Probability Tree';
          container.appendChild(title);

          var tree = document.createElement('div');
          tree.className = 'nv-bayes-tree';
          tree.setAttribute('role', 'tree');
          tree.setAttribute('aria-label', 'Bayesian probability tree showing disease and test outcome probabilities');

          tree.innerHTML =
            '<div class="nv-bayes-tree-root" role="treeitem" aria-label="Population">' +
              '<span class="nv-bayes-tree-node nv-bayes-tree-root-node">Population</span>' +
            '</div>' +
            '<div class="nv-bayes-tree-branches">' +
              '<div class="nv-bayes-tree-branch ' + (activePath === 'positive' ? 'nv-bayes-tree-branch--active' : '') + '" role="treeitem" aria-label="Disease: ' + (pDisease * 100).toFixed(1) + '%">' +
                '<div class="nv-bayes-tree-edge"><span>P(H)=' + (pDisease * 100).toFixed(1) + '%</span></div>' +
                '<div class="nv-bayes-tree-node nv-bayes-tree-disease">' +
                  '<span class="nv-bayes-tree-label">Disease</span>' +
                  '<span class="nv-bayes-tree-value">' + (pDisease * 100).toFixed(1) + '%</span>' +
                '</div>' +
                '<div class="nv-bayes-tree-sub-branches">' +
                  '<div class="nv-bayes-tree-sub-branch">' +
                    '<div class="nv-bayes-tree-edge"><span>P(+|H)=' + (pPosGivenDisease * 100).toFixed(1) + '%</span></div>' +
                    '<div class="nv-bayes-tree-leaf nv-bayes-tree-positive">' +
                      '<span class="nv-bayes-tree-leaf-label">Positive</span>' +
                      '<span class="nv-bayes-tree-leaf-value">' + (pDiseasePos * 100).toFixed(2) + '%</span>' +
                    '</div>' +
                  '</div>' +
                  '<div class="nv-bayes-tree-sub-branch">' +
                    '<div class="nv-bayes-tree-edge"><span>P(-|H)=' + (pNegGivenDisease * 100).toFixed(1) + '%</span></div>' +
                    '<div class="nv-bayes-tree-leaf nv-bayes-tree-negative">' +
                      '<span class="nv-bayes-tree-leaf-label">Negative</span>' +
                      '<span class="nv-bayes-tree-leaf-value">' + (pDiseaseNeg * 100).toFixed(2) + '%</span>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="nv-bayes-tree-branch ' + (activePath === 'negative' ? 'nv-bayes-tree-branch--active' : '') + '" role="treeitem" aria-label="Healthy: ' + (pHealthy * 100).toFixed(1) + '%">' +
                '<div class="nv-bayes-tree-edge"><span>P(~H)=' + (pHealthy * 100).toFixed(1) + '%</span></div>' +
                '<div class="nv-bayes-tree-node nv-bayes-tree-healthy">' +
                  '<span class="nv-bayes-tree-label">Healthy</span>' +
                  '<span class="nv-bayes-tree-value">' + (pHealthy * 100).toFixed(1) + '%</span>' +
                '</div>' +
                '<div class="nv-bayes-tree-sub-branches">' +
                  '<div class="nv-bayes-tree-sub-branch">' +
                    '<div class="nv-bayes-tree-edge"><span>P(+|~H)=' + (pPosGivenHealthy * 100).toFixed(1) + '%</span></div>' +
                    '<div class="nv-bayes-tree-leaf nv-bayes-tree-positive">' +
                      '<span class="nv-bayes-tree-leaf-label">Positive</span>' +
                      '<span class="nv-bayes-tree-leaf-value">' + (pHealthyPos * 100).toFixed(2) + '%</span>' +
                    '</div>' +
                  '</div>' +
                  '<div class="nv-bayes-tree-sub-branch">' +
                    '<div class="nv-bayes-tree-edge"><span>P(-|~H)=' + (pNegGivenHealthy * 100).toFixed(1) + '%</span></div>' +
                    '<div class="nv-bayes-tree-leaf nv-bayes-tree-negative">' +
                      '<span class="nv-bayes-tree-leaf-label">Negative</span>' +
                      '<span class="nv-bayes-tree-leaf-value">' + (pHealthyNeg * 100).toFixed(2) + '%</span>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';

          container.appendChild(tree);
        },
        interpretation: function (params, stepIndex) { return 'The probability tree visualizes how prior beliefs split into possible outcomes under each hypothesis.'; }
      },
      {
        id: 'bayesian-update',
        title: 'Bayesian Update',
        purpose: 'How did evidence change belief?',
        defaultSize: 'large',
        render: function (container, params, stepIndex, history) {
          var scenario = scenarios[params.scenario] || scenarios.medical;

          var currentPrior = params.priorProbability;
          var currentPosterior = params.priorProbability;
          var likelihood = params.sensitivity;
          var evidenceProb = 0;

          if (stepIndex > 0 && history.length > 0) {
            var lastSnapshot = history[history.length - 1];
            if (lastSnapshot && lastSnapshot.state) {
              currentPrior = lastSnapshot.state.prior || currentPrior;
              currentPosterior = lastSnapshot.state.posterior || currentPosterior;
              likelihood = lastSnapshot.state.likelihood || likelihood;
              evidenceProb = lastSnapshot.state.evidenceProbability || evidenceProb;
            }
          }

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Bayesian Update';
          container.appendChild(title);

          var update = document.createElement('div');
          update.className = 'nv-bayes-update';

          var priorBar = document.createElement('div');
          priorBar.className = 'nv-bayes-update-bar-group';
          priorBar.innerHTML =
            '<div class="nv-bayes-update-label">Prior P(H)</div>' +
            '<div class="nv-bayes-update-bar-track">' +
              '<div class="nv-bayes-update-bar nv-bayes-update-bar--prior" style="width:' + (currentPrior * 100) + '%"></div>' +
            '</div>' +
            '<div class="nv-bayes-update-value">' + (currentPrior * 100).toFixed(1) + '%</div>';

          var arrow = document.createElement('div');
          arrow.className = 'nv-bayes-update-arrow';
          arrow.innerHTML =
            '<span class="nv-bayes-update-arrow-icon">↓</span>' +
            '<span class="nv-bayes-update-arrow-label">Evidence: ' + (likelihood * 100).toFixed(1) + '% likelihood</span>' +
            '<span class="nv-bayes-update-arrow-sub">P(E|H) / P(E) = ' + (evidenceProb > 0 ? (likelihood / evidenceProb).toFixed(2) : '—') + '</span>';

          var posteriorBar = document.createElement('div');
          posteriorBar.className = 'nv-bayes-update-bar-group';
          posteriorBar.innerHTML =
            '<div class="nv-bayes-update-label">Posterior P(H|E)</div>' +
            '<div class="nv-bayes-update-bar-track">' +
              '<div class="nv-bayes-update-bar nv-bayes-update-bar--posterior" style="width:' + (currentPosterior * 100) + '%"></div>' +
            '</div>' +
            '<div class="nv-bayes-update-value">' + (currentPosterior * 100).toFixed(1) + '%</div>';

          var change = document.createElement('div');
          change.className = 'nv-bayes-update-change';
          var delta = currentPosterior - currentPrior;
          change.innerHTML =
            '<span class="nv-bayes-update-change-label">Belief Change</span>' +
            '<span class="nv-bayes-update-change-value ' + (delta >= 0 ? 'nv-bayes-update-change--positive' : 'nv-bayes-update-change--negative') + '">' +
              (delta >= 0 ? '+' : '') + (delta * 100).toFixed(1) + '%' +
            '</span>';

          update.appendChild(priorBar);
          update.appendChild(arrow);
          update.appendChild(posteriorBar);
          update.appendChild(change);
          container.appendChild(update);
        },
        interpretation: function (params, stepIndex) { return 'Each observation shifts the posterior — positive evidence strengthens belief, negative evidence weakens it.'; }
      },
      {
        id: 'belief-evolution',
        title: 'Belief Evolution',
        purpose: 'How does belief evolve after repeated evidence?',
        defaultSize: 'large',
        render: function (container, params, stepIndex, history) {
          var scenario = scenarios[params.scenario] || scenarios.medical;
          var evolution = [params.priorProbability];
          var tempPrior = params.priorProbability;

          var maxStep = stepIndex;
          for (var i = 0; i < maxStep; i++) {
            var obsType = i < scenario.observations.length
              ? scenario.observations[i].type === 'positive'
              : true;
            var update = computeBayesianUpdate(tempPrior, params.sensitivity, params.falsePositiveRate, obsType);
            tempPrior = update.posterior;
            evolution.push(round4(tempPrior));
          }

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Belief Evolution';
          container.appendChild(title);

          var chart = document.createElement('div');
          chart.className = 'nv-bayes-evolution';
          chart.setAttribute('role', 'img');
          chart.setAttribute('aria-label', 'Belief evolution chart showing posterior probability over ' + evolution.length + ' observations');

          var chartInner = document.createElement('div');
          chartInner.className = 'nv-bayes-evolution-chart';

          var maxVal = 1;
          var minVal = 0;
          var range = maxVal - minVal;

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 400 300');
          svg.setAttribute('class', 'nv-bayes-evolution-svg');
          svg.setAttribute('aria-hidden', 'true');

          var gridLines = '';
          for (var g = 0; g <= 4; g++) {
            var gy = 10 + (g * 30);
            var gval = (100 - g * 25);
            gridLines += '<line x1="40" y1="' + gy + '" x2="290" y2="' + gy + '" class="nv-bayes-evolution-grid"/>';
            gridLines += '<text x="35" y="' + (gy + 3) + '" class="nv-bayes-evolution-axis-label" text-anchor="end">' + gval + '%</text>';
          }

          var points = '';
          var linePath = '';
          for (var p = 0; p < evolution.length; p++) {
            var px = 40 + (p / Math.max(1, evolution.length - 1)) * 250;
            var py = 10 + ((1 - evolution[p]) / range) * 120;
            points += '<circle cx="' + px + '" cy="' + py + '" r="3" class="nv-bayes-evolution-point"/>';
            if (p === 0) {
              linePath = 'M' + px + ',' + py;
            } else {
              linePath += ' L' + px + ',' + py;
            }
          }

          var pathEl = '<path d="' + linePath + '" class="nv-bayes-evolution-line"/>';

          for (var l = 0; l < evolution.length; l++) {
            var lx = 40 + (l / Math.max(1, evolution.length - 1)) * 250;
            var llabel = l === 0 ? 'Prior' : 'Obs ' + l;
            gridLines += '<text x="' + lx + '" y="148" class="nv-bayes-evolution-axis-label" text-anchor="middle">' + llabel + '</text>';
          }

          svg.innerHTML = gridLines + pathEl + points;
          chartInner.appendChild(svg);
          chart.appendChild(chartInner);

          var legend = document.createElement('div');
          legend.className = 'nv-bayes-evolution-legend';
          legend.innerHTML =
            '<span class="nv-bayes-evolution-legend-item"><span class="nv-bayes-evolution-legend-dot"></span>Posterior P(H|E)</span>';

          container.appendChild(chart);
          container.appendChild(legend);
        },
        interpretation: function (params, stepIndex) { return 'The belief evolution curve shows how posterior probability changes with accumulating evidence.'; }
      },
      {
        id: 'confusion-structure',
        title: 'Confusion Structure',
        purpose: 'Where do false positives and false negatives originate?',
        defaultSize: 'small',
        render: function (container, params, stepIndex, history) {
          var scenario = scenarios[params.scenario] || scenarios.medical;
          var prior = params.priorProbability;
          var sensitivity = params.sensitivity;
          var fpr = params.falsePositiveRate;

          var prevalence = prior;
          var sensitivityPct = sensitivity * 100;
          var specificityPct = (1 - fpr) * 100;

          var population = 10000;
          var diseased = Math.round(population * prevalence);
          var healthy = population - diseased;
          var truePos = Math.round(diseased * sensitivity);
          var falseNeg = diseased - truePos;
          var falsePos = Math.round(healthy * fpr);
          var trueNeg = healthy - falsePos;

          var ppv = diseased > 0 ? (truePos / (truePos + falsePos)) * 100 : 0;
          var npv = (trueNeg + falseNeg) > 0 ? (trueNeg / (trueNeg + falseNeg)) * 100 : 0;

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Confusion Structure';
          container.appendChild(title);

          var matrix = document.createElement('div');
          matrix.className = 'nv-bayes-confusion';
          matrix.setAttribute('role', 'table');
          matrix.setAttribute('aria-label', 'Confusion matrix for ' + scenario.name);

          matrix.innerHTML =
            '<div class="nv-bayes-confusion-header" role="row">' +
              '<div class="nv-bayes-confusion-cell nv-bayes-confusion-cell--header" role="columnheader"></div>' +
              '<div class="nv-bayes-confusion-cell nv-bayes-confusion-cell--header" role="columnheader">Predicted Disease</div>' +
              '<div class="nv-bayes-confusion-cell nv-bayes-confusion-cell--header" role="columnheader">Predicted Healthy</div>' +
            '</div>' +
            '<div class="nv-bayes-confusion-row" role="row">' +
              '<div class="nv-bayes-confusion-cell nv-bayes-confusion-cell--header" role="rowheader">Actual Disease</div>' +
              '<div class="nv-bayes-confusion-cell nv-bayes-confusion-cell--tp" role="cell" aria-label="True Positive: ' + truePos + '">' +
                '<span class="nv-bayes-confusion-cell-label">True Positive</span>' +
                '<span class="nv-bayes-confusion-cell-value">' + truePos + '</span>' +
              '</div>' +
              '<div class="nv-bayes-confusion-cell nv-bayes-confusion-cell--fn" role="cell" aria-label="False Negative: ' + falseNeg + '">' +
                '<span class="nv-bayes-confusion-cell-label">False Negative</span>' +
                '<span class="nv-bayes-confusion-cell-value">' + falseNeg + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="nv-bayes-confusion-row" role="row">' +
              '<div class="nv-bayes-confusion-cell nv-bayes-confusion-cell--header" role="rowheader">Actual Healthy</div>' +
              '<div class="nv-bayes-confusion-cell nv-bayes-confusion-cell--fp" role="cell" aria-label="False Positive: ' + falsePos + '">' +
                '<span class="nv-bayes-confusion-cell-label">False Positive</span>' +
                '<span class="nv-bayes-confusion-cell-value">' + falsePos + '</span>' +
              '</div>' +
              '<div class="nv-bayes-confusion-cell nv-bayes-confusion-cell--tn" role="cell" aria-label="True Negative: ' + trueNeg + '">' +
                '<span class="nv-bayes-confusion-cell-label">True Negative</span>' +
                '<span class="nv-bayes-confusion-cell-value">' + trueNeg + '</span>' +
              '</div>' +
            '</div>';

          container.appendChild(matrix);

          var stats = document.createElement('div');
          stats.className = 'nv-bayes-confusion-stats';
          stats.innerHTML =
            '<div class="nv-bayes-confusion-stat">' +
              '<span class="nv-bayes-confusion-stat-label">Prevalence</span>' +
              '<span class="nv-bayes-confusion-stat-value">' + (prevalence * 100).toFixed(1) + '%</span>' +
            '</div>' +
            '<div class="nv-bayes-confusion-stat">' +
              '<span class="nv-bayes-confusion-stat-label">Sensitivity</span>' +
              '<span class="nv-bayes-confusion-stat-value">' + sensitivityPct.toFixed(1) + '%</span>' +
            '</div>' +
            '<div class="nv-bayes-confusion-stat">' +
              '<span class="nv-bayes-confusion-stat-label">Specificity</span>' +
              '<span class="nv-bayes-confusion-stat-value">' + specificityPct.toFixed(1) + '%</span>' +
            '</div>' +
            '<div class="nv-bayes-confusion-stat">' +
              '<span class="nv-bayes-confusion-stat-label">PPV</span>' +
              '<span class="nv-bayes-confusion-stat-value">' + ppv.toFixed(1) + '%</span>' +
            '</div>' +
            '<div class="nv-bayes-confusion-stat">' +
              '<span class="nv-bayes-confusion-stat-label">NPV</span>' +
              '<span class="nv-bayes-confusion-stat-value">' + npv.toFixed(1) + '%</span>' +
            '</div>';

          container.appendChild(stats);
        },
        interpretation: function (params, stepIndex) { return 'The confusion structure reveals how sensitivity and specificity create different error patterns.'; }
      }
    ],
    inspector: {
      title: 'Bayesian Inference State',
      sections: [
        {
          label: 'Prior Belief',
          cards: [
            { key: 'priorProbability', label: 'Prior P(H)', unit: '', interpretation: function (v) { return v < 0.05 ? 'Rare event' : v < 0.20 ? 'Moderate prior' : 'Common event'; } },
            { key: 'hypothesis', label: 'Hypothesis', unit: '' },
            { key: 'evidenceCount', label: 'Evidence Count', unit: '', interpretation: function (v) { return v === 0 ? 'No evidence yet' : v + ' observations applied'; } },
            { key: 'iteration', label: 'Current Iteration', unit: '' }
          ]
        },
        {
          label: 'Evidence Properties',
          cards: [
            { key: 'likelihood', label: 'Likelihood P(E|H)', unit: '', interpretation: function (v) { return v > 0.8 ? 'Strong evidence' : v > 0.5 ? 'Moderate evidence' : 'Weak evidence'; } },
            { key: 'falsePositiveRate', label: 'False Positive Rate', unit: '', fixed: true },
            { key: 'evidenceProbability', label: 'Marginal P(E)', unit: '', interpretation: function (v) { return v < 0.1 ? 'Unlikely evidence' : v < 0.3 ? 'Moderate evidence' : 'Common evidence'; } },
            { key: 'normalizationConstant', label: 'Normalization Constant', unit: '' }
          ]
        },
        {
          label: 'Updated Belief',
          cards: [
            { key: 'posterior', label: 'Posterior P(H|E)', unit: '', interpretation: function (v) { return v > 0.9 ? 'Very strong belief' : v > 0.7 ? 'Strong belief' : v > 0.5 ? 'Moderate belief' : 'Weak belief'; } },
            { key: 'confidence', label: 'Belief Confidence', unit: '', interpretation: function (v) { return v > 0.8 ? 'High confidence' : v > 0.4 ? 'Moderate confidence' : 'Low confidence'; } },
            { key: 'beliefChange', label: 'Belief Shift', unit: '', interpretation: function (v) { return Math.abs(v) < 0.01 ? 'Stable' : v > 0 ? 'Belief strengthened' : 'Belief weakened'; } },
            { key: 'convergence', label: 'Convergence State', unit: '' }
          ]
        }
      ],
      computeState: function (params, stepIndex, history) {
        var scenario = scenarios[params.scenario] || scenarios.medical;
        var currentPrior = params.priorProbability;
        var currentPosterior = params.priorProbability;
        var likelihood = params.sensitivity;
        var evidenceProb = 0;
        var evidenceCount = 0;

        if (stepIndex > 0 && history.length > 0) {
          var lastSnapshot = history[history.length - 1];
          if (lastSnapshot && lastSnapshot.state) {
            currentPrior = lastSnapshot.state.prior || currentPrior;
            currentPosterior = lastSnapshot.state.posterior || currentPosterior;
            likelihood = lastSnapshot.state.likelihood || likelihood;
            evidenceProb = lastSnapshot.state.evidenceProbability || evidenceProb;
            evidenceCount = lastSnapshot.state.evidenceCount || 0;
          }
        }

        return {
          priorProbability: round4(currentPrior),
          hypothesis: scenario.name,
          evidenceCount: evidenceCount,
          iteration: stepIndex,
          likelihood: round4(likelihood),
          falsePositiveRate: params.falsePositiveRate,
          evidenceProbability: round4(evidenceProb),
          normalizationConstant: round4(evidenceProb),
          posterior: round4(currentPosterior),
          confidence: round4(Math.abs(currentPosterior - 0.5) * 2),
          beliefChange: round4(currentPosterior - currentPrior),
          convergence: Math.abs(currentPosterior - currentPrior) < 0.01 ? 'Stable' : 'Updating'
        };
      },
      changeDetector: function (prev, curr) {
        var changes = [];
        if (prev && curr) {
          if (prev.posterior !== curr.posterior) {
            changes.push({
              from: 'posterior',
              to: null,
              label: curr.posterior > prev.posterior
                ? 'Posterior increased → Evidence supports hypothesis'
                : 'Posterior decreased → Evidence weakens hypothesis'
            });
          }
          if (prev.beliefChange !== curr.beliefChange) {
            changes.push({
              from: 'beliefChange',
              to: null,
              label: 'Belief change updated to ' + (curr.beliefChange >= 0 ? '+' : '') + round4(curr.beliefChange)
            });
          }
          if (prev.evidenceCount !== curr.evidenceCount) {
            changes.push({
              from: 'evidenceCount',
              to: null,
              label: 'Evidence count: ' + curr.evidenceCount + ' observations applied'
            });
          }
        }
        return changes;
      }
    },
    renderPreparation: function (container, params) {
      var scenario = scenarios[params.scenario] || scenarios.medical;
      var prior = params.priorProbability;
      var sensitivity = params.sensitivity;
      var fpr = params.falsePositiveRate;

      container.innerHTML = '';
      var title = document.createElement('h4');
      title.className = 'nv-lab-obs-title';
      title.textContent = 'Preparation Overview';
      container.appendChild(title);

      var chart = document.createElement('div');
      chart.className = 'nv-bayes-preparation';
      chart.setAttribute('role', 'img');
      chart.setAttribute('aria-label', 'Preparation overview showing prior, likelihood, and initial posterior');

      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 400 200');
      svg.setAttribute('class', 'nv-bayes-preparation-svg');
      svg.setAttribute('aria-hidden', 'true');

      var barWidth = 80;
      var barGap = 30;
      var startX = 60;
      var maxBarHeight = 120;
      var baseY = 160;

      var bars = [
        { label: 'Prior', value: prior, color: '#3b82f6' },
        { label: 'Likelihood', value: sensitivity, color: '#10b981' },
        { label: 'Initial Posterior', value: prior, color: '#8b5cf6' }
      ];

      var svgContent = '';
      for (var i = 0; i < bars.length; i++) {
        var bar = bars[i];
        var x = startX + i * (barWidth + barGap);
        var barHeight = bar.value * maxBarHeight;
        var y = baseY - barHeight;

        svgContent += '<rect x="' + x + '" y="' + y + '" width="' + barWidth + '" height="' + barHeight + '" fill="' + bar.color + '" rx="4" opacity="0.85"/>';
        svgContent += '<text x="' + (x + barWidth / 2) + '" y="' + (y - 8) + '" text-anchor="middle" class="nv-bayes-preparation-value">' + (bar.value * 100).toFixed(1) + '%</text>';
        svgContent += '<text x="' + (x + barWidth / 2) + '" y="' + (baseY + 20) + '" text-anchor="middle" class="nv-bayes-preparation-label">' + bar.label + '</text>';
      }

      svgContent += '<line x1="' + (startX + barWidth + barGap / 2) + '" y1="' + (baseY - 30) + '" x2="' + (startX + barWidth + barGap / 2) + '" y2="' + (baseY - 10) + '" stroke="#6b7280" stroke-width="1.5" marker-end="url(#prep-arrow)"/>';
      svgContent += '<defs><marker id="prep-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#6b7280"/></marker></defs>';

      svg.innerHTML = svgContent;
      chart.appendChild(svg);
      container.appendChild(chart);

      var note = document.createElement('div');
      note.className = 'nv-bayes-preparation-note';
      note.innerHTML = '<span class="nv-bayes-preparation-note-label">Scenario:</span> ' + scenario.name + ' — ' + scenario.label;
      container.appendChild(note);
    },
    getPreparationTelemetry: function (params) {
      var scenario = scenarios[params.scenario] || scenarios.medical;
      var prior = params.priorProbability;
      var sensitivity = params.sensitivity;
      var fpr = params.falsePositiveRate;

      var initialUpdate = computeBayesianUpdate(prior, sensitivity, fpr, true);
      var evidenceProb = initialUpdate.evidenceProbability;

      return [
        { key: 'prior', label: 'Prior', value: String(round4(prior)) },
        { key: 'likelihood', label: 'Likelihood', value: String(round4(sensitivity)) },
        { key: 'evidenceProbability', label: 'Evidence Probability', value: String(round4(evidenceProb)) },
        { key: 'status', label: 'Status', value: 'Ready' }
      ];
    },
    getCompletionSummary: function (result, params) {
      if (!result) return [];
      var finalPosterior = result.finalPosterior;
      var updates = result.results ? result.results.length : 0;

      return [
        { label: 'Final Posterior', value: String(round4(finalPosterior)) },
        { label: 'Updates', value: String(updates) },
        { label: 'Status', value: 'Complete' }
      ];
    },
    xai: {
      categories: ['Probability', 'Evaluation'],
      crossLabConnections: [
        { trigger: 'strongEvidence', target: 'logistic-regression', text: 'Compare Bayesian belief updating with logistic regression classification.', suggestCategory: 'Classification' },
        { trigger: 'priorDominance', target: 'bayes-rule', text: 'Try a weaker prior to let evidence speak more strongly.', suggestCategory: 'Probability' }
      ]
    },
    execute: function (params) {
      var scenario = scenarios[params.scenario] || scenarios.medical;
      var prior = clamp(params.priorProbability, 0.01, 0.99);
      var sensitivity = clamp(params.sensitivity, 0.01, 0.99);
      var fpr = clamp(params.falsePositiveRate, 0.01, 0.50);
      var numObs = Math.round(clamp(params.numObservations, 1, 10));

      var observations = [];
      for (var i = 0; i < numObs; i++) {
        if (i < scenario.observations.length) {
          observations.push(scenario.observations[i]);
        } else {
          observations.push({ type: 'positive', label: 'Observation ' + (i + 1) });
        }
      }

      var results = runSequentialInference(params.scenario, observations);

      return {
        scenario: scenario.name,
        prior: prior,
        sensitivity: sensitivity,
        falsePositiveRate: fpr,
        numObservations: numObs,
        results: results,
        finalPosterior: results.length > 0 ? results[results.length - 1].update.posterior : prior,
        evolution: computeBeliefEvolution(params.scenario, numObs)
      };
    },
    visualization: {
      type: 'numeric-summary',
      title: "Bayesian Inference — Belief Evolution"
    },
    canonicalStatus: 'reviewed',
    version: '2.0.0',
    reviewedBy: 'NeuralVerse Team',
    lastReviewed: '2026-07-07',
    estimatedDuration: '15 minutes'
  };

  if (window.NeuralVerse.LabRegistry && window.NeuralVerse.LabRegistry.register) {
    window.NeuralVerse.LabRegistry.register(labDefinition);
  }
})();
