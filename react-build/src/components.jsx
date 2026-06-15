/**
 * NeuralVerse React Islands — Shared Presentation Primitives
 * ===========================================================
 * All components map to existing NeuralVerse CSS token classes.
 * Zero hardcoded colors, spacing, or typography values.
 */

import React from 'react'

// ---------------------------------------------------------------------------
// NvScientificIcon
// Maps to: --nv-scientific-icon-url CSS mask system (scientific-icons.css)
// ---------------------------------------------------------------------------
const SIZE_MAP = { sm: '1rem', md: '1.1rem', lg: '1.35rem' }

export function NvScientificIcon({ iconPath, className = '', label, size = 'md' }) {
  const resolvedPath = String(iconPath || '').startsWith('/') ? iconPath : `/${iconPath}`
  const dim = SIZE_MAP[size] ?? SIZE_MAP.md
  return (
    <span
      className={`nv-scientific-icon nv-discovery-panel__icon-glyph ${className}`.trim()}
      style={{ '--nv-scientific-icon-url': `url('${resolvedPath}')`, display: 'inline-block', width: dim, height: dim }}
      aria-hidden={label ? undefined : 'true'}
      aria-label={label ?? undefined}
      role={label ? 'img' : undefined}
    />
  )
}

// ---------------------------------------------------------------------------
// NvButton
// Maps to: .nv-button[data-variant] (components.css)
// ---------------------------------------------------------------------------
export function NvButton({ variant = 'secondary', disabled = false, onClick, className = '', children, type = 'button', ariaLabel }) {
  return (
    <button
      className={`nv-button ${className}`.trim()}
      data-variant={variant}
      disabled={disabled}
      onClick={onClick}
      type={type}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// NvBadge
// Maps to: .nv-badge[data-variant] (components.css)
// ---------------------------------------------------------------------------
export function NvBadge({ variant = 'info', className = '', children }) {
  return (
    <span className={`nv-badge ${className}`.trim()} data-variant={variant}>
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// NvChip
// Maps to: .continuation-chip (accent) | .nv-chip (default)
// ---------------------------------------------------------------------------
export function NvChip({ variant = 'default', onClick, className = '', children, ariaLabel }) {
  const baseClass = variant === 'accent' ? 'continuation-chip' : 'nv-chip'
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      className={`${baseClass} ${className}`.trim()}
      onClick={onClick ?? undefined}
      type={onClick ? 'button' : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  )
}

// ---------------------------------------------------------------------------
// NvMetric — single metric label inside hover preview
// ---------------------------------------------------------------------------
export function NvMetric({ label, className = '' }) {
  if (!label) return null
  return <span className={`nv-metric ${className}`.trim()}>{label}</span>
}

// ---------------------------------------------------------------------------
// NvMicroViz — thin wrapper for pre-rendered HTML from the JS domain layer
// IMPORTANT: only accepts output from NeuralVerse's own rendering functions.
// ---------------------------------------------------------------------------
export function NvMicroViz({ html, className = '', ariaLabel }) {
  if (!html) return null
  return (
    <div
      className={`nv-hover-preview__microviz ${className}`.trim()}
      aria-label={ariaLabel}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// ---------------------------------------------------------------------------
// NvCardShell
// Maps to: .nv-card[.nv-card--selected] (components.css)
// ---------------------------------------------------------------------------
export function NvCardShell({ selected = false, onClick, className = '', children, ariaLabel, role = 'article' }) {
  const interactiveProps = onClick
    ? { onClick, tabIndex: 0, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e) } } }
    : {}
  return (
    <div
      className={`nv-card ${selected ? 'nv-card--selected' : ''} ${className}`.trim()}
      role={role}
      aria-label={ariaLabel}
      aria-selected={selected ? 'true' : undefined}
      {...interactiveProps}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// NvEmptyState
// Maps to: .nv-empty-state (components.css)
// ---------------------------------------------------------------------------
export function NvEmptyState({ icon, title, subtitle, actions, className = '' }) {
  return (
    <div className={`nv-empty-state ${className}`.trim()}>
      {icon && <div className="nv-empty-state-icon" aria-hidden="true">{icon}</div>}
      {title && (
        <p className="nv-muted" style={{ fontSize: 'var(--sys-font-body-size)', fontWeight: 'var(--ref-font-weight-medium)', color: 'var(--sys-color-text-primary)', marginBottom: 'var(--sys-space-stack-xs)' }}>
          {title}
        </p>
      )}
      {subtitle && (
        <p className="nv-muted" style={{ fontSize: 'var(--sys-font-caption-size)', margin: 0 }}>
          {subtitle}
        </p>
      )}
      {actions && (
        <div className="graph-empty-actions" style={{ marginTop: 'var(--sys-space-stack-sm)' }}>
          {actions}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// NvSectionHeader
// Maps to: .discovery-section-title (retrieval-playground.css)
// ---------------------------------------------------------------------------
export function NvSectionHeader({ label, trailing, className = '', level = 3 }) {
  const Tag = `h${level}`
  return (
    <Tag className={`discovery-section-title ${className}`.trim()}>
      {label}
      {trailing}
    </Tag>
  )
}

// ---------------------------------------------------------------------------
// NvMenuGroup — contextual menu grouping primitive
// ---------------------------------------------------------------------------
export function NvMenuGroup({ label, children, className = '' }) {
  return (
    <div className={`nv-context-menu__group ${className}`.trim()} role="group" aria-label={label}>
      {label && <div className="nv-context-menu__group-label">{label}</div>}
      <div className="nv-context-menu__items">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// NvMenuItem — button-backed menu item with token-driven styling
// ---------------------------------------------------------------------------
export function NvMenuItem({ action, onAction }) {
  if (!action) return null
  const {
    id,
    label,
    iconPath,
    variant = 'default',
    disabled = false,
    shortcut = '',
  } = action

  return (
    <button
      className="nv-context-menu__item"
      data-variant={variant}
      data-action-id={id}
      disabled={disabled}
      aria-disabled={disabled ? 'true' : undefined}
      role="menuitem"
      type="button"
      onClick={() => {
        if (!disabled && typeof onAction === 'function') onAction(id)
      }}
    >
      {iconPath && (
        <span className="nv-context-menu__item-icon" aria-hidden="true">
          <NvScientificIcon iconPath={iconPath} size="sm" />
        </span>
      )}
      <span className="nv-context-menu__item-label">{label}</span>
      {shortcut && <span className="nv-context-menu__item-shortcut">{shortcut}</span>}
    </button>
  )
}
