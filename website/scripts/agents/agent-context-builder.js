/**
 * NV-1000-A0 — Agent Context Builder
 *
 * Reads current frontend state and builds a structured context
 * that agents can use to understand the current learning environment.
 * Consumes existing frontend services only.
 */

function createAgentContextBuilder() {
  let curriculumIndex = window.NeuralVerse?.curriculumIndex || null;

  function setCurriculumIndex(index) {
    curriculumIndex = index && typeof index === 'object' ? index : null;
  }

  function getIndexCollection(name) {
    return Array.isArray(curriculumIndex?.[name]) ? curriculumIndex[name] : [];
  }

  function byId(collection, id) {
    return getIndexCollection(collection).find((item) => item.id === id) || null;
  }

  function cloneEntity(entity) {
    if (!entity) return null;
    const clone = { ...entity };
    if (Array.isArray(entity.instructionalObjectives)) clone.instructionalObjectives = [...entity.instructionalObjectives];
    if (Array.isArray(entity.learningDepths)) clone.learningDepths = [...entity.learningDepths];
    return clone;
  }

  function buildContext() {
    const context = {
      currentRoute: detectCurrentRoute(),
      routeParams: getRouteParams(),
      selectedPath: getSelectedLearningPath(),
      selectedModule: getSelectedModule(),
      selectedLesson: getSelectedLesson(),
      selectedArtifact: getSelectedArtifact(),
      artifactType: detectArtifactType(),
      canonicalStatus: detectCanonicalStatus(),
      instructionalObjectives: getInstructionalObjectives(),
      learningDepth: detectLearningDepth(),
      userNotes: getUserNotes(),
      userBookmarks: getUserBookmarks(),
      studySession: getActiveStudySession(),
      recentlyVisited: getRecentlyVisited(),
      timestamp: new Date().toISOString(),
      summary: ''
    };

    context.summary = buildContextSummary(context);
    return context;
  }

  function detectCurrentRoute() {
    const hash = window.location.hash || '#/';
    return hash;
  }

  function getRouteParams() {
    if (window.navigationState) {
      return window.navigationState.getParams() || {};
    }
    return {};
  }

  function getSelectedLearningPath() {
    try {
      const hash = window.location.hash || '';
      const pathMatch = hash.match(/#\/learning\/([^/]+)/);
      if (pathMatch) {
        return cloneEntity(byId('learningPaths', decodeURIComponent(pathMatch[1]))) || { id: decodeURIComponent(pathMatch[1]) };
      }
    } catch (e) {
      // silent
    }
    return null;
  }

  function getSelectedModule() {
    try {
      const hash = window.location.hash || '';
      const moduleMatch = hash.match(/#\/(?:learning\/[^/]+\/)?(?:module\/|modules\/)([^/]+)/);
      if (moduleMatch) {
        return cloneEntity(byId('modules', decodeURIComponent(moduleMatch[1]))) || { id: decodeURIComponent(moduleMatch[1]) };
      }
    } catch (e) {
      // silent
    }
    return null;
  }

  function getSelectedLesson() {
    try {
      const hash = window.location.hash || '';
      const lessonMatch = hash.match(/#\/learning\/[^/]+\/module\/[^/]+\/lesson\/([^/]+)/);
      if (lessonMatch) {
        return cloneEntity(byId('lessons', decodeURIComponent(lessonMatch[1]))) || { id: decodeURIComponent(lessonMatch[1]) };
      }
    } catch (e) {
      // silent
    }
    return null;
  }

  function getSelectedArtifact() {
    try {
      const hash = window.location.hash || '';
      const artifactMatch = hash.match(/#\/learning\/[^/]+\/module\/[^/]+\/lesson\/[^/]+\/artifact\/([^/]+)/);
      if (artifactMatch) {
        return cloneEntity(byId('artifacts', decodeURIComponent(artifactMatch[1]))) || { id: decodeURIComponent(artifactMatch[1]) };
      }
    } catch (e) {
      // silent
    }
    return null;
  }

  function detectArtifactType() {
    const artifact = getSelectedArtifact();
    if (!artifact) return null;
    return artifact.type || 'learning-artifact';
  }

  function detectCanonicalStatus() {
    const artifact = getSelectedArtifact();
    const lesson = getSelectedLesson();
    const module = getSelectedModule();
    const path = getSelectedLearningPath();
    return artifact?.canonicalStatus || lesson?.canonicalStatus || module?.canonicalStatus || path?.canonicalStatus || 'unknown';
  }

  function getInstructionalObjectives() {
    const artifact = getSelectedArtifact();
    const lesson = getSelectedLesson();
    return artifact?.instructionalObjectives || lesson?.instructionalObjectives || [];
  }

  function detectLearningDepth() {
    const hash = window.location.hash || '';
    if (hash.includes('/artifact/')) return 'artifact';
    if (hash.includes('/lesson/')) return 'lesson';
    if (hash.includes('/module/') || hash.includes('/modules/')) return 'module';
    if (hash.includes('/learning/')) return 'path';
    return 'overview';
  }

  function getUserNotes() {
    try {
      if (window.NeuralVerse?.personalizationService) {
        return window.NeuralVerse.personalizationService.getNotes?.() || [];
      }
    } catch (e) {
      // silent
    }
    return [];
  }

  function getUserBookmarks() {
    try {
      if (window.NeuralVerse?.personalizationService) {
        return window.NeuralVerse.personalizationService.getBookmarks?.() || [];
      }
    } catch (e) {
      // silent
    }
    return [];
  }

  function getActiveStudySession() {
    try {
      if (window.NeuralVerse?.personalizationService) {
        return window.NeuralVerse.personalizationService.getActiveSession?.() || null;
      }
    } catch (e) {
      // silent
    }
    return null;
  }

  function getRecentlyVisited() {
    try {
      if (window.NeuralVerse?.personalizationService) {
        return window.NeuralVerse.personalizationService.getRecentlyVisited?.() || [];
      }
    } catch (e) {
      // silent
    }
    return [];
  }

  function buildContextSummary(context) {
    const parts = [];

    if (context.currentRoute) {
      parts.push(`Route: ${context.currentRoute}`);
    }
    if (context.selectedPath) {
      parts.push(`Path: ${context.selectedPath.title}`);
    }
    if (context.selectedModule) {
      parts.push(`Module: ${context.selectedModule.title}`);
    }
    if (context.selectedLesson) {
      parts.push(`Lesson: ${context.selectedLesson.title}`);
    }
    if (context.selectedArtifact) {
      parts.push(`Artifact: ${context.selectedArtifact.title}`);
    }
    if (context.learningDepth) {
      parts.push(`Depth: ${context.learningDepth}`);
    }

    return parts.join(' | ') || 'No curriculum context available.';
  }

  function getContextForAgent(agentId) {
    const baseContext = buildContext();
    baseContext.agentId = agentId;
    return baseContext;
  }

  return {
    buildContext,
    getContextForAgent,
    detectCurrentRoute,
    getRouteParams,
    getSelectedLearningPath,
    getSelectedModule,
    getSelectedLesson,
    getSelectedArtifact,
    detectLearningDepth,
    setCurriculumIndex
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.contextBuilder = createAgentContextBuilder();
}

export { createAgentContextBuilder };
