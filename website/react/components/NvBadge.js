/**
 * NvBadge
 * =======
 * Stateless badge component that maps to `.nv-badge` + `data-variant`.
 *
 * Props
 * -----
 *   variant   {"info"|"success"|"warning"|"error"|"neutral"}
 *   className {string}
 *   children  {ReactNode}
 */

import React from "../../vendor/react.esm.js";

export function NvBadge({ variant = "info", className = "", children }) {
  return React.createElement(
    "span",
    {
      className: `nv-badge ${className}`.trim(),
      "data-variant": variant,
    },
    children
  );
}
