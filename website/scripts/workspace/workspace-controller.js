/**
 * NeuralVerse Workspace Controller
 * Safe browser global under window.NeuralVerse
 */
(function() {
  window.NeuralVerse = window.NeuralVerse || {};

  class WorkspaceController {
    constructor(navigationState, workspaceState) {
      this.navigationState = navigationState;
      this.workspaceState = workspaceState;
      this.init();
    }

    init() {
      // Subscribe to routing events
      this.navigationState.subscribe((navState) => this.handleRouteChange(navState));
      
      // Subscribe to workspace state updates to sync DOM
      this.workspaceState.subscribe((state) => this.syncDOM(state));

      // Setup action buttons event delegation
      document.addEventListener('click', (e) => this.handleActionClick(e));
    }

    handleRouteChange(navState) {
      const route = navState.currentRoute;
      if (!route) return;

      let routeId = route.id;
      let status = 'empty';

      // Map route to workspace state status
      if (routeId === 'home') {
        status = 'idle';
      } else if (routeId === 'workspace') {
        status = 'active';
      } else if (routeId === 'not-found') {
        routeId = 'unavailable';
        status = 'empty';
      }

      this.workspaceState.setState({
        activeView: routeId,
        routeId: routeId,
        routeTitle: route.title || 'Route Unavailable',
        routeDescription: route.description || 'The requested page is currently offline or not configured.',
        status: status
      });
    }

    syncDOM(state) {
      console.log('Syncing workspace DOM with state:', state);

      // Sync text nodes and attributes
      const titleEl = document.querySelector('[data-workspace-title]');
      const descEl = document.querySelector('[data-workspace-description]');
      const statusEl = document.querySelector('[data-workspace-status]');
      const viewEl = document.querySelector('[data-workspace-active-view]');
      const routeEl = document.querySelector('[data-workspace-route]');
      const updatedEl = document.querySelector('[data-workspace-updated]');
      const liveEl = document.querySelector('[data-workspace-live]');
      const emptyStateEl = document.querySelector('[data-workspace-empty-state]');

      if (titleEl) titleEl.textContent = state.routeTitle;
      if (descEl) descEl.textContent = state.routeDescription;
      
      if (statusEl) {
        statusEl.textContent = state.status.toUpperCase();
        statusEl.setAttribute('data-status', state.status);
        // Update badge class based on status
        statusEl.className = 'nv-badge nv-workspace__status';
        if (state.status === 'active') {
          statusEl.setAttribute('data-variant', 'success');
        } else if (state.status === 'idle') {
          statusEl.setAttribute('data-variant', 'info');
        } else {
          statusEl.setAttribute('data-variant', 'neutral');
        }
      }

      if (viewEl) viewEl.setAttribute('data-workspace-active-view', state.activeView);
      if (routeEl) routeEl.textContent = `Route: ${state.routeId}`;
      if (updatedEl) {
        updatedEl.textContent = `Updated: ${new Date(state.lastUpdated).toLocaleTimeString()}`;
      }
      if (liveEl) {
        liveEl.textContent = `Workspace updated. Active node: ${state.routeTitle}. Status: ${state.status}.`;
      }

      // Sync empty state visibility
      if (emptyStateEl) {
        if (state.status === 'empty') {
          emptyStateEl.innerHTML = `
            <div class="nv-empty-state">
              <div class="nv-empty-state-icon" aria-hidden="true">📭</div>
              <h2 class="nv-empty-state-title">Workspace is Empty</h2>
              <p class="nv-empty-state-description">
                No learning modules, publications, or simulation agents have been initialized for the current path block.
              </p>
              <div class="nv-cluster nv-cluster--gap-sm">
                <button class="nv-button" data-variant="primary" data-workspace-action="open-workspace">Initialize Workspace</button>
              </div>
            </div>
          `;
          emptyStateEl.style.display = 'block';
        } else {
          emptyStateEl.innerHTML = '';
          emptyStateEl.style.display = 'none';
        }
      }

      // Sync Context Panel orientation fields
      const orientationTarget = document.querySelector('.nv-context-meta-item:nth-child(2) .nv-context-meta-value');
      const orientationDesc = document.querySelector('.nv-context-description');
      if (orientationTarget) orientationTarget.textContent = state.routeTitle;
      if (orientationDesc) orientationDesc.textContent = state.routeDescription;
    }

    handleActionClick(e) {
      const button = e.target.closest('[data-workspace-action]');
      if (!button) return;

      const action = button.getAttribute('data-workspace-action');
      console.log(`Workspace action triggered: ${action}`);

      const statusEl = document.querySelector('[data-workspace-status]');
      const liveEl = document.querySelector('[data-workspace-live]');

      if (action === 'open-workspace') {
        // Transition state visually
        this.workspaceState.setState({
          status: 'active',
          routeTitle: 'Active Workspace Preview',
          routeDescription: 'Interactive real-time model telemetry dashboard activated.'
        });
        if (liveEl) liveEl.textContent = 'Workspace action: Activated Workspace Preview mode.';
      } else if (action === 'explore-learning') {
        window.location.hash = '#/learning';
      } else if (action === 'browse-modules') {
        window.location.hash = '#/modules';
      } else if (action === 'open-content') {
        window.location.hash = '#/content';
      }
    }
  }

  // Initialize once dependencies are ready
  document.addEventListener('DOMContentLoaded', () => {
    if (window.navigationState && window.NeuralVerse.workspaceState) {
      window.NeuralVerse.workspaceController = new WorkspaceController(
        window.navigationState,
        window.NeuralVerse.workspaceState
      );
    } else {
      console.error('Workspace controller initialization deferred: missing dependencies.');
    }
  });
})();
