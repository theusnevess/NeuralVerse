export type VisualRouteFixture = {
  id: string;
  routePattern: string;
  route: string;
  expectedHeading: string;
  loadedMarker: string;
  requiredViewports: string[];
  storage?: Record<string, string>;
};

const curriculumPath = 'path-advanced-rag-foundations';
const curriculumModule = 'module-advanced-retrieval-pipelines';
const curriculumLesson = 'lesson-query-routing';

export const visualRouteFixtures: VisualRouteFixture[] = [
  { id: 'learning-path-rag-foundations', routePattern: '#/learning/:pathId', route: `#/learning/${curriculumPath}`, expectedHeading: 'Advanced RAG Foundations', loadedMarker: 'h1', requiredViewports: ['1440x900', '390x844', '768x1024', '844x390'] },
  { id: 'learning-module-retrieval', routePattern: '#/learning/:pathId/module/:moduleId', route: `#/learning/${curriculumPath}/module/${curriculumModule}`, expectedHeading: 'Advanced Retrieval Pipelines', loadedMarker: 'h1', requiredViewports: ['1440x900', '390x844', '768x1024', '844x390'] },
  { id: 'learning-lesson-query-routing', routePattern: '#/learning/:pathId/module/:moduleId/lesson/:lessonId', route: `#/learning/${curriculumPath}/module/${curriculumModule}/lesson/${curriculumLesson}`, expectedHeading: 'Query Routing and Intent Detection', loadedMarker: '.nv-lesson-workspace', requiredViewports: ['1440x900', '390x844', '768x1024', '844x390'] },
  { id: 'learning-artifact-query-routing', routePattern: '#/learning/:pathId/module/:moduleId/lesson/:lessonId/artifact/:artifactId', route: `#/learning/${curriculumPath}/module/${curriculumModule}/lesson/${curriculumLesson}/artifact/artifact-query-routing-explanatory-text`, expectedHeading: 'Query Routing and Intent Detection', loadedMarker: '.nv-lesson-workspace', requiredViewports: ['1440x900', '390x844', '768x1024', '844x390'] },
  { id: 'module-retrieval', routePattern: '#/modules/:moduleId', route: `#/modules/${curriculumModule}`, expectedHeading: 'Advanced Retrieval Pipelines', loadedMarker: 'h1', requiredViewports: ['1440x900', '390x844', '768x1024', '844x390'] },
  { id: 'content-foundations-intro', routePattern: '#/content/:contentItemId', route: '#/content/foundations-intro', expectedHeading: 'Foundations Introduction', loadedMarker: '[data-content-viewer]', requiredViewports: ['1440x900', '390x844', '768x1024', '844x390'] },
  { id: 'memory-canonical-note', routePattern: '#/memory/:memoryId', route: '#/memory/nv2600-canonical-note', expectedHeading: 'NV-2600 Canonical Note', loadedMarker: '.nv-memory-detail[role="article"]', requiredViewports: ['1440x900', '390x844', '768x1024', '844x390'], storage: { nv_memory_items: JSON.stringify([{ id: 'nv2600-canonical-note', type: 'note', title: 'NV-2600 Canonical Note', summary: 'Deterministic memory-detail fixture.', content: 'Canonical visual-audit memory.', tags: ['nv-2600'], relatedArtifacts: [], relatedConcepts: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', pinned: false, archived: false, source: 'fixture', version: '1.0.0' }]) } },
  { id: 'visualization-linear-function', routePattern: '#/visualizations/:slug', route: '#/visualizations/linear-function', expectedHeading: 'Linear Function', loadedMarker: '.nv-pviz-page', requiredViewports: ['1440x900', '390x844', '768x1024', '844x390'] }
];
