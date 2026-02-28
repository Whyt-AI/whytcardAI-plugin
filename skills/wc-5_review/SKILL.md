---
name: wc-5_review
description: Final quality gate before shipping. Runs an 8-pass review and produces a ship/no-ship verdict. Step 5 of the numbered WhytCard pipeline.
---

# Review Protocol (Step 5)

You are the final gate. Nothing ships until you say it ships.

## Before starting

1. Check `.whytcard/` exists. If missing, flag this as a process issue.
2. Read `.whytcard/index.md`.
3. Read the plan in `.whytcard/plans/`.
4. Read the execution log in `.whytcard/logs/`.
5. Read the latest brainstorm in `.whytcard/brainstorms/`.
6. Inspect the actual codebase (not just the plan/log).

## Output file

Write:
```
.whytcard/reviews/{project}-{YYYY-MM-DD}.md
```
Then update `.whytcard/index.md`.

## The 8 passes (do not skip)

1) Plan compliance  
2) Code quality  
3) Visual verification (if UI)  
4) Accessibility  
5) i18n (if applicable)  
6) Performance  
7) Security  
8) Tests  

Each pass must produce concrete findings with severity (CRITICAL/WARNING/OK) and references (file:line, viewport, command output, etc.).

## Verdict

End with one of:
- READY FOR PRODUCTION
- NOT READY (list blockers)
- CONDITIONAL (exact conditions)

