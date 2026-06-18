/**
 * NeuralVerse Motion Foundation — NV-600.1
 * ========================================
 * Lightweight React presentation primitives.
 *
 * React owns composition only. CSS tokens own timing/easing.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const DEFAULT_MOTION_CONFIG = {
  reducedMotion: false,
  durations: {
    hover: 'var(--motion-duration-hover)',
    state: 'var(--motion-duration-state)',
    enter: 'var(--motion-duration-enter)',
    exit: 'var(--motion-duration-exit)',
    page: 'var(--motion-duration-page)',
  },
  easing: {
    standard: 'var(--motion-easing-standard)',
    emphasized: 'var(--motion-easing-emphasized)',
    decelerate: 'var(--motion-easing-decelerate)',
    accelerate: 'var(--motion-easing-accelerate)',
  },
}

const MotionContext = createContext(DEFAULT_MOTION_CONFIG)

export function NvMotionProvider({ children, config = {} }) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(Boolean(query.matches))
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  const value = useMemo(() => ({
    ...DEFAULT_MOTION_CONFIG,
    ...config,
    reducedMotion,
  }), [config, reducedMotion])

  return (
    <MotionContext.Provider value={value}>
      {children}
    </MotionContext.Provider>
  )
}

export function useNvMotion() {
  return useContext(MotionContext)
}

export function NvMotionConfig({ children, config = {} }) {
  const parent = useNvMotion()
  const value = useMemo(() => ({ ...parent, ...config }), [parent, config])
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}

function motionClass(base, className = '') {
  return `nv-motion ${base} ${className}`.trim()
}

function MotionWrap({ as: Tag = 'div', className = '', children, motionClassName, ...props }) {
  return (
    <Tag className={motionClass(motionClassName, className)} {...props}>
      {children}
    </Tag>
  )
}

export function NvFadeIn({ children, as = 'div', className = '', ...props }) {
  return <MotionWrap as={as} className={className} motionClassName="nv-motion-fade-in" {...props}>{children}</MotionWrap>
}

export function NvFadeOut({ children, as = 'div', className = '', ...props }) {
  return <MotionWrap as={as} className={className} motionClassName="nv-motion-fade-out" {...props}>{children}</MotionWrap>
}

export function NvSlideReveal({ children, as = 'div', className = '', ...props }) {
  return <MotionWrap as={as} className={className} motionClassName="nv-motion-slide-reveal" {...props}>{children}</MotionWrap>
}

export function NvScaleIn({ children, as = 'div', className = '', ...props }) {
  return <MotionWrap as={as} className={className} motionClassName="nv-motion-scale-in" {...props}>{children}</MotionWrap>
}

export function NvCollapse({ children, as = 'div', className = '', expanded = true, ...props }) {
  return (
    <MotionWrap
      as={as}
      className={className}
      motionClassName="nv-motion-collapse"
      aria-hidden={expanded ? undefined : 'true'}
      data-expanded={expanded ? 'true' : 'false'}
      {...props}
    >
      {expanded ? children : null}
    </MotionWrap>
  )
}

export function NvPresence({ children, present = true, as = 'div', className = '', ...props }) {
  if (!present) return null
  return <MotionWrap as={as} className={className} motionClassName="nv-motion-presence" {...props}>{children}</MotionWrap>
}

export function NvSharedTransition({ children, as = 'div', className = '', ...props }) {
  return <MotionWrap as={as} className={className} motionClassName="nv-motion-shared-transition" {...props}>{children}</MotionWrap>
}

export function NvStaggerGroup({ children, as: Tag = 'div', className = '', step = 'var(--motion-duration-stagger-step)', ...props }) {
  const motion = useNvMotion()
  const items = React.Children.toArray(children)
  return (
    <Tag className={motionClass('nv-motion-stagger-group', className)} style={{ '--nv-motion-stagger-step': motion.reducedMotion ? '0ms' : step }} {...props}>
      {items.map((child, index) => (
        React.isValidElement(child)
          ? React.cloneElement(child, {
              style: {
                ...(child.props.style || {}),
                '--nv-motion-stagger-index': motion.reducedMotion ? 0 : index,
              },
            })
          : child
      ))}
    </Tag>
  )
}
