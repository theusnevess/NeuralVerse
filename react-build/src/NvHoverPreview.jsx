/**
 * NvHoverPreview Island
 * =====================
 * First production React island — Rich Hover Preview overlay.
 *
 * Island Ownership
 * ----------------
 *   This island OWNS: layout, icon, badge, microvisualization wrapper,
 *   action buttons, ARIA semantics.
 *
 *   JS LAYER owns: activation timing, position calculation, payload
 *   construction, open/pin/close logic, persistence, selection,
 *   retrieval state. Nothing from this file may access any of those.
 *
 * Props contract
 * --------------
 *   data: {
 *     type          {string}   "reference" | "relationship" | "query" | "trail"
 *     eyebrow       {string}
 *     title         {string}
 *     description   {string}
 *     iconPath      {string}   relative asset path
 *     metrics       {string[]}
 *     microvisualizations {string}  pre-built HTML from JS layer
 *     actions       {Array<{action, label, id, variant}>}
 *   }
 *   callbacks: {
 *     onAction      {(action: string, id: string) => void}
 *   }
 */

import React from 'react'
import { NvScientificIcon, NvMicroViz, NvButton } from './components.jsx'

const DEFAULT_ICON = 'assets/icons/scientific/inspector/reference-details.svg'

export function NvHoverPreview({ data = {}, callbacks = {} }) {
  const {
    type = 'reference',
    eyebrow = 'Preview',
    title = 'Untitled reference',
    description = '',
    iconPath = DEFAULT_ICON,
    metrics = [],
    microvisualizations = '',
    actions = [],
  } = data

  const { onAction } = callbacks

  const handleAction = (action, id) => {
    if (typeof onAction === 'function') onAction(action, id)
  }

  return (
    <section
      className={`nv-hover-preview nv-hover-preview--${type}`}
      role="region"
      aria-label={title}
    >
      {/* Header: icon + eyebrow */}
      <div className="nv-hover-preview__header">
        <span className="nv-hover-preview__icon">
          <NvScientificIcon iconPath={iconPath} size="md" />
        </span>
        <span className="nv-hover-preview__eyebrow">{eyebrow}</span>
      </div>

      {/* Title */}
      <h3 className="nv-hover-preview__title">{title}</h3>

      {/* Description */}
      {description && (
        <p className="nv-hover-preview__description">{description}</p>
      )}

      {/* Microvisualizations — pre-rendered HTML from JS domain layer */}
      {microvisualizations && (
        <NvMicroViz html={microvisualizations} ariaLabel="Reference microvisualizations" />
      )}

      {/* Metrics */}
      {metrics.length > 0 && (
        <div className="nv-hover-preview__metrics">
          {metrics.map((metric, i) => (
            <span key={i}>{metric}</span>
          ))}
        </div>
      )}

      {/* Action buttons — callbacks dispatch back to JS layer */}
      {actions.length > 0 && (
        <div className="nv-hover-preview__actions">
          {actions.map((item, i) => (
            <NvButton
              key={i}
              variant={item.variant || 'secondary'}
              className="nv-hover-preview__action"
              onClick={() => handleAction(item.action, item.id)}
            >
              {item.label}
            </NvButton>
          ))}
        </div>
      )}
    </section>
  )
}
