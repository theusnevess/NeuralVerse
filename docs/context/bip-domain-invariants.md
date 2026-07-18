# BIP Domain Invariants

Task: `NV-BIP-M4-IMPLEMENT`

Date: 2026-07-18

## Content Invariants

1. A package has stable identity
2. A version belongs to exactly one package
3. A package cannot contain two versions with the same identity
4. Published versions are immutable (add_block, reorder_block blocked)
5. A correction creates a new version with incremented revision
6. Lifecycle transitions occur only through explicit commands
7. Block ordering is explicit via SequencePosition

## Curriculum Invariants

8. Source and target cannot be identical for self-loop edges
9. Required depth must be non-negative
10. Edge identity is stable
11. Display-title changes do not change node identity

## Source/Citation Invariants

12. Citation references an existing source ID
13. Source identity does not depend on title
14. Citation identity does not depend on rendered citation text

## Asset Invariants

15. Content references resolve to an exact AssetVersionId
16. AssetVersion references exactly one asset

## Laboratory Invariants

17. LaboratoryRun references an exact LaboratorySpec version

## Assessment Invariants

18. AssessmentAttempt references an exact AssessmentSpec version

## Learner Invariants

19. Learner interactions reference the exact content version viewed (ContentVersionId)
20. Learner identity is independent from session identity

## Publication Invariants

21. A PublicationRelease cannot reference a mutable draft version
22. Published block ordering cannot be changed
23. Published source/citation relationships cannot be changed
24. Published asset-version references cannot be changed
25. Published laboratory-spec references cannot be changed
26. Published assessment-spec references cannot be changed

## Identity Invariants

27. Identifier families are not interchangeable
28. Domain reconstruction preserves supplied IDs
29. Display-title changes do not alter IDs

## Lifecycle Invariants

30. Invalid lifecycle transitions return typed domain failures
31. Each lifecycle operation validates current state and required evidence

## Architecture Invariants

32. Domain imports no FastAPI
33. Domain imports no SQLAlchemy
34. Domain imports no Alembic
35. Domain imports no Temporal SDK
36. Domain imports no ACP
37. Bounded-context private modules are not imported across contexts
