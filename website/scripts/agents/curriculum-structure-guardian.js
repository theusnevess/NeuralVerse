/**
 * NV-1300-D3A — Curriculum Structure Guardian
 *
 * Validates curriculum hierarchy integrity:
 * - learning path → module → lesson → artifact ownership
 * - orphan detection
 * - broken parent-child references
 * - unreachable node detection
 * - canonical ID presence
 * - scope aggregation consistency
 *
 * Read-only, deterministic, safe on missing/partial input.
 */

function createCurriculumStructureGuardian() {

  function getCapabilities() {
    return {
      name: 'CurriculumStructureGuardian',
      version: '1.0.0',
      methods: [
        'validateStructure',
        'validateOwnership',
        'getOrphans',
        'getBrokenReferences',
        'getReachabilityReport',
        'summarizeStructure'
      ]
    };
  }

  function validateStructure(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { valid: false, errors: ['Invalid curriculum input'], warnings: [], stats: {} };
    }

    const errors = [];
    const warnings = [];
    const stats = {
      learningPaths: 0,
      modules: 0,
      lessons: 0,
      artifacts: 0
    };

    const paths = curriculum.learningPaths || [];
    const modules = curriculum.modules || [];
    const lessons = curriculum.lessons || [];
    const artifacts = curriculum.artifacts || [];

    stats.learningPaths = paths.length;
    stats.modules = modules.length;
    stats.lessons = lessons.length;
    stats.artifacts = artifacts.length;

    const pathIds = new Set(paths.map(p => p.id).filter(Boolean));
    const moduleIds = new Set(modules.map(m => m.id).filter(Boolean));
    const lessonIds = new Set(lessons.map(l => l.id).filter(Boolean));
    const artifactIds = new Set(artifacts.map(a => a.id).filter(Boolean));

    for (const path of paths) {
      if (!path.id) {
        errors.push('Learning path missing id');
        continue;
      }
      if (!path.title) {
        warnings.push(`Path ${path.id} missing title`);
      }
      for (const moduleId of (path.moduleIds || [])) {
        if (!moduleIds.has(moduleId)) {
          errors.push(`Path ${path.id} references missing module ${moduleId}`);
        }
      }
    }

    for (const module of modules) {
      if (!module.id) {
        errors.push('Module missing id');
        continue;
      }
      if (!module.title) {
        warnings.push(`Module ${module.id} missing title`);
      }
      for (const lessonId of (module.lessonIds || [])) {
        if (!lessonIds.has(lessonId)) {
          errors.push(`Module ${module.id} references missing lesson ${lessonId}`);
        }
      }
    }

    for (const lesson of lessons) {
      if (!lesson.id) {
        errors.push('Lesson missing id');
        continue;
      }
      if (!lesson.title) {
        warnings.push(`Lesson ${lesson.id} missing title`);
      }
      for (const artifactId of (lesson.artifactIds || [])) {
        if (!artifactIds.has(artifactId)) {
          errors.push(`Lesson ${lesson.id} references missing artifact ${artifactId}`);
        }
      }
    }

    for (const artifact of artifacts) {
      if (!artifact.id) {
        errors.push('Artifact missing id');
        continue;
      }
      if (!artifact.title) {
        warnings.push(`Artifact ${artifact.id} missing title`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats
    };
  }

  function validateOwnership(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { valid: false, errors: ['Invalid curriculum input'], owned: {} };
    }

    const errors = [];
    const owned = {
      modulesByPath: new Map(),
      lessonsByModule: new Map(),
      artifactsByLesson: new Map()
    };

    const paths = curriculum.learningPaths || [];
    const modules = curriculum.modules || [];
    const lessons = curriculum.lessons || [];
    const artifacts = curriculum.artifacts || [];

    const moduleIds = new Set(modules.map(m => m.id).filter(Boolean));
    const lessonIds = new Set(lessons.map(l => l.id).filter(Boolean));
    const artifactIds = new Set(artifacts.map(a => a.id).filter(Boolean));

    for (const path of paths) {
      const pathModules = (path.moduleIds || []).filter(id => moduleIds.has(id));
      owned.modulesByPath.set(path.id, pathModules);
    }

    for (const module of modules) {
      const moduleLessons = (module.lessonIds || []).filter(id => lessonIds.has(id));
      owned.lessonsByModule.set(module.id, moduleLessons);
    }

    for (const lesson of lessons) {
      const lessonArtifacts = (lesson.artifactIds || []).filter(id => artifactIds.has(id));
      owned.artifactsByLesson.set(lesson.id, lessonArtifacts);
    }

    const referencedModules = new Set();
    for (const path of paths) {
      for (const moduleId of (path.moduleIds || [])) {
        if (referencedModules.has(moduleId)) {
          errors.push(`Module ${moduleId} referenced by multiple paths`);
        }
        referencedModules.add(moduleId);
      }
    }

    const referencedLessons = new Set();
    for (const module of modules) {
      for (const lessonId of (module.lessonIds || [])) {
        if (referencedLessons.has(lessonId)) {
          errors.push(`Lesson ${lessonId} referenced by multiple modules`);
        }
        referencedLessons.add(lessonId);
      }
    }

    const referencedArtifacts = new Set();
    for (const lesson of lessons) {
      for (const artifactId of (lesson.artifactIds || [])) {
        if (referencedArtifacts.has(artifactId)) {
          errors.push(`Artifact ${artifactId} referenced by multiple lessons`);
        }
        referencedArtifacts.add(artifactId);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      owned
    };
  }

  function getOrphans(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { orphanPaths: [], orphanModules: [], orphanLessons: [], orphanArtifacts: [] };
    }

    const paths = curriculum.learningPaths || [];
    const modules = curriculum.modules || [];
    const lessons = curriculum.lessons || [];
    const artifacts = curriculum.artifacts || [];

    const referencedModules = new Set();
    const referencedLessons = new Set();
    const referencedArtifacts = new Set();

    for (const path of paths) {
      for (const moduleId of (path.moduleIds || [])) {
        referencedModules.add(moduleId);
      }
    }

    for (const module of modules) {
      for (const lessonId of (module.lessonIds || [])) {
        referencedLessons.add(lessonId);
      }
    }

    for (const lesson of lessons) {
      for (const artifactId of (lesson.artifactIds || [])) {
        referencedArtifacts.add(artifactId);
      }
    }

    const orphanPaths = paths.filter(p => {
      const moduleCount = (p.moduleIds || []).filter(id => referencedModules.has(id)).length;
      return moduleCount === 0;
    }).map(p => ({ id: p.id, title: p.title }));

    const orphanModules = modules.filter(m => !referencedModules.has(m.id)).map(m => ({
      id: m.id,
      title: m.title
    }));

    const orphanLessons = lessons.filter(l => !referencedLessons.has(l.id)).map(l => ({
      id: l.id,
      title: l.title
    }));

    const orphanArtifacts = artifacts.filter(a => !referencedArtifacts.has(a.id)).map(a => ({
      id: a.id,
      title: a.title
    }));

    return {
      orphanPaths,
      orphanModules,
      orphanLessons,
      orphanArtifacts
    };
  }

  function getBrokenReferences(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { broken: [] };
    }

    const broken = [];
    const paths = curriculum.learningPaths || [];
    const modules = curriculum.modules || [];
    const lessons = curriculum.lessons || [];
    const artifacts = curriculum.artifacts || [];

    const moduleIds = new Set(modules.map(m => m.id).filter(Boolean));
    const lessonIds = new Set(lessons.map(l => l.id).filter(Boolean));
    const artifactIds = new Set(artifacts.map(a => a.id).filter(Boolean));

    for (const path of paths) {
      for (const moduleId of (path.moduleIds || [])) {
        if (!moduleIds.has(moduleId)) {
          broken.push({ source: path.id, sourceType: 'path', target: moduleId, targetType: 'module' });
        }
      }
    }

    for (const module of modules) {
      for (const lessonId of (module.lessonIds || [])) {
        if (!lessonIds.has(lessonId)) {
          broken.push({ source: module.id, sourceType: 'module', target: lessonId, targetType: 'lesson' });
        }
      }
    }

    for (const lesson of lessons) {
      for (const artifactId of (lesson.artifactIds || [])) {
        if (!artifactIds.has(artifactId)) {
          broken.push({ source: lesson.id, sourceType: 'lesson', target: artifactId, targetType: 'artifact' });
        }
      }
    }

    return { broken };
  }

  function getReachabilityReport(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { reachable: [], unreachable: [] };
    }

    const paths = curriculum.learningPaths || [];
    const modules = curriculum.modules || [];
    const lessons = curriculum.lessons || [];
    const artifacts = curriculum.artifacts || [];

    const reachable = new Set();
    const unreachable = [];

    for (const path of paths) {
      reachable.add(path.id);
      for (const moduleId of (path.moduleIds || [])) {
        reachable.add(moduleId);
      }
    }

    for (const module of modules) {
      if (!reachable.has(module.id)) {
        unreachable.push({ id: module.id, title: module.title, type: 'module' });
      }
      for (const lessonId of (module.lessonIds || [])) {
        reachable.add(lessonId);
      }
    }

    for (const lesson of lessons) {
      if (!reachable.has(lesson.id)) {
        unreachable.push({ id: lesson.id, title: lesson.title, type: 'lesson' });
      }
      for (const artifactId of (lesson.artifactIds || [])) {
        reachable.add(artifactId);
      }
    }

    for (const artifact of artifacts) {
      if (!reachable.has(artifact.id)) {
        unreachable.push({ id: artifact.id, title: artifact.title, type: 'artifact' });
      }
    }

    return {
      reachable: Array.from(reachable),
      unreachable
    };
  }

  function summarizeStructure(curriculum) {
    const structure = validateStructure(curriculum);
    const orphans = getOrphans(curriculum);
    const broken = getBrokenReferences(curriculum);
    const reachability = getReachabilityReport(curriculum);

    return {
      valid: structure.valid,
      stats: structure.stats,
      errors: structure.errors.length,
      warnings: structure.warnings.length,
      orphans: {
        paths: orphans.orphanPaths.length,
        modules: orphans.orphanModules.length,
        lessons: orphans.orphanLessons.length,
        artifacts: orphans.orphanArtifacts.length
      },
      brokenReferences: broken.broken.length,
      unreachable: reachability.unreachable.length,
      totalEntities: (structure.stats.learningPaths || 0) +
                     (structure.stats.modules || 0) +
                     (structure.stats.lessons || 0) +
                     (structure.stats.artifacts || 0)
    };
  }

  return {
    getCapabilities,
    validateStructure,
    validateOwnership,
    getOrphans,
    getBrokenReferences,
    getReachabilityReport,
    summarizeStructure
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.curriculumStructureGuardian = createCurriculumStructureGuardian();
}

export { createCurriculumStructureGuardian };
