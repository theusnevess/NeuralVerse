# ARCHITECTURE_REVIEW.md

## Purpose

This document defines the architecture review process required before implementation begins or changes are merged.

---

## Review Process

```text
Proposal Submitted
↓
Canonical Alignment Check
↓
Registry Check
↓
Contract Check
↓
Accessibility Check
↓
Motion Check
↓
Documentation Check
↓
Decision
```

---

## Mandatory First Step

Canonical Alignment Check must occur before all other review steps.

---

## Approval Criteria

A proposal passes only if:

```text
It respects canonical hierarchy.
It has required registry entries.
It uses approved tokens.
It satisfies accessibility requirements.
It does not introduce unauthorized scope.
It does not create educational content during restricted phases.
It does not introduce backend, APIs, databases, authentication, or unauthorized technologies.
```

---

## Escalation Rules

Escalate to HUB when:

```text
Canonical conflict exists.
Scope expansion is detected.
A registry exception is requested.
A design decision must be reinterpreted.
A major accessibility tradeoff exists.
A new technology is proposed.
```

---

## Review Status Model

```text
Approved
Approved With Conditions
Needs Revision
Rejected
Blocked
```

---

## Review Log

```text
Initial bootstrap:
Created as part of NV-023-TASK-001.
```
