const NODE_TYPES = ['path', 'module', 'lesson', 'artifact'];
const DEPENDENCY_TYPES = ['prerequisite', 'recommended_before', 'recommended_after', 'complementary', 'alternative'];

function labelType(type) {
  return ({ path: 'Learning Path', module: 'Module', lesson: 'Lesson', artifact: 'Artifact' })[type] || type;
}

function edgeId(type, source, target) {
  return `${type}:${source}->${target}`;
}

function addEdge(edges, edge) {
  if (!edge.source || !edge.target || edge.source === edge.target) return;
  if (edges.some((candidate) => candidate.id === edge.id)) return;
  edges.push(edge);
}

function routeFor(type, id, lineage = {}) {
  if (type === 'path') return `#/learning/${id}`;
  if (type === 'module') return lineage.pathId ? `#/learning/${lineage.pathId}/module/${id}` : `#/modules/${id}`;
  if (type === 'lesson') return lineage.pathId && lineage.moduleId ? `#/learning/${lineage.pathId}/module/${lineage.moduleId}/lesson/${id}` : '#/learning';
  if (type === 'artifact') return lineage.pathId && lineage.moduleId && lineage.lessonId ? `#/learning/${lineage.pathId}/module/${lineage.moduleId}/lesson/${lineage.lessonId}/artifact/${id}` : '#/learning';
  return '#/learning';
}

function makeNode(type, item, lineage, metadata = {}) {
  return {
    id: item.id,
    type,
    typeLabel: labelType(type),
    title: item.title || item.id,
    status: item.canonicalStatus || 'Draft',
    route: routeFor(type, item.id, lineage),
    lineage,
    metadata: {
      overview: item.overview || item.aim || item.learningGoal || '',
      estimatedDuration: item.estimatedDuration || '',
      instructionalObjectives: item.instructionalObjectives || [],
      artifactType: item.type || '',
      family: item.family || '',
      hasVisualization: item.type === 'Interactive Visualization' || metadata.hasVisualization,
      ...metadata
    }
  };
}

