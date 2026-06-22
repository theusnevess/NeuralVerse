/**
 * Base class for all interactive visualizations in NeuralVerse.
 * Ensures a consistent lifecycle interface: initialize, render, reset, destroy.
 */
export class BaseVisualization {
  constructor(artifactId) {
    this.artifactId = artifactId;
    this.container = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resizeObserver = null;
  }

  /**
   * Mounts the visualization elements inside the parent container.
   * Caches DOM references and binds event listeners.
   * @param {HTMLElement} container - The wrapper element for the visualization.
   */
  initialize(container) {
    this.container = container;
    this.container.classList.add('nv-visualization');
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', `Interactive Visualization for ${this.artifactId}`);
    
    // Set up standard focus outlines and focus trap if necessary
    this.container.tabIndex = -1;

    // Monitor for container resize to support responsive redraws
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(this.container);

    this.onInitialize();
    this.render();
  }

  /**
   * Hook for sub-classes to perform specific DOM mounting and element setups.
   */
  onInitialize() {
    // Override in sub-classes
  }

  /**
   * Performs drawing or updates to the visualization DOM or Canvas.
   */
  render() {
    // Override in sub-classes
  }

  /**
   * Resets all internal model parameters to their initial default values.
   */
  reset() {
    this.onReset();
    this.render();
  }

  /**
   * Hook for sub-classes to reset their states.
   */
  onReset() {
    // Override in sub-classes
  }

  /**
   * Response to container resize events.
   */
  handleResize() {
    this.render();
  }

  /**
   * Clean up all mounted DOM elements, event listeners, intervals, and observers.
   */
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    this.onDestroy();
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = '';
      this.container.removeAttribute('role');
      this.container.removeAttribute('aria-label');
      this.container.removeAttribute('tabindex');
    }
    this.container = null;
  }

  /**
   * Hook for sub-classes to clean up event listeners, timers, etc.
   */
  onDestroy() {
    // Override in sub-classes
  }
}
