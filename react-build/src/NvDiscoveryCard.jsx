/**
 * NvDiscoveryCard Island
 * ======================
 * React presentation for Retrieval Workspace discovery/recommendation cards.
 *
 * JS owns recommendation data, action execution, persistence, graph sync,
 * inspector sync, and preview payloads. This island only renders and emits
 * action callbacks.
 */

import React, { useState } from 'react'
import { NvBadge, NvButton, NvScientificIcon } from './components.jsx'

export function NvDiscoveryCard({ data = {}, callbacks = {} }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const {
    variant = 'standard',
    reference = {},
    reasonLabel = 'Contextual match',
    description = '',
    relationshipCount = 0,
    relevanceHtml = '',
    densityHtml = '',
    connectivityHtml = '',
    clusterHtml = '',
    microvisualization = '',
    iconPath = 'assets/icons/scientific/inspector/reference-details.svg',
    isPinned = false,
    showDescription = true,
    actions = ['preview', 'open', 'pin'],
    previewId = '',
  } = data
  const actionSet = new Set(actions)
  const refId = reference.id || ''
  const title = reference.title || 'Untitled reference'
  const type = reference.type || 'reference'
  const { onAction } = callbacks

  const emit = (action, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    if (typeof onAction === 'function') onAction(action, refId, data)
  }

  const openPanel = () => {
    if (typeof onAction === 'function') onAction('open', refId, data)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openPanel()
    }
  }

  return (
    <article
      className={`nv-discovery-panel nv-discovery-panel--${variant}`}
      data-ref-id={refId}
      data-preview-ref={refId}
      tabIndex={0}
      aria-labelledby={`discovery-title-${refId}`}
      onClick={(event) => {
        if (event.target.closest('button')) return
        openPanel()
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="nv-discovery-panel__icon">
        <NvScientificIcon iconPath={iconPath} />
      </div>
      <div className="nv-discovery-panel__body">
        <div className="nv-discovery-panel__meta">
          <NvBadge variant="info">{type}</NvBadge>
          <span className="nv-discovery-panel__reason">{reasonLabel}</span>
        </div>
        <h4 className="nv-discovery-panel__title" id={`discovery-title-${refId}`}>{title}</h4>
        {showDescription && variant !== 'compact' && description && (
          <p className="nv-discovery-panel__description">{description}</p>
        )}
        <div className="nv-discovery-panel__metrics" aria-label="Recommendation metrics">
          <span>{relationshipCount} relationships</span>
          {relevanceHtml && <span dangerouslySetInnerHTML={{ __html: relevanceHtml }} />}
          {densityHtml && <span dangerouslySetInnerHTML={{ __html: densityHtml }} />}
          {connectivityHtml && <span dangerouslySetInnerHTML={{ __html: connectivityHtml }} />}
          {clusterHtml && <span dangerouslySetInnerHTML={{ __html: clusterHtml }} />}
        </div>
        {microvisualization && (
          <div className="nv-discovery-panel__microvisualization" dangerouslySetInnerHTML={{ __html: microvisualization }} />
        )}
        <div className="nv-discovery-panel__preview" id={previewId} hidden={!isPreviewOpen}>
          <strong>{title}</strong>
          <span>{description || 'No additional preview available.'}</span>
        </div>
        <div className="nv-discovery-panel__actions">
          {actionSet.has('preview') && (
            <NvButton
              variant="ghost"
              className="nv-discovery-panel__action"
              ariaLabel={`Preview ${title}`}
              onClick={(event) => {
                event.stopPropagation()
                setIsPreviewOpen(open => !open)
              }}
            >
              Preview
            </NvButton>
          )}
          {actionSet.has('open') && (
            <NvButton variant="primary" className="nv-discovery-panel__action" onClick={(event) => emit('open', event)}>
              Open
            </NvButton>
          )}
          {actionSet.has('pin') && (
            <NvButton variant="secondary" className="nv-discovery-panel__action" onClick={(event) => emit('pin', event)}>
              {isPinned ? 'Unpin' : 'Pin'}
            </NvButton>
          )}
          {actionSet.has('compare') && (
            <NvButton variant="secondary" className="nv-discovery-panel__action" onClick={(event) => emit('compare', event)}>
              Compare
            </NvButton>
          )}
          <button
            className="nv-button nv-discovery-panel__action nv-context-menu-trigger"
            data-variant="ghost"
            data-context-menu-trigger
            data-ref-id={refId}
            type="button"
            aria-label={`More actions for ${title}`}
            onClick={(event) => {
              event.stopPropagation()
            }}
          >
            More
          </button>
        </div>
      </div>
    </article>
  )
}
