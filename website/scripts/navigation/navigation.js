/**
 * Navigation and UI Sync Module
 */
class NavigationController {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.init();
  }

  init() {
    this.stateManager.subscribe((state) => this.syncUI(state));
    if (this.stateManager.state && this.stateManager.state.currentRoute) {
      this.syncUI(this.stateManager.state);
    }
  }

  syncUI(state) {
    const route = state.currentRoute;
    if (!route) return;

    if (window.NV_DEBUG) console.log(`Syncing UI for route: ${route.id}`);

    // 1. Sync Navigation Rail active item
    const navItems = document.querySelectorAll('.nv-nav-item');
    navItems.forEach(item => {
      const itemHref = item.getAttribute('href');
      const pathMatches = itemHref === route.path;

      if (pathMatches) {
        item.setAttribute('aria-current', 'page');
      } else {
        item.removeAttribute('aria-current');
      }
    });

    // 3. Sync Context Panel orientation details
    const activeRegion = document.querySelector('.nv-context-meta-item:nth-child(1) .nv-context-meta-value');
    const primaryTarget = document.querySelector('.nv-context-meta-item:nth-child(2) .nv-context-meta-value');
    const panelDesc = document.querySelector('.nv-context-description');
    
    if (activeRegion) activeRegion.textContent = route.region || 'R3 Workspace';
    if (primaryTarget) primaryTarget.textContent = route.label;
    if (panelDesc) panelDesc.textContent = route.description;

    // 4. Highlight hierarchy items in Context Panel
    const hierarchyItems = document.querySelectorAll('.nv-context-hierarchy-item');
    hierarchyItems.forEach(item => {
      const text = item.querySelector('.nv-context-hierarchy-text')?.textContent?.trim().toLowerCase();
      const dot = item.querySelector('.nv-context-hierarchy-dot');
      
      if (text === route.label.toLowerCase()) {
        item.classList.add('nv-context-hierarchy-item--active');
        if (dot) dot.classList.add('nv-context-hierarchy-dot--active');
      } else {
        item.classList.remove('nv-context-hierarchy-item--active');
        if (dot) dot.classList.remove('nv-context-hierarchy-dot--active');
      }
    });
  }
}

// Instantiate and expose globally
document.addEventListener('DOMContentLoaded', () => {
  const navController = new NavigationController(window.navigationState);
  window.navController = navController;
});
