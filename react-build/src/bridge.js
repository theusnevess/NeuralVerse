/**
 * NeuralVerse React Island Bridge
 * ================================
 * Stable, idempotent API for the existing vanilla-JS application to
 * mount, update, and unmount React islands inside plain DOM containers.
 *
 * Contract
 * --------
 *   mount(container, Component, props)   → mounts or reuses existing root
 *   update(container, Component, props)  → re-renders with new props
 *   unmount(container)                   → unmounts and cleans up
 *
 * If this bundle fails for any reason, the vanilla-JS fallback in
 * retrieval-playground.js takes over automatically.
 *
 * Ownership
 * ---------
 *   Bridge owns: React root lifecycle only
 *   Caller owns: container DOM, props construction, business logic,
 *                persistence, retrieval, routing
 */

import { createRoot } from 'react-dom/client'
import React from 'react'

/** @type {WeakMap<Element, import('react-dom/client').Root>} */
const _roots = new WeakMap()

export function mount(container, Component, props = {}) {
  if (!container || !Component) return
  try {
    let root = _roots.get(container)
    if (!root) {
      root = createRoot(container)
      _roots.set(container, root)
    }
    root.render(React.createElement(Component, props))
  } catch (err) {
    if (window.NV_DEBUG) console.warn('[NvBridge] mount failed:', err)
  }
}

export function update(container, Component, props = {}) {
  mount(container, Component, props)
}

export function unmount(container) {
  if (!container) return
  try {
    const root = _roots.get(container)
    if (root) {
      root.unmount()
      _roots.delete(container)
    }
  } catch (err) {
    if (window.NV_DEBUG) console.warn('[NvBridge] unmount failed:', err)
  }
}
