# NV-1100-P5 — Spaced Repetition Engine Validator Report

**Generated**: 2026-06-26T23:03:07.737Z
**Decision**: ✅ READY

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| Info | 0 |
| Checks Passed | 49/49 |

## SM-2 Fixtures

| Fixture | Expected | Actual | OK |
|---------|----------|--------|----|
| first grade-5 review | {"reps":1,"interval":1,"ease":2.6} | {"reps":1,"interval":1,"ease":2.6} | ✅ |
| second grade-5 review | {"reps":2,"interval":6} | {"reps":2,"interval":6} | ✅ |
| third grade-5 review | {"reps":3,"interval":16} | {"reps":3,"interval":16} | ✅ |
| failed review resets | {"reps":0,"interval":1} | {"reps":0,"interval":1} | ✅ |
| ease factor floor 1.3 | {"minEase":1.3} | {"minEase":1.3} | ✅ |
| grade 3 counts as pass | {"reps":2,"interval":6} | {"reps":2,"interval":6} | ✅ |
| grade 2 is fail | {"reps":0,"interval":1} | {"reps":0,"interval":1} | ✅ |
| ease factor growth | {"lastEase":2.8} | {"lastEase":2.8} | ✅ |
| history chronological | {"count":3,"ordered":true} | {"count":3,"ordered":true} | ✅ |
| quality clamping | {"q7":5,"qn1":0} | {"q7":5,"qn1":0} | ✅ |
| determinism | {"equal":true} | {"equal":true} | ✅ |
| long run stability | {"easeMin":1.3} | {"easeMin":7.5} | ✅ |
| queue ordering | ["flashcard:overdue","flashcard:due-today","artifact:reviewed-today","flashcard:upcoming"] | ["flashcard:overdue","flashcard:due-today","artifact:reviewed-today","flashcard:upcoming"] | ✅ |
| daily limit cap | 50 | 50 | ✅ |
| round-trip | {"ok":true} | {"ok":true} | ✅ |
| merge newer-wins | {"reps":3} | {"reps":3} | ✅ |
| merge union | {"ids":2} | {"ids":2} | ✅ |
| history dedup | {"count":2} | {"count":2} | ✅ |
| history sorted | {"first":"2026-06-24T10:00:00.000Z"} | {"first":"2026-06-24T10:00:00.000Z"} | ✅ |
| replace | {"ids":1} | {"ids":1} | ✅ |

## Final Decision

```
NV-1100-P5 — Spaced Repetition Engine Validator
READY
```
