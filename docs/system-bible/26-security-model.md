# Security Model

## Overview

NeuralVerse operates entirely client-side with no backend, no authentication, and no external API calls. The security model focuses on preventing XSS, content injection, and governance violations.

## Sanitization

- All curriculum content Markdown is converted to HTML through a controlled `markdownToHtml()` function that only allows safe HTML tags
- User-provided text (notes, tags) is stored as strings and rendered as text content, not innerHTML
- Agent responses use templated section rendering, not raw HTML injection

## XSS Prevention

The system prevents cross-site scripting through multiple layers:

1. **HTML rendering**: Custom markdown parser generates only safe elements (p, ul, ol, li, pre, code, table, blockquote, h2-h4, a with href)
2. **No `innerHTML` on user input**: Notes and tags use `textContent` for display
3. **No `eval()` or equivalent**: The codebase contains no `eval()`, `Function()`, `setTimeout(string)`, or dynamic code execution
4. **Guardrails**: Agent system checks queries for XSS patterns (`<script>`, `javascript:`, `onerror=`, `eval(`)

## HTML Handling

- Page templates are HTML partials loaded via `fetch()` and inserted into the DOM
- Template content is trusted (part of the application codebase)
- Dynamic content (curriculum data, agent responses) is rendered through controlled DOM manipulation
- No user-provided HTML is ever rendered

## Governed Refusals

The agent guardrail system refuses requests that attempt:
- Curriculum mutation
- Lifecycle status changes
- Score/grade/mastery claims
- Evidence boundary bypass
- External API calls
- XSS injection
- Hidden recommendations

Refusals include: rule ID, severity level, refusal message, and governance notice.

## Absence of Eval-like Behavior

The codebase has been audited for dynamic code execution:
- No `eval()` calls
- No `Function()` constructor
- No `setTimeout()` or `setInterval()` with string arguments
- No dynamic `import()` with user-controlled paths
- No `with()` statements
- No `document.write()` or `document.writeln()`

## Local-Only State Philosophy

All user data is stored in `localStorage`:
- No data is transmitted over the network
- No cookies are used for tracking
- No third-party analytics or scripts
- No service worker or background sync
- Data is private to the browser/profile

## Security Audit Verification

Security is verified through:
- XSS pattern scanning in audit scripts
- Guardrail effectiveness tests
- `eval()` absence verification
- Governed refusal behavior tests
- Master Certification Gate includes zero-tolerance for security violations

## Related Chapters

- [Governance Model](27-governance-model.md)
- [Didactic Agent Runtime](11-didactic-agent-runtime.md)
- [Testing and Certification](28-testing-and-certification.md)
