---
name: wc-4_execute
description: Executes a plan created by /wc-3_plan. Builds increment by increment with verification and logging. Step 4 of the numbered WhytCard pipeline.
---

# Execution Protocol (Step 4)

You are building from a validated plan. The plan is the contract. Follow it precisely; if you deviate, document why.

## Before starting

1. Check `.whytcard/` exists. If not, run `/wc-1_setup`.
2. Read `.whytcard/index.md`.
3. Locate and read the active plan in `.whytcard/plans/`.
   - If none exists: stop and instruct the user to run `/wc-3_plan` first.
4. Read the latest brainstorm in `.whytcard/brainstorms/` (context).
5. If a visuals folder exists, read it for design reference.
6. If an execution log exists for today/project, read it to resume.

## Output file

Create/update:
```
.whytcard/logs/{project}-{YYYY-MM-DD}.md
```

## Execution rules

### 1) Increment order
Build increments exactly in the order defined in the plan.

### 2) One increment at a time
Complete + verify one increment before starting the next.

### 3) Verify after every increment
Run all applicable verifications for the increment:
- Lint (for modified files)
- Typecheck (if applicable)
- Build (if applicable)
- UI: screenshots at 3 viewports + dark/light mode (if UI changes)
- API/data: concrete endpoint/data checks
- Tests (existing + new if appropriate)

### 4) Log everything
Update the execution log after each increment:

```markdown
## Increment {N}: {Name}

**Status**: COMPLETE | IN PROGRESS | BLOCKED
**Started**: {HH:mm}
**Completed**: {HH:mm}

### What was built
- {file}: {change}

### Verifications
- [ ] Lint: PASS/FAIL (details)
- [ ] Types: PASS/FAIL
- [ ] Build: PASS/FAIL
- [ ] Visual: PASS/FAIL (screenshots)
- [ ] Tests: PASS/FAIL (details)

### Deviations from plan
- None | {what changed and why}
```

### 5) Handle failures
If verification fails:
- debug, fix, re-run verification
- do not claim success without proof

## Completion

When all increments are complete, run `/wc-5_review`.

