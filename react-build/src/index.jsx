/**
 * NeuralVerse React Islands — Entry Point
 * ========================================
 * This file is the single entry that Vite bundles into website/dist/react-islands.js.
 * It publishes window.NeuralVerse.react so vanilla-JS controllers can call
 * bridge.mount / bridge.update / bridge.unmount without any build-time coupling.
 *
 * The IIFE bundle is fully self-contained:
 *   - React 19 bundled in
 *   - ReactDOM bundled in
 *   - Zero CDN or external runtime dependencies
 */

import { mount, update, unmount } from './bridge.js'
import { NvHoverPreview } from './NvHoverPreview.jsx'
import { NvContextMenu } from './NvContextMenu.jsx'
import { NvDiscoveryCard } from './NvDiscoveryCard.jsx'

// Shared component exports (available for future host-page usage)
export {
  NvButton,
  NvActionGroup,
  NvBadge,
  NvChip,
  NvContributionBar,
  NvMetric,
  NvMicroViz,
  NvCardShell,
  NvEmptyState,
  NvInspectorSection,
  NvMemoryCard,
  NvMenuGroup,
  NvMenuItem,
  NvSectionHeader,
  NvScientificIcon,
  NvStatusPill,
} from './components.jsx'

// Island exports
export { NvHoverPreview, NvContextMenu, NvDiscoveryCard }

// Bridge exports
export { mount, update, unmount }

// Publish to global namespace — allows non-module scripts to call bridge
window.NeuralVerse = window.NeuralVerse || {}
window.NeuralVerse.react = {
  bridge: { mount, update, unmount },
  islands: { NvHoverPreview, NvContextMenu, NvDiscoveryCard },
}

if (window.NV_DEBUG) {
  console.log('[NeuralVerse React] Island layer initialized.', {
    islands: Object.keys(window.NeuralVerse.react.islands),
    version: 'local-bundle',
  })
}
