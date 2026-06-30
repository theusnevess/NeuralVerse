/**
 * NV-1300-D1B — Example Selection Engine
 *
 * Scores and ranks candidate examples using deterministic criteria.
 * No randomness. No external state. Deterministic output.
 *
 * Scoring dimensions:
 * - curriculum relevance
 * - concept proximity
 * - visualization availability
 * - laboratory availability
 * - implementation clarity
 * - engineering realism
 * - mathematical suitability
 * - shared knowledge linkage
 * - semantic neighborhood strength
 */

function createExampleSelectionEngine() {
  var _registry = null;

  function _getRegistry() {
    if (_registry) return _registry;
    if (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.createExampleRegistry) {
      _registry = window.NeuralVerse.createExampleRegistry();
    }
    return _registry;
  }

  function _getSemanticEngine() {
    return (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.SemanticEngine)
      ? window.NeuralVerse.SemanticEngine
      : null;
  }

  var WEIGHTS = {
    curriculumRelevance: 0.20,
    conceptProximity: 0.25,
    visualizationAvailability: 0.15,
    laboratoryAvailability: 0.10,
    implementationClarity: 0.10,
    engineeringRealism: 0.05,
    mathematicalSuitability: 0.05,
    sharedKnowledgeLinkage: 0.05,
    semanticNeighborhood: 0.05
  };

  var DIFFICULTY_RANK = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4
  };

  var MAX_EXAMPLES = 5;

  function _curriculumRelevanceScore(example, inputConceptIds) {
    if (!inputConceptIds || inputConceptIds.length === 0) return 0.5;

    var overlap = 0;
    for (var i = 0; i < example.conceptIds.length; i++) {
      for (var j = 0; j < inputConceptIds.length; j++) {
        if (example.conceptIds[i] === inputConceptIds[j]) {
          overlap++;
          break;
        }
      }
    }

    if (overlap === 0) return 0.1;
    var ratio = overlap / Math.min(example.conceptIds.length, inputConceptIds.length);
    return Math.min(1.0, 0.5 + ratio * 0.5);
  }

  function _conceptProximityScore(example, inputConceptIds) {
    if (!inputConceptIds || inputConceptIds.length === 0) return 0.3;

    var engine = _getSemanticEngine();
    if (!engine) return 0.3;

    var totalProximity = 0;
    var count = 0;

    for (var i = 0; i < example.conceptIds.length; i++) {
      var concept = engine.getConcept(example.conceptIds[i]);
      if (!concept) continue;

      for (var j = 0; j < inputConceptIds.length; j++) {
        if (example.conceptIds[i] === inputConceptIds[j]) {
          totalProximity += 1.0;
        } else {
          var related = concept.relatedConcepts || [];
          for (var r = 0; r < related.length; r++) {
            var relId = typeof related[r] === 'string' ? related[r] : (related[r].id || related[r].concept || '');
            if (relId === inputConceptIds[j]) {
              totalProximity += 0.7;
              break;
            }
          }

          var prereqs = concept.prerequisiteConcepts || [];
          for (var p = 0; p < prereqs.length; p++) {
            if (prereqs[p] === inputConceptIds[j]) {
              totalProximity += 0.8;
              break;
            }
          }
        }
        count++;
      }
    }

    if (count === 0) return 0.3;
    return Math.min(1.0, totalProximity / count);
  }

  function _visualizationAvailabilityScore(example) {
    if (!example.visualizationIds || example.visualizationIds.length === 0) return 0.2;
    if (example.visualizationIds.length >= 2) return 1.0;
    return 0.7;
  }

  function _laboratoryAvailabilityScore(example) {
    if (!example.laboratoryIds || example.laboratoryIds.length === 0) return 0.2;
    return 0.9;
  }

  function _implementationClarityScore(example) {
    var score = 0.5;
    if (example.summary && example.summary.length > 20) score += 0.2;
    if (example.conceptIds.length >= 2 && example.conceptIds.length <= 5) score += 0.2;
    if (example.tags && example.tags.length >= 2) score += 0.1;
    return Math.min(1.0, score);
  }

  function _engineeringRealismScore(example) {
    var score = 0.4;
    if (example.category === 'regression' || example.category === 'classification') score += 0.3;
    if (example.sharedKnowledgeDomains && example.sharedKnowledgeDomains.length > 0) score += 0.2;
    if (example.difficulty === 'intermediate' || example.difficulty === 'advanced') score += 0.1;
    return Math.min(1.0, score);
  }

  function _mathematicalSuitabilityScore(example) {
    var score = 0.4;
    if (example.conceptIds.indexOf('linear-models') !== -1 ||
        example.conceptIds.indexOf('gradient-descent') !== -1 ||
        example.conceptIds.indexOf('loss-functions') !== -1) {
      score += 0.3;
    }
    if (example.conceptIds.indexOf('neural-networks') !== -1) score += 0.2;
    return Math.min(1.0, score);
  }

  function _sharedKnowledgeLinkageScore(example) {
    if (!example.sharedKnowledgeDomains || example.sharedKnowledgeDomains.length === 0) return 0.2;
    if (example.sharedKnowledgeDomains.length >= 2) return 1.0;
    return 0.7;
  }

  function _semanticNeighborhoodScore(example, inputConceptIds) {
    if (!inputConceptIds || inputConceptIds.length === 0) return 0.3;

    var engine = _getSemanticEngine();
    if (!engine) return 0.3;

    var totalNeighbors = 0;
    var matchedNeighbors = 0;

    for (var i = 0; i < example.conceptIds.length; i++) {
      var related = engine.getRelatedConcepts(example.conceptIds[i]);
      totalNeighbors += related.length;
      for (var r = 0; r < related.length; r++) {
        for (var j = 0; j < inputConceptIds.length; j++) {
          if (related[r].id === inputConceptIds[j]) {
            matchedNeighbors++;
            break;
          }
        }
      }
    }

    if (totalNeighbors === 0) return 0.3;
    return Math.min(1.0, matchedNeighbors / totalNeighbors + 0.3);
  }

  function _difficultyCompatibilityScore(example, targetDifficulty) {
    if (!targetDifficulty || targetDifficulty === 'standard') return 0.8;

    var exampleRank = DIFFICULTY_RANK[example.difficulty] || 2;
    var targetMap = {
      essentials: 1,
      standard: 2,
      deep_dive: 3,
      research_notes: 4
    };
    var targetRank = targetMap[targetDifficulty] || 2;

    var diff = Math.abs(exampleRank - targetRank);
    if (diff === 0) return 1.0;
    if (diff === 1) return 0.7;
    return 0.4;
  }

  function scoreExample(example, input) {
    if (!example || !input) return 0;

    var conceptIds = input.conceptIds || [];
    var difficulty = input.difficulty || 'standard';

    var scores = {
      curriculumRelevance: _curriculumRelevanceScore(example, conceptIds),
      conceptProximity: _conceptProximityScore(example, conceptIds),
      visualizationAvailability: _visualizationAvailabilityScore(example),
      laboratoryAvailability: _laboratoryAvailabilityScore(example),
      implementationClarity: _implementationClarityScore(example),
      engineeringRealism: _engineeringRealismScore(example),
      mathematicalSuitability: _mathematicalSuitabilityScore(example),
      sharedKnowledgeLinkage: _sharedKnowledgeLinkageScore(example),
      semanticNeighborhood: _semanticNeighborhoodScore(example, conceptIds)
    };

    var weightedScore = 0;
    var weightSum = 0;
    var keys = Object.keys(WEIGHTS);
    for (var i = 0; i < keys.length; i++) {
      if (scores[keys[i]] !== undefined) {
        weightedScore += scores[keys[i]] * WEIGHTS[keys[i]];
        weightSum += WEIGHTS[keys[i]];
      }
    }

    var finalScore = weightSum > 0 ? weightedScore / weightSum : 0;

    var diffBonus = _difficultyCompatibilityScore(example, difficulty);
    finalScore = finalScore * 0.85 + diffBonus * 0.15;

    return Math.round(finalScore * 1000) / 1000;
  }

  function rankExamples(input) {
    var registry = _getRegistry();
    if (!registry) return [];

    var allExamples = registry.getAllExamples();
    var scored = [];

    for (var i = 0; i < allExamples.length; i++) {
      var score = scoreExample(allExamples[i], input);
      scored.push({
        example: allExamples[i],
        score: score,
        breakdown: {
          curriculumRelevance: _curriculumRelevanceScore(allExamples[i], input.conceptIds || []),
          conceptProximity: _conceptProximityScore(allExamples[i], input.conceptIds || []),
          visualizationAvailability: _visualizationAvailabilityScore(allExamples[i]),
          laboratoryAvailability: _laboratoryAvailabilityScore(allExamples[i])
        }
      });
    }

    scored.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.example.id.localeCompare(b.example.id);
    });

    return scored;
  }

  function selectBestExamples(input, maxCount) {
    var ranked = rankExamples(input);
    var limit = typeof maxCount === 'number' ? Math.min(maxCount, MAX_EXAMPLES) : MAX_EXAMPLES;
    var selected = [];
    var usedConcepts = {};

    for (var i = 0; i < ranked.length && selected.length < limit; i++) {
      var candidate = ranked[i];
      var hasOverlap = false;

      for (var c = 0; c < candidate.example.conceptIds.length; c++) {
        if (usedConcepts[candidate.example.conceptIds[c]]) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) {
        selected.push(candidate);
        for (var c2 = 0; c2 < candidate.example.conceptIds.length; c2++) {
          usedConcepts[candidate.example.conceptIds[c2]] = true;
        }
      }
    }

    return selected;
  }

  function explainSelection(rankedExamples) {
    if (!Array.isArray(rankedExamples) || rankedExamples.length === 0) {
      return 'No examples selected.';
    }

    var lines = [];
    lines.push('Example Selection (' + rankedExamples.length + ' selected):');
    lines.push('');

    for (var i = 0; i < rankedExamples.length; i++) {
      var item = rankedExamples[i];
      var ex = item.example;
      lines.push((i + 1) + '. ' + ex.title + ' (score: ' + item.score + ')');
      lines.push('   Category: ' + ex.category + ', Difficulty: ' + ex.difficulty);
      lines.push('   Concepts: ' + ex.conceptIds.join(', '));
      if (ex.visualizationIds.length > 0) {
        lines.push('   Visualizations: ' + ex.visualizationIds.join(', '));
      }
      if (ex.laboratoryIds.length > 0) {
        lines.push('   Laboratories: ' + ex.laboratoryIds.join(', '));
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  return {
    scoreExample: scoreExample,
    rankExamples: rankExamples,
    selectBestExamples: selectBestExamples,
    explainSelection: explainSelection,
    WEIGHTS: WEIGHTS,
    MAX_EXAMPLES: MAX_EXAMPLES
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createExampleSelectionEngine = createExampleSelectionEngine;
}

export { createExampleSelectionEngine };
