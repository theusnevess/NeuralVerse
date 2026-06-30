/**
 * NV-1300-D1D — Generative Augmenter
 *
 * Optional local LLM augmentation layer. NEVER generates canonical
 * explanations. May ONLY enrich the canonical lesson.
 *
 * Allowed augmentation:
 *   - alternative analogy
 *   - additional example
 *   - historical anecdote
 *   - intuitive explanation
 *   - metaphor
 *   - implementation suggestion
 *
 * Forbidden:
 *   - replace canonical content
 *   - generate curriculum
 *   - invent citations
 *   - create prerequisites
 *
 * The generative layer (P11) is optional. When unavailable or disabled,
 * deterministic fallback augmentation is used (always from canonical
 * content sources). All augmented blocks are tagged:
 *   generated = true
 *   canonicalStatus = NonCanonical
 *
 * Pure, deterministic. No Math.random. No Date.now.
 * No learner inference. No curriculum mutation.
 * No cloud providers. Local only.
 */

const AUGMENTATION_TYPES = {
  ALTERNATIVE_EXPLANATION: 'alternative_explanation',
  ANALOGY: 'analogy',
  EXTRA_EXAMPLE: 'extra_example',
  VISUALIZATION_NARRATION: 'visualization_narration',
  LABORATORY_HINTS: 'laboratory_hints',
  HISTORICAL_ANECDOTE: 'historical_anecdote',
  IMPLEMENTATION_SUGGESTION: 'implementation_suggestion',
  METAPHOR: 'metaphor'
};

const ALLOWED_AUGMENTATION_TYPES = [
  AUGMENTATION_TYPES.ALTERNATIVE_EXPLANATION,
  AUGMENTATION_TYPES.ANALOGY,
  AUGMENTATION_TYPES.EXTRA_EXAMPLE,
  AUGMENTATION_TYPES.VISUALIZATION_NARRATION,
  AUGMENTATION_TYPES.LABORATORY_HINTS,
  AUGMENTATION_TYPES.HISTORICAL_ANECDOTE,
  AUGMENTATION_TYPES.IMPLEMENTATION_SUGGESTION,
  AUGMENTATION_TYPES.METAPHOR
];

const FORBIDDEN_REPLACE_TYPES = [
  'canonical_explanation',
  'curriculum_definition',
  'prerequisite_creation',
  'citation_invention',
  'concept_definition'
];

const GENERATOR_ID = 'p11-generative-augmenter';
const DEFAULT_CONFIDENCE = 0.7;

function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }
function _safeArray(v) { return Array.isArray(v) ? v : []; }

var _augIdCounter = 0;
function _deterministicId(prefix) {
  _augIdCounter++;
  return (prefix || 'aug') + '-' + _augIdCounter.toString(36);
}

function _buildBlock(type, content, source) {
  return {
    blockId: _deterministicId('aug'),
    type: type,
    content: _safeStr(content),
    title: _safeStr(source && source.title, ''),
    generated: true,
    generator: GENERATOR_ID,
    confidence: DEFAULT_CONFIDENCE,
    canonicalStatus: 'NonCanonical',
    insertionReason: 'optional_generative_augmentation',
    sourceConcepts: _safeArray(source && source.sourceConcepts),
    sourceArtifacts: _safeArray(source && source.sourceArtifacts),
    sharedKnowledge: [],
    visualizations: [],
    laboratories: [],
    explanationSource: 'generative.' + type,
    timestamp: null
  };
}

