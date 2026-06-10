/**
 * Navigation State Management
 */
class NavigationStateManager {
  constructor() {
    this.state = {
      currentRoute: null,
      params: {},
      previousRoute: null
    };
    this.listeners = [];
  }

  setCurrentRoute(route, params = {}) {
    this.state.previousRoute = this.state.currentRoute;
    this.state.currentRoute = route;
    this.state.params = params;
    this.notify();
  }

  getCurrentRoute() {
    return this.state.currentRoute;
  }

  getParams() {
    return this.state.params;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Instantiate and expose globally
const navigationState = new NavigationStateManager();
if (typeof window !== 'undefined') {
  window.navigationState = navigationState;
}
