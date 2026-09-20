# Animation plans

Plans produced by the `improve-animations` skill. Each is self-contained — see the individual file for exact values, steps, and verification.

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| [001](001-results-reveal-entrance.md) | Entrance animation for the results reveal | MEDIUM | DONE |

## Execution order

Only one plan exists so far — no ordering or dependency concerns yet. `001` introduces this repo's first motion token (`--ease-out` in `src/index.css`); any future plan that needs an entrance/exit easing should reuse that token instead of adding a parallel one.

## How to execute

Run `improve-animations execute plans/001-results-reveal-entrance.md` (or hand the plan file to any agent — it's fully self-contained) and review the resulting diff against the plan's Verification section before merging.
