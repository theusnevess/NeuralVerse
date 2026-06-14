/**
 * NvSectionHeader
 * ===============
 * Compact labelled section header with optional trailing element.
 * Maps to `.discovery-section-title` decoration pattern.
 *
 * Props
 * -----
 *   label     {string}    Section title text
 *   trailing  {ReactNode} Optional trailing element (badge, count, etc.)
 *   className {string}
 *   level     {2|3|4|5}   heading level (default: 3)
 */

import React from "../../vendor/react.esm.js";

export function NvSectionHeader({ label, trailing, className = "", level = 3 }) {
  return React.createElement(
    `h${level}`,
    { className: `discovery-section-title ${className}`.trim() },
    label,
    trailing && React.createElement(React.Fragment, null, trailing)
  );
}
