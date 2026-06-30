/**
 * NV-1100-P2 — Curriculum Integrity Engine
 * Deterministic, read-only validation of curriculum structure.
 */

(function () {
  'use strict';

  const VALID_LIFECYCLE_VALUES = ['Draft', 'Reviewed'];
  const VALID_ARTIFACT_TYPES = ['Explanatory Text', 'Visual Intuition', 'Interactive Visualization', 'Exercise', 'Comparison Table'];

  const REQUIRED_PATH_FIELDS = ['id', 'slug', 'title', 'type', 'canonicalStatus', 'moduleIds', 'lessonScope', 'artifactScope'];
  const REQUIRED_MODULE_FIELDS = ['id', 'slug', 'title', 'type', 'canonicalStatus', 'lessonIds', 'artifactScope'];
  const REQUIRED_LESSON_FIELDS = ['id', 'slug', 'title', 'topic', 'canonicalStatus', 'artifactIds'];
  const REQUIRED_ARTIFACT_FIELDS = ['id', 'slug', 'title', 'family', 'type', 'canonicalStatus'];

  // --- Utility ---

  function unique(arr) {
    return [...new Set(arr)];
  }

  function countBy(arr, keyFn) {
    const map = {};
    for (const item of arr) {
      const k = keyFn(item);
      map[k] = (map[k] || 0) + 1;
    }
    return map;
  }

  // --- Validators ---

  function validateHierarchy(index) {
    const issues = [];
    const pathIds = new Set(index.learningPaths.map(p => p.id));
    const moduleIds = new Set(index.modules.map(m => m.id));
    const lessonIds = new Set(index.lessons.map(l => l.id));
    const artifactIds = new Set(index.artifacts.map(a => a.id));

    // Each path's moduleIds must reference existing modules
    for (const path of index.learningPaths) {
      if (!Array.isArray(path.moduleIds)) continue;
      for (const mid of path.moduleIds) {
        if (!moduleIds.has(mid)) {
          issues.push({ severity: 'critical', category: 'hierarchy', message: `Learning path "${path.id}" references nonexistent module "${mid}"` });
        }
      }
    }

    // Each module's lessonIds must reference existing lessons
    for (const mod of index.modules) {
      for (const lid of (mod.lessonIds || [])) {
        if (!lessonIds.has(lid)) {
          issues.push({ severity: 'critical', category: 'hierarchy', message: `Module "${mod.id}" references nonexistent lesson "${lid}"` });
        }
      }
    }

    // Each lesson's artifactIds must reference existing artifacts
    for (const lesson of index.lessons) {
      for (const aid of (lesson.artifactIds || [])) {
        if (!artifactIds.has(aid)) {
          issues.push({ severity: 'critical', category: 'hierarchy', message: `Lesson "${lesson.id}" references nonexistent artifact "${aid}"` });
        }
      }
    }

    // LessonScope in paths must match sum of module lessonIds
    for (const path of index.learningPaths) {
      const expectedLessons = new Set();
      for (const mid of (path.moduleIds || [])) {
        const mod = index.modules.find(m => m.id === mid);
        if (mod) {
          for (const lid of (mod.lessonIds || [])) expectedLessons.add(lid);
        }
      }
      const actualLessons = new Set(path.lessonScope || []);
      const missing = [...expectedLessons].filter(l => !actualLessons.has(l));
      const extra = [...actualLessons].filter(l => !expectedLessons.has(l));
      if (missing.length > 0) {
        issues.push({ severity: 'high', category: 'hierarchy', message: `Path "${path.id}" lessonScope is missing modules' lessons: ${missing.join(', ')}` });
      }
      if (extra.length > 0) {
        issues.push({ severity: 'high', category: 'hierarchy', message: `Path "${path.id}" lessonScope contains lessons not in its modules: ${extra.join(', ')}` });
      }
    }

    // ArtifactScope in paths must match sum of module artifactScopes
    for (const path of index.learningPaths) {
      const expectedArtifacts = new Set();
      for (const mid of (path.moduleIds || [])) {
        const mod = index.modules.find(m => m.id === mid);
        if (mod) {
          for (const aid of (mod.artifactScope || [])) expectedArtifacts.add(aid);
        }
      }
      const actualArtifacts = new Set(path.artifactScope || []);
      const missing = [...expectedArtifacts].filter(a => !actualArtifacts.has(a));
      const extra = [...actualArtifacts].filter(a => !expectedArtifacts.has(a));
      if (missing.length > 0) {
        issues.push({ severity: 'high', category: 'hierarchy', message: `Path "${path.id}" artifactScope is missing modules' artifacts: ${missing.length} missing` });
      }
      if (extra.length > 0) {
        issues.push({ severity: 'high', category: 'hierarchy', message: `Path "${path.id}" artifactScope has ${extra.length} artifacts not in its modules` });
      }
    }

    // ArtifactScope in modules must match sum of lesson artifactIds
    for (const mod of index.modules) {
      const expectedArtifacts = new Set();
      for (const lid of (mod.lessonIds || [])) {
        const lesson = index.lessons.find(l => l.id === lid);
        if (lesson) {
          for (const aid of (lesson.artifactIds || [])) expectedArtifacts.add(aid);
        }
      }
      const actualArtifacts = new Set(mod.artifactScope || []);
      const missing = [...expectedArtifacts].filter(a => !actualArtifacts.has(a));
      const extra = [...actualArtifacts].filter(a => !expectedArtifacts.has(a));
      if (missing.length > 0) {
        issues.push({ severity: 'high', category: 'hierarchy', message: `Module "${mod.id}" artifactScope is missing lessons' artifacts: ${missing.length} missing` });
      }
      if (extra.length > 0) {
        issues.push({ severity: 'high', category: 'hierarchy', message: `Module "${mod.id}" artifactScope has ${extra.length} artifacts not in its lessons` });
      }
    }

    return issues;
  }

  function validateIds(index) {
    const issues = [];

    function checkDuplicateIds(entities, label) {
      const seen = {};
      for (const e of entities) {
        if (!e.id || typeof e.id !== 'string') {
          issues.push({ severity: 'critical', category: 'ids', message: `Non-string or empty ID on ${label}: ${JSON.stringify(e.id)}` });
          continue;
        }
        if (seen[e.id]) {
          issues.push({ severity: 'critical', category: 'ids', message: `Duplicate ${label} ID: "${e.id}"` });
        }
        seen[e.id] = true;
      }
    }

    checkDuplicateIds(index.learningPaths, 'learning path');
    checkDuplicateIds(index.modules, 'module');
    checkDuplicateIds(index.lessons, 'lesson');
    checkDuplicateIds(index.artifacts, 'artifact');

    // Cross-type ID collisions
    const allIds = {};
    for (const p of index.learningPaths) allIds[p.id] = 'path';
    for (const m of index.modules) {
      if (allIds[m.id]) {
        issues.push({ severity: 'critical', category: 'ids', message: `Cross-type collision: "${m.id}" exists as both ${allIds[m.id]} and module` });
      }
      allIds[m.id] = 'module';
    }
    for (const l of index.lessons) {
      if (allIds[l.id]) {
        issues.push({ severity: 'critical', category: 'ids', message: `Cross-type collision: "${l.id}" exists as both ${allIds[l.id]} and lesson` });
      }
      allIds[l.id] = 'lesson';
    }
    for (const a of index.artifacts) {
      if (allIds[a.id]) {
        issues.push({ severity: 'critical', category: 'ids', message: `Cross-type collision: "${a.id}" exists as both ${allIds[a.id]} and artifact` });
      }
      allIds[a.id] = 'artifact';
    }

    return issues;
  }

  function validateDependencies(index) {
    const issues = [];
    const allArtifactIds = new Set(index.artifacts.map(a => a.id));
    const DEP_FIELDS = ['prerequisite', 'recommendedBefore', 'recommendedAfter', 'complementary', 'alternative'];
    const cycles = [];
    const selfDeps = [];
    const brokenDeps = [];
    const duplicateEdges = [];

    // Collect all dependency edges
    const edges = [];
    const adjacency = {};

    for (const artifact of index.artifacts) {
      const deps = artifact.dependencies || {};
      for (const field of DEP_FIELDS) {
        const targets = deps[field] || [];
        const targetList = Array.isArray(targets) ? targets : (targets ? [targets] : []);
        for (const target of targetList) {
          if (!target) continue;
          edges.push({ from: artifact.id, to: target, type: field });
          if (!adjacency[artifact.id]) adjacency[artifact.id] = [];
          adjacency[artifact.id].push({ to: target, type: field });
        }
      }
    }

    if (edges.length === 0) {
      return { issues: [], cycles: [], selfDeps: [], brokenDeps: [], duplicateEdges: [] };
    }

    // Check self-dependencies
    for (const edge of edges) {
      if (edge.from === edge.to) {
        selfDeps.push(edge);
        issues.push({ severity: 'critical', category: 'dependencies', message: `Self-dependency: "${edge.from}" ${edge.type} -> "${edge.to}"` });
      }
    }

    // Check broken references
    for (const edge of edges) {
      if (!allArtifactIds.has(edge.to)) {
        brokenDeps.push(edge);
        issues.push({ severity: 'critical', category: 'dependencies', message: `Broken reference: "${edge.from}" ${edge.type} -> nonexistent "${edge.to}"` });
      }
    }

    // Check duplicate edges
    const edgeKeys = {};
    for (const edge of edges) {
      const key = `${edge.from}::${edge.to}::${edge.type}`;
      if (edgeKeys[key]) {
        duplicateEdges.push(edge);
        issues.push({ severity: 'high', category: 'dependencies', message: `Duplicate edge: "${edge.from}" ${edge.type} -> "${edge.to}"` });
      }
      edgeKeys[key] = true;
    }

    // Cycle detection using DFS
    const visited = new Set();
    const inStack = new Set();
    const path = [];

    function dfs(node) {
      if (inStack.has(node)) {
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart).concat(node));
        }
        return;
      }
      if (visited.has(node)) return;
      visited.add(node);
      inStack.add(node);
      path.push(node);
      for (const neighbor of (adjacency[node] || [])) {
        dfs(neighbor.to);
      }
      path.pop();
      inStack.delete(node);
    }

    for (const node of Object.keys(adjacency)) {
      dfs(node);
    }

    for (const cycle of cycles) {
      issues.push({ severity: 'critical', category: 'dependencies', message: `Dependency cycle detected: ${cycle.join(' -> ')}` });
    }

    return { issues, cycles, selfDeps, brokenDeps, duplicateEdges };
  }

  function validateReachability(index) {
    const issues = [];
    const pathIds = new Set(index.learningPaths.map(p => p.id));
    const moduleIds = new Set(index.modules.map(m => m.id));
    const lessonIds = new Set(index.lessons.map(l => l.id));
    const artifactIds = new Set(index.artifacts.map(a => a.id));

    // Every module must be in at least one learning path
    const referencedModules = new Set(index.learningPaths.flatMap(p => p.moduleIds || []));
    for (const mid of moduleIds) {
      if (!referencedModules.has(mid)) {
        issues.push({ severity: 'critical', category: 'reachability', message: `Orphan module "${mid}" not referenced by any learning path` });
      }
    }

    // Every lesson must be in at least one module
    const referencedLessons = new Set(index.modules.flatMap(m => m.lessonIds || []));
    for (const lid of lessonIds) {
      if (!referencedLessons.has(lid)) {
        issues.push({ severity: 'critical', category: 'reachability', message: `Orphan lesson "${lid}" not referenced by any module` });
      }
    }

    // Every artifact must be in at least one lesson
    const referencedArtifacts = new Set(index.lessons.flatMap(l => l.artifactIds || []));
    for (const aid of artifactIds) {
      if (!referencedArtifacts.has(aid)) {
        issues.push({ severity: 'critical', category: 'reachability', message: `Orphan artifact "${aid}" not referenced by any lesson` });
      }
    }

    return issues;
  }

  function validateLifecycle(index) {
    const issues = [];

    function checkLifecycle(entities, label) {
      for (const e of entities) {
        if (!VALID_LIFECYCLE_VALUES.includes(e.canonicalStatus)) {
          issues.push({ severity: 'high', category: 'lifecycle', message: `Invalid lifecycle value "${e.canonicalStatus}" on ${label} "${e.id}"` });
        }
      }
    }

    checkLifecycle(index.learningPaths, 'learning path');
    checkLifecycle(index.modules, 'module');
    checkLifecycle(index.lessons, 'lesson');
    checkLifecycle(index.artifacts, 'artifact');

    return issues;
  }

  function validateMetadata(index) {
    const issues = [];

    function checkRequired(entities, label, fields) {
      for (const e of entities) {
        for (const field of fields) {
          const val = e[field];
          if (val === undefined || val === null || val === '') {
            issues.push({ severity: 'medium', category: 'metadata', message: `Missing required field "${field}" on ${label} "${e.id}"` });
          } else if (['id', 'slug', 'title', 'type', 'topic', 'family'].includes(field) && typeof val !== 'string') {
            issues.push({ severity: 'high', category: 'metadata', message: `Non-string value for field "${field}" on ${label} "${e.id}" (type: ${typeof val})` });
          }
        }
      }
    }

    checkRequired(index.learningPaths, 'learning path', REQUIRED_PATH_FIELDS);
    checkRequired(index.modules, 'module', REQUIRED_MODULE_FIELDS);
    checkRequired(index.lessons, 'lesson', REQUIRED_LESSON_FIELDS);
    checkRequired(index.artifacts, 'artifact', REQUIRED_ARTIFACT_FIELDS);

    // Warn on empty arrays
    for (const path of index.learningPaths) {
      if (!Array.isArray(path.moduleIds)) {
        issues.push({ severity: 'high', category: 'metadata', message: `Non-array moduleIds on learning path "${path.id}" (type: ${typeof path.moduleIds})` });
      } else if (path.moduleIds.length === 0) {
        issues.push({ severity: 'medium', category: 'metadata', message: `Empty moduleIds on learning path "${path.id}"` });
      }
    }
    for (const mod of index.modules) {
      if (!Array.isArray(mod.lessonIds)) {
        issues.push({ severity: 'high', category: 'metadata', message: `Non-array lessonIds on module "${mod.id}" (type: ${typeof mod.lessonIds})` });
      } else if (mod.lessonIds.length === 0) {
        issues.push({ severity: 'medium', category: 'metadata', message: `Empty lessonIds on module "${mod.id}"` });
      }
    }
    for (const lesson of index.lessons) {
      if (!Array.isArray(lesson.artifactIds)) {
        issues.push({ severity: 'high', category: 'metadata', message: `Non-array artifactIds on lesson "${lesson.id}" (type: ${typeof lesson.artifactIds})` });
      } else if (lesson.artifactIds.length === 0) {
        issues.push({ severity: 'medium', category: 'metadata', message: `Empty artifactIds on lesson "${lesson.id}"` });
      }
    }

    // Check artifact types
    for (const art of index.artifacts) {
      if (art.type && typeof art.type === 'string' && !VALID_ARTIFACT_TYPES.includes(art.type)) {
        issues.push({ severity: 'medium', category: 'metadata', message: `Invalid artifact type "${art.type}" on artifact "${art.id}"` });
      }
    }

    return issues;
  }

  function generateStatistics(index) {
    const pathCount = index.learningPaths.length;
    const moduleCount = index.modules.length;
    const lessonCount = index.lessons.length;
    const artifactCount = index.artifacts.length;

    const reviewedPaths = index.learningPaths.filter(p => p.canonicalStatus === 'Reviewed').length;
    const reviewedModules = index.modules.filter(m => m.canonicalStatus === 'Reviewed').length;
    const reviewedLessons = index.lessons.filter(l => l.canonicalStatus === 'Reviewed').length;
    const reviewedArtifacts = index.artifacts.filter(a => a.canonicalStatus === 'Reviewed').length;

    const avgLessonsPerModule = moduleCount > 0 ? (lessonCount / moduleCount).toFixed(1) : '0';
    const avgArtifactsPerLesson = lessonCount > 0 ? (artifactCount / lessonCount).toFixed(1) : '0';

    // Count dependency edges
    let dependencyEdgeCount = 0;
    for (const artifact of index.artifacts) {
      const deps = artifact.dependencies || {};
      for (const field of ['prerequisite', 'recommendedBefore', 'recommendedAfter', 'complementary', 'alternative']) {
        const val = deps[field];
        if (Array.isArray(val)) dependencyEdgeCount += val.length;
        else if (val) dependencyEdgeCount += 1;
      }
    }

    // Maximum hierarchy depth (always 4: path -> module -> lesson -> artifact)
    const maxDepth = 4;

    return {
      learningPaths: pathCount,
      modules: moduleCount,
      lessons: lessonCount,
      artifacts: artifactCount,
      reviewedPaths,
      reviewedModules,
      reviewedLessons,
      reviewedArtifacts,
      draftPaths: pathCount - reviewedPaths,
      draftModules: moduleCount - reviewedModules,
      draftLessons: lessonCount - reviewedLessons,
      draftArtifacts: artifactCount - reviewedArtifacts,
      dependencyEdges: dependencyEdgeCount,
      avgLessonsPerModule,
      avgArtifactsPerLesson,
      maxHierarchyDepth: maxDepth
    };
  }

  function validateAll(index) {
    const startTime = Date.now();
    const allIssues = [];

    const hierarchyIssues = validateHierarchy(index);
    const idIssues = validateIds(index);
    const depResult = validateDependencies(index);
    const reachabilityIssues = validateReachability(index);
    const lifecycleIssues = validateLifecycle(index);
    const metadataIssues = validateMetadata(index);

    allIssues.push(...hierarchyIssues, ...idIssues, ...depResult.issues,
      ...reachabilityIssues, ...lifecycleIssues, ...metadataIssues);

    const stats = generateStatistics(index);
    const elapsed = Date.now() - startTime;

    const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
    const highCount = allIssues.filter(i => i.severity === 'high').length;
    const mediumCount = allIssues.filter(i => i.severity === 'medium').length;
    const lowCount = allIssues.filter(i => i.severity === 'low').length;

    return {
      statistics: stats,
      issues: allIssues,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      totalIssues: allIssues.length,
      cycles: depResult.cycles,
      selfDeps: depResult.selfDeps,
      brokenDeps: depResult.brokenDeps,
      duplicateEdges: depResult.duplicateEdges,
      elapsed,
      certification: criticalCount === 0 && highCount === 0 ? 'PASS' : 'FAIL'
    };
  }

  function generateMarkdownReport(result, index) {
    const lines = [];
    lines.push('# NV-1100-P2 — Curriculum Integrity Report');
    lines.push('');
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push(`**Validation time:** ${result.elapsed}ms`);
    lines.push(`**Certification:** ${result.certification === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push(`| Metric | Value |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Learning Paths | ${result.statistics.learningPaths} |`);
    lines.push(`| Modules | ${result.statistics.modules} |`);
    lines.push(`| Lessons | ${result.statistics.lessons} |`);
    lines.push(`| Artifacts | ${result.statistics.artifacts} |`);
    lines.push(`| Reviewed Paths | ${result.statistics.reviewedPaths} |`);
    lines.push(`| Reviewed Modules | ${result.statistics.reviewedModules} |`);
    lines.push(`| Reviewed Lessons | ${result.statistics.reviewedLessons} |`);
    lines.push(`| Reviewed Artifacts | ${result.statistics.reviewedArtifacts} |`);
    lines.push(`| Dependency Edges | ${result.statistics.dependencyEdges} |`);
    lines.push(`| Avg Lessons/Module | ${result.statistics.avgLessonsPerModule} |`);
    lines.push(`| Avg Artifacts/Lesson | ${result.statistics.avgArtifactsPerLesson} |`);
    lines.push(`| Max Hierarchy Depth | ${result.statistics.maxHierarchyDepth} |`);
    lines.push('');
    lines.push('## Issues');
    lines.push('');
    lines.push(`| Severity | Count |`);
    lines.push(`|----------|-------|`);
    lines.push(`| Critical | ${result.criticalCount} |`);
    lines.push(`| High | ${result.highCount} |`);
    lines.push(`| Medium | ${result.mediumCount} |`);
    lines.push(`| Low | ${result.lowCount} |`);
    lines.push(`| **Total** | **${result.totalIssues}** |`);
    lines.push('');

    if (result.cycles.length > 0) {
      lines.push('## Dependency Cycles');
      lines.push('');
      for (const cycle of result.cycles) {
        lines.push(`- ${cycle.join(' → ')}`);
      }
      lines.push('');
    }

    if (result.brokenDeps.length > 0) {
      lines.push('## Broken References');
      lines.push('');
      for (const dep of result.brokenDeps) {
        lines.push(`- "${dep.from}" ${dep.type} → nonexistent "${dep.to}"`);
      }
      lines.push('');
    }

    if (result.selfDeps.length > 0) {
      lines.push('## Self-Dependencies');
      lines.push('');
      for (const dep of result.selfDeps) {
        lines.push(`- "${dep.from}" ${dep.type} → "${dep.to}"`);
      }
      lines.push('');
    }

    if (result.duplicateEdges.length > 0) {
      lines.push('## Duplicate Edges');
      lines.push('');
      for (const dep of result.duplicateEdges) {
        lines.push(`- "${dep.from}" ${dep.type} → "${dep.to}"`);
      }
      lines.push('');
    }

    if (result.issues.length > 0) {
      lines.push('## All Issues');
      lines.push('');
      for (const issue of result.issues) {
        lines.push(`- [${issue.severity.toUpperCase()}] [${issue.category}] ${issue.message}`);
      }
      lines.push('');
    } else {
      lines.push('No issues detected.');
      lines.push('');
    }

    lines.push('---');
    lines.push('');
    lines.push('## Lifecycle Distribution');
    lines.push('');
    lines.push(`| Entity | Draft | Reviewed |`);
    lines.push(`|--------|-------|----------|`);
    lines.push(`| Learning Paths | ${result.statistics.draftPaths} | ${result.statistics.reviewedPaths} |`);
    lines.push(`| Modules | ${result.statistics.draftModules} | ${result.statistics.reviewedModules} |`);
    lines.push(`| Lessons | ${result.statistics.draftLessons} | ${result.statistics.reviewedLessons} |`);
    lines.push(`| Artifacts | ${result.statistics.draftArtifacts} | ${result.statistics.reviewedArtifacts} |`);
    lines.push('');

    return lines.join('\n');
  }

  // --- Stress Test Utilities ---

  function createSyntheticIndex(overrides) {
    const base = JSON.parse(JSON.stringify(overrides._base || {}));
    delete overrides._base;

    // Apply mutations
    if (overrides.duplicateModuleId) {
      const dup = { ...base.modules[0], id: overrides.duplicateModuleId };
      base.modules.push(dup);
    }
    if (overrides.orphanModule) {
      base.modules.push(overrides.orphanModule);
    }
    if (overrides.selfDepArtifact) {
      const art = base.artifacts.find(a => a.id === overrides.selfDepArtifact);
      if (art) {
        if (!art.dependencies) art.dependencies = {};
        art.dependencies.prerequisite = [overrides.selfDepArtifact];
      }
    }
    if (overrides.brokenRefArtifact) {
      const art = base.artifacts.find(a => a.id === overrides.brokenRefArtifact);
      if (art) {
        if (!art.dependencies) art.dependencies = {};
        art.dependencies.prerequisite = ['nonexistent-artifact'];
      }
    }
    if (overrides.cycleDeps) {
      for (const [from, to] of overrides.cycleDeps) {
        const art = base.artifacts.find(a => a.id === from);
        if (art) {
          if (!art.dependencies) art.dependencies = {};
          art.dependencies.prerequisite = [to];
        }
      }
    }
    if (overrides.invalidLifecycle) {
      const art = base.artifacts.find(a => a.id === overrides.invalidLifecycle);
      if (art) art.canonicalStatus = 'InvalidStatus';
    }

    return base;
  }

  const CurriculumIntegrityEngine = {
    validateAll,
    validateHierarchy,
    validateIds,
    validateDependencies,
    validateReachability,
    validateLifecycle,
    validateMetadata,
    generateStatistics,
    generateMarkdownReport,
    createSyntheticIndex,
    VALID_LIFECYCLE_VALUES
  };

  if (typeof module !== 'undefined') {
    module.exports = CurriculumIntegrityEngine;
  } else {
    window.NeuralVerse = window.NeuralVerse || {};
    window.NeuralVerse.CurriculumIntegrityEngine = CurriculumIntegrityEngine;
  }

})();
