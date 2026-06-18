/**
 * Navigation and UI Sync Module
 */
class NavigationController {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.activeIndicator = null;
    this.init();
  }

  init() {
    this.ensureActiveIndicator();
    this.stateManager.subscribe((state) => this.syncUI(state));
    window.addEventListener('resize', () => this.updateActiveIndicator());
  }

  ensureActiveIndicator() {
    const rail = document.querySelector('.nv-navigation-rail');
    if (!rail) return null;

    let indicator = rail.querySelector('.nv-nav-active-indicator');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'nv-nav-active-indicator nv-motion nv-motion-shared-transition';
      indicator.setAttribute('aria-hidden', 'true');
      rail.append(indicator);
    }

    this.activeIndicator = indicator;
    return indicator;
  }

  updateActiveIndicator() {
    const indicator = this.activeIndicator || this.ensureActiveIndicator();
    const rail = document.querySelector('.nv-navigation-rail');
    const activeItem = rail?.querySelector('.nv-nav-item[aria-current="page"]');

    if (!indicator || !rail || !activeItem) {
      indicator?.setAttribute('data-visible', 'false');
      return;
    }

    const railRect = rail.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const x = itemRect.left - railRect.left;
    const y = itemRect.top - railRect.top;

    indicator.style.inlineSize = `${itemRect.width}px`;
    indicator.style.blockSize = `${itemRect.height}px`;
    indicator.style.setProperty('--nv-nav-indicator-x', `${x}px`);
    indicator.style.setProperty('--nv-nav-indicator-y', `${y}px`);
    indicator.setAttribute('data-visible', 'true');
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
    this.updateActiveIndicator();

    // 2. Sync Global Header Title and Description
    const headerTitle = document.querySelector('.nv-header-section-title');
    const headerDesc = document.querySelector('.nv-header-section-description');
    if (headerTitle) headerTitle.textContent = route.label;
    if (headerDesc) headerDesc.textContent = route.description;

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
