/**
 * Route Registry & Patterns
 */
const ROUTES = [
  {
    id: 'home',
    path: '#/',
    pattern: /^#\/$/,
    label: '',
    title: 'NeuralVerse',
    description: '',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'knowledge-graph',
    path: '#/knowledge-graph',
    pattern: /^#\/knowledge-graph(?:\?.*)?$/,
    label: 'Knowledge Graph',
    title: 'Knowledge Graph & Semantic Exploration',
    description: 'Explore deterministic curriculum relationships across paths, modules, lessons, and artifacts.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'retrieval-playground',
    path: '#/retrieval-playground',
    pattern: /^#\/retrieval-playground$/,
    label: 'Retrieval Playground',
    title: 'Retrieval Workspace',
    description: 'Explore references, relationships, search results, and evidence compilation.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'retrieval-playground',
    path: '#/retrieval',
    pattern: /^#\/retrieval$/,
    label: 'Retrieval Playground',
    title: 'Retrieval Workspace',
    description: 'Explore references, relationships, search results, and evidence compilation.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'learning-path',
    path: '#/learning/:pathId/module/:moduleId',
    pattern: /^#\/learning\/([^/]+)\/module\/([^/]+)$/,
    label: 'Learning Path Module',
    title: 'Learning Path Module Detail',
    description: 'Detailed view of module contents.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'lesson-detail',
    path: '#/learning/:pathId/module/:moduleId/lesson/:lessonId',
    pattern: /^#\/learning\/([^/]+)\/module\/([^/]+)\/lesson\/([^/]+)$/,
    label: 'Lesson Detail',
    title: 'Lesson Overview',
    description: 'Canonical lesson composition and ordered artifacts.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'artifact-detail',
    path: '#/learning/:pathId/module/:moduleId/lesson/:lessonId/artifact/:artifactId',
    pattern: /^#\/learning\/([^/]+)\/module\/([^/]+)\/lesson\/([^/]+)\/artifact\/([^/]+)$/,
    label: 'Learning Artifact',
    title: 'Learning Artifact',
    description: 'Canonical learning artifact rendered from NV-800 metadata.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'learning-detail',
    path: '#/learning/:pathId',
    pattern: /^#\/learning\/([^/]+)$/,
    label: 'Learning Path Detail',
    title: 'Learning Path Overview',
    description: 'Module structures and path roadmap.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'module-detail',
    path: '#/modules/:moduleId',
    pattern: /^#\/modules\/([^/]+)$/,
    label: 'Module Detail',
    title: 'Module Overview',
    description: 'Canonical module composition and contained lessons.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'learning',
    path: '#/learning',
    pattern: /^#\/learning$/,
    label: 'Learning Paths',
    title: 'Learning Paths',
    description: 'Choose a learning path and continue through structured modules.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'workspace-module',
    path: '#/workspace/module/:moduleId',
    pattern: /^#\/workspace\/module\/([^/]+)$/,
    label: 'Workspace Module',
    title: 'Agent Sandbox Module',
    description: 'Deploy specialized neural agent unit.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: false
  },
  {
    id: 'workspace-content',
    path: '#/workspace/content/:contentItemId',
    pattern: /^#\/workspace\/content\/([^/]+)$/,
    label: 'Workspace Content',
    title: 'Agent Sandbox Reference Content',
    description: 'View linked reference document in simulation.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: false
  },
  {
    id: 'workspace',
    path: '#/workspace',
    pattern: /^#\/workspace$/,
    label: 'Workspace',
    title: 'Workspace',
    description: 'Organize your current research and learning materials.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'modules',
    path: '#/modules',
    pattern: /^#\/modules$/,
    label: 'Modules',
    title: 'Modules',
    description: 'Browse the modules in your current learning path.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'content-detail',
    path: '#/content/:contentItemId',
    pattern: /^#\/content\/([^/]+)$/,
    label: 'Content Detail',
    title: 'Content Document',
    description: 'Reading environment for academic publications.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'content',
    path: '#/content',
    pattern: /^#\/content$/,
    label: 'Content Viewer',
    title: 'Content Viewer',
    description: 'Read and organize scientific learning materials.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'settings',
    path: '#/settings',
    pattern: /^#\/settings$/,
    label: 'Settings',
    title: 'Settings',
    description: 'Adjust your workspace preferences.',
    region: 'R3 Workspace',
    navigationGroup: 'secondary',
    isImplemented: true
  },
  {
    id: 'laboratory-detail',
    path: '#/laboratory/:slug',
    pattern: /^#\/laboratory\/([a-z0-9-]+)$/,
    label: 'Laboratory',
    title: 'Interactive Laboratory',
    description: 'Execute a deterministic educational experiment.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'laboratory',
    path: '#/laboratory',
    pattern: /^#\/laboratory$/,
    label: 'Laboratories',
    title: 'Laboratories',
    description: 'Browse and launch interactive educational experiments.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'memory-detail',
    path: '#/memory/:memoryId',
    pattern: /^#\/memory\/([a-zA-Z0-9_-]+)$/,
    label: 'Memory',
    title: 'Memory Detail',
    description: 'View or edit a stored memory.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'memory',
    path: '#/memory',
    pattern: /^#\/memory$/,
    label: 'Memory',
    title: 'Memory',
    description: 'Organize your learning notes, bookmarks, and study context.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'semantic-learning',
    path: '#/semantic-learning',
    pattern: /^#\/semantic-learning$/,
    label: 'Semantic',
    title: 'Semantic Learning Intelligence',
    description: 'Deterministic concept recommendations and traversal.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'visualization-detail',
    path: '#/visualizations/:slug',
    pattern: /^#\/visualizations\/([a-z0-9-]+)$/,
    label: 'Visualization',
    title: 'Interactive Visualization',
    description: 'Explore a deterministic parametric visualization.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'visualizations',
    path: '#/visualizations',
    pattern: /^#\/visualizations$/,
    label: 'Visualizations',
    title: 'Parametric Visualizations',
    description: 'Deterministic interactive mathematical and scientific visualizations.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'generative-layer',
    path: '#/generative-layer',
    pattern: /^#\/generative-layer$/,
    label: 'Generative Assist',
    title: 'Local Generative Assist',
    description: 'Optional local generative assistance using local LLMs.',
    region: 'R3 Workspace',
    navigationGroup: 'secondary',
    isImplemented: true
  }
];

if (typeof window !== 'undefined') {
  window.ROUTES = ROUTES;
}
