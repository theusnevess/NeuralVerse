/**
 * NvMicroViz
 * ==========
 * Wrapper that renders a pre-built microvisualization HTML string inside a
 * safe container.  The HTML is produced by the existing vanilla-JS renderers
 * (renderRelevanceMeter, renderConnectivityScore, etc.) and must remain
 * controlled by the JS domain layer.
 *
 * This component is intentionally a thin wrapper — it does NOT re-implement
 * the microvisualizations; it only places them into the React tree correctly.
 *
 * Props
 * -----
 *   html      {string}  Pre-rendered microvisualization HTML (from JS layer)
 *   className {string}
 *   ariaLabel {string}
 */

import React from "../../vendor/react.esm.js";

export function NvMicroViz({ html, className = "", ariaLabel }) {
  if (!html) return null;
  return React.createElement("div", {
    className: `nv-hover-preview__microviz ${className}`.trim(),
    "aria-label": ariaLabel,
    dangerouslySetInnerHTML: { __html: html },
  });
}
