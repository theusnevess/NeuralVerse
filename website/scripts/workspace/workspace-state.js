/**
 * NeuralVerse Workspace State Manager
 * Safe browser global under window.NeuralVerse
 */
(function() {
  window.NeuralVerse = window.NeuralVerse || {};

  class WorkspaceStateManager {
    constructor() {
      this.state = {
        activeView: 'home',
        routeId: 'home',
        routeTitle: 'Welcome to NeuralVerse',
        routeDescription: 'Scientific Research & AI Agent Environment.',
        lastUpdated: new Date().toISOString(),
        status: 'idle'
      };
      this.listeners = [];
    }

    getState() {
      return this.state;
    }

    setState(newState) {
      this.state = {
        ...this.state,
        ...newState,
        lastUpdated: new Date().toISOString()
      };
      if (window.NV_DEBUG) console.log('Workspace state updated:', this.state);
      this.notify();
    }

    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }

    notify() {
      this.listeners.forEach(listener => listener(this.state));
    }
  }

  window.NeuralVerse.workspaceState = new WorkspaceStateManager();
})();
