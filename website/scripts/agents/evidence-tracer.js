/**
 * NV-1300-D1D — Evidence Tracer
 *
 * Builds a complete provenance tree for every instructional block.
 * Every block in a lesson must be explainable: where it came from,
 * which concepts it references, which shared knowledge it draws on,
 * which visualization and laboratory resources it uses, why it was
 * inserted, and whether it was generated.
 *
 * Pure, deterministic. No Math.random, no Date.now, no external IO.
 * No learner inference. No curriculum mutation.
 */

const PROVENANCE_SOURCE_TYPES = [
  'concept',
  'artifact',
  'sharedKnowledge',
  'visualization',
  'laboratory',
  'semanticDependency',
  'mediaPlan',
  'none'
];

const CANONICAL_STATUSES = {
  CANONICAL: 'Canonical',
  NON_CANONICAL: 'NonCanonical'
};

const INSERTION_REASONS = [
  'planner_required_layer',
  'planner_optional_layer',
  'evidence_pulled_from_concept',
  'evidence_pulled_from_artifact',
  'evidence_pulled_from_shared_knowledge',
  'evidence_pulled_from_visualization',
  'evidence_pulled_from_laboratory',
  'media_orchestration_selection',
  'transition_bridge',
  'density_balance',
  'optional_generative_augmentation',
  'memory_resume_continuation',
  'review_due_recap',
  'semantic_neighborhood_support',
  'cross_agent_contribution'
];

var _idCounter = 0;
function _deterministicId(prefix) {
  _idCounter++;
  return (prefix || 'id') + '-' + _idCounter.toString(36);
}

function _empty() {
  return {
    blockId: null,
    sourceArtifacts: [],
    sourceConcepts: [],
    sharedKnowledge: [],
    visualizations: [],
    laboratories: [],
    explanationSource: null,
    insertionReason: null,
    generated: false,
    generator: null,
    confidence: 1.0,
    canonicalStatus: CANONICAL_STATUSES.CANONICAL,
    timestamp: null
  };
}

function _dedup(arr) {
  var seen = Object.create(null);
  var out = [];
  for (var i = 0; i < arr.length; i++) {
    var v = arr[i];
    if (v == null) continue;
    if (seen[v]) continue;
    seen[v] = true;
    out.push(v);
  }
  return out;
}

