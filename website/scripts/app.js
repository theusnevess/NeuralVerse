import { createCurriculumController } from "./curriculum/curriculum-controller.js?v=1";
import { createContentController } from "./content/content-controller.js?v=9";
import { createProgressController } from "./progress/progress-controller.js?v=9";
import { createWorkspaceController } from "./workspace/workspace-controller.js?v=9";
import { createBreadcrumbsController } from "./navigation/breadcrumbs-controller.js?v=10";
import { createCurriculumSearchController } from "./curriculum/curriculum-search.js?v=13";
import { createKnowledgeGraphController } from "./knowledge-graph/knowledge-graph-controller.js?v=1";
import { createAgentRegistry } from "./agents/agent-registry.js?v=1";
import { createAgentGuardrails } from "./agents/agent-guardrails.js?v=1";
import { createAgentContextBuilder } from "./agents/agent-context-builder.js?v=1";
import { createAgentContract } from "./agents/agent-contracts.js?v=1";
import { createDidacticOrchestrator } from "./agents/didactic-orchestrator.js?v=1";
import { createDidacticArchitectureAgent } from "./agents/didactic-architecture-agent.js?v=1";
import { createCurriculumDependencyAgent } from "./agents/curriculum-dependency-agent.js?v=1";
import { createVisualInteractiveMediaAgent } from "./agents/visual-interactive-media-agent.js?v=1";
import { createCodeSimulationLaboratoryAgent } from "./agents/code-simulation-laboratory-agent.js?v=1";
import { createAgentPanelController } from "./agents/agent-panel-controller.js?v=1";

window.NV_DEBUG = window.NV_DEBUG || false;

document.addEventListener("DOMContentLoaded", () => {
  if (window.NV_DEBUG) console.log('NeuralVerse App Shell Initialized');

  // Set the current year in the footer
  const yearElement = document.querySelector('.nv-footer-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }

  // Initialize the read-only curriculum controller.
  const curriculumController = createCurriculumController({
    root: document,
  });

  curriculumController.init();

  // Initialize the curriculum search controller
  const searchController = createCurriculumSearchController({
    root: document,
  });

  searchController.init();

  // Initialize the content controller
  const contentController = createContentController({
    root: document,
  });

  contentController.init();

  // Initialize the progress controller
  const progressController = createProgressController({
    root: document,
  });

  progressController.init().catch((error) => {
    console.error("Progress controller failed to initialize.", error);
  });

  // Initialize the workspace controller
  const workspaceController = createWorkspaceController({
    root: document,
    navigationState: window.navigationState,
    workspaceState: window.NeuralVerse?.workspaceState,
  });

  workspaceController.init().catch((error) => {
    console.error("Workspace controller failed to initialize.", error);
  });

  // Initialize the breadcrumbs controller
  const breadcrumbsController = createBreadcrumbsController({
    root: document,
  });

  breadcrumbsController.init();

  const knowledgeGraphController = createKnowledgeGraphController({
    root: document,
  });

  knowledgeGraphController.init();

  // Initialize the agent panel controller
  const agentPanelController = createAgentPanelController({
    root: document,
  });

  agentPanelController.init();

  // Register the Didactic Architecture Agent with the orchestrator
  const didacticArchAgent = window.NeuralVerse?.didacticArchitectureAgent;
  const orchestrator = window.NeuralVerse?.didacticOrchestrator;
  if (didacticArchAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('didactic-architecture', didacticArchAgent);
  }

  // Register the Curriculum & Dependency Agent with the orchestrator
  const curriculumDepAgent = window.NeuralVerse?.curriculumDependencyAgent;
  if (curriculumDepAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('curriculum-dependency', curriculumDepAgent);
  }

  // Register the Visual & Interactive Media Agent with the orchestrator
  const visualMediaAgent = window.NeuralVerse?.visualInteractiveMediaAgent;
  if (visualMediaAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('visual-interactive-media', visualMediaAgent);
  }

  // Register the Code, Simulation & Laboratory Agent with the orchestrator
  const codeLabAgent = window.NeuralVerse?.codeSimulationLaboratoryAgent;
  if (codeLabAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('code-simulation-lab', codeLabAgent);
  }

  // Bind agent trigger button
  const agentTrigger = document.querySelector('#nv-agent-trigger');
  if (agentTrigger) {
    agentTrigger.addEventListener('click', () => {
      agentPanelController.togglePanel();
    });
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.agentPanelController = agentPanelController;
  window.NeuralVerse.curriculumController = curriculumController;
  window.NeuralVerse.searchController = searchController;
  window.NeuralVerse.contentController = contentController;
  window.NeuralVerse.progressController = progressController;
  window.NeuralVerse.workspaceController = workspaceController;
  window.NeuralVerse.breadcrumbsController = breadcrumbsController;
  window.NeuralVerse.knowledgeGraphController = knowledgeGraphController;
});

function shiftFocusToWorkspace() {
  const mainWorkspace = document.querySelector("#main-workspace");

  if (mainWorkspace) {
    mainWorkspace.focus({ preventScroll: true });
  }
}

window.addEventListener("hashchange", () => {
  window.requestAnimationFrame(shiftFocusToWorkspace);
});
