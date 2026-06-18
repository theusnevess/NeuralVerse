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
 * NV-600.1 — Motion Foundation
 */

import { mount, update, unmount } from './bridge.js'
import React from 'react'
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
import {
  NvCompareWorkspace,
  NvCompareTray,
  NvCompareColumn,
  NvCompareMatrix,
  NvCompareSection,
  NvCompareMetricRow,
  NvCompareSharedConcepts,
  NvCompareUniqueRelationships,
  NvCompareEvidenceContribution,
  NvCompareGraphPosition,
  NvCompareActions,
  NvCompareConvergenceLine,
  NvCompareSemanticDiff,
  NvCompareEvidenceOverlap,
  NvCompareGraphSyncStatus,
  NvCompareSetManager,
  NvCompareEmptyState,
  NvCompareSynthesisPanel,
  NvCompareSynthesisSummary,
  NvCompareSynthesisActions,
  NvSharedSupportReferences,
  NvDivergentEvidenceNotes,
  NvSourceContributionMap,
  NvSynthesisConfidenceSummary,
  NvExportReadyEvidenceBlock,
} from './NvCompareWorkspace.jsx'
import {
  NvResearchPresentation,
  NvPresentationExecutiveSummary,
  NvPresentationNarrative,
  NvPresentationTimeline,
  NvPresentationEvidenceGallery,
  NvPresentationReferenceList,
  NvPresentationComparisonSummary,
  NvPresentationConvergenceMap,
  NvPresentationSessionState,
  NvPresentationSnapshotBlock,
  NvPresentationActions,
} from './NvResearchPresentation.jsx'
import {
  NvWorkspaceSnapshot,
  NvActiveInvestigation,
  NvResearchHealth,
  NvSessionTimeline,
  NvKnowledgePulse,
  NvSnapshotActions,
  NvResearchHealthMetric,
  NvTimelineEventCompact,
  NvSessionStatus,
  NvResearchStats,
  NvActivityTimelineMini,
} from './NvWorkspaceSnapshot.jsx'
import {
  NvMotionProvider,
  NvMotionConfig,
  NvFadeIn,
  NvFadeOut,
  NvSlideReveal,
  NvScaleIn,
  NvCollapse,
  NvPresence,
  NvSharedTransition,
  NvStaggerGroup,
  useNvMotion,
} from './motion/NvMotion.jsx'

function withMotionProvider(Component) {
  return function NvMotionIsland(props) {
    return (
      <NvMotionProvider>
        <Component {...props} />
      </NvMotionProvider>
    )
  }
}

const MotionHoverPreview = withMotionProvider(NvHoverPreview)
const MotionContextMenu = withMotionProvider(NvContextMenu)
const MotionDiscoveryCard = withMotionProvider(NvDiscoveryCard)
const MotionInspectorPanel = withMotionProvider(NvInspectorPanel)
const MotionMemoryLayer = withMotionProvider(NvMemoryLayer)
const MotionWorkspaceSnapshot = withMotionProvider(NvWorkspaceSnapshot)
const MotionCompareWorkspace = withMotionProvider(NvCompareWorkspace)
const MotionResearchPresentation = withMotionProvider(NvResearchPresentation)

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
export {
  NvWorkspaceSnapshot,
  NvActiveInvestigation,
  NvResearchHealth,
  NvSessionTimeline,
  NvKnowledgePulse,
  NvSnapshotActions,
  NvResearchHealthMetric,
  NvTimelineEventCompact,
  NvSessionStatus,
  NvResearchStats,
  NvActivityTimelineMini,
}

// Motion foundation exports
export {
  NvMotionProvider,
  NvMotionConfig,
  NvFadeIn,
  NvFadeOut,
  NvSlideReveal,
  NvScaleIn,
  NvCollapse,
  NvPresence,
  NvSharedTransition,
  NvStaggerGroup,
  useNvMotion,
}

// Semantic compare island exports
export {
  NvCompareWorkspace,
  NvCompareTray,
  NvCompareColumn,
  NvCompareMatrix,
  NvCompareSection,
  NvCompareMetricRow,
  NvCompareSharedConcepts,
  NvCompareUniqueRelationships,
  NvCompareEvidenceContribution,
  NvCompareGraphPosition,
  NvCompareActions,
  NvCompareConvergenceLine,
  NvCompareSemanticDiff,
  NvCompareEvidenceOverlap,
  NvCompareGraphSyncStatus,
  NvCompareSetManager,
  NvCompareEmptyState,
  NvCompareSynthesisPanel,
  NvCompareSynthesisSummary,
  NvCompareSynthesisActions,
  NvSharedSupportReferences,
  NvDivergentEvidenceNotes,
  NvSourceContributionMap,
  NvSynthesisConfidenceSummary,
  NvExportReadyEvidenceBlock,
}

// Legacy island exports
export { NvHoverPreview, NvContextMenu, NvDiscoveryCard }

// Presentation island exports
export {
  NvResearchPresentation,
  NvPresentationExecutiveSummary,
  NvPresentationNarrative,
  NvPresentationTimeline,
  NvPresentationEvidenceGallery,
  NvPresentationReferenceList,
  NvPresentationComparisonSummary,
  NvPresentationConvergenceMap,
  NvPresentationSessionState,
  NvPresentationSnapshotBlock,
  NvPresentationActions,
}

// Bridge exports
export { mount, update, unmount }

// Publish to global namespace — allows non-module scripts to call bridge
window.NeuralVerse = window.NeuralVerse || {}
window.NeuralVerse.react = {
  bridge: { mount, update, unmount },
  islands: {
    NvHoverPreview: MotionHoverPreview,
    NvContextMenu: MotionContextMenu,
    NvDiscoveryCard: MotionDiscoveryCard,
    NvInspectorPanel: MotionInspectorPanel,
    NvMemoryLayer: MotionMemoryLayer,
    NvWorkspaceSnapshot: MotionWorkspaceSnapshot,
    NvCompareWorkspace: MotionCompareWorkspace,
    NvResearchPresentation: MotionResearchPresentation,
  },
  motion: {
    NvMotionProvider,
    NvMotionConfig,
    NvFadeIn,
    NvFadeOut,
    NvSlideReveal,
    NvScaleIn,
    NvCollapse,
    NvPresence,
    NvSharedTransition,
    NvStaggerGroup,
  },
}

if (window.NV_DEBUG) {
  console.log('[NeuralVerse React] Island layer initialized.', {
    islands: Object.keys(window.NeuralVerse.react.islands),
    version: 'local-bundle',
    phase: 'NV-600.1',
  })
}
