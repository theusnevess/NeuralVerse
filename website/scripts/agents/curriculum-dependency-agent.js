/**
 * NV-1000-A2 / NV-1300-D3A — Curriculum & Dependency Agent
 *
 * Canonical curriculum intelligence layer.
 * Interprets the NV-800 curriculum graph for prerequisite analysis,
 * dependency traversal, sequencing, learning path recommendations,
 * readiness explanations, and navigation assistance.
 *
 * D3A adds structural validation via:
 * - Curriculum Structure Guardian
 * - Dependency Graph Validator
 * - Typed Dependency Engine
 * - Concept Prerequisite Engine
 *
 * Strictly read-only over existing curriculum data.
 * Never invents relationships or modifies curriculum.
 *
 * 10 Educational Modes:
 * 1. Dependency Explanation
 * 2. Next Learning Recommendation
 * 3. Prerequisite Inspection
 * 4. Dependency Chain Visualization
 * 5. Curriculum Context
 * 6. Skip Impact Analysis
 * 7. Learning Route Generation
 * 8. Neighbor Discovery
 * 9. Cross-Link Explanation
 * 10. Curriculum Summary
 */

const INTENT_PATTERNS = {
  dependency: ['prerequisite', 'dependency', 'depends on', 'before this', 'need to know', 'required prior', 'chain'],
  next: ['next', 'what comes after', 'what should i study next', 'follow up', 'continuation', 'proceed'],
  previous: ['previous', 'before', 'what came before', 'prior lesson', 'back to'],
  skip: ['skip', 'can i skip', 'skip this', 'bypass', 'is this necessary', 'mandatory', 'optional'],
  summary: ['summarize', 'summary', 'overview', 'what is this about', 'scope', 'purpose', 'role'],
  context: ['where am i', 'position', 'current location', 'curriculum context', 'where am i in'],
  route: ['route', 'path', 'shortest path', 'full path', 'learning route', 'sequence', 'order'],
  neighbor: ['neighbor', 'nearby', 'sibling', 'related lessons', 'adjacent', 'surrounding'],
  crosslink: ['cross-link', 'cross link', 'related concept', 'connected to', 'linked', 'relationship between'],
  hierarchy: ['parent', 'hierarchy', 'module structure', 'lesson structure', 'containment', 'belongs to']
};

const RECOMMENDATION_SOURCE_PREFIX = 'Recommendation Source:\nCanonical Learning Path →\nModule →\nLesson →\nArtifact hierarchy';