export function buildKnowledgeGraphModel(index, options = {}) {
  const nodes = [];
  const edges = [];
  const nodeById = new Map();
  const moduleById = new Map((index.modules || []).map((item) => [item.id, item]));
  const lessonById = new Map((index.lessons || []).map((item) => [item.id, item]));
  const artifactById = new Map((index.artifacts || []).map((item) => [item.id, item]));
  const parentPathByModule = new Map();
  const parentModuleByLesson = new Map();
  const parentLessonByArtifact = new Map();

  (index.learningPaths || []).forEach((path) => {
    (path.moduleIds || []).forEach((moduleId) => parentPathByModule.set(moduleId, path));
  });
  (index.modules || []).forEach((module) => {
    (module.lessonIds || []).forEach((lessonId) => parentModuleByLesson.set(lessonId, module));
  });
  (index.lessons || []).forEach((lesson) => {
    (lesson.artifactIds || []).forEach((artifactId) => parentLessonByArtifact.set(artifactId, lesson));
  });

  function registerNode(node) {
    if (nodeById.has(node.id)) return nodeById.get(node.id);
    nodes.push(node);
    nodeById.set(node.id, node);
    return node;
  }

  (index.learningPaths || []).forEach((path) => registerNode(makeNode('path', path, { pathId: path.id, labels: [path.title] })));
  (index.modules || []).forEach((module) => {
    const path = parentPathByModule.get(module.id);
    registerNode(makeNode('module', module, {
      pathId: path?.id || '',
      moduleId: module.id,
      labels: [path?.title, module.title].filter(Boolean)
    }));
  });
  (index.lessons || []).forEach((lesson) => {
    const module = parentModuleByLesson.get(lesson.id);
    const path = module ? parentPathByModule.get(module.id) : null;
    registerNode(makeNode('lesson', lesson, {
      pathId: path?.id || '',
      moduleId: module?.id || '',
      lessonId: lesson.id,
      labels: [path?.title, module?.title, lesson.title].filter(Boolean)
    }));
  });
  (index.artifacts || []).forEach((artifact) => {
    const lesson = parentLessonByArtifact.get(artifact.id);
    const module = lesson ? parentModuleByLesson.get(lesson.id) : null;
    const path = module ? parentPathByModule.get(module.id) : null;
    registerNode(makeNode('artifact', artifact, {
      pathId: path?.id || '',
      moduleId: module?.id || '',
      lessonId: lesson?.id || '',
      artifactId: artifact.id,
      labels: [path?.title, module?.title, lesson?.title, artifact.title].filter(Boolean)
    }, { hasVisualization: options.hasVisualization?.(artifact.id) || false }));
  });

  (index.learningPaths || []).forEach((path) => {
    (path.moduleIds || []).forEach((moduleId) => addEdge(edges, {
      id: edgeId('contains', path.id, moduleId), type: 'contains', source: path.id, target: moduleId,
      label: 'contains', description: 'This edge exists because this learning path contains this module.'
    }));
  });
  (index.modules || []).forEach((module) => {
    (module.lessonIds || []).forEach((lessonId) => addEdge(edges, {
      id: edgeId('contains', module.id, lessonId), type: 'contains', source: module.id, target: lessonId,
      label: 'contains', description: 'This edge exists because this module contains this lesson.'
    }));
    (module.lessonIds || []).forEach((lessonId, indexInParent, ids) => {
      if (indexInParent < ids.length - 1) addEdge(edges, {
        id: edgeId('sibling', lessonId, ids[indexInParent + 1]), type: 'sibling', source: lessonId, target: ids[indexInParent + 1],
        label: 'sibling', description: 'This edge exists because both lessons share the same parent module.'
      });
    });
  });
  (index.lessons || []).forEach((lesson) => {
    (lesson.artifactIds || []).forEach((artifactId) => addEdge(edges, {
      id: edgeId('contains', lesson.id, artifactId), type: 'contains', source: lesson.id, target: artifactId,
      label: 'contains', description: 'This edge exists because this lesson contains this artifact.'
    }));
    (lesson.artifactIds || []).forEach((artifactId, indexInParent, ids) => {
      if (indexInParent < ids.length - 1) addEdge(edges, {
        id: edgeId('sibling', artifactId, ids[indexInParent + 1]), type: 'sibling', source: artifactId, target: ids[indexInParent + 1],
        label: 'sibling', description: 'This edge exists because both artifacts share the same parent lesson.'
      });
    });
  });

  (index.artifacts || []).forEach((artifact) => {
    DEPENDENCY_TYPES.forEach((type) => {
      const targets = Array.isArray(artifact[type]) ? artifact[type] : [];
      targets.forEach((targetId) => {
        if (!artifactById.has(targetId)) return;
        addEdge(edges, {
          id: edgeId(type, artifact.id, targetId), type, source: artifact.id, target: targetId,
          label: type.replace(/_/g, ' '), description: `This edge exists because the artifact metadata lists a ${type.replace(/_/g, ' ')} relationship.`
        });
      });
    });
  });

  const conceptNodes = new Map();
  const conceptService = window.NeuralVerse?.conceptLayerService;
  if (conceptService) {
    try {
      const allConcepts = conceptService.getAllConceptsSync ? conceptService.getAllConceptsSync() : [];
      (index.artifacts || []).forEach((artifact) => {
        (artifact.concepts || []).forEach((conceptId) => {
          const conceptData = allConcepts.find(c => c.id === conceptId);
          const conceptNodeId = `concept-${conceptId}`;
          if (!conceptNodes.has(conceptNodeId)) {
            const conceptNode = {
              id: conceptNodeId,
              type: 'concept',
              typeLabel: 'Concept',
              title: conceptData ? conceptData.name : conceptId,
              status: 'Active',
              route: '#/workspace',
              lineage: {},
              metadata: {
                overview: conceptData ? conceptData.summary || '' : '',
                definition: conceptData ? conceptData.definition || '' : '',
                aliases: conceptData ? conceptData.aliases || [] : [],
                keywords: conceptData ? conceptData.keywords || [] : []
              }
            };
            registerNode(conceptNode);
            conceptNodes.set(conceptNodeId, conceptData);
          }
          addEdge(edges, {
            id: edgeId('teaches', artifact.id, conceptNodeId),
            type: 'teaches',
            source: artifact.id,
            target: conceptNodeId,
            label: 'teaches',
            description: `This artifact teaches the concept ${conceptId}.`
          });
        });
      });
      conceptNodes.forEach((conceptData, conceptNodeId) => {
        if (conceptData && conceptData.relatedConcepts) {
          conceptData.relatedConcepts.forEach((relatedId) => {
            const relatedNodeId = `concept-${relatedId}`;
            if (!conceptNodes.has(relatedNodeId)) {
              const relatedData = allConcepts.find(c => c.id === relatedId);
              if (relatedData) {
                const relatedNode = {
                  id: relatedNodeId,
                  type: 'concept',
                  typeLabel: 'Concept',
                  title: relatedData.name,
                  status: 'Active',
                  route: '#/workspace',
                  lineage: {},
                  metadata: {
                    overview: relatedData.summary || '',
                    definition: relatedData.definition || '',
                    aliases: relatedData.aliases || [],
                    keywords: relatedData.keywords || []
                  }
                };
                registerNode(relatedNode);
                conceptNodes.set(relatedNodeId, relatedData);
              }
            }
            addEdge(edges, {
              id: edgeId('related_concept', conceptNodeId, relatedNodeId),
              type: 'related_concept',
              source: conceptNodeId,
              target: relatedNodeId,
              label: 'related to',
              description: 'This edge exists because the concept layer defines a relationship between these concepts.'
            });
          });
        }
      });
    } catch (e) {
      // Concept layer integration is optional — do not break graph
    }
  }

  const edgesByNodeId = new Map();
  edges.forEach((edge) => {
    if (!edgesByNodeId.has(edge.source)) edgesByNodeId.set(edge.source, []);
    if (!edgesByNodeId.has(edge.target)) edgesByNodeId.set(edge.target, []);
    edgesByNodeId.get(edge.source).push(edge);
    edgesByNodeId.get(edge.target).push(edge);
  });

  return { nodes, edges, nodeById, edgesByNodeId, parentPathByModule, parentModuleByLesson, parentLessonByArtifact, moduleById, lessonById, artifactById, nodeTypes: NODE_TYPES };
}

export { DEPENDENCY_TYPES };