function createGenerativeAugmenter(deps) {
  var generativeController = (deps && deps.generativeController) || (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.GenerativeController) || null;
  var _lastBlock = null;
  var _disabledReason = null;

  function _isGenerativeAvailable() {
    if (!generativeController) return false;
    if (typeof generativeController.isEnabled !== 'function') return false;
    try { return generativeController.isEnabled() === true; } catch (e) { return false; }
  }

  function _disabled() {
    return {
      available: false,
      reason: _disabledReason || 'Generative layer not enabled',
      block: null
    };
  }

  function _isAllowedType(type) {
    return ALLOWED_AUGMENTATION_TYPES.indexOf(type) !== -1;
  }

  function _isForbiddenReplace(type) {
    return FORBIDDEN_REPLACE_TYPES.indexOf(type) !== -1;
  }

  function _deterministicFallback(type, input) {
    var src = input || {};
    var topic = _safeStr(src.topic, '');
    var canonical = _safeStr(src.canonicalContent, '');
    var fallback;

    if (type === AUGMENTATION_TYPES.ALTERNATIVE_EXPLANATION) {
      fallback = 'Alternative angle on ' + topic + ': ' +
        (canonical ? 'Re-state the core idea in a more intuitive voice, drawing on the canonical content as the source of truth.' : 'Restate from the canonical perspective.');
    } else if (type === AUGMENTATION_TYPES.ANALOGY) {
      fallback = 'Analogy placeholder for ' + topic + ': generated augmentation from canonical source.';
    } else if (type === AUGMENTATION_TYPES.EXTRA_EXAMPLE) {
      fallback = 'Additional example placeholder for ' + topic + ': derived from canonical content only.';
    } else if (type === AUGMENTATION_TYPES.VISUALIZATION_NARRATION) {
      fallback = 'Visualization narration placeholder for ' + topic + ': the visualization itself is canonical; this narration augments it.';
    } else if (type === AUGMENTATION_TYPES.LABORATORY_HINTS) {
      fallback = 'Laboratory hint placeholder for ' + topic + ': hints derived from canonical lab specification only.';
    } else if (type === AUGMENTATION_TYPES.HISTORICAL_ANECDOTE) {
      fallback = 'Historical anecdote placeholder for ' + topic + ': drawn from shared knowledge only.';
    } else if (type === AUGMENTATION_TYPES.IMPLEMENTATION_SUGGESTION) {
      fallback = 'Implementation suggestion placeholder for ' + topic + ': not authoritative; consult canonical reference.';
    } else if (type === AUGMENTATION_TYPES.METAPHOR) {
      fallback = 'Metaphor placeholder for ' + topic + ': illustrative only.';
    } else {
      return null;
    }

    return _buildBlock(type, fallback, {
      title: topic,
      sourceConcepts: _safeArray(src.conceptIds),
      sourceArtifacts: _safeArray(src.artifactIds)
    });
  }

  function _callGenerative(type, input) {
    if (!generativeController || typeof generativeController.generate !== 'function') return null;
    try {
      var prompt = {
        type: type,
        topic: (input && input.topic) || '',
        canonicalContent: (input && input.canonicalContent) || '',
        conceptIds: _safeArray(input && input.conceptIds),
        artifactIds: _safeArray(input && input.artifactIds)
      };
      var result = generativeController.generate(prompt);
      if (!result || typeof result.text !== 'string') return null;
      return result;
    } catch (e) {
      return null;
    }
  }

  function generateAlternativeExplanation(input) {
    return _generate(AUGMENTATION_TYPES.ALTERNATIVE_EXPLANATION, input);
  }
  function generateAnalogy(input) {
    return _generate(AUGMENTATION_TYPES.ANALOGY, input);
  }
  function generateExtraExample(input) {
    return _generate(AUGMENTATION_TYPES.EXTRA_EXAMPLE, input);
  }
  function generateVisualizationNarration(input) {
    return _generate(AUGMENTATION_TYPES.VISUALIZATION_NARRATION, input);
  }
  function generateLaboratoryHints(input) {
    return _generate(AUGMENTATION_TYPES.LABORATORY_HINTS, input);
  }

  function _generate(type, input) {
    if (_isForbiddenReplace(type)) {
      return {
        available: false,
        reason: 'Forbidden replacement type: ' + type,
        block: null
      };
    }
    if (!_isAllowedType(type)) {
      return {
        available: false,
        reason: 'Not in allowed augmentation types: ' + type,
        block: null
      };
    }

    if (!_isGenerativeAvailable()) {
      var fb = _deterministicFallback(type, input);
      _lastBlock = fb;
      return {
        available: false,
        reason: 'Generative layer not enabled — using deterministic fallback (canonical-derived)',
        block: fb
      };
    }

    var raw = _callGenerative(type, input);
    if (!raw) {
      var fb2 = _deterministicFallback(type, input);
      _lastBlock = fb2;
      return {
        available: false,
        reason: 'Generative call returned no result — using deterministic fallback',
        block: fb2
      };
    }

    var block = _buildBlock(type, raw.text, {
      title: (input && input.topic) || '',
      sourceConcepts: _safeArray(input && input.conceptIds),
      sourceArtifacts: _safeArray(input && input.artifactIds)
    });
    if (typeof raw.confidence === 'number') block.confidence = raw.confidence;

    _lastBlock = block;
    return { available: true, reason: 'Generated by P11 (local only)', block: block };
  }

  function isAvailable() { return _isGenerativeAvailable(); }
  function getLastBlock() { return _lastBlock; }
  function reset() { _lastBlock = null; _disabledReason = null; }

  return {
    generateAlternativeExplanation: generateAlternativeExplanation,
    generateAnalogy: generateAnalogy,
    generateExtraExample: generateExtraExample,
    generateVisualizationNarration: generateVisualizationNarration,
    generateLaboratoryHints: generateLaboratoryHints,
    isAvailable: isAvailable,
    getLastBlock: getLastBlock,
    reset: reset,
    AUGMENTATION_TYPES: AUGMENTATION_TYPES,
    ALLOWED_AUGMENTATION_TYPES: ALLOWED_AUGMENTATION_TYPES,
    FORBIDDEN_REPLACE_TYPES: FORBIDDEN_REPLACE_TYPES,
    GENERATOR_ID: GENERATOR_ID
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createGenerativeAugmenter = createGenerativeAugmenter;
}

export {
  createGenerativeAugmenter,
  AUGMENTATION_TYPES,
  ALLOWED_AUGMENTATION_TYPES,
  FORBIDDEN_REPLACE_TYPES,
  GENERATOR_ID
};