function createCurriculumDependencyAgent() {
  let indexCache = null;
  let lookupMaps = null;
  let initializationPromise = null;

  const ARTIFACT_ORDER = [
    'Explanatory Text',
    'Visual Intuition',
    'Interactive Visualization',
    'Exercise',
    'Comparison Table'
  ];

  // D3A Modules - Lazy initialization
  let structureGuardian = null;
  let dependencyGraphValidator = null;
  let typedDependencyEngine = null;
  let conceptPrerequisiteEngine = null;

  // D3B Modules - Lazy initialization
  let goalInterpreter = null;
  let justificationEngine = null;
  let depthEngine = null;
  let priorityEngine = null;
  let narrativeBuilder = null;
  let explanationComposer = null;

  // D3C Modules - Lazy initialization
  let progressionEngine = null;
  let redundancyEngine = null;
  let coverageVerifier = null;
  let unlockMapGenerator = null;
  let healthAnalyzer = null;
  let reportComposer = null;

  // D3D Modules - Lazy initialization
  let unifiedReportComposer = null;
  let capabilityMatrix = null;
  let certificationRunner = null;
  let agentFacade = null;

  function ensureD3AModules() {
    if (structureGuardian && dependencyGraphValidator && typedDependencyEngine && conceptPrerequisiteEngine) {
      return;
    }

    if (typeof window !== 'undefined' && window.NeuralVerse) {
      structureGuardian = window.NeuralVerse.curriculumStructureGuardian ||
        (typeof createCurriculumStructureGuardian === 'function' ? createCurriculumStructureGuardian() : null);
      dependencyGraphValidator = window.NeuralVerse.dependencyGraphValidator ||
        (typeof createDependencyGraphValidator === 'function' ? createDependencyGraphValidator() : null);
      typedDependencyEngine = window.NeuralVerse.typedDependencyEngine ||
        (typeof createTypedDependencyEngine === 'function' ? createTypedDependencyEngine() : null);
      conceptPrerequisiteEngine = window.NeuralVerse.conceptPrerequisiteEngine ||
        (typeof createConceptPrerequisiteEngine === 'function' ? createConceptPrerequisiteEngine() : null);
    }
  }

  function ensureD3BModules() {
    if (goalInterpreter && justificationEngine && depthEngine && priorityEngine && narrativeBuilder && explanationComposer) {
      return;
    }

    if (typeof window !== 'undefined' && window.NeuralVerse) {
      goalInterpreter = window.NeuralVerse.goalDependencyInterpreter ||
        (typeof createGoalDependencyInterpreter === 'function' ? createGoalDependencyInterpreter() : null);
      justificationEngine = window.NeuralVerse.dependencyJustificationEngine ||
        (typeof createDependencyJustificationEngine === 'function' ? createDependencyJustificationEngine() : null);
      depthEngine = window.NeuralVerse.prerequisiteDepthEngine ||
        (typeof createPrerequisiteDepthEngine === 'function' ? createPrerequisiteDepthEngine() : null);
      priorityEngine = window.NeuralVerse.goalPriorityEngine ||
        (typeof createGoalPriorityEngine === 'function' ? createGoalPriorityEngine() : null);
      narrativeBuilder = window.NeuralVerse.dependencyNarrativeBuilder ||
        (typeof createDependencyNarrativeBuilder === 'function' ? createDependencyNarrativeBuilder() : null);
      explanationComposer = window.NeuralVerse.curriculumExplanationComposer ||
        (typeof createCurriculumExplanationComposer === 'function' ? createCurriculumExplanationComposer() : null);
    }
  }

  function ensureD3CModules() {
    if (progressionEngine && redundancyEngine && coverageVerifier && unlockMapGenerator && healthAnalyzer && reportComposer) {
      return;
    }

    if (typeof window !== 'undefined' && window.NeuralVerse) {
      progressionEngine = window.NeuralVerse.progressionContinuityEngine ||
        (typeof createProgressionContinuityEngine === 'function' ? createProgressionContinuityEngine() : null);
      redundancyEngine = window.NeuralVerse.redundancyDetectionEngine ||
        (typeof createRedundancyDetectionEngine === 'function' ? createRedundancyDetectionEngine() : null);
      coverageVerifier = window.NeuralVerse.competencyCoverageVerifier ||
        (typeof createCompetencyCoverageVerifier === 'function' ? createCompetencyCoverageVerifier() : null);
      unlockMapGenerator = window.NeuralVerse.goalUnlockMapGenerator ||
        (typeof createGoalUnlockMapGenerator === 'function' ? createGoalUnlockMapGenerator() : null);
      healthAnalyzer = window.NeuralVerse.curriculumHealthAnalyzer ||
        (typeof createCurriculumHealthAnalyzer === 'function' ? createCurriculumHealthAnalyzer() : null);
      reportComposer = window.NeuralVerse.curriculumProgressionReportComposer ||
        (typeof createCurriculumProgressionReportComposer === 'function' ? createCurriculumProgressionReportComposer() : null);
    }
  }

  function ensureD3DModules() {
    if (unifiedReportComposer && capabilityMatrix && certificationRunner && agentFacade) {
      return;
    }

    if (typeof window !== 'undefined' && window.NeuralVerse) {
      unifiedReportComposer = window.NeuralVerse.unifiedCurriculumReportComposer ||
        (typeof createUnifiedCurriculumReportComposer === 'function' ? createUnifiedCurriculumReportComposer() : null);
      capabilityMatrix = window.NeuralVerse.curriculumCapabilityMatrix ||
        (typeof createCurriculumCapabilityMatrix === 'function' ? createCurriculumCapabilityMatrix() : null);
      certificationRunner = window.NeuralVerse.curriculumCertificationRunner ||
        (typeof createCurriculumCertificationRunner === 'function' ? createCurriculumCertificationRunner() : null);
      agentFacade = window.NeuralVerse.curriculumAgentFacade ||
        (typeof createCurriculumAgentFacade === 'function' ? createCurriculumAgentFacade() : null);
    }
  }

  function initialize() {
    if (initializationPromise) return initializationPromise;
    initializationPromise = loadIndex();
    return initializationPromise;
  }

  async function loadIndex() {
    if (indexCache) return indexCache;
    try {
      const response = await fetch('data/curriculum-index.json');
      if (!response.ok) throw new Error(`Failed to load curriculum index: ${response.status}`);
      indexCache = await response.json();
      buildLookupMaps();
      return indexCache;
    } catch (error) {
      console.error('Curriculum Dependency Agent: Failed to load index', error);
      return null;
    }
  }

  function buildLookupMaps() {
    if (!indexCache || lookupMaps) return;

    const maps = {
      pathsById: new Map(),
      modulesById: new Map(),
      lessonsById: new Map(),
      artifactsById: new Map(),
      modulesByPathId: new Map(),
      lessonsByModuleId: new Map(),
      artifactsByLessonId: new Map(),
      pathByModuleId: new Map(),
      moduleByLessonId: new Map(),
      lessonByArtifactId: new Map(),
      siblingModules: new Map(),
      siblingLessons: new Map()
    };

    for (const path of indexCache.learningPaths || []) {
      maps.pathsById.set(path.id, path);
      const modules = [];
      for (const moduleId of path.moduleIds || []) {
        modules.push(moduleId);
        maps.pathByModuleId.set(moduleId, path.id);
      }
      maps.modulesByPathId.set(path.id, modules);

      for (let i = 0; i < modules.length; i++) {
        const siblings = [];
        if (i > 0) siblings.push({ id: modules[i - 1], direction: 'previous' });
        if (i < modules.length - 1) siblings.push({ id: modules[i + 1], direction: 'next' });
        maps.siblingModules.set(modules[i], siblings);
      }
    }

    for (const module of indexCache.modules || []) {
      maps.modulesById.set(module.id, module);
      const lessons = [];
      for (const lessonId of module.lessonIds || []) {
        lessons.push(lessonId);
        maps.moduleByLessonId.set(lessonId, module.id);
      }
      maps.lessonsByModuleId.set(module.id, lessons);

      for (let i = 0; i < lessons.length; i++) {
        const siblings = [];
        if (i > 0) siblings.push({ id: lessons[i - 1], direction: 'previous' });
        if (i < lessons.length - 1) siblings.push({ id: lessons[i + 1], direction: 'next' });
        maps.siblingLessons.set(lessons[i], siblings);
      }
    }

    for (const lesson of indexCache.lessons || []) {
      maps.lessonsById.set(lesson.id, lesson);
      const artifacts = [];
      for (const artifactId of lesson.artifactIds || []) {
        artifacts.push(artifactId);
        maps.lessonByArtifactId.set(artifactId, lesson.id);
      }
      maps.artifactsByLessonId.set(lesson.id, artifacts);
    }

    for (const artifact of indexCache.artifacts || []) {
      maps.artifactsById.set(artifact.id, artifact);
    }

    lookupMaps = maps;
  }

  function ensureReady() {
    if (!indexCache || !lookupMaps) {
      indexCache = null;
      lookupMaps = null;
      initializationPromise = null;
      return initialize();
    }
    return Promise.resolve(indexCache);
  }

  function canHandle(context) {
    if (!context) return false;
    const query = (context.userQuery || '').toLowerCase();
    return query.length > 0;
  }

  async function run(context, options = {}) {
    await ensureReady();

    const query = context.userQuery || '';
    const intent = detectIntent(query);

    const result = buildResponse(intent, query, context, options);
    return result;
  }

  function detectIntent(query) {
    const lower = (query || '').toLowerCase();

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (lower.includes(pattern)) {
          return intent;
        }
      }
    }

    if (lower.includes('what') || lower.includes('explain') || lower.includes('tell me')) {
      return 'summary';
    }

    return 'context';
  }

  function buildResponse(intent, query, context, options) {
    switch (intent) {
      case 'dependency':
        return buildDependencyExplanation(context, options);
      case 'next':
        return buildNextRecommendation(context, options);
      case 'previous':
        return buildPreviousRecommendation(context, options);
      case 'skip':
        return buildSkipAnalysis(context, options);
      case 'summary':
        return buildCurriculumSummary(context, options);
      case 'context':
        return buildCurriculumContext(context, options);
      case 'route':
        return buildLearningRoute(context, options);
      case 'neighbor':
        return buildNeighborDiscovery(context, options);
      case 'crosslink':
        return buildCrossLinkExplanation(context, options);
      case 'hierarchy':
        return buildHierarchyVisualization(context, options);
      default:
        return buildCurriculumContext(context, options);
    }
  }

  function buildDependencyExplanation(context, options) {
    const sections = [];
    const currentLesson = resolveCurrentLesson(context);
    const currentModule = resolveCurrentModule(context);
    const currentPath = resolveCurrentPath(context);

    if (!currentLesson && !currentModule) {
      sections.push({
        title: 'No Current Position',
        content: 'Navigate to a lesson or module in the curriculum to see dependency information.',
        type: 'text'
      });
      return buildResult('dependency', sections, context);
    }

    if (currentLesson) {
      const moduleId = lookupMaps?.moduleByLessonId.get(currentLesson.id);
      const module = lookupMaps?.modulesById.get(moduleId);
      const pathId = lookupMaps?.pathByModuleId.get(moduleId);
      const path = lookupMaps?.pathsById.get(pathId);

      const lessonIndex = (module?.lessonIds || []).indexOf(currentLesson.id);
      const previousLessons = (module?.lessonIds || []).slice(0, lessonIndex).map(id => lookupMaps?.lessonsById.get(id)).filter(Boolean);

      sections.push({
        title: 'Prerequisite Concept',
        content: previousLessons.length > 0
          ? previousLessons.map(l => `- **${l.title}** (${l.id})`).join('\n')
          : 'This is the first lesson in its module. No prerequisites within this module.',
        type: 'text'
      });

      sections.push({
        title: 'Dependency Rationale',
        content: previousLessons.length > 0
          ? `This lesson builds upon ${previousLessons.length} previous lesson${previousLessons.length > 1 ? 's' : ''} in **${module?.title || 'Unknown Module'}**. The canonical sequence places these lessons in order for progressive knowledge construction.`
          : `As the first lesson in **${module?.title || 'Unknown Module'}**, this has no intra-module dependencies. It may depend on concepts from earlier modules in **${path?.title || 'Unknown Path'}**.`,
        type: 'text'
      });

      sections.push({
        title: 'Expected Benefit',
        content: `Completing the prerequisites ensures you have the foundational context needed to engage with **${currentLesson.title}** effectively. The lesson's learning goals assume familiarity with preceding concepts.`,
        type: 'text'
      });

      sections.push({
        title: 'Consequences of Skipping',
        content: previousLessons.length > 0
          ? `Skipping ${previousLessons.length > 1 ? 'these lessons' : 'this lesson'} may leave gaps in your understanding. You might encounter unfamiliar terminology, miss conceptual connections, or struggle with exercises that assume prior knowledge.`
          : 'No intra-module consequences. However, ensure you have completed any earlier modules in this learning path.',
        type: 'text'
      });
    } else if (currentModule) {
      const pathId = lookupMaps?.pathByModuleId.get(currentModule.id);
      const path = lookupMaps?.pathsById.get(pathId);
      const moduleIndex = (path?.moduleIds || []).indexOf(currentModule.id);
      const previousModules = (path?.moduleIds || []).slice(0, moduleIndex).map(id => lookupMaps?.modulesById.get(id)).filter(Boolean);

      sections.push({
        title: 'Prerequisite Modules',
        content: previousModules.length > 0
          ? previousModules.map(m => `- **${m.title}** (${m.id})`).join('\n')
          : 'This is the first module in its learning path.',
        type: 'text'
      });

      sections.push({
        title: 'Dependency Rationale',
        content: previousModules.length > 0
          ? `This module follows ${previousModules.length} prerequisite module${previousModules.length > 1 ? 's' : ''} in **${path?.title || 'Unknown Path'}**. The learning path structures modules in a deliberate progression.`
          : 'As the first module in this learning path, it establishes foundational concepts.',
        type: 'text'
      });
    }

    return buildResult('dependency', sections, context);
  }

  function buildNextRecommendation(context, options) {
    const sections = [];
    const current = resolveCurrentPosition(context);

    if (!current) {
      sections.push({
        title: 'No Current Position',
        content: 'Navigate to a curriculum item to see next steps.',
        type: 'text'
      });
      return buildResult('next', sections, context);
    }

    if (current.artifact) {
      const lesson = lookupMaps?.lessonsById.get(
        lookupMaps?.lessonByArtifactId.get(current.artifact.id)
      );
      if (lesson) {
        const artifactIndex = (lesson.artifactIds || []).indexOf(current.artifact.id);
        const nextArtifactId = lesson.artifactIds?.[artifactIndex + 1];
        const nextArtifact = nextArtifactId ? lookupMaps?.artifactsById.get(nextArtifactId) : null;

        if (nextArtifact) {
          sections.push({
            title: 'Next Artifact',
            content: `- **${nextArtifact.title}** (${nextArtifact.type})\n- Estimated duration: ${nextArtifact.estimatedDuration || 'Unknown'}`,
            type: 'text'
          });
        } else {
          const moduleId = lookupMaps?.moduleByLessonId.get(lesson.id);
          const module = lookupMaps?.modulesById.get(moduleId);
          const lessonIndex = (module?.lessonIds || []).indexOf(lesson.id);
          const nextLessonId = module?.lessonIds?.[lessonIndex + 1];
          const nextLesson = nextLessonId ? lookupMaps?.lessonsById.get(nextLessonId) : null;

          if (nextLesson) {
            sections.push({
              title: 'Next Lesson',
              content: `- **${nextLesson.title}** (${nextLesson.id})\n- This completes the current lesson. Move to the next lesson in **${module?.title || 'Unknown Module'}**.`,
              type: 'text'
            });
          } else {
            const pathId = lookupMaps?.pathByModuleId.get(moduleId);
            const path = lookupMaps?.pathsById.get(pathId);
            const moduleIndex = (path?.moduleIds || []).indexOf(moduleId);
            const nextModuleId = path?.moduleIds?.[moduleIndex + 1];
            const nextModule = nextModuleId ? lookupMaps?.modulesById.get(nextModuleId) : null;

            if (nextModule) {
              sections.push({
                title: 'Next Module',
                content: `- **${nextModule.title}** (${nextModule.id})\n- You have completed all lessons in **${module?.title || 'Unknown Module'}**. Proceed to the next module.`,
                type: 'text'
              });
            } else {
              sections.push({
                title: 'Learning Path Complete',
                content: 'You have reached the end of this learning path. Consider exploring related paths or revisiting key concepts.',
                type: 'text'
              });
            }
          }
        }
      }
    } else if (current.lesson) {
      const module = lookupMaps?.modulesById.get(
        lookupMaps?.moduleByLessonId.get(current.lesson.id)
      );
      const lessonIndex = (module?.lessonIds || []).indexOf(current.lesson.id);
      const firstArtifactId = current.lesson.artifactIds?.[0];
      const firstArtifact = firstArtifactId ? lookupMaps?.artifactsById.get(firstArtifactId) : null;

      sections.push({
        title: 'Start This Lesson',
        content: firstArtifact
          ? `- Begin with **${firstArtifact.title}** (${firstArtifact.type})\n- This lesson has ${current.lesson.artifactIds?.length || 0} artifacts in canonical order`
          : `This lesson has ${current.lesson.artifactIds?.length || 0} artifacts.`,
        type: 'text'
      });
    } else if (current.module) {
      const firstLessonId = current.module.lessonIds?.[0];
      const firstLesson = firstLessonId ? lookupMaps?.lessonsById.get(firstLessonId) : null;

      sections.push({
        title: 'Start This Module',
        content: firstLesson
          ? `- Begin with **${firstLesson.title}** (${firstLesson.id})\n- This module has ${current.module.lessonIds?.length || 0} lessons`
          : `This module has ${current.module.lessonIds?.length || 0} lessons.`,
        type: 'text'
      });
    }

    sections.push({
      title: 'Recommendation Source',
      content: RECOMMENDATION_SOURCE_PREFIX,
      type: 'source'
    });

    return buildResult('next', sections, context);
  }

  function buildPreviousRecommendation(context, options) {
    const sections = [];
    const current = resolveCurrentPosition(context);

    if (!current) {
      sections.push({
        title: 'No Current Position',
        content: 'Navigate to a curriculum item to see previous steps.',
        type: 'text'
      });
      return buildResult('previous', sections, context);
    }

    if (current.artifact) {
      const lesson = lookupMaps?.lessonsById.get(
        lookupMaps?.lessonByArtifactId.get(current.artifact.id)
      );
      if (lesson) {
        const artifactIndex = (lesson.artifactIds || []).indexOf(current.artifact.id);
        const prevArtifactId = lesson.artifactIds?.[artifactIndex - 1];
        const prevArtifact = prevArtifactId ? lookupMaps?.artifactsById.get(prevArtifactId) : null;

        if (prevArtifact) {
          sections.push({
            title: 'Previous Artifact',
            content: `- **${prevArtifact.title}** (${prevArtifact.type})`,
            type: 'text'
          });
        } else {
          sections.push({
            title: 'Start of Lesson',
            content: 'This is the first artifact in this lesson.',
            type: 'text'
          });
        }
      }
    } else if (current.lesson) {
      const module = lookupMaps?.modulesById.get(
        lookupMaps?.moduleByLessonId.get(current.lesson.id)
      );
      const lessonIndex = (module?.lessonIds || []).indexOf(current.lesson.id);
      const prevLessonId = module?.lessonIds?.[lessonIndex - 1];
      const prevLesson = prevLessonId ? lookupMaps?.lessonsById.get(prevLessonId) : null;

      sections.push({
        title: 'Previous Lesson',
        content: prevLesson
          ? `- **${prevLesson.title}** (${prevLesson.id})`
          : 'This is the first lesson in its module.',
        type: 'text'
      });
    }

    return buildResult('previous', sections, context);
  }

  function buildSkipAnalysis(context, options) {
    const sections = [];
    const current = resolveCurrentPosition(context);

    if (!current) {
      sections.push({
        title: 'No Current Position',
        content: 'Navigate to a curriculum item to analyze skip impact.',
        type: 'text'
      });
      return buildResult('skip', sections, context);
    }

    const target = current.lesson || current.module;
    if (!target) {
      sections.push({
        title: 'Skip Analysis',
        content: 'Select a lesson or module to analyze skip impact.',
        type: 'text'
      });
      return buildResult('skip', sections, context);
    }

    const isLesson = !!current.lesson;
    const targetTitle = target.title;
    const targetId = target.id;

    let missingIntuition = [];
    let conceptsAffected = [];
    let downstreamImpacted = [];

    if (isLesson) {
      const module = lookupMaps?.modulesById.get(
        lookupMaps?.moduleByLessonId.get(target.id)
      );
      const lessonIndex = (module?.lessonIds || []).indexOf(target.id);

      const artifactTypes = (target.artifactIds || []).map(aid => {
        const a = lookupMaps?.artifactsById.get(aid);
        return a?.type || 'Unknown';
      });

      missingIntuition = artifactTypes;

      const downstream = (module?.lessonIds || []).slice(lessonIndex + 1).map(lid => lookupMaps?.lessonsById.get(lid)).filter(Boolean);
      downstreamImpacted = downstream.map(l => l.title);

      const pathId = lookupMaps?.pathByModuleId.get(module?.id);
      const path = lookupMaps?.pathsById.get(pathId);
      const moduleIndex = (path?.moduleIds || []).indexOf(module?.id);
      const downstreamModules = (path?.moduleIds || []).slice(moduleIndex + 1).map(mid => lookupMaps?.modulesById.get(mid)).filter(Boolean);
      conceptsAffected = downstreamModules.slice(0, 3).map(m => m.title);
    }

    sections.push({
      title: 'Likely Missing Intuition',
      content: missingIntuition.length > 0
        ? missingIntuition.map(t => `- ${t}`).join('\n')
        : 'No specific intuition gaps identified from curriculum data.',
      type: 'text'
    });

    sections.push({
      title: 'Concepts Affected',
      content: conceptsAffected.length > 0
        ? conceptsAffected.map(c => `- ${c}`).join('\n')
        : 'No downstream concepts identified as directly affected.',
      type: 'text'
    });

    sections.push({
      title: 'Downstream Lessons Impacted',
      content: downstreamImpacted.length > 0
        ? downstreamImpacted.map(l => `- ${l}`).join('\n')
        : 'No downstream lessons identified as impacted.',
      type: 'text'
    });

    sections.push({
      title: 'Recommendation',
      content: downstreamImpacted.length > 0
        ? `Skipping **${targetTitle}** may impact ${downstreamImpacted.length} downstream lesson${downstreamImpacted.length > 1 ? 's' : ''}. Consider whether the concepts covered are already familiar to you. If not, completing this lesson will strengthen your foundation.`
        : `No downstream impact detected from curriculum data. You may skip **${targetTitle}** if you are confident in the concepts it covers.`,
      type: 'text'
    });

    sections.push({
      title: 'Note',
      content: 'This analysis is based on canonical curriculum hierarchy only. Actual conceptual dependencies may exist beyond what the curriculum structure captures.',
      type: 'text'
    });

    return buildResult('skip', sections, context);
  }

  function buildCurriculumSummary(context, options) {
    const sections = [];
    const current = resolveCurrentPosition(context);

    if (!current) {
      const index = indexCache;
      if (index) {
        sections.push({
          title: 'Curriculum Overview',
          content: [
            `- **${index.counts?.learningPaths || 0}** Learning Paths`,
            `- **${index.counts?.modules || 0}** Modules`,
            `- **${index.counts?.lessons || 0}** Lessons`,
            `- **${index.counts?.artifacts || 0}** Artifacts`
          ].join('\n'),
          type: 'text'
        });
      }
      return buildResult('summary', sections, context);
    }

    if (current.artifact) {
      sections.push({
        title: 'Artifact Role',
        content: `- **Title:** ${current.artifact.title}\n- **Type:** ${current.artifact.type}\n- **Family:** ${current.artifact.family}\n- **Duration:** ${current.artifact.estimatedDuration || 'Unknown'}\n- **Objectives:** ${(current.artifact.instructionalObjectives || []).join(', ') || 'None specified'}`,
        type: 'text'
      });
    }

    if (current.lesson) {
      sections.push({
        title: 'Lesson Purpose',
        content: `- **Title:** ${current.lesson.title}\n- **Artifacts:** ${(current.lesson.artifactIds || []).length}\n- **Overview:** ${current.lesson.overview || 'No overview available'}\n- **Learning Goal:** ${current.lesson.learningGoal || 'No learning goal specified'}`,
        type: 'text'
      });
    }

    if (current.module) {
      const lessonCount = current.module.lessonIds?.length || 0;
      sections.push({
        title: 'Module Scope',
        content: `- **Title:** ${current.module.title}\n- **Type:** ${current.module.type}\n- **Lessons:** ${lessonCount}\n- **Overview:** ${current.module.overview || 'No overview available'}\n- **Aim:** ${current.module.aim || 'No aim specified'}`,
        type: 'text'
      });
    }

    if (current.path) {
      const moduleCount = current.path.moduleIds?.length || 0;
      sections.push({
        title: 'Learning Path',
        content: `- **Title:** ${current.path.title}\n- **Type:** ${current.path.type}\n- **Modules:** ${moduleCount}\n- **Overview:** ${current.path.overview || 'No overview available'}\n- **Aim:** ${current.path.aim || 'No aim specified'}`,
        type: 'text'
      });
    }

    if (current.path && current.module) {
      const pathId = current.path.id;
      const moduleIndex = (current.path.moduleIds || []).indexOf(current.module.id);
      const totalModules = current.path.moduleIds?.length || 0;
      sections.push({
        title: 'Placement in Progression',
        content: `Module **${current.module.title}** is ${moduleIndex + 1} of ${totalModules} in **${current.path.title}**.`,
        type: 'text'
      });
    }

    return buildResult('summary', sections, context);
  }

  function buildCurriculumContext(context, options) {
    const sections = [];
    const current = resolveCurrentPosition(context);

    if (current.path) {
      sections.push({
        title: 'Current Learning Path',
        content: `- **${current.path.title}** (${current.path.id})\n- Type: ${current.path.type}\n- Modules: ${(current.path.moduleIds || []).length}`,
        type: 'hierarchy'
      });
    }

    if (current.module) {
      const pathId = lookupMaps?.pathByModuleId.get(current.module.id);
      const path = lookupMaps?.pathsById.get(pathId);
      const moduleIndex = (path?.moduleIds || []).indexOf(current.module.id);

      sections.push({
        title: 'Current Module',
        content: `- **${current.module.title}** (${current.module.id})\n- Position: ${moduleIndex + 1} of ${(path?.moduleIds || []).length} in ${path?.title || 'Unknown'}\n- Lessons: ${(current.module.lessonIds || []).length}`,
        type: 'hierarchy'
      });
    }

    if (current.lesson) {
      const moduleId = lookupMaps?.moduleByLessonId.get(current.lesson.id);
      const module = lookupMaps?.modulesById.get(moduleId);
      const lessonIndex = (module?.lessonIds || []).indexOf(current.lesson.id);
      const totalLessons = module?.lessonIds?.length || 0;

      sections.push({
        title: 'Current Lesson',
        content: `- **${current.lesson.title}** (${current.lesson.id})\n- Position: ${lessonIndex + 1} of ${totalLessons} in ${module?.title || 'Unknown'}\n- Artifacts: ${(current.lesson.artifactIds || []).length}`,
        type: 'hierarchy'
      });
    }

    if (current.artifact) {
      const lessonId = lookupMaps?.lessonByArtifactId.get(current.artifact.id);
      const lesson = lookupMaps?.lessonsById.get(lessonId);
      const artifactIndex = (lesson?.artifactIds || []).indexOf(current.artifact.id);

      sections.push({
        title: 'Current Artifact',
        content: `- **${current.artifact.title}** (${current.artifact.id})\n- Type: ${current.artifact.type}\n- Position: ${artifactIndex + 1} of ${(lesson?.artifactIds || []).length} in ${lesson?.title || 'Unknown'}`,
        type: 'hierarchy'
      });
    }

    if (current.lesson && current.module) {
      const module = current.module;
      const lessonIndex = (module.lessonIds || []).indexOf(current.lesson.id);
      const siblingLessons = (module.lessonIds || [])
        .filter((_, i) => i !== lessonIndex)
        .map(lid => lookupMaps?.lessonsById.get(lid))
        .filter(Boolean);

      if (siblingLessons.length > 0) {
        sections.push({
          title: 'Sibling Lessons',
          content: siblingLessons.map(l => `- **${l.title}** (${l.id})`).join('\n'),
          type: 'text'
        });
      }

      const remaining = (module.lessonIds || []).slice(lessonIndex + 1).map(lid => lookupMaps?.lessonsById.get(lid)).filter(Boolean);
      if (remaining.length > 0) {
        sections.push({
          title: 'Remaining Lessons',
          content: remaining.map(l => `- **${l.title}** (${l.id})`).join('\n'),
          type: 'text'
        });
      }
    }

    if (current.module && current.path) {
      const path = current.path;
      const moduleIndex = (path.moduleIds || []).indexOf(current.module.id);
      const relatedModules = (path.moduleIds || [])
        .filter((_, i) => i !== moduleIndex)
        .map(mid => lookupMaps?.modulesById.get(mid))
        .filter(Boolean);

      if (relatedModules.length > 0) {
        sections.push({
          title: 'Related Modules',
          content: relatedModules.map(m => `- **${m.title}** (${m.id})`).join('\n'),
          type: 'text'
        });
      }
    }

    return buildResult('context', sections, context);
  }

  function buildLearningRoute(context, options) {
    const sections = [];
    const routeType = options.routeType || 'full';
    const current = resolveCurrentPosition(context);

    if (!current.path) {
      sections.push({
        title: 'No Learning Path',
        content: 'Navigate to a learning path to generate routes.',
        type: 'text'
      });
      return buildResult('route', sections, context);
    }

    const path = current.path;
    const routeLines = [];

    routeLines.push(`**${path.title}** (${path.type})`);

    for (const moduleId of path.moduleIds || []) {
      const module = lookupMaps?.modulesById.get(moduleId);
      if (!module) continue;

      const isCurrentModule = current.module?.id === moduleId;
      const moduleMarker = isCurrentModule ? ' ← you are here' : '';
      routeLines.push(`  ${isCurrentModule ? '▶' : '·'} **${module.title}**${moduleMarker}`);

      if (routeType === 'full' || isCurrentModule) {
        for (const lessonId of module.lessonIds || []) {
          const lesson = lookupMaps?.lessonsById.get(lessonId);
          if (!lesson) continue;

          const isCurrentLesson = current.lesson?.id === lessonId;
          const lessonMarker = isCurrentLesson ? ' ← you are here' : '';
          routeLines.push(`      ${isCurrentLesson ? '▶' : '·'} ${lesson.title}${lessonMarker}`);

          if (isCurrentLesson && current.artifact) {
            for (const artifactId of lesson.artifactIds || []) {
              const artifact = lookupMaps?.artifactsById.get(artifactId);
              if (!artifact) continue;
              const isCurrentArtifact = current.artifact?.id === artifactId;
              routeLines.push(`          ${isCurrentArtifact ? '▶' : '·'} ${artifact.title} (${artifact.type})`);
            }
          }
        }
      }
    }

    sections.push({
      title: `Learning Route (${routeType})`,
      content: routeLines.join('\n'),
      type: 'tree'
    });

    sections.push({
      title: 'Route Type Description',
      content: routeType === 'shortest'
        ? 'Shortest route: Shows only the direct path from your current position to the next unvisited concept.'
        : routeType === 'reinforcement'
        ? 'Reinforcement route: Includes review stops at key concepts along the way.'
        : 'Full route: Complete canonical path through all modules and lessons.',
      type: 'text'
    });

    sections.push({
      title: 'Recommendation Source',
      content: RECOMMENDATION_SOURCE_PREFIX,
      type: 'source'
    });

    return buildResult('route', sections, context);
  }

  function buildNeighborDiscovery(context, options) {
    const sections = [];
    const current = resolveCurrentPosition(context);

    if (current.artifact) {
      const lessonId = lookupMaps?.lessonByArtifactId.get(current.artifact.id);
      const lesson = lookupMaps?.lessonsById.get(lessonId);
      if (lesson) {
        const artifactIndex = (lesson.artifactIds || []).indexOf(current.artifact.id);
        const prev = artifactIndex > 0 ? lookupMaps?.artifactsById.get(lesson.artifactIds[artifactIndex - 1]) : null;
        const next = artifactIndex < (lesson.artifactIds || []).length - 1 ? lookupMaps?.artifactsById.get(lesson.artifactIds[artifactIndex + 1]) : null;

        sections.push({
          title: 'Artifact Neighbors',
          content: [
            prev ? `- **Previous:** ${prev.title} (${prev.type})` : '- **Previous:** None (first artifact)',
            next ? `- **Next:** ${next.title} (${next.type})` : '- **Next:** None (last artifact)'
          ].join('\n'),
          type: 'text'
        });
      }
    }

    if (current.lesson) {
      const moduleId = lookupMaps?.moduleByLessonId.get(current.lesson.id);
      const module = lookupMaps?.modulesById.get(moduleId);
      if (module) {
        const lessonIndex = (module.lessonIds || []).indexOf(current.lesson.id);
        const prevLesson = lessonIndex > 0 ? lookupMaps?.lessonsById.get(module.lessonIds[lessonIndex - 1]) : null;
        const nextLesson = lessonIndex < (module.lessonIds || []).length - 1 ? lookupMaps?.lessonsById.get(module.lessonIds[lessonIndex + 1]) : null;

        sections.push({
          title: 'Lesson Neighbors',
          content: [
            prevLesson ? `- **Previous:** ${prevLesson.title}` : '- **Previous:** None (first lesson)',
            nextLesson ? `- **Next:** ${nextLesson.title}` : '- **Next:** None (last lesson)'
          ].join('\n'),
          type: 'text'
        });

        const siblings = (module.lessonIds || [])
          .filter((_, i) => i !== lessonIndex)
          .map(lid => lookupMaps?.lessonsById.get(lid))
          .filter(Boolean);

        sections.push({
          title: 'Sibling Lessons',
          content: siblings.map(l => `- **${l.title}** (${l.id})`).join('\n') || 'No siblings.',
          type: 'text'
        });

        sections.push({
          title: 'Parent Module',
          content: `- **${module.title}** (${module.id})`,
          type: 'hierarchy'
        });
      }
    }

    if (current.module) {
      const pathId = lookupMaps?.pathByModuleId.get(current.module.id);
      const path = lookupMaps?.pathsById.get(pathId);
      if (path) {
        const moduleIndex = (path.moduleIds || []).indexOf(current.module.id);
        const prevModule = moduleIndex > 0 ? lookupMaps?.modulesById.get(path.moduleIds[moduleIndex - 1]) : null;
        const nextModule = moduleIndex < (path.moduleIds || []).length - 1 ? lookupMaps?.modulesById.get(path.moduleIds[moduleIndex + 1]) : null;

        sections.push({
          title: 'Module Neighbors',
          content: [
            prevModule ? `- **Previous:** ${prevModule.title}` : '- **Previous:** None (first module)',
            nextModule ? `- **Next:** ${nextModule.title}` : '- **Next:** None (last module)'
          ].join('\n'),
          type: 'text'
        });

        sections.push({
          title: 'Parent Learning Path',
          content: `- **${path.title}** (${path.id})`,
          type: 'hierarchy'
        });
      }
    }

    return buildResult('neighbor', sections, context);
  }

  function buildCrossLinkExplanation(context, options) {
    const sections = [];
    const current = resolveCurrentPosition(context);

    sections.push({
      title: 'Cross-Link Analysis',
      content: current
        ? `Current position: **${current.lesson?.title || current.module?.title || current.path?.title || 'Unknown'}**\n\nCross-links in NeuralVerse connect concepts across different learning paths and modules. These relationships are defined in the curriculum and help learners see connections between topics.`
        : 'Navigate to a curriculum item to analyze cross-links.',
      type: 'text'
    });

    if (current.module) {
      const pathId = lookupMaps?.pathByModuleId.get(current.module.id);
      const path = lookupMaps?.pathsById.get(pathId);
      const allPaths = Array.from(lookupMaps?.pathsById?.values() || []);
      const otherPaths = allPaths.filter(p => p.id !== pathId);

      if (otherPaths.length > 0) {
        const relatedPaths = otherPaths.slice(0, 5);
        sections.push({
          title: 'Related Learning Paths',
          content: relatedPaths.map(p => `- **${p.title}** (${p.type})`).join('\n'),
          type: 'text'
        });
      }
    }

    sections.push({
      title: 'Note',
      content: 'Cross-links are established by the curriculum authors. This analysis shows structural proximity within the curriculum hierarchy. Semantic cross-links may exist beyond what the hierarchy captures.',
      type: 'text'
    });

    return buildResult('crosslink', sections, context);
  }

  function buildHierarchyVisualization(context, options) {
    const sections = [];
    const current = resolveCurrentPosition(context);

    if (!current.path) {
      sections.push({
        title: 'No Position',
        content: 'Navigate to the curriculum to see hierarchy.',
        type: 'text'
      });
      return buildResult('hierarchy', sections, context);
    }

    const lines = [];

    lines.push(`Learning Path: ${current.path.title}`);
    lines.push('  ↓');

    for (const moduleId of current.path.moduleIds || []) {
      const module = lookupMaps?.modulesById.get(moduleId);
      if (!module) continue;

      const isCurrent = current.module?.id === moduleId;
      lines.push(`  Module: ${module.title}${isCurrent ? ' ←' : ''}`);

      if (isCurrent || options.expandAll) {
        for (const lessonId of module.lessonIds || []) {
          const lesson = lookupMaps?.lessonsById.get(lessonId);
          if (!lesson) continue;

          const isCurrentLesson = current.lesson?.id === lessonId;
          lines.push(`    Lesson: ${lesson.title}${isCurrentLesson ? ' ←' : ''}`);

          if (isCurrentLesson || options.expandAll) {
            for (const artifactId of lesson.artifactIds || []) {
              const artifact = lookupMaps?.artifactsById.get(artifactId);
              if (!artifact) continue;
              const isCurrentArtifact = current.artifact?.id === artifactId;
              lines.push(`      Artifact: ${artifact.title} (${artifact.type})${isCurrentArtifact ? ' ←' : ''}`);
            }
          }
        }
      }
    }

    sections.push({
      title: 'Curriculum Hierarchy',
      content: lines.join('\n'),
      type: 'tree'
    });

    return buildResult('hierarchy', sections, context);
  }

  function resolveCurrentPosition(context) {
    return {
      path: resolveCurrentPath(context),
      module: resolveCurrentModule(context),
      lesson: resolveCurrentLesson(context),
      artifact: resolveCurrentArtifact(context)
    };
  }

  function resolveCurrentPath(context) {
    if (context.selectedPath?.id) {
      return lookupMaps?.pathsById.get(context.selectedPath.id) || null;
    }
    return null;
  }

  function resolveCurrentModule(context) {
    if (context.selectedModule?.id) {
      return lookupMaps?.modulesById.get(context.selectedModule.id) || null;
    }
    return null;
  }

  function resolveCurrentLesson(context) {
    if (context.selectedLesson?.id) {
      return lookupMaps?.lessonsById.get(context.selectedLesson.id) || null;
    }
    return null;
  }

  function resolveCurrentArtifact(context) {
    if (context.selectedArtifact?.id) {
      return lookupMaps?.artifactsById.get(context.selectedArtifact.id) || null;
    }
    return null;
  }

  function buildResult(mode, sections, context) {
    const topic = resolveTopic(context);
    return {
      agentId: 'curriculum-dependency',
      agentName: 'Curriculum & Dependency Agent',
      mode,
      topic,
      sections: sections.filter(Boolean),
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: null
    };
  }

  function resolveTopic(context) {
    if (context.selectedArtifact?.title) return context.selectedArtifact.title;
    if (context.selectedLesson?.title) return context.selectedLesson.title;
    if (context.selectedModule?.title) return context.selectedModule.title;
    if (context.selectedPath?.title) return context.selectedPath.title;
    return 'curriculum';
  }

  // Public API for Didactic Architecture Agent integration

  function getPrerequisites(lessonId) {
    if (!lookupMaps) return [];
    const moduleId = lookupMaps.moduleByLessonId.get(lessonId);
    const module = lookupMaps.modulesById.get(moduleId);
    if (!module) return [];

    const lessonIndex = (module.lessonIds || []).indexOf(lessonId);
    return (module.lessonIds || [])
      .slice(0, lessonIndex)
      .map(id => lookupMaps.lessonsById.get(id))
      .filter(Boolean);
  }

  function getNeighbors(lessonId) {
    if (!lookupMaps) return { previous: null, next: null, siblings: [] };
    const moduleId = lookupMaps.moduleByLessonId.get(lessonId);
    const module = lookupMaps.modulesById.get(moduleId);
    if (!module) return { previous: null, next: null, siblings: [] };

    const lessonIndex = (module.lessonIds || []).indexOf(lessonId);
    const previous = lessonIndex > 0 ? lookupMaps.lessonsById.get(module.lessonIds[lessonIndex - 1]) : null;
    const next = lessonIndex < (module.lessonIds || []).length - 1 ? lookupMaps.lessonsById.get(module.lessonIds[lessonIndex + 1]) : null;
    const siblings = (module.lessonIds || [])
      .filter((_, i) => i !== lessonIndex)
      .map(id => lookupMaps.lessonsById.get(id))
      .filter(Boolean);

    return { previous, next, siblings };
  }

  function getDependencyExplanation(lessonId) {
    if (!lookupMaps) return null;
    const lesson = lookupMaps.lessonsById.get(lessonId);
    if (!lesson) return null;

    const moduleId = lookupMaps.moduleByLessonId.get(lessonId);
    const module = lookupMaps.modulesById.get(moduleId);
    const pathId = lookupMaps.pathByModuleId.get(moduleId);
    const path = lookupMaps.pathsById.get(pathId);

    const lessonIndex = (module?.lessonIds || []).indexOf(lessonId);
    const prerequisites = (module?.lessonIds || [])
      .slice(0, lessonIndex)
      .map(id => lookupMaps.lessonsById.get(id))
      .filter(Boolean);

    return {
      lesson: lesson.title,
      module: module?.title || 'Unknown',
      path: path?.title || 'Unknown',
      prerequisites: prerequisites.map(p => p.title),
      rationale: prerequisites.length > 0
        ? `This lesson follows ${prerequisites.length} prerequisite(s) in ${module?.title}.`
        : 'First lesson in module.',
    };
  }

  function generateRoute(pathId, options = {}) {
    if (!lookupMaps) return null;
    const path = lookupMaps.pathsById.get(pathId);
    if (!path) return null;

    const route = [];
    for (const moduleId of path.moduleIds || []) {
      const module = lookupMaps.modulesById.get(moduleId);
      if (!module) continue;

      route.push({ type: 'module', id: module.id, title: module.title });

      for (const lessonId of module.lessonIds || []) {
        const lesson = lookupMaps.lessonsById.get(lessonId);
        if (!lesson) continue;
        route.push({ type: 'lesson', id: lesson.id, title: lesson.title, moduleId: module.id });
      }
    }
    return route;
  }

  function getCurriculumContext(context) {
    const position = resolveCurrentPosition(context);
    return {
      path: position.path ? { id: position.path.id, title: position.path.title, moduleCount: (position.path.moduleIds || []).length } : null,
      module: position.module ? { id: position.module.id, title: position.module.title, lessonCount: (position.module.lessonIds || []).length } : null,
      lesson: position.lesson ? { id: position.lesson.id, title: position.lesson.title, artifactCount: (position.lesson.artifactIds || []).length } : null,
      artifact: position.artifact ? { id: position.artifact.id, title: position.artifact.title, type: position.artifact.type } : null
    };
  }

  function getIndexStats() {
    if (!indexCache) return null;
    return {
      learningPaths: indexCache.counts?.learningPaths || 0,
      modules: indexCache.counts?.modules || 0,
      lessons: indexCache.counts?.lessons || 0,
      artifacts: indexCache.counts?.artifacts || 0,
      generatedAt: indexCache.generatedAt
    };
  }

  function getAvailableIntents() {
    return Object.keys(INTENT_PATTERNS);
  }

  // D3A Methods
  function getStructureGuardian() {
    ensureD3AModules();
    return structureGuardian;
  }

  function getDependencyGraphValidator() {
    ensureD3AModules();
    return dependencyGraphValidator;
  }

  function getTypedDependencyEngine() {
    ensureD3AModules();
    return typedDependencyEngine;
  }

  function getConceptPrerequisiteEngine() {
    ensureD3AModules();
    return conceptPrerequisiteEngine;
  }

  function validateCurriculumStructure() {
    ensureD3AModules();
    if (!structureGuardian || !indexCache) {
      return { valid: false, error: 'Guardian not available or curriculum not loaded' };
    }
    return structureGuardian.validateStructure(indexCache);
  }

  function validateDependencyGraph(graph) {
    ensureD3AModules();
    if (!dependencyGraphValidator) {
      return { valid: false, error: 'Dependency graph validator not available' };
    }
    return dependencyGraphValidator.validateGraph(graph);
  }

  function validateConceptPrerequisites() {
    ensureD3AModules();
    if (!conceptPrerequisiteEngine) {
      return { valid: false, error: 'Concept prerequisite engine not available' };
    }
    const concepts = indexCache?.concepts || [];
    return conceptPrerequisiteEngine.validateConceptPrerequisites(concepts);
  }

  function getStructureSummary() {
    ensureD3AModules();
    if (!structureGuardian || !indexCache) {
      return null;
    }
    return structureGuardian.summarizeStructure(indexCache);
  }

  // D3B Methods
  function getGoalInterpreter() {
    ensureD3BModules();
    return goalInterpreter;
  }

  function getJustificationEngine() {
    ensureD3BModules();
    return justificationEngine;
  }

  function getDepthEngine() {
    ensureD3BModules();
    return depthEngine;
  }

  function getPriorityEngine() {
    ensureD3BModules();
    return priorityEngine;
  }

  function getNarrativeBuilder() {
    ensureD3BModules();
    return narrativeBuilder;
  }

  function getExplanationComposer() {
    ensureD3BModules();
    return explanationComposer;
  }

  function interpretGoal(goal) {
    ensureD3BModules();
    if (!goalInterpreter || !indexCache) {
      return { valid: false, error: 'Goal interpreter not available or curriculum not loaded' };
    }
    return goalInterpreter.interpretGoal(goal, indexCache);
  }

  function explainDependencyJustification(source, target) {
    ensureD3BModules();
    if (!justificationEngine) {
      return { valid: false, error: 'Justification engine not available' };
    }
    return justificationEngine.explainDependency(source, target, null, indexCache);
  }

  function composeCurriculumExplanation(goal, context = {}) {
    ensureD3BModules();
    if (!explanationComposer) {
      return { valid: false, error: 'Explanation composer not available' };
    }
    return explanationComposer.composeExplanation(goal, context);
  }

  // D3C Methods
  function getProgressionContinuityEngine() {
    ensureD3CModules();
    return progressionEngine;
  }

  function getRedundancyDetectionEngine() {
    ensureD3CModules();
    return redundancyEngine;
  }

  function getCoverageVerifier() {
    ensureD3CModules();
    return coverageVerifier;
  }

  function getGoalUnlockMapGenerator() {
    ensureD3CModules();
    return unlockMapGenerator;
  }

  function getCurriculumHealthAnalyzer() {
    ensureD3CModules();
    return healthAnalyzer;
  }

  function getProgressionReportComposer() {
    ensureD3CModules();
    return reportComposer;
  }

  function validateProgression() {
    ensureD3CModules();
    if (!progressionEngine || !indexCache) {
      return { valid: false, error: 'Progression engine not available or curriculum not loaded' };
    }
    return progressionEngine.validateProgression(indexCache);
  }

  function detectRedundancy() {
    ensureD3CModules();
    if (!redundancyEngine || !indexCache) {
      return { valid: false, error: 'Redundancy engine not available or curriculum not loaded' };
    }
    return redundancyEngine.summarizeRedundancy(indexCache);
  }

  function analyzeCurriculumHealth() {
    ensureD3CModules();
    if (!healthAnalyzer || !indexCache) {
      return { valid: false, error: 'Health analyzer not available or curriculum not loaded' };
    }
    return healthAnalyzer.analyzeHealth(indexCache);
  }

  function generateUnlockMap(targetConcept) {
    ensureD3CModules();
    if (!unlockMapGenerator || !indexCache) {
      return { valid: false, error: 'Unlock map generator not available or curriculum not loaded' };
    }
    return unlockMapGenerator.generateUnlockMap(targetConcept, indexCache);
  }

  // D3D Methods
  function getUnifiedReportComposer() {
    ensureD3DModules();
    return unifiedReportComposer;
  }

  function getCapabilityMatrix() {
    ensureD3DModules();
    return capabilityMatrix;
  }

  function getCertificationRunner() {
    ensureD3DModules();
    return certificationRunner;
  }

  function getCurriculumAgentFacade() {
    ensureD3DModules();
    return agentFacade;
  }

  function composeUnifiedCurriculumReport(input) {
    ensureD3DModules();
    if (!unifiedReportComposer) {
      return { valid: false, error: 'Unified report composer not available' };
    }
    return unifiedReportComposer.composeUnifiedReport(input);
  }

  function runCurriculumCertification(input) {
    ensureD3DModules();
    if (!certificationRunner) {
      return { certified: false, error: 'Certification runner not available' };
    }
    return certificationRunner.runCertification(input);
  }

  function getD3CapabilityMatrix() {
    ensureD3DModules();
    if (!capabilityMatrix) {
      return { valid: false, error: 'Capability matrix not available' };
    }
    return capabilityMatrix.buildMatrix();
  }

  return {
    canHandle,
    run,
    initialize,
    getPrerequisites,
    getNeighbors,
    getDependencyExplanation,
    generateRoute,
    getCurriculumContext,
    getIndexStats,
    getAvailableIntents,
    INTENT_PATTERNS,
    // D3A getters
    getStructureGuardian,
    getDependencyGraphValidator,
    getTypedDependencyEngine,
    getConceptPrerequisiteEngine,
    validateCurriculumStructure,
    validateDependencyGraph,
    validateConceptPrerequisites,
    getStructureSummary,
    // D3B getters
    getGoalInterpreter,
    getJustificationEngine,
    getDepthEngine,
    getPriorityEngine,
    getNarrativeBuilder,
    getExplanationComposer,
    interpretGoal,
    explainDependencyJustification,
    composeCurriculumExplanation,
    // D3C getters
    getProgressionContinuityEngine,
    getRedundancyDetectionEngine,
    getCoverageVerifier,
    getGoalUnlockMapGenerator,
    getCurriculumHealthAnalyzer,
    getProgressionReportComposer,
    validateProgression,
    detectRedundancy,
    analyzeCurriculumHealth,
    generateUnlockMap,
    // D3D getters
    getUnifiedReportComposer,
    getCapabilityMatrix,
    getCertificationRunner,
    getCurriculumAgentFacade,
    composeUnifiedCurriculumReport,
    runCurriculumCertification,
    getD3CapabilityMatrix
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.curriculumDependencyAgent = createCurriculumDependencyAgent();
}

export { createCurriculumDependencyAgent };
