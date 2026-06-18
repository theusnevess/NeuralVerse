/**
 * NvContextMenu Island
 * ====================
 * Contextual action menu presentation layer.
 *
 * Island ownership:
 *   - menu layout
 *   - keyboard navigation
 *   - ARIA menu semantics
 *   - visual states
 *
 * JS controller ownership:
 *   - payload construction
 *   - action validity
 *   - action execution
 *   - persistence and Retrieval state
 */

import React, { useEffect, useRef } from 'react'
import { NvScientificIcon, NvMenuGroup, NvMenuItem } from './components.jsx'
import { NvScaleIn } from './motion/NvMotion.jsx'

const DEFAULT_ICON = 'assets/icons/scientific/inspector/reference-details.svg'

function getEnabledItems(menuRef) {
  if (!menuRef.current) return []
  return Array.from(menuRef.current.querySelectorAll('[role="menuitem"]'))
    .filter(item => !item.disabled && item.getAttribute('aria-disabled') !== 'true')
}

function focusItem(items, index) {
  if (!items.length) return
  const nextIndex = (index + items.length) % items.length
  items[nextIndex]?.focus()
}

export function NvContextMenu({ data = {}, callbacks = {} }) {
  const menuRef = useRef(null)
  const {
    id = 'context-menu',
    targetType = 'reference-card',
    title = 'Actions',
    subtitle = '',
    metadata = [],
    iconPath = DEFAULT_ICON,
    actions = [],
  } = data
  const { onAction, onClose } = callbacks
  const enabledActions = actions.filter(action => !action.hidden)

  useEffect(() => {
    const items = getEnabledItems(menuRef)
    window.setTimeout(() => items[0]?.focus(), 0)
  }, [id])

  const handleKeyDown = (event) => {
    const items = getEnabledItems(menuRef)
    const currentIndex = items.indexOf(document.activeElement)

    if (event.key === 'Escape') {
      event.preventDefault()
      if (typeof onClose === 'function') onClose()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusItem(items, currentIndex + 1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusItem(items, currentIndex - 1)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      focusItem(items, 0)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      focusItem(items, items.length - 1)
      return
    }
    if (event.key === 'Tab') {
      if (typeof onClose === 'function') onClose()
    }
  }

  const dispatchAction = (actionId) => {
    if (typeof onAction === 'function') onAction(actionId, data)
  }

  return (
    <NvScaleIn
      as="section"
      className={`nv-context-menu nv-context-menu--${targetType}`}
      role="menu"
      aria-label={`Actions for ${title}`}
      ref={menuRef}
      onKeyDown={handleKeyDown}
      data-target-type={targetType}
    >
      <div className="nv-context-menu__header">
        <span className="nv-context-menu__icon" aria-hidden="true">
          <NvScientificIcon iconPath={iconPath} size="md" />
        </span>
        <div className="nv-context-menu__heading">
          <div className="nv-context-menu__title">{title}</div>
          {subtitle && <div className="nv-context-menu__subtitle">{subtitle}</div>}
        </div>
      </div>

      {metadata.length > 0 && (
        <div className="nv-context-menu__metadata" aria-label="Context metadata">
          {metadata.map((item, index) => (
            <span key={index}>{item}</span>
          ))}
        </div>
      )}

      <NvMenuGroup label="Available actions">
        {enabledActions.map(action => (
          <NvMenuItem key={action.id} action={action} onAction={dispatchAction} />
        ))}
      </NvMenuGroup>
    </NvScaleIn>
  )
}
