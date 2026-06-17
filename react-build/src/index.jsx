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
 *
 * NV-500-UX-007E.6 — Inspector React Modernization
 */

import { mount, update, unmount } from './bridge.js'
import { NvHoverPreview } from './NvHoverPreview.jsx'
import { NvContextMenu } from './NvContextMenu.jsx'
import { NvDiscoveryCard } from './NvDiscoveryCard.jsx'
import {
  NvInspectorPanel,
  NvInspectorHeader,
  NvInspectorBadgeRow,
  NvInspectorMetricRow,
  NvMetricRow,
  NvInspectorActionBar,
  NvInspectorDivider,
  NvInspectorEmptyState,
  NvReferenceInspectorPanel,
  NvEvidenceInspectorPanel,
  NvRelationshipInspectorPanel,
} from './NvInspectorPanel.jsx'
import { NvMemoryLayer, NvMemoryColumn, NvPinnedReferenceItem, NvRecentReferenceItem, NvSavedQueryItem, NvKnowledgeTrailItem } from './NvMemoryLayer.jsx'
import { NvWorkspaceSnapshot, NvSessionStatus, NvResearchStats, NvKnowledgePulse, NvActivityTimelineMini } from './NvWorkspaceSnapshot.jsx'

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

// Inspector island exports
export {
  NvInspectorPanel,
  NvInspectorHeader,
  NvInspectorBadgeRow,
  NvInspectorMetricRow,
  NvMetricRow,
  NvInspectorActionBar,
  NvInspectorDivider,
  NvInspectorEmptyState,
  NvReferenceInspectorPanel,
  NvEvidenceInspectorPanel,
  NvRelationshipInspectorPanel,
}

// Memory island exports
export { NvMemoryLayer, NvMemoryColumn, NvPinnedReferenceItem, NvRecentReferenceItem, NvSavedQueryItem, NvKnowledgeTrailItem }

// Workspace snapshot island exports
export { NvWorkspaceSnapshot, NvSessionStatus, NvResearchStats, NvKnowledgePulse, NvActivityTimelineMini }

// Legacy island exports
export { NvHoverPreview, NvContextMenu, NvDiscoveryCard }

// Bridge exports
export { mount, update, unmount }

// Publish to global namespace — allows non-module scripts to call bridge
window.NeuralVerse = window.NeuralVerse || {}
window.NeuralVerse.react = {
  bridge: { mount, update, unmount },
  islands: {
    NvHoverPreview,
    NvContextMenu,
    NvDiscoveryCard,
    NvInspectorPanel,
    NvMemoryLayer,
    NvWorkspaceSnapshot,
  },
}

if (window.NV_DEBUG) {
  console.log('[NeuralVerse React] Island layer initialized.', {
    islands: Object.keys(window.NeuralVerse.react.islands),
    version: 'local-bundle',
    phase: 'NV-500-UX-007E.6',
  })
}
