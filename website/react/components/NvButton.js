/**
 * NvButton
 * ========
 * Stateless button component that consumes the NeuralVerse `.nv-button` token
 * and `data-variant` attribute pattern already established in components.css.
 *
 * Props
 * -----
 *   variant   {"primary"|"secondary"|"ghost"}  maps to data-variant
 *   disabled  {boolean}
 *   onClick   {Function}
 *   className {string}
 *   children  {ReactNode}
 *   type      {"button"|"submit"|"reset"}  default: "button"
 *   ariaLabel {string}
 */

import React from "../../vendor/react.esm.js";

export function NvButton({
  variant = "secondary",
  disabled = false,
  onClick,
  className = "",
  children,
  type = "button",
  ariaLabel,
}) {
  return React.createElement(
    "button",
    {
      className: `nv-button ${className}`.trim(),
      "data-variant": variant,
      disabled,
      onClick,
      type,
      "aria-label": ariaLabel,
    },
    children
  );
}