function createEvidenceTracer() {
  var _tree = null;
  var _blocks = [];

  function _newBlockId(prefix) {
    return (prefix || 'blk') + '-' + _deterministicId('id');
  }

  function traceBlock(input) {
    var src = input || {};
    var block = _empty();
    block.blockId = src.blockId || _newBlockId('blk');
    block.sourceArtifacts = _dedup(Array.isArray(src.sourceArtifacts) ? src.sourceArtifacts : (src.sourceArtifacts ? [src.sourceArtifacts] : []));
    block.sourceConcepts = _dedup(Array.isArray(src.sourceConcepts) ? src.sourceConcepts : (src.sourceConcepts ? [src.sourceConcepts] : []));
    block.sharedKnowledge = _dedup(Array.isArray(src.sharedKnowledge) ? src.sharedKnowledge : (src.sharedKnowledge ? [src.sharedKnowledge] : []));
    block.visualizations = _dedup(Array.isArray(src.visualizations) ? src.visualizations : (src.visualizations ? [src.visualizations] : []));
    block.laboratories = _dedup(Array.isArray(src.laboratories) ? src.laboratories : (src.laboratories ? [src.laboratories] : []));
    block.explanationSource = src.explanationSource || null;
    block.insertionReason = src.insertionReason || 'planner_optional_layer';
    block.generated = src.generated === true;
    block.generator = src.generator || null;
    block.confidence = typeof src.confidence === 'number' ? src.confidence : 1.0;
    block.canonicalStatus = block.generated
      ? CANONICAL_STATUSES.NON_CANONICAL
      : (src.canonicalStatus || CANONICAL_STATUSES.CANONICAL);
    block.timestamp = null;

    if (INSERTION_REASONS.indexOf(block.insertionReason) === -1) {
      block.insertionReason = 'planner_optional_layer';
    }

    for (var i = 0; i < PROVENANCE_SOURCE_TYPES.length; i++) {
      var st = PROVENANCE_SOURCE_TYPES[i];
      if (st === 'none') continue;
    }

    _blocks.push(block);
    return block;
  }

  function traceLesson(plan) {
    if (!plan || typeof plan !== 'object') {
      return { valid: false, errors: ['Invalid plan: expected object'], blocks: [] };
    }

    _blocks = [];

    var planId = plan.id || 'plan-unknown';
    var sectionBlocks = [];

    if (Array.isArray(plan.sections)) {
      for (var i = 0; i < plan.sections.length; i++) {
        var section = plan.sections[i];
        var meta = (section && section.metadata) || {};
        var evidence = meta.evidence || [];
        var sources = { concepts: [], artifacts: [], sharedKnowledge: [], visualizations: [], laboratories: [] };

        for (var e = 0; e < evidence.length; e++) {
          var entry = evidence[e];
          if (!entry) continue;
          if (entry.sourceType === 'concept' && entry.sourceId) {
            sources.concepts.push(entry.sourceId);
          } else if (entry.sourceType === 'artifact' && entry.sourceId) {
            sources.artifacts.push(entry.sourceId);
          } else if (entry.sourceType === 'sharedKnowledge' && entry.sourceId) {
            sources.sharedKnowledge.push(entry.sourceId);
          } else if (entry.sourceType === 'visualization' && entry.sourceId) {
            sources.visualizations.push(entry.sourceId);
          } else if (entry.sourceType === 'laboratory' && entry.sourceId) {
            sources.laboratories.push(entry.sourceId);
          }
        }

        var block = traceBlock({
          blockId: 'sec-' + (section.id || ('idx-' + i)),
          sourceConcepts: sources.concepts,
          sourceArtifacts: sources.artifacts,
          sharedKnowledge: sources.sharedKnowledge,
          visualizations: sources.visualizations,
          laboratories: sources.laboratories,
          explanationSource: 'planner.section:' + (section.id || ('idx-' + i)),
          insertionReason: section.included === false ? 'planner_optional_layer' : 'planner_required_layer',
          generated: false,
          generator: null,
          confidence: 1.0,
          canonicalStatus: CANONICAL_STATUSES.CANONICAL
        });

        sectionBlocks.push(block);
      }
    }

    if (Array.isArray(plan.mediaTimeline)) {
      for (var m = 0; m < plan.mediaTimeline.length; m++) {
        var entry = plan.mediaTimeline[m];
        if (!entry) continue;
        var mediaSources = {};
        if (entry.mediaType === 'visualization') {
          mediaSources.visualizations = [entry.mediaId];
        } else if (entry.mediaType === 'laboratory') {
          mediaSources.laboratories = [entry.mediaId];
        }
        var mblock = traceBlock({
          blockId: 'media-' + (entry.sectionId || ('idx-' + m)),
          visualizations: mediaSources.visualizations,
          laboratories: mediaSources.laboratories,
          explanationSource: 'media.' + (entry.mediaType || 'none') + ':' + (entry.mediaId || ''),
          insertionReason: 'media_orchestration_selection',
          generated: false,
          confidence: 1.0,
          canonicalStatus: CANONICAL_STATUSES.CANONICAL
        });
        sectionBlocks.push(mblock);
      }
    }

    if (Array.isArray(plan.transitionMap)) {
      for (var t = 0; t < plan.transitionMap.length; t++) {
        var tr = plan.transitionMap[t];
        if (!tr) continue;
        var tblock = traceBlock({
          blockId: 'trans-' + (tr.fromSectionId || 'idx') + '-' + (tr.toSectionId || 'idx'),
          explanationSource: 'transition.' + (tr.transitionType || 'none'),
          insertionReason: 'transition_bridge',
          generated: false,
          confidence: 1.0,
          canonicalStatus: CANONICAL_STATUSES.CANONICAL
        });
        sectionBlocks.push(tblock);
      }
    }

    if (Array.isArray(plan.generatedBlocks)) {
      for (var g = 0; g < plan.generatedBlocks.length; g++) {
        var gb = plan.generatedBlocks[g];
        if (!gb) continue;
        var gblock = traceBlock({
          blockId: gb.blockId || ('gen-' + g),
          sourceConcepts: gb.sourceConcepts,
          sourceArtifacts: gb.sourceArtifacts,
          sharedKnowledge: gb.sharedKnowledge,
          visualizations: gb.visualizations,
          laboratories: gb.laboratories,
          explanationSource: gb.explanationSource || 'generative.augmentation',
          insertionReason: gb.insertionReason || 'optional_generative_augmentation',
          generated: true,
          generator: gb.generator || 'p11-generative',
          confidence: typeof gb.confidence === 'number' ? gb.confidence : 0.7,
          canonicalStatus: CANONICAL_STATUSES.NON_CANONICAL
        });
        sectionBlocks.push(gblock);
      }
    }

    var tree = buildEvidenceTree({ planId: planId, blocks: sectionBlocks });
    _tree = tree;
    return { valid: true, planId: planId, blocks: sectionBlocks, tree: tree };
  }

  function buildEvidenceTree(input) {
    var src = input || {};
    var planId = src.planId || 'plan-unknown';
    var blocks = Array.isArray(src.blocks) ? src.blocks.slice() : _blocks.slice();

    var byType = { Canonical: [], NonCanonical: [] };
    var byReason = Object.create(null);
    var byGenerator = Object.create(null);

    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (b.canonicalStatus === CANONICAL_STATUSES.CANONICAL) {
        byType.Canonical.push(b.blockId);
      } else {
        byType.NonCanonical.push(b.blockId);
      }
      var reason = b.insertionReason || 'planner_optional_layer';
      if (!byReason[reason]) byReason[reason] = 0;
      byReason[reason]++;
      if (b.generated) {
        var gen = b.generator || 'unknown';
        if (!byGenerator[gen]) byGenerator[gen] = 0;
        byGenerator[gen]++;
      }
    }

    return {
      planId: planId,
      rootPlanId: planId,
      totalBlocks: blocks.length,
      canonicalCount: byType.Canonical.length,
      nonCanonicalCount: byType.NonCanonical.length,
      blocks: blocks,
      blockIds: blocks.map(function (b) { return b.blockId; }),
      byCanonicalStatus: byType,
      byInsertionReason: byReason,
      byGenerator: byGenerator,
      provenanceModel: {
        canonicalStatus: CANONICAL_STATUSES,
        sourceTypes: PROVENANCE_SOURCE_TYPES,
        insertionReasons: INSERTION_REASONS
      }
    };
  }

  function validateEvidence(blocks) {
    var arr = Array.isArray(blocks) ? blocks : _blocks;
    var errors = [];
    var warnings = [];

    if (!Array.isArray(arr)) {
      return { valid: false, errors: ['Blocks must be an array'], warnings: [] };
    }

    var seenIds = Object.create(null);
    for (var i = 0; i < arr.length; i++) {
      var b = arr[i];
      if (!b) { errors.push('Block at index ' + i + ' is null'); continue; }
      if (!b.blockId) { errors.push('Block at index ' + i + ' missing blockId'); continue; }
      if (seenIds[b.blockId]) { errors.push('Duplicate blockId: ' + b.blockId); }
      seenIds[b.blockId] = true;
      if (b.canonicalStatus !== CANONICAL_STATUSES.CANONICAL && b.canonicalStatus !== CANONICAL_STATUSES.NON_CANONICAL) {
        errors.push('Block ' + b.blockId + ' has invalid canonicalStatus: ' + b.canonicalStatus);
      }
      if (b.generated === true && b.canonicalStatus !== CANONICAL_STATUSES.NON_CANONICAL) {
        errors.push('Generated block ' + b.blockId + ' must have canonicalStatus NonCanonical');
      }
      if (b.generated !== true && b.canonicalStatus === CANONICAL_STATUSES.NON_CANONICAL) {
        warnings.push('Non-generated block ' + b.blockId + ' has NonCanonical status (unusual but allowed)');
      }
      if (b.insertionReason && INSERTION_REASONS.indexOf(b.insertionReason) === -1) {
        warnings.push('Block ' + b.blockId + ' has unknown insertionReason: ' + b.insertionReason);
      }
      if (typeof b.confidence !== 'number' || b.confidence < 0 || b.confidence > 1) {
        errors.push('Block ' + b.blockId + ' has invalid confidence: ' + b.confidence);
      }
    }

    return { valid: errors.length === 0, errors: errors, warnings: warnings };
  }

  function exportEvidence(blocks) {
    var arr = Array.isArray(blocks) ? blocks : _blocks;
    return {
      schema: 'nv-evidence-trace/v1',
      exportedAt: null,
      totalBlocks: arr.length,
      blocks: arr.map(function (b) {
        return {
          blockId: b.blockId,
          sourceArtifacts: b.sourceArtifacts.slice(),
          sourceConcepts: b.sourceConcepts.slice(),
          sharedKnowledge: b.sharedKnowledge.slice(),
          visualizations: b.visualizations.slice(),
          laboratories: b.laboratories.slice(),
          explanationSource: b.explanationSource,
          insertionReason: b.insertionReason,
          generated: b.generated,
          generator: b.generator,
          confidence: b.confidence,
          canonicalStatus: b.canonicalStatus
        };
      })
    };
  }

  function summarizeEvidence(tree) {
    var t = tree || _tree;
    if (!t) return 'No evidence tree built yet.';
    var lines = [];
    lines.push('Evidence Summary for plan: ' + t.planId);
    lines.push('  Total blocks: ' + t.totalBlocks);
    lines.push('  Canonical:    ' + t.canonicalCount);
    lines.push('  NonCanonical: ' + t.nonCanonicalCount);
    lines.push('  Generators:   ' + Object.keys(t.byGenerator).join(', ') || 'none');
    lines.push('  Insertion reasons:');
    var reasons = Object.keys(t.byInsertionReason);
    for (var i = 0; i < reasons.length; i++) {
      lines.push('    - ' + reasons[i] + ': ' + t.byInsertionReason[reasons[i]]);
    }
    return lines.join('\n');
  }

  function getLastTree() { return _tree; }
  function getBlocks() { return _blocks.slice(); }
  function reset() { _tree = null; _blocks = []; }

  return {
    traceBlock: traceBlock,
    traceLesson: traceLesson,
    buildEvidenceTree: buildEvidenceTree,
    validateEvidence: validateEvidence,
    exportEvidence: exportEvidence,
    summarizeEvidence: summarizeEvidence,
    getLastTree: getLastTree,
    getBlocks: getBlocks,
    reset: reset,
    PROVENANCE_SOURCE_TYPES: PROVENANCE_SOURCE_TYPES,
    CANONICAL_STATUSES: CANONICAL_STATUSES,
    INSERTION_REASONS: INSERTION_REASONS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createEvidenceTracer = createEvidenceTracer;
}

export { createEvidenceTracer, PROVENANCE_SOURCE_TYPES, CANONICAL_STATUSES, INSERTION_REASONS };
