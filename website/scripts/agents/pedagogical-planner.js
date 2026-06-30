/**
 * NV-1300-D1A/D1B/D1C/D1D — Pedagogical Planner
 *
 * Core deterministic planner that builds structured instructional plans.
 * Integrates composition graph, instructional layers, difficulty ladder,
 * multi-perspective engine, semantic dependency resolution, example selection,
 * recap insertion, cross-domain connections, resource selection,
 * media orchestration (D1C), and
 * evidence tracing, memory & review bridges, semantic learning bridge,
 * agent collaboration orchestration, and optional generative augmentation
 * (D1D).
 *
 * Same inputs always produce the same plan.
 * No learner inference. No curriculum mutation.
 *
 * Deterministic. No Math.random. No Date.now.
 */

function createPedagogicalPlanner(deps) {
  var compositionGraph = deps && deps.compositionGraph;
  var instructionalLayers = deps && deps.instructionalLayers;
  var difficultyLadder = deps && deps.difficultyLadder;
  var multiPerspectiveEngine = deps && deps.multiPerspectiveEngine;
  var semanticResolver = deps && deps.semanticResolver;
  var exampleEngine = deps && deps.exampleEngine;
  var exampleRegistry = deps && deps.exampleRegistry;
  var crossDomainConnector = deps && deps.crossDomainConnector;
  var recapInserter = deps && deps.recapInserter;
  var resourceSelector = deps && deps.resourceSelector;
  var mediaOrchestrator = deps && deps.mediaOrchestrator;
  var evidenceTracer = deps && deps.evidenceTracer;
  var memoryReviewBridge = deps && deps.memoryReviewBridge;
  var semanticLearningBridge = deps && deps.semanticLearningBridge;
  var agentCollaborationOrchestrator = deps && deps.agentCollaborationOrchestrator;
  var generativeAugmenter = deps && deps.generativeAugmenter;
  var cognitiveLoadOptimizer = deps && deps.cognitiveLoadOptimizer;
  var instructionalPacingEngine = deps && deps.instructionalPacingEngine;
  var lessonComposer = deps && deps.lessonComposer;
  var readabilityOptimizer = deps && deps.readabilityOptimizer;
  var accessibilityPolish = deps && deps.accessibilityPolish;

  var _lastPlan = null;

  function _generatePlanId(input) {
    var difficulty = input.difficulty || 'standard';
    var perspective = input.perspective || 'intuitive';
    var topic = input.topic || 'topic';
    var slug = topic.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 40);
    return 'plan-didactic-' + difficulty + '-' + slug;
  }

  function _detectConceptIds(input) {
    var ids = [];
    if (Array.isArray(input.conceptIds)) {
      for (var i = 0; i < input.conceptIds.length; i++) {
        if (input.conceptIds[i] && ids.indexOf(input.conceptIds[i]) === -1) {
          ids.push(input.conceptIds[i]);
        }
      }
    }
    return ids;
  }

  function _detectAvailableResources(input) {
    var res = input.availableResources || {};
    return {
      concepts: Array.isArray(res.concepts) ? res.concepts : [],
      artifacts: Array.isArray(res.artifacts) ? res.artifacts : [],
      visualizations: Array.isArray(res.visualizations) ? res.visualizations : [],
      laboratories: Array.isArray(res.laboratories) ? res.laboratories : [],
      sharedKnowledge: Array.isArray(res.sharedKnowledge) ? res.sharedKnowledge : []
    };
  }

  function _detectMathContent(input) {
    var query = (input.query || '').toLowerCase();
    var topic = (input.topic || '').toLowerCase();
    var mathTerms = [
      'formula', 'equation', 'mathematical', 'derivation', 'proof',
      'definition', 'formal', 'notation', 'linear algebra', 'probability',
      'calculus', 'gradient', 'optimization', 'matrix', 'vector'
    ];
    for (var i = 0; i < mathTerms.length; i++) {
      if (query.indexOf(mathTerms[i]) !== -1 || topic.indexOf(mathTerms[i]) !== -1) {
        return true;
      }
    }
    return input.conceptIds && input.conceptIds.length > 0;
  }

  function _buildEvidence(input, layerId) {
    var evidence = [];
    var conceptIds = _detectConceptIds(input);
    var resources = _detectAvailableResources(input);

    for (var i = 0; i < conceptIds.length; i++) {
      evidence.push({
        layerId: layerId,
        sourceType: 'concept',
        sourceId: conceptIds[i],
        reason: 'Concept reference for layer: ' + layerId
      });
    }

    if (layerId === 'visualization') {
      for (var j = 0; j < resources.visualizations.length; j++) {
        var viz = resources.visualizations[j];
        evidence.push({
          layerId: layerId,
          sourceType: 'visualization',
          sourceId: viz.id || viz,
          reason: 'Visualization resource for layer: ' + layerId
        });
      }
    }

    if (layerId === 'laboratory') {
      for (var k = 0; k < resources.laboratories.length; k++) {
        var lab = resources.laboratories[k];
        evidence.push({
          layerId: layerId,
          sourceType: 'laboratory',
          sourceId: lab.id || lab,
          reason: 'Laboratory resource for layer: ' + layerId
        });
      }
    }

    if (layerId === 'core_explanation' || layerId === 'motivation') {
      for (var m = 0; m < resources.sharedKnowledge.length; m++) {
        var sk = resources.sharedKnowledge[m];
        evidence.push({
          layerId: layerId,
          sourceType: 'sharedKnowledge',
          sourceId: sk.id || sk,
          reason: 'Shared knowledge resource for layer: ' + layerId
        });
      }
    }

    if (layerId === 'core_explanation' || layerId === 'context') {
      for (var n = 0; n < resources.artifacts.length; n++) {
        var art = resources.artifacts[n];
        evidence.push({
          layerId: layerId,
          sourceType: 'artifact',
          sourceId: art.id || art,
          reason: 'Artifact resource for layer: ' + layerId
        });
      }
    }

    if (evidence.length === 0) {
      evidence.push({
        layerId: layerId,
        sourceType: 'none',
        sourceId: null,
        reason: 'No explicit canonical source detected for this layer.'
      });
    }

    return evidence;
  }

  function _buildSectionsFromLayers(layers, input) {
    var sections = [];
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      sections.push({
        id: layer.id,
        label: layer.label,
        type: 'instructional',
        included: true,
        content: null,
        metadata: {
          purpose: layer.purpose,
          complexity: layer.complexity,
          evidence: _buildEvidence(input, layer.id)
        }
      });
    }
    return sections;
  }

  function buildPlan(input) {
    if (!input || typeof input !== 'object') {
      return _buildInvalidPlan('Invalid input: expected an object');
    }

    var query = typeof input.query === 'string' ? input.query : '';
    var intent = typeof input.intent === 'string' ? input.intent : 'explain';
    var mode = typeof input.mode === 'string' ? input.mode : 'default';
    var topic = typeof input.topic === 'string' ? input.topic : (query.length > 5 ? query : 'current curriculum topic');

    if (query.length === 0 && (!input.topic || input.topic.length === 0)) {
      return _buildInvalidPlan('Empty input: query or topic required');
    }

    var difficulty = input.difficulty || 'standard';
    var conceptIds = _detectConceptIds(input);
    var resources = _detectAvailableResources(input);
    var hasMath = _detectMathContent(input);

    var perspective = input.perspective || 'intuitive';
    if (multiPerspectiveEngine) {
      perspective = multiPerspectiveEngine.selectPerspective({
        perspective: input.perspective,
        intent: intent,
        mode: mode,
        difficulty: difficulty
      });
    }

    var layerContext = {
      difficulty: difficulty,
      conceptIds: conceptIds,
      availableResources: resources,
      query: query,
      topic: topic,
      hasMath: hasMath
    };

    var layerResult = { layers: [], omissions: [] };
    if (instructionalLayers) {
      layerResult = instructionalLayers.selectLayers(layerContext);
    }

    var plan = {
      id: _generatePlanId(input),
      topic: topic,
      intent: intent,
      mode: mode,
      difficulty: difficulty,
      selectedPerspective: perspective,
      layers: layerResult.layers,
      sections: _buildSectionsFromLayers(layerResult.layers, input),
      evidence: [],
      warnings: [],
      omissions: layerResult.omissions,
      generatedAt: null
    };

    if (difficultyLadder) {
      plan = difficultyLadder.applyPreset(plan, difficulty);
    }

    if (multiPerspectiveEngine) {
      plan = multiPerspectiveEngine.applyPerspective(plan, perspective);
    }

    if (compositionGraph) {
      var graph = compositionGraph.buildFromSections(plan.sections);
      plan.graph = {
        valid: graph.valid,
        nodes: graph.nodes ? graph.nodes.length : 0,
        edges: graph.edges ? graph.edges.length : 0,
        errors: graph.errors || [],
        sorted: compositionGraph.topologicalSort(graph)
      };
    } else {
      plan.graph = { valid: false, nodes: 0, edges: 0, errors: ['Composition graph not available'], sorted: [] };
    }

    for (var i = 0; i < plan.sections.length; i++) {
      var section = plan.sections[i];
      if (section.metadata && section.metadata.evidence) {
        for (var j = 0; j < section.metadata.evidence.length; j++) {
          plan.evidence.push(section.metadata.evidence[j]);
        }
      }
    }

    if (conceptIds.length === 0) {
      plan.warnings.push('No concept IDs detected — plan uses generic instructional structure.');
    }
    if (resources.visualizations.length === 0 && _layerIncluded(plan, 'visualization')) {
      plan.warnings.push('Visualization layer included but no visualization resources available.');
    }
    if (resources.laboratories.length === 0 && _layerIncluded(plan, 'laboratory')) {
      plan.warnings.push('Laboratory layer included but no laboratory resources available.');
    }

    plan.conceptIds = conceptIds;
    plan.artifactIds = [];
    if (input.artifactIds) {
      for (var ai = 0; ai < input.artifactIds.length; ai++) {
        var aid = typeof input.artifactIds[ai] === 'string' ? input.artifactIds[ai] : (input.artifactIds[ai].id || '');
        if (aid) plan.artifactIds.push(aid);
      }
    }

    if (semanticResolver && conceptIds.length > 0) {
      plan.dependencyChain = [];
      plan.missingPrerequisites = [];
      for (var ci = 0; ci < conceptIds.length; ci++) {
        var chain = semanticResolver.buildDependencyChain(conceptIds[ci]);
        if (chain.chain) {
          for (var ch = 0; ch < chain.chain.length; ch++) {
            var alreadyInChain = false;
            for (var existing = 0; existing < plan.dependencyChain.length; existing++) {
              if (plan.dependencyChain[existing].id === chain.chain[ch].id) {
                alreadyInChain = true;
                break;
              }
            }
            if (!alreadyInChain) {
              plan.dependencyChain.push(chain.chain[ch]);
            }
          }
        }
        var missing = semanticResolver.detectMissingDependencies(plan);
        if (missing.length > 0) {
          for (var mi = 0; mi < missing.length; mi++) {
            var alreadyMissing = false;
            for (var mj = 0; mj < plan.missingPrerequisites.length; mj++) {
              if (plan.missingPrerequisites[mj].conceptId === missing[mi].conceptId) {
                alreadyMissing = true;
                break;
              }
            }
            if (!alreadyMissing) {
              plan.missingPrerequisites.push(missing[mi]);
            }
          }
        }
      }
    } else {
      plan.dependencyChain = [];
      plan.missingPrerequisites = [];
    }

    if (recapInserter && conceptIds.length > 0) {
      plan = recapInserter.insertRecaps(plan);
    } else {
      plan.insertedRecaps = [];
      plan.recapsCount = 0;
    }

    if (exampleEngine) {
      plan.selectedExamples = exampleEngine.selectBestExamples({
        conceptIds: conceptIds,
        difficulty: difficulty,
        availableResources: resources
      }, 3);
    } else {
      plan.selectedExamples = [];
    }

    if (resourceSelector) {
      plan.selectedResources = resourceSelector.buildResourceBundle(plan);
    } else {
      plan.selectedResources = { artifacts: [], concepts: [], visualizations: [], laboratories: [], sharedKnowledge: [], warnings: [] };
    }

    if (mediaOrchestrator) {
      var mediaPlan = mediaOrchestrator.buildMediaPlan(plan);
      plan.mediaPlan = mediaPlan;
      plan.visualizations = mediaPlan.visualizations || [];
      plan.laboratories = mediaPlan.laboratory ? [mediaPlan.laboratory] : [];
      plan.mediaTimeline = mediaPlan.timeline || [];
      plan.transitionMap = mediaPlan.transitions || [];
      plan.densityMetrics = mediaPlan.densityMetrics || {};
      if (mediaPlan.evidence) {
        for (var me = 0; me < mediaPlan.evidence.length; me++) {
          plan.evidence.push(mediaPlan.evidence[me]);
        }
      }
      if (mediaPlan.warnings) {
        for (var mw = 0; mw < mediaPlan.warnings.length; mw++) {
          plan.warnings.push(mediaPlan.warnings[mw]);
        }
      }
    } else {
      plan.mediaPlan = null;
      plan.visualizations = [];
      plan.laboratories = [];
      plan.mediaTimeline = [];
      plan.transitionMap = [];
      plan.densityMetrics = {};
    }

    if (crossDomainConnector && conceptIds.length > 0) {
      plan.crossDomainConnections = crossDomainConnector.rankConnections(conceptIds, 8);
    } else {
      plan.crossDomainConnections = [];
    }

    plan.evidenceTree = null;
    if (evidenceTracer && typeof evidenceTracer.traceLesson === 'function') {
      try {
        var traced = evidenceTracer.traceLesson(plan);
        plan.evidenceTree = traced && traced.tree ? traced.tree : null;
        if (traced && Array.isArray(traced.blocks)) {
          plan.evidenceBlocks = traced.blocks;
        }
      } catch (e) {
        plan.evidenceTree = null;
        plan.evidenceBlocks = [];
      }
    } else {
      plan.evidenceBlocks = [];
    }

    plan.memoryContext = null;
    plan.reviewContext = null;
    if (memoryReviewBridge && typeof memoryReviewBridge.buildContext === 'function') {
      try {
        var ctx = memoryReviewBridge.buildContext({
          conceptIds: conceptIds,
          artifactIds: plan.artifactIds
        });
        plan.memoryContext = ctx && ctx.memory ? ctx.memory : null;
        plan.reviewContext = ctx && ctx.review ? ctx.review : null;
      } catch (e) {
        plan.memoryContext = null;
        plan.reviewContext = null;
      }
    }

    plan.semanticContext = null;
    if (semanticLearningBridge && typeof semanticLearningBridge.getSemanticContext === 'function') {
      try {
        plan.semanticContext = semanticLearningBridge.getSemanticContext({
          conceptIds: conceptIds
        });
      } catch (e) {
        plan.semanticContext = null;
      }
    }

    plan.agentContributions = null;
    if (agentCollaborationOrchestrator && typeof agentCollaborationOrchestrator.buildUnifiedContext === 'function') {
      try {
        plan.agentContributions = agentCollaborationOrchestrator.buildUnifiedContext({
          query: query,
          topic: topic,
          intent: intent,
          mode: mode,
          plan: plan,
          selectedArtifact: input && input.selectedArtifact
        });
      } catch (e) {
        plan.agentContributions = null;
      }
    }

    plan.generatedBlocks = [];
    if (generativeAugmenter && input.allowGenerative === true) {
      try {
        var augAnalogy = generativeAugmenter.generateAnalogy({
          topic: topic,
          conceptIds: conceptIds,
          artifactIds: plan.artifactIds,
          canonicalContent: (plan.sections && plan.sections[0] && plan.sections[0].content) || ''
        });
        if (augAnalogy && augAnalogy.block) {
          plan.generatedBlocks.push(augAnalogy.block);
        }
        var augExample = generativeAugmenter.generateExtraExample({
          topic: topic,
          conceptIds: conceptIds,
          artifactIds: plan.artifactIds,
          canonicalContent: (plan.sections && plan.sections[0] && plan.sections[0].content) || ''
        });
        if (augExample && augExample.block) {
          plan.generatedBlocks.push(augExample.block);
        }
        if (plan.visualizations && plan.visualizations.length > 0) {
          var augNarration = generativeAugmenter.generateVisualizationNarration({
            topic: topic,
            conceptIds: conceptIds,
            artifactIds: plan.artifactIds,
            canonicalContent: 'Visualization: ' + (plan.visualizations[0].title || plan.visualizations[0].id)
          });
          if (augNarration && augNarration.block) {
            plan.generatedBlocks.push(augNarration.block);
          }
        }
        if (plan.laboratories && plan.laboratories.length > 0) {
          var augLabHints = generativeAugmenter.generateLaboratoryHints({
            topic: topic,
            conceptIds: conceptIds,
            artifactIds: plan.artifactIds,
            canonicalContent: 'Laboratory: ' + (plan.laboratories[0].title || plan.laboratories[0].id)
          });
          if (augLabHints && augLabHints.block) {
            plan.generatedBlocks.push(augLabHints.block);
          }
        }
      } catch (e) {
        /* keep generatedBlocks empty on failure */
      }
    }

    plan.loadMetrics = null;
    if (cognitiveLoadOptimizer && typeof cognitiveLoadOptimizer.computeLoadMetrics === 'function') {
      try {
        plan.loadMetrics = cognitiveLoadOptimizer.computeLoadMetrics(plan);
      } catch (e) {
        plan.loadMetrics = null;
      }
    }

    plan.pacingPlan = null;
    if (instructionalPacingEngine && typeof instructionalPacingEngine.buildPacing === 'function') {
      try {
        plan.pacingPlan = instructionalPacingEngine.buildPacing(plan);
      } catch (e) {
        plan.pacingPlan = null;
      }
    }

    plan.composition = null;
    if (lessonComposer && typeof lessonComposer.composeLesson === 'function') {
      try {
        plan.composition = lessonComposer.composeLesson(plan);
      } catch (e) {
        plan.composition = null;
      }
    }

    plan.lessonOutline = null;
    if (lessonComposer && typeof lessonComposer.buildOutline === 'function') {
      try {
        plan.lessonOutline = lessonComposer.buildOutline(plan);
      } catch (e) {
        plan.lessonOutline = null;
      }
    }

    plan.readabilityMetrics = null;
    if (readabilityOptimizer && typeof readabilityOptimizer.validateReadability === 'function') {
      try {
        plan.readabilityMetrics = readabilityOptimizer.validateReadability(plan.composition);
      } catch (e) {
        plan.readabilityMetrics = null;
      }
    }

    plan.accessibilityAnnotations = null;
    if (accessibilityPolish && typeof accessibilityPolish.validateAccessibility === 'function') {
      try {
        plan.accessibilityAnnotations = accessibilityPolish.validateAccessibility(plan.composition);
      } catch (e) {
        plan.accessibilityAnnotations = null;
      }
    }

    plan.semanticWarnings = [];
    if (plan.missingPrerequisites.length > 0) {
      plan.semanticWarnings.push(plan.missingPrerequisites.length + ' missing prerequisite(s) detected.');
    }
    if (plan.dependencyChain.length > conceptIds.length) {
      plan.semanticWarnings.push('Dependency chain includes ' + plan.dependencyChain.length + ' transitive prerequisites.');
    }
    if (plan.insertedRecaps && plan.insertedRecaps.length > 0) {
      plan.semanticWarnings.push(plan.insertedRecaps.length + ' recap block(s) inserted.');
    }

    _lastPlan = plan;
    return plan;
  }

  function _layerIncluded(plan, layerId) {
    if (!plan || !Array.isArray(plan.layers)) return false;
    for (var i = 0; i < plan.layers.length; i++) {
      if (plan.layers[i].id === layerId) return true;
    }
    return false;
  }

  function _buildInvalidPlan(reason) {
    var plan = {
      id: 'plan-didactic-invalid',
      topic: '',
      intent: 'explain',
      mode: 'default',
      difficulty: 'standard',
      selectedPerspective: 'intuitive',
      layers: [],
      sections: [],
      evidence: [],
      warnings: [reason],
      omissions: [],
      graph: { valid: false, nodes: 0, edges: 0, errors: [reason], sorted: [] },
      generatedAt: null,
      invalid: true,
      conceptIds: [],
      artifactIds: [],
      dependencyChain: [],
      missingPrerequisites: [],
      insertedRecaps: [],
      recapsCount: 0,
      selectedExamples: [],
      selectedResources: { artifacts: [], concepts: [], visualizations: [], laboratories: [], sharedKnowledge: [], warnings: [] },
      crossDomainConnections: [],
      semanticWarnings: [],
      mediaPlan: null,
      visualizations: [],
      laboratories: [],
      mediaTimeline: [],
      transitionMap: [],
      densityMetrics: {},
      evidenceTree: null,
      evidenceBlocks: [],
      memoryContext: null,
      reviewContext: null,
      semanticContext: null,
      agentContributions: null,
      generatedBlocks: [],
      loadMetrics: null,
      pacingPlan: null,
      lessonOutline: null,
      composition: null,
      readabilityMetrics: null,
      accessibilityAnnotations: null
    };
    _lastPlan = plan;
    return plan;
  }

  function validatePlan(plan) {
    if (!plan || typeof plan !== 'object') {
      return { valid: false, errors: ['Plan is not an object'] };
    }

    var errors = [];

    if (!plan.id || typeof plan.id !== 'string') {
      errors.push('Plan missing valid id');
    }
    if (!plan.topic || typeof plan.topic !== 'string') {
      errors.push('Plan missing valid topic');
    }
    if (!plan.intent) {
      errors.push('Plan missing intent');
    }
    if (!plan.difficulty) {
      errors.push('Plan missing difficulty');
    }
    if (!plan.selectedPerspective) {
      errors.push('Plan missing selectedPerspective');
    }
    if (!Array.isArray(plan.layers)) {
      errors.push('Plan layers must be an array');
    } else {
      var seen = Object.create(null);
      for (var i = 0; i < plan.layers.length; i++) {
        var l = plan.layers[i];
        if (!l.id) {
          errors.push('Layer at index ' + i + ' missing id');
        } else if (seen[l.id]) {
          errors.push('Duplicate layer: ' + l.id);
        } else {
          seen[l.id] = true;
        }
      }
    }
    if (!Array.isArray(plan.sections)) {
      errors.push('Plan sections must be an array');
    }
    if (!Array.isArray(plan.omissions)) {
      errors.push('Plan omissions must be an array');
    }
    if (!Array.isArray(plan.evidence)) {
      errors.push('Plan evidence must be an array');
    }
    if (!Array.isArray(plan.warnings)) {
      errors.push('Plan warnings must be an array');
    }
    if (plan.generatedAt !== null && plan.generatedAt !== undefined) {
      errors.push('Plan generatedAt must be null (deterministic requirement)');
    }
    if (plan.graph && !plan.graph.valid) {
      errors.push('Plan composition graph is invalid: ' + (plan.graph.errors || []).join('; '));
    }

    if (!Array.isArray(plan.dependencyChain)) {
      errors.push('Plan dependencyChain must be an array');
    }
    if (!Array.isArray(plan.missingPrerequisites)) {
      errors.push('Plan missingPrerequisites must be an array');
    }
    if (!Array.isArray(plan.insertedRecaps)) {
      errors.push('Plan insertedRecaps must be an array');
    }
    if (!Array.isArray(plan.selectedExamples)) {
      errors.push('Plan selectedExamples must be an array');
    }
    if (!plan.selectedResources || typeof plan.selectedResources !== 'object') {
      errors.push('Plan selectedResources must be an object');
    }
    if (!Array.isArray(plan.crossDomainConnections)) {
      errors.push('Plan crossDomainConnections must be an array');
    }
    if (!Array.isArray(plan.semanticWarnings)) {
      errors.push('Plan semanticWarnings must be an array');
    }

    if (!Array.isArray(plan.visualizations)) {
      errors.push('Plan visualizations must be an array');
    }
    if (!Array.isArray(plan.laboratories)) {
      errors.push('Plan laboratories must be an array');
    }
    if (!Array.isArray(plan.mediaTimeline)) {
      errors.push('Plan mediaTimeline must be an array');
    }
    if (!Array.isArray(plan.transitionMap)) {
      errors.push('Plan transitionMap must be an array');
    }
    if (!plan.densityMetrics || typeof plan.densityMetrics !== 'object') {
      errors.push('Plan densityMetrics must be an object');
    }

    if (plan.evidenceTree !== null && typeof plan.evidenceTree !== 'object') {
      errors.push('Plan evidenceTree must be null or object');
    }
    if (plan.evidenceBlocks !== undefined && !Array.isArray(plan.evidenceBlocks)) {
      errors.push('Plan evidenceBlocks must be an array');
    }
    if (plan.memoryContext !== null && typeof plan.memoryContext !== 'object') {
      errors.push('Plan memoryContext must be null or object');
    }
    if (plan.reviewContext !== null && typeof plan.reviewContext !== 'object') {
      errors.push('Plan reviewContext must be null or object');
    }
    if (plan.semanticContext !== null && typeof plan.semanticContext !== 'object') {
      errors.push('Plan semanticContext must be null or object');
    }
    if (plan.agentContributions !== null && typeof plan.agentContributions !== 'object') {
      errors.push('Plan agentContributions must be null or object');
    }
    if (!Array.isArray(plan.generatedBlocks)) {
      errors.push('Plan generatedBlocks must be an array');
    }

    return { valid: errors.length === 0, errors: errors };
  }

  function explainPlan(plan) {
    if (!plan || typeof plan !== 'object') return 'No plan to explain.';

    var lines = [];
    lines.push('Instructional Plan: ' + plan.id);
    lines.push('Topic: ' + plan.topic);
    lines.push('Difficulty: ' + plan.difficulty);
    lines.push('Perspective: ' + plan.selectedPerspective);
    lines.push('Intent: ' + plan.intent);
    lines.push('');

    lines.push('Included Layers (' + (plan.layers ? plan.layers.length : 0) + '):');
    if (plan.layers) {
      for (var i = 0; i < plan.layers.length; i++) {
        lines.push('  ' + (i + 1) + '. ' + plan.layers[i].label + ' — ' + plan.layers[i].purpose);
      }
    }

    lines.push('');
    lines.push('Omitted Layers (' + (plan.omissions ? plan.omissions.length : 0) + '):');
    if (plan.omissions) {
      for (var j = 0; j < plan.omissions.length; j++) {
        lines.push('  - ' + plan.omissions[j].layerId + ': ' + plan.omissions[j].reason);
      }
    }

    if (plan.warnings && plan.warnings.length > 0) {
      lines.push('');
      lines.push('Warnings:');
      for (var k = 0; k < plan.warnings.length; k++) {
        lines.push('  - ' + plan.warnings[k]);
      }
    }

    lines.push('');
    lines.push('Graph: ' + (plan.graph && plan.graph.valid ? 'Valid' : 'Invalid'));
    lines.push('Evidence entries: ' + (plan.evidence ? plan.evidence.length : 0));

    if (plan.dependencyChain && plan.dependencyChain.length > 0) {
      lines.push('');
      lines.push('Dependency Chain (' + plan.dependencyChain.length + ' entries):');
      for (var d = 0; d < plan.dependencyChain.length && d < 10; d++) {
        lines.push('  - ' + plan.dependencyChain[d].name + ' (depth ' + plan.dependencyChain[d].depth + ', ' + plan.dependencyChain[d].type + ')');
      }
    }

    if (plan.missingPrerequisites && plan.missingPrerequisites.length > 0) {
      lines.push('');
      lines.push('Missing Prerequisites (' + plan.missingPrerequisites.length + '):');
      for (var mp = 0; mp < plan.missingPrerequisites.length; mp++) {
        lines.push('  - ' + plan.missingPrerequisites[mp].name + ' (required by ' + plan.missingPrerequisites[mp].requiredBy + ')');
      }
    }

    if (plan.insertedRecaps && plan.insertedRecaps.length > 0) {
      lines.push('');
      lines.push('Inserted Recaps (' + plan.insertedRecaps.length + '):');
      for (var r = 0; r < plan.insertedRecaps.length; r++) {
        lines.push('  - ' + plan.insertedRecaps[r].label + ': ' + plan.insertedRecaps[r].prereqName + ' → ' + plan.insertedRecaps[r].childName);
      }
    }

    if (plan.selectedExamples && plan.selectedExamples.length > 0) {
      lines.push('');
      lines.push('Selected Examples (' + plan.selectedExamples.length + '):');
      for (var e = 0; e < plan.selectedExamples.length; e++) {
        lines.push('  - ' + plan.selectedExamples[e].example.title + ' (score: ' + plan.selectedExamples[e].score + ')');
      }
    }

    if (plan.crossDomainConnections && plan.crossDomainConnections.length > 0) {
      lines.push('');
      lines.push('Cross-Domain Connections (' + plan.crossDomainConnections.length + '):');
      for (var cc = 0; cc < plan.crossDomainConnections.length; cc++) {
        lines.push('  - ' + plan.crossDomainConnections[cc].sourceConcept + ' → ' + plan.crossDomainConnections[cc].targetConcept + ' (' + plan.crossDomainConnections[cc].relationshipType + ')');
      }
    }

    if (plan.visualizations && plan.visualizations.length > 0) {
      lines.push('');
      lines.push('Visualizations (' + plan.visualizations.length + '):');
      for (var vi = 0; vi < plan.visualizations.length; vi++) {
        lines.push('  - ' + (plan.visualizations[vi].title || plan.visualizations[vi].id) + ' (score: ' + (plan.visualizations[vi].score || 0) + ')');
      }
    }

    if (plan.laboratories && plan.laboratories.length > 0) {
      lines.push('');
      lines.push('Laboratory (' + plan.laboratories.length + '):');
      for (var li = 0; li < plan.laboratories.length; li++) {
        lines.push('  - ' + (plan.laboratories[li].title || plan.laboratories[li].id) + ' (role: ' + (plan.laboratories[li].role || 'none') + ', score: ' + (plan.laboratories[li].score || 0) + ')');
      }
    }

    if (plan.mediaTimeline && plan.mediaTimeline.length > 0) {
      lines.push('');
      lines.push('Media Timeline (' + plan.mediaTimeline.length + ' entries):');
      for (var mt = 0; mt < plan.mediaTimeline.length; mt++) {
        var entry = plan.mediaTimeline[mt];
        var mediaLabel = entry.mediaType !== 'none' ? ' [' + entry.mediaType + ': ' + (entry.mediaTitle || entry.mediaId) + ']' : '';
        lines.push('  ' + (mt + 1) + '. ' + entry.sectionLabel + mediaLabel);
      }
    }

    if (plan.densityMetrics && plan.densityMetrics.totalSections > 0) {
      lines.push('');
      lines.push('Density: ' + plan.densityMetrics.mediaSections + '/' + plan.densityMetrics.totalSections + ' media sections (ratio: ' + plan.densityMetrics.densityRatio + ', balanced: ' + plan.densityMetrics.balanced + ')');
    }

    if (plan.evidenceTree) {
      lines.push('');
      lines.push('D1D Evidence: ' + plan.evidenceTree.totalBlocks + ' blocks (' + plan.evidenceTree.canonicalCount + ' canonical, ' + plan.evidenceTree.nonCanonicalCount + ' non-canonical)');
    }
    if (plan.memoryContext && plan.memoryContext.counts) {
      lines.push('D1D Memory: ' + plan.memoryContext.counts.bookmarks + ' bookmarks, ' + plan.memoryContext.counts.notes + ' notes, ' + plan.memoryContext.counts.pinned + ' pinned');
    }
    if (plan.reviewContext && plan.reviewContext.counts) {
      lines.push('D1D Review: ' + plan.reviewContext.counts.due + ' due, ' + plan.reviewContext.counts.history + ' in history, ' + plan.reviewContext.counts.completedLabs + ' labs completed');
    }
    if (plan.semanticContext && plan.semanticContext.counts) {
      lines.push('D1D Semantic: ' + plan.semanticContext.counts.prerequisites + ' prerequisites, ' + plan.semanticContext.counts.recommendations + ' recommendations');
    }
    if (plan.agentContributions && plan.agentContributions.summary) {
      var sum = plan.agentContributions.summary;
      lines.push('D1D Agent Contributions: ' + JSON.stringify(sum));
    }
    if (plan.generatedBlocks && plan.generatedBlocks.length > 0) {
      lines.push('D1D Generated Blocks: ' + plan.generatedBlocks.length + ' (all NonCanonical)');
    }

    return lines.join('\n');
  }

  function getLastPlan() {
    return _lastPlan;
  }

  return {
    buildPlan: buildPlan,
    validatePlan: validatePlan,
    explainPlan: explainPlan,
    getLastPlan: getLastPlan
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createPedagogicalPlanner = createPedagogicalPlanner;
}

export { createPedagogicalPlanner };
