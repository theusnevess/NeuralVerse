/**
 * NeuralVerse React Island Bridge
 * ================================
 * Provides a stable, idempotent API for the existing vanilla-JS application
 * layer to mount, update, and unmount React islands inside plain DOM containers.
 *
 * Contract
 * --------
 *   mount(container, IslandComponent, props)  → mounts or re-uses an existing root
 *   update(container, IslandComponent, props) → re-renders the existing island with new props
 *   unmount(container)                        → unmounts and clears the React root
 *
 * If React fails to load for any reason, every call is a safe no-op.
 * The existing vanilla-JS application always remains functional.
 *
 * Ownership Rules
 * ---------------
 *   Bridge owns: React root lifecycle
 *   Caller owns: container DOM node, component props construction,
 *                business logic, persistence, retrieval state, routing
 */

import { createRoot } from "../vendor/react-dom.esm.js";
import React from "../vendor/react.esm.js";

/** @type {WeakMap<Element, import("react-dom/client").Root>} */
const _roots = new WeakMap();

/**
 * Mount or reuse a React root inside `container`.
 * If a root already exists for this container it is reused (idempotent).
 *
 * @param {Element} container  - Host DOM element
 * @param {Function} Component - React function component
 * @param {object} props       - Plain serialisable props
 */
export function mount(container, Component, props = {}) {
  if (!container || !Component) return;
  try {
    let root = _roots.get(container);
    if (!root) {
      root = createRoot(container);
      _roots.set(container, root);
    }
    root.render(React.createElement(Component, props));
  } catch (err) {
    // Graceful failure — vanilla JS fallback remains active
    if (window.NV_DEBUG) {
      console.warn("[NvBridge] mount failed:", err);
    }
  }
}

/**
 * Update props on an already-mounted island.
 * Falls back to mount() if no root exists yet.
 *
 * @param {Element} container  - Host DOM element
 * @param {Function} Component - React function component
 * @param {object} props       - Updated plain serialisable props
 */
export function update(container, Component, props = {}) {
  // React's render() is idempotent for re-renders; reuse mount logic.
  mount(container, Component, props);
}

/**
 * Unmount the React root at `container` and clean up.
 *
 * @param {Element} container - Host DOM element
 */
export function unmount(container) {
  if (!container) return;
  try {
    const root = _roots.get(container);
    if (root) {
      root.unmount();
      _roots.delete(container);
    }
  } catch (err) {
    if (window.NV_DEBUG) {
      console.warn("[NvBridge] unmount failed:", err);
    }
  }
}
