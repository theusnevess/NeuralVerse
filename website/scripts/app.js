import { createLearningController } from "./learning/learning-controller.js";
import { createContentController } from "./content/content-controller.js";
import { createProgressController } from "./progress/progress-controller.js";
import { createWorkspaceController } from "./workspace/workspace-controller.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log('NeuralVerse App Shell Initialized');

  // Set the current year in the footer
  const yearElement = document.querySelector('.nv-footer-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }

  // Initialize the learning path controller
  const learningController = createLearningController({
    root: document,
  });

  learningController.init().catch((error) => {
    console.error("Learning controller failed to initialize.", error);
  });

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

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.learningController = learningController;
  window.NeuralVerse.contentController = contentController;
  window.NeuralVerse.progressController = progressController;
  window.NeuralVerse.workspaceController = workspaceController;
});
