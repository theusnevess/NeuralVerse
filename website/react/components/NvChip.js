/**
 * NvChip
 * ======
 * Lightweight inline label chip.  Maps to the `.continuation-chip` token
 * already in retrieval-playground.css; also usable as a generic tag chip.
 *
 * Props
 * -----
 *   variant   {"default"|"accent"}   default: "default"
 *   onClick   {Function|undefined}   if provided, renders as a <button>
 *   className {string}
 *   children  {ReactNode}
 *   ariaLabel {string}
 */

import React from "../../vendor/react.esm.js";

export function NvChip({
  variant = "default",
  onClick,
  className = "",
  children,
  ariaLabel,
}) {
  const baseClass = variant === "accent" ? "continuation-chip" : "nv-chip";
  const tag = onClick ? "button" : "span";

  return React.createElement(
    tag,
    {
      className: `${baseClass} ${className}`.trim(),
      onClick: onClick ?? undefined,
      type: onClick ? "button" : undefined,
      "aria-label": ariaLabel,
    },
    children
  );
}
