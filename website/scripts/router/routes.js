/**
 * Route Registry & Patterns
 */
const ROUTES = [
  {
    id: 'home',
    path: '#/',
    pattern: /^#\/$/,
    label: 'Home',
    title: 'Welcome to NeuralVerse',
    description: 'Scientific Research & AI Agent Environment.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'retrieval-playground',
    path: '#/retrieval-playground',
    pattern: /^#\/retrieval-playground$/,
    label: 'Retrieval Playground',
    title: 'Retrieval Playground',
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
    isImplemented: false
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
    isImplemented: false
  },
  {
    id: 'learning',
    path: '#/learning',
    pattern: /^#\/learning$/,
    label: 'Learning Paths',
    title: 'Advanced Learning Paths',
    description: 'Explore agentic models and neural architecture courses.',
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
    title: 'Agent Workspace',
    description: 'Deploy, configure, and monitor live AI agents in real-time.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'modules',
    path: '#/modules',
    pattern: /^#\/modules$/,
    label: 'Modules',
    title: 'Core Study Modules',
    description: 'Dive deep into specialized neural and cognitive science units.',
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
    isImplemented: false
  },
  {
    id: 'content',
    path: '#/content',
    pattern: /^#\/content$/,
    label: 'Content Viewer',
    title: 'Documentation & Papers',
    description: 'Access scientific publications, references, and guidebooks.',
    region: 'R3 Workspace',
    navigationGroup: 'primary',
    isImplemented: true
  },
  {
    id: 'settings',
    path: '#/settings',
    pattern: /^#\/settings$/,
    label: 'Settings',
    title: 'Environment Settings',
    description: 'Review workspace preferences and environment status.',
    region: 'R3 Workspace',
    navigationGroup: 'secondary',
    isImplemented: true
  }
];

if (typeof window !== 'undefined') {
  window.ROUTES = ROUTES;
}
