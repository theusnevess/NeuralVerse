/**
 * NeuralVerse Background Foundation — NV-600.2
 * ============================================
 * Presentation-only React helpers for applying shared background profiles.
 *
 * React owns composition only. CSS owns visual layers and motion behavior.
 */

import React from 'react'

const ALLOWED_PROFILES = new Set([
  'default',
  'home',
  'learning',
  'modules',
  'workspace',
  'retrieval',
  'presentation',
  'settings',
  'landing',
])

function resolveProfile(profile) {
  return ALLOWED_PROFILES.has(profile) ? profile : 'default'
}

export function NvBackgroundProvider({ children, profile = 'default', className = '' }) {
  const resolvedProfile = resolveProfile(profile)

  return (
    <div className={`nv-background-provider ${className}`.trim()} data-background-profile={resolvedProfile}>
      {children}
    </div>
  )
}

export function NvBackgroundSurface({ children, profile, as: Tag = 'section', className = '', labelledBy, ariaLabel }) {
  const profileAttr = profile ? { 'data-background-profile': resolveProfile(profile) } : {}

  return (
    <Tag
      className={`nv-background-surface ${className}`.trim()}
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      {...profileAttr}
    >
      {children}
    </Tag>
  )
}

export function NvBackgroundProfile({ profile = 'default', children, className = '' }) {
  return (
    <div className={`nv-background-profile ${className}`.trim()} data-background-profile={resolveProfile(profile)}>
      {children}
    </div>
  )
}
